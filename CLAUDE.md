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

## Project Structure

```
src/
├── app/
│   ├── globals.css          — design tokens and base styles
│   ├── layout.tsx           — root layout wrapping Nav + Footer
│   ├── page.tsx             — homepage
│   ├── how-it-works/page.tsx
│   ├── case-study/page.tsx
│   └── contact/page.tsx
└── components/
    ├── Nav.tsx              — sticky header with mobile menu (client component)
    └── Footer.tsx
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
- All pages are statically rendered (no `use client` except Nav)
- CTAs always link to `/contact`
- Section labels use `text-xs font-semibold uppercase tracking-widest text-green-600`
- Dark CTA sections use `bg-gray-950` or `bg-black` with `green-500` buttons

## Known Issues / Notes

- `next.config.ts` sets `turbopack.root: __dirname` to suppress a lockfile warning caused by a `package-lock.json` existing one level up at `C:\Users\alexs\package-lock.json`
- Google Fonts cannot be used at build time in this environment (Turbopack http2 error) — use system fonts or self-hosted fonts

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
| `/` | Done | Hero (two-column with live signal feed visual), Problem (3 legacy agency plays), How We Do It (3 pillars), Multiplier deep dive (ranked dashboard mock), Sprint offer, CTA |
| `/how-it-works` | Done | 5-step sprint process: Kick-off → Site Build → Multiplier → Lead Engine → The Lead. Guarantee callout section. |
| `/case-study` | Placeholder | Awaiting real client data |
| `/contact` | Done | Intake form + call explainer sidebar |

### Homepage Section Map

1. **Hero** — Two-column. Left: headline + "Most agencies wait..." copy + CTAs. Right: dark terminal panel showing live Multiplier signal feed with HOT/WARM tags.
2. **Problem** — Dark (`gray-950`). Three columns: The Creative Play / The Inbound Play / The Platform Play.
3. **How We Do It** — White. Three pillar cards with SVG icons: The Signal / The Resolution / The Infrastructure.
4. **Multiplier Deep Dive** — Gray-50. Left: "Who do I call this week" copy. Right: white dashboard card showing ranked decision-maker list with scores.
5. **The Offer** — Dark (`gray-950`). Left: Sprint copy + CTA. Right: four feature cards.
6. **Final CTA** — Black. "Stop competing. Start winning first."
