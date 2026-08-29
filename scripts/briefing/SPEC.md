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

## The editorial template (fixed sections, no word cap)

Every issue is the same shape, so a reader learns to scan it. **There is no word cap** (the old
600-to-900 range was dropped July 29, 2026): usefulness sets the length, and evidence is never cut
to hit a count. Every item is fact + source + one sentence of "so what." **A section with nothing
real this week says so in one line.** The no-filler rule is enforced by the editor pass and is the
only real length control; a padded brief dies fast, and so does one that dropped the number a reader
needed in order to stay short. A full week tends to land around 1,000 to 1,400 words, which is an
observation and not a target.

**Who it is written for (settled July 2026).** The reader is a person in the Upstate about to buy
or sell a home, plus the loan officers, closing attorneys, and agents who advise them. It is
written for the BUYER and the SELLER; the professionals read the same brief and forward it to
their own clients, which IS the distribution, so there is no second audience and no investor
audience. The test for every item is whether it changes how a person shops for, prices, or times
a house in Greenville County.

**Why this order (revised July 2026).** County commercial deeds lag closings by MONTHS, so
they can no longer carry a "this week" read (an early version led with sales that had recorded
in March, published in July). The brief now leads with what is genuinely FRESH (the residential
pulse and rates) and answers the reader's real question, WHERE, in the middle.
The sections, in order:

0. **The week in one number** — the open, no heading. One lead stat and why it matters; it may
   come from any section (a GGAR MLS figure, the pulse gap, a submarket spread or mover, an
   around-town item, a rate move).
1. **The Upstate vs the country** — the fresh, differentiated lead. Greenville's typical home
   value and rent with their year-over-year moves set beside the national figures, from the
   committed `src/data/greenvilleHousing.json` (Zillow ZHVI + ZORI, refreshed weekly). The
   Greenville-vs-national GAP stated as fact ("prices bid up faster than the nation while rents
   run cooler"), never as a verdict. This is the sentiment read; Alex supplies any opinion in
   review.
2. **Buyer or seller's market** — the **national comparison, and only that** (narrowed July 27,
   2026). Three to five sentences of PROSE, no bullets, leading on whichever Zillow market-vitals
   metric shows the widest Greenville-versus-national gap, each figure carrying the national number
   from the same series and its year-ago baseline. One sentence handles the instrument split
   (Zillow's modeled metro area versus the MLS's narrower territory, agreeing on direction and not
   magnitude), since the open already led on the GGAR MLS numbers. Closes with one factual line per
   side on what the numbers MEASURE (buyers read more inventory and longer days to pending as room
   to negotiate; sellers read fast pending times and near-asking sales as pricing still moving),
   stated as market mechanics, never as advice or a verdict. Never NOTHING REAL.
   *Why it narrowed:* it used to carry all five metrics as a dual-sourced five-bullet block, the
   densest thing in the brief. Once section 3 added the same metrics per ZIP, a reader met inventory
   three times (MLS, Zillow metro, then 19 ZIPs) and days to pending three times. The two sections
   now split by ALTITUDE: this one is Greenville versus the country, section 3 is the spread across
   the county, and a metric may appear in both only when each appearance answers a different
   question.
3. **Where the leverage is** — the proprietary spine, STANDING every week, and the section that
   most directly serves a real decision. The metro figures above say WHETHER the county is
   loosening; they cannot say WHERE, and where is the question a buyer actually has. From the
   `submarkets` block of `src/data/greenvilleHousing.json`, the same Zillow metrics one level down
   for every ZIP in Greenville County: the county SPREAD (the two ends plus the median across
   reporting ZIPs), the MOVERS (the ZIPs whose inventory and price-cut share moved most year over
   year), and ONE rotating angle (price band versus leverage, tightest and loosest, the city
   rollup, inside the city of Greenville, or where new supply landed, never repeating last week's),
   with the arithmetic shown. Every ZIP carries its town name; any ZIP flagged `thin` (under 25
   listings) may never be headlined. Nobody else publishes this for the Upstate.
4. **Around town** — the week's local development news: the notable Upstate real-estate,
   development, and business-expansion stories (a new or broken-ground project, a major-employer
   expansion, a big rezoning or approval, a capital move), pulled from local outlets plus official
   sources. The news-digest part of the brief. Every item cites its source; promoter figures are
   labeled CLAIM. The one section allowed to be `NOTHING REAL` in one line, though it rarely is.
5. **Rates and money** — short (2 to 3 numbers), because every reader sees rates elsewhere.
   Freddie Mac PMMS 30-year, the 10-year Treasury, any Fed action or upcoming meeting.
6. **What I'd watch** — one concrete, dated indicator worth watching and why, framed as what the
   reporting points to, never an invented personal verdict (Alex adds his own take in review).

Standing footer: the not-advice line, plus one quiet buy-or-sell invitation in Alex's first person,
with `/buying-or-selling` linked on the invitation words ("If this week has you thinking about buying or
selling around here, [let me know](/buying-or-selling)."). **NEVER EXPLAIN THE BUSINESS MODEL** (August 1,
2026): that line never says Alex will refer, match, connect, or introduce the reader to an agent,
never calls an agent vetted or hand-picked, never says the help is free or at no cost, and never
says Alex does not practice. It used to read "I connect people with vetted local agents at no
cost," which describes how Alex gets paid rather than what the reader is trying to do. See the root
`CLAUDE.md` strategic-direction note; the writer and editor passes both enforce it.

**What was CUT (July 2026), and why it stays cut.** Two commercial-deed sections, **Who's buying**
(repeat-LLC purchase patterns plus a rotating aggregate cut of the county deed file) and **What
traded** (individual notable deals with per-SF and per-acre math), used to sit where the submarket
section now is. Together they ran about a THIRD of the brief's length while containing nothing from
the week: the July 27, 2026 issue spent 2,772 of 8,041 characters citing an October 2025 portfolio
transfer, August 2025 buyer flags, and a newest deed dated March 23, 2026, and had to apologize for
the staleness twice in its own text. They existed because the ArcGIS scraper existed, not because
the reader wanted them, and a homebuyer does not care which entity bought a dental building last
August. `src/data/commercialSales.json` is untouched and still powers **`/tools/buyers-list`**,
which is the right home for complete-but-lagging data. Do not reintroduce a commercial section.

## The engine (`scripts/briefing/routine/`)

Mirrors the `scripts/tech/` pattern (orchestrator + cold, isolated passes) but simpler: no
scout and no angle pass, because the fixed format IS the angle. It does add one gate the essay
engines do not need: a dedicated VERIFIER between the writer and the editor, because a briefing
lives or dies on external figures (rates, votes, project numbers) being true, and no other pass
re-opens the source to check.

- `orchestrator.md` — guards, then collector → writer → verifier → editor, then a DRAFT insert
  tagged `briefing` and the review packet email. STEP 0B builds the COVERED LEDGER by recalling the
  last few PUBLISHED briefs from Supabase (the drafts-branch done-log was unreliable), so the
  collector can rotate the submarket angle and avoid re-serving around-town items across weeks.
- `pass1_collector.md` — works the section checklist against ONE committed dataset plus web
  search. The residential pulse, the five buyer-versus-seller market-vitals metrics (days to
  pending, inventory, new listings, price-cut share, sale-to-list ratio), AND the per-ZIP
  submarket read all come from `src/data/greenvilleHousing.json` (Zillow ZHVI + ZORI + vitals +
  `submarkets`, Greenville vs national, built weekly by
  `.github/workflows/collect-housing.yml`, Sundays 22:00 UTC so the data is fresh before the Monday
  run). The GGAR MLS monthly indicators are fetched live as the local source of record; around-town
  projects, permits, and employer news, plus rates, come via web search. Deduped against the
  COVERED LEDGER so it never re-runs last week's submarket angle. Outputs a sourced fact sheet with
  MUST-VERIFY and one explicit marker: Around town may be `NOTHING REAL`.
- `pass2_writer.md` — renders the fact sheet into the fixed template in house style, plus
  `## METADATA`, `## IMAGE`, `## X`, and `## CLIPS` blocks. Runs the CLIPPABLE TEST on the open and every section's first sentence
  (stands alone with the place and quantity named, under 200 characters, one main clause, a short
  source tag inside the clip and the methodology caveat in the next sentence) and general
  readability limits (break sentences over 35 words, one subordinate clause, active voice, concrete
  phrasing over index language), while still banning fragments, staccato, and dashes.
- `pass2b_verifier.md` — the truth gate. Independently re-opens every EXTERNAL web source (rates,
  around-town items, watch dates, any CLAIM figure), confirms or corrects each claim against the
  PRIMARY source (rates must resolve to Freddie Mac PMMS / FRED, not an aggregator), cuts what will
  not confirm, and appends a `## VERIFICATION LEDGER`. It does not re-derive committed-dataset
  VALUES (the editor re-does that arithmetic) but it does check how each is CHARACTERIZED (instrument
  named, geography honest, comparison same-source, as-of month present) and resolves every link.
- `pass3_editor.md` — audits against the fact sheet AND the verification ledger: every dataset
  figure traced, every rank/median/band average re-derived, no cut claim reappears, the no-filler
  rule, no commercial section, fair housing (now the brief's top legal risk, since the submarket
  section ranks named places weekly), style, the not-advice footer, the `briefing` tag. Passes the
  ledger through so the review packet can surface it as MUST-VERIFY.
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

Timeline: housing data refreshes Sun 22:00 UTC (delay-tolerant) → cloud agent runs Mon ~08:00 UTC (4am ET)
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
