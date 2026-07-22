"""
housing.py — Greenville residential market pulse (Zillow Research).

A data collector, sibling to greenville/commercial.py. Where commercial.py pulls
the county's commercial DEED records (which lag ~4 months), this one pulls the
Greenville, SC metro's RESIDENTIAL pulse from Zillow Research: typical home value
(ZHVI), typical asking rent (ZORI), and a set of MARKET-VITALS metrics that read
buyer-versus-seller leverage (median days to pending, for-sale inventory, new
listings, the share of listings with a price cut, and the sale-to-list ratio),
each alongside the national figure so the brief can read the Upstate against the
country. No scraper, no key, no paid API.
Zillow publishes these as free public CSVs, refreshed monthly (about a three-week
lag), which is genuinely current for a weekly brief. The committed JSON is read by
the Upstate Brief engine (the residential-pulse section) and can back a site tool.

Sources (confirmed reachable + Greenville-covering July 2026):
  ZHVI metro: files.zillowstatic.com/.../Metro_zhvi_uc_sfrcondo_tier_..._month.csv
  ZORI metro: files.zillowstatic.com/.../Metro_zori_uc_sfrcondomfr_sm_month.csv
  vitals:     files.zillowstatic.com/.../Metro_{med_doz_pending,invt_fs,new_listings,
              perc_listings_price_cut,mean_sale_to_list}_..._month.csv
They all share one schema: RegionID, SizeRank, RegionName, RegionType, StateName,
then one column per month (YYYY-MM-DD). We key on RegionName: "Greenville, SC" (an
msa row) and "United States" (the country row).

Same posture as commercial.py: pure helpers are unit-tested, every network call
degrades gracefully (log + return None, never raise), no secrets needed.

    cd scripts
    python -m greenville.housing                                        # print a summary
    python -m greenville.housing --json-out ../src/data/greenvilleHousing.json
    python -m greenville.housing --metro "Columbia, SC"                 # a different metro
    python -m greenville.housing --from-json snapshot.json              # replay, no network
"""

from __future__ import annotations

import argparse
import json
import logging
import re
import sys
import csv
import io
from datetime import datetime, timezone

import requests

log = logging.getLogger(__name__)

USER_AGENT = "alex-prompts-greenville/0.1 (+https://alexprompts.com)"
HTTP_TIMEOUT = 60

ZHVI_URL = (
    "https://files.zillowstatic.com/research/public_csvs/zhvi/"
    "Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv"
)
ZORI_URL = (
    "https://files.zillowstatic.com/research/public_csvs/zori/"
    "Metro_zori_uc_sfrcondomfr_sm_month.csv"
)

METRO_DEFAULT = "Greenville, SC"   # Zillow's RegionName for the Greenville MSA
NATION = "United States"           # the country-level row present in every metro file

# Months of history to keep in the committed series (enough for a YoY sparkline,
# lean enough for a static import). YoY needs 13 points; 24 gives a clean tail.
SERIES_TAIL = 24

# ── Market-vitals metrics (the buyer-versus-seller leverage read) ─────────────
# These live in the same Zillow schema as ZHVI/ZORI (RegionName-keyed metro
# files), so the same parsing works. Each entry:
#   (key, label, unit, csv subdir, csv file, decimals, scale)
# `scale` turns Zillow's 0..1 share/ratio metrics into whole percents (0.304 ->
# 30.4) so a reader sees "30%" instead of a value that rounds to 0. `decimals`
# sets both the stored precision and the summary rounding (0 -> integer days and
# counts; 1 -> one-decimal percents). Unit "percent" flags the two scaled metrics.
VITALS_BASE = "https://files.zillowstatic.com/research/public_csvs"
VITALS = [
    ("days_to_pending", "Median days to pending (list to under contract)", "days",
     "med_doz_pending", "Metro_med_doz_pending_uc_sfrcondo_sm_month.csv", 0, 1),
    ("inventory", "For-sale inventory (active listings)", "homes",
     "invt_fs", "Metro_invt_fs_uc_sfrcondo_sm_month.csv", 0, 1),
    ("new_listings", "New listings for the month", "homes",
     "new_listings", "Metro_new_listings_uc_sfrcondo_sm_month.csv", 0, 1),
    ("price_cut_share", "Share of active listings with a price cut", "percent",
     "perc_listings_price_cut", "Metro_perc_listings_price_cut_uc_sfrcondo_sm_month.csv", 1, 100),
    ("sale_to_list", "Mean sale-to-list ratio", "percent",
     "mean_sale_to_list", "Metro_mean_sale_to_list_uc_sfrcondo_sm_month.csv", 1, 100),
]

# A shorter tail for vitals than the price/rent series: 13 months is a clean YoY
# plus a short trend line, and five extra metrics at 24 months would bloat the
# committed JSON for little gain (the summary already carries the key deltas).
VITALS_TAIL = 13


def vitals_url(subdir: str, filename: str) -> str:
    """The public CSV URL for a vitals metric."""
    return f"{VITALS_BASE}/{subdir}/{filename}"

_MONTH_COL = re.compile(r"^\d{4}-\d{2}-\d{2}$")


# ── Pure helpers (side-effect free, unit-test friendly) ───────────────────────

def month_columns(header: list[str]) -> list[int]:
    """Indices of the YYYY-MM-DD date columns in a Zillow CSV header."""
    return [i for i, name in enumerate(header) if _MONTH_COL.match(name.strip())]


def find_row(rows: list[list[str]], region_name: str) -> list[str] | None:
    """The data row whose RegionName (column index 2) matches exactly. None if absent."""
    for row in rows:
        if len(row) > 2 and row[2].strip() == region_name:
            return row
    return None


def row_series(header: list[str], row: list[str]) -> list[dict]:
    """A row's month->value points, blanks dropped, oldest first.

    Zillow leaves early months blank for a young series, so a missing/empty cell
    is skipped rather than read as zero."""
    out: list[dict] = []
    for i in month_columns(header):
        if i >= len(row):
            continue
        cell = row[i].strip()
        if not cell:
            continue
        try:
            out.append({"month": header[i].strip(), "value": float(cell)})
        except ValueError:
            continue
    out.sort(key=lambda p: p["month"])
    return out


def pct_change(series: list[dict], months_back: int) -> float | None:
    """Percent change of the latest point vs the point `months_back` earlier.

    None when there is not enough history. Rounded to one decimal."""
    if len(series) <= months_back:
        return None
    now = series[-1]["value"]
    then = series[-1 - months_back]["value"]
    if not then:
        return None
    return round((now - then) / then * 100, 1)


def summarize(series: list[dict]) -> dict | None:
    """Latest value plus month-over-month and year-over-year change. None if empty."""
    if not series:
        return None
    return {
        "latest": round(series[-1]["value"]),
        "mom_pct": pct_change(series, 1),
        "yoy_pct": pct_change(series, 12),
    }


def build_metric(csv_text: str, metric: str, metro: str, tail: int = SERIES_TAIL) -> dict:
    """One Zillow file -> the metro-vs-nation block the brief reads.

    Empty/blank sections come back with None summaries and an empty series rather
    than raising, so a schema change degrades instead of crashing the collector."""
    rows = list(csv.reader(io.StringIO(csv_text)))
    if not rows:
        return {"metric": metric, "latest_month": None, "greenville": None,
                "national": None, "series": []}
    header = rows[0]
    metro_row = find_row(rows[1:], metro)
    nation_row = find_row(rows[1:], NATION)
    metro_series = row_series(header, metro_row) if metro_row else []
    nation_series = row_series(header, nation_row) if nation_row else []
    return {
        "metric": metric,
        "latest_month": metro_series[-1]["month"] if metro_series else None,
        "greenville": summarize(metro_series),
        "national": summarize(nation_series),
        # Round the committed series to whole dollars: Zillow re-smooths history
        # every month, so full-precision floats would churn the whole diff weekly.
        "series": [{"month": p["month"], "value": round(p["value"])}
                   for p in metro_series[-tail:]],
    }


def _round(value: float, decimals: int) -> float | int:
    """Round to `decimals` places; decimals=0 returns an int (days, counts)."""
    return round(value, decimals) if decimals else round(value)


def scale_series(series: list[dict], scale: float) -> list[dict]:
    """Multiply every value by `scale` (e.g. 100 to turn a 0..1 share into a percent)."""
    if scale == 1:
        return series
    return [{"month": p["month"], "value": p["value"] * scale} for p in series]


def vitals_summary(series: list[dict], decimals: int) -> dict | None:
    """Latest value with its prior-MONTH and prior-YEAR absolutes, plus MoM/YoY.

    Vitals carry the prior-year ABSOLUTE, not just a percent change, because a
    reader reads a share as points ("price cuts at 30%, up from 23% a year ago")
    but a count as a percent move ("inventory up 12%"). Carrying both lets the
    writer phrase each metric correctly. None on an empty series."""
    if not series:
        return None
    return {
        "latest": _round(series[-1]["value"], decimals),
        "prior_month": _round(series[-2]["value"], decimals) if len(series) >= 2 else None,
        "prior_year": _round(series[-13]["value"], decimals) if len(series) >= 13 else None,
        "mom_pct": pct_change(series, 1),
        "yoy_pct": pct_change(series, 12),
    }


def build_vitals_metric(csv_text: str, label: str, unit: str, metro: str,
                        decimals: int, scale: float, tail: int = VITALS_TAIL) -> dict:
    """One Zillow vitals file -> a metro-vs-nation block, scaled and rounded.

    Degrades to None summaries and an empty series on blank input, like
    build_metric, so one missing feed never crashes the whole collector."""
    rows = list(csv.reader(io.StringIO(csv_text)))
    if not rows:
        return {"metric": label, "unit": unit, "latest_month": None,
                "greenville": None, "national": None, "series": []}
    header = rows[0]
    metro_row = find_row(rows[1:], metro)
    nation_row = find_row(rows[1:], NATION)
    metro_series = scale_series(row_series(header, metro_row), scale) if metro_row else []
    nation_series = scale_series(row_series(header, nation_row), scale) if nation_row else []
    return {
        "metric": label,
        "unit": unit,
        "latest_month": metro_series[-1]["month"] if metro_series else None,
        "greenville": vitals_summary(metro_series, decimals),
        "national": vitals_summary(nation_series, decimals),
        "series": [{"month": p["month"], "value": _round(p["value"], decimals)}
                   for p in metro_series[-tail:]],
    }


# ── Network (degrades gracefully) ─────────────────────────────────────────────

def fetch_csv(url: str) -> str | None:
    """GET a Zillow CSV as text. None on any failure (never raises)."""
    try:
        resp = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=HTTP_TIMEOUT)
        if resp.status_code != 200:
            log.warning("GET %s -> %s", url, resp.status_code)
            return None
        return resp.text
    except requests.RequestException as exc:
        log.warning("GET failed: %s", exc)
        return None


# ── Dataset assembly + serialization ──────────────────────────────────────────

def build_dataset(zhvi_text: str | None, zori_text: str | None, metro: str,
                  vitals_texts: dict[str, str | None] | None = None) -> dict:
    """The committed JSON shape the site + brief read.

    `vitals_texts` maps each VITALS key to its fetched CSV text; a missing or
    None entry degrades that one metric to empty rather than failing the run."""
    home_value = build_metric(
        zhvi_text or "",
        "ZHVI (typical home value, all homes, smoothed & seasonally adjusted)",
        metro,
    )
    rent = build_metric(
        zori_text or "",
        "ZORI (typical asking rent, all homes + multifamily, smoothed)",
        metro,
    )
    vitals_texts = vitals_texts or {}
    market_vitals = {
        key: build_vitals_metric(vitals_texts.get(key) or "", label, unit, metro,
                                 decimals, scale)
        for key, label, unit, _subdir, _file, decimals, scale in VITALS
    }
    return {
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
        "source": "Zillow Research (ZHVI, ZORI, and market-vitals metrics), metro level",
        "source_urls": {
            "zhvi": ZHVI_URL,
            "zori": ZORI_URL,
            **{key: vitals_url(subdir, filename)
               for key, _label, _unit, subdir, filename, _dec, _scale in VITALS},
        },
        "metro": metro,
        "home_value": home_value,
        "rent": rent,
        "market_vitals": market_vitals,
    }


def to_json(dataset: dict) -> str:
    return json.dumps(dataset, indent=2, ensure_ascii=False)


# ── Rendering + CLI ───────────────────────────────────────────────────────────

def _fmt_pct(v: object) -> str:
    return f"{v:+.1f}%" if isinstance(v, (int, float)) else "n/a"


def _render_metric(block: dict, unit: str) -> list[str]:
    g = block.get("greenville") or {}
    n = block.get("national") or {}
    return [
        f"{block.get('metric')}",
        f"  latest month: {block.get('latest_month')}",
        f"  Greenville: {unit}{g.get('latest', '?'):,}  "
        f"MoM {_fmt_pct(g.get('mom_pct'))}  YoY {_fmt_pct(g.get('yoy_pct'))}",
        f"  National:   {unit}{n.get('latest', '?'):,}  "
        f"MoM {_fmt_pct(n.get('mom_pct'))}  YoY {_fmt_pct(n.get('yoy_pct'))}",
    ]


def _render_vitals(vitals: dict) -> list[str]:
    lines = ["MARKET VITALS (buyer/seller leverage, Greenville vs national)"]
    for block in vitals.values():
        g = block.get("greenville") or {}
        n = block.get("national") or {}
        sfx = "%" if block.get("unit") == "percent" else ""
        lines.append(
            f"  {block.get('metric')} [{block.get('latest_month')}]"
        )
        lines.append(
            f"    Greenville: {g.get('latest')}{sfx}  "
            f"(a year ago {g.get('prior_year')}{sfx}, YoY {_fmt_pct(g.get('yoy_pct'))})  |  "
            f"National: {n.get('latest')}{sfx}"
        )
    return lines


def render_summary(dataset: dict) -> str:
    lines = [
        "GREENVILLE RESIDENTIAL PULSE",
        f"Collected {dataset.get('generated_at')}",
        f"Metro: {dataset.get('metro')}",
        "",
    ]
    lines += _render_metric(dataset.get("home_value", {}), "$")
    lines.append("")
    lines += _render_metric(dataset.get("rent", {}), "$")
    lines.append("")
    lines += _render_vitals(dataset.get("market_vitals", {}))
    return "\n".join(lines)


def main() -> int:
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):  # pragma: no cover
        pass

    p = argparse.ArgumentParser(description="Collect the Greenville residential market pulse (Zillow)")
    p.add_argument("--metro", default=METRO_DEFAULT, help=f'Zillow RegionName (default "{METRO_DEFAULT}")')
    p.add_argument("--json-out", metavar="PATH", help="write the dataset JSON here")
    p.add_argument("--from-json", metavar="PATH", help="replay a saved dataset, no network")
    args = p.parse_args()

    if args.from_json:
        from pathlib import Path
        dataset = json.loads(Path(args.from_json).read_text(encoding="utf-8"))
    else:
        zhvi = fetch_csv(ZHVI_URL)
        zori = fetch_csv(ZORI_URL)
        vitals_texts = {
            key: fetch_csv(vitals_url(subdir, filename))
            for key, _label, _unit, subdir, filename, _dec, _scale in VITALS
        }
        dataset = build_dataset(zhvi, zori, args.metro, vitals_texts)

    if args.json_out:
        from pathlib import Path
        Path(args.json_out).write_text(to_json(dataset), encoding="utf-8")
        log.info("Wrote %s residential pulse to %s", dataset.get("metro"), args.json_out)

    print("\n" + "=" * 70)
    print(render_summary(dataset))
    print("=" * 70)
    return 0


if __name__ == "__main__":
    sys.exit(main())
