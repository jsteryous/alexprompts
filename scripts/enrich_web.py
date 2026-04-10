"""
enrich_web.py — DuckDuckGo HTML search and SC SOS entity page scraping.

Sources:
  2. DuckDuckGo HTML search — 5 targeted queries per entity
  3. SC SOS entity detail pages — no CAPTCHA on direct URLs
"""

import re
import time
from collections import Counter
from typing import Optional

import requests
from bs4 import BeautifulSoup

from enrich_models import (
    HEADERS,
    ROLE_SOS_INITIALS, ROLE_PRESS_UBJ, ROLE_PRESS_GBIZ, ROLE_WEB_SEARCH,
    _is_street_address,
    EnrichmentResult,
)

DDG_URL = "https://html.duckduckgo.com/html/"
SOS_BASE = "https://businessfilings.sc.gov"

_NAME_PATTERN    = re.compile(r"\b([A-Z][a-z]+ [A-Z][a-z]+)\b")
_SOS_URL_PATTERN = re.compile(r"businessfilings\.sc\.gov/BusinessFiling/Entity/Details/\d+")
_EMAIL_RE        = re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}")
_PHONE_RE        = re.compile(
    r"(?<!\d)"                          # not preceded by digit
    r"(\(?\d{3}\)?[\s.\-]{0,2}\d{3}[\s.\-]{0,2}\d{4})"
    r"(?!\d)"                           # not followed by digit
)

# Initials-LLC pattern: "LS Partners", "JM Holdings", "DRT Group", etc.
_INITIALS_LLC_RE = re.compile(
    r"^([A-Z]{2,5})\s+(?:Partners?|Group|Holdings?|Properties|Management|Associates|LLC|Inc\.?)",
    re.I,
)


def initials_match(llc_name: str, candidate_name: str) -> bool:
    """
    Check whether an LLC's leading initials match a person's name initials.

    Examples:
      initials_match("LS Partners", "Lowndes Smith")    → True
      initials_match("JM Holdings", "James Mitchell")   → True
      initials_match("DRT Group",   "David R Thompson") → True
      initials_match("ABC Corp",    "Alice Baker")      → False
    """
    m = _INITIALS_LLC_RE.match(llc_name.strip())
    if not m:
        return False
    initials = m.group(1).upper()
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
        print(f"  DDG search failed for query '{query[:60]}': {e}")
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
    result.search_evidence = url

    for table in soup.find_all("table"):
        rows = table.find_all("tr")
        for row in rows:
            cells = [td.get_text(strip=True) for td in row.find_all(["td", "th"])]
            if len(cells) < 2:
                continue
            role_keywords = ("agent", "officer", "director", "manager", "member", "organizer")
            if any(k in cells[0].lower() for k in role_keywords) and cells[1]:
                name = cells[1].strip()
                llc_terms = ("llc", "inc", "corp", "pa", "law", "firm", "group", "associates")
                if not any(t in name.lower() for t in llc_terms) and len(name.split()) >= 2:
                    result.principal_name = name
                    result.principal_role = f"SC SOS – {cells[0].strip().title()}"
                    result.notes.append(f"SOS: found '{name}' as {result.principal_role}")
                    break
        if result.principal_name:
            break

    if not result.principal_name:
        text = soup.get_text(" ")
        for keyword in ("Registered Agent:", "Manager:", "Officer:", "Organizer:"):
            idx = text.find(keyword)
            if idx != -1:
                snippet = text[idx + len(keyword):idx + len(keyword) + 60].strip()
                names = _NAME_PATTERN.findall(snippet)
                if names:
                    result.principal_name = names[0]
                    result.principal_role = f"SC SOS – {keyword.rstrip(':')}"
                    result.notes.append(f"SOS: extracted '{names[0]}' near '{keyword}'")
                    break

    return result


def enrich_via_duckduckgo(entity_name: str, address: str = "") -> EnrichmentResult:
    """
    Search DuckDuckGo for the LLC name and try to surface the human owner/principal,
    a SC SOS entity detail page URL, or a LinkedIn profile.
    """
    result = EnrichmentResult()

    q1 = f'"{entity_name}" Greenville SC owner'
    snippets1, urls1 = search_duckduckgo(q1)
    time.sleep(1.5)

    q2 = f'site:businessfilings.sc.gov "{entity_name}"'
    snippets2, urls2 = search_duckduckgo(q2)
    time.sleep(1.0)

    q3 = f'site:upstatebusinessjournal.com "{entity_name}"'
    snippets3, urls3 = search_duckduckgo(q3)
    time.sleep(1.0)

    q4 = f'site:gsabizwire.com "{entity_name}"'
    snippets4, urls4 = search_duckduckgo(q4)
    time.sleep(1.0)

    snippets5, urls5 = [], []
    if address and _is_street_address(address.split("\n")[0]):
        mail_first = address.split("\n")[0].strip().split(",")[0].strip()
        q5 = f'"{mail_first}" Greenville SC owner principal'
        snippets5, urls5 = search_duckduckgo(q5)
        time.sleep(1.0)

    all_snippets = snippets1 + snippets2 + snippets3 + snippets4 + snippets5
    all_urls     = urls1 + urls2 + urls3 + urls4 + urls5

    for url in all_urls:
        m = _SOS_URL_PATTERN.search(url)
        if m:
            result.search_evidence = f"https://{url}" if not url.startswith("http") else url
            result.notes.append(f"DDG: found SC SOS entity page — {result.search_evidence}")
            sos_result = scrape_sos_entity_page(result.search_evidence)
            if sos_result.principal_name:
                if initials_match(entity_name, sos_result.principal_name):
                    sos_result.notes.append(
                        f"Initials check: '{entity_name}' initials match "
                        f"'{sos_result.principal_name}' — high confidence"
                    )
                    sos_result.principal_role = ROLE_SOS_INITIALS
                return sos_result

    linkedin_urls = [u for u in all_urls if "linkedin.com/in/" in u]
    if linkedin_urls:
        result.notes.append(f"DDG: LinkedIn profile found — {linkedin_urls[0]}")
        if not result.search_evidence:
            result.search_evidence = linkedin_urls[0]

    candidate_names = []
    for snippet in all_snippets:
        matches = _NAME_PATTERN.findall(snippet)
        for name in matches:
            skip = {"South Carolina", "Greenville County", "United States",
                    "Register Deeds", "Business Filing", "Secretary State"}
            if name not in skip and len(name.split()) == 2:
                candidate_names.append(name)

    if candidate_names:
        initials_hits = [n for n in candidate_names if initials_match(entity_name, n)]
        if initials_hits:
            top_name = Counter(initials_hits).most_common(1)[0][0]
            result.notes.append(f"Initials check: '{top_name}' initials match '{entity_name}'")
        else:
            top_name = Counter(candidate_names).most_common(1)[0][0]
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
        ubj_urls  = [u for u in all_urls if "upstatebusinessjournal.com" in u]
        gbiz_urls = [u for u in all_urls if "gsabizwire.com" in u]
        if ubj_urls:
            result.principal_role  = ROLE_PRESS_UBJ
            result.search_evidence = result.search_evidence or ubj_urls[0]
        elif gbiz_urls:
            result.principal_role  = ROLE_PRESS_GBIZ
            result.search_evidence = result.search_evidence or gbiz_urls[0]
        else:
            result.principal_role  = ROLE_WEB_SEARCH
            result.search_evidence = result.search_evidence or f"DuckDuckGo: {q1}"
        result.notes.append(f"DDG: extracted name '{top_name}' from search snippets")

    # ── Contact extraction from snippets ──────────────────────────────────────
    # Run over all snippets regardless of whether we found a name — these fields
    # are passed back to the orchestrator and written to enriched_leads directly.
    full_text = " ".join(all_snippets)

    email_hits = _EMAIL_RE.findall(full_text)
    _EMAIL_NOISE = {"@example.com", "@domain.com", "@email.com", "@yoursite.com"}
    clean_emails = [
        e for e in email_hits
        if not any(e.lower().endswith(n) for n in _EMAIL_NOISE)
        and not e.lower().startswith("noreply")
        and not e.lower().startswith("support@")
        and not e.lower().startswith("info@")
    ]
    if clean_emails:
        result.contact_email = clean_emails[0]
        result.notes.append(f"DDG: extracted email '{result.contact_email}' from snippets")

    phone_hits = _PHONE_RE.findall(full_text)
    _PHONE_NOISE = {"800", "888", "877", "866", "855", "844", "833"}
    clean_phones = [
        p for p in phone_hits
        if re.sub(r"\D", "", p)[:3] not in _PHONE_NOISE
    ]
    if clean_phones:
        result.contact_phone = clean_phones[0]
        result.notes.append(f"DDG: extracted phone '{result.contact_phone}' from snippets")

    if linkedin_urls and not result.linkedin_url:
        result.linkedin_url = linkedin_urls[0]

    return result
