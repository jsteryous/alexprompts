# Frontend Context — `src/`

See root `CLAUDE.md` for brand, voice, and env vars.

## Tech Stack

- **Framework:** Next.js 16.2.2 (App Router, Turbopack)
- **Styling:** Tailwind CSS v4 (`@theme {}` in `globals.css`, not `tailwind.config.js`) + `@tailwindcss/typography`
- **Language:** TypeScript / React 19
- **Database:** Supabase (Postgres) — `blog_posts` only (see root CLAUDE.md)
- **Markdown:** `marked` + `sanitize-html`, factored into `src/lib/renderMarkdown.ts`
  (`renderPostHtml`). Shared by `ArticleView` and the `/admin` live-preview route
  (`/api/admin/preview`), so an editor preview is byte-identical to the published article.
- **Auth:** none public. `/admin` is the draft review hub: password login (= `PUBLISH_SECRET`)
  sets an httpOnly `ap_admin` cookie (`src/lib/adminAuth.ts`). `/review` is the legacy
  token-in-query editor (the engine's email links). Neither uses Supabase Auth.

## Project Structure — key couplings

- **`src/lib/site.ts`** — brand single-source-of-truth: `site` (name, author, tagline,
  oneLiner, description, email, url), `socials` (the follow row + footer + JSON-LD
  `sameAs`), and `newsletterUrl`. `SITE_URL` reads `NEXT_PUBLIC_SITE_URL`. **Editing
  handles/domain here updates every surface.** The Claude-for-real-estate teaching exports
  (`tools`, `principles`, `realEstateOutcomes`, `outcomes`, `manifesto`) were deleted in July
  2026 with the voice-3 removal; do not reintroduce them. Holds one `TODO(alex)`: confirm the
  contact email.
- **`src/lib/posts.ts`** — archive data access. `getPublishedPosts(limit?, type?)`,
  `getPost(slug, type?)`, `formatDate()`, `sectionOf()`. One `blog_posts` table, **four
  sections split by tag**: `greenville` → `/real-estate` (set by the `scripts/greenville`
  routine), `greenville works` → `/greenville-works` (set by the `scripts/tech` engine;
  internal `PostType` key is `works`), `briefing` → `/briefing` (the weekly Upstate Brief,
  set by the `scripts/briefing` engine), everything else → `/archive` (newsletter).
  `sectionOf()` is the single source of that mapping; the `greenville works` tag is
  deliberately distinct from the `greenville` real-estate tag so the two never collide.
  `getPublishedPosts("newsletter")` excludes real-estate and Greenville Works posts so they
  never leak onto the archive. `getFeedPosts` (homepage) is simply all published posts, so
  newsletter, real-estate, and Greenville Works posts all lead there. Returns `[]`/`null`
  when Supabase env is unset so the site builds (not a crash). Used by `/`, `/archive`,
  `/real-estate`, `/greenville-works`, their `[slug]` routes, `sitemap.ts`. (The old `guide`
  → `/guides` section was removed July 2026; the `tech` → `/lab` "Lab" section was renamed to
  Greenville Works July 2026.)
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
- **`src/app/page.tsx`** — homepage (`revalidate = 300`). Self-contained sections: **fresh
  reads lead** (featured latest issue + more-to-read grid from `getFeedPosts`, with the `>`
  prompt watermark) → the mission (rewritten by Alex July 11, 2026: headline "Questions worth
  asking." matching the slogan + the one-sentence mission "…helps South Carolinians understand
  the ideas, technologies, and decisions shaping our future…" + two one-liners; the pro-growth
  manifesto that briefly lived here was removed the same day, replaced the
  behind-the-site stack blurb; keeps the Meet Alex → `/about` link, and `/about` keeps the
  full technical teardown) → tools spotlight (`liveTools()`, framed as engineering) →
  `#follow` (social cards) → subscribe CTA. The old "Start here" hero/pillars, "helps anyone" (`outcomes` + `OutcomeArt`), "how
  every guide works" (`principles`), manifesto, and the "what you'll do with Claude"
  (`realEstateOutcomes`) grid (removed July 2026 with the voice-3 removal) are all gone. Those
  `site.ts` exports were deleted; the `OutcomeArt` component is now orphaned but kept. No
  shared section components (the old `HomeSections.tsx` was dental-only, deleted).
- **`src/app/archive/`**, **`src/app/real-estate/`**, **`src/app/greenville-works/`**,
  **`src/app/briefing/`** — the four section index + `[slug]` routes (`/briefing` is the weekly
  Upstate Brief, added July 9, 2026; its index also carries an owned-list `SubscribeForm`
  since the brief never goes to Substack). All four `[slug]`
  pages render the shared `components/ArticleView.tsx` (markdown → sanitize → `Article` +
  `BreadcrumbList` JSON-LD), differing only in the `section` prop and the post `type` they
  request. The `section` prop carries an opt-in `showReferralCta` flag; the `/real-estate`
  route sets it so every real-estate article renders the `ReferralCta` block (links to
  `/find-a-pro#connect`) after the body and BEFORE the newsletter box, since on a
  referral-first site the buy/sell offer outranks audience growth. `/archive` and
  `/greenville-works` leave it off. Canonical is self-referential per section. `/real-estate` holds the Greenville
  posts the `scripts/greenville` routine creates; `/greenville-works` holds the local-change
  deep-dives the `scripts/tech` routine creates. Both engines **auto-publish live** (status
  `PUBLISHED`, with a verify email for after-the-fact spot-check + unpublish at `/review`; a run
  falls back to DRAFT only when dedup is unavailable), and the `/api/finalize-greenville` cron
  fills each post's cover from the curated Greenville library and broadcasts it to the owned list.
  Both `/real-estate` and `/greenville-works` index pages render a `PostCover` thumbnail per row
  (branded `>` placeholder until the cover lands); the curated photo also shows as the article
  hero (`ArticleView` renders `cover_image` when the body has no lead image), the homepage feed
  card, and the share/OG card.
- **`Nav.tsx` + `Footer.tsx`** — return `null` on `/review` and `/admin` (gated editors; the
  fixed nav covered their sticky Publish button). Both derive links from `site.ts`. Nav CTA is
  *Subscribe* → **`/subscribe`** (July 10, 2026: the owned-list capture page,
  `src/app/subscribe/page.tsx`, one `SubscribeForm`; it REPLACED the old `newsletterUrl`
  Substack target because the site's promise, the Monday Brief, only ships on the owned list.
  Substack remains the form's secondary "prefer Substack?" link. One list gets ALL broadcasts;
  there is no per-category segmentation by design). (The small `PalmettoMark` SC palmetto +
  crescent SVG that decorated the footer slogan and the homepage mission eyebrow was REMOVED
  July 12, 2026 at Alex's call; both are plain text now. Do not add a decorative mark back.)
- **`/admin` + `/review` + `/api/publish` + `/api/review/save`** — the publish flow. `/admin`
  (cookie login via `/api/admin/login`, `src/lib/adminAuth.ts`) lists drafts and is the primary
  review surface; `/admin/edit/[id]` and `/review` both render the shared `review/Editor`. Edit a
  draft, Save (PATCH `blog_posts`), Publish (flip `status` to `PUBLISHED`, set `published_at`,
  revalidate the section). Auth is `PUBLISH_SECRET`: the `ap_admin` cookie (constant-time,
  rate-limited login) or the legacy query/body token. `GET /api/publish` is token-only (not
  CSRF-able); `POST /api/publish` takes the cookie (same-origin checked). The editor has a
  live site-accurate preview (`/api/admin/preview`), a markdown format toolbar, and image
  paste/drag/upload (`/api/admin/upload` → the public `post-images` Storage bucket, under
  `body/`, inserted as markdown at the cursor).
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
  `alexprompts-theme` localStorage key (must match `ThemeProvider.tsx`). Also renders
  **`<Analytics />`** (`@vercel/analytics/next`) for **Vercel Web Analytics** (traffic, the
  page-view side of "is the SEO bet working"; lead attribution is the separate first-party
  path in `referral_leads`). It is **cookieless, stores no PII, and needs no consent banner**,
  so it fits the site's privacy ethos. Serves first-party from `/_vercel/insights`, is a no-op
  locally, and **requires Web Analytics to be enabled for the project in the Vercel dashboard**
  (Hobby free tier; no billing).

## Design System

- **Palette = CSS custom properties** in `globals.css` (`:root` light, `html.dark` dark).
  Do NOT hardcode hex — use the `.theme-*` utilities (`theme-text-primary/secondary/muted`,
  `theme-border`, `theme-card`, `theme-card-strong`, `theme-card-muted`, `theme-label`,
  `theme-cta`, `theme-cta-accent`, `theme-badge`, `theme-section-contrast`,
  `theme-section-muted`, `theme-page`).
- **Tokens:** Apple-style **cool-neutral** base (light bg `#f5f5f7`, surface `#ffffff`,
  text `#1d1d1f`, muted `#6e6e73`; dark bg near-black neutral `#101012`, surface `#1c1c1e`,
  text `#f5f5f7`) with a **refined indigo accent** (`#4f46e5` light / `#818cf8` dark). The
  neutrals are true-cool on purpose so nothing clashes with the accent or the `tone-*`
  chips — do NOT reintroduce a warm/cream base (the old dental cream+green is gone) or mix
  warm greys in. All neutrals live in `globals.css` tokens; retune there, never per-page.
- **Type scale = single source of truth.** `@theme` defines `--text-display/h1/h2/h3/title/
  body-lg/body/small/eyebrow` (fluid `clamp()`), consumed via the `.type-*` utility classes
  (size + line-height + weight + tracking together; color still comes from `theme-text-*`).
  Prefer `.type-h2` etc. over ad-hoc `text-3xl md:text-4xl font-bold tracking-tight`. Homepage,
  `/about`, and the `/tools` pages + `ToolShell` are converted; other pages migrate over time.
- **Dark mode:** class-based (`html.dark`). `ThemeProvider` → `localStorage` key
  `alexprompts-theme`. `suppressHydrationWarning` on `<html>` + the inline `layout.tsx`
  script prevent the flash.
- Typography: Geist Sans via the `geist` npm package (self-hosted — Turbopack's http2
  error breaks `next/font/google` at build, including in `opengraph-image.tsx`, so use
  system fonts there).
- Sections `py-20 md:py-28`, max-width `max-w-5xl`/`max-w-6xl`, articles `max-w-2xl`.
- Article body: `prose theme-prose max-w-none` + `dangerouslySetInnerHTML` (first-party
  author content from the gated publish flow).
- Direction: **Apple-quiet** — generous whitespace, strong type scale, minimal decoration.
  The one signature flourish is the terminal-caret motif (`.caret`, faint `.prompt-watermark`).
  Keep gradients/blur/textures restrained; do not add back the dotted-grid page texture.
- **Cover library images are the homepage LCP** (`public/greenville/library/`). They MUST stay
  web-sized: max 1400px wide, roughly 300KB, JPEG q≈75 (batch-resized July 10, 2026 from the
  original 0.5–1.3MB Wikimedia files; originals were only in scratch, the repo keeps the sized
  ones). Any new photo the monthly `cover_ingest` PR proposes must be downsized to this spec
  BEFORE merging. `next.config.ts` `headers()` gives `/greenville/library/*` a 30-day
  Cache-Control (Vercel's `/public` default is max-age=0). **July 11, 2026, the mobile-LCP
  pass:** `PostCover` now routes same-origin covers (the library) AND Supabase-hosted covers
  (old streetview PNGs) through **`next/image`** (responsive srcset, AVIF/WebP, ~50–75KB at
  phone widths instead of the full file), keeping a plain `<img>` only for other remote hosts
  (Substack CDN, whose hosts vary and would 400 an un-whitelisted `next/image`). Callers pass
  `sizes` matching their layout plus `priority` on whatever is above the fold (the homepage
  featured card and the `ArticleView` hero set it; the hero is also cropped to the same 2/1
  box as the featured card now, which reserves layout space and killed the article-load CLS).
  Body images in `renderPostHtml` get the same treatment (admin-editor uploads to Supabase ran
  multi-MB): Supabase-hosted `<img>`s are rewritten to `/_next/image` srcsets, first image
  eager + `fetchpriority=high` (it is the LCP on image-led articles), the rest lazy.
  `next.config.ts` `images.remotePatterns` whitelists only the Supabase host (derived from
  `NEXT_PUBLIC_SUPABASE_URL`); `minimumCacheTTL` is 30 days so transformation counts stay far
  inside the Vercel Hobby free quota (zero-billing).

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
