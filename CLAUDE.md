# REBB Advisors Website

## Business Context

**Business:** REBB Advisors — Upstate SC (Greenville County), targeting local service trades.  
**Tone:** Confident, minimal, blunt. No fluff.

**REBB's tagline:** "We find the owner. You make the sale."

**Two products:**
1. **Company Brain** *(core offer)* — RAG system (Retrieval Augmented Generation) with Obsidian as the structured knowledge layer. Ingests the documents a company already has — emails, quotes, job notes, SOPs, vendor files — and makes them queryable with source citations. The core differentiator: works on the mess that already exists without requiring anyone to change how they work. Value is in the setup service (ingestion, structuring, adoption), not the technology itself. Structured as role-based Obsidian vaults (estimator, PM, field, admin) that feed a unified AI query layer. Land-and-expand: start with the highest-risk knowledge gap (usually estimator or owner tribal knowledge), prove value, expand.

   **Three deployment tiers (homepage data security section):**
   - **Air-Gapped** — open-source LLM runs entirely on client hardware. Nothing leaves. Lower model quality.
   - **API (REBB default)** — Claude commercial API. Contractually: no training on client data, 7-day retention then deleted. Distinct from Claude.ai consumer products (Free/Pro/Max) which have opt-in training. Verify at privacy.claude.com if citing in sales.
   - **Hybrid** — docs stored locally; only question + matched excerpt sent to API at query time.
2. **LLC Owner Finder** *(beta — quality still being refined)* — Daily syncs of GVL County property transfers, SOS filings, and mortgages. We unmask the LLC to find the human decision-maker (name, phone, email). Score > 80 triggers immediate email alert. Ranked call list every Monday. Tagline: **"We find the owner. You make the sale."** — but do not position this as a polished product. LLC-to-person resolution quality and contact accuracy are still inconsistent. Frame honestly as early-access for the right trade and territory. When in doubt, default to Company Brain as the conversation anchor.

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
│   ├── CompanyBrainDemo.tsx     — static chat mockup showing Company Brain answering 3 trade Q&A with source citations (client)
│   └── ThemeProvider.tsx + DarkModeToggle.tsx — dark mode (client)
└── lib/supabase.ts

proxy.ts   — Next.js 16 route proxy (replaces middleware.ts); guards /dashboard/*

scripts/
├── generate_insights.py         — Gemini → DRAFT → email
├── approve_post.py              — CLI draft management
├── weekly_insights.py           — topic rotation (GH Actions Monday 8am EST)
├── run_daily.py                 — pipeline orchestrator (direct imports from gvl_monitor + enrich)
├── gvl_monitor.py               — scraper: deeds (GovOS), SOS (DDG), mortgages (CountyWeb)
├── enrich.py                    — enrichment orchestrator
├── enrich_gis.py                — GIS tax query + property detail lookup
├── enrich_web.py                — DuckDuckGo + SC SOS entity pages; email/phone regex extraction
├── enrich_mort.py               — CountyWeb mortgage OCR
├── enrich_models.py             — shared types, constants, name normalization; ENRICH_VERSION
├── enrich_contact.py            — PDL person + company contact enrichment (email/phone/LinkedIn)
├── weekly_leads_digest.py       — weekly email digest
├── run_daily.bat                — local Windows pipeline runner
├── lib/db_models.py             — Pydantic row validators (extra="forbid")
├── lib/email_format.py          — shared email formatting helpers
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

## Marketing Copy Standards

### Problems to sell (in order of severity)
1. **Key-person risk** — lead estimator/PM leaves, takes 10 years of pricing logic, vendor context, and job history with them. This is the fear that creates urgency. Lead with it.
2. **Owner can't step back** — every delegation attempt collapses because the team routes everything back to the owner; there's no other place to look. Framed as: "The system is the owner."
3. **Growth ceiling** — adding crew, PMs, or new markets adds proportional owner load. As long as the owner is the system, the owner is the ceiling. State this explicitly.

### Core differentiator
Company Brain works on the mess that already exists. Every other solution requires someone to put things into a new system first. This one ingests what's already there — emails, quote PDFs, job notes, scattered drives — and makes it queryable. That's the answer to "why not just use Notion / a shared drive / NotebookLM." (NotebookLM is a legitimate alternative for small clean shops — acknowledge it, don't dismiss it.)

### Best fit qualifier
**Tenure + accumulated chaos**, not just headcount + trade. A company operating 8+ years with context accumulated across hundreds of jobs that was never formalized. A 2-year-old HVAC startup doesn't have this problem. A 14-year-old GC with 3 PMs and 10 subs does.

### What Company Brain can't solve (manage expectations in sales)
- **Pure tacit knowledge** — things never written down. Captured only through intentional Obsidian documentation before someone leaves.
- **Garbage in, garbage out** — sparse notes produce low-confidence answers.
- **Adoption** — people will still call the owner if it's easier. The setup service must address this.

### Sales motion
Don't pitch "whole company in 30 days." Start with the highest-risk knowledge gap:
> *"What happens if your lead estimator leaves tomorrow? We start there — build his vault while he's still here, feed it with 5 years of quotes and emails, capture what's only in his head. That's the highest-risk gap first."*

### Positioning line
*"We capture and protect the knowledge that runs your business — before someone takes it with them."*

### Copy rules
- **One CTA above the fold.** No secondary link beside the primary button in the hero.
- **Company Brain definition must appear in hero sub-copy.** Current: *"a private AI knowledge system built from the documents your company already has."* Don't let the name float undefined. Hero framing: behavior change is on REBB's side ("we do the ingestion, tuning, and ongoing curation") — not "no behavior change required."
- **Homepage section order:** Hero → Demo → Comparison → Setup Process → Best Fit → Data Security → Final CTA.
- **LLC Owner Finder stays off the homepage.** Lives on `/lead-intelligence` only.
- **Section headers state outcomes.** "Setup Process" not "How It Lands." "Ready in weeks" not "Hands-on setup."
- **Final CTA headline must match hero specificity.** Concrete and blunt.
- **One canonical interruption line.** Use once: *"Your team gets answers in seconds. You get pulled in for judgment calls, not routine lookups."*
- **"Company Brain" name stays.** "Real Business Brain" is worse — longer, sounds defensive.

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
| `location` | text | property address, or grantor/borrower name when no address available |
| `entity_name` | text | company/owner being enriched |
| `valuation` | numeric | |
| `details` | text | context line; for mortgages includes `Lender: {name}` |
| `score` | integer | 0–100 |
| `tag` | text | `HOT` / `WARM` / `COLD` |
| `source` | text | `deeds` / `sos` / `permits` / `demo` / `mortgages` |
| `source_key` | text | dedup key — unique constraint, NULLs exempt (demo signals) |
| `signal_type` | text | `MORTGAGE_FILING` (triggers OCR enrichment) / `NOMINAL_TRANSFER` (consideration < $1,000 — family/trust deed) / null |

### enriched_leads columns

| Column | Type | Notes |
|---|---|---|
| `signal_id` | uuid | FK → market_signals |
| `client_id` | uuid | FK → clients (null = unassigned) |
| `principal_name` | text | human name or LLC title-case if unresolved |
| `principal_role` | text | source label — constants in `enrich_models.py` |
| `contact_email` / `contact_phone` / `linkedin_url` | text | |
| `search_evidence` | text | source URL |
| `enrichment_status` | text | `raw` / `pending` / `enriched` |
| `trade_tag` | text | client routing |
| `score` / `tag` / `event_type` / `location` / `valuation` | | copied from signal |
| `transfer_type` | text | `NOMINAL_TRANSFER` (copied from signal) or null — dashboard shows "Trust / Family" badge and hides dollar value |
| `enrichment_version` | integer | version of `ENRICH_VERSION` constant at write time; null on legacy rows |
| `notes` | text | |

Enrichment flow: scraper → `market_signals` → `enrich.py` creates `enriched_leads` row → lookup chain → `enriched` or `pending` (manual queue).

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

**Topic generation:** `weekly_insights.py` queries last 20 titles → Gemini picks from 6 category buckets. No state file. Edit `CATEGORIES` in `weekly_insights.py` to bias topics. Categories are currently oriented toward: LLC Owner Finder (public records/lead intel), Company Brain (AI for multi-job service businesses), Greenville commercial real estate, trade business operations, reading public records, and digital tools for trades.

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
- Only DEED / WARRANTY DEED / DEED OF TRUST / QUIT CLAIM kept. `location` = property address → grantor name fallback (deed detail pages often have no situs address).
- Dedup key: `deeds:{GRANTEE}:{rec_date}`

**CountyWeb mortgage scraper:**
- Login via `page.evaluate("doLogin()")` — login button has no `type` attribute.
- Nested iframes: `page.frame("bodyframe")` → `page.frame("dynSearchFrame")` → `page.frame("criteriaframe")`. Accept disclaimer, then click outer nav link (target="bodyframe") to reach `searchMain.do` — `frame.goto()` returns 404.
- Datagrid field numbers (verified): `field 6`=rec_date · `field 7`=doc_type · `field 9`=grantor/borrower · `field 11`=grantee/lender.
- Filter doc types by exact set membership (not substring) to exclude SATISFACTION OF MORTGAGE. Scan all rows; click MORTGAGE row specifically (ASSIGNMENT OF RENTS may appear first).
- Grantor = borrower (who we want). Grantee = lender. `location` = borrower name; lender stored in `details`.
- Signals: `event_type/signal_type = "MORTGAGE_FILING"`. MTG base 82 (WARM), CON base 88 (HOT).
- Dedup key: `mtg:{BORROWER}:{rec_date}`

**SOS scraper:** DDG `site:businessfilings.sc.gov "Greenville"` → fetch entity detail pages directly (no CAPTCHA on detail URLs). May return 0 if DDG hasn't indexed recent filings.

**Dedup:** `source_key` upsert. Demo signals have null key — always insert.

## Daily Pipeline (run_daily.py)

```bash
python run_daily.py [--dry-run] [--days 14] [--no-deeds] [--no-mortgages] [--no-enrich] [--no-alert]
python weekly_leads_digest.py [--days 14] [--all] [--dry-run]
```

**GH Actions daily-leads.yml (4am EST):** 5 steps: (1) CountyWeb mortgage scraper, (2) `--run-pending` enrich new signals, (3) `--retry-pending` re-run stuck leads, (4) `--run-contact` fill missing PDL contact info, (5) high-confidence alert email. Deed scraper runs locally only (fragile GovOS login).  
Secrets: `SUPABASE_URL` · `SUPABASE_SERVICE_KEY` · `RESEND_API_KEY` · `NOTIFICATION_EMAIL` · `ROD_PASSWORD` · `ROD_VIEWER_USERNAME` · `PDL_API_KEY`  
Python 3.12 required. Uses `requirements-scraper.txt` + `apt-get install tesseract-ocr`.

## Lead Enrichment Engine (enrich.py)

Unmasks LLC → human decision-maker. Writes to `enriched_leads`.

```bash
python enrich.py --entity "Name LLC" [--rec-date "M/D/YYYY"] [--dry-run]
python enrich.py --signal-id <uuid>
python enrich.py --list-pending
python enrich.py --run-pending [--dry-run]      # enrich new signals (no enriched_leads row yet)
python enrich.py --retry-pending [--dry-run]    # re-run full chain on stuck pending leads (max 10)
python enrich.py --run-contact [--dry-run]      # retry PDL on enriched leads with no contact info
ENRICH_DEBUG=1 python enrich.py --entity "..." --dry-run   # saves HTML/PNG to scripts/debug/
```

### Enrichment chain

**Step 0 — Mortgage OCR** (deed + mortgage signals with LLC entity names):  
Triggered for `source in ("deeds", "mortgages")`. CountyWeb viewer — match by entity name (LLC suffixes stripped) + rec_date ±3 days. Fetch last 4 pages as PNG via `viewImagePNG.do` (jsessionid in URL path param — NOT cookie; Playwright session must stay active). `_parse_borrower_from_text()`: 6 structured regex patterns → heuristic scorer fallback. Standard SC layout: `BORROWER:\n[LLC]\n\nBy ___\n\nName, Title`. Returns immediately on hit. Browser errors return a partial result (error in `notes`) — they do not raise.

**Step 1 — GVL tax query (`votaxqry`):**  
Form at `greenvillecounty.org/appsas400/votaxqry/` — name search only (`txt_Name = input[name="ctl00$bodyContent$txt_Name"]`). Must force `hdn_SearchCategory = "Real Estate"` via `page.evaluate()` — tab click alone unreliable. Strip LLC/INC/CORP and "AND ..." joint suffixes before searching. Results: `cells[0]`=name+href · `cells[1]`=Map#/PIN. No mailing address column. Skip rows with vehicle codes (CHEV, FORD, TOYT, BOAT, TRLR, etc.). Name-flip retry on 0 results: 2-word → reverse; 3-word ending in initial → strip initial; 3-word no initial → FIRST MIDDLE LAST → LAST FIRST MIDDLE. Browser errors return a partial result — they do not raise.

**Step 1b — PIN Pivot:**  
Fetch `RealProperty/Details.aspx?MapNumber=<PIN>` (publicly accessible, plain `requests`). Shows Owner/Care Of/Mailing Address. If Care Of = human → done. If mailing is residential → GIS name search at that address. If commercial → pass to DDG q5. Bug: Care Of regex can bleed "Mailing Address:..." when empty — trimmed at "Mailing Address:" and values >60 chars rejected.

**Step 2 — DuckDuckGo (5 queries):**  
`[entity] Greenville SC owner` · `site:businessfilings.sc.gov "[entity]"` · `site:upstatebusinessjournal.com "[entity]"` · `site:gsabizwire.com "[entity]"` · mailing address query (when PIN pivot found one). SC SOS detail pages have no CAPTCHA. Email + phone regex extracted from all snippets at no cost.

**Step 2b — Initials logic:** If LLC = `[2-5 initials] + Partners/Group/etc.`, rank candidates whose initials match.

**Step 2c — PDL person enrichment** (`enrich_contact.py`): fires after a human name is resolved, only if DDG didn't surface both email + phone. `PDL_API_KEY` required. 100 free credits/month; credits consumed only on successful matches.

**Step 2d — PDL company enrichment** (`enrich_contact.py`): last-resort fallback — fires when still no contact info after the full chain (owner unresolved or person lookup missed). Returns business phone/LinkedIn. Same credit rules apply.

**Step 3 — Manual queue:** Log mailing address + ROD viewer link (`viewer.greenvillecounty.org/countyweb/disclaimer.do`) in notes, set `enrichment_status = 'pending'`.

### Enrichment versioning

`ENRICH_VERSION` in `enrich_models.py` (currently `1`) is written to every row. Bump it when the chain meaningfully improves. To re-process stale rows: query `WHERE enrichment_version < <new_version>` and run `--retry-pending` or `--signal-id` per row. `--retry-pending` targets `enrichment_status = 'pending'`; future `--re-enrich-stale` flag would target old `enrichment_version`.

### Location resolution

`save_enriched_lead()` sets `enriched_leads.location` to: GIS-resolved property address → `signal.location` if it passes `_is_street_address()` (leading house number `\d{1,5}\s+[A-Za-z]`) → null. Legacy rows written before the filter may contain a grantor/borrower name instead of an address.

Dashboard validates `location` with `isStreetAddress()` before rendering it as an address. It also joins `market_signals(entity_name, location)` — when `market_signals.location` is not itself a street address (i.e. it's the grantor/borrower name fallback), it's shown as a dimmed sub-label below the address field. Never assume `enriched_leads.location` contains a street address.

### Name normalization

`normalize_person_name()`: ALL-CAPS deed format `LASTNAME FIRSTNAME MIDDLE` → `Firstname Lastname`. Drops middle names, preserves JR/SR/II/III. For simple deed grantees (≤3 words, no "AND"), deed `entity_name` preferred over GIS (GIS concatenates first+middle without spaces).

### Enrichment Stack Roadmap

| Tier | Source | Status |
|---|---|---|
| Primary | Mortgage OCR (CountyWeb) | Working |
| Contact (person) | DDG snippet regex → PDL `/v5/person/enrich` (if DDG misses) | Built |
| Contact (company) | PDL `/v5/company/enrich` — last resort when person lookup fails | Built |
| Secondary | UCC (`ucconline.sc.gov`) | Not built |
| Tertiary | City business license (FOIA to `businesslicense@greenvillesc.gov`) | Awaiting response |
| Fallback | SOS via DDG + address clustering | Current |

Client delivery roadmap: add RLS policy on `enriched_leads` so `auth.email() = clients.contact_email` — no client-facing dashboard route yet; `/dashboard` shows all leads.

## Known Issues / Gotchas

**Next.js / Framework:**
- Next.js 16: `middleware.ts` → `proxy.ts`, `export function proxy`. Do NOT create `middleware.ts` — deprecated.
- Supabase Auth in App Router: use `createServerClient` from `@supabase/ssr`, NOT `createClient` from `@supabase/supabase-js`.
- `next.config.ts` sets `turbopack.root: __dirname` to suppress lockfile warning from `C:\Users\alexs\package-lock.json`.
- Google Fonts: Turbopack http2 error at build time — system fonts everywhere including `opengraph-image.tsx`.

**Python deps:**
- `google-genai` requires `httpx>=0.28.1`. Do not downgrade `supabase` below 2.15.0.
- Tesseract: `pip install pytesseract` is Python-only wrapper. Install binary separately: `winget install tesseract-ocr.tesseract`. Default path: `C:\Program Files\Tesseract-OCR\tesseract.exe`. Override: `TESSERACT_CMD`. `enrich_mort.py` imports at module level with `_TESSERACT_AVAILABLE` flag — missing binary degrades gracefully.
- `playwright install chromium` required after `pip install playwright` (~130MB).

**GVL tax query (`votaxqry`):**
- `gcgis.org` ArcGIS API times out for non-browser requests (IP-blocked) — don't use.
- `greenvillecounty.org/vRealPr24/` returns 500 — don't use.
- New deed grantees may return 0 GIS results for weeks — county records lag behind filings.

**Misc:**
- SOS DDG scraper may return 0 if DDG hasn't crawled recent filings.
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
| `PDL_API_KEY` | People Data Labs free tier (100 credits/month) — contact enrichment via `enrich_contact.py`. Falls back to `APOLLO_API_KEY` if set. |
| `TESSERACT_CMD` | Optional — path to `tesseract.exe` if not at default |
| `DISCORD_WEBHOOK_URL` | Optional — new draft alert |
| `EDITOR` | Optional — for `approve_post.py --edit` (default: notepad) |
| `MAIL_FROM` | Optional — email `from` address for all pipeline emails (default: `REBB Advisors <noreply@rebbadvisors.com>` / `REBB Insights <onboarding@resend.dev>` for insights) |

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
| `/` | Hero (key-person risk H1, role-badged pain card; hero sub-copy frames behavior change as REBB's job not client's) → CompanyBrainDemo (dark, source chip grid + `PipelineDiagram` SVG with honest "outdated docs" caveat) → Comparison table (Notion / SOP consultant / NotebookLM vs Company Brain; Jobber and Generic AI removed; plain-text note below table recommending NotebookLM for small shops) → Setup Process (estimator vault callout, pricing transparency callout, 4-step week-labeled timeline: Week 1 / Week 2–3 / Week 4 / Ongoing) → Best Fit (icon cards + amber "Who this isn't for" block) → Data Security → Final CTA. All CTAs → `/contact`. No LiveSignalFeed. |
| `/how-it-works` | 4-phase process walkthrough (map → build → test → tune) |
| `/lead-intelligence` | LLC Owner Finder deep dive |
| `/seo` | Local SEO audits + GBP optimization |
| `/web-development` | React/Next.js builds for trades |
| `/outreach-automation` | Email/SMS sequences |
| `/insights` / `/insights/[slug]` | ISR 60s, prose via `marked` |
| `/review` | Token-gated draft review (email only) |
| `/dashboard` | enriched_leads ranked list, Supabase Auth gated |
| `/dashboard/login` | No public registration; users created manually in Supabase |
| `/case-study` | Placeholder — **noindexed**, do not remove until real content |
| `/contact` | Form → `/api/contact` → Resend to alex@rebbadvisors.com |

**Nav:** logo · Services ▾ (Lead Intelligence / Outreach Automation / Local SEO / Web Development) · How It Works · Insights · Contact · [Get More Jobs CTA]

## Python Pipeline — Open Tech Debt

- **No unit tests** — `normalize_person_name()`, `score_signal()`, `_parse_borrower_from_text()`, and `is_enriched()` are pure functions with complex logic and zero test coverage. Any refactor is unprotected.
- **`fetch_pending_signals` NOT IN query** — uses `.filter("id", "not.in", ...)` which passes as a URL param; hits length limits at ~2000+ enriched signals. Move to a Postgres function/view when volume grows.
- **`principal_role` constants** — defined in `enrich_models.py`. TypeScript dashboard maps confidence tiers by `startsWith()` prefix.
