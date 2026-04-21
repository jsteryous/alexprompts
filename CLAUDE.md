# REBB Advisors Website

## Business Context

**Business:** REBB Advisors — Greenville SC. Dental website engagements at three tiers: Cleanup, Growth, Dominance.
**Tone:** Confident, minimal, blunt. No fluff.
**Target:** Dental practices only (general, ortho, pediatric, oral surgery, cosmetic/implants, perio, endo). Greenville County + Upstate SC. The public site must not reference other verticals — the internal prospects pipeline also audits personal injury firms, but that is outbound-only.

**Rule #1: Confused customers don't buy.** One entry point (free audit), one deliverable (written proposal), one CTA ("Get Free Audit + Proposal"). Tier choice happens *inside* the proposal, not on the homepage.

**Public offer — source of truth:** `tiers` array exported from `src/components/HomeSections.tsx`. Consumed by homepage PricingSection, city pages, and `/sample-proposal`. Edit there to change prices or scope. Current shape:
- **Cleanup** — $1,500 flat, 48h turnaround. No retainer.
- **Growth** — $3,500 setup + $500/mo. Month-to-month, 30-day cancel.
- **Dominance** — Custom scope ("Let's talk"). No public price. Setup + monthly retainer quoted inside the written proposal. Month-to-month, 30-day cancel. Historical anchor for internal reference: setup ~$7,500+, retainer ~$1,200+/mo.

**Positioning:**
- "The proposal is the product; the tier is just how it ships."
- Retainers are month-to-month, 30-day cancel. No long-term contracts, no strategy calls, no à la carte — custom scope goes in the written proposal, not a fourth public tier.
- If the audit shows no engagement is needed, say so. Cleanup stays available as a one-time fix.
- Sample proposal at `/sample-proposal` uses fictional "Pinecrest Family Dentistry" — keep sanitized, never reference a real practice.

**Internal tooling (not customer-facing):**
- `scripts/prospects/` — weekly outbound: discovers dental + PI firms, audits, scores, emails HOT/WARM digest. Surfaces on `/dashboard/prospects`.
- `scripts/gvl_monitor.py` + `enrich.py` + `run_daily.py` — legacy LLC→human resolution (deeds + mortgages + SOS → `enriched_leads`). Surfaces on `/dashboard`.
- `scripts/generate_insights.py` — AI-drafted blog posts (Gemini → DRAFT → manual approve → `/insights`).

## Tech Stack

- **Framework:** Next.js 16.2.2 (App Router, Turbopack)
- **Styling:** Tailwind CSS v4 (`@theme {}` in `globals.css`, not `tailwind.config.js`) + `@tailwindcss/typography`
- **Language:** TypeScript / React 19
- **Database:** Supabase (Postgres + Realtime)
- **Auth:** Supabase Auth email+password, `@supabase/ssr` for cookie sessions. No public signup.
- **Markdown:** `marked` (server-side, `/insights/[slug]`, `/review`, `/sample-proposal`)
- **Email:** Resend (raw POST, no SDK)
- **AI:** `google-genai` SDK, model `gemini-2.5-flash`

## Project Structure — Non-Obvious Couplings

These are the file relationships you can't derive by reading individual files:

- **`src/components/HomeSections.tsx`** — exports `tiers` array (single source of truth for pricing/scope), plus shared sections (VisualProofSection, ProcessSection, PricingSection, OutcomesSection, FaqSection, FinalCtaSection), `faqs`, `faqJsonLd`, `ArrowIcon`. Imported by `/page.tsx`, `/dental-website-cleanup/[city]/page.tsx`, `/sample-proposal/page.tsx`.
- **`src/lib/cities.ts`** — `CitySlug` union (greenville, spartanburg, anderson, easley, seneca). Sitemap, Footer "Service areas" row, and `[city]` route all derive from it. Add a city by editing this file only.
- **`src/lib/clusters.ts`** — `ClusterSlug` union (booking-forms, mobile-experience, trust-and-stale-content, lighthouse-core-vitals, cleanup-vs-rebuild). Python mirror: `VALID_CLUSTERS` in `scripts/generate_insights.py` — **keep in sync**.
- **`src/components/InsightsPostList.tsx`** — shared by `/insights` index and every `/insights/topics/[cluster]` hub.
- **`src/components/VisualMocks.tsx`** — synthetic SVG/CSS mockups (broken phone, form 404, cramped mobile, stale copyright, low Lighthouse). **Intentional theme-token exception**: uses fixed neutral grays + red callouts because they represent *other people's* broken sites, not REBB's surface.
- **`Nav.tsx` + `Footer.tsx`** — return `null` on `/dashboard/*` (via `usePathname`). Do NOT re-add chrome there.
- **`proxy.ts`** (root) — Next.js 16 route proxy, replaces `middleware.ts`. Guards `/dashboard/*`. Do NOT create `middleware.ts`.
- **`app/opengraph-image.tsx`** — edge Satori OG image, auto-injected. Do NOT set `openGraph.images` in page metadata — it conflicts.
- **Redirects** (all `permanentRedirect("/")`): `/how-it-works`, `/web-development`, `/seo`, `/lead-intelligence`, `/outreach-automation`. Kept for inbound-link preservation.

**Public routes:** `/`, `/dental-website-cleanup/{city}`, `/sample-proposal`, `/contact`, `/insights`, `/insights/topics/{cluster}`, `/insights/[slug]`, `/review` (token-gated, not in nav), `/case-study` (**noindexed** — do not remove until real content exists).
**Internal:** `/dashboard`, `/dashboard/prospects`, `/dashboard/login`.

## Design System

- **Palette lives in CSS custom properties** in `globals.css` (`:root` light, `html.dark` dark). Do NOT hardcode hex or `bg-gray-950` — use `.theme-*` utility classes (`theme-text-primary/secondary/muted`, `theme-border`, `theme-card`, `theme-card-strong`, `theme-card-muted`, `theme-label`, `theme-cta`, `theme-cta-accent`, `theme-badge`, `theme-section-contrast`). Tokens: light bg `#f4f0e8` (cream), dark bg `#0f1411`; accent green `#1f7d4e` light / `#43bd78` dark.
- **Dashboard status/severity colors** use semantic `.tone-*` utilities: `tone-hot` (red, critical), `tone-warm` (amber, warning), `tone-cool` (blue, informational), `tone-good` / `tone-good-strong` (green, positive — strong for terminal wins like "booked"), `tone-neutral` (gray, pending), `tone-info` (purple, categorical — e.g. Trust/Family transfers). Pair with `border` to render the outline; use `-text` variants (`tone-hot-text`, `tone-warm-text`, `tone-cool-text`, `tone-good-text`) for color-only applications (score digits, link text, stat-tile numerals). Do NOT reintroduce raw `bg-red-50` / `text-amber-600` / `dark:text-blue-400` chains inside `src/app/dashboard/**`.
- **Tailwind `dark:` variant** wired via `@custom-variant dark (&:where(.dark, .dark *))` — use only for one-off cases the tokens don't cover.
- **Dark mode:** class-based (`html.dark`). ThemeProvider → localStorage. `suppressHydrationWarning` on `<html>` + inline script in `layout.tsx` prevent flash.
- Typography: Geist Sans via the `geist` npm package (self-hosted, bypasses Google Fonts http2 build error). Falls through to a system stack on font-load failure.
- Sections: `py-24 md:py-32`, max-width `max-w-6xl`, articles `max-w-2xl`.
- Article body: `prose theme-prose max-w-none` + `dangerouslySetInnerHTML`.
- Section labels: `text-xs font-semibold uppercase tracking-widest theme-label`.
- Direction: Stripe / Linear aesthetic — whitespace, strong type scale, minimal decoration.

## SEO Architecture

- Every page: `title` (includes "Greenville SC"), `description`, `openGraph`, `alternates.canonical`.
- **JSON-LD:**
  - `ProfessionalService` in `layout.tsx` with `hasOfferCatalog` (three `Offer`s: Cleanup $1,500; Growth $3,500 setup + $500/mo `UnitPriceSpecification`; Dominance — custom, no `price`/`priceSpecification`, description notes "scope and retainer priced in proposal"). `priceRange: "$1,500+"`, 5-county `areaServed`.
  - `FAQPage` on homepage + every city page (paired with visible `#faq`).
  - `Service` + `AggregateOffer` (`lowPrice: 1500`, `offerCount: 3`, no `highPrice` since Dominance is custom) on each city page, with `areaServed: AdministrativeArea` for the county.
  - `Article` + `BreadcrumbList` on each insights post.
  - `CollectionPage` + `BreadcrumbList` on each topic hub.
- **City pages** (`/dental-website-cleanup/{slug}`) and **topic hubs** (`/insights/topics/{slug}`) are SSG via `generateStaticParams`. Cities: priority 0.8 weekly in sitemap. Adding/renaming a cluster requires editing `lib/clusters.ts` AND `VALID_CLUSTERS` in `generate_insights.py`.
- **Dual-track positioning (intentional, do not "fix"):** The homepage eyebrow is broad (`"Dental Practice Websites · Greenville SC"`) because it sells all three tiers. The city-page eyebrow stays cleanup-anchored (`"Website Cleanup for {city} Dental Practices"`) because the URL, metadata, and exact-match target keyword for those pages is *"dental website cleanup [city]"* — widening the eyebrow there dilutes the wedge. Both surfaces funnel into the same shared `PricingSection`, so a cleanup-intent visitor still encounters Growth and Dominance on scroll. Renaming the `/dental-website-cleanup/` URL tree is a separate decision that requires Search Console impression data first.

## Marketing Copy Standards

### Voice
- Blunt, concrete, no agency-speak. Short sentences. Period-separated statements over comma-separated clauses.
- "If X, we'll say so" framing — anti-upsell credibility signal. Only works when it's true.
- "The proposal is the product; the tier is just how it ships." — reuse if writing new copy.

### Sell outcomes, not the stack
- **The sales surface** (homepage hero, tier cards, `bestFor`, tier bullets, city pages, FAQ, `OutcomesSection`) speaks in dentist-frustration language and visible outcomes. No stack words, no SEO jargon. Name the thing the dentist can *see or feel*: "patients can actually book," "show up when patients Google 'dentist near me,'" "new reviews arrive steadily." Translate — never expose — terms like `schema markup`, `Lighthouse`, `Core Web Vitals`, `CRO`, `NAP`. Real product names dentists recognize (Google Business Profile, reviews, landing pages) are fine.
- **The proof/education surface** (`/sample-proposal`, `/insights`, lead-magnet checklist) is where technical depth lives. Schema, Lighthouse scores, LCP/CLS, NAP consistency — load-bearing there because it signals expertise. Do not sanitize these surfaces to match the sales surface; the contrast is the credibility play.
- **Stack is invisible on the public site.** Never reference Next.js, React, WordPress, Wix, Squarespace, or any CMS by name in marketing copy. Custom builds are the default but stay unnamed; the audit decides scope inside the written proposal.
- **Outcome vocabulary is still being honed.** Copy is "best guess v1" until real audit conversations produce verbatim dentist phrases worth mirroring back. Expect quarterly copy passes.

### Show, don't tell
- The site sells *audits* and *written proposals*. `/sample-proposal` is the live proof-of-deliverable.
- **Synthetic visual mocks only** (`VisualMocks.tsx`). NO real company names, logos, screenshots, or identifiable layouts — not even anonymized. The prospects pipeline captures real sites; never expose any of that to the public site.
- Sample proposal uses fictional "Pinecrest Family Dentistry" with fabricated-but-plausible findings.

### What the site does NOT promise
- No "digital transformation." No marketing-strategy calls.
- No long-term contracts on retainers — month-to-month only, 30-day cancel. Never write copy that implies lock-in.
- No à la carte pricing. Custom scope goes in the written proposal, not a fourth public tier.
- No full rebuilds disguised as Cleanup. A rebuild is Dominance scope (or a custom quote); the audit makes that call.

### CTAs
- Always link to `/contact`. Hero CTA matches nav CTA. No secondary link in the hero except "See a sample proposal" in fine print.

## Supabase

- Env: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Tables: `market_signals` · `blog_posts` (has `cluster text`) · `clients` · `enriched_leads` · `website_prospects`.
- RLS: `market_signals` + `blog_posts` public SELECT. `clients` + `enriched_leads` + `website_prospects` service key only.
- Realtime on `market_signals` via `supabase_realtime` publication.
- Storage bucket: `prospect-audits` (public) — keyed `{prospect_id}/{kind}-{ts}.png`.

### market_signals

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `timestamp` | timestamptz | event time |
| `event_type` | text | `PROPERTY TRANSFER` / `NEW BUSINESS FILING` / `INDUSTRIAL PERMIT` / `MORTGAGE_FILING` |
| `location` | text | address, or grantor/borrower name if no address |
| `entity_name` | text | company/owner being enriched |
| `valuation` | numeric | |
| `details` | text | context; mortgages include `Lender: {name}` |
| `score` | integer | 0–100 |
| `tag` | text | `HOT` / `WARM` / `COLD` |
| `source` | text | `deeds` / `sos` / `permits` / `demo` / `mortgages` |
| `source_key` | text | dedup key — unique, NULLs exempt |
| `signal_type` | text | `MORTGAGE_FILING` / `NOMINAL_TRANSFER` / null |

### enriched_leads

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
| `enrichment_version` | integer | `ENRICH_VERSION` at write time; null on legacy rows |
| `notes` | text | |

### website_prospects

| Column | Type | Notes |
|---|---|---|
| `place_id` | text | Google Places ID, UNIQUE dedup key |
| `business_name` / `vertical` | text | `dental` \| `personal_injury` |
| `address` / `city` / `county` / `phone` / `website_url` | text | `website_url` NULL → highest severity |
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
| `primary_email` | text | person-identified (score ≥ 50) |
| `fallback_email` | text | best shared/generic inbox when no primary |
| `decision_maker_name` / `decision_maker_title` | text | best-guess owner/dentist/partner |

## Market Insights Engine

Workflow: `generate_insights.py --topic "..." --cluster <slug>` → pulls first-party audit stats → Gemini (grounded) → DRAFT → email to alex@ → edit/publish from `/review` → `revalidatePath('/insights')`.

**EEAT grounding (`scripts/audit_stats.py`):** Before each Gemini call, aggregate stats are pulled from `website_prospects` (dental, audited): % forms unreachable, % no-viewport, % no-HTTPS, stale-copyright bands, Lighthouse median/distribution, high-rated-but-broken correlation, HOT/WARM counts. Injected into the system prompt with a *"cite ≥2 figures verbatim, attribute to REBB, don't fabricate"* directive. Methodology footer (counties, n, date, method) is auto-appended to `body_md` on save so cited stats are verifiable. Falls back silently when <5 audited rows. Inspect the current block: `python scripts/audit_stats.py`.

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

**`/review`:** `?id=<uuid>&token=<PUBLISH_SECRET>` — token-gated editor (title/summary/body_md). Not in nav.
**`/api/publish`:** `GET ?id=&token=` — idempotent, `revalidatePath('/insights')`.
**`/api/review/save`:** `POST {id, token, title, summary, body_md}` — token-gated; revalidates slug + index if post is PUBLISHED.

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

**Detector philosophy:** low false-positive rate over coverage. Forms probed on **every crawled page** (home + contact/about/team) — forms often live on `/contact`. Only absolute actions returning **404 or 410** flip `forms_unreachable`; triggering page URL + dead action land in `issues.forms_unreachable_page` / `forms_unreachable_action` so outreach can quote them. 405/403/5xx demote to `forms_unverifiable` — false-positive form claims torch sender credibility.

**Severity weights:** viewport_missing +35, no_https +30, forms_unreachable +30, lighthouse <20 +25 / <40 +15, stale_copyright up to +20, mixed_content +10. No-website = instant 100/HOT.

**Contact extraction** (`contact_extract.py`, pure): `audit.py` follows up to 3 same-origin links with `about` / `contact` / `team` in path. Combined HTML → `extract_decision_maker()` + `rank_emails()`. `primary_email` = top-ranked email with score ≥ 50 (person-identified). `fallback_email` = best address below that threshold.

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
| `PUBLISH_SECRET` | Shared secret for /review + /api/publish + /api/review/save |
| `NEXT_PUBLIC_SITE_URL` | `https://rebbadvisors.com` |
| `ROD_EMAIL` | GovOS deed scraper |
| `ROD_PASSWORD` | GovOS + CountyWeb (shared) |
| `ROD_VIEWER_USERNAME` | CountyWeb (default: `asteryous`) |
| `PDL_API_KEY` | People Data Labs |
| `GOOGLE_PLACES_API_KEY` | Places API (New). Reused by PageSpeed Insights unless `GOOGLE_PAGESPEED_API_KEY` is set. |
| `TESSERACT_CMD` | Optional — path to `tesseract.exe` |
| `DISCORD_WEBHOOK_URL` | Optional — new draft alert |
| `EDITOR` | Optional — for `approve_post.py --edit` |
| `MAIL_FROM` | Optional — email `from` override |

## Deployment

- **Platform:** Vercel (Hobby), auto-deploy on push to `main`.
- **Repo:** https://github.com/jsteryous/rebbadvisors-website
- **Production:** rebbadvisors.com (DNS via Cloudflare).

```bash
npm run dev | npm run build | npm run lint | npx vercel --prod
```

## Python Pipeline — Open Tech Debt

- **No unit tests** — `normalize_person_name()`, `score_signal()`, `_parse_borrower_from_text()`, `is_enriched()` are pure functions with complex logic and zero coverage.
- **`fetch_pending_signals` NOT IN query** — `.filter("id", "not.in", ...)` passed as URL param; hits length limits at ~2000+ enriched signals.
- **`principal_role` constants** — defined in `enrich_models.py`. TypeScript dashboard maps confidence tiers by `startsWith()` prefix.
