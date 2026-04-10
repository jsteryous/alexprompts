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
- Step 2 completed: contact enrichment now reuses existing `enriched_leads` contact info by normalized principal/entity before Apollo/PDL, and caches newly found contacts within the run to avoid repeat lookups.

Next step:
- Make SC SOS LLC resolution more deterministic before company-level PDL fallback.
