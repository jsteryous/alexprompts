#!/usr/bin/env python3
"""
Upstate Multiplier — Lead Enrichment Orchestrator
==================================================
Takes a raw market_signal (LLC name + address) and tries to unmask
the real human decision-maker using free public sources only.

Free sources (no API key required):
  1. Greenville County GIS / tax query  — parcel owner name (enrich_gis.py)
  2. DuckDuckGo HTML search             — LLC → person / SOS page (enrich_web.py)
  3. SC SOS entity detail pages         — principal / registered agent (enrich_web.py)
  4. CountyWeb mortgage viewer OCR      — deed-of-trust signer (enrich_mort.py)

Usage:
    python enrich.py --signal-id <uuid>
    python enrich.py --address "1204 Laurens Rd" --entity "Palmetto Industrial LLC"
    python enrich.py --entity "Palmetto Industrial LLC" --rec-date "3/15/2024"
    python enrich.py --list-pending
    python enrich.py --run-pending [--dry-run]
    ENRICH_DEBUG=1 python enrich.py --entity "..." --dry-run
"""

import os
import re
import sys
import time
import argparse
import logging
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from tenacity import retry, stop_after_attempt, wait_exponential, before_sleep_log

from lib.db_models import EnrichedLeadRow
from enrich_models import (
    LLC_NAME_RE,
    _LLC_TERMS_RE,
    _is_street_address,
    normalize_person_name,
    EnrichmentResult,
    ROLE_TAX_CARE_OF,
    ROLE_GIS_MAIL_FLIP,
)
from enrich_gis import lookup_gis, lookup_property_detail
from enrich_web import enrich_via_duckduckgo
from enrich_mort import lookup_mortgage_borrower, _parse_recording_date

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)s  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
_log = logging.getLogger(__name__)

load_dotenv(Path(__file__).parent.parent / ".env.local")

SUPABASE_URL         = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")


# ── Supabase ──────────────────────────────────────────────────────────────────

_supabase = None


def get_supabase():
    global _supabase
    if _supabase is None:
        if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
            return None
        from supabase import create_client
        _supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    return _supabase


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

    # Step 0: Mortgage borrower lookup (deed + mortgage signals with LLC names)
    # Searches Greenville County ROD viewer for a MORTGAGE filed by the same entity
    # on the same recording date. Extracts borrower name + title from signature block.
    sig_source  = (signal or {}).get("source", "")
    sig_details = (signal or {}).get("details", "")
    if sig_source in ("deeds", "mortgages") and LLC_NAME_RE.search(entity_name):
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
    print("   [1/3] Greenville County tax record lookup...")
    gis_result = lookup_gis(entity_name, address)
    for note in gis_result.notes:
        print(f"         {note}")
    if gis_result.principal_name:
        result = gis_result
        if result.is_enriched():
            # GIS concatenates first+middle without spaces ("SMITH KENISHACHERRELL").
            # For simple deed grantees (≤3 words, no AND) we have the clean name from
            # the deed itself — use that instead.
            _llc_terms = ("llc", "inc", "corp", "ltd", "lp", "llp",
                          "holdings", "partners", "group", "properties")
            orig = entity_name
            orig_is_joint   = bool(re.search(r"\bAND\b", orig, re.I))
            orig_word_count = len(orig.split())
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
            if result.principal_name != entity_name:
                entity_name = result.principal_name

    # Step 1b: PIN Pivot — fetch Real Property detail page to get Care Of + mailing address
    if not result.is_enriched() and result.detail_url:
        pin_label = f"Map # {result.pin}" if result.pin else "parcel"
        print(f"   [1b/3] PIN pivot — fetching property detail ({pin_label})...")
        detail = lookup_property_detail(result.detail_url)

        care_of   = detail.get("care_of", "").strip()
        mail_addr = detail.get("mailing_address", "").strip()

        if care_of and not _LLC_TERMS_RE.search(care_of):
            care_words = care_of.lower().split()
            llc_words  = entity_name.lower().split()
            overlap    = len(set(care_words) & set(llc_words))
            if overlap < 2:
                human_name = normalize_person_name(care_of)
                print(f"   ✓ PIN pivot — Care Of: '{care_of}' → '{human_name}'")
                result.principal_name    = human_name
                result.principal_role    = ROLE_TAX_CARE_OF
                result.search_evidence   = result.detail_url
                result.mailing_address   = mail_addr or None
                result.notes.append(f"PIN pivot: Care Of = '{care_of}' → '{human_name}'")
                result.enrichment_status = "enriched"
                return result

        if mail_addr:
            result.mailing_address = mail_addr
            result.notes.append(f"PIN pivot mailing address: {mail_addr}")
            print(f"         Mailing address: {mail_addr}")

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
                street_name = re.sub(r"^\d+\s+", "", first_line).split(",")[0].strip()
                print(f"   [1c/3] GIS flip — residential mailing address: '{first_line}'...")
                flip_result = lookup_gis(street_name, first_line)
                for note in flip_result.notes:
                    print(f"          {note}")
                if flip_result.principal_name and flip_result.is_enriched():
                    print(f"   ✓ GIS flip found human: {flip_result.principal_name}")
                    result.principal_name    = flip_result.principal_name
                    result.principal_role    = ROLE_GIS_MAIL_FLIP
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
        # Legacy path: mailing address was already set before PIN pivot ran
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
                result.principal_role    = ROLE_GIS_MAIL_FLIP
                result.search_evidence   = flip_result.search_evidence
                result.notes.append(
                    f"GIS flip: '{flip_result.principal_name}' owns parcel at {first_line}"
                )
                result.enrichment_status = "enriched"
                return result
            else:
                print(f"   → GIS flip returned LLC or no result — proceeding to web search")

    # Step 2: DuckDuckGo search (also checks for SC SOS entity pages, UBJ, GSABiz)
    print("   [2/3] DuckDuckGo search + SC SOS entity page check...")
    ddg_result = enrich_via_duckduckgo(entity_name, result.mailing_address or address)
    for note in ddg_result.notes:
        print(f"         {note}")

    if ddg_result.is_enriched():
        result.principal_name    = ddg_result.principal_name
        result.principal_role    = ddg_result.principal_role
        result.search_evidence   = ddg_result.search_evidence
        result.notes            += ddg_result.notes
        result.enrichment_status = "enriched"
        print(f"   ✓ Found human: {result.principal_name}")
        return result

    # Step 3: Manual queue
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

    # Fetch all enriched signal IDs first (child table — typically small).
    # Then filter server-side with NOT IN so we never miss signals due to a
    # hard cap on the parent query. For deployments with > ~10k enriched leads,
    # move this to a Postgres function/view to avoid URL length limits.
    existing_resp = (
        client.table("enriched_leads")
        .select("signal_id")
        .execute()
    )
    existing_ids = [
        r["signal_id"] for r in (existing_resp.data or []) if r.get("signal_id")
    ]

    query = (
        client.table("market_signals")
        .select("id, entity_name, location, event_type, valuation, score, tag, source, details, signal_type")
        .order("created_at", desc=True)
        .limit(limit)
    )
    if existing_ids:
        query = query.not_("id", "in", f"({','.join(existing_ids)})")

    return query.execute().data or []


def save_enriched_lead(signal: dict, result: EnrichmentResult, dry_run: bool = False) -> None:
    signal_location = signal.get("location", "")
    resolved_location = (
        result.property_address
        or signal_location
        or None
    )

    sig_signal_type = signal.get("signal_type")
    transfer_type = sig_signal_type if sig_signal_type == "NOMINAL_TRANSFER" else None

    row = {
        "signal_id":         signal["id"],
        "event_type":        signal.get("event_type"),
        "location":          resolved_location,
        "valuation":         signal.get("valuation"),
        "score":             signal.get("score"),
        "tag":               signal.get("tag"),
        "transfer_type":     transfer_type,
        "principal_name":    result.principal_name,
        "principal_role":    result.principal_role,
        "search_evidence":   result.search_evidence,
        "enrichment_status": result.enrichment_status,
        "notes":             "\n".join(result.notes),
    }
    if dry_run:
        print("\n── Would insert to enriched_leads:")
        for k, v in row.items():
            if v:
                print(f"   {k}: {v}")
        return

    try:
        validated = EnrichedLeadRow(**row).model_dump()
    except Exception as e:
        print(f"   ✗ Schema validation failed for signal {signal['id']}: {e}")
        return

    client = get_supabase()
    if not client:
        return
    try:
        client.table("enriched_leads").upsert(validated, on_conflict="signal_id").execute()
    except Exception as e:
        print(f"   ✗ Supabase upsert failed for signal {signal['id']}: {e}")
        return
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
            time.sleep(2)
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
