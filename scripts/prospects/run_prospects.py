"""
run_prospects.py — CLI orchestrator for the broken-website prospect pipeline.

    # 1. Discover prospects into Supabase (Google Places)
    python -m prospects.run_prospects --discover --vertical dental --county greenville
    python -m prospects.run_prospects --discover --all

    # 2. Audit pending prospects (Playwright + detectors + screenshots)
    python -m prospects.run_prospects --audit-pending [--limit 10] [--vertical dental]

    # 3. Single URL smoke test (no DB write)
    python -m prospects.run_prospects --audit-url https://example-dentist.com

    # 4. Re-audit anything stale
    python -m prospects.run_prospects --re-audit --days 30

Tip for first run: `--discover --vertical dental --county greenville --dry-run`
to see what the Places query returns before spending quota.
"""

from __future__ import annotations

import argparse
import logging
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client

from . import discover
from . import digest as digest_mod
from .audit import audit_prospect, save_audit

load_dotenv(Path(__file__).parent.parent.parent / ".env.local")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)s  %(message)s",
    datefmt="%H:%M:%S",
)
_log = logging.getLogger(__name__)


def _sb():
    url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")
    if not url or not key:
        _log.error("SUPABASE_URL / SUPABASE_SERVICE_KEY missing")
        sys.exit(1)
    return create_client(url, key)


def cmd_discover(args) -> int:
    api_key = os.getenv("GOOGLE_PLACES_API_KEY")
    if not api_key:
        _log.error("GOOGLE_PLACES_API_KEY missing")
        return 1

    if args.all:
        targets = [(v, c) for v in discover.VERTICALS for c in discover.COUNTIES]
    else:
        if not args.vertical:
            _log.error("--vertical required unless --all is used")
            return 1
        counties = list(discover.COUNTIES) if args.county == "all" else [args.county]
        targets = [(args.vertical, c) for c in counties]

    total = 0
    for vertical, county in targets:
        _log.info("─── %s × %s ───", vertical, county)
        rows = discover.search_vertical_county(vertical, county, api_key, args.limit)
        _log.info("found %d candidates", len(rows))
        total += discover.upsert_prospects(rows, dry_run=args.dry_run)
    _log.info("discover done — %d rows", total)
    return 0


def cmd_audit_pending(args) -> int:
    sb = _sb()
    q = (
        sb.table("website_prospects")
        .select("id, business_name, website_url, vertical")
        .eq("audit_status", "pending")
        .order("created_at", desc=False)
        .limit(args.limit)
    )
    if args.vertical:
        q = q.eq("vertical", args.vertical)
    rows = q.execute().data or []

    if not rows:
        _log.info("no pending prospects")
        return 0

    pagespeed_key = os.getenv("GOOGLE_PAGESPEED_API_KEY") or os.getenv("GOOGLE_PLACES_API_KEY")

    for r in rows:
        _log.info("► %s — %s", r["business_name"], r["website_url"])
        try:
            result = audit_prospect(r["id"], r["website_url"], pagespeed_key=pagespeed_key)
            save_audit(result)
            _log.info(
                "  ↳ severity=%d %s  issues=%s",
                result.severity_score,
                result.severity_tag,
                result.findings.to_jsonb() if result.findings else {},
            )
        except Exception as e:
            _log.exception("audit failed for %s: %s", r["business_name"], e)
    return 0


def cmd_audit_url(args) -> int:
    """Single-URL smoke test. Does NOT write to DB — prints findings only."""
    pagespeed_key = os.getenv("GOOGLE_PAGESPEED_API_KEY") or os.getenv("GOOGLE_PLACES_API_KEY")
    result = audit_prospect(
        prospect_id="smoke-test",
        website_url=args.audit_url,
        pagespeed_key=pagespeed_key,
    )
    print("\n── AUDIT RESULT ─────────────────────────────")
    print(f"URL:            {args.audit_url}")
    print(f"Final URL:      {result.final_url}")
    print(f"Severity:       {result.severity_score} ({result.severity_tag})")
    print(f"Error:          {result.error or '—'}")
    if result.findings:
        print(f"Findings:       {result.findings.to_jsonb()}")
    print(f"Mobile shot:    {result.mobile_screenshot_url or '—'}")
    print(f"Desktop shot:   {result.desktop_screenshot_url or '—'}")
    return 0


def cmd_re_audit(args) -> int:
    sb = _sb()
    cutoff = (datetime.now(timezone.utc) - timedelta(days=args.days)).isoformat()
    rows = (
        sb.table("website_prospects")
        .select("id, business_name, website_url")
        .in_("audit_status", ["audited", "error"])
        .lt("audited_at", cutoff)
        .limit(args.limit)
        .execute()
        .data
        or []
    )
    if not rows:
        _log.info("nothing to re-audit")
        return 0

    pagespeed_key = os.getenv("GOOGLE_PAGESPEED_API_KEY") or os.getenv("GOOGLE_PLACES_API_KEY")
    for r in rows:
        _log.info("↻ re-audit %s", r["business_name"])
        try:
            result = audit_prospect(r["id"], r["website_url"], pagespeed_key=pagespeed_key)
            save_audit(result)
        except Exception as e:
            _log.exception("re-audit failed: %s", e)
    return 0


def cmd_digest(args) -> int:
    return digest_mod.run(min_severity=args.min_severity, dry_run=args.dry_run)


def main() -> int:
    ap = argparse.ArgumentParser()

    # Mode flags (mutually exclusive in practice; argparse doesn't enforce here)
    ap.add_argument("--discover", action="store_true")
    ap.add_argument("--audit-pending", action="store_true")
    ap.add_argument("--audit-url", help="Audit a single URL (no DB write)")
    ap.add_argument("--re-audit", action="store_true")
    ap.add_argument("--digest", action="store_true",
                    help="Send email digest of new HOT/WARM prospects (emailed_at is null)")

    # Discover args
    ap.add_argument("--vertical", choices=list(discover.VERTICALS.keys()))
    ap.add_argument("--county", default="all")
    ap.add_argument("--all", action="store_true")

    # Shared
    ap.add_argument("--limit", type=int, default=20)
    ap.add_argument("--days", type=int, default=30, help="--re-audit: days since last audit")
    ap.add_argument("--min-severity", type=int, default=40,
                    help="--digest: minimum severity to include (default 40)")
    ap.add_argument("--dry-run", action="store_true")

    args = ap.parse_args()

    if args.discover:
        return cmd_discover(args)
    if args.audit_pending:
        return cmd_audit_pending(args)
    if args.audit_url:
        return cmd_audit_url(args)
    if args.re_audit:
        return cmd_re_audit(args)
    if args.digest:
        return cmd_digest(args)

    ap.print_help()
    return 1


if __name__ == "__main__":
    sys.exit(main())
