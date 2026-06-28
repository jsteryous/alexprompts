# Weekly research routine — pipeline specs

These files are the prompt pipeline for the **Alex Prompts weekly research deep-dive** cloud
routine (`trig_01DsCznTLyHBeim8e7GBadiF`, manage at
https://claude.ai/code/routines/trig_01DsCznTLyHBeim8e7GBadiF). The routine runs Saturday
~9am ET on Claude subscription usage (no API invoice). Each week it takes ONE question from
the bank, has Claude research it against real public data, and writes one 6 to 10 minute
spoken video script PLUS a Substack article rendering of the same piece. One pipeline; it
forks only at the final render (pass6) so the two never diverge in facts.

> **This replaced the old AI-news engine (June 2026).** Alex stopped filming the news scripts
> because they kept landing on regulation and frontier-AI politics, picked by how many outlets
> covered a story, with nothing a working agent could use. The engine now answers an evergreen
> question with evidence instead of chasing headlines. Claude is the VISIBLE method: the piece
> is openly "I pointed Claude at this question, here is what the data says." See `scripts/CLAUDE.md`.

The routine's own prompt is a ~60-word pointer that says "read `orchestrator.md` and follow
it." Everything real lives here, version-controlled, so a change to one pass is a normal edit
plus commit, not a hand-edit of a cloud config field. The cloud routine's path
(`scripts/ai_news/routine/orchestrator.md`) is unchanged from the news era, so no cloud-config
edit is needed; the `ai_news/` directory name is legacy.

## Inputs (not passes)

| File | Role |
|---|---|
| `../questions.md` | The question bank. Seeded by Alex, status-tracked (`queued` / `done <date>`). STEP 0 picks the top un-done question; the routine may append `proposed` candidates for Alex to approve. |
| `../sources.md` | The primary-data registry handed to the researcher every week (Census, FRED, FHFA, Zillow/Redfin, Lincoln Institute, Strong Towns, LBNL solar, Greenville ArcGIS, academic), with access notes and honesty caveats. |

## Passes

| File | Role |
|---|---|
| `orchestrator.md` | The driver. Workspace rules, isolation rule, the steps. Picks the question, loads sources, dispatches each isolated sub-agent, delivers, and marks the question done. |
| `pass1_researcher.md` | Truth only. Pulls real figures from the registry, separates confirmed/contested/unknown, HUNTS THE CONFOUNDER, chases the why-chain, writes a sourced brief + MUST-VERIFY. |
| `pass2_thesis.md` | Picks the single honest thesis the data supports (it must survive the confounders), the spine question, the confidence level, and the practitioner takeaway. |
| `pass3_writer.md` | House voice. Obvious answer → what the data shows → the catch → honest read → practical takeaway. Claude-visible, grounded-optimism guardrail, talks to the audience. |
| `pass4_editor.md` | Fact-check every figure against the brief + the honesty discipline (no causation from correlation, confidence matches data, caveats present) + length/style/structure. |
| `pass5_performer.md` | Read-aloud polish for camera; keeps numbers and caveats sayable but never alters a figure or a quote. Produces the voiceover script. |
| `pass6_article.md` | Renders the Substack article from the finished script. Presentation only (subheads, a "what the data says" callout, source links, blockquotes); no new facts. |

## How it runs

Each pass is a **separate cold sub-agent** that sees only its spec file plus the named
`/tmp/ap` input. Isolation is the quality lever: the researcher never sees the thesis, the
writer never sees the raw data tables, only the verified brief.

```
STEP 0  pick question (questions.md) + load sources (sources.md) → question.txt, sources.txt
pass1   (question + sources + last_issue)   → pass1_brief.md       (sourced research brief)
pass2   (brief)                              → pass2_thesis.md
pass3   (brief + thesis)                      → pass3_draft.md
pass4   (draft + brief)                        → pass4_edited.md
pass5   (edited)                               → pass5_final.md      (voiceover script)
pass6   (final + brief)                         → pass6_article.md    (Substack article)
deliver (script + article + notes)  → Google Drive + email; mark question done on `drafts`
```

## Editing

- Change one pass: edit its file, commit to the default branch. The next Saturday run picks
  it up from the fresh checkout. No routine-config change needed.
- Change the flow (add/remove a pass, reorder): edit `orchestrator.md`.
- Add or retire a question: edit `../questions.md`. Add a data source: edit `../sources.md`.
- The voice rules here are canonical; the root `CLAUDE.md` Voice section mirrors them. Keep
  the two in sync.
- Audience + domain: real-estate **agents and investors**, plus developers and planners,
  anchored in Greenville / North Main where the question allows. See `scripts/CLAUDE.md`.
