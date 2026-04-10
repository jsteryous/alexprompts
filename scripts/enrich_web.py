"""
enrich_web.py - DuckDuckGo HTML search and SC SOS entity page scraping.

Sources:
  2. DuckDuckGo HTML search - 5 targeted queries per entity
  3. SC SOS entity detail pages - no CAPTCHA on direct URLs
"""

import re
import time
from collections import Counter
from typing import Optional

import requests
from bs4 import BeautifulSoup

from enrich_models import (
    HEADERS,
    ROLE_PRESS_GBIZ,
    ROLE_PRESS_UBJ,
    ROLE_SOS_INITIALS,
    ROLE_WEB_SEARCH,
    EnrichmentResult,
    _is_street_address,
    choose_best_evidence_url,
    is_non_human_name,
    normalize_person_name,
)

DDG_URL = "https://html.duckduckgo.com/html/"
SOS_BASE = "https://businessfilings.sc.gov"

_NAME_PATTERN = re.compile(r"\b([A-Z][a-z]+ [A-Z][a-z]+)\b")
_SOS_URL_PATTERN = re.compile(r"businessfilings\.sc\.gov/BusinessFiling/Entity/Details/\d+")
_EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}")
_PHONE_RE = re.compile(
    r"(?<!\d)"
    r"(\(?\d{3}\)?[\s.\-]{0,2}\d{3}[\s.\-]{0,2}\d{4})"
    r"(?!\d)"
)

# Initials-LLC pattern: "LS Partners", "JM Holdings", "DRT Group", etc.
_INITIALS_LLC_RE = re.compile(
    r"^([A-Z]{2,5})\s+(?:Partners?|Group|Holdings?|Properties|Management|Associates|LLC|Inc\.?)",
    re.I,
)
_SOS_ACCEPT_SCORE = 85
_ENTITY_SUFFIXES = {
    "llc", "l", "c", "inc", "corp", "corporation", "co", "company", "ltd",
    "lp", "llp", "pllc", "pc", "pa",
}
_ENTITY_STOPWORDS = {"the", "of", "and"}
_ENTITY_VARIANT_TOKENS = {
    "associates", "capital", "development", "enterprises", "enterprise", "group",
    "holdings", "holding", "investments", "management", "partners", "partner",
    "properties", "property", "realty", "services", "solutions", "ventures",
}
_PERSON_NOISE_TOKENS = {
    "agent", "authorized", "business", "company", "county", "entity", "filing",
    "manager", "member", "office", "registered", "secretary", "service", "state",
    "street", "suite",
}


def initials_match(llc_name: str, candidate_name: str) -> bool:
    """
    Check whether an LLC's leading initials match a person's name initials.

    Examples:
      initials_match("LS Partners", "Lowndes Smith") -> True
      initials_match("JM Holdings", "James Mitchell") -> True
      initials_match("DRT Group", "David R Thompson") -> True
      initials_match("ABC Corp", "Alice Baker") -> False
    """
    m = _INITIALS_LLC_RE.match(llc_name.strip())
    if not m:
        return False
    initials = m.group(1).upper()
    name_parts = [p for p in candidate_name.split() if p and p[0].isupper()]
    name_initials = "".join(p[0].upper() for p in name_parts)
    return name_initials.startswith(initials)


def _normalize_entity_tokens(value: str) -> list[str]:
    value = (value or "").strip().lower().replace("&", " and ")
    value = re.sub(r"[^a-z0-9\s]", " ", value)
    tokens = [t for t in value.split() if t]
    while tokens and tokens[-1] in _ENTITY_SUFFIXES:
        tokens.pop()
    return [t for t in tokens if t not in _ENTITY_STOPWORDS]


def _score_entity_name_match(expected_name: str, page_name: str) -> tuple[int, str]:
    expected_tokens = _normalize_entity_tokens(expected_name)
    page_tokens = _normalize_entity_tokens(page_name)
    if not expected_tokens or not page_tokens:
        return 0, "unscored"

    if expected_tokens == page_tokens:
        return 100, "exact normalized match"

    overlap = sum(1 for token in expected_tokens if token in page_tokens)
    if not overlap:
        return 0, "no token overlap"

    coverage = overlap / len(expected_tokens)
    precision = overlap / len(page_tokens)
    prefix_hits = 0
    for expected_token, page_token in zip(expected_tokens, page_tokens):
        if expected_token != page_token:
            break
        prefix_hits += 1

    score = int((coverage * 55) + (precision * 25) + (prefix_hits * 10))
    score -= abs(len(page_tokens) - len(expected_tokens)) * 12
    extra_tokens = [token for token in page_tokens if token not in expected_tokens]
    score -= sum(15 for token in extra_tokens if token in _ENTITY_VARIANT_TOKENS)
    if expected_tokens[0] != page_tokens[0]:
        score -= 20

    reason_parts = [f"{overlap}/{len(expected_tokens)} target tokens overlap"]
    if prefix_hits:
        reason_parts.append(f"{prefix_hits} leading tokens align")
    if len(page_tokens) != len(expected_tokens):
        reason_parts.append(f"{len(page_tokens)} page tokens vs {len(expected_tokens)} target tokens")
    return max(score, 0), "; ".join(reason_parts)


def _extract_sos_entity_name(soup: BeautifulSoup) -> str:
    for selector in ("h1", ".entity-name", "h2", ".page-title"):
        el = soup.select_one(selector)
        if el:
            text = el.get_text(" ", strip=True)
            if text:
                return text

    for table in soup.find_all("table"):
        for row in table.find_all("tr"):
            cells = [td.get_text(" ", strip=True) for td in row.find_all(["td", "th"])]
            if len(cells) < 2:
                continue
            label = cells[0].lower().rstrip(":")
            if label in {"entity name", "business name", "legal name", "name"} and cells[1]:
                return cells[1].strip()

    title_el = soup.find("title")
    if title_el:
        return title_el.get_text(" ", strip=True).split("|")[0].strip()
    return ""


def _looks_like_person_name(value: str) -> bool:
    text = re.sub(r"\s+", " ", (value or "").strip(" ,;:"))
    if not text or len(text) > 80:
        return False
    if any(ch.isdigit() for ch in text):
        return False
    if _EMAIL_RE.search(text) or _PHONE_RE.search(text):
        return False
    if _is_street_address(text):
        return False
    if is_non_human_name(text):
        return False

    words = re.findall(r"[A-Za-z][A-Za-z'.-]*", text)
    if not 2 <= len(words) <= 5:
        return False
    if any(word.lower() in _PERSON_NOISE_TOKENS for word in words):
        return False
    return True


def search_duckduckgo(query: str) -> tuple[list[str], list[str]]:
    """
    Run a DuckDuckGo HTML search. Returns (text_snippets, urls_found).
    Rate-limit: 1 request per call; caller should sleep between calls.
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
        url_el = result.select_one(".result__url")
        if snippet_el:
            snippets.append(snippet_el.get_text(" ", strip=True))
        if url_el:
            urls.append(url_el.get_text(strip=True))

    return snippets, urls


def scrape_sos_entity_page(url: str, expected_entity_name: str = "") -> EnrichmentResult:
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
        result.notes.append(f"SOS: fetch failed - {e}")
        return result

    soup = BeautifulSoup(resp.text, "html.parser")
    result.search_evidence = choose_best_evidence_url(url)

    page_entity_name = _extract_sos_entity_name(soup)
    if page_entity_name:
        score, reason = _score_entity_name_match(expected_entity_name, page_entity_name)
        result.notes.append(
            f"SOS: entity page '{page_entity_name}' scored {score} for '{expected_entity_name}' ({reason})"
        )
        if expected_entity_name and score < _SOS_ACCEPT_SCORE:
            result.notes.append("SOS: rejected candidate entity page before principal extraction")
            return result
    elif expected_entity_name:
        result.notes.append("SOS: could not verify entity name on detail page")
        return result

    for table in soup.find_all("table"):
        rows = table.find_all("tr")
        for row in rows:
            cells = [td.get_text(" ", strip=True) for td in row.find_all(["td", "th"])]
            if len(cells) < 2:
                continue
            role_keywords = ("agent", "officer", "director", "manager", "member", "organizer")
            if any(k in cells[0].lower() for k in role_keywords) and cells[1]:
                name = cells[1].strip()
                if _looks_like_person_name(name):
                    result.principal_name = normalize_person_name(name)
                    result.principal_role = f"SC SOS - {cells[0].strip().title()}"
                    result.notes.append(f"SOS: found '{result.principal_name}' as {result.principal_role}")
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
                    candidate_name = normalize_person_name(names[0])
                    if not _looks_like_person_name(candidate_name):
                        continue
                    result.principal_name = candidate_name
                    result.principal_role = f"SC SOS - {keyword.rstrip(':')}"
                    result.notes.append(f"SOS: extracted '{candidate_name}' near '{keyword}'")
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
    all_urls = urls1 + urls2 + urls3 + urls4 + urls5

    sos_urls: list[str] = []
    seen_sos_urls: set[str] = set()
    for url in all_urls:
        if not _SOS_URL_PATTERN.search(url):
            continue
        full_url = f"https://{url}" if not url.startswith("http") else url
        if full_url not in seen_sos_urls:
            seen_sos_urls.add(full_url)
            sos_urls.append(full_url)

    best_sos_result: Optional[EnrichmentResult] = None
    best_sos_score = -1
    for sos_url in sos_urls:
        result.notes.append(f"DDG: found SC SOS entity page - {sos_url}")
        sos_result = scrape_sos_entity_page(sos_url, expected_entity_name=entity_name)

        score = 0
        for note in sos_result.notes:
            match = re.search(r"scored (\d+)", note, re.I)
            if match:
                score = int(match.group(1))
                break

        if score > best_sos_score:
            best_sos_result = sos_result
            best_sos_score = score

        if sos_result.principal_name:
            if initials_match(entity_name, sos_result.principal_name):
                sos_result.notes.append(
                    f"Initials check: '{entity_name}' initials match '{sos_result.principal_name}' - high confidence"
                )
                sos_result.principal_role = ROLE_SOS_INITIALS
            return sos_result

    if best_sos_result:
        result.notes.extend(best_sos_result.notes)
        if best_sos_result.principal_name and best_sos_result.search_evidence:
            result.search_evidence = choose_best_evidence_url(
                result.search_evidence,
                best_sos_result.search_evidence,
            )

    linkedin_urls = [u for u in all_urls if "linkedin.com/in/" in u]
    if linkedin_urls:
        result.notes.append(f"DDG: LinkedIn profile found - {linkedin_urls[0]}")
        if not result.search_evidence:
            result.search_evidence = choose_best_evidence_url(linkedin_urls[0])

    candidate_names = []
    for snippet in all_snippets:
        matches = _NAME_PATTERN.findall(snippet)
        for name in matches:
            skip = {
                "South Carolina", "Greenville County", "United States",
                "Register Deeds", "Business Filing", "Secretary State",
            }
            if name not in skip and len(name.split()) == 2:
                candidate_names.append(name)

    if candidate_names:
        initials_hits = [n for n in candidate_names if initials_match(entity_name, n)]
        if initials_hits:
            top_name = Counter(initials_hits).most_common(1)[0][0]
            result.notes.append(f"Initials check: '{top_name}' initials match '{entity_name}'")
        else:
            top_name = Counter(candidate_names).most_common(1)[0][0]
        false_positives = {
            "Filing Service", "Business Filing", "South Carolina", "Greenville County",
            "Registered Agent", "Secretary State", "United States", "New York",
            "Limited Liability", "Annual Report", "Registered Office",
            "Corporate Services", "National Registered", "Incorporating Service",
        }
        if top_name in false_positives:
            result.notes.append(f"DDG: rejected false positive name '{top_name}'")
            return result
        result.principal_name = top_name
        ubj_urls = [u for u in all_urls if "upstatebusinessjournal.com" in u]
        gbiz_urls = [u for u in all_urls if "gsabizwire.com" in u]
        if ubj_urls:
            result.principal_role = ROLE_PRESS_UBJ
            result.search_evidence = choose_best_evidence_url(result.search_evidence, ubj_urls[0])
        elif gbiz_urls:
            result.principal_role = ROLE_PRESS_GBIZ
            result.search_evidence = choose_best_evidence_url(result.search_evidence, gbiz_urls[0])
        else:
            result.principal_role = ROLE_WEB_SEARCH
        result.notes.append(f"DDG: extracted name '{top_name}' from search snippets")

    # Run over all snippets regardless of whether we found a name - these fields
    # are passed back to the orchestrator and written to enriched_leads directly.
    full_text = " ".join(all_snippets)

    email_hits = _EMAIL_RE.findall(full_text)
    email_noise = {"@example.com", "@domain.com", "@email.com", "@yoursite.com"}
    clean_emails = [
        e for e in email_hits
        if not any(e.lower().endswith(n) for n in email_noise)
        and not e.lower().startswith("noreply")
        and not e.lower().startswith("support@")
        and not e.lower().startswith("info@")
    ]
    if clean_emails:
        result.contact_email = clean_emails[0]
        result.notes.append(f"DDG: extracted email '{result.contact_email}' from snippets")

    phone_hits = _PHONE_RE.findall(full_text)
    phone_noise = {"800", "888", "877", "866", "855", "844", "833"}
    clean_phones = [
        p for p in phone_hits
        if re.sub(r"\D", "", p)[:3] not in phone_noise
    ]
    if clean_phones:
        result.contact_phone = clean_phones[0]
        result.notes.append(f"DDG: extracted phone '{result.contact_phone}' from snippets")

    if linkedin_urls and not result.linkedin_url:
        result.linkedin_url = linkedin_urls[0]

    return result
