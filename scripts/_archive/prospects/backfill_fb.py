"""
backfill_fb.py — Mine Facebook Page URLs for already-audited prospects.

Goes back through audited rows in `website_prospects` and fills in
`facebook_url` (the column added in 2026-04 alongside the FB-first outreach
push). Uses plain `requests` instead of Playwright — most dental sites
inline their FB link in static footer HTML, including Wix/Squarespace SSR.
JS-rendered-only sites are skipped here; their next full re-audit
(via run_prospects.py --re-audit) will populate FB through the live
Playwright path.

Cheap by design: one HTTP GET per candidate page, ≤3 candidates per
prospect (home + /contact + /about), 6s timeout, no headless browser, no
screenshot upload.

    python -m prospects.backfill_fb                     # default: 50 missing rows
    python -m prospects.backfill_fb --limit 500
    python -m prospects.backfill_fb --refresh           # re-mine even if populated
    python -m prospects.backfill_fb --dry-run           # log only, no DB write
"""

from __future__ import annotations

import argparse
import logging
import os
import sys
from pathlib import Path

import requests
from dotenv import load_dotenv
from supabase import create_client

from . import contact_extract

load_dotenv(Path(__file__).parent.parent.parent / ".env.local")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)s  %(message)s",
    datefmt="%H:%M:%S",
)
_log = logging.getLogger(__name__)

# Same UA as detectors.py — stay consistent so admins reading their access
# logs see one bot across the audit + backfill paths.
USER_AGENT = (
    "REBBAdvisorsBot/1.0 (+https://rebbadvisors.com/contact; "
    "website audit for local outreach)"
)
FETCH_TIMEOUT_S = 6
CANDIDATE_PATHS = ("/", "/contact", "/contact-us", "/about", "/about-us")


def _sb():
    url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")
    if not url or not key:
        _log.error("SUPABASE_URL / SUPABASE_SERVICE_KEY missing")
        sys.exit(1)
    return create_client(url, key)


def _fetch(url: str) -> str:
    """One HTTP GET, return body or '' on any failure. Never raises."""
    try:
        r = requests.get(
            url,
            headers={"User-Agent": USER_AGENT},
            timeout=FETCH_TIMEOUT_S,
            allow_redirects=True,
        )
        if r.status_code != 200:
            return ""
        # `text` decodes via response charset; FB URLs are ASCII either way.
        return r.text or ""
    except requests.RequestException:
        return ""


def mine_for_prospect(website_url: str) -> str | None:
    """Fetch home + a small set of contact-ish paths and run extract_facebook_url
    on the combined corpus. Returns the canonical FB URL or None."""
    if not website_url:
        return None
    if not website_url.startswith(("http://", "https://")):
        website_url = "https://" + website_url
    base = website_url.rstrip("/")
    seen: set[str] = set()
    htmls: list[str] = []
    for path in CANDIDATE_PATHS:
        url = base + (path if path != "/" else "")
        # Strip trailing slash duplicates
        if url in seen:
            continue
        seen.add(url)
        body = _fetch(url)
        if body:
            htmls.append(body)
    if not htmls:
        return None
    combined = "\n".join(htmls)
    return contact_extract.extract_facebook_url(combined)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=50,
                    help="max prospects to process this run (default 50)")
    ap.add_argument("--refresh", action="store_true",
                    help="re-mine even when facebook_url is already populated")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    sb = _sb()
    q = (
        sb.table("website_prospects")
        .select("id, business_name, website_url, facebook_url, audit_status")
        .eq("audit_status", "audited")
        .not_.is_("website_url", "null")
        .order("severity_score", desc=True)
        .limit(args.limit)
    )
    if not args.refresh:
        q = q.is_("facebook_url", "null")
    rows = q.execute().data or []

    if not rows:
        _log.info("nothing to backfill (limit=%d, refresh=%s)", args.limit, args.refresh)
        return 0

    _log.info("processing %d prospects", len(rows))

    found = 0
    miss = 0
    skipped = 0
    for r in rows:
        name = r.get("business_name") or "?"
        url = r.get("website_url")
        existing = r.get("facebook_url")
        if not url:
            skipped += 1
            continue
        if existing and not args.refresh:
            skipped += 1
            continue

        fb_url = mine_for_prospect(url)
        if fb_url:
            found += 1
            _log.info("  %s → %s", name, fb_url)
            if not args.dry_run:
                sb.table("website_prospects").update(
                    {"facebook_url": fb_url}
                ).eq("id", r["id"]).execute()
        else:
            miss += 1
            _log.info("  %s → (no FB found)", name)

    _log.info("done — found=%d miss=%d skipped=%d total=%d", found, miss, skipped, len(rows))
    return 0


if __name__ == "__main__":
    sys.exit(main())
