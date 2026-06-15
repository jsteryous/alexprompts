"""
collect.py — Source and score the week's frontier-tech stories for Alex Prompts.

Sources (all free, no API key):
  - Google News RSS   — headlines + coverage volume per entity
  - Hacker News (Algolia) — builder-crowd engagement (points + comments)
  - Reddit search JSON    — community engagement (upvotes)

"Attention" here is the builder/tech crowd, not mainstream virality — that's the
deliberate editorial choice (see memory: alex-prompts-pivot). The biggest-story
pick weights *discussion* (comments/upvotes) over raw posting so we cover what
actually landed, not just what shipped.

Network functions degrade gracefully: any fetch failure logs a warning and
returns [] rather than raising, so one dead source never kills the run. The pure
functions (URL building, RSS/JSON parsing, scoring) are unit-tested in
scripts/tests/test_ai_news.py.
"""

from __future__ import annotations

import json
import logging
import time
import urllib.parse
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone

import requests

# Prefer defusedxml — stdlib ElementTree is vulnerable to billion-laughs /
# entity-expansion bombs. The feed is Google News over HTTPS (low risk), but the
# hardening is free. Falls back to stdlib so the script runs without the dep.
try:
    import defusedxml.ElementTree as ET
    from defusedxml.ElementTree import ParseError
except ImportError:  # pragma: no cover - defensive fallback
    import xml.etree.ElementTree as ET
    from xml.etree.ElementTree import ParseError

log = logging.getLogger(__name__)

USER_AGENT = "alex-prompts-newsletter/0.1 (+https://substack.com)"
HTTP_TIMEOUT = 15

# ── Attention weights ─────────────────────────────────────────────────────────
# Tunable. Comments/upvotes beat raw points because discussion = "it landed."
# News count is an entity-level proxy for how much press a launch drew.
W_HN_POINTS = 1.0
W_HN_COMMENTS = 2.0
W_REDDIT = 1.5
W_NEWS_COUNT = 8.0

# Subreddits to search for community engagement on each entity.
REDDIT_SUBS = ["singularity", "LocalLLaMA", "MachineLearning", "artificial", "OpenAI"]


@dataclass
class Entity:
    """One tracked company. `aliases` widen recall; `hn_domains` filter HN hits."""
    name: str
    aliases: list[str]
    hn_domains: list[str]


# Core AI labs + SpaceX/hard tech (the coverage set Alex picked).
# Add/remove an entity by editing this list only.
ENTITIES: list[Entity] = [
    Entity("Anthropic", ["Anthropic", "Claude"], ["anthropic.com"]),
    Entity("OpenAI", ["OpenAI", "ChatGPT", "GPT-5"], ["openai.com"]),
    Entity("Google DeepMind", ["Google DeepMind", "DeepMind", "Gemini"], ["deepmind.google", "deepmind.com"]),
    Entity("xAI", ["xAI", "Grok"], ["x.ai"]),
    Entity("Meta AI", ["Meta AI", "Llama", "FAIR"], ["ai.meta.com"]),
    Entity("SpaceX", ["SpaceX", "Starship"], ["spacex.com"]),
    Entity("Tesla AI", ["Tesla Optimus", "Tesla AI", "Optimus robot"], ["tesla.com"]),
    Entity("Neuralink", ["Neuralink"], ["neuralink.com"]),
]


@dataclass
class Story:
    """A single candidate story with whatever engagement signals we found."""
    entity: str
    title: str
    url: str
    source: str               # 'hackernews' | 'reddit' | 'google_news'
    published: str | None = None
    hn_points: int = 0
    hn_comments: int = 0
    reddit_score: int = 0


@dataclass
class EntityReport:
    entity: str
    headlines: list[dict] = field(default_factory=list)   # {title, link, source, published}
    stories: list[Story] = field(default_factory=list)    # HN + Reddit engagement stories

    @property
    def news_count(self) -> int:
        return len(self.headlines)

    @property
    def attention(self) -> float:
        return entity_attention(self.news_count, self.stories)


@dataclass
class Collection:
    entities: list[EntityReport]
    biggest: Story | None
    generated_at: str


# ── Serialization (unit-tested) ───────────────────────────────────────────────
# The cloud script routine cannot collect — its sandbox IP is blocked (HTTP 403)
# by Google News, HN, and Reddit. So GitHub Actions collects from a non-blocked IP
# and hands the scored Collection to the routine as JSON. to_json/from_json round-
# trip losslessly; the computed properties (news_count, attention) are derived on
# read, not stored. See .github/workflows/collect-signal.yml and scripts/CLAUDE.md.

def to_json(c: Collection) -> str:
    """Serialize a Collection to indented JSON (round-trips through from_json)."""
    return json.dumps(
        {
            "generated_at": c.generated_at,
            "biggest": asdict(c.biggest) if c.biggest else None,
            "entities": [
                {"entity": r.entity, "headlines": r.headlines,
                 "stories": [asdict(s) for s in r.stories]}
                for r in c.entities
            ],
        },
        indent=2, ensure_ascii=False,
    )


def from_json(text: str) -> Collection:
    """Rebuild a Collection from to_json output (the inverse of to_json)."""
    d = json.loads(text)
    entities = [
        EntityReport(
            entity=r["entity"],
            headlines=r.get("headlines", []),
            stories=[Story(**s) for s in r.get("stories", [])],
        )
        for r in d.get("entities", [])
    ]
    biggest = Story(**d["biggest"]) if d.get("biggest") else None
    return Collection(entities=entities, biggest=biggest,
                      generated_at=d.get("generated_at", ""))


# ── Pure helpers (unit-tested) ────────────────────────────────────────────────

def alias_query(aliases: list[str]) -> str:
    """`("Anthropic" OR "Claude")` — a quoted OR-group for the search query."""
    inner = " OR ".join(f'"{a}"' for a in aliases)
    return f"({inner})"


def google_news_url(query: str, when_days: int = 7) -> str:
    """Build a Google News RSS search URL bounded to the last `when_days` days."""
    q = f"{query} when:{when_days}d"
    return (
        "https://news.google.com/rss/search?q="
        + urllib.parse.quote(q)
        + "&hl=en-US&gl=US&ceid=US:en"
    )


def parse_news_rss(xml_text: str, limit: int = 10) -> list[dict]:
    """Parse Google News RSS XML into a list of {title, link, source, published}.

    Returns [] on malformed XML rather than raising.
    """
    try:
        root = ET.fromstring(xml_text)
    except ParseError as exc:
        log.warning("RSS parse error: %s", exc)
        return []

    items: list[dict] = []
    for item in root.iter("item"):
        title = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").strip()
        if not title or not link:
            continue
        source_el = item.find("source")
        source = (source_el.text or "").strip() if source_el is not None else ""
        items.append({
            "title": title,
            "link": link,
            "source": source,
            "published": (item.findtext("pubDate") or "").strip() or None,
        })
        if len(items) >= limit:
            break
    return items


def hn_hit_matches(hit: dict, domains: list[str]) -> bool:
    """True if an Algolia hit's URL belongs to one of the entity's domains.

    Algolia's `query` is a full-text match, so it surfaces off-topic hits; this
    keeps only stories that actually link to the lab's own domain.
    """
    url = (hit.get("url") or "").lower()
    if not url:
        return False
    return any(d.lower() in url for d in domains)


def parse_hn_hits(payload: dict, entity: str, domains: list[str]) -> list[Story]:
    """Turn an Algolia search_by_date response into domain-matched Stories."""
    out: list[Story] = []
    for hit in payload.get("hits", []):
        if not hn_hit_matches(hit, domains):
            continue
        out.append(Story(
            entity=entity,
            title=(hit.get("title") or "").strip(),
            url=(hit.get("url") or "").strip(),
            source="hackernews",
            hn_points=int(hit.get("points") or 0),
            hn_comments=int(hit.get("num_comments") or 0),
        ))
    return out


def parse_reddit(payload: dict, entity: str, min_score: int = 25) -> list[Story]:
    """Turn a Reddit search.json response into Stories above an upvote floor."""
    out: list[Story] = []
    for child in payload.get("data", {}).get("children", []):
        d = child.get("data", {})
        score = int(d.get("score") or 0)
        if score < min_score:
            continue
        url = d.get("url_overridden_by_dest") or d.get("url") or ""
        out.append(Story(
            entity=entity,
            title=(d.get("title") or "").strip(),
            url=url.strip(),
            source="reddit",
            reddit_score=score,
        ))
    return out


def story_attention(s: Story) -> float:
    return W_HN_POINTS * s.hn_points + W_HN_COMMENTS * s.hn_comments + W_REDDIT * s.reddit_score


def entity_attention(news_count: int, stories: list[Story]) -> float:
    return W_NEWS_COUNT * news_count + sum(story_attention(s) for s in stories)


def pick_biggest(stories: list[Story]) -> Story | None:
    """The single highest-engagement story across all entities — the deep-dive."""
    real = [s for s in stories if s.title and s.url]
    return max(real, key=story_attention) if real else None


# ── Network functions (degrade gracefully) ────────────────────────────────────

def _get(url: str, *, params: dict | None = None) -> requests.Response | None:
    try:
        resp = requests.get(
            url, params=params,
            headers={"User-Agent": USER_AGENT},
            timeout=HTTP_TIMEOUT,
        )
        if resp.status_code != 200:
            log.warning("GET %s -> %s", url, resp.status_code)
            return None
        return resp
    except requests.RequestException as exc:
        log.warning("GET %s failed: %s", url, exc)
        return None


def fetch_google_news(entity: Entity, when_days: int, limit: int) -> list[dict]:
    resp = _get(google_news_url(alias_query(entity.aliases), when_days))
    return parse_news_rss(resp.text, limit) if resp else []


def fetch_hackernews(entity: Entity, since_epoch: int) -> list[Story]:
    out: list[Story] = []
    for domain in entity.hn_domains:
        resp = _get(
            "http://hn.algolia.com/api/v1/search_by_date",
            params={
                "query": domain,
                "tags": "story",
                "numericFilters": f"created_at_i>{since_epoch}",
                "hitsPerPage": 30,
            },
        )
        if resp:
            try:
                out.extend(parse_hn_hits(resp.json(), entity.name, entity.hn_domains))
            except ValueError as exc:
                log.warning("HN JSON decode failed for %s: %s", domain, exc)
    return out


def fetch_reddit(entity: Entity) -> list[Story]:
    subs = "+".join(REDDIT_SUBS)
    resp = _get(
        f"https://www.reddit.com/r/{subs}/search.json",
        params={
            "q": " OR ".join(f'"{a}"' for a in entity.aliases),
            "restrict_sr": "true",
            "sort": "top",
            "t": "week",
            "limit": 15,
        },
    )
    if not resp:
        return []
    try:
        return parse_reddit(resp.json(), entity.name)
    except ValueError as exc:
        log.warning("Reddit JSON decode failed for %s: %s", entity.name, exc)
        return []


# ── Orchestrator ──────────────────────────────────────────────────────────────

def collect_all(when_days: int = 7, news_limit: int = 8) -> Collection:
    """Run all sources for every entity and pick the biggest story of the week."""
    since_epoch = int(time.time()) - when_days * 86400
    reports: list[EntityReport] = []
    all_stories: list[Story] = []

    for ent in ENTITIES:
        log.info("collecting %s ...", ent.name)
        headlines = fetch_google_news(ent, when_days, news_limit)
        stories = fetch_hackernews(ent, since_epoch) + fetch_reddit(ent)
        reports.append(EntityReport(entity=ent.name, headlines=headlines, stories=stories))
        all_stories.extend(stories)

    reports.sort(key=lambda r: r.attention, reverse=True)
    biggest = pick_biggest(all_stories)
    return Collection(
        entities=reports,
        biggest=biggest,
        generated_at=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
    )
