# Frontend Context — `src/`

See root `CLAUDE.md` for brand, voice, and env vars.

## Tech Stack

- **Framework:** Next.js 16.2.2 (App Router, Turbopack)
- **Styling:** Tailwind CSS v4 (`@theme {}` in `globals.css`, not `tailwind.config.js`) + `@tailwindcss/typography`
- **Language:** TypeScript / React 19
- **Database:** Supabase (Postgres) — `blog_posts` only (see root CLAUDE.md)
- **Markdown:** `marked` (server-side, `/archive/[slug]`, `/review`)
- **Auth:** none public. `/review` is gated by `PUBLISH_SECRET` (token in query), not Supabase Auth.

## Project Structure — key couplings

- **`src/lib/site.ts`** — brand single-source-of-truth: `site` (name, author, tagline,
  oneLiner, description, email, url), `socials` (the follow row + footer + JSON-LD
  `sameAs`), `newsletterUrl`, and the Claude-for-real-estate teaching content
  (`tools`, `principles`, `realEstateOutcomes`, `outcomes`, `manifesto`). `SITE_URL` reads
  `NEXT_PUBLIC_SITE_URL`. **Editing handles/domain here updates every surface.** Holds
  `TODO(alex)` placeholders — confirm before launch.
- **`src/lib/posts.ts`** — archive data access. `getPublishedPosts(limit?, type?)`,
  `getPost(slug, type?)`, `formatDate()`, `sectionOf()`. One `blog_posts` table, **three
  sections split by tag**: `guide` → `/guides`, `greenville` → `/real-estate` (set by the
  `scripts/greenville` routine), everything else → `/archive` (newsletter). `sectionOf()`
  is the single source of that mapping; `getPublishedPosts("newsletter")` excludes guide
  and real-estate posts so they never leak onto the homepage/archive. Returns `[]`/`null`
  when Supabase env is unset so the site builds (not a crash). Used by `/`, `/archive`,
  `/guides`, `/real-estate`, their `[slug]` routes, `sitemap.ts`.
- **`src/lib/tools.ts`** — single source for the free `/tools` (`toolCatalog`,
  `liveTools()`, `getTool()`, `audienceLabel`). Drives the `/tools` hub, the homepage
  tools spotlight + Start-here pillars, nav, footer, and `sitemap.ts`. Each entry has a
  `status` (`live`/`soon`); a `live` tool needs a route at `src/app/tools/<slug>/page.tsx`
  (server page: sets metadata, renders `<ToolShell tool={getTool(slug)!}>` around the
  interactive client component in `src/components/tools/`). Current tools: `deal-analyzer`,
  `mortgage`, `listing-prompt` (live, client-side, no API); `buyers-list` (live; the page
  imports the committed `src/data/commercialSales.json` dataset that
  `scripts/greenville/commercial.py` builds from Greenville County's public ArcGIS service,
  so it is statically generated with no runtime API); `area-scan` (soon, Tier 2
  Google Places, needs server proxy + cache + rate-limit). `components/ToolShell.tsx` is
  the shared chrome (header, not-advice note, subscribe capture). Add `.theme-field` to
  form inputs (defined in `globals.css`).
- **`src/lib/substack.ts`** — Substack RSS -> markdown converter (`parseSubstackFeed`,
  `fetchSubstackPosts`). `content:encoded` HTML -> markdown via turndown; images kept as
  raw `<figure>`/`<figcaption>` so they render through the same `marked` + `theme-prose`
  pipeline. Pure parse split from the fetch. Called only by `/api/sync-substack` (daily
  Vercel cron in `vercel.json`), which upserts posts into `blog_posts` as `PUBLISHED`.
  Image styles live in `globals.css` (`.theme-prose img/figure/figcaption`).
- **`src/app/page.tsx`** — homepage (`revalidate = 300`). Self-contained sections: hero
  (Claude for real-estate agents and investors) → real-estate outcomes grid → "helps
  anyone" outcomes → how every guide works (`principles`) → manifesto → latest issues →
  `#follow` (social cards) → subscribe CTA. No shared section components (the old
  `HomeSections.tsx` was dental-only, deleted).
- **`src/app/archive/`**, **`src/app/guides/`**, **`src/app/real-estate/`** — the three
  section index + `[slug]` routes. All three `[slug]` pages render the shared
  `components/ArticleView.tsx` (markdown → sanitize → `Article` + `BreadcrumbList`
  JSON-LD), differing only in the `section` prop and the post `type` they request.
  Canonical is self-referential per section. `/real-estate` holds the Greenville posts
  the `scripts/greenville` routine creates (as DRAFT) and you publish via `/review`.
- **`Nav.tsx` + `Footer.tsx`** — return `null` on `/review` (token-gated editor; the fixed
  nav covered its sticky Publish button). Both derive links from `site.ts`. Nav CTA is
  *Subscribe* → `newsletterUrl`.
- **`/review` + `/api/publish` + `/api/review/save`** — the publish flow. Edit a draft,
  Save (PATCH `blog_posts`), Publish (flip `status` to `PUBLISHED`, set `published_at`,
  `revalidatePath("/archive")`). All gated by `PUBLISH_SECRET`.
- **`app/opengraph-image.tsx`** — edge Satori OG image, the branded fallback card.
  It is auto-injected on the root/static pages but is **NOT inherited by the
  `[slug]` article routes**, so those must set `openGraph.images`/`twitter.images`
  themselves or they ship with no share thumbnail (link previews over iMessage/SMS/
  X show nothing). All three `[slug]` routes call `articleOgImage(post)` (in
  `posts.ts`) which prefers the post's own lead image and falls back to
  `/opengraph-image`. Do NOT set `openGraph.images` on the root/static pages — there
  it conflicts with the auto-injected file.
- **`app/layout.tsx`** — root metadata + `WebSite`/`Person` JSON-LD from `site.ts`. The
  inline `<head>` script sets the `dark` class pre-hydration from the
  `alexprompts-theme` localStorage key (must match `ThemeProvider.tsx`).

## Design System

- **Palette = CSS custom properties** in `globals.css` (`:root` light, `html.dark` dark).
  Do NOT hardcode hex — use the `.theme-*` utilities (`theme-text-primary/secondary/muted`,
  `theme-border`, `theme-card`, `theme-card-strong`, `theme-card-muted`, `theme-label`,
  `theme-cta`, `theme-cta-accent`, `theme-badge`, `theme-section-contrast`,
  `theme-section-muted`, `theme-page`).
- **Tokens:** cool-neutral base (light bg `#fafafb`, dark bg `#0a0c10`) with an
  **electric indigo accent** (`#4f46e5` light / `#818cf8` dark). This replaced the old
  dental cream+green palette — do not regress to green/cream.
- **Dark mode:** class-based (`html.dark`). `ThemeProvider` → `localStorage` key
  `alexprompts-theme`. `suppressHydrationWarning` on `<html>` + the inline `layout.tsx`
  script prevent the flash.
- Typography: Geist Sans via the `geist` npm package (self-hosted — Turbopack's http2
  error breaks `next/font/google` at build, including in `opengraph-image.tsx`, so use
  system fonts there).
- Sections `py-20 md:py-28`, max-width `max-w-5xl`/`max-w-6xl`, articles `max-w-2xl`.
- Article body: `prose theme-prose max-w-none` + `dangerouslySetInnerHTML` (first-party
  author content from the gated publish flow).
- Direction: Stripe / Linear aesthetic — whitespace, strong type scale, minimal decoration.

## SEO

- Each page sets `title` (template `%s · Alex Prompts`), `description`, `openGraph`,
  `alternates.canonical`. `metadataBase` + canonicals come from `SITE_URL`.
- JSON-LD: `WebSite` + `Person` in `layout.tsx`; `Article` + `BreadcrumbList` per issue.
- `sitemap.ts` + `robots.ts` derive from `SITE_URL`. Sitemap lists `/`, `/archive`,
  `/about`, and every published issue.
- SEO is a passive bonus, not the growth bet (see root CLAUDE.md).

## Next.js / Framework Gotchas

- Next.js 16 uses `proxy.ts` (not `middleware.ts`) for middleware. There is currently
  **no** proxy file — the old one only guarded the deleted `/dashboard`. Do not add one
  back unless a new gated route needs it.
- Typed routes: after deleting/renaming a route, a stale `.next/dev/types` can fail the
  type check referencing the old path. `rm -rf .next` and rebuild.
- Supabase reads use `createClient` from `@supabase/supabase-js` (anon key, RLS).
