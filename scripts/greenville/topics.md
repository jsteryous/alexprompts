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
  `/find-an-agent`, the site's #1 conversion surface.

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
`target_query` it is written to rank for, a stable `target_slug` (dedup key and URL), the anchor and
what makes it winnable, and the data to ground it.

- **How to find a good real estate agent in Greenville, SC**
  - target_query: "how to find a real estate agent in Greenville SC"
  - target_slug: `how-to-find-a-real-estate-agent-greenville-sc`
  - Anchor: a genuinely useful buyer/seller guide to vetting an agent (what to ask, how commissions
    and referrals actually work, red flags), ending honestly at `/find-an-agent`. Why it wins: it is
    the closest-to-transaction query in the bank, and it maps one-to-one onto the referral offer.
    Ground it: the real questions to ask, how SC agency and referral fees work, what an agent does
    and does not do. Not a self-pitch, a real guide that earns the hand-off.

- **Moving to Greenville, SC from another state: relocation, cost, and commute math**
  - target_query: "moving to Greenville SC from out of state"
  - target_slug: `moving-to-greenville-sc-from-out-of-state`
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
    `/find-an-agent` for a listing agent. Information, not financial advice.

- **Is now a good time to buy a house in Greenville, SC? How to think about it**
  - target_query: "is it a good time to buy a house in Greenville SC"
  - target_slug: `good-time-to-buy-greenville-sc`
  - Anchor: the local market, framed as a durable decision framework rather than a this-week call,
    so it stays evergreen. Why it wins: extremely common pre-purchase query. Ground it: FHFA
    Greenville MSA appreciation, local inventory and days-on-market context, current-rate caveat
    clearly dated. Not advice; a framework plus the honest limits.

- **The cost of living in Greenville, SC, with real numbers**
  - target_query: "cost of living in Greenville SC"
  - target_slug: `cost-of-living-greenville-sc`
  - Anchor: Greenville versus the national baseline and versus Charlotte, Asheville, Charleston. Why
    it wins: top relocation-research query, sits right before a home search. Ground it: Census ACS
    median household income and rent, property-tax rate, typical home price (FHFA Greenville MSA
    HPI), utilities, so it is numbers, not vibes.

- **Greenville vs. Charlotte vs. Asheville: which upstate-Carolinas city fits you?**
  - target_query: "Greenville SC vs Charlotte vs Asheville"
  - target_slug: `greenville-vs-charlotte-vs-asheville`
  - Anchor: the three cities relocators actually compare. Why it wins: comparison queries are
    high-intent and under-served by anyone honest. Ground it: home price, cost of living, job market
    size, commute and airport, on the numbers. Objective trade-offs, no steering.

- **First-time homebuyer in Greenville, SC: the steps, the costs, the local specifics**
  - target_query: "first time home buyer Greenville SC"
  - target_slug: `first-time-home-buyer-greenville-sc`
  - Anchor: the local process (SC transfer tax, typical closing costs, SC Housing programs,
    Greenville price points). Why it wins: durable how-to query with real buyer intent. Ground it:
    SC deed-recording fee, SC Housing down-payment assistance, realistic local price and payment
    math. Information, not financial advice.

- **North Main, Greenville: a neighborhood deep-dive**
  - target_query: "North Main Greenville SC neighborhood"
  - target_slug: `north-main-greenville-neighborhood-guide`
  - Anchor: North Main specifically (where Alex lives, no HOA), then a repeatable template for the
    next neighborhood piece. Why it wins: named-neighborhood long-tail is very winnable and
    high-intent. Ground it: housing stock and era, price range, walkability to downtown and Main
    Street, parks (McPherson, Bobby Pearse), the no-HOA character, all as facts.

- **Where to buy a rental property in Greenville: an investor's read**
  - target_query: "best areas to invest in real estate Greenville SC"
  - target_slug: `investing-rental-property-greenville-sc`
  - Anchor: the local investor lens, tied to the site's own commercial-sales data and the
    `/tools/deal-analyzer`. Why it wins: investor long-tail, and it cross-links the tools. Ground it:
    rent and price levels by area, the county ArcGIS/commercial dataset, cap-rate framing. Not
    investment advice; a framework and the limits.

- **Property taxes in Greenville County, explained for buyers**
  - target_query: "Greenville County SC property taxes"
  - target_slug: `greenville-county-property-taxes-explained`
  - Anchor: the county's assessment ratios (the 4% owner-occupied vs 6% rate is the thing outsiders
    get wrong) and how a bill is actually computed. Why it wins: specific, factual, repeatedly
    searched, and genuinely confusing to newcomers. Lower in the queue because it is informational
    rather than close to a transaction. Ground it: Greenville County Auditor/Assessor figures and
    millage, worked example.

### inbox (Alex's raw ideas)

Dump topics here freely. Promote the good ones to `queued`. Reply to a verify email with a topic
and it can land here. Per-metro relocation follow-ups belong here once the template piece
(`moving-to-greenville-sc-from-out-of-state`) is live: "moving to Greenville from Atlanta,"
"...from Charlotte," "...from Florida," "...from the Northeast," "...from California."

(none yet)
