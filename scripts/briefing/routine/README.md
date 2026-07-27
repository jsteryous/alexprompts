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

1. **`pass1_collector.md`** — works the fixed checklist: the **GGAR MLS monthly indicators** first
   (the local source of record, fetched from the ShowingTime PDF, and the preferred lead figure
   because it is what agents and loan officers see in their own systems; `GGAR: UNAVAILABLE` when
   the fetch fails, never a silent fallback); the residential pulse (Greenville vs
   national home value + rent, with the gap stated as fact) from `greenvilleHousing.json`; the
   standing **Who's buying** analysis from `commercialSales.json` (repeat-`PURNAME` pattern flags
   PLUS one rotating aggregate cut, never repeating a recent brief's, chosen from top buyers /
   monthly volume / price per acre / type mix / corridor rollup); the **What traded** deals with
   per-unit math, labeled recently-recorded, CONDITIONAL and deduped against the COVERED LEDGER so
   it is `NOTHING NEW` most weeks; **Around town** local development news (notable projects,
   expansions, and capital moves from local outlets plus official sources) and **Rates** (primary
   sources only: Freddie Mac PMMS / FRED) via web search; one concrete watch indicator. Around town
   may be `NOTHING REAL` and What traded may be `NOTHING NEW`. Reads the optional `../watchlist.md`
   steer file and the COVERED LEDGER for carry-forward items and the last data dive.
2. **`pass2_writer.md`** — renders the fact sheet into the fixed template (open on the week's lead
   number, then The Upstate vs the country / Buyer or seller's market / Who's buying / What traded
   *only when new* / Around town / Rates and money / What I'd watch, then one quiet `/find-a-pro`
   line and the not-advice footer), 600 to 900 words, house style, inline source links. Emits
   `## METADATA`, `## IMAGE`, `## ARTICLE`, `## X`.
3. **`pass2b_verifier.md`** — the truth gate, between writer and editor. Independently re-opens
   every EXTERNAL web source (rates, around-town items, watch dates, any CLAIM figure), confirms or
   corrects each claim against the PRIMARY source, cuts what will not confirm, and appends a
   `## VERIFICATION LEDGER`. Committed-dataset VALUES are ground truth and are left to the editor's
   arithmetic re-check, but the verifier DOES check how each dataset figure is **characterized**
   (instrument named, geography honest, comparison same-source, as-of month present) and resolves
   every link in the draft, because a correctly transcribed number can still be a false statement
   about the world.
4. **`pass3_editor.md`** — audits against the fact sheet AND the verification ledger: every dataset
   figure traced (including the Greenville-vs-national gaps), the per-unit arithmetic re-done, no
   cut claim reappears and every corrected value stuck, the fixed section order, the conditional
   What-traded shape, the recency caveat on deeds, the no-filler rule (Around town is one line when
   dry, Rates stays short), no fabricated stance, fair housing, links, style, the `briefing` tag
   (never `greenville` / `greenville works`).

`orchestrator.md` wires them as cold sub-agents, guards first (same-week dupe; stale-draft
backpressure), builds the COVERED LEDGER by recalling the last few PUBLISHED briefs from Supabase
(the `drafts`-branch done-log proved unreliable, so recall no longer depends on it), inserts the
post as a **DRAFT** tagged `briefing`, and delivers the review packet (the verification ledger's
CHECK-THESE items and the MUST-VERIFY list, the brief, the X post, and three links: `/review` edit,
one-click publish, one-click broadcast) by Gmail and to `drafts/upstate-brief-<date>.md`.

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
