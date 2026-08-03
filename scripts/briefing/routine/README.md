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
- **It is written for buyers and sellers.** Not for investors, and not separately for the
  professionals. Loan officers, closing attorneys, and agents read the same brief and forward it to
  their own clients, which is the distribution. The test for any item is whether it changes how a
  person shops for, prices, or times a house in Greenville County.
- **It runs on one committed dataset.** `src/data/greenvilleHousing.json` (built weekly by
  `.github/workflows/collect-housing.yml`, Sundays 22:00 UTC) carries all three layers: the FRESH
  lead is the residential pulse (Zillow ZHVI home values + ZORI rents, Greenville vs national); the
  middle is the five market-vitals leverage metrics; and the SCARCE part is the `submarkets` block,
  the same metrics per ZIP for every ZIP in Greenville County, which powers "Where the leverage is."
  Nobody else publishes a ZIP-level leverage read for the Upstate.
- **The commercial-deed sections were CUT (July 2026).** "Who's buying" and "What traded" ran on
  `src/data/commercialSales.json` and took about a THIRD of the brief while carrying nothing from
  the week (the July 27 issue cited an October 2025 portfolio transfer and a March 2026 deed, and
  apologized for the lag twice). They served an investor audience the brief does not write for.
  The dataset is untouched and still powers `/tools/buyers-list`, which is the right home for
  complete-but-lagging data. Do not reintroduce a commercial section.
- **It is Monday-perishable.** The other tracks are evergreen; a stale brief is deleted, never
  published late. The orchestrator's backpressure guard blocks the next run while an unreviewed
  brief draft is pending.

## The pipeline

1. **`pass1_collector.md`** — works the fixed checklist: the **GGAR MLS monthly indicators** first
   (the local source of record, fetched from the ShowingTime PDF, and the preferred lead figure
   because it is what agents and loan officers see in their own systems; on a failed fetch it works
   a **source ladder** (the alternate publishers of the same report) before writing
   `GGAR: UNAVAILABLE`, which is an INTERNAL routing line for the review packet and never reaches the
   prose); the residential pulse (Greenville vs
   national home value + rent, with the gap stated as fact) and the five market-vitals leverage
   metrics, all from `greenvilleHousing.json`; the standing **Where the leverage is** submarket
   analysis from that file's `submarkets` block (the county SPREAD with its median, the MOVERS on
   inventory and price-cut share, PLUS one rotating angle, never repeating a recent brief's, chosen
   from price band versus leverage / tightest and loosest / city rollup / inside the city of
   Greenville / where new supply landed); **Around town** local development news (notable projects,
   expansions, and capital moves from local outlets plus official sources) and **Rates** (primary
   sources only: Freddie Mac PMMS / FRED) via web search; one concrete watch indicator. Around town
   is the only section that may be `NOTHING REAL`. Reads the optional `../watchlist.md`
   steer file and the COVERED LEDGER for carry-forward items and the last submarket angle.
2. **`pass2_writer.md`** — renders the fact sheet into the fixed template (open on the week's lead
   number, then The Upstate vs the country / Buyer or seller's market / Where the leverage is /
   Around town / Rates and money / What I'd watch, then one quiet buy-or-sell invitation linked to
   `/find-a-pro` and the not-advice footer), no word cap (usefulness sets the length; the no-filler rule is
   the only control), house style, inline source links. The two
   leverage sections split by **altitude** (narrowed July 27, 2026): "Buyer or seller's market" is
   the comparison to the COUNTRY, in four to six sentences of prose with no bullets, each headline
   figure carrying its direction across recent months; "Where the leverage is" is the spread across
   the COUNTY, opening on the normalized price-band finding rather than raw ZIP listing counts. A metric appears in both only when each appearance
   answers a different question, and the editor cuts cross-section repetition. Runs a
   **clippable test** on the open and every section's first sentence (stands alone, under 200 chars,
   one main clause, short source tag inside the clip with the methodology caveat in the NEXT
   sentence) plus general readability limits (break sentences over 35 words, one subordinate clause,
   active voice, concrete over index-language), while still banning fragments and staccato. Carries
   the **no process narration** rule added August 2026 (the reader never learns what the pipeline
   tried, could not reach, or fell back to; a world-limitation attached to a figure stays, a
   confession about a failed fetch goes), a **one-caveat-per-section budget**, **state a figure
   once**, and rhythm variation in BOTH directions (a run of long clause-heavy sentences is as much a
   machine tell as a run of clipped ones; short complete sentences are correct, fragments are not).
   Emits
   `## METADATA`, `## IMAGE`, `## ARTICLE`, `## X`, and `## CLIPS` (three paste-ready lines for
   X/Nextdoor, each copied **verbatim** from the article so it inherits the fact-checking, with
   character counts and one marked as the Nextdoor fit).
3. **`pass2b_verifier.md`** — the truth gate, between writer and editor. Independently re-opens
   every EXTERNAL web source (rates, around-town items, watch dates, any CLAIM figure), confirms or
   corrects each claim against the PRIMARY source, cuts what will not confirm, and appends a
   `## VERIFICATION LEDGER`. Committed-dataset VALUES are ground truth and are left to the editor's
   arithmetic re-check, but the verifier DOES check how each dataset figure is **characterized**
   (instrument named, geography honest, comparison same-source, as-of month present) and resolves
   every link in the draft, because a correctly transcribed number can still be a false statement
   about the world.
4. **`pass3_editor.md`** — audits against the fact sheet AND the verification ledger: every dataset
   figure traced (including the Greenville-vs-national gaps and every submarket rank, median, and
   band average), the arithmetic re-done, no cut claim reappears and every corrected value stuck,
   the fixed section order, **no commercial section**, the five submarket checks (every ZIP carries
   its town name, no `thin` ZIP is headlined, shares read as points, the limits sentence survived,
   mechanic not verdict), the no-filler rule (Around town is one line when dry, Rates stays short),
   no fabricated stance, **fair housing** (now the top legal risk, since the submarket section ranks
   named places every week), links, style, the `briefing` tag (never `greenville` /
   `greenville works`). Since August 2026 it also runs three hard cut-gates for the machine tells:
   **no process narration** (delete any sentence about a source that would not open or a fallback
   taken, whole, without softening), the **one-caveat-per-section budget**, and **no figure twice at
   full strength**; plus an added open test that the lead clause is the plain-language mechanic
   rather than a bare metric.

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
