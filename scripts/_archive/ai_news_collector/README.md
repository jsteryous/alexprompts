# Retired: the AI-news signal collector (June 2026)

Reference only. Nothing here runs on a schedule.

This was the national **AI-for-real-estate news** collector that fed the old Saturday script
routine: `collect.py` (Google News RSS across AI-x-real-estate beats, corroboration scoring),
the `digest.py` CLI, the committed `data/` signal artifacts, the `test_ai_news.py` unit tests,
and the `collect-signal.yml` GitHub Action that ran it from a non-blocked IP.

It was retired when the Saturday engine pivoted from chasing weekly AI news to answering one
useful, evergreen real-estate question with real public data. The new engine needs no
collector: its data sources (Census, FRED, FHFA, Zillow) are plain APIs that are not
datacenter-IP-blocked, so the routine pulls them live. See `scripts/ai_news/routine/` and
`scripts/CLAUDE.md`.

The Greenville daily engine (`scripts/greenville/`) still uses its own live collector and is
unaffected.
