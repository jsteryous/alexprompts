#!/usr/bin/env python3
"""
Upstate Multiplier — Lead Enrichment Script
============================================
Takes a raw market_signal (LLC name + address) and tries to unmask
the real human decision-maker using free public sources only.

Free sources (no API key required):
  1. Greenville County GIS REST API  — parcel owner name + mailing address
  2. DuckDuckGo HTML search          — LLC name → person / LinkedIn / SC SOS page
  3. SC SOS entity detail page       — principal/registered agent (URL via DDG)

Usage:
    python enrich.py --signal-id <uuid>
    python enrich.py --address "1204 Laurens Rd" --entity "Palmetto Industrial LLC"
    python enrich.py --list-pending
    python enrich.py --dry-run --address "1204 Laurens Rd" --entity "Palmetto Industrial LLC"
"""

import os
import re
import sys
import time
import argparse
import urllib.parse
from pathlib import Path
from dataclasses import dataclass, field
from typing import Optional

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / '.env.local')

SUPABASE_URL         = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

# ── Greenville County ROD Viewer credentials ──────────────────────────────────
# Standard county viewer — separate from GovOS (Neumo) portal used for deed scraping.
# Login: https://viewer.greenvillecounty.org/countyweb/loginDisplay.action?countyname=Greenville
ROD_VIEWER_URL      = "https://viewer.greenvillecounty.org/countyweb"
ROD_VIEWER_USERNAME = os.environ.get("ROD_VIEWER_USERNAME", "asteryous")
ROD_PASSWORD        = os.environ.get("ROD_PASSWORD")   # shared with GovOS scraper

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}

# ── Supabase ──────────────────────────────────────────────────────────────────

def get_supabase():
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        return None
    from supabase import create_client
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


# ── Name normalization ────────────────────────────────────────────────────────

# Deed records store names as "LASTNAME FIRSTNAME MIDDLE" in ALL CAPS.
# Convert to natural "Firstname Lastname" order for display + outreach.

_SUFFIXES = {"JR", "SR", "II", "III", "IV", "ESQ", "MD", "PHD", "DDS"}
_LLC_TERMS_RE = re.compile(r"\b(LLC|INC|CORP|LTD|LP|LLP|HOLDINGS|PARTNERS|PROPERTIES|ASSOCIATES|GROUP|TRUST|FOUNDATION)\b", re.I)

def normalize_person_name(raw: str) -> str:
    """
    Convert deed-style name to natural order.

    Examples:
      "WRIGHT JEFF A"        → "Jeff Wright"
      "SMITH JOHN"           → "John Smith"
      "DOE JANE MARIE"       → "Jane Doe"
      "JOHNSON ROBERT JR"    → "Robert Johnson Jr"
      "PALMETTO HOLDINGS LLC" → returned unchanged (is_enriched() catches LLCs)
    """
    if not raw:
        return raw

    parts = raw.upper().split()
    if not parts:
        return raw

    # If only one token, just title-case it
    if len(parts) == 1:
        return parts[0].title()

    # Separate any trailing suffix
    suffix = ""
    if parts[-1] in _SUFFIXES:
        suffix = parts[-1].title()
        parts = parts[:-1]

    if len(parts) == 1:
        name = parts[0].title()
        return f"{name} {suffix}".strip()

    # Deed format: first token = last name, remaining = first [middle...]
    last  = parts[0].title()
    first = parts[1].title()
    # Drop middle name/initial — keeps it clean for outreach
    result = f"{first} {last}"
    if suffix:
        result += f" {suffix}"
    return result


# ── Result model ──────────────────────────────────────────────────────────────

@dataclass
class EnrichmentResult:
    principal_name:    Optional[str] = None
    principal_role:    Optional[str] = None
    property_address:  Optional[str] = None   # situs / physical property address from GIS
    mailing_address:   Optional[str] = None   # owner's mailing address (from Details.aspx)
    search_evidence:   Optional[str] = None   # URL used as primary source
    enrichment_status: str           = "pending"
    notes:             list          = field(default_factory=list)
    pin:               Optional[str] = None   # Greenville County Map # (parcel PIN)
    detail_url:        Optional[str] = None   # URL to RealProperty/Details.aspx for this parcel

    def is_enriched(self) -> bool:
        """True if we found a human name (not just an LLC)."""
        if not self.principal_name:
            return False
        llc_terms = ("llc", "inc", "corp", "ltd", "lp", "llp", "holdings", "partners", "group", "properties")
        return not any(t in self.principal_name.lower() for t in llc_terms)


# ── Source 1: Greenville County Tax Query (Playwright) ───────────────────────
#
# The GIS REST API (gcgis.org) blocks non-browser requests.
# The tax query form (votaxqry) works but requires JS for tab selection.
# Solution: Playwright headless browser — already in requirements.txt.
#
# Setup (one-time):
#   pip install playwright
#   playwright install chromium

TAX_QUERY_URL = "https://www.greenvillecounty.org/appsas400/votaxqry/"
DEBUG_DIR = Path(__file__).parent / "debug"

_STREET_RE = re.compile(
    r"^\d{1,5}\s+[A-Za-z]",  # 1-5 digit house number followed by a letter (e.g. "1204 L")
    # Rejects vehicle record IDs like "2012 00 4155914" which are all-digit after the space
)

# Vehicle record identifiers found in GVL tax results (year + make codes)
_VEHICLE_RE = re.compile(
    r"\b(CHEV|FORD|GMC|TOYT|HOND|NISS|DODG|JEEP|CHRY|BUIC|CADI|LINC|MERC|VOLK|HYUN|KIA|"
    r"BMW|BENZ|AUDI|LEXU|ACUR|INFI|MITS|SUBA|VOLV|BOAT|TRLR|MOTO|UTIL|SEMI|TRAIL)\b",
    re.I,
)


def _is_street_address(s: str) -> bool:
    """Return True if s looks like a real street address (has a leading number + letter)."""
    return bool(s and _STREET_RE.match(s.strip()))


def _is_vehicle_record(cells: list[str]) -> bool:
    """Return True if this tax row describes a vehicle, not real estate."""
    row_text = " ".join(cells)
    return bool(_VEHICLE_RE.search(row_text))


# Reject cells that look like tax payment / account data, not addresses:
# - dollar amounts ($992.26)
# - GVL account number format (2012 00 4155914 01 001...)
# - "District:" labels
_TAX_NOISE_RE = re.compile(r"\$[\d,.]|District:|^\d{4}\s+\d{2}\s+\d+", re.I)


def _looks_like_address(s: str) -> bool:
    return bool(s) and not _TAX_NOISE_RE.search(s)


def _parse_tax_row(cells: list[str]) -> tuple[str, Optional[str], Optional[str]]:
    """
    Parse a Greenville County tax query result row into
    (owner_raw, property_address, mailing_address).

    Typical table columns:
      0: Owner name (may include VIN# vehicle data — stripped here)
      1: Property location / situs address
      2: Mailing address street
      3: Mailing address city/state/zip

    Column layout may vary; we use heuristics.
    """
    owner_raw = cells[0] if cells else ""
    # Strip VIN# vehicle data appended to owner name
    owner_raw = re.sub(r"VIN#?:?\s*\S+.*$", "", owner_raw, flags=re.IGNORECASE).strip()
    # Strip GVL tax account number appended without separator: "SMITH JOHN2025 000012345 77 001"
    # Pattern: 4-digit year immediately followed by a long digit string
    owner_raw = re.sub(r"\d{4}\s+\d{6,}.*$", "", owner_raw).strip()
    # Strip "View Tax Notice" web artifact that sometimes bleeds in
    owner_raw = re.sub(r"View Tax Notice.*$", "", owner_raw, flags=re.IGNORECASE).strip()
    # Strip joint-ownership markers: "(JTWROS)", "P (JTWROS) PATE..." etc.
    owner_raw = re.sub(r"\s*\(JTWROS\).*$", "", owner_raw, flags=re.IGNORECASE).strip()
    # Strip trailing single letter that bleeds in from joint-owner abbreviation (e.g. "SHIVANGIP")
    # Only strip if it's a single uppercase letter at the end after a space
    owner_raw = re.sub(r"\s+[A-Z]$", "", owner_raw).strip()

    prop_addr = None
    mail_addr = None

    if len(cells) >= 2:
        # col 1 is the situs/property address when it starts with a house number + letter
        candidate = cells[1].strip()
        if _is_street_address(candidate) and _looks_like_address(candidate):
            prop_addr = candidate
            mail_parts = [c for c in cells[2:5] if _looks_like_address(c)]
            mail_addr  = " ".join(mail_parts) if mail_parts else None
        else:
            # col 1 might be mailing address or noise; filter strictly
            mail_parts = [c for c in cells[1:4] if _looks_like_address(c) and _is_street_address(c)]
            mail_addr  = mail_parts[0] if mail_parts else None

    return owner_raw, prop_addr, mail_addr


def lookup_gis(entity_name: str, address: str = "", _retried: bool = False) -> EnrichmentResult:
    """
    Search Greenville County tax records.

    Strategy:
    - If `address` is a real street address, search by address first (more precise).
    - Otherwise search by entity/owner name.

    Returns property_address (situs) and mailing_address (tax-bill destination).
    Uses Playwright because the form requires JavaScript tab selection.
    Falls back gracefully if Playwright is not installed.
    """
    result = EnrichmentResult()

    debug = os.environ.get("ENRICH_DEBUG") == "1"

    # The GVL tax form has no address field — name search only.
    # For joint grantees ("JOHN CONNELL AND LYNDA CONNELL"), search only the first person.
    search_term = re.sub(r"\s+AND\s+.*$", "", entity_name, flags=re.I)
    # Strip LLC/INC/CORP suffixes so "Palmetto Asset Management LLC" → "Palmetto Asset Management"
    search_term = re.sub(r"\b(LLC|INC|CORP|LTD|LP|LLP)\b", "", search_term, flags=re.I).strip(" ,.")
    if not search_term:
        result.notes.append("GIS: no usable search term after stripping entity suffixes")
        return result

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        result.notes.append(
            "GIS: Playwright not installed — run: pip install playwright && playwright install chromium"
        )
        return result

    def _save_debug(label: str, html: str) -> None:
        if not debug:
            return
        DEBUG_DIR.mkdir(exist_ok=True)
        slug = re.sub(r"[^\w]", "_", label)[:40]
        path = DEBUG_DIR / f"gis_{slug}.html"
        path.write_text(html, encoding="utf-8")
        print(f"         GIS debug: saved {path.name}")  # console only, not saved to DB notes

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto(TAX_QUERY_URL, timeout=20_000)
            page.wait_for_load_state("domcontentloaded", timeout=15_000)
            page.wait_for_timeout(800)   # let JS initialise tab controls

            _save_debug("01_initial_page", page.content())

            # Click the "Real Estate" tab by its known element ID, then force
            # the hidden category field to "Real Estate" via JS in case the
            # click fires before the JS handler updates the value.
            page.click("#lnk_RealEstate", timeout=5_000)
            page.evaluate(
                "document.getElementById('ctl00_bodyContent_hdn_SearchCategory').value = 'Real Estate';"
            )
            page.wait_for_timeout(400)

            _save_debug("02_after_real_estate_tab", page.content())

            name_input = page.locator("input[name='ctl00$bodyContent$txt_Name']")
            name_input.fill(search_term)
            result.notes.append(f"GIS: name search for '{search_term}'")
            _save_debug("03_name_filled", page.content())

            # Wait for the form-submit navigation to complete
            with page.expect_navigation(timeout=20_000):
                page.keyboard.press("Enter")
            page.wait_for_load_state("domcontentloaded", timeout=10_000)
            page.wait_for_timeout(500)

            html = page.content()
            _save_debug("04_results", html)
        except Exception as e:
            result.notes.append(f"GIS: browser error — {e}")
            _save_debug("99_error", page.content())
            browser.close()
            return result
        browser.close()

    soup = BeautifulSoup(html, "html.parser")

    # Check for explicit zero-results message before scanning rows
    page_text = soup.get_text(" ", strip=True)
    zero_match = re.search(r"Results Found:\s*0", page_text)
    if zero_match:
        result.notes.append(f"GIS: 0 real estate records found for '{search_term}'")
        # Name-flip retry: deeds sometimes store grantee names in natural order
        # (FIRST LAST) while GIS expects deed order (LAST FIRST).
        # If we got 0 results and haven't retried yet, reverse the words and try once more.
        # Only attempt for 2-3 word terms — longer terms are likely LLC names or noise.
        words = search_term.split()
        if not _retried and 2 <= len(words) <= 3:
            # Convert natural order to deed order, or strip middle initial.
            #   2-word  FIRST LAST        → LAST FIRST
            #   3-word  FIRST MIDDLE LAST → LAST FIRST MIDDLE
            #   3-word ending in single initial (LAST FIRST M) → strip initial → LAST FIRST
            #   The third case handles deed-format names where GIS omits the initial.
            if len(words) == 2:
                flipped = f"{words[1]} {words[0]}"
            elif len(words[2]) == 1:
                # Trailing single letter is a middle initial in deed format (LAST FIRST M).
                # GIS often indexes without it — try LAST FIRST.
                flipped = f"{words[0]} {words[1]}"
            else:
                flipped = f"{words[2]} {words[0]} {words[1]}"
            result.notes.append(f"GIS: retrying with flipped name order '{flipped}'")
            flip = lookup_gis(flipped, address, _retried=True)
            if flip.principal_name:
                flip.notes = result.notes + flip.notes
                return flip
        return result

    # Parse results table — rows: owner name | property address | mailing address
    rows = soup.select("table tr")
    if not rows:
        result.notes.append(f"GIS: no results for '{search_term}'")
        return result

    for row in rows[1:]:  # skip header
        cells_el = row.find_all("td")
        cells = [td.get_text(strip=True) for td in cells_el]
        if len(cells) < 2:
            continue

        # Skip vehicle personal-property rows — we only want real estate
        if _is_vehicle_record(cells):
            result.notes.append(f"GIS: skipping vehicle record row ({cells[0][:40]}...)")
            continue

        owner_raw, prop_addr, mail_addr = _parse_tax_row(cells)
        if not owner_raw:
            continue

        # Extract Map # (PIN) from cell[1] — the GIS results table column is "Map # / Sid #"
        # not a property address. Strip whitespace and validate as all-digit parcel number.
        pin_raw = re.sub(r"\s+", "", cells[1]) if len(cells) > 1 else ""
        result.pin = pin_raw if re.match(r"^\d{7,15}$", pin_raw) else None

        # Extract detail URL from the anchor in cell[0]
        # href format: /appsas400/RealProperty/Details.aspx?MapNumber=...&TaxYear=...
        detail_url = None
        if cells_el:
            anchor = cells_el[0].find("a", href=lambda h: h and "RealProperty/Details.aspx" in h)
            if anchor:
                href = anchor["href"]
                detail_url = href if href.startswith("http") else f"https://www.greenvillecounty.org{href}"
        result.detail_url = detail_url

        result.property_address = prop_addr
        # If the raw owner name contains LLC/INC/CORP etc., keep it as-is
        # so is_enriched() can correctly return False downstream.
        if _LLC_TERMS_RE.search(owner_raw):
            result.principal_name = owner_raw.title()
        else:
            result.principal_name = normalize_person_name(owner_raw)
        result.principal_role   = "Property Owner (tax record)"
        result.search_evidence  = f"{TAX_QUERY_URL} → Name search: '{search_term}'"
        result.notes.append(
            f"GIS: tax record owner '{owner_raw}' → '{result.principal_name}'"
            + (f" (Map # {result.pin})" if result.pin else "")
        )
        break  # take first match
    return result


# ── Source 2: DuckDuckGo HTML search ─────────────────────────────────────────

# ── Source 1b: Greenville County Real Property Detail Page ────────────────────
#
# Publicly accessible ASPX page — no login required.
# URL: https://www.greenvillecounty.org/appsas400/RealProperty/Details.aspx?MapNumber=<PIN>&TaxYear=...
# Returns owner name, Care Of (often the human principal for LLC-owned parcels),
# and mailing address.

_DETAIL_FIELDS = [
    ("owner",           re.compile(r"Owner\(s\):\s*(.+?)(?=Previous Owner:|Care Of:|Mailing Address:|DESCRIPTION)", re.I | re.S)),
    ("care_of",         re.compile(r"Care Of:\s*(.+?)(?=Mailing Address:|DESCRIPTION)", re.I | re.S)),
    ("mailing_address", re.compile(r"Mailing Address:\s*(.+?)(?=\*\s*-\s*Please|DESCRIPTION)", re.I | re.S)),
    ("location",        re.compile(r"\bLocation:\s*(.+?)(?=Subdivision:|Deed|$)", re.I | re.S)),
]


def lookup_property_detail(detail_url: str) -> dict:
    """
    Fetch the GVL Real Property detail page for a parcel.
    Returns dict with keys: owner, care_of, mailing_address, location
    All values are stripped strings; missing fields are absent from the dict.
    """
    out = {}
    try:
        resp = requests.get(detail_url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
    except Exception as e:
        return out

    text = BeautifulSoup(resp.text, "html.parser").get_text(" ", strip=True)
    for key, pattern in _DETAIL_FIELDS:
        m = pattern.search(text)
        if m:
            val = m.group(1).strip()
            if not val:
                continue
            # Guard: care_of regex sometimes bleeds into the Mailing Address section
            # when Care Of is empty. Trim at "Mailing Address:" if present.
            if key == "care_of" and re.search(r"Mailing Address:", val, re.I):
                val = re.split(r"Mailing Address:", val, flags=re.I)[0].strip()
            # Reject empty or suspiciously long values (real person names are ≤ 60 chars)
            if not val or (key == "care_of" and len(val) > 60):
                continue
            out[key] = val
    return out


DDG_URL = "https://html.duckduckgo.com/html/"

# Patterns that suggest a person's name was found
_NAME_PATTERN    = re.compile(r"\b([A-Z][a-z]+ [A-Z][a-z]+)\b")
_SOS_URL_PATTERN = re.compile(r"businessfilings\.sc\.gov/BusinessFiling/Entity/Details/\d+")

# Initials-LLC pattern: "LS Partners", "JM Holdings", "DRT Group", etc.
_INITIALS_LLC_RE = re.compile(
    r"^([A-Z]{2,5})\s+(?:Partners?|Group|Holdings?|Properties|Management|Associates|LLC|Inc\.?)",
    re.I,
)


def initials_match(llc_name: str, candidate_name: str) -> bool:
    """
    Check whether an LLC's leading initials match a person's name initials.

    Examples:
      initials_match("LS Partners", "Lowndes Smith")   → True
      initials_match("JM Holdings", "James Mitchell")  → True
      initials_match("DRT Group",   "David R Thompson")→ True  (DRT == D R T)
      initials_match("ABC Corp",    "Alice Baker")     → False (AB ≠ ABC)
    """
    m = _INITIALS_LLC_RE.match(llc_name.strip())
    if not m:
        return False
    initials = m.group(1).upper()
    # Build initials string from each capitalized word in the candidate name
    name_parts = [p for p in candidate_name.split() if p and p[0].isupper()]
    name_initials = "".join(p[0].upper() for p in name_parts)
    return name_initials.startswith(initials)


def search_duckduckgo(query: str) -> tuple[list[str], list[str]]:
    """
    Run a DuckDuckGo HTML search. Returns (text_snippets, urls_found).
    Rate-limit: 1 request per call — caller should sleep between calls.
    """
    try:
        resp = requests.post(
            DDG_URL,
            data={"q": query, "b": "", "kl": "us-en"},
            headers={**HEADERS, "Content-Type": "application/x-www-form-urlencoded"},
            timeout=15,
        )
        resp.raise_for_status()
    except Exception as e:
        return [], []

    soup = BeautifulSoup(resp.text, "html.parser")
    snippets, urls = [], []

    for result in soup.select(".result"):
        snippet_el = result.select_one(".result__snippet")
        url_el     = result.select_one(".result__url")
        if snippet_el:
            snippets.append(snippet_el.get_text(" ", strip=True))
        if url_el:
            urls.append(url_el.get_text(strip=True))

    return snippets, urls


def enrich_via_duckduckgo(entity_name: str, address: str = "") -> EnrichmentResult:
    """
    Search DuckDuckGo for the LLC name and try to surface:
      - The human owner/principal
      - A SC SOS entity detail page URL
      - LinkedIn profile
    """
    result = EnrichmentResult()

    # Query 1: owner search
    q1 = f'"{entity_name}" Greenville SC owner'
    snippets1, urls1 = search_duckduckgo(q1)
    time.sleep(1.5)  # be polite

    # Query 2: SC SOS entity search
    q2 = f'site:businessfilings.sc.gov "{entity_name}"'
    snippets2, urls2 = search_duckduckgo(q2)
    time.sleep(1.0)

    # Query 3: Upstate Business Journal — commercial developers are always in the news
    q3 = f'site:upstatebusinessjournal.com "{entity_name}"'
    snippets3, urls3 = search_duckduckgo(q3)
    time.sleep(1.0)

    # Query 4: GSA BizWire — press releases for Upstate SC businesses
    q4 = f'site:gsabizwire.com "{entity_name}"'
    snippets4, urls4 = search_duckduckgo(q4)
    time.sleep(1.0)

    # Query 5: mailing address pivot — if we have the LLC's mailing address from the
    # PIN pivot, search it on its own. Commercial office addresses often surface
    # the tenant company + executives in business press or LinkedIn.
    snippets5, urls5 = [], []
    if address and _is_street_address(address.split("\n")[0]):
        mail_first = address.split("\n")[0].strip().split(",")[0].strip()
        q5 = f'"{mail_first}" Greenville SC owner principal'
        snippets5, urls5 = search_duckduckgo(q5)
        time.sleep(1.0)

    all_snippets = snippets1 + snippets2 + snippets3 + snippets4 + snippets5
    all_urls     = urls1 + urls2 + urls3 + urls4 + urls5

    # Look for a SC SOS direct entity URL in results
    for url in all_urls:
        m = _SOS_URL_PATTERN.search(url)
        if m:
            result.search_evidence = f"https://{url}" if not url.startswith("http") else url
            result.notes.append(f"DDG: found SC SOS entity page — {result.search_evidence}")
            sos_result = scrape_sos_entity_page(result.search_evidence)
            if sos_result.principal_name:
                # Initials check: if LLC name matches agent's initials, flag it
                if initials_match(entity_name, sos_result.principal_name):
                    sos_result.notes.append(
                        f"Initials check: '{entity_name}' initials match "
                        f"'{sos_result.principal_name}' — high confidence"
                    )
                    sos_result.principal_role = (sos_result.principal_role or "Registered Agent") + " (initials match)"
                return sos_result

    # Look for LinkedIn URLs
    linkedin_urls = [u for u in all_urls if "linkedin.com/in/" in u]
    if linkedin_urls:
        result.notes.append(f"DDG: LinkedIn profile found — {linkedin_urls[0]}")
        if not result.search_evidence:
            result.search_evidence = linkedin_urls[0]

    # Extract person names from snippets using regex
    candidate_names = []
    for snippet in all_snippets:
        matches = _NAME_PATTERN.findall(snippet)
        for name in matches:
            # Filter out obvious non-names
            skip = {"South Carolina", "Greenville County", "United States",
                    "Register Deeds", "Business Filing", "Secretary State"}
            if name not in skip and len(name.split()) == 2:
                candidate_names.append(name)

    if candidate_names:
        from collections import Counter
        # If any candidate's initials match the LLC name, prefer that one
        # (e.g. "LS Partners" + "Lowndes Smith" → initials match wins)
        initials_hits = [n for n in candidate_names if initials_match(entity_name, n)]
        if initials_hits:
            top_name = Counter(initials_hits).most_common(1)[0][0]
            result.notes.append(f"Initials check: '{top_name}' initials match '{entity_name}'")
        else:
            top_name = Counter(candidate_names).most_common(1)[0][0]
        # Reject if it looks like a business phrase, not a person
        _false_positives = {
            "Filing Service", "Business Filing", "South Carolina", "Greenville County",
            "Registered Agent", "Secretary State", "United States", "New York",
            "Limited Liability", "Annual Report", "Registered Office",
            "Corporate Services", "National Registered", "Incorporating Service",
        }
        if top_name in _false_positives:
            result.notes.append(f"DDG: rejected false positive name '{top_name}'")
            return result
        result.principal_name = top_name
        # Label the source — UBJ/GSABiz hits are higher quality than generic DDG
        ubj_urls  = [u for u in all_urls if "upstatebusinessjournal.com" in u]
        gbiz_urls = [u for u in all_urls if "gsabizwire.com" in u]
        if ubj_urls:
            result.principal_role  = "Owner (Upstate Business Journal)"
            result.search_evidence = result.search_evidence or ubj_urls[0]
        elif gbiz_urls:
            result.principal_role  = "Owner (GSA BizWire)"
            result.search_evidence = result.search_evidence or gbiz_urls[0]
        else:
            result.principal_role  = "Owner (web search)"
            result.search_evidence = result.search_evidence or f"DuckDuckGo: {q1}"
        result.notes.append(f"DDG: extracted name '{top_name}' from search snippets")

    return result


# ── Source 3: SC SOS entity detail page (no CAPTCHA) ─────────────────────────

SOS_BASE = "https://businessfilings.sc.gov"

def scrape_sos_entity_page(url: str) -> EnrichmentResult:
    """
    Fetch a SC SOS entity detail page directly (no CAPTCHA required).
    Returns principal name and role if found.
    URL format: businessfilings.sc.gov/BusinessFiling/Entity/Details/{id}
    """
    result = EnrichmentResult()
    if not url.startswith("http"):
        url = f"https://{url}"

    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
    except Exception as e:
        result.notes.append(f"SOS: fetch failed — {e}")
        return result

    soup = BeautifulSoup(resp.text, "html.parser")

    # SC SOS detail pages list "Registered Agents" and "Officers/Directors"
    # in labeled sections — look for names adjacent to role labels
    result.search_evidence = url

    # Try to find agent/officer tables
    for table in soup.find_all("table"):
        rows = table.find_all("tr")
        for row in rows:
            cells = [td.get_text(strip=True) for td in row.find_all(["td", "th"])]
            if len(cells) < 2:
                continue
            role_keywords = ("agent", "officer", "director", "manager", "member", "organizer")
            if any(k in cells[0].lower() for k in role_keywords) and cells[1]:
                name = cells[1].strip()
                # Skip if looks like a law firm or company
                llc_terms = ("llc", "inc", "corp", "pa", "law", "firm", "group", "associates")
                if not any(t in name.lower() for t in llc_terms) and len(name.split()) >= 2:
                    result.principal_name = name
                    result.principal_role = cells[0].strip().title()
                    result.notes.append(f"SOS: found '{name}' as {result.principal_role}")
                    break
        if result.principal_name:
            break

    # Fallback: scan all text for name-like strings near role keywords
    if not result.principal_name:
        text = soup.get_text(" ")
        for keyword in ("Registered Agent:", "Manager:", "Officer:", "Organizer:"):
            idx = text.find(keyword)
            if idx != -1:
                snippet = text[idx + len(keyword):idx + len(keyword) + 60].strip()
                names = _NAME_PATTERN.findall(snippet)
                if names:
                    result.principal_name = names[0]
                    result.principal_role = keyword.rstrip(":")
                    result.notes.append(f"SOS: extracted '{names[0]}' near '{keyword}'")
                    break

    return result


# ── Source 0: Greenville County ROD Viewer — Mortgage Borrower Lookup ────────
#
# When a deed signals an LLC purchase, a corresponding MORTGAGE is usually filed
# the same day on the county ROD viewer.  The signature block (near the end of
# the document) reads:
#
#   BORROWER:  Kelli Wilder, Manager
#   [LLC NAME]
#
# This directly names the human signing on behalf of the LLC — typically the owner.
#
# Portal: viewer.greenvillecounty.org (standard CountyWeb — different from GovOS)
# Credentials: ROD_VIEWER_USERNAME + ROD_PASSWORD from .env.local

# ── Signature block extraction ────────────────────────────────────────────────
#
# SC mortgage signature page layout (GVL county docs):
#
#   WITNESS:          BORROWER:
#   [LLC Name], a South Carolina LLC
#
#   By _______________
#
#   Frank Henderson, Member     ← typed name + title — target
#
# The pipeline tries structured regex patterns first (most reliable), then
# falls back to a scored line-scanner that handles noisy/malformed OCR.

# Signer titles accepted in the borrower role
_BORROWER_TITLE_WORDS = (
    "Manager", "Member", "CEO", "President", "Owner", "Partner",
    "Trustee", "Director", "Officer", "Principal", "Authorized Signatory",
    "Managing Member", "General Partner", "Vice President",
)
_BORROWER_TITLES_RE = re.compile(
    r"\b(Managing\s+Member|General\s+Partner|Authorized\s+Signatory|"
    r"Vice\s+President|Manager|Member|CEO|President|Owner|Partner|"
    r"Trustee|Director|Officer|Principal)\b",
    re.I,
)

# Name word: allows prefix particles (De, Van, O', Mc, Mac) and hyphenated parts.
# Each token: starts uppercase, may contain lowercase, apostrophes, hyphens.
# Accepts mild OCR noise: a single interior digit (0→o, 1→l) per token.
_NAME_TOKEN    = r"[A-Z][A-Za-z']{0,2}(?:[A-Za-z0-9'\-]{0,18})"
_NAME_PAT      = rf"((?:{_NAME_TOKEN})(?:[\s\-](?:{_NAME_TOKEN})){{1,5}})"

# Roles that belong to witnesses, notaries, lenders — NOT the borrower signer.
# A candidate line containing any of these is heavily penalised.
_NOISE_ROLES = re.compile(
    r"\b(Witness|Notary|Notarial|Lender|Mortgagee|Grantor|Grantee|"
    r"Attorney|Counsel|Clerk|Commissioner|Subscribing|Attesting|"
    r"Acknowledgment|Acknowledged|State\s+of|County\s+of|Personally\s+appeared|"
    r"before\s+me|My\s+Commission|Commission\s+Expires|Sworn|Affirmed)\b",
    re.I,
)

# Structured regex patterns — tried in order, most-specific first.
_BORROWER_RE = [
    # "BORROWER: … By [scrawl]\nName, Title"  (most common SC mortgage layout)
    re.compile(
        r"BORROWER:.*?By[\s_\-]{0,10}\S[^\n]*\n(?:\s*\n)*\s*"
        + _NAME_PAT + r",?\s*" + _BORROWER_TITLES_RE.pattern,
        re.I | re.DOTALL,
    ),
    # "By [anything]\n\nName, Title"  (no explicit BORROWER label)
    re.compile(
        r"By[\s_\-]{0,10}[^\n]{0,60}\n(?:\s*\n)*\s*"
        + _NAME_PAT + r",\s*" + _BORROWER_TITLES_RE.pattern,
        re.I | re.MULTILINE,
    ),
    # "BORROWER: Name, Title"  on same line (electronic / clean-scan)
    re.compile(
        r"(?:BORROWER|Borrower)[:\s]+" + _NAME_PAT + r",?\s*" + _BORROWER_TITLES_RE.pattern,
        re.I,
    ),
    # "BORROWER:\nName, Title"  on next line
    re.compile(
        r"(?:BORROWER|Borrower)[:\s]*\r?\n\s*" + _NAME_PAT + r",?\s*" + _BORROWER_TITLES_RE.pattern,
        re.I | re.MULTILINE,
    ),
    # "Name:\nJohn Smith\nTitle:\nManager"  labelled-field format
    re.compile(
        r"Name[:\s]+\n?\s*" + _NAME_PAT + r"\s*\n\s*Title[:\s]+\n?\s*" + _BORROWER_TITLES_RE.pattern,
        re.I | re.MULTILINE,
    ),
    # BORROWER label + name only (no visible title)
    re.compile(
        r"(?:BORROWER|Borrower)[:\s]+" + _NAME_PAT,
        re.I,
    ),
]


def _preprocess_ocr(text: str) -> str:
    """
    Normalise common OCR artefacts before pattern matching.
    Targets character substitutions that appear inside human names.
    """
    import unicodedata
    text = unicodedata.normalize("NFKC", text)
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    # Collapse 3+ blank lines → 2
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Mid-word digit substitutions: Henders0n→Henderson, 1inda→linda
    text = re.sub(r"(?<=[A-Za-z])0(?=[a-z])", "o", text)
    text = re.sub(r"(?<=[A-Z])0(?=[A-Z])", "O", text)
    text = re.sub(r"\b1(?=[a-z])", "l", text)
    text = re.sub(r"\|", "I", text)
    # Strip garbage characters that OCR injects into whitespace regions
    text = re.sub(r"[_]{3,}", " ", text)        # underline fields → space
    text = re.sub(r"[=\-]{4,}", " ", text)      # rule lines → space
    text = re.sub(r"[ \t]{2,}", " ", text)      # collapse horizontal whitespace
    text = "\n".join(line.rstrip() for line in text.splitlines())
    return text


def _is_name_like(token: str) -> bool:
    """
    Return True if token looks like a human name.

    Accepts:
      - 2–5 space-separated words
      - Each word: starts uppercase, may contain lowercase, apostrophes, hyphens
      - Prefix particles: De, Van, O', Mc, Mac, La, Le, Da, Di, El, Al
      - Hyphenated surnames: Smith-Jones
    Rejects:
      - Single words
      - Words that are all-uppercase (likely acronyms/entities)
      - Tokens containing entity keywords
      - Tokens containing 2+ consecutive digits
    """
    token = token.strip()
    words = token.split()
    if not 2 <= len(words) <= 5:
        return False
    if _LLC_NAME_RE.search(token):
        return False
    if re.search(r"\d{2,}", token):          # two or more consecutive digits
        return False
    # Each word must start uppercase and not be fully uppercase (avoids LLC names)
    _VALID_WORD = re.compile(
        r"^[A-Z](?:[A-Za-z'\-]*[a-z][A-Za-z'\-]*|[A-Z]{1,2}[a-z].*)$"
    )
    particles = {"de", "la", "le", "van", "da", "di", "el", "al", "o", "mc", "mac",
                 "von", "der", "den", "ten", "ter", "af", "of", "y"}
    for w in words:
        # Particles are allowed in lowercase
        if w.lower() in particles:
            continue
        if not _VALID_WORD.match(w):
            return False
    return True


def _normalise_name(name: str) -> str:
    """Title-case a name, preserving known particles and hyphenated parts."""
    particles = {"de", "la", "le", "van", "da", "di", "el", "al", "von",
                 "der", "den", "ten", "ter", "af", "of", "y"}
    parts = name.split()
    out = []
    for i, p in enumerate(parts):
        low = p.lower().rstrip(".,")
        if i > 0 and low in particles:
            out.append(low)
        else:
            out.append(p.capitalize())
    return " ".join(out)


def _is_entity_line(line: str) -> bool:
    """True if the line looks like a corporate entity name, not a human."""
    return bool(_LLC_NAME_RE.search(line)) or bool(
        re.search(r"\b(a\s+South\s+Carolina|a\s+Georgia|a\s+North\s+Carolina)\b", line, re.I)
    )


def _heuristic_borrower_scan(text: str) -> tuple[Optional[str], Optional[str]]:
    """
    Scored line-scanner fallback.

    Scores every candidate (name, title) pair extracted from the OCR text and
    returns the highest-confidence match. Designed to handle:
      - Format variation (no BORROWER label, labelled fields, etc.)
      - Witnesses and notaries on the same page (penalised heavily)
      - Multi-line names (two adjacent short tokens combined)
      - Noisy OCR that breaks regex anchors
    """
    lines = text.splitlines()

    # ── Locate anchor lines ────────────────────────────────────────────────────
    # An anchor is a line that signals "the borrower block starts here."
    # We record (line_index, anchor_strength) — higher = more reliable.
    _BY_RE       = re.compile(r"^\s*By[\s_:\-]{0,6}", re.I)
    _BORROWER_RE_anchor = re.compile(r"\bBORROWER\b", re.I)
    _NAME_LABEL  = re.compile(r"^\s*Name\s*:", re.I)
    _TITLE_LABEL = re.compile(r"^\s*Title\s*:", re.I)

    anchors: dict[int, int] = {}   # line_idx → anchor_strength
    for i, ln in enumerate(lines):
        if _BORROWER_RE_anchor.search(ln):
            anchors[i] = 80
        elif _BY_RE.match(ln):
            anchors[i] = 60
        elif _NAME_LABEL.match(ln):
            anchors[i] = 40

    # Always include the last 25 lines as low-strength anchors
    for i in range(max(0, len(lines) - 25), len(lines)):
        anchors.setdefault(i, 10)

    # ── Build candidate window ─────────────────────────────────────────────────
    # For each anchor, look at lines anchor+1 … anchor+10.
    candidates: list[tuple[int, str, Optional[str]]] = []
    # (raw_score, name, title)

    visited: set[int] = set()

    def _extract_title_from_line(ln: str) -> Optional[str]:
        m = _BORROWER_TITLES_RE.search(ln)
        return m.group(1) if m else None

    def _score_candidate(
        name: str,
        title: Optional[str],
        line_idx: int,
        anchor_strength: int,
        is_after_by: bool,
        is_after_borrower: bool,
    ) -> int:
        score = 0

        # ── Positive signals ──────────────────────────────────────────────
        if title:
            score += 40                          # confirmed role = strong signal
        if is_after_borrower:
            score += 35
        if is_after_by:
            score += 25
        score += anchor_strength // 4            # up to +20 from anchor type

        # Name structure quality
        words = name.split()
        if 2 <= len(words) <= 3:
            score += 10                          # typical human name length
        elif len(words) == 4:
            score += 5

        # ── Negative signals ──────────────────────────────────────────────
        if _NOISE_ROLES.search(name):
            score -= 80                          # witness / notary / lender role
        if _is_entity_line(name):
            score -= 100
        if re.search(r"\d{2,}", name):
            score -= 40                          # embedded numbers = not a name

        # Proximity to noise roles in surrounding lines
        context = " ".join(lines[max(0, line_idx - 2): line_idx + 3])
        if re.search(r"\b(Witness|Notary|Notarial|Subscribing)\b", context, re.I):
            score -= 30                          # name appears near a witness block
        if re.search(r"\b(Lender|Mortgagee)\b", context, re.I):
            score -= 20

        return score

    for anchor_idx, anchor_strength in sorted(anchors.items()):
        is_after_by       = _BY_RE.match(lines[anchor_idx])
        is_after_borrower = _BORROWER_RE_anchor.search(lines[anchor_idx])

        window = range(anchor_idx + 1, min(anchor_idx + 11, len(lines)))

        # ── Check for labelled-field format: Name:\n<value>\nTitle:\n<value> ──
        for i in window:
            if i in visited:
                continue
            if _NAME_LABEL.match(lines[i]):
                name_val  = lines[i + 1].strip() if i + 1 < len(lines) else ""
                title_val = ""
                for j in range(i + 2, min(i + 5, len(lines))):
                    if _TITLE_LABEL.match(lines[j]):
                        title_val = lines[j + 1].strip() if j + 1 < len(lines) else ""
                        break
                if _is_name_like(name_val):
                    title = _extract_title_from_line(title_val) or _extract_title_from_line(name_val)
                    score = _score_candidate(
                        name_val, title, i, anchor_strength,
                        bool(is_after_by), bool(is_after_borrower)
                    )
                    candidates.append((score, _normalise_name(name_val), title))
                    visited.add(i)

        # ── Standard line scan ─────────────────────────────────────────────────
        for i in window:
            if i in visited:
                continue
            visited.add(i)
            line = lines[i].strip()
            if not line:
                continue

            # Skip lines that are clearly entity descriptions or boilerplate
            if _is_entity_line(line):
                continue
            if len(line) > 80:
                continue
            if re.match(r"^(State|County|In\s+Witness|Before\s+me|Sworn)", line, re.I):
                continue

            title: Optional[str] = None

            # ── "Name, Title" on one line ──────────────────────────────────────
            m = re.match(
                rf"^{_NAME_PAT},?\s*{_BORROWER_TITLES_RE.pattern}$",
                line, re.I
            )
            if m and _is_name_like(m.group(1)):
                name  = _normalise_name(m.group(1).strip())
                title = m.group(2).strip()
                score = _score_candidate(
                    name, title, i, anchor_strength,
                    bool(is_after_by), bool(is_after_borrower)
                )
                candidates.append((score, name, title))
                continue

            # ── Name alone — look ahead up to 3 lines for title ───────────────
            if _is_name_like(line):
                for lookahead in range(i + 1, min(i + 4, len(lines))):
                    t = _extract_title_from_line(lines[lookahead].strip())
                    if t:
                        title = t
                        break
                score = _score_candidate(
                    line, title, i, anchor_strength,
                    bool(is_after_by), bool(is_after_borrower)
                )
                candidates.append((score, _normalise_name(line), title))
                continue

            # ── Two adjacent short lines combined (split-name recovery) ────────
            if i + 1 < len(lines):
                next_line = lines[i + 1].strip()
                combined  = f"{line} {next_line}"
                if (
                    _is_name_like(combined)
                    and 1 <= len(line.split()) <= 2
                    and 1 <= len(next_line.split()) <= 2
                    and not _is_entity_line(combined)
                ):
                    for lookahead in range(i + 2, min(i + 5, len(lines))):
                        t = _extract_title_from_line(lines[lookahead].strip())
                        if t:
                            title = t
                            break
                    score = _score_candidate(
                        combined, title, i, anchor_strength,
                        bool(is_after_by), bool(is_after_borrower)
                    )
                    candidates.append((score, _normalise_name(combined), title))

    if not candidates:
        return None, None

    # ── Deduplicate by normalised name, keep highest score per name ────────────
    best_by_name: dict[str, tuple[int, Optional[str]]] = {}
    for score, name, title in candidates:
        key = re.sub(r"\s+", " ", name.lower().strip())
        prev_score, _ = best_by_name.get(key, (-999, None))
        if score > prev_score:
            best_by_name[key] = (score, title)

    # Return the highest-scoring unique candidate, provided it clears the bar
    ranked = sorted(best_by_name.items(), key=lambda x: x[1][0], reverse=True)
    for normalised_name, (score, title) in ranked:
        if score < 0:
            break                               # everything below zero is noise
        # Recover properly-cased name from candidates list
        for _, name, t in sorted(candidates, key=lambda x: -x[0]):
            if re.sub(r"\s+", " ", name.lower().strip()) == normalised_name:
                return name, title or t
        break

    return None, None

# LLC / corporate entity indicator — only run mortgage lookup for these
_LLC_NAME_RE = re.compile(
    r"\b(LLC|INC|CORP|LTD|LP|LLP|HOLDINGS|PARTNERS|PROPERTIES|ASSOCIATES|GROUP|"
    r"DEVELOPMENT|ENTERPRISES|TRUST|FOUNDATION|VENTURES|CAPITAL|INVESTMENTS)\b",
    re.I,
)

# Recording date in gvl_monitor.py details string: "Deed recording · DEED · recorded 4/2/2026"
_REC_DATE_RE = re.compile(r"recorded\s+(\d{1,2}/\d{1,2}/\d{4})", re.I)


def _parse_recording_date(details: str) -> Optional[str]:
    """Extract 'M/D/YYYY' recording date from the details field."""
    m = _REC_DATE_RE.search(details or "")
    return m.group(1) if m else None


def _parse_borrower_from_text(text: str) -> tuple[Optional[str], Optional[str]]:
    """
    Extract borrower name + title from raw OCR document text.
    Returns (name, title) | (name, None) | (None, None).

    Strategy:
      1. Preprocess OCR noise (digit substitutions, rule lines, etc.)
      2. Try structured regex patterns in priority order
      3. Fall back to scored heuristic line-scanner
    Searches the last 10 000 chars where signature blocks always live.
    """
    tail = text[-10_000:] if len(text) > 10_000 else text
    tail = _preprocess_ocr(tail)

    _SKIP = frozenset((
        "the borrower", "the undersigned", "each borrower", "any borrower",
        "the note", "the mortgage", "the deed",
    ))

    for pattern in _BORROWER_RE:
        m = pattern.search(tail)
        if not m:
            continue
        name  = m.group(1).strip()
        title = m.group(2).strip() if len(m.groups()) >= 2 else None

        if len(name.split()) < 2 or len(name) > 60:
            continue
        if name.lower() in _SKIP:
            continue
        if _LLC_NAME_RE.search(name):
            continue
        if _NOISE_ROLES.search(name):
            continue

        return _normalise_name(name), title

    # Structured patterns failed — fall back to scored heuristic scanner
    return _heuristic_borrower_scan(tail)


def lookup_mortgage_borrower(
    entity_name: str,
    rec_date_str: str,
    debug: bool = False,
) -> EnrichmentResult:
    """
    Log into Greenville County ROD viewer, search for a MORTGAGE filed by
    entity_name on or near rec_date_str, open the document, and extract the
    borrower name + title from the signature block.

    rec_date_str: 'M/D/YYYY' format as stored in market_signals.details

    Debug: set ENRICH_DEBUG=1 to save HTML snapshots to scripts/debug/mort_*.html
    """
    result = EnrichmentResult()

    if not ROD_PASSWORD:
        result.notes.append("Mortgage lookup: ROD_PASSWORD not set in .env.local — skipping")
        return result

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        result.notes.append("Mortgage lookup: Playwright not installed — skipping")
        return result

    def _dbg(label: str, content: str) -> None:
        if not debug:
            return
        DEBUG_DIR.mkdir(exist_ok=True)
        slug = re.sub(r"[^\w]", "_", label)[:40]
        path = DEBUG_DIR / f"mort_{slug}.html"
        path.write_text(content, encoding="utf-8", errors="replace")
        print(f"         Mortgage debug: saved {path.name}")

    # Parse date window: ±3 days around recording date
    try:
        from datetime import datetime, timedelta
        rec_dt   = datetime.strptime(rec_date_str, "%m/%d/%Y")
        date_from = (rec_dt - timedelta(days=3)).strftime("%m/%d/%Y")
        date_to   = (rec_dt + timedelta(days=3)).strftime("%m/%d/%Y")
    except (ValueError, TypeError):
        result.notes.append(f"Mortgage lookup: could not parse date '{rec_date_str}'")
        return result

    # Normalize entity name for search (strip LLC/INC suffixes for better matching)
    search_name = re.sub(
        r"\b(LLC|INC|CORP|LTD|LP|LLP|,)\b", "", entity_name, flags=re.I
    ).strip(" ,.")

    print(f"         Mortgage lookup: '{search_name}' | {date_from}–{date_to}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page    = browser.new_page()
        doc_text = ""
        try:
            # ── Step 1: Log in ────────────────────────────────────────────────
            login_url = f"{ROD_VIEWER_URL}/loginDisplay.action?countyname=Greenville"
            page.goto(login_url, timeout=30_000)
            page.wait_for_load_state("domcontentloaded", timeout=15_000)
            page.wait_for_timeout(800)
            _dbg("01_login_page", page.content())

            page.fill("input[name='username']", ROD_VIEWER_USERNAME)
            page.fill("input[name='password']", ROD_PASSWORD)
            _dbg("02_credentials_filled", page.content())

            with page.expect_navigation(timeout=20_000):
                page.evaluate("document.loginform.submit()")
            page.wait_for_load_state("domcontentloaded", timeout=15_000)
            page.wait_for_timeout(2_000)
            _dbg("03_after_login", page.content())

            if "login" in page.url.lower():
                result.notes.append("Mortgage lookup: login failed — check ROD_VIEWER_USERNAME/ROD_PASSWORD")
                browser.close()
                return result
            print(f"         Mortgage lookup: logged in → {page.url}")

            # ── Step 2: Accept disclaimer in the bodyframe ────────────────────
            # After login, bodyframe loads disclaimer.jsp with Accept/Decline buttons.
            # The form posts to disclaimer.do with target="_parent", which navigates
            # the outer page and reloads the bodyframe with the search interface.
            page.wait_for_timeout(2_000)

            frame = page.frame(name="bodyframe")
            if frame is None:
                result.notes.append("Mortgage lookup: bodyframe not found")
                _dbg("03b_no_frame", page.content())
                browser.close()
                return result

            _dbg("04_bodyframe_initial", frame.content())

            # Click Accept if disclaimer is showing
            if frame.locator("input[name='accept']").count() > 0:
                print("         Mortgage lookup: accepting disclaimer...")
                # target="_parent" means the response replaces the outer page —
                # wait for the main page to finish navigating after the post.
                with page.expect_navigation(timeout=15_000):
                    frame.click("input[name='accept']")
                page.wait_for_load_state("domcontentloaded", timeout=15_000)
                page.wait_for_timeout(2_000)
                # Re-acquire frame after parent page reload
                frame = page.frame(name="bodyframe")
                if frame is None:
                    result.notes.append("Mortgage lookup: bodyframe lost after disclaimer accept")
                    browser.close()
                    return result

            _dbg("04b_after_disclaimer", frame.content())
            print(f"         Mortgage lookup: bodyframe URL → {frame.url}")

            # ── Step 3: Navigate bodyframe to the search page ─────────────────
            # frame.goto() returns 404 — the servlet requires the navigation to
            # originate from the outer page's context (Referer/session binding).
            # Click the outer page nav link (target="bodyframe") instead.
            nav_link = page.locator("a[href*='searchMain.do']")
            if nav_link.count() > 0:
                print("         Mortgage lookup: clicking nav link → bodyframe...")
                nav_link.first.click()
            else:
                # Fallback: JS-set the iframe src the same way the nav JS does
                page.evaluate("window.frames['bodyframe'].location = '/countyweb/search/searchMain.do?defaultType=Public'")

            # Re-acquire frame after navigation and wait for content to settle
            frame.wait_for_load_state("domcontentloaded", timeout=15_000)
            frame.wait_for_timeout(1_500)
            frame = page.frame(name="bodyframe")
            if frame is None:
                result.notes.append("Mortgage lookup: bodyframe lost after search nav")
                browser.close()
                return result
            _dbg("05_search_page", frame.content())
            print(f"         Mortgage lookup: search page loaded → {frame.url}")

            # ── Step 4: Access the actual search form in dynSearchFrame ──────────
            # SearchMainView.jsp uses nested iframes.  After the page is ready,
            # loadChildren() sets dynSearchFrame.location = searchCriteria.do.
            # Wait for that async load to complete, then interact with it.
            # SearchMainView.jsp calls loadChildren() which navigates dynSearchFrame
            # to searchCriteria.do (DynSearchCriteriaViewEnhanced.jsp).
            # That page then uses easyUI to AJAX-load the actual criteria panel
            # (nametree.jsp, insttype.jsp etc.) into the DOM.
            # We must wait for the criteria inputs to actually appear — not just domcontentloaded.
            page.wait_for_timeout(2_000)   # allow loadChildren() to fire

            sf = page.frame(name="dynSearchFrame")
            if sf is None:
                sf = page.frame(name="searchFrame")
            if sf is None:
                result.notes.append("Mortgage lookup: search criteria frame not found — inspect mort_05_search_page.html")
                browser.close()
                return result

            try:
                sf.wait_for_load_state("domcontentloaded", timeout=15_000)
            except Exception:
                pass

            _dbg("06_search_form", sf.content())
            print(f"         Mortgage lookup: search form URL → {sf.url}")

            # The actual criteria inputs live in criteriaframe (inside dynSearchFrame).
            # getSubmitFrame() = window.frames["criteriaframe"]
            # It gets navigated to: dyncriteria/dynCriteria.do?searchType=allNames&searchCategory=ADVANCED
            cf = page.frame(name="criteriaframe")
            if cf is None:
                result.notes.append(
                    "Mortgage lookup: criteriaframe not found — inspect mort_06_search_form.html"
                )
                browser.close()
                return result

            try:
                cf.wait_for_load_state("domcontentloaded", timeout=15_000)
                cf.wait_for_selector("input[type='text']", timeout=10_000)
            except Exception:
                pass
            _dbg("07_criteria_form", cf.content())
            print(f"         Mortgage lookup: criteria frame URL → {cf.url}")

            # Set name via easyUI textbox API (id=allNames → hidden name=ALLNAMES)
            safe_name = search_name.replace("'", "\\'")
            cf.evaluate(f"$('#allNames').textbox('setValue', '{safe_name}')")
            print(f"         Mortgage lookup: set ALLNAMES = '{search_name}'")

            # Set date range via easyUI datebox (id=FROMDATE / TODATE)
            cf.evaluate(f"$('#FROMDATE').datebox('setValue', '{date_from}')")
            cf.evaluate(f"$('#TODATE').datebox('setValue', '{date_to}')")
            print(f"         Mortgage lookup: date range {date_from} → {date_to}")

            # Party = both (grantor + grantee) — default, but make sure
            cf.evaluate("document.getElementById('partyRBBoth').checked = true;")

            _dbg("08_form_filled", cf.content())

            # Trigger search — executeSearch() → parent.executeCommand("search")
            # This is exactly what the Search button does in the UI.
            cf.evaluate("executeSearch()")

            # Results load into resultFrame → resultListFrame (nested inside SearchMainView.jsp)
            # Wait for the results to appear — executeSearch triggers async search
            page.wait_for_timeout(5_000)

            # Try resultListFrame first (deepest), then resultFrame, then searchFrame
            results_frame = (
                page.frame(name="resultListFrame")
                or page.frame(name="resultFrame")
                or page.frame(name="searchFrame")
            )
            if results_frame is None:
                result.notes.append("Mortgage lookup: results frame not found after executeSearch()")
                _dbg("09_no_results_frame", frame.content())
                browser.close()
                return result

            try:
                results_frame.wait_for_load_state("domcontentloaded", timeout=15_000)
            except Exception:
                pass
            _dbg("09_search_results", results_frame.content())
            print(f"         Mortgage lookup: results frame URL → {results_frame.url}")

            # ── Step 5: Open first matching result ─────────────────────────────
            results_text = BeautifulSoup(results_frame.content(), "html.parser").get_text(" ", strip=True)

            if "no record" in results_text.lower() or "0 record" in results_text.lower():
                result.notes.append(
                    f"Mortgage lookup: no MORTGAGE found for '{search_name}' near {rec_date_str}"
                )
                browser.close()
                return result

            # ── Find and click the MORTGAGE row (not just the first row) ─────────
            # Results may include ASSIGNMENT OF RENTS, DEED, etc. before the MORTGAGE.
            # Parse the results HTML to find the row with MORTGAGE / DEED OF TRUST.
            _MORTGAGE_DOC_TYPES = {"MORTGAGE", "DEED OF TRUST", "TRUST DEED"}
            results_soup = BeautifulSoup(results_frame.content(), "html.parser")

            target_idx = None
            mort_inst_id = None
            results_html = results_frame.content()
            for row in results_soup.select("tr[datagrid-row-index]"):
                type_cell = row.select_one("td[field='7'] div")
                if type_cell:
                    doc_type = type_cell.get_text(strip=True).upper()
                    if any(mt in doc_type for mt in _MORTGAGE_DOC_TYPES):
                        target_idx = int(row["datagrid-row-index"])
                        print(f"         Mortgage lookup: found '{doc_type}' at row index {target_idx}")
                        # Extract instId from documentRowInfo JS block for this row
                        iid_m = re.search(
                            rf"documentRowInfo\[{target_idx}\]\.instId\s*=\s*[\"'](\d+)",
                            results_html,
                        )
                        if iid_m:
                            mort_inst_id = iid_m.group(1)
                        break

            if target_idx is None:
                result.notes.append(
                    f"Mortgage lookup: results found but no MORTGAGE/DEED OF TRUST row — "
                    f"only: {[r.select_one(\"td[field='7'] div\") and r.select_one(\"td[field='7'] div\").get_text(strip=True) for r in results_soup.select('tr[datagrid-row-index]')]}"
                )
                _dbg("09b_no_mortgage_row", results_frame.content())
                browser.close()
                return result

            doc_link = results_frame.locator(f"a#inst{target_idx}")
            if doc_link.count() == 0:
                # Fallback: click by row index via loadRecord call
                doc_link = results_frame.locator(f"a[onclick*='documentRowInfo[{target_idx}]']")
            if doc_link.count() == 0:
                result.notes.append(
                    f"Mortgage lookup: MORTGAGE row {target_idx} found but link not clickable"
                )
                _dbg("09c_no_doc_link", results_frame.content())
                browser.close()
                return result

            doc_link.first.click()
            page.wait_for_timeout(3_000)

            # Document loads into documentFrame (child of bodyframe / SearchMainView.jsp).
            # DocumentInfoView.jsp is a frameset — the actual text lives in the nested
            # docInfoFrame (→ displayDocument.do), NOT in documentFrame itself.
            doc_frame = page.frame(name="documentFrame")
            if doc_frame is None:
                result.notes.append("Mortgage lookup: documentFrame not found after clicking result")
                browser.close()
                return result

            try:
                doc_frame.wait_for_load_state("domcontentloaded", timeout=20_000)
                doc_frame.wait_for_timeout(2_000)
            except Exception:
                pass
            _dbg("09_document_viewer", doc_frame.content())

            # ── Step 6: Get document text from docInfoFrame ───────────────────
            # docInfoFrame (transAddDoc.jsp) contains the document metadata including
            # "Number of Pages: N".  The actual scanned page images are in docImgViewFrame.
            page.wait_for_timeout(1_500)  # allow sub-frame src= assignments to fire
            doc_info_frame = page.frame(name="docInfoFrame")
            if doc_info_frame:
                try:
                    doc_info_frame.wait_for_load_state("domcontentloaded", timeout=15_000)
                    doc_info_frame.wait_for_timeout(1_000)
                except Exception:
                    pass
                _dbg("09b_doc_info_frame", doc_info_frame.content())
                doc_text = doc_info_frame.inner_text("body")
            else:
                doc_text = doc_frame.inner_text("body")

            # ── Step 6b: Navigate docImgViewFrame to HTML5 viewer ─────────────
            # The default docImgViewFrame loads imageViewApplet.do (Java applet —
            # unavailable in headless Playwright).  Force-navigate it to the HTML5
            # viewer (InstrumentImageView.jsp) so we can call getPage.do via fetch.
            doc_frame_html = doc_frame.content()
            img_viewer_m = re.search(
                r"InstrumentImageView\.jsp\?[^\"']+",
                doc_frame_html,
            )
            img_view_frame = None
            html5_url = ""
            if img_viewer_m:
                html5_url = img_viewer_m.group(0).replace("&amp;", "&").rstrip(";")
                if not html5_url.startswith("http"):
                    html5_url = f"https://viewer.greenvillecounty.org/countyweb/search/{html5_url}"
                try:
                    doc_frame.evaluate(
                        f"if (window.frames['docImgViewFrame']) "
                        f"  window.frames['docImgViewFrame'].location = '{html5_url}';"
                    )
                    page.wait_for_timeout(3_000)
                    img_view_frame = page.frame(name="docImgViewFrame")
                    if img_view_frame:
                        img_view_frame.wait_for_load_state("domcontentloaded", timeout=15_000)
                        _dbg("09c_img_view_frame", img_view_frame.content())
                except Exception as e_img:
                    result.notes.append(f"Mortgage lookup: HTML5 viewer nav failed — {e_img}")

            # ── Step 7: Parse page count from metadata ────────────────────────
            # Metadata text contains "Number of Pages: N" (not "of N").
            total_pages = 0
            pages_m = re.search(r"Number of Pages[:\s]+(\d+)", doc_text, re.I)
            if pages_m:
                try:
                    total_pages = int(pages_m.group(1))
                except ValueError:
                    pass

            # ── Step 8: Fetch last page image via getPage.do → OCR ────────────
            # The HTML5 viewer loads pages via AJAX: GET /countyweb/imageViewer/getPage.do
            # Returns JSON { status, pagePath, numberOfPages }.
            # pagePath is used to build the viewImagePNG.do URL for the actual image.
            # We call getPage.do from inside img_view_frame (already authenticated),
            # then download the PNG using requests with the Playwright session cookies.
            if img_view_frame and mort_inst_id and total_pages >= 1:
                # Scan last 3 pages for the borrower signature block
                sig_pages = list(range(max(1, total_pages - 2), total_pages + 1))
                import requests as _req, io as _io, time as _time
                cookies_list = page.context.cookies()
                sess_cookies = {c["name"]: c["value"] for c in cookies_list}

                for sig_page in sig_pages:
                    try:
                        gp_result = img_view_frame.evaluate(
                            f"""async () => {{
                                try {{
                                    const r = await fetch('/countyweb/imageViewer/getPage.do?'
                                        + 'addWatermarks=false&isPreview=false'
                                        + '&instnum={mort_inst_id}&pageNumber={sig_page}');
                                    return await r.json();
                                }} catch(e) {{ return {{status: 'error', error: String(e)}}; }}
                            }}"""
                        )
                        if not isinstance(gp_result, dict):
                            continue
                        if gp_result.get("status") != "success":
                            result.notes.append(
                                f"Mortgage lookup: getPage.do page {sig_page} status={gp_result.get('status')}"
                            )
                            continue

                        page_path = gp_result.get("pagePath", "")
                        # Update total_pages from API (authoritative)
                        api_total = gp_result.get("numberOfPages")
                        if api_total and not total_pages:
                            total_pages = int(api_total)

                        # Build PNG URL (session is tied to jsessionid in the URL path)
                        jsid_m = re.search(r"jsessionid=([A-F0-9]+)", doc_frame_html, re.I)
                        jsid_suffix = f";jsessionid={jsid_m.group(1)}" if jsid_m else ""
                        ts = int(_time.time() * 1000)
                        png_url = (
                            f"https://viewer.greenvillecounty.org/countyweb/viewImagePNG.do"
                            f"?ver={ts}&instnum={mort_inst_id}&isPreview=false"
                            f"&imgpath={page_path}{jsid_suffix}"
                        )
                        print(f"         Mortgage lookup: fetching page {sig_page} image...")
                        png_resp = _req.get(png_url, cookies=sess_cookies, timeout=30)
                        ctype = png_resp.headers.get("content-type", "")
                        if not ctype.startswith("image/"):
                            result.notes.append(
                                f"Mortgage lookup: page {sig_page} PNG fetch returned {ctype}"
                            )
                            continue

                        if debug:
                            img_file = DEBUG_DIR / f"mort_page_{sig_page}.png"
                            img_file.write_bytes(png_resp.content)
                            print(f"         Mortgage debug: saved {img_file.name}")

                        # OCR the page image
                        try:
                            import pytesseract
                            from PIL import Image as _PILImage
                            # Set tesseract path (Windows default install location)
                            _TESS_EXE = os.environ.get(
                                "TESSERACT_CMD",
                                r"C:\Program Files\Tesseract-OCR\tesseract.exe",
                            )
                            if os.path.exists(_TESS_EXE):
                                pytesseract.pytesseract.tesseract_cmd = _TESS_EXE
                            img_obj = _PILImage.open(_io.BytesIO(png_resp.content))
                            ocr_text = pytesseract.image_to_string(img_obj)
                            if ocr_text.strip():
                                doc_text += f"\n--- page {sig_page} OCR ---\n" + ocr_text
                                _dbg(f"12_ocr_page_{sig_page}", f"<pre>{ocr_text}</pre>")
                                print(
                                    f"         Mortgage lookup: OCR page {sig_page} "
                                    f"({len(ocr_text)} chars)"
                                )
                        except ImportError:
                            result.notes.append(
                                f"Mortgage lookup: page {sig_page} image OK — "
                                f"install pytesseract+pillow to enable OCR"
                            )

                    except Exception as e_gp:
                        result.notes.append(
                            f"Mortgage lookup: page {sig_page} fetch error — {e_gp}"
                        )

            print(f"         Mortgage lookup: {len(doc_text)} chars extracted (total pages: {total_pages or '?'})")
            result.notes.append(f"Mortgage lookup: document found for '{search_name}' near {rec_date_str}")

        except Exception as e:
            result.notes.append(f"Mortgage lookup: browser error — {e}")
            try:
                _dbg("99_error", page.content())
            except Exception:
                pass
            browser.close()
            return result
        browser.close()

    # ── Step 7: Parse borrower from document text ─────────────────────────────
    name, title = _parse_borrower_from_text(doc_text)
    if name:
        role = f"{title} (mortgage borrower signature)" if title else "Borrower (mortgage signature)"
        result.principal_name    = name
        result.principal_role    = role
        result.search_evidence   = f"{ROD_VIEWER_URL} — MORTGAGE · {entity_name} · recorded {rec_date_str}"
        result.enrichment_status = "enriched"
        result.notes.append(f"Mortgage lookup: borrower signature found — '{name}', {title or 'no title'}")
        print(f"   ✓ Mortgage borrower: {name}{', ' + title if title else ''}")
    else:
        result.notes.append(
            f"Mortgage lookup: document text parsed but no borrower signature found "
            f"(debug: set ENRICH_DEBUG=1 to inspect)"
        )

    return result


# ── Orchestrator ──────────────────────────────────────────────────────────────

def enrich(entity_name: str, address: str = "", dry_run: bool = False,
           signal: Optional[dict] = None) -> EnrichmentResult:
    """
    Run the full free enrichment chain for an LLC + address.
    Returns the best EnrichmentResult found.
    """
    print(f"\n── Enriching: {entity_name}")
    if address:
        print(f"   Address:  {address}")

    result = EnrichmentResult()
    debug  = os.environ.get("ENRICH_DEBUG") == "1"

    # Step 0: Mortgage borrower lookup (deed signals with LLC names only)
    # Searches Greenville County ROD viewer for a MORTGAGE filed by the same entity
    # on the same recording date. Extracts borrower name + title from signature block.
    sig_source  = (signal or {}).get("source", "")
    sig_details = (signal or {}).get("details", "")
    if sig_source == "deeds" and _LLC_NAME_RE.search(entity_name):
        rec_date = _parse_recording_date(sig_details)
        if rec_date:
            print(f"   [0/3] Mortgage borrower lookup (ROD viewer)...")
            mort_result = lookup_mortgage_borrower(entity_name, rec_date, debug=debug)
            for note in mort_result.notes:
                print(f"         {note}")
            if mort_result.is_enriched():
                if not dry_run:
                    return mort_result
                result = mort_result   # dry_run: fall through to show all steps
        else:
            print(f"   [0/3] Mortgage lookup: no recording date in details — skipping")

    # Step 1: GIS parcel lookup
    # If location is a real street address, pass it to lookup_gis for address-based search.
    # Otherwise search by entity name.
    print("   [1/3] Greenville County tax record lookup...")
    gis_result = lookup_gis(entity_name, address)
    for note in gis_result.notes:
        print(f"         {note}")
    if gis_result.principal_name:
        result = gis_result
        if result.is_enriched():
            # Greenville County tax records concatenate first+middle names without
            # spaces (e.g. "SMITH KENISHACHERRELL"). For simple deed grantees we
            # have the clean first name from the deed itself — use that instead.
            #
            # SKIP the deed-name override for joint grantees ("AND") or names with
            # 4+ words: those arrive in natural order (FIRST LAST), not deed order
            # (LAST FIRST), so normalize_person_name() would invert them.
            # In those cases, the GIS-resolved name is already correct.
            _llc_terms = ("llc", "inc", "corp", "ltd", "lp", "llp",
                          "holdings", "partners", "group", "properties")
            orig = entity_name  # entity_name from the deed (e.g. "SMITH KENISHA")
            orig_is_joint    = bool(re.search(r"\bAND\b", orig, re.I))
            orig_word_count  = len(orig.split())
            if (orig
                    and not any(t in orig.lower() for t in _llc_terms)
                    and not orig_is_joint
                    and orig_word_count <= 3):
                deed_name = normalize_person_name(orig)
                if deed_name:
                    result.principal_name = deed_name
            if result.property_address:
                print(f"   ✓ Found human: {result.principal_name} @ {result.property_address}")
            else:
                print(f"   ✓ Found human: {result.principal_name}")
            result.enrichment_status = "enriched"
            return result
        else:
            print(f"   → Owner is still an LLC: {result.principal_name}")
            # Use the GIS-found LLC name for next step if it differs
            if result.principal_name != entity_name:
                entity_name = result.principal_name

    # Step 1b: PIN Pivot — if GIS returned an LLC, fetch the Real Property detail
    # page (publicly accessible ASPX, no login) to get:
    #   - "Care Of" field: often names the human principal on an LLC-owned parcel
    #   - Mailing address: the LLC's tax-bill destination (may be owner's home)
    # Then try a GIS name search on the mailing address owner's name.
    if not result.is_enriched() and result.detail_url:
        pin_label = f"Map # {result.pin}" if result.pin else "parcel"
        print(f"   [1b/3] PIN pivot — fetching property detail ({pin_label})...")
        detail = lookup_property_detail(result.detail_url)

        care_of    = detail.get("care_of", "").strip()
        mail_addr  = detail.get("mailing_address", "").strip()

        # "Care Of" on an LLC tax record sometimes names the human principal.
        # Accept it only if it differs from the LLC name and isn't itself an entity.
        if care_of and not _LLC_TERMS_RE.search(care_of):
            care_words = care_of.lower().split()
            llc_words  = entity_name.lower().split()
            overlap    = len(set(care_words) & set(llc_words))
            if overlap < 2:  # more than 1 shared word → probably just the LLC name repeated
                human_name = normalize_person_name(care_of)
                print(f"   ✓ PIN pivot — Care Of: '{care_of}' → '{human_name}'")
                result.principal_name    = human_name
                result.principal_role    = "Care Of (property tax record)"
                result.search_evidence   = result.detail_url
                result.mailing_address   = mail_addr or None
                result.notes.append(f"PIN pivot: Care Of = '{care_of}' → '{human_name}'")
                result.enrichment_status = "enriched"
                return result

        if mail_addr:
            result.mailing_address = mail_addr
            result.notes.append(f"PIN pivot mailing address: {mail_addr}")
            print(f"         Mailing address: {mail_addr}")

            # Only attempt a GIS name flip if the mailing address is residential —
            # i.e. no suite/unit/apt designator and no PO Box.
            # Commercial office addresses (Ste 300, Floor 2, etc.) belong to the LLC
            # itself; searching them by street name finds nothing useful.
            _COMMERCIAL_RE = re.compile(
                r"\b(Ste|Suite|Apt|Apt\.|Apartment|Unit|#|Floor|Fl|Po Box|P\.?O\.? Box)\b",
                re.I,
            )
            first_line = mail_addr.split("\n")[0].strip()
            is_residential = (
                _is_street_address(first_line)
                and not _COMMERCIAL_RE.search(first_line)
            )
            if is_residential:
                # Search for owner of this residential parcel by owner name search
                # using just the street name (house number gives too-narrow match).
                street_name = re.sub(r"^\d+\s+", "", first_line).split(",")[0].strip()
                print(f"   [1c/3] GIS flip — residential mailing address: '{first_line}'...")
                flip_result = lookup_gis(street_name, first_line)
                for note in flip_result.notes:
                    print(f"          {note}")
                if flip_result.principal_name and flip_result.is_enriched():
                    print(f"   ✓ GIS flip found human: {flip_result.principal_name}")
                    result.principal_name    = flip_result.principal_name
                    result.principal_role    = "Property Owner at LLC mailing address (GIS flip)"
                    result.search_evidence   = flip_result.search_evidence
                    result.notes.append(
                        f"PIN pivot → mailing: {first_line} → "
                        f"GIS flip found '{flip_result.principal_name}'"
                    )
                    result.enrichment_status = "enriched"
                    return result
                else:
                    print(f"   → GIS flip returned LLC or no result — proceeding to web search")
            else:
                print(f"   → Commercial/PO Box mailing address — skipping GIS flip, using in DDG")
        else:
            print(f"   → No Care Of or mailing address on detail page")

    elif result.mailing_address and not result.is_enriched():
        # Legacy path: mailing address was already set (shouldn't happen with new code,
        # but kept for safety)
        mail_addr  = result.mailing_address
        first_line = mail_addr.split("\n")[0].strip()
        if _is_street_address(first_line):
            street_name = re.sub(r"^\d+\s+", "", first_line).split(",")[0].strip()
            print(f"   [1b/3] GIS flip — mailing address: {first_line}...")
            flip_result = lookup_gis(street_name, first_line)
            for note in flip_result.notes:
                print(f"          {note}")
            if flip_result.principal_name and flip_result.is_enriched():
                print(f"   ✓ GIS flip found human: {flip_result.principal_name}")
                result.principal_name    = flip_result.principal_name
                result.principal_role    = "Property Owner at LLC mailing address (GIS flip)"
                result.search_evidence   = flip_result.search_evidence
                result.notes.append(
                    f"GIS flip: '{flip_result.principal_name}' owns parcel at {first_line}"
                )
                result.enrichment_status = "enriched"
                return result
            else:
                print(f"   → GIS flip returned LLC or no result — proceeding to web search")

    # Step 2: DuckDuckGo search (also checks for SC SOS entity pages, UBJ, GSABiz)
    # Pass mailing address to DDG if we have one — adds context for the search.
    print("   [2/3] DuckDuckGo search + SC SOS entity page check...")

    ddg_result = enrich_via_duckduckgo(entity_name, result.mailing_address or address)
    for note in ddg_result.notes:
        print(f"         {note}")

    if ddg_result.is_enriched():
        result.principal_name  = ddg_result.principal_name
        result.principal_role  = ddg_result.principal_role
        result.search_evidence = ddg_result.search_evidence
        result.notes          += ddg_result.notes
        result.enrichment_status = "enriched"
        print(f"   ✓ Found human: {result.principal_name}")
        return result

    # Step 3: Manual queue — log all available context + deed signature link
    if result.mailing_address:
        result.notes.append(
            f"Manual follow-up: mailing address is {result.mailing_address} — "
            "check county property records at that address to find the owner"
        )
    result.notes.append(
        "Manual Assist: https://neumo.com/products/public-administration-solutions/search/ "
        "— search deed signature to unmask the signing principal"
    )

    print("   ↳ Status: pending (manual research needed)")
    print("   → Manual Assist: https://neumo.com/products/public-administration-solutions/search/")
    result.enrichment_status = "pending"
    return result


# ── Supabase read/write ───────────────────────────────────────────────────────

def fetch_pending_signals(limit: int = 20) -> list[dict]:
    """Return market_signals that don't yet have an enriched_leads row."""
    client = get_supabase()
    if not client:
        print("Supabase not configured.")
        return []

    # Fetch a large pool first, then filter — do NOT limit before filtering
    # or we'll miss older signals whose recent peers are already enriched.
    resp = (
        client.table("market_signals")
        .select("id, entity_name, location, event_type, valuation, score, tag, source, details")
        .order("created_at", desc=True)
        .limit(500)
        .execute()
    )
    all_signals = resp.data or []

    # Get signal IDs already in enriched_leads
    existing_resp = (
        client.table("enriched_leads")
        .select("signal_id")
        .execute()
    )
    existing_ids = {r["signal_id"] for r in (existing_resp.data or [])}

    unenriched = [s for s in all_signals if s["id"] not in existing_ids]
    return unenriched[:limit]


def save_enriched_lead(signal: dict, result: EnrichmentResult, dry_run: bool = False) -> None:
    # Prefer GIS-resolved property address (situs) over the raw signal location,
    # which may be a grantor name when no address was extractable from the deed.
    signal_location = signal.get("location", "")
    resolved_location = (
        result.property_address          # best: GIS-confirmed situs address
        or (signal_location if _is_street_address(signal_location) else None)
        or signal_location               # fallback: whatever is in the signal
    )

    row = {
        "signal_id":          signal["id"],
        "event_type":         signal.get("event_type"),
        "location":           resolved_location,
        "valuation":          signal.get("valuation"),
        "score":              signal.get("score"),
        "tag":                signal.get("tag"),
        "principal_name":     result.principal_name,
        "principal_role":     result.principal_role,
        "search_evidence":    result.search_evidence,
        "enrichment_status":  result.enrichment_status,
        "notes":              "\n".join(result.notes),
    }
    if dry_run:
        print("\n── Would insert to enriched_leads:")
        for k, v in row.items():
            if v:
                print(f"   {k}: {v}")
        return

    client = get_supabase()
    if not client:
        return
    client.table("enriched_leads").insert(row).execute()
    print(f"   ✓ Saved to enriched_leads (status: {result.enrichment_status})")


# ── CLI ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Upstate Multiplier — Lead Enrichment")
    parser.add_argument("--signal-id",    help="UUID of a market_signals row to enrich")
    parser.add_argument("--address",      help="Street address to look up")
    parser.add_argument("--entity",       help="LLC / entity name to unmask")
    parser.add_argument("--rec-date",     help="Recording date M/D/YYYY — runs mortgage lookup only (use with --entity)")
    parser.add_argument("--list-pending", action="store_true",
                        help="List market_signals not yet in enriched_leads")
    parser.add_argument("--run-pending",  action="store_true",
                        help="Enrich all unenriched signals (oldest first, max 10)")
    parser.add_argument("--dry-run",      action="store_true",
                        help="Print results without writing to Supabase")
    args = parser.parse_args()

    if args.list_pending:
        signals = fetch_pending_signals()
        if not signals:
            print("No unenriched signals found.")
            return
        print(f"\n── {len(signals)} signal(s) pending enrichment ──\n")
        for s in signals:
            val = f"  ${s['valuation']:,.0f}" if s.get("valuation") else ""
            print(f"  [{s['tag']}] {s['event_type']}{val}")
            print(f"       {s['location']} — {s['entity_name']}")
            print(f"       id: {s['id']}")
            print()
        return

    if args.run_pending:
        signals = fetch_pending_signals(limit=10)
        if not signals:
            print("No unenriched signals.")
            return
        for signal in signals:
            result = enrich(
                entity_name=signal["entity_name"],
                address=signal.get("location", ""),
                dry_run=args.dry_run,
                signal=signal,
            )
            save_enriched_lead(signal, result, dry_run=args.dry_run)
            time.sleep(2)  # polite delay between requests
        return

    if args.signal_id:
        client = get_supabase()
        if not client:
            print("Supabase not configured.")
            return
        resp = client.table("market_signals").select("*").eq("id", args.signal_id).single().execute()
        signal = resp.data
        if not signal:
            print(f"Signal not found: {args.signal_id}")
            return
        result = enrich(signal["entity_name"], signal.get("location", ""), args.dry_run, signal=signal)
        save_enriched_lead(signal, result, args.dry_run)
        return

    if args.entity and args.rec_date:
        # Standalone mortgage lookup test — no DB required
        debug = os.environ.get("ENRICH_DEBUG") == "1"
        print(f"\n── Mortgage lookup only: {args.entity} | {args.rec_date}")
        result = lookup_mortgage_borrower(args.entity, args.rec_date, debug=debug)
        for note in result.notes:
            print(f"   {note}")
        print(f"\n── Result ──")
        print(f"   principal_name: {result.principal_name or '—'}")
        print(f"   principal_role: {result.principal_role or '—'}")
        print(f"   status:         {result.enrichment_status}")
        return

    if args.entity or args.address:
        result = enrich(
            entity_name=args.entity or "",
            address=args.address or "",
            dry_run=args.dry_run,
        )
        print(f"\n── Result ──")
        print(f"   principal_name:    {result.principal_name or '—'}")
        print(f"   principal_role:    {result.principal_role or '—'}")
        print(f"   mailing_address:   {result.mailing_address or '—'}")
        print(f"   search_evidence:   {result.search_evidence or '—'}")
        print(f"   enrichment_status: {result.enrichment_status}")
        return

    parser.print_help()


if __name__ == "__main__":
    main()
