# Upstate Brief routine (`scripts/briefing/`)

A Claude routine that writes **one fixed-format weekly briefing** on Upstate real estate,
published at **`/briefing`** (tag `briefing`), every Monday morning, plus a short X post for
manual posting. See `../SPEC.md` for the full product spec and the referral logic; the short
version is that the brief is the recurring artifact for Alex's professional sphere (loan
officers, attorneys, agents, investors) and the concrete promise behind the site's subscribe
CTA. It took the weekly slot from Greenville Works (now occasional/monthly).

## What makes it different from the other two engines

- **A briefing, not an essay.** Fixed sections, hard caps, information density over voice. The
  format is the angle, so there is no scout pass and no angle pass.
- **It has a proprietary data section.** "What sold" is built from the committed
  `src/data/commercialSales.json` (Greenville County commercial deeds, refreshed Mondays
  07:00 UTC by `.github/workflows/collect-commercial.yml`), with per-SF / per-acre math and a
  repeat-buyer pattern flag. That data is the scarce part nobody else publishes.
- **It is Monday-perishable.** The other tracks are evergreen; a stale brief is deleted, never
  published late. The orchestrator's backpressure guard blocks the next run while an unreviewed
  brief draft is pending.

## The pipeline

1. **`pass1_collector.md`** — works the fixed checklist: rates and Fed items from primary
   sources via web search; the sales picks + per-unit math + repeat-`PURNAME` pattern flag from
   the committed dataset; county/city board actions and one employer-or-capital item via web
   search; one concrete watch indicator. Marks dry sections `NOTHING REAL`. On a thin week
   (projects AND employers both dry) it must instead cut ONE aggregate **data dive** from the
   full dataset (top buyers, monthly volume, price per acre, type mix, or a corridor rollup,
   rotating via the done-log) so the thin-week floor is depth, not padding. Reads the optional
   `../watchlist.md` steer file and last week's done-log for carry-forward items.
2. **`pass2_writer.md`** — renders the fact sheet into the fixed template (open on the week's
   lead number, then Rates and money / What sold / Projects and permits / Employers and capital
   / What I'd watch, then one quiet `/find-a-pro` line and the not-advice footer), 600 to 900
   words, house style, inline source links. Emits `## METADATA`, `## IMAGE`, `## ARTICLE`,
   `## X`.
3. **`pass3_editor.md`** — audits against the fact sheet: every figure traced, the per-unit
   arithmetic re-done, the no-filler rule (a dry section is one line), no fabricated stance,
   fair housing, links, style, the `briefing` tag (never `greenville` / `greenville works`).

`orchestrator.md` wires them as cold sub-agents, guards first (same-week dupe; stale-draft
backpressure), recalls last week's ITEMS COVERED from the `drafts` branch, inserts the post as a
**DRAFT** tagged `briefing`, and delivers the review packet (MUST-VERIFY list, the brief, the X
post, and three links: `/review` edit, one-click publish, one-click broadcast) by Gmail and to
`drafts/upstate-brief-<date>.md`.

## Cadence and the Monday timeline

Scheduled Claude cloud agent, **Mondays ~08:00 UTC** (4am ET), deliberately after the
07:00 UTC commercial-sales data refresh. Packet is in Alex's inbox by ~5am ET; he reviews with
coffee, publishes, and clicks the broadcast link by ~8am ET. The daily finalize cron runs at
**13:00 UTC** (moved from 09:00; Vercel Hobby caps a project at 2 crons, so the one daily run
doubles as the Monday 9am ET cover + broadcast backstop), and the review packet's one-click
broadcast link makes same-minute sending the primary path.

## Guardrails

- **Draft-first + perishable.** DRAFT insert, human publish at `/review` or `/admin`, and the
  standing instruction to delete rather than publish late.
- **No number without a source; the seams stay visible.** Conflicting or unverified figures are
  stated as such, never averaged or smoothed.
- **No fabricated stance.** First person reports the inquiry only; the watch item is a dated,
  checkable indicator, not an opinion. Alex adds any real take in review.
- **Fair housing.** Places are described by objective facts only; the editor cuts anything
  that characterizes who lives somewhere or who a place is for.
- **Not advice.** Every issue ends with the standing not-advice footer.
