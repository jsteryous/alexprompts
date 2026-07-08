# Greenville real-estate engine — `scripts/greenville/`

A local content vertical, separate from `ai_news/`. A scheduled Claude routine (a few nights a
week, not nightly) that runs ONE
track: an **evergreen local-SEO** engine for the Greenville, SC market. On each scheduled run it
writes ONE substantial, data-grounded local resource article (a relocation, neighborhood,
cost-of-living, first-time-buyer, or local-investor guide), publishes it live to `/real-estate`,
and ends it by pointing relocation and buyer leads to `/find-a-pro`. This is the search
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
- **`.github/workflows/greenville-covers.yml`** (MONTHLY) runs `greenville.cover_ingest` to grow
  the cover library from Wikimedia Commons, vision-gated, and opens a PR with the new photos. Needs
  the `ANTHROPIC_API_KEY` secret. See the Images section above.
- **`.github/workflows/collect-greenville.yml`** (DAILY, news signal) is now **unused** (the
  news track is retired). It is harmless (it just commits a signal file nobody reads) and left
  in place for reversibility; safe to disable.
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

## Images (a curated Greenville photo library, set after publish, off the agent)

The cover is NOT set by the routine. The cloud agent reaches the world only through MCP
connectors (Supabase, Gmail), so it cannot fetch a photo or call the Storage API over HTTP.
These pieces are, in effect, marketing Greenville to people deciding whether to move here, so
the cover should be a beautiful, iconic Greenville photo (Falls Park, downtown, the Reedy),
not a geocoded street corner or a red-pin map. So the writer names a SUBJECT and the site
picks a hand-curated photo:

1. **The evergreen writer names a subject** (`pass_evergreen.md` emits a `## IMAGE` block with a
   `subject:` key from a fixed vocabulary: `downtown-falls` the default, `liberty-bridge`,
   `reedy-river`, `north-main`, `west-end`, `swamp-rabbit-trail`, `travelers-rest`). It may give a
   fallback `location:` string only when no subject fits (rare).
2. **The orchestrator stores that value** in `blog_posts.image_address` on the row it publishes
   (STEP 3), leaving `cover_image` NULL.
3. **The finalize cron picks the cover** (`/api/finalize-greenville`, daily, after the routine; see
   `src/lib/greenvilleImage.ts` -> `renderCover`, which consults `src/lib/greenvilleCovers.ts`).
   The cascade: (a) the **curated library** first, a committed, freely-licensed photo under
   `public/greenville/library/` matched to the subject (any Greenville-area address resolves to at
   least the city-level default, so this is the normal path); (b) a **Google Street View** photo of
   the geocoded point only for a non-Greenville pin; (c) a **map-with-pin** as the last resort. It
   sets `cover_image`, and for a CC-BY library photo also writes the attribution to `cover_credit`
   (shown under the article hero; CC0 photos and Google covers need none). Idempotent: it only acts
   while `cover_image` is NULL, within a 3-day window, then ages out.

**The library data** lives in `src/lib/greenvilleCovers.json` (subject -> a list of photos), which
`src/lib/greenvilleCovers.ts` reads. Multiple photos per subject rotate by a per-post seed (the
slug), so posts on the same subject do not all share one hero.

**Growing it, by hand.** Add a landscape, watermark-free, licensed Greenville photo to
`public/greenville/library/`, append it to the subject's array in `greenvilleCovers.json`, add its
attribution to `public/greenville/library/CREDITS.md`, and (only if it is a NEW subject) list it in
the writer's `## IMAGE` vocabulary in `pass_evergreen.md`.

**Growing it, autonomously (`cover_ingest.py`).** A monthly GitHub Action
(`.github/workflows/greenville-covers.yml`) runs `python -m greenville.cover_ingest`: for each
existing subject it searches Wikimedia Commons for new freely-licensed, landscape, high-res
candidates it does not already have, commits the best ones into the library, appends them to
`greenvilleCovers.json` + `CREDITS.md` (attribution pulled from the Commons metadata), and **opens a
PR**. It only grows existing subjects (never invents one). **The PR is the quality gate:** a human
skims the images and drops any watermarked or weak ones before merge.

**It runs FREE by default** (`--no-vision`, no key), to keep the site's zero-billing guarantee. The
script also has an OPTIONAL Claude **vision** pre-filter (Haiku: attractive? on-subject? no
watermark/overlaid text?) that scores each candidate before it reaches the PR. That path is metered
Anthropic API usage (a few cents per run), so it is opt-in: set the `ANTHROPIC_API_KEY` repo secret
and remove `--no-vision` from the workflow. Flags: `--dry-run` (list candidates, no writes), and
`--no-vision` / `--max-new` / `--per-subject` / `--subject`. Commons' Greenville depth is finite, so
expect a few good photos per run, not dozens.

**Keys.** The curated-library path needs NO key (the photos are served from `/public`). Only the
Google fallback uses `GOOGLE_PLACES_API_KEY` / `GOOGLE_MAPS_KEY` (Maps Static, Geocoding, Street
View Static) plus `SUPABASE_SERVICE_KEY` for its upload, and it now effectively never runs for a
Greenville piece. See memory [[greenville-lead-image-cascade]].

## Guardrails (enforced in the routine passes)

Not investment/legal/financial advice. **Fair housing is the headline risk on this track** (it
is relocation and neighborhood content): describe housing by objective, factual attributes
only, never steer a protected class or say who a place is "right for." Every load-bearing number
traces to a cited public source (Census ACS, FHFA Greenville MSA, county Assessor/ArcGIS,
Zillow/Redfin, local publishers). Substantial and specific, never thin (thin content hurts
rankings). The delivered verify email leads with the numbers to spot-check and a fair-housing
re-read.
