# The publication — spec

> **Status: FOUNDING SPEC. Rewritten August 12, 2026** around the COMPANY beat, replacing the
> first draft of this file (same date), which was built on an accountability beat, going back
> and checking announced promises against the record. Alex read that plan and said it was not
> interesting to him and that he would rather the beat be **business**, with real estate as a
> bonus rather than a requirement. That criterion is decisive and is not a preference to be
> argued with: he writes and edits this for years, and a newsletter written by someone bored
> with the beat is a bad newsletter no matter how well it scores on paper.
>
> It supersedes `scripts/briefing/SPEC.md` and `scripts/tech/routine/README.md` as the
> definition of what gets written. The engine EVOLVES from `scripts/tech/` rather than
> starting fresh (see "The engine"). The publication is deliberately UNNAMED until three or
> four issues exist; naming it now would name something described but not yet made.

## What it is

One publication, written by Alex, about **the South Carolina economy, explained through its
companies.**

Local business coverage in this state announces things. A company is expanding, three hundred
jobs, a ribbon cutting, a rendering. Almost nobody writes what the company actually does, how
it makes money, who its customers are, why it sits where it sits, or what would break it.

## The question every issue answers

**How does this company actually make money, and what would break it?**

That is the beat. Not a profile. The machine underneath.

Three parts of it are reliably more interesting than a reader expects. **What they actually
sell** is usually stranger than the public story (the well-known product is often not where
the money is). **Who pays and why they keep paying** is rarely obvious, and it is where
switching costs, contracts, and lock-in live. **Why here** is where Alex's real estate
knowledge stops being decoration and becomes analysis: the site, the footprint, the
incentives, the port, the labor shed.

### Why this beat and not the alternative

The live alternative was a governor's-desk brief on the state's economy, structural issues
sector by sector. Companies won on every axis:

- **Producible alone.** Public filings, job postings, pricing pages, permits, deeds, incentive
  agreements, headcount, customer lists. Researching how a company works is the discovery
  process Alex ran for eight years in BD and sales, and it is a genuine edge over local
  business reporters who do not have that training. Structural economic analysis needs either
  proprietary data or heavy synthesis, and it runs into the same objection Alex correctly
  raised against deal underwriting: claiming to know what is blocking the state's growth
  requires standing he does not have yet, and faking it is fatal with this reader.
- **It does not repeat.** Every issue is a new subject with a new model. The economy beat is
  about eight recurring topics and starts eating itself within a year.
- **Original numbers fall out naturally.** Revenue per employee, incentive dollars per job,
  square footage per worker, growth implied by open roles, what a company's SC footprint is
  worth. Nobody computes these locally.
- **The subject is a distribution channel.** A good, fair explainer gets shared by the
  company's own executives and employees, because almost nobody has ever explained their
  business well in public. Economy pieces have no such constituency. Distribution is the
  actual bottleneck (three subscribers), and this is the only version with organic spread
  built into the subject matter.
- **It creates a real reason to call executives**, who are exactly the people who relocate,
  buy, and know others doing the same. Not a pretext, since the piece is genuinely being
  written.
- **Lower risk.** Explaining how a business makes money is a different legal posture than
  alleging one failed to deliver, and it avoids the drift into policy opinion that the economy
  beat invites.

## The reader

**A professional whose living depends on knowing the market**: the loan officer, the closing
attorney, the agent, the banker, the developer, the person in economic development. Settled
August 12, 2026 and unchanged by the beat rewrite.

The choice governs everything else:

1. They are genuinely served by STATEWIDE work.
2. **They forward it to their clients, which is the distribution.** The buyer arrives through
   the professional rather than directly, which is slower than an SEO funnel and far more
   durable.
3. They are Alex's sphere, and warm introductions from that sphere close at roughly 30 to 40
   percent against about 4 percent cold.
4. There are few enough of them in South Carolina that reaching most of them is achievable.

The companies covered are these readers' prospects, borrowers, and the employers behind their
buyers, which is why a business beat serves them better than a housing-stats beat did.

**What we gave up:** direct buyer leads from content. That path ran through search, and search
is gone (zero-click, AI Overviews). Do not try to serve both readers.

## The quality bar

Three tests, all three required:

- **NEW.** Did not exist before this issue.
- **SCARCE.** Required work a reader could not casually replicate.
- **CONSEQUENTIAL.** Changes a decision or a belief the reader actually holds.

The August 2026 Upstate Briefs scored zero for three, which is why they were not worth
reading. See memory `brief-cadence-data-mismatch`.

### The one hard rule

**Every issue produces at least one number that did not exist before you computed it.**

It is the thing a language model cannot generate without you, so it is structurally immune to
synthesis. It is the fact that gets forwarded. It makes you the ORIGIN rather than an
aggregator, which is how you get cited by answer engines. And it forces real work, because you
cannot compute an original number without having gathered the inputs.

The engine already carries the mechanism: THE ARITHMETIC RULE in `pass1_researcher.md`. Every
input separately sourced, the steps shown, the result labeled a calculation and never as
though an agency published it, and every calculated figure auto-added to MUST-VERIFY.

### Two disciplines that keep it from becoming a press release

**"What would break it" is MANDATORY.** You cannot write that sentence from a company's About
page. It is the gate that forces real work, and it is what makes an executive respect the
piece instead of filing it as PR. A draft that cannot answer it is killed, not softened.

**Access is a bonus, never a dependency.** Every piece must be fully answerable from public
sources. The moment the beat requires someone to call back, it stalls the first time somebody
does not, and the temptation is to run something soft to fill the gap. Interviews improve a
piece; they may never be load-bearing.

## Tone

Tone is not word choice, it is the relationship. **You are not smarter than the reader. You
are the one who went and looked.** You read the filings, you counted the job postings, you are
reporting back.

- **Understate everything.** "The road was never built" beats "Shockingly, the road was NEVER
  built." Let the fact do the work and let the reader supply the reaction.
- **Specificity is the humor.** Not jokes, details. "A dentist from Charlotte" is funny. "An
  out-of-state investor" is nothing. Almost everything that reads as wit is precision.
- **Stop one beat early.** Explaining the punchline is the most common way good material dies.
- **Have opinions and say them plainly.** A narrator who never evaluates is furniture.
- **Be visibly curious.** "I did not expect this" is one of the best sentences in nonfiction.
- **Vary rhythm in both directions.** Long, long, then four words.
- **Start in the middle.** No throat-clearing, no scene-setting, no summary of what is coming.
- **Let the documents talk.** Quote the actual line from the filing or the job posting, then
  say nothing after it.
- **Use ratios.** "$340,000 per job, more than the median house in Greenville County."
  Arithmetic lands harder than any adjective.

### Three inherited rules that CHANGE here

1. **Contractions are ALLOWED in article prose.** The site's uncontracted rule stays for `src/`
   chrome, nav, and headlines. In prose it is a straitjacket, and the August 3 brief broke the
   rule constantly and is the best-written thing any engine has produced.
2. **The clippable-lead rule INVERTS.** It required the opening sentence to be a stat
   engineered for excerpting, which guaranteed a boring lead every issue. The first sentence
   is now the most INTERESTING sentence, not the most quotable one.
3. **The no-verdict rule is DEAD.** "A buyer reads it this way, a seller reads it that way" is
   the both-sides mush that emptied the briefs. A piece arrives somewhere.

### Unchanged

No em or en dashes. No sentence fragments. Colons sparingly, never as a drumroll. Plain
language. No banned fluff. Never narrate the process (`scripts/CLAUDE.md`, August 3, 2026). A
link opens a page, never a download (August 10, 2026). One caveat per section. State a figure
once.

## Serial mechanics

You are not publishing issues, you are running a **serial**. Nobody subscribes to good
articles; people subscribe to a continuing story where they know the cast.

- **A recurring cast.** The same funds, executives, employers, and site selectors keep
  appearing. Name them, and every appearance carries the weight of the previous ones.
- **A running observation, discovered and never designed.** When twenty companies in,
  something keeps rhyming, name it. It must be earned by evidence.
- **Calls on the record, graded in public.** "I don't think this line of business survives the
  next contract cycle. Check me in eighteen months." Then check, including the misses.
- **One living artifact.** A running index of South Carolina companies covered, what each
  actually sells, and what would break it. It grows every issue and eventually gets cited.
  The engine's existing VERDICT LEDGER in `topics.md` is the seed.
- **The reader as accomplice.** Ask for tips and documents. At a list size of three,
  converting readers into contributors matters more than growth.

**The test for every issue:** at least once, the reader should feel like they are in a room
they should not be in. That feeling is why people forward things.

## Cadence

**Target every two weeks. Publish on finding. Never publish to fill a slot.**

Monthly is too slow to build a habit from a standing start. Weekly is what destroyed the
brief. A professional audience tolerates irregular excellence far better than a consumer
audience does.

**A thin period means no issue.** This rule is the entire quality mechanism, and it only works
if there is no scheduled slot demanding to be filled. It must be enforced in the orchestrator,
not in intention: see the KILL-EXITS-CLEAN requirement below.

## What this is NOT

- **No fixed template.** The brief's fixed sections were a filler generator; every issue had
  to fill every section whether or not anything happened in it. The finding sets the shape.
  The four recurring concerns (what they sell, who pays, why here, what breaks it) are
  ANALYTICAL obligations, not headings to fill in order.
- **No conversion close on every piece.** A referral CTA under a business explainer reads like
  an ad stapled to a documentary and spends the authority that made the piece work. The
  standing quiet line lives in the FOOTER and site chrome. A real invitation appears only
  where the piece genuinely touches a transaction decision, which will be a minority.
- **No extraction optimization.** Ignore 40-to-80-word answer blocks, FAQ schema, and
  structure-for-AI-citation advice. That is real guidance for a publisher with ten thousand
  pages chasing citation share; applied to a one-person publication with a voice it destroys
  the thing worth reading.
- **No how-to, definitional, or evergreen guides.** The category hit hardest by zero-click
  search and the weakest for this reader.
- **No press-release profiles.** See the two disciplines above.

## The legal gate

Lower risk than the accountability beat it replaced, but not zero, and it needs to exist in
the editor pass BEFORE the first issue ships.

- Every characterization anchors to a document. "They posted 40 engineering roles in six
  months" is bulletproof. "They are struggling to hire" is an inference stated as fact.
- **Never assert private financials you cannot source.** Revenue, margin, and debt for a
  private company are estimates unless filed. Label an estimate as an estimate, show the
  method, and never round an estimate into a fact.
- **"What would break it" is STRUCTURAL analysis, never a prediction of failure.** Customer
  concentration, a single input, a contract cycle, a technology shift. Name the mechanism and
  the condition; do not forecast a company's death.
- Promoter and economic-development figures stay labeled CLAIM.
- Where the subject disputes something, say so in the piece.
- Fair housing still applies in full to anything neighborhood-level.

## The engine

Evolve `scripts/tech/` rather than building fresh. Its August 2026 rework already carries the
question-first architecture, the shape-based question generator, the prior-testing frame, THE
ARITHMETIC RULE, the calibrated verdict, the compounding ledger, and the no-narration
guardrails. The generator pattern (cross an INVENTORY against SHAPES) carries over exactly;
only the inventory and the shapes are replaced.

1. **`companies.md`, a new inventory** replacing `systems.md` as the scout's raw material.
   South Carolina companies worth taking apart: major employers, quiet giants, the ones
   attached to a recent capital move, the ones nobody can explain. Alex can seed it; the scout
   must also be able to harvest candidates so it never runs dry.
2. **Six new question SHAPES** in `pass0_scout.md`, replacing the five infrastructure shapes.
   Each is a genuinely different analytical question, so one company supports several pieces
   across years, which is what keeps the generator from draining:
   - **THE REVENUE QUESTION** — what do they actually sell? The obvious answer is often wrong.
   - **THE CUSTOMER QUESTION** — who pays, and why do they keep paying?
   - **THE CONSTRAINT** — what physically or economically caps their growth?
   - **THE BREAK** — concentration, a single input, a contract cycle, a technology shift.
   - **WHY HERE** — the site, the incentives, the port, the labor shed. Real estate lives here.
   - **THE QUIET GIANT** — enormous or critical, and nobody has heard of them.
3. **Two new gates**, alongside the existing FEASIBILITY and PREMISE gates:
   - **ACCESS INDEPENDENCE.** If the question cannot be answered from public sources, it fails
     before production. This is what prevents a stalled pipeline and the soft filler that
     follows one.
   - **THE BREAK GATE.** If the shape cannot reach a defensible "what would break it," kill it.
4. **A verifier pass**, ported from `scripts/briefing/routine/pass2b_verifier.md`, the
   best-built pass in the repo. Reshape it: the briefing version splits committed-dataset
   figures from external web claims, and here every claim is external, so the whole draft is
   in scope.
5. **The legal gate** above, in `pass4_editor.md`.
6. **The tone changes** in `pass3_writer.md`, plus the three rule reversals.
7. **KILL EXITS CLEAN, in the orchestrator.** The engine runs on a schedule and the spec says
   publish on finding. Those are in direct tension and the resolution has to be in code. A run
   that hits a kill condition must exit silently: no draft, no review email, no fallback to a
   lesser topic. The kill conditions exist (UNANSWERABLE, FALSE PREMISE, THIN, plus the two new
   gates); what needs checking is that the orchestrator does not degrade to something
   publishable. If it degrades, the brief's failure mode returns with better prose.
8. **Cadence guard** relaxed from 6 days to the new target.

## What gets retired

Nothing is deleted; published work keeps its URLs.

- **`scripts/briefing/`** stops producing. The five published briefs and `/briefing` stay up,
  linked from the footer under "Archives".
- **`scripts/greenville/`** evergreen track stops producing. Existing guides stay. Its
  `commercial.py` collector STAYS: `/tools/buyers-list` depends on it and the deed data is a
  genuine input to company pieces (who owns the building, what they paid).
- **`greenville/housing.py`** and `greenvilleHousing.json` STAY. The ZIP-level submarket data
  is the only proprietary dataset in the operation and belongs as a live data surface.
- **Three scheduled cloud routines** get disabled.

## Open items

- **The tagline is now off-beat.** `site.ts` carries "Who pays for South Carolina's growth.",
  written for the accountability beat and left in place through the rewrite. It leans watchdog
  for a publication that explains businesses. Needs Alex's call.
- **The publication is unnamed**, so `site.name` is still "Alex Prompts" and the nav label for
  the live section is the placeholder "Reporting". Both change in one place when the name
  lands. Revisit after three or four issues.
- **The route stays `/greenville-works`** and new pieces keep the `greenville works` tag.
  Renaming breaks every published URL, the sitemap, and the tag the engine writes.
