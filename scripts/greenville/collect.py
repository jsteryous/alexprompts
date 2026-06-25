"""
collect.py — Source and score Greenville, SC real-estate stories.

Sister of ai_news/collect.py, aimed at one place and one beat instead of the
frontier labs. Local real estate has no Hacker News / Reddit engagement signal
worth trusting, so the only source is Google News RSS (free, no key), queried
across several local real-estate BEATS (market, development, rentals, policy).

The scoring trick, since there is no upvote signal: corroboration. The same
story usually surfaces from more than one beat query and from more than one
publisher. A story that several independent beats AND several outlets all
surfaced is, by definition, the one that landed. So we cluster headlines by a
normalized title, and the biggest cluster (most beats + most outlets, recency as
the tiebreak) is the lead.

Network functions degrade gracefully: any fetch failure logs a warning and
returns [] rather than raising, so one dead beat never kills the run. The pure
functions (URL building, RSS parsing, normalization, clustering, scoring) are
side-effect free and easy to unit-test.

    cd scripts
    python -m greenville.collect                          # print the signal
    python -m greenville.collect --json-out signal.json   # + scored JSON (CI hand-off)
    python -m greenville.collect --from-json signal.json  # replay a snapshot, no network
    python -m greenville.collect --when-days 21 --limit 15
"""

from __future__ import annotations

import argparse
import json
import logging
import re
import sys
import urllib.parse
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone

import requests

# Prefer defusedxml (XXE / billion-laughs hardening); fall back to stdlib so the
# script still runs without the dep. Same posture as ai_news/collect.py.
try:
    import defusedxml.ElementTree as ET
    from defusedxml.ElementTree import ParseError
except ImportError:  # pragma: no cover - defensive fallback
    import xml.etree.ElementTree as ET
    from xml.etree.ElementTree import ParseError

log = logging.getLogger(__name__)

USER_AGENT = "alex-prompts-greenville/0.1 (+https://substack.com)"
HTTP_TIMEOUT = 15

# ── Scoring weights ───────────────────────────────────────────────────────────
# No engagement signal exists for local news, so we score corroboration: how many
# distinct BEATS surfaced the story, and how many distinct OUTLETS ran it. Both
# are "lots of independent people decided this matters." Beats are weighted a bit
# higher than outlets because cross-beat overlap is the rarer, stronger signal.
W_BEATS = 3.0
W_OUTLETS = 2.0
W_APPEARANCES = 1.0


@dataclass
class Beat:
    """One local real-estate lane and the Google News query that feeds it.

    Keep every query pinned to the place ("Greenville SC" / "Greenville County"
    / "Upstate South Carolina"), or national mortgage-rate noise floods in.
    """
    name: str
    query: str


# The local real-estate beats. Add/remove a lane by editing this list only.
BEATS: list[Beat] = [
    Beat("Market", '"Greenville SC" (housing OR "real estate" OR "home prices" OR "median price")'),
    Beat("Development", '"Greenville SC" (development OR construction OR "mixed-use" OR downtown OR project)'),
    Beat("Rentals", '"Greenville SC" (rent OR rental OR apartments OR "cost of living")'),
    Beat("Policy", '"Greenville County" (zoning OR "affordable housing" OR "housing plan" OR ordinance)'),
    Beat("Upstate", '"Upstate South Carolina" ("real estate" OR housing OR growth OR relocation)'),
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


# ── Serialization (round-trips losslessly, like ai_news) ──────────────────────
# The cloud routine sandbox is IP-blocked by Google News, so GitHub Actions
# collects from a clean runner IP and hands the scored Collection to the routine
# as JSON. score is a derived property, not stored.

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

def google_news_url(query: str, when_days: int = 14) -> str:
    """Build a Google News RSS search URL bounded to the last `when_days` days."""
    q = f"{query} when:{when_days}d"
    return (
        "https://news.google.com/rss/search?q="
        + urllib.parse.quote(q)
        + "&hl=en-US&gl=US&ceid=US:en"
    )


def parse_news_rss(xml_text: str, limit: int = 12) -> list[dict]:
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


# Individual MLS listings (Realtor.com / Zillow address pages) get syndicated into
# Google News and look like stories, but they are not news to write up. They are
# address-shaped: start with a street number and carry ", SC 29xxx" or ", South
# Carolina". Drop them so corroboration scoring is not gamed by a hot listing.
LISTING_RE = re.compile(r"^\s*\d+\s+\S.*,\s*(SC\s*\d{5}|South Carolina)\b", re.IGNORECASE)


def is_listing_noise(title: str) -> bool:
    """True for a syndicated single-property listing (not a news story)."""
    return bool(LISTING_RE.match(title or ""))


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
        if not is_listing_noise(d["title"])
    ]


# ── Orchestrator ──────────────────────────────────────────────────────────────

def collect_all(when_days: int = 14, per_beat: int = 12) -> Collection:
    """Run every beat, cluster across them, and pick the biggest local story."""
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


# ── Rendering + CLI ───────────────────────────────────────────────────────────

def render_payload(c: Collection, limit: int = 20) -> str:
    """Human-readable signal-latest.txt the routine's STEP 0 reads."""
    lines = [
        "GREENVILLE, SC REAL-ESTATE SIGNAL",
        f"Collected {c.generated_at}",
        "",
        "BEAT COVERAGE (headlines found per beat):",
    ]
    for name, n in c.beat_counts.items():
        lines.append(f"  {name:<12} {n}")
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


def main() -> int:
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):  # pragma: no cover
        pass

    p = argparse.ArgumentParser(description="Collect + score Greenville, SC real-estate news")
    p.add_argument("--when-days", type=int, default=14, help="lookback window in days (default 14)")
    p.add_argument("--per-beat", type=int, default=12, help="max headlines per beat (default 12)")
    p.add_argument("--limit", type=int, default=20, help="ranked stories to print (default 20)")
    p.add_argument("--json-out", metavar="PATH", help="also write the scored Collection as JSON")
    p.add_argument("--from-json", metavar="PATH", help="replay a saved snapshot, no network")
    args = p.parse_args()

    if args.from_json:
        from pathlib import Path
        collection = from_json(Path(args.from_json).read_text(encoding="utf-8"))
    else:
        collection = collect_all(when_days=args.when_days, per_beat=args.per_beat)

    if args.json_out:
        from pathlib import Path
        Path(args.json_out).write_text(to_json(collection), encoding="utf-8")
        log.info("Wrote %d clusters to %s", len(collection.clusters), args.json_out)

    print("\n" + "=" * 70)
    print(render_payload(collection, args.limit))
    print("=" * 70)
    return 0


if __name__ == "__main__":
    sys.exit(main())
