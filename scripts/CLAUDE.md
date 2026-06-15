# Scripts — Alex Prompts newsletter engine

See root `CLAUDE.md` for env vars and deployment. The dental/legacy pipeline
(prospects discovery, LLC→human enrichment, AI blog insights, all their GitHub
workflows) was retired in June 2026 and lives under **`scripts/_archive/`** —
reference only, nothing there runs on a schedule anymore.

## What lives in `scripts/`

- **`ai_news/`** — the weekly "Alex Prompts" digest engine. Translates frontier
  AI-lab + hard-tech research for a layperson with grounded optimism, emails an
  editable draft to Alex, who edits and publishes it on Substack.
- **`tests/test_ai_news.py`** — unit tests for the pure functions.
- **`requirements-ai-news.txt`** — deps (no Supabase/Playwright/Places).

## `ai_news/` pipeline

```bash
cd scripts
python -m ai_news.digest                 # collect -> reporter -> writer -> shorts, print
python -m ai_news.digest --show-research  # also print the research brief
python -m ai_news.digest --collect-only   # just the sourced signal, no Gemini
python -m ai_news.digest --collect-only --json-out signal.json   # also dump scored JSON (CI hand-off)
python -m ai_news.digest --from-json signal.json                 # run the pipeline off a saved snapshot, no live fetch
python -m ai_news.digest --no-shorts      # newsletter only, skip the short-form queue
python -m ai_news.digest --email          # email newsletter + short-form queue via Resend
python -m ai_news.digest --days 14        # widen the lookback window
python -m ai_news.shorts --count 8        # short-form scripts only
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
`.github/workflows/collect-signal.yml` (Saturday 12:00 UTC, before the routine) runs
`--collect-only --json-out` from the runner's good IP and commits the scored signal to
`scripts/ai_news/data/` (`signal-latest.json` + the rendered `signal-latest.txt`). The
routine's STEP 0 reads that committed file; live collection is only a fallback. The
serialization round-trips through `collect.to_json` / `collect.from_json` (unit-tested);
`--from-json PATH` replays a saved snapshot through the whole pipeline with no network.
The Monday email pipeline (`ai-news.yml`) still collects live because GitHub runners can.

All network fns degrade gracefully (log + return `[]`, never raise). RSS is parsed
with **defusedxml** (XXE/billion-laughs hardening; falls back to stdlib if absent).
"Attention" is builder/tech-crowd by design, not mainstream virality. The biggest
story is the single highest-engagement item; weights (`W_HN_*`, `W_REDDIT`,
`W_NEWS_COUNT`) live at the top of the file. Pure fns are unit-tested.

### `digest.py` — two-pass draft

The quality lever is the **two-pass** split (do not collapse it back into one prompt):

1. **Reporter pass** (`REPORTER_PROMPT`, gemini-2.5-flash + Google Search grounding):
   Gemini picks the top story, generates the specific investigative questions a
   journalist would ask *about that story*, then searches to answer them. Output is
   a research brief that separates CONFIRMED facts from CLAIMS and names THE OPEN
   QUESTION. This is what stops the writer from papering over missing facts.
2. **Writer pass** (`WRITER_PROMPT`, gemini-2.5-pro, flash fallback): writes the
   issue from the brief in Alex's house style.

**House style is non-negotiable** (`WRITER_PROMPT` + guardrails): NO em dashes, NO
sentence fragments, cold concrete lede, plain-English jargon translation, steelman-
then-resolve. Banned fluff ("in an unprecedented move," "sent ripples," etc.) is listed
in `BANNED_PHRASES`. `strip_em_dashes()` is a hard backstop because models ignore the
no-dash rule; `find_fluff()` warns when banned phrases slip through. Top story is
thorough (What we know / What is still unclear / Why it matters / The other side); the
rest go in a short "In other news" section. Faith content is NOT generated here. Alex
writes any of that himself.

**The editorial FRAMEWORK is encoded in `WRITER_PROMPT` (and mirrored in `shorts.py`),
as *disciplines, not biases* — the brand aims at truth, not at pushing a prior.** The
four: (1) read the builders, then pressure-test, splitting CAPABILITY claims (credible)
from TIMELINE/CONSEQUENCE claims (also a sales pitch); (2) doubt the consensus only when
you can name the specific distortion, never invert just to be contrarian; (3) optimism is
a *finding*, not a default; (4) steelman before resolving, and separate the transition
from the endpoint on sweeping claims (e.g. AI and jobs). Each issue ends on **the
question worth arguing about** (one you'd respect both answers to), which is the "prompt"
the brand is named for. The `REPORTER_PROMPT` feeds this by tagging each claim
[capability]/[timeline-consequence] and noting who benefits if it is believed. This
framework also lives in the root `CLAUDE.md` and `src/lib/site.ts` `principles`; keep the
three in sync. Do not regress "optimism as a finding" back to "optimistic by default."

### `shorts.py` — short-form script queue

Short-form video is the **discovery engine** (TikTok/Shorts/Reels/X); the newsletter
is the **capture**. `shorts.py` reuses the same collection + research brief (no extra
reporter pass) and writes `--count` (default 6) shoot-ready scripts, so one weekly
research pass becomes a week of posts. Primary format is **voiceover over b-roll/screen
with some on-camera**, so scripts are spoken narration with `[VISUAL: ...]` cues. Each
script: 4 hook options (first 3 seconds decide everything), a 15-45s spoken body that
translates the jargon and ends on a discussion prompt, a varied newsletter CTA, visual
cues, and a caption with hashtags. Same voice constitution as the newsletter, adapted
to spoken short-form; same `strip_em_dashes` guardrail. `gemini-2.5-pro` (flash
fallback). `digest.py` bundles the queue into the weekly run/email by default
(`--no-shorts` to skip); `llm.py` holds the shared Gemini call helper both use.

### Email + automation

`--email` renders the markdown to HTML (rendered + raw-markdown copy block, with a
"verify every claim before sending" banner) and sends via **Resend** to
`NOTIFICATION_EMAIL` (`jsteryous@gmail.com`). The weekly email bundles the newsletter
draft and the short-form queue in one message.

**Resend deliverability:** the Resend account email is `alex@rebbadvisors.com`, so the
shared `onboarding@resend.dev` sender can only reach *that* address. To deliver to the
Gmail, `MAIL_FROM` must be an address on a Resend-verified domain. `rebbadvisors.com`
is already verified, so `MAIL_FROM="Alex Prompts <noreply@rebbadvisors.com>"` works
today. When that domain is dropped, verify a new one at resend.com/domains and update
`MAIL_FROM` (set in `.env.local` and the `MAIL_FROM` GitHub secret).

**GH Actions — `ai-news.yml`:** Monday 13:00 UTC, Python 3.12,
`requirements-ai-news.txt`. Secrets: `GEMINI_API_KEY`, `RESEND_API_KEY`,
`NOTIFICATION_EMAIL`, `MAIL_FROM`.
