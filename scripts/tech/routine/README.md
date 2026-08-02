# Greenville Works routine (`scripts/tech/`)

A Claude routine that turns ONE thing reshaping South Carolina into a **first-person deep-dive**
published at **`/greenville-works`** on the website (user-facing section label **"SC Technology"**,
statewide since July 10, 2026, was Upstate-only), plus a short X post drafted for manual posting.
No video, no collector. This is the **local-change track** of the two-track content plan: the
real-estate engine proves Alex can go deep on the housing vertical, and Greenville Works proves he
can take a real system apart, a data center, the grid, a fiber build, an automated factory, the
port, and explain what it means for where people live, work, and invest. Its niche is the
**tech-and-capital-meets-real-estate intersection** (sharpened July 8, 2026): data centers, the
grid and energy, fiber and connectivity, manufacturing and automation, the port and logistics, who
is buying and with whose capital, and property technology. The Upstate is home turf and wins ties;
a genuinely stronger story anywhere in the state takes the slot. Roads, water and sewer capacity,
subdivisions, and rezonings are only a secondary, occasional beat, and only with a real tech,
capital, or real-estate through-line.
The audience is a smart local (and, occasionally, a hiring manager reading the work). The track's
animating question is what actually leads to greater prosperity in South Carolina and which
technologies help us get there; each piece renders one calibrated verdict on that question, and
the verdicts accumulate in a **track ledger** (VERDICT lines on the `## done` entries in
`topics.md`, drafts branch) so the essays build on each other instead of standing alone.

> **History (July 2026):** this engine was the national "Lab" tech track (broad tech deep-dives in
> Alex's voice, published to `/lab`). It was refocused into **Greenville Works** to unify the site
> around one promise, win local SEO, and funnel referral leads, while keeping the first-person
> voice and the honest-trade-offs rigor. The directory is still `scripts/tech/` and the internal
> routing tag maps through `PostType "works"`; the section and route are Greenville Works and
> `/greenville-works`. See the two-track note in the root `CLAUDE.md`.

It mirrors the `ai_news/routine/` pattern (an orchestrator plus isolated passes, no collector, a
curated input bank) but is its own engine with its own voice, and it shares the Greenville
real-estate engine's local grounding and fair-housing care.

## What makes it different from the Saturday engine

- **Voice is first person.** Greenville Works is Alex thinking out loud and landing on a view. The
  Saturday research engine is hard-locked to objective third person. Do not merge them.
- **The honest-trade-offs beat is the point.** Every piece has to show the real cost, constraint,
  or loser, who pays, what it strains, how it could go wrong, not just the ribbon-cutting. That
  honesty is the whole value; a one-sided booster (or doomer) piece gets rejected by the editor.
- **Depth over volume.** Each one is tight (800 to 1200 words) and worth it. This is not a news
  feed; it explains how a system works and what it means, and it stays true for a while.

## What makes it different from the Greenville real-estate engine

- **Wider than housing, but sharply focused.** The real-estate engine writes evergreen
  buyer/relocation guides. Greenville Works covers the tech-and-capital machinery reshaping the
  state around them: data centers, the grid and energy, fiber, manufacturing and automation, the
  port, the capital and incentive deals, and proptech, with roads/water/subdivisions only as a
  secondary beat that carries a through-line.
- **First person, not a guide.** It is an opinionated take, not a how-to resource, though it carries
  the same one-line buy-or-sell invitation (linked to `/find-a-pro`, never explaining the referral
  mechanism) where the topic touches where to live or buy.

## The input (self-sourcing, with an optional steering bank)

- **`topics.md`** — an OPTIONAL priority queue, not a hard dependency. Each entry is one Greenville
  change worth taking apart, clearing six bars (one concrete change, groundable in real local
  specifics, a real non-obvious tension, real relevance to living/working/investing here, not stale
  in a week, and on the tech-or-capital-meets-real-estate intersection). STEP 0 prefers the first `queued` topic, so the bank is how Alex STEERS what gets
  covered. When the bank is empty, the routine self-sources (see the scout below), so it never runs
  dry. After delivery the topic is recorded under `## done` on the `drafts` branch, and `proposed`
  candidates (including the scout's runners-up) are appended for Alex to promote.

## The pipeline

0. **`pass0_scout.md`** — the QUESTION GENERATOR, and the normal path (it runs whenever the bank has
   no queued topic, which is most runs). **Rewritten August 2026** from a news scout into a
   curiosity engine, because the old version structurally could not ask the best questions this
   track has: it required "one concrete change" and a "why now," so a plant running since 1973 was
   never eligible and every candidate came from an announcement. It now crosses the systems
   inventory (`scripts/tech/systems.md`) against FIVE QUESTION SHAPES (subtraction, the clock, the
   dog that didn't bark, magnitude, the full ledger) to generate its own candidates, which is why it
   never drains: a bank stores answers waiting to be written, a generator stores the procedure that
   makes them, and one system supports a different question under each shape. THE BAR is Alex's:
   pick the question where a smart local **has a prior and is simply ignorant**. Two gates keep the
   generator honest, and both exist because a question generator fails in ways a news scout does not.
   The FEASIBILITY GATE confirms the sources that would answer the question actually exist before it
   goes into production, which is what prevents a piece that shrugs "no source quantifies this." The
   PREMISE GATE verifies any asserted absence ("why is X rare here") against a real number before it
   becomes a headline. Web search is used for two distinct jobs: prior detection (search the naive
   question, read the follow-ups people ask, as evidence an assumption is widespread) and
   feasibility checking (find the primary sources that settle it). It is deliberately NOT a news
   feed: a vote or filing is a fine anchor, but the question comes first and the news serves it.
1. **`pass1_researcher.md`** — **ANSWERS the scout's question** (rewritten August 2026 alongside
   pass 0; it used to survey a subject, which produced briefs whose conclusion could have been
   written before the research started). The brief now LEADS with THE QUESTION, THE ANSWER, and
   THE PRIOR TESTED, so the angle pass and the writer build on a finding instead of rummaging
   through facts for one. The prior verdict is the most valuable output and has three publishable
   outcomes: the prior was wrong (best), right for the wrong reason, or simply right (report it
   plainly, never manufacture a twist). Carries a per-SHAPE method note, since the five question
   shapes need genuinely different research. Carries THE ARITHMETIC RULE, because subtraction and
   magnitude questions cannot be answered by quoting anyone and must be CALCULATED: every input
   separately sourced, the steps shown, the result labeled a calculation rather than a sourced
   figure, and every calculated figure auto-added to MUST-VERIFY. Still does the deep-tech
   teardown, the CONFIRMED-versus-CLAIM split, the honest tension, and fair-housing flags. Three
   kill conditions stop the run: UNANSWERABLE, FALSE PREMISE, and THIN. It is explicitly forbidden
   to rescue a failed run by pivoting to a survey of the general subject.
   **Handles both input paths**: a scout question, or a bank topic with no question (in which case
   it writes the question and the prior itself before researching).
2. **`pass2_angle.md`** — turns the finding into a piece: the one sharp SPINE, the stakes earned,
   the tension respected, the so-what (with a calibrated verdict when the evidence carries one),
   and the reader's question. **Rewritten August 2026** to close the last link in the question-first
   chain. Its governing rule is now **CARRY THE ANSWER**: the brief opens with one, and the spine is
   built FROM it. The failure it guards is reading past the answer, picking some other interesting
   true thing further down the brief, and building on that instead, which feels like editorial
   judgment and silently throws away both prior passes. It also mines **THE PRIOR TESTED**, the gap
   between what a reader walks in believing and what is true, with a different spine for each of the
   three outcomes: prior wrong (the correction is the spine, the strongest piece available), prior
   right for the wrong reason (the mechanism is the spine), prior right (the COST is the spine, and
   manufacturing a twist is banned here exactly as it is in pass 1, since this is the more tempting
   place to do it). The track's standing question about South Carolina's prosperity is now scoped
   explicitly to the LEDGER and is no longer restated as though it were the question of the piece,
   which is what made early pieces converge on the same conclusion regardless of subject. Keeps the
   answer-versus-verdict distinction (a finding is factual, a verdict is judgment) so the writer
   treats them differently. STEP 5 carries a hard guard: **the closing question may not be the
   question the piece just answered**, since that retracts the piece's own work. Reads the TRACK
   LEDGER from STEP 0B and emits this piece's VERDICT LINE, whose format now carries the question,
   the answer, and the hinge condition, so the ledger becomes a record of what the track has
   actually settled and doubles as dedup material for the scout.
3. **`pass3_writer.md`** — writes the essay in Alex's first-person voice, following the spine (open
   cold on the change, plain-English mechanism, honest stakes, honest tension, takeaway then a real
   question), in house style (no em dashes, no fragments, plain English, no hype), with inline
   citations and internal links, fair-housing care, and an optional `/find-a-pro` line where the
   topic touches where to live or buy. Emits a `## METADATA` block plus `## ARTICLE` and `## X`.
4. **`pass4_editor.md`** — audits against the brief: fact check, first-person voice, mandatory
   honest-trade-offs beat, stakes-not-hype, real mechanism, fair housing, links, style, fragments,
   not-advice, and the `greenville works` tag.

`orchestrator.md` wires them as cold sub-agents, picks the topic (bank first, else scouted), dedups
against the drafts log and the live site, and on a good topic inserts a `blog_posts` row tagged
`greenville works` as a **DRAFT** (not live), then emails the review packet (verify list, the essay,
the X post, and the `/review` edit-and-publish link) and pushes the done-log to the `drafts` branch,
appending the piece's VERDICT line to its `## done` entry so the track ledger grows one line per
piece.
Alex reviews and publishes each piece himself, either from the emailed `/review` link or from the
`/admin` draft hub, which lists every DRAFT row.

## Cadence and where it posts

- **Routine:** runs as a scheduled Claude cloud agent (`/schedule`) pointed at `orchestrator.md`.
  Target cadence is about ONE piece per week, enforced in code by the STEP 0B cadence guard (skip
  the run if a `greenville works` post was created in the last 6 days). Greenville Works is the
  lower-priority credibility track now that referral revenue is the north star and the `/real-estate`
  evergreen engine is the lead engine (see the two-track plan in the root `CLAUDE.md`), so it is
  deliberately slowed. There is no collector to run first.
- **Website:** the routine inserts a `blog_posts` row tagged `greenville works` as a **DRAFT**
  (`published_at = NULL`), so it is NOT live until Alex publishes it. This is **draft-first** as of
  July 5, 2026 (it was previously auto-publish live). He publishes from the emailed
  `/review?id=<id>&token=..` link or from the `/admin` draft hub (both open the same editor), which
  flips the row to `PUBLISHED` and makes it live at `/greenville-works/<slug>`. The `greenville
  works` tag routes it via `sectionOf` in `src/lib/posts.ts` (distinct from the `greenville`
  real-estate tag so the two never collide). The pass guardrails (web-grounded claims, the editor's
  fact-check against the brief, the mandatory honest-trade-offs beat, fair housing, not-advice) and
  dedup still run, but a human is now the final gate. STEP 0B also applies **draft backpressure**:
  if 2 or more Greenville Works drafts are already awaiting review, the run stops so the engine
  never outruns Alex. To go back to auto-publish live, set STEP 5's `DRAFT` back to `PUBLISHED` and
  `published_at = NULL` back to `now()`.
- **Cover photo (set the moment Alex publishes).** For an Upstate/Greenville piece the writer names
  a `subject:` in a `## IMAGE` block, from the same fixed vocabulary the Greenville real-estate
  engine uses (`downtown-falls` the default, plus `liberty-bridge`, `reedy-river`, `north-main`,
  `west-end`, `swamp-rabbit-trail`, `travelers-rest`); for a piece anchored elsewhere in South
  Carolina (statewide since July 10, 2026) it gives a geocodable `location:` string instead. The
  orchestrator stores that value in `blog_posts.image_address` and leaves `cover_image` null. On
  publish, `/api/publish` maps a subject (or any Greenville-area string) to a hand-picked, licensed
  photo from the **curated Greenville library** (`src/lib/greenvilleCovers.ts`, served from
  `/public`, no API key, no cost) and writes `cover_image` immediately (the draft editors preview
  the same photo via `src/lib/editorCover.ts`); a non-Upstate `location:` gets a Google Street View
  or map cover from the daily `/api/finalize-greenville` cron instead (needs `GOOGLE_MAPS_KEY`).
  `ArticleView` renders it as the article hero, and the `/greenville-works` index shows it as a
  per-row thumbnail (the shared `PostCover`, which draws a branded `>` placeholder until the cover
  lands), the same as the `/real-estate` index; the photo also shows on the homepage feed card and
  the share/OG card.
- **X:** no auto-poster; the routine drafts the X post and delivers it in the email packet for
  manual posting.
- **Owned email list (auto, after Alex publishes).** The same `/api/finalize-greenville` cron broadcasts a
  newly published Greenville Works piece to the confirmed owned list exactly once (via the shared
  `broadcastPost` in `src/lib/broadcast.ts`) and stamps `last_broadcast_at`, the same mechanism the
  Greenville real-estate posts use. The agent cannot send it itself (no HTTP egress from the
  sandbox). A DRAFT-fallback run is never emailed. Needs Resend (`RESEND_API_KEY` + `EMAIL_FROM`) on
  the site; a manual resend is still available at `/api/broadcast?id=<postId>&force=1`.

## Dedup

STEP 0B reads the `drafts`-branch done-log AND queries the live site for `greenville works`-tagged
posts in the last 180 days, so a scheduled run never repeats a topic already covered or drafted.

## Guardrails (built into the passes)

- **Honesty over hype.** Never boost and never catastrophize; the honest-trade-offs beat is
  mandatory and the editor rejects a one-sided piece. Every number traces to a real source.
- **Fair housing.** Any neighborhood-level content describes places by objective facts only and
  never steers a protected class. This is the headline legal risk on local content.
- **Not advice.** No investment, legal, or financial calls. Every piece ends with the *Information
  only, not financial, legal, or investment advice.* line.
- **Grounded.** Web-search-sourced with inline citations; promoter claims are labeled as claims, not
  facts; the delivered packet leads with a MUST-VERIFY list.
