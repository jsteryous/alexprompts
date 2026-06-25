# greenville/data — CI-collected signal hand-off

This directory holds the week's Greenville, SC real-estate signal, collected by
GitHub Actions and read by the cloud "Greenville Real Estate" routine. It exists
because the cloud sandbox IP is blocked (HTTP 403) by Google News, so the routine
cannot collect for itself. A GitHub-hosted runner can, so it collects and commits
here.

- **`signal-latest.json`** — the scored `Collection`, machine-readable. Replay it
  with `python -m greenville.collect --from-json greenville/data/signal-latest.json`
  to inspect a fixed snapshot with no live fetch.
- **`signal-latest.txt`** — the same collection rendered as the human/LLM-readable
  payload (identical to the collector's stdout). This is what the routine's STEP 0
  copies into its scratch dir.

Both files are overwritten weekly by `.github/workflows/collect-greenville.yml`
(Friday 08:00 UTC). Do not hand-edit them; they are generated. Until the first CI
run lands, the routine falls back to a live collect, then to `COLLECTOR FAILED`
(the Reporter then web-searches recent Greenville real-estate news itself).
