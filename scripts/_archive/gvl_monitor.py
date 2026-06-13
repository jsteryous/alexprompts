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
    python gvl_monitor.py --scrape all --days 14  # Look back 14 days (default: 7)
    python gvl_monitor.py --demo --dry-run      # Print without pushing to DB
    python gvl_monitor.py --scrape deeds --debug  # Save raw HTML for selector tuning

Setup:
    pip install -r requirements.txt
    playwright install chromium   # one-time, ~130MB
    cp ../.env.local .env   # or set SUPABASE_URL + SUPABASE_SERVICE_KEY in shell
"""

import logging
import os
import re
import sys
import json
import time
import random
import argparse

# Windows console may default to cp1252 which can't encode ✓/✗ etc.
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
from datetime import datetime, timezone, timedelta
from dataclasses import dataclass, asdict
from typing import Optional

from pathlib import Path
from dotenv import load_dotenv
from tenacity import retry, stop_after_attempt, wait_exponential, before_sleep_log
from lib.db_models import MarketSignalRow
from enrich_models import extract_best_property_address

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)s  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
_log = logging.getLogger(__name__)

# Load .env.local from project root regardless of where the script is run from
load_dotenv(Path(__file__).parent.parent / '.env.local')

# ── Supabase setup ──────────────────────────────────────────────────────────

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")  # service key for server writes

# ── GovOS credentials (deed scraper — greenville.sc.publicsearch.us) ──────────
ROD_EMAIL    = os.environ.get("ROD_EMAIL")
ROD_PASSWORD = os.environ.get("ROD_PASSWORD")

# ── CountyWeb viewer credentials (mortgage monitor — viewer.greenvillecounty.org) ──
# This is the standard county ROD viewer, NOT the GovOS deed portal.
# ROD_PASSWORD is shared between both portals.
ROD_VIEWER_URL      = "https://viewer.greenvillecounty.org/countyweb"
ROD_VIEWER_USERNAME = os.environ.get("ROD_VIEWER_USERNAME", "asteryous")

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
    event_type: str           # PROPERTY TRANSFER | NEW BUSINESS FILING | INDUSTRIAL PERMIT | MORTGAGE_FILING
    location: str             # street address or entity name for filings
    entity_name: str          # LLC or company name (raw — not yet unmasked)
    valuation: Optional[float]
    details: str              # human-readable context line
    score: int                # 0–100 lead priority
    tag: str                  # HOT | WARM | COLD
    source: str               # deeds | sos | permits | demo | mortgages
    source_url: Optional[str] = None   # URL to the source page
    status: Optional[str]     = None   # lead workflow status (optional)
    source_key: Optional[str] = None   # dedup key — unique per real-world event
    signal_type: Optional[str] = None  # MORTGAGE_FILING | None — tells enrich.py to prioritise OCR


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

def score_signal(
    event_type: str,
    valuation: Optional[float],
    *,
    is_construction: bool = False,
) -> tuple[int, str]:
    """Return (score 0-100, tag HOT|WARM|COLD).

    MORTGAGE_FILING base scores:
      MTG  = 82  (confirmed purchase financing — high intent)
      CON  = 88  (active build site — service contracts imminent)
    """
    base = {
        "PROPERTY TRANSFER":    78,
        "NEW BUSINESS FILING":  72,
        "INDUSTRIAL PERMIT":    68,
        "MORTGAGE_FILING":      82,
    }.get(event_type, 55)

    # Construction mortgages signal an active build — bump above standard MTG
    if event_type == "MORTGAGE_FILING" and is_construction:
        base = min(100, base + 6)   # → 88 base before valuation boost

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
            details=detail,
            score=score,
            tag=tag,
            source="demo",
        ))
    return sorted(signals, key=lambda s: s.timestamp, reverse=True)


# ── Real scrapers ─────────────────────────────────────────────────────────────

# Shared browser headers for requests-based calls
_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}

_DEBUG_DIR = Path(__file__).parent / "debug"


def _save_debug_html(name: str, html: str) -> None:
    """Save raw HTML to scripts/debug/ for selector inspection."""
    _DEBUG_DIR.mkdir(exist_ok=True)
    out = _DEBUG_DIR / f"{name}.html"
    out.write_text(html, encoding="utf-8")
    print(f"  [debug] saved {out}")


def _extract_address_from_govos_api(responses: list[dict]) -> Optional[str]:
    """
    Scan captured GovOS XHR/fetch JSON responses for a property/mailing address.
    GovOS may return structured fields like situsAddress, mailingAddress, propertyAddress,
    or nested objects. Returns the first non-empty address string found, or None.
    """
    _ADDR_KEYS = (
        "situsAddress", "situs_address", "propertyAddress", "property_address",
        "mailingAddress", "mailing_address", "address", "returnToAddress",
        "return_to_address", "location",
    )

    def _search(obj: object) -> Optional[str]:
        if isinstance(obj, dict):
            for key in _ADDR_KEYS:
                val = obj.get(key)
                if isinstance(val, str) and val.strip():
                    candidate = val.strip()
                    # Reject obvious non-addresses (single words, state/zip only, etc.)
                    if len(candidate) > 8 and re.search(r"\d", candidate):
                        return candidate
            for val in obj.values():
                result = _search(val)
                if result:
                    return result
        elif isinstance(obj, list):
            for item in obj:
                result = _search(item)
                if result:
                    return result
        return None

    for payload in responses:
        result = _search(payload)
        if result:
            return result
    return None


def _parse_govos_detail(html: str) -> tuple[Optional[float], Optional[str]]:
    """
    Extract consideration (sale price) and property address from a GovOS deed detail page.
    The search results table always returns N/A — the detail panel has the real numbers.

    Returns (dollar_amount_or_None, property_address_or_None).

    Example text: "Consideration: $494,500.00"
    Example address labels: "Property Address:", "Situs Address:", "Site Address:"
    """
    try:
        from bs4 import BeautifulSoup
    except ImportError:
        return None, None

    soup = BeautifulSoup(html, "html.parser")
    text = soup.get_text(" ", strip=True)
    structured_text = soup.get_text("\n", strip=True)

    # ── Loan / consideration amount ────────────────────────────────────────────
    # GovOS uses "Consideration" for deeds and may use "Loan Amount" /
    # "Principal Amount" / "Original Principal Amount" for mortgage docs.
    consideration: Optional[float] = None
    _AMOUNT_LABELS = (
        "consideration:",
        "loan amount:",
        "principal amount:",
        "original principal amount:",
        "amount:",
    )
    text_lower = text.lower()
    for _lbl in _AMOUNT_LABELS:
        idx = text_lower.find(_lbl)
        if idx != -1:
            snippet = text[idx + len(_lbl): idx + len(_lbl) + 60]
            m = re.search(r"\$([\d,]+(?:\.\d{2})?)", snippet)
            if m:
                try:
                    consideration = float(m.group(1).replace(",", ""))
                    break
                except ValueError:
                    pass

    # ── Property / situs address ───────────────────────────────────────────────
    property_address = (
        extract_best_property_address(structured_text)
        or extract_best_property_address(text)
    )

    return consideration, property_address


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=15, max=120),
    before_sleep=before_sleep_log(_log, logging.WARNING),
    reraise=True,
)
def scrape_greenville_deeds(days_back: int = 7, debug: bool = False) -> list[MarketSignal]:
    """
    Greenville County Register of Deeds — Recent Deed Recordings.

    Uses the GovOS public portal (greenville.sc.publicsearch.us) — free,
    no login required, Playwright needed because the HTMX app 403s raw requests.

    Note: the legacy rod.greenvillecounty.org system requires a registered
    account (free to create — store ROD_USERNAME / ROD_PASSWORD in .env.local
    and switch to it if the GovOS portal becomes unreliable).

    First-run tuning:
      Run with --debug to save the raw HTML to scripts/debug/govos_*.html.
      Inspect those files to verify or adjust selectors below.
    """
    try:
        from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError
        from bs4 import BeautifulSoup
    except ImportError:
        print("  playwright / beautifulsoup4 not installed.")
        return []

    signals: list[MarketSignal] = []
    now        = datetime.now(timezone.utc)
    start_date = (now - timedelta(days=days_back)).strftime("%m/%d/%Y")
    end_date   = now.strftime("%m/%d/%Y")

    GOVOS_URL = "https://greenville.sc.publicsearch.us"

    if not ROD_EMAIL or not ROD_PASSWORD:
        print(
            "  ROD: ROD_EMAIL / ROD_PASSWORD not set in .env.local\n"
            "       Register a free account at https://greenville.sc.publicsearch.us/register\n"
            "       then add to .env.local:\n"
            "         ROD_EMAIL=your@email.com\n"
            "         ROD_PASSWORD=yourpassword"
        )
        return signals

    GOVOS_SIGNIN = f"{GOVOS_URL}/signin"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page    = browser.new_page()
        try:
            # ── Step 1: Sign in ──────────────────────────────────────────
            print(f"  ROD: signing in to GovOS portal...")
            page.goto(GOVOS_SIGNIN, timeout=30_000)
            page.wait_for_load_state("domcontentloaded", timeout=20_000)
            page.wait_for_timeout(1_000)

            if debug:
                _save_debug_html("govos_signin", page.content())

            # Fill email + password — field is type="text" not type="email"
            page.fill("#email", ROD_EMAIL)
            page.fill("#password", ROD_PASSWORD)

            # Form uses hx-boost (HTMX) — submit triggers an AJAX POST + HX-Redirect header,
            # NOT a standard browser navigation. Wait for URL to change away from /signin.
            page.click("button.CallToAction[type='submit']")
            try:
                page.wait_for_url(lambda url: "/signin" not in url, timeout=15_000)
            except PlaywrightTimeoutError:
                pass  # timeout — will check URL below
            page.wait_for_load_state("domcontentloaded", timeout=10_000)
            page.wait_for_timeout(1_000)

            current_url = page.url
            if "/signin" in current_url:
                print(f"  ROD: sign-in failed — still on signin page. Check ROD_EMAIL/ROD_PASSWORD in .env.local")
                if debug:
                    _save_debug_html("govos_after_signin", page.content())
                browser.close()
                return signals

            print(f"  ROD: signed in — {current_url}")
            # React search app is already loaded on the landing page.
            # Do NOT navigate — interacting with inputs that are already there.
            page.wait_for_timeout(1_500)   # let React fully hydrate

            if debug:
                _save_debug_html("govos_after_signin", page.content())

            # ── Step 2: Set start date ────────────────────────────────────
            # React datepicker: triple-click to select all, then type new date.
            start_input = page.locator("input[aria-label='Starting Recorded Date']")
            start_input.click()
            start_input.press("Control+a")
            start_input.press_sequentially(start_date, delay=40)
            start_input.press("Tab")
            page.wait_for_timeout(500)

            # ── Step 3: Submit search ─────────────────────────────────────
            page.click("[data-testid='searchSubmitButton']")
            page.wait_for_load_state("networkidle", timeout=20_000)
            page.wait_for_timeout(1_500)

            html = page.content()
            if debug:
                _save_debug_html("govos_results", html)

            # ── Phase A: identify qualifying deed rows (static parse) ─────
            # GovOS table columns (0-indexed):
            #   0-2: checkbox/icons  3: doc#  4: book  5: page
            #   6: recorded date  7: doc type  8: grantor  9: grantee
            #   10: consideration  11: extra
            soup = BeautifulSoup(html, "html.parser")
            static_rows = soup.select("tr.is-uncertified, tr.is-certified")
            print(f"  ROD: {len(static_rows)} result row(s) found...")

            _DEED_TYPES = {"DEED", "DEED OF TRUST", "WARRANTY DEED", "QUIT CLAIM"}
            deed_data = []   # (row_index, doc_type, grantor, grantee, rec_date, consid)
            for i, row in enumerate(static_rows):
                cells = [td.get_text(" ", strip=True) for td in row.find_all("td")]
                if len(cells) < 10:
                    continue
                if cells[7] not in _DEED_TYPES:
                    continue
                if not cells[9]:
                    continue
                deed_data.append((i, cells[7], cells[8], cells[9], cells[6], cells[10]))

            print(f"  ROD: {len(deed_data)} qualifying deed(s) — fetching property addresses...")

            # ── Phase B: click each deed row to get consideration + address ──────
            # The search results table always shows N/A for consideration —
            # the individual deed detail page has the real sale price.
            # Also attempt to parse a property/situs address from the detail page.
            consid_map:  dict[int, Optional[float]] = {}
            address_map: dict[int, Optional[str]]   = {}
            rows_locator = page.locator("tr.is-uncertified, tr.is-certified")

            for pos, (row_idx, doc_type, grantor, grantee, rec_date, _) in enumerate(deed_data):
                try:
                    # ── Network interception: find document image URL ──────────
                    # GovOS is a React SPA; structured address data is NOT in the
                    # rendered HTML or any JSON XHR. The deed is a scanned image.
                    # Capture all network requests to find the image URL pattern,
                    # then OCR page 1 for the "Return To:" grantee mailing address.
                    captured_api: list[dict] = []   # JSON responses (kept for _extract_address_from_govos_api fallback)
                    captured_urls: list[str] = []   # all response URLs for debug + image detection

                    def _on_response(resp, _api=captured_api, _urls=captured_urls):
                        _urls.append(resp.url)
                        ct = resp.headers.get("content-type", "")
                        if "json" not in ct:
                            return
                        try:
                            body = resp.json()
                            _api.append({"url": resp.url, "body": body})
                        except Exception:
                            pass

                    page.on("response", _on_response)

                    rows_locator.nth(row_idx).click()
                    page.wait_for_load_state("networkidle", timeout=8_000)
                    page.wait_for_timeout(800)

                    page.remove_listener("response", _on_response)

                    # Save full URL log + JSON payloads in debug mode
                    if debug:
                        _DEBUG_DIR.mkdir(exist_ok=True)
                        urls_out = _DEBUG_DIR / f"govos_network_{pos}.txt"
                        urls_out.write_text("\n".join(captured_urls), encoding="utf-8")
                        print(f"  [debug] saved {urls_out} ({len(captured_urls)} request(s))")
                        if captured_api:
                            api_out = _DEBUG_DIR / f"govos_api_responses_{pos}.json"
                            api_out.write_text(
                                json.dumps(captured_api, indent=2, default=str),
                                encoding="utf-8",
                            )
                            print(f"  [debug] saved {api_out} ({len(captured_api)} JSON response(s))")

                    # Try structured address from API responses first; fall back to HTML parse
                    api_addr = _extract_address_from_govos_api(
                        [r["body"] for r in captured_api]
                    )

                    detail_html = page.content()
                    if debug:
                        _save_debug_html(f"govos_detail_{pos}", detail_html)

                    amount, html_addr = _parse_govos_detail(detail_html)
                    prop_addr = api_addr or html_addr
                    consid_map[row_idx]  = amount
                    address_map[row_idx] = prop_addr
                    if amount:
                        print(f"    ✓ {grantee[:30]}: ${amount:,.0f}" +
                              (f"  @ {prop_addr}" if prop_addr else ""))
                    else:
                        print(f"    · {grantee[:30]}: consideration not disclosed" +
                              (f"  @ {prop_addr}" if prop_addr else ""))

                    # Try to dismiss detail pane; if SPA navigated away, go back
                    try:
                        page.keyboard.press("Escape")
                        page.wait_for_timeout(400)
                    except Exception as _e_esc:
                        print(f"    · Escape key failed (non-fatal): {_e_esc}")
                    if rows_locator.count() == 0:
                        page.go_back()
                        page.wait_for_load_state("networkidle", timeout=10_000)
                        page.wait_for_timeout(1_000)

                except Exception as e:
                    print(f"    ✗ row {row_idx}: {e}")
                    consid_map[row_idx] = None

                # Randomised delay — don't look like a bot
                if pos < len(deed_data) - 1:
                    page.wait_for_timeout(random.randint(3_000, 5_000))

        except Exception as e:
            _log.error("ROD: browser error — %s", e)
            try:
                page.wait_for_timeout(500)
            except Exception:
                pass
            browser.close()
            raise  # re-raise so @retry can attempt again
        browser.close()

    # ── Phase C: build signals (LLC/corporate grantees only) ─────────────────
    _LLC_RE = re.compile(
        r"\b(LLC|INC|CORP|LTD|LP|LLP|HOLDINGS|PARTNERS|PROPERTIES|ASSOCIATES|"
        r"GROUP|DEVELOPMENT|ENTERPRISES|TRUST|FOUNDATION|VENTURES|CAPITAL|"
        r"INVESTMENTS|REALTY|MANAGEMENT|SERVICES|SOLUTIONS)\b",
        re.I,
    )
    skipped_individuals = 0
    for row_idx, doc_type, grantor, grantee, rec_date, _ in deed_data:
        # Skip individual homebuyers — only keep LLC/corporate grantees.
        # Individual purchases are not the target market; commercial LLC buyers are.
        if not _LLC_RE.search(grantee):
            skipped_individuals += 1
            continue

        # Use consideration from detail page (real price) over the search table (always N/A)
        raw_consideration = consid_map.get(row_idx)
        # Nominal transfers ($1, $5, $10 etc.) record a legally-valid but non-market
        # consideration — family transfers, trusts, estate restructuring. Null the
        # valuation so score/dashboard aren't misled, but keep the raw amount in
        # details and flag via signal_type so the dashboard can surface these separately.
        is_nominal = raw_consideration is not None and raw_consideration < 1_000
        valuation  = None if is_nominal else raw_consideration

        # Use parsed property address when available; fall back to grantor name as context.
        # enrich.py will further resolve the location via GIS if it's still a name.
        prop_addr  = address_map.get(row_idx)
        location   = prop_addr or grantor or grantee

        score, tag = score_signal("PROPERTY TRANSFER", valuation)
        signals.append(MarketSignal(
            timestamp=datetime.now(timezone.utc).isoformat(),
            event_type="PROPERTY TRANSFER",
            location=location,
            entity_name=normalize_entity(grantee),
            valuation=valuation,
            details=(
                f"Nominal deed · ${raw_consideration:,.2f} consideration · {doc_type} · recorded {rec_date}"
                if is_nominal else
                f"Deed recording · {doc_type} · recorded {rec_date}"
            ),
            score=score,
            tag=tag,
            source="deeds",
            source_url=GOVOS_URL,
            source_key=f"deeds:{grantee.strip().upper()}:{rec_date}",
            signal_type="NOMINAL_TRANSFER" if is_nominal else None,
        ))

    print(f"  ROD: {len(signals)} LLC/commercial deed(s) kept · {skipped_individuals} individual(s) skipped")
    return signals


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=15, max=120),
    before_sleep=before_sleep_log(_log, logging.WARNING),
    reraise=True,
)
def scrape_greenville_mortgages(days_back: int = 7, debug: bool = False) -> list[MarketSignal]:
    """
    Greenville County ROD CountyWeb viewer — Recent Mortgage Filings.

    Portal: viewer.greenvillecounty.org (standard county ROD viewer)
    NOT the GovOS portal used by the deed scraper.

    Credentials:
      ROD_VIEWER_USERNAME (env var, default: "asteryous")
      ROD_PASSWORD        (env var, shared with GovOS deed scraper)

    Navigation (nested iframe architecture):
      login → bodyframe → disclaimer → searchMain.do
      → dynSearchFrame → criteriaframe → executeSearch()
      → resultListFrame

    Search strategy: date-range only (no entity name) — returns all filings
    in the window, then filters rows for MTG / CON doc types.

    In CountyWeb results, for mortgage documents:
      Grantor = BORROWER (the LLC pledging property — who we want)
      Grantee = LENDER   (bank / financial institution)

    Signals are inserted with:
      event_type  = "MORTGAGE_FILING"
      signal_type = "MORTGAGE_FILING"  ← tells enrich.py to prioritise OCR
      source      = "mortgages"

    Field numbers for Greenville CountyWeb datagrid (verified from mtg_cw_08_results.html):
      field 3  = instrument number
      field 4  = book   field 5 = page
      field 6  = recording date   field 7 = doc type (confirmed)
      field 9  = grantor (borrower)   field 11 = grantee (lender)
      consideration is not present in the results table — always blank.
    """
    try:
        from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError
        from bs4 import BeautifulSoup
    except ImportError:
        print("  playwright / beautifulsoup4 not installed.")
        return []

    signals: list[MarketSignal] = []
    now        = datetime.now(timezone.utc)
    start_date = (now - timedelta(days=days_back)).strftime("%m/%d/%Y")
    end_date   = now.strftime("%m/%d/%Y")

    if not ROD_PASSWORD:
        print("  MTG: ROD_PASSWORD not set in .env.local")
        return signals

    # CountyWeb may spell out or abbreviate doc types — match both
    _MTG_TYPES_CW = {"MORTGAGE", "MTG", "CONSTRUCTION MORTGAGE", "CONSTRUCTION LOAN", "CON"}

    _LLC_RE = re.compile(
        r"\b(LLC|INC|CORP|LTD|LP|LLP|HOLDINGS|PARTNERS|PROPERTIES|ASSOCIATES|"
        r"GROUP|DEVELOPMENT|ENTERPRISES|TRUST|FOUNDATION|VENTURES|CAPITAL|"
        r"INVESTMENTS|REALTY|MANAGEMENT|SERVICES|SOLUTIONS)\b",
        re.I,
    )

    # (row_idx, doc_type, borrower, lender, rec_date, consideration)
    mtg_data: list[tuple] = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page    = browser.new_page()
        try:
            # ── Step 1: Log in ────────────────────────────────────────────
            login_url = f"{ROD_VIEWER_URL}/loginDisplay.action?countyname=Greenville"
            print(f"  MTG: logging in to CountyWeb ({ROD_VIEWER_URL})...")
            page.goto(login_url, timeout=30_000)
            page.wait_for_load_state("domcontentloaded", timeout=15_000)
            page.wait_for_timeout(800)

            if debug:
                _save_debug_html("mtg_cw_01_login", page.content())

            page.fill("input[name='username']", ROD_VIEWER_USERNAME)
            page.fill("input[name='password']", ROD_PASSWORD)
            # Login button has no type attribute — call doLogin() directly
            # to avoid a selector timeout on button[type='submit'].
            page.evaluate("doLogin()")
            page.wait_for_load_state("domcontentloaded", timeout=15_000)
            page.wait_for_timeout(2_000)

            if "login" in page.url.lower():
                print("  MTG: sign-in failed — check ROD_VIEWER_USERNAME/ROD_PASSWORD in .env.local")
                if debug:
                    _save_debug_html("mtg_cw_01b_login_fail", page.content())
                browser.close()
                return signals

            print(f"  MTG: signed in → {page.url}")

            if debug:
                _save_debug_html("mtg_cw_02_after_login", page.content())

            # ── Step 2: Accept disclaimer in bodyframe ────────────────────
            # After login the bodyframe loads disclaimer.jsp.
            page.wait_for_timeout(2_000)
            frame = page.frame(name="bodyframe")
            if frame is None:
                print("  MTG: bodyframe not found after login")
                browser.close()
                return signals

            if debug:
                _save_debug_html("mtg_cw_03_bodyframe", frame.content())

            if frame.locator("input[name='accept']").count() > 0:
                frame.click("input[name='accept']")
                page.wait_for_load_state("domcontentloaded", timeout=15_000)
                page.wait_for_timeout(2_000)
                frame = page.frame(name="bodyframe")
                if frame is None:
                    print("  MTG: bodyframe lost after disclaimer accept")
                    browser.close()
                    return signals

            if debug:
                _save_debug_html("mtg_cw_04_after_disclaimer", frame.content())
            print(f"  MTG: bodyframe → {frame.url}")

            # ── Step 3: Navigate bodyframe to search page ─────────────────
            # frame.goto() returns 404 — must click the outer nav link
            # (target="bodyframe") to keep the session bound correctly.
            nav_link = page.locator("a[href*='searchMain.do']")
            if nav_link.count() > 0:
                nav_link.first.click()
            else:
                page.evaluate(
                    "window.frames['bodyframe'].location = "
                    "'/countyweb/search/searchMain.do?defaultType=Public'"
                )

            page.wait_for_timeout(3_000)
            frame = page.frame(name="bodyframe")

            if debug and frame:
                _save_debug_html("mtg_cw_05_search_main", frame.content())

            # ── Step 4: Wait for criteriaframe (nested inside dynSearchFrame) ──
            # SearchMainView.jsp calls loadChildren() which navigates dynSearchFrame
            # → DynSearchCriteriaViewEnhanced.jsp → easyUI criteria panel.
            page.wait_for_timeout(2_500)
            cf = page.frame(name="criteriaframe")
            if cf is None:
                print("  MTG: criteriaframe not found — run with --debug to inspect")
                browser.close()
                return signals

            try:
                cf.wait_for_selector("#FROMDATE", timeout=10_000)
            except PlaywrightTimeoutError:
                pass  # may already be present

            if debug:
                _save_debug_html("mtg_cw_06_criteria", cf.content())
            print(f"  MTG: criteriaframe ready → {cf.url}")

            # ── Step 5: Set date range — no name filter (returns all filings) ──
            cf.evaluate(f"$('#FROMDATE').datebox('setValue', '{start_date}')")
            cf.evaluate(f"$('#TODATE').datebox('setValue', '{end_date}')")
            print(f"  MTG: date range {start_date} → {end_date} (last {days_back} day(s))")

            if debug:
                _save_debug_html("mtg_cw_07_form_filled", cf.content())

            # ── Step 6: Execute search ────────────────────────────────────
            cf.evaluate("executeSearch()")
            page.wait_for_timeout(5_000)

            # ── Step 7: Parse results from resultListFrame ────────────────
            results_frame = (
                page.frame(name="resultListFrame")
                or page.frame(name="resultFrame")
                or page.frame(name="searchFrame")
            )
            if results_frame is None:
                print("  MTG: results frame not found — run with --debug to inspect")
                browser.close()
                return signals

            try:
                results_frame.wait_for_load_state("domcontentloaded", timeout=15_000)
            except PlaywrightTimeoutError:
                pass

            results_html = results_frame.content()
            if debug:
                _save_debug_html("mtg_cw_08_results", results_html)
            print(f"  MTG: results frame → {results_frame.url}")

            results_text = BeautifulSoup(results_html, "html.parser").get_text(" ", strip=True)
            if "no record" in results_text.lower() or "0 record" in results_text.lower():
                print("  MTG: no records found for this date range")
                browser.close()
                return signals

            results_soup = BeautifulSoup(results_html, "html.parser")
            all_rows = results_soup.select("tr[datagrid-row-index]")
            print(f"  MTG: {len(all_rows)} result row(s) in search output...")

            for row in all_rows:
                # Build a field-number → text dict from every <td field="N"> cell
                cells: dict[str, str] = {
                    td.get("field", ""): td.get_text(" ", strip=True)
                    for td in row.find_all("td")
                }
                doc_type = cells.get("7", "").strip().upper()
                if doc_type not in _MTG_TYPES_CW:
                    continue

                row_idx  = int(row.get("datagrid-row-index", -1))

                # Verified field layout from mtg_cw_08_results.html:
                #   field 3  = instrument number
                #   field 4  = book   field 5 = page
                #   field 6  = recording date   field 7 = doc type
                #   field 9  = grantor (borrower)   field 11 = grantee (lender)
                #   consideration not present in results table — always blank
                borrower   = cells.get("9", "").strip()
                lender     = cells.get("11", "").strip()
                rec_date   = cells.get("6", "").strip()
                consid_raw = ""  # not available in results; will be blank

                # JS documentRowInfo fallback when cells are empty
                if not borrower:
                    m = re.search(
                        rf"documentRowInfo\[{row_idx}\]\.grantorName\s*=\s*[\"']([^\"']+)",
                        results_html,
                    )
                    if m:
                        borrower = m.group(1).strip()
                if not lender:
                    m = re.search(
                        rf"documentRowInfo\[{row_idx}\]\.granteeName\s*=\s*[\"']([^\"']+)",
                        results_html,
                    )
                    if m:
                        lender = m.group(1).strip()
                if not rec_date:
                    m = re.search(
                        rf"documentRowInfo\[{row_idx}\]\.recDate\s*=\s*[\"']([^\"']+)",
                        results_html,
                    )
                    if m:
                        rec_date = m.group(1).strip()

                # Parse consideration (may be "$500,000.00" or "500000.00" or blank)
                consideration: Optional[float] = None
                if consid_raw:
                    cm = re.search(r"[\d,]+(?:\.\d{2})?", consid_raw.replace("$", "").replace(",", ""))
                    if cm:
                        try:
                            consideration = float(cm.group(0))
                        except ValueError:
                            pass

                if borrower:
                    mtg_data.append((row_idx, doc_type, borrower, lender, rec_date, consideration))

        except Exception as e:
            _log.error("MTG: browser error — %s", e)
            try:
                page.wait_for_timeout(500)
            except Exception:
                pass
            browser.close()
            raise  # re-raise so @retry can attempt again
        browser.close()

    print(f"  MTG: {len(mtg_data)} qualifying mortgage(s) found...")

    # ── Build signals (LLC borrowers only) ────────────────────────────────────
    skipped_individuals = 0
    for row_idx, doc_type, borrower, lender, rec_date, consideration in mtg_data:
        # Skip individual homeowners — commercial LLC borrowers are the target
        if not _LLC_RE.search(borrower):
            skipped_individuals += 1
            continue

        is_construction = "CON" in doc_type.upper()
        score, tag = score_signal("MORTGAGE_FILING", consideration, is_construction=is_construction)

        # Location defaults to borrower name — enrich.py will resolve via GIS
        lender_label = lender[:40] if lender else "Unknown Lender"
        kind = "CON" if is_construction else "MTG"

        if consideration:
            print(f"    ✓ [{kind}] {borrower[:35]}: ${consideration:,.0f} · Lender: {lender_label[:25]}")
        else:
            print(f"    · [{kind}] {borrower[:35]}: amount not disclosed · Lender: {lender_label[:25]}")

        signals.append(MarketSignal(
            timestamp=datetime.now(timezone.utc).isoformat(),
            event_type="MORTGAGE_FILING",
            signal_type="MORTGAGE_FILING",
            location=borrower,    # enrich.py resolves to property address via GIS
            entity_name=normalize_entity(borrower),
            valuation=consideration,
            details=f"Mortgage filing · {doc_type} · recorded {rec_date} · Lender: {lender_label}",
            score=score,
            tag=tag,
            source="mortgages",
            source_url=ROD_VIEWER_URL,
            source_key=f"mtg:{borrower.strip().upper()}:{rec_date}",
        ))

    print(f"  MTG: {len(signals)} LLC mortgage(s) kept · {skipped_individuals} individual(s) skipped")
    return signals


def scrape_sc_sos_filings(days_back: int = 7, debug: bool = False) -> list[MarketSignal]:
    """
    SC Secretary of State — New Business Filings in Greenville County.

    The SOS search form (businessfilings.sc.gov) has a CAPTCHA — direct
    scraping is blocked.  Instead we use DuckDuckGo to surface recently-
    indexed SC SOS entity detail pages for Greenville County LLCs, then
    fetch each detail page directly (no CAPTCHA on detail URLs).

    Detail URL pattern: businessfilings.sc.gov/BusinessFiling/Entity/Details/{id}
    """
    try:
        import requests
        from bs4 import BeautifulSoup
    except ImportError:
        print("  requests/beautifulsoup4 not installed.")
        return []

    signals: list[MarketSignal] = []
    DDG_URL     = "https://html.duckduckgo.com/html/"
    SOS_PATTERN = re.compile(
        r"businessfilings\.sc\.gov/BusinessFiling/Entity/Details/(\w+)"
    )

    # Two queries — one broad, one county-specific
    queries = [
        'site:businessfilings.sc.gov "Greenville" LLC',
        'site:businessfilings.sc.gov "Greenville County" South Carolina',
    ]

    seen_ids: set[str] = set()
    entity_urls: list[str] = []

    for query in queries:
        try:
            resp = requests.post(
                DDG_URL,
                data={"q": query, "b": "", "kl": "us-en"},
                headers={**_HEADERS, "Content-Type": "application/x-www-form-urlencoded"},
                timeout=15,
            )
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "html.parser")

            if debug:
                _save_debug_html(f"sos_ddg_{query[:30].replace(' ','_')}", resp.text)

            for result in soup.select(".result"):
                url_el = result.select_one(".result__url, .result__a")
                if not url_el:
                    continue
                url_text = url_el.get_text(strip=True)
                m = SOS_PATTERN.search(url_text)
                if m:
                    eid = m.group(1)
                    if eid not in seen_ids:
                        seen_ids.add(eid)
                        full = f"https://businessfilings.sc.gov/BusinessFiling/Entity/Details/{eid}"
                        entity_urls.append(full)

            time.sleep(1.5)
        except Exception as e:
            print(f"  SOS: DDG search failed — {e}")

    print(f"  SOS: {len(entity_urls)} entity URL(s) found via DuckDuckGo")

    for url in entity_urls[:25]:   # cap at 25 per run
        try:
            resp = requests.get(url, headers=_HEADERS, timeout=15)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "html.parser")

            if debug:
                eid = url.split("/")[-1]
                _save_debug_html(f"sos_entity_{eid}", resp.text)

            # Entity name — try common heading patterns
            name = ""
            for sel in ["h1", ".entity-name", "h2", ".page-title"]:
                el = soup.select_one(sel)
                if el:
                    name = el.get_text(strip=True)
                    if name:
                        break

            if not name:
                # Fall back: find the page title
                title_el = soup.find("title")
                if title_el:
                    name = title_el.get_text(strip=True).split("|")[0].strip()

            if not name:
                continue

            # Only keep Greenville County filings
            page_text = soup.get_text(" ")
            if "greenville" not in page_text.lower():
                continue

            # Try to find filing date
            filing_date = ""
            for keyword in ("Date of Formation", "Filing Date", "Effective Date", "Registration Date"):
                idx = page_text.find(keyword)
                if idx != -1:
                    snippet = page_text[idx + len(keyword):idx + len(keyword) + 30].strip(" :·")
                    # grab the first date-like string
                    date_m = re.search(r"\d{1,2}/\d{1,2}/\d{4}", snippet)
                    if date_m:
                        filing_date = date_m.group(0)
                        break

            score, tag = score_signal("NEW BUSINESS FILING", None)
            details = f"SC SOS filing · Greenville County"
            if filing_date:
                details += f" · filed {filing_date}"

            signals.append(MarketSignal(
                timestamp=datetime.now(timezone.utc).isoformat(),
                event_type="NEW BUSINESS FILING",
                location=name,
                entity_name=normalize_entity(name),
                valuation=None,
                details=details,
                score=score,
                tag=tag,
                source="sos",
                source_url=url,
                source_key=url,
            ))
            time.sleep(0.75)  # polite delay

        except Exception as e:
            print(f"  SOS: failed to fetch {url} — {e}")

    print(f"  SOS: {len(signals)} Greenville filing(s) scraped")
    return signals


# ── Supabase push ─────────────────────────────────────────────────────────────

def push_to_supabase(signals: list[MarketSignal]) -> None:
    client = get_supabase()
    if not client:
        print("  ⚠  Supabase not configured — set SUPABASE_URL + SUPABASE_SERVICE_KEY in .env")
        return

    # Validate schema before writing — catches column renames before they silently write NULL
    rows = []
    for s in signals:
        raw = asdict(s)
        try:
            rows.append(MarketSignalRow(**raw).model_dump())
        except Exception as e:
            print(f"  ✗  Schema validation failed for signal '{s.entity_name}': {e}")
            return

    # Upsert: signals with a source_key skip silently on conflict (same real-world event).
    # Signals without a source_key (demo data) always insert — NULLs are not constrained.
    try:
        result = (
            client.table("market_signals")
            .upsert(rows, on_conflict="source_key", ignore_duplicates=True)
            .execute()
        )
    except Exception as e:
        print(f"  ✗  Supabase upsert failed — {e}")
        return
    pushed = len(result.data) if result.data else 0
    skipped = len(signals) - pushed
    print(f"  ✓  Pushed {pushed} signal(s) to market_signals" +
          (f" ({skipped} duplicate(s) skipped)" if skipped else ""))


# ── CLI ──────────────────────────────────────────────────────────────────────

def print_signals(signals: list[MarketSignal]) -> None:
    for s in signals:
        val = f"${s.valuation:,.0f}" if s.valuation else "—"
        tag_marker = {"HOT": "🔴", "WARM": "🟡", "COLD": "⚪"}.get(s.tag, "·")
        type_label = f"  [{s.signal_type}]" if s.signal_type else ""
        print(f"  {tag_marker} [{s.tag}] {s.event_type}{type_label}  score={s.score}")
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
    parser.add_argument("--mode", choices=["mortgages"],
                        help="Special scrape mode: 'mortgages' targets MTG/CON doc types on GovOS")
    parser.add_argument("--count", type=int, default=5,
                        help="Number of demo signals to generate (default: 5)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Print signals without writing to Supabase")
    parser.add_argument("--days", type=int, default=7,
                        help="How many days back to scrape (default: 7)")
    parser.add_argument("--debug", action="store_true",
                        help="Save raw HTML to scripts/debug/ for selector inspection")
    args = parser.parse_args()

    if not args.demo and not args.scrape and not args.mode:
        parser.print_help()
        return

    signals: list[MarketSignal] = []

    if args.demo:
        print(f"Generating {args.count} demo signals...")
        signals = generate_demo_signals(args.count)

    if args.scrape:
        if args.scrape in ("deeds", "all"):
            print("Scraping Greenville County Register of Deeds...")
            signals += scrape_greenville_deeds(days_back=args.days, debug=args.debug)
        if args.scrape in ("sos", "all"):
            print("Scraping SC Secretary of State filings...")
            signals += scrape_sc_sos_filings(days_back=args.days, debug=args.debug)

    if args.mode == "mortgages":
        print("Scraping Greenville County mortgage filings (MTG + CON)...")
        signals += scrape_greenville_mortgages(days_back=args.days, debug=args.debug)

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
