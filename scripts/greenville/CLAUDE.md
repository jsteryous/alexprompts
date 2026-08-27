# Greenville real-estate engine — `scripts/greenville/`

A local content vertical, separate from `ai_news/`. A scheduled Claude routine (a few nights a
week, not nightly) that runs ONE
track: an **evergreen local-SEO** engine for the Greenville, SC market. On each scheduled run it
writes ONE substantial, data-grounded local resource article (a relocation, neighborhood,
cost-of-living, first-time-buyer, or local-investor guide), publishes it live to `/real-estate`,
and ends it with a short, warm offer of Alex's help (linked to `/find-a-pro`; the copy NEVER
explains that Alex refers or matches leads, and never says he does not practice. See the root
`CLAUDE.md` strategic-direction note, tightened August 1, 2026). This is the search
library that actually ranks and compounds on winnable local long-tail queries ("moving to
Greenville SC neighborhoods," "cost of living in Greenville SC"). Depth over volume: about two to
three pieces a week, set by the CLOUD SCHEDULE (a few nights, e.g. Mon/Wed/Fri), with an in-code
safety guard as a backstop only (skip on a same-day duplicate run, or when 3+ evergreen drafts are
already awaiting review). See memory [[greenville-evergreen-seo-track]].

**The news track was RETIRED in July 2026.** The engine used to also run a daily both-sides
Greenville real-estate NEWS post driven by a Google-News signal collector. It was retired
because news ranks for a week then dies, does not carry buyer/seller intent, and demanded
live-publish spot-checking for little payoff. `collect.py` and its `collect-greenville.yml`
workflow **remain in the repo, unwired**, and the three news passes were moved to
`scripts/_archive/greenville_news/` (`pass1_reporter.md`, `pass2_sides.md`, `pass3_writer.md`), so
the decision is reversible, but the orchestrator no longer calls them. Do not treat them as live.

The **self-sourcing** design mirrors the Lab (`scripts/tech/`): the routine prefers a topic
Alex queued in the optional bank (`topics.md`), and when the bank is empty it scouts its own
with web search (`pass0_scout.md`), so it never runs dry.

## Layout

- **`topics.md`** — the **evergreen topic bank** (the OPTIONAL priority queue, and doubles as
  the site's Greenville keyword map). A `queued` list of winnable long-tail local queries, each
  with a `target_query`, a stable `target_slug` (the dedup key + URL), an anchor, and the data
  to ground it. Self-sourcing: seed a `queued` topic to steer, leave it empty to let the scout
  choose. The routine reads it, dedups against already-published `evergreen` slugs + titles, and
  never writes to it. Mirrors `ai_news/questions.md` and the Lab's `tech/topics.md`.
- **`routine/`** — the orchestrator plus the three live evergreen passes, `pass0_scout.md`
  (self-sources a topic when the bank is empty), `pass_evergreen.md` (the self-researching
  evergreen writer), and `pass_editor.md` (the de-generic quality gate, a fresh clean room that
  runs the "Nashville test" on the draft, enforces local density and one un-copyable local asset,
  fact-checks inline sources, and holds fair-housing/style before publish). The retired news passes
  were moved to `scripts/_archive/greenville_news/`. See `routine/README.md`.
- **`commercial.py`** — a separate DATA collector (NOT part of the content routine, still live).
  Pulls recent Greenville County **commercial property sales** from the county's public ArcGIS
  service (`GreenvilleJS/Map_Layers_JS` layer 2, "Commercial") into a lean JSON the site reads.
  No scraper, no key. Powers the `/tools/buyers-list` (buyer/LLC, price, date, address). Output
  goes to **`src/data/commercialSales.json`** (the Next app imports it), so the page is
  statically generated. Pure functions unit-tested in `tests/test_commercial.py`.
  **July 2026 validity fix:** it used to filter on price alone, so about 6% of the rows on the
  live page were quitclaims, intercompany transfers, family transfers, and multi-parcel deeds
  (where the recorded price covers OTHER property, so the per-parcel price shown was simply
  wrong) presented as market sales. It now reads the county's `TRUESALE` + `SALETYPE` flags and
  drops anything flagged non-market (`is_market_sale()`, `NON_MARKET_SALE_TYPES`). **Critical
  subtlety: the assessor reviews sales on a ~2-YEAR lag, so a blank `TRUESALE` means "not
  reviewed yet", not "bad".** Blanks are 100% of the last two years and ~0% before, so treating
  blank as invalid would empty the page. Each row carries `validated` (true only when the county
  confirmed it) so the tool can be honest about which prices are confirmed; the dataset carries
  `excluded_non_market` + `validated_count`.
- **`records.py`** — a third DATA collector (NOT part of the content routine, added July 2026),
  and the only one that ANALYZES rather than reports. Pulls the county's whole commercial deed
  history (~12.4k rows, 2008 to now, no price floor) from the same ArcGIS layer and looks for
  patterns no single sale shows, which is the part of this dataset nobody else in the market
  publishes. Three findings, all **immune to the ~4-month recording lag** because they measure
  multi-year patterns: (a) **parcel assembly**, one entity acquiring adjacent parcels over time,
  which front-runs development instead of reporting it; (b) **countywide portfolios**, one entity
  accumulating parcels anywhere in the county, which is the who-is-buying-with-whose-capital
  question; (c) a **repeat-sale index**, actual appreciation on the SAME parcel sold twice, which
  yields the number no local source reports: the share of commercial resales that LOST money.
  Output goes to **`src/data/greenvilleRecords.json`**. Nothing on the site imports it; it is a
  research input for picking a story. Pure functions unit-tested in `tests/test_records.py`.
  **The honesty constraints are the whole design, so do not relax them:** the index uses
  VALIDATED pairs only and therefore necessarily ends ~2 years back (allowing unreviewed sales
  reaches the present but contaminates badly, spot-checking the resulting "90% losses" found
  lender takebacks and $5 nominal transfers); pairs where the parcel was built on between sales
  are dropped because that gain is construction, not the market; a single multi-parcel closing is
  not assembly, so 2+ distinct dates and a 6-month span are required; and entity grouping is
  deliberately CONSERVATIVE because the county truncates buyer names at 24 characters, so every
  position reported is a FLOOR. `possible_merges` lists likely same-owner name groups for a human
  to confirm, because publishing a wrong owner name is far worse than undercounting.
- **`housing.py`** — a second DATA collector (NOT part of the content routine, live since July
  2026), and now the **only** dataset the Upstate Brief reads. County deed records lag ~4 months, so
  the Brief's old "what sold" premise could not carry the weekly read; this pulls the
  Greenville, SC **residential pulse** from the free Zillow Research CSVs (ZHVI typical home
  value + ZORI typical rent), each with the **national figure** so the brief can read the Upstate
  against the country, and computes MoM/YoY. It also pulls five **market-vitals** leverage metrics
  (median days to pending, for-sale inventory, new listings, price-cut share, sale-to-list ratio;
  the last two scaled to whole percents) into a `market_vitals` block, so the brief can report a
  buyer-versus-seller read that actually moves week to week even when the price level is flat.
  **Since July 27, 2026 it also builds a `submarkets` block**: the same four core metrics (ZHVI,
  inventory, days to pending, price-cut share) at **ZIP level** for every ZIP in Greenville County,
  ranked by inventory, each entry carrying its `city` town name and a `thin` flag (under 25
  listings, so its monthly move is noise and the writer may not headline it). That block replaced
  the two cut commercial-deed sections and powers the Brief's "Where the leverage is." The Zip
  files are national and ~10MB each, so a full run downloads ~50MB and takes a couple of minutes;
  `--no-submarkets` skips them, and `--county` / `--state` retarget the filter. Column lookup on
  the Zip schema is BY NAME (the Zip files add State/City/Metro/CountyName before the months), and
  the county filter checks state too, since several states have a Greenville County.
  Monthly refresh (~3-week lag), no key. Output goes to
  **`src/data/greenvilleHousing.json`**. Pure functions unit-tested in `tests/test_housing.py`.
- **`collect.py`** — the retired news collector (Google News RSS across local real-estate
  beats). Unwired; kept for reference and reversibility. Its `data/` hand-off
  (`signal-latest.json` + `.txt`) is no longer read.

**A collector NEVER overwrites a good dataset with an empty one (August 10, 2026).** Every
collector here writes a file that is committed and read at build time, and every workflow commits
whatever changed, so an empty write is a silent production edit. On August 9, 2026 the county
stopped its `GreenvilleJS/Map_Layers_JS` ArcGIS service; `commercial.py` treated the failed fetch
as "zero sales," wrote `count: 0`, **exited 0**, and the workflow committed it, so
`/tools/buyers-list` went live empty while the run reported success. `records.py` hit the same
outage and did the right thing: it refused to write and returned 1, which is why
`greenvilleRecords.json` survived. That behavior is now the rule in all three. The gate lives in
`main()`, at the WRITE, never in `build_dataset()`: the graceful in-process degradation is
deliberate and unit-tested (`housing.build_dataset(None, None, ...)` must still return a shaped
dict), so only persistence is gated. `commercial.py` fails when a live fetch yields zero sales;
`housing.py` fails when the headline ZHVI series has no Greenville summary, while a single missing
vitals metric still degrades quietly as designed. Stale data beats no data on all three, since the
deed records already lag ~4 months and Zillow refreshes monthly. `_get_json` also retries three
times with a widening pause; the retryable failure arrives as **HTTP 200 with an error body**
(`{"error": {"code": 500, "message": "... not started"}}`), not as a 5xx, so status alone will not
catch it. When a run fails this way the upstream is down, so the fix is to wait for the county, not
to touch the collector.

## Commands

```bash
cd scripts
# commercial sales (the buyer's list) — the one live collector here
python -m greenville.commercial                                       # print a summary
python -m greenville.commercial --min-price 1000000 --months 24 \
  --json-out ../src/data/commercialSales.json                         # refresh the site dataset
python -m greenville.commercial --from-json snapshot.json             # replay, no network
python -m unittest scripts.tests.test_commercial -v

# deed-record findings (assembly + portfolios + repeat-sale index) — analysis, not reporting
python -m greenville.records                                          # print findings
python -m greenville.records --json-out ../src/data/greenvilleRecords.json
python -m greenville.records --min-parcels 4 --radius-km 0.5          # tighter assembly test
python -m greenville.records --from-json snapshot.json                # replay, no network
python -m unittest scripts.tests.test_records -v

# residential pulse (Zillow ZHVI + ZORI + vitals + ZIP submarkets) — the Brief's only dataset
python -m greenville.housing                                          # print a summary
python -m greenville.housing --json-out ../src/data/greenvilleHousing.json  # refresh the dataset
python -m greenville.housing --no-submarkets                          # skip the ~50MB Zip files
python -m greenville.housing --county "Spartanburg County"            # retarget the submarkets
python -m unittest scripts.tests.test_housing -v

# retired news collector (unwired; reference only)
python -m greenville.collect --limit 15
```

## Automation

- **`.github/workflows/collect-commercial.yml`** (WEEKLY Sun 22:00 UTC; moved July 13, 2026
  from Mon 07:00 because GitHub cron delays pushed it past the Monday Upstate Brief run) runs
  `greenville.commercial` and commits `src/data/commercialSales.json`. No secrets (the county
  ArcGIS service is public + free). The push redeploys the statically generated
  `/tools/buyers-list` page with fresh sales. **Still live.**
- **`.github/workflows/collect-housing.yml`** (WEEKLY Sun 22:00 UTC, same slot as the commercial
  refresh) runs `greenville.housing` and commits `src/data/greenvilleHousing.json`. No secrets
  (the Zillow Research CSVs are public + free). Zillow refreshes monthly, so most weekly runs are
  no-ops (the commit step skips when nothing changed); the point is to be fresh before the Monday
  Upstate Brief drafts. **Live since July 2026.** Its timeout is 20 minutes because the July 27,
  2026 submarket addition pulls four more national ZIP-level CSVs (~50MB total).
- **`.github/workflows/collect-records.yml`** (WEEKLY Sun 22:30 UTC, half an hour after the other
  two so the pushes do not race) runs `greenville.records` and commits
  `src/data/greenvilleRecords.json`. No secrets (same public county ArcGIS service). Nothing on
  the site imports this file, so a refresh can never break a page; it feeds story selection.
  Weekly is generous given the findings are multi-year patterns. **Live since July 2026.**
- **`.github/workflows/greenville-covers.yml`** (MONTHLY) grew the cover library from Wikimedia
  Commons and opened a PR with the new photos. **DELETED August 27, 2026** with the auto-cover,
  along with `greenville/cover_ingest.py` and the library itself. See the Images section below.
- **`.github/workflows/collect-greenville.yml`** (news signal) is **RETIRED** (the news track is
  gone; nothing reads its `signal-latest.json`). Its daily schedule was removed July 2026 so it no
  longer pushes noise commits; it is now `workflow_dispatch`-only, kept for reversibility.
- The **routine** runs on a scheduled Claude cloud agent (a few nights a week, e.g. Mon/Wed/Fri,
  NOT nightly, so it does not spin up and bail on cooldown nights) pointed at
  `routine/orchestrator.md`. On each scheduled run it picks
  a topic (bank first, else the scout), writes an evergreen local guide, and creates a **DRAFT**
  `blog_posts` row tagged `greenville`, `evergreen` (draft-first as of July 2026, was live), plus
  a Gmail review packet with the article, the X post, and a `/review` link Alex uses to publish.
  The STEP 1 safety guard makes it post nothing on a same-day duplicate run or when 3+ evergreen
  drafts are already awaiting review. See `routine/README.md`.

## Publishing + dedup

- The routine writes posts via the **Supabase connector** (there is no generic create-post API;
  `/api/publish` only flips status). **Draft-first as of July 2026** (was auto-publish-live): new
  posts are created as **DRAFT** and Alex reviews + publishes each one at `/review` (the routine's
  email carries the post id and a `/review?id=..&token=..` link; one-click publish is
  `/api/publish?id=..&token=..`). The pass guardrails (the evergreen writer's anti-thin-content
  bar, fair-housing rules, not-advice, every number traced to a cited source) plus dedup still run,
  but a human is now the final gate. Nothing is covered or broadcast until Alex publishes (the
  finalize cron only touches PUBLISHED rows). To go back to auto-publish live, flip STEP 3
  `DRAFT`→`PUBLISHED` (and `published_at NULL`→`now()`). See memory `publishing-draft-first`.
- **Dedup** keys on the `evergreen` tag (cadence guard + already-published `slug` and `title`).
  A `source_url` column is also used when present; add it once with
  `alter table blog_posts add column if not exists source_url text;`.
- **Emailing the owned list (the finalize cron, not the agent).** Greenville posts never go to
  Substack, so the owned `subscribers` list is the only channel that reaches readers. The agent
  cannot send it (no HTTP egress from the sandbox), so the same `/api/finalize-greenville` cron
  that renders the cover also broadcasts: for any PUBLISHED `greenville` post with
  `last_broadcast_at` NULL it emails every CONFIRMED subscriber (via the shared `broadcastPost`
  in `src/lib/broadcast.ts`) and stamps `last_broadcast_at`, so it sends exactly once. A DRAFT
  fallback is never emailed. The render and the broadcast are independent, so a failed image
  never blocks the email. Needs Resend (`RESEND_API_KEY` + `EMAIL_FROM`) on the site. **The same
  cron now also finalizes `greenville works` posts** (the `scripts/tech/` engine): it renders their
  cover from this same curated library and broadcasts them identically, so the cover + email path is
  shared across both local sections.
- **X** has no auto-poster (no X connector); the routine drafts the X post and emails it for
  manual posting.

## Images (DELETED August 27, 2026 — there is no auto-cover)

This track used to name a `subject:` in its `## IMAGE` block, which `/api/publish` and the
`/api/finalize-greenville` cron turned into a hand-curated Greenville photo. Alex killed the
whole mechanism ("i always have to find my own pics anyway"). Deleted: `src/lib/greenvilleCovers`
(`.ts` + `.json`), `src/lib/greenvilleImage.ts`, `src/lib/editorCover.ts`, the eleven photos in
`public/greenville/library/` and their `CREDITS.md`, `scripts/greenville/cover_ingest.py`, and the
monthly `.github/workflows/greenville-covers.yml` PR that grew the library. The Google Street View
and static-map fallback went with it, so `GOOGLE_MAPS_KEY` is now unused.

A cover is a photo Alex uploads in the editor, or nothing at all, in which case the page renders
`PostCover`'s branded `>` placeholder. `image_address` is still written by the engines as a note
about what a piece is anchored to, but it renders nothing. The seven published posts that were
carrying an auto-assigned library photo had `cover_image` and `cover_credit` cleared in the same
pass. See memory [[greenville-lead-image-cascade]], which this supersedes.

## Guardrails (enforced in the routine passes)

Not investment/legal/financial advice. **Fair housing is the headline risk on this track** (it
is relocation and neighborhood content): describe housing by objective, factual attributes
only, never steer a protected class or say who a place is "right for." Every load-bearing number
traces to a cited public source (Census ACS, FHFA Greenville MSA, county Assessor/ArcGIS,
Zillow/Redfin, local publishers). Substantial and specific, never thin (thin content hurts
rankings). The delivered verify email leads with the numbers to spot-check and a fair-housing
re-read.
