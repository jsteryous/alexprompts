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
│   ├── page.tsx                    — homepage
│   ├── how-it-works/page.tsx
│   ├── case-study/page.tsx
│   ├── contact/page.tsx
│   ├── insights/
│   │   ├── page.tsx                — listing page (PUBLISHED only, ISR 60s)
│   │   └── [slug]/page.tsx         — individual article page (ISR 60s)
│   ├── review/page.tsx             — protected draft review page (token-gated)
│   └── api/
│       └── publish/route.ts        — GET ?id=&token= → flips status, revalidates /insights
├── components/
│   ├── Nav.tsx                     — sticky header with mobile menu (client component)
│   ├── Footer.tsx
│   └── LiveSignalFeed.tsx          — real-time Multiplier terminal (client component)
└── lib/
    └── supabase.ts                 — Supabase client singleton (null if env vars not set)

scripts/
├── generate_insights.py            — Gemini → DRAFT → email notification
├── approve_post.py                 — CLI to list/view/edit/publish drafts
├── weekly_insights.py              — topic rotation runner (called by Task Scheduler)
├── run_weekly.bat                  — Windows Task Scheduler launcher
├── gvl_monitor.py                  — Python scraper + Supabase push (market_signals)
├── requirements.txt                — full Python deps (includes playwright — needs C compiler)
└── requirements-insights.txt       — lightweight deps for insights scripts only (no playwright)

supabase/
└── schema.sql                      — market_signals + blog_posts tables, RLS, indexes
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
- All pages are server components (no `use client` except Nav and LiveSignalFeed)
- CTAs always link to `/contact`
- Section labels use `text-xs font-semibold uppercase tracking-widest text-green-600`
- Dark CTA sections use `bg-gray-950` or `bg-black` with `green-500` buttons
- Article body rendered with `prose prose-gray max-w-none` + `dangerouslySetInnerHTML`

## Supabase

- **Project:** connected via `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Tables:** `market_signals` (live feed) + `blog_posts` (insights articles)
- **Realtime:** enabled on `market_signals` via `supabase_realtime` publication
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

# Weekly runner (also called automatically by Task Scheduler every Monday 7am)
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

### Topic rotation

`weekly_insights.py` cycles through 12 Greenville-specific topics in `TOPICS[]`. Position tracked in `scripts/last_topic_index.txt`. Edit the list freely — add, remove, reorder anytime.

### Windows Task Scheduler (Monday 7am)

Register once in PowerShell (Admin):
```powershell
Register-ScheduledTask `
  -TaskName "REBB Weekly Insights" `
  -Action (New-ScheduledTaskAction -Execute "C:\Users\alexs\rebbadvisors-website\scripts\run_weekly.bat") `
  -Trigger (New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At "7:00AM") `
  -RunLevel Highest -Force
```
Log file: `scripts/weekly_insights.log`

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
pip install -r requirements.txt   # requires C compiler for playwright/greenlet

python gvl_monitor.py --demo --count 15      # seed mock data
python gvl_monitor.py --demo --dry-run       # preview without writing
python gvl_monitor.py --scrape deeds         # scrape GVL Register of Deeds (stub)
python gvl_monitor.py --scrape sos           # scrape SC SOS filings (stub)
python gvl_monitor.py --scrape all
```

- Reads `.env.local` from project root automatically
- Uses `SUPABASE_URL` + `SUPABASE_SERVICE_KEY`
- Fuzzy entity deduplication via `thefuzz`
- Scraper stubs in `scrape_greenville_deeds()` / `scrape_sc_sos_filings()` — fill in selectors after inspecting live pages

## Known Issues / Notes

- `next.config.ts` sets `turbopack.root: __dirname` to suppress a lockfile warning from `package-lock.json` one level up at `C:\Users\alexs\package-lock.json`
- Google Fonts cannot be used at build time (Turbopack http2 error) — use system fonts or self-hosted
- `python-levenshtein` removed from requirements (requires C compiler on Windows) — `thefuzz` works without it
- `playwright` in `requirements.txt` requires a C compiler; use `requirements-insights.txt` for insights scripts only
- `google-genai` requires `httpx>=0.28.1`; `supabase>=2.15.0` is compatible — do not downgrade supabase to 2.9.0

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
| `/` | Done | Hero + live signal feed, Problem, How We Do It, Multiplier deep dive, Sprint offer, CTA |
| `/how-it-works` | Done | 5-step sprint process, guarantee callout |
| `/insights` | Done | PUBLISHED posts listing, ISR 60s, revalidated instantly on publish |
| `/insights/[slug]` | Done | Full article page, ISR 60s, prose rendering via marked |
| `/review` | Done | Token-gated draft review page — linked from email only |
| `/case-study` | Placeholder | Awaiting real client data |
| `/contact` | Done | Intake form + call explainer sidebar |

### Homepage Section Map

1. **Hero** — Two-column. Left: headline + copy + CTAs. Right: `LiveSignalFeed` — dark Bloomberg-style terminal pulling live data from Supabase, HOT/WARM tags, scrollable, 6 rows.
2. **Problem** — Dark (`gray-950`). Three columns: The Creative Play / The Inbound Play / The Platform Play.
3. **How We Do It** — White. Three pillar cards with SVG icons: The Signal / The Resolution / The Infrastructure.
4. **Multiplier Deep Dive** — Gray-50. Left: "Who do I call this week" copy. Right: white dashboard card showing ranked decision-maker list with scores.
5. **The Offer** — Dark (`gray-950`). Left: Sprint copy + CTA. Right: four feature cards.
6. **Final CTA** — Black. "Stop competing. Start winning first."
