# REBB Advisors Website

## Business Context

**Business:** REBB Advisors  
**Market:** Upstate SC (Greenville County focus)  
**Target customers:** Local service businesses — landscaping, pool services, pressure washing, HVAC, electrical, facilities management, and similar trades.  
**Tone:** Confident, minimal, high-end. Blunt and specific. No fluff. No generic marketing language.

### Core Positioning (use this language exactly)

REBB is **proactive**, not reactive. Legacy agencies are all passive:
- **The Creative Play** — branding, logos, storytelling
- **The Inbound Play** — SEO, Google Ads, social media
- **The Platform Play** — ServiceTitan, HubSpot, CRMs

All three wait for a search event. By then the prospect is already talking to 10 competitors and you've lost the pricing war.

**REBB's differentiator (exact copy):**  
> "Most agencies wait for your customers to search. We don't. We programmatically sync Greenville County property transfers and new business filings to identify your next high-value contract before your competitors even know it exists."

### The Three Pillars ("How We Do It")

1. **The Signal** — Our Python-driven engine monitors municipal data daily to flag economic triggers (new leases, property sales, industrial permits).
2. **The Resolution** — We match fragmented public records to find the specific decision-maker — not just a generic LLC name.
3. **The Infrastructure** — We deploy lightning-fast React systems that capture and warm up those leads on autopilot.

### The Upstate Multiplier

The proprietary data product. Daily Python-driven syncs of Greenville County property transfers + new business filings (deeds, mortgages, SOS), cross-referenced to surface warm prospects with real contact info. High-confidence leads (score > 80) trigger an immediate email alert. Full ranked call list delivered every Monday morning. The framing: **"Who do I call this week to make money?"**

### The Offer

**30-Day Risk-Free Revenue Sprint**  
- High-speed site deployed in 5 days (pre-optimized React/Vite template)  
- The Multiplier dashboard goes live (manually at first if needed)  
- Automated lead capture + follow-up sequences installed  
- Goal: one lead the client wouldn't have found otherwise within 30 days  
- Full refund if not delivered. No questions.

## Tech Stack

- **Framework:** Next.js 16.2.2 (App Router, Turbopack)
- **Styling:** Tailwind CSS v4 (config via CSS `@theme` in `globals.css`, not `tailwind.config.js`) + `@tailwindcss/typography` for prose/article pages
- **Language:** TypeScript
- **React:** 19
- **Database:** Supabase (Postgres + Realtime)
- **Supabase JS client:** `@supabase/supabase-js`
- **Markdown rendering:** `marked` (server-side, used on `/insights/[slug]` and `/review`)
- **Email:** Resend (`requests` POST — no SDK, already in Python deps)
- **AI generation:** `google-genai` SDK (`from google import genai`), model `gemini-2.5-flash`

## Project Structure

```
src/
├── app/
│   ├── globals.css                 — design tokens, base styles, @plugin typography
│   ├── layout.tsx                  — root layout wrapping Nav + Footer
│   ├── page.tsx                    — homepage (includes Services section linking all 4 service pages)
│   ├── how-it-works/page.tsx
│   ├── case-study/page.tsx
│   ├── contact/page.tsx
│   ├── lead-intelligence/page.tsx  — The Upstate Multiplier standalone page
│   ├── seo/page.tsx                — Local SEO audits + GBP optimization
│   ├── web-development/page.tsx    — React/Next.js site builds (5-day sprint)
│   ├── outreach-automation/page.tsx — Email/SMS follow-up sequences
│   ├── insights/
│   │   ├── page.tsx                — listing page (PUBLISHED only, ISR 60s)
│   │   └── [slug]/page.tsx         — individual article page (ISR 60s)
│   ├── review/page.tsx             — protected draft review page (token-gated)
│   └── api/
│       └── publish/route.ts        — GET ?id=&token= → flips status, revalidates /insights
├── components/
│   ├── Nav.tsx                     — sticky header with Services dropdown + mobile accordion (client component)
│   ├── Footer.tsx
│   ├── LiveSignalFeed.tsx          — real-time Multiplier terminal (client component)
│   ├── ThemeProvider.tsx           — dark/light theme context; reads/writes localStorage; applies `dark` class to <html> (client component)
│   └── DarkModeToggle.tsx          — fixed bottom-right floating moon/sun button; consumes ThemeProvider context (client component)
└── lib/
    └── supabase.ts                 — Supabase client singleton (null if env vars not set)

scripts/
├── generate_insights.py            — Gemini → DRAFT → email notification
├── approve_post.py                 — CLI to list/view/edit/publish drafts
├── weekly_insights.py              — topic rotation runner (GitHub Actions every Monday 8am EST)
├── run_weekly.bat                  — legacy Windows Task Scheduler launcher (superseded by GitHub Actions)
├── run_daily.py                    — Daily pipeline orchestrator: deeds → mortgages → enrich → high-confidence alert
├── run_daily.bat                   — legacy Windows Task Scheduler launcher (superseded by GitHub Actions)
├── gvl_monitor.py                  — Python scraper + Supabase push (market_signals) — deeds (GovOS), SOS (DDG), mortgages (CountyWeb)
├── enrich.py                       — LLC → human enrichment pipeline (market_signals → enriched_leads)
├── weekly_leads_digest.py          — email digest of enriched leads → NOTIFICATION_EMAIL via Resend
├── requirements.txt                — full Python deps (local dev — includes playwright)
├── requirements-insights.txt       — lightweight deps for insights generation (no Playwright)
└── requirements-scraper.txt        — minimal deps for cloud daily pipeline (Playwright + pytesseract + thefuzz)

.github/
└── workflows/
    ├── weekly-insights.yml         — Monday 8am EST: weekly_insights.py → Gemini draft → review email
    └── daily-leads.yml             — Daily 4am EST: mortgages → enrich → high-confidence alert

supabase/
└── schema.sql                      — all tables: market_signals, blog_posts, clients, enriched_leads
```

## Design System

**Colors:**
- Background: white (`#ffffff`)
- Text: near-black (`#0a0a0a`)
- Accent / CTA: green (`green-500` = `#22c55e`, `green-600` = `#16a34a`)
- Dark sections: `gray-950`
- Borders: `gray-100` / `gray-200`

**Typography:** System font stack (`ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI"`)  
— Google Fonts (Inter) was intentionally avoided due to Turbopack http2 fetch failure in this environment.

**Spacing:** Generous — sections use `py-24 md:py-32`. Max content width `max-w-6xl`. Article pages use `max-w-2xl`.

**Design direction:** Stripe / Linear aesthetic — lots of whitespace, strong type scale, minimal decoration.

## Key Conventions

- Tailwind v4 uses `@theme {}` in `globals.css` for custom tokens — no `tailwind.config.js`
- Typography plugin added via `@plugin "@tailwindcss/typography"` in `globals.css`
- All pages are server components (no `use client` except Nav, LiveSignalFeed, ThemeProvider, and DarkModeToggle)
- Dark mode: class-based (`html.dark`). `ThemeProvider` manages state via localStorage. CSS overrides in `globals.css` under `html.dark`. Palette: bg `#0d1f16`, dark sections `#060f09`, text `#dff0e6`. `suppressHydrationWarning` on `<html>` + inline script in `<head>` prevent theme flash on reload.
- CTAs always link to `/contact`
- Section labels use `text-xs font-semibold uppercase tracking-widest text-green-600`
- Dark CTA sections use `bg-gray-950` or `bg-black` with `green-500` buttons
- Article body rendered with `prose prose-gray max-w-none` + `dangerouslySetInnerHTML`

## Supabase

- **Project:** connected via `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Tables:** `market_signals` (public live feed) · `blog_posts` (insights articles) · `clients` (paying REBB clients) · `enriched_leads` (premium human-layer data — private)
- **Realtime:** enabled on `market_signals` via `supabase_realtime` publication
- **Schema:** `supabase/schema.sql` — run this in the SQL editor on a new project
- **RLS summary:** `market_signals` + `blog_posts` have public SELECT policies · `clients` + `enriched_leads` have no public access (service key only)

### market_signals columns

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK, auto-generated |
| `created_at` | timestamptz | auto |
| `timestamp` | timestamptz | when the real-world event occurred |
| `event_type` | text | `PROPERTY TRANSFER` / `NEW BUSINESS FILING` / `INDUSTRIAL PERMIT` / `MORTGAGE_FILING` |
| `location` | text | street address or entity name |
| `entity_name` | text | fuzzy-resolved company/owner name |
| `valuation` | numeric | dollar amount if known |
| `details` | text | one-line human-readable context |
| `score` | integer | 0–100 lead priority |
| `tag` | text | `HOT` / `WARM` / `COLD` |
| `source` | text | `deeds` / `sos` / `permits` / `demo` / `mortgages` |
| `source_url` | text | source page URL (optional) |
| `status` | text | lead status (optional) |
| `source_key` | text | dedup key — unique constraint, NULLs exempt (demo signals) |
| `signal_type` | text | `MORTGAGE_FILING` or null — tells enrich.py to prioritise OCR signature extraction |

### LiveSignalFeed component behavior

- **No env vars set:** renders mock data, footer shows `DEMO MODE`
- **Env vars set:** fetches last 6 signals on mount, subscribes to Postgres `INSERT` via Realtime
- **New signal arrives:** border flashes green, header shows `NEW SIGNAL`, row slides in at top
- Feed is capped at 6 visible rows (scrollable); new inserts push oldest off the list

### blog_posts columns

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK, auto-generated |
| `created_at` | timestamptz | auto |
| `updated_at` | timestamptz | auto-updated via trigger |
| `title` | text | article title |
| `slug` | text | unique URL slug |
| `body_md` | text | full article in Markdown |
| `summary` | text | one-paragraph excerpt for listing page |
| `tags` | text[] | array of topic tags |
| `status` | text | `DRAFT` / `APPROVED` / `PUBLISHED` |
| `published_at` | timestamptz | set automatically when status → PUBLISHED |
| `author` | text | defaults to `REBB Advisors` |
| `topic` | text | the prompt passed to generate_insights |
| `gemini_model` | text | e.g. `gemini-2.5-flash` |

**RLS:** public SELECT allowed only where `status = 'PUBLISHED'`. Service key bypasses RLS for all writes.

### clients columns

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `created_at` | timestamptz | auto |
| `name` | text | e.g. `Greenville HVAC Co` |
| `slug` | text | unique, URL-safe — used in dashboard URL |
| `token` | text | secret for token-gated dashboard access |
| `trade_tags` | text[] | `hvac` / `landscaping` / `electrical` / `cleaning` / `security` |
| `contact_name` | text | owner/decision-maker at client company |
| `contact_email` | text | |
| `status` | text | `trial` / `active` / `inactive` |
| `notes` | text | freetext |

### enriched_leads columns

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `created_at` / `updated_at` | timestamptz | auto |
| `signal_id` | uuid | FK → `market_signals.id` |
| `client_id` | uuid | FK → `clients.id` — null = unassigned/in queue |
| `principal_name` | text | unmasked human name — "Marcus Lee" |
| `principal_role` | text | `Manager` / `CEO` / `Registered Agent` |
| `contact_email` | text | |
| `contact_phone` | text | |
| `linkedin_url` | text | |
| `search_evidence` | text | URL to SC SOS filing, deed page, or Google result used |
| `enrichment_status` | text | `raw` / `pending` / `enriched` |
| `trade_tag` | text | drives client routing — `hvac` / `landscaping` / etc. |
| `event_type` | text | copied from signal for convenience |
| `location` | text | copied from signal |
| `valuation` | numeric | copied from signal |
| `score` | integer | copied from signal |
| `tag` | text | `HOT` / `WARM` / `COLD` |
| `notes` | text | manual research notes |

**Enrichment flow:** scraper inserts to `market_signals` → `enrich.py` creates linked row in `enriched_leads` with `enrichment_status = raw` → runs multi-step lookup chain → if principal found, status → `enriched` · if still LLC only, status → `pending` (manual queue)

## Market Insights Engine (Human-in-the-Loop)

AI-generated SEO articles with a mandatory manual approval gate. Nothing reaches `/insights` without an explicit publish action.

### Full workflow

```
1. generate_insights.py --topic "..."
        ↓
2. Gemini 2.5 Flash writes article → saved as DRAFT in Supabase
        ↓
3. Email sent to alex@rebbadvisors.com with:
   - "Review Article →" button  → opens /review page (rendered article + Publish bar)
   - "Publish Now →" button     → hits /api/publish directly
        ↓
4. Click Publish → status flips to PUBLISHED → revalidatePath('/insights') fires
        ↓
5. Article live at /insights/[slug] immediately
```

### Scripts

```bash
cd scripts
pip install -r requirements-insights.txt   # lightweight install (no C compiler needed)

# Generate a draft
python generate_insights.py --topic "Why Greenville pool companies lose Q2 contracts"
python generate_insights.py --topic "..." --dry-run    # preview only, no DB write

# Test email configuration
python generate_insights.py --test-email

# Weekly runner (runs automatically via GitHub Actions every Monday 8am EST)
python weekly_insights.py                  # picks next topic from rotation, generates draft
python weekly_insights.py --dry-run        # show which topic would run, no generation

# Review queue (terminal-based alternative to email buttons)
python approve_post.py --list-drafts
python approve_post.py --id <uuid> --view
python approve_post.py --id <uuid> --edit                # opens Notepad (or $EDITOR)
python approve_post.py --id <uuid> --status PUBLISHED
python approve_post.py --id <uuid> --status DRAFT
```

**Editor for `--edit`:** defaults to Notepad. Set `EDITOR=code --wait` in `.env.local` for VS Code.

### Topic generation

`weekly_insights.py` generates topics autonomously — no fixed list, no state file. Each run:
1. Queries Supabase for the last 20 article titles (avoids repeating angles)
2. Calls Gemini with a meta-prompt defining 6 category buckets and good/bad examples
3. Gemini generates 3 scored candidates from different categories and returns the winner
4. That topic string is passed to `generate_insights.py`

To adjust the topic space, edit `CATEGORIES` in `weekly_insights.py`. To bias toward a category, list it more than once. No state file to manage, no commit-back step in CI needed.

### Daily Pipeline (run_daily.py)

Orchestrates the full data pipeline in sequence:
1. `gvl_monitor.py --scrape all` — GovOS deeds + SC SOS filings (**local only** — fragile GovOS login, not in cloud)
2. `gvl_monitor.py --mode mortgages` — CountyWeb MTG/CON filings
3. `enrich.py --run-pending` — LLC → human enrichment (up to 10 signals)
4. Query `enriched_leads` for score > 80 rows created this run → email alert via Resend

```bash
python run_daily.py                  # full run (local — includes deed scraper)
python run_daily.py --dry-run        # no DB writes, no emails
python run_daily.py --days 14        # 14-day scraper look-back
python run_daily.py --no-deeds       # skip deed scraper (what GitHub Actions runs)
python run_daily.py --no-mortgages   # skip mortgage scraper
python run_daily.py --no-enrich      # skip enrichment
python run_daily.py --no-alert       # skip email alert
```

**Cloud automation (GitHub Actions):** `.github/workflows/daily-leads.yml` runs at 4am EST daily:
- Step 1: `python gvl_monitor.py --mode mortgages` (CountyWeb)
- Step 2: `python enrich.py --run-pending`
- Step 3: `python run_daily.py --no-deeds --no-mortgages --no-enrich` (alert only)
- Deed scraper (`--scrape deeds`) is excluded — run locally when needed: `python gvl_monitor.py --scrape all`
- Uses `requirements-scraper.txt` + system Tesseract (`apt-get install tesseract-ocr`)
- Python 3.12 required (f-string backslash syntax used in enrich.py)

**Secrets required in GitHub repo** (Settings → Secrets → Actions):
`SUPABASE_URL` · `SUPABASE_SERVICE_KEY` · `RESEND_API_KEY` · `NOTIFICATION_EMAIL` · `ROD_PASSWORD` · `ROD_VIEWER_USERNAME`

### GitHub Actions — Weekly Insights

`.github/workflows/weekly-insights.yml` runs every Monday at 8am EST (13:00 UTC):
- Calls `weekly_insights.py` → Gemini draft → Supabase → review email
- Commits updated `last_topic_index.txt` back to `main` after each run
- Uses `requirements-insights.txt`, Python 3.12, no Playwright needed

**Secrets required:** `SUPABASE_URL` · `SUPABASE_SERVICE_KEY` · `GEMINI_API_KEY` · `RESEND_API_KEY` · `NOTIFICATION_EMAIL` · `PUBLISH_SECRET` · `NEXT_PUBLIC_SITE_URL`

### /review page

- URL: `https://rebbadvisors.com/review?id=<uuid>&token=<PUBLISH_SECRET>`
- Server component — fetches draft using service key (bypasses RLS)
- Renders full Markdown article with sticky top bar + bottom Publish button
- Protected by token comparison; returns error page on mismatch
- Not linked from public nav — only accessible via email

### /api/publish route

- `GET /api/publish?id=<uuid>&token=<PUBLISH_SECRET>`
- Validates token, flips `status → PUBLISHED`, sets `published_at`
- Calls `revalidatePath('/insights')` — listing page updates instantly
- Returns branded HTML response page (success or error)
- Idempotent — safe to call on an already-published post

## Python Scraper (market_signals)

```bash
cd scripts
pip install -r requirements-scraper.txt   # minimal: playwright, pytesseract, thefuzz, supabase
# OR for full local env:
pip install -r requirements.txt           # full dump (includes unrelated packages)
playwright install chromium               # one-time, ~130MB

python gvl_monitor.py --demo --count 15           # seed mock data
python gvl_monitor.py --demo --dry-run            # preview without writing
python gvl_monitor.py --scrape deeds              # scrape GVL Register of Deeds (GovOS portal)
python gvl_monitor.py --scrape sos                # scrape SC SOS filings
python gvl_monitor.py --scrape all                # both sources
python gvl_monitor.py --scrape all --days 14      # look back 14 days (default: 7)
python gvl_monitor.py --scrape deeds --debug      # save raw HTML to scripts/debug/ for selector tuning
python gvl_monitor.py --scrape all --dry-run      # preview without writing to Supabase
python gvl_monitor.py --mode mortgages            # scrape MTG/CON filings (CountyWeb viewer)
python gvl_monitor.py --mode mortgages --dry-run  # preview without writing to Supabase
python gvl_monitor.py --mode mortgages --debug    # save debug HTML to scripts/debug/mtg_cw_*.html
python gvl_monitor.py --mode mortgages --days 14  # look back 14 days
```

- Reads `.env.local` from project root automatically
- Uses `SUPABASE_URL` + `SUPABASE_SERVICE_KEY`
- Fuzzy entity deduplication via `thefuzz` (within a single run)
- Cross-run deduplication via `source_key` upsert — deeds key: `"deeds:{GRANTEE}:{rec_date}"`, mortgage key: `"mtg:{BORROWER}:{rec_date}"`, SOS key: entity detail URL. Demo signals have no key and always insert.

### Two-portal architecture

| Flag | Portal | Credentials | Doc types |
|---|---|---|---|
| `--scrape deeds` | GovOS (`greenville.sc.publicsearch.us`) | `ROD_EMAIL` + `ROD_PASSWORD` | DEED, WARRANTY DEED, DEED OF TRUST, QUIT CLAIM |
| `--scrape sos` | DuckDuckGo → SC SOS detail pages | none | LLC filings |
| `--mode mortgages` | CountyWeb (`viewer.greenvillecounty.org`) | `ROD_VIEWER_USERNAME` + `ROD_PASSWORD` | MTG, CON, MORTGAGE, CONSTRUCTION MORTGAGE |

### ROD scraper (`scrape_greenville_deeds`)

Uses the GovOS public portal (`greenville.sc.publicsearch.us`) — Playwright signs in with `ROD_EMAIL` / `ROD_PASSWORD`, sets the start date on the React datepicker, clicks the search submit button (`data-testid="searchSubmitButton"`), and processes results in three phases.

**One-time setup:** Register a free account at `https://greenville.sc.publicsearch.us/register`, then add to `.env.local`:
```
ROD_EMAIL=your@email.com
ROD_PASSWORD=yourpassword
```

**Three-phase scrape:**
- **Phase A** — Parse search results HTML (BeautifulSoup) to identify qualifying deed rows. Column map: `cells[6]` = recorded date · `cells[7]` = doc type · `cells[8]` = grantor · `cells[9]` = grantee · `cells[10]` = `N/A` (consideration not in results table)
- **Phase B** — Click each qualifying row in Playwright to open the deed detail panel. Extract actual consideration amount and property/situs address. Randomised 3–5 second delay between clicks to avoid IP ban. `_parse_govos_detail()` returns `(consideration, property_address)` — tries labeled fields (`"Property Address:"`, `"Situs Address:"`) then a street-number regex fallback.
- **Phase C** — Build `MarketSignal` objects. `location` = property address from detail page (when found) → grantor name fallback. Signals are properly scored HOT/WARM/COLD based on real sale price instead of base 78.

**Filter**: only `DEED`, `DEED OF TRUST`, `WARRANTY DEED`, `QUIT CLAIM` doc types are kept — mortgages and releases are skipped.

**Valuation**: The search results table always shows `N/A`. The individual deed detail page has the real sale price — Phase B extracts it. Without it, signals score at base 78.

**Property address**: `_parse_govos_detail()` attempts to parse a situs address from the deed detail page (labeled fields + street-number regex). If found it becomes `location`; if not found, `location` falls back to the grantor name. `enrich.py` can further resolve the location via GIS when it's still a name.

**Grantee names** are in deed format (`LASTNAME FIRSTNAME`) — `enrich.py`'s `normalize_person_name()` converts these to natural order during enrichment.

### SOS scraper (`scrape_sc_sos_filings`)

SC SOS search has a CAPTCHA — direct scraping is blocked. Instead, uses DuckDuckGo (`site:businessfilings.sc.gov "Greenville"`) to surface entity detail page URLs, then fetches each detail page directly (no CAPTCHA on detail URLs). Entity detail URL pattern: `businessfilings.sc.gov/BusinessFiling/Entity/Details/{id}`

**Known limitation**: DDG may return 0 results if recent SC SOS pages haven't been indexed yet. Fall back to `enrich.py` for individual entity lookups in that case.

### Mortgage monitor (`scrape_greenville_mortgages`) — `--mode mortgages`

Uses the CountyWeb ROD viewer (`viewer.greenvillecounty.org/countyweb`) — the standard county portal, NOT GovOS/Neumo. Credentials: `ROD_VIEWER_USERNAME` (default: `asteryous`) + `ROD_PASSWORD`.

**Navigation** (nested iframe architecture — same session as `enrich.py` mortgage OCR):
login → `bodyframe` → disclaimer accept → `searchMain.do` nav click → `dynSearchFrame` → `criteriaframe` → `executeSearch()` → `resultListFrame`

**Search strategy**: date-range only (no entity name) — returns all filings in the window, then filters rows for MTG / CON doc types in the datagrid.

**Column orientation** (opposite of deed scraper):
- Grantor = **borrower** (the LLC pledging property — who we want)
- Grantee = **lender** (bank / financial institution)

**Result parsing**: rows are `tr[datagrid-row-index]`, doc type is `td[field='7']` (confirmed). Grantor/grantee/date/consideration pulled from `td[field='N']` cells; JS `documentRowInfo[N]` used as fallback if cells are empty. Run `--debug` and inspect `scripts/debug/mtg_cw_08_results.html` if field numbers need adjustment.

**Signals inserted**:
- `event_type = "MORTGAGE_FILING"`, `signal_type = "MORTGAGE_FILING"`, `source = "mortgages"`
- `signal_type` tells `enrich.py` to run Step 0 (OCR signature extraction) first
- Scoring: MTG base 82 (WARM), CON base 88 (HOT) — both boosted by loan amount

**Dedup key**: `mtg:{BORROWER}:{rec_date}`

**Field number note** — Greenville CountyWeb datagrid (verified from `mtg_cw_08_results.html`):
`field 3` = instrument # · `field 4` = book · `field 5` = page · `field 6` = rec date · `field 7` = doc type · `field 9` = grantor (borrower) · `field 11` = grantee (lender) · consideration not in results table

## Lead Enrichment Engine (enrich.py)

Takes a raw `market_signals` row (LLC name + address) and attempts to unmask the real human decision-maker. Writes results to `enriched_leads`.

### Free enrichment chain (no paid APIs)

```
Step 1   — Greenville County tax query (Playwright headless browser)
             URL: greenvillecounty.org/appsas400/votaxqry/
             Form has NO address field — name search only (txt_Name input).
             Tab selection: click #lnk_RealEstate, then force
             hdn_SearchCategory = "Real Estate" via page.evaluate() — the JS handler
             doesn't always fire before Playwright captures the state.
             Strip "AND ..." from joint-grantee names before searching
             (e.g. "JOHN CONNELL AND LYNDA CONNELL" → search "JOHN CONNELL").
             Strip LLC/INC/CORP suffixes before searching.
             Row filtering: skip rows containing vehicle make codes (CHEV, FORD, GMC,
             TOYT, BOAT, TRLR, etc.) — GVL tax search returns all property types by
             default; the Real Estate tab filters display but noise can still appear.
             Owner name cleanup strips: VIN# data · GVL account numbers appended
             without separator (e.g. "SMITH JOHN2025 000012345 77 001") · "(JTWROS)"
             joint-ownership markers · "View Tax Notice" web artifacts.
             Results table columns: [Name+links | Map # | Permit # | ... | Tax $]
             — there is NO mailing address column in the results table.
             Map # (parcel PIN) is parsed from cells[1] (all-digit, 7-15 chars).
             Detail URL is parsed from the anchor href in cells[0]:
               /appsas400/RealProperty/Details.aspx?MapNumber=...&TaxYear=...
             Both are stored on EnrichmentResult (result.pin, result.detail_url).
             If owner is an LLC: principal_name kept as LLC title-case so is_enriched()
             correctly returns False → proceeds to Step 1b / Step 2.
             If owner is human: the GIS-resolved name is used. For simple deed grantees
             (≤3 words, no "AND") the deed entity_name is used instead because GIS
             concatenates first+middle without spaces ("SMITHKENISHACHERRELL"). This
             override is skipped for joint "AND" names and 4+ word names — those arrive
             in natural order (FIRST LAST) from the deed, and normalize_person_name()
             would invert them.
             Zero results page detected via "Results Found: 0" regex → Name-Flip retry.
             Name-Flip retry (lookup_gis _retried=True):
               Deeds sometimes store grantee names in natural order (FIRST LAST) while
               GIS expects deed order (LAST FIRST). On 0 results, if search term is
               2-3 words, retry once with word order converted:
                 2-word  "DANA BLACKHURST"    → "BLACKHURST DANA"
                 3-word ending in single initial (deed format LAST FIRST M):
                   "FRELISH JEFFREY P" → "FRELISH JEFFREY"  (strip initial — GIS often
                   indexes without it)
                 3-word no single initial (natural format FIRST MIDDLE LAST):
                   "JOHN AARON CONNELL" → "CONNELL JOHN AARON"  (LAST FIRST MIDDLE)
               _retried flag prevents infinite recursion. Notes from both attempts merged.
             Debug mode: set ENRICH_DEBUG=1 to save 4 HTML snapshots to scripts/debug/:
               gis_01_initial_page.html, gis_02_after_real_estate_tab.html,
               gis_03_name_filled.html, gis_04_results.html
             Debug output goes to console only — not written to enriched_leads.notes.

Step 1b  — PIN Pivot (if step 1 returns an LLC)
             Fetch RealProperty/Details.aspx?MapNumber=<PIN>&TaxYear=... with requests.
             This page is publicly accessible (no login required) and shows:
               Owner(s) · Care Of · Mailing Address · Location (situs)
             Implemented in lookup_property_detail(detail_url) → dict.
             Three outcomes:
               A) "Care Of" names a human different from the LLC → use it directly
                  (principal_role: "Care Of (property tax record)")
                  High-confidence hit — returned immediately, no further steps.
                  Bug note: when Care Of is empty, the regex can bleed "Mailing Address: ..."
                  into the care_of value. lookup_property_detail() trims at "Mailing Address:"
                  and rejects values longer than 60 chars to prevent false positives.
               B) Mailing address is residential (no Ste/Suite/Apt/PO Box) →
                  strip house number, search street name in votaxqry → if owner is
                  a human, use them (principal_role: "Property Owner at LLC mailing address (GIS flip)")
               C) Mailing address is commercial (Ste/Suite/Floor etc.) →
                  skip GIS flip, pass address to DDG query 5 instead

Step 2   — DuckDuckGo multi-query search (5 queries)
             q1: "[entity] Greenville SC owner"
             q2: site:businessfilings.sc.gov "[entity]"   → SC SOS entity detail page
             q3: site:upstatebusinessjournal.com "[entity]" → named execs in news coverage
             q4: site:gsabizwire.com "[entity]"            → press releases
             q5: "[mailing address first line]" Greenville SC owner principal
                 (only when PIN pivot found a mailing address — helps surface office tenants)
             SC SOS detail pages have no CAPTCHA — only the search form does.
             source label reflects origin: "Owner (Upstate Business Journal)" etc.

Step 2b  — Initials logic (applied across all DDG results)
             If LLC name matches pattern [2-5 initials] + Partners/Group/Holdings/etc.,
             candidate names whose initials match the LLC prefix are ranked first.
             e.g. "LS Partners" + "Lowndes Smith" → LS == LS → high confidence flag.
             Also applied when SC SOS registered agent name is found.

Step 3   — Manual queue
             If all automated steps fail: logs mailing address (from PIN pivot) +
             context in enriched_leads.notes for manual follow-up.
             Always appends: "Manual Assist: https://neumo.com/products/public-administration-solutions/search/"
             — lets the operator search the deed signature directly to unmask the signing principal.
             Sets enrichment_status = 'pending'
```

### Location resolution

`enriched_leads.location` is resolved in priority order:
1. `result.property_address` — situs address from GIS tax record (most authoritative)
2. `signal.location` if it already looks like a street address (`_is_street_address()` test)
3. Raw `signal.location` fallback (may be grantor name for pre-fix deed signals)

### Name normalization

GIS/deed records return names in ALL-CAPS deed format: `WRIGHT JEFF A`
`normalize_person_name()` converts to natural order: `Jeff Wright`
- Handles: `LASTNAME FIRSTNAME MIDDLE` → `Firstname Lastname`
- Preserves suffixes: `JR`, `SR`, `II`, `III`
- Drops middle names/initials (cleaner for outreach)
- For deed grantees: deed name (from `entity_name`) is preferred over GIS name — GIS concatenates first+middle without spaces, deed has clean first name

### EnrichmentResult fields

| Field | Type | Notes |
|---|---|---|
| `principal_name` | str | Human name found (or LLC title-case if still unresolved) |
| `principal_role` | str | Source label: "Property Owner (tax record)" / "Care Of (property tax record)" / "Property Owner at LLC mailing address (GIS flip)" / "Owner (Upstate Business Journal)" / etc. |
| `property_address` | str | Situs address from GIS tax record (rarely populated — votaxqry results have no address column) |
| `mailing_address` | str | Owner's mailing address — populated by PIN pivot via `lookup_property_detail()` |
| `search_evidence` | str | URL or query string used as primary source |
| `enrichment_status` | str | `enriched` / `pending` |
| `pin` | str | Greenville County Map # (parcel PIN) — parsed from GIS results cells[1] |
| `detail_url` | str | URL to `RealProperty/Details.aspx` for this parcel — used by PIN pivot |

### Known scraping constraints

- `gcgis.org` ArcGIS REST API **times out** for non-browser requests (IP-blocked)
- `greenvillecounty.org/vRealPr24/` returns 500
- Tax query form (`votaxqry`) requires JavaScript for tab selection → Playwright required
- SC SOS search has CAPTCHA → use direct entity detail page URLs found via DuckDuckGo

### Setup (one-time)

```bash
pip install playwright
playwright install chromium   # ~130MB one-time download
pip install -r requirements-insights.txt   # includes beautifulsoup4
```

### Usage

```bash
cd scripts

# ── Mortgage lookup (Step 0) ─────────────────────────────────────────────────

# Test mortgage borrower lookup for a known deed signal (no DB write).
# rec-date is the recording date from market_signals.details ("recorded M/D/YYYY").
# This is the fastest way to verify the full pipeline end-to-end.
PYTHONIOENCODING=utf-8 python enrich.py --entity "Palmetto Holdings Greer LLC" --rec-date "3/21/2023" --dry-run

# With debug — saves HTML snapshots + OCR'd PNGs to scripts/debug/mort_*.html / mort_page_N.png
ENRICH_DEBUG=1 PYTHONIOENCODING=utf-8 python enrich.py --entity "Palmetto Holdings Greer LLC" --rec-date "3/21/2023" --dry-run

# ── GIS / full enrichment ────────────────────────────────────────────────────

# Test full enrichment on a specific entity (no DB write)
python enrich.py --entity "Taylors Commercial Partners" --dry-run

# Debug GIS form interaction — saves HTML snapshots to scripts/debug/gis_*.html
$env:ENRICH_DEBUG="1"; python enrich.py --entity "Some LLC" --dry-run   # PowerShell
ENRICH_DEBUG=1 python enrich.py --entity "Some LLC" --dry-run            # bash

# Enrich a specific signal from Supabase
python enrich.py --signal-id <uuid>

# See what's in the enrichment queue
python enrich.py --list-pending

# Process all unenriched signals (max 10 at a time)
python enrich.py --run-pending --dry-run
python enrich.py --run-pending

# Send weekly leads digest email to NOTIFICATION_EMAIL
python weekly_leads_digest.py                  # last 7 days (default)
python weekly_leads_digest.py --days 14        # look back 14 days
python weekly_leads_digest.py --all            # all enriched leads ever
python weekly_leads_digest.py --dry-run        # preview HTML, don't send

# ── Daily pipeline orchestrator ──────────────────────────────────────────────

python run_daily.py                    # full run: deeds → mortgages → enrich → alert
python run_daily.py --dry-run          # no DB writes, no emails
python run_daily.py --days 14          # 14-day scraper look-back
python run_daily.py --no-deeds         # skip deed scraper
python run_daily.py --no-mortgages     # skip mortgage scraper
python run_daily.py --no-enrich        # skip enrichment pass
python run_daily.py --no-alert         # skip high-confidence email alert
```

### Enrichment Stack Roadmap

Prioritized based on signal quality and build effort. Each layer feeds `enrich.py` as an additional lookup step.

| Tier | Source | What it resolves | Status |
|---|---|---|---|
| Signal | CountyWeb mortgage monitor (`--mode mortgages`) | MTG/CON filings → LLC borrower name as raw signal | **Working** — `gvl_monitor.py`, inserts with `signal_type=MORTGAGE_FILING` |
| Primary | Mortgage OCR (county ROD viewer) | Borrower signature block → individual name + title | **Working** — Step 0 in `enrich.py`. Tested on Palmetto Holdings Greer LLC → Frank Henderson, Member |
| Secondary | UCC lookup (`ucconline.sc.gov`) | Equipment/financing LLCs → possible co-debtor name | Not built |
| Tertiary | City of Greenville business license (FOIA) | Operating businesses → responsible party name | FOIA request drafted — awaiting response |
| Fallback | SOS via DDG + address clustering | Anything still unresolved | Current implementation |

**Mortgage parsing (primary — fully working):**
- SC calls deeds of trust "mortgages". Filed same day as the deed, same grantee/borrower.
- Portal: `viewer.greenvillecounty.org` (standard county viewer — NOT the Neumo/GovOS portal)
- Credentials: `ROD_VIEWER_USERNAME` (default: `asteryous`) + `ROD_PASSWORD` from `.env.local`
- Matching: entity name (LLC suffixes stripped) + recording date ±3 days
- Documents are scanned TIFFs served via HTML5 image viewer (`InstrumentImageView.jsp`)
- Page images fetched via `getPage.do?instnum=N&pageNumber=N` AJAX → `viewImagePNG.do` PNG
- Last 4 pages OCR'd with pytesseract to find signature block: `Frank Henderson, Member`
- Signature block layout: `WITNESS: BORROWER:\n[LLC Name]\n\nBy ___\n\nName, Title`
- Runs as Step 0 in `enrich()` — only for `source="deeds"` LLC signals. Returns immediately on hit.
- OCR requires Tesseract binary: `winget install tesseract-ocr.tesseract` (default path `C:\Program Files\Tesseract-OCR\`). Override with `TESSERACT_CMD` env var.
- Debug: `$env:ENRICH_DEBUG="1"; python enrich.py --entity "Name LLC" --rec-date "M/D/YYYY" --dry-run`

**Signature block extraction (`_parse_borrower_from_text`):**
Two-stage pipeline — structured regex first, scored heuristic scanner as fallback.

Stage 1 — structured regex (`_BORROWER_RE` list, 6 patterns in priority order):
- `BORROWER: … By [scrawl]\nName, Title` — standard SC mortgage layout
- `By [anything]\n\nName, Title` — no explicit BORROWER label
- `BORROWER: Name, Title` — electronic/clean-scan docs
- `BORROWER:\nName, Title` — label and name on separate lines
- `Name:\n<value>\nTitle:\n<value>` — labelled-field format
- `BORROWER: Name` — title-less fallback

Stage 2 — `_heuristic_borrower_scan()` (runs only when all regex patterns fail):
- Locates anchor lines: `BORROWER` (strength 80) → `By:` (60) → `Name:` (40) → last 25 lines (10)
- Per anchor, scans up to 10 following lines for candidates
- Handles labelled fields (`Name:\nJohn\nTitle:\nManager`), single-line `Name, Title`, and split names across two adjacent short lines
- Scores every candidate; deduplicates by normalised name; returns highest scorer above 0

Scoring weights (additive):
- `+40` has a recognised title · `+35` appears after BORROWER label · `+25` appears after By: line
- `−100` entity keyword in name · `−80` noise role (Witness/Notary/Lender) in name · `−30` near witness/notary context line · `−20` near Lender/Mortgagee context

`_is_name_like()` accepts particles: `de`, `la`, `van`, `o`, `mc`, `mac`, `di`, `el`, `al` etc. in lowercase. Rejects all-caps words, 2+ consecutive digits, entity keywords. 2–5 words required.

`_preprocess_ocr()` fixes before any matching: `0→o` mid-word, `1→l` word-start, `|→I`, underscore fields, rule lines, collapsed whitespace.

**CountyWeb portal navigation (deeply nested iframe architecture):**
- Login → `main.jsp` (outer frameset) — click "Search Public Records" nav link (target="bodyframe")
- `bodyframe` loads `SearchMainView.jsp` — another frame container, NOT a simple form
- `SearchMainView.jsp` → `dynSearchFrame` loads `DynSearchCriteriaViewEnhanced.jsp`
- `dynSearchFrame` → `criteriaframe` loads `dyncriteria/dynCriteria.do?searchType=allNames`
- `criteriaframe` has the actual `searchForm` with these fields:
  - Name: easyUI textbox `id="allNames"` → hidden `name="ALLNAMES"` — set via `$('#allNames').textbox('setValue', name)`
  - Date from/to: easyUI datebox `id="FROMDATE"` / `id="TODATE"` — set via `$('#FROMDATE').datebox('setValue', date)`
  - Party: radio `name="PARTY"` — `partyRBBoth` (both), `partyRB1` (grantee=7), `partyRB2` (grantor=6)
  - Doc type filter: hidden `name="INSTTYPE"` (CSV of type IDs) + `name="INSTTYPEALL"` (value=`selected` = all types)
  - DATERANGE: hidden JSON field — auto-populated by datebox onChange handlers
- Search triggered by `cf.evaluate("executeSearch()")` → `parent.executeCommand("search")`
- After login, disclaimer gate in `bodyframe` must be accepted before `searchMain.do` is accessible
- `frame.goto(searchMain.do)` returns 404 — must click outer page nav link (target="bodyframe") instead
- Playwright frame access: `page.frame(name="bodyframe")` → `page.frame(name="dynSearchFrame")` → `page.frame(name="criteriaframe")`
- Results land in `resultFrame` / `resultListFrame` (children of `SearchMainView.jsp`), document in `documentFrame`

**UCC lookup (secondary):**
- Portal: `ucconline.sc.gov` — no CAPTCHA, ASPX form, debtor name search
- Run as enrichment step: given an LLC name, search UCC for any co-debtor (individual personal guarantee)
- Note: real estate mortgages are NOT in this system (those are deed of trust at county ROD). UCC covers equipment/personal property liens only.

**Business license FOIA (tertiary):**
- City of Greenville only (county does not require licenses)
- FOIA request sent to `businesslicense@greenvillesc.gov` — requesting full CSV export with owner/responsible party names
- SC FOIA § 30-4-10: 15 business day response window
- If obtained: load locally, search by LLC name as enrichment lookup
- UCC and business license target different LLC types — run both in parallel, not sequentially

### Client delivery (planned)

Each paying client (`clients` table) has a `slug` + `token`. Planned route:
`/dashboard?client=<slug>&token=<token>` — server component, fetches `enriched_leads` filtered by `client_id`, no login system needed for MVP.

## Known Issues / Notes

- `next.config.ts` sets `turbopack.root: __dirname` to suppress a lockfile warning from `package-lock.json` one level up at `C:\Users\alexs\package-lock.json`
- Google Fonts cannot be used at build time (Turbopack http2 error) — use system fonts or self-hosted
- `python-levenshtein` removed from requirements (requires C compiler on Windows) — `thefuzz` works without it
- `playwright` in `requirements.txt` requires a C compiler; `enrich.py` also uses Playwright — run `playwright install chromium` once after install
- `google-genai` requires `httpx>=0.28.1`; `supabase>=2.15.0` is compatible — do not downgrade supabase to 2.9.0
- `gcgis.org` ArcGIS REST API blocks non-browser requests (connection timeout) — use Playwright for all county data lookups
- `schema.sql` includes a migration that renames `detail` → `details` on `market_signals` — safe to re-run (idempotent DO block)
- ROD scraper requires a free GovOS account (`greenville.sc.publicsearch.us/register`) — `rod.greenvillecounty.org` legacy system also requires account registration (no public/guest access despite what the JS `doGuestLogin()` function implies)
- GovOS is a React SPA — after login, the search app is already loaded on `/`. Do NOT navigate away. Date input uses `aria-label="Starting Recorded Date"` + `press_sequentially()`. Submit uses `data-testid="searchSubmitButton"`. Results use `tr.is-uncertified` row selector.
- GovOS deed detail pages: direct URL pattern (`/document/{id}`) returns 404 — requires a live Playwright session with the row clicked. Phase B handles this. `_parse_govos_detail()` returns `(consideration, property_address)` — now also checks `"Loan Amount:"`, `"Principal Amount:"`, `"Original Principal Amount:"` labels in addition to `"Consideration:"` so it works for both deed and mortgage detail pages.
- GovOS consideration: always `N/A` in the search results table. Real sale price is only on the individual deed detail page — Phase B clicks each row to extract it.
- CountyWeb mortgage monitor (`--mode mortgages`) datagrid field numbers verified from `mtg_cw_08_results.html`: `field 6` = rec date · `field 7` = doc type · `field 9` = grantor (borrower) · `field 11` = grantee (lender) · consideration not present in results. Doc type filter uses exact set membership (not substring) to exclude `SATISFACTION OF MORTGAGE` etc.
- GovOS deed detail pages have **no legal description and no property/situs address** — "Legal Description: No legal description found" on every deed. PIN extraction from deed detail is not possible. The `location` field in `market_signals` for deed-scraped signals is therefore always the grantor name fallback.
- GovOS tax records include vehicle personal property alongside real estate. VIN# data is appended to owner name in the same cell (e.g. `"KIBBE RANDY JAMESVIN#: 1N6AA07D68N358077"`). GVL account numbers are also appended without separator (e.g. `"SMITH JOHN2025 000012345 77 001"`). `enrich.py` strips both before normalizing.
- GVL tax query form (`votaxqry`) has **no address search field** — the only inputs are Account #, Name, VIN, Map #, Permit #, etc. Address-based lookup is not possible; all enrichment uses name search. `txt_Name = input[name="ctl00$bodyContent$txt_Name"]`.
- GVL tax query `hdn_SearchCategory` defaults to `"Car"`. Clicking `#lnk_RealEstate` updates it to `"Real Estate"` via JS, but Playwright must also call `page.evaluate()` to force the value — the tab click alone is not reliable.
- GVL tax query results table columns: `[Name+Receipt links | Map # | Permit # | (misc) | Tax $]` — there is **no mailing address column**. The Map # (parcel PIN) is in `cells[1]`. The detail page URL is embedded in `cells[0]`'s anchor href. `_parse_tax_row` handles owner name cleanup only; address data comes from `lookup_property_detail()`.
- `RealProperty/Details.aspx?MapNumber=<PIN>&TaxYear=...` is publicly accessible (no login) and returns Owner, Care Of, Mailing Address, and situs Location. Used by `lookup_property_detail()` in the PIN Pivot step. Fetched with plain `requests` — no Playwright needed.
- GVL tax records store names in deed order (LAST FIRST MIDDLE). Deeds from GovOS store grantee names in natural order for joint grantees ("JOHN CONNELL AND LYNDA CONNELL"). The Name-Flip retry in `lookup_gis` handles this: on 0 results it tries multiple orderings — 2-word flip, 3-word initial-strip (LAST FIRST M → LAST FIRST), and 3-word full flip (FIRST MIDDLE LAST → LAST FIRST MIDDLE). The deed-name override in `enrich()` is skipped for joint "AND" names to avoid re-inverting the GIS-resolved name.
- New signals with recent deed grantees may return 0 GIS results even after name-flip — county tax records lag a few weeks behind deed filings.
- SOS scraper depends on DuckDuckGo indexing `businessfilings.sc.gov` — may return 0 results if DDG hasn't crawled recent filings; use `enrich.py` for targeted entity lookups as a fallback
- `enrich.py --run-pending` uses a pool-then-filter approach (fetches 500, filters already-enriched, returns first N) — if you have >500 signals you'll need to increase the pool limit in `fetch_pending_signals()`
- Mortgage OCR requires the Tesseract binary installed separately — `pip install pytesseract` only installs the Python wrapper. Run `winget install tesseract-ocr.tesseract` once (installs to `C:\Program Files\Tesseract-OCR\`). `enrich.py` hardcodes that default path; override with `TESSERACT_CMD` in `.env.local` if needed.
- CountyWeb login button has no `type` attribute — `button[type='submit']` selector times out. Login is triggered via `page.evaluate("doLogin()")` instead.
- CountyWeb search results may return `ASSIGNMENT OF RENTS` before `MORTGAGE` for the same LLC. `enrich.py` now scans all result rows for doc type and clicks the MORTGAGE row specifically — not just the first row.
- `viewImagePNG.do` uses the jsessionid embedded in the document viewer HTML (URL path param `; jsessionid=...`), not a cookie. The session must be active (Playwright still running) when the PNG is fetched via `requests`.

## Environment Variables

All of these go in `.env.local` (local) and Vercel dashboard (production).

| Variable | Where needed | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Browser + server | Safe to expose |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + server | Safe to expose; RLS controls access |
| `SUPABASE_URL` | Python scripts | Same value as above |
| `SUPABASE_SERVICE_KEY` | Python scripts + Vercel | Secret — never commit. Required by `/api/publish` and `/review` on Vercel |
| `GEMINI_API_KEY` | Python scripts | Google AI Studio — secret |
| `RESEND_API_KEY` | Python scripts | Resend.com — connected to alex@rebbadvisors.com |
| `NOTIFICATION_EMAIL` | Python scripts | `alex@rebbadvisors.com` |
| `PUBLISH_SECRET` | Python scripts + Vercel | Shared secret for publish/review URLs — set in both places |
| `NEXT_PUBLIC_SITE_URL` | Python scripts | `https://rebbadvisors.com` — used to build button URLs in emails |
| `DISCORD_WEBHOOK_URL` | Python scripts | Optional — Discord alert on new draft |
| `EDITOR` | Python scripts | Optional — editor for `approve_post.py --edit` (default: notepad) |
| `ROD_EMAIL` | Python scripts | Email for GovOS account (`greenville.sc.publicsearch.us`) — required for ROD deed scraper |
| `ROD_PASSWORD` | Python scripts | Password — shared by GovOS deed scraper AND county ROD viewer mortgage lookup |
| `ROD_VIEWER_USERNAME` | Python scripts | Username for county ROD viewer (`viewer.greenvillecounty.org`) — defaults to `asteryous` if not set |
| `TESSERACT_CMD` | Python scripts | Optional — full path to `tesseract.exe` if not at default `C:\Program Files\Tesseract-OCR\tesseract.exe` |

## Deployment

- **Platform:** Vercel (Hobby — free tier)
- **GitHub repo:** https://github.com/jsteryous/rebbadvisors-website
- **Production URL:** https://rebbadvisors-website.vercel.app
- **Custom domain:** rebbadvisors.com (DNS via Cloudflare)
- **Auto-deploy:** Every push to `main` triggers a Vercel production deploy

## Commands

```bash
npm run dev          # local dev server
npm run build        # production build
npm run lint         # eslint
npx vercel --prod    # manual deploy (if needed)
```

## Pages

| Route | Status | Notes |
|---|---|---|
| `/` | Done | Hero + live signal feed, Problem, How We Do It, Services, Multiplier deep dive, Sprint offer, CTA |
| `/how-it-works` | Done | 5-step sprint process, guarantee callout |
| `/lead-intelligence` | Done | Upstate Multiplier deep dive — data sources, 48hr window, ranked call list deliverable |
| `/seo` | Done | Technical audit, GBP optimization, local pack rankings — honest framing (reactive but necessary) |
| `/web-development` | Done | React/Next.js builds, 5-day process, speed stats, no WordPress rationale |
| `/outreach-automation` | Done | Missed call text-back, inbound sequence, estimate follow-up — sequence mockup with Multiplier example |
| `/insights` | Done | PUBLISHED posts listing, ISR 60s, revalidated instantly on publish |
| `/insights/[slug]` | Done | Full article page, ISR 60s, prose rendering via marked |
| `/review` | Done | Token-gated draft review page — linked from email only |
| `/case-study` | Placeholder | Awaiting real client data |
| `/contact` | Done | Intake form + call explainer sidebar |

### Nav Structure

Desktop: logo · **Services ▾** (hover dropdown) · How It Works · Insights · Contact · [Get More Jobs CTA]

Services dropdown links: Lead Intelligence / Outreach Automation / Local SEO / Web Development — each with a subtitle line.

Mobile: hamburger → accordion with Services expanding inline.

### Homepage Section Map

1. **Hero** — Two-column. Left: headline + copy + CTAs. Right: `LiveSignalFeed` — dark Bloomberg-style terminal pulling live data from Supabase, HOT/WARM tags, scrollable, 6 rows.
2. **Problem** — Dark (`gray-950`). Three columns: The Creative Play / The Inbound Play / The Platform Play.
3. **How We Do It** — White. Three pillar cards with SVG icons: The Signal / The Resolution / The Infrastructure.
4. **Services** — Gray-50. Four cards linking to `/lead-intelligence`, `/outreach-automation`, `/seo`, `/web-development`.
5. **Multiplier Deep Dive** — Gray-50. Left: "Who do I call this week" copy. Right: white dashboard card showing ranked decision-maker list with scores.
6. **The Offer** — Dark (`gray-950`). Left: Sprint copy + CTA. Right: four feature cards.
7. **Final CTA** — Black. "Stop competing. Start winning first."
