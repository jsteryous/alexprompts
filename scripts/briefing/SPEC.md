# Upstate Brief — spec

**The Upstate Brief** is one published post every Monday morning that a Greenville-area
professional can read in five minutes and start the week with a complete picture: where the
market stands (home values and rents, Upstate vs the nation), who is buying, what recently
traded, what moved through the county, rates, and one calibrated thing to watch. It is the
recurring artifact Alex hands his sphere ("want me to add you to the Monday brief?") and the
first concrete reason to subscribe to the owned email list. It took over the weekly slot from
Greenville Works (July 2026); the Works essays moved to an occasional/monthly cadence.

## Why it exists (the referral logic)

Referral revenue comes from loan officers, attorneys, agents, and investors thinking of Alex
when a lead appears. That audience does not want essays; it wants the week in one read. The
brief is scarce (nobody publishes this for the Upstate), recurring (weekly touch in their
inbox without asking for anything), and forwardable. The site's subscribe pitch becomes a
specific promise instead of "subscribe for updates."

## The editorial template (fixed sections, hard caps)

Every issue is the same shape, 600 to 900 words total, so a reader learns to scan it. Every
item is fact + source + one sentence of "so what." **A section with nothing real this week
says so in one line.** The no-filler rule is enforced by the editor pass; a padded brief dies
fast.

**Why this order (revised July 2026).** County commercial deeds lag closings by MONTHS, so
they can no longer carry a "this week" read (an early version led with sales that had recorded
in March, published in July). The brief now leads with what is genuinely FRESH (the residential
pulse and rates) and treats the deed data as the trend and the players, not this week's news.
The sections, in order:

0. **The week in one number** — the open, no heading. One lead stat and why it matters; it may
   come from any section (the pulse gap, a buyer pattern, a notable deed, a rate move).
1. **The Upstate vs the country** — the fresh, differentiated lead. Greenville's typical home
   value and rent with their year-over-year moves set beside the national figures, from the
   committed `src/data/greenvilleHousing.json` (Zillow ZHVI + ZORI, refreshed weekly). The
   Greenville-vs-national GAP stated as fact ("prices bid up faster than the nation while rents
   run cooler"), never as a verdict. This is the sentiment read; Alex supplies any opinion in
   review.
2. **Who's buying** — the proprietary spine, STANDING every week (not a fallback). From
   `src/data/commercialSales.json`: the active-buyer pattern flags (a `PURNAME` on its second or
   third purchase in the trailing year) PLUS one rotating aggregate cut of the 24-month dataset
   (top buyers of the quarter, dollar volume by month, price per acre year over year,
   property-type mix, or a corridor rollup, never repeating last week's), with the arithmetic
   shown and the honest limits stated. The most CoStar-like thing the brief publishes.
3. **What traded** — 2 to 4 notable individual deals from the same dataset, each with the
   denominator (per SF from `SQFEET`, per acre from `LOTSIZE`), buyer/seller, and its `SALEDATE`,
   opened with the recency caveat so nobody mistakes a months-old deed for this week's news.
4. **Around town** — the week's local development news: the notable Upstate real-estate,
   development, and business-expansion stories (a new or broken-ground project, a major-employer
   expansion, a big rezoning or approval, a capital move), pulled from local outlets plus official
   sources. The news-digest part of the brief. Every item cites its source; promoter figures are
   labeled CLAIM. The one section allowed to be `NOTHING REAL` in one line, though it rarely is.
5. **Rates and money** — short (2 to 3 numbers), because every reader sees rates elsewhere.
   Freddie Mac PMMS 30-year, the 10-year Treasury, any Fed action or upcoming meeting.
6. **What I'd watch** — one concrete, dated indicator worth watching and why, framed as what the
   reporting points to, never an invented personal verdict (Alex adds his own take in review).

Standing footer: the not-advice line, plus one quiet `/find-a-pro` sentence.

## The engine (`scripts/briefing/routine/`)

Mirrors the `scripts/tech/` pattern (orchestrator + cold, isolated passes) but simpler: no
scout and no angle pass, because the fixed format IS the angle.

- `orchestrator.md` — guards, then collector → writer → editor, then a DRAFT insert tagged
  `briefing` and the review packet email.
- `pass1_collector.md` — works the section checklist against TWO committed datasets plus web
  search. The residential pulse comes from `src/data/greenvilleHousing.json` (Zillow ZHVI + ZORI,
  Greenville vs national, built weekly by `.github/workflows/collect-housing.yml`); the
  who's-buying analysis and the recently-traded deals come from `src/data/commercialSales.json`
  (the county deed dataset, refreshed Sundays 22:00 UTC by
  `.github/workflows/collect-commercial.yml`; both collectors share the Sunday-evening slot so the
  data is fresh before the Monday run) with the per-SF / per-acre and repeat-buyer math; around-town
  projects, permits, and employer news, plus rates, come via web search. Outputs a sourced fact
  sheet with MUST-VERIFY and explicit `NOTHING REAL` markers (only Around town may be dry).
- `pass2_writer.md` — renders the fact sheet into the fixed template in house style, plus
  `## METADATA`, `## IMAGE`, and `## X` blocks.
- `pass3_editor.md` — audits against the fact sheet: every figure traced, the no-filler rule,
  per-unit math re-checked, fair housing, style, the not-advice footer, the `briefing` tag.
- `watchlist.md` — OPTIONAL steer file: ongoing items Alex wants tracked week to week. The
  collector reads it when present; empty or missing is fine.

## Guards (in the orchestrator)

- **Same-week dupe:** stop if a `briefing`-tagged row was created in the last 5 days.
- **Stale-draft backpressure:** stop if a briefing DRAFT is still awaiting review. A stale
  brief must die, not queue; the packet tells Alex to publish Monday morning or delete.

## Publish + broadcast flow (and the Monday timing fix)

Draft-first like the other engines: the run inserts a DRAFT, the packet carries the
`/review?id=..` link. But the daily finalize cron runs 09:00 UTC, so a brief published Monday
~12:00 UTC would not broadcast until Tuesday. Two-part fix, both in place:

1. The review packet carries the one-click broadcast link
   (`/api/broadcast?id=..&token=..`), so publish-then-send is two clicks in the same minute.
2. The daily finalize run moved from 09:00 to 13:00 UTC (`vercel.json`; Vercel Hobby caps a
   project at 2 crons, so one daily run does double duty as the Monday 9am ET backstop), and
   `/api/finalize-greenville` also matches the `briefing` tag.

Timeline: commercial data refreshes Sun 22:00 UTC (delay-tolerant) → cloud agent runs Mon ~08:00 UTC (4am ET)
→ packet in Alex's inbox by ~5am ET → he reviews with coffee, publishes and broadcasts by
8am ET.

## Site surfaces

- Tag `briefing` routes to **`/briefing`** via `sectionOf` in `src/lib/posts.ts` (internal
  `PostType` key `briefing`, section label "Briefing"). The index page is the public
  back-catalog that proves consistency to a new subscriber.
- Nav ("Briefing"), footer, sitemap, homepage feed all include it.
- Covers come from the same curated Greenville library (`## IMAGE` subject, default
  `downtown-falls`), filled by the finalize cron after publish.

## Cadence

- Brief: scheduled Claude cloud agent, **Mondays only**, ~08:00 UTC.
- Greenville Works: rescheduled from weekly to **monthly** (scheduler change, engine
  untouched).
- The `/real-estate` evergreen engine: unchanged.

## Distribution mechanics (the actual point)

List-building stays consent-clean via the existing double opt-in: Alex asks on a call,
submits the person's email at the form (or texts the link), they click confirm. The Monday
X post ships in each packet.

## Honest risks, named

- The brief creates a Monday-morning review obligation (~10 minutes, early). A skipped week
  self-heals (the guard blocks nothing next Monday), but two skips in a row is a signal to
  rethink the gate.
- Some weeks are thin. A 400-word honest brief is fine; the no-filler rule is the brand.
- The brief does not fix distribution by itself; it gives the calls a deliverable. The calls
  are still the job.
