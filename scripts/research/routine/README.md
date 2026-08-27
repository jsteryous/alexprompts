# The research routine

The engine that reads one research paper a week and writes up what it found. Read `../SPEC.md`
first; it defines what gets written and outranks anything here.

Built August 27, 2026, after Alex asked for a routine that teaches him the fundamentals of real
estate through the academic literature. The site had promised exactly this since August 25 ("We read
research papers about real estate and sales performance and share what we find interesting") and
nothing in the repo did it.

## The passes

| # | File | Job | Sees |
|---|---|---|---|
| 0 | `pass0_scout.md` | Picks ONE paper and **proves its full text can be fetched**. Six bars, three gates. | `questions.md`, `papers.md`, the reading list |
| 1 | `pass1_reader.md` | Opens the full text. Establishes the question, the trick, the finding, whether it held up, and builds the model. | the paper |
| 2 | `pass2_angle.md` | Builds a spine that is a claim about the world, not about the paper. Picks the section tag. | the brief, the reading list |
| 3 | **shared** `../../publication/routine/pass3_writer.md` + `writer_delta.md` | Renders it in Alex's voice. | the brief, the angle, published pages |
| 3b | **shared** `../../publication/routine/pass3b_verifier.md` + `verifier_delta.md` | Re-opens the paper and checks the model. | the draft, the brief |
| 4 | **shared** `../../publication/routine/pass4_editor.md` + `editor_delta.md` | Audits the piece. Rejects book reports. | the verified draft, the brief, the angle |

`orchestrator.md` runs them, each as a fresh sub-agent, and handles the kill exits, the Supabase
draft insert, and the review packet.

**Three passes are shared with `scripts/publication/routine/` on purpose.** They hold the house
voice, the four tells, the legal gate, the fair-housing line, and the no-narration rule. A second
copy of those would drift within a month, so this engine hands the shared pass and a short delta to
the same sub-agent and tells it the delta wins. **Hand both files.** The delta alone is not a pass
spec, and the shared pass alone will write a company teardown.

## The three things that make this engine different

**FULL TEXT OR KILL.** Nothing gets written from an abstract. The scout proves the PDF fetches
before a run is spent, and the reader kills the run if it cannot open it. An abstract is the
authors' compressed marketing of their own result and working from one is how careful findings
become headlines their authors would not sign.

**THE MODEL.** The hard rule, and it is not a number. Every piece leaves the reader holding one
transferable mechanism: how it works, where it generalizes, where it breaks. An earlier version
required a Greenville dollar figure instead; Alex struck it on August 27, 2026 because it assumed
the subject is money when the subject is understanding. A computed figure is now one optional way to
ground a piece, not the obligation.

**FIVE OBLIGATIONS, ZERO HEADINGS.** The question, the trick, the finding, whether it held up, the
model, plus what it does not say. All are required and **none may appear as a subhead.** The
form is the failure mode of this engine the way the fixed template was the failure mode of the
weekly brief, so the editor rejects on sight.

## The access ladder, tested August 27, 2026

| Source | Result |
|---|---|
| OpenAlex API, discovery | works, free, no key. Use `title_and_abstract.search`, never bare `default.search` |
| NBER `/system/files/working_papers/wNNNNN/wNNNNN.pdf` | full PDFs. **Highest-yield step by a wide margin** |
| Regional Fed working papers | reachable (Richmond covers South Carolina) |
| FRASER, Mapping Inequality, CourtListener | reachable; the history track's primary documents |
| SSRN | **403**, Cloudflare |
| AEA PDFs | **403** |
| Semantic Scholar | **429** without a key |

**OpenAlex reporting no open access does not mean there is none.** Case & Shiller (1988) and Bayer,
Ferreira & McMillan (2004) both report none and both are free at NBER. Hunt before giving up.

**Link the landing page, never the PDF.** The house rule bans links that download a file, and this
form breaks it in one predictable way. Cite `https://www.nber.org/papers/wNNNNN`, not the PDF path
the engine actually read.

## Running it

Cloud routine, weekly. The prompt is one line:

```
Read scripts/research/routine/orchestrator.md in the alexprompts repo and follow it exactly.
```

It needs the Supabase connector (recall, the guards, the draft insert), web search and fetch, and
Gmail for the review packet. It publishes DRAFT-first; nothing goes live until Alex publishes it at
rebrew.org/admin.

The guards are in STEP 0 and they are clean stops: same-day duplicate, any pending DRAFT at all, or
fewer than five days since the last published piece.

## The files it reads and writes

- `../questions.md` — **Alex's file, and it outranks the canon.** What he wants to know. The scout
  reads it first and prefers a paper that answers something in it.
- `../papers.md` — the canon, every entry checked against OpenAlex, each with an access status. The
  scout adds to it every run.
- `../read.md` — the reading list. Every paper published **or killed**, so a paywalled paper is not
  re-attempted every week. This is the living artifact and it grows on empty runs too.
