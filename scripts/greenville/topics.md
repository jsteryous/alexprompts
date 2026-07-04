# Evergreen topic bank — the Greenville local-SEO track

This is the input to the Greenville routine's **evergreen track**. The routine has two
tracks and picks one per night:

1. **News track (`pass1_reporter.md` -> `pass2_sides.md` -> `pass3_writer.md`).** When there
   is a genuinely new, uncovered Greenville real-estate story, it explains it both-sides and
   publishes. This is timely and it ranks for about a week, then fades. It is our freshness
   and our vertical-proof signal.
2. **Evergreen track (this file -> `pass_evergreen.md`).** On the many nights with no real
   news (the reporter says most nights), the routine instead writes ONE substantial,
   data-grounded local resource piece from the bank below. This is the SEO library: it
   targets a real search query, it stays true and useful for years, and it compounds.

## Why this file exists (the strategy)

A brand-new domain cannot out-rank Zillow or the big brokerages on head terms like
"Greenville real estate," and it cannot out-rank TechCrunch on tech terms. What it CAN win,
inside a year or two, is **local, long-tail, low-competition queries with real buyer and
seller intent**. Those are the queries in this bank. Winning them does two jobs at once:

- It brings the only search traffic this site can realistically earn.
- That traffic carries the exact intent that feeds the referral goal. Someone searching
  "moving to Greenville SC neighborhoods" is a relocation lead, and every evergreen piece
  ends by pointing them to `/find-an-agent`.

The tech and Lab content is NOT an SEO play (it reaches hiring managers by direct link).
This bank is where the site actually competes for search.

## The three things that make search work here, and how this bank delivers them

1. **Target an actual query, evergreen not news.** Every topic below names the search phrase
   it is written to answer, and the phrase is one that people still type in a year.
2. **Be genuinely useful and specific, never thin.** Thin, generic, auto-generated filler
   HURTS rankings now, it does not help them. Each piece must be substantial, locally
   specific, and grounded in real numbers with sources. Depth is the moat. The writer pass
   enforces this hard.
3. **Own unique local data.** Where possible the piece leans on data this site already has or
   can pull that the portals do not surface the same way: Greenville County ArcGIS parcels
   and the commercial-sales dataset behind `/tools/buyers-list`, FHFA's Greenville-MSA house
   price index, Census ACS tract figures. Real numbers are what make a local page rank and
   earn trust.

## How the routine uses this file

1. On a night the news track finds NO NEW STORY and the evergreen cadence allows a run (see
   the orchestrator's cadence guard: at most about two evergreen pieces a week, so this is
   depth over volume, not a daily content mill), pick the FIRST topic under `queued` whose
   `target_slug` is NOT already published on the site (the orchestrator dedups against
   `blog_posts`).
2. Hand that topic to `pass_evergreen.md`, research it live, and write it.
3. Publish it exactly like a news post (tagged `greenville` so it routes to `/real-estate`,
   plus `evergreen` so the cadence guard can find it), with a lead-image LOCATION so the
   finalize cron renders a cover and broadcasts it.
4. The routine does NOT edit this file (the Greenville engine never writes to the repo).
   Dedup by `target_slug` against the live site is what prevents repeats. Alex prunes or
   reorders this bank by hand, and adds new topics under `queued`.

## What makes a good evergreen topic (all five bars)

- **Real search intent.** People actually type this. Favor relocation, neighborhood,
  cost-of-living, first-time-buyer, and local-investor phrasings over abstract musings.
- **Winnable.** Long-tail and local, not a head term the portals own. "North Main Greenville
  neighborhood guide" is winnable; "Greenville homes for sale" is not.
- **Evergreen.** Still true and useful in a year. Anchor numbers to a year and a source so a
  refresh is easy, but the piece must not be a this-week event.
- **Lead-relevant.** The reader could plausibly become a buyer or seller Alex can refer. The
  closer to relocation or a purchase decision, the better.
- **Answerable with real, local specifics.** There is enough concrete, sourceable local
  detail (neighborhoods, price ranges, commute times, school data, tax figures) to write
  something genuinely useful, not a generic template with the town name swapped in.

## Fair housing is non-negotiable on this track

Relocation and neighborhood content is a fair-housing minefield, more than news is. Familial
status, race, religion, national origin, disability, sex, and color are protected. So every
piece describes places by OBJECTIVE, FACTUAL attributes only: price ranges, housing stock and
age, walkability, commute times, amenities, park and trail access, published school ratings
as data. It NEVER steers a protected class, never implies who "belongs" or would "fit" in a
neighborhood, and never uses coded language ("good area," "safe for families," "up-and-coming"
as a demographic wink). Reframe any "best neighborhoods for families" style topic into the
objective attribute the reader actually wants (yards and square footage, top-rated schools by
the numbers, low commute). The writer pass enforces this and will rewrite a topic's framing to
comply. When in doubt, describe the housing and the facts, not the people.

---

## Topics

### queued

Ordered by value. Each entry: the working title, the `target_query` it is written to rank
for, a stable `target_slug` (dedup key and URL), the anchor and what makes it winnable, and
the data to ground it.

- **Moving to Greenville, SC: an honest neighborhood-by-neighborhood guide**
  - target_query: "moving to Greenville SC neighborhoods"
  - target_slug: `moving-to-greenville-sc-neighborhood-guide`
  - Anchor: the city plus the ring (North Main, West End, Augusta Road, Simpsonville, Greer,
    Mauldin, Travelers Rest, Five Forks). Why it wins: high-intent relocation query, and no
    single portal page answers it with an honest local read. Ground it: median price by area
    (Zillow/Redfin cited), commute-to-downtown minutes, what each area's housing stock and
    price actually is. Objective attributes only, no demographic steering.

- **The cost of living in Greenville, SC, with real numbers**
  - target_query: "cost of living in Greenville SC"
  - target_slug: `cost-of-living-greenville-sc`
  - Anchor: Greenville versus the national baseline and versus Charlotte, Asheville,
    Charleston. Why it wins: top relocation-research query, sits right before a home search.
    Ground it: Census ACS median household income and rent, property-tax rate, typical home
    price (FHFA Greenville MSA HPI), utilities, so it is numbers, not vibes.

- **North Main, Greenville: a neighborhood deep-dive**
  - target_query: "North Main Greenville SC neighborhood"
  - target_slug: `north-main-greenville-neighborhood-guide`
  - Anchor: North Main specifically (where Alex lives, no HOA), then a repeatable template
    for the next neighborhood piece. Why it wins: named-neighborhood long-tail is very
    winnable and high-intent. Ground it: housing stock and era, price range, walkability to
    downtown and Main Street, parks (McPherson, Bobby Pearse), the no-HOA character, all as
    facts.

- **Is now a good time to buy a house in Greenville, SC? How to think about it**
  - target_query: "is it a good time to buy a house in Greenville SC"
  - target_slug: `good-time-to-buy-greenville-sc`
  - Anchor: the local market, framed as a durable decision framework rather than a this-week
    call, so it stays evergreen. Why it wins: extremely common pre-purchase query. Ground it:
    FHFA Greenville MSA appreciation, local inventory and days-on-market context, current-rate
    caveat clearly dated. Not advice; a framework plus the honest limits.

- **Greenville vs. Charlotte vs. Asheville: which upstate-Carolinas city fits you?**
  - target_query: "Greenville SC vs Charlotte vs Asheville"
  - target_slug: `greenville-vs-charlotte-vs-asheville`
  - Anchor: the three cities relocators actually compare. Why it wins: comparison queries are
    high-intent and under-served by anyone honest. Ground it: home price, cost of living, job
    market size, commute and airport, on the numbers. Objective trade-offs, no steering.

- **First-time homebuyer in Greenville, SC: the steps, the costs, the local specifics**
  - target_query: "first time home buyer Greenville SC"
  - target_slug: `first-time-home-buyer-greenville-sc`
  - Anchor: the local process (SC transfer tax, typical closing costs, SC Housing programs,
    Greenville price points). Why it wins: durable how-to query with real buyer intent.
    Ground it: SC deed-recording fee, SC Housing down-payment assistance, realistic local
    price and payment math. Information, not financial advice.

- **Property taxes in Greenville County, explained for buyers**
  - target_query: "Greenville County SC property taxes"
  - target_slug: `greenville-county-property-taxes-explained`
  - Anchor: the county's assessment ratios (the 4% owner-occupied vs 6% rate is the thing
    outsiders get wrong) and how a bill is actually computed. Why it wins: specific, factual,
    repeatedly searched, and genuinely confusing to newcomers. Ground it: Greenville County
    Auditor/Assessor figures and millage, worked example.

- **Where to buy a rental property in Greenville: an investor's read**
  - target_query: "best areas to invest in real estate Greenville SC"
  - target_slug: `investing-rental-property-greenville-sc`
  - Anchor: the local investor lens, tied to the site's own commercial-sales data and the
    `/tools/deal-analyzer`. Why it wins: investor long-tail, and it cross-links the tools.
    Ground it: rent and price levels by area, the county ArcGIS/commercial dataset, cap-rate
    framing. Not investment advice; a framework and the limits.

### inbox (Alex's raw ideas)

Dump topics here freely. Promote the good ones to `queued`. Reply to a verify email with a
topic and it can land here.

(none yet)
