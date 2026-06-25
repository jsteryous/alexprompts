# Greenville real-estate engine — `scripts/greenville/`

A second content vertical, separate from `ai_news/`. It sources and scores
**Greenville, SC real-estate news**, and a Claude routine turns the biggest UNCOVERED
story into WRITTEN content for the **website and X** (no video), framed as **both
sides, no forced verdict** (consensus vs devil's advocate). See root `CLAUDE.md` and
`scripts/CLAUDE.md` for the sibling `ai_news/` engine; this package reuses the same
conventions (graceful network degradation, defusedxml RSS parsing, JSON signal
hand-off, isolated routine passes) and the same `requirements-ai-news.txt`.

## Layout

- **`collect.py`** — the collector. Queries Google News RSS across local
  real-estate BEATS (Market, Development, Rentals, Policy, Upstate), drops
  syndicated single-property listings (`is_listing_noise`), and clusters headlines
  by normalized title. Scoring is **corroboration**: how many beats and outlets
  surfaced the same story, since local news has no upvote signal. The top cluster
  is the lead. Pure functions are unit-tested in `tests/test_greenville.py`.
- **`data/`** — CI hand-off (`signal-latest.json` + `.txt`), committed by the
  workflow; the routine reads it. Generated, do not hand-edit.
- **`routine/`** — orchestrator + three isolated passes (reporter, two-sides,
  writer). See `routine/README.md`.

## Commands

```bash
cd scripts
python -m greenville.collect                          # print the signal
python -m greenville.collect --json-out signal.json   # + scored JSON (CI hand-off)
python -m greenville.collect --from-json signal.json  # replay a snapshot, no network
python -m greenville.collect --when-days 21 --limit 15
python -m unittest scripts.tests.test_greenville -v
```

## Automation

- **`.github/workflows/collect-greenville.yml`** (DAILY 06:00 UTC) collects from a
  non-blocked runner IP and commits the signal. No secrets needed (free sources).
- The **routine** runs nightly as a scheduled Claude cloud agent pointed at
  `routine/orchestrator.md`, after the collector. It dedups against the live site,
  posts NOTHING on a quiet night, and on a real story creates a `blog_posts` DRAFT
  (tagged `greenville`) plus a Gmail/Drive packet with the article and the X post.
  See `routine/README.md`.

## Publishing + dedup

- The routine writes posts via the **Supabase connector** (there is no generic
  create-post API; `/api/publish` only flips status). New posts are **PUBLISHED**
  live to `/real-estate` (the dedicated section). Auto-publish is safe because the
  pass guardrails (fair-housing language, not-advice, sourced numbers) plus dedup do
  the gating, and a verify email still goes out for after-the-fact spot-checks. If
  dedup is unavailable on a run, that run falls back to DRAFT. Set STEP 4 back to
  `DRAFT` to require human review again.
- **Dedup** keys on a `source_url` column. Add it once:
  `alter table blog_posts add column if not exists source_url text;`
  Without it the routine dedups on title only.
- **X** has no auto-poster (no X connector); the routine drafts the X post and emails
  it for manual posting.

## Tuning

- **Coverage:** edit the `BEATS` list in `collect.py` (each beat is a name + a Google
  News query). Keep every query pinned to the place ("Greenville SC" / "Greenville
  County" / "Upstate South Carolina") or national mortgage noise floods in.
- **Scoring:** `W_BEATS`, `W_OUTLETS`, `W_APPEARANCES` at the top of `collect.py`.
- **Noise:** `LISTING_RE` drops address-shaped MLS listings; widen it if other junk
  patterns (open-house roundups, "homes for sale in") start ranking.

## Guardrails (enforced in the routine passes)

Not investment/legal/financial advice. Fair-housing-safe language (describe the
property and facts, never who a home is "right for"). Every number traces to a real
publisher article, and the delivered draft leads with a MUST-VERIFY list.
