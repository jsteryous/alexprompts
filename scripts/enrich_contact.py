"""
enrich_contact.py — PDL (People Data Labs) contact enrichment.

Free tier: 100 credits/month. Credits consumed only on successful matches —
no-match API calls are free.

Two functions:
  lookup_apollo_contact() — person enrichment after a human name is resolved.
                            Skipped if DDG already found email + phone.
  lookup_pdl_company()    — company enrichment as a last-resort fallback.
                            Fires when we still have no contact info after the
                            full chain (human not found OR person lookup missed).
                            Returns business phone/website — still actionable.

Requires PDL_API_KEY in .env.local (falls back to APOLLO_API_KEY).
Docs: https://docs.peopledatalabs.com/docs/person-enrichment-api
      https://docs.peopledatalabs.com/docs/company-enrichment-api
"""

import os
import re
import logging
from typing import Optional

import requests

from enrich_models import EnrichmentResult

_log = logging.getLogger(__name__)

PDL_PERSON_URL  = "https://api.peopledatalabs.com/v5/person/enrich"
PDL_COMPANY_URL = "https://api.peopledatalabs.com/v5/company/enrich"


def lookup_apollo_contact(
    result: EnrichmentResult,
    entity_name: str = "",
    location: str = "",
) -> None:
    """
    Attempt to enrich contact details (email, phone, LinkedIn) via PDL.

    Skipped if DDG already found email + phone (saves free credits).
    Mutates result in place. Never raises — contact enrichment is best-effort.
    """
    # PDL_API_KEY takes precedence; fall back to APOLLO_API_KEY so existing
    # .env.local files don't need to change key names.
    api_key = os.environ.get("PDL_API_KEY") or os.environ.get("APOLLO_API_KEY")
    if not api_key:
        _log.debug("PDL: no API key (PDL_API_KEY / APOLLO_API_KEY) — skipping")
        return

    if not result.principal_name:
        return

    # Skip if DDG already found both contact fields — don't burn a credit.
    if result.contact_email and result.contact_phone:
        result.notes.append("PDL: skipped — DDG already found email + phone")
        return

    params: dict = {
        "name":        result.principal_name,
        "pretty":      "false",
    }
    if entity_name:
        params["company"] = entity_name
    if location:
        params["location"] = "Greenville, South Carolina"

    try:
        resp = requests.get(
            PDL_PERSON_URL,
            params=params,
            headers={"X-Api-Key": api_key},
            timeout=15,
        )
    except Exception as e:
        _log.warning("PDL: request failed for '%s': %s", result.principal_name, e)
        result.notes.append(f"PDL: request failed — {e}")
        return

    if resp.status_code == 404:
        result.notes.append(f"PDL: no match for '{result.principal_name}'")
        return

    if resp.status_code == 429:
        _log.warning("PDL: rate limit / quota exhausted for '%s'", result.principal_name)
        result.notes.append("PDL: monthly credit limit reached — contact lookup skipped")
        return

    if not resp.ok:
        _log.warning(
            "PDL: non-200 response %s for '%s': %s",
            resp.status_code, result.principal_name, resp.text[:200],
        )
        result.notes.append(f"PDL: API error {resp.status_code}")
        return

    data = resp.json().get("data") or {}

    email   = _extract_email(data)
    phone   = _extract_phone(data)
    linkedin = data.get("linkedin_url") or ""

    # Only overwrite fields DDG didn't already populate.
    if email and not result.contact_email:
        result.contact_email = email
    if phone and not result.contact_phone:
        result.contact_phone = phone
    if linkedin and not result.linkedin_url:
        result.linkedin_url = linkedin

    api_found = [k for k, v in [("email", email), ("phone", phone), ("linkedin", linkedin)] if v]
    if api_found:
        result.notes.append(f"PDL: found {', '.join(api_found)} for '{result.principal_name}'")
        _log.info("PDL: enriched '%s' — %s", result.principal_name, ", ".join(api_found))
    else:
        result.notes.append(f"PDL: matched '{result.principal_name}' but no contact data returned")


def lookup_pdl_company(
    result: EnrichmentResult,
    entity_name: str,
    location: str = "",
) -> None:
    """
    Last-resort fallback: enrich the company itself via PDL.

    Fires when we still have no phone or email after the full chain — whether
    because the LLC owner was never resolved or because person enrichment missed.
    Returns business phone/website stored in the same contact fields.
    Mutates result in place. Never raises.
    """
    api_key = os.environ.get("PDL_API_KEY") or os.environ.get("APOLLO_API_KEY")
    if not api_key:
        return

    if not entity_name:
        return

    # Already have both — nothing to add.
    if result.contact_email and result.contact_phone:
        return

    # PDL requires at least one of: name, ticker, website, profile
    # plus optionally location fields for better matching.
    params: dict = {"name": entity_name, "pretty": "false"}
    if location:
        # Use raw signal location as street_address if it looks like one,
        # otherwise fall back to city/state.
        first_line = location.split("\n")[0].strip().split(",")[0].strip()
        if re.match(r"^\d{1,5}\s+", first_line):
            params["street_address"] = first_line
        params["location"] = "Greenville, South Carolina"

    try:
        resp = requests.get(
            PDL_COMPANY_URL,
            params=params,
            headers={"X-Api-Key": api_key},
            timeout=15,
        )
    except Exception as e:
        _log.warning("PDL company: request failed for '%s': %s", entity_name, e)
        result.notes.append(f"PDL company: request failed — {e}")
        return

    if resp.status_code == 404:
        result.notes.append(f"PDL company: no match for '{entity_name}'")
        return

    if resp.status_code == 429:
        result.notes.append("PDL company: monthly credit limit reached")
        return

    if not resp.ok:
        _log.warning("PDL company: %s for '%s': %s", resp.status_code, entity_name, resp.text[:200])
        result.notes.append(f"PDL company: API error {resp.status_code}")
        return

    data = resp.json().get("data") or {}

    phone   = data.get("phone")
    website = data.get("website")
    linkedin = data.get("linkedin_url")

    if phone and not result.contact_phone:
        result.contact_phone = phone
    if linkedin and not result.linkedin_url:
        result.linkedin_url = linkedin

    found = [
        f for f in (
            "phone"   if phone   else None,
            "website" if website else None,
            "linkedin" if linkedin else None,
        ) if f
    ]
    if found:
        note = f"PDL company: found {', '.join(found)} for '{entity_name}'"
        if website:
            note += f" ({website})"
        result.notes.append(note)
        _log.info("PDL company: enriched '%s' — %s", entity_name, ", ".join(found))
    else:
        result.notes.append(f"PDL company: matched '{entity_name}' but no contact data returned")


def _extract_email(data: dict) -> Optional[str]:
    """Return the best available email from a PDL person record."""
    work_email = data.get("work_email")
    if work_email and "@" in work_email:
        return work_email
    for e in data.get("personal_emails") or []:
        if e and "@" in e:
            return e
    return None


def _extract_phone(data: dict) -> Optional[str]:
    """Return the best available phone number from a PDL person record."""
    mobile = data.get("mobile_phone")
    if mobile:
        return mobile
    for num in data.get("phone_numbers") or []:
        if num:
            return num
    return None
