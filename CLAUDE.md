# REBB Advisors Website

## Business Context

**Business:** REBB Advisors — Upstate SC (Greenville County), targeting local service trades.  
**Tone:** Confident, minimal, blunt. No fluff.

**REBB's differentiator (exact copy):**  
> "Most agencies wait for your customers to search. We don't. We programmatically sync Greenville County property transfers and new business filings to identify your next high-value contract before your competitors even know it exists."

**The Three Pillars:**
1. **The Signal** — Python engine monitors municipal data daily (deeds, mortgages, SOS filings)
2. **The Resolution** — Match fragmented public records to the specific decision-maker
3. **The Infrastructure** — React systems that capture and warm up those leads on autopilot

**The Upstate Multiplier:** Daily syncs of GVL County property transfers + new business filings. Score > 80 triggers immediate email alert. Ranked call list every Monday. Framing: **"Who do I call this week to make money?"**

## Tech Stack

- **Framework:** Next.js 16.2.2 (App Router, Turbopack)
- **Styling:** Tailwind CSS v4 (`@theme {}` in `globals.css`, not `tailwind.config.js`) + `@tailwindcss/typography`
- **Language:** TypeScript / React 19
- **Database:** Supabase (Postgres + Realtime)
- **Auth:** Supabase Auth email+password, `@supabase/ssr` for cookie-based sessions. No public signup — users created manually.
- **Markdown:** `marked` (server-side, `/insights/[slug]` and `/review`)
- **Email:** Resend (raw POST, no SDK)
- **AI:** `google-genai` SDK, model `gemini-2.5-flash`

## Project Structure

```
src/
├── app/
│   ├── globals.css              — design tokens, @plugin typography
│   ├── layout.tsx               — root layout, LocalBusiness JSON-LD
│   ├── opengraph-image.tsx      — edge Satori OG image (auto-injected; don't set openGraph.images)
│   ├── sitemap.ts / robots.ts
│   ├── page.tsx                 — homepage
│   ├── contact/layout.tsx + page.tsx — client component form → /api/contact
│   ├── lead-intelligence / seo / web-development / outreach-automation / how-it-works / case-study
│   ├── insights/page.tsx + [slug]/page.tsx — ISR 60s
│   ├── review/page.tsx          — token-gated draft review
│   ├── dashboard/page.tsx       — enriched_leads ranked list, auth-gated; deduplicates by principal_name (highest score per person)
│   ├── dashboard/login/page.tsx + actions.ts — Supabase Auth server action
│   └── api/contact/route.ts + publish/route.ts
├── components/
│   ├── Nav.tsx, Footer.tsx
│   ├── LiveSignalFeed.tsx       — real-time Supabase Realtime terminal (client)
│   └── ThemeProvider.tsx + DarkModeToggle.tsx — dark mode (client)
└── lib/supabase.ts

proxy.ts   — Next.js 16 route proxy (replaces middleware.ts); guards /dashboard/*

scripts/
├── generate_insights.py         — Gemini → DRAFT → email
├── approve_post.py              — CLI draft management
├── weekly_insights.py           — topic rotation (GH Actions Monday 8am EST)
├── run_daily.py                 — pipeline orchestrator
├── gvl_monitor.py               — scraper: deeds (GovOS), SOS (DDG), mortgages (CountyWeb)
├── enrich.py                    — LLC → human enrichment pipeline
├── weekly_leads_digest.py       — weekly email digest
└── requirements.txt / requirements-insights.txt / requirements-scraper.txt

.github/workflows/weekly-insights.yml + daily-leads.yml
supabase/schema.sql
```

## Design System

- Background: `#ffffff` · Text: `#0a0a0a` · Accent/CTA: `green-500` (`#22c55e`) / `green-600`
- Dark sections: `bg-gray-950` · Borders: `gray-100/200`
- Typography: system font stack (no Google Fonts — Turbopack http2 error at build time)
- Sections: `py-24 md:py-32`, max-width `max-w-6xl`, articles `max-w-2xl`
- Direction: Stripe / Linear aesthetic — whitespace, strong type scale, minimal decoration

## SEO Architecture

- OG image: `opengraph-image.tsx` (edge Satori). **Do NOT set `openGraph.images` in page metadata** — conflicts.
- Every page: `title` (includes "Greenville SC"), `description`, `openGraph`, `alternates.canonical`
- `/case-study` has `robots: { index: false }` — do not remove until real content exists
- JSON-LD: `ProfessionalService`, `areaServed: Greenville County SC` in `layout.tsx`
- Brand tagline: "Lead Generation & Marketing for Greenville SC Trades"

## Key Conventions

- Tailwind v4: `@theme {}` in `globals.css`. Typography: `@plugin "@tailwindcss/typography"`.
- All pages are server components except: `Nav`, `LiveSignalFeed`, `ThemeProvider`, `DarkModeToggle`, `/contact/page.tsx`
- **Dark mode:** class-based (`html.dark`). ThemeProvider → localStorage. Palette: bg `#0d1f16`, dark sections `#060f09`, text `#dff0e6`. `suppressHydrationWarning` on `<html>` + inline script prevent flash.
- CTAs always link to `/contact`
- Section labels: `text-xs font-semibold uppercase tracking-widest text-green-600`
- Dark CTA sections: `bg-gray-950` or `bg-black` with `green-500` buttons
- Article body: `prose prose-gray max-w-none` + `dangerouslySetInnerHTML`

## Supabase

- Env: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Tables: `market_signals` · `blog_posts` · `clients` · `enriched_leads`
- RLS: `market_signals` + `blog_posts` have public SELECT. `clients` + `enriched_leads` service key only.
- Realtime on `market_signals` via `supabase_realtime` publication.

### market_signals columns

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `timestamp` | timestamptz | event time |
| `event_type` | text | `PROPERTY TRANSFER` / `NEW BUSINESS FILING` / `INDUSTRIAL PERMIT` / `MORTGAGE_FILING` |
| `location` | text | address or entity name |
| `entity_name` | text | company/owner |
| `valuation` | numeric | |
| `details` | text | context line |
| `score` | integer | 0–100 |
| `tag` | text | `HOT` / `WARM` / `COLD` |
| `source` | text | `deeds` / `sos` / `permits` / `demo` / `mortgages` |
| `source_key` | text | dedup key — unique constraint, NULLs exempt (demo signals) |
| `signal_type` | text | `MORTGAGE_FILING` (triggers OCR enrichment) / `NOMINAL_TRANSFER` (consideration < $1,000 — family/trust deed) / null |

### LiveSignalFeed behavior

- No env vars: renders mock data, footer shows `DEMO MODE`
- With env vars: fetches last 6 on mount, subscribes to Postgres INSERT via Realtime
- New signal: border flashes green, row slides in at top; capped at 6 visible rows

### blog_posts columns

| Column | Type | Notes |
|---|---|---|
| `slug` | text | unique URL slug |
| `body_md` | text | Markdown |
| `summary` | text | excerpt |
| `tags` | text[] | |
| `status` | text | `DRAFT` / `APPROVED` / `PUBLISHED` |
| `published_at` | timestamptz | auto-set on PUBLISHED |
| `topic` | text | generation prompt |
| `gemini_model` | text | e.g. `gemini-2.5-flash` |

RLS: public SELECT only where `status = 'PUBLISHED'`.

### clients columns

| Column | Type | Notes |
|---|---|---|
| `slug` | text | unique, URL-safe |
| `token` | text | token-gated access secret |
| `trade_tags` | text[] | `hvac` / `landscaping` / `electrical` / `cleaning` / `security` |
| `contact_email` | text | |
| `status` | text | `trial` / `active` / `inactive` |

### enriched_leads columns

| Column | Type | Notes |
|---|---|---|
| `signal_id` | uuid | FK → market_signals |
| `client_id` | uuid | FK → clients (null = unassigned) |
| `principal_name` | text | human name or LLC title-case if unresolved |
| `principal_role` | text | source label — see constants below |
| `contact_email` / `contact_phone` / `linkedin_url` | text | |
| `search_evidence` | text | source URL |
| `enrichment_status` | text | `raw` / `pending` / `enriched` |
| `trade_tag` | text | client routing |
| `score` / `tag` / `event_type` / `location` / `valuation` | | copied from signal |
| `transfer_type` | text | `NOMINAL_TRANSFER` (copied from signal) or null — dashboard shows "Trust / Family" badge and hides dollar value |
| `notes` | text | |

Enrichment flow: scraper → `market_signals` → `enrich.py` creates `enriched_leads` row (`raw`) → lookup chain → `enriched` or `pending` (manual queue).

## Market Insights Engine

Workflow: `generate_insights.py --topic "..."` → Gemini → DRAFT → email to alex@ with Review/Publish buttons → manual click publishes → `revalidatePath('/insights')`

```bash
cd scripts
python generate_insights.py --topic "..." [--dry-run]
python generate_insights.py --test-email
python weekly_insights.py [--dry-run]          # GH Actions Monday 8am EST
python approve_post.py --list-drafts
python approve_post.py --id <uuid> --view / --edit / --status PUBLISHED
```

**Topic generation:** `weekly_insights.py` queries last 20 titles → Gemini picks from 6 category buckets. No state file. Edit `CATEGORIES` to bias topics.

**GH Actions — weekly-insights.yml:** Monday 13:00 UTC, Python 3.12, `requirements-insights.txt`.  
Secrets: `SUPABASE_URL` · `SUPABASE_SERVICE_KEY` · `GEMINI_API_KEY` · `RESEND_API_KEY` · `NOTIFICATION_EMAIL` · `PUBLISH_SECRET` · `NEXT_PUBLIC_SITE_URL`

**`/review`:** `?id=<uuid>&token=<PUBLISH_SECRET>` — server component, service key, token-gated. Not in nav.  
**`/api/publish`:** `GET ?id=&token=` — flips status, `revalidatePath('/insights')`, idempotent.

## Python Scraper (gvl_monitor.py)

```bash
python gvl_monitor.py --demo --count 15
python gvl_monitor.py --scrape deeds [--days 14] [--debug] [--dry-run]
python gvl_monitor.py --scrape sos [--dry-run]
python gvl_monitor.py --scrape all [--days 14]
python gvl_monitor.py --mode mortgages [--days 14] [--debug] [--dry-run]
```

**Two-portal architecture:**

| Flag | Portal | Credentials |
|---|---|---|
| `--scrape deeds` | GovOS `greenville.sc.publicsearch.us` | `ROD_EMAIL` + `ROD_PASSWORD` |
| `--scrape sos` | DuckDuckGo → SC SOS detail pages | none |
| `--mode mortgages` | CountyWeb `viewer.greenvillecounty.org` | `ROD_VIEWER_USERNAME` + `ROD_PASSWORD` |

**GovOS deed scraper:**
- React SPA — after login, stay on `/`. Don't navigate away. Date: `aria-label="Starting Recorded Date"` + `press_sequentially()`. Submit: `data-testid="searchSubmitButton"`. Results: `tr.is-uncertified`.
- Results columns: `cells[6]`=rec_date · `cells[7]`=doc_type · `cells[8]`=grantor · `cells[9]`=grantee. Consideration always `N/A` in results.
- Click each qualifying row (Phase B) to get real consideration + property address. Direct `/document/{id}` URLs return 404 — must click from live Playwright session. `_parse_govos_detail()` checks `Consideration:`, `Loan Amount:`, `Principal Amount:`, `Situs Address:`.
- Only DEED / WARRANTY DEED / DEED OF TRUST / QUIT CLAIM kept. `location` = property address → grantor name fallback.
- Dedup key: `deeds:{GRANTEE}:{rec_date}`

**CountyWeb mortgage scraper:**
- Login via `page.evaluate("doLogin()")` — login button has no `type` attribute.
- Nested iframes: `page.frame("bodyframe")` → `page.frame("dynSearchFrame")` → `page.frame("criteriaframe")`. Accept disclaimer, then click outer nav link (target="bodyframe") to reach `searchMain.do` — `frame.goto()` returns 404.
- Datagrid field numbers (verified): `field 6`=rec_date · `field 7`=doc_type · `field 9`=grantor/borrower · `field 11`=grantee/lender.
- Filter doc types by exact set membership (not substring) to exclude SATISFACTION OF MORTGAGE. Scan all rows; click MORTGAGE row specifically (ASSIGNMENT OF RENTS may appear first).
- Grantor = borrower (who we want). Grantee = lender.
- Signals: `event_type/signal_type = "MORTGAGE_FILING"`. MTG base 82 (WARM), CON base 88 (HOT).
- Dedup key: `mtg:{BORROWER}:{rec_date}`

**SOS scraper:** DDG `site:businessfilings.sc.gov "Greenville"` → fetch entity detail pages directly (no CAPTCHA on detail URLs). May return 0 if DDG hasn't indexed recent filings.

**Dedup:** `source_key` upsert. Demo signals have null key — always insert.

## Daily Pipeline (run_daily.py)

```bash
python run_daily.py [--dry-run] [--days 14] [--no-deeds] [--no-mortgages] [--no-enrich] [--no-alert]
python weekly_leads_digest.py [--days 14] [--all] [--dry-run]
```

**GH Actions daily-leads.yml (4am EST):** CountyWeb mortgages → enrich pending → high-confidence alert. Deed scraper runs locally only (fragile GovOS login).  
Secrets: `SUPABASE_URL` · `SUPABASE_SERVICE_KEY` · `RESEND_API_KEY` · `NOTIFICATION_EMAIL` · `ROD_PASSWORD` · `ROD_VIEWER_USERNAME`  
Python 3.12 required. Uses `requirements-scraper.txt` + `apt-get install tesseract-ocr`.

## Lead Enrichment Engine (enrich.py)

Unmasks LLC → human decision-maker. Writes to `enriched_leads`.

```bash
python enrich.py --entity "Name LLC" [--rec-date "M/D/YYYY"] [--dry-run]
python enrich.py --signal-id <uuid>
python enrich.py --list-pending
python enrich.py --run-pending [--dry-run]
ENRICH_DEBUG=1 python enrich.py --entity "..." --dry-run   # saves HTML/PNG to scripts/debug/
```

### Enrichment chain

**Step 0 — Mortgage OCR** (signals with `signal_type = MORTGAGE_FILING`):  
CountyWeb viewer — match by entity name (LLC suffixes stripped) + rec_date ±3 days. Fetch last 4 pages as PNG via `viewImagePNG.do` (jsessionid in URL path param — NOT cookie; Playwright session must stay active). `_parse_borrower_from_text()`: 6 structured regex patterns → heuristic scorer fallback. Standard SC layout: `BORROWER:\n[LLC]\n\nBy ___\n\nName, Title`. Returns immediately on hit.

**Step 1 — GVL tax query (`votaxqry`):**  
Form at `greenvillecounty.org/appsas400/votaxqry/` — name search only (`txt_Name = input[name="ctl00$bodyContent$txt_Name"]`). Must force `hdn_SearchCategory = "Real Estate"` via `page.evaluate()` — tab click alone unreliable. Strip LLC/INC/CORP and "AND ..." joint suffixes before searching. Results: `cells[0]`=name+href · `cells[1]`=Map#/PIN. No mailing address column. Skip rows with vehicle codes (CHEV, FORD, TOYT, BOAT, TRLR, etc.). Name-flip retry on 0 results: 2-word → reverse; 3-word ending in initial → strip initial; 3-word no initial → FIRST MIDDLE LAST → LAST FIRST MIDDLE.

**Step 1b — PIN Pivot:**  
Fetch `RealProperty/Details.aspx?MapNumber=<PIN>` (publicly accessible, plain `requests`). Shows Owner/Care Of/Mailing Address. If Care Of = human → done. If mailing is residential → GIS name search at that address. If commercial → pass to DDG q5. Bug: Care Of regex can bleed "Mailing Address:..." when empty — trimmed at "Mailing Address:" and values >60 chars rejected.

**Step 2 — DuckDuckGo (5 queries):**  
`[entity] Greenville SC owner` · `site:businessfilings.sc.gov "[entity]"` · `site:upstatebusinessjournal.com "[entity]"` · `site:gsabizwire.com "[entity]"` · mailing address query (when PIN pivot found one). SC SOS detail pages have no CAPTCHA.

**Step 2b — Initials logic:** If LLC = `[2-5 initials] + Partners/Group/etc.`, rank candidates whose initials match.

**Step 3 — Manual queue:** Log mailing address + Neumo link in notes, set `enrichment_status = 'pending'`.

### Name normalization

`normalize_person_name()`: ALL-CAPS deed format `LASTNAME FIRSTNAME MIDDLE` → `Firstname Lastname`. Drops middle names, preserves JR/SR/II/III. For simple deed grantees (≤3 words, no "AND"), deed `entity_name` preferred over GIS (GIS concatenates first+middle without spaces).

Location priority: GIS property address → `signal.location` if street-like → raw `signal.location` fallback.

### principal_role constants

| Constant | Value |
|---|---|
| `ROLE_MORTGAGE_SIG` | `"Mortgage Signature"` — format: `"Mortgage Signature – {title}"` |
| `ROLE_TAX_CARE_OF` | `"Tax Record – Care Of"` |
| `ROLE_GIS_OWNER` | `"Tax Record – GIS"` |
| `ROLE_GIS_MAIL_FLIP` | `"Tax Record – Mailing"` |
| `ROLE_SOS_INITIALS` | `"SC SOS – Initials Match"` |
| dynamic | `f"SC SOS – {filing_role}"` |
| `ROLE_PRESS_UBJ` | `"Business Press – UBJ"` |
| `ROLE_PRESS_GBIZ` | `"Business Press – GSABiz"` |
| `ROLE_WEB_SEARCH` | `"Web Search"` |

TypeScript dashboard maps by `startsWith()` prefix for confidence tiers.

### Enrichment Stack Roadmap

| Tier | Source | Status |
|---|---|---|
| Primary | Mortgage OCR (CountyWeb) | Working |
| Secondary | UCC (`ucconline.sc.gov`) | Not built |
| Tertiary | City business license (FOIA to `businesslicense@greenvillesc.gov`) | Awaiting response |
| Fallback | SOS via DDG + address clustering | Current |

Client delivery roadmap: add RLS policy on `enriched_leads` so `auth.email() = clients.contact_email` — no client-facing dashboard route yet; `/dashboard` shows all leads.

## Known Issues / Scraping Gotchas

**Next.js / Framework:**
- Next.js 16: `middleware.ts` → `proxy.ts`, `export function proxy`. Do NOT create `middleware.ts` — deprecated.
- Supabase Auth in App Router: use `createServerClient` from `@supabase/ssr`, NOT `createClient` from `@supabase/supabase-js`.
- `next.config.ts` sets `turbopack.root: __dirname` to suppress lockfile warning from `C:\Users\alexs\package-lock.json`.
- Google Fonts: Turbopack http2 error at build time — system fonts everywhere including `opengraph-image.tsx`.

**Python deps:**
- `google-genai` requires `httpx>=0.28.1`. Do not downgrade `supabase` below 2.15.0.
- Tesseract: `pip install pytesseract` is Python-only wrapper. Install binary separately: `winget install tesseract-ocr.tesseract`. Default path: `C:\Program Files\Tesseract-OCR\tesseract.exe`. Override: `TESSERACT_CMD`.
- `playwright install chromium` required after `pip install playwright` (~130MB).

**GovOS deed scraper:**
- React SPA — do NOT navigate away after login. Direct `/document/{id}` URLs return 404; click row from live Playwright session.
- Consideration always `N/A` in results table; real price only in detail panel (Phase B).
- Deed detail pages have no property/situs address — "No legal description found". `location` falls back to grantor name for all deed signals.

**GVL tax query (`votaxqry`):**
- `hdn_SearchCategory` defaults to "Car" — tab click unreliable; force via `page.evaluate()`.
- No mailing address in results table. VIN# and GVL account numbers appended to owner name in same cell — `enrich.py` strips both.
- `gcgis.org` ArcGIS API times out for non-browser requests (IP-blocked).
- `greenvillecounty.org/vRealPr24/` returns 500 — don't use.
- New deed grantees may return 0 GIS results for weeks — county records lag behind filings.

**CountyWeb:**
- Login button has no `type` attribute — `button[type='submit']` times out. Use `page.evaluate("doLogin()")`.
- `frame.goto(searchMain.do)` returns 404. Click outer nav link (target="bodyframe") instead.
- Disclaimer must be accepted in `bodyframe` before `searchMain.do` is accessible.
- `ASSIGNMENT OF RENTS` may appear before `MORTGAGE` for same LLC — scan all rows, click MORTGAGE specifically.
- `viewImagePNG.do` PNG fetch: jsessionid in URL path param (`; jsessionid=...`), not cookie. Playwright session must stay active during `requests` fetch.

**Misc:**
- SOS DDG scraper may return 0 if DDG hasn't crawled recent filings.
- `enrich.py --run-pending` fetches 500, filters enriched, returns first N. Increase pool limit in `fetch_pending_signals()` if >500 signals.
- GovOS account required at `greenville.sc.publicsearch.us/register` — no guest login despite JS `doGuestLogin()` function.

## Environment Variables

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Safe to expose |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Safe to expose; RLS controls access |
| `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` | Service key — never commit. Required by `/api/publish` + `/review` on Vercel |
| `GEMINI_API_KEY` | Google AI Studio |
| `RESEND_API_KEY` | Contact form + Python alerts |
| `NOTIFICATION_EMAIL` | `alex@rebbadvisors.com` |
| `PUBLISH_SECRET` | Shared secret for /review + /api/publish |
| `NEXT_PUBLIC_SITE_URL` | `https://rebbadvisors.com` |
| `ROD_EMAIL` | GovOS deed scraper |
| `ROD_PASSWORD` | GovOS + CountyWeb (shared) |
| `ROD_VIEWER_USERNAME` | CountyWeb (default: `asteryous`) |
| `TESSERACT_CMD` | Optional — path to `tesseract.exe` if not at default |
| `DISCORD_WEBHOOK_URL` | Optional — new draft alert |
| `EDITOR` | Optional — for `approve_post.py --edit` (default: notepad) |

## Deployment

- **Platform:** Vercel (Hobby), auto-deploy on push to `main`
- **Repo:** https://github.com/jsteryous/rebbadvisors-website
- **Production:** rebbadvisors.com (DNS via Cloudflare)

```bash
npm run dev | npm run build | npm run lint | npx vercel --prod
```

## Pages

| Route | Notes |
|---|---|
| `/` | Hero + LiveSignalFeed, Problem, The Window (Day 0→21 timeline), How We Do It, Services, Multiplier, Offer (30-day guarantee), CTA |
| `/how-it-works` | 5-step sprint process |
| `/lead-intelligence` | Upstate Multiplier deep dive |
| `/seo` | Local SEO audits + GBP optimization |
| `/web-development` | React/Next.js builds, 5-day sprint |
| `/outreach-automation` | Email/SMS sequences |
| `/insights` / `/insights/[slug]` | ISR 60s, prose via `marked` |
| `/review` | Token-gated draft review (email only) |
| `/dashboard` | enriched_leads ranked list, Supabase Auth gated |
| `/dashboard/login` | No public registration; users created manually in Supabase |
| `/case-study` | Placeholder — **noindexed**, do not remove until real content |
| `/contact` | Form → `/api/contact` → Resend to alex@rebbadvisors.com |

**Nav:** logo · Services ▾ (Lead Intelligence / Outreach Automation / Local SEO / Web Development) · How It Works · Insights · Contact · [Get More Jobs CTA]
