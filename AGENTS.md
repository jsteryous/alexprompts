<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes -- APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project: Alex Prompts

A personal media brand by Alex Steryous: **Claude for real-estate agents and investors**.
The site + newsletter teach real-estate pros how to point Claude at their actual work
(listings, market research, deal analysis, lead follow-up); two content engines add
AI-for-real-estate news (national + local Greenville). Claude-only. Publishes on Substack,
YouTube, TikTok, and X. See `CLAUDE.md` (root), `src/CLAUDE.md`, and `scripts/CLAUDE.md`
for full context.

> This repo previously housed "REBB Advisors," a dental-website cleanup business. That
> project was fully removed from the website in June 2026. Its Python tooling lives,
> retired, under `scripts/_archive/`. Do not reintroduce dental/REBB concepts, the
> Company Brain offer, the lead-enrichment pipeline, or the prospects dashboard.

## What's live

- **Website** (`src/`) — Next.js 16 home base: `/`, `/about`, `/archive`, `/guides`,
  `/real-estate` (each with `[slug]`), and the token-gated `/review` publish flow. Edit
  brand details in `src/lib/site.ts`.
- **Content engines** (`scripts/`) — two Python signal collectors feeding Claude routines
  (Gemini was removed): `ai_news/` (national AI-for-real-estate, a weekly Saturday script +
  article) and `greenville/` (local Greenville real-estate, a daily both-sides post). See
  `scripts/CLAUDE.md`. **Do not touch the Python scripts as part of website work** unless
  explicitly asked.

## Working agreements

- Match the house voice in all copy: no em dashes, no fragments, plain English, grounded
  optimism. The canonical voice is `scripts/ai_news/routine/pass3_writer.md`.
- Keep `src/lib/site.ts` the single source of truth for brand/links. It holds
  `TODO(alex)` placeholders (domain + social handles) to confirm before launch.
- After deleting/renaming routes, `rm -rf .next` before `npm run build` (stale typed
  routes otherwise fail the type check).
