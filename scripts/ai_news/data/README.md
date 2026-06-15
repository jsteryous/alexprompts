# ai_news/data — CI-collected signal hand-off

This directory holds the week's scored signal, collected by GitHub Actions and read
by the Saturday cloud script routine. It exists because the cloud sandbox IP is
blocked (HTTP 403) by Google News, Hacker News, and Reddit, so the routine cannot
collect for itself. A GitHub-hosted runner can, so it collects and commits here.

- **`signal-latest.json`** — the scored `Collection`, machine-readable. Load it with
  `python -m ai_news.digest --from-json ai_news/data/signal-latest.json ...` to run the
  rest of the pipeline against a fixed snapshot (no live fetch).
- **`signal-latest.txt`** — the same collection rendered as the human/LLM-readable
  payload (identical to `--collect-only` stdout). This is what the cloud routine's
  STEP 0 copies into its scratch dir.

Both files are overwritten weekly by `.github/workflows/collect-signal.yml`
(Saturday 12:00 UTC, before the routine). Do not hand-edit them; they are generated.
Until the first CI run lands, these files may be absent and the routine falls back to
a live collect, then to `COLLECTOR FAILED`.
