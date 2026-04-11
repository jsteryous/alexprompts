# REBB Pipeline — Scripts Context

See root `CLAUDE.md` for schema, DB columns, env vars, and per-module mechanics.

## The Problem

Every signal (deed/mortgage/SOS filing) names an entity — often an LLC. Goal: unmask
the human decision-maker. This is **graph traversal**, not a linear lookup.

Both individual grantees and LLC grantees are valid leads. Individuals may need trade
services (roofing, pools, GCs). LLCs signal commercial activity (higher value for
landscapers, cleaners, commercial realtors). Don't filter either out.

## Chain Status

| Source | Status |
|---|---|
| Mortgage OCR (CountyWeb) | **Best source.** Gets signer name + title from signature block. |
| Deed mailing OCR (CountyWeb) | **Working** — `lookup_deed_mailing()` in `enrich_mort.py`; Step 0b in `enrich.py` |
| GIS tax query → owner name | Working |
| PIN pivot → Care Of + mailing | Working |
| GIS flip on residential mailing | Working |
| GIS flip on commercial mailing | Working — `_gis_commercial_hop()` in `enrich.py` |
| SOS direct search (Playwright) | Working — `lookup_sos_direct()` in `enrich_web.py` |
| SOS discovery via DDG | Unreliable fallback — DDG index is stale for recent filings |
| Address clustering (multiple LLCs at same address) | Not built |

## Deed Mailing Lookup — How It Works

`lookup_deed_mailing(entity_name, rec_date_str, debug)` in `enrich_mort.py`.
Searches CountyWeb (`viewer.greenvillecounty.org`) for DEED doc types, OCRs page 1,
parses the "Return To:" / "After Recording Return To:" block via `_RETURN_TO_RE`.
Falls back to `extract_best_property_address(text[:3000])` if header is OCR-garbled.

Injected as **Step 0b** in `enrich.py` — fires for deed-only signals with LLC names,
after mortgage OCR (Step 0), before GIS (Step 1). Sets `result.mailing_address` which
the PIN pivot / GIS flip logic already knows how to use.

**Limitation:** Non-GVL "Return To:" addresses (e.g. attorney in Mt. Pleasant) produce
0 GIS hits. Address still lands in `notes` for manual review.

**GovOS is paywalled — never attempt.** Document images in GovOS require per-document
purchase. XHR interception returns nothing. CountyWeb has the same docs for free.

## Contact Info (Separate Concern — Don't Mix With Name Resolution)

Proven in POC (April 2026, `poc_contact_sources.py`):
- **PDL**: 0% hit rate on GVL LLC owners. Coverage gap, not a credits problem.
- **Google Places**: ~30-60% expected hit rate on active trade businesses with GBPs.
  Needs 50% token overlap validation to reject fuzzy mismatches. `GOOGLE_PLACES_API_KEY`
  in `.env.local`. Hold until name resolution chain is stronger.

## Dead Ends

- **GovOS document images**: Paywalled. Never attempt XHR interception or screenshot OCR.
- **SC SOS bulk CSV**: Paid Tyler subscriber agreement. Not self-serve.
- **gcgis.org ArcGIS API**: IP-blocked for non-browser requests.
- **`greenvillecounty.org/vRealPr24/`**: Returns 500.
- **PDL for GVL LLC owners**: Coverage gap confirmed. Not a budget issue.
