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
import urllib.parse
from datetime import datetime, timedelta, timezone

import requests

log = logging.getLogger(__name__)

USER_AGENT = "alex-prompts-greenville/0.1 (+https://alexprompts.com)"
HTTP_TIMEOUT = 30

QUERY_URL = (
    "https://www.gcgis.org/arcgis/rest/services/"
    "GreenvilleJS/Map_Layers_JS/MapServer/2/query"
)

# The attributes we pull. Kept explicit (not "*") so the committed JSON is lean
# and the schema we depend on is documented in one place.
OUT_FIELDS = [
    "PIN", "STREET", "STRPRE", "STRTYP", "STRSUF", "PROPTYPE", "LANDUSE",
    "SALEDATE", "SALEPRICE", "PURNAME", "SELLNAME", "DEEDBOOK", "DEEDPAGE",
    "LOTSIZE", "SQFEET",
]

PAGE_SIZE = 1000          # well under the server's 5000 maxRecordCount
MAX_RECORDS = 8000        # safety cap so a bad filter can never run away


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


def parse_feature(feature: dict) -> dict | None:
    """One ArcGIS feature -> one lean sale record. None if it lacks the basics
    (a buyer and a price), so junk rows never reach the site."""
    attrs = feature.get("attributes") or {}
    geom = feature.get("geometry") or {}

    buyer = _clean(attrs.get("PURNAME"))
    price = attrs.get("SALEPRICE")
    if not buyer or not price:
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
    try:
        resp = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=HTTP_TIMEOUT)
        if resp.status_code != 200:
            log.warning("GET %s -> %s", url, resp.status_code)
            return None
        data = resp.json()
        if isinstance(data, dict) and data.get("error"):
            log.warning("ArcGIS error: %s", data["error"])
            return None
        return data
    except (requests.RequestException, ValueError) as exc:
        log.warning("GET failed: %s", exc)
        return None


def fetch_all(min_price: int, months: int) -> list[dict]:
    """Page through the Commercial layer for recent sales >= min_price.

    Stops when a page returns nothing, the transfer limit is not exceeded, or the
    safety cap is hit. Returns [] on any failure (never raises)."""
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
    return parse_features(collected)


# ── Dataset assembly + serialization ──────────────────────────────────────────

def build_dataset(sales: list[dict], min_price: int, months: int) -> dict:
    """The committed JSON shape the site reads."""
    ordered = sort_sales(sales)
    return {
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
        "source": "Greenville County GIS (GreenvilleJS/Map_Layers_JS, Commercial layer)",
        "source_url": QUERY_URL,
        "min_price": min_price,
        "months": months,
        "count": len(ordered),
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
        f"Found {dataset.get('count')} sales.",
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
        sales = fetch_all(args.min_price, args.months)
        dataset = build_dataset(sales, args.min_price, args.months)

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
