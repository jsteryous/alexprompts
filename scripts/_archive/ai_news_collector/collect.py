"""
collect.py — Source and score the week's AI-for-real-estate stories.

The Saturday "Alex Prompts" engine, reoriented (June 2026) from a frontier-lab
news feed to a national brief for **real-estate agents and investors**: the AI
tools, tactics, and platform moves that change how they work. Its sister
`greenville/collect.py` does the same for one local market; this one is national
and topic-based.

Sourcing model (mirrors the Greenville sibling, NOT the old entity/HN one):
Google News RSS across several AI-x-real-estate BEATS, scored by **corroboration**
— how many independent beats and outlets surfaced the same story. Trade press
(HousingWire, Inman, The Real Deal) has no Hacker News / Reddit upvote signal, so
corroboration is the only honest "this landed" measure. We cluster headlines by a
normalized title; the biggest cluster (most beats + most outlets, recency as the
tiebreak) is the lead.

Two noise filters the signal probe showed we need (see scripts/CLAUDE.md):
  - FINANCE_NOISE_RE drops AI-company IPO / stock-market items that ride in on the
    word "valuation" (the labs' own equity news is not real-estate news).
  - SEO_FARM_SOURCES drops content-marketing listicle domains that game the
    explainer beat ("16 Game-Changing Applications of AI in Real Estate").

Network functions degrade gracefully: any fetch failure logs a warning and
returns [] rather than raising, so one dead beat never kills the run. The pure
functions (URL building, RSS parsing, normalization, clustering, scoring, the
noise filters) are side-effect free and unit-tested in tests/test_ai_news.py.

    cd scripts
    python -m ai_news.digest --collect-only                          # print the signal
    python -m ai_news.digest --collect-only --json-out signal.json   # + scored JSON (CI hand-off)
    python -m ai_news.digest --from-json signal.json                 # replay a snapshot, no network
"""

from __future__ import annotations

import json
import logging
import re
import urllib.parse
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone

import requests

# Prefer defusedxml (XXE / billion-laughs hardening); fall back to stdlib so the
# script still runs without the dep. Same posture as greenville/collect.py.
try:
    import defusedxml.ElementTree as ET
    from defusedxml.ElementTree import ParseError
except ImportError:  # pragma: no cover - defensive fallback
    import xml.etree.ElementTree as ET
    from xml.etree.ElementTree import ParseError

log = logging.getLogger(__name__)

USER_AGENT = "alex-prompts-ai-re/0.1 (+https://substack.com)"
HTTP_TIMEOUT = 15

# ── Scoring weights ───────────────────────────────────────────────────────────
# No engagement signal exists for trade-press news, so we score corroboration:
# how many distinct BEATS surfaced the story, and how many distinct OUTLETS ran
# it. Beats are weighted a bit higher than outlets because cross-beat overlap is
# the rarer, stronger signal. Same shape as the Greenville sibling.
W_BEATS = 3.0
W_OUTLETS = 2.0
W_APPEARANCES = 1.0


@dataclass
class Beat:
    """One AI-x-real-estate lane and the Google News query that feeds it.

    Keep every query in the INTERSECTION: an AI term AND a real-estate term, so
    neither generic AI news nor generic real-estate news floods the lane.
    """
    name: str
    query: str


# The national AI-for-real-estate beats. Audience is agents + investors, and the
# focus is "tools that change your job" (the AI-moves-housing-markets macro thread
# was deliberately left out). Add/remove a lane by editing this list only.
BEATS: list[Beat] = [
    # Note: spell out "automated valuation model", never the bare acronym "AVM" —
    # in Google News full-text it collides with arteriovenous malformation and
    # pulls medical articles into the beat.
    Beat("Valuation",
         '("home valuation" OR "property valuation" OR "home value" OR appraisal OR "automated valuation model") '
         '(AI OR "artificial intelligence" OR algorithm OR "machine learning")'),
    Beat("Agent tools",
         '(realtor OR "real estate agent" OR brokerage) '
         '(AI OR "artificial intelligence" OR ChatGPT OR automation OR "generative AI") '
         '(leads OR listing OR marketing OR CRM OR productivity OR workflow)'),
    Beat("Portals",
         '(Zillow OR Redfin OR Opendoor OR CoStar OR "Homes.com" OR "Realtor.com") '
         '(AI OR "artificial intelligence" OR algorithm OR automation OR "home search")'),
    Beat("Mortgage",
         '(mortgage OR "home loan" OR underwriting OR "loan origination") '
         '(AI OR "artificial intelligence" OR automation OR algorithm)'),
    Beat("Investor/proptech",
         '(proptech OR "real estate investor" OR "real estate investing" OR landlord) '
         '(AI OR "artificial intelligence" OR analytics OR automation OR software)'),
    Beat("Assistant how-to",
         '("real estate" OR realtor OR property OR homebuyer) '
         '(Claude OR ChatGPT OR "AI assistant" OR "generative AI") '
         '(workflow OR tools OR "how to" OR template OR prompt)'),
]


@dataclass
class Headline:
    """One Google News item, tagged with the beat that surfaced it."""
    title: str
    link: str
    source: str               # publisher name from the RSS <source> element
    published: str | None
    beat: str


@dataclass
class StoryCluster:
    """A deduped story: the same headline surfaced by 1+ beats and 1+ outlets."""
    title: str
    link: str
    source: str
    published: str | None
    beats: list[str] = field(default_factory=list)     # distinct beats that surfaced it
    outlets: list[str] = field(default_factory=list)   # distinct publishers that ran it
    appearances: int = 0                               # total raw hits across beats

    @property
    def score(self) -> float:
        return cluster_score(self)


@dataclass
class Collection:
    clusters: list[StoryCluster]      # ranked, highest score first
    biggest: StoryCluster | None      # the lead story for the routine
    beat_counts: dict[str, int]       # beat name -> raw headline count (coverage volume)
    generated_at: str


# ── Serialization (round-trips losslessly) ────────────────────────────────────
# The cloud routine sandbox is IP-blocked by Google News, so GitHub Actions
# collects from a clean runner IP and hands the scored Collection to the routine
# as JSON. score is a derived property, not stored. See collect-signal.yml.

def to_json(c: Collection) -> str:
    """Serialize a Collection to indented JSON (inverse of from_json)."""
    return json.dumps(
        {
            "generated_at": c.generated_at,
            "beat_counts": c.beat_counts,
            "biggest": _cluster_dict(c.biggest) if c.biggest else None,
            "clusters": [_cluster_dict(s) for s in c.clusters],
        },
        indent=2, ensure_ascii=False,
    )


def _cluster_dict(s: StoryCluster) -> dict:
    d = asdict(s)
    d.pop("score", None)  # asdict won't include the property, but be explicit
    return d


def from_json(text: str) -> Collection:
    """Rebuild a Collection from to_json output."""
    d = json.loads(text)
    clusters = [StoryCluster(**s) for s in d.get("clusters", [])]
    biggest = StoryCluster(**d["biggest"]) if d.get("biggest") else None
    return Collection(
        clusters=clusters,
        biggest=biggest,
        beat_counts=d.get("beat_counts", {}),
        generated_at=d.get("generated_at", ""),
    )


# ── Pure helpers (side-effect free, unit-test friendly) ───────────────────────

def google_news_url(query: str, when_days: int = 7) -> str:
    """Build a Google News RSS search URL bounded to the last `when_days` days."""
    q = f"{query} when:{when_days}d"
    return (
        "https://news.google.com/rss/search?q="
        + urllib.parse.quote(q)
        + "&hl=en-US&gl=US&ceid=US:en"
    )


def parse_news_rss(xml_text: str, limit: int = 15) -> list[dict]:
    """Parse Google News RSS XML into [{title, link, source, published}].

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


# AI-company equity news ("Anthropic files for IPO at a $965B valuation") rides
# into the Valuation beat on the word "valuation" but is not real-estate news.
# Drop titles that are clearly about the labs' own stock/market, not housing.
FINANCE_NOISE_RE = re.compile(
    r"\b(IPO|initial public offering|going public|files? to go public|"
    r"Nasdaq|NYSE|stock|shares|earnings|market cap|Seeking Alpha|Morningstar)\b",
    re.IGNORECASE,
)

# Content-marketing / SEO listicle domains that surface as outlets and game the
# explainer beat ("16 Game-Changing Applications of AI in Real Estate"). These
# arrive in the RSS <source> as a bare domain. Tunable, like Greenville's
# LISTING_RE; widen it when a new farm starts ranking.
SEO_FARM_SOURCES: set[str] = {
    "appinventiv.com",
    "simplilearn.com",
    "valuecoders.com",
    "matellio.com",
    "biz4group.com",
}


def is_finance_noise(title: str) -> bool:
    """True for an AI-company stock/IPO item that is not real-estate news."""
    return bool(FINANCE_NOISE_RE.search(title or ""))


def is_seo_farm(source: str) -> bool:
    """True for a known SEO/content-marketing listicle publisher."""
    s = (source or "").strip().lower()
    return any(farm in s for farm in SEO_FARM_SOURCES)


def is_noise(title: str, source: str) -> bool:
    """Combined drop test applied to every raw headline before clustering."""
    return is_finance_noise(title) or is_seo_farm(source)


def normalize_title(title: str) -> str:
    """Key for clustering. Google News titles arrive as "Headline - Publisher";
    strip the trailing " - Source", lowercase, drop punctuation, collapse spaces.
    Two items with the same normalized title are treated as the same story."""
    t = title.rsplit(" - ", 1)[0] if " - " in title else title
    t = t.lower()
    t = re.sub(r"[^a-z0-9 ]+", " ", t)
    t = re.sub(r"\s+", " ", t).strip()
    return t


def cluster_headlines(headlines: list[Headline]) -> list[StoryCluster]:
    """Group headlines by normalized title into deduped StoryClusters.

    The first-seen headline's title/link/source/published represent the cluster;
    beats and outlets accumulate the distinct surfacers, appearances counts hits.
    """
    table: dict[str, StoryCluster] = {}
    for h in headlines:
        key = normalize_title(h.title)
        if not key:
            continue
        c = table.get(key)
        if c is None:
            c = StoryCluster(
                title=h.title, link=h.link, source=h.source, published=h.published,
            )
            table[key] = c
        c.appearances += 1
        if h.beat and h.beat not in c.beats:
            c.beats.append(h.beat)
        if h.source and h.source not in c.outlets:
            c.outlets.append(h.source)
    return list(table.values())


def cluster_score(c: StoryCluster) -> float:
    return (
        W_BEATS * len(c.beats)
        + W_OUTLETS * len(c.outlets)
        + W_APPEARANCES * c.appearances
    )


def rank_clusters(clusters: list[StoryCluster]) -> list[StoryCluster]:
    """Highest corroboration first; appearances break ties."""
    return sorted(clusters, key=lambda c: (c.score, c.appearances), reverse=True)


def pick_biggest(clusters: list[StoryCluster]) -> StoryCluster | None:
    """The most-corroborated story across all beats — the one to write up."""
    real = [c for c in clusters if c.title and c.link]
    return max(real, key=cluster_score) if real else None


# ── Network (degrades gracefully) ─────────────────────────────────────────────

def _get(url: str) -> requests.Response | None:
    try:
        resp = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=HTTP_TIMEOUT)
        if resp.status_code != 200:
            log.warning("GET %s -> %s", url, resp.status_code)
            return None
        return resp
    except requests.RequestException as exc:
        log.warning("GET %s failed: %s", url, exc)
        return None


def fetch_beat(beat: Beat, when_days: int, limit: int) -> list[Headline]:
    resp = _get(google_news_url(beat.query, when_days))
    if not resp:
        return []
    return [
        Headline(title=d["title"], link=d["link"], source=d["source"],
                 published=d["published"], beat=beat.name)
        for d in parse_news_rss(resp.text, limit)
        if not is_noise(d["title"], d["source"])
    ]


# ── Orchestrator ──────────────────────────────────────────────────────────────

def collect_all(when_days: int = 7, per_beat: int = 15) -> Collection:
    """Run every beat, cluster across them, and pick the biggest story."""
    all_headlines: list[Headline] = []
    beat_counts: dict[str, int] = {}
    for beat in BEATS:
        log.info("collecting %s ...", beat.name)
        hs = fetch_beat(beat, when_days, per_beat)
        beat_counts[beat.name] = len(hs)
        all_headlines.extend(hs)

    clusters = rank_clusters(cluster_headlines(all_headlines))
    return Collection(
        clusters=clusters,
        biggest=pick_biggest(clusters),
        beat_counts=beat_counts,
        generated_at=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
    )


# ── Rendering ─────────────────────────────────────────────────────────────────

def render_payload(c: Collection, limit: int = 20) -> str:
    """Human-readable signal-latest.txt the routine's STEP 0 reads."""
    lines = [
        "AI-FOR-REAL-ESTATE SIGNAL (national; audience: agents + investors)",
        f"Collected {c.generated_at}",
        "",
        "BEAT COVERAGE (headlines found per beat):",
    ]
    for name, n in c.beat_counts.items():
        lines.append(f"  {name:<20} {n}")
    lines.append("")

    if c.biggest:
        b = c.biggest
        lines += [
            "BIGGEST STORY (most corroborated, the lead to write up):",
            f"  {b.title}",
            f"  {b.link}",
            f"  beats={', '.join(b.beats)} | outlets={', '.join(b.outlets) or 'n/a'}"
            f" | appearances={b.appearances} | score={b.score:.0f}",
            "",
        ]
    else:
        lines += ["BIGGEST STORY: none found (collector returned nothing).", ""]

    lines.append(f"RANKED STORIES (top {min(limit, len(c.clusters))} of {len(c.clusters)}):")
    for i, s in enumerate(c.clusters[:limit], 1):
        when = f" ({s.published})" if s.published else ""
        lines.append(
            f"{i:>3}. [{s.score:>4.0f}] {s.title}{when}\n"
            f"      {s.link}\n"
            f"      beats={', '.join(s.beats)} | outlets={', '.join(s.outlets) or 'n/a'}"
        )
    return "\n".join(lines)
