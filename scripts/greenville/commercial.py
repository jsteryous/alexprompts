"""
commercial.py — Greenville County commercial sales ("buyer's list").

A data collector, sibling to greenville/collect.py (news). Where collect.py
scores news, this one pulls a hard fact set: recent COMMERCIAL property sales in
Greenville County, SC, straight from the county's own public ArcGIS service. No
scraper, no key, no paid API. It is the same map endpoint the county's public
parcel viewer calls, queried for the "Commercial" layer.

Why this exists: a recurring commercial-buyer LLC in Greenville is a piece of
active capital. A list of "who has been buying commercial here, and for how much"
is a real buyer pool for an agent with a listing, and a market read for an
investor. It also seeds the eventual buy-box directory.

Endpoint (confirmed June 2026):
  https://www.gcgis.org/arcgis/rest/services/GreenvilleJS/Map_Layers_JS/MapServer/2/query
Layer 2 = "Commercial". Fields used: PURNAME (buyer), SELLNAME (seller),
SALEPRICE (real integer), SALEDATE (epoch ms), STREET/STRPRE/STRTYP/STRSUF
(street name, NO house number in this layer), PIN (parcel), LANDUSE (raw code),
PROPTYPE, DEEDBOOK/DEEDPAGE (link back to the Register of Deeds), geometry
(point; we request outSR=4326 so it comes back as lon/lat). maxRecordCount 5000.

TRUESALE + SALETYPE are the validity flags, added July 2026 after an audit found
the tool was publishing quitclaims, intercompany transfers, and multi-parcel deeds
as if they were market sales (about 6% of rows). We now drop anything the county
flags as non-market. Note the assessor reviews sales on a ~2-YEAR lag, so a blank
TRUESALE means "not reviewed yet", not "bad"; every row from the last two years is
blank, and treating blank as bad would empty the page. Each record carries
`validated` so the page can be honest about which prices are confirmed.

The output JSON is committed and read by the site tool at /tools/buyers-list.
Same posture as the news collectors: pure helpers are unit-tested, every network
call degrades gracefully (log + return empty, never raise), no secrets needed.

    cd scripts
    python -m greenville.commercial                                  # print a summary
    python -m greenville.commercial --json-out ../src/data/commercialSales.json
    python -m greenville.commercial --min-price 1000000 --months 12
    python -m greenville.commercial --from-json snapshot.json         # replay, no network
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
import time
import urllib.parse
from datetime import datetime, timedelta, timezone

import requests

log = logging.getLogger(__name__)

USER_AGENT = "rebrew-greenville/0.1 (+https://rebrew.org)"
HTTP_TIMEOUT = 30
HTTP_RETRIES = 3          # the county service blips; a blip should not lose a run
RETRY_BACKOFF = 2.0       # seconds, multiplied by the attempt number

QUERY_URL = (
    "https://www.gcgis.org/arcgis/rest/services/"
    "GreenvilleJS/Map_Layers_JS/MapServer/2/query"
)

# The attributes we pull. Kept explicit (not "*") so the committed JSON is lean
# and the schema we depend on is documented in one place.
OUT_FIELDS = [
    "PIN", "STREET", "STRPRE", "STRTYP", "STRSUF", "PROPTYPE", "LANDUSE",
    "SALEDATE", "SALEPRICE", "PURNAME", "SELLNAME", "DEEDBOOK", "DEEDPAGE",
    "LOTSIZE", "SQFEET", "TRUESALE", "SALETYPE",
]

PAGE_SIZE = 1000          # well under the server's 5000 maxRecordCount
MAX_RECORDS = 8000        # safety cap so a bad filter can never run away

# Sale types where the recorded price is NOT this parcel's market price. Publishing
# these as "sales" is wrong: a quitclaim or a family transfer carries a nominal
# price, an intercompany transfer moves title without a market test, and a
# "SALE DOES NOT MATCH" deed covers other property too, so the price shown against
# this one parcel is really the total for several.
NON_MARKET_SALE_TYPES = frozenset({
    "QUITCLAIM",
    "FAMILY TRANSFER",
    "GIFT",
    "LOVE AND AFFECTION",
    "DEED OF DISTRIBUTION",
    "PARTIAL INTEREST",
    "CORRECTIVE DEED",
    "INTERCOMPANY TRANSFER",
    "MASTERS DEED AND ALL BANK FORCLOSURES",
    "TAX SALE DEED",
    "CONDEMNATION OR GOVERNMENTAL PURCHASE",
    "EXCHANGE OF PROPERTY",
    "SALE DOES NOT MATCH (MORE THAN ONE PROPERTY TRANSFERED OR MH IN DEED)",
})


# ── Pure helpers (side-effect free, unit-test friendly) ───────────────────────

def cutoff_date(months: int, today: datetime | None = None) -> str:
    """ISO date `months` months before today, for the SALEDATE filter."""
    now = today or datetime.now(timezone.utc)
    # Approximate a month as 30.44 days; exactness does not matter for a lookback.
    return (now - timedelta(days=round(months * 30.44))).strftime("%Y-%m-%d")


def build_where(min_price: int, since: str) -> str:
    """ArcGIS SQL filter: commercial sales at/above a price, on/after a date."""
    return f"SALEPRICE >= {int(min_price)} AND SALEDATE >= DATE '{since}'"


def build_url(where: str, offset: int, page_size: int = PAGE_SIZE) -> str:
    """A single paged query URL. outSR=4326 returns geometry as lon/lat."""
    params = {
        "where": where,
        "outFields": ",".join(OUT_FIELDS),
        "orderByFields": "SALEDATE DESC",
        "resultOffset": offset,
        "resultRecordCount": page_size,
        "returnGeometry": "true",
        "outSR": 4326,
        "f": "json",
    }
    return QUERY_URL + "?" + urllib.parse.urlencode(params)


def epoch_ms_to_iso(value: object) -> str | None:
    """Greenville's SALEDATE is epoch milliseconds. Return an ISO date or None."""
    if value is None or value == "":
        return None
    try:
        return datetime.fromtimestamp(int(value) / 1000, tz=timezone.utc).strftime("%Y-%m-%d")
    except (ValueError, TypeError, OverflowError, OSError):
        return None


def _clean(part: object) -> str:
    """Trim a string attribute; the source uses a single space for 'blank'."""
    return str(part or "").strip()


def street_label(attrs: dict) -> str:
    """Assemble a display street from prefix/name/type/suffix (no house number
    exists in this layer). Title-cased: 'PELHAM' + 'RD' -> 'Pelham Rd'."""
    parts = [_clean(attrs.get(k)) for k in ("STRPRE", "STREET", "STRTYP", "STRSUF")]
    joined = " ".join(p for p in parts if p)
    return joined.title() if joined else ""


def is_market_sale(attrs: dict) -> bool:
    """True when the county has not told us this transfer is non-market.

    Two independent signals, and we honor both:
      TRUESALE ("Valid Sale") is the assessor's own verdict. 'NO' means reviewed
      and rejected as a market sale. Blank means NOT YET REVIEWED, which is every
      sale from roughly the last two years, so blank must NOT be treated as bad or
      the tool would show nothing recent.
      SALETYPE names the instrument. Some types are never a market price for this
      parcel regardless of whether a human has reviewed the row yet.
    """
    if _clean(attrs.get("TRUESALE")).upper() == "NO":
        return False
    return _clean(attrs.get("SALETYPE")).upper() not in NON_MARKET_SALE_TYPES


def parse_feature(feature: dict) -> dict | None:
    """One ArcGIS feature -> one lean sale record. None if it lacks the basics
    (a buyer and a price) or if the county flags it as a non-market transfer, so
    junk rows never reach the site."""
    attrs = feature.get("attributes") or {}
    geom = feature.get("geometry") or {}

    buyer = _clean(attrs.get("PURNAME"))
    price = attrs.get("SALEPRICE")
    if not buyer or not price:
        return None
    if not is_market_sale(attrs):
        return None

    lng = geom.get("x")
    lat = geom.get("y")

    return {
        "pin": _clean(attrs.get("PIN")),
        "buyer": buyer,
        "seller": _clean(attrs.get("SELLNAME")),
        "price": int(price),
        "saleDate": epoch_ms_to_iso(attrs.get("SALEDATE")),
        "street": street_label(attrs),
        "propType": _clean(attrs.get("PROPTYPE")) or "Commercial",
        "landUse": _clean(attrs.get("LANDUSE")),
        "deedBook": attrs.get("DEEDBOOK") or None,
        "deedPage": attrs.get("DEEDPAGE") or None,
        "lotSize": attrs.get("LOTSIZE") or None,
        "sqft": attrs.get("SQFEET") or None,
        # The assessor confirms sales on a ~2-year lag, so most recent rows are
        # "unreviewed" rather than confirmed. Surfaced so the page can say so.
        "validated": _clean(attrs.get("TRUESALE")).upper() == "YES",
        "saleType": _clean(attrs.get("SALETYPE")) or None,
        "lat": round(lat, 6) if isinstance(lat, (int, float)) else None,
        "lng": round(lng, 6) if isinstance(lng, (int, float)) else None,
    }


def parse_features(features: list[dict]) -> list[dict]:
    """Parse + dedup a batch of features. Dedup keys on (pin, saleDate): the
    layer is one row per parcel, but guard against any repeats."""
    out: list[dict] = []
    seen: set[tuple] = set()
    for f in features:
        rec = parse_feature(f)
        if rec is None:
            continue
        key = (rec["pin"], rec["saleDate"])
        if key in seen:
            continue
        seen.add(key)
        out.append(rec)
    return out


def sort_sales(sales: list[dict]) -> list[dict]:
    """Newest sale first; records with no date sink to the bottom."""
    return sorted(sales, key=lambda s: (s.get("saleDate") or ""), reverse=True)


# ── Network (degrades gracefully) ─────────────────────────────────────────────

def _get_json(url: str) -> dict | None:
    """One ArcGIS query, retried on a transient failure. None when it stays down.

    The county restarts this service often enough that a single blip should not
    cost a whole weekly run, so a failed attempt is retried with a widening
    pause. Note the failure mode worth retrying arrives as HTTP 200 with an error
    body ({"error": {"code": 500, "message": "... not started"}}), not as a 5xx,
    so the in-body error is retried the same as a transport error."""
    last: str = "unknown"
    for attempt in range(1, HTTP_RETRIES + 1):
        try:
            resp = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=HTTP_TIMEOUT)
            if resp.status_code != 200:
                last = f"HTTP {resp.status_code}"
            else:
                data = resp.json()
                if not (isinstance(data, dict) and data.get("error")):
                    return data
                last = f"ArcGIS error: {data['error']}"
        except (requests.RequestException, ValueError) as exc:
            last = f"GET failed: {exc}"
        if attempt < HTTP_RETRIES:
            log.warning("%s (attempt %d/%d); retrying", last, attempt, HTTP_RETRIES)
            time.sleep(RETRY_BACKOFF * attempt)
    log.warning("%s (gave up after %d attempts): %s", last, HTTP_RETRIES, url)
    return None


def fetch_all(min_price: int, months: int) -> tuple[list[dict], int]:
    """Page through the Commercial layer for recent sales >= min_price.

    Returns (sales, excluded_non_market). Stops when a page returns nothing, the
    transfer limit is not exceeded, or the safety cap is hit. Returns ([], 0) on
    any failure (never raises)."""
    where = build_where(min_price, cutoff_date(months))
    collected: list[dict] = []
    offset = 0
    while len(collected) < MAX_RECORDS:
        data = _get_json(build_url(where, offset))
        if not data:
            break
        features = data.get("features") or []
        if not features:
            break
        collected.extend(features)
        if not data.get("exceededTransferLimit"):
            break
        offset += PAGE_SIZE

    excluded = sum(
        1 for f in collected if not is_market_sale(f.get("attributes") or {})
    )
    if excluded:
        log.info("Excluded %d county-flagged non-market transfers", excluded)
    return parse_features(collected), excluded


# ── Dataset assembly + serialization ──────────────────────────────────────────

def build_dataset(
    sales: list[dict], min_price: int, months: int, excluded_non_market: int = 0
) -> dict:
    """The committed JSON shape the site reads."""
    ordered = sort_sales(sales)
    return {
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
        "source": "Greenville County GIS (GreenvilleJS/Map_Layers_JS, Commercial layer)",
        "source_url": QUERY_URL,
        "min_price": min_price,
        "months": months,
        "count": len(ordered),
        "excluded_non_market": excluded_non_market,
        "validated_count": sum(1 for s in ordered if s.get("validated")),
        "sales": ordered,
    }


def to_json(dataset: dict) -> str:
    return json.dumps(dataset, indent=2, ensure_ascii=False)


# ── Rendering + CLI ───────────────────────────────────────────────────────────

def render_summary(dataset: dict, limit: int = 15) -> str:
    sales = dataset.get("sales", [])
    lines = [
        "GREENVILLE COUNTY COMMERCIAL SALES",
        f"Collected {dataset.get('generated_at')}",
        f"Filter: price >= ${dataset.get('min_price'):,}, last {dataset.get('months')} months",
        f"Found {dataset.get('count')} sales "
        f"({dataset.get('validated_count', 0)} assessor-confirmed, the rest not yet "
        f"reviewed; {dataset.get('excluded_non_market', 0)} non-market transfers excluded).",
        "",
        f"MOST RECENT (top {min(limit, len(sales))}):",
    ]
    for i, s in enumerate(sales[:limit], 1):
        price = f"${s['price']:,}"
        lines.append(
            f"{i:>3}. {s.get('saleDate') or '?':<10} {price:>14}  "
            f"{s['buyer']:<26.26}  {s.get('street') or ''}"
        )
    return "\n".join(lines)


def main() -> int:
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):  # pragma: no cover
        pass

    p = argparse.ArgumentParser(description="Collect Greenville County commercial sales")
    p.add_argument("--min-price", type=int, default=250000, help="minimum sale price (default 250000)")
    p.add_argument("--months", type=int, default=24, help="lookback window in months (default 24)")
    p.add_argument("--limit", type=int, default=15, help="rows to print in the summary (default 15)")
    p.add_argument("--json-out", metavar="PATH", help="write the dataset JSON here")
    p.add_argument("--from-json", metavar="PATH", help="replay a saved dataset, no network")
    args = p.parse_args()

    if args.from_json:
        from pathlib import Path
        dataset = json.loads(Path(args.from_json).read_text(encoding="utf-8"))
    else:
        sales, excluded = fetch_all(args.min_price, args.months)
        dataset = build_dataset(sales, args.min_price, args.months, excluded)
        # A live fetch that returns nothing means the county service is down, not
        # that Greenville stopped trading commercial property. Writing that empty
        # dataset would overwrite a good committed file, and because the weekly
        # workflow commits whatever changed, it would silently blank the live
        # /tools/buyers-list page while reporting success. It did exactly that on
        # 2026-08-09, when the county's ArcGIS service was stopped. Stale data
        # beats no data here, so fail loudly and leave the committed file alone.
        if not sales:
            log.error(
                "No sales returned from the county ArcGIS service (%s). Refusing "
                "to overwrite %s with an empty dataset; the committed file stands.",
                QUERY_URL, args.json_out or "the dataset",
            )
            return 1

    if args.json_out:
        from pathlib import Path
        Path(args.json_out).write_text(to_json(dataset), encoding="utf-8")
        log.info("Wrote %d sales to %s", dataset.get("count", 0), args.json_out)

    print("\n" + "=" * 70)
    print(render_summary(dataset, args.limit))
    print("=" * 70)
    return 0


if __name__ == "__main__":
    sys.exit(main())
