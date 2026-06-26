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

**Reoriented June 2026** from a frontier-lab feed to a national **AI-for-real-estate**
brief for agents + investors (audience decided with Alex; see memory
[[greenville-realestate-vertical]] and the sibling `greenville/collect.py`). It now
uses the **beat + corroboration** model, NOT the old entity/HN/Reddit one:

- **Google News RSS** (`when:7d`) across six AI-x-real-estate **beats** (`BEATS` at the
  top of the file): Valuation, Agent tools, Portals, Mortgage, Investor/proptech,
  Assistant how-to. Each query lives in the *intersection* (an AI term AND a real-estate
  term) so neither generic AI nor generic real-estate news floods the lane. Free, no key.
- **Scoring is corroboration** (no upvote signal exists for trade press): cluster
  headlines by normalized title, then score by how many distinct **beats** and **outlets**
  surfaced the story (`W_BEATS`, `W_OUTLETS`, `W_APPEARANCES`). The biggest cluster is the
  lead. Trade outlets (HousingWire, Inman, RISMedia, The Real Deal) are the target signal.
- **Two noise filters** the signal probe proved we need: `FINANCE_NOISE_RE` drops
  AI-company IPO/stock items that ride in on the word "valuation"; `SEO_FARM_SOURCES`
  drops content-marketing listicle domains. Both are tunable, like Greenville's
  `LISTING_RE`. (Beat queries spell out "automated valuation model"; never the bare
  acronym "AVM", which collides with arteriovenous malformation and pulls medical hits.)

**Datacenter-IP blocking + the CI hand-off.** From a *datacenter* IP Google News can 403;
GitHub-hosted runners are not blocked, the Claude Code cloud *script routine* sandbox is.
So the routine does NOT collect for itself. `.github/workflows/collect-signal.yml`
(Saturday 05:00 UTC, before the routine) runs `python -m ai_news.digest --collect-only
--json-out` from the runner's good IP and commits the scored signal to
`scripts/ai_news/data/` (`signal-latest.json` + the rendered `signal-latest.txt`). The
routine's STEP 0 reads that committed file; live collection is only a fallback. The
serialization round-trips through `collect.to_json` / `collect.from_json` (unit-tested);
`--from-json PATH` replays a saved snapshot with no network.

All network fns degrade gracefully (log + return `[]`, never raise). RSS is parsed with
**defusedxml** (XXE/billion-laughs hardening; falls back to stdlib if absent). Pure fns
are unit-tested in `tests/test_ai_news.py`.

### `digest.py` — the collector CLI

A thin wrapper over `collect.py`: collects (or replays `--from-json`), optionally writes
the scored JSON (`--json-out`), and prints the human-readable signal via
`collect.render_payload` (which produces `signal-latest.txt`). No Gemini, no email.
`--collect-only` is a no-op alias and `--news-limit` is a kept alias for `--per-beat`, so
`collect-signal.yml` and the routine's STEP 0 command keep working unchanged.

### `ai_news/routine/` — the Claude routine (writes the draft)

`orchestrator.md` runs each pass as a fresh sub-agent (the isolation is the quality
lever: the fact-finder must not know the angle; the writer sees only the verified brief).
It reads the committed signal in STEP 0, recalls last week's draft from the `drafts`
branch (so it does not repeat a topic), then runs reporter → angle → writer → editor →
performer → article and delivers ONE story in two renderings (a 6–10 min voiceover script
and a Substack article) to Google Drive and Gmail. House style (no em dashes, no
fragments, steelman-then-resolve) lives in the pass specs, not in Python anymore.

> **Repositioning note (in progress):** the **collector** is now AI-for-real-estate
> (above), but the routine **passes** (reporter → angle → writer → editor → performer →
> article) still frame Alex Prompts as a frontier-tech NEWS channel. Re-aiming those
> passes at the agent/investor reader is the **next step**; the output **format** (keep the
> 6–10 min voiceover script, or go shorter/more practical) is an open decision to make
> after seeing real collected signal. Until the passes are re-aimed, the collector signal
> and the draft framing are intentionally out of sync — don't rely on a clean Saturday run
> mid-pivot.

### Automation

**`collect-signal.yml`** (Saturday 05:00 UTC, before the routine) is the only scheduled
workflow here now. It installs `requirements-ai-news.txt`, runs the collector from a
non-blocked runner IP, and commits the refreshed signal. No secrets needed (collection
hits no paid APIs). Draft delivery is handled inside the Claude routine via its Google
Drive + Gmail connectors, so there is no longer a Resend email workflow.
