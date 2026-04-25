# REBB Advisors Website

## Business Context

**Business:** REBB Advisors — Greenville SC. Hyper-focused dental website cleanup, with scoped rebuilds for practices that need more.
**Tone:** Confident, minimal, blunt. No fluff.
**Target:** Dental practices only (general, ortho, pediatric, oral surgery, cosmetic/implants, perio, endo). Greenville County + Upstate SC. The public site must not reference other verticals — the internal prospects pipeline also audits personal injury firms, but that is outbound-only.

**Rule #1: Confused customers don't buy.** One entry point (free audit), one deliverable (written proposal), one CTA. No public tier menu.

**Public offer — single anchor:**
- **Cleanup** — starts at $1,500, five business days. No retainer. The only number displayed publicly. "Starting at" framing is deliberate: audits reveal tiered scope — some dentists need the minimum Cleanup, others need more. We do not commit to a flat $1,500 for every engagement.
- **Larger rebuilds** — scoped per practice inside the written proposal. Setup + $500/mo retainer typical for scoped rebuilds; month-to-month, 30-day cancel. Never priced on the public site.

The `/sample-proposal` page uses a fictional "Pinecrest Family Dentistry" recommending a $4,500 setup + $500/mo scoped rebuild as a concrete example of what a written proposal looks like — that is illustrative, not a public tier.

**Positioning:**
- **One-liner anchor:** REBB = the company that finds and fixes hidden patient loss. Every copy decision orbits this — not "web design," not "performance optimization," not "dental marketing."
- "The proposal is the product." If the audit shows no engagement is needed, say so.
- Retainers month-to-month, 30-day cancel. No long-term contracts, no strategy calls, no à la carte.
- **Homepage follows a StoryBrand arc** (April 2026): hero (audience name + internal problem) → villain (StakesSection, "the invisible leak" — the patient you never meet) → guide's authority (BeforeAfterSection, cohort stat) → plan (ProcessSection + CompetenceSection) → supporting evidence (HipaaSection, demoted) → victory (SuccessSection) → price → FAQ → lead magnet → final CTA. Hero eyebrow: "For dentists whose reputations are better than their websites." H1: "Your patients love you. Your website doesn't show it." City pages keep the Cleanup-anchored geo eyebrow; practice-type pages carry specialty-specific heroes.
- **CTAs:** All body CTAs across the public site (homepage hero + sections, city pages, practice-type pages) read **"See if your website is losing patients"** — the StoryBrand villain pulled into the button so the click is about exposing a hidden leak, not requesting a service. Nav stays Title-case **"Get Free Audit"** (button-convention shortform — the long line wraps in a 130px nav slot). Do not reintroduce "Show me what's broken" or "Get your free audit" in body copy without an A/B test plan; the unified CTA is a deliberate voice decision, not a default.

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

- **`src/components/HomeSections.tsx`** — shared marketing sections: `HipaaSection`, `ProcessSection`, `CompetenceSection`, `BeforeAfterSection`, `StakesSection`, `SuccessSection`, `PricingSection`, `FaqSection`, `FinalCtaSection` + `faqs`, `faqJsonLd`, `buildFaqJsonLd(list)`, `Faq`, `ArrowIcon`. `StakesSection` takes optional `cohortN / cohortAvgRating / cohortUnder50Pct` props for the live invisible-leak callout. `BeforeAfterSection` accepts `{ intro?, methodology?, patterns? }` — homepage (`src/app/page.tsx`, async, `revalidate = 3600`) wires it to `fetchPortfolioStats()` for a story-first live cohort intro ("We expected bad websites from bad practices…" then the cohort stat). Methodology footer is intentionally NOT passed on the homepage (founder voice — kills the "audit pipeline" / "counts refresh" agency tone); the prop still exists for other surfaces. Falls back to qualitative copy if the query fails. `CompetenceSection` renders on `/page.tsx` + `/dental-website-cleanup/[city]` only (meta-redundant on practice-type pages); reads `practiceTypeList` and applies `p.imagePosition` when set; row labels render `text-sm md:text-base font-extrabold`. `FaqSection` takes optional `{ items?, eyebrow?, headlineTop?, headlineBottom?, lede? }` so practice-type pages swap in specialty FAQs; pair with `buildFaqJsonLd(items)` to keep JSON-LD matching rendered content. `HipaaSection` grid ratio `1.4fr,0.6fr` (intentional); image at `/public/hipaa.jpg`. `SuccessSection` is a copy+image grid (`1.05fr,0.95fr`); image at `/public/after-cleanup.jpg` (post-care patient/dentist — the StoryBrand victory beat). City pages REPLACE BeforeAfterSection with `<CityAuditStats>` when per-county data exists.
- **`src/lib/practiceTypes.ts`** — `PracticeTypeSlug` union (cosmetic / pediatric / sedation / emergency / fee-for-service `-dentist-website`). Each entry carries: CompetenceSection content (image, alt, headline, bullets) + optional `imagePosition` (applied to both hero and CompetenceSection image) + hero marketing (heroEyebrow, heroH1Top/Bottom, heroLede, heroBody) + `specificFixes` (feeds `BeforeAfterSection`) + `specialtyFaqs` (4 entries; drives the practice-type page's `FaqSection` AND its JSON-LD) + SEO (metaTitle, metaDescription, serviceName, serviceDescription). Adding a practice type = edit this file AND add a branch to `SpecialtyPlaybook`; the route/sitemap/footer pick it up automatically. Slugs ARE the URLs — renaming breaks inbound links. Two photo TODOs in-file: `sedation.jpg` (too low-res) and `membership.jpg` (subject-mismatch: clinical microscope, not anything pricing-coded) — swap before the next copy pass.
- **`src/app/[practiceType]/page.tsx`** — dynamic top-level route with `dynamicParams = false` + `generateStaticParams` from `practiceTypeSlugs`. Section order: hero → `<SpecialtyPlaybook>` → `<BeforeAfterSection patterns={pt.specificFixes}>` → HIPAA → Process → Stakes → Pricing → `<FaqSection items={pt.specialtyFaqs}>` → FinalCTA. Does NOT render `CompetenceSection` (meta-redundant on a page scoped to one practice type). Per-page `Service` + `Offer` ($1,500) JSON-LD; FAQ JSON-LD built via `buildFaqJsonLd(pt.specialtyFaqs)` so schema matches what's rendered. Hero `<Image>` applies `pt.imagePosition` via inline style. Static Next.js routes at root take precedence — don't add a root static route whose name collides with a slug, and don't rename slugs without a 301 plan.
- **`src/lib/cityStats.ts` + `src/components/CityAuditStats.tsx`** — first-party audit stats. Two server-only fetchers: `fetchCityStats(county)` (≥3 audited rows required) for per-city, and `fetchPortfolioStats()` (≥10 audited rows required, higher bar for the flagship homepage surface) for the 5-county aggregate consumed by the homepage `<BeforeAfterSection>`. Both read `website_prospects` with the service key, return `null` below their threshold. `<CityAuditStats>` is a NON-async component that takes pre-fetched stats as a prop — do not re-query inside it. Renders 4 stat tiles + up to 3 threshold-gated takeaways + a methodology footer. On `/dental-website-cleanup/[city]/page.tsx` this REPLACES `<BeforeAfterSection />` when `fetchCityStats` returns a value; falls back to the generic section otherwise. City page is `revalidate = 3600` (matches homepage).
- **`src/components/SpecialtyPlaybook.tsx`** — one entry `<SpecialtyPlaybook slug={...}>` switches to a distinct visual shape per practice type: case-result-tile anatomy (cosmetic), 14-vs-4-field form comparison (pediatric), Nitrous/Oral/IV comparison table (sedation), 3-step routing timeline (emergency), 3 Stripe membership pricing cards (FFS). Content is intentionally JSX-heavy (tables, mockups) so each specialty reads as a different page, not the same template with swapped labels. Adding a sixth practice type = new sub-component + new `case` in the switch.
- **`src/lib/cities.ts`** — `CitySlug` union (greenville, spartanburg, anderson, easley, seneca). Sitemap, Footer "Service areas" row, and `[city]` route all derive from it. Add a city by editing this file only.
- **`src/lib/clusters.ts`** — `ClusterSlug` union (booking-forms, mobile-experience, trust-and-stale-content, lighthouse-core-vitals, cleanup-vs-rebuild). Python mirror: `VALID_CLUSTERS` in `scripts/generate_insights.py` — **keep in sync**.
- **`src/components/InsightsPostList.tsx`** — shared by `/insights` index and every `/insights/topics/[cluster]` hub.
- **`src/components/VisualMocks.tsx`** — synthetic SVG/CSS mockups. Hero `BrokenPhoneHero` is a stalled-load scene (CSS-animated spinner + creeping red progress bar + half-typed name in the form + "swipe back" gesture + pulsing `4.2s` timer) — narrative beat, NOT a labeled UI diagram. Do not re-add the old "Overflow / Form 404 / Stale 2019" callout chips; that read as abstract. Other exports (`AestheticBeforeAfterMock`, `FormErrorMock`, `CrampedMobileMock`, `StaleFooterMock`, `LighthouseGaugeMock`) are kept for non-hero surfaces. **Intentional theme-token exception**: fixed neutral grays + red callouts represent *other people's* broken sites, not REBB's surface. All animations are pure CSS keyframes inlined via `<style>` so the file stays a server component.
- **`Nav.tsx` + `Footer.tsx`** — return `null` on `/dashboard/*` (via `usePathname`). Do NOT re-add chrome there.
- **`proxy.ts`** (root) — Next.js 16 route proxy, replaces `middleware.ts`. Guards `/dashboard/*`. Do NOT create `middleware.ts`.
- **`src/app/dashboard/_components/DashboardShell.tsx`** — async server component wrapping every dashboard route. Owns header, `<DashNav>`, signed-in email + sign-out form, stat row slot, optional `filters` slot. Props: `title`, `subtitle`, `active`, `stats`, `filters?`, `children`. Stats render in their own row *below* the title (not beside the sign-out) — this is deliberate; the earlier right-rail placement crowded the chrome and forced a flex layout that couldn't breathe. Pair with `<StatTile>` for the stat row. Add a new tab by extending `TABS` in `_components/DashNav.tsx` + the `DashNavKey` union. `getCurrentUser()` lives in `_lib/auth.ts`. Do NOT rebuild the header per page.
- **`src/app/dashboard/prospects/ProspectTable.tsx`** — client component that renders the prospects table + row-detail drawer. `page.tsx` stays a server component and just loads data. Any interactive child (mailto links, `<details>`, `OutreachCell`) must `stopPropagation` on click or it'll also open the drawer. Drawer re-mounts via `key={prospect.id}` so notes state resets cleanly per row — do NOT re-add a `useEffect` to sync notes.
- **`app/opengraph-image.tsx`** — edge Satori OG image, auto-injected. Do NOT set `openGraph.images` in page metadata — it conflicts.
- **Redirects** (all `permanentRedirect("/")`): `/how-it-works`, `/web-development`, `/seo`, `/lead-intelligence`, `/outreach-automation`. Kept for inbound-link preservation.

**Public routes:** `/`, `/dental-website-cleanup/{city}`, `/{cosmetic|pediatric|sedation|emergency|fee-for-service}-dentist-website`, `/sample-proposal`, `/contact`, `/insights`, `/insights/topics/{cluster}`, `/insights/[slug]`, `/review` (token-gated, not in nav), `/case-study` (**noindexed** — do not remove until real content exists).
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

### Dashboard table conventions

Applies to every table under `src/app/dashboard/**`. Deviating from these rules is usually a regression — check git log before "fixing" any of them.

- **Two font sizes only.** Body cells use `text-sm` for primary content and `text-xs` for meta (roles, dates, subcopy, truncated hostnames). Do NOT introduce `text-[10px]`, `text-[9px]`, or any arbitrary smaller size — the cascade got collapsed deliberately.
- **Headers are quiet.** `text-xs font-medium theme-text-muted`. No `uppercase tracking-widest` — that treatment belongs on marketing section labels, not on 9 columns of a CRM table where every header would shout equally.
- **Sticky thead.** `<thead className="sticky top-0 z-10 theme-card-muted">` on any table that can exceed ~15 rows. The outer `overflow-x-auto` wrapper doesn't block vertical sticky.
- **Row padding:** `px-4 py-3` for `<td>`, `px-4 py-2.5` for `<th>`. Do not revert to `py-4` — rows felt bloated on a 200+ row call list.
- **No rank/`#` column.** The tables are pre-sorted (score desc, severity desc). A visible rank number duplicates that and steals ~60px of width.
- **No emoji in dashboard UI.** Use text labels (`Mobile` / `Desktop`, not `📱` / `🖥`). The `↗` arrow on external links is fine — it's typographic, not pictographic. This keeps the Stripe/Linear aesthetic intact.

## SEO Architecture

- Every page: `title` (includes "Greenville SC"), `description`, `openGraph`, `alternates.canonical`.
- **JSON-LD:**
  - `ProfessionalService` in `layout.tsx` with a single `makesOffer` Offer (Cleanup $1,500). `priceRange: "$1,500+"`, 5-county `areaServed`. Do not reintroduce `hasOfferCatalog` — we do not publish larger-scope prices.
  - `FAQPage` on homepage + every city page (shared `faqJsonLd`) AND every practice-type page (scoped to `pt.specialtyFaqs` via `buildFaqJsonLd` — keeps schema matching rendered content).
  - `Service` + single `Offer` ($1,500) on each city page AND each practice-type page, with `areaServed: AdministrativeArea` (county) or `AdministrativeArea: Upstate SC` respectively. No `AggregateOffer` — we do not publish larger-scope prices.
  - `Article` + `BreadcrumbList` on each insights post.
  - `CollectionPage` + `BreadcrumbList` on each topic hub.
- **City pages** (`/dental-website-cleanup/{slug}`) and **topic hubs** (`/insights/topics/{slug}`) are SSG via `generateStaticParams`. Cities: priority 0.8 weekly in sitemap. Adding/renaming a cluster requires editing `lib/clusters.ts` AND `VALID_CLUSTERS` in `generate_insights.py`.
- **"Dental Website Cleanup" is the wedge keyword.** City-page eyebrows still lead with it; the homepage moved its eyebrow to the StoryBrand one-liner (keyword anchoring lost on the homepage hero, retained in metadata, PricingSection H1, and FAQ). Larger scope is never advertised publicly. Renaming the `/dental-website-cleanup/` URL tree requires Search Console impression data first.

## Marketing Copy Standards

### Voice
- Blunt, concrete, no agency-speak. Short sentences. Period-separated statements over comma-separated clauses.
- "If X, we'll say so" framing — anti-upsell credibility signal. Only works when it's true.
- "The proposal is the product." — reuse if writing new copy.

### Sell outcomes, not the stack
- **The sales surface** (homepage hero, HIPAA/Process/Competence/BeforeAfter/Stakes/Pricing sections, city pages, FAQ) speaks in dentist-frustration language and visible outcomes. No stack words, no SEO jargon. Name the thing the dentist can *see or feel*: "patients can actually book," "show up when patients Google 'dentist near me,'" "new reviews arrive steadily." Translate — never expose — terms like `schema markup`, `Lighthouse`, `Core Web Vitals`, `CRO`, `NAP`. Real product names dentists recognize (Google Business Profile, reviews, landing pages) are fine.
- **The proof/education surface** (`/sample-proposal`, `/insights`, lead-magnet checklist) is where technical depth lives. Schema, Lighthouse scores, LCP/CLS, NAP consistency — load-bearing there because it signals expertise. Do not sanitize these surfaces to match the sales surface; the contrast is the credibility play.
- **Stack is invisible on the public site.** Never reference Next.js, React, WordPress, Wix, Squarespace, or any CMS by name in marketing copy. Custom builds are the default but stay unnamed; the audit decides scope inside the written proposal.
- **Outcome vocabulary is still being honed.** Copy is "best guess v1" until real audit conversations produce verbatim dentist phrases worth mirroring back. Expect quarterly copy passes.

### Show, don't tell
- The site sells *audits* and *written proposals*. `/sample-proposal` is the live proof-of-deliverable.
- **Synthetic visual mocks only for website content** (`VisualMocks.tsx`). NO real company names, logos, screenshots, or identifiable layouts — not even anonymized. The prospects pipeline captures real sites; never expose any of that to the public site.
- **Photography of people / environments is fine** and lives in `public/practice-types/` (one per `CompetenceSection` row). Source originals go in `/pics/` (gitignored); compress via `sharp` at 1600px wide / q=80 mozjpeg to land each file ~100–250 KB. Next.js `<Image>` handles per-viewport downscaling at runtime.
- Sample proposal uses fictional "Pinecrest Family Dentistry" with fabricated-but-plausible findings.

### What the site does NOT promise
- No "digital transformation." No marketing-strategy calls. Never write copy that implies retainer lock-in.
- No full rebuilds disguised as Cleanup. A rebuild is a custom-scoped proposal; the audit makes that call.

### CTAs
- Always link to `/contact`. No secondary link in the hero except "See a sample proposal" in fine print.

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

## Dashboard — Long-Term UX Roadmap

Ordered by long-term leverage (not what's visible today). The user settled on this sequence for the internal CRM at `/dashboard` + `/dashboard/prospects`. Do the earlier items first — each one makes the next cheaper.

**Done**
1. **Design tokens** — `.tone-{hot,warm,cool,good,good-strong,neutral,info}` in `globals.css`. All dashboard status/severity colors route through them (see Design System section).
2. **Shared shell** — `DashboardShell` + `DashNav` + `StatTile` + `getCurrentUser()` extracted to `src/app/dashboard/_components/` and `_lib/`.
3. **Typography + layout pass** — font cascade collapsed to two sizes (`text-sm` / `text-xs`), table headers quieted (`font-medium theme-text-muted`, no uppercase tracking-widest), sticky thead, row padding tightened to `py-3`, rank column dropped, emoji screenshot buttons replaced with text pills. Stats moved out of header chrome into their own row under the title. Conventions codified above under "Dashboard table conventions" — check there before touching table styles.
4. **Row-detail drawer + notes (prospects)** — `ProspectTable.tsx` client component owns row click → right-side drawer with editable notes (auto-saves on blur via `updateNotes` action), contact, screenshot previews, audit detail. Single `notes text` column on `website_prospects`; upgrade to append-only `prospect_notes` table later without rewriting the drawer. Leads side still pending — mirror the same pattern (`enriched_leads.notes` already exists).

**Next**
5. **Generic `<DataTable>` primitive** — do NOT bolt sort/filter onto one page. Build a column-def-driven table with sort, text filter, tag/status filter, pagination, URL-synced state, column visibility. TanStack Table is the default pick. Use on both dashboard pages. Biggest UX lever because every future internal view is a table. Sticky thead is already in place per-page — the primitive should keep that as a default.
6. **Generated Supabase types + shared types package** — kill the `as unknown as EnrichedLead[]` / `as unknown as Prospect[]` casts, catch schema drift at build time. Formalize the TS↔Python coupling around `principal_role` prefixes and cluster slugs instead of string-matching.
7. **`error.tsx` + nested `loading.tsx` per dashboard route** — prospects page currently throws into the void; leads page silently 500s on Supabase errors.
8. **A11y pass** — row focus styles, aria-labels on icon-only buttons, stat-tile labels, nested-interactive cleanup (`<details>` inside row). Mostly solved for free by the DataTable primitive.
9. **URL as state** — filters/sort/selected-row in query params so dashboard views are linkable ("send me the HOT dental list"). Free once DataTable lands.

**Explicitly deprioritized**
- Mobile responsive layout — internal CRM, desktop-only by design. Don't "fix."
- Horizontal scroll on desktop — solved by DataTable column visibility; not worth a standalone pass.

**Non-goals masquerading as tasks** — do not be tempted by these over the roadmap above:
- Adding more badge tones before a real use case demands one.
- Rebuilding the shell into a client component.
- Adding react-query / SWR before server components demonstrably fall short.

## Python Pipeline — Open Tech Debt

- **Partial unit-test coverage** — `scripts/tests/test_prospects.py` covers the `scripts/prospects/` pure functions (`is_practitioner_name`, `detect_*`, `score_severity`, `extract_emails`, `rank_emails`, `extract_decision_maker`, candidate-page helpers). Run: `python -m unittest scripts.tests.test_prospects -v`. Still uncovered on the enrichment side: `normalize_person_name()`, `score_signal()`, `_parse_borrower_from_text()`, `is_enriched()`.
- **`fetch_pending_signals` NOT IN query** — `.filter("id", "not.in", ...)` passed as URL param; hits length limits at ~2000+ enriched signals.
- **`principal_role` constants** — defined in `enrich_models.py`. TypeScript dashboard maps confidence tiers by `startsWith()` prefix.
