# REBB Advisors Website

This file is loaded everywhere. Domain-specific context is in nested `CLAUDE.md` files:
- **`src/CLAUDE.md`** — frontend tech stack, project-structure couplings, design system, SEO architecture, Next.js gotchas.
- **`src/app/dashboard/CLAUDE.md`** — dashboard table conventions, tone tokens, roadmap.
- **`scripts/CLAUDE.md`** — Python pipeline mechanics: prospects, enrich, generate_insights, scrapers, gotchas, tech debt.

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
- **Homepage follows a StoryBrand arc** (April 2026): hero (audience name + internal problem) → villain (StakesSection, "lost revenue" — the patient you never meet) → guide's authority (BeforeAfterSection, cohort stat) → plan (ProcessSection + CompetenceSection) → supporting evidence (HipaaSection, demoted) → victory (SuccessSection) → price → FAQ → lead magnet → final CTA. Hero eyebrow: "You're a great dentist." H1: "Your patients love you. Your website doesn't show it." City pages keep the Cleanup-anchored geo eyebrow; practice-type pages carry specialty-specific heroes.
- **CTAs:** All body CTAs across the public site (homepage hero + sections, city pages, practice-type pages) read **"See if your website is losing patients"** — the StoryBrand villain pulled into the button so the click is about exposing a hidden leak, not requesting a service. Nav stays Title-case **"Get Free Audit"** (button-convention shortform — the long line wraps in a 130px nav slot). Do not reintroduce "Show me what's broken" or "Get your free audit" in body copy without an A/B test plan; the unified CTA is a deliberate voice decision, not a default.

**Internal tooling (not customer-facing):**
- `scripts/prospects/` — weekly outbound: discovers dental + PI firms, audits, scores, emails HOT/WARM digest. Surfaces on `/dashboard/prospects`.
- `scripts/gvl_monitor.py` + `enrich.py` + `run_daily.py` — legacy LLC→human resolution (deeds + mortgages + SOS → `enriched_leads`). Surfaces on `/dashboard`.
- `scripts/generate_insights.py` — AI-drafted blog posts (Gemini → DRAFT → manual approve → `/insights`).

## Marketing Copy Standards

### Voice
- Blunt, concrete, no agency-speak. Short sentences. Period-separated statements over comma-separated clauses.
- "If X, we'll say so" framing — anti-upsell credibility signal. Only works when it's true.
- "The proposal is the product." — reuse if writing new copy.

### Sell outcomes, not the stack
- **The sales surface** (homepage hero, HIPAA/Process/Competence/BeforeAfter/Stakes/Pricing sections, city pages, FAQ) speaks in dentist-frustration language and visible outcomes. No stack words, no SEO jargon. Name the thing the dentist can *see or feel*: "patients can actually book," "show up when patients Google 'dentist near me,'" "new reviews arrive steadily." Translate — never expose — terms like `schema markup`, `Lighthouse`, `Core Web Vitals`, `CRO`, `NAP`. Real product names dentists recognize (Google Business Profile, reviews, landing pages) are fine.
- **The proof/education surface** (`/sample-proposal`, `/insights`, lead-magnet checklist) is where technical depth lives. Schema, Lighthouse scores, LCP/CLS, NAP consistency — load-bearing there because it signals expertise. Do not sanitize these surfaces to match the sales surface; the contrast is the credibility play.
- **Stack is invisible on the public site.** Never reference Next.js, React, WordPress, Wix, Squarespace, or any CMS by name in marketing copy. Custom builds are the default but stay unnamed; the audit decides scope inside the written proposal.
- **Outcome vocabulary still being honed.** Mirror back verbatim dentist phrases as real audit conversations surface them.

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
