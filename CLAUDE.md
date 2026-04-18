# REBB Advisors Website

## Business Context

**Business:** REBB Advisors — Greenville SC. Website cleanup for dental practices.
**Tone:** Confident, minimal, blunt. No fluff.
**Rule #1: Confused customers don't buy.** Site is intentionally single-offer, minimal nav, one CTA above the fold.

**Public offer (single):** Flat-fee website cleanup for dental practices — broken booking forms, mobile layout fixes, basic modernization, trust cleanup. 48-hour turnaround. **Flat fee is disclosed in the `#pricing` section, not in the hero.**

**Lead magnet:** Free screenshot audit. Practice sends URL → REBB replies with screenshots of what's broken. No sales call required. This is the entry point — the paid cleanup is the downstream conversion, not the hero CTA.

**Target:** Dental practices only. General dentistry, orthodontics, pediatric, oral surgery, cosmetic/implants, periodontics, endodontics. Greenville County + Upstate SC. The public site should not reference any other vertical — the internal prospects pipeline also audits personal injury firms, but that is outbound-only and not pitched on the marketing site.

**Positioning:**
- "If the cleanup is the right fit, we quote it. If it needs a rebuild instead, we say so."
- No retainers. No open-ended agency work. No marketing-strategy calls.
- The rebuild is the upsell after the audit, not the bait in the offer.

**Internal tooling (not customer-facing):**
- `scripts/prospects/` — weekly outbound: discovers dental + PI firms, audits sites, scores severity, emails a HOT/WARM digest. Surfaces on `/dashboard/prospects` (auth-gated).
- `scripts/gvl_monitor.py` + `scripts/enrich.py` + `scripts/run_daily.py` — legacy LLC-to-human resolution pipeline (property transfers + mortgages + SOS filings → `enriched_leads`). Still runs; surfaces on `/dashboard` (auth-gated). Not pitched on the public site.
- `scripts/generate_insights.py` — AI-drafted blog posts (Gemini → DRAFT → manual approve → `/insights`). Still operational; `/insights` is not currently in the public nav.

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
│   ├── layout.tsx               — root layout, ProfessionalService JSON-LD
│   ├── opengraph-image.tsx      — edge Satori OG image (auto-injected; don't set openGraph.images)
│   ├── sitemap.ts / robots.ts
│   ├── page.tsx                 — single-offer homepage
│   ├── contact/page.tsx         — client component form → /api/contact
│   ├── how-it-works / seo / web-development / lead-intelligence / outreach-automation
│   │                            — all permanentRedirect("/"); kept for inbound link preservation
│   ├── insights/page.tsx + [slug]/page.tsx — ISR 60s (not in public nav)
│   ├── review/page.tsx          — token-gated draft review (not in nav)
│   ├── case-study/page.tsx      — placeholder, noindexed
│   ├── dashboard/page.tsx       — enriched_leads ranked list, auth-gated; dedup by principal_name
│   ├── dashboard/prospects/page.tsx — website_prospects ranked list, auth-gated
│   ├── dashboard/login/page.tsx + actions.ts — Supabase Auth server action
│   └── api/contact/route.ts + publish/route.ts
├── components/
│   ├── Nav.tsx, Footer.tsx      — return null on /dashboard/*
│   ├── VisualMocks.tsx          — synthetic SVG/CSS mockups (broken phone, form 404, cramped mobile, stale copyright, low Lighthouse). Pure presentational server components.
│   ├── LiveSignalFeed.tsx       — real-time Supabase Realtime terminal (client) — still present but not on homepage
│   ├── CompanyBrainDemo.tsx     — legacy Company Brain chat mockup — still present but not on homepage
│   └── ThemeProvider.tsx + DarkModeToggle.tsx — dark mode (client)
└── lib/supabase.ts

proxy.ts   — Next.js 16 route proxy (replaces middleware.ts); guards /dashboard/*

scripts/
├── generate_insights.py         — Gemini → DRAFT → email
├── approve_post.py              — CLI draft management
├── weekly_insights.py           — topic rotation (GH Actions Monday 8am EST)
├── run_daily.py                 — pipeline orchestrator
├── gvl_monitor.py               — scraper: deeds (GovOS), SOS (DDG), mortgages (CountyWeb)
├── enrich.py                    — enrichment orchestrator
├── enrich_gis.py                — GIS tax query + property detail lookup
├── enrich_web.py                — DuckDuckGo + SC SOS entity pages
├── enrich_mort.py               — CountyWeb mortgage OCR
├── enrich_models.py             — shared types, constants, name normalization; ENRICH_VERSION
├── enrich_contact.py            — PDL person + company contact enrichment
├── weekly_leads_digest.py       — weekly email digest
├── run_daily.bat                — local Windows pipeline runner
├── prospects/                   — website-audit outbound pipeline (dental / PI)
│   ├── discover.py              — Google Places text search → website_prospects
│   ├── detectors.py             — pure detectors (viewport, HTTPS, forms, copyright, Lighthouse)
│   ├── contact_extract.py       — pure extractors for decision-maker + ranked emails
│   ├── audit.py                 — Playwright capture, crawl, extraction, upload, scoring
│   ├── digest.py                — weekly HOT/WARM email digest; dedup via emailed_at
│   └── run_prospects.py         — CLI: --discover / --audit-pending / --audit-url / --re-audit / --digest
├── lib/db_models.py             — Pydantic row validators (extra="forbid")
├── lib/email_format.py          — shared email formatting helpers
└── requirements.txt / requirements-insights.txt / requirements-scraper.txt

.github/workflows/weekly-insights.yml + daily-leads.yml + weekly-prospects.yml
supabase/schema.sql
```

## Design System

- **Palette lives in CSS custom properties** in `globals.css` (`:root` light, `html.dark` dark). Do NOT hardcode hex / `bg-gray-950` — use `.theme-*` utility classes (`theme-text-primary/secondary/muted`, `theme-border`, `theme-card`, `theme-card-strong`, `theme-card-muted`, `theme-label`, `theme-cta`, `theme-cta-accent`, `theme-badge`, `theme-section-contrast`). Tokens: light bg `#f4f0e8` (cream), dark bg `#0f1411`; accent green `#238a59` light / `#43bd78` dark.
- **Tailwind `dark:` variant** wired via `@custom-variant dark (&:where(.dark, .dark *))` — use only for one-off cases the theme tokens don't cover.
- **Visual mocks (`VisualMocks.tsx`) are an intentional exception** — they represent external websites, not REBB's own surface, so they use fixed neutral grays + red callouts rather than theme tokens. They must look credible as "this is someone else's broken site" in both light and dark modes.
- Typography: system font stack (no Google Fonts — Turbopack http2 error at build time)
- Sections: `py-24 md:py-32`, max-width `max-w-6xl`, articles `max-w-2xl`
- Direction: Stripe / Linear aesthetic — whitespace, strong type scale, minimal decoration

## SEO Architecture

- OG image: `opengraph-image.tsx` (edge Satori). **Do NOT set `openGraph.images` in page metadata** — conflicts.
- Every page: `title` (includes "Greenville SC"), `description`, `openGraph`, `alternates.canonical`
- `/case-study` has `robots: { index: false }` — do not remove until real content exists
- JSON-LD: `ProfessionalService`, `areaServed: Greenville County SC` in `layout.tsx`

## Key Conventions

- Tailwind v4: `@theme {}` in `globals.css`. Typography: `@plugin "@tailwindcss/typography"`.
- All pages are server components except: `Nav`, `Footer`, `LiveSignalFeed`, `ThemeProvider`, `DarkModeToggle`, `/contact/page.tsx`
- **Dark mode:** class-based (`html.dark`). ThemeProvider → localStorage. `suppressHydrationWarning` on `<html>` + inline script in `layout.tsx` prevent flash.
- `Nav` + `Footer` return `null` on `/dashboard/*` (via `usePathname`) so admin views render without the marketing chrome. Do NOT re-add a sticky header there.
- CTAs always link to `/contact`.
- Section labels: `text-xs font-semibold uppercase tracking-widest theme-label`
- Dark contrast surfaces: wrap in `theme-section-contrast` / `theme-card-contrast` (auto-flips token values).
- Article body: `prose theme-prose max-w-none` + `dangerouslySetInnerHTML`

## Marketing Copy Standards

### Rule #1 — Confused customers don't buy
- **One offer, one price, one timeline.** No bundles, no tiers, no "packages."
- **One CTA above the fold.** Hero CTA matches nav CTA. No secondary link in the hero.
- **Lead with the problem, not the price.** Price is disclosed in `#pricing`. The hero's job is to make the prospect feel the pain.

### Voice
- Blunt, concrete, no agency-speak.
- Short sentences. Period-separated statements over comma-separated clauses.
- "If X, we'll say so" framing — anti-upsell credibility signal. Only works when it's true.

### Show, don't tell
- The site sells *audits*. It must visibly demonstrate what an audit surfaces.
- Use **synthetic visual mocks only** (`components/VisualMocks.tsx`). NO real company names, logos, screenshots, or identifiable layouts — not even anonymized. The internal prospects pipeline captures real sites; do not expose any of that to the public site.
- Text cards describing problems must be paired with or replaced by a mock that shows the problem.

### Problems the site sells
In descending severity, these are the failures that justify the cleanup:
1. **Form 404 / 405** — contact form posts to a dead endpoint; lead never reaches the business.
2. **No mobile viewport** — desktop layout pinch-zoomed into a phone screen; visitors bounce.
3. **Stale copyright** — "© 2019" still in the footer; business looks abandoned whether it is or not.
4. **Low Lighthouse score** — slow loading, heavy, poor Core Web Vitals.

### Homepage section order
1. **Hero** — problem-first H1, outcome subcopy, single CTA, broken-phone visual.
2. **Visual proof** (`#what-we-fix`) — "What broken actually looks like." Four mocks with short captions.
3. **Process** (`#process`) — three steps, no pricing mention.
4. **Pricing** (`#pricing`) — first explicit price mention on the page.
5. **Outcomes** — what success looks like.
6. **Final CTA** — concrete and blunt.

### What the site does NOT promise
- No "digital transformation."
- No retainers, no SEO packages, no "ongoing optimization."
- No marketing-strategy calls.
- No full rebuilds under the cleanup flat fee. If the audit reveals a rebuild is needed, it's quoted separately.

## Supabase

- Env: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Tables: `market_signals` · `blog_posts` · `clients` · `enriched_leads` · `website_prospects`
- RLS: `market_signals` + `blog_posts` have public SELECT. `clients` + `enriched_leads` + `website_prospects` service key only.
- Realtime on `market_signals` via `supabase_realtime` publication.
- Storage bucket: `prospect-audits` (public) — mobile+desktop PNG screenshots keyed by `{prospect_id}/{kind}-{ts}.png`.

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
| `source_key` | text | dedup key — unique constraint, NULLs exempt |
| `signal_type` | text | `MORTGAGE_FILING` / `NOMINAL_TRANSFER` / null |

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
| `transfer_type` | text | `NOMINAL_TRANSFER` or null — dashboard shows "Trust / Family" badge and hides dollar value |
| `enrichment_version` | integer | version of `ENRICH_VERSION` at write time; null on legacy rows |
| `notes` | text | |

### website_prospects columns

| Column | Type | Notes |
|---|---|---|
| `place_id` | text | Google Places ID, UNIQUE dedup key |
| `business_name` / `vertical` | text | `dental` \| `personal_injury` |
| `address` / `city` / `county` / `phone` / `website_url` | text | `website_url` NULL → highest-severity class |
| `google_rating` / `google_review_count` | numeric / integer | |
| `audit_status` | text | `pending` / `no_website` / `audited` / `error` |
| `issues` | jsonb | viewport/https/forms/copyright/lighthouse |
| `severity_score` / `severity_tag` | integer / text | 0-100 · HOT / WARM / COLD |
| `mobile_screenshot_url` / `desktop_screenshot_url` | text | Supabase Storage public URLs |
| `lighthouse_mobile_score` | integer | |
| `audit_error` | text | |
| `contact_status` | text | `not_contacted` / `contacted` / `replied` / `booked` / `dead` |
| `emailed_at` | timestamptz | NULL = eligible for next digest |
| `contact_emails` | jsonb | ranked `[{email, score, role_hint}]` |
| `primary_email` | text | top-ranked email (score ≥ 20) |
| `decision_maker_name` / `decision_maker_title` | text | best-guess owner/dentist/partner |

## Market Insights Engine

Workflow: `generate_insights.py --topic "..."` → Gemini → DRAFT → email to alex@ → manual click publishes → `revalidatePath('/insights')`

```bash
cd scripts
python generate_insights.py --topic "..." [--dry-run]
python generate_insights.py --test-email
python weekly_insights.py [--dry-run]
python approve_post.py --list-drafts
python approve_post.py --id <uuid> --view / --edit / --status PUBLISHED
```

**GH Actions — weekly-insights.yml:** Monday 13:00 UTC, Python 3.12, `requirements-insights.txt`.
Secrets: `SUPABASE_URL` · `SUPABASE_SERVICE_KEY` · `GEMINI_API_KEY` · `RESEND_API_KEY` · `NOTIFICATION_EMAIL` · `PUBLISH_SECRET` · `NEXT_PUBLIC_SITE_URL`

**`/review`:** `?id=<uuid>&token=<PUBLISH_SECRET>` — server component, token-gated. Not in nav.
**`/api/publish`:** `GET ?id=&token=` — idempotent, `revalidatePath('/insights')`.

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

**GovOS deed scraper:** React SPA. Date: `aria-label="Starting Recorded Date"` + `press_sequentially()`. Submit: `data-testid="searchSubmitButton"`. Results: `tr.is-uncertified`. Direct `/document/{id}` URLs return 404 — must click from live Playwright session. Only DEED / WARRANTY DEED / DEED OF TRUST / QUIT CLAIM kept. Dedup key: `deeds:{GRANTEE}:{rec_date}`.

**CountyWeb mortgage scraper:** Login via `page.evaluate("doLogin()")`. Nested iframes: `bodyframe` → `dynSearchFrame` → `criteriaframe`. Datagrid: `field 6`=rec_date · `field 7`=doc_type · `field 9`=borrower · `field 11`=lender. Filter doc types by exact set membership (not substring). Grantor = borrower (who we want). Dedup key: `mtg:{BORROWER}:{rec_date}`.

**SOS scraper:** DDG `site:businessfilings.sc.gov "Greenville"` → detail pages (no CAPTCHA on detail URLs).

**Dedup:** `source_key` upsert. Demo signals have null key — always insert.

## Daily Pipeline (run_daily.py)

```bash
python run_daily.py [--dry-run] [--days 14] [--no-deeds] [--no-mortgages] [--no-enrich] [--no-alert]
python weekly_leads_digest.py [--days 14] [--all] [--dry-run]
```

**GH Actions daily-leads.yml (4am EST):** mortgage scraper → `--run-pending` → `--retry-pending` → `--run-contact` → alert email. Deed scraper runs locally only.
Secrets: `SUPABASE_URL` · `SUPABASE_SERVICE_KEY` · `RESEND_API_KEY` · `NOTIFICATION_EMAIL` · `ROD_PASSWORD` · `ROD_VIEWER_USERNAME` · `PDL_API_KEY`
Python 3.12 required. `requirements-scraper.txt` + `apt-get install tesseract-ocr`.

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

### Enrichment chain

**Step 0 — Mortgage OCR** (deed + mortgage signals with LLC entity names): CountyWeb viewer, match by entity name + rec_date ±3 days. Fetch last 4 pages as PNG via `viewImagePNG.do` (jsessionid in URL path — NOT cookie). `_parse_borrower_from_text()`: 6 structured regex patterns → heuristic fallback. Standard SC layout: `BORROWER:\n[LLC]\n\nBy ___\n\nName, Title`. Browser errors return partial result — they do not raise.

**Step 1 — GVL tax query (`votaxqry`):** Form at `greenvillecounty.org/appsas400/votaxqry/`. Force `hdn_SearchCategory = "Real Estate"` via `page.evaluate()`. Strip LLC/INC/CORP and "AND ..." joint suffixes. Results: `cells[0]`=name+href · `cells[1]`=Map#/PIN. Skip vehicle codes. Name-flip retry on 0 results.

**Step 1b — PIN Pivot:** Fetch `RealProperty/Details.aspx?MapNumber=<PIN>` (public). Shows Owner/Care Of/Mailing Address. If Care Of = human → done. If mailing is residential → GIS name search at that address.

**Step 2 — DuckDuckGo (5 queries):** `[entity] Greenville SC owner` · `site:businessfilings.sc.gov "[entity]"` · `site:upstatebusinessjournal.com "[entity]"` · `site:gsabizwire.com "[entity]"` · mailing address query. Email + phone regex extracted from snippets.

**Step 2b — Initials logic:** If LLC = `[2-5 initials] + Partners/Group/etc.`, rank candidates whose initials match.

**Step 2c — PDL person enrichment** (`enrich_contact.py`): fires after a human name is resolved if DDG didn't surface email + phone. 100 free credits/month; credits consumed only on successful matches.

**Step 2d — PDL company enrichment** (`enrich_contact.py`): last-resort fallback when still no contact info.

**Step 3 — Manual queue:** Log mailing address + ROD viewer link, set `enrichment_status = 'pending'`.

### Enrichment versioning

`ENRICH_VERSION` in `enrich_models.py` (currently `1`) written to every row. Bump when chain meaningfully improves.

### Location resolution

`save_enriched_lead()` sets `enriched_leads.location` to: GIS-resolved property address → `signal.location` if it passes `_is_street_address()` → null. Dashboard validates `location` with `isStreetAddress()` before rendering.

### Name normalization

`normalize_person_name()`: ALL-CAPS `LASTNAME FIRSTNAME MIDDLE` → `Firstname Lastname`. Drops middle names, preserves JR/SR/II/III. For simple deed grantees (≤3 words, no "AND"), deed `entity_name` preferred over GIS.

## Website Prospects Pipeline (scripts/prospects/)

Outbound pitch list: dental + personal injury with visible website problems. Populates `website_prospects`; surfaced on `/dashboard/prospects`.

```bash
cd scripts
python -m prospects.run_prospects --discover --vertical dental --county greenville [--dry-run] [--limit N]
python -m prospects.run_prospects --discover --all
python -m prospects.run_prospects --audit-pending [--limit 10] [--vertical dental]
python -m prospects.run_prospects --audit-url https://example.com
python -m prospects.run_prospects --re-audit --days 30 [--limit N]
python -m prospects.run_prospects --digest [--min-severity 40] [--dry-run]
```

**Flow:** Places discovery writes rows as `pending` → `--audit-pending` runs Playwright mobile+desktop capture, runs detectors, hits PageSpeed Insights, uploads screenshots to Storage, writes severity (0-100) + tag (HOT ≥70 / WARM ≥40 / COLD).

**Automation:** `.github/workflows/weekly-prospects.yml` runs Mondays 14:00 UTC. Secrets: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `RESEND_API_KEY`, `NOTIFICATION_EMAIL`, `GOOGLE_PLACES_API_KEY`, optional `GOOGLE_PAGESPEED_API_KEY`.

**Digest dedup:** `digest.py` sends HOT/WARM rows where `emailed_at IS NULL` and stamps `emailed_at = now()` on send.

**Detector philosophy:** low false-positive rate over coverage. Only forms with absolute action returning **404 or 410** → `forms_unreachable` (flagged). 405/403/5xx demote to `forms_unverifiable` — false-positive form claims torch sender credibility.

**Severity weights:** viewport_missing +35, no_https +30, forms_unreachable +30, lighthouse <20 +25 / <40 +15, stale_copyright up to +20, mixed_content +10. No-website = instant 100/HOT.

**Contact extraction** (`contact_extract.py`, pure): `audit.py` follows up to 3 same-origin links with `about` / `contact` / `team` in path. Combined HTML → `extract_decision_maker()` + `rank_emails()`. `primary_email` = top-ranked email with score ≥ 20.

**Geography:** 5 counties (Greenville, Spartanburg, Anderson, Pickens, Oconee) × 2 verticals (dental, personal_injury).

## Known Issues / Gotchas

**Next.js / Framework:**
- Next.js 16: `middleware.ts` → `proxy.ts`, `export function proxy`. Do NOT create `middleware.ts`.
- Supabase Auth in App Router: use `createServerClient` from `@supabase/ssr`, NOT `createClient` from `@supabase/supabase-js`.
- `next.config.ts` sets `turbopack.root: __dirname` to suppress lockfile warning.
- Google Fonts: Turbopack http2 error at build time — system fonts everywhere including `opengraph-image.tsx`.

**Python deps:**
- `google-genai` requires `httpx>=0.28.1`. Do not downgrade `supabase` below 2.15.0.
- Tesseract: install binary separately. Override: `TESSERACT_CMD`. Missing binary degrades gracefully.
- `playwright install chromium` required after `pip install playwright`.

**GVL tax query (`votaxqry`):**
- `gcgis.org` ArcGIS API times out for non-browser requests — don't use.
- `greenvillecounty.org/vRealPr24/` returns 500 — don't use.
- New deed grantees may return 0 GIS results for weeks — county records lag filings.

## Environment Variables

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Safe to expose |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Safe to expose; RLS controls access |
| `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` | Service key — never commit |
| `GEMINI_API_KEY` | Google AI Studio |
| `RESEND_API_KEY` | Contact form + Python alerts |
| `NOTIFICATION_EMAIL` | `alex@rebbadvisors.com` |
| `PUBLISH_SECRET` | Shared secret for /review + /api/publish |
| `NEXT_PUBLIC_SITE_URL` | `https://rebbadvisors.com` |
| `ROD_EMAIL` | GovOS deed scraper |
| `ROD_PASSWORD` | GovOS + CountyWeb (shared) |
| `ROD_VIEWER_USERNAME` | CountyWeb (default: `asteryous`) |
| `PDL_API_KEY` | People Data Labs — contact enrichment |
| `GOOGLE_PLACES_API_KEY` | Places API (New). Reused by PageSpeed Insights unless `GOOGLE_PAGESPEED_API_KEY` is set. |
| `TESSERACT_CMD` | Optional — path to `tesseract.exe` if not at default |
| `DISCORD_WEBHOOK_URL` | Optional — new draft alert |
| `EDITOR` | Optional — for `approve_post.py --edit` |
| `MAIL_FROM` | Optional — email `from` address override |

## Deployment

- **Platform:** Vercel (Hobby), auto-deploy on push to `main`
- **Repo:** https://github.com/jsteryous/rebbadvisors-website
- **Production:** rebbadvisors.com (DNS via Cloudflare)

```bash
npm run dev | npm run build | npm run lint | npx vercel --prod
```

## Pages

**Public routes:**

| Route | Notes |
|---|---|
| `/` | Single-offer homepage: Hero → Visual Proof (`#what-we-fix`) → Process (`#process`) → Pricing (`#pricing`) → Outcomes → Final CTA |
| `/contact` | Form → `/api/contact` → Resend to alex@rebbadvisors.com |
| `/insights` / `/insights/[slug]` | ISR 60s, prose via `marked`. Not currently in public nav. |
| `/review` | Token-gated draft review. Not in nav. |
| `/case-study` | Placeholder — **noindexed**, do not remove until real content exists. |

**Redirects** (legacy service pages, all `permanentRedirect("/")`): `/how-it-works` · `/web-development` · `/seo` · `/lead-intelligence` · `/outreach-automation`. Kept for inbound-link preservation; do not delete without 301 strategy.

**Internal / auth-gated:**

| Route | Notes |
|---|---|
| `/dashboard` | enriched_leads ranked list (LLC Owner Finder internal tool) |
| `/dashboard/prospects` | website_prospects list (outbound pitch list internal tool) |
| `/dashboard/login` | No public registration; users created manually in Supabase |

**Nav:** logo · What We Fix · Process · Pricing · Contact · [Show Me What's Broken CTA]

## Python Pipeline — Open Tech Debt

- **No unit tests** — `normalize_person_name()`, `score_signal()`, `_parse_borrower_from_text()`, and `is_enriched()` are pure functions with complex logic and zero test coverage.
- **`fetch_pending_signals` NOT IN query** — `.filter("id", "not.in", ...)` passed as URL param; hits length limits at ~2000+ enriched signals.
- **`principal_role` constants** — defined in `enrich_models.py`. TypeScript dashboard maps confidence tiers by `startsWith()` prefix.
