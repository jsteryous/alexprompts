# REBB Advisors Website

## Business Context

**Business:** REBB Advisors  
**Positioning:** We install automated lead capture and follow-up systems for local service businesses so they never miss a lead again.  
**Target customers:** Landscaping, pool services, pressure washing, and other local service businesses.  
**Tone:** Confident, minimal, high-end. No fluff. No generic marketing language.

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

## Commands

```bash
npm run dev     # local dev server
npm run build   # production build
npm run lint    # eslint
```

## Pages

| Route | Status | Notes |
|---|---|---|
| `/` | Done | 6 sections: Hero, Problem, Solution, How It Works, Offer, CTA |
| `/how-it-works` | Done | 5-step process with detail columns |
| `/case-study` | Placeholder | Awaiting real client data |
| `/contact` | Done | Intake form + call explainer sidebar |
