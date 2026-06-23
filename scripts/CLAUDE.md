# Scripts — Alex Prompts content engine

See root `CLAUDE.md` for env vars and deployment. The dental/legacy pipeline
(prospects discovery, LLC→human enrichment, AI blog insights, all their GitHub
workflows) was retired in June 2026 and lives under **`scripts/_archive/`** —
reference only, nothing there runs on a schedule anymore.

> **Gemini was removed (June 2026). The content engine is Claude routines only.**
> The old two-pass Gemini drafting (`digest.py` reporter/writer), `shorts.py`, the
> shared `llm.py`, and the `ai-news.yml` / `email-draft.yml` workflows are gone.
> What remains is the **signal collector** (this file) feeding the **Saturday Claude
> routine** under `ai_news/routine/`, which writes the draft.

## What lives in `scripts/`

- **`ai_news/`** — the weekly signal collector. `collect.py` (and the thin
  `digest.py` CLI) source and score the week's frontier signal; the **Claude routine**
  under `ai_news/routine/` reads that signal and writes the draft.
- **`ai_news/routine/`** — the Claude routine: an `orchestrator.md` plus isolated Opus
  passes (reporter → angle → writer → editor → performer → article). It runs weekly in
  the cloud, reads the committed signal, and delivers the draft to Google Drive + Gmail.
- **`tests/test_ai_news.py`** — unit tests for the pure functions.
- **`requirements-ai-news.txt`** — deps (no Gemini, no Supabase/Playwright/Places).

## `ai_news/` pipeline

```bash
cd scripts
python -m ai_news.digest --collect-only                          # print the week's signal
python -m ai_news.digest --collect-only --json-out signal.json   # + scored JSON (CI hand-off)
python -m ai_news.digest --from-json signal.json                 # replay a saved snapshot, no network
python -m unittest scripts.tests.test_ai_news -v
```

### `collect.py` — source + score the week

Per entity (Anthropic, OpenAI, Google DeepMind, xAI, Meta AI, SpaceX, Tesla AI,
Neuralink — edit the `ENTITIES` list to change coverage):

- **Google News RSS** (`when:7d`) — headlines + coverage volume. Free, no key.
- **Hacker News (Algolia)** — builder-crowd engagement (points + comments). The real
  attention signal. Free, no key.
- **Reddit search JSON** — best-effort; Reddit now 403s unauthenticated cloud
  requests, so it degrades to empty and HN carries the weight. Not a bug.

**Datacenter-IP blocking + the CI hand-off.** From a *datacenter* IP, all three
sources can 403 (Google News and HN challenge datacenter ranges; Reddit always does),
not just Reddit. GitHub-hosted runners are not blocked; the Claude Code cloud *script
routine* sandbox is. So the routine does NOT collect for itself. Instead
`.github/workflows/collect-signal.yml` (Saturday 05:00 UTC, before the routine) runs
`python -m ai_news.digest --collect-only --json-out` from the runner's good IP and
commits the scored signal to `scripts/ai_news/data/` (`signal-latest.json` + the
rendered `signal-latest.txt`). The routine's STEP 0 reads that committed file; live
collection is only a fallback. The serialization round-trips through `collect.to_json` /
`collect.from_json` (unit-tested); `--from-json PATH` replays a saved snapshot with no
network.

All network fns degrade gracefully (log + return `[]`, never raise). RSS is parsed
with **defusedxml** (XXE/billion-laughs hardening; falls back to stdlib if absent).
"Attention" is builder/tech-crowd by design, not mainstream virality. The biggest
story is the single highest-engagement item; weights (`W_HN_*`, `W_REDDIT`,
`W_NEWS_COUNT`) live at the top of the file. Pure fns are unit-tested.

### `digest.py` — the collector CLI

A thin wrapper over `collect.py`: collects (or replays `--from-json`), optionally writes
the scored JSON (`--json-out`), and prints the human-readable signal (`render_payload`,
which produces `signal-latest.txt`). No Gemini, no email. `--collect-only` is kept as a
no-op alias so `collect-signal.yml` and the routine's STEP 0 command keep working.

### `ai_news/routine/` — the Claude routine (writes the draft)

`orchestrator.md` runs each pass as a fresh sub-agent (the isolation is the quality
lever: the fact-finder must not know the angle; the writer sees only the verified brief).
It reads the committed signal in STEP 0, recalls last week's draft from the `drafts`
branch (so it does not repeat a topic), then runs reporter → angle → writer → editor →
performer → article and delivers ONE story in two renderings (a 6–10 min voiceover script
and a Substack article) to Google Drive and Gmail. House style (no em dashes, no
fragments, steelman-then-resolve) lives in the pass specs, not in Python anymore.

> **Repositioning note:** the routine still frames Alex Prompts as a frontier-tech NEWS
> channel. The site is now AI how-to **education** (see `src/lib/site.ts`). Reframing the
> routine to find beginner demand and scaffold how-to guides (titles, hooks, outlines for
> Alex to fill by actually doing the task) is the pending follow-up.

### Automation

**`collect-signal.yml`** (Saturday 05:00 UTC, before the routine) is the only scheduled
workflow here now. It installs `requirements-ai-news.txt`, runs the collector from a
non-blocked runner IP, and commits the refreshed signal. No secrets needed (collection
hits no paid APIs). Draft delivery is handled inside the Claude routine via its Google
Drive + Gmail connectors, so there is no longer a Resend email workflow.
