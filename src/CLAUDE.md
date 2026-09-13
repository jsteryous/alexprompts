# Frontend — `src/`

See the root `CLAUDE.md` for brand, voice, engines, Supabase, and env vars.

## Tech stack

- **Next.js 16.2.2** (App Router, Turbopack), **React 19**, **TypeScript**.
- **Tailwind CSS v4** (`@theme {}` in `globals.css`, not `tailwind.config.js`) plus
  `@tailwindcss/typography`.
- **Markdown:** `marked` + `sanitize-html`, factored into `src/lib/renderMarkdown.ts`
  (`renderPostHtml`). Shared by `ArticleView` and the editor's live-preview route
  (`/api/admin/preview`), so an editor preview is byte-identical to the published article.
  **`breaks: true`** in `renderMarkdown.ts` and `emailMarkdown.ts` both, so a single Enter
  is a real line break the way it is in every WYSIWYG. CommonMark's default folds a soft
  newline into the paragraph above, which silently ran hand-typed lines together in a
  published article. Keep the two renderers in sync: the inbox and the page have to agree.
- **Auth:** none public. `/admin` is the draft review hub (password login = `PUBLISH_SECRET`,
  httpOnly `ap_admin` cookie, `src/lib/adminAuth.ts`). `/review` is the legacy
  token-in-query editor the engines' emails link to. Neither uses Supabase Auth.

## Key couplings

- **`src/lib/site.ts`** — brand single-source-of-truth: `site` (name, author, tagline,
  `headline`, oneLiner, description, email, url), `socials` (the footer and JSON-LD
  `sameAs`), `newsletterUrl`, `CONTACT_EMAIL`, `LINKEDIN_URL`. `SITE_URL` reads
  `NEXT_PUBLIC_SITE_URL`. **`site.headline`** is the masthead statement, "What's brewing in
  Real Estate." It lives here because it is the one line connecting the NAME to the BEAT:
  "Rebrew" says nothing about real estate alone, and the coffee-cup-and-house mark says it
  only to someone who already gets the joke. The homepage and the share card both read it;
  the card used to carry a hand-typed near-copy that had already drifted. **Editing handles
  or domain here updates every surface.** Do not reintroduce the deleted teaching exports
  (`tools`, `principles`, `realEstateOutcomes`, `outcomes`, `manifesto`).
- **`src/lib/posts.ts`** — archive data access: `getPublishedPosts(limit?, type?)`,
  `getPost(slug, type?)`, `getFeedPosts`, `formatDate()`, `sectionOf()`, `postHref()`.
  One `blog_posts` table, **four sections split by tag**, and `sectionOf()` is the single
  source of that mapping:

  | `PostType` | tag | route |
  |---|---|---|
  | `sales` | `sales` | `/sales` |
  | `realestate` | `greenville` | `/real-estate` |
  | `briefing` | `briefing` | `/briefing` |
  | `newsletter` | anything else | `/archive` |

  **`/sales` was renamed from `/greenville-works` on August 25, 2026, route and tag
  together**, and the `works` key and the `greenville works` tag are GONE. The old tag named
  the ENGINE, so a piece about sales performance had to be filed under a Greenville
  infrastructure label. `next.config.ts` carries permanent redirects for
  `/greenville-works`, `/greenville-works/:slug`, and three individual pieces that moved to
  `/real-estate` rather than `/sales`, listed ahead of the catch-all. These functions return
  an empty result when Supabase env is unset, so the site still builds.
- **`src/lib/substack.ts`** — Substack RSS to markdown (`parseSubstackFeed`,
  `fetchSubstackPosts`). `content:encoded` HTML to markdown via turndown; images kept as
  raw `<figure>`/`<figcaption>` so they render through the same pipeline. Called only by
  `/api/sync-substack` (daily Vercel cron in `vercel.json`), which upserts posts as
  `PUBLISHED`, so posting on Substack populates `/archive` with no manual step.
- **`src/lib/rateLimit.ts`** and **`src/data/commercialSales.json`** are easy to mistake for
  orphans and are not. The first is used by `/api/subscribe`, `/api/refer`, and the admin
  login. The second is imported by nothing in `src/` now, but
  `scripts/greenville/commercial.py` still refreshes it as engine research input.

## Routes

- **`/`** — the front page (`revalidate = 300`). Does ONE job, convince a qualified stranger
  to hand over an email address, in two sections: **standfirst plus the ask** (masthead
  statement, headline, two paragraphs on the beat, and an inline `SubscribeForm`, all above
  the fold), then **the work** (featured latest plus a "More to read" grid from
  `getFeedPosts`). The standfirst copy must stay in sync with `site.ts` and the
  `SubscribeForm` default promise. Deliberately removed and not to be re-added without a
  reason: the mission contrast panel (a mission stated twice on one page is stated badly),
  the "Where to find us" social grid (the footer carries every handle, and a row of links to
  other people's platforms pointed the one job off-site), and the tools row.
- **`/reporting`** — the nav's target. Lists EVERY published post via `getPublishedPosts()`
  with no type filter, linking each card through `postHref()`. It exists because the tab
  used to point at a single section, which made the site's main tab a filter on one engine's
  output and hid the rest. **It creates no new article URLs and must not**; the per-section
  `[slug]` routes are where posts live. `sectionLabel()` badges distinguish rows.
- **`/archive`, `/real-estate`, `/sales`, `/briefing`** plus their `[slug]` routes — the four
  section indexes. All four `[slug]` pages render the shared `components/ArticleView.tsx`
  (markdown, sanitize, `Article` and `BreadcrumbList` JSON-LD), differing only in the
  `section` prop and the post `type` they request. Canonical is self-referential per section.
- **`/buying-or-selling`** — the referral connector and the site's **#1 conversion surface**.
  Honest first-person copy, a "How this works" three-step (tell me, we talk it through, I
  stay in your corner), trust cards, and the qualifying `ReferralForm` that POSTs to
  `/api/refer`. Deliberately NOT a listings page: a new domain cannot out-rank the portals
  on listing searches. **Read the copy-rule comment at the top of the page file**, and the
  NEVER EXPLAIN THE BUSINESS MODEL rule in the root `CLAUDE.md`. It moved from `/find-a-pro`
  on August 28, 2026 because a URL is user-facing copy: it sits in the address bar, in a
  shared link, and in the email footer, where "find a pro" named the referral mechanism and
  contradicted the rest of the page. `/find-a-pro` and `/find-an-agent` are both permanent
  redirects pointing straight at the live path rather than through each other, and Next
  carries the query string across a redirect, so the `?ref=` on every published article's
  CTA still attributes.
- **`/contact`** — footer only, deliberately not in the nav, which carries one button and
  that button is the buy/sell page. It exists because the other two contact surfaces each
  assume they know why you are writing: `/about` ends on a tips ask you have to scroll a
  masthead to reach, and `/buying-or-selling` is a qualifying form for a transaction. A
  stranger checking whether a site is run by a real person looks for exactly this page.
  **No form on it, on purpose**: anything transactional links to `/buying-or-selling`, and
  everything else is email, which is the right primitive when a tip usually arrives as an
  attachment.
- **`/subscribe`** — the owned-list capture page and the nav's Subscribe target. It used to
  point at Substack; the site's promise ships on the owned list, so Substack is demoted to
  the form's secondary link.
- **`/privacy`, `/terms`** — required for 10DLC SMS vetting. `SMS_CONSENT_TEXT` lives in
  `src/lib/legal.ts` and is rendered **whole**, because every clause is checked during
  carrier vetting; the links to `/privacy` and `/terms#sms` sit OUTSIDE the string so the
  stored copy matches the screen byte for byte. Consent is unchecked by default, never
  required to submit, and `/api/refer` stamps the wording server-side and drops consent
  entirely when no phone came with it, so the table never claims a texting right over an
  empty number.
- **Nav is `Reporting | About`** plus Subscribe and the `Buying or Selling?` CTA. Every nav
  label states its promise in the visitor's words ("if you confuse you lose"). "Reporting"
  started as a placeholder for the unnamed publication and was **KEPT** after the Rebrew
  rename rather than swapped: now that the wordmark says Rebrew, a tab reading "Rebrew"
  beside it would say nothing. `Nav.tsx` and `Footer.tsx` return `null` on `/review` and
  `/admin`, whose sticky action bars the fixed nav used to cover.
- **`/best-real-estate-agents-greenville-sc`** — the search landing page and the site's
  SECOND conversion surface, targeting a commercial query typed by someone about to buy or
  sell who has not picked anyone yet. Everything ranking for it is a directory selling its
  slots or a brokerage sorting its own roster, so the page gives the honest answer instead:
  **no ranked list exists**, here is what separates a good agent from an average one, and
  here is how to check each of it yourself. It **does not name or rank real agents and must
  never grow a "top ten"**, since inventing one would fabricate. It does not claim Alex is
  one of the best agents in Greenville. Four substantive checks plus a five-question FAQ
  that also drives the `FAQPage` JSON-LD **from one array**, so the structured data cannot
  drift from the visible copy. **Sourcing is attribution in words with no external links at
  all**, which the house style treats as complete; a rotted link is worst on the page a
  stranger uses to judge whether the site is real. The ask is `components/QuickContact.tsx`,
  a deliberately tiny form (one phone, one email) POSTing to the same `/api/refer`, rendered
  twice with different `source` values so attribution can tell the placements apart. **There
  is no fewer than two taps here and no button can beat it**: no browser hands over a
  visitor's phone or email, Google sign-in returns an email and never a number, and the
  Contact Picker API is Android Chrome only. The lever is autofill, so keep the
  `autocomplete` (`tel`, `email`) and `inputMode` tokens intact. A Cal.com booking button was
  built and deleted the same day ("I just want someone's number or email quickly and
  easily"); do not rebuild it, since a scheduler asks a stranger who is still comparing to
  commit to a calendar slot, which is a bigger ask than this page is making. It is a
  conversion landing page, NOT a revived evergreen SEO guide; that category is dead. Not in
  the nav.
- **`/about`** — the **masthead**, not a resume. Opens on the reader's problem
  ("Announcements are not information."), spends its credibility section on the METHOD
  rather than on Alex, names who it is for, reaches the author last and briefly, and closes
  by asking for tips and documents plus the short warm buy/sell invitation. **Three things
  were deleted and must not return.** (1) The "under the hood" section saying AI agents
  research, draft, fact-check, and publish to the site: on a publication whose whole value
  is that a person read the primary documents, that is fatal on contact. The engine still
  drafts and Alex still reviews and publishes; that is a workflow detail, not a masthead
  claim. (2) The business model, stated outright. (3) The credibility pitch, per Alex's
  instruction to speak to the reader instead of hyping him. The eight years of BD, sales,
  and land acquisition appear once, as the reason he knows how to do this work, never as a
  boast.
- **`/tools` and `/tools/<slug>` 404.** All nine free tools were **deleted** August 14, 2026,
  along with `src/lib/tools.ts`, `src/components/tools/`, `ToolShell`, `ToolIcon`,
  `areaScan.ts`, `wireSafety.ts`, `/api/area-scan`, and `/api/area-autocomplete`. They served
  the consumer buyer, the audience this publication stopped serving, and a calculator suite
  under a masthead reads as a lead-gen site rather than something you read.

## The referral CTA in articles

The `section` prop carries an opt-in `showReferralCta` flag. **`/real-estate` and `/briefing`
set it** (both are written for buyers and sellers, the audience the funnel serves);
`/archive` and `/sales` leave it off, since their readers came for something else. Keep the
tag condition in `src/lib/broadcast.ts` in sync with these props, since the owned-list email
mirrors the same policy.

**The CTA renders TWICE**, once mid-article and once after the body and BEFORE the
newsletter box, since on a referral-first site the buy/sell offer outranks audience growth.
The mid-article placement exists because a brief drew 11 visits with its only offer sitting
below the whole article, where a skimmer never reaches it. `src/lib/articleCta.ts`
`splitAtMidHeading()` picks the cut: the `<h2>` nearest the body's midpoint, never the first
(an offer above the value reads as an ad) and never the last (it would collide with the
closing block), returning null on short or flat articles so they render in one piece with
the closing CTA alone. **Deliberately no top-of-article CTA**, since on editorial content an
offer above the first paragraph costs trust.

The two placements use different `ReferralCta` variants: `inline` (accent-tinted via
`theme-card-accent`, built to interrupt a skim) and `full` (the roomier closing block).
**The copy is deliberately short and warm** ("Thinking of making a move?" / "Let me know if
you're thinking about selling, or if you're looking to buy!"), shared verbatim with
`emailTemplates.ts` `referralBlock()` so the two never drift. It is an invitation, not an
explanation: do not grow it back into a paragraph, and never explain the business model in
it. **This CTA is the one deliberate exception to the site's uncontracted-copy rule**; Alex
wrote those contractions himself. Button copy is **"Get in touch"** (he rejected "Tell me
about your situation" as clinical).

## The publish flow and the composer

`/admin` (cookie login via `/api/admin/login`, `src/lib/adminAuth.ts`) lists drafts and is
the primary review surface. `/admin/edit/[id]` and `/review` both render the shared
`review/Editor`. Edit, Save (PATCH `blog_posts`), Publish (flip `status`, set
`published_at`, revalidate the section). Auth is `PUBLISH_SECRET`: the `ap_admin` cookie
(constant-time, rate-limited login) or the legacy query token. `GET /api/publish` is
token-only so it is not CSRF-able; `POST /api/publish` takes the cookie and checks origin.

**Write Article** on `/admin` POSTs to `/api/admin/create`, which mints an empty DRAFT and
returns its id, so a new piece is one click into the same composer the engines' drafts land
in. The row gets a **placeholder slug** (`untitled-xxxxxx`, since `blog_posts.slug` is NOT
NULL UNIQUE). `src/lib/slug.ts` owns slugs repo-wide (`slugify`, `isValidSlug`,
`placeholderSlug`, `isPlaceholderSlug`). Three rules are enforced on the server, not only in
the UI: **the URL follows the title** while the slug is still the placeholder and stops the
moment it is edited by hand (an engine draft arrives with a real slug, so it is never
rewritten); **an empty title or body saves but does not publish** (`/api/review/save` allows
it on a DRAFT so autosave can store a half-written piece, `/api/publish` refuses it, and the
editor disables Publish with the reason in its tooltip); and **slug and section are
DRAFT-ONLY**, because a published post owns a live, probably indexed URL. Section and URL
live in a settings drawer (`review/PostSettings.tsx`) driven by `src/lib/editorSections.ts`,
whose `retagForSection` swaps the one section tag and keeps every topical tag. Autosave
records a payload the server REJECTED and will not retry it until the document changes,
which is what stops a taken slug looping a failed save every 2.5 seconds.

### The body is a WYSIWYG surface

`src/app/review/RichText.tsx` is the surface (TipTap/ProseMirror) and
`src/app/review/Figure.tsx` adds captioned images as a real `<figure>`/`<figcaption>`. It
replaced a markdown textarea after an article published with literal `**` in the copy: the
old toolbar wrapped the raw selection, and selecting a line by triple-click carries the
trailing newline, so it wrote `**Heading\n**`, which no parser treats as bold.

**`blog_posts.body_md` is still the source of truth and nothing downstream changed.** The
document loads through `mdToEditorHtml` and is handed back as markdown on every keystroke by
`editorHtmlToMd`, both in `src/lib/editorMarkdown.ts` (marked + turndown, in the browser).
That module carries two rules that each fix a bug readers saw: emphasis is emitted **one
delimited run per line** (a delimiter may not span a line break), and a list item's
TipTap-added wrapper `<p>` is unwrapped so lists stay tight.
**`scripts/checks/editor-roundtrip.mjs` is the gate** and runs in `npm run lint`: loading
and saving a post without typing must render identically, asserted against every row in the
database plus fixtures in both `marked`-shaped and TipTap-shaped HTML.

Formatting works the way Substack's does, and there is deliberately **no persistent format
toolbar**. Markdown INPUT RULES still work, so typing `## ` or `- ` does what it always did.
Five interactions carry it:

1. **The selection bubble** — highlight text, format in place. Bold, italic, strike, link,
   then H2, H3, quote, bulleted and numbered list.
2. **The link popover** — put the caret in a link and its address is there to open, edit, or
   remove. Without it there was no way to see where a link pointed or take it off, because
   the toolbar needs a selection to appear at all.
3. **The slash menu** — `/` on an empty line, anchored to the start of the block so a slash
   inside a sentence never opens it. Aliases: `/h2`, `/h3`, `/ul`, `/ol`, `/hr`, `/img`.
4. **The gutter "+"** — left margin beside an empty line, opening that same menu for someone
   who never learns to type a slash. `md` and up only; there is no margin on a phone.
5. **Paste, drag, and upload** of images to `/api/admin/upload` (the public `post-images`
   bucket, `body/` and `cover/`), inserted as a captionable figure.

Both floating menus flip: the bubble hangs BELOW its text when the sticky header would cover
it, and the slash menu opens upward when it would run off the bottom.

### Editor rules that are load-bearing

- **The link mark is registered non-inclusive** (`Link.extend({ inclusive: () => false })`,
  which is why `@tiptap/extension-link` is a direct dependency and StarterKit's `link` is
  `false`). TipTap ties that flag to `autolink`, so with autolink on, typing after a link
  swallowed the next words into it, permanently and in the saved markdown. Autolink works
  out its own range from the text, so it does not need the flag.
- **Link addresses are allowlisted to http, https, mailto and tel** (plus site-relative and
  in-page), in `toHref`, and `isSafeHref` guards the popover so an unsafe address renders as
  plain text rather than a clickable anchor. This is not theoretical: the no-selection branch
  of `applyLink` writes the mark with `insertContentAt`, which goes AROUND the validation
  TipTap does inside `setLink`, and the popover renders outside the contenteditable where a
  click does fire and React does not sanitize. A rejected address leaves the field open
  rather than being rewritten.
- **The link panel's open flag is a ref, not state.** The URL field autofocuses, which blurs
  ProseMirror, which used to fire the blur handler and tear down the bubble the field lives
  in, so the button opened a panel that unmounted itself in the same React commit and a link
  could never be typed. The handlers must know the field is open during the commit phase,
  before any effect has run.
- **Underline is off** (`underline: false`). Markdown has none, turndown drops the tag and
  keeps the text, so Ctrl+U applied formatting that looked right, survived the save, and was
  simply gone on the next load.
- **Ctrl+K is bound on the window**, not through a TipTap keymap, because it also has to work
  while the URL field outside the editor holds focus. Nothing in TipTap binds it.
- **The editor is built ONCE** (`useEditor(..., [])`). Handing it a fresh options object each
  render re-applies options, which dispatches a transaction, which with the listeners setting
  state rendered again and locked the tab up. Every prop goes through a ref.
- **Menu buttons `preventDefault` on mousedown**, or the editor blurs and collapses the very
  selection the button is about to format. That includes the popover's anchor, or the click
  never lands.

### The rest of the composer

One centered article-width column. Borderless title and subtitle fields that grow with
their content, where **Enter in the title moves to the subtitle and Enter in the subtitle
moves into the body** (RichText hands its editor up through `onReady`), and a brand-new
empty draft opens with the caret in the title. A Write | Preview toggle in the header whose
preview is site-accurate. Autosave for drafts; **a published post saves manually** so an
edit never goes live mid-thought. Ctrl/Cmd+S.

The **cover photo** is a text button until there is a photo, then the exact 2/1 hero crop
with its controls on hover. Upload, drop, or URL, plus an optional credit line, stored in
`cover_image` and `cover_credit`. Images are web-sized in the browser before upload (1600px
for covers, 1400px for body, JPEG q0.82), and the re-encode is kept only when it actually
shrinks the file; GIFs pass through.

**NO AUTO-COVER (August 27, 2026).** Publishing used to stamp a photo from a curated
library on any coverless row and the finalize cron did the same a day later. Both are gone,
along with `editorCover.ts`, `greenvilleCovers.ts`, `greenvilleImage.ts`, the eleven photos
under `public/greenville/library/`, and the monthly workflow that grew them: a piece Alex
has just read through must not go live under a stock photo he never picked. **A cover is his
own upload or nothing**, and an empty slot survives to the live page as `PostCover`'s
placeholder. The `/api/finalize-greenville` cron still broadcasts each published piece to the
owned list exactly once.

Three bugs a real browser pass caught and fixed, all still load-bearing: a wrapped title
clipped under the subtitle (the textarea measured itself before the web font swapped, so it
re-measures on `document.fonts.ready` and on resize); the body placeholder never drew
(TipTap marks the empty node and leaves the CSS to the app, and the rule keyed off
`is-editor-empty:first-child`, the class for an empty DOCUMENT, so every line after the
first drew nothing, and the figure-caption rule looked for the class on `<figcaption>` when
a node decoration lands on the `<figure>`); and Enter in the subtitle not reaching the body
(focus the DOM node FIRST and let the TipTap command only place the caret, since the command
throws on a hot-reloaded instance and killed everything after it, and the tick is a timer,
never `requestAnimationFrame`, which browsers pause in a background tab).

**DARK MODE.** These routes render outside `Nav`/`Footer` and every one of them had
hardcoded `bg-white` / `bg-gray-50` / `text-gray-*`, so they stayed white when the site's
toggle flipped `html.dark`. They now use the same `.theme-*` tokens as the rest of the site,
plus `hover:*-[var(--token)]` arbitrary values where a hover state needed a token Tailwind
cannot reach, and `tone-*` for the DRAFT/PUBLISHED chips and error text. **Do not add a raw
Tailwind gray or `bg-white` back to these files.** Two hardcoded colors are deliberate: the
green Publish button, and the `bg-black/35` scrim over the cover photo (a scrim over a photo
is black in both themes).

**`.editor-pop` in `globals.css` is the shared surface** for the selection bubble, the link
popover, and the block menu: a solid dark pill in light mode, a lifted panel in dark, with
white-alpha hover and active states that read on both. That is the Substack look, and it is
also the answer to a problem this design system creates for itself, since a near-white
popover floating over near-white body copy has nothing to separate it once drop shadows are
banned. Do not "fix" it back to `theme-header`.

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

It is **not** a ban on the publication's own mark. The **coffee-cup-and-house** mark is
drawn once in `src/components/Mark.tsx` (currentColor, sized in `em` so it tracks the fluid
`.wordmark`, doorway cut as a real `fillRule="evenodd"` hole so it needs no background) and
again as a plated asset in `src/app/icon.svg`, with `favicon.ico` and `apple-icon.png`
rasterized from that file. Same drawing, two dresses: the tab carries its own oxblood plate
because that background is not ours, the masthead inherits ink because that one is.
`PostCover`'s no-cover state is a silent ruled plate. Two rule utilities carry structure:
`.rule-masthead` (3px, once per view, under the nameplate) and `.rule-section` (hairline
between same-surface blocks).

### Off-Tailwind surfaces read `src/lib/brand.ts`

Three surfaces cannot reach the CSS custom properties: **email** (`emailTemplates.ts`,
`emailMarkdown.ts`, since clients strip `<style>`, classes, and external CSS), the **share
card** (`app/opengraph-image.tsx`, satori at the edge with no stylesheet), and the
**standalone result pages** (`htmlPage.ts`, used by `/api/subscribe/confirm`,
`/api/unsubscribe`, and the one-click publish link). Each used to hardcode its own palette
and they drifted exactly as you would expect: the newspaper pass moved the site to
oxblood/serif/square and **email kept shipping the retired system for weeks**, so a
subscriber clicking through from a broadcast watched the brand change under them.

`brand.ts` mirrors the `globals.css` tokens as raw values. The light set covers email and
the result pages (neither has a reliable theme signal); a small `*_DARK` set exists for the
share card, which is a deliberately dark surface. **If the palette moves in `globals.css`,
move it in `brand.ts` in the same commit.**

The editorial split and the link rule apply to email too. A broadcast ships the FULL
article, so it is the one email that most needs the reading surface to match: serif body and
headings, sans for eyebrows, buttons, footers, tables, and `figcaption`. Prose links are
**ink with an accent-tinted underline**, not bare accent, the same call `globals.css` makes,
and it matters more here because these pieces carry a dozen citations.
`<figure>`/`<figcaption>` are in sanitize-html's defaults and were passing through
**unstyled**, making a caption indistinguishable from body copy.

**Font stacks in `brand.ts` use SINGLE quotes, and that is load-bearing.** They are
interpolated into `style="..."` attributes; a double-quoted family name closes the attribute
early, the browser discards the whole declaration, and **every** font in the message falls
back to the client default. It looks like a design choice and is invisible in a diff. This
shipped once and was caught only by rendering the email and looking at it.

**`node scripts/brand/preview-email.mjs`** renders every email and result page to HTML you
can open in a browser, with no send and no Resend config. It fails on retired design values
(indigo, `border-radius`, the old greys) and on truncated `font-family` attributes. A
browser flatters email HTML, so confirm anything risky with a real test send
(`/api/broadcast?id=<postId>&test=you@example.com`). `scripts/brand/make-email-mark.mjs`
regenerates `public/email/mark.png`, the hosted mark the nameplate uses, since email clients
do not render inline SVG; the nameplate pairs it with a live type wordmark so it still reads
with images off, which is Outlook's default.

## Images and LCP

**A cover photo is the homepage LCP**, so keep uploads web-sized (max ~1400px, ~300KB,
JPEG q75). The editor's browser-side resizer is the only thing enforcing that now.

`PostCover` routes same-origin AND Supabase-hosted covers through **`next/image`**
(responsive srcset, AVIF/WebP, roughly 50 to 75KB at phone widths instead of the full
file), keeping a plain `<img>` only for other remote hosts such as the Substack CDN, whose
hosts vary and would 400 an un-whitelisted `next/image`. Callers pass `sizes` matching
their layout plus `priority` on whatever is above the fold; the homepage featured card and
the `ArticleView` hero both set it, and the hero is cropped to the same 2/1 box as the
featured card, which reserves layout space and killed the article-load CLS.

Body images in `renderPostHtml` get the same treatment, since editor uploads to Supabase ran
multi-MB: Supabase-hosted `<img>`s are rewritten to `/_next/image` srcsets, the first image
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
  (`/admin`, `/admin/edit/[id]`, and `/review` all do). **Keep the canonical literal in the
  page file**; moving it into a helper defeats the text check.
- **`app/opengraph-image.tsx`** is the edge Satori branded fallback card. It is auto-injected
  on the root and static pages but is **NOT inherited by the `[slug]` article routes**, so
  those must set `openGraph.images`/`twitter.images` themselves or they ship with no share
  thumbnail. All the `[slug]` routes call `articleOgImage(post)` (in `posts.ts`), which
  prefers the post's own lead image and falls back to `/opengraph-image`. Do NOT set
  `openGraph.images` on the root or static pages, where it conflicts with the auto-injected
  file.
- JSON-LD: `WebSite` and `Person` in `layout.tsx`, `Article` and `BreadcrumbList` per piece,
  `FAQPage` on the agents landing page. `sitemap.ts` and `robots.ts` derive from `SITE_URL`.
- `layout.tsx` also renders **`<Analytics />`** (`@vercel/analytics/next`). It is
  **cookieless, stores no PII, and needs no consent banner**, serves first-party from
  `/_vercel/insights`, is a no-op locally, and **requires Web Analytics to be enabled for
  the project in the Vercel dashboard**. Lead attribution is the separate first-party path
  in `referral_leads`.
- **SEO is not the growth bet.** Zero-click search plus AI Overviews killed it as a lever,
  which is why the evergreen guide category is dead. `/best-real-estate-agents-greenville-sc`
  is a conversion landing page, not a revival of it.

## Framework gotchas

- Next.js 16 uses `proxy.ts` (not `middleware.ts`) for middleware. There is currently **no**
  proxy file; the old one only guarded a deleted route. Do not add one back unless a new
  gated route needs it.
- Typed routes: after deleting or renaming a route, a stale `.next/dev/types` can fail the
  type check referencing the old path. `rm -rf .next` and rebuild.
- Supabase reads use `createClient` from `@supabase/supabase-js` with the anon key and RLS.
