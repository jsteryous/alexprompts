"""
cleanup_practitioners.py — one-shot backfill.

Deletes rows from `website_prospects` whose `business_name` matches the
practitioner classifier in `discover.py`. Those rows are individual-dentist /
individual-attorney GBPs that slipped in before the discovery-time filter
landed, and they're misclassified as "no_website / 100 HOT" when the practice
they belong to actually has a site.

Usage:
    python -m prospects.cleanup_practitioners --dry-run
    python -m prospects.cleanup_practitioners
"""

from __future__ import annotations

import argparse
import logging
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client

from .discover import is_practitioner_name

load_dotenv(Path(__file__).parent.parent.parent / ".env.local")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)s  %(message)s",
    datefmt="%H:%M:%S",
)
_log = logging.getLogger(__name__)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true",
                    help="Print matching rows without deleting")
    args = ap.parse_args()

    url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")
    if not url or not key:
        _log.error("SUPABASE_URL / SUPABASE_SERVICE_KEY missing")
        return 1

    sb = create_client(url, key)

    resp = (
        sb.table("website_prospects")
        .select("id, business_name, vertical, city, audit_status, severity_tag, website_url")
        .execute()
    )
    rows = resp.data or []
    _log.info("scanned %d prospects", len(rows))

    matches = [r for r in rows if is_practitioner_name(r.get("business_name") or "")]
    _log.info("matched %d practitioner rows", len(matches))

    for r in matches:
        _log.info(
            "  %s · %s · %s · %s · site=%s",
            r["vertical"],
            r["business_name"],
            r.get("city") or "—",
            r.get("severity_tag") or "—",
            r.get("website_url") or "NO WEBSITE",
        )

    if args.dry_run:
        _log.info("[dry-run] would delete %d rows", len(matches))
        return 0

    if not matches:
        return 0

    deleted = 0
    for r in matches:
        try:
            sb.table("website_prospects").delete().eq("id", r["id"]).execute()
            deleted += 1
        except Exception as e:
            _log.warning("delete failed for %s: %s", r["business_name"], e)

    _log.info("deleted %d rows", deleted)
    return 0


if __name__ == "__main__":
    sys.exit(main())
