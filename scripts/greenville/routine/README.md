# Greenville Real Estate routine

A Claude routine that turns the week's biggest **Greenville, SC real-estate** story
into two finished pieces: a short Substack-style article and a 45 to 75 second
vertical video script for TikTok / YouTube Shorts. The editorial spine is **both
sides, no forced verdict**: explain what happened, give the consensus, steelman the
devil's advocate, then hand the reader the question.

It mirrors the `ai_news/routine/` pattern (an orchestrator plus isolated Opus
passes) but is leaner: three passes instead of six, because the output is a local
explainer, not a deep-dive.

## The pipeline

1. **`pass1_reporter.md`** — establishes the verified facts from the signal, finds
   the real publisher articles (the signal's Google News links are opaque
   redirects, so the reporter web-searches for the true source), separates
   CONFIRMED from REPORTED, and lists what a human must verify.
2. **`pass2_sides.md`** — picks the single fault line, then builds THE CONSENSUS and
   THE DEVIL'S ADVOCATE, both steelmanned, plus what would settle it and the
   reader's question. Takes no stance.
3. **`pass3_writer.md`** — renders the article and the video script in house voice
   (no em dashes, no fragments, plain English), with housing-specific guardrails
   (not investment/legal advice, fair-housing-safe language).

`orchestrator.md` wires them as cold sub-agents, reads the committed signal, recalls
last week's draft from the `greenville-drafts` branch (so it does not repeat a
topic), and delivers the draft to Google Drive + Gmail.

## Running it

The collector is scheduled by `.github/workflows/collect-greenville.yml` (Friday
08:00 UTC), which commits the signal to `scripts/greenville/data/`. The **routine**
runs as a scheduled Claude cloud agent (see the `/schedule` skill): point it at
`scripts/greenville/routine/orchestrator.md` and run it after the collector, e.g.
Friday or Saturday morning. The orchestrator's STEP 0 reads the committed signal.

To dry-run the collector locally (your home IP is not blocked):

```bash
cd scripts
python -m greenville.collect --limit 15
python -m unittest scripts.tests.test_greenville -v
```

## Guardrails (built into the passes)

- **Not advice.** No buy/sell/hold calls. Information only.
- **Fair housing.** Describe the property and the facts, never who a home is "right
  for." The writer pass bans family-status / demographic targeting language.
- **Attribution.** Every number traces to a real publisher article; the article
  ends with a source credit. The delivered draft leads with a MUST-VERIFY list.
