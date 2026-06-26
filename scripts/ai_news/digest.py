"""
digest.py — collect and render the week's AI-for-real-estate signal.

The weekly draft is written by the Saturday **Claude routine**
(scripts/ai_news/routine/), grounded by the signal this module collects. The old
two-pass Gemini drafting and the Resend email were removed when the brand moved
to Claude routines, so this file's only job now is to source and score the week
(via collect.py, the beat+corroboration collector) and render it for the
routine's STEP 0 hand-off.

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

from ai_news.collect import collect_all, from_json, render_payload, to_json

logging.basicConfig(level=logging.INFO, format="%(message)s")
log = logging.getLogger("ai_news.digest")


def main() -> int:
    try:
        sys.stdout.reconfigure(encoding="utf-8")  # Windows cp1252 mangles non-ASCII
    except (AttributeError, ValueError):  # pragma: no cover
        pass

    p = argparse.ArgumentParser(description="Collect and render the week's AI-for-real-estate signal")
    p.add_argument("--days", type=int, default=7, help="lookback window in days (default 7)")
    p.add_argument("--per-beat", "--news-limit", type=int, default=15, dest="per_beat",
                   help="max headlines per beat (default 15; --news-limit is a kept alias)")
    p.add_argument("--limit", type=int, default=20, help="ranked stories to print (default 20)")
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
        collection = collect_all(when_days=args.days, per_beat=args.per_beat)

    if args.json_out:
        Path(args.json_out).write_text(to_json(collection), encoding="utf-8")
        log.info("Wrote collection JSON to %s", args.json_out)

    print("\n" + "=" * 70 + "\nCOLLECTED SIGNAL\n" + "=" * 70)
    print(render_payload(collection, args.limit))
    return 0


if __name__ == "__main__":
    sys.exit(main())
