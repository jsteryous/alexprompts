# Greenville Works routine (`scripts/tech/`)

A Claude routine that turns ONE thing reshaping Greenville and the Upstate into a **first-person
deep-dive** published at **`/greenville-works`** on the website, plus a short X post drafted for
manual posting. No video, no collector. This is the **local-change track** of the two-track content
plan: the real-estate engine proves Alex can go deep on the housing vertical, and Greenville Works
proves he can take a real system apart, a road, a data center, a water constraint, a factory, the
grid, and explain what it means for where people live, work, and invest. Technology is in scope when
it touches the Upstate. The audience is a smart local (and, often, a hiring manager reading the
work), so the writing is the proof.

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

- **Wider than housing.** The real-estate engine writes evergreen buyer/relocation guides. Greenville
  Works covers the machinery around them: roads, infrastructure, utilities, manufacturing, data
  centers, government decisions, population growth.
- **First person, not a guide.** It is an opinionated take, not a how-to resource, though it funnels
  the same relocation/buyer leads to `/find-a-pro` where the topic touches where to live or buy.

## The input (self-sourcing, with an optional steering bank)

- **`topics.md`** — an OPTIONAL priority queue, not a hard dependency. Each entry is one Greenville
  change worth taking apart, clearing five bars (one concrete change, groundable in real local
  specifics, a real non-obvious tension, real relevance to living/working/investing here, not stale
  in a week). STEP 0 prefers the first `queued` topic, so the bank is how Alex STEERS what gets
  covered. When the bank is empty, the routine self-sources (see the scout below), so it never runs
  dry. After delivery the topic is recorded under `## done` on the `drafts` branch, and `proposed`
  candidates (including the scout's runners-up) are appended for Alex to promote.

## The pipeline

0. **`pass0_scout.md`** — runs ONLY when the bank has no queued topic. Surveys what is genuinely
   current and consequential in the Upstate (development, roads, infrastructure, utilities,
   manufacturing, data centers, population, local business, government decisions) with web search
   against primary and local sources, screens candidates against the five bars and the
   already-covered list, and picks the single best one (with the sharpest honest tension). This is
   what makes the engine autonomous instead of dependent on Alex refilling the bank. It is
   deliberately NOT a news feed: a vote is a fine anchor only if the piece would still be worth
   reading in six months.
1. **`pass1_researcher.md`** — grounds the change with web search: what is happening and how the
   system works (the mechanism, plainly), the real numbers, what it means for residents/buyers/
   investors, and above all THE HONEST TENSION, each with evidence and marked fundamental or
   contingent. Separates confirmed facts from promoter claims, flags fair-housing care, and lists
   MUST-VERIFY. Stops the run if the topic is thin.
2. **`pass2_angle.md`** — turns research into judgment: the one sharp, honest SPINE, the stakes
   earned, the tension respected, the so-what, and the reader's question. This is where the piece
   gets a point of view instead of being a meeting recap.
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
`greenville works` as **PUBLISHED** (live), then emails the human packet (verify list, the essay,
the X post) and pushes the done-log to the `drafts` branch.

## Cadence and where it posts

- **Routine:** runs as a scheduled Claude cloud agent (`/schedule`) pointed at `orchestrator.md`.
  Target cadence is about ONE piece per week, enforced in code by the STEP 0B cadence guard (skip
  the run if a `greenville works` post was created in the last 6 days). Greenville Works is the
  lower-priority credibility track now that referral revenue is the north star and the `/real-estate`
  evergreen engine is the lead engine (see the two-track plan in the root `CLAUDE.md`), so it is
  deliberately slowed. There is no collector to run first.
- **Website:** the routine inserts a `blog_posts` row tagged `greenville works` as **PUBLISHED**,
  live at `/greenville-works/<slug>` within about 5 minutes, the same autonomous model as the
  Greenville real-estate engine. The `greenville works` tag routes it via `sectionOf` in
  `src/lib/posts.ts` (distinct from the `greenville` real-estate tag so the two never collide).
  Auto-publish is safe because the guardrails are in the passes (web-grounded claims, the editor's
  fact-check against the brief, the mandatory honest-trade-offs beat, fair housing, not-advice) and
  in dedup; the verify email still goes out so Alex can spot-check and unpublish at `/review`. If
  the Supabase site-dedup could not run, that run falls back to DRAFT. To require human review of
  every piece, set STEP 5 back to `DRAFT`.
- **Cover photo (auto, after publish).** The writer names a `subject:` in a `## IMAGE` block, from
  the same fixed vocabulary the Greenville real-estate engine uses (`downtown-falls` the default,
  plus `liberty-bridge`, `reedy-river`, `north-main`, `west-end`, `swamp-rabbit-trail`,
  `travelers-rest`). The orchestrator stores it in `blog_posts.image_address` and leaves
  `cover_image` null. The shared `/api/finalize-greenville` cron then maps that subject to a
  hand-picked, licensed photo from the **curated Greenville library** (`src/lib/greenvilleCovers.ts`,
  served from `/public`, no API key, no cost) and writes `cover_image`. `ArticleView` renders it as
  the article hero, and the `/greenville-works` index shows it as a per-row thumbnail (the shared
  `PostCover`, which draws a branded `>` placeholder until the cover lands), the same as the
  `/real-estate` index; the photo also shows on the homepage feed card and the share/OG card. There
  is no Google Street View fallback in practice, because any Greenville subject resolves to a library
  photo, which keeps the "high-quality photos only" bar.
- **X:** no auto-poster; the routine drafts the X post and delivers it in the email packet for
  manual posting.
- **Owned email list (auto, after publish).** The same `/api/finalize-greenville` cron broadcasts a
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
