#!/usr/bin/env python3
"""
Upstate Multiplier — Greenville County Market Signal Monitor
=============================================================
Scrapes municipal data sources and pushes "Golden Records" to Supabase.

Usage:
    python gvl_monitor.py --demo                # Generate + push mock signals
    python gvl_monitor.py --demo --count 10     # Generate 10 mock signals
    python gvl_monitor.py --scrape deeds        # Scrape GVL Register of Deeds
    python gvl_monitor.py --scrape sos          # Scrape SC SOS business filings
    python gvl_monitor.py --scrape all          # Scrape all sources
    python gvl_monitor.py --demo --dry-run      # Print without pushing to DB

Setup:
    pip install -r requirements.txt
    cp ../.env.local .env   # or set SUPABASE_URL + SUPABASE_SERVICE_KEY in shell
"""

import os
import sys
import json
import random
import argparse
from datetime import datetime, timezone, timedelta
from dataclasses import dataclass, asdict
from typing import Optional

from pathlib import Path
from dotenv import load_dotenv

# Load .env.local from project root regardless of where the script is run from
load_dotenv(Path(__file__).parent.parent / '.env.local')

# ── Supabase setup ──────────────────────────────────────────────────────────

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")  # service key for server writes

_supabase = None


def get_supabase():
    global _supabase
    if _supabase is None:
        if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
            return None
        from supabase import create_client
        _supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    return _supabase


# ── Data model ───────────────────────────────────────────────────────────────

@dataclass
class MarketSignal:
    timestamp: str            # ISO 8601 with timezone
    event_type: str           # PROPERTY TRANSFER | NEW BUSINESS FILING | INDUSTRIAL PERMIT
    location: str             # street address or entity name for filings
    entity_name: str          # cleaned/resolved company or owner name
    valuation: Optional[float]
    details: str              # human-readable context line
    score: int                # 0–100 lead priority
    tag: str                  # HOT | WARM | COLD
    source: str               # deeds | sos | permits | demo


# ── Fuzzy entity deduplication ───────────────────────────────────────────────

_entity_cache: list[str] = []


def normalize_entity(raw: str) -> str:
    """
    Collapse variant spellings: 'ABC LLC' → 'ABC, LLC' → 'ABC'.
    Populates a cache so subsequent calls can match against seen entities.
    """
    try:
        from thefuzz import fuzz, process
    except ImportError:
        return raw

    if _entity_cache:
        result = process.extractOne(raw, _entity_cache, scorer=fuzz.token_sort_ratio)
        if result and result[1] >= 85:
            return result[0]

    _entity_cache.append(raw)
    return raw


# ── Scoring ──────────────────────────────────────────────────────────────────

def score_signal(event_type: str, valuation: Optional[float]) -> tuple[int, str]:
    """Return (score 0-100, tag HOT|WARM|COLD)."""
    base = {
        "PROPERTY TRANSFER":    78,
        "NEW BUSINESS FILING":  72,
        "INDUSTRIAL PERMIT":    68,
    }.get(event_type, 55)

    if valuation:
        if valuation >= 500_000:   base = min(100, base + 18)
        elif valuation >= 200_000: base = min(100, base + 10)
        elif valuation >= 75_000:  base = min(100, base + 5)

    tag = "HOT" if base >= 85 else "WARM" if base >= 68 else "COLD"
    return base, tag


# ── Demo / seed data ─────────────────────────────────────────────────────────

_DEMO_TEMPLATES = [
    dict(
        event_type="PROPERTY TRANSFER",
        locations=[
            "7842 Augusta Rd, Greenville",
            "3310 Wade Hampton Blvd, Taylors",
            "1501 Woodruff Rd, Greenville",
            "4401 Pelham Rd, Greenville",
            "220 Roper Mountain Rd, Greenville",
            "900 S Main St, Greenville",
            "2601 E North St, Greenville",
        ],
        entities=[
            "Verdmont Properties LLC",
            "Upstate Realty Group LLC",
            "GVL Commercial Holdings",
            "Palmetto Asset Management LLC",
            "Taylors Commercial Partners",
        ],
        details=[
            "4,200 sqft commercial · New owner · No service contract on file",
            "Strip mall acquisition · 6 units · New management company",
            "Office park transfer · 12,000 sqft · Utilities included",
            "Industrial building sale · 8,500 sqft · Owner-occupied → leased",
            "Retail center · 3 anchor tenants · Recent vacancy on south wing",
        ],
        valuations=[185_000, 280_000, 450_000, 720_000, 1_200_000],
    ),
    dict(
        event_type="NEW BUSINESS FILING",
        locations=[
            "Greenville Logistics LLC",
            "Summit Facilities Group",
            "Carolina Facilities Partners",
            "Upstate Industrial Services",
            "Piedmont Mechanical LLC",
            "Blue Ridge Property Services",
        ],
        entities=[
            "Greenville Logistics LLC",
            "Summit Facilities Group",
            "Carolina Facilities Partners",
            "Upstate Industrial Services",
            "Piedmont Mechanical LLC",
        ],
        details=[
            "Industrial warehouse operator · HVAC & electrical contracts likely",
            "Property management company · 40+ units under management",
            "Commercial cleaning · Gov't contractor · RFP season approaching",
            "HVAC subcontractor · Licensed SC · Expansion into Greenville market",
            "Facilities maintenance firm · Multi-site commercial focus",
        ],
        valuations=[None],
    ),
    dict(
        event_type="INDUSTRIAL PERMIT",
        locations=[
            "1204 Laurens Rd, Simpsonville",
            "890 Haywood Rd, Greenville",
            "2310 Pleasantburg Dr, Greenville",
            "600 E McBee Ave, Greenville",
            "555 N Pleasantburg Dr, Greenville",
        ],
        entities=[
            "Greenville County Planning",
            "City of Greenville",
            "Simpsonville Planning Dept",
        ],
        details=[
            "Phase 2 renovation permit · $280K project scope",
            "New tenant build-out · Restaurant + retail · 6,000 sqft",
            "HVAC system replacement · $140K valuation · Commercial",
            "Electrical upgrade permit · 3-phase industrial install",
            "Roof + envelope replacement · Large commercial · Subcontractors needed",
        ],
        valuations=[95_000, 140_000, 280_000, 420_000, 680_000],
    ),
]


def generate_demo_signals(count: int = 5) -> list[MarketSignal]:
    signals = []
    now = datetime.now(timezone.utc)
    for i in range(count):
        t = random.choice(_DEMO_TEMPLATES)
        event_type = t["event_type"]
        location = random.choice(t["locations"])
        entity = normalize_entity(random.choice(t["entities"]))
        detail = random.choice(t["details"])
        non_null_vals = [v for v in t["valuations"] if v is not None]
        valuation = random.choice(non_null_vals) if non_null_vals and random.random() > 0.3 else None
        score, tag = score_signal(event_type, valuation)
        ts = now - timedelta(minutes=random.randint(i * 8, i * 25 + 5))
        signals.append(MarketSignal(
            timestamp=ts.isoformat(),
            event_type=event_type,
            location=location,
            entity_name=entity,
            valuation=valuation,
            detail=detail,
            score=score,
            tag=tag,
            source="demo",
        ))
    return sorted(signals, key=lambda s: s.timestamp, reverse=True)


# ── Real scrapers — fill in selectors after inspecting the live pages ────────

def scrape_greenville_deeds() -> list[MarketSignal]:
    """
    Greenville County Register of Deeds — Recent Recordings
    Homepage: https://www.greenvillecounty.org/rod/

    TODO:
    1. Open the site in a browser and locate the "Recent Recordings" or
       document search page.
    2. Inspect the table/rows with DevTools to get the correct CSS selectors.
    3. Replace the placeholder comments below with real selectors.

    Expected fields per row:
        grantor, grantee, legal description, book/page, recorded date, consideration
    """
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("  playwright not installed. Run: pip install playwright && playwright install chromium")
        return []

    signals: list[MarketSignal] = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        pg = browser.new_page()
        # ── TODO: Replace with real URL and selectors ──────────────────────
        # pg.goto("https://www.greenvillecounty.org/rod/SearchResults.aspx?...")
        # rows = pg.query_selector_all("tr.rod-row")  # adjust selector
        # for row in rows:
        #     grantee   = row.query_selector(".grantee-cell").inner_text().strip()
        #     address   = row.query_selector(".address-cell").inner_text().strip()
        #     consider  = row.query_selector(".consideration").inner_text().strip()
        #     rec_date  = row.query_selector(".recorded-date").inner_text().strip()
        #     valuation = float(consider.replace("$","").replace(",","")) if consider else None
        #     score, tag = score_signal("PROPERTY TRANSFER", valuation)
        #     signals.append(MarketSignal(
        #         timestamp=datetime.now(timezone.utc).isoformat(),
        #         event_type="PROPERTY TRANSFER",
        #         location=address,
        #         entity_name=normalize_entity(grantee),
        #         valuation=valuation,
        #         detail=f"Property transfer recorded {rec_date}",
        #         score=score, tag=tag, source="deeds",
        #     ))
        # ────────────────────────────────────────────────────────────────────
        browser.close()

    return signals


def scrape_sc_sos_filings() -> list[MarketSignal]:
    """
    South Carolina Secretary of State — New Business Filings
    Portal: https://businessfilings.sc.gov/

    TODO:
    1. Find the "search by county" or "recent filings" endpoint.
    2. Filter to Greenville County, entity type = LLC/Corp.
    3. Replace placeholder below with real request + selectors.

    Expected fields: entity_name, registered_agent, filing_date, entity_type, county
    """
    try:
        import requests
        from bs4 import BeautifulSoup
    except ImportError:
        print("  requests/beautifulsoup4 not installed.")
        return []

    signals: list[MarketSignal] = []
    # ── TODO: Replace with real URL and parsing logic ──────────────────────
    # response = requests.get("https://businessfilings.sc.gov/search?county=Greenville&...")
    # soup = BeautifulSoup(response.text, "html.parser")
    # rows = soup.select("table.results-table tr")
    # for row in rows[1:]:  # skip header
    #     cols = row.find_all("td")
    #     if len(cols) < 4: continue
    #     entity_name  = cols[0].get_text(strip=True)
    #     filing_date  = cols[1].get_text(strip=True)
    #     entity_type  = cols[2].get_text(strip=True)
    #     score, tag = score_signal("NEW BUSINESS FILING", None)
    #     signals.append(MarketSignal(
    #         timestamp=datetime.now(timezone.utc).isoformat(),
    #         event_type="NEW BUSINESS FILING",
    #         location=entity_name,
    #         entity_name=normalize_entity(entity_name),
    #         valuation=None,
    #         detail=f"{entity_type} · Filed {filing_date} · Greenville County",
    #         score=score, tag=tag, source="sos",
    #     ))
    # ────────────────────────────────────────────────────────────────────────
    return signals


# ── Supabase push ─────────────────────────────────────────────────────────────

def push_to_supabase(signals: list[MarketSignal]) -> None:
    client = get_supabase()
    if not client:
        print("  ⚠  Supabase not configured — set SUPABASE_URL + SUPABASE_SERVICE_KEY in .env")
        return
    rows = [asdict(s) for s in signals]
    result = client.table("market_signals").insert(rows).execute()
    pushed = len(result.data) if result.data else 0
    print(f"  ✓  Pushed {pushed} signal(s) to market_signals")


# ── CLI ──────────────────────────────────────────────────────────────────────

def print_signals(signals: list[MarketSignal]) -> None:
    for s in signals:
        val = f"${s.valuation:,.0f}" if s.valuation else "—"
        tag_marker = {"HOT": "🔴", "WARM": "🟡", "COLD": "⚪"}.get(s.tag, "·")
        print(f"  {tag_marker} [{s.tag}] {s.event_type}  score={s.score}")
        print(f"      Location:  {s.location}")
        print(f"      Entity:    {s.entity_name}")
        print(f"      Detail:    {s.details}")
        print(f"      Valuation: {val}")
        print()


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Upstate Multiplier — GVL Market Signal Monitor"
    )
    parser.add_argument("--demo", action="store_true",
                        help="Generate and push realistic mock signals")
    parser.add_argument("--scrape", choices=["deeds", "sos", "all"],
                        help="Scrape live municipal data sources")
    parser.add_argument("--count", type=int, default=5,
                        help="Number of demo signals to generate (default: 5)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Print signals without writing to Supabase")
    args = parser.parse_args()

    if not args.demo and not args.scrape:
        parser.print_help()
        return

    signals: list[MarketSignal] = []

    if args.demo:
        print(f"Generating {args.count} demo signals...")
        signals = generate_demo_signals(args.count)

    if args.scrape:
        if args.scrape in ("deeds", "all"):
            print("Scraping Greenville County Register of Deeds...")
            signals += scrape_greenville_deeds()
        if args.scrape in ("sos", "all"):
            print("Scraping SC Secretary of State filings...")
            signals += scrape_sc_sos_filings()

    if not signals:
        print("No signals produced. Check scraper stubs or use --demo.")
        return

    print(f"\n── {len(signals)} signal(s) ──────────────────────────────────\n")
    print_signals(signals)

    if args.dry_run:
        print("Dry run — not writing to Supabase.")
    else:
        push_to_supabase(signals)


if __name__ == "__main__":
    main()
