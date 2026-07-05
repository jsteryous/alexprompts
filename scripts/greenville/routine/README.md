# Greenville Real Estate routine

A nightly Claude routine with ONE track: an **evergreen local-SEO** engine for the Greenville,
SC market. Each eligible night it writes ONE substantial, data-grounded local resource article
for a winnable long-tail local query (relocation, neighborhood, cost-of-living, first-time-buyer,
local-investor), publishes it live to `/real-estate`, drafts an X post, and closes by pointing
relocation/buyer leads to `/find-a-pro`. This is the compounding search library. Cadence
guard keeps it to about two a week.

**The news track was retired in July 2026.** The engine used to also run a daily both-sides
Greenville real-estate NEWS post. It was retired because news ranks briefly then dies, does not
carry buyer/seller intent, and demanded live-publish spot-checking for little payoff. The news
passes (`pass1_reporter.md`, `pass2_sides.md`, `pass3_writer.md`) and the collector remain in
the repo, unwired, so it is reversible, but the orchestrator no longer calls them. See the note
in `../CLAUDE.md`.

**Self-sourcing:** the routine prefers a topic from the optional bank (`../topics.md`) and
scouts its own with web search when the bank is empty, so it never runs dry. Mirrors the Lab
engine (`scripts/tech/`).

## The pipeline

The orchestrator runs at most two passes per night:

0. **`pass0_scout.md`** — runs ONLY when the topic bank is empty. Web-searches for ONE winnable,
   evergreen, uncovered local Greenville query (the five bars + fair-housing reframe), dedups
   against already-published evergreen titles and slugs, and outputs it in the bank-entry shape
   so the writer consumes it unchanged. Mirrors the Lab's `tech/routine/pass0_scout.md`. Its
   runners-up ride along in the verify email for Alex to promote into `topics.md`; the engine
   never auto-commits them (unlike the Lab, the Greenville engine does not write to the repo).
1. **`pass_evergreen.md`** — the self-researching evergreen writer. Given ONE topic (from
   `../topics.md` or the scout), it web-searches for current local specifics, grounds every
   load-bearing number in a cited source (Census ACS, FHFA Greenville MSA, county Assessor/ArcGIS,
   Zillow, local publishers), and writes an 800 to 1400 word local resource article in house
   voice. Strict fair-housing rules (describe housing by objective attributes, never steer a
   protected class), internal links to the site's tools, and a `/find-a-pro` lead-capture
   close. Emits its own `## METADATA` and `## IMAGE` blocks, so the orchestrator publishes it.

`orchestrator.md` wires the passes as cold sub-agents. STEP 1 picks the topic (cadence guard →
dedup → bank first, else the scout). STEP 2 writes it. STEP 3 inserts the `blog_posts` row live.
STEP 4 emails the human verify packet (the article + the X post to copy-paste, plus the scout's
runners-up if it ran). On a cadence-cooldown night it posts nothing.

## Images (rendered after publish, off the agent)

The routine does NOT render the cover. The cloud agent's sandbox reaches the world only through
MCP connectors, so it cannot call Google or Supabase Storage over HTTP. The evergreen writer
names a geocodable LOCATION (the `## IMAGE` block), the orchestrator stores it in
`blog_posts.image_address` (leaving `cover_image` NULL), and the site's
**`/api/finalize-greenville`** cron renders the cover afterward (`src/lib/greenvilleImage.ts`):
a **Street View photo** of the place when Google has imagery there, otherwise a **map-with-pin**,
uploaded to the public `post-images` bucket and written back to `cover_image`. Both carry
Google's watermark, so no credit line is needed. Rendering is idempotent (it acts only while
`cover_image` is NULL, within a 3-day window), so a failed run just retries next time.

## Cadence and where it posts

- **Routine:** runs **nightly** as a scheduled Claude cloud agent (`/schedule`) pointed at
  `orchestrator.md`. On an eligible night it writes an evergreen local piece (cadence permitting,
  about two a week, the 3-day guard in STEP 1); otherwise it posts nothing.
- **Website:** the routine inserts a `blog_posts` row tagged `greenville`, `evergreen` as
  **PUBLISHED** and it goes live at `/real-estate` within about 5 minutes (no human step). The
  guardrails that make auto-publish safe are in the passes (anti-thin-content bar, fair-housing
  language, not-advice, every number sourced) and in dedup. The verify email still goes out so
  you can spot-check and unpublish at `/review` if needed. If dedup could not run (Supabase
  down), that run falls back to DRAFT. To return to human review for every piece, set STEP 3
  back to `DRAFT`.
- **Owned email list:** the agent cannot send it (no HTTP egress), so the same
  **`/api/finalize-greenville`** cron that renders the cover also broadcasts: any PUBLISHED
  `greenville` post with `last_broadcast_at` NULL is emailed to every confirmed subscriber
  (shared `broadcastPost` in `src/lib/broadcast.ts`) and stamped, so it sends once. Greenville
  posts never go to Substack, so this is the only channel that reaches readers. A DRAFT fallback
  is never emailed. Needs Resend (`RESEND_API_KEY` + `EMAIL_FROM`) configured on the site.
- **X:** there is no X auto-poster (no X connector wired), so the routine drafts the X post and
  delivers it in the email packet for you to post by hand.

## Dedup (so the nightly schedule never repeats a topic)

STEP 1 queries `blog_posts` for the `slug` and `title` of every `evergreen`-tagged post and
hands them to the topic picker and the scout, which skip anything already covered (exact or
near-duplicate). The cadence guard uses the same tag. A `source_url` column is also used when
present:

```sql
alter table blog_posts add column if not exists source_url text;
```

## Guardrails (built into the passes)

- **Not advice.** No buy/sell/hold calls. Information only.
- **Fair housing (the headline risk).** This is relocation and neighborhood content, so describe
  housing by objective, factual attributes only, never who a place is "right for," and never
  steer a protected class. The evergreen pass enforces this and reframes any risky topic.
- **Substantial, never thin.** 800 to 1400 words of real local specifics, because thin content
  hurts rankings. Depth is the moat.
- **Attribution.** Every load-bearing number traces to a cited public source; the post ends with
  a sources line; the verify email leads with the figures to spot-check and a fair-housing
  re-read.
