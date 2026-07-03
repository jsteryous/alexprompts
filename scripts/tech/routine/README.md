# Lab routine (`scripts/tech/`)

A Claude routine that turns ONE AI or software capability into a **first-person Lab
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

## The input

- **`topics.md`** — the topic bank. Each entry is one capability worth taking apart, and
  clears five bars (one concrete capability, groundable in real specifics, a real non-obvious
  limit, business value in a real vertical, not stale in a week). STEP 0 takes the first
  `queued` topic; after delivery it is marked `done <date>` on the `drafts` branch. Alex
  seeds the bank and promotes `proposed` candidates the routine appends.

## The pipeline

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

`orchestrator.md` wires them as cold sub-agents, picks the topic, dedups against the drafts
log and the live site, and on a good topic inserts a `blog_posts` row tagged `tech` as
**DRAFT**, then emails the human packet (verify list, the essay, the X post) and pushes the
done-log to the `drafts` branch.

## Cadence and where it posts

- **Routine:** runs as a scheduled Claude cloud agent (`/schedule`) pointed at
  `orchestrator.md`. Target cadence is 1 to 2 Lab pieces per week (see the two-track plan
  in the root `CLAUDE.md`). There is no collector to run first.
- **Website:** the routine inserts a `blog_posts` row tagged `tech` as **DRAFT**. It is NOT
  live until Alex reviews and publishes it at `/review`; publishing routes it to
  `/lab/<slug>` via `sectionOf` in `src/lib/posts.ts`. To auto-publish later, change STEP 5
  and the PUBLISH MODE note in the orchestrator from `DRAFT` to `PUBLISHED`.
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
