"""
records.py — deed-record ANALYSIS over Greenville County's commercial history.

A third data collector, sibling to commercial.py (the buyer's list) and housing.py
(the residential pulse). Those two report what happened. This one looks for
patterns across the whole 18-year record that no single sale shows, which is the
only part of this dataset nobody else in the market publishes.

Two findings, both deliberately chosen because they are IMMUNE to the county's
~4-month recording lag. They measure multi-year patterns, so being one quarter
behind changes nothing:

  A) PARCEL ASSEMBLY — one buyer acquiring adjacent parcels over time. This
     front-runs development instead of reporting it after the fact. A dispersed
     portfolio (a gas-station chain with 23 sites countywide) fails the spatial
     test by construction, which is the point.

  B) REPEAT-SALE INDEX — actual appreciation on the SAME parcel, sold twice. A
     true price index rather than a median of whatever happened to trade, and it
     yields the number no local source reports: the share of commercial resales
     that LOST money.

Honesty constraints baked in, learned the hard way from the first run:

  - The index uses VALIDATED pairs only (both sales assessor-confirmed
    arm's-length). The assessor reviews on a ~2-year lag, so the index necessarily
    ends about two years back. Allowing unreviewed sales pulls it to the present
    but contaminates it badly: spot-checking the resulting "90% losses" found
    lender takebacks and $5 nominal transfers the county had not yet flagged.
  - Pairs where the parcel was built on between sales are dropped. That gain is
    construction, not market appreciation.
  - Entity grouping is CONSERVATIVE. The county truncates buyer names at 24
    characters, so every position here is a floor, not a ceiling. `possible_merges`
    lists same-first-token entities whose parcels sit near each other, for a human
    to confirm before any name is published.

    cd scripts
    python -m greenville.records                                  # print findings
    python -m greenville.records --json-out ../src/data/greenvilleRecords.json
    python -m greenville.records --min-parcels 4 --radius-km 0.5
    python -m greenville.records --from-json snapshot.json         # replay, no network
"""

from __future__ import annotations

import argparse
import json
import logging
import math
import re
import sys
import urllib.parse
from collections import defaultdict
from datetime import datetime, timezone
from statistics import median

from .commercial import (
    HTTP_TIMEOUT,  # noqa: F401  (re-exported for symmetry with commercial.py)
    QUERY_URL,
    _clean,
    _get_json,
    epoch_ms_to_iso,
    is_market_sale,
    street_label,
)

log = logging.getLogger(__name__)

OUT_FIELDS = [
    "PIN", "STREET", "STRPRE", "STRTYP", "STRSUF", "PROPTYPE", "LANDUSE",
    "SALEDATE", "SALEPRICE", "PURNAME", "SELLNAME", "DEEDBOOK", "DEEDPAGE",
    "LOTSIZE", "SQFEET", "TRUESALE", "SALETYPE", "MKTAREA",
]

PAGE_SIZE = 1000
MAX_RECORDS = 40000       # the whole layer is ~12.5k rows; generous headroom

# Buyers that are not private capital assembling land, so not the story.
INSTITUTIONAL = re.compile(
    r"^(CITY OF|COUNTY OF|GREENVILLE COUNTY|STATE OF|SCHOOL DIST|SC DEPT|"
    r"DEPT OF|US |UNITED STATES|HABITAT FOR)", re.I)
LENDER = re.compile(
    r"(BANK|CREDIT UNION|MORTGAGE|FEDERAL|FANNIE|FREDDIE|SECRETARY OF|HUD\b)", re.I)

# Stripped when deriving an entity key. Legal suffixes plus the state words that
# show up inside truncated names ("ENIGMA CORP NEV CORP" vs "ENIGMA CORPORATION").
_NOISE = re.compile(
    r"\b(LLC|L L C|INC|INCORPORATED|CORP|CORPORATION|LP|L P|LLP|LTD|COMPANY|CO|"
    r"TRUST|PROPERTIES|PROPERTY|HOLDINGS|HOLDING|INVESTMENTS|INVESTMENT|PARTNERS|"
    r"PARTNERSHIP|GROUP|ENTERPRISES|VENTURES|NEV|NEVADA|SC|SOUTH CAROLINA|DE|"
    r"DELAWARE)\b", re.I)

# Sale types that indicate the row's price is nominal even when the county has not
# yet reviewed it. Used only to decide whether SPEND is real money.
NOMINAL_MAX = 1000


# ── Pure helpers ──────────────────────────────────────────────────────────────

def build_where() -> str:
    """Every dated sale in the layer. No price floor: land assembly happens in
    cheap parcels, so a $1M floor would hide the whole pattern."""
    return "SALEDATE IS NOT NULL"


def build_url(where: str, offset: int, page_size: int = PAGE_SIZE) -> str:
    params = {
        "where": where,
        "outFields": ",".join(OUT_FIELDS),
        "orderByFields": "SALEDATE ASC",
        "resultOffset": offset,
        "resultRecordCount": page_size,
        "returnGeometry": "true",
        "outSR": 4326,
        "f": "json",
    }
    return QUERY_URL + "?" + urllib.parse.urlencode(params)


def normalize_name(name: str) -> str:
    """Uppercase, punctuation-stripped, whitespace-collapsed."""
    return re.sub(r"\s+", " ", re.sub(r"[^A-Z0-9 ]", " ", (name or "").upper())).strip()


def entity_key(name: str) -> str:
    """A conservative grouping key: the name with legal and state noise removed.

    Deliberately not fuzzy. The county truncates PURNAME at 24 characters, so
    aggressive matching would merge genuinely different owners, and publishing a
    wrong owner name is far worse than undercounting a position."""
    return re.sub(r"\s+", " ", _NOISE.sub(" ", normalize_name(name))).strip()


def display_name(names: set[str] | list[str]) -> str:
    """The name to actually print. entity_key strips so much that it makes a poor
    label ("OUTDOOR PROPERTIES LLC" keys to "OUTDOOR"), so show the longest real
    county string instead, which is also the least truncated one."""
    return max(sorted(names), key=len) if names else ""


def haversine_km(a: tuple[float, float], b: tuple[float, float]) -> float:
    """Great-circle distance in km between two (lat, lng) points."""
    (la1, lo1), (la2, lo2) = a, b
    p = math.pi / 180
    h = (0.5 - math.cos((la2 - la1) * p) / 2
         + math.cos(la1 * p) * math.cos(la2 * p) * (1 - math.cos((lo2 - lo1) * p)) / 2)
    return 12742 * math.asin(math.sqrt(max(0.0, h)))


def months_between(start: str, end: str) -> int:
    """Whole months from one ISO date to another."""
    return ((int(end[:4]) - int(start[:4])) * 12 + int(end[5:7]) - int(start[5:7]))


def centroid(geom: dict) -> tuple[float | None, float | None]:
    """(lat, lng) for a point or polygon geometry. Returns (None, None) if absent."""
    if not geom:
        return None, None
    if "y" in geom and "x" in geom:
        y, x = geom.get("y"), geom.get("x")
        return (y, x) if isinstance(y, (int, float)) and isinstance(x, (int, float)) else (None, None)
    pts = [p for ring in (geom.get("rings") or []) for p in ring if len(p) >= 2]
    if not pts:
        return None, None
    return sum(p[1] for p in pts) / len(pts), sum(p[0] for p in pts) / len(pts)


def parse_row(feature: dict) -> dict | None:
    """One ArcGIS feature -> one analysis row. Unlike commercial.parse_feature this
    KEEPS zero-price transfers, because a $0 or $10 conveyance is still a change of
    control and matters to an assembly pattern. It is excluded from spend instead."""
    attrs = feature.get("attributes") or {}
    pin = _clean(attrs.get("PIN"))
    date = epoch_ms_to_iso(attrs.get("SALEDATE"))
    if not pin or not date:
        return None
    lat, lng = centroid(feature.get("geometry") or {})
    price = attrs.get("SALEPRICE")
    return {
        "pin": pin,
        "date": date,
        "buyer": _clean(attrs.get("PURNAME")),
        "seller": _clean(attrs.get("SELLNAME")),
        "price": int(price) if isinstance(price, (int, float)) else 0,
        "saleType": _clean(attrs.get("SALETYPE")).upper(),
        "trueSale": _clean(attrs.get("TRUESALE")).upper(),
        "landUse": _clean(attrs.get("LANDUSE")),
        "street": street_label(attrs),
        "mktArea": _clean(attrs.get("MKTAREA")),
        "lotSize": attrs.get("LOTSIZE") if isinstance(attrs.get("LOTSIZE"), (int, float)) else 0.0,
        "lat": round(lat, 6) if lat is not None else None,
        "lng": round(lng, 6) if lng is not None else None,
    }


def parse_rows(features: list[dict]) -> list[dict]:
    """Parse + dedup on (pin, date, price); the layer is one row per deed."""
    out: list[dict] = []
    seen: set[tuple] = set()
    for f in features:
        r = parse_row(f)
        if r is None:
            continue
        key = (r["pin"], r["date"], r["price"])
        if key in seen:
            continue
        seen.add(key)
        out.append(r)
    return out


# ── A) Parcel assembly ────────────────────────────────────────────────────────

def cluster_by_distance(rows: list[dict], radius_km: float) -> list[list[dict]]:
    """Single-link spatial clustering. Rows without geometry are dropped. n per
    buyer is tiny (tens at most), so the naive O(n^2) walk is fine."""
    pending = [r for r in rows if r["lat"] is not None and r["lng"] is not None]
    clusters: list[list[dict]] = []
    while pending:
        cluster = [pending.pop()]
        grew = True
        while grew:
            grew = False
            for cand in list(pending):
                if any(haversine_km((cand["lat"], cand["lng"]), (c["lat"], c["lng"])) <= radius_km
                       for c in cluster):
                    cluster.append(cand)
                    pending.remove(cand)
                    grew = True
        clusters.append(cluster)
    return clusters


def find_assemblies(
    rows: list[dict],
    min_parcels: int = 3,
    radius_km: float = 0.8,
    active_since: str = "2021-01-01",
    min_span_months: int = 6,
) -> list[dict]:
    """Buyers holding min_parcels+ parcels clustered within radius_km, acquired on
    2+ separate dates spanning min_span_months, with activity since active_since.

    The date tests are what separate assembly from a single multi-parcel closing:
    five parcels bought on one day is one deal, not a pattern."""
    by_entity: dict[str, dict[str, dict]] = defaultdict(dict)
    names: dict[str, set[str]] = defaultdict(set)
    for r in rows:
        if not r["buyer"] or len(r["buyer"]) < 4:
            continue
        if INSTITUTIONAL.search(r["buyer"]) or LENDER.search(r["buyer"]):
            continue
        # A quitclaim or corrective deed is a paperwork event, not an acquisition.
        if r["saleType"] in {"QUITCLAIM", "CORRECTIVE DEED", "PARTIAL INTEREST"}:
            continue
        key = entity_key(r["buyer"])
        if len(key) < 4:
            continue
        names[key].add(r["buyer"])
        prev = by_entity[key].get(r["pin"])
        if prev is None or r["date"] > prev["date"]:
            by_entity[key][r["pin"]] = r

    found: list[dict] = []
    for key, pins in by_entity.items():
        if len(pins) < min_parcels:
            continue
        for cluster in cluster_by_distance(list(pins.values()), radius_km):
            if len(cluster) < min_parcels:
                continue
            dates = sorted(c["date"] for c in cluster)
            if dates[-1] < active_since or len(set(dates)) < 2:
                continue
            span = months_between(dates[0], dates[-1])
            if span < min_span_months:
                continue
            spend = sum(c["price"] for c in cluster)
            acres = round(sum(c["lotSize"] or 0 for c in cluster), 2)
            found.append({
                "entity": key,
                "displayName": display_name(names[key]),
                "names": sorted(names[key]),
                "parcels": len(cluster),
                "acres": acres,
                "spend": spend,
                # Real acreage changing hands for nothing is a control transfer
                # (restructuring, JV contribution), not money spent buying in.
                "controlTransferOnly": spend <= NOMINAL_MAX and acres > 1,
                "firstBuy": dates[0],
                "lastBuy": dates[-1],
                "spanMonths": span,
                "streets": sorted({c["street"] for c in cluster if c["street"]})[:6],
                "mktArea": next((c["mktArea"] for c in cluster if c["mktArea"]), ""),
                "lat": round(sum(c["lat"] for c in cluster) / len(cluster), 5),
                "lng": round(sum(c["lng"] for c in cluster) / len(cluster), 5),
                "pins": sorted(c["pin"] for c in cluster),
            })
    found.sort(key=lambda f: (f["parcels"], f["acres"]), reverse=True)
    return found


def find_portfolios(rows: list[dict], min_parcels: int = 8,
                    active_since: str = "2021-01-01") -> list[dict]:
    """Entities holding many parcels ACROSS the county, adjacency irrelevant.

    The complement to find_assemblies. Assembly is "someone is putting a
    development site together"; a portfolio is "someone is quietly accumulating
    Greenville", which is the who-is-buying-and-with-whose-capital question and a
    different story. A wide geographic spread is the signal here, not a defect, so
    this reports the bounding span rather than filtering on it."""
    by_entity: dict[str, dict[str, dict]] = defaultdict(dict)
    names: dict[str, set[str]] = defaultdict(set)
    for r in rows:
        if not r["buyer"] or len(r["buyer"]) < 4:
            continue
        if INSTITUTIONAL.search(r["buyer"]) or LENDER.search(r["buyer"]):
            continue
        key = entity_key(r["buyer"])
        if len(key) < 4:
            continue
        names[key].add(r["buyer"])
        prev = by_entity[key].get(r["pin"])
        if prev is None or r["date"] > prev["date"]:
            by_entity[key][r["pin"]] = r

    out = []
    for key, pins in by_entity.items():
        if len(pins) < min_parcels:
            continue
        held = list(pins.values())
        dates = sorted(h["date"] for h in held)
        if dates[-1] < active_since:
            continue
        pts = [(h["lat"], h["lng"]) for h in held if h["lat"] is not None]
        spread = max((haversine_km(p, q) for i, p in enumerate(pts)
                      for q in pts[i + 1:]), default=0.0)
        out.append({
            "entity": key,
            "displayName": display_name(names[key]),
            "names": sorted(names[key]),
            "parcels": len(held),
            "acres": round(sum(h["lotSize"] or 0 for h in held), 2),
            "spend": sum(h["price"] for h in held),
            "firstBuy": dates[0],
            "lastBuy": dates[-1],
            "spanMonths": months_between(dates[0], dates[-1]),
            "spreadKm": round(spread, 1),
            "areas": sorted({h["mktArea"] for h in held if h["mktArea"]})[:8],
            "pins": sorted(pins),
        })
    out.sort(key=lambda p: (p["parcels"], p["acres"]), reverse=True)
    return out


def possible_merges(assemblies: list[dict], rows: list[dict], near_km: float = 8.0) -> list[dict]:
    """Entities sharing a first token whose holdings sit near each other, i.e.
    likely one owner split by 24-char truncation. Evidence for a human, never an
    automatic merge, because publishing the wrong owner name is the real risk."""
    pos: dict[str, list[tuple[float, float]]] = defaultdict(list)
    for a in assemblies:
        pos[a["entity"]].append((a["lat"], a["lng"]))
    by_token: dict[str, set[str]] = defaultdict(set)
    for key in pos:
        by_token[key.split(" ")[0]].add(key)

    out = []
    for token, keys in by_token.items():
        if len(keys) < 2 or len(token) < 4:
            continue
        ks = sorted(keys)
        if any(haversine_km(p, q) <= near_km
               for i, a in enumerate(ks) for b in ks[i + 1:]
               for p in pos[a] for q in pos[b]):
            allnames = sorted({n for r in rows if entity_key(r["buyer"]) in keys
                               for n in [r["buyer"]] if r["buyer"]})
            out.append({"token": token, "entities": ks, "countyNames": allnames})
    return sorted(out, key=lambda m: -len(m["countyNames"]))


# ── B) Repeat-sale index ──────────────────────────────────────────────────────

def index_sales(rows: list[dict], validated_only: bool) -> list[dict]:
    """Rows usable for price analysis. See the module docstring on why the index
    ships validated-only despite the ~2-year lag that implies."""
    out = []
    for r in rows:
        if not is_market_sale({"TRUESALE": r["trueSale"], "SALETYPE": r["saleType"]}):
            continue
        if validated_only and r["trueSale"] != "YES":
            continue
        if r["price"] < 25_000:
            continue
        out.append(r)
    return out


def repeat_pairs(rows: list[dict], min_hold_months: int = 12,
                 validated_only: bool = True) -> tuple[list[dict], int]:
    """Consecutive sales of the same parcel -> (pairs, dropped_for_construction)."""
    by_pin: dict[str, list[dict]] = defaultdict(list)
    for r in index_sales(rows, validated_only):
        by_pin[r["pin"]].append(r)

    pairs, built_on = [], 0
    for pin, sales in by_pin.items():
        sales.sort(key=lambda r: r["date"])
        for a, b in zip(sales, sales[1:]):
            held = months_between(a["date"], b["date"])
            if held < min_hold_months:
                continue
            # Land -> land-and-building means someone built. That gain is
            # construction, not the market moving.
            if a["saleType"].startswith("CASH (LAND)") and \
                    b["saleType"].startswith("CASH (LAND AND"):
                built_on += 1
                continue
            years = held / 12
            pairs.append({
                "pin": pin,
                "street": b["street"] or a["street"],
                "boughtOn": a["date"], "soldOn": b["date"],
                "heldYears": round(years, 1),
                "buyPrice": a["price"], "sellPrice": b["price"],
                "totalPct": round(100 * (b["price"] / a["price"] - 1), 1),
                "annualPct": round(100 * ((b["price"] / a["price"]) ** (1 / years) - 1), 1),
                "seller": a["buyer"], "buyer": b["buyer"],
            })
    pairs.sort(key=lambda p: p["soldOn"], reverse=True)
    return pairs, built_on


def summarize_pairs(pairs: list[dict]) -> dict:
    """Robust stats only. Median and IQR, never a mean: the tails of deed data are
    where the bad rows live."""
    if not pairs:
        return {"pairs": 0}
    ann = sorted(p["annualPct"] for p in pairs)
    losses = sum(1 for p in pairs if p["totalPct"] < 0)
    return {
        "pairs": len(pairs),
        "medianAnnualPct": round(median(ann), 1),
        "p25AnnualPct": ann[len(ann) // 4],
        "p75AnnualPct": ann[3 * len(ann) // 4],
        "lossSharePct": round(100 * losses / len(pairs)),
        "lossCount": losses,
        "medianHoldYears": round(median([p["heldYears"] for p in pairs]), 1),
    }


def index_by_year(pairs: list[dict], min_n: int = 8) -> list[dict]:
    """The series that is the actual asset: median appreciation and loss share by
    year of resale. Years thinner than min_n are omitted as noise."""
    buckets: dict[str, list[dict]] = defaultdict(list)
    for p in pairs:
        buckets[p["soldOn"][:4]].append(p)
    out = []
    for year in sorted(buckets):
        g = buckets[year]
        if len(g) < min_n:
            continue
        losses = sum(1 for x in g if x["totalPct"] < 0)
        out.append({
            "year": year,
            "n": len(g),
            "medianAnnualPct": round(median([x["annualPct"] for x in g]), 1),
            "lossSharePct": round(100 * losses / len(g)),
        })
    return out


# ── Network ───────────────────────────────────────────────────────────────────

def fetch_all() -> list[dict]:
    """Page through the whole Commercial layer. Returns [] on failure."""
    where = build_where()
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
        if len(features) < PAGE_SIZE and not data.get("exceededTransferLimit"):
            break
        offset += PAGE_SIZE
    log.info("Fetched %d deed rows", len(collected))
    return parse_rows(collected)


# ── Dataset assembly ──────────────────────────────────────────────────────────

def build_dataset(rows: list[dict], min_parcels: int, radius_km: float,
                  notable_limit: int = 40, min_portfolio: int = 8) -> dict:
    assemblies = find_assemblies(rows, min_parcels=min_parcels, radius_km=radius_km)
    portfolios = find_portfolios(rows, min_parcels=min_portfolio)
    pairs, built_on = repeat_pairs(rows, validated_only=True)
    dates = sorted(r["date"] for r in rows) or [""]
    return {
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
        "source": "Greenville County GIS (GreenvilleJS/Map_Layers_JS, Commercial layer)",
        "source_url": QUERY_URL,
        "deed_rows": len(rows),
        "record_span": {"first": dates[0], "last": dates[-1]},
        "method": {
            "assembly": f"{min_parcels}+ parcels within {radius_km}km, one entity, "
                        f"2+ distinct dates, 6+ month span, active since 2021",
            "portfolio": f"{min_portfolio}+ parcels countywide, one entity, active "
                         f"since 2021; adjacency irrelevant, spread reported",
            "index": "same parcel sold twice, both sales assessor-confirmed "
                     "arm's-length, 12+ month hold, construction pairs excluded",
            "caveat": "Entity grouping is conservative (county truncates buyer "
                      "names at 24 chars), so every position is a floor. The index "
                      "ends ~2 years back because the assessor confirms sales on a "
                      "~2-year lag; unreviewed recent sales include lender "
                      "takebacks and nominal transfers and are excluded.",
        },
        "assembly": {
            "count": len(assemblies),
            "clusters": assemblies,
            "possible_merges": possible_merges(assemblies, rows),
        },
        "portfolios": {
            "count": len(portfolios),
            "holders": portfolios,
        },
        "repeat_sale_index": {
            "summary": summarize_pairs(pairs),
            "excluded_built_on_between_sales": built_on,
            "by_year": index_by_year(pairs),
            "notable_gains": sorted(pairs, key=lambda p: -p["annualPct"])[:notable_limit],
            "notable_losses": sorted(pairs, key=lambda p: p["totalPct"])[:notable_limit],
        },
    }


def to_json(dataset: dict) -> str:
    return json.dumps(dataset, indent=2, ensure_ascii=False)


# ── Rendering + CLI ───────────────────────────────────────────────────────────

def render_summary(dataset: dict, limit: int = 12) -> str:
    asm = dataset["assembly"]
    idx = dataset["repeat_sale_index"]
    s = idx["summary"]
    span = dataset["record_span"]
    lines = [
        "GREENVILLE COUNTY DEED-RECORD FINDINGS",
        f"Collected {dataset['generated_at']}",
        f"{dataset['deed_rows']:,} deed rows, {span['first']} to {span['last']}",
        "",
        f"A) PARCEL ASSEMBLY — {asm['count']} clusters",
    ]
    for c in asm["clusters"][:limit]:
        tag = "  [CONTROL TRANSFER, not a purchase]" if c["controlTransferOnly"] else ""
        lines.append(f"  {c['displayName']}{tag}")
        lines.append(
            f"     {c['parcels']} parcels | {c['acres']} ac | ${c['spend']:,} | "
            f"{c['firstBuy']} -> {c['lastBuy']} ({round(c['spanMonths']/12, 1)}y)")
        lines.append(f"     {', '.join(c['streets'][:4])}  @ {c['lat']},{c['lng']}")
    if asm["possible_merges"]:
        lines.append(f"\n  [{len(asm['possible_merges'])} possible same-owner name "
                     f"groups to verify by hand before publishing a name]")

    pf = dataset["portfolios"]
    lines += ["", f"B) COUNTYWIDE PORTFOLIOS — {pf['count']} holders"]
    for h in pf["holders"][:limit]:
        lines.append(f"  {h['displayName']}")
        lines.append(
            f"     {h['parcels']} parcels | {h['acres']} ac | ${h['spend']:,} | "
            f"{h['firstBuy']} -> {h['lastBuy']} | spread {h['spreadKm']}km")
        if len(h["names"]) > 1:
            lines.append(f"     county name variants: {', '.join(h['names'])}")

    lines += [
        "",
        "C) REPEAT-SALE INDEX (validated pairs only)",
        f"  {s['pairs']} pairs | median {s['medianAnnualPct']:+}%/yr | "
        f"IQR {s['p25AnnualPct']:+}% to {s['p75AnnualPct']:+}% | "
        f"sold at a loss {s['lossSharePct']}% ({s['lossCount']}) | "
        f"median hold {s['medianHoldYears']}y",
        f"  ({idx['excluded_built_on_between_sales']} pairs excluded: built on "
        f"between sales)",
        "",
        "   year     n   median/yr   % sold at a loss",
    ]
    for row in idx["by_year"]:
        lines.append(f"   {row['year']}  {row['n']:>5}      {row['medianAnnualPct']:+6.1f}%"
                     f"          {row['lossSharePct']:>3}%")
    return "\n".join(lines)


def main() -> int:
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):  # pragma: no cover
        pass

    p = argparse.ArgumentParser(description="Analyze Greenville County deed records")
    p.add_argument("--min-parcels", type=int, default=3, help="parcels to call it an assembly (default 3)")
    p.add_argument("--radius-km", type=float, default=0.8, help="cluster radius in km (default 0.8)")
    p.add_argument("--limit", type=int, default=12, help="clusters to print (default 12)")
    p.add_argument("--json-out", metavar="PATH", help="write the findings JSON here")
    p.add_argument("--from-json", metavar="PATH", help="replay saved raw rows, no network")
    args = p.parse_args()

    from pathlib import Path
    if args.from_json:
        rows = json.loads(Path(args.from_json).read_text(encoding="utf-8"))
    else:
        rows = fetch_all()
    if not rows:
        log.warning("No deed rows collected; nothing to analyze.")
        return 1

    dataset = build_dataset(rows, args.min_parcels, args.radius_km)

    if args.json_out:
        Path(args.json_out).write_text(to_json(dataset), encoding="utf-8")
        log.info("Wrote findings to %s", args.json_out)

    print("\n" + "=" * 74)
    print(render_summary(dataset, args.limit))
    print("=" * 74)
    return 0


if __name__ == "__main__":
    sys.exit(main())
