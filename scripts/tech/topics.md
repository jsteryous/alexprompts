# Greenville Works topic bank

An OPTIONAL priority queue for the **Greenville Works** engine (`scripts/tech/`), not a hard
dependency. Each entry is ONE thing reshaping Greenville and the Upstate, worth taking apart in a
deep-dive that shows how it actually works and what it means for where people live, work, and
invest. Scope is the physical and economic change of the place: development and new subdivisions,
roads and transportation, infrastructure (water, sewer, fiber, the power grid), utilities and
energy, manufacturing and big employers, data centers and the technology behind local change,
population growth, local business, and the government decisions that drive them. Technology counts
when it TOUCHES the Upstate (why a data center is sited here, how fiber gets installed, why a plant
automates, where the grid is strained). This is the local-change track: it exists to help a reader
understand the place they live, and to show that Alex can take a real system apart and explain what
it means.

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

## Voice reminder

Greenville Works is written in **Alex's own voice** (first person, curious, opinionated, honest).
This is deliberately NOT the objective third-person research voice of the Saturday engine. See
`scripts/tech/routine/pass3_writer.md`.

## queued

- **Why Greenville keeps widening the same roads, and why they fill back up.** Anchor: a specific
  named corridor (Woodruff Road, Wade Hampton, or a current SCDOT project). Stakes: commute times
  and where new subdivisions get approved. The tension: induced demand, and the fact that the
  developments a widening enables refill the road it was meant to unclog.
- **Where Greenville's electricity actually comes from, and whether the grid can keep up.** Anchor:
  Duke Energy's Upstate generation and load. Stakes: reliability and bills as population and data
  centers grow. The tension: the gap between new demand and new supply, and what fills it.
- **How water and sewer capacity quietly decides where Greenville can grow.** Anchor: a real
  Greenville Water or ReWa constraint or expansion. Stakes: which land can be developed and which
  cannot. The tension: infrastructure lags rooftops, and the cost of catching up lands on rates and
  new construction.
- **Why manufacturers keep choosing South Carolina, and what the Upstate trades for it.** Anchor: a
  named Upstate plant or expansion (BMW, an automotive supplier, a new site). Stakes: jobs, wages,
  and the housing demand a plant creates. The tension: incentives and infrastructure costs versus
  the tax base and jobs, and who actually gets the jobs.
- **How a subdivision actually gets approved in Greenville County, from rezoning to rooftops.**
  Anchor: a real recent approval and the process behind it. Stakes: where growth lands and what it
  does to nearby prices and schools. The tension: the gap between what a rezoning promises and what
  gets built, and how little say neighbors really have.
- **How fiber internet actually gets installed, and why some Upstate streets get it and others
  wait.** Anchor: a real Upstate fiber build or provider. Stakes: home values and remote-work
  viability by street. The tension: the economics of who gets wired first, and the households left
  on old copper.

## done

- **Why data centers are being built in the Upstate, and what they draw on.** done 2026-07-04
  (published: northmark-data-center-kohler-spartanburg-upstate-power). Anchored on NorthMark's
  ~$2.8B campus at the former Kohler plant in Spartanburg.

## proposed

(The routine appends candidates here with a one-line why and what-to-ground note.
Alex promotes the good ones to `queued`.)
