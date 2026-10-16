# Frontend — `src/`

See the root `CLAUDE.md` for the paper, the routines, Supabase and env vars.

## Tech stack

- **Next.js 16.2.2** (App Router, Turbopack), **React 19**, **TypeScript**.
- **Tailwind CSS v4** (`@theme {}` in `globals.css`, not `tailwind.config.js`) plus
  `@tailwindcss/typography`.
- **Markdown** (Archive articles only): `marked` + `sanitize-html` in
  `src/lib/renderMarkdown.ts` (`renderPostHtml`), rendered by `components/ArticleView.tsx`.

## Key couplings

- **`src/lib/site.ts`** is the brand single source of truth: `site` (name, tagline,
  headline, description, email, url), `socials` (JSON-LD `sameAs`), `CONTACT_EMAIL` (an
  alias for `site.email`) and `SITE_URL`. Alex's name and personal details are off the site
  at his request (September 2026); `LICENSEE_NAME` survives only for the licensee disclosure
  on `/terms`, which state law requires. Do not import it anywhere else.
- **`src/lib/posts.ts`** reads the Archive (`blog_posts`): `getPublishedPosts`, `getPost`,
  `sectionOf`, `postHref`, `formatDate`. Four sections by tag: `sales` at `/sales`,
  `greenville` at `/real-estate`, `briefing` at `/briefing`, anything else at `/archive`.
  `next.config.ts` keeps the old redirects (`/greenville-works`, `/buying-or-selling`, the
  agents page and others). These functions return empty results when Supabase env is
  unset, so the site still builds.
- **`src/lib/rateLimit.ts`** guards `/api/subscribe` and `/api/letters`.

## Routes

- **`/`, `/edition/[slug]`, `/editions`** — **The Rebrew Intelligencer** (October 14, 2026;
  see the root `CLAUDE.md`). `/` renders the latest row of `intelligencer_editions` through
  `components/EditionView.tsx`; `/edition/<YYYY-MM-DD>` is each number's permanent URL with
  its own `opengraph-image.tsx` (blackletter nameplate plus the lead headline, fonts fetched
  from Google Fonts at render and falling back if that fails); `/editions` is Back Issues.
  All `revalidate = 300`, so a new row appears within five minutes with no deploy. The
  period faces (1945 typography, October 14, 2026: UnifrakturMaguntia nameplate, Oswald
  banner and story heads as `--font-banner`, Libre Bodoni decks, departments, letters and
  ads as `--font-head`) load from `src/lib/paperFonts.ts` by a plain stylesheet `<link>`,
  never `next/font/google`; share images load the same faces in `src/lib/ogFonts.ts`.
  Body copy stays on the system serif. `.paper-*` classes in `globals.css` set the ruled columns and drop cap.
  The readers in `src/lib/editions.ts` are defensive because the routine writes the JSON.
- **`/clip/[slug]/[item]` and `/api/clip-image`** — CLIP AND SHARE (October 14, 2026).
  `src/lib/clips.ts` owns the item ids (`lead`, `market`, `editorial`, `dispatch-N`,
  `odd-N` (Strange but True, `content.oddities`, added October 14, 2026), `letter-N`, `amusement-N`, `around-N`, `ad-N`, positional and stable because a printed
  number is never edited), the department names `EditionView` prints, the `?l=` excerpt
  parser (paragraph and character offsets, widened to whole words, capped at 420
  characters) and the seeded torn edge. `EditionView` wraps each item in `<Clippable>`
  (`data-clip` plus an `id` anchor) and each paragraph's text in `data-clip-p`, so offsets
  never count the dateline. `components/ClipLayer.tsx` is the clipper: hover cut line and
  pointer cursor (CSS under `.clip-ready`; no scissors cursor or glyph, Alex disliked it), "Clip this line" on a selection inside one paragraph,
  tap-to-arm on touch screens, and the share sheet (`components/ClipShare.tsx`). The clip
  page is `noindex` (it is a doorway to the number) and its `og:image` is the clipping.
  **Never let a clip carry text in the URL**: the image and page rebuild it from the row.
- **`/office`** — THE EDITOR'S OFFICE (October 14, 2026). `src/lib/office.ts` assembles
  everything (cast files by regex over every number, sentence-split with abbreviation
  guards so "Mrs. Langston" survives, each line a `clipPath` with offsets; most-clipped from
  `page_hits` with the service key; `content.ticker` for the coffee can and ticker;
  `nextPressRun()` in New York time). `components/office/OfficeScene.tsx` shows the room
  as a real 1941 photograph (Gottscho-Schleisner, Library of Congress, since October 15, 2026; Alex's retouched copy with the clippings, radio, telephone, coffee can and the Clarion added since October 16, credited as retouched;
  the SVG drawing read as clip art) with percent-positioned spots (`SPOTS`), a hover tag, a list
  of every visible spot under the photograph for phones, and a newsprint panel per object.
  Spots with `hidden: true` are Easter eggs: no outline on hover and left out of the list.
  The frame and panels keep their newsprint palette in dark mode on purpose. `.office-*` styles live at the end of `globals.css`.
- **`/api/hit`** — first-party pageview counter beaconed by `components/PageHit.tsx` from the
  root layout. Service key, `record_hit` RPC, bot user agents skipped, soft per-IP cap. Paths
  and referrers are reduced to fixed labels before storage, because routines read the table
  and a stranger controls both strings. A new route that should be counted goes into
  `STATIC_PATHS` there AND into the `page_hits_path_known` check constraint.
- **`/api/intelligencer/press`** — the press routine's only door (see the root `CLAUDE.md`).
  Bearer `INTELLIGENCER_PRESS_SECRET`, constant-time compare, 10 bad attempts an hour per IP.
  `validate()` rebuilds the edition from known fields only, so a new field in `EditionContent`
  must be added there too or it is silently dropped.
- **`/reporting`** is the footer's Archive: every published post, newest first, as a plain
  list. The four section indexes (`/archive`, `/real-estate`, `/sales`, `/briefing`) and
  their `[slug]` pages render through `components/ArticleView.tsx`, each with a
  self-referential canonical.
- **`/subscribe`** is the owned list and the nav's Subscribe target. Confirmed subscribers
  get every number by email (`src/lib/editionEmail.ts`); every edition ends with the same
  form (`source="edition"`).
- **`/letters`** posts to `/api/letters` (see the root `CLAUDE.md`).
- **`/about`, `/contact`, `/privacy`, `/terms`.** The site collects only newsletter emails
  and readers' letters; `/privacy` also covers the past submissions kept in `referral_leads`.
- **Nav:** the name, then The Office, Back Issues, About, Subscribe and the light and dim
  switch. **Footer:** About, Archive, Contact, Privacy, Terms.

## Design system

Direction is **clean-cut newspaper**: serif headlines and body, sans furniture, hairline
rules, squared corners, flat blocks of ink, generous whitespace, zero decoration.

- **Palette is CSS custom properties** in `globals.css` (`:root` light, `html.dark` dark).
  Do NOT hardcode hex. Use the `.theme-*` utilities (`theme-text-primary/secondary/muted`,
  `theme-border`, `theme-card`, `theme-card-strong`, `theme-card-muted`, `theme-label`,
  `theme-cta`, `theme-cta-accent`, `theme-badge`, `theme-section-contrast`, `theme-page`).
- **Tokens:** a near-neutral **paper** base (light bg `#fafaf9`, surface `#ffffff`, text
  `#16161a`, muted `#6b6b73`; dark bg `#101012`, surface `#1a1a1e`, text `#f5f5f7`) with an
  **editorial oxblood accent** (`#9a2323` light, `#d97066` dark, lifted because oxblood dies
  on near-black). The old Apple grey base read as an app shell and the indigo was the most
  "tech startup" element in the palette; both are gone. The base is essentially neutral, so
  do NOT warm it into cream or mix warm greys in. Retune in `globals.css`, never per-page.
- **The surface scale is TWO surfaces, and only two.** A page alternates between
  `theme-section` (the base, transparent) and `theme-section-contrast` (the dark emphasis
  panel), with `theme-page` wrapping the route once. **`theme-section-muted` was DELETED**,
  not deprecated, so the affordance to re-drift does not exist: it was a ~3.5% step over the
  light base, invisible alone and noisy beside a `#1d1d1f` panel, and in dark mode it lifted
  while the contrast panel dropped, so a page stepped in BOTH directions away from its own
  background. **When two same-surface sections sit back to back and need a visible break,
  add `border-t theme-border`.** Do not add a third background token. (The `--surface-muted`
  VARIABLE stays; `theme-card-muted` uses it. The cap is on section-level surfaces.)
- **Borders are STRUCTURE, shadows are gone.** `--border` is `rgba(0,0,0,0.14)` and
  `--border-strong` `0.32`, because rules now do the separating work card shadows used to.
  `--shadow-card` is `none` and `--shadow-soft` is a 1px hairline; both tokens are KEPT
  (many components reference them) but render as nothing. `.theme-card` lost its
  `backdrop-filter` and is a transparent ruled box; `.theme-header` lost its blur too. Do
  not add a drop shadow or a backdrop-filter back. **No gradients** either: the accent bloom
  and the radial glow behind the masthead were both removed, and print has no glow.
- **Corners are squared globally.** The whole Tailwind v4 radius scale (`--radius-xs`
  through `--radius-4xl`) is `0px` in `@theme`, so the ~90 existing `rounded-*` utilities
  keep compiling and render square. Retune there, never per-component. `rounded-full` is
  deliberately excluded, since Tailwind hardcodes it and round controls should stay round.
- **Type is an EDITORIAL SPLIT.** `--font-serif` (a system stack: Charter, Iowan, Sitka,
  Cambria, Georgia) carries the reading surface: every `.type-display/h1/h2/h3/title`
  heading AND `.theme-prose` body copy. `--font-sans` (Geist, self-hosted via the `geist`
  package) is CHROME only: nav, `.type-eyebrow`, `.type-small`, buttons, fields, badges,
  tables, and `figcaption`. The serif is a system stack on purpose, since
  `next/font/google` breaks the Turbopack build and a webfont would cost an LCP round trip.
  Prose links are underlined ink, not bare accent.
- **Type scale is a single source of truth.** `@theme` defines
  `--text-display/h1/h2/h3/title/body-lg/body/small/eyebrow` as fluid `clamp()`, consumed
  via the `.type-*` utilities (size, line-height, weight, tracking together; color still
  comes from `theme-text-*`). Prefer `.type-h2` over ad-hoc `text-3xl md:text-4xl font-bold`.
- **Dark mode is class-based** (`html.dark`). `ThemeProvider` writes the `alexprompts-theme`
  localStorage key, which **kept its old name through the Rebrew rename ON PURPOSE**:
  renaming it would silently reset every existing reader's light/dark choice for no gain.
  `suppressHydrationWarning` on `<html>` plus the inline `layout.tsx` script prevent the
  flash, and that script must match the key.
- Sections `py-20 md:py-28`, max-width `max-w-5xl`/`max-w-6xl`, articles `max-w-2xl`.
  Article body is `prose theme-prose max-w-none` plus `dangerouslySetInnerHTML` (first-party
  author content from the gated publish flow).

### The mark, and what stays banned

**THE TERMINAL-CARET MOTIF IS DELETED**, not deprecated: `.caret` (the blinking `▌` after
the wordmark), `.prompt-watermark` (the giant faint `>` behind the homepage lede), and
`PostCover`'s branded `>` placeholder panel were the last artefacts of the retired
"Alex Prompts" AI-prompt positioning. The classes are removed from `globals.css` so the
affordance to re-add them does not exist. **Do not reintroduce a caret, chevron, blink, or
`>` anywhere.** That ban is about the AI-prompt motif and it still stands.

It is **not** a ban on the paper's own marks. The old coffee-cup-and-house mark survives
only as `public/email/mark.png` in the confirmation email. The favicon (October 14, 2026),
`src/app/icon.svg`, is the blackletter R from the Intelligencer's nameplate
(UnifrakturMaguntia, SIL OFL, outlined to a path) in ink on a newsprint plate, with
`favicon.ico` (16/32/48) and `apple-icon.png` (180) rasterized from it.
`PostCover`'s no-cover state is a silent ruled plate. Two rule utilities carry structure:
`.rule-masthead` (3px, once per view, under the nameplate) and `.rule-section` (hairline
between same-surface blocks).

### Off-Tailwind surfaces read `src/lib/brand.ts`

Three surfaces cannot reach the CSS custom properties: **email** (`emailTemplates.ts`,
`editionEmail.ts`, since clients strip `<style>`, classes, and external CSS), the **share
card** (`app/opengraph-image.tsx`, satori at the edge with no stylesheet), and the
**standalone result pages** (`htmlPage.ts`, used by `/api/subscribe/confirm`,
`/api/unsubscribe`). Each used to hardcode its own palette
and they drifted exactly as you would expect: the newspaper pass moved the site to
oxblood/serif/square and **email kept shipping the retired system for weeks**, so a
subscriber clicking through from a broadcast watched the brand change under them.

`brand.ts` mirrors the `globals.css` tokens as raw values. The light set covers email and
the result pages (neither has a reliable theme signal); a small `*_DARK` set exists for the
share card, which is a deliberately dark surface. **If the palette moves in `globals.css`,
move it in `brand.ts` in the same commit.**

**Font stacks in `brand.ts` use SINGLE quotes, and that is load-bearing.** They are
interpolated into `style="..."` attributes; a double-quoted family name closes the attribute
early, the browser discards the whole declaration, and **every** font in the message falls
back to the client default. It looks like a design choice and is invisible in a diff. This
shipped once and was caught only by rendering the email and looking at it.

**`node scripts/brand/preview-email.mjs`** renders the confirmation email and result pages to HTML you
can open in a browser, with no send and no Resend config. It fails on retired design values
(indigo, `border-radius`, the old greys) and on truncated `font-family` attributes. A
browser flatters email HTML, so confirm anything risky with a real test send
(`/api/intelligencer/broadcast?slug=<date>&test=you@example.com` for a number). `scripts/brand/make-email-mark.mjs`
regenerates `public/email/mark.png`, the hosted mark the nameplate uses, since email clients
do not render inline SVG; the nameplate pairs it with a live type wordmark so it still reads
with images off, which is Outlook's default.

## Images and LCP

`PostCover` routes same-origin AND Supabase-hosted covers on Archive articles through **`next/image`**
(responsive srcset, AVIF/WebP, roughly 50 to 75KB at phone widths instead of the full
file), keeping a plain `<img>` only for other remote hosts such as the Substack CDN, whose
hosts vary and would 400 an un-whitelisted `next/image`. Callers pass `sizes` matching
their layout plus `priority` on whatever is above the fold; the homepage featured card and
the `ArticleView` hero both set it, and the hero is cropped to the same 2/1 box as the
featured card, which reserves layout space and killed the article-load CLS.

Body images in `renderPostHtml` get the same treatment: Supabase-hosted `<img>`s are rewritten to `/_next/image` srcsets, the first image
eager with `fetchpriority=high` (it is the LCP on image-led articles) and the rest lazy.
`next.config.ts` `images.remotePatterns` whitelists only the Supabase host, derived from
`NEXT_PUBLIC_SUPABASE_URL`, and `minimumCacheTTL` is 30 days so transformation counts stay
far inside the Vercel Hobby free quota.

## SEO

- Each page sets `title` (template `%s · Rebrew`, from `site.name`), `description`,
  `openGraph`, and `alternates.canonical`. `metadataBase` and canonicals come from
  `SITE_URL`.
- **Every page route declares its OWN canonical, and `scripts/checks/canonicals.mjs`
  enforces it**, wired to `npm run lint` and to `prebuild`, so a missing canonical fails the
  Vercel build. The root `layout.tsx` deliberately sets **no** `alternates.canonical`: Next
  merges metadata shallowly, so a canonical there is inherited by any page that forgets one,
  which would point a new route at the homepage and get it dropped from the index as
  "Alternate page with proper canonical tag" with no error anywhere. Unset means the failure
  mode is a self-canonical instead. A gated route opts out with `robots: { index: false }`
  **Keep the canonical literal in the
  page file**; moving it into a helper defeats the text check.
- **`app/opengraph-image.tsx`** is the edge Satori branded fallback card. It is auto-injected
  on the root and static pages but is **NOT inherited by the `[slug]` article routes**, so
  those must set `openGraph.images`/`twitter.images` themselves or they ship with no share
  thumbnail. All the `[slug]` routes call `articleOgImage(post)` (in `posts.ts`), which
  prefers the post's own lead image and falls back to `/opengraph-image`. Do NOT set
  `openGraph.images` on the root or static pages, where it conflicts with the auto-injected
  file.
- JSON-LD: `WebSite` and `Person` in `layout.tsx`, `Article` and `BreadcrumbList` per piece,
  `sitemap.ts` and `robots.ts` derive from `SITE_URL`.
- `layout.tsx` also renders **`<Analytics />`** (`@vercel/analytics/next`). It is
  **cookieless, stores no PII, and needs no consent banner**, serves first-party from
  `/_vercel/insights`, is a no-op locally, and **requires Web Analytics to be enabled for
  the project in the Vercel dashboard**, which it is not; `/api/hit` is the real counter.

## Framework gotchas

- Next.js 16 uses `proxy.ts` (not `middleware.ts`) for middleware. There is currently **no**
  proxy file; the old one only guarded a deleted route. Do not add one back unless a new
  gated route needs it.
- Typed routes: after deleting or renaming a route, a stale `.next/dev/types` can fail the
  type check referencing the old path. `rm -rf .next` and rebuild.
- Supabase reads use `createClient` from `@supabase/supabase-js` with the anon key and RLS.
