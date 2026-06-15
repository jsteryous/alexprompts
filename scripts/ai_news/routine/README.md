# Weekly script routine — pipeline specs

These files are the prompt pipeline for the **Alex Prompts weekly script** cloud
routine (`trig_01DsCznTLyHBeim8e7GBadiF`, manage at
https://claude.ai/code/routines/trig_01DsCznTLyHBeim8e7GBadiF). The routine runs
Saturday ~9am ET on Claude subscription usage (no API invoice) and writes one 5 to 8
minute spoken video script that also reads as a Substack article.

The routine's own prompt is a ~60-word pointer that says "read `orchestrator.md` and
follow it." Everything real lives here, version-controlled, so a change to one pass
is a normal edit + commit, not a hand-edit of a cloud config field.

## Files

| File | Role |
|---|---|
| `orchestrator.md` | The driver. Workspace rules, isolation rule, the 6 steps. Reads each pass file and dispatches an isolated sub-agent. |
| `pass1_reporter.md` | Truth only. Ranks + selects the lead, verifies every fact, gathers context/history, surfaces the tagged questions. |
| `pass2_angle.md` | Picks ONE lens (the menu) and ONE spine question. |
| `pass3_writer.md` | House voice. Facts → backdrop → spine question → calibrated read. Talks to the audience. |
| `pass4_editor.md` | Fact-check against the brief + style + structure enforcement. |
| `pass5_performer.md` | Read-aloud polish for camera. |

## How it runs

Each pass is a **separate cold sub-agent** that sees only its spec file plus the
named `/tmp/ap` input. Isolation is the quality lever: the writer never sees raw
sources, the reporter never sees the angle. Outputs chain through `/tmp/ap/`.

```
collect → signal.txt
pass1 (signal.txt)              → pass1_brief.md
pass2 (brief)                   → pass2_angle.md
pass3 (brief + angle)           → pass3_draft.md
pass4 (draft + brief)           → pass4_edited.md
pass5 (edited)                  → pass5_final.md
deliver (final + editor notes)  → Google Drive
```

## Editing

- Change one pass: edit its file, commit to the default branch. The next Saturday
  run picks it up from the fresh checkout. No routine-config change needed.
- Change the flow itself (add/remove a pass, reorder): edit `orchestrator.md`.
- The voice rules here mirror `scripts/ai_news/digest.py` (`WRITER_PROMPT`) and the
  root `CLAUDE.md`. Keep them in sync.
