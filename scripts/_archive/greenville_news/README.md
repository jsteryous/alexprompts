# Retired: Greenville real-estate NEWS passes

These three passes drove the Greenville engine's old **daily both-sides NEWS** track, retired
July 2026. News ranked for a week then died, carried no buyer or seller intent, and demanded
live-publish spot-checking for little payoff. They were moved here from
`scripts/greenville/routine/` so they no longer sit beside the live evergreen passes (one of them,
`pass3_writer.md`, shared a filename with the LIVE Greenville Works writer at
`scripts/tech/routine/pass3_writer.md`, which was a footgun).

- `pass1_reporter.md` — the news reporter (what happened, plain English).
- `pass2_sides.md` — read the builders, then pressure-test; steelman the skeptic.
- `pass3_writer.md` — the both-sides news writer.

**Nothing here runs.** The live Greenville engine is single-track evergreen local-SEO
(`pass0_scout.md` → `pass_evergreen.md` → `pass_editor.md`). The news collector (`collect.py`) and
its `collect-greenville.yml` workflow are likewise unwired. Reversible: to revive the news track,
move these back and rewire the orchestrator, but the decision was that news is the wrong game for a
new domain chasing referral leads.
