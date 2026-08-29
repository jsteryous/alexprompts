# Rebrew

The website and publishing engine for **Rebrew**, a publication on **South Carolina real
estate and business**, built on primary documents. Plenty of outlets report that a company
added three hundred jobs or that a subdivision got approved. Rebrew writes the layer
underneath: whether a business is durable, what years of sales have really done to a
submarket, and which rule or tax structure is driving behavior that otherwise looks random.

- **Site:** Next.js 16 home base. The front page, `/reporting` (every published piece),
  `/about` (the masthead), and `/buying-or-selling`.
- **Publishing engine:** `scripts/publication/` — a Claude routine that researches a piece
  against public records, drafts it, checks its own facts, and inserts a DRAFT that Alex
  reviews and publishes at `/admin`. Cadence is about every two weeks, published on finding.

See `CLAUDE.md` for full context, voice, and architecture, and
`scripts/publication/SPEC.md` for the editorial spec, which outranks it.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (rm -rf .next first if you renamed routes)
npm run lint     # eslint + the canonical and editor round-trip checks
```

Brand details (name, tagline, social handles, domain) live in `src/lib/site.ts`. Edit there
and every surface updates: nav, footer, JSON-LD, sitemap, robots, page titles, OG cards.

`npm run lint` runs two gates beyond eslint. `scripts/checks/canonicals.mjs` fails the build
if a page route ships without its own canonical. `scripts/checks/editor-roundtrip.mjs` fails
if the WYSIWYG editor's markdown round trip stops being lossless, checked against every row
in the database.

## Content engines

Claude routines, no local CLI to run. `scripts/CLAUDE.md` has the full pipeline.

- **`scripts/publication/`** — the live engine. One publication, one beat.
- **`scripts/tech/`** — Greenville Works, which the publication engine evolved out of. New
  pieces still carry its `greenville works` tag and land at `/greenville-works`, deliberately,
  because renaming the route would break every published URL.
- **`scripts/greenville/`** and **`scripts/briefing/`** — stopped producing in the August 2026
  consolidation. Their published work and routes stay live under "Archives" in the footer.
  `scripts/greenville/commercial.py` still runs on a schedule as research input.

## Deploy

Vercel, auto-deploy on push to `main`. Production: **rebrew.org** (canonical host is
`www.rebrew.org`). The previous domain, alexprompts.com, is kept and 301s to rebrew.org so
every already-published article URL keeps working; do not let it lapse without redirecting
those paths somewhere.
