# Alex Prompts

The website + content engine for **Alex Prompts**, a personal media brand covering the
companies building the future (frontier AI labs + hard tech). Frontier tech, translated.

- **Site:** Next.js 16 home base — homepage, `/about`, and the `/archive` of newsletter
  issues. Built to grow an audience and convert viewers into email subscribers.
- **Content engine:** `scripts/ai_news/` — a Python pipeline that sources the week's
  frontier-tech news, drafts the newsletter + short-form scripts with Gemini, and emails
  them to Alex for edit/publish.

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
