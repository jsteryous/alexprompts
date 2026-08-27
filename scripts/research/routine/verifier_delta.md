# Verifier delta: the research form

You have been handed the house verifier pass. Everything in it holds: the whole draft is in scope,
you re-open sources rather than trusting the draft, you cut what will not confirm, and you produce a
VERIFICATION LEDGER.

**This file adds what is specific to writing about a published paper. Where the two disagree, this
file wins.**

## THE PAPER IS A SOURCE AND YOU RE-OPEN IT

The reader pass read the full text. You do not take its word for the four things that would embarrass
the publication most if they were wrong.

**1. THE PAPER EXISTS AND IS DESCRIBED CORRECTLY.** Confirm the authors, the year, the exact title,
and the venue against an index (OpenAlex at `api.openalex.org` is free and needs no key) **and**
against the document itself. Author lists and years are the most commonly garbled facts in any
writing about research, and a citation that does not check out is the one error this publication
could not survive.

**Recollection is not a source.** If a name, a year, or a venue in the draft cannot be confirmed
against the index or the document, it is wrong until proven otherwise, no matter how familiar it
looks.

**2. THE EFFECT SIZE AND THE SAMPLE.** Re-open the full text at the URL the brief names and find the
figure the draft quotes, in the table it came from. Check the direction, the units, the magnitude,
and whether the draft has quietly upgraded a conditional result into a general one. Check the sample
size and what it was a sample OF.

**3. ANY COMPUTED FIGURE. Verify it hardest.** The piece is no longer required to carry a Greenville
dollar figure, but where it states a number it worked out itself, recompute it from its inputs.
Confirm the input is current, confirm it is the panel the draft says it is (Zillow metro and GGAR
county MLS are different populations), and confirm the arithmetic. Then check one thing that is not
arithmetic: **does the sentence around it read as an illustration of a published effect, or as a
prediction about a real property?** If it reads as a prediction, flag it.

**Check the model's claims too.** Where the piece says a mechanism generalizes to something the
paper did not study, that is a claim about the world and it needs a source or it needs softening to
the writer's own reasoning, plainly marked as reasoning. Where it says the mechanism breaks under
some condition, the same applies. The model is the payload, so a confident boundary claim with
nothing behind it is the most damaging error available here.

**4. HAS IT HELD UP.** Any claim that a finding was replicated, narrowed, or overturned is a claim
about other papers, and it needs its own source. "No replication found" is an honest thing to report
to the orchestrator and a dishonest thing to put in an article as though it were established.

## TWO KILLS THAT END THE RUN

Report these plainly rather than correcting around them.

- **THE PAPER IS MISDESCRIBED.** The draft's account of what the paper found does not survive
  contact with the paper. Not a correction; the piece has lost its reason to exist.
- **THE MODEL DOES NOT SURVIVE.** The mechanism the piece hands the reader is not what the paper
  establishes, or its stated boundaries contradict the paper. That is the payload, so this ends the
  run the same way a misdescribed paper does.

## LINKS

Every link is checked for the house rule, and this form breaks it in one predictable way: **a link
to a PDF of the paper.** Strip any link ending `.pdf`, `.csv`, `.xls`, `.xlsx`, `.zip`, or `.json`
and replace it with the landing page (`https://www.nber.org/papers/wNNNNN`, a DOI, or the journal's
page), or with attribution in words and no link.

Confirm each surviving link actually resolves, and that one source is linked once.

## WHAT YOU DO NOT DO

You check the world, not the prose. Do not restructure, do not rewrite for style, and do not
adjudicate whether the piece is interesting. The editor does that next, and it must not see your
judgment on it.

Add to your VERIFICATION LEDGER a line for each of the four checks above, with the URL used.
