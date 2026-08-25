# The publication routine

The engine that writes the South Carolina real estate and business publication. Read
`../SPEC.md` first; it defines what gets written and outranks anything here.

Ported from `scripts/tech/routine/` in August 2026, with the verifier ported from
`scripts/briefing/routine/pass2b_verifier.md`. The old engines are unchanged on disk and their
published work stays live.

## The passes

| # | File | Job | Sees |
|---|---|---|---|
| 0 | `pass0_scout.md` | Picks ONE question. Crosses the inventory against eleven shapes, runs seven bars and five gates. | `companies.md`, `claims.md`, `sources.md`, done-log, ledger |
| 1 | `pass1_researcher.md` | Answers it. Computes the original number. Kills the run if it can't. | the topic, `sources.md` |
| 2 | `pass2_angle.md` | Builds the spine from the answer. | the brief, the ledger |
| 3 | `pass3_writer.md` | Renders it in Alex's voice. | the brief, the angle, published pages |
| 3b | `pass3b_verifier.md` | Re-opens every source and checks the world. | the draft, the brief |
| 4 | `pass4_editor.md` | Audits against the brief. Enforces the gates and the style. | the verified draft, the brief |

`orchestrator.md` runs them, each as a fresh sub-agent, and handles the kill exits, the draft
insert, and the review packet.

Isolation is the quality lever. The researcher must establish facts before anyone frames them.
The writer must not re-report. **The verifier must not see the editor's judgment and the editor
must not redo the verifier's fetches**, which is why they are two agents rather than one.

## What is different from the engines this came from

**KILL EXITS CLEAN.** The single most important change. A run that hits a kill condition produces
no draft, no email, and no commit, and roughly half of all runs should end that way. The old
engines published on a schedule against sources that refreshed more slowly than the schedule, and
that is what killed both of them. See the table at the top of `orchestrator.md`.

**One original number, or no piece.** The publication's one hard rule is now a KILL CONDITION in
the researcher and a GATE in the editor, not an aspiration. Quoting a figure is roughly ten times
easier than computing one, and that asymmetry is exactly why it needs a gate rather than a
preference.

**A verifier between the writer and the editor.** The briefing engine's best pass, reshaped: it
had a committed dataset to exempt from checking, and this publication has none, so the whole draft
is in scope. It verifies the original number hardest, because nobody else published that figure
and no reader can catch an error in it.

**Assess, do not advise.** The piece reaches a conclusion about the EVIDENCE and withholds the
RECOMMENDATION. Both halves are checked in the editor, because the two failures are opposite and
either one alone breaks the publication.

**Three rule reversals from the old engines.** Contractions are allowed in prose. The
clippable-lead rule inverts, so the first sentence is the most interesting one rather than the most
quotable. The no-verdict rule is dead.

**No mandatory closing question.** The old engine required one and it read as a tic by the second
piece. The editor is told not to add one.

## The August 2026 pass: one gate for being boring

Every gate above tests whether a piece is WRONG. After the first run shipped something correct and
dull, four changes added the missing test. See "The other hard rule" in `SPEC.md`.

**Bar 7, THE TELLABLE TEST, in the scout.** Would a reader repeat this over lunch? The expected
answer goes in a required THE TELLABLE LINE field, and a question whose honest answer is what
anybody would have guessed dies at selection, no matter how well sourced it would have been.

**The angle may move the lede.** Promotion to a stronger finding further down the brief is allowed
under three conditions and declared in a PROMOTION field. It used to be banned outright, which
meant the engine could never beat the guess the scout made before reading a document. **The
orchestrator now hands the angle document to the editor**, which it did not before, because the
editor rejects an undeclared change of question and the PROMOTION line is what tells the two apart.

**ODD SPECIFICS in the brief.** Three to eight sourced particulars from the actual documents, the
raw material behind "specificity is the humor." The writer spends two or three; the verifier
confirms them against the block instead of stripping them as unconfirmed; the editor cuts any that
do not trace, because an invented specific is a fabrication wearing style's clothes.

**The style rules are a floor.** Fourteen prohibitions against seven positive instructions
produces a writer optimising for not being wrong. Every prohibition stays, reframed as the price
of admission rather than the goal.

**No fixed template.** The finding sets the shape. The four analytical obligations (what they
sell, who pays, why here, what would break it) are things a piece must not be missing, never an
outline to march through.

## Files outside `routine/`

| File | What it is |
|---|---|
| `../SPEC.md` | The definition of the publication. Read first. |
| `../companies.md` | The inventory. South Carolina companies worth taking apart. |
| `../claims.md` | Things Alex has heard people say. **The highest-value file and the only one that needs him.** |
| `../sources.md` | Every source, sorted by refresh rate, split CADENCE vs DEPTH. What THE REFRESH GATE tests against. |
| `../ledger.md` | The living artifact. What has been covered, established, and spent. Lives on the `drafts` branch. |

## Scheduling

Target about every two weeks, publish on finding. The cadence guard in STEP 0B enforces a 10-day
floor, and finding nothing worth publishing for a month is an acceptable outcome. The schedule may
run more often than the target, because the gates decide whether anything ships, not the cron.

Zero pending drafts allowed. A queue of unreviewed drafts is how a backlog becomes pressure to
ship.
