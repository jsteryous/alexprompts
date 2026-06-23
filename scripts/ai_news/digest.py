"""
digest.py — collect and render the week's Alex Prompts signal.

The weekly draft is now written by the Saturday **Claude routine**
(scripts/ai_news/routine/), grounded by the signal this module collects. The old
two-pass Gemini drafting and the Resend email were removed when the brand moved
to Claude routines, so this file's only job now is to source and score the week
(via collect.py) and render it for the routine's STEP 0 hand-off.

    cd scripts
    python -m ai_news.digest --collect-only                         # print the signal
    python -m ai_news.digest --collect-only --json-out signal.json  # + scored JSON (CI hand-off)
    python -m ai_news.digest --from-json signal.json                # replay a saved snapshot, no network
"""

from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path

from ai_news.collect import Collection, collect_all, from_json, story_attention, to_json

logging.basicConfig(level=logging.INFO, format="%(message)s")
log = logging.getLogger("ai_news.digest")


# ── Payload rendering ─────────────────────────────────────────────────────────

def render_payload(c: Collection) -> str:
    lines: list[str] = [f"Collected {c.generated_at}.\n"]
    if c.biggest:
        b = c.biggest
        lines.append(
            f"FLAGGED HIGHEST-ENGAGEMENT STORY (score {story_attention(b):.0f}):\n"
            f'  "{b.title}" [{b.entity}]\n  {b.url}\n'
            f"  hn_points={b.hn_points} hn_comments={b.hn_comments} reddit={b.reddit_score}\n"
        )
    for r in c.entities:
        lines.append(f"\n### {r.entity}  (attention {r.attention:.0f}, {r.news_count} news items)")
        for h in r.headlines[:6]:
            src = f" — {h['source']}" if h.get("source") else ""
            lines.append(f"  - {h['title']}{src}\n    {h['link']}")
        for s in sorted(r.stories, key=story_attention, reverse=True)[:4]:
            sig = f"hn {s.hn_points}/{s.hn_comments}" if s.source == "hackernews" else f"reddit {s.reddit_score}"
            lines.append(f"  - [{s.source} {sig}] {s.title}\n    {s.url}")
    return "\n".join(lines)


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> int:
    try:
        sys.stdout.reconfigure(encoding="utf-8")  # Windows cp1252 mangles em-dashes
    except (AttributeError, ValueError):  # pragma: no cover
        pass

    p = argparse.ArgumentParser(description="Collect and render the week's Alex Prompts signal")
    p.add_argument("--days", type=int, default=7, help="lookback window (default 7)")
    p.add_argument("--news-limit", type=int, default=8, help="headlines per entity (default 8)")
    p.add_argument("--show-payload", action="store_true", help="print the collected signal (default behavior)")
    p.add_argument("--collect-only", action="store_true",
                   help="no-op alias kept for the CI + routine hand-off (collection is all this does now)")
    p.add_argument("--json-out", metavar="PATH",
                   help="also write the scored collection as JSON (for the CI -> cloud-routine hand-off)")
    p.add_argument("--from-json", metavar="PATH",
                   help="load the collection from a JSON file instead of fetching live (skips all network sources)")
    args = p.parse_args()

    if args.from_json:
        collection = from_json(Path(args.from_json).read_text(encoding="utf-8"))
        log.info("Loaded collection from %s (collected %s)", args.from_json, collection.generated_at)
    else:
        collection = collect_all(when_days=args.days, news_limit=args.news_limit)

    if args.json_out:
        Path(args.json_out).write_text(to_json(collection), encoding="utf-8")
        log.info("Wrote collection JSON to %s", args.json_out)

    print("\n" + "=" * 70 + "\nCOLLECTED SIGNAL\n" + "=" * 70)
    print(render_payload(collection))
    return 0


if __name__ == "__main__":
    sys.exit(main())
