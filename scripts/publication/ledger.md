# The ledger

The publication's one living artifact: a running index of what has been covered, what it
established, and what was spent doing it. It grows by one entry every issue and it eventually gets
cited.

**The authoritative copy lives on the `drafts` branch.** The orchestrator reads it in STEP 0B and
appends to it in STEP 7. This copy on `main` is the seed and the format reference.

## What it is for

Four jobs, and every field below serves one of them.

1. **Dedup.** A future run must not repeat a question. The same COMPANY may return under a
   different shape; the same QUESTION may not.
2. **THE REFRESH GATE.** A depth source carries one piece and is then spent. The SOURCE field is
   what a future scout checks before building on one.
3. **Compounding.** Where a new finding touches an old one, the angle pass frames them together so
   the pieces build instead of standing alone. Where new evidence cuts against an old conclusion,
   it says so in public.
4. **Grading calls.** A call on the record gets checked on its date, including the misses.
   Especially the misses.

## Format

```
### <the subject>
SLUG: /greenville-works/<slug>
DATE: <YYYY-MM-DD>
SHAPE: <which of the ten>
QUESTION: <the question the piece answered>
ESTABLISHED: <what the evidence showed, in one line, written to stand alone years from now>
ORIGINAL NUMBER: <the figure this run computed, with its unit>
HINGES ON: <the condition the answer depends on>
SOURCE: <CADENCE or DEPTH, naming it. A DEPTH source recorded here is SPENT.>
CALL: <the falsifiable statement and the date to grade it, or "none">
GRADED: <filled in later: the date, and whether the call held>
```

## Spent depth sources

A running list, so a scout can check it without reading every entry. A source here supports no
further pieces.

- **ScanSource FY2025 Form 10-K.** Spent on the revenue-versus-gross-profit divergence. The
  company itself is NOT spent; it returns under a different shape against a different filing.

## Entries

### ScanSource (Greenville)
SLUG: /greenville-works/scansource-revenue-decline-gross-margin-intelisys
DATE: 2026-08-14
SHAPE: the revenue question
QUESTION: Why did ScanSource's revenue fall a fifth in two years while its margins went up?
ESTABLISHED: The decline is largely an accounting artifact. The growing segment (Intelisys) is
  booked as an agent, so only the commission reaches net sales, which means growth there shrinks
  reported revenue relative to the same economic value sold on a gross basis. The hardware
  contraction is real (STS down 7.1%, international down 29.1%), but the revenue line understates
  the business and gets worse at the job every year.
ORIGINAL NUMBER: Intelisys is 3.2% of net sales and 23.8% of gross profit, a 7.4x ratio.
  Supporting: reported net sales capture about 52% of the $5.83B of commerce handled; gross
  margin rose 158bp (11.86% to 13.44%) while sales fell 19.7%; gross profit per employee
  $194,600.
HINGES ON: the agency accounting treatment for Intelisys, and the continued mix shift toward it.
SOURCE: DEPTH (ScanSource FY2025 10-K, filed for FY ended June 30, 2025). SPENT.
CALL: If the mix shift continues, gross profit will keep falling more slowly than net sales.
  Convergence of the two growth rates means the shift has stopped. Grade at FY2027 results,
  around August 2027.
GRADED: (pending)

NOTE FOR A FUTURE RUN: the investor FAQ says approximately 2,300 employees and the 10-K says
approximately 2,100. The filing was used. Worth re-checking whether the FAQ gets corrected.
