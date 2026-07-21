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
- **It runs on two committed datasets.** The FRESH lead is the residential pulse from
  `src/data/greenvilleHousing.json` (Zillow ZHVI home values + ZORI rents, Greenville vs
  national, built weekly by `.github/workflows/collect-housing.yml`), which updates monthly and
  anchors the "Upstate vs the country" sentiment read. The SCARCE middle is
  `src/data/commercialSales.json` (Greenville County commercial deeds, refreshed Sundays 22:00
  UTC by `.github/workflows/collect-commercial.yml`), which powers the standing "Who's buying"
  analysis (repeat-buyer flags + a rotating aggregate cut) and the "What traded" deals. The deed
  data lags months, so it is reported as the trend and the players, never as this week's news.
  That split (fresh pulse up top, deep proprietary data in the middle) is the July 2026 reshape.
- **It is Monday-perishable.** The other tracks are evergreen; a stale brief is deleted, never
  published late. The orchestrator's backpressure guard blocks the next run while an unreviewed
  brief draft is pending.

## The pipeline

1. **`pass1_collector.md`** — works the fixed checklist: the residential pulse (Greenville vs
   national home value + rent, with the gap stated as fact) from `greenvilleHousing.json`; the
   standing **Who's buying** analysis from `commercialSales.json` (repeat-`PURNAME` pattern flags
   PLUS one rotating aggregate cut, never repeating last week's, chosen from top buyers / monthly
   volume / price per acre / type mix / corridor rollup); the **What traded** deals with per-unit
   math, labeled recently-recorded; **Around town** local development news (notable projects,
   expansions, and capital moves from local outlets plus official sources) and **Rates** via web
   search; one concrete watch indicator. Only Around town may be `NOTHING REAL`. Reads the
   optional `../watchlist.md` steer file and last week's done-log for carry-forward items and the
   last data dive.
2. **`pass2_writer.md`** — renders the fact sheet into the fixed template (open on the week's lead
   number, then The Upstate vs the country / Who's buying / What traded / Around town / Rates and
   money / What I'd watch, then one quiet `/find-a-pro` line and the not-advice footer), 600 to
   900 words, house style, inline source links. Emits `## METADATA`, `## IMAGE`, `## ARTICLE`,
   `## X`.
3. **`pass3_editor.md`** — audits against the fact sheet: every figure traced (including the
   Greenville-vs-national gaps), the per-unit arithmetic re-done, the fixed section order,
   the recency caveat on deeds, the no-filler rule (Around town is one line when dry, Rates stays
   short), no fabricated stance, fair housing, links, style, the `briefing` tag (never
   `greenville` / `greenville works`).

`orchestrator.md` wires them as cold sub-agents, guards first (same-week dupe; stale-draft
backpressure), recalls last week's ITEMS COVERED from the `drafts` branch, inserts the post as a
**DRAFT** tagged `briefing`, and delivers the review packet (MUST-VERIFY list, the brief, the X
post, and three links: `/review` edit, one-click publish, one-click broadcast) by Gmail and to
`drafts/upstate-brief-<date>.md`.

## Cadence and the Monday timeline

Scheduled Claude cloud agent, **Mondays ~08:00 UTC** (4am ET), deliberately after the
Sunday 22:00 UTC commercial-sales data refresh (moved July 13, 2026 from Mon 07:00; GitHub
cron delays made the Monday run land after the brief). Packet is in Alex's inbox by ~5am ET; he reviews with
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
