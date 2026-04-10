"""
enrich_mort.py — Greenville County ROD viewer mortgage OCR enrichment.

Source 0 in the enrichment chain: when an LLC signed a MORTGAGE on or near the
deed recording date, log into the county viewer, open the document, OCR the
signature page, and extract the borrower name + title.

Portal: viewer.greenvillecounty.org (standard CountyWeb — different from GovOS)
Credentials: ROD_VIEWER_USERNAME + ROD_PASSWORD (from .env.local)
"""

import io
import os
import re
import time
from datetime import datetime, timedelta
from typing import Optional
from pathlib import Path

import requests
from bs4 import BeautifulSoup

try:
    import pytesseract
    from PIL import Image as _PILImage
    _TESSERACT_AVAILABLE = True
except ImportError:
    _TESSERACT_AVAILABLE = False

from enrich_models import (
    HEADERS, DEBUG_DIR,
    ROLE_MORTGAGE_SIG,
    LLC_NAME_RE,
    choose_best_evidence_url,
    extract_best_property_address,
    EnrichmentResult,
)

ROD_VIEWER_URL      = "https://viewer.greenvillecounty.org/countyweb"
ROD_VIEWER_USERNAME = os.environ.get("ROD_VIEWER_USERNAME", "asteryous")
ROD_PASSWORD        = os.environ.get("ROD_PASSWORD")

# ── Borrower title vocabulary ─────────────────────────────────────────────────

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

# ── Name token patterns ───────────────────────────────────────────────────────

_NAME_TOKEN = r"[A-Z][A-Za-z']{0,2}(?:[A-Za-z0-9'\-]{0,18})"
_NAME_PAT   = rf"((?:{_NAME_TOKEN})(?:[\s\-](?:{_NAME_TOKEN})){{1,5}})"

# Noise roles: witnesses, notaries, lenders — NOT the borrower signer
_NOISE_ROLES = re.compile(
    r"\b(Witness|Notary|Notarial|Lender|Mortgagee|Grantor|Grantee|"
    r"Attorney|Counsel|Clerk|Commissioner|Subscribing|Attesting|"
    r"Acknowledgment|Acknowledged|State\s+of|County\s+of|Personally\s+appeared|"
    r"before\s+me|My\s+Commission|Commission\s+Expires|Sworn|Affirmed)\b",
    re.I,
)

# Structured regex patterns — tried in priority order
_BORROWER_RE = [
    re.compile(
        r"BORROWER:.*?By[\s_\-]{0,10}\S[^\n]*\n(?:\s*\n)*\s*"
        + _NAME_PAT + r",?\s*" + _BORROWER_TITLES_RE.pattern,
        re.I | re.DOTALL,
    ),
    re.compile(
        r"By[\s_\-]{0,10}[^\n]{0,60}\n(?:\s*\n)*\s*"
        + _NAME_PAT + r",\s*" + _BORROWER_TITLES_RE.pattern,
        re.I | re.MULTILINE,
    ),
    re.compile(
        r"(?:BORROWER|Borrower)[:\s]+" + _NAME_PAT + r",?\s*" + _BORROWER_TITLES_RE.pattern,
        re.I,
    ),
    re.compile(
        r"(?:BORROWER|Borrower)[:\s]*\r?\n\s*" + _NAME_PAT + r",?\s*" + _BORROWER_TITLES_RE.pattern,
        re.I | re.MULTILINE,
    ),
    re.compile(
        r"Name[:\s]+\n?\s*" + _NAME_PAT + r"\s*\n\s*Title[:\s]+\n?\s*" + _BORROWER_TITLES_RE.pattern,
        re.I | re.MULTILINE,
    ),
    re.compile(
        r"(?:BORROWER|Borrower)[:\s]+" + _NAME_PAT,
        re.I,
    ),
]

# ── Recording date parsing ────────────────────────────────────────────────────

_REC_DATE_RE = re.compile(r"recorded\s+(\d{1,2}/\d{1,2}/\d{4})", re.I)


def _parse_recording_date(details: str) -> Optional[str]:
    """Extract 'M/D/YYYY' recording date from the details field."""
    m = _REC_DATE_RE.search(details or "")
    return m.group(1) if m else None


# ── OCR helpers ───────────────────────────────────────────────────────────────

def _preprocess_ocr(text: str) -> str:
    """Normalise common OCR artefacts before pattern matching."""
    import unicodedata
    text = unicodedata.normalize("NFKC", text)
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"(?<=[A-Za-z])0(?=[a-z])", "o", text)
    text = re.sub(r"(?<=[A-Z])0(?=[A-Z])", "O", text)
    text = re.sub(r"\b1(?=[a-z])", "l", text)
    text = re.sub(r"\|", "I", text)
    text = re.sub(r"[_]{3,}", " ", text)
    text = re.sub(r"[=\-]{4,}", " ", text)
    text = re.sub(r"[ \t]{2,}", " ", text)
    text = "\n".join(line.rstrip() for line in text.splitlines())
    return text


def _is_name_like(token: str) -> bool:
    """Return True if token looks like a human name (2-5 words, each properly cased)."""
    token = token.strip()
    words = token.split()
    if not 2 <= len(words) <= 5:
        return False
    if LLC_NAME_RE.search(token):
        return False
    if re.search(r"\d{2,}", token):
        return False
    _VALID_WORD = re.compile(
        r"^[A-Z](?:[A-Za-z'\-]*[a-z][A-Za-z'\-]*|[A-Z]{1,2}[a-z].*)$"
    )
    particles = {"de", "la", "le", "van", "da", "di", "el", "al", "o", "mc", "mac",
                 "von", "der", "den", "ten", "ter", "af", "of", "y"}
    for w in words:
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
    return bool(LLC_NAME_RE.search(line)) or bool(
        re.search(r"\b(a\s+South\s+Carolina|a\s+Georgia|a\s+North\s+Carolina)\b", line, re.I)
    )


def _heuristic_borrower_scan(text: str) -> tuple[Optional[str], Optional[str]]:
    """
    Scored line-scanner fallback for borrower name extraction.
    Handles format variation, witnesses/notaries, multi-line names, and noisy OCR.
    """
    lines = text.splitlines()

    _BY_RE              = re.compile(r"^\s*By[\s_:\-]{0,6}", re.I)
    _BORROWER_RE_anchor = re.compile(r"\bBORROWER\b", re.I)
    _NAME_LABEL         = re.compile(r"^\s*Name\s*:", re.I)
    _TITLE_LABEL        = re.compile(r"^\s*Title\s*:", re.I)

    anchors: dict[int, int] = {}
    for i, ln in enumerate(lines):
        if _BORROWER_RE_anchor.search(ln):
            anchors[i] = 80
        elif _BY_RE.match(ln):
            anchors[i] = 60
        elif _NAME_LABEL.match(ln):
            anchors[i] = 40

    for i in range(max(0, len(lines) - 25), len(lines)):
        anchors.setdefault(i, 10)

    candidates: list[tuple[int, str, Optional[str]]] = []
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
        if title:
            score += 40
        if is_after_borrower:
            score += 35
        if is_after_by:
            score += 25
        score += anchor_strength // 4

        words = name.split()
        if 2 <= len(words) <= 3:
            score += 10
        elif len(words) == 4:
            score += 5

        if _NOISE_ROLES.search(name):
            score -= 80
        if _is_entity_line(name):
            score -= 100
        if re.search(r"\d{2,}", name):
            score -= 40

        context = " ".join(lines[max(0, line_idx - 2): line_idx + 3])
        if re.search(r"\b(Witness|Notary|Notarial|Subscribing)\b", context, re.I):
            score -= 30
        if re.search(r"\b(Lender|Mortgagee)\b", context, re.I):
            score -= 20

        return score

    for anchor_idx, anchor_strength in sorted(anchors.items()):
        is_after_by       = _BY_RE.match(lines[anchor_idx])
        is_after_borrower = _BORROWER_RE_anchor.search(lines[anchor_idx])
        window = range(anchor_idx + 1, min(anchor_idx + 11, len(lines)))

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

        for i in window:
            if i in visited:
                continue
            visited.add(i)
            line = lines[i].strip()
            if not line:
                continue
            if _is_entity_line(line):
                continue
            if len(line) > 80:
                continue
            if re.match(r"^(State|County|In\s+Witness|Before\s+me|Sworn)", line, re.I):
                continue

            title: Optional[str] = None

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

    best_by_name: dict[str, tuple[int, Optional[str]]] = {}
    for score, name, title in candidates:
        key = re.sub(r"\s+", " ", name.lower().strip())
        prev_score, _ = best_by_name.get(key, (-999, None))
        if score > prev_score:
            best_by_name[key] = (score, title)

    ranked = sorted(best_by_name.items(), key=lambda x: x[1][0], reverse=True)
    if not ranked:
        return None, None

    top_name, (top_score, top_title) = ranked[0]
    if top_score < 0:
        return None, None

    # Recover original casing from the candidates list (best_by_name stores lowercased keys).
    for _, name, t in sorted(candidates, key=lambda x: -x[0]):
        if re.sub(r"\s+", " ", name.lower().strip()) == top_name:
            return name, top_title or t

    return None, None


def _parse_borrower_from_text(text: str) -> tuple[Optional[str], Optional[str]]:
    """
    Extract borrower name + title from raw OCR document text.
    Strategy: preprocess OCR → structured regex → scored heuristic scanner.
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
        if LLC_NAME_RE.search(name):
            continue
        if _NOISE_ROLES.search(name):
            continue

        return _normalise_name(name), title

    return _heuristic_borrower_scan(tail)


# ── Main lookup ───────────────────────────────────────────────────────────────

def lookup_mortgage_borrower(
    entity_name: str,
    rec_date_str: str,
    debug: bool = False,
) -> EnrichmentResult:
    """
    Log into the Greenville County ROD viewer, find the MORTGAGE filed by
    entity_name near rec_date_str, OCR the signature page, and extract
    the borrower name + title.

    rec_date_str: 'M/D/YYYY' format as stored in market_signals.details.
    Set ENRICH_DEBUG=1 to save HTML snapshots to scripts/debug/.
    """
    result = EnrichmentResult()
    mortgage_evidence_url: Optional[str] = None

    if not ROD_PASSWORD:
        result.notes.append("Mortgage lookup: ROD_PASSWORD not set in .env.local — skipping")
        return result

    try:
        from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError
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

    try:
        rec_dt    = datetime.strptime(rec_date_str, "%m/%d/%Y")
        date_from = (rec_dt - timedelta(days=3)).strftime("%m/%d/%Y")
        date_to   = (rec_dt + timedelta(days=3)).strftime("%m/%d/%Y")
    except (ValueError, TypeError):
        result.notes.append(f"Mortgage lookup: could not parse date '{rec_date_str}'")
        return result

    search_name = re.sub(
        r"\b(LLC|INC|CORP|LTD|LP|LLP|,)\b", "", entity_name, flags=re.I
    ).strip(" ,.")

    print(f"         Mortgage lookup: '{search_name}' | {date_from}–{date_to}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page    = browser.new_page()
        doc_text = ""
        try:
            # ── Step 1: Log in ──────────────────────────────────────────────
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

            # ── Step 2: Accept disclaimer ───────────────────────────────────
            page.wait_for_timeout(2_000)
            frame = page.frame(name="bodyframe")
            if frame is None:
                result.notes.append("Mortgage lookup: bodyframe not found")
                _dbg("03b_no_frame", page.content())
                browser.close()
                return result

            _dbg("04_bodyframe_initial", frame.content())

            if frame.locator("input[name='accept']").count() > 0:
                print("         Mortgage lookup: accepting disclaimer...")
                with page.expect_navigation(timeout=15_000):
                    frame.click("input[name='accept']")
                page.wait_for_load_state("domcontentloaded", timeout=15_000)
                page.wait_for_timeout(2_000)
                frame = page.frame(name="bodyframe")
                if frame is None:
                    result.notes.append("Mortgage lookup: bodyframe lost after disclaimer accept")
                    browser.close()
                    return result

            _dbg("04b_after_disclaimer", frame.content())
            print(f"         Mortgage lookup: bodyframe URL → {frame.url}")

            # ── Step 3: Navigate to search page ────────────────────────────
            nav_link = page.locator("a[href*='searchMain.do']")
            if nav_link.count() > 0:
                print("         Mortgage lookup: clicking nav link → bodyframe...")
                nav_link.first.click()
            else:
                page.evaluate("window.frames['bodyframe'].location = '/countyweb/search/searchMain.do?defaultType=Public'")

            frame.wait_for_load_state("domcontentloaded", timeout=15_000)
            frame.wait_for_timeout(1_500)
            frame = page.frame(name="bodyframe")
            if frame is None:
                result.notes.append("Mortgage lookup: bodyframe lost after search nav")
                browser.close()
                return result
            _dbg("05_search_page", frame.content())
            print(f"         Mortgage lookup: search page loaded → {frame.url}")

            # ── Step 4: Access criteria form ────────────────────────────────
            page.wait_for_timeout(2_000)
            sf = page.frame(name="dynSearchFrame") or page.frame(name="searchFrame")
            if sf is None:
                result.notes.append("Mortgage lookup: search criteria frame not found")
                browser.close()
                return result

            try:
                sf.wait_for_load_state("domcontentloaded", timeout=15_000)
            except PlaywrightTimeoutError:
                pass

            _dbg("06_search_form", sf.content())
            print(f"         Mortgage lookup: search form URL → {sf.url}")

            cf = page.frame(name="criteriaframe")
            if cf is None:
                result.notes.append("Mortgage lookup: criteriaframe not found")
                browser.close()
                return result

            try:
                cf.wait_for_load_state("domcontentloaded", timeout=15_000)
                cf.wait_for_selector("input[type='text']", timeout=10_000)
            except PlaywrightTimeoutError:
                pass
            _dbg("07_criteria_form", cf.content())
            print(f"         Mortgage lookup: criteria frame URL → {cf.url}")

            cf.evaluate("(name) => $('#allNames').textbox('setValue', name)", search_name)
            print(f"         Mortgage lookup: set ALLNAMES = '{search_name}'")

            cf.evaluate(f"$('#FROMDATE').datebox('setValue', '{date_from}')")
            cf.evaluate(f"$('#TODATE').datebox('setValue', '{date_to}')")
            print(f"         Mortgage lookup: date range {date_from} → {date_to}")

            cf.evaluate("document.getElementById('partyRBBoth').checked = true;")
            _dbg("08_form_filled", cf.content())

            cf.evaluate("executeSearch()")
            page.wait_for_timeout(5_000)

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
            except PlaywrightTimeoutError:
                pass
            _dbg("09_search_results", results_frame.content())
            print(f"         Mortgage lookup: results frame URL → {results_frame.url}")

            # ── Step 5: Open first MORTGAGE row ────────────────────────────
            results_text = BeautifulSoup(
                results_frame.content(), "html.parser"
            ).get_text(" ", strip=True)

            if "no record" in results_text.lower() or "0 record" in results_text.lower():
                result.notes.append(
                    f"Mortgage lookup: no MORTGAGE found for '{search_name}' near {rec_date_str}"
                )
                browser.close()
                return result

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
                        iid_m = re.search(
                            rf"documentRowInfo\[{target_idx}\]\.instId\s*=\s*[\"'](\d+)",
                            results_html,
                        )
                        if iid_m:
                            mort_inst_id = iid_m.group(1)
                        break

            if target_idx is None:
                _doc_types = [
                    r.select_one("td[field='7'] div") and r.select_one("td[field='7'] div").get_text(strip=True)
                    for r in results_soup.select("tr[datagrid-row-index]")
                ]
                result.notes.append(
                    f"Mortgage lookup: results found but no MORTGAGE/DEED OF TRUST row — only: {_doc_types}"
                )
                _dbg("09b_no_mortgage_row", results_frame.content())
                browser.close()
                return result

            doc_link = results_frame.locator(f"a#inst{target_idx}")
            if doc_link.count() == 0:
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

            doc_frame = page.frame(name="documentFrame")
            if doc_frame is None:
                result.notes.append("Mortgage lookup: documentFrame not found after clicking result")
                browser.close()
                return result

            try:
                doc_frame.wait_for_load_state("domcontentloaded", timeout=20_000)
                doc_frame.wait_for_timeout(2_000)
            except PlaywrightTimeoutError:
                pass
            _dbg("09_document_viewer", doc_frame.content())

            # ── Step 6: Extract text from docInfoFrame ──────────────────────
            page.wait_for_timeout(1_500)
            doc_info_frame = page.frame(name="docInfoFrame")
            if doc_info_frame:
                try:
                    doc_info_frame.wait_for_load_state("domcontentloaded", timeout=15_000)
                    doc_info_frame.wait_for_timeout(1_000)
                except PlaywrightTimeoutError:
                    pass
                _dbg("09b_doc_info_frame", doc_info_frame.content())
                doc_text = doc_info_frame.inner_text("body")
            else:
                doc_text = doc_frame.inner_text("body")

            # ── Step 6b: HTML5 viewer for PNG fetch ─────────────────────────
            doc_frame_html = doc_frame.content()
            img_viewer_m = re.search(r"InstrumentImageView\.jsp\?[^\"']+", doc_frame_html)
            img_view_frame = None
            html5_url = ""
            if img_viewer_m:
                html5_url = img_viewer_m.group(0).replace("&amp;", "&").rstrip(";")
                if not html5_url.startswith("http"):
                    html5_url = f"https://viewer.greenvillecounty.org/countyweb/search/{html5_url}"
                mortgage_evidence_url = choose_best_evidence_url(html5_url, mortgage_evidence_url)
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

            # ── Step 7: Parse page count ────────────────────────────────────
            total_pages = 0
            pages_m = re.search(r"Number of Pages[:\s]+(\d+)", doc_text, re.I)
            if pages_m:
                try:
                    total_pages = int(pages_m.group(1))
                except ValueError:
                    pass

            # ── Step 8: Fetch signature page PNG and OCR ────────────────────
            if img_view_frame and mort_inst_id and total_pages >= 1:
                sig_pages = list(range(max(1, total_pages - 2), total_pages + 1))
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
                        api_total = gp_result.get("numberOfPages")
                        if api_total and not total_pages:
                            total_pages = int(api_total)

                        jsid_m     = re.search(r"jsessionid=([A-F0-9]+)", doc_frame_html, re.I)
                        jsid_suffix = f";jsessionid={jsid_m.group(1)}" if jsid_m else ""
                        ts = int(time.time() * 1000)
                        png_url = (
                            f"https://viewer.greenvillecounty.org/countyweb/viewImagePNG.do"
                            f"?ver={ts}&instnum={mort_inst_id}&isPreview=false"
                            f"&imgpath={page_path}{jsid_suffix}"
                        )
                        print(f"         Mortgage lookup: fetching page {sig_page} image...")
                        png_resp = requests.get(png_url, cookies=sess_cookies, timeout=30)
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

                        if not _TESSERACT_AVAILABLE:
                            result.notes.append(
                                f"Mortgage lookup: page {sig_page} image OK — "
                                f"install pytesseract+pillow to enable OCR"
                            )
                        else:
                            _TESS_EXE = os.environ.get(
                                "TESSERACT_CMD",
                                r"C:\Program Files\Tesseract-OCR\tesseract.exe",
                            )
                            if os.path.exists(_TESS_EXE):
                                pytesseract.pytesseract.tesseract_cmd = _TESS_EXE
                            img_obj = _PILImage.open(io.BytesIO(png_resp.content))
                            ocr_text = pytesseract.image_to_string(img_obj)
                            if ocr_text.strip():
                                doc_text += f"\n--- page {sig_page} OCR ---\n" + ocr_text
                                _dbg(f"12_ocr_page_{sig_page}", f"<pre>{ocr_text}</pre>")
                                print(
                                    f"         Mortgage lookup: OCR page {sig_page} "
                                    f"({len(ocr_text)} chars)"
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

    # ── Step 9: Parse borrower from document text ─────────────────────────────
    result.property_address = extract_best_property_address(doc_text)
    if result.property_address:
        result.notes.append(f"Mortgage lookup: property address found â€” '{result.property_address}'")

    name, title = _parse_borrower_from_text(doc_text)
    if name:
        role = f"{ROLE_MORTGAGE_SIG} – {title}" if title else ROLE_MORTGAGE_SIG
        result.principal_name    = name
        result.principal_role    = role
        result.search_evidence   = choose_best_evidence_url(mortgage_evidence_url)
        result.enrichment_status = "enriched"
        result.notes.append(f"Mortgage lookup: borrower signature found — '{name}', {title or 'no title'}")
        print(f"   ✓ Mortgage borrower: {name}{', ' + title if title else ''}")
    else:
        result.notes.append(
            f"Mortgage lookup: document text parsed but no borrower signature found "
            f"(debug: set ENRICH_DEBUG=1 to inspect)"
        )

    return result
