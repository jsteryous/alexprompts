"""
demand.py — What are beginners actually trying to do with AI? (prototype)

Mines Google + YouTube **autocomplete** for real beginner how-to demand. Feed a
set of beginner seed prefixes ("how to use ai to", "how to use claude to", ...);
the suggest endpoints complete them with what people actually search. A query
that shows up from several seeds, or on both engines, or high in the list, scores
higher (earlier suggestions are more popular). The output is a ranked feed of
"how do I ... with AI" queries to turn into guides.

This is the demand radar for the GUIDES track (see scripts/CLAUDE.md). It is the
mirror image of collect.py: collect.py scores what the LABS shipped; demand.py
scores what NORMAL PEOPLE want to do.

    cd scripts
    python -m ai_news.demand                 # quick run: seeds only
    python -m ai_news.demand --depth 1       # + a-z expansion (slower, richer)
    python -m ai_news.demand --limit 40
    python -m ai_news.demand --json-out demand-latest.json

CAVEAT: the autocomplete endpoints are UNOFFICIAL and block datacenter IPs (the
same reason collect.py runs via GitHub Actions). Run this from a normal IP, or
wire it into a workflow like collect-signal.yml. Network fns degrade gracefully:
a failed fetch logs and returns [], never raises.
"""

from __future__ import annotations

import argparse
import json
import logging
import string
import sys
import time
from dataclasses import asdict, dataclass, field

import requests

log = logging.getLogger(__name__)

# A real browser UA: the suggest endpoint is pickier than RSS.
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
)
HTTP_TIMEOUT = 10
POLITE_DELAY = 0.25  # seconds between requests, to be a good citizen

SUGGEST_URL = "https://suggestqueries.google.com/complete/search"

# Beginner how-to intent. Each is a PREFIX the engine completes from the end, so
# "how to use ai to" -> "...make money", "...build a website", etc. Edit freely.
# Keep every seed AI-anchored ("ai"/"chatgpt"/"claude"), or non-AI completions
# leak in. NOTE: "how to make ai" was dropped — "ai" is a prefix of "airpods", so
# it surfaced junk like "how to make airpods louder".
DEFAULT_SEEDS = [
    "how to use ai to",
    "how to use ai for",
    "how to use ai to make a",
    "how to use ai to create",
    "how to use chatgpt to",
    "how to use claude to",
    "how do i use ai to",
    "best ai to",
    "best ai for",
    "is there an ai that can",
    "can ai help me",
]

# Off-brand / low-trust stems. The radar surfaces what is WANTED; this keeps the
# get-rich and detector/bypass clusters out so the feed stays guide-worthy. Demand
# is not the same as worth-making (see scripts/CLAUDE.md, the guides track).
BANNED_STEMS = [
    "make money", "making money", "get rich", "passive income",
    "stock", "stocks", "trading", "trade stock", "day trade", "invest",
    "crypto", "bitcoin", "forex", "gambling", "betting", "lottery",
    "detector", "detect chatgpt", "detect ai", "bypass", "jailbreak",
    "undetectable", "nsfw", "deepfake", "hack", "cheat", "airpods",
]

# Earlier autocomplete positions are more popular; weight them more.
RANK_WEIGHT_BASE = 10


@dataclass
class DemandQuery:
    """One surfaced search query and the evidence that people want it."""
    query: str
    score: float = 0.0
    hits: int = 0                                   # times surfaced across seeds/engines
    sources: list[str] = field(default_factory=list)   # "google" | "youtube"
    seeds: list[str] = field(default_factory=list)      # which seed prefixes surfaced it
    best_rank: int = 99                              # best (lowest) autocomplete position seen


# ── Pure helpers (easy to unit-test) ──────────────────────────────────────────

def parse_suggest(text: str) -> list[str]:
    """Pull the suggestion list out of a client=firefox autocomplete response.

    The body is JSON shaped like ["the query", ["suggestion 1", "suggestion 2"]].
    Returns [] on anything unexpected rather than raising.
    """
    try:
        data = json.loads(text)
    except (ValueError, TypeError):
        return []
    if not isinstance(data, list) or len(data) < 2 or not isinstance(data[1], list):
        return []
    return [s for s in data[1] if isinstance(s, str) and s.strip()]


def expand_seeds(seeds: list[str], depth: int) -> list[str]:
    """depth 0 = the seeds; depth 1 = seeds plus each seed + ' a'..' z'."""
    out = list(seeds)
    if depth >= 1:
        out += [f"{s} {c}" for s in seeds for c in string.ascii_lowercase]
    return out


def is_useful(query: str, seed: str) -> bool:
    """Drop seed echoes, trivially short completions, and off-brand stems."""
    q = query.strip().lower()
    if not q or q == seed.strip().lower() or len(q.split()) < 3:
        return False
    return not any(stem in q for stem in BANNED_STEMS)


def add_suggestions(
    table: dict[str, DemandQuery], suggestions: list[str], *, engine: str, seed: str
) -> None:
    """Fold one response's suggestions into the running demand table (scored)."""
    for rank, raw in enumerate(suggestions):
        q = raw.strip()
        if not is_useful(q, seed):
            continue
        key = q.lower()
        dq = table.get(key)
        if dq is None:
            dq = DemandQuery(query=q)
            table[key] = dq
        dq.hits += 1
        dq.score += max(RANK_WEIGHT_BASE - rank, 1)
        dq.best_rank = min(dq.best_rank, rank)
        if engine not in dq.sources:
            dq.sources.append(engine)
        if seed not in dq.seeds:
            dq.seeds.append(seed)


def rank_queries(table: dict[str, DemandQuery]) -> list[DemandQuery]:
    """Highest demand first. Multi-engine ties break toward more total hits."""
    return sorted(
        table.values(),
        key=lambda d: (d.score, len(d.sources), d.hits),
        reverse=True,
    )


# ── Network (degrades gracefully) ─────────────────────────────────────────────

def fetch_suggestions(query: str, *, engine: str = "google") -> list[str]:
    """Hit the autocomplete endpoint for one prefix; [] on any failure."""
    params = {"client": "firefox", "q": query}
    if engine == "youtube":
        params["ds"] = "yt"
    try:
        resp = requests.get(
            SUGGEST_URL, params=params,
            headers={"User-Agent": USER_AGENT},
            timeout=HTTP_TIMEOUT,
        )
        if resp.status_code != 200:
            log.warning("suggest %s [%s] -> %s", query, engine, resp.status_code)
            return []
        # Google sometimes serves latin-1 for these; trust the declared charset
        # but fall back to a lenient decode.
        text = resp.text
        if not text.lstrip().startswith("["):
            text = resp.content.decode("utf-8", "replace")
        return parse_suggest(text)
    except requests.RequestException as exc:
        log.warning("suggest %s [%s] failed: %s", query, engine, exc)
        return []


def collect_demand(
    seeds: list[str] | None = None, *, depth: int = 0, engines: tuple[str, ...] = ("google", "youtube")
) -> list[DemandQuery]:
    """Expand seeds across engines and return the ranked demand feed."""
    queries = expand_seeds(seeds or DEFAULT_SEEDS, depth)
    table: dict[str, DemandQuery] = {}
    total = len(queries) * len(engines)
    log.info("Querying %d autocomplete calls (%d prefixes x %d engines) ...", total, len(queries), len(engines))
    for seed in queries:
        for engine in engines:
            add_suggestions(table, fetch_suggestions(seed, engine=engine), engine=engine, seed=seed)
            time.sleep(POLITE_DELAY)
    return rank_queries(table)


# ── Rendering + CLI ───────────────────────────────────────────────────────────

def render(ranked: list[DemandQuery], limit: int) -> str:
    lines = [f"TOP {min(limit, len(ranked))} BEGINNER AI DEMAND QUERIES ({len(ranked)} unique found)\n"]
    for i, d in enumerate(ranked[:limit], 1):
        src = "+".join(d.sources)
        lines.append(
            f"{i:>3}. [{d.score:>4.0f}] {d.query}\n"
            f"      hits={d.hits} sources={src} best_rank={d.best_rank}"
        )
    return "\n".join(lines)


def main() -> int:
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):  # pragma: no cover
        pass

    p = argparse.ArgumentParser(description="Mine Google + YouTube autocomplete for beginner AI how-to demand")
    p.add_argument("--depth", type=int, default=0, help="0 = seeds only (fast); 1 = + a-z expansion (slower, richer)")
    p.add_argument("--limit", type=int, default=30, help="how many ranked queries to print (default 30)")
    p.add_argument("--google-only", action="store_true", help="skip YouTube autocomplete")
    p.add_argument("--youtube-only", action="store_true", help="skip Google autocomplete")
    p.add_argument("--json-out", metavar="PATH", help="also write the full ranked feed as JSON")
    args = p.parse_args()

    engines: tuple[str, ...] = ("google", "youtube")
    if args.google_only:
        engines = ("google",)
    elif args.youtube_only:
        engines = ("youtube",)

    ranked = collect_demand(depth=args.depth, engines=engines)

    if args.json_out:
        from pathlib import Path
        Path(args.json_out).write_text(
            json.dumps([asdict(d) for d in ranked], indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
        log.info("Wrote %d queries to %s", len(ranked), args.json_out)

    print("\n" + "=" * 70)
    print(render(ranked, args.limit))
    print("=" * 70)
    return 0


if __name__ == "__main__":
    sys.exit(main())
