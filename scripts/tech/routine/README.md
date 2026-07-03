# Lab routine (`scripts/tech/`)

A Claude routine that turns ONE technology capability into a **first-person Lab
deep-dive** published at **`/lab`** on the website, plus a short X post drafted for
manual posting. No video, no collector. This is the **tech track** of the two-track
content plan: real-estate content proves Alex can go deep on a vertical, and the Lab
proves he understands the technology itself and can translate a capability into business
value. The audience that matters is a hiring manager, so the writing is the proof.

It mirrors the `ai_news/routine/` pattern (an orchestrator plus isolated passes, no
collector, a curated input bank) but is its own engine with its own voice.

## What makes it different from the Saturday engine

- **Voice is first person.** The Lab is Alex thinking out loud and landing on a view.
  The Saturday research engine is hard-locked to objective third person. Do not merge them.
- **The honest-limits beat is the point.** Every piece has to show where the capability
  genuinely breaks and where Alex would not trust it yet. That honesty is the sales skill
  on display; a piece with no real limit gets rejected by the editor pass.
- **Depth over volume.** A hiring manager reads two or three of these, so each one is tight
  (800 to 1200 words) and worth it. This is not a news feed.

## The input (self-sourcing, with an optional steering bank)

- **`topics.md`** — an OPTIONAL priority queue, not a hard dependency. Each entry is one
  capability worth taking apart, clearing five bars (one concrete capability, groundable in
  real specifics, a real non-obvious limit, business value in a real vertical, not stale in a
  week). STEP 0 prefers the first `queued` topic, so the bank is how Alex STEERS what gets
  covered. When the bank is empty, the routine self-sources (see the scout below), so it never
  runs dry. After delivery the topic is recorded under `## done` on the `drafts` branch, and
  `proposed` candidates (including the scout's runners-up) are appended for Alex to promote.

## The pipeline

0. **`pass0_scout.md`** — runs ONLY when the bank has no queued topic. Surveys what is
   genuinely current across technology (AI, developer tools, automation, data infrastructure,
   security, fintech, robotics, energy, hardware, anything a business buys or adopts) with web
   search, screens candidates against the same five bars and the already-covered list, and
   picks the single best one (with the
   sharpest honest limit), handing it off in the bank-entry shape. This is what makes the
   engine autonomous instead of dependent on Alex refilling the bank. It is deliberately NOT a
   news feed: a launch is a fine anchor only if the piece would still be worth reading in six
   months.
1. **`pass1_researcher.md`** — grounds the capability with web search: what it actually is
   (the mechanism, plainly), the real numbers, the concrete business value, and above all
   THE HONEST LIMITS, each with evidence and marked fundamental or temporary. Separates
   confirmed facts from vendor claims and lists MUST-VERIFY. Stops the run if the topic is
   thin (no real limit, no groundable specifics).
2. **`pass2_angle.md`** — turns research into judgment: the one sharp, honest SPINE, the
   value earned, the limit respected, the so-what, and the reader's question. This is where
   the piece gets a point of view instead of being a feature list.
3. **`pass3_writer.md`** — writes the essay in Alex's first-person voice, following the
   spine (open cold on the capability, plain-English mechanism, honest value, honest limits,
   takeaway then a real question), in house style (no em dashes, no fragments, plain English,
   no hype). Emits a `## METADATA` block plus `## ARTICLE` and `## X`.
4. **`pass4_editor.md`** — audits against the brief: fact check, first-person voice,
   mandatory honest-limits beat, value-not-hype, real mechanism, style, fragments, not-advice.

`orchestrator.md` wires them as cold sub-agents, picks the topic (bank first, else scouted),
dedups against the drafts log and the live site, and on a good topic inserts a `blog_posts`
row tagged `tech` as
**PUBLISHED** (live), then emails the human packet (verify list, the essay, the X post) and
pushes the done-log to the `drafts` branch.

## Cadence and where it posts

- **Routine:** runs as a scheduled Claude cloud agent (`/schedule`) pointed at
  `orchestrator.md`. Target cadence is 1 to 2 Lab pieces per week (see the two-track plan
  in the root `CLAUDE.md`). There is no collector to run first.
- **Website:** the routine inserts a `blog_posts` row tagged `tech` as **PUBLISHED**, live at
  `/lab/<slug>` within about 5 minutes, the same autonomous model as the Greenville engine.
  The `tech` tag routes it via `sectionOf` in `src/lib/posts.ts`. Auto-publish is safe because
  the guardrails are in the passes (web-grounded claims, the editor's fact-check against the
  brief, the mandatory honest-limits beat, not-advice) and in dedup; the verify email still
  goes out so Alex can spot-check and unpublish at `/review`. If the Supabase site-dedup could
  not run, that run falls back to DRAFT. To require human review of every piece, set STEP 5
  back to `DRAFT`.
- **No image.** Lab pieces have no cover photo. The `/lab` index is text-forward and the
  article renders without a hero, so there is no image step and no finalize cron (unlike the
  Greenville engine).
- **X:** no auto-poster; the routine drafts the X post and delivers it in the email packet
  for manual posting.
- **Owned email list:** not auto-sent. Once Alex publishes a Lab post, he can broadcast it
  to the owned list manually via `/api/broadcast?id=<postId>` if he wants (see the root
  `CLAUDE.md`); there is no automatic broadcast for the Lab.

## Dedup

STEP 0B reads the `drafts`-branch done-log AND queries the live site for `tech`-tagged posts
in the last 120 days, so a scheduled run never repeats a topic already covered or drafted.

## Guardrails (built into the passes)

- **Honesty over hype.** Never oversell; the honest-limits beat is mandatory and the editor
  rejects a piece that inflates the capability. Every number traces to a real source.
- **Not advice.** No investment, legal, or financial calls. Every piece ends with the
  *Information only, not professional advice.* line.
- **Grounded.** Web-search-sourced; vendor claims are labeled as claims, not facts; the
  delivered packet leads with a MUST-VERIFY list.
