# Evergreen topic bank — the Greenville local-SEO track

This is the input to the Greenville routine, which runs ONE track: an **evergreen local-SEO**
engine. On each cadence-eligible night it writes ONE substantial, data-grounded local resource
piece from the bank below (or, when the bank is empty, a topic it scouts itself). This is the
SEO library: each piece targets a real search query, stays true and useful for years, and
compounds. (The old both-sides NEWS track was retired July 2026; its passes remain in the repo,
unwired. Do not treat this file as feeding anything but the evergreen writer.)

## Why this file exists (the strategy)

**Referral revenue is the site's north star, and this bank is the lead engine.** A brand-new
domain cannot out-rank Zillow or the big brokerages on head terms like "Greenville real estate."
What it CAN win, inside a year or two, is **local, long-tail, low-competition queries with real
buyer and seller intent**. Those are the queries in this bank, and winning them does two jobs at
once:

- It brings the only search traffic this site can realistically earn.
- That traffic carries the exact intent that feeds the referral goal. Someone searching "moving
  to Greenville SC neighborhoods" or "how to find a real estate agent in Greenville" is a
  relocation or transaction lead, and every evergreen piece ends by pointing them to
  `/find-a-pro`, the site's #1 conversion surface.

Greenville Works (`scripts/tech/`) is a separate, lower-priority credibility track and is NOT the
SEO lead play. This bank is where the site actually competes for search that turns into referrals.

## Order the bank by LEAD VALUE, because the routine picks the first queued topic

The routine takes the FIRST `queued` topic not already published. So the order of this list is a
priority decision, and the priority is **proximity to a referral**. Put the pieces whose reader is
closest to needing an agent (choosing an agent, relocation from a specific metro, "is it time to
buy," selling) ABOVE the purely informational ones (property-tax mechanics). All of them are worth
writing; the ones nearer a transaction just get written sooner.

## The three things that make search work here, and how this bank delivers them

1. **Target an actual query, evergreen not news.** Every topic below names the search phrase it is
   written to answer, and the phrase is one that people still type in a year.
2. **Be genuinely useful and specific, never thin.** Thin, generic, auto-generated filler HURTS
   rankings now, it does not help them. Each piece must be substantial, locally specific, and
   grounded in real numbers with sources. Depth is the moat. The writer pass enforces this hard.
3. **Own unique local data.** Where possible the piece leans on data this site already has or can
   pull that the portals do not surface the same way: Greenville County ArcGIS parcels and the
   commercial-sales dataset behind `/tools/buyers-list`, FHFA's Greenville-MSA house price index,
   Census ACS tract figures. Real numbers are what make a local page rank and earn trust.

## This bank is OPTIONAL: the engine is self-sourcing

You do not have to keep this file full. It is a **priority queue for steering**, not a hard
dependency. On a cadence-eligible night the routine prefers the first `queued` topic here, and
**when the bank is empty it scouts its own topic with web search** (`routine/pass0_scout.md`), so
the evergreen track never runs dry and needs no manual refill. So: seed a `queued` topic when you
want a specific one covered next; leave the bank empty to let the engine choose. The scout emails
you its runners-up after a self-sourced run, so you can promote any you like into `queued` without
touching anything else.

## How the routine uses this file

1. On a cadence-eligible night (see the orchestrator's cadence guard: at most about two evergreen
   pieces a week, so this is depth over volume, not a daily content mill), pick the FIRST topic
   under `queued` whose `target_slug` is NOT already published on the site (the orchestrator dedups
   against `blog_posts`). If no queued topic remains, the scout self-sources one instead.
2. Hand that topic (from the bank or the scout) to `pass_evergreen.md`, research it live, and write
   it.
3. Publish it tagged `greenville` (so it routes to `/real-estate`) plus `evergreen` (so the cadence
   guard and dedup can find it), with a lead-image SUBJECT so the finalize cron renders a curated
   cover and broadcasts it to the owned list.
4. The routine does NOT edit this file (the Greenville engine never writes to the repo). Dedup by
   `target_slug` and title against the live site is what prevents repeats. Alex prunes, reorders,
   or refills this bank by hand whenever he wants to steer; otherwise the scout keeps it running.

## What makes a good evergreen topic (all five bars)

- **Real search intent.** People actually type this. Favor relocation, choosing-an-agent,
  cost-of-living, "is it time to buy," selling, first-time-buyer, and local-investor phrasings over
  abstract musings.
- **Winnable.** Long-tail and local, not a head term the portals own. "North Main Greenville
  neighborhood guide" is winnable; "Greenville homes for sale" is not.
- **Evergreen.** Still true and useful in a year. Anchor numbers to a year and a source so a refresh
  is easy, but the piece must not be a this-week event.
- **Lead-relevant.** The reader could plausibly become a buyer or seller Alex can refer. The closer
  to relocation or a purchase decision, the better, and the higher it belongs in the queue.
- **Answerable with real, local specifics.** There is enough concrete, sourceable local detail
  (neighborhoods, price ranges, commute times, school data, tax figures) to write something
  genuinely useful, not a generic template with the town name swapped in.

## Fair housing is non-negotiable on this track

Relocation and neighborhood content is a fair-housing minefield. Familial status, race, religion,
national origin, disability, sex, and color are protected. So every piece describes places by
OBJECTIVE, FACTUAL attributes only: price ranges, housing stock and age, walkability, commute times,
amenities, park and trail access, published school ratings as data. It NEVER steers a protected
class, never implies who "belongs" or would "fit" in a neighborhood, and never uses coded language
("good area," "safe for families," "up-and-coming" as a demographic wink). Reframe any "best
neighborhoods for families" style topic into the objective attribute the reader actually wants
(yards and square footage, top-rated schools by the numbers, low commute). Feeder-metro relocation
pieces ("moving from Atlanta") anchor on the origin city's cost and commute math versus Greenville,
never on who is moving. The writer pass enforces this and will rewrite a topic's framing to comply.
When in doubt, describe the housing and the facts, not the people.

---

## Topics

### queued

Ordered by LEAD VALUE (proximity to a referral), highest first. Each entry: the working title, the
`target_query` it is written to rank for, a stable `target_slug` (dedup key and URL), an optional
`tool` pairing, the anchor and what makes it winnable, and the data to ground it.

**Pair a piece to a tool where one fits (the `tool:` line).** The site's free tools
(`/tools/mortgage`, `/tools/property-tax`, `/tools/cost-of-living`, `/tools/deal-analyzer`,
`/tools/schools`, `/tools/buyers-list`) are an SEO and conversion edge a
content farm cannot copy: an interactive calculator on the page answers the reader's next question,
keeps them on the site, earns links, and is genuine unique value. When a topic names a `tool`, the
writer must link that tool inline once, where the reader would naturally reach for it (e.g. a payment
figure links to `/tools/mortgage`, a tax example to `/tools/property-tax`), never as a bolted-on CTA.
A topic without a clean tool fit simply omits the line.

- **How to find a good real estate agent in Greenville, SC**
  - target_query: "how to find a real estate agent in Greenville SC"
  - target_slug: `how-to-find-a-real-estate-agent-greenville-sc`
  - Anchor: a genuinely useful buyer/seller guide to vetting an agent (what to ask, how commissions
    and referrals actually work, red flags), ending honestly at `/find-a-pro`. Why it wins: it is
    the closest-to-transaction query in the bank, and it maps one-to-one onto the referral offer.
    Ground it: the real questions to ask, how SC agency and referral fees work, what an agent does
    and does not do. Not a self-pitch, a real guide that earns the hand-off.

- **How much house can I afford in Greenville, SC?**
  - target_query: "how much house can I afford in Greenville SC"
  - target_slug: `how-much-house-can-i-afford-greenville-sc`
  - tool: `/tools/mortgage` — the reader's very next move is to run their own income and down payment
    through the affordability calculator.
  - Anchor: turn a national "28/36 rule" explainer into a Greenville-specific one, with what today's
    rates and local prices mean for a real budget, then hand the reader the calculator. Why it wins:
    extremely high-volume pre-purchase query, the reader is close to a transaction, and the tool
    makes the page stickier than a text-only competitor. Ground it: FHFA Greenville MSA price level,
    Greenville County property-tax rate feeding the monthly number, a dated rate caveat, a worked
    affordability example. Information, not financial advice.

- **Moving to Greenville, SC from another state: relocation, cost, and commute math**
  - target_query: "moving to Greenville SC from out of state"
  - target_slug: `moving-to-greenville-sc-from-out-of-state`
  - tool: `/tools/cost-of-living` and `/tools/mortgage` — compare the origin metro's costs and see
    what a Greenville payment looks like.
  - Anchor: the interstate relocation decision (income-tax change, cost-of-living delta, what a home
    budget buys here versus a bigger metro), as a repeatable template for per-metro follow-ups
    (Atlanta, Charlotte, the Northeast, Florida, California). Why it wins: very high relocation
    intent, high volume, winnable long-tail, and it scales into a family of pieces. Ground it: SC
    income-tax and property-tax basics, FHFA Greenville-MSA price level, Census ACS cost figures,
    commute-to-downtown minutes. Origin-city math only, never who is moving.

- **Selling your house in Greenville, SC: what to expect, step by step**
  - target_query: "selling a house in Greenville SC"
  - target_slug: `selling-a-house-in-greenville-sc`
  - Anchor: the seller side (the bank is buyer-heavy), the local process and real costs. Why it
    wins: seller intent is a referral just like buyer intent, and this query is durable and
    under-served honestly. Ground it: typical days-on-market and price levels (Zillow/Redfin cited),
    SC seller closing costs and the deed-recording fee, commission and net-proceeds framing. Ends at
    `/find-a-pro` for a listing agent. Information, not financial advice.

- **Is now a good time to buy a house in Greenville, SC? How to think about it**
  - target_query: "is it a good time to buy a house in Greenville SC"
  - target_slug: `good-time-to-buy-greenville-sc`
  - tool: `/tools/mortgage` — pressure-test "wait vs buy" by running the payment at today's rate and
    price.
  - Anchor: the local market, framed as a durable decision framework rather than a this-week call,
    so it stays evergreen. Why it wins: extremely common pre-purchase query. Ground it: FHFA
    Greenville MSA appreciation, local inventory and days-on-market context, current-rate caveat
    clearly dated. Not advice; a framework plus the honest limits.

- **What does it actually cost to own a home in Greenville, SC each month?**
  - target_query: "monthly cost to own a home in Greenville SC"
  - target_slug: `monthly-cost-to-own-a-home-greenville-sc`
  - tool: `/tools/mortgage` and `/tools/property-tax` — the payment calculator plus the local tax
    estimator produce the reader's real all-in number.
  - Anchor: the true monthly nut beyond principal and interest (property tax at the 4% owner rate,
    homeowners insurance, HOA where it applies, PMI), with a worked example on a typical Greenville
    price. Why it wins: high-intent long-tail that budget-conscious buyers type, and it naturally
    threads two tools. Ground it: Greenville County millage and the 4% assessment ratio, a current
    SC homeowners-insurance range, FHFA/Redfin price level, a dated rate. Information, not advice.

- **The cost of living in Greenville, SC, with real numbers**
  - target_query: "cost of living in Greenville SC"
  - target_slug: `cost-of-living-greenville-sc`
  - tool: `/tools/cost-of-living` — let the reader run their own city against Greenville.
  - Anchor: Greenville versus the national baseline and versus Charlotte, Asheville, Charleston. Why
    it wins: top relocation-research query, sits right before a home search. Ground it: Census ACS
    median household income and rent, property-tax rate, typical home price (FHFA Greenville MSA
    HPI), utilities, so it is numbers, not vibes.

- **Cost of living: Greenville, SC vs. Atlanta**
  - target_query: "cost of living Greenville SC vs Atlanta"
  - target_slug: `cost-of-living-greenville-vs-atlanta`
  - tool: `/tools/cost-of-living` — the compare tool is the interactive backbone of the piece.
  - Anchor: the single highest-volume feeder metro (Atlanta) as a head-to-head, the template for the
    per-metro comparison family. Why it wins: Atlanta-to-Greenville is a real, heavy migration path,
    the comparison query is high-intent and under-served honestly, and it directly showcases the
    tool. Ground it: BEA regional price parities behind the tool, ACS rent and income for both metros,
    home-price levels, the income-tax difference (GA vs SC), commute and airport. Origin-city math
    only, never who is moving.

- **Greenville vs. Charlotte vs. Asheville: which upstate-Carolinas city fits you?**
  - target_query: "Greenville SC vs Charlotte vs Asheville"
  - target_slug: `greenville-vs-charlotte-vs-asheville`
  - tool: `/tools/cost-of-living` — anchor the money side of the comparison in the tool.
  - Anchor: the three cities relocators actually compare. Why it wins: comparison queries are
    high-intent and under-served by anyone honest. Ground it: home price, cost of living, job market
    size, commute and airport, on the numbers. Objective trade-offs, no steering.

- **First-time homebuyer in Greenville, SC: the steps, the costs, the local specifics**
  - target_query: "first time home buyer Greenville SC"
  - target_slug: `first-time-home-buyer-greenville-sc`
  - tool: `/tools/mortgage` — a first-timer needs the payment and affordability math right there.
  - Anchor: the local process (SC transfer tax, typical closing costs, SC Housing programs,
    Greenville price points). Why it wins: durable how-to query with real buyer intent. Ground it:
    SC deed-recording fee, SC Housing down-payment assistance, realistic local price and payment
    math. Information, not financial advice.

- **Closing costs for buyers in South Carolina, explained**
  - target_query: "closing costs in South Carolina for buyers"
  - target_slug: `closing-costs-south-carolina-buyers`
  - tool: `/tools/mortgage` — pair the one-time closing costs with the ongoing payment so a buyer
    sees both halves of "cash to close."
  - Anchor: the real line items a Greenville buyer pays at closing (SC deed-recording fee, lender
    fees, title and attorney, prepaid taxes and insurance, escrow), with a worked total on a typical
    price. Why it wins: durable, specific, high-intent buyer query, and SC's attorney-state closing
    differs from what out-of-state buyers expect. Ground it: SC recording-fee schedule, typical
    local title/attorney ranges, a worked example. Information, not financial advice.

- **Average rent in Greenville, SC (and what it means for buyers and investors)**
  - target_query: "average rent in Greenville SC"
  - target_slug: `average-rent-greenville-sc`
  - tool: `/tools/deal-analyzer` — an investor drops the rent and price in to see cash flow and cap
    rate; a renter weighs rent vs a payment.
  - Anchor: current rent levels by bedroom count and by area, framed for both the rent-vs-buy reader
    and the investor. Why it wins: high-volume query with two distinct high-intent audiences, and it
    feeds the investor tool. Ground it: Census ACS median gross rent, HUD fair-market rents for the
    Greenville MSA, area rent ranges with sources, dated. Not investment advice.

- **How to analyze a rental property in Greenville, SC**
  - target_query: "how to analyze a rental property Greenville SC"
  - target_slug: `how-to-analyze-rental-property-greenville-sc`
  - tool: `/tools/deal-analyzer` — the walkthrough teaches the exact inputs the calculator uses.
  - Anchor: a plain-English walkthrough of cash flow, cap rate, and cash-on-cash on a real Greenville
    example, teaching the reader to run their own deal in the tool. Why it wins: investor how-to
    long-tail, low competition, and it is the natural landing page for the deal analyzer. Ground it:
    a worked local example (price, rent, taxes at the 6% non-owner ratio, insurance, vacancy), the
    county tax math, honest caveats. Not investment advice; a framework and its limits.

- **Where to buy a rental property in Greenville: an investor's read**
  - target_query: "best areas to invest in real estate Greenville SC"
  - target_slug: `investing-rental-property-greenville-sc`
  - tool: `/tools/deal-analyzer` and `/tools/buyers-list` — run the numbers, and see who is actually
    buying locally.
  - Anchor: the local investor lens, tied to the site's own commercial-sales data and the
    `/tools/deal-analyzer`. Why it wins: investor long-tail, and it cross-links the tools. Ground it:
    rent and price levels by area, the county ArcGIS/commercial dataset, cap-rate framing. Not
    investment advice; a framework and the limits.

- **Who is buying commercial property in Greenville County right now?**
  - target_query: "who is buying commercial real estate Greenville SC"
  - target_slug: `who-is-buying-commercial-property-greenville-sc`
  - tool: `/tools/buyers-list` — the piece is the narrative front door to the site's unique
    commercial-sales dataset.
  - Anchor: what the public county commercial-sales record shows about recent buyers, prices, and
    active corridors, pointing the reader to the live buyers-list tool. Why it wins: genuinely unique
    data the portals do not surface this way, so it is defensible and link-worthy, and it draws
    investor and seller intent. Ground it: the Greenville County ArcGIS commercial-sales dataset
    behind `/tools/buyers-list`, named corridors and recent transactions, dated. Not investment
    advice.

- **North Main, Greenville: a neighborhood deep-dive**
  - target_query: "North Main Greenville SC neighborhood"
  - target_slug: `north-main-greenville-neighborhood-guide`
  - tool: `/tools/schools` and `/tools/property-tax` — look up the attendance zone and estimate the
    tax bill for a North Main price.
  - Anchor: North Main specifically (where Alex lives, no HOA), then a repeatable template for the
    next neighborhood piece. Why it wins: named-neighborhood long-tail is very winnable and
    high-intent. Ground it: housing stock and era, price range, walkability to downtown and Main
    Street, parks (McPherson, Bobby Pearse), the no-HOA character, all as facts.

- **How to find which school a Greenville, SC address is zoned for**
  - target_query: "Greenville SC school zone by address"
  - target_slug: `greenville-sc-school-attendance-zone-lookup`
  - tool: `/tools/schools` — the piece exists to route the reader into the honest school-zone
    launcher.
  - Anchor: a factual how-to on finding the assigned elementary, middle, and high school for an
    address (the official Greenville County Schools locator), and how attendance zones and choice
    work. Why it wins: high-volume, high-intent relocation query, and it is the natural home for the
    schools tool. Ground it: the GCS attendance-zone locator, how zones and magnet/choice enrollment
    work, dated. FAIR HOUSING: describe the lookup and the process only, state ratings as published
    data if at all, never imply who a school or area is "for."

- **How to compare Greenville County school ratings honestly**
  - target_query: "Greenville County school ratings"
  - target_slug: `greenville-county-school-ratings-how-to-compare`
  - tool: `/tools/schools` — send the reader to look up and compare specific schools themselves.
  - Anchor: what school ratings (state report cards, GreatSchools) do and do not measure, and how to
    read them without over-trusting a single number, pointing to the tool to look up specifics. Why
    it wins: durable relocation query, and reframing it as "how to compare" keeps it useful and
    fair-housing-safe. Ground it: SC school report-card methodology, what the scores capture, dated.
    FAIR HOUSING: ratings as data only, never as a proxy for who belongs; talk about the schools and
    the metrics, not the people.

- **Property tax on a $400,000 home in Greenville County: a worked example**
  - target_query: "Greenville County property tax on a $400,000 house"
  - target_slug: `property-tax-400k-home-greenville-county`
  - tool: `/tools/property-tax` — the reader plugs in their own price and residency status.
  - Anchor: a step-by-step calculation of an actual bill (assessed value at the 4% owner-occupied
    ratio, times millage, minus applicable credits), then the same at the 6% non-owner ratio, so the
    difference is concrete. Why it wins: specific-number long-tail that people really search, and it
    lands directly on the tax tool. Ground it: Greenville County Auditor millage and assessment
    ratios, the owner-occupied vs non-owner difference, current-year figures dated.

- **Property taxes in Greenville County, explained for buyers**
  - target_query: "Greenville County SC property taxes"
  - target_slug: `greenville-county-property-taxes-explained`
  - tool: `/tools/property-tax` — the explainer's companion estimator.
  - Anchor: the county's assessment ratios (the 4% owner-occupied vs 6% rate is the thing outsiders
    get wrong) and how a bill is actually computed. Why it wins: specific, factual, repeatedly
    searched, and genuinely confusing to newcomers. Ground it: Greenville County Auditor/Assessor
    figures and millage, worked example.

- **The 4% legal residence exemption in Greenville County (and how to get it)**
  - target_query: "Greenville County 4 percent legal residence exemption"
  - target_slug: `greenville-county-4-percent-legal-residence-exemption`
  - tool: `/tools/property-tax` — show the dollar difference between the 4% and 6% ratios on a real
    price.
  - Anchor: what the owner-occupied 4% assessment ratio is, who qualifies, how and when to apply, and
    the real dollars it saves versus the default 6%. Why it wins: narrow, high-intent, repeatedly
    searched by new SC homeowners, and almost no one explains it plainly. Ground it: the SC legal
    residence statute, the Greenville County application and deadline, a worked savings example, dated.
    Information, not tax advice.

### inbox (Alex's raw ideas)

Dump topics here freely. Promote the good ones to `queued`. Reply to a verify email with a topic
and it can land here.

Per-metro relocation and cost-comparison follow-ups (each pairs to `/tools/cost-of-living`, and to
`/tools/mortgage` for the payment side). Promote once the template piece
(`moving-to-greenville-sc-from-out-of-state`) and the first comparison
(`cost-of-living-greenville-vs-atlanta`) are live:

- "moving to Greenville SC from Charlotte" / "cost of living Greenville vs Charlotte"
- "moving to Greenville SC from Florida" (Tampa, Orlando, Miami)
- "moving to Greenville SC from the Northeast" (New York, New Jersey)
- "moving to Greenville SC from California"
- "moving to Greenville SC from Atlanta" (companion to the comparison piece above)

Other tool-paired ideas worth developing:
- "rent vs buy in Greenville SC" -> `/tools/mortgage` + `/tools/deal-analyzer`
- Neighborhood deep-dives on the North Main template (each -> `/tools/schools` + `/tools/property-tax`):
  Augusta Road, Five Forks/Simpsonville, Travelers Rest, the Woodruff Road corridor, Greer, Mauldin.
- "Greenville SC home insurance costs" -> `/tools/mortgage` (feeds the monthly-cost number).
