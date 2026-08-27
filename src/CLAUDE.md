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
  **`breaks: true` since August 24, 2026**, in `renderMarkdown.ts` and `emailMarkdown.ts` both,
  so a single Enter is a real line break the way it is in every WYSIWYG. CommonMark's default
  folds a soft newline into the paragraph above, which silently ran hand-typed lines together in
  a published article. Verified safe across the whole corpus before flipping: the only
  mid-paragraph soft newlines that existed were list lead-ins (unaffected) and two lines that
  were meant to be separate. Keep the two renderers in sync, since the inbox and the page have
  to agree.
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
  broadcasts each one to the owned list. **It no longer fills covers: there is no automatic cover
  anywhere (August 27, 2026), so a post carries the photo Alex chose in the editor or none at all.**
  Both `/real-estate` and `/greenville-works` index pages render a `PostCover` thumbnail per row
  (branded `>` placeholder when there is no cover); a cover Alex set shows as the article hero
  (`ArticleView` renders `cover_image` when the body has no lead image), the homepage feed
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
  CSRF-able); `POST /api/publish` takes the cookie (same-origin checked). **The editor body is
  a WYSIWYG rich-text surface (TipTap/ProseMirror, August 24 2026), not a markdown textarea.**
  It replaced the plain `<textarea>` + markdown toolbar after an article published with literal
  `**` in the copy: the old toolbar wrapped the raw selection, and selecting a line by
  triple-click or shift+down carries the line's trailing newline, so it wrote `**Heading\n**`,
  which no markdown parser treats as bold. Formatting now works the way Substack's does, through
  a **selection bubble** (highlight text, format in place), a **slash menu** (`/` on an empty
  line for heading, lists, quote, divider, image), and the **gutter "+"** that appears in the left
  margin beside an empty line and opens that same menu for someone who never learns to type a
  slash (md and up only; there is no margin to park it in on a phone); markdown INPUT RULES still
  work, so typing `## ` or `- ` does what it always did. There is deliberately **no persistent format toolbar**.
  `src/app/review/RichText.tsx` is the surface and `src/app/review/Figure.tsx` adds captioned
  images (a real `<figure>`/`<figcaption>`, which the site and email already render).
  **`blog_posts.body_md` is still the source of truth and nothing downstream changed**: the
  document loads through `mdToEditorHtml` and is handed back as markdown on every keystroke by
  `editorHtmlToMd`, both in `src/lib/editorMarkdown.ts` (marked + turndown, running in the
  browser). That module carries two rules worth knowing about, because both fix bugs that
  reached readers: emphasis is emitted **one delimited run per line** (a delimiter may not span
  a line break, which is the August 24 bug guarded at the serializer), and a list item's
  TipTap-added wrapper `<p>` is unwrapped so lists stay tight. **`scripts/checks/editor-roundtrip.mjs`
  is the gate** and runs in `npm run lint`: it asserts that loading and saving a post without
  typing renders identically, against every row in the database plus fixtures in both
  `marked`-shaped and TipTap-shaped HTML. If you change the bridge, that check is what tells you
  whether you broke an engine-written body. Around the body, unchanged: one centered
  article-width column, borderless title/subtitle fields, a Write | Preview toggle whose preview
  is site-accurate (`/api/admin/preview`), autosave for drafts (published posts save
  manually so edits never go live mid-thought), Ctrl/Cmd+S, and image paste/drag/upload
  (`/api/admin/upload` → the public `post-images` Storage bucket, `body/` for inline images,
  `cover/` for covers). The **cover photo is editable at the top of the editor**: it shows the
  exact 2/1 hero crop, and Alex can upload/drop/URL his own photo (stored in `cover_image` +
  optional `cover_credit` via `/api/review/save`), edit the credit line, or remove it.
  **NO AUTO-COVER (August 27, 2026).** The editor used to preview the curated-library photo that
  `/api/publish` would stamp on a coverless row, and the finalize cron did the same thing a day
  later for anything that slipped through. Both are gone, along with `src/lib/editorCover.ts`: a
  piece Alex has just read through must not go live under a stock photo he never picked. An empty
  cover slot is now a decision, and it survives to the live page as the branded `>` placeholder.
  The curated library went with it, at Alex's instruction ("i always have to find my own pics
  anyway"): `src/lib/greenvilleCovers.ts` + `.json`, `src/lib/greenvilleImage.ts`, the eleven
  photos in `public/greenville/library/`, `scripts/greenville/cover_ingest.py`, and the monthly
  `.github/workflows/greenville-covers.yml` PR that grew it are all deleted. Seven published posts
  were carrying an auto-assigned library photo; their `cover_image` and `cover_credit` were
  cleared in the same pass, so they render the `PostCover` placeholder until he picks one.
  **WRITING FROM SCRATCH (August 25, 2026).** `/admin` has a **"Write Article"** button (header,
  and again in the empty drafts state) that POSTs to **`/api/admin/create`**, which mints an empty
  DRAFT row and returns its id; the button then opens `/admin/edit/<id>`, so a new piece is one
  click and lands in the same composer the engines' drafts land in. The row is created with an
  empty title and body and a **placeholder slug** (`untitled-xxxxxx`, since `blog_posts.slug` is
  NOT NULL UNIQUE) and the `greenville works` tag, which is where the publication's live work
  goes. `src/lib/slug.ts` owns slugs for the whole repo now (`slugify`, `isValidSlug`,
  `placeholderSlug`, `isPlaceholderSlug`); `substack.ts` imports it instead of carrying its own
  copy. Three rules make this work end to end and each one is enforced on the server, not only in
  the UI: **the URL follows the title** while the slug is still the placeholder and stops the
  moment it is edited by hand (an engine draft arrives with a real slug, so it is never rewritten);
  **an empty title or body saves but does not publish** (`/api/review/save` allows it on a DRAFT so
  autosave can store a half-written piece, `/api/publish` refuses it, and the editor disables the
  Publish button with the reason in its tooltip); and **slug and section are DRAFT-ONLY**, because a
  published post owns a live, probably indexed URL that its section is the first half of. Section
  and URL live in a **post-settings drawer** (`review/PostSettings.tsx`, opened from the header,
  Escape or the backdrop closes it) driven by `src/lib/editorSections.ts`, whose `retagForSection`
  swaps the one section tag and keeps every topical tag (tags render as badges on the article).
  Autosave now records a payload that the server REJECTED and will not retry it until the document
  changes, which is what stops a taken slug from looping a failed save every 2.5 seconds.
  Two more Substack habits came with it: **Enter in the title moves to the subtitle and Enter in
  the subtitle moves into the body** (RichText hands its editor up through `onReady`), and a
  brand-new empty draft opens with the caret already in the title.
  **THE COMPOSER'S LOOK (August 25, 2026), after Alex said it was "still not very close" to
  Substack and it was checked in a real browser.** The cover no longer leads the page: it is a
  text button until there is a photo, rather than a full-bleed frame above an unwritten title.
  (It briefly showed the curated library pick as a thumbnail on that button; the auto-cover was
  deleted August 27, 2026, so the button is now just "+ Add a cover image".) Preview moved from
  a pill mid-page into the header. The header carries four controls where it had eight, with the
  status and save state folded into one muted `Published · Saved` line and Save rendered only
  when there is something to save. **The selection bubble and the block menu share one surface,
  `.editor-pop` in `globals.css`**: a solid dark pill in light mode, a lifted panel in dark, with
  white-alpha hover and active states that work on both. That is the Substack look, and it is
  also the answer to a problem this design system creates for itself, since a near-white popover
  floating over near-white body copy has nothing to separate it once drop shadows are banned. Do
  not "fix" it back to `theme-header`. Three bugs the browser pass caught and fixed: a wrapped
  title clipped under the subtitle (the textarea measured itself before the web font swapped, so
  it re-measures on `document.fonts.ready` and on resize), a body placeholder that never drew
  (TipTap marks the empty node and leaves the CSS to the app, which did not exist, so a blank
  article opened with no prompt), and Enter in the subtitle not reaching the body (focus the DOM
  node FIRST and let the TipTap command only place the caret, since the command throws on a
  hot-reloaded instance and killed everything after it; the tick is a timer, never
  `requestAnimationFrame`, which browsers pause in a background tab).
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
  `alexprompts-theme` localStorage key (must match `ThemeProvider.tsx`; the key kept its old
  name through the August 24, 2026 Rebrew rename ON PURPOSE, because renaming it would silently
  reset every existing reader's light/dark choice for no gain). Also renders
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
  anywhere** — that ban is about the AI-prompt motif and it still stands. It is **not** a ban
  on the publication's own mark: **August 25, 2026 added the coffee-cup-and-house mark**, drawn
  once in `src/components/Mark.tsx` (currentColor, sized in `em` so it tracks the fluid
  `.wordmark`, doorway cut as a real `fillRule="evenodd"` hole so it needs no background
  colour) and again as a plated asset in `src/app/icon.svg` for the tab, with
  `favicon.ico` + `apple-icon.png` rasterized from that same file. Same drawing, two dresses:
  the tab carries its own oxblood plate because that background is not ours, the masthead
  inherits ink because that one is. `PostCover`'s no-cover state is
  now a silent ruled plate. Two rule utilities exist for structure: `.rule-masthead` (3px,
  once per view, under the nameplate) and `.rule-section` (hairline between same-surface
  blocks). **No gradients**: `.theme-page`'s accent bloom and `.theme-section-contrast`'s
  radial glow were both removed (print has no glow, and a radial gradient behind a masthead
  reads as a SaaS landing page). Do not add back the dotted-grid page texture either.
- **A cover photo is the homepage LCP**, so keep the ones you upload web-sized: max 1400px
  wide, roughly 300KB, JPEG q≈75. Nothing enforces this any more. The committed Greenville
  library under `public/greenville/library/`, its `cover_ingest` re-encoding PR, and the
  `next.config.ts` `headers()` rule that gave it a 30-day Cache-Control were all deleted
  August 27, 2026 with the auto-cover, so every cover is now an editor upload living in
  Supabase Storage and sized by whoever picked it. **July 11, 2026, the mobile-LCP
  pass:** `PostCover` routes same-origin covers AND Supabase-hosted covers
  (editor uploads, old streetview PNGs) through **`next/image`** (responsive srcset, AVIF/WebP, ~50–75KB at
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

- Each page sets `title` (template `%s · Rebrew`, from `site.name`), `description`, `openGraph`,
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
