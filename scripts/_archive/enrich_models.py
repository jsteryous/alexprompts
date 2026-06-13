"""
enrich_models.py — Shared types and utilities for the REBB enrichment pipeline.

Imported by enrich_gis.py, enrich_web.py, enrich_mort.py, and enrich.py.
"""

import os
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional
from urllib.parse import urlparse, urlunparse

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}

DEBUG_DIR = Path(__file__).parent / "debug"

# ── Enrichment version ───────────────────────────────────────────────────────
# Bump this when the enrichment chain meaningfully improves (new source added,
# major logic fix). Stored in enriched_leads.enrichment_version so stale rows
# can be selected and re-processed with --re-enrich-stale.
ENRICH_VERSION = 6

# ── principal_role constants ──────────────────────────────────────────────────
# Stable string labels consumed by the /dashboard frontend to derive confidence
# tiers. TypeScript maps on the prefix before " – " (e.g. startsWith("SC SOS")).
ROLE_MORTGAGE_SIG  = "Mortgage Signature"       # signed legal doc — highest confidence
ROLE_TAX_CARE_OF   = "Tax Record – Care Of"     # county property detail, Care Of field
ROLE_GIS_OWNER     = "Tax Record – GIS"         # GIS name search, human owner
ROLE_GIS_MAIL_FLIP = "Tax Record – Mailing"     # mailing address GIS reverse lookup
ROLE_GIS_ADDR_HOP  = "Tax Record – Address Hop" # commercial mailing addr -> building owner lookup
ROLE_SOS_INITIALS  = "SC SOS – Initials Match"  # SOS filing, name initials corroborated
ROLE_PRESS_UBJ     = "Business Press – UBJ"     # Upstate Business Journal mention
ROLE_PRESS_GBIZ    = "Business Press – GSABiz"  # GSA BizWire press release
ROLE_WEB_SEARCH    = "Web Search"               # generic DuckDuckGo extraction

# ── LLC / corporate entity indicators ────────────────────────────────────────
_SUFFIXES = {"JR", "SR", "II", "III", "IV", "ESQ", "MD", "PHD", "DDS"}

# Shorter list — used in normalize_person_name and Care Of checks
_LLC_TERMS_RE = re.compile(
    r"\b(LLC|INC|CORP|LTD|LP|LLP|HOLDINGS|PARTNERS|PROPERTIES|ASSOCIATES|GROUP|TRUST|FOUNDATION)\b",
    re.I,
)

# Non-human owners that can appear in county records. These should never be
# normalized as deed-style person names or treated as resolved decision-makers.
_NON_PERSON_OWNER_RE = re.compile(
    r"\b("
    r"CITY\s+OF|COUNTY\s+OF|STATE\s+OF|TOWN\s+OF|VILLAGE\s+OF|"
    r"BOARD\s+OF|SCHOOL\s+DISTRICT|HOUSING\s+AUTHORITY|REDEVELOPMENT\s+AUTHORITY|"
    r"PUBLIC\s+WORKS|DEPARTMENT\s+OF|UNIVERSITY\s+OF|COLLEGE\s+OF|"
    r"CHURCH|MINISTR(?:Y|IES)|DIOCESE|PARISH|FOUNDATION|AUTHORITY"
    r")\b",
    re.I,
)

_PRINCIPAL_JUNK_RE = re.compile(
    r"\b("
    r"PROPERTY\s+DESCRIPTION|LEGAL\s+DESCRIPTION|FULL\s+LEGAL|"
    r"PROPERTY\s+ADDRESS|MAILING\s+ADDRESS|SITE\s+ADDRESS|SITUS\s+ADDRESS|"
    r"OWNER(?:\(S\))?|CARE\s+OF|C/O|ATTN|ATTENTION|"
    r"GRANTOR|GRANTEE|BORROWER|LENDER|MORTGAGEE|MORTGAGOR|TRUSTEE|"
    r"WITNESS|NOTARY|PREPARED\s+BY|RETURN\s+TO|"
    r"INSTRUMENT\s+NUMBER|RECORDED\s+DATE|BOOK|PAGE|PARCEL|PIN|TMS|TAX\s+MAP|MAP"
    r")\b",
    re.I,
)
_PRINCIPAL_STOPWORDS = {
    "and", "of", "the", "for", "to", "at", "by", "from",
    "property", "legal", "description", "mailing", "address", "owner",
    "grantor", "grantee", "borrower", "lender", "mortgagee", "mortgagor",
    "trustee", "witness", "notary", "prepared", "return", "instrument",
    "recorded", "date", "book", "page", "parcel", "pin", "tms", "tax", "map",
}

# Broader list — used for "is this entity a corporation?" checks in orchestrator + mortgage module
LLC_NAME_RE = re.compile(
    r"\b(LLC|INC|CORP|LTD|LP|LLP|HOLDINGS|PARTNERS|PROPERTIES|ASSOCIATES|GROUP|"
    r"DEVELOPMENT|ENTERPRISES|TRUST|FOUNDATION|VENTURES|CAPITAL|INVESTMENTS)\b",
    re.I,
)

# ── Street address detection ──────────────────────────────────────────────────
_STREET_RE = re.compile(
    r"^\d{1,5}\s+[A-Za-z]",  # 1-5 digit house number followed by a letter (e.g. "1204 L")
)

_ADDRESS_CITY_RE = re.compile(
    r"\b(GREENVILLE|SIMPSONVILLE|GREER|TAYLORS|MAULDIN|TRAVELERS REST|EASLEY|PIEDMONT|FOUNTAIN INN)\b",
    re.I,
)
_ADDRESS_KEYWORD_SPLIT_RE = re.compile(
    r"(?=\b(?:Grantor|Grantee|Borrower|Lender|Mortgagee|Mortgagor|Trustee|"
    r"Prepared By|Return To|Instrument Number|Recorded Date|Book|Page|"
    r"Consideration|Loan Amount|Principal Amount|Number of Pages|"
    r"Legal Description|Full Legal|Parcel|PIN|TMS|Tax Map|Map #|"
    r"Witness|Notary|State of|County of)\b)",
    re.I,
)
_ADDRESS_LABEL_PATTERNS = (
    re.compile(
        r"\b(?:Property|Situs|Site)\s+Address\s*[:\-]?\s*([^\n\r]+(?:\n(?!\s*(?:Grantor|Grantee|Borrower|"
        r"Lender|Mortgagee|Mortgagor|Trustee|Prepared By|Return To|Instrument Number|Recorded Date|"
        r"Book|Page|Consideration|Loan Amount|Principal Amount|Number of Pages|Legal Description|"
        r"Full Legal|Parcel|PIN|TMS|Tax Map|Map #|Witness|Notary|State of|County of)\b)[^\n\r]+)?)",
        re.I,
    ),
    re.compile(r"\bProperty\s+Location\s*[:\-]?\s*([^\n\r]+)", re.I),
    re.compile(r"\bLocation\s+of\s+Property\s*[:\-]?\s*([^\n\r]+)", re.I),
    re.compile(r"\bPremises\s+(?:located|lying)\s+at\s+([^\n\r,;]+(?:,\s*[^\n\r,;]+){0,2})", re.I),
    re.compile(r"\bCommonly\s+known\s+as\s+([^\n\r,;]+(?:,\s*[^\n\r,;]+){0,2})", re.I),
)
_ADDRESS_CANDIDATE_RE = re.compile(
    r"\b\d{1,6}(?:-\d{1,6})?\s+"
    r"(?:[NSEW]\.?\s+)?"
    r"[A-Za-z0-9#'./&-]+(?:\s+[A-Za-z0-9#'./&-]+){0,7}\s+"
    r"(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Lane|Ln|Way|"
    r"Court|Ct|Place|Pl|Highway|Hwy|Parkway|Pkwy|Circle|Cir|Terrace|Ter|"
    r"Trail|Trl)\b"
    r"(?:\s+(?:N|S|E|W|NE|NW|SE|SW)\b)?"
    r"(?:\s+(?:Suite|Ste|Unit|Apt|Apartment|Bldg|Building|#)\s*[A-Za-z0-9-]+\b)?"
    r"(?:,\s*[A-Za-z .'-]+){0,2}"
    r"(?:\s+\d{5}(?:-\d{4})?)?",
    re.I,
)
_EVIDENCE_SCHEMES = {"http", "https"}
_EVIDENCE_NOISE_PREFIXES = (
    "duckduckgo:",
    "google:",
    "bing:",
)
_EVIDENCE_REJECT_PATTERNS = (
    re.compile(r"/loginDisplay\.action\b", re.I),
    re.compile(r"/disclaimer\.do\b", re.I),
    re.compile(r"/searchMain\.do\b", re.I),
)
_EVIDENCE_STRONG_PATTERNS = (
    re.compile(r"businessfilings\.sc\.gov/BusinessFiling/Entity/Details/\d+", re.I),
    re.compile(r"greenvillecounty\.org/.*/RealProperty/Details\.aspx", re.I),
    re.compile(r"/InstrumentImageView\.jsp\b", re.I),
    re.compile(r"/viewImagePNG\.do\b", re.I),
)


def normalize_evidence_url(value: Optional[str]) -> Optional[str]:
    """Clean and validate a candidate evidence URL; reject placeholders and weak portal entry pages."""
    if not value:
        return None

    url = value.strip().strip(".,;")
    if not url:
        return None
    if url.lower().startswith(_EVIDENCE_NOISE_PREFIXES):
        return None
    if url.startswith("www."):
        url = f"https://{url}"
    elif re.match(r"^[A-Za-z0-9.-]+\.[A-Za-z]{2,}/", url) and "://" not in url:
        url = f"https://{url}"

    parsed = urlparse(url)
    if parsed.scheme.lower() not in _EVIDENCE_SCHEMES or not parsed.netloc:
        return None

    normalized = urlunparse(
        (
            parsed.scheme.lower(),
            parsed.netloc.lower(),
            parsed.path or "/",
            "",
            parsed.query,
            "",
        )
    )
    for pattern in _EVIDENCE_REJECT_PATTERNS:
        if pattern.search(normalized):
            return None
    return normalized


def evidence_url_quality(value: Optional[str]) -> int:
    """Rank evidence URLs so source-specific detail pages beat generic homepages."""
    url = normalize_evidence_url(value)
    if not url:
        return -1

    for pattern in _EVIDENCE_STRONG_PATTERNS:
        if pattern.search(url):
            return 100

    parsed = urlparse(url)
    host = parsed.netloc.lower()
    path = (parsed.path or "/").rstrip("/")
    score = 20

    if parsed.query:
        score += 8
    if path and path != "/":
        score += 18
    if len([segment for segment in path.split("/") if segment]) >= 2:
        score += 10

    if "linkedin.com" in host and "/in/" in path:
        score += 30
    elif "upstatebusinessjournal.com" in host or "gsabizwire.com" in host:
        score += 28 if path and path != "/" else -10
    elif "greenvillecounty.org" in host:
        score += 12
    elif "businessfilings.sc.gov" in host:
        score += 18

    return score


def choose_best_evidence_url(*candidates: Optional[str]) -> Optional[str]:
    """Return the highest-quality normalized evidence URL from the provided candidates."""
    best_url = None
    best_score = -1
    for candidate in candidates:
        normalized = normalize_evidence_url(candidate)
        if not normalized:
            continue
        score = evidence_url_quality(normalized)
        if score > best_score:
            best_url = normalized
            best_score = score
    return best_url


def _is_street_address(s: str) -> bool:
    """Return True if s looks like a real street address (has a leading number + letter)."""
    return bool(s and _STREET_RE.match(s.strip()))


def clean_address_candidate(value: str) -> Optional[str]:
    """Normalize a raw address-like snippet and reject obvious non-address noise."""
    if not value:
        return None

    value = value.replace("\r", "\n")
    value = re.sub(r"[ \t]+", " ", value)
    value = re.sub(r"\n+", "\n", value).strip(" ,;:-")
    value = re.sub(
        r"^(?:Property|Situs|Site)\s+Address\s*[:\-]?\s*",
        "",
        value,
        flags=re.I,
    )
    value = re.sub(r"^(?:Property\s+Location|Location\s+of\s+Property)\s*[:\-]?\s*", "", value, flags=re.I)
    value = re.sub(r"^Premises\s+(?:located|lying)\s+at\s+", "", value, flags=re.I)
    value = re.sub(r"^Commonly\s+known\s+as\s+", "", value, flags=re.I)
    value = _ADDRESS_KEYWORD_SPLIT_RE.split(value, maxsplit=1)[0].strip(" ,;:-")
    value = value.replace("\n", ", ")
    value = re.sub(r"\s*,\s*", ", ", value)
    value = re.sub(r"\s{2,}", " ", value).strip(" ,;:-")

    if not _is_street_address(value):
        return None
    if len(value) < 8 or len(value) > 140:
        return None
    if re.search(r"\b(N/?A|NONE|UNKNOWN)\b", value, re.I):
        return None
    if re.search(r"https?://|www\.", value, re.I):
        return None
    if re.search(r"\b(?:County|Rights Reserved|South Carolina)\b", value, re.I):
        return None
    if re.search(r"\b(?:Grantor|Grantee|Borrower|Lender|Mortgagee|Mortgagor|Trustee|Witness|Notary)\b", value, re.I):
        return None

    match = _ADDRESS_CANDIDATE_RE.search(value)
    if match:
        return match.group(0).strip(" ,;:-")
    return None


def extract_best_property_address(text: str) -> Optional[str]:
    """
    Extract the best property/situs address candidate from noisy HTML or OCR text.
    Prefers labeled/property-context matches and penalizes party/metadata noise.
    """
    if not text:
        return None

    normalized = text.replace("\xa0", " ").replace("\r\n", "\n").replace("\r", "\n")
    normalized = re.sub(r"[ \t]+", " ", normalized)
    normalized = re.sub(r"\n{3,}", "\n\n", normalized)

    candidates: list[tuple[int, str]] = []

    def _add_candidate(raw: str, score: int) -> None:
        cleaned = clean_address_candidate(raw)
        if not cleaned:
            return
        final_score = score
        if _ADDRESS_CITY_RE.search(cleaned):
            final_score += 15
        if re.search(r"\bSC\b|\b\d{5}(?:-\d{4})?\b", cleaned, re.I):
            final_score += 8
        if re.search(r"\b(?:Suite|Ste|Unit|Apt|Apartment|Bldg|Building|#)\b", cleaned, re.I):
            final_score += 3
        if re.search(r"\b(?:Grantor|Grantee|Borrower|Lender|Mortgagee|Mortgagor|Trustee|Witness|Notary)\b", raw, re.I):
            final_score -= 25
        candidates.append((final_score, cleaned))

    for pattern in _ADDRESS_LABEL_PATTERNS:
        for match in pattern.finditer(normalized):
            _add_candidate(match.group(1), 90)

    for line in normalized.splitlines():
        if not _is_street_address(line.strip()):
            continue
        _add_candidate(line, 55)

    for match in _ADDRESS_CANDIDATE_RE.finditer(normalized):
        start = max(0, match.start() - 80)
        end = min(len(normalized), match.end() + 80)
        context = normalized[start:end]
        score = 60
        if re.search(r"\b(?:Property|Situs|Site)\s+Address\b", context, re.I):
            score += 25
        if re.search(r"\b(?:Premises|Property|Located|Commonly known as)\b", context, re.I):
            score += 12
        _add_candidate(match.group(0), score)

    if not candidates:
        return None

    best_by_value: dict[str, int] = {}
    for score, value in candidates:
        prev = best_by_value.get(value)
        if prev is None or score > prev:
            best_by_value[value] = score

    ranked = sorted(best_by_value.items(), key=lambda item: (-item[1], len(item[0])))
    return ranked[0][0] if ranked else None


# ── Name normalization ────────────────────────────────────────────────────────

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

    if _NON_PERSON_OWNER_RE.search(raw):
        return raw.title()

    parts = raw.upper().split()
    if not parts:
        return raw

    if len(parts) == 1:
        return parts[0].title()

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
    result = f"{first} {last}"
    if suffix:
        result += f" {suffix}"
    return result


def is_non_human_name(raw: Optional[str]) -> bool:
    """Return True for LLCs, governments, nonprofits, and other non-person owners."""
    if not raw:
        return False
    return bool(_LLC_TERMS_RE.search(raw) or _NON_PERSON_OWNER_RE.search(raw))


def principal_name_quality_issue(raw: Optional[str]) -> Optional[str]:
    """
    Return a short reason when a principal candidate is too low-quality for
    person-level contact enrichment.
    """
    if not raw:
        return "missing principal name"

    text = re.sub(r"\s+", " ", raw).strip(" ,;:-")
    if not text:
        return "missing principal name"
    if is_non_human_name(text):
        return "non-human owner/entity"
    if _PRINCIPAL_JUNK_RE.search(text):
        return "metadata label, not a person"
    if any(ch.isdigit() for ch in text):
        return "contains digits"
    if "@" in text:
        return "contains email text"
    if _is_street_address(text):
        return "looks like a street address"

    tokens = re.findall(r"[A-Za-z][A-Za-z'.-]*", text)
    if len(tokens) < 2:
        return "too few name tokens"
    if len(tokens) > 5:
        return "too many name tokens"

    lowered = [token.lower().rstrip(".") for token in tokens]
    if lowered[0] in _PRINCIPAL_STOPWORDS or lowered[-1] in _PRINCIPAL_STOPWORDS:
        return "malformed token order"
    if sum(token in _PRINCIPAL_STOPWORDS for token in lowered) >= 2:
        return "metadata text, not a person"

    upperish = text.upper()
    if re.fullmatch(r"[A-Z\s'.-]+", upperish):
        likely_label = sum(
            token in _PRINCIPAL_STOPWORDS or len(token) == 1
            for token in lowered
        )
        if likely_label >= max(2, len(lowered) - 1):
            return "malformed token order"

    return None


# ── Result model ──────────────────────────────────────────────────────────────

@dataclass
class EnrichmentResult:
    principal_name:    Optional[str] = None
    principal_role:    Optional[str] = None
    property_address:  Optional[str] = None   # situs / physical property address from GIS
    mailing_address:   Optional[str] = None   # owner's mailing address (from Details.aspx)
    search_evidence:   Optional[str] = None   # URL used as primary source
    enrichment_status: str           = "pending"
    notes:             list[str]     = field(default_factory=list)
    pin:               Optional[str] = None   # Greenville County Map # (parcel PIN)
    detail_url:        Optional[str] = None   # URL to RealProperty/Details.aspx for this parcel
    contact_email:     Optional[str] = None   # from Apollo /v1/people/match
    contact_phone:     Optional[str] = None   # from Apollo /v1/people/match
    linkedin_url:      Optional[str] = None   # from Apollo /v1/people/match

    def is_enriched(self) -> bool:
        """True if we found a human name that passes principal quality checks."""
        return principal_name_quality_issue(self.principal_name) is None
