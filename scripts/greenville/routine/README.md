# Greenville Real Estate routine

A daily Claude routine with **two tracks**, one chosen per night, producing WRITTEN content
for a **website post** and an **X post / short thread** (no video):

- **News track** (default when there is real news): turns the day's biggest **Greenville, SC
  real-estate** story into a both-sides explainer. The spine is **no forced verdict**: explain
  what happened, give the consensus, steelman the devil's advocate, then hand the reader the
  question. Timely, ranks briefly.
- **Evergreen local-SEO track** (the productive no-news outcome): writes ONE substantial,
  data-grounded local resource piece from `../topics.md` for a winnable long-tail local query,
  and closes by pointing relocation/buyer leads to `/find-an-agent`. This is the compounding
  search library. Cadence guard keeps it to about two a week. See the two-track note in
  `../CLAUDE.md`.

It mirrors the `ai_news/routine/` pattern (an orchestrator plus isolated passes). The news
track is three passes (a local explainer, not a deep-dive); the evergreen track is one
self-researching pass.

## The pipeline

1. **`pass1_reporter.md`** — establishes the verified facts, finds the real
   publisher article behind Google News's opaque redirect link, names the central
   place by its proper name, separates CONFIRMED from REPORTED, dedups against what
   the site already covered, and lists what a human must verify. It also names the
   **lead-image location**: a geocodable LOCATION string the finalize cron later renders
   a cover from. A location is the FLOOR: even a diffuse civic story (a county/city tax,
   bond, zoning, or policy decision) gets a `map` pinned on the named corridor, the
   deciding body's seat, or the county, so `none` is reserved for a story with no SC
   place at all and should effectively never fire. On a quiet day it returns
   `NO NEW STORY TODAY` and the run stops.
2. **`pass2_sides.md`** — picks the single fault line, then builds THE CONSENSUS and
   THE DEVIL'S ADVOCATE, both steelmanned, plus what would settle it and the
   reader's question. Takes no stance.
3. **`pass3_writer.md`** — renders the website article (text-only markdown; the cover
   is added later by the finalize cron) and the X post in house voice (no em dashes, no
   fragments, plain English), with fair-housing and not-advice guardrails. Emits a
   `## METADATA` block the orchestrator uses to create the post.

The evergreen track uses a single pass instead of the three above:

4. **`pass_evergreen.md`** — the self-researching evergreen writer. Given ONE topic from
   `../topics.md`, it web-searches for current local specifics, grounds every load-bearing
   number in a cited source (Census ACS, FHFA Greenville MSA, county Assessor/ArcGIS, Zillow,
   local publishers), and writes an 800 to 1400 word local resource article in house voice.
   Strict fair-housing rules (describe housing by objective attributes, never steer a protected
   class), internal links to the site's tools, and a `/find-an-agent` lead-capture close. Emits
   its own `## METADATA` and `## IMAGE` blocks (there is no reporter to name the location), so
   the orchestrator publishes it through the same STEP 4 path as a news post.

`orchestrator.md` wires the passes as cold sub-agents and reads the committed signal. Every
run it also prepares the evergreen fallback (STEP 0C: cadence guard + topic dedup + pick the
next queued topic). If the reporter finds news, it runs the news track; if not and the cadence
allows, it runs the evergreen track; otherwise it posts nothing. Either published track creates
the website post in Supabase `blog_posts`, then emails the human verify packet (the article and
the X post to copy-paste). No Google Drive copy.

The routine does NOT render the lead image. The cloud agent's sandbox reaches the world
only through MCP connectors, so it cannot call Google or Supabase Storage over HTTP. The
reporter just names a geocodable LOCATION, the orchestrator stores it in
`blog_posts.image_address` (leaving `cover_image` NULL), and the site's
**`/api/finalize-greenville`** cron renders the cover afterward (`src/lib/greenvilleImage.ts`):
a **Street View photo** of the site when Google has imagery there, otherwise a
**map-with-pin**, uploaded to the public `post-images` bucket and written back to
`cover_image`. Both carry Google's watermark, so no credit line is needed. Rendering is
idempotent (it acts only while `cover_image` is NULL, within a 3-day window), so a failed
run just retries next time. The old `greenville-image` edge function is retired.

## Cadence and where it posts

- **Collector:** `.github/workflows/collect-greenville.yml`, **daily 06:00 UTC**.
- **Routine:** runs **nightly** as a scheduled Claude cloud agent (`/schedule`)
  pointed at `orchestrator.md`, after the collector. On a no-news night it now writes an
  evergreen local piece (cadence permitting, about two a week) instead of posting nothing.
- **Website:** the routine inserts a `blog_posts` row tagged `greenville` (news posts also
  tagged `real estate`, evergreen posts also tagged `evergreen`) as
  **PUBLISHED** and it goes live at `/real-estate` within about 5 minutes (no human
  step). The guardrails that make auto-publish safe are in the passes (fair-housing
  language, not-advice, every number sourced) and in dedup. The verify email still
  goes out so you can spot-check and unpublish at `/review` if needed. If dedup could
  not run (Supabase down), that run falls back to DRAFT. To return to human review,
  set STEP 4 back to `DRAFT`.
- **Owned email list:** the agent cannot send it (no HTTP egress), so the same
  **`/api/finalize-greenville`** cron that renders the cover also broadcasts: any
  PUBLISHED `greenville` post with `last_broadcast_at` NULL is emailed to every confirmed
  subscriber (shared `broadcastPost` in `src/lib/broadcast.ts`) and stamped, so it sends
  once. Greenville posts never go to Substack, so this is the only channel that reaches
  readers. A DRAFT fallback is never emailed (the cron only touches PUBLISHED). Needs
  Resend (`RESEND_API_KEY` + `EMAIL_FROM`) configured on the site.
- **X:** there is no X auto-poster (no X connector wired), so the routine drafts the
  X post and delivers it in the email packet for you to post by hand.

## Dedup (so a daily schedule never repeats a story)

STEP 0B queries `blog_posts` for the last 30 days of `greenville`-tagged posts
(published or draft) and hands the reporter that ALREADY-COVERED list. The reporter
skips anything on it. Robust dedup keys on a `source_url` column; add it once with:

```sql
alter table blog_posts add column if not exists source_url text;
```

Without that column the routine dedups on title only (still works, just looser).

## Running the collector locally

Your home IP is not blocked, so you can dry-run the collector:

```bash
cd scripts
python -m greenville.collect --limit 15
python -m unittest scripts.tests.test_greenville -v
```

## Guardrails (built into the passes)

- **Not advice.** No buy/sell/hold calls. Information only.
- **Fair housing.** Describe the property and the facts, never who a home is "right
  for." The writer pass bans demographic-targeting language.
- **Attribution + an image credit.** Every number traces to a real publisher
  article; the post ends with a source credit; the delivered packet leads with a
  MUST-VERIFY list. The lead image is credited inline per its kind: a Commons photo as
  `*Photo: <author>, <license>, via Wikimedia Commons.*` (a license condition), a Street
  View photo as `*Street View © Google.*`, a map as `*Map data © Google.*`, an aerial as
  `*Satellite imagery © Google.*`.
- **Restraint.** Daily cadence, but the reporter posts nothing on a quiet day.
