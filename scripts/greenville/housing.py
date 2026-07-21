"""
housing.py — Greenville residential market pulse (Zillow Research).

A data collector, sibling to greenville/commercial.py. Where commercial.py pulls
the county's commercial DEED records (which lag ~4 months), this one pulls the
Greenville, SC metro's RESIDENTIAL pulse from Zillow Research: typical home value
(ZHVI) and typical asking rent (ZORI), each alongside the national figure so the
brief can read the Upstate against the country. No scraper, no key, no paid API.
Zillow publishes these as free public CSVs, refreshed monthly (about a three-week
lag), which is genuinely current for a weekly brief. The committed JSON is read by
the Upstate Brief engine (the residential-pulse section) and can back a site tool.

Sources (confirmed reachable + Greenville-covering July 2026):
  ZHVI metro: files.zillowstatic.com/.../Metro_zhvi_uc_sfrcondo_tier_..._month.csv
  ZORI metro: files.zillowstatic.com/.../Metro_zori_uc_sfrcondomfr_sm_month.csv
Both share one schema: RegionID, SizeRank, RegionName, RegionType, StateName, then
one column per month (YYYY-MM-DD). We key on RegionName: "Greenville, SC" (an msa
row) and "United States" (the country row).

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

def build_dataset(zhvi_text: str | None, zori_text: str | None, metro: str) -> dict:
    """The committed JSON shape the site + brief read."""
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
    return {
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
        "source": "Zillow Research (ZHVI, ZORI), metro level",
        "source_urls": {"zhvi": ZHVI_URL, "zori": ZORI_URL},
        "metro": metro,
        "home_value": home_value,
        "rent": rent,
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
        dataset = build_dataset(zhvi, zori, args.metro)

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
