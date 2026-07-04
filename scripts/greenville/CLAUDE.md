# Greenville real-estate engine — `scripts/greenville/`

A second content vertical, separate from `ai_news/`. A daily Claude routine with **two
tracks** (it picks one per night):

1. **News track.** Sources and scores **Greenville, SC real-estate news**, and turns the
   biggest UNCOVERED story into a both-sides WRITTEN post for the **website and X** (no
   video, consensus vs devil's advocate, no forced verdict). Timely, ranks for about a week.
2. **Evergreen local-SEO track (added July 2026, self-sourcing).** On the many no-news nights
   (the reporter says most nights), instead of going idle the routine writes ONE substantial,
   data-grounded local resource piece via `pass_evergreen.md`. It prefers a topic from the
   optional bank (`topics.md`) and, when the bank is empty, scouts its own with web search
   (`pass0_scout.md`, mirroring the Lab), so it never runs dry and needs no manual refill.
   This is the search library that actually ranks and compounds on winnable local long-tail
   queries ("moving to Greenville SC neighborhoods," "cost of living in Greenville SC"), and
   each piece ends by pointing relocation and buyer leads to `/find-an-agent`. It runs at a
   depth-over-volume cadence (about two a week, enforced by a cadence guard in the
   orchestrator), never a daily content mill. See memory [[greenville-evergreen-seo-track]].

Both tracks publish the same way (a `greenville`-tagged `blog_posts` row, live to
`/real-estate`, cover + broadcast rendered afterward by the finalize cron). See root
`CLAUDE.md` and `scripts/CLAUDE.md` for the sibling `ai_news/` engine; this package reuses the
same conventions (graceful network degradation, defusedxml RSS parsing, JSON signal hand-off,
isolated routine passes) and the same `requirements-ai-news.txt`.

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
- **`topics.md`** — the **evergreen topic bank** (the local-SEO track's OPTIONAL priority
  queue, and doubles as the site's Greenville keyword map). A `queued` list of winnable
  long-tail local queries, each with a `target_query`, a stable `target_slug` (the dedup key +
  URL), an anchor, and the data to ground it. The track is **self-sourcing**: the routine
  prefers a `queued` topic, and when the bank is empty it scouts its own with web search, so
  the file is optional (seed it to steer, leave it empty to let the engine choose). The routine
  reads it, dedups against already-published `evergreen` slugs + titles, and never writes to it.
  Mirrors `ai_news/questions.md` and the Lab's `tech/topics.md`.
- **`routine/`** — orchestrator + the news passes (reporter, two-sides, writer) plus the
  evergreen track's `pass0_scout.md` (self-sources a topic when the bank is empty) and
  `pass_evergreen.md` (the self-researching evergreen writer for the no-news nights). See
  `routine/README.md`.

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
  `routine/orchestrator.md`, after the collector. It dedups against the live site. On a real
  news story it creates a both-sides `blog_posts` row (tagged `greenville`, `real estate`); on
  a no-news night, if the cadence guard allows (about two a week), it writes an evergreen local
  piece instead (tagged `greenville`, `evergreen`); if there is neither, it posts nothing. Each
  published post also produces a Gmail verify packet with the article and the X post. See
  `routine/README.md`.

## Publishing + dedup

- The routine writes posts via the **Supabase connector** (there is no generic
  create-post API; `/api/publish` only flips status). New posts are **PUBLISHED**
  live to `/real-estate` (the dedicated section). Auto-publish is safe because the
  pass guardrails (fair-housing language, not-advice, sourced numbers) plus dedup do
  the gating, and a verify email still goes out for after-the-fact spot-checks. If
  dedup is unavailable on a run, that run falls back to DRAFT.
- **Emailing the owned list (the finalize cron, not the agent).** Greenville posts never
  go to Substack, so the owned `subscribers` list is the only channel that reaches readers.
  The agent cannot send it (no HTTP egress from the sandbox), so the same
  `/api/finalize-greenville` cron that renders the cover also broadcasts: for any PUBLISHED
  `greenville` post with `last_broadcast_at` NULL it emails every CONFIRMED subscriber (via
  the shared `broadcastPost` in `src/lib/broadcast.ts`, the core `/api/broadcast` also uses)
  and stamps `last_broadcast_at`, so it sends exactly once. A DRAFT fallback is never
  emailed because the cron only touches PUBLISHED rows. The render and the broadcast are
  independent, so a failed image never blocks the email. Needs Resend (`RESEND_API_KEY` +
  `EMAIL_FROM`) on the site; without it the post still ships and the run records 0 mail sent.
  See the owned-list section in the root `CLAUDE.md`. Set STEP 4 back to `DRAFT` to require
  human review again.
- **Dedup** keys on a `source_url` column. Add it once:
  `alter table blog_posts add column if not exists source_url text;`
  Without it the routine dedups on title only.
- **X** has no auto-poster (no X connector); the routine drafts the X post and emails
  it for manual posting.

## Images (rendered after publish, off the agent)

The lead image must be SPECIFIC to the story, never a generic stock photo. It is
NOT rendered by the routine. The cloud agent runs in a sandbox that reaches the
world only through MCP connectors (Supabase, Gmail), so it cannot call Google or
the Storage API over HTTP. Instead the reporter names a place and the site renders
the cover afterward:

1. **The reporter names a location** (`pass1_reporter.md` STEP 3): a geocodable
   LOCATION string, almost always. A story happens somewhere, so this is the FLOOR.
   A diffuse civic story (a county/city tax, bond, zoning rule, or housing-policy
   decision) still gets a `map`, pinned on the named corridor, else the deciding
   body's seat (Greenville County Square, City Hall), else the county. `none` is
   reserved for a story with no SC place to pin at all, which should not happen.
2. **The orchestrator stores that string** in `blog_posts.image_address` on the row
   it publishes (STEP 4), leaving `cover_image` NULL. There is no image step in the
   routine and no `images.txt`.
3. **The finalize cron renders it** (`/api/finalize-greenville`, daily, after the
   routine; see the site's `src/lib/greenvilleImage.ts`). It geocodes the address and
   picks a **Street View photo of the site** when Google has imagery there (so
   `/real-estate` is not wall-to-wall red-pin maps), otherwise a **roadmap-with-pin**,
   uploads it to the public **`post-images`** bucket, and sets `cover_image`. Both
   image kinds carry Google's own watermark, so no separate credit line is needed. The
   article page renders `cover_image` as the hero above the text-only body. If a render
   fails it simply retries on the next daily run (idempotent: it only acts while
   `cover_image` is NULL, within a 3-day window), then ages out.

There is no longer a Wikimedia Commons branch or an `aerial` second image; Street View
of the actual site covers the "real photo" case, and dropping them removed the
credit/licensing bookkeeping and the body-image mutation. The old `greenville-image`
Supabase Edge Function is retired (its work moved into the site's finalize route).

**Keys.** Rendering now runs on Vercel, so it uses the site's existing
`GOOGLE_PLACES_API_KEY` (Maps Static, Geocoding, Street View Static must be enabled on
it) plus `SUPABASE_SERVICE_KEY` for the Storage upload. No agent-held key, no separate
function secret. See memory [[greenville-lead-image-cascade]].

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
