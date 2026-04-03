"""
weekly_insights.py — Picks a topic for the week and runs generate_insights.

Called by Windows Task Scheduler every Monday morning.
Run manually any time: python weekly_insights.py

Topic rotation: cycles through TOPICS in order, tracked by a local state file
(last_topic_index.txt) so each week gets a different angle.

To preview which topic would run without generating anything:
    python weekly_insights.py --dry-run
"""

import argparse
import logging
import subprocess
import sys
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(message)s")
log = logging.getLogger(__name__)

SCRIPTS_DIR = Path(__file__).resolve().parent
STATE_FILE  = SCRIPTS_DIR / "last_topic_index.txt"

# ── Topic rotation ────────────────────────────────────────────────────────────
# Edit this list freely. Add, reorder, remove topics any time.
# Each Monday picks the next one in sequence, looping back to the top.

TOPICS = [
    "Why Greenville commercial property transfers spike in Q2 — and what it means for HVAC contractors",
    "The hidden cost of waiting: how Upstate SC landscaping companies lose new-construction contracts",
    "New business filings in Greenville County this month: which industries signal service demand",
    "How pool service companies in Greenville can land contracts before a new property closes",
    "Why electrical contractors in Upstate SC should watch industrial permit filings weekly",
    "The Greenville facilities management market: who's buying buildings and what they need first",
    "Pressure washing in Upstate SC: why new commercial leases are your best lead source",
    "How to turn Greenville County deed transfers into booked jobs before anyone else calls",
    "Why reactive marketing fails local service businesses in Greenville — and what replaces it",
    "The Monday morning advantage: how weekly intelligence gives Upstate SC contractors a pricing edge",
    "New construction permits in Greenville County: a guide for HVAC and electrical contractors",
    "How Upstate SC property managers choose service vendors — and how to get on the short list",
]


def get_next_topic() -> tuple[str, int]:
    """Return (topic, index) for this week, advancing the counter."""
    try:
        idx = int(STATE_FILE.read_text().strip())
    except (FileNotFoundError, ValueError):
        idx = 0

    topic = TOPICS[idx % len(TOPICS)]
    next_idx = (idx + 1) % len(TOPICS)
    STATE_FILE.write_text(str(next_idx))
    return topic, idx


def main() -> None:
    parser = argparse.ArgumentParser(description="Weekly Market Insights runner")
    parser.add_argument("--dry-run", action="store_true",
                        help="Print the selected topic and exit without generating")
    args = parser.parse_args()

    topic, idx = get_next_topic()

    log.info(f"This week's topic (#{idx + 1}/{len(TOPICS)}): {topic!r}")

    if args.dry_run:
        log.info("DRY RUN — no article generated.")
        return

    cmd = [
        sys.executable,
        str(SCRIPTS_DIR / "generate_insights.py"),
        "--topic", topic,
    ]

    log.info("Running generate_insights.py...")
    result = subprocess.run(cmd, cwd=str(SCRIPTS_DIR))
    sys.exit(result.returncode)


if __name__ == "__main__":
    main()
