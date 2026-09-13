# Scripts — the content engine

> **THE LIVE ENGINE IS `scripts/research/`. Read `scripts/research/SPEC.md` first; it
> outranks this file and `scripts/publication/SPEC.md` wherever they disagree.**

One research paper per issue: what it asked, the trick that let it find out, what it found,
whether it has held up, and the model it leaves you holding. Draft-first into `blog_posts`,
reviewed at rebrew.org/admin, tagged `sales` or `greenville`.

It exists because the site has promised since August 25, 2026 that *"We read research
papers about real estate and sales performance and share what we find interesting"* and
nothing in the repo did that. `scripts/publication/` was built for company teardowns off
county records and its scout was never repointed at the new beat.

**The voice rules live in the root `CLAUDE.md`** and are not repeated here: the three
rules, never explain the business model, the four tells, never narrate the process, a link
opens a page never a download, clippable leads, assess do not advise. They are enforced in
the passes below, and they are still correct for every engine in this directory.

**Claude routines only. Gemini was removed June 2026**, along with the two-pass drafting,
`shorts.py`, the shared `llm.py`, and the `ai-news.yml` / `email-draft.yml` workflows.

## What lives here

- **`research/`** — the live engine. `SPEC.md`, `papers.md`, `questions.md`, `read.md`,
  `routine/`.
- **`publication/`** — **stops producing, but three of its passes are LIVE and shared**:
  `routine/pass3_writer.md`, `routine/pass3b_verifier.md`, and `routine/pass4_editor.md`.
  They hold the house voice,
  the four tells, the legal gate, and the fair-housing line, and the research engine hands
  each one to its sub-agent together with a short delta from `research/routine/`. **Do not
  delete them, and do not fork a second copy**, which is how the voice rules drift. Also
  holds `claims.md`, where Alex logs what he hears in the market for the claim-testing
  issues (about one in three; never the front-page promise).
- **`greenville/`** — documented in `scripts/greenville/CLAUDE.md`. The content track is
  dormant; its **data collectors still run and still matter**, especially `commercial.py`,
  which refreshes `src/data/commercialSales.json` as research input. Do not delete it for
  looking orphaned now that `/tools/buyers-list` is gone.
- **`tech/`** and **`briefing/`** — dormant engines, kept intact and reversible. `tech/` was
  the Greenville Works local-change track (its route is now `/sales`); `briefing/` was the
  Monday Upstate Brief. Neither is scheduled. `briefing/SPEC.md` still documents the format
  if it is ever revived.
- **`checks/`** — the two build gates, both wired into `npm run lint` and one into
  `prebuild`: `canonicals.mjs` (every page route declares its own canonical) and
  `editor-roundtrip.mjs` (the WYSIWYG markdown round trip is lossless against every row in
  the database plus fixtures in both `marked`-shaped and TipTap-shaped HTML). If you change
  `src/lib/editorMarkdown.ts`, that second check is what tells you whether you broke an
  engine-written body.
- **`brand/`** — `preview-email.mjs` renders every email and result page to HTML with no
  send and no Resend config, failing on retired design values and truncated `font-family`
  attributes. `make-email-mark.mjs` regenerates the hosted email mark.
- **`tests/`** — unittest suites for the collectors' pure functions.
- **`_archive/`** — the retired national Saturday engine (`ai_news/`), the retired Greenville
  news passes, and the legacy dental pipeline. Reference and reversible; nothing is
  scheduled. **Do NOT revive.** The Saturday engine was killed because it could not out-rank
  national queries and had no distribution.
- **`requirements-ai-news.txt`** — shared deps (requests, defusedxml, python-dotenv), used
  by the Greenville collectors. Keep it.

## How a routine runs

`orchestrator.md` runs each pass as a **fresh sub-agent**, and that isolation is the quality
lever: the researcher must not know the thesis, and the writer sees only the verified brief.
Every engine is **draft-first** (insert a DRAFT `blog_posts` row, email a review packet with
the post id and a `/review` link, let Alex publish at `/admin`). A routine recalls recently
published pieces from Supabase so it does not repeat itself.

**The article routines are CLOUD routines, not repo cron**, and their prompts live only in
the routine, so an uncommitted edit to a pass file in this repo does not change what runs. A
run that finishes in 1 to 3 minutes is a stand-down, not work. See memory
`cloud-routine-lineup`.
