# The research engine — spec

One published paper per issue. What it asked, the trick that let it find out, what it found,
whether it has held up, and **the model it leaves you holding** — the mechanism you can carry to the
next building, the next deal, the next market.

The goal is not a tip. It is a real education in how real estate works: urban economics, what
developers underwrite, which tenants are worth what, which income-producing assets earn their
returns and why, which houses hold value and which quietly do not.

## THE THREE RULES GOVERN HERE TOO

**Alex, August 15, 2026.** They outrank everything below.

1. **It must be a true story.**
2. **Make it as entertaining as possible without fabricating.**
3. **Have fun.**

Rule 1 is the one this engine is most likely to break, and it breaks it in a specific way. A
paper summary is not a story. It is a form with the answers filled in. Everything in this file
that looks like structure is there to stop the form from winning.

## Why this engine exists

The site has promised since August 25, 2026 that *"We read research papers about real estate and
sales performance and share what we find interesting."* Nothing in the repo did that. The
`scripts/publication/` engine was built for company teardowns off county records, its scout was
never repointed to the new beat, and its hard rule would kill a literature piece at the researcher
gate.

This engine is that promise, built. It supersedes `scripts/publication/` as the thing that runs.
That package is not deleted, and three of its passes stay LIVE and are shared: the writer, the
verifier, and the editor. They carry the four tells, the legal gate, the fair-housing line, and the
no-narration rule, and a second copy of those would drift within a month.

## The reader, and the one who has to stay interested

Buyers, sellers, and agents, per the August 25 beat. But the honest first reader is **Alex**, who
asked for this because he wants to learn real estate through and through. **If a piece would bore
him, the subject was wrong.** That is a gate, not a mood.

## THE SUBJECT IS THE WHOLE DISCIPLINE

**Widened August 27, 2026, Alex's call**, in the same breath as the correction above. The engine
launched with a canon weighted toward residential brokerage and behavioral economics, which is the
"how a sale gets made" half and only a slice of what he asked for. The subject is the discipline:

- **Urban economics.** Why cities are shaped the way they are, why land costs what it costs and
  where, what agglomeration does to rents, why housing supply is elastic in one metro and rigid in
  another. This is the foundation layer and most local coverage never touches it.
- **Development.** What a developer actually underwrites, how land value is a residual rather than a
  price, why a vacant lot can be rational to hold empty, what entitlement risk is worth.
- **Tenants.** Which businesses are good tenants and why, what credit quality buys, why an anchor
  pays less rent than the shop beside it and why that is correct.
- **Income-producing assets.** What each property type's return is actually compensation for, how
  cap rates behave, where the returns come from and where they quietly go.
- **The house as an asset.** Which styles, vintages, and locations hold value and which do not,
  depreciation and maintenance, filtering, what renovation actually returns.
- **The institutions.** Where the thirty-year mortgage, the MLS, zoning, and the commission came
  from, and what they were built to solve.
- **How a sale gets made**, which is the original slice and is still in scope.

**Deeper beats broader.** The point is a durable mental model, so a piece that takes one mechanism
apart properly is worth more than one that tours a subject. The canon in `papers.md` covers all of
these and grows every run.

A note on who this serves. Developers and real estate entrepreneurs were the site's stated reader
until August 25, when the beat moved to buyers, sellers, and agents, and the subject list above
leans toward the earlier one. That tension is real and it is not resolved here. **The resolution is
depth of explanation, not choice of reader**: urban economics explained well is the reason a buyer
understands why their submarket prices the way it does, and the piece is written so that the
curious non-professional can follow it.

## The unit: ONE paper

One paper per issue. Not a survey, not a literature review, not five studies stacked to look
rigorous. The one-paper rule is doing real work: it makes the full-text gate enforceable, it kills
citation theater structurally, and it is the form that compounds into a reading list worth having.

At most ONE other paper may be named, and only when it disagrees with the first or when it is the
paper that tried to replicate it.

## The five obligations. THEY ARE NOT HEADINGS.

Every piece meets all five. **None of them may appear as a subhead**, and any draft whose sections
are named "What they asked," "The method," "What they found," "Limitations," or "What it means for
Greenville" is a form and gets rejected. Subheads describe what THIS piece establishes, the way
they do everywhere else on the site.

1. **THE QUESTION.** What did they actually want to know, in a sentence a person would say out
   loud. Not the abstract's version of it.
2. **THE TRICK.** How did they find out? This is the most interesting thing in most papers and the
   thing no reader is ever told. Levitt and Syverson could not ask agents whether they sell your
   house too cheaply, so they compared the houses those agents sold for clients against the houses
   the same agents owned themselves. That comparison is the piece. **A paper whose trick cannot be
   explained in plain English to a smart fifteen-year-old is a paper this engine skips.**
3. **THE FINDING**, in units a person cares about. Dollars, days, percentage points.
4. **HAS IT HELD UP.** Published in 2005 is not the same as true in 2026. Look for replications,
   later data, and a market that changed underneath it, then say plainly where the evidence stands.
   **A landmark finding that has since been narrowed or overturned is a BETTER piece than one that
   survived**, and nobody local ever writes it.
5. **THE MODEL.** The transferable mechanism the reader keeps. See below.

## THE MODEL, which is this engine's hard rule

**Corrected August 27, 2026, Alex's call, before the engine ever ran.** The first draft of this file
made obligation 5 "the local number": take the paper's effect size and compute what it is worth
against the Greenville median. He pushed back, and he was right. That rule was imported from the
old referral-lead framing, where the job was to hand a buyer a figure at a closing. **It assumed the
subject is dollars. The subject is understanding.** A dollar conversion is a decision aid, and this
publication is an education.

The obligation is this instead. **Every piece leaves the reader holding one mechanism they can carry
to the next building, the next deal, or the next market.** Not a fact, and not a tip. A model.

A model has three parts and the piece owes all three:

1. **How it works.** The causal machinery, one level deeper than any summary of the paper would go.
   Why does a fifty basis point move in cap rate swamp a good year of rent growth? Because value is
   income over cap rate and the denominator does the work. That sentence transfers to every
   income-producing asset a reader will ever look at, which is what makes it worth more than any
   individual number in the paper.
2. **Where it generalizes.** What else does this explain? A model that only explains its own dataset
   is a finding, not a model.
3. **Where it breaks.** The boundary conditions. A rule of thumb without its limits is how people
   lose money confidently, and naming the limits is most of what separates understanding from
   repetition.

**SHOW THE WORK.** The piece does reasoning the reader can follow and redo. Often that is
arithmetic, and arithmetic is welcome: work a land residual, a cap rate, a price per door, a
rent-per-square-foot comparison across tenant types, the way a practitioner would. **It does not have
to be in dollars and it does not have to be local.** A comparison across asset classes, a boundary
test on a rule of thumb, or a worked example that shows why the intuitive answer is wrong all
satisfy it. What it may never be is a quoted figure passed off as work.

**BRING IT HOME, but not necessarily with money.** Ground the model in something real, and prefer
Greenville because that is where the reader lives and the site's masthead says so. A corridor, a
building type, a tenant mix, an actual development, a housing vintage. Local dollars are ONE way to
do this and they are no longer the required way. The old rule's example still works when the piece
is genuinely about a transaction decision; it is now an option, not the obligation.

When the piece does state a computed figure, the old discipline holds: inputs sourced and current,
arithmetic shown or plainly reconstructable, panel labeled, stated once, and never written so that
an illustration reads as a prediction about a particular property.

## Full text or kill. The hard gate.

**Never write about a paper you have only read the abstract of.** Abstracts are the most compressed
and most over-claimed prose in the language, and working from one is exactly how the trade press
turns a careful finding into a headline its authors would not sign. The engine reads the methods,
the results, and the tables, or it takes a different paper.

The access ladder, in order, tested August 27, 2026:

1. **OpenAlex** (`api.openalex.org`, free, no key) for discovery and metadata. Its
   `title_and_abstract.search` filter is precise. The bare `default.search` is not, and will return
   COVID papers for a housing query.
2. **If the DOI starts `10.3386`, it is an NBER working paper** and the full text is free at
   `https://www.nber.org/system/files/working_papers/wNNNNN/wNNNNN.pdf`. This is the highest-yield
   step in the ladder by a wide margin.
3. **A published paper often has a free working-paper twin even when OpenAlex says it is not open
   access.** Case and Shiller's 1988 paper reports no OA location and sits at NBER as w2506. Bayer,
   Ferreira and McMillan report none and sit at w10871. Both return full PDFs. **Hunt before you
   give up.** Search the title with the author names against nber.org, the regional Federal Reserve
   working paper series (Richmond covers South Carolina), university repositories, and the authors'
   own pages.
4. **OpenAlex `best_oa_location`**, verified by actually fetching it.

Known dead ends, do not spend a run on them: **SSRN returns 403** behind Cloudflare, **AEA PDFs
return 403**, and **Semantic Scholar rate-limits to 429** without a key.

**An open risk, and the first thing to check on the first run.** The ladder above was verified with
`curl` from a local machine. Two other cloud routines in this account carry the line that WebFetch
is egress-blocked for most academic, government, and publisher domains in the sandbox, so the cloud
may not be able to reach what a laptop can. The passes therefore try `curl` via Bash when WebFetch
fails, and report which one worked. **If neither can reach full text from the cloud, this engine
cannot run there as designed**, and the honest responses are to run it locally or to find a
reachable corpus, never to relax the gate and write from abstracts.

For the history track the primary documents are fully open: **FRASER**, the St. Louis Fed archive
that holds the FHA Underwriting Manual, **Mapping Inequality** at the University of Richmond, which
has a Greenville HOLC map, and **CourtListener** for case law.

## The four ways this specific form turns into slop

These sit on top of the four tells the editor already polices. Each one is a rejection.

**THE BOOK REPORT.** "The authors examine." "The study concludes." **The paper is not the subject.
The world is the subject, and the paper is how we know.** The test: delete the paper's title from
the draft. If what remains is not about anything, it was a book report.

**INHERITED HEDGING.** Academic prose hedges because peer review requires it. You are not writing
for peer review. Take the finding at the confidence the authors actually established, and hedge
only where the uncertainty is real and about the world. One caveat per section, and never the
ritual "further research is needed."

**COEFFICIENT DUMPING.** No standard errors, no R-squared, no p-values in the prose. Only figures a
person would repeat out loud. If the identification matters, explain the trick in words.

**THE SIGNIFICANCE PARAGRAPH.** "This has important implications for buyers." Show the thing or cut
it. Announcing that a finding matters is what you do when you have not made it matter.

## Cadence and sections

**Weekly.** The literature does not go thin, so the publication's thin-period logic does not
transfer. The quality mechanism here is the scout's bars rather than scarcity: a run that finds no
paper clearing them exits clean and publishes nothing.

The section tag is chosen per piece, `sales` for how a sale gets made and `greenville` for the
market and the property in it. There is no third section and no new route.

## What this is NOT

- Not a literature review, and not "five studies say."
- Not advice. Assess, do not advise, exactly as elsewhere. The piece reaches a conclusion about
  what the evidence supports and never tells anyone what to buy, sell, or list at.
- Not a defence of academia. A weak paper called weak is a fine piece.
- Not a news scout. A 1988 paper beats a 2025 paper whenever it is the better story.
