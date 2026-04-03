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

The proprietary data product. Weekly Python-driven syncs of Greenville County property transfers + new business filings, cross-referenced to surface warm prospects with real contact info. Delivered as a ranked call list every Monday morning. The framing: **"Who do I call this week to make money?"**

### The Offer

**30-Day Risk-Free Revenue Sprint**  
- High-speed site deployed in 5 days (pre-optimized React/Vite template)  
- The Multiplier dashboard goes live (manually at first if needed)  
- Automated lead capture + follow-up sequences installed  
- Goal: one lead the client wouldn't have found otherwise within 30 days  
- Full refund if not delivered. No questions.

## Tech Stack

- **Framework:** Next.js 16.2.2 (App Router, Turbopack)
- **Styling:** Tailwind CSS v4 (config via CSS `@theme` in `globals.css`, not `tailwind.config.js`)
- **Language:** TypeScript
- **React:** 19
- **Database:** Supabase (Postgres + Realtime)
- **Supabase JS client:** `@supabase/supabase-js`

## Project Structure

```
src/
├── app/
│   ├── globals.css             — design tokens and base styles
│   ├── layout.tsx              — root layout wrapping Nav + Footer
│   ├── page.tsx                — homepage
│   ├── how-it-works/page.tsx
│   ├── case-study/page.tsx
│   └── contact/page.tsx
├── components/
│   ├── Nav.tsx                 — sticky header with mobile menu (client component)
│   ├── Footer.tsx
│   └── LiveSignalFeed.tsx      — real-time Multiplier terminal (client component)
└── lib/
    └── supabase.ts             — Supabase client singleton (null if env vars not set)

scripts/
├── gvl_monitor.py              — Python scraper + Supabase push
└── requirements.txt            — Python dependencies

supabase/
└── schema.sql                  — market_signals table + RLS + realtime publication
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

**Spacing:** Generous — sections use `py-24 md:py-32`. Max content width `max-w-6xl`.

**Design direction:** Stripe / Linear aesthetic — lots of whitespace, strong type scale, minimal decoration.

## Key Conventions

- Tailwind v4 uses `@theme {}` in `globals.css` for custom tokens — no `tailwind.config.js`
- All pages are statically rendered (no `use client` except Nav and LiveSignalFeed)
- CTAs always link to `/contact`
- Section labels use `text-xs font-semibold uppercase tracking-widest text-green-600`
- Dark CTA sections use `bg-gray-950` or `bg-black` with `green-500` buttons

## Supabase

- **Project:** connected via `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Table:** `market_signals` — stores all Multiplier signals
- **Realtime:** enabled on `market_signals` via `supabase_realtime` publication
- **RLS:** public SELECT allowed (feed is visible on homepage); writes require service key
- **Schema:** `supabase/schema.sql` — run this in the SQL editor on a new project

### market_signals columns

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK, auto-generated |
| `created_at` | timestamptz | auto |
| `timestamp` | timestamptz | when the real-world event occurred |
| `event_type` | text | `PROPERTY TRANSFER` / `NEW BUSINESS FILING` / `INDUSTRIAL PERMIT` |
| `location` | text | street address or entity name |
| `entity_name` | text | fuzzy-resolved company/owner name |
| `valuation` | numeric | dollar amount if known |
| `details` | text | one-line human-readable context |
| `score` | integer | 0–100 lead priority |
| `tag` | text | `HOT` / `WARM` / `COLD` |
| `source` | text | `deeds` / `sos` / `permits` / `demo` |
| `source_url` | text | source page URL (optional) |
| `status` | text | lead status (optional) |

### LiveSignalFeed component behavior

- **No env vars set:** renders mock data, footer shows `DEMO MODE`
- **Env vars set:** fetches last 6 signals on mount, subscribes to Postgres `INSERT` via Realtime
- **New signal arrives:** border flashes green, header shows `NEW SIGNAL`, row slides in at top
- Feed is capped at 6 visible rows (scrollable); new inserts push oldest off the list

## Python Scraper

```bash
cd scripts
pip install -r requirements.txt

python gvl_monitor.py --demo --count 15      # seed realistic mock data
python gvl_monitor.py --demo --dry-run       # preview without writing to DB
python gvl_monitor.py --scrape deeds         # scrape GVL Register of Deeds (stub)
python gvl_monitor.py --scrape sos           # scrape SC SOS filings (stub)
python gvl_monitor.py --scrape all           # all sources
```

- Reads `.env.local` from project root automatically (no need to copy it to `scripts/`)
- Uses `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` (service role key, never exposed to browser)
- Fuzzy entity deduplication via `thefuzz`
- Real scraper stubs in `scrape_greenville_deeds()` and `scrape_sc_sos_filings()` — fill in selectors after inspecting live pages

## Market Insights Engine (Human-in-the-Loop)

AI-generated SEO articles with a mandatory manual approval gate before anything goes live.

### Workflow

```
generate_insights.py → DRAFT in Supabase → review terminal output (+ optional Discord alert)
→ approve_post.py --status PUBLISHED → visible on /insights
```

### Scripts

```bash
# Generate a draft article with Gemini
python generate_insights.py --topic "Why Greenville pool companies lose Q2 contracts"
python generate_insights.py --topic "..." --dry-run            # preview only, no DB write
python generate_insights.py --topic "..." --discord-webhook URL

# Review queue
python approve_post.py --list-drafts                           # list all DRAFT/APPROVED posts
python approve_post.py --id <uuid> --view                      # print full article to terminal
python approve_post.py --id <uuid> --edit                      # open in editor, save, optionally publish
python approve_post.py --id <uuid> --status PUBLISHED          # publish without editing
python approve_post.py --id <uuid> --status APPROVED           # mark reviewed, not yet live
python approve_post.py --id <uuid> --status DRAFT              # revert to draft
```

**Editor:** defaults to Notepad. Set `EDITOR=code --wait` in `.env.local` to use VS Code instead.

### blog_posts table columns

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
| `gemini_model` | text | e.g. `gemini-1.5-pro` |

### RLS

- Public SELECT allowed only for `status = 'PUBLISHED'`
- Service key bypasses RLS for all writes

### Required env vars (in addition to Supabase vars)

| Variable | Used by | Notes |
|---|---|---|
| `GEMINI_API_KEY` | `generate_insights.py` | Google AI Studio key |
| `DISCORD_WEBHOOK_URL` | `generate_insights.py` | Optional — "Review Needed" alert |

## Known Issues / Notes

- `next.config.ts` sets `turbopack.root: __dirname` to suppress a lockfile warning caused by a `package-lock.json` existing one level up at `C:\Users\alexs\package-lock.json`
- Google Fonts cannot be used at build time in this environment (Turbopack http2 error) — use system fonts or self-hosted fonts
- `python-levenshtein` removed from requirements (requires C compiler on Windows) — `thefuzz` works without it

## Environment Variables

| Variable | Used by | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Browser + Vercel | Safe to expose |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + Vercel | Safe to expose; RLS controls access |
| `SUPABASE_URL` | Python scripts only | Same value as above |
| `SUPABASE_SERVICE_KEY` | Python scripts only | Secret — never commit or expose |
| `GEMINI_API_KEY` | `generate_insights.py` | Google AI Studio key — secret |
| `RESEND_API_KEY` | `generate_insights.py` | Optional — Resend.com key for email alerts |
| `NOTIFICATION_EMAIL` | `generate_insights.py` | Optional — address to receive "Review Needed" emails |
| `PUBLISH_SECRET` | API route + email script | Required for one-click publish button — any random string |
| `NEXT_PUBLIC_SITE_URL` | `generate_insights.py` | Production URL for publish button link (default: https://rebbadvisors.com) |
| `DISCORD_WEBHOOK_URL` | `generate_insights.py` | Optional — Discord webhook for "Review Needed" alert |
| `EDITOR` | `approve_post.py` | Optional — editor for `--edit` flag (default: notepad / nano) |

## Deployment

- **Platform:** Vercel (Hobby — free tier)
- **GitHub repo:** https://github.com/jsteryous/rebbadvisors-website
- **Vercel project:** jsteryous-projects/rebbadvisors-website
- **Production URL:** https://rebbadvisors-website.vercel.app
- **Custom domain:** rebbadvisors.com (DNS via Cloudflare — needs to be pointed to Vercel)
- **Auto-deploy:** Every push to `main` triggers a Vercel production deploy
- **Previous host:** Render (Static Site) — no longer used

## Commands

```bash
npm run dev          # local dev server
npm run build        # production build
npm run lint         # eslint
npx vercel --prod    # manual deploy to Vercel (if needed)
```

## Pages

| Route | Status | Notes |
|---|---|---|
| `/` | Done | Hero (two-column with live signal feed), Problem, How We Do It, Multiplier deep dive, Sprint offer, CTA |
| `/how-it-works` | Done | 5-step sprint process. Guarantee callout section. |
| `/insights` | Done | Market Insights listing page — PUBLISHED posts only (ISR, 60s) |
| `/insights/[slug]` | Not yet built | Individual article page |
| `/case-study` | Placeholder | Awaiting real client data |
| `/contact` | Done | Intake form + call explainer sidebar |

### Homepage Section Map

1. **Hero** — Two-column. Left: headline + copy + CTAs. Right: `LiveSignalFeed` — dark Bloomberg-style terminal pulling live data from Supabase, HOT/WARM tags, scrollable, 6 rows.
2. **Problem** — Dark (`gray-950`). Three columns: The Creative Play / The Inbound Play / The Platform Play.
3. **How We Do It** — White. Three pillar cards with SVG icons: The Signal / The Resolution / The Infrastructure.
4. **Multiplier Deep Dive** — Gray-50. Left: "Who do I call this week" copy. Right: white dashboard card showing ranked decision-maker list with scores.
5. **The Offer** — Dark (`gray-950`). Left: Sprint copy + CTA. Right: four feature cards.
6. **Final CTA** — Black. "Stop competing. Start winning first."
