# Weekly script routine — pipeline specs

These files are the prompt pipeline for the **Alex Prompts weekly script** cloud
routine (`trig_01DsCznTLyHBeim8e7GBadiF`, manage at
https://claude.ai/code/routines/trig_01DsCznTLyHBeim8e7GBadiF). The routine runs
Saturday ~9am ET on Claude subscription usage (no API invoice) and writes one 6 to 10
minute spoken video script PLUS a Substack article rendering of the same piece. One
pipeline; it forks only at the final render (pass6) so the two never diverge in facts.

The routine's own prompt is a ~60-word pointer that says "read `orchestrator.md` and
follow it." Everything real lives here, version-controlled, so a change to one pass
is a normal edit + commit, not a hand-edit of a cloud config field.

## Files

| File | Role |
|---|---|
| `orchestrator.md` | The driver. Workspace rules, isolation rule, the steps. Reads each pass file and dispatches an isolated sub-agent. |
| `pass1_reporter.md` | Truth only. Ranks + selects the lead, verifies every fact, captures verbatim quotes, gathers context/history + the overlooked connection, surfaces the tagged questions. |
| `pass2_angle.md` | Picks ONE lens (the menu, incl. the overlooked connection) and ONE spine question. |
| `pass3_writer.md` | House voice. Facts → backdrop/connection → spine question → calibrated read. Quotes the players verbatim. Talks to the audience. |
| `pass4_editor.md` | Fact-check against the brief (incl. verbatim quotes) + length window + style + structure enforcement. |
| `pass5_performer.md` | Read-aloud polish for camera. Produces the voiceover script. |
| `pass6_article.md` | Renders the Substack article from the finished script. Presentation only (subheads, blockquotes, source links); no new facts. |

## How it runs

Each pass is a **separate cold sub-agent** that sees only its spec file plus the
named `/tmp/ap` input. Isolation is the quality lever: the writer never sees raw
sources, the reporter never sees the angle. Outputs chain through `/tmp/ap/`.

```
collect → signal.txt
pass1 (signal.txt)                  → pass1_brief.md
pass2 (brief)                       → pass2_angle.md
pass3 (brief + angle)               → pass3_draft.md
pass4 (draft + brief)               → pass4_edited.md
pass5 (edited)                      → pass5_final.md      (voiceover script)
pass6 (final + brief)               → pass6_article.md    (Substack article)
deliver (script + article + notes)  → Google Drive + email
```

## Editing

- Change one pass: edit its file, commit to the default branch. The next Saturday
  run picks it up from the fresh checkout. No routine-config change needed.
- Change the flow itself (add/remove a pass, reorder): edit `orchestrator.md`.
- The voice rules here are the canonical copy (the Gemini-era `WRITER_PROMPT` is
  gone); the root `CLAUDE.md` Voice section mirrors them. Keep the two in sync.
- Audience + domain: this routine serves real-estate **agents and investors** (AI
  for their work), fed by the AI-for-real-estate collector. See `scripts/CLAUDE.md`.
