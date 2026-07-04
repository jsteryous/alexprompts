# Scripts — Alex Prompts content engine

See root `CLAUDE.md` for env vars and deployment. The dental/legacy pipeline
(prospects discovery, LLC→human enrichment, AI blog insights, all their GitHub
workflows) was retired in June 2026 and lives under **`scripts/_archive/`** —
reference only, nothing there runs on a schedule anymore.

> **Gemini was removed (June 2026). The content engine is Claude routines only.**
> The old two-pass Gemini drafting, `shorts.py`, the shared `llm.py`, and the
> `ai-news.yml` / `email-draft.yml` workflows are gone.
>
> **The Saturday national engine was rebuilt (June 2026) from AI-news into research.**
> Alex stopped filming the news scripts: scored by how many outlets covered a story, they
> kept landing on regulation and frontier-AI politics, with nothing a working agent could
> use. The old **signal collector** (`collect.py`, `digest.py`, `collect-signal.yml`, the
> committed signal, `test_ai_news.py`) is retired to `scripts/_archive/ai_news_collector/`.
> The Saturday routine now answers ONE useful, evergreen real-estate question with real
> public data. See [[saturday-research-engine]] in memory.

## What lives in `scripts/`

- **`ai_news/`** — the national **Saturday research engine** (the directory name is legacy;
  it is no longer news). Two committed inputs drive it: **`questions.md`** (the question
  bank, seeded by Alex, status-tracked `queued` / `done <date>`) and **`sources.md`** (the
  primary-data registry: Census, FRED, FHFA, Zillow/Redfin, Lincoln Institute, Strong Towns,
  LBNL solar, Greenville ArcGIS, academic). The **Saturday Claude routine** under
  `ai_news/routine/` reads them and writes the deep-dive.
- **`ai_news/routine/`** — the Claude routine: an `orchestrator.md` plus isolated Opus
  passes (researcher → thesis → writer → editor → performer → article). It runs weekly in
  the cloud, pulls the data live, and delivers the draft to Google Drive + Gmail.
- **`ai_news/demand.py`** — a separate prototype radar (mines Google + YouTube autocomplete
  for beginner AI how-to demand). Standalone, not part of the Saturday routine. It fed the
  old GUIDES track, which was removed July 2026 (the `/guides` section is gone), so it is now
  orphaned; kept for reference only. Run from a normal IP.
- **`tech/`** — the **Greenville Works engine** (the local-change track; renamed from the
  national "Lab" tech track in July 2026, directory kept as `tech/`). No collector;
  **self-sourcing**: an optional steering bank (`tech/topics.md`) plus a web-search scout
  (`pass0_scout.md`) that picks its own topic when the bank is empty, so it never runs dry. A
  Claude routine (`tech/routine/`, orchestrator plus isolated passes: scout → researcher →
  angle → writer → editor) takes ONE thing reshaping Greenville and the Upstate apart (a road,
  a subdivision, a data center, a factory, the grid, fiber, water capacity, a government
  decision, and the technology behind local change) in Alex's own first-person voice, grounds
  it with web search, above all names the honest trade-offs, and funnels relocation/buyer leads
  to `/find-an-agent` where the topic fits, then publishes a `blog_posts` row tagged
  `greenville works` **live** to `/greenville-works` (autonomous; verify email for spot-check).
  See `tech/routine/README.md` and the two-track note in the root `CLAUDE.md`.
- **`greenville/`** — the local Greenville engine; documented in `scripts/greenville/CLAUDE.md`.
  A nightly **self-sourcing evergreen local-SEO** engine: each eligible night (about two a week)
  it writes one substantial, data-grounded local guide targeting a winnable long-tail local
  query and funneling relocation/buyer leads to `/find-an-agent`. It prefers the optional
  `greenville/topics.md` bank and scouts its own topic (`pass0_scout.md`, like Greenville Works) when the
  bank is empty. The old daily both-sides **news** track was retired July 2026 (its passes +
  collector remain, unwired). The separate `commercial.py` collector (buyers-list data) stays.
  `greenville/cover_ingest.py` is a separate **monthly** utility (a GitHub Action, not the nightly
  routine) that grows the curated cover library from Wikimedia Commons, gated by a Claude vision
  call, and opens a PR. See `scripts/greenville/CLAUDE.md`.
- **`requirements-ai-news.txt`** — shared deps (requests, defusedxml, python-dotenv). Used by
  the Greenville `commercial.py` collector (the buyers-list data) and the retired `collect.py`;
  keep it. The nightly Greenville content routine no longer installs it (no collector, the
  evergreen passes use the agent's own web search).

## The Saturday research engine (`ai_news/`)

**Rebuilt June 2026.** Instead of chasing the week's AI headlines, each Saturday the routine
takes ONE genuinely useful question about real estate, development, or investment and has
Claude research it hard against real public data, until we actually understand it. Claude is
the **visible** method: the piece is openly "I pointed Claude at this question, here is what
the data says." The audience is working agents and investors, plus developers and planners.
The format is unchanged: a 6 to 10 minute voiceover video script PLUS a Substack article
rendering of the same piece, forking only at the final render.

### The inputs

- **`questions.md`** — the question bank. Each good question clears five bars (useful,
  answerable with real public data, non-obvious/contested, decision-relevant, evergreen) and
  is **anchored in a real place or decision** (Greenville, SC; North Main, where Alex lives,
  no HOA; a real asset class or deal). STEP 0 of the routine picks the top question still
  `queued`; after delivery it marks that question `done <date>` on the `drafts` branch so it
  is not repeated. The routine may append `proposed` candidates; only Alex promotes them.
- **`sources.md`** — the primary-data registry handed to the researcher every week, with
  access notes and honesty caveats. Reachability was confirmed from a sandbox like the
  routine's: FHFA, Zillow, and FRED's keyless CSV return 200; Census and the FRED JSON API
  are key-gated (the free `CENSUS_API_KEY` is already in env), not blocked. Unlike the old
  Google-News collector, these data APIs are **not** datacenter-IP-blocked, so the routine
  fetches them live and there is **no pre-fetch collector or GitHub Action** anymore. The
  one exception is the NREL solar API, which did not connect from the sandbox; for solar,
  fall back to cited published figures.

### `ai_news/routine/` — the Claude routine (writes the draft)

`orchestrator.md` runs each pass as a fresh sub-agent (isolation is the quality lever: the
researcher must not know the thesis; the writer sees only the verified brief). STEP 0 picks
the question and loads the sources; STEP 0B recalls what is already done so it never repeats.
Then researcher → thesis → writer → editor → performer → article, delivering ONE deep-dive in
two renderings to Google Drive and Gmail, and marking the question done.

The engine's spine is **intellectual honesty**: the researcher hunts the confounder before
reporting the effect (the worked example: "HOA homes sell for more" is a selection effect,
not proof an HOA causes appreciation); the editor enforces no-causation-from-correlation,
confidence-matches-data, and caveats-present. House style (no em/en dashes, no fragments,
grounded optimism not threat, steelman-then-resolve) lives in the pass specs. See
`ai_news/routine/README.md` for the per-pass table.

> **Reorientation note (June 2026):** the whole `ai_news/` engine serves real-estate agents
> and investors, plus developers and planners, anchored in Greenville / North Main where the
> question allows. The Greenville daily engine (`scripts/greenville/`) is the separate local
> sibling and still uses its own live collector.
