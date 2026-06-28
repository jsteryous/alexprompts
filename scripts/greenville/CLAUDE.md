# Greenville real-estate engine — `scripts/greenville/`

A second content vertical, separate from `ai_news/`. It sources and scores
**Greenville, SC real-estate news**, and a Claude routine turns the biggest UNCOVERED
story into WRITTEN content for the **website and X** (no video), framed as **both
sides, no forced verdict** (consensus vs devil's advocate). See root `CLAUDE.md` and
`scripts/CLAUDE.md` for the sibling `ai_news/` engine; this package reuses the same
conventions (graceful network degradation, defusedxml RSS parsing, JSON signal
hand-off, isolated routine passes) and the same `requirements-ai-news.txt`.

## Layout

- **`collect.py`** — the collector. Queries Google News RSS across local
  real-estate BEATS (Market, Development, Rentals, Policy, Upstate), drops
  syndicated single-property listings (`is_listing_noise`), and clusters headlines
  by normalized title. Scoring is **corroboration**: how many beats and outlets
  surfaced the same story, since local news has no upvote signal. The top cluster
  is the lead. Pure functions are unit-tested in `tests/test_greenville.py`.
- **`commercial.py`** — a separate DATA collector (not news). Pulls recent
  Greenville County **commercial property sales** straight from the county's public
  ArcGIS service (`GreenvilleJS/Map_Layers_JS` layer 2, "Commercial") and writes a
  lean JSON the site reads. No scraper, no key: it is the same endpoint the county
  parcel viewer calls. Powers the `/tools/buyers-list` "buyer's list" (buyer/LLC,
  price, date, address). Output goes to **`src/data/commercialSales.json`** (NOT
  `data/`, because the Next app imports it), so the page is statically generated.
  Pure functions are unit-tested in `tests/test_commercial.py`.
- **`data/`** — CI hand-off (`signal-latest.json` + `.txt`), committed by the
  workflow; the routine reads it. Generated, do not hand-edit.
- **`routine/`** — orchestrator + three isolated passes (reporter, two-sides,
  writer). See `routine/README.md`.

## Commands

```bash
cd scripts
python -m greenville.collect                          # print the signal
python -m greenville.collect --json-out signal.json   # + scored JSON (CI hand-off)
python -m greenville.collect --from-json signal.json  # replay a snapshot, no network
python -m greenville.collect --when-days 21 --limit 15
python -m unittest scripts.tests.test_greenville -v

# commercial sales (the buyer's list) — separate data collector
python -m greenville.commercial                                       # print a summary
python -m greenville.commercial --min-price 1000000 --months 24 \
  --json-out ../src/data/commercialSales.json                         # refresh the site dataset
python -m greenville.commercial --from-json snapshot.json             # replay, no network
python -m unittest scripts.tests.test_commercial -v
```

## Automation

- **`.github/workflows/collect-greenville.yml`** (DAILY 06:00 UTC) collects from a
  non-blocked runner IP and commits the signal. No secrets needed (free sources).
- **`.github/workflows/collect-commercial.yml`** (WEEKLY Mon 07:00 UTC) runs
  `greenville.commercial` and commits `src/data/commercialSales.json`. No secrets
  (the county ArcGIS service is public + free). The push redeploys the statically
  generated `/tools/buyers-list` page with fresh sales.
- The **routine** runs nightly as a scheduled Claude cloud agent pointed at
  `routine/orchestrator.md`, after the collector. It dedups against the live site,
  posts NOTHING on a quiet night, and on a real story creates a `blog_posts` DRAFT
  (tagged `greenville`) plus a Gmail/Drive packet with the article and the X post.
  See `routine/README.md`.

## Publishing + dedup

- The routine writes posts via the **Supabase connector** (there is no generic
  create-post API; `/api/publish` only flips status). New posts are **PUBLISHED**
  live to `/real-estate` (the dedicated section). Auto-publish is safe because the
  pass guardrails (fair-housing language, not-advice, sourced numbers) plus dedup do
  the gating, and a verify email still goes out for after-the-fact spot-checks. If
  dedup is unavailable on a run, that run falls back to DRAFT. Set STEP 4 back to
  `DRAFT` to require human review again.
- **Dedup** keys on a `source_url` column. Add it once:
  `alter table blog_posts add column if not exists source_url text;`
  Without it the routine dedups on title only.
- **X** has no auto-poster (no X connector); the routine drafts the X post and emails
  it for manual posting.

## Images (the lead-image cascade)

The lead image must be SPECIFIC to the story, never a generic stock photo. The
reporter (`pass1_reporter.md` STEP 3) works a cascade and the writer renders the
result:

1. **Wikimedia Commons** only if a photo genuinely depicts the subject (the actual
   building, venue, park, or development). A generic skyline is rejected.
2. **Map of the location** otherwise (the common case). The reporter hands off a
   geocodable LOCATION + an AERIAL yes/no; it does NOT render anything itself.
3. **none** only when there is no specific place at all (rare for real estate).

For a map, orchestrator **STEP 2B** POSTs `{address, aerial}` to the
**`greenville-image` Supabase Edge Function** (`supabase/functions/greenville-image/`).
The function geocodes the address, renders a roadmap-with-pin (the cover) and, when
`aerial` is true, a hybrid satellite of the site, uploads both to the public
**`post-images`** Storage bucket, and returns the hosted urls. The writer puts the map
first (credit `*Map data © Google.*`) and, if an aerial came back, one mid-article
aerial (credit `*Satellite imagery © Google.*`).

**Keys.** The Google Maps key lives ONLY as the function's `GOOGLE_MAPS_KEY` secret
(Supabase → Edge Functions → Secrets), so neither the cloud agent nor the public HTML
ever holds it. The agent calls the function with the public anon key. The function needs
**Maps Static, Geocoding, and Street View Static** enabled on that Google key. See
memory [[greenville-lead-image-cascade]].

## Tuning

- **Coverage:** edit the `BEATS` list in `collect.py` (each beat is a name + a Google
  News query). Keep every query pinned to the place ("Greenville SC" / "Greenville
  County" / "Upstate South Carolina") or national mortgage noise floods in.
- **Scoring:** `W_BEATS`, `W_OUTLETS`, `W_APPEARANCES` at the top of `collect.py`.
- **Noise:** `LISTING_RE` drops address-shaped MLS listings; widen it if other junk
  patterns (open-house roundups, "homes for sale in") start ranking.

## Guardrails (enforced in the routine passes)

Not investment/legal/financial advice. Fair-housing-safe language (describe the
property and facts, never who a home is "right for"). Every number traces to a real
publisher article, and the delivered draft leads with a MUST-VERIFY list.
