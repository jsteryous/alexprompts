# The claims file

Things people in the South Carolina market actually say, logged so the scout can test them.

**This is the highest-value file in the engine and it is the one only Alex can fill.** The scout
can find claims online, and it will, but a claim you heard at a closing from a broker who has
been listing in that submarket for a decade is better raw material than anything on a forum. It
is current, it is first-hand, and you can speak to the context around it. Two minutes of typing
after a conversation is worth more to this publication than an hour of scouting.

See "CLAIMS ARE RAW MATERIAL" in `routine/pass0_scout.md` and the same section in `SPEC.md`.

## Why claims are worth publishing at all

An opinion held by someone in this market is a fact about the market. A broker who believes a
submarket has turned is telling you something real about how the people setting prices are
behaving, whether or not the claim survives contact with the record. Both halves are worth
writing down: what is believed, and what is true.

## What makes a claim usable

A claim earns a slot here when all three are true. The scout enforces these, so a claim that
fails one is not wasted, it just will not be picked.

- **Genuinely held.** A real person said it, or it is a documented public statement. Never
  something invented so a piece has an easy target to knock down.
- **Falsifiable from public data.** Sale records, permits, deeds, assessed values, days on
  market, absorption, job postings, filings. If settling it would need MLS internals nobody can
  publish or a private company's books, it fails the ACCESS INDEPENDENCE gate.
- **Able to come out either way.** A claim you already know is wrong makes a smug piece. A claim
  the record CONFIRMS is a perfectly good finding and gets published as one.

Vagueness is the usual disqualifier. "The market is crazy right now" cannot be tested. "Anything
under 400k in Greenville County goes in a weekend" can.

## Format

Log it fast and rough. Precision is the researcher's job, not yours.

```
### The claim in one sentence
HEARD FROM: who, and how you know them (a name is fine, so is "a listing agent I have known
  five years"). Say if they would go on the record.
HEARD WHEN: approximate date
WHAT THEY MEANT: any context that sharpens it. What were they comparing against? What set them
  off? This is usually the part that makes the claim testable.
WHY IT MIGHT MATTER: one line on who would change a decision if this turned out to be wrong
STATUS: open | tested <date> | dropped <reason>
```

**Attribution rule for anything that gets published:** a named person only if they agreed to be
named. Otherwise characterize them honestly and usefully ("a broker who has been listing in this
submarket for a decade"), which is better sourcing than a name anyway, since it tells the reader
why the opinion carries weight. Never a strawman, never "some say."

---

## Open

### Greenville is becoming the luxury market. Land and home prices are just that expensive.
HEARD FROM: a fellow realtor
HEARD WHEN: approximately August 2026
WHAT THEY MEANT: not a claim about the very top of the market, but that ordinary Greenville
  inventory has repriced far enough that the whole market now behaves like a high-end one. The
  land cost was the specific thing they pointed at.
WHY IT MIGHT MATTER: it is a claim about the FLOOR, which is the part a developer underwrites
  against. If land per acre has moved but finished price points have not moved with it, the
  people repeating this are describing a margin squeeze rather than a luxury market, and those
  two readings imply opposite decisions.
TESTABLE WITH: sale price distribution over time rather than the median alone (the median can sit
  still while the shape underneath changes), share of sales above successive thresholds, land
  sales per acre from deed records, price points on new construction certificates of occupancy,
  and the same cuts for a comparison market so "expensive" has something to mean.
STATUS: open

## Tested

Move a claim here once a piece has run, with a one-line result and the piece slug. This becomes
a public scoreboard eventually, including the ones where the market turned out to be right.
