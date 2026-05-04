# REBB Pipeline — Scripts Context

See root `CLAUDE.md` for business context, Supabase schema, env vars, and voice rules.

## What lives in `scripts/`

- **`prospects/`** — weekly outbound: discovers dental + PI firms, audits, scores, emails HOT/WARM digest. Surfaces on `/dashboard/prospects`.
- **`gvl_monitor.py` + `enrich.py` + `run_daily.py`** — legacy LLC→human resolution (deeds + mortgages + SOS → `enriched_leads`). Surfaces on `/dashboard`.
- **`generate_insights.py` + `weekly_insights.py` + `audit_stats.py`** — AI-drafted blog posts (Gemini → DRAFT → manual approve → `/insights`).

## Lead Enrichment — The Problem

Every signal (deed/mortgage/SOS filing) names an entity — often an LLC. Goal: unmask
the human decision-maker. This is **graph traversal**, not a linear lookup.

Both individual grantees and LLC grantees are valid leads. Individuals may need trade
services (roofing, pools, GCs). LLCs signal commercial activity (higher value for
landscapers, cleaners, commercial realtors). Don't filter either out.

### Chain Status

| Source | Status |
|---|---|
| Mortgage OCR (CountyWeb) | **Best source.** Gets signer name + title from signature block. |
| Deed mailing OCR (CountyWeb) | **Working** — `lookup_deed_mailing()` in `enrich_mort.py`; Step 0b in `enrich.py` |
| GIS tax query → owner name | Working |
| PIN pivot → Care Of + mailing | Working |
| GIS flip on residential mailing | Working |
| GIS flip on commercial mailing | Working — `_gis_commercial_hop()` in `enrich.py` |
| SOS direct search (Playwright) | Working — `lookup_sos_direct()` in `enrich_web.py` |
| SOS discovery via DDG | Unreliable fallback — DDG index is stale for recent filings |
| Address clustering (multiple LLCs at same address) | Not built |

### Deed Mailing Lookup — How It Works

`lookup_deed_mailing(entity_name, rec_date_str, debug)` in `enrich_mort.py`.
Searches CountyWeb (`viewer.greenvillecounty.org`) for DEED doc types, OCRs page 1,
parses the "Return To:" / "After Recording Return To:" block via `_RETURN_TO_RE`.
Falls back to `extract_best_property_address(text[:3000])` if header is OCR-garbled.

Injected as **Step 0b** in `enrich.py` — fires for deed-only signals with LLC names,
after mortgage OCR (Step 0), before GIS (Step 1). Sets `result.mailing_address` which
the PIN pivot / GIS flip logic already knows how to use.

**Limitation:** Non-GVL "Return To:" addresses (e.g. attorney in Mt. Pleasant) produce
0 GIS hits. Address still lands in `notes` for manual review.

**GovOS is paywalled — never attempt.** Document images in GovOS require per-document
purchase. XHR interception returns nothing. CountyWeb has the same docs for free.

### Contact Info (Separate Concern — Don't Mix With Name Resolution)

Proven in POC (April 2026, `poc_contact_sources.py`):
- **PDL**: 0% hit rate on GVL LLC owners. Coverage gap, not a credits problem.
- **Google Places**: ~30-60% expected hit rate on active trade businesses with GBPs.
  Needs 50% token overlap validation to reject fuzzy mismatches. `GOOGLE_PLACES_API_KEY`
  in `.env.local`. Hold until name resolution chain is stronger.

### Dead Ends

- **GovOS document images**: Paywalled. Never attempt XHR interception or screenshot OCR.
- **SC SOS bulk CSV**: Paid Tyler subscriber agreement. Not self-serve.
- **gcgis.org ArcGIS API**: IP-blocked for non-browser requests.
- **`greenvillecounty.org/vRealPr24/`**: Returns 500.
- **PDL for GVL LLC owners**: Coverage gap confirmed. Not a budget issue.

## Market Insights Engine

Workflow: `generate_insights.py --topic "..." --cluster <slug>` → pulls first-party audit stats → Gemini (grounded) → DRAFT → email to alex@ → edit/publish from `/review` → `revalidatePath('/insights')`.

**EEAT grounding (`scripts/audit_stats.py`):** Before each Gemini call, aggregate stats are pulled from `website_prospects` (dental, audited): % forms unreachable, % no-viewport, % no-HTTPS, stale-copyright bands, Lighthouse median/distribution, high-rated-but-broken correlation, HOT/WARM counts. Injected into the system prompt with a *"cite ≥2 figures verbatim, attribute to REBB, don't fabricate"* directive. Methodology footer (counties, n, date, method) is auto-appended to `body_md` on save so cited stats are verifiable. Falls back silently when <5 audited rows. Inspect the current block: `python scripts/audit_stats.py`.

**Voice grounding (`scripts/voice_anchors.py`):** Curated StoryBrand/marketing language pulled from the live site (one-liner, villain framing, "the proposal is the product," CTA wording, anti-upsell phrases). Injected into the system prompt alongside `audit_stats` so generated articles echo the site's voice instead of generic dental SEO blog tone. Edit `voice_anchors.py` when homepage copy meaningfully shifts.

**`/review` is editable:** title, summary, and `body_md` are all editable in a client form; `POST /api/review/save` is token-gated (`PUBLISH_SECRET`). Editing a PUBLISHED post revalidates `/insights` + the slug.

```bash
cd scripts
python generate_insights.py --topic "..." --cluster booking-forms [--dry-run]
python generate_insights.py --test-email
python weekly_insights.py [--dry-run]                 # rotates cluster automatically
python approve_post.py --list-drafts
python approve_post.py --id <uuid> --view / --edit
python approve_post.py --id <uuid> --cluster <slug>   # reassign cluster
python approve_post.py --id <uuid> --status PUBLISHED
python classify_post.py --all                         # backfill missing clusters via Gemini
python classify_post.py --id <uuid> [--dry-run]
python classify_post.py --all --override              # force re-classify everything
```

`weekly_insights.py` rotates by cluster: each `CATEGORIES` tuple is `(cluster_slug, brief)`, Gemini picks 3 candidates from different clusters, winner's cluster flows to `generate_insights.py` via `--cluster`.

**GH Actions — weekly-insights.yml:** Monday 13:00 UTC, Python 3.12, `requirements-insights.txt`.
Secrets: `SUPABASE_URL` · `SUPABASE_SERVICE_KEY` · `GEMINI_API_KEY` · `RESEND_API_KEY` · `NOTIFICATION_EMAIL` · `PUBLISH_SECRET` · `NEXT_PUBLIC_SITE_URL`.

**API surfaces:**
- `/review`: `?id=<uuid>&token=<PUBLISH_SECRET>` — token-gated editor (title/summary/body_md). Not in nav.
- `/api/publish`: `GET ?id=&token=` — idempotent, `revalidatePath('/insights')`.
- `/api/review/save`: `POST {id, token, title, summary, body_md}` — token-gated; revalidates slug + index if post is PUBLISHED.

## Python Scraper (gvl_monitor.py)

```bash
python gvl_monitor.py --demo --count 15
python gvl_monitor.py --scrape deeds [--days 14] [--debug] [--dry-run]
python gvl_monitor.py --scrape sos [--dry-run]
python gvl_monitor.py --scrape all [--days 14]
python gvl_monitor.py --mode mortgages [--days 14] [--debug] [--dry-run]
```

| Flag | Portal | Credentials |
|---|---|---|
| `--scrape deeds` | GovOS `greenville.sc.publicsearch.us` | `ROD_EMAIL` + `ROD_PASSWORD` |
| `--scrape sos` | DuckDuckGo → SC SOS detail pages | none |
| `--mode mortgages` | CountyWeb `viewer.greenvillecounty.org` | `ROD_VIEWER_USERNAME` + `ROD_PASSWORD` |

**GovOS deed scraper:** React SPA. Date: `aria-label="Starting Recorded Date"` + `press_sequentially()`. Submit: `data-testid="searchSubmitButton"`. Results: `tr.is-uncertified`. Direct `/document/{id}` URLs return 404 — must click from live Playwright session. Only DEED / WARRANTY DEED / DEED OF TRUST / QUIT CLAIM kept. Dedup key: `deeds:{GRANTEE}:{rec_date}`.

**CountyWeb mortgage scraper:** Login via `page.evaluate("doLogin()")`. Nested iframes: `bodyframe` → `dynSearchFrame` → `criteriaframe`. Datagrid: `field 6`=rec_date · `field 7`=doc_type · `field 9`=borrower · `field 11`=lender. Filter doc types by exact set membership (not substring). Grantor = borrower. Dedup key: `mtg:{BORROWER}:{rec_date}`.

**SOS scraper:** DDG `site:businessfilings.sc.gov "Greenville"` → detail pages (no CAPTCHA on detail URLs).

**Dedup:** `source_key` upsert. Demo signals have null key — always insert.

## Daily Pipeline (run_daily.py)

```bash
python run_daily.py [--dry-run] [--days 14] [--no-deeds] [--no-mortgages] [--no-enrich] [--no-alert]
python weekly_leads_digest.py [--days 14] [--all] [--dry-run]
```

**GH Actions daily-leads.yml (4am EST):** mortgage scraper → `--run-pending` → `--retry-pending` → `--run-contact` → alert email. Deed scraper runs locally only.
Secrets: `SUPABASE_URL` · `SUPABASE_SERVICE_KEY` · `RESEND_API_KEY` · `NOTIFICATION_EMAIL` · `ROD_PASSWORD` · `ROD_VIEWER_USERNAME` · `PDL_API_KEY`.
Python 3.12. `requirements-scraper.txt` + `apt-get install tesseract-ocr`.

## Lead Enrichment Engine (enrich.py)

Unmasks LLC → human decision-maker. Writes to `enriched_leads`.

```bash
python enrich.py --entity "Name LLC" [--rec-date "M/D/YYYY"] [--dry-run]
python enrich.py --signal-id <uuid>
python enrich.py --list-pending
python enrich.py --run-pending [--dry-run]
python enrich.py --retry-pending [--dry-run]
python enrich.py --run-contact [--dry-run]
ENRICH_DEBUG=1 python enrich.py --entity "..." --dry-run
```

### Chain

**Step 0 — Mortgage OCR** (deed + mortgage signals with LLC entity names): CountyWeb viewer, match by entity name + rec_date ±3 days. Fetch last 4 pages as PNG via `viewImagePNG.do` (jsessionid in URL path — NOT cookie). `_parse_borrower_from_text()`: 6 structured regex patterns → heuristic fallback. Standard SC layout: `BORROWER:\n[LLC]\n\nBy ___\n\nName, Title`. Browser errors return partial result — they do not raise.

**Step 1 — GVL tax query (`votaxqry`):** Form at `greenvillecounty.org/appsas400/votaxqry/`. Force `hdn_SearchCategory = "Real Estate"` via `page.evaluate()`. Strip LLC/INC/CORP and "AND ..." joint suffixes. Results: `cells[0]`=name+href · `cells[1]`=Map#/PIN. Skip vehicle codes. Name-flip retry on 0 results.

**Step 1b — PIN Pivot:** Fetch `RealProperty/Details.aspx?MapNumber=<PIN>` (public). Shows Owner/Care Of/Mailing Address. If Care Of = human → done. If mailing is residential → GIS name search at that address.

**Step 2 — DuckDuckGo (5 queries):** `[entity] Greenville SC owner` · `site:businessfilings.sc.gov "[entity]"` · `site:upstatebusinessjournal.com "[entity]"` · `site:gsabizwire.com "[entity]"` · mailing address query. Email + phone regex extracted from snippets.

**Step 2b — Initials logic:** If LLC = `[2-5 initials] + Partners/Group/etc.`, rank candidates whose initials match.

**Step 2c — PDL person enrichment** (`enrich_contact.py`): fires after a human name is resolved if DDG didn't surface email + phone. 100 free credits/month; credits consumed only on successful matches.

**Step 2d — PDL company enrichment:** last-resort fallback.

**Step 3 — Manual queue:** Log mailing address + ROD viewer link, set `enrichment_status = 'pending'`.

### Other enrichment details

- **`ENRICH_VERSION`** in `enrich_models.py` (currently `1`) written to every row. Bump when chain meaningfully improves.
- **Location:** `save_enriched_lead()` sets `location` to GIS address → `signal.location` if it passes `_is_street_address()` → null. Dashboard validates with `isStreetAddress()` before rendering.
- **Name normalization:** `normalize_person_name()`: ALL-CAPS `LASTNAME FIRSTNAME MIDDLE` → `Firstname Lastname`. Drops middle names, preserves JR/SR/II/III. For simple deed grantees (≤3 words, no "AND"), deed `entity_name` preferred over GIS.

## Website Prospects Pipeline (scripts/prospects/)

Outbound pitch list: dental + PI with visible website problems. Populates `website_prospects`, surfaces on `/dashboard/prospects`.

```bash
cd scripts
python -m prospects.run_prospects --discover --vertical dental --county greenville [--dry-run] [--limit N]
python -m prospects.run_prospects --discover --all
python -m prospects.run_prospects --audit-pending [--limit 10] [--vertical dental]
python -m prospects.run_prospects --audit-url https://example.com
python -m prospects.run_prospects --re-audit --days 30 [--limit N]
python -m prospects.run_prospects --digest [--min-severity 40] [--dry-run]
```

**Flow:** Places discovery writes rows as `pending` → `--audit-pending` runs Playwright mobile+desktop capture, detectors, PageSpeed Insights, uploads screenshots, writes severity (0-100) + tag (HOT ≥70 / WARM ≥40 / COLD).

**Practitioner filter** (`is_practitioner_name()` in `discover.py`): Google Places returns both practice-level records (the outreach target) and individual-dentist/attorney GBPs (e.g., "Doty Karen", "Hammes Emily DDS") — the latter usually lack a `websiteUri` because the practice's site covers them, so they'd get auto-tagged 100/HOT as "no website" and pitching "you have no website" to Dr. Doty torches credibility. The classifier drops a row if the display name has no practice/firm keyword AND either carries a credential suffix (DDS/DMD/Esq/…) OR matches a bare person-name pattern. Runs at discovery; one-shot backfill: `python -m prospects.cleanup_practitioners [--dry-run]`.

**Automation:** `.github/workflows/weekly-prospects.yml` runs Mondays 14:00 UTC. Secrets: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `RESEND_API_KEY`, `NOTIFICATION_EMAIL`, `GOOGLE_PLACES_API_KEY`, optional `GOOGLE_PAGESPEED_API_KEY`.

**Digest dedup:** `digest.py` sends HOT/WARM rows where `emailed_at IS NULL` and stamps `emailed_at = now()` on send.

**FB outreach drafts (`message_draft.py`):** Pure-function template generator the dashboard pre-fills into prospect cards. Outbound runs from Alex's *personal* Facebook account (FB programmatic messaging is a ToS-bannable account-loss risk; emails bounce too often) — so the goal is to make manual paste-and-send fast, not to automate sending. `pick_top_issue(prospect)` picks the storyline (`no_website` > `forms_unreachable` > `no_viewport` > `no_https` > `lighthouse_low` > `stale_copyright` > `generic`); `generate_fb_message(prospect)` returns the draft string. Voice rules (locked in tests): compliment opener fires only when `google_rating ≥ 4.0` AND `google_review_count ≥ 10` (fake praise on a 3-star, 4-review practice torches credibility); the top issue is framed as the *villain* (revenue/patient loss), never the bare technical finding; NO price / cadence / retainer in first touch; sign-off is `-Alex`; recency adverb ("this morning" / "this week" / …) varies deterministically by `place_id` so the same word doesn't appear in every drafted message. TypeScript twin at `src/lib/messageDraft.ts` powers the dashboard — keep both in lockstep when editing voice (canonical tests live in `scripts/tests/test_prospects.py`).

**Direct-mail audit packets (`audit_packet.py`):** Renders a 2-page print-ready HTML (cover letter + falsifiable findings) per prospect, plus `envelope.txt` + `followup_dm.txt` sidecars. Pure rendering functions (`render_letter_html`, `render_audit_html`, `render_packet_html`, `render_envelope_text`, `build_findings`) are unit-tested in `scripts/tests/test_audit_packet.py` — voice rules (no price first-touch, villain framing, falsifiable verify-yourself line per finding, anti-punchy closer) are locked there. `revalidate_issues()` re-probes HTTPS + form-action URLs over plain HTTP before rendering so we don't ship a packet about a fixed leak.

CLI: `python -m prospects.audit_packet --top N [--tier upstate|any] [--upload] [--email] [--no-revalidate]`. `--upload` writes the packet HTML to the `prospect-audits` Supabase Storage bucket as `{prospect_id}/packet-{ts}.html` and stamps `website_prospects.packet_html_url / packet_envelope_text / packet_generated_at`. `--email` queries for the highest-severity row with a packet but `packet_emailed_at IS NULL`, sends the print-it-yourself email to `NOTIFICATION_EMAIL` via Resend, stamps `packet_emailed_at`. The packet URL surfaces on `/dashboard/prospects` via the row drawer — that's the "click prospect → view packet" path that replaced opening local files in VS Code.

**GH Actions — daily-packet.yml:** 12:00 UTC every day (~7am EST). Runs `audit_packet.py --top 50 --upload --email --no-revalidate` so dashboard packet links stay fresh AND the next-up packet lands in the inbox to be printed and mailed. Secrets: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `RESEND_API_KEY`, `NOTIFICATION_EMAIL`. No Playwright, no PageSpeed — pure render-and-upload, finishes in <2 min for top 50.

**FB Page URL mining:** `contact_extract.extract_facebook_url(html)` (pure function over already-crawled HTML) recovers the practice's FB Page from footer/contact links. Filters share buttons, plugin embeds, `/posts/`, `/photos/`, `/videos/`, FB SDK version paths, and the FBML xmlns. Picks the most-frequently-referenced canonical URL; vanity beats `/pages/Name/12345` form. Wired into `audit.py` → persists to `website_prospects.facebook_url`. Backfill for already-audited rows: `python -m prospects.backfill_fb [--limit N] [--refresh] [--dry-run]` — uses plain `requests` (cheap, no Playwright); JS-rendered-only sites get picked up on the next `--re-audit`.

**Detector philosophy:** low false-positive rate over coverage. Forms probed on **every crawled page** (home + contact/about/team) — forms often live on `/contact`. Only absolute actions returning **404 or 410** flip `forms_unreachable`; triggering page URL + dead action land in `issues.forms_unreachable_page` / `forms_unreachable_action` so outreach can quote them. 405/403/5xx demote to `forms_unverifiable` — false-positive form claims torch sender credibility.

**Severity weights:** viewport_missing +35, no_https +30, forms_unreachable +30, lighthouse <20 +25 / <40 +15, stale_copyright up to +20, mixed_content +10. No-website = instant 100/HOT.

**Contact extraction** (`contact_extract.py`, pure): `audit.py` follows up to 3 same-origin links with `about` / `contact` / `team` in path. Combined HTML → `extract_decision_maker()` + `rank_emails()`. `primary_email` = top-ranked email with score ≥ 50 (person-identified). `fallback_email` = best address below that threshold.

**Geography:** 15 SC counties × 2 verticals (dental, personal_injury). Tier 1 — Upstate (Greenville, Spartanburg, Anderson, Pickens, Oconee). Tier 2 — statewide metros added Apr 2026 once the Upstate pool dried up: Charleston / Berkeley / Dorchester (Charleston tri-county), Richland / Lexington (Midlands), Horry / Florence (Coast / Pee Dee), York (Rock Hill), Aiken, Beaufort. Adding a county = edit `COUNTIES` in `scripts/prospects/discover.py` AND `COUNTY_LABELS` in `scripts/audit_stats.py` (the latter feeds cited stats in `/insights` posts).

## Python Gotchas

**Deps:**
- `google-genai` requires `httpx>=0.28.1`. Do not downgrade `supabase` below 2.15.0.
- Tesseract: install binary separately. Override: `TESSERACT_CMD`. Missing binary degrades gracefully.
- `playwright install chromium` required after `pip install playwright`.

**GVL tax query (`votaxqry`):**
- `gcgis.org` ArcGIS API times out for non-browser requests — don't use.
- `greenvillecounty.org/vRealPr24/` returns 500 — don't use.
- New deed grantees may return 0 GIS results for weeks — county records lag filings.

## Open Tech Debt

- **Partial unit-test coverage** — `scripts/tests/test_prospects.py` covers the `scripts/prospects/` pure functions (`is_practitioner_name`, `detect_*`, `score_severity`, `extract_emails`, `rank_emails`, `extract_decision_maker`, candidate-page helpers). Run: `python -m unittest scripts.tests.test_prospects -v`. Still uncovered on the enrichment side: `normalize_person_name()`, `score_signal()`, `_parse_borrower_from_text()`, `is_enriched()`.
- **`fetch_pending_signals` NOT IN query** — `.filter("id", "not.in", ...)` passed as URL param; hits length limits at ~2000+ enriched signals.
- **`principal_role` constants** — defined in `enrich_models.py`. TypeScript dashboard maps confidence tiers by `startsWith()` prefix.
