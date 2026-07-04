# Greenville real-estate engine — `scripts/greenville/`

A local content vertical, separate from `ai_news/`. A nightly Claude routine that runs ONE
track: an **evergreen local-SEO** engine for the Greenville, SC market. Each eligible night it
writes ONE substantial, data-grounded local resource article (a relocation, neighborhood,
cost-of-living, first-time-buyer, or local-investor guide), publishes it live to `/real-estate`,
and ends it by pointing relocation and buyer leads to `/find-an-agent`. This is the search
library that actually ranks and compounds on winnable local long-tail queries ("moving to
Greenville SC neighborhoods," "cost of living in Greenville SC"). Depth over volume: about two
pieces a week, enforced by a cadence guard. See memory [[greenville-evergreen-seo-track]].

**The news track was RETIRED in July 2026.** The engine used to also run a daily both-sides
Greenville real-estate NEWS post driven by a Google-News signal collector. It was retired
because news ranks for a week then dies, does not carry buyer/seller intent, and demanded
live-publish spot-checking for little payoff. The news pieces (`collect.py`, the
`collect-greenville.yml` workflow, and the passes `pass1_reporter.md`, `pass2_sides.md`,
`pass3_writer.md`) **remain in the repo, unwired**, so the decision is reversible, but the
orchestrator no longer calls them. Do not treat them as live.

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
- **`routine/`** — the orchestrator plus the two live evergreen passes, `pass0_scout.md`
  (self-sources a topic when the bank is empty) and `pass_evergreen.md` (the self-researching
  evergreen writer). The retired news passes (`pass1_reporter.md`, `pass2_sides.md`,
  `pass3_writer.md`) also live here, unwired. See `routine/README.md`.
- **`commercial.py`** — a separate DATA collector (NOT part of the content routine, still live).
  Pulls recent Greenville County **commercial property sales** from the county's public ArcGIS
  service (`GreenvilleJS/Map_Layers_JS` layer 2, "Commercial") into a lean JSON the site reads.
  No scraper, no key. Powers the `/tools/buyers-list` (buyer/LLC, price, date, address). Output
  goes to **`src/data/commercialSales.json`** (the Next app imports it), so the page is
  statically generated. Pure functions unit-tested in `tests/test_commercial.py`.
- **`collect.py`** — the retired news collector (Google News RSS across local real-estate
  beats). Unwired; kept for reference and reversibility. Its `data/` hand-off
  (`signal-latest.json` + `.txt`) is no longer read.

## Commands

```bash
cd scripts
# commercial sales (the buyer's list) — the one live collector here
python -m greenville.commercial                                       # print a summary
python -m greenville.commercial --min-price 1000000 --months 24 \
  --json-out ../src/data/commercialSales.json                         # refresh the site dataset
python -m greenville.commercial --from-json snapshot.json             # replay, no network
python -m unittest scripts.tests.test_commercial -v

# retired news collector (unwired; reference only)
python -m greenville.collect --limit 15
```

## Automation

- **`.github/workflows/collect-commercial.yml`** (WEEKLY Mon 07:00 UTC) runs
  `greenville.commercial` and commits `src/data/commercialSales.json`. No secrets (the county
  ArcGIS service is public + free). The push redeploys the statically generated
  `/tools/buyers-list` page with fresh sales. **Still live.**
- **`.github/workflows/collect-greenville.yml`** (DAILY, news signal) is now **unused** (the
  news track is retired). It is harmless (it just commits a signal file nobody reads) and left
  in place for reversibility; safe to disable.
- The **routine** runs nightly as a scheduled Claude cloud agent pointed at
  `routine/orchestrator.md`. Each eligible night (cadence permitting, about two a week) it picks
  a topic (bank first, else the scout), writes an evergreen local guide, and creates a
  `blog_posts` row tagged `greenville`, `evergreen`, live to `/real-estate`, plus a Gmail verify
  packet with the article and the X post. On a cadence-cooldown night it posts nothing. See
  `routine/README.md`.

## Publishing + dedup

- The routine writes posts via the **Supabase connector** (there is no generic create-post API;
  `/api/publish` only flips status). New posts are **PUBLISHED** live to `/real-estate` (the
  dedicated section). Auto-publish is safe because the pass guardrails (the evergreen writer's
  anti-thin-content bar, fair-housing rules, not-advice, every number traced to a cited source)
  plus dedup do the gating, and a verify email still goes out for after-the-fact spot-checks. If
  dedup is unavailable on a run, that run falls back to DRAFT. Set STEP 3 back to `DRAFT` to
  require human review for every piece again.
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
  never blocks the email. Needs Resend (`RESEND_API_KEY` + `EMAIL_FROM`) on the site.
- **X** has no auto-poster (no X connector); the routine drafts the X post and emails it for
  manual posting.

## Images (rendered after publish, off the agent)

The cover is NOT rendered by the routine. The cloud agent reaches the world only through MCP
connectors (Supabase, Gmail), so it cannot call Google or the Storage API over HTTP. Instead the
writer names a place and the site renders the cover afterward:

1. **The evergreen writer names a location** (`pass_evergreen.md` emits a `## IMAGE` block; a
   scout-sourced topic carries an anchor the writer pins). Every Greenville piece has a place to
   pin (the neighborhood's center for a neighborhood guide, a recognizable landmark like Falls
   Park for a city-level piece), so `none` should never fire.
2. **The orchestrator stores that string** in `blog_posts.image_address` on the row it publishes
   (STEP 3), leaving `cover_image` NULL.
3. **The finalize cron renders it** (`/api/finalize-greenville`, daily, after the routine; see
   `src/lib/greenvilleImage.ts`). It geocodes the address and picks a **Street View photo** when
   Google has imagery there, otherwise a **roadmap-with-pin**, uploads it to the public
   `post-images` bucket, and sets `cover_image`. Both carry Google's own watermark, so no credit
   line is needed. If a render fails it retries on the next daily run (idempotent: it only acts
   while `cover_image` is NULL, within a 3-day window), then ages out.

**Keys.** Rendering runs on Vercel and uses the site's `GOOGLE_PLACES_API_KEY` (Maps Static,
Geocoding, Street View Static enabled) plus `SUPABASE_SERVICE_KEY` for the Storage upload. See
memory [[greenville-lead-image-cascade]].

## Guardrails (enforced in the routine passes)

Not investment/legal/financial advice. **Fair housing is the headline risk on this track** (it
is relocation and neighborhood content): describe housing by objective, factual attributes
only, never steer a protected class or say who a place is "right for." Every load-bearing number
traces to a cited public source (Census ACS, FHFA Greenville MSA, county Assessor/ArcGIS,
Zillow/Redfin, local publishers). Substantial and specific, never thin (thin content hurts
rankings). The delivered verify email leads with the numbers to spot-check and a fair-housing
re-read.
