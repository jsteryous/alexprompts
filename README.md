# Alex Prompts

The website + content engine for **Alex Prompts**, an AI education brand that shows
curious, non-technical people how to actually use AI. Do more with AI than you think you can.

- **Site:** Next.js 16 home base — homepage, `/about`, and the `/archive` of guides.
  Built to grow an audience and convert viewers into email subscribers.
- **Content engine:** `scripts/ai_news/` — a Python signal collector feeding a weekly
  Claude routine that drafts the newsletter. Gemini was removed; Claude routines only.

See `CLAUDE.md` for full context, voice, and architecture.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (rm -rf .next first if you renamed routes)
npm run lint
```

Brand details (name, tagline, social handles, domain, covered companies) live in
`src/lib/site.ts` — edit there and every surface updates. Confirm the `TODO(alex)`
placeholders before launch.

## Content engine

```bash
cd scripts
python -m ai_news.digest           # collect -> reporter -> writer -> shorts, print
python -m ai_news.digest --email   # email the weekly draft + short-form queue
```

See `scripts/CLAUDE.md` for the full pipeline.

## Deploy

Vercel (auto-deploy on push to `main`). Production: alexprompts.com.
