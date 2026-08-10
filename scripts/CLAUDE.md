# Scripts — Alex Prompts content engine

See root `CLAUDE.md` for env vars and deployment. The dental/legacy pipeline
(prospects discovery, LLC→human enrichment, AI blog insights, all their GitHub
workflows) was retired in June 2026 and lives under **`scripts/_archive/`** —
reference only, nothing there runs on a schedule anymore.

> **Gemini was removed (June 2026). The content engine is Claude routines only.**
> The old two-pass Gemini drafting, `shorts.py`, the shared `llm.py`, and the
> `ai-news.yml` / `email-draft.yml` workflows are gone.
>
> **The Saturday national engine was KILLED (July 5, 2026) and archived to
> `scripts/_archive/ai_news/`.** It could not out-rank stronger players on national queries
> (no traffic) and had no distribution (no audience, Alex stopped filming the videos), so it
> served neither the referral-revenue north star nor audience growth. The whole `ai_news/`
> directory now lives under `scripts/_archive/` (reversible). Its weekly run was a scheduled
> Claude **cloud agent**, so that scheduled routine must also be deleted in the Claude scheduler.
> Do NOT revive it. The two LOCAL Greenville engines below are the whole content operation now.
>
> **NEVER EXPLAIN THE BUSINESS MODEL (August 1, 2026), all three live engines.** Every piece may
> offer Alex's help and link `/find-a-pro`, but no article may say he will refer, match, connect,
> hand off, or introduce the reader to an agent; may call an agent "vetted" or "hand-picked"; may
> say the help is "free" or "at no cost to you"; or may say he does not practice or does not take
> clients. Each writer pass carries the rule and each editor pass carries a hard cut-gate for it.
> The close is a plain first-person invitation ("let me know if you are looking to buy or thinking
> of selling"), and `/find-a-pro` appears as a link target and nowhere else in the prose. See the
> root `CLAUDE.md` strategic-direction note.
>
> **A LINK OPENS A PAGE, NEVER A DOWNLOAD (August 10, 2026), all three live engines.** No article
> may link a URL ending in `.csv`, `.xls`, `.xlsx`, `.pdf`, `.zip`, or `.json`. The August 10 Upstate
> Brief shipped with about a dozen figures linked to raw Zillow CSVs and its lead figure linked to a
> half-megabyte ShowingTime PDF, so clicking "61 homes" downloaded a file. The cause was that the
> engine treated the URL it FETCHES and the URL it CITES as one thing, and all three layers enforced
> it: the collector passed the CSV through, the writer was told to link "the EXACT metric CSV URL,"
> and the editor gate *confirmed* every Zillow link was a specific CSV. **The fix is the split.**
> `greenville/housing.py` now emits `source_urls` (the exact files it fetches, INTERNAL, what the
> verifier re-opens to ground-truth a figure) alongside `cite_url`
> (`https://www.zillow.com/research/data/`, verified as a real landing page documenting every series
> the brief uses). The collector labels every URL VERIFY or CITE, the writer may link only a CITE,
> the verifier STRIPS any file link it finds, and the editor carries it as a hard gate. Where a
> source publishes only a document (GGAR's monthly indicators, county budgets, planning agendas),
> the figure is **attributed in words with no link**, which is complete sourcing. Two companion
> rules: **one link per source per piece** at first mention (the brief now carries exactly one Zillow
> link, since eleven links to one landing page reads as machine output), and **attribution is
> required, a link is not**.
>
> **NEVER NARRATE THE PROCESS (August 3, 2026), all three live engines.** No piece may tell the
> reader what the pipeline tried, what it could not reach, or what it fell back to: "the usual host
> was unreachable," "the MLS indicators were not available this week," "as reported by an aggregator
> rather than the primary series," "I could not confirm." A human columnist never writes these
> because a human never experiences a failed fetch; they go to the other source and come back with
> the number. Density of that narration was the strongest LLM fingerprint in a shipped Upstate Brief,
> stronger than any word choice. **The line:** a limitation that lives in the WORLD may be stated
> once, attached to the figure it affects ("no one publishes this figure, so treat it as
> approximate," "Zillow's metro series covers more ground than the MLS"), because any reader who went
> looking would meet the same wall. A limitation that exists only because one retrieval attempt
> failed is cut without replacement. **The fix at the source:** each collector/researcher now works a
> SOURCE LADDER (alternate publishers of the same number) instead of reporting a failure, treats its
> own fact sheet as INTERNAL, and routes retrieval friction to the review packet under SOURCING
> NOTES, which is where Alex reads about the machinery. Writers carry the rule, editors carry a hard
> cut-gate. Shipped alongside three related anti-tell rules: **one caveat per section**, **state a
> figure once** (repetition is model reinforcement; a newsletter trusts you heard it), and **vary
> sentence rhythm in BOTH directions** (a run of long clause-heavy sentences is as much a tell as a
> run of clipped ones; short COMPLETE sentences are correct, fragments stay banned).
> See [[saturday-research-engine]] in memory. (History: it was rebuilt from AI-news into a
> research engine in June 2026 before being killed.)

## What lives in `scripts/`

- **`_archive/ai_news/`** — the retired **Saturday national research engine** (KILLED July 5,
  2026; moved here from `scripts/ai_news/`). Its `questions.md`, `sources.md`, `routine/`
  (orchestrator + researcher → thesis → writer → editor → performer → article passes), and the
  orphaned `demand.py` radar all live under `scripts/_archive/ai_news/` now. Reference/reversible
  only; nothing runs on a schedule. See [[saturday-research-engine]] in memory. Do NOT revive.
- **`tech/`** — the **Greenville Works engine** (the local-change track; user-facing label
  **"SC Technology"**; renamed from the national "Lab" tech track in July 2026, directory kept
  as `tech/`; **statewide South Carolina since July 10, 2026**, the Upstate is home turf and
  wins ties). No collector;
  **self-sourcing**: an optional steering bank (`tech/topics.md`) plus a web-search scout
  (`pass0_scout.md`) that picks its own topic when the bank is empty, so it never runs dry. A
  Claude routine (`tech/routine/`, orchestrator plus isolated passes: scout → researcher →
  angle → writer → editor) takes ONE thing where **technology or capital is reshaping South
  Carolina** apart (a data center, the grid and energy, fiber, manufacturing and automation,
  the port, who is buying and with whose capital, proptech; with roads, water/sewer,
  subdivisions, and
  rezonings only as a secondary, occasional beat that must carry a real tech/capital/real-estate
  through-line; **deep-tech core since July 15, 2026**: every piece centers on a real technology or
  engineered system, the researcher delivers a HOW THE TECHNOLOGY WORKS teardown with real specs and
  the engineering constraint, and a topic whose technology could be swapped out without changing the
  story fails the bank's bar 7) in Alex's own first-person voice, grounds
  it with web search, above all names the honest trade-offs, and funnels relocation/buyer leads
  to `/find-a-pro` where the topic fits, then inserts a **DRAFT** `blog_posts` row tagged
  `greenville works` for `/greenville-works` (draft-first as of July 2026, was live; a review
  email carries the post id + a `/review` link Alex uses to publish). See `tech/routine/README.md`,
  the two-track note in the root `CLAUDE.md`, and memory `publishing-draft-first`.
- **`briefing/`** — the **Upstate Brief engine** (added July 9, 2026). A Mondays-only cloud
  routine (`briefing/routine/`, orchestrator plus collector → writer → **verifier** → editor; no
  scout, no angle, the fixed format is the angle) that writes ONE weekly briefing for `/briefing`
  (tag `briefing`). **Written for BUYERS and SELLERS** (settled July 27, 2026), not investors and
  not separately for the professionals: loan officers, attorneys, and agents read the same brief and
  forward it to their own clients, which is the distribution. Sections: the Upstate vs the country,
  a buyer-versus-seller leverage read, **Where the leverage is** (the ZIP-level submarket cut),
  around town, rates from primary sources, and one concrete watch indicator. The verifier
  (`pass2b_verifier.md`) re-opens every external web source and corrects or cuts what will not
  confirm before the editor sees it (the fix for a piece that shipped with unverified web claims).
  **The two commercial-deed sections ("Who's buying" and "What traded") were CUT July 27, 2026**:
  they ran about a third of the brief on data months stale and served an investor audience the brief
  does not write for. They were replaced by the submarket read, built from the `submarkets` block
  `greenville/housing.py` now collects. `commercialSales.json` is untouched and still powers
  `/tools/buyers-list`; do not reintroduce a commercial section. Cross-week dedup and carry-forward
  recall come from the last few PUBLISHED briefs via Supabase (the `drafts`-branch done-log proved
  unreliable). Inserts a **DRAFT** and emails a review packet with `/review`, one-click publish, AND
  one-click `/api/broadcast` links. **Monday-perishable**: publish + broadcast Monday morning or
  delete; the orchestrator blocks while a briefing DRAFT is pending. Optional steer file
  `briefing/watchlist.md`. It took Greenville Works'
  weekly slot (Works is now ~monthly). See `briefing/SPEC.md` + `briefing/routine/README.md`.
- **`greenville/`** — the local Greenville engine; documented in `scripts/greenville/CLAUDE.md`.
  A nightly **self-sourcing evergreen local-SEO** engine: each eligible night (about two a week)
  it writes one substantial, data-grounded local guide targeting a winnable long-tail local
  query and funneling relocation/buyer leads to `/find-a-pro`. It prefers the optional
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

## The Saturday research engine (`_archive/ai_news/`) — RETIRED

> **KILLED July 5, 2026 and archived to `scripts/_archive/ai_news/`.** The rest of this section
> is kept as HISTORY only; nothing here runs. See the top-of-file note and
> [[saturday-research-engine]] in memory. Do NOT revive.

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
