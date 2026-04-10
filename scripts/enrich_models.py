"""
enrich_models.py — Shared types and utilities for the REBB enrichment pipeline.

Imported by enrich_gis.py, enrich_web.py, enrich_mort.py, and enrich.py.
"""

import os
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}

DEBUG_DIR = Path(__file__).parent / "debug"

# ── principal_role constants ──────────────────────────────────────────────────
# Stable string labels consumed by the /dashboard frontend to derive confidence
# tiers. TypeScript maps on the prefix before " – " (e.g. startsWith("SC SOS")).
ROLE_MORTGAGE_SIG  = "Mortgage Signature"       # signed legal doc — highest confidence
ROLE_TAX_CARE_OF   = "Tax Record – Care Of"     # county property detail, Care Of field
ROLE_GIS_OWNER     = "Tax Record – GIS"         # GIS name search, human owner
ROLE_GIS_MAIL_FLIP = "Tax Record – Mailing"     # mailing address GIS reverse lookup
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


def _is_street_address(s: str) -> bool:
    """Return True if s looks like a real street address (has a leading number + letter)."""
    return bool(s and _STREET_RE.match(s.strip()))


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
        """True if we found a human name (not just an LLC)."""
        if not self.principal_name:
            return False
        return not _LLC_TERMS_RE.search(self.principal_name)
