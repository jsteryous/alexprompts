<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes -- APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Python Pipeline Workflow

Current priority is productionizing the morning enrichment pipeline in `scripts/`.

Order of work:
1. Fix entity parsing and non-human owner handling.
2. Add contact lookup dedupe/cache so repeated principals do not burn PDL credits.
3. Make SC SOS LLC resolution more deterministic before company-level PDL fallback.
4. Improve transaction/mortgage property-address extraction quality.
5. Only address evidence URL quality after output data is trustworthy.

Current status:
- Step 1 completed: non-human owners like "City of Greenville" no longer become fake people such as "Of City".
- Step 2 completed: contact enrichment now reuses existing `enriched_leads` contact info by normalized principal/entity, caches newly found contacts within the run, and caches negative no-match / no-contact person and company lookup results so repeated principals/entities do not keep hitting Apollo/PDL in the same run.
- Step 3 completed: SC SOS detail pages are now scored against the target LLC name before principal extraction, near-match entity variants are rejected, and only accepted SOS matches are allowed to short-circuit before company-level PDL fallback.
- Step 4 completed: property-address extraction now uses shared scored address parsing across GovOS detail HTML and mortgage OCR text, prefers labeled/property-context candidates, and rejects footer/party metadata false positives.
- Step 5 completed: evidence URLs are now normalized and ranked so enriched leads prefer concrete detail/article/document pages, and low-signal placeholders like search-query strings or login/disclaimer pages are no longer saved.
- Principal-quality validation completed: `principal_name` values are now screened before person-level contact enrichment so obvious junk labels, malformed token-order values, address-like strings, digit-heavy strings, and non-human entities are suppressed before Apollo/PDL person lookup.
- Historical repair/backfill pass completed: `scripts/enrich.py` now supports `--repair-stale` to re-run the current enrichment chain plus current contact gating/cache logic against stale `enriched_leads` rows, prioritizing legacy rows with no `enrichment_version`, rows with older `enrichment_version` values, and rows whose stored `principal_name` now fails current quality checks.

Next step:
- Run and validate the historical repair/backfill pass against Supabase, inspect repaired rows, and tighten the stale-row selector if it is too broad or misses obvious bad legacy leads.

Next productionization priorities:
1. Run and validate the historical repair/backfill pass against Supabase, inspect repaired rows, and tighten the stale-row selector if it is too broad or misses obvious bad legacy leads.
2. Persist a more dashboard-ready lead shape: keep `entity_name`, `property_address`, and owner mailing/address fields separately instead of collapsing them into `location`.
3. Tighten event identity and dedupe keys so multiple deeds or mortgages for the same entity on the same recording date do not collapse into one row.
4. Add fixture-based regression tests for principal parsing, property-address extraction, and contact-enrichment gating/caching behavior.

Useful command:
- `python scripts/enrich.py --repair-stale --dry-run`
