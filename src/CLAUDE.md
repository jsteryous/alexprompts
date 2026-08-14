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
- ~~**`src/lib/tools.ts`**~~ — **DELETED August 14, 2026 along with all nine tools.** Gone with
  it: `src/app/tools/`, `src/components/tools/`, `ToolShell.tsx`, `ToolIcon.tsx`,
  `src/lib/areaScan.ts`, `src/lib/wireSafety.ts`, `/api/area-scan`, and
  `/api/area-autocomplete`. `/tools/*` 404s. They served the consumer buyer, which is the
  audience the consolidation dropped (see the banner in the root `CLAUDE.md`). **Still live and
  easy to mistake for orphans:** `src/lib/rateLimit.ts` (used by `/api/subscribe`,
  `/api/refer`, and the admin login) and `src/data/commercialSales.json` (nothing in `src/`
  imports it now; `scripts/greenville/commercial.py` still refreshes it on schedule as research
  input for company pieces). Deleting a route also leaves a stale `.next/dev/types` that fails
  the type check on the old path, so `rm -rf .next` before rebuilding. The paragraph below is
  HISTORY: single source for the free `/tools` (`toolCatalog`,
  `liveTools()`, `getTool()`, `audienceLabel`). Drives the `/tools` hub, the homepage
  tools spotlight + Start-here pillars, nav, footer, and `sitemap.ts`. Each entry has a
  `status` (`live`/`soon`); a `live` tool needs a route at `src/app/tools/<slug>/page.tsx`
  (server page: sets metadata, renders `<ToolShell tool={getTool(slug)!}>` around the
  interactive client component in `src/components/tools/`). Current tools: `deal-analyzer`,
  `mortgage` (live, client-side, no API; the `listing-prompt` builder was removed July 21,
  2026 as an off-strategy agent tool); `buyers-list` (live; the page
  imports the committed `src/data/commercialSales.json` dataset that
  `scripts/greenville/commercial.py` builds from Greenville County's public ArcGIS service,
  so it is statically generated with no runtime API); `property-tax`, `schools`,
  `cost-of-living`, and `wire-safety` (all live, zero-cost); `taraform` (live, an external
  link to taraform.org, no local route); and `area-scan` (**live** since July 2026, was
  `soon`; the ONE tool that calls a paid Google API, capped by console-side daily quotas Alex
  confirmed July 27, 2026, and it fails safe to a "not configured" panel when
  `GOOGLE_PLACES_API_KEY` is unset). `src/lib/tools.ts` is the only authority on tool status;
  check it before describing the tools in copy or docs. `components/ToolShell.tsx` is
  the shared chrome (header, not-advice note, subscribe capture). Add `.theme-field` to
  form inputs (defined in `globals.css`).
- **`src/lib/substack.ts`** — Substack RSS -> markdown converter (`parseSubstackFeed`,
  `fetchSubstackPosts`). `content:encoded` HTML -> markdown via turndown; images kept as
  raw `<figure>`/`<figcaption>` so they render through the same `marked` + `theme-prose`
  pipeline. Pure parse split from the fetch. Called only by `/api/sync-substack` (daily
  Vercel cron in `vercel.json`), which upserts posts into `blog_posts` as `PUBLISHED`.
  Image styles live in `globals.css` (`.theme-prose img/figure/figcaption`).
- **`src/app/page.tsx`** — homepage (`revalidate = 300`). **RESTRUCTURED August 2026 to TWO
  sections**, because the page now does exactly one job, which is to convince a qualified
  stranger to hand over an email address: **standfirst + the ask** (masthead statement,
  headline, two paragraphs on the company beat, and an inline `SubscribeForm`, all above the
  fold) → **the work** (featured latest + "More to read" from `getFeedPosts`). The tools row,
  the mission panel, and the social-card grid are all gone. The standfirst copy tracks the beat
  in `scripts/publication/SPEC.md` and must stay in sync with `site.ts` and the `SubscribeForm`
  default promise. The paragraph below is HISTORY: **fresh
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
- **`src/app/reporting/page.tsx`** — **NEW August 14, 2026, and the nav's "Reporting" target.**
  Lists EVERY published post via `getPublishedPosts()` with no type filter, linking each card
  through `postHref()` so it lands on its own canonical route. It replaced `/greenville-works`
  as the nav target because that showed only `greenville works`-tagged posts, which made the
  site's main tab a filter on one engine's output and hid the real-estate work. **It creates no
  new article URLs and must not**; the per-section `[slug]` routes below are still where posts
  live. `sectionLabel()` badges distinguish rows in the mixed list.
- **`src/app/archive/`**, **`src/app/real-estate/`**, **`src/app/greenville-works/`**,
  **`src/app/briefing/`** — the four section index + `[slug]` routes (`/greenville-works` is
  labelled **"Business"** as of August 14, 2026, was "SC Technology"; route and tag unchanged
  because every published article URL hangs off them. It is no longer the nav target and is now
  the narrow view, reached from article breadcrumbs, the sitemap, and search) (`/briefing` is the weekly
  Upstate Brief, added July 9, 2026; its index also carries an owned-list `SubscribeForm`
  since the brief never goes to Substack). All four `[slug]`
  pages render the shared `components/ArticleView.tsx` (markdown → sanitize → `Article` +
  `BreadcrumbList` JSON-LD), differing only in the `section` prop and the post `type` they
  request. The `section` prop carries an opt-in `showReferralCta` flag; **`/real-estate` and
  `/briefing` both set it** (both are written for buyers and sellers, the audience the referral
  funnel serves). `/archive` and `/greenville-works` leave it off, since their readers came for
  something else. **The CTA renders TWICE** (July 30, 2026): once mid-article and once after the
  body and BEFORE the newsletter box, since on a referral-first site the buy/sell offer outranks
  audience growth. The mid-article placement exists because the July 27 brief drew 11 visits with
  its only offer sitting below the whole article, where a skimmer never reaches it.
  `src/lib/articleCta.ts` `splitAtMidHeading()` picks the cut: the `<h2>` nearest the body's
  midpoint, never the first (an offer above the value reads as an ad) and never the last (it
  would collide with the closing block), returning null on short or flat articles so they render
  in one piece with the closing CTA alone. **Deliberately no top-of-article CTA** — on editorial
  content an offer above the first paragraph costs trust. The two placements use different
  `ReferralCta` variants: `inline` (accent-tinted via `theme-card-accent`, built to interrupt a
  skim) and `full` (the roomier closing block). **The copy is deliberately short and warm**
  ("Thinking of making a move?" / "Let me know if you're thinking about selling, or if you're
  looking to buy!"), shared verbatim with the email CTA in `emailTemplates.ts` `referralBlock()`
  so the two never drift. It is an invitation, not an explanation; do not grow it back into a
  paragraph, and **never explain the business model in it** — no referring, matching, connecting,
  or introducing the reader to an agent, no "vetted"/"hand-picked" anyone, no "at no cost to you",
  and no "I do not practice" / "I do not take clients" (see the root `CLAUDE.md` note, which was
  extended to the whole mechanism August 1, 2026). **This CTA is the one deliberate exception to the site's
  uncontracted-copy rule**: Alex wrote the contractions himself and confirmed them July 30, 2026,
  because the block had been reading like a legal disclaimer. Do not "fix" them. Button copy is
  **"Get in touch"** (Alex rejected "Tell me about your situation" as clinical). Keep the tag condition in
  `src/lib/broadcast.ts` in sync with these section props, since the owned-list email mirrors the
  same policy. Canonical is self-referential per section. `/real-estate` holds the Greenville
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
  CSRF-able); `POST /api/publish` takes the cookie (same-origin checked). The editor is
  Substack-style (July 2026 rework): one centered article-width column, borderless
  title/subtitle fields, a Write | Preview toggle whose preview is site-accurate
  (`/api/admin/preview`), a ghost markdown toolbar, autosave for drafts (published posts save
  manually so edits never go live mid-thought), Ctrl/Cmd+S, and image paste/drag/upload
  (`/api/admin/upload` → the public `post-images` Storage bucket, `body/` for inline images,
  `cover/` for covers). The **cover photo is editable at the top of the editor**: it shows
  the exact 2/1 hero crop with the curated-library auto pick labeled as such, and Alex can
  upload/drop/URL his own photo (stored in `cover_image` + optional `cover_credit` via
  `/api/review/save`, which `/api/publish` and the finalize cron both respect and never
  overwrite), edit the credit line, or remove it to fall back to the library.
  **DARK MODE (fixed August 1, 2026).** These routes render outside `Nav`/`Footer`, and every one
  of them had hardcoded `bg-white` / `bg-gray-50` / `text-gray-*` / `text-black`, so `/admin`, the
  login screen, `/admin/edit/[id]`, `/review`, and the shared `Editor` all stayed white when the
  site's `DarkModeToggle` flipped `html.dark`. (The toggle itself was never broken: it lives in the
  root layout and DOES render on these routes, unlike Nav and Footer.) They now use the same
  `.theme-*` tokens as the rest of the site, plus `hover:*-[var(--token)]` arbitrary values where a
  hover state needed a token Tailwind cannot reach through a plain CSS class, and `tone-*` for the
  DRAFT/PUBLISHED chips and error text. The editor preview switched from `prose prose-neutral`
  (hardcoded dark ink, unreadable on a dark page) to `prose theme-prose`. **Do not add a raw
  Tailwind gray or `bg-white` back to these files** — if a surface needs a color, it comes from a
  token. Two hardcoded colors are deliberate and stay: the green Publish button (a deliberate
  affordance, legible in both themes) and the `bg-black/35` hover scrim over the cover photo (a
  scrim over a photo is black in both themes).
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
  `theme-cta`, `theme-cta-accent`, `theme-badge`, `theme-section-contrast`, `theme-page`).
- **The surface scale is TWO surfaces, and only two** (enforced July 2026). A page alternates
  between `theme-section` (the base, transparent) and `theme-section-contrast` (the dark
  emphasis panel), with `theme-page` wrapping the route once to carry the accent bloom.
  **`theme-section-muted` was DELETED**, not deprecated, so the affordance to re-drift does not
  exist. It was a ~3.5% step over the light base, invisible alone and noisy beside a `#1d1d1f`
  panel, and in dark mode it lifted to ~`#1a1a1c` while the contrast panel drops to `#0a0a0b`,
  so a page stepped in BOTH directions away from its own background. Every route except
  `/about` already ran two surfaces; `/about` had drifted to four and read as a patchwork.
  **When two same-surface sections sit back to back and need a visible break, add
  `border-t theme-border`**, a hairline that separates without adding a weight. This was
  already the de-facto convention (`app/page.tsx` used it on both same-surface joins, and
  `/about` uses it between "Who it is for" and "Who writes it"); it is written down now rather
  than invented. Do not add a third background token. (The `--surface-muted` VARIABLE stays;
  `theme-card-muted` still uses it. The cap is on section-level surfaces.)
  Current per-route rhythm after the August 14, 2026 rebuilds, all conforming: `/`
  PAGE·light, `/about` PAGE·DARK·light(rule)·light(rule)·light(rule)·DARK, `/reporting`
  PAGE·light, `/briefing` PAGE·light·DARK, `ArticleView` PAGE·light·DARK. (`ToolShell` was
  PAGE·light·DARK·DARK and is deleted.)
- **Tokens (retuned in the August 2026 NEWSPAPER PASS):** near-neutral **paper** base
  (light bg `#fafaf9`, surface `#ffffff`, text `#16161a`, muted `#6b6b73`; dark bg
  `#101012`, surface `#1a1a1e`, text `#f5f5f7`) with an **editorial oxblood accent**
  (`#9a2323` light / `#d97066` dark, lifted in dark mode because oxblood dies on
  near-black). The old Apple grey `#f5f5f7` base read as an app shell and the indigo
  `#4f46e5` was the most "tech startup" element in the palette; both are gone. The base is
  still essentially neutral, so do NOT warm it into cream (the old dental cream+green is
  gone) or mix warm greys in. All neutrals live in `globals.css` tokens; retune there,
  never per-page.
- **Borders are STRUCTURE, shadows are gone.** `--border` went from `rgba(0,0,0,0.08)` to
  `0.14` and `--border-strong` from `0.14` to `0.32`, because rules now do the separating
  work that card shadows used to. `--shadow-card` is `none` and `--shadow-soft` is a 1px
  hairline; both tokens are KEPT (many components reference them) but render as nothing.
  `.theme-card` lost its `backdrop-filter: blur(18px)` and is now a transparent ruled box,
  and `.theme-header` lost its blur. Do not add a drop shadow or a backdrop-filter back.
- **Corners are squared globally.** The whole Tailwind v4 radius scale (`--radius-xs`
  through `--radius-4xl`) is set to `0px` in `@theme`, so the ~90 existing `rounded-*`
  utilities across 30 files keep compiling and render square. Retune there, never
  per-component. `rounded-full` is deliberately excluded (Tailwind hardcodes it, and the
  round controls like `DarkModeToggle` should stay circular).
- **Type is an EDITORIAL SPLIT.** `--font-serif` (a system stack: Charter → Iowan → Sitka →
  Cambria → Georgia) carries the reading surface: every `.type-display/h1/h2/h3/title`
  heading AND `.theme-prose` body copy. `--font-sans` (Geist) is CHROME only: nav,
  `.type-eyebrow`, `.type-small`, buttons, fields, badges, tables, and `figcaption`. The
  serif is a system stack on purpose — `next/font/google` breaks the Turbopack build, and a
  webfont would cost an LCP round trip. Headline sizes were stepped up (display now clamps
  to `4.5rem`) because the large-headline-to-small-body ratio is most of the newspaper
  effect. Prose links are underlined ink, not bare accent colour.
- **Type scale = single source of truth.** `@theme` defines `--text-display/h1/h2/h3/title/
  body-lg/body/small/eyebrow` (fluid `clamp()`), consumed via the `.type-*` utility classes
  (size + line-height + weight + tracking together; color still comes from `theme-text-*`).
  Prefer `.type-h2` etc. over ad-hoc `text-3xl md:text-4xl font-bold tracking-tight`. The
  homepage and `/about` are fully converted (both were rebuilt August 2026); other pages
  migrate over time.
- **Dark mode:** class-based (`html.dark`). `ThemeProvider` → `localStorage` key
  `alexprompts-theme`. `suppressHydrationWarning` on `<html>` + the inline `layout.tsx`
  script prevent the flash.
- Typography: Geist Sans via the `geist` npm package (self-hosted — Turbopack's http2
  error breaks `next/font/google` at build, including in `opengraph-image.tsx`, so use
  system fonts there).
- Sections `py-20 md:py-28`, max-width `max-w-5xl`/`max-w-6xl`, articles `max-w-2xl`.
- Article body: `prose theme-prose max-w-none` + `dangerouslySetInnerHTML` (first-party
  author content from the gated publish flow).
- Direction: **clean-cut newspaper** (August 2026, replaced "Apple-quiet"). Serif headlines
  and body, sans furniture, hairline rules, squared corners, flat blocks of ink, generous
  whitespace, zero decoration. **THE TERMINAL-CARET MOTIF IS DELETED**, not deprecated:
  `.caret` (the blinking `▌` after the wordmark in `Nav`), `.prompt-watermark` (the giant
  faint `>` behind the homepage lede), and `PostCover`'s branded `>` placeholder panel were
  the last artefacts of the retired "Alex Prompts" AI-prompt positioning. The classes are
  removed from `globals.css` so the affordance to re-add them does not exist, the same way
  `.theme-section-muted` was handled. **Do not reintroduce a caret, chevron, blink, or `>`
  anywhere** — a publication's mark is its name set in type. `PostCover`'s no-cover state is
  now a silent ruled plate. Two rule utilities exist for structure: `.rule-masthead` (3px,
  once per view, under the nameplate) and `.rule-section` (hairline between same-surface
  blocks). **No gradients**: `.theme-page`'s accent bloom and `.theme-section-contrast`'s
  radial glow were both removed (print has no glow, and a radial gradient behind a masthead
  reads as a SaaS landing page). Do not add back the dotted-grid page texture either.
- **Cover library images are the homepage LCP** (`public/greenville/library/`). They MUST stay
  web-sized: max 1400px wide, roughly 300KB, JPEG q≈75 (batch-resized July 10, 2026 from the
  original 0.5–1.3MB Wikimedia files; originals were only in scratch, the repo keeps the sized
  ones). The monthly `cover_ingest` PR re-encodes every photo to this spec automatically before
  committing (the `websize()` step, added July 13, 2026 after the first run shipped 1920px/1MB
  files), so PR review is about looks and attribution, not file size — but if a library photo
  ever arrives oversized anyway, downsize it BEFORE merging. `next.config.ts` `headers()` gives
  `/greenville/library/*` a 30-day
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
- **Every page route declares its OWN canonical, and a check enforces it**
  (`scripts/checks/canonicals.mjs`, wired to `npm run lint` and to `prebuild`, so a
  missing canonical fails the Vercel build). The root `layout.tsx` deliberately sets **no**
  `alternates.canonical`: Next merges metadata shallowly, so a canonical there is inherited
  by any page that forgets one, which would point a new route at the homepage and get it
  dropped from the index as "Alternate page with proper canonical tag" with no error
  anywhere. Unset means the failure mode is a self-canonical instead. A gated route opts out
  with `robots: { index: false }` (`/admin`, `/admin/edit/[id]`, `/review` all do). Keep the
  canonical literal in the page file; moving it into a helper defeats the text check.
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
