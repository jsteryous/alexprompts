# `scripts/greenville/` — the Greenville collectors

**The CONTENT track here is dormant.** It was an evergreen local-SEO engine writing guides
to `/real-estate`, retired when SEO stopped being a growth lever. Its passes
(`routine/pass0_scout.md`, `pass_evergreen.md`, `pass_editor.md`), its topic bank
(`topics.md`), and the older retired news passes under `scripts/_archive/greenville_news/`
all remain, unwired and reversible. Nothing here is scheduled to write.

**The DATA collectors still run, on GitHub Actions, and still matter.** They are the reason
this directory is live: they feed story selection for the research engine. Everything below
is about them.

## The collectors

- **`commercial.py`** — recent Greenville County **commercial property sales** from the
  county's public ArcGIS service (`GreenvilleJS/Map_Layers_JS` layer 2, "Commercial"). No
  scraper, no key. Output: **`src/data/commercialSales.json`**. Nothing in `src/` imports it
  since `/tools/buyers-list` was deleted; it survives as research input, so **do not delete
  it for looking orphaned**.

  **The validity fix:** it used to filter on price alone, so about 6% of rows were
  quitclaims, intercompany and family transfers, and multi-parcel deeds (where the recorded
  price covers OTHER property, so the per-parcel price shown was simply wrong) presented as
  market sales. It now reads the county's `TRUESALE` and `SALETYPE` flags and drops anything
  flagged non-market (`is_market_sale()`, `NON_MARKET_SALE_TYPES`). **Critical subtlety: the
  assessor reviews sales on a ~2-YEAR lag, so a blank `TRUESALE` means "not reviewed yet",
  not "bad".** Blanks are 100% of the last two years and ~0% before, so treating blank as
  invalid would empty the dataset. Each row carries `validated` (true only when the county
  confirmed it); the dataset carries `excluded_non_market` and `validated_count`.

- **`records.py`** — the whole commercial deed history (~12.4k rows, 2008 to now, no price
  floor) from the same ArcGIS layer, and **the only collector that ANALYZES rather than
  reports**. Output: **`src/data/greenvilleRecords.json`**, imported by nothing, read by a
  human picking a story. Three findings, all **immune to the ~4-month recording lag**
  because they measure multi-year patterns: (a) **parcel assembly**, one entity acquiring
  adjacent parcels over time, which front-runs development instead of reporting it;
  (b) **countywide portfolios**, one entity accumulating anywhere in the county, which is
  the who-is-buying-with-whose-capital question; and (c) a **repeat-sale index**, actual
  appreciation on the SAME parcel sold twice, which yields the number no local source
  reports: the share of commercial resales that LOST money.

  **The honesty constraints are the whole design, so do not relax them.** The index uses
  VALIDATED pairs only and therefore necessarily ends ~2 years back (allowing unreviewed
  sales reaches the present but contaminates badly; spot-checking the resulting "90% losses"
  found lender takebacks and $5 nominal transfers). Pairs where the parcel was built on
  between sales are dropped, because that gain is construction, not the market. A single
  multi-parcel closing is not assembly, so 2+ distinct dates and a 6-month span are required.
  Entity grouping is deliberately CONSERVATIVE because the county truncates buyer names at 24
  characters, so **every position reported is a FLOOR**; `possible_merges` lists likely
  same-owner groups for a human to confirm, because publishing a wrong owner name is far
  worse than undercounting.

- **`housing.py`** — the Greenville **residential pulse** from the free Zillow Research CSVs:
  ZHVI (typical home value) and ZORI (typical rent), each with the **national figure** so the
  local number can be read against the country, plus MoM/YoY. It also pulls five
  **market-vitals** leverage metrics (median days to pending, for-sale inventory, new
  listings, price-cut share, sale-to-list ratio, the last two scaled to whole percents) into
  a `market_vitals` block, which moves week to week even when the price level is flat. A
  `submarkets` block carries the four core metrics at **ZIP level** for every ZIP in
  Greenville County, ranked by inventory, each entry carrying its `city` and a `thin` flag
  (under 25 listings, so its monthly move is noise and must not be headlined). Output:
  **`src/data/greenvilleHousing.json`**.

  The Zip files are national and ~10MB each, so a full run downloads ~50MB and takes a couple
  of minutes; `--no-submarkets` skips them and `--county`/`--state` retarget the filter.
  **Column lookup on the Zip schema is BY NAME** (those files add State/City/Metro/CountyName
  before the months), and the county filter checks state too, since several states have a
  Greenville County. Monthly refresh, ~3-week lag, no key.

- **`collect.py`** — the retired news collector (Google News RSS). Unwired, kept for
  reference. Its `data/` hand-off is no longer read.

Pure functions in all three are unit-tested under `scripts/tests/`.

## A collector NEVER overwrites a good dataset with an empty one

Every collector here writes a file that is committed and read at build time, and every
workflow commits whatever changed, so **an empty write is a silent production edit**. On
August 9, 2026 the county stopped its ArcGIS service; `commercial.py` treated the failed
fetch as "zero sales", wrote `count: 0`, **exited 0**, and the workflow committed it, so a
live page went empty while the run reported success. `records.py` hit the same outage and did
the right thing: it refused to write and returned 1, which is why its dataset survived.

That behavior is now the rule in all three. **The gate lives in `main()`, at the WRITE, never
in `build_dataset()`**: the graceful in-process degradation is deliberate and unit-tested
(`housing.build_dataset(None, None, ...)` must still return a shaped dict), so only
persistence is gated. `commercial.py` fails when a live fetch yields zero sales; `housing.py`
fails when the headline ZHVI series has no Greenville summary, while a single missing vitals
metric still degrades quietly as designed. **Stale data beats no data** on all three, since
the deed records already lag ~4 months and Zillow refreshes monthly.

`_get_json` retries three times with a widening pause. Note the retryable failure arrives as
**HTTP 200 with an error body** (`{"error": {"code": 500, "message": "... not started"}}`),
not as a 5xx, so status alone will not catch it. When a run fails this way the upstream is
down, so the fix is to wait for the county, not to touch the collector.

## Commands

```bash
cd scripts
# commercial sales
python -m greenville.commercial                                       # print a summary
python -m greenville.commercial --min-price 1000000 --months 24 \
  --json-out ../src/data/commercialSales.json
python -m greenville.commercial --from-json snapshot.json             # replay, no network

# deed-record findings (assembly, portfolios, repeat-sale index)
python -m greenville.records                                          # print findings
python -m greenville.records --json-out ../src/data/greenvilleRecords.json
python -m greenville.records --min-parcels 4 --radius-km 0.5          # tighter assembly test

# residential pulse (ZHVI + ZORI + vitals + ZIP submarkets)
python -m greenville.housing
python -m greenville.housing --json-out ../src/data/greenvilleHousing.json
python -m greenville.housing --no-submarkets                          # skip the ~50MB Zip files

python -m unittest scripts.tests.test_commercial scripts.tests.test_records \
  scripts.tests.test_housing -v
```

## Automation

All three run on GitHub Actions with **no secrets** (every upstream is public and free) and
commit their dataset:

- **`collect-commercial.yml`** — weekly, Sun 22:00 UTC.
- **`collect-housing.yml`** — weekly, Sun 22:00 UTC. Zillow refreshes monthly so most runs
  are no-ops (the commit step skips when nothing changed). Its timeout is 20 minutes because
  the submarket block pulls four national ZIP-level CSVs.
- **`collect-records.yml`** — weekly, Sun 22:30 UTC, half an hour after the other two so the
  pushes do not race. Nothing on the site imports its output, so a refresh can never break a
  page.
- **`collect-greenville.yml`** (news signal) is RETIRED and `workflow_dispatch`-only, kept for
  reversibility. **`greenville-covers.yml`** was deleted with the auto-cover.

## If the content track is ever revived

- Posts are written via the **Supabase connector**; there is no generic create-post API
  (`/api/publish` only flips status). **Draft-first**: create DRAFT rows and let Alex publish
  at `/admin`. Nothing is broadcast until he does, since the finalize cron only touches
  PUBLISHED rows.
- **Dedup** keys on the `evergreen` tag plus already-published `slug` and `title`.
- **Fair housing is the headline risk on this track**, because it is relocation and
  neighborhood content: describe housing by objective, factual attributes only, and never
  steer a protected class or say who a place is "right for." Nothing here is investment,
  legal, or financial advice, and every load-bearing number traces to a cited public source.
- **There is no auto-cover** anywhere any more. A cover is Alex's own upload or nothing. The
  curated library, `greenvilleCovers`, `greenvilleImage.ts`, `editorCover.ts`, `cover_ingest.py`,
  and the Street View fallback are all deleted. `image_address` is still written by the engines
  as a note about what a piece is anchored to, but it renders nothing.
- **X** has no auto-poster; a routine drafts the post and emails it for manual posting.
