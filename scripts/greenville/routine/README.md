# Greenville Real Estate routine

A scheduled Claude routine (a few nights a week, NOT nightly) with ONE track: an **evergreen
local-SEO** engine for the Greenville, SC market. Each eligible night it writes ONE substantial,
data-grounded local resource article for a winnable long-tail local query (relocation,
neighborhood, cost-of-living, first-time-buyer, local-investor), inserts it as a **DRAFT** for
`/real-estate`, drafts an X post, and closes by pointing relocation/buyer leads to `/find-a-pro`.
This is the compounding search library. **Draft-first (July 2026):** Alex reviews every piece at
`/review` (or `/admin`) and publishes it himself; nothing goes live, gets a cover, or is broadcast
until he does. The cadence guard keeps it to about two a week.

**The news track was retired in July 2026.** The engine used to also run a daily both-sides
Greenville real-estate NEWS post. It was retired because news ranks briefly then dies, does not
carry buyer/seller intent, and demanded live-publish spot-checking for little payoff. The news
passes were moved to `scripts/_archive/greenville_news/` and the collector remains in the repo
unwired, so it is reversible, but the orchestrator no longer calls them. See the note in
`../CLAUDE.md`.

**Self-sourcing:** the routine prefers a topic from the optional bank (`../topics.md`) and
scouts its own with web search when the bank is empty, so it never runs dry. Mirrors the Lab
engine (`scripts/tech/`).

## The pipeline

The orchestrator runs up to three passes per night:

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
   close. Emits its own `## METADATA` and `## IMAGE` blocks.
2. **`pass_editor.md`** — the de-generic quality gate, run as a fresh clean-room sub-agent on the
   drafted piece. Because the writer researches and writes in one pass under a long rule list, it
   tends to produce a competent but GENERIC article (a national explainer with the town name dropped
   in), which does not rank on a new domain. The editor runs the "Nashville test" on every paragraph
   (cut or localize anything that would read identically for another city), enforces a
   one-un-copyable-local-asset floor and a per-section local-density floor, fact-checks that every
   load-bearing number carries an inline source, holds the fair-housing and not-advice lines, and
   fixes SEO/structure and style, then outputs the corrected four-block piece the orchestrator
   publishes. It can prepend an `EDITOR FLAG:` line when a piece is irredeemably thin, which the
   orchestrator surfaces at the top of the review packet.

`orchestrator.md` wires the passes as cold sub-agents. STEP 1 picks the topic (cadence guard →
dedup → bank first, else the scout). STEP 2 writes it. STEP 2B runs the editor (a fresh clean room)
over the draft. STEP 3 inserts the `blog_posts` row as a DRAFT. STEP 4 emails the human review
packet (the article + the X post to copy-paste, any `EDITOR FLAG`, plus the scout's runners-up if it
ran) with a `/review` link Alex uses to publish. On a cadence-cooldown night it posts nothing.

## Images (rendered after publish, off the agent)

The routine does NOT render the cover. The cloud agent's sandbox reaches the world only through
MCP connectors, so it cannot fetch a photo or call Supabase Storage over HTTP. The evergreen
writer names a curated **SUBJECT** (the `## IMAGE` block: `downtown-falls` the default, plus
`liberty-bridge`, `reedy-river`, `north-main`, `west-end`, `swamp-rabbit-trail`, `travelers-rest`,
or a fallback `location:` only when no subject fits), the orchestrator stores it in
`blog_posts.image_address` (leaving `cover_image` NULL), and **after Alex publishes** the site's
**`/api/finalize-greenville`** cron picks the cover (`src/lib/greenvilleImage.ts` →
`src/lib/greenvilleCovers.ts`): a hand-curated, freely-licensed photo from the committed Greenville
library under `public/greenville/library/` matched to the subject (the normal path, no API key),
falling back to a **Google Street View** photo or a **map-with-pin** only for an off-map,
non-Greenville pin. It writes `cover_image` and, for a CC-BY library photo, `cover_credit`.
Rendering is idempotent (it acts only while `cover_image` is NULL, within a 3-day window), so a
failed run just retries next time. A DRAFT is never covered, because the cron only touches
PUBLISHED rows.

## Cadence and where it posts

- **Routine:** runs as a scheduled Claude cloud agent (`/schedule`) pointed at `orchestrator.md`,
  a few nights a week (NOT nightly, so it does not spin up and bail on cooldown nights). On an
  eligible night it writes an evergreen local piece (cadence permitting, about two a week, plus the
  STEP 1 guards); otherwise it posts nothing.
- **Website:** the routine inserts a `blog_posts` row tagged `greenville`, `evergreen` as a
  **DRAFT**. It does NOT go live on its own. **Draft-first (July 2026):** Alex reviews every piece
  at `/review` (or `/admin`) and publishes it himself, so a human is the final quality gate on a new
  domain where thin or generic content would hurt the whole site. The machine gates still run first
  (the writer's anti-thin-content bar, the `pass_editor` de-generic audit, fair-housing language,
  not-advice, every number sourced, plus dedup), and the review email carries a `/review` link and
  the figures to spot-check. Nothing is covered or broadcast until he publishes. To return to
  auto-publish live, flip STEP 3 `DRAFT` → `PUBLISHED` (and `published_at` NULL → `now()`).
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
