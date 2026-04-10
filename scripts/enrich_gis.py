"""
enrich_gis.py — Greenville County GIS / tax query enrichment.

Sources:
  1. votaxqry — GVL county tax record name search (Playwright, JS-gated)
  2. RealProperty/Details.aspx — parcel detail page with Care Of + mailing address
"""

import os
import re
from typing import Optional

import requests
from bs4 import BeautifulSoup

from enrich_models import (
    HEADERS, DEBUG_DIR,
    ROLE_GIS_OWNER,
    _LLC_TERMS_RE,
    _is_street_address,
    choose_best_evidence_url,
    is_non_human_name,
    normalize_person_name,
    EnrichmentResult,
)

TAX_QUERY_URL = "https://www.greenvillecounty.org/appsas400/votaxqry/"

# ── Row parsing helpers ───────────────────────────────────────────────────────

# Vehicle record identifiers found in GVL tax results
_VEHICLE_RE = re.compile(
    r"\b(CHEV|FORD|GMC|TOYT|HOND|NISS|DODG|JEEP|CHRY|BUIC|CADI|LINC|MERC|VOLK|HYUN|KIA|"
    r"BMW|BENZ|AUDI|LEXU|ACUR|INFI|MITS|SUBA|VOLV|BOAT|TRLR|MOTO|UTIL|SEMI|TRAIL)\b",
    re.I,
)

# Reject cells that look like tax payment / account data, not addresses
_TAX_NOISE_RE = re.compile(r"\$[\d,.]|District:|^\d{4}\s+\d{2}\s+\d+", re.I)


def _is_vehicle_record(cells: list[str]) -> bool:
    """Return True if this tax row describes a vehicle, not real estate."""
    return bool(_VEHICLE_RE.search(" ".join(cells)))


def _looks_like_address(s: str) -> bool:
    return bool(s) and not _TAX_NOISE_RE.search(s)


def _parse_tax_row(cells: list[str]) -> tuple[str, Optional[str], Optional[str]]:
    """
    Parse a Greenville County tax query result row into
    (owner_raw, property_address, mailing_address).
    """
    owner_raw = cells[0] if cells else ""
    owner_raw = re.sub(r"VIN#?:?\s*\S+.*$", "", owner_raw, flags=re.IGNORECASE).strip()
    owner_raw = re.sub(r"\d{4}\s+\d{6,}.*$", "", owner_raw).strip()
    owner_raw = re.sub(r"View Tax Notice.*$", "", owner_raw, flags=re.IGNORECASE).strip()
    owner_raw = re.sub(r"\s*\(JTWROS\).*$", "", owner_raw, flags=re.IGNORECASE).strip()
    owner_raw = re.sub(r"\s+[A-Z]$", "", owner_raw).strip()

    prop_addr = None
    mail_addr = None

    if len(cells) >= 2:
        candidate = cells[1].strip()
        if _is_street_address(candidate) and _looks_like_address(candidate):
            prop_addr = candidate
            mail_parts = [c for c in cells[2:5] if _looks_like_address(c)]
            mail_addr  = " ".join(mail_parts) if mail_parts else None
        else:
            mail_parts = [c for c in cells[1:4] if _looks_like_address(c) and _is_street_address(c)]
            mail_addr  = mail_parts[0] if mail_parts else None

    return owner_raw, prop_addr, mail_addr


# ── Source 1: GVL tax query (Playwright) ─────────────────────────────────────

def lookup_gis(entity_name: str, address: str = "", _retried: bool = False) -> EnrichmentResult:
    """
    Search Greenville County tax records by entity/owner name.

    Falls back to name-flip retry on 0 results.
    Uses Playwright because the form requires JavaScript tab selection.
    """
    result = EnrichmentResult()
    debug = os.environ.get("ENRICH_DEBUG") == "1"

    search_term = re.sub(r"\s+AND\s+.*$", "", entity_name, flags=re.I)
    search_term = re.sub(r"\b(LLC|INC|CORP|LTD|LP|LLP)\b", "", search_term, flags=re.I).strip(" ,.")
    if not search_term:
        result.notes.append("GIS: no usable search term after stripping entity suffixes")
        return result

    try:
        from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError
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
        print(f"         GIS debug: saved {path.name}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto(TAX_QUERY_URL, timeout=20_000)
            page.wait_for_load_state("domcontentloaded", timeout=15_000)
            page.wait_for_timeout(800)

            _save_debug("01_initial_page", page.content())

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

            with page.expect_navigation(timeout=20_000):
                page.keyboard.press("Enter")
            page.wait_for_load_state("domcontentloaded", timeout=10_000)
            page.wait_for_timeout(500)

            html = page.content()
            _save_debug("04_results", html)
        except Exception as e:
            result.notes.append(f"GIS: browser error — {e}")
            try:
                _save_debug("99_error", page.content())
            except Exception:
                pass
            browser.close()
            return result
        browser.close()

    soup = BeautifulSoup(html, "html.parser")

    page_text = soup.get_text(" ", strip=True)
    zero_match = re.search(r"Results Found:\s*0", page_text)
    if zero_match:
        result.notes.append(f"GIS: 0 real estate records found for '{search_term}'")
        words = search_term.split()
        if not _retried and 2 <= len(words) <= 3:
            if len(words) == 2:
                flipped = f"{words[1]} {words[0]}"
            elif len(words[2]) == 1:
                flipped = f"{words[0]} {words[1]}"
            else:
                flipped = f"{words[2]} {words[0]} {words[1]}"
            result.notes.append(f"GIS: retrying with flipped name order '{flipped}'")
            flip = lookup_gis(flipped, address, _retried=True)
            if flip.principal_name:
                flip.notes = result.notes + flip.notes
                return flip
        return result

    rows = soup.select("table tr")
    if not rows:
        result.notes.append(f"GIS: no results for '{search_term}'")
        return result

    for row in rows[1:]:
        cells_el = row.find_all("td")
        cells = [td.get_text(strip=True) for td in cells_el]
        if len(cells) < 2:
            continue

        if _is_vehicle_record(cells):
            result.notes.append(f"GIS: skipping vehicle record row ({cells[0][:40]}...)")
            continue

        owner_raw, prop_addr, mail_addr = _parse_tax_row(cells)
        if not owner_raw:
            continue

        pin_raw = re.sub(r"\s+", "", cells[1]) if len(cells) > 1 else ""
        result.pin = pin_raw if re.match(r"^\d{7,15}$", pin_raw) else None

        detail_url = None
        if cells_el:
            anchor = cells_el[0].find("a", href=lambda h: h and "RealProperty/Details.aspx" in h)
            if anchor:
                href = anchor["href"]
                detail_url = href if href.startswith("http") else f"https://www.greenvillecounty.org{href}"
        result.detail_url = detail_url

        result.property_address = prop_addr
        if is_non_human_name(owner_raw):
            result.principal_name = owner_raw.title()
        else:
            result.principal_name = normalize_person_name(owner_raw)
        result.principal_role   = ROLE_GIS_OWNER
        result.search_evidence  = choose_best_evidence_url(detail_url, TAX_QUERY_URL)
        result.notes.append(
            f"GIS: tax record owner '{owner_raw}' → '{result.principal_name}'"
            + (f" (Map # {result.pin})" if result.pin else "")
        )
        break
    return result


# ── Source 1b: Real Property detail page ─────────────────────────────────────

_DETAIL_FIELDS = [
    ("owner",           re.compile(r"Owner\(s\):\s*(.+?)(?=Previous Owner:|Care Of:|Mailing Address:|DESCRIPTION)", re.I | re.S)),
    ("care_of",         re.compile(r"Care Of:\s*(.+?)(?=Mailing Address:|DESCRIPTION)", re.I | re.S)),
    ("mailing_address", re.compile(r"Mailing Address:\s*(.+?)(?=\*\s*-\s*Please|DESCRIPTION)", re.I | re.S)),
    ("location",        re.compile(r"\bLocation:\s*(.+?)(?=Subdivision:|Deed|$)", re.I | re.S)),
]


def lookup_property_detail(detail_url: str) -> dict:
    """
    Fetch the GVL Real Property detail page for a parcel.
    Returns dict with keys: owner, care_of, mailing_address, location.
    """
    out = {}
    try:
        resp = requests.get(detail_url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
    except Exception as e:
        print(f"  GIS property detail fetch failed ({detail_url}): {e}")
        return out

    text = BeautifulSoup(resp.text, "html.parser").get_text(" ", strip=True)
    for key, pattern in _DETAIL_FIELDS:
        m = pattern.search(text)
        if m:
            val = m.group(1).strip()
            if not val:
                continue
            if key == "care_of" and re.search(r"Mailing Address:", val, re.I):
                val = re.split(r"Mailing Address:", val, flags=re.I)[0].strip()
            if not val or (key == "care_of" and len(val) > 60):
                continue
            out[key] = val
    return out
