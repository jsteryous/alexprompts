# Greenville Works topic bank

An OPTIONAL priority queue for the **Greenville Works** engine (`scripts/tech/`; user-facing
section label "SC Technology"), not a hard dependency. Each entry is ONE thing where TECHNOLOGY or
CAPITAL is reshaping SOUTH CAROLINA (statewide since July 2026; the Upstate is home turf and wins
ties, but a stronger Charleston, Columbia, or Lowcountry story takes the slot), worth taking apart
in a deep-dive that shows how it actually works and what it means for where people live, work, and
invest. That intersection, technology-and-money meeting real estate, IS the niche and the
differentiator; it is what makes this a complement to the real-estate track rather than a generic
local-news blog. The center of the scope: data centers (why they land here and what they draw on),
the power grid and energy, fiber and connectivity, manufacturing and automation at big employers,
the capital and incentive deals behind where investment goes, and property technology where it
touches buying, selling, or investing here. Roads, water and sewer capacity, subdivisions, and
government decisions are the SECONDARY, occasional beat, in scope only when the piece carries a real
technology, capital, or real-estate through-line (water and grid capacity as the true limit on where
data centers and housing can grow, not a generic civic explainer). This track exists to help a
reader understand the tech-and-capital forces remaking the place they live, and to show that Alex
can take a real system apart and explain what it means.

**The animating question behind every topic:** what actually leads to greater prosperity in South
Carolina, and which technologies help us get there? Public sentiment around these projects (data
centers, new plants, new development) often runs overwhelmingly negative, and that one-sidedness is
a SIGNAL, not a disqualifier: the topics where the popular read is loudest and least examined are
exactly where an honest ledger is scarce and valuable. The piece weighs both sides for real and,
where the evidence allows, says plainly whether the thing looks net good or net bad for the state,
and under what terms that answer would flip.

**The engine is self-sourcing.** Each run prefers the first topic still `queued` here, so this file
is how Alex STEERS what gets covered. When the bank is empty, the routine scouts its own topic with
web search (`routine/pass0_scout.md`) and keeps going, so it never runs dry and needs no manual
refill. After delivery it records the topic under `## done` on the `drafts` branch so it is not
repeated, and appends `proposed` candidates (including the scout's runners-up) for Alex to promote.
So seed a `queued` topic when you want a specific one covered; leave it empty to let the engine
choose.

## What makes a good topic (all five bars)

A topic earns a slot only if it clears all five:

1. **One concrete change.** A specific thing, named plainly: a real project, a real road, a real
   filing, a real employer, a real infrastructure limit. Not "growth in general," not "the
   economy," not "the future of Greenville."
2. **Groundable in real local specifics.** You can point at the actual project, the real budget,
   the real permit or dataset, the named place, and check it. No vibes.
3. **A real, non-obvious tension.** There is a trade-off, a cost, a loser, a constraint, or a way it
   could go wrong that most coverage skips. The honest-trade-offs beat is the whole point; a topic
   with no interesting tension is a press release.
4. **Real relevance to living, working, or investing here.** There is a concrete way it changes
   prices, commutes, taxes, jobs, bills, or where growth goes next, stated for real people.
5. **Not stale in a week.** It explains a durable system or shift, not a news cycle. A vote or a
   groundbreaking is fine to anchor on, but the piece has to be about how the thing works and what
   it means, not that it was announced.
6. **On the tech-or-capital-meets-real-estate intersection.** The best topics sit squarely there (a
   data center, the grid, fiber, automation, who is buying and why). A pure civic-infrastructure item
   (a road, a sewer study, a rezoning) earns a slot only when it carries a genuine tech, capital, or
   real-estate through-line, and it should be the exception. This bar is what keeps the track a
   differentiated complement to real estate instead of a general local blog.

## Voice reminder

Greenville Works is written in **Alex's own voice** (first person, curious, opinionated, honest).
This is deliberately NOT the objective third-person research voice of the Saturday engine. See
`scripts/tech/routine/pass3_writer.md`.

## queued

The spine is the tech-and-capital-meets-real-estate intersection (bar 6). Lead with these; the
civic-infrastructure items at the bottom are the occasional exception, and only with a through-line.

- **Are data centers more good than bad for South Carolina? Run the full ledger.** Anchor: a named
  campus (NorthMark's Spartanburg site or a newer filing), plus the state's longest-running
  precedent, Google's Berkeley County campus. Stakes: public sentiment on SC data centers is almost
  uniformly negative, so this piece runs the honest ledger both ways. The credit side: enormous
  property tax base per acre with almost no demand for county services (no school kids, little
  traffic), years of construction work, and an anchor load that can fund grid modernization if the
  tariff makes the data center pay its own way. The debit side: very few permanent jobs per
  incentive dollar, real water and land draw, and the big one, who pays for the new power, because a
  deal that socializes grid costs onto residential ratepayers turns the project into a subsidy, and
  V.C. Summer is why SC ratepayers do not extend trust here. The tension: the verdict is not
  general, it lives in the deal terms (the power tariff, the fee-in-lieu agreement, the cooling
  design), so the piece should say what a good deal looks like versus a bad one, not just that
  trade-offs exist.
- **Where Greenville's electricity actually comes from, and whether the grid can keep up.** Anchor:
  Duke Energy's Upstate generation, load growth, and interconnection queue. Stakes: reliability and
  bills as population and data centers grow. The tension: the gap between new demand and new supply,
  who funds the new capacity, and whether data-center load pushes costs onto ordinary ratepayers.
- **Why manufacturers keep choosing the Upstate, and what automation is doing to the jobs.** Anchor:
  a named plant or expansion (BMW, an automotive or EV supplier, a new site). Stakes: wages, the
  housing demand a plant creates, and how many people a modern automated plant actually employs. The
  tension: incentives and infrastructure costs versus the tax base, and automation quietly changing
  what "a plant brought X jobs" really means.
- **How fiber internet actually gets installed, and why some Upstate streets get it and others
  wait.** Anchor: a real Upstate fiber build or provider. Stakes: home values and remote-work
  viability by street. The tension: the economics of who gets wired first, and the households left
  on old copper while nearby streets see a connectivity premium.
- **Who is actually buying the Upstate, and with whose money.** Anchor: a real, checkable pattern
  (out-of-state buyers, institutional or build-to-rent operators, a named development's capital
  stack). Stakes: prices, rents, and what share of the market a local buyer is really competing with.
  The tension: separating the real signal from the "Wall Street bought your neighborhood" panic, and
  saying honestly where outside capital does and does not move the local market.
- **How property technology is changing buying and selling in the Upstate.** Anchor: a concrete,
  local hook (iBuyer activity here, an MLS or portal shift, an AI valuation tool applied to real
  Greenville listings). Stakes: what it changes for a buyer, a seller, and an agent locally. The
  tension: what the tool genuinely does well versus where it quietly fails on Upstate-specific
  ground, held without the "agents are obsolete" hype or the "it's a fad" dismissal.

Occasional civic-infrastructure beat (use sparingly, only with the tech/capital/real-estate hook):

- **How water and sewer capacity quietly decides where Greenville can grow.** Anchor: a real
  Greenville Water or ReWa constraint or expansion. Through-line: capacity as the true limit on where
  data centers AND housing can land, not a generic utilities explainer. The tension: infrastructure
  lags rooftops, and the cost of catching up lands on rates and new construction.
- **Why Greenville keeps widening the same roads, and why they fill back up.** Anchor: a specific
  named corridor (Woodruff Road, Wade Hampton, or a current SCDOT project). Through-line: the growth
  and development the widening enables, and what that does to land value and where building goes next.
  The tension: induced demand, and the fact that the developments a widening enables refill the road
  it was meant to unclog.

## done

- **Why data centers are being built in the Upstate, and what they draw on.** done 2026-07-04
  (published: northmark-data-center-kohler-spartanburg-upstate-power). Anchored on NorthMark's
  ~$2.8B campus at the former Kohler plant in Spartanburg.

## proposed

(The routine appends candidates here with a one-line why and what-to-ground note.
Alex promotes the good ones to `queued`.)
