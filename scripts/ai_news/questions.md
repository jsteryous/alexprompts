# Question bank — the Saturday research engine

This is the input to the weekly routine. Each Saturday the routine picks ONE question
from here, has Claude research it hard against real public data (`sources.md`), and writes
one deep-dive in two renderings (a 6 to 10 minute video script and a Substack article).

The brand is "Alex Prompts": Claude is the visible method. The piece is openly "I pointed
Claude at this question, here is what the data actually says." The job is to make the
viewer genuinely smarter and able to act, not to react to the news.

## The mission (the north star)

Alex Prompts exists to **create more economic prosperity through real estate** and to
accelerate the initiatives that do it: smart city planning, sound individual and
institutional development, solar and cheaper energy, prudent investment. The anchor is
**Greenville**: the long game is helping it grow into a larger economic powerhouse, and
helping the people here (and Alex himself) make prudent, value-creating moves. So beyond
being merely interesting, favor questions whose honest answer could **drive a real
prosperity-creating action** by a homeowner, an investor, a developer, an institution, or
the city. Research that ends in "and therefore the smart move is X" beats research that
ends in a shrug. The takeaway is the point.

## How the routine uses this file

1. Pick the FIRST question still marked `queued` that is NOT already in the done-log (the
   `drafts` branch recall in orchestrator STEP 0B). That is this week's lead question.
2. Research and write it.
3. After delivery, mark it `done <YYYY-MM-DD>` here in the same commit that pushes the
   draft, so it is not repeated.
4. After each issue, the routine appends the 1 to 2 best follow-up questions the research
   surfaced (the why-chain leftovers) under `proposed`, with a one-line why and what data
   would answer it, and lists them in the delivery email. Only Alex promotes a `proposed`
   (or `inbox`) question to `queued`; the routine never leads with an unapproved one.

## What makes a good question (all five bars)

- **Useful.** A working agent, investor, developer, or city planner can act on the answer.
- **Answerable with real public data.** Not vibes. A primary source in `sources.md` (or a
  cited study) can move it from opinion toward evidence.
- **Non-obvious or contested.** The honest answer surprises people, or the "obvious" answer
  is wrong, or experts disagree. If everyone already knows it, skip it.
- **Decision-relevant.** The answer changes what someone builds, buys, holds, or votes for.
- **Evergreen.** It is still true and useful in a year. Not a this-week event.

Among questions that clear all five, prioritize by the mission: the answer could move real
money or policy toward prosperity (a prudent investment, a better development, a cheaper-
energy choice, a city initiative), it is anchored in a real local stake (a live North Main
or Greenville decision jumps the line), and it is timely by season (solar economics in
summer, assessments near tax time). Prioritize by value and stake, not first-in-first-out.

## The discipline (why this engine exists)

Toddler-level curiosity: keep asking "why" and "how" until you hit the real mechanism or an
honest "nobody actually knows." The number-one failure to avoid is a confident causal claim
pulled from correlational data. "HOA homes sell for more" is a selection effect (HOAs
cluster in newer suburban subdivisions), not proof that an HOA causes appreciation. Every
answer names its confounders and states how confident to be.

## Anchor in a real place or decision

Where the question allows, ground it in a concrete stake and then generalize: Greenville,
SC; the North Main neighborhood (where Alex lives, no HOA); a real deal or asset class an
agent or investor here actually faces. A piece anchored in "should North Main get an HOA"
beats an abstract "do HOAs add value" every time. Pull Greenville-MSA and South-Carolina
figures first (FHFA Greenville MSA series, Census tracts, Greenville County ArcGIS), then
widen to the national pattern.

## Replenishing the bank

Five seed questions is five weeks. The bank refills from four feeds, and the rule is simple:
the machine proposes, Alex disposes. Candidates pile up under `inbox` and `proposed`; only
Alex promotes them to `queued`.

1. **The research feeds itself (live now).** Every issue, the routine appends the best 1 to 2
   follow-up questions the research surfaced to `proposed`. These are pre-vetted: they came
   from real data and a real why-chain.
2. **Alex's own work and life (live now).** The most valuable feed, because it is anchored and
   authentic. Drop raw ideas under `inbox` below, or just reply to the Saturday draft email
   with a question. The North Main HOA question started here.
3. **Audience demand (next step).** What agents, investors, and developers actually ask:
   Reddit, BiggerPockets, YouTube comments, search autocomplete (see `demand.py`).
4. **Research and news, repurposed (next step).** A headline is a bad lead but a good question
   generator ("a disclosure law passed" becomes "do disclosure rules change buyer behavior?").
   New NBER/SSRN housing papers come pre-framed with data.

Feeds 1 and 2 run today. Feeds 3 and 4 are a planned lightweight mid-week harvester routine
that mines those sources and drops a scored batch into `proposed` for one-tap approval.

---

## Questions

### inbox (Alex's raw ideas)

Dump questions here freely, half-formed is fine. Promote the good ones to `queued`.

(none yet)

### queued

- **Do homes in HOA neighborhoods actually appreciate faster than homes without one, or do
  they just sell for a one-time premium?**
  Anchor: North Main (no HOA) versus comparable Greenville subdivisions that have one.
  Why it matters: Alex and his neighbors are weighing whether an HOA would help or hurt the
  community; the answer changes a real vote. The trap: separate the resale premium from the
  appreciation *rate*, and control for subdivision age, amenities, and buyer income before
  claiming the HOA did anything. Data: FHFA HPI by metro, Census ACS tract home values over
  time, the published HOA-premium studies (note their controls and their limits).

- **Which real-estate asset class has actually appreciated the most over the last 20 to 30
  years, once you account for leverage, vacancy, and maintenance, not just sticker price?**
  Anchor: what a Greenville investor could realistically buy (single-family rental, small
  multifamily, retail strip, land). Why it matters: it reframes "where do I put money."
  Data: FHFA HPI, FRED series (CRE price indexes, rents, cap-rate proxies), Census rental
  data; be explicit that headline price appreciation is not total return.

- **What actually adds the most value and tax revenue to a city per acre, and why do the
  highest-revenue uses so often look unglamorous?**
  Anchor: downtown Greenville and the Main Street corridor versus the big-box and
  parking-lot edges. Why it matters: developers and planners pick what gets built; the
  per-acre lens flips the usual intuition. Data: Greenville County ArcGIS parcel + assessed
  value, Lincoln Institute property-tax work, Strong Towns / Urban3 value-per-acre analyses
  (cite their method and its caveats).

- **Does rooftop and small-scale solar actually pay back for a homeowner, and does it raise
  the resale value of the house, or is the return mostly hype?**
  Anchor: a typical North Main / Greenville single-family roof, South Carolina sun and
  rates. Why it matters: Alex believes in solar, so steelman the skeptic hard and let the
  data resolve it, never advocate. Data: NREL/PVWatts production, EIA rates, DSIRE for SC
  incentives, the LBNL "Selling Into the Sun" home-value study (and what it does and does
  not control for).

- **What measurably separates a neighborhood that appreciates and stays livable over decades
  from one that stagnates? Walkability, schools, mix of uses, ownership rate, something
  else?**
  Anchor: compare two real Greenville neighborhoods on the same metrics. Why it matters: it
  is the question under "where should I buy or build." Data: Census ACS (income, ownership,
  commute), Walk Score, FHFA/Zillow appreciation by tract, school data; separate correlation
  from cause and name what is selection.

### done

(none yet)

### proposed

(the routine appends candidates here; Alex promotes them to `queued`)
