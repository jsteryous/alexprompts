#!/usr/bin/env python3
"""
poc_contact_sources.py — Proof-of-concept: measure contact info hit rates.

Tests two sources against your existing enriched leads that have a resolved
principal/entity name but no phone or email:

  1. Google Places API  — business phone via Google Business Profile
  2. PDL person enrich  — personal phone/email via People Data Labs

Run modes:
  --test          Quick smoke test on 3 hardcoded GVL LLC names (no Supabase needed)
  --live          Pull from Supabase and test up to --limit leads
  --source places Run only Google Places (default: both)
  --source pdl    Run only PDL person enrichment
  --dry-run       Print results but don't write back to Supabase

Setup:
  GOOGLE_PLACES_API_KEY  — Google Cloud Console → APIs → Places API (New)
  PDL_API_KEY            — peopledatalabs.com free tier (100 credits/month)
  SUPABASE_URL / SUPABASE_SERVICE_KEY — for --live mode

Cost at your volume (~50-100 leads/month):
  Google Places:  ~$0 ($200/month free credit; 1 call per entity = Text Search)
  PDL:            credits only burned on successful matches; 100 free/month
"""

import argparse
import logging
import os
import re
import sys
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

import requests
from dotenv import load_dotenv

_LLC_NAME_RE = re.compile(
    r"\b(LLC|INC|CORP|LTD|LP|LLP|HOLDINGS|PARTNERS|PROPERTIES|ASSOCIATES|GROUP|"
    r"DEVELOPMENT|ENTERPRISES|TRUST|VENTURES|CAPITAL|INVESTMENTS|SERVICES|SOLUTIONS|"
    r"CONSTRUCTION|MANAGEMENT|REALTY|CONTRACTING)\b",
    re.I,
)
_ENTITY_NOISE = {"llc", "inc", "corp", "ltd", "lp", "llp", "the", "of", "and", "a", "&"}

load_dotenv(Path(__file__).parent.parent / ".env.local")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)s  %(message)s",
    datefmt="%H:%M:%S",
)
_log = logging.getLogger(__name__)

# ── Constants ─────────────────────────────────────────────────────────────────

PLACES_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText"
PDL_PERSON_URL    = "https://api.peopledatalabs.com/v5/person/enrich"

# Require this fraction of entity name tokens to appear in the Places result name
_PLACES_MATCH_THRESHOLD = 0.5

# Greenville SC centroid for Places API location bias
GVL_LAT  = 34.8526
GVL_LNG  = -82.3940
GVL_RADIUS_M = 50_000   # 50 km max (API limit) — covers GVL County + surrounding area

# Test entities when --test mode (no Supabase required)
_TEST_ENTITIES = [
    {"entity_name": "Palmetto Mechanical LLC",    "principal_name": ""},
    {"entity_name": "Upstate Electric LLC",        "principal_name": ""},
    {"entity_name": "Carolina Landscape Group LLC","principal_name": ""},
]


# ── Result model ──────────────────────────────────────────────────────────────

@dataclass
class ContactProbeResult:
    entity_name:    str
    principal_name: str = ""
    signal_id:      str = ""

    # Google Places
    places_phone:   Optional[str] = None
    places_website: Optional[str] = None
    places_name:    Optional[str] = None   # matched business name
    places_status:  str = "not_run"        # found | no_match | no_key | error

    # PDL
    pdl_email:      Optional[str] = None
    pdl_phone:      Optional[str] = None
    pdl_linkedin:   Optional[str] = None
    pdl_status:     str = "not_run"        # found | no_match | no_contact | no_key | rate_limited | error

    notes: list[str] = field(default_factory=list)

    @property
    def any_contact(self) -> bool:
        return bool(
            self.places_phone or self.pdl_email or self.pdl_phone
        )


# ── Google Places (New API) ───────────────────────────────────────────────────

def _is_business_entity(name: str) -> bool:
    """Return True only if the name looks like an LLC/company, not a person."""
    return bool(_LLC_NAME_RE.search(name))


def _places_name_matches(entity_name: str, places_name: str) -> bool:
    """
    Return True if the Google Places result name shares enough tokens with the
    entity name to be considered a match (not just the nearest fuzzy result).
    """
    if not entity_name or not places_name:
        return False

    def tokens(s: str) -> set[str]:
        return {
            t.lower() for t in re.findall(r"[A-Za-z0-9]+", s)
            if t.lower() not in _ENTITY_NOISE and len(t) > 1
        }

    entity_tokens = tokens(entity_name)
    places_tokens = tokens(places_name)

    if not entity_tokens:
        return False

    overlap = entity_tokens & places_tokens
    coverage = len(overlap) / len(entity_tokens)
    return coverage >= _PLACES_MATCH_THRESHOLD


def probe_google_places(entity_name: str, api_key: str) -> tuple[Optional[str], Optional[str], Optional[str], str]:
    """
    Text search for entity_name near Greenville SC.
    Returns (phone, website, matched_name, status).

    Uses the Places API (New) v1 — single POST with field mask.
    Requires "Places API (New)" enabled in Google Cloud Console.
    Docs: https://developers.google.com/maps/documentation/places/web-service/text-search
    """
    query = f"{entity_name} Greenville South Carolina"

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        # Field mask: what fields to return (controls billing)
        "X-Goog-FieldMask": "places.displayName,places.nationalPhoneNumber,places.websiteUri,places.formattedAddress",
    }
    body = {
        "textQuery": query,
        "locationBias": {
            "circle": {
                "center": {"latitude": GVL_LAT, "longitude": GVL_LNG},
                "radius": GVL_RADIUS_M,
            }
        },
        "maxResultCount": 3,
    }

    try:
        resp = requests.post(PLACES_SEARCH_URL, json=body, headers=headers, timeout=10)
    except Exception as e:
        _log.warning("Places: request failed for '%s': %s", entity_name, e)
        return None, None, None, "error"

    if resp.status_code == 403:
        _log.warning("Places: 403 — check API key or Places API (New) is enabled")
        return None, None, None, "error"

    if not resp.ok:
        _log.warning("Places: %s for '%s': %s", resp.status_code, entity_name, resp.text[:200])
        return None, None, None, "error"

    places = resp.json().get("places") or []
    if not places:
        return None, None, None, "no_match"

    # Take first result — it's already biased to GVL area
    top = places[0]
    phone   = top.get("nationalPhoneNumber")
    website = top.get("websiteUri")
    name    = (top.get("displayName") or {}).get("text")

    if not _places_name_matches(entity_name, name or ""):
        return None, None, name, "no_match"

    if phone or website:
        return phone, website, name, "found"
    return None, None, name, "no_match"


# ── PDL person enrichment ─────────────────────────────────────────────────────

def probe_pdl_person(principal_name: str, entity_name: str, api_key: str) -> tuple[Optional[str], Optional[str], Optional[str], str]:
    """
    Look up a person by name + company via PDL.
    Returns (email, phone, linkedin, status).
    Credits consumed ONLY on successful matches — no-match is free.
    """
    if not principal_name:
        return None, None, None, "skipped"

    params = {
        "name": principal_name,
        "company": entity_name,
        "location": "Greenville, South Carolina",
        "pretty": "false",
    }

    try:
        resp = requests.get(
            PDL_PERSON_URL,
            params=params,
            headers={"X-Api-Key": api_key},
            timeout=15,
        )
    except Exception as e:
        _log.warning("PDL: request failed for '%s': %s", principal_name, e)
        return None, None, None, "error"

    if resp.status_code == 404:
        return None, None, None, "no_match"

    if resp.status_code == 429:
        _log.warning("PDL: monthly credit limit reached")
        return None, None, None, "rate_limited"

    if not resp.ok:
        _log.warning("PDL: %s for '%s': %s", resp.status_code, principal_name, resp.text[:200])
        return None, None, None, "error"

    data = resp.json().get("data") or {}

    # Email: prefer work_email, fall back to personal
    email = data.get("work_email")
    if not (isinstance(email, str) and "@" in (email or "")):
        personal = data.get("personal_emails")
        email = None
        if isinstance(personal, list):
            for e in personal:
                if isinstance(e, str) and "@" in e:
                    email = e
                    break

    phone_numbers = data.get("phone_numbers")
    phone = data.get("mobile_phone") or (
        next(iter(phone_numbers), None) if isinstance(phone_numbers, list) else None
    )
    linkedin = data.get("linkedin_url") if isinstance(data.get("linkedin_url"), str) else None

    if email or phone or linkedin:
        return email, phone, linkedin, "found"
    return None, None, None, "no_contact"


# ── Probe orchestrator ────────────────────────────────────────────────────────

def run_probe(
    lead: dict,
    run_places: bool = True,
    run_pdl: bool = True,
    places_key: Optional[str] = None,
    pdl_key: Optional[str] = None,
) -> ContactProbeResult:
    entity    = lead.get("entity_name") or ""
    principal = lead.get("principal_name") or ""
    signal_id = lead.get("signal_id") or ""

    probe = ContactProbeResult(
        entity_name=entity,
        principal_name=principal,
        signal_id=signal_id,
    )

    if run_places:
        if not places_key:
            probe.places_status = "no_key"
            probe.notes.append("Google Places: no GOOGLE_PLACES_API_KEY set")
        elif not _is_business_entity(entity):
            probe.places_status = "skipped"
            probe.notes.append(f"Places: skipped '{entity}' — looks like a person name, not an LLC")
        else:
            phone, website, matched, status = probe_google_places(entity, places_key)
            probe.places_phone   = phone
            probe.places_website = website
            probe.places_name    = matched
            probe.places_status  = status
            if status == "found":
                probe.notes.append(
                    f"Places: matched '{matched}' phone={phone} website={website}"
                )
            elif status == "no_match":
                probe.notes.append(f"Places: no match for '{entity}'")
        time.sleep(0.3)   # mild rate-limit courtesy

    if run_pdl:
        if not pdl_key:
            probe.pdl_status = "no_key"
            probe.notes.append("PDL: no PDL_API_KEY / APOLLO_API_KEY set")
        elif not principal:
            probe.pdl_status = "skipped"
            probe.notes.append("PDL: skipped — no resolved principal name")
        else:
            email, phone, linkedin, status = probe_pdl_person(principal, entity, pdl_key)
            probe.pdl_email    = email
            probe.pdl_phone    = phone
            probe.pdl_linkedin = linkedin
            probe.pdl_status   = status
            if status == "found":
                probe.notes.append(
                    f"PDL: found for '{principal}' → email={email} phone={phone} linkedin={linkedin}"
                )
            elif status == "no_match":
                probe.notes.append(f"PDL: no match for '{principal}' @ '{entity}'")
            elif status == "no_contact":
                probe.notes.append(f"PDL: matched '{principal}' but no contact data")
            elif status == "rate_limited":
                probe.notes.append("PDL: monthly credit limit reached — stopping PDL checks")
        time.sleep(0.5)

    return probe


# ── Supabase loader ───────────────────────────────────────────────────────────

def load_contact_gaps(limit: int = 30) -> list[dict]:
    """
    Pull enriched leads with a resolved name but no phone AND no email.
    Also returns the linked entity_name from market_signals.
    """
    supabase_url = os.environ.get("SUPABASE_URL")
    service_key  = os.environ.get("SUPABASE_SERVICE_KEY")
    if not supabase_url or not service_key:
        _log.error("SUPABASE_URL and SUPABASE_SERVICE_KEY required for --live mode")
        sys.exit(1)

    from supabase import create_client
    client = create_client(supabase_url, service_key)

    resp = (
        client.table("enriched_leads")
        .select(
            "signal_id, principal_name, enrichment_status, "
            "market_signals(entity_name, location)"
        )
        .eq("enrichment_status", "enriched")
        .is_("contact_email", "null")
        .is_("contact_phone", "null")
        .not_.is_("principal_name", "null")
        .order("score", desc=True)
        .limit(limit)
        .execute()
    )
    rows = resp.data or []
    leads = []
    seen_entities: set[str] = set()
    for row in rows:
        sig = row.get("market_signals") or {}
        entity = sig.get("entity_name") or ""
        key = entity.strip().lower()
        if key and key in seen_entities:
            continue   # same entity already queued — skip duplicate signal rows
        if key:
            seen_entities.add(key)
        leads.append({
            "signal_id":      row.get("signal_id"),
            "principal_name": row.get("principal_name"),
            "entity_name":    entity,
            "location":       sig.get("location") or "",
        })
    return leads


def save_contacts_back(results: list[ContactProbeResult]) -> None:
    """Write any found contacts back to enriched_leads (phone from Places, email/phone from PDL)."""
    supabase_url = os.environ.get("SUPABASE_URL")
    service_key  = os.environ.get("SUPABASE_SERVICE_KEY")
    if not supabase_url or not service_key:
        return

    from supabase import create_client
    client = create_client(supabase_url, service_key)

    saved = 0
    for r in results:
        if not r.signal_id or not r.any_contact:
            continue

        # Prefer PDL (personal) over Places (business) for phone when both exist,
        # but keep Places phone if PDL had nothing.
        update: dict = {}
        phone = r.pdl_phone or r.places_phone
        if phone:
            update["contact_phone"] = phone
        if r.pdl_email:
            update["contact_email"] = r.pdl_email
        if r.pdl_linkedin:
            update["linkedin_url"] = r.pdl_linkedin

        if not update:
            continue

        note_parts = []
        if r.places_phone:
            note_parts.append(f"Google Places phone: {r.places_phone}")
        if r.pdl_email or r.pdl_phone:
            note_parts.append(f"PDL contact: email={r.pdl_email} phone={r.pdl_phone}")

        try:
            client.table("enriched_leads").update(update).eq("signal_id", r.signal_id).execute()
            saved += 1
            _log.info("Saved contacts for signal %s (%s)", r.signal_id, r.entity_name)
        except Exception as e:
            _log.error("Failed to save contacts for %s: %s", r.signal_id, e)

    print(f"\n   Saved contacts back to Supabase: {saved} lead(s) updated")


# ── Report ────────────────────────────────────────────────────────────────────

def print_report(results: list[ContactProbeResult], run_places: bool, run_pdl: bool) -> None:
    total = len(results)
    if not total:
        print("No leads tested.")
        return

    places_found    = sum(1 for r in results if r.places_status == "found")
    pdl_found       = sum(1 for r in results if r.pdl_status == "found")
    pdl_no_contact  = sum(1 for r in results if r.pdl_status == "no_contact")
    pdl_no_match    = sum(1 for r in results if r.pdl_status == "no_match")
    either_found    = sum(1 for r in results if r.any_contact)

    print("\n" + "=" * 60)
    print(f"CONTACT PROBE RESULTS  ({total} leads)")
    print("=" * 60)

    if run_places:
        rate = places_found / total * 100
        print(f"\nGoogle Places:  {places_found}/{total} found ({rate:.0f}% hit rate)")

    if run_pdl:
        rate = pdl_found / total * 100
        print(f"PDL person:     {pdl_found}/{total} found ({rate:.0f}% hit rate)")
        if pdl_no_contact:
            print(f"  matched but no data: {pdl_no_contact}")
        if pdl_no_match:
            print(f"  no match: {pdl_no_match}")

    if run_places and run_pdl:
        rate = either_found / total * 100
        print(f"\nEither source:  {either_found}/{total} ({rate:.0f}% combined hit rate)")

    print("\n" + "-" * 60)
    print("DETAIL (leads with any result):")
    print("-" * 60)
    for r in results:
        if not (r.any_contact or r.places_status == "found"):
            continue
        print(f"\n  {r.entity_name}")
        if r.principal_name:
            print(f"    Principal : {r.principal_name}")
        if r.places_phone:
            print(f"    Biz phone : {r.places_phone}  (Google Places: '{r.places_name}')")
        if r.places_website:
            print(f"    Website   : {r.places_website}")
        if r.pdl_email:
            print(f"    PDL email : {r.pdl_email}")
        if r.pdl_phone:
            print(f"    PDL phone : {r.pdl_phone}")
        if r.pdl_linkedin:
            print(f"    LinkedIn  : {r.pdl_linkedin}")

    print("\n" + "-" * 60)
    print("MISSES:")
    print("-" * 60)
    for r in results:
        if r.any_contact:
            continue
        places_label = f"places={r.places_status}"
        pdl_label    = f"pdl={r.pdl_status}" if run_pdl else ""
        labels = "  ".join(filter(None, [places_label, pdl_label]))
        print(f"  {r.entity_name} [{labels}]")
        if r.principal_name:
            print(f"    principal: {r.principal_name}")


# ── CLI ───────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description="Probe contact info sources for enriched leads")
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--test",  action="store_true", help="Smoke test on 3 hardcoded entities (no Supabase)")
    mode.add_argument("--live",  action="store_true", help="Pull from Supabase enriched leads with no contact info")

    parser.add_argument("--source",  choices=["places", "pdl", "both"], default="both")
    parser.add_argument("--limit",   type=int, default=20, help="Max leads to test in --live mode")
    parser.add_argument("--dry-run", action="store_true", help="Don't write results back to Supabase")
    args = parser.parse_args()

    run_places = args.source in ("places", "both")
    run_pdl    = args.source in ("pdl", "both")

    places_key = os.environ.get("GOOGLE_PLACES_API_KEY")
    pdl_key    = os.environ.get("PDL_API_KEY") or os.environ.get("APOLLO_API_KEY")

    if run_places and not places_key:
        print("WARNING: GOOGLE_PLACES_API_KEY not set — Places checks will be skipped.")
        print("         Get a free key: https://console.cloud.google.com/ → Enable 'Places API (New)'")
    if run_pdl and not pdl_key:
        print("WARNING: PDL_API_KEY not set — PDL checks will be skipped.")

    if args.test:
        leads = _TEST_ENTITIES
        print(f"Running smoke test on {len(leads)} hardcoded entities...")
    else:
        print(f"Loading up to {args.limit} contact-gap leads from Supabase...")
        leads = load_contact_gaps(args.limit)
        print(f"  Loaded {len(leads)} lead(s)")

    if not leads:
        print("No leads to test.")
        return

    results: list[ContactProbeResult] = []
    pdl_rate_limited = False

    for i, lead in enumerate(leads, 1):
        entity = lead.get("entity_name") or "(unknown)"
        print(f"\n[{i}/{len(leads)}] {entity}")
        if lead.get("principal_name"):
            print(f"           Principal: {lead['principal_name']}")

        # Stop PDL probes if we hit the rate limit
        effective_pdl = run_pdl and not pdl_rate_limited

        probe = run_probe(
            lead,
            run_places=run_places,
            run_pdl=effective_pdl,
            places_key=places_key,
            pdl_key=pdl_key,
        )
        for note in probe.notes:
            print(f"  {note}")

        if probe.pdl_status == "rate_limited":
            pdl_rate_limited = True
            print("  [!] PDL monthly limit reached — stopping PDL for remaining leads")

        results.append(probe)

    print_report(results, run_places, run_pdl)

    if not args.dry_run and args.live:
        save_contacts_back(results)
    elif args.dry_run and any(r.any_contact for r in results):
        print("\n(--dry-run: results not saved to Supabase)")


if __name__ == "__main__":
    main()
