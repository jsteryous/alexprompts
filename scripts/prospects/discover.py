"""
discover.py — Google Places (New) Text Search for Upstate SC verticals.

Populates `website_prospects` with candidate businesses (dental practices,
personal injury law firms) across Greenville, Spartanburg, Anderson, Pickens,
and Oconee counties. A missing `website_url` is kept (it's a valid pitch class:
"you have no site").

Usage:
    python discover.py --vertical dental --county greenville [--dry-run]
    python discover.py --vertical personal_injury --county all [--limit 80]
    python discover.py --all                           # every vertical × every county

Cost: Places Text Search is $32/1k after the $200/month Google Maps Platform
free credit. Upstate-wide scan across both verticals is ~6 queries × pagination
(~3 pages each) = <50 requests. Well inside the free tier.
"""

from __future__ import annotations

import argparse
import logging
import os
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Optional

import requests
from dotenv import load_dotenv
from supabase import create_client

load_dotenv(Path(__file__).parent.parent.parent / ".env.local")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)s  %(message)s",
    datefmt="%H:%M:%S",
)
_log = logging.getLogger(__name__)

PLACES_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText"

# Upstate SC county centroids (lat, lng, radius_m). Radius chosen to fit county
# without spilling far outside. Places caps radius at 50km.
COUNTIES: dict[str, tuple[float, float, int]] = {
    "greenville":  (34.8526, -82.3940, 25_000),
    "spartanburg": (34.9496, -81.9320, 25_000),
    "anderson":    (34.5034, -82.6501, 25_000),
    "pickens":     (34.8873, -82.7085, 20_000),
    "oconee":      (34.7516, -83.0668, 25_000),
}

VERTICALS: dict[str, list[str]] = {
    "dental":          ["dentist", "dental office", "family dentistry"],
    "personal_injury": ["personal injury lawyer", "accident attorney"],
}

FIELD_MASK = ",".join([
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.addressComponents",
    "places.internationalPhoneNumber",
    "places.nationalPhoneNumber",
    "places.websiteUri",
    "places.rating",
    "places.userRatingCount",
    "places.businessStatus",
    "nextPageToken",
])


@dataclass
class PlaceRow:
    place_id: str
    business_name: str
    vertical: str
    address: Optional[str]
    city: Optional[str]
    county: Optional[str]
    phone: Optional[str]
    website_url: Optional[str]
    google_rating: Optional[float]
    google_review_count: Optional[int]


def _extract_city_county(address_components: list[dict]) -> tuple[Optional[str], Optional[str]]:
    city = county = None
    for c in address_components or []:
        types = c.get("types", [])
        if "locality" in types and not city:
            city = c.get("longText") or c.get("shortText")
        if "administrative_area_level_2" in types and not county:
            county = (c.get("longText") or "").replace(" County", "")
    return city, county


def _search_page(
    query: str,
    lat: float,
    lng: float,
    radius: int,
    api_key: str,
    page_token: Optional[str] = None,
) -> tuple[list[dict], Optional[str]]:
    """One page of Places Text Search. Returns (places, next_page_token)."""
    body: dict = {
        "textQuery": query,
        "locationBias": {
            "circle": {
                "center": {"latitude": lat, "longitude": lng},
                "radius": float(radius),
            }
        },
        "pageSize": 20,
    }
    if page_token:
        body["pageToken"] = page_token

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": FIELD_MASK,
    }
    r = requests.post(PLACES_SEARCH_URL, json=body, headers=headers, timeout=15)
    if r.status_code != 200:
        _log.warning("Places API %s: %s", r.status_code, r.text[:200])
        return [], None
    j = r.json()
    return j.get("places", []) or [], j.get("nextPageToken")


def search_vertical_county(
    vertical: str,
    county_slug: str,
    api_key: str,
    limit: int = 60,
) -> list[PlaceRow]:
    """Run every query term for the vertical against the county's centroid."""
    if county_slug not in COUNTIES:
        raise ValueError(f"Unknown county: {county_slug}")
    if vertical not in VERTICALS:
        raise ValueError(f"Unknown vertical: {vertical}")

    lat, lng, radius = COUNTIES[county_slug]
    seen: dict[str, PlaceRow] = {}

    for query_term in VERTICALS[vertical]:
        full_query = f"{query_term} {county_slug.title()} County SC"
        page_token: Optional[str] = None
        for _page in range(3):  # Places caps at 3 pages / 60 results per query
            places, page_token = _search_page(
                full_query, lat, lng, radius, api_key, page_token
            )
            for p in places:
                pid = p.get("id")
                if not pid or pid in seen:
                    continue
                if p.get("businessStatus") and p["businessStatus"] != "OPERATIONAL":
                    continue
                city, county = _extract_city_county(p.get("addressComponents", []))
                seen[pid] = PlaceRow(
                    place_id=pid,
                    business_name=(p.get("displayName") or {}).get("text", ""),
                    vertical=vertical,
                    address=p.get("formattedAddress"),
                    city=city,
                    county=county or county_slug.title(),
                    phone=p.get("nationalPhoneNumber") or p.get("internationalPhoneNumber"),
                    website_url=p.get("websiteUri"),
                    google_rating=p.get("rating"),
                    google_review_count=p.get("userRatingCount"),
                )
                if len(seen) >= limit:
                    return list(seen.values())
            if not page_token:
                break
            # Google requires a short delay before the next page token is valid
            time.sleep(2)

    return list(seen.values())


def upsert_prospects(rows: Iterable[PlaceRow], dry_run: bool = False) -> int:
    """
    Insert new prospects, refresh mutable Places metadata on existing ones.

    For existing rows we update the Places-sourced fields (name, address, phone,
    rating, website_url) but do NOT touch audit/scoring columns. If website_url
    flipped (appeared, disappeared, or changed), audit_status is reset so the
    next --audit-pending run re-captures against the new URL — the previous
    audit is stale against a different target.
    """
    url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")
    if not url or not key:
        _log.error("SUPABASE_URL / SUPABASE_SERVICE_KEY missing")
        return 0

    rows = list(rows)
    if not rows:
        return 0

    if dry_run:
        for r in rows:
            _log.info("[dry] %s — %s — %s", r.vertical, r.business_name, r.website_url or "NO WEBSITE")
        return len(rows)

    sb = create_client(url, key)

    # Pull current state for any rows we've seen before so we can diff website_url
    # and refresh metadata surgically.
    place_ids = [r.place_id for r in rows]
    existing: dict[str, dict] = {}
    try:
        resp = (
            sb.table("website_prospects")
            .select("place_id, website_url, audit_status")
            .in_("place_id", place_ids)
            .execute()
        )
        for row in resp.data or []:
            existing[row["place_id"]] = row
    except Exception as e:
        _log.warning("existing-row lookup failed (will fall back to insert-only): %s", e)

    touched = 0
    for r in rows:
        current = existing.get(r.place_id)
        if current is None:
            has_website = bool(r.website_url)
            payload = {
                "place_id": r.place_id,
                "business_name": r.business_name,
                "vertical": r.vertical,
                "address": r.address,
                "city": r.city,
                "county": r.county,
                "phone": r.phone,
                "website_url": r.website_url,
                "google_rating": r.google_rating,
                "google_review_count": r.google_review_count,
                "audit_status": "pending" if has_website else "no_website",
                # No-website = instant 100/HOT so it ranks without needing an audit pass.
                "severity_score": None if has_website else 100,
                "severity_tag":   None if has_website else "HOT",
            }
            try:
                sb.table("website_prospects").insert(payload).execute()
                touched += 1
                _log.info("✔ insert %s — %s", r.business_name, r.website_url or "NO WEBSITE")
            except Exception as e:
                _log.warning("insert failed for %s: %s", r.business_name, e)
            continue

        # Existing row — refresh Places-sourced fields only.
        update_payload = {
            "business_name": r.business_name,
            "address": r.address,
            "city": r.city,
            "county": r.county,
            "phone": r.phone,
            "website_url": r.website_url,
            "google_rating": r.google_rating,
            "google_review_count": r.google_review_count,
        }
        prior_url = (current.get("website_url") or "").strip() or None
        new_url = (r.website_url or "").strip() or None
        url_changed = prior_url != new_url
        if url_changed:
            has_website = bool(new_url)
            update_payload["audit_status"] = "pending" if has_website else "no_website"
            # Stamp/clear the 100/HOT shortcut when the website disappears or returns.
            update_payload["severity_score"] = None if has_website else 100
            update_payload["severity_tag"]   = None if has_website else "HOT"

        try:
            sb.table("website_prospects").update(update_payload).eq("place_id", r.place_id).execute()
            touched += 1
            if url_changed:
                _log.info(
                    "↻ refresh %s — website_url %s → %s (audit reset)",
                    r.business_name, prior_url or "∅", new_url or "∅",
                )
            else:
                _log.debug("↻ refresh %s — metadata only", r.business_name)
        except Exception as e:
            _log.warning("update failed for %s: %s", r.business_name, e)

    return touched


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--vertical", choices=list(VERTICALS.keys()))
    ap.add_argument("--county", default="all",
                    help="Slug from COUNTIES or 'all' (default)")
    ap.add_argument("--all", action="store_true",
                    help="Every vertical × every county")
    ap.add_argument("--limit", type=int, default=60,
                    help="Max prospects per vertical×county (default 60)")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    api_key = os.getenv("GOOGLE_PLACES_API_KEY")
    if not api_key:
        _log.error("GOOGLE_PLACES_API_KEY missing from .env.local")
        return 1

    if args.all:
        targets = [(v, c) for v in VERTICALS for c in COUNTIES]
    else:
        if not args.vertical:
            ap.error("--vertical required unless --all is used")
        counties = list(COUNTIES) if args.county == "all" else [args.county]
        targets = [(args.vertical, c) for c in counties]

    total = 0
    for vertical, county in targets:
        _log.info("─── %s × %s ───", vertical, county)
        rows = search_vertical_county(vertical, county, api_key, args.limit)
        _log.info("found %d candidates", len(rows))
        total += upsert_prospects(rows, dry_run=args.dry_run)

    _log.info("done — %d prospects %s", total, "would be inserted" if args.dry_run else "upserted")
    return 0


if __name__ == "__main__":
    sys.exit(main())
