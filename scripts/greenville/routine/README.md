# Greenville Real Estate routine

A Claude routine that turns the day's biggest **Greenville, SC real-estate** story
into WRITTEN content for two places: a **website post** and an **X post / short
thread**. No video. The editorial spine is **both sides, no forced verdict**:
explain what happened, give the consensus, steelman the devil's advocate, then hand
the reader the question.

It mirrors the `ai_news/routine/` pattern (an orchestrator plus isolated passes) but
is leaner: three passes, because the output is a local explainer, not a deep-dive.

## The pipeline

1. **`pass1_reporter.md`** — establishes the verified facts, finds the real
   publisher article behind Google News's opaque redirect link, grabs a lead image
   (the article's `og:image`), separates CONFIRMED from REPORTED, dedups against
   what the site already covered, and lists what a human must verify. On a quiet day
   it returns `NO NEW STORY TODAY` and the run stops.
2. **`pass2_sides.md`** — picks the single fault line, then builds THE CONSENSUS and
   THE DEVIL'S ADVOCATE, both steelmanned, plus what would settle it and the
   reader's question. Takes no stance.
3. **`pass3_writer.md`** — renders the website article (markdown, image first) and
   the X post in house voice (no em dashes, no fragments, plain English), with
   fair-housing and not-advice guardrails. Emits a `## METADATA` block the
   orchestrator uses to create the post.

`orchestrator.md` wires them as cold sub-agents, reads the committed signal, dedups
against the live site, and on a real story: creates the website post as a **DRAFT**
in Supabase `blog_posts`, then emails + Drives the human packet (verify list, the
article, and the X post to copy-paste).

## Cadence and where it posts

- **Collector:** `.github/workflows/collect-greenville.yml`, **daily 06:00 UTC**.
- **Routine:** runs **nightly** as a scheduled Claude cloud agent (`/schedule`)
  pointed at `orchestrator.md`, after the collector. Most nights it posts nothing.
- **Website:** the routine inserts a `blog_posts` row tagged `greenville` as
  **DRAFT**. Review and publish it at `/review`. It is DRAFT on purpose: a human
  should check the housing numbers and fair-housing language, and the live `/archive`
  is currently Claude-only, so decide placement before going public. Flip to
  auto-publish later (one word in the orchestrator STEP 4) once a dedicated section
  exists.
- **X:** there is no X auto-poster (no X connector wired), so the routine drafts the
  X post and delivers it in the email packet for you to post by hand.

## Dedup (so a daily schedule never repeats a story)

STEP 0B queries `blog_posts` for the last 30 days of `greenville`-tagged posts
(published or draft) and hands the reporter that ALREADY-COVERED list. The reporter
skips anything on it. Robust dedup keys on a `source_url` column; add it once with:

```sql
alter table blog_posts add column if not exists source_url text;
```

Without that column the routine dedups on title only (still works, just looser).

## Running the collector locally

Your home IP is not blocked, so you can dry-run the collector:

```bash
cd scripts
python -m greenville.collect --limit 15
python -m unittest scripts.tests.test_greenville -v
```

## Guardrails (built into the passes)

- **Not advice.** No buy/sell/hold calls. Information only.
- **Fair housing.** Describe the property and the facts, never who a home is "right
  for." The writer pass bans demographic-targeting language.
- **Attribution + an image credit.** Every number traces to a real publisher
  article; the post ends with a source credit; the delivered packet leads with a
  MUST-VERIFY list.
- **Restraint.** Daily cadence, but the reporter posts nothing on a quiet day.
