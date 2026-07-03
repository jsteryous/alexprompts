# Lab topic bank

An OPTIONAL priority queue for the **Lab** engine (`scripts/tech/`), not a hard
dependency. Each entry is ONE thing AI or modern software can now do, worth taking
apart in a deep-dive that shows real understanding and says honestly where it still
falls short. This is the tech track of the two-track content plan: it exists to show a
hiring manager that Alex genuinely understands the technology and can translate a
capability into business value.

**The engine is self-sourcing.** Each run prefers the first topic still `queued` here,
so this file is how Alex STEERS what gets covered. When the bank is empty, the routine
scouts its own topic with web search (`routine/pass0_scout.md`) and keeps going, so it
never runs dry and needs no manual refill. After delivery it records the topic under
`## done` on the `drafts` branch so it is not repeated, and appends `proposed`
candidates (including the scout's runners-up) for Alex to promote. So seed a `queued`
topic when you want a specific one covered; leave it empty to let the engine choose.

## What makes a good topic (all five bars)

A topic earns a slot only if it clears all five:

1. **One concrete capability.** A specific thing, named plainly: a model feature, an
   agent pattern, a product's mechanism. Not "AI in general," not "the future of X."
2. **Groundable in real specifics.** You can point at the actual product, the real
   pricing, a real benchmark, or documented behavior, and check it. No vibes.
3. **A real, non-obvious limit.** There is something it genuinely cannot do yet, or a
   place it quietly breaks, that most write-ups skip. The honest-limits beat is the
   whole point; a topic with no interesting limit is a press release.
4. **Business value in a real vertical.** There is a concrete way it saves time or
   makes money for an actual business, ideally one you can name (use real estate as
   the worked example when it fits, since that is the applied vertical Alex knows).
5. **Not stale in a week.** It is about a capability, not a news cycle. A model
   version bump is fine to anchor on, but the piece has to be about what the thing
   can DO, not that it was announced.

## Voice reminder

The Lab is written in **Alex's own voice** (first person, curious, opinionated,
honest). This is deliberately NOT the objective third-person research voice of the
Saturday engine. See `scripts/tech/routine/pass3_writer.md`.

## queued

- **AI agents that take real actions (tool use / function calling), and where they
  still need a human.** Anchor: an assistant that can actually book, send, or update
  something, not just chat. Value: the front-desk and follow-up work in a small
  business. The limit: what happens when it is confidently wrong, and why you still
  gate the irreversible steps.
- **Retrieval over your own documents (RAG), in plain English.** Anchor: pointing a
  model at a company's own files so it answers from them instead of guessing. Value:
  a real-estate brokerage answering from its own contracts and disclosures. The limit:
  it still quotes the wrong paragraph confidently, and why chunking and citations
  matter more than the model.
- **AI that reads a contract and flags the risky clauses.** Anchor: a real document,
  a real clause. Value: the first-pass read before a professional looks. The limit:
  why "information, not legal advice" is not a disclaimer to wave off, it is the
  actual boundary of what the tool can be trusted to do.
- **Text-to-SQL and "talk to your data" tools.** Anchor: asking a database a question
  in English and getting a chart. Value: the non-technical operator who used to wait
  on an analyst. The limit: the join it silently gets wrong, and why you still need to
  see the query.
- **On-device vs cloud AI: what actually runs on your phone now.** Anchor: a specific
  on-device model. Value: privacy-sensitive work, offline use. The limit: the size and
  quality gap versus the frontier, stated with real numbers.

## proposed

(The routine appends candidates here with a one-line why and what-to-ground note.
Alex promotes the good ones to `queued`.)
