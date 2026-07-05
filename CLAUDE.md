# Alex Prompts

This file is loaded everywhere. Domain-specific context is in nested `CLAUDE.md` files:
- **`src/CLAUDE.md`** — frontend tech stack, project-structure couplings, design system, SEO.
- **`scripts/CLAUDE.md`** — the Python content engines: the national AI-for-real-estate
  signal collector + Saturday script routine (`ai_news/`) and the Greenville local
  real-estate engine (`greenville/`).
- **`BRAND.md`** — the StoryBrand BrandScript (villain = the noise, hero = the reader, guide
  = Alex). Drives all *positioning* copy (site, welcome email, bios, CTAs). Stays OUT of the
  truth-seeking writer method by design.

## What this is

> **STRATEGIC DIRECTION (July 2026): this site is Alex's tech-sales portfolio first.** Its
> real job is proof-of-work that lands Alex a SaaS / tech-sales role: evidence that a
> non-engineer salesperson genuinely understands AI and can ship with it. The audience that
> matters most is a **hiring manager**, not a real-estate lead; the tools and articles are
> that evidence, not a real-estate business. See memory `alexprompts-portfolio-pivot` and
> `content-two-track-strategy`. Content runs on **two tracks**: **real-estate pieces as
> vertical proof** (about 2/week, "I can take a technology and go deep on one industry's
> real problems") and **Greenville Works, first-person deep-dives in Alex's own voice** (1 to
> 2/week; renamed from the national "Lab" tech track in July 2026). Each takes ONE thing
> reshaping Greenville and the Upstate apart (development, roads, infrastructure, utilities,
> manufacturing, data centers, population growth, government decisions, and technology when it
> touches the Upstate), explains how it works in plain English, shows what it means for where
> we live, work, and invest, and names the honest trade-offs. Refocusing the tech track from
> national to local unifies the site around one promise, wins winnable local SEO, and funnels
> referral leads, while still proving Alex can take a real system apart and translate it into
> business value. Depth beats volume here, because a hiring manager
> reads two or three pieces, not a feed. The public site copy described below still presents
> the brand as Claude-for-real-estate for now; that RE-facing framing is retained
> deliberately and re-messaging the site is a separate, later call.

> **CURRENT POSITIONING (July 2026): Alex Steryous's personal site.** The old "Claude for
> real-estate agents and investors" teaching framing (the "voice 3" how-to product) was
> **removed in July 2026**. The site is now Alex's personal place with two kinds of content,
> honest plain-English writing on **Greenville real estate** and on **how the Upstate is
> changing** (Greenville Works), plus the free **real-estate tools** he built. It serves two real goals:
> a **build-in-public portfolio** that showcases Alex to hiring managers (see `/about`), and
> a **referral connector** that captures buyer/seller leads to hand to vetted agents (see
> `/find-an-agent`). The brand single-source-of-truth is **`src/lib/site.ts`** (tagline:
> *"Real estate and technology, in plain English."*). Do **not** reintroduce the
> single-tool, how-to-use-Claude teaching positioning, and do **not** revive the old
> frontier-tech-news framing. See memory `alexprompts-portfolio-pivot`,
> `content-two-track-strategy`, and `greenville-evergreen-seo-track`.

**Alex Prompts** is a personal media brand by Alex Steryous. It publishes on **Substack (the
newsletter and home base), YouTube, TikTok, and X**. The near-term job is the tech-sales
portfolio described in the strategic direction note above; building an audience and a referral
lead stream are the longer-term goals.

**The content is RESEARCH + analysis, not how-to.** (The old third mode, "HOW-TO education"
that taught agents to point Claude at their work, was the removed voice 3; do not bring it
back.) The two live tracks are the real-estate vertical proof and the Greenville Works local-change track:
1. **RESEARCH + analysis** — answering the hard questions about real estate, development, and
   investment, for the same reader. The Saturday national video + article (`scripts/ai_news/`)
   has Claude research one useful, evergreen question against real public data; the Greenville
   local engine (`scripts/greenville/`) writes evergreen local-SEO guides to winnable long-tail
   queries (its old both-sides news track was retired July 2026). These make the audience
   smarter; they do not replace the how-to.

**The name is a double meaning:** the *AI prompts*, and *prompting real discussion*. Every
piece (article, video, TikTok, X post) exists to stimulate discussion. It asks a simple
question that turns out to be hard, the kind that gets opinionated people to say what they
actually think.

### Editorial framework (the POV behind the RESEARCH + analysis content)

This is the method for the analysis pieces (the Saturday national research engine and the
Greenville local news engine). The how-to teaching approach for the site + newsletter is a
SEPARATE thing and lives in `src/lib/site.ts` `principles` (start from a real outcome,
assume nothing, skip the hype, leave you able to do it again). Do not conflate the two.

The **Saturday research method** (`scripts/ai_news/`), in order:
1. **Pick a real question** — one useful, evergreen, decision-relevant question, anchored in
   a real place or decision (Greenville, North Main, a real asset class).
2. **Research it with real data** — pull primary public sources (Census, FRED, FHFA, Zillow,
   county records, peer-reviewed studies); state every figure with its source and caveat.
3. **Hunt the confounder** — never read a correlation as a cause; name the selection effects
   and what a clean answer would require; separate confirmed from contested from unknown.
4. **A grounded take, then a prompt** — a clear, calibrated read (NOT investment, legal, or
   financial advice) plus the concrete practitioner takeaway, then the hard question worth
   arguing about.

The **Greenville news method** (`scripts/greenville/`), in order: inform clearly (what
happened, plain English, no hype/doom); read the builders, then pressure-test; steelman the
skeptic; a grounded take, then the prompt.

The stance, stated honestly:
- **Contrarian / Thiel-esque:** the crowd, including real-estate and tech media, swings
  between "AI makes agents obsolete" doom and "it's a fad" dismissal, and is confidently
  wrong often enough that the consensus is worth doubting. The house lean is that AI
  *reshapes and raises the bar* for the agent's and investor's work rather than ending it,
  and the pros who adopt it win. Held loosely and always paired with the steelman.
- **Held in honest tension.** Take the strongest "agents are obsolete" case seriously
  (iBuyers, AI valuation, direct-to-consumer tools), never wave it off. Resolve it by
  asking a better question (obsolete for which task, on what timeline, replaced by whom),
  not by cheering or panicking.
- Grounded optimism, never blind optimism. The hard parts are real and named.

### Brand strategy (the model the site is built around)

- **Short-form video is the discovery engine** (TikTok / YouTube Shorts / Reels / X).
  The **newsletter is the capture** (Substack). The website is the **home base**: it
  converts a curious viewer into a follower and an email subscriber, and hosts the
  issue archive.
- **The site optimizes for audience growth first** — the dominant CTA is *Subscribe*
  (email is the owned asset), with *Follow* secondary. Not paid subscriptions or
  sponsorships yet; those come once there is an audience.
- **Substack stays the newsletter home.** Issues are written/sent there. The site
  *mirrors* them into `/archive` for credibility and a controllable link. **SEO is a
  passive bonus, not the bet** — a new domain will not out-rank TechCrunch/The Verge on
  news queries for a long time, so we do not optimize hard for it. (If we ever want the
  site to be the SEO source of truth, add a `canonical_url` column to `blog_posts` and
  point article canonicals at the site instead of Substack.)

## Voice (mirror of `scripts/ai_news` prompts — keep in sync)

The canonical voice lives in the Claude routine's writer pass
(`scripts/ai_news/routine/pass3_writer.md`). Site copy must match it:

- **No em dashes or en dashes, ever.** Use periods, commas, or restructure. (The routine
  enforces this in its passes; the website has no automated backstop, so do not introduce
  dashes in copy.)
- **No sentence fragments.** Every sentence has a subject and a verb, never a clipped burst for effect.
- **Flowing, complete sentences**, the way a person explains something out loud. Vary sentence length naturally. Clarity carries the weight, not punchiness or staccato.
- **Use colons sparingly.** Avoid the colon-as-drumroll and the "Label: payoff" construction; a colon only introduces a genuine list. Restructure into a full sentence where you can.
- Open cold and concrete. Lead with a fact, a scene, or a number.
- Plain English. Translate any jargon in one sentence a smart 15-year-old understands.
- **Grounded optimism.** Steelman the strongest opposing view before resolving.
- Banned fluff: "in an unprecedented move," "sent ripples," "the AI landscape,"
  "game-changer," "a new era," etc.

## The content engines (`scripts/ai_news/` + `scripts/greenville/` + `scripts/tech/`)

See `scripts/CLAUDE.md`. **Claude routines only — Gemini was removed.** Three engines: the
two real-estate siblings (the vertical-proof track) plus Greenville Works (the local-change track). See the
strategic-direction and two-track notes above.

- **`ai_news/`** — the **national Saturday research engine** (directory name is legacy; no
  longer news). Two committed inputs (`questions.md`, the question bank; `sources.md`, the
  primary-data registry) drive the **Saturday Claude routine** (`scripts/ai_news/routine/`,
  an orchestrator plus isolated Opus passes: researcher → thesis → writer → editor →
  performer → article), which has Claude research one useful, evergreen real-estate question
  against real public data and writes it in two renderings (a 6–10 min voiceover video script
  + a Substack article), delivered to Google Drive and Gmail. No collector: the data APIs are
  not IP-blocked, so the routine fetches live. **Objective third-person voice.**
- **`greenville/`** — the **local Greenville, SC** engine. A nightly **self-sourcing evergreen
  local-SEO** engine: each eligible night (about two a week) it writes one substantial,
  data-grounded local guide (`/real-estate`) + an X post, targeting a winnable long-tail local
  query and funneling relocation/buyer leads to `/find-an-agent`. It prefers the optional
  `greenville/topics.md` bank and scouts its own topic with web search (`pass0_scout.md`,
  mirroring Greenville Works) when the bank is empty. The old daily both-sides **news** track was retired
  July 2026 (its passes + Google-News collector remain in the repo, unwired, so it is
  reversible); the separate `commercial.py` collector for the buyers-list stays live. See
  `scripts/greenville/CLAUDE.md`.
- **`tech/`** — the **Greenville Works engine** (the local-change track; renamed from the
  national "Lab" tech track in July 2026, directory kept as `tech/`). No collector; it is
  **self-sourcing**: an optional steering bank (`tech/topics.md`, Alex seeds `queued` topics)
  plus a web-search scout (`pass0_scout.md`) that picks its own topic when the bank is empty,
  so it runs autonomously without going dry. Routine (`tech/routine/`, orchestrator plus
  isolated passes: scout → researcher → angle → writer → editor) takes ONE thing reshaping
  Greenville and the Upstate apart (a road, a subdivision, a data center, a factory, the grid,
  fiber, water capacity, a government decision, and the technology behind local change) in
  **Alex's own first-person voice**, grounds it with web search, names the honest trade-offs,
  and funnels relocation/buyer leads to `/find-an-agent` where the topic fits, then publishes a
  `blog_posts` row tagged `greenville works` **live** to **`/greenville-works`** (autonomous,
  same as the Greenville engine; a verify email still goes out for after-the-fact spot-check,
  and a run falls back to DRAFT only if dedup was unavailable). Its job is twofold: unify the
  site around one local promise (better SEO and referral leads) and still prove Alex can take a
  real system apart and translate it into what it means for a business. Target cadence 1–2/week.
  See `scripts/tech/routine/README.md`.

The two RE engines were reoriented from the old frontier-tech-news brand in June 2026; the
Lab was added July 2026 for the portfolio pivot, then refocused into Greenville Works later in
July 2026 to unify the site around the local vertical. The legacy dental pipeline is retired
under `scripts/_archive/` — do not revive it.

## Site structure

- `/` — **content-first landing.** Leads with the writing, not a brochure: **fresh from
  Alex Prompts** (featured latest issue + recent, driven by `getFeedPosts`) is the lead
  section → **tools spotlight** (the live tools, clickable, driven by `liveTools()`) →
  follow → subscribe. The old "Start here" hero/pillars, the "helps anyone" grid, the "how
  every guide works" strip, the manifesto, and the "what you'll do with Claude"
  (`realEstateOutcomes`) grid were all **removed** (the last one in July 2026 with the voice-3
  removal). The teaching-content exports they used (`tools`, `principles`, `realEstateOutcomes`,
  `outcomes`, `manifesto`) were **deleted from `site.ts`**; do not reintroduce them. The
  *Subscribe* CTA still rides along. Content is free, money model is later.
- `/tools` + `/tools/<slug>` — **free, no-sign-up tools for the audience**, the single
  source being `src/lib/tools.ts` (`toolCatalog`). Live: `deal-analyzer` (rental cash
  flow / cap rate / cash-on-cash), `mortgage` (payment + affordability), `listing-prompt`
  (builds a fair-housing-safe Claude prompt, copy + "Open in Claude" deep link). Those
  three are pure client-side, no API, no cost. `buyers-list` (Greenville County commercial
  sales: buyer/LLC, price, date, address) is also live: it reads a committed JSON dataset
  (`src/data/commercialSales.json`) built by `scripts/greenville/commercial.py` from the
  county's free public ArcGIS service, so the page is statically generated with no runtime
  API or cost either. `area-scan` (Google Places neighborhood/saturation)
  is registered as `soon` — Tier 2, needs a server proxy + caching + rate limits before it
  ships. Every tool page wraps in `components/ToolShell.tsx` (header + honest not-advice
  note + soft subscribe capture). The registry feeds the hub, the homepage spotlight, nav,
  footer, and sitemap, so a tool ships in one place and appears everywhere.
- `/about` — the **hiring-manager front door** (link resumes/LinkedIn straight here, not to
  `/`). Who Alex is (salesperson, ~8 yrs BD/sales, aiming back into tech sales), why he built
  the site, an "Under the hood" technical teardown of how the site works (self-publishing AI
  agents, the double-opt-in email system, the tools + auto-rendered covers, built solo inside
  free tiers) framed as proof he is a self-taught builder who genuinely enjoys tech, then a
  LinkedIn + email connect CTA. Fully custom copy (no longer renders `site.ts` teaching
  exports). Serves everyone, not only hiring managers, so it never literally addresses them.
- `/greenville-works` + `/greenville-works/[slug]` — **Greenville Works**, the local-change
  track (added July 2026 as the "Lab" for the portfolio pivot, then renamed and refocused
  from national tech to Greenville-local later that month). First-person deep-dives that take
  ONE thing reshaping the Upstate apart (development, roads, infrastructure, utilities,
  manufacturing, data centers, population growth, government decisions, and technology when it
  touches Greenville), explain how it works, show what it means for where we live, work, and
  invest, and name the honest trade-offs. Backed by Supabase `blog_posts` tagged
  `greenville works` (a tag-routed section in `src/lib/posts.ts` `sectionOf`, internal
  `PostType` key `works`, distinct from the `greenville` real-estate tag), published **live**
  (autonomous) by the `scripts/tech/` routine, with a verify email for after-the-fact
  spot-check and unpublish at `/review`. The `/api/finalize-greenville` cron finalizes these
  posts too: it fills the article **cover photo** from the same curated Greenville library the
  `/real-estate` pieces use (the writer names a `subject:`, stored in `image_address`; no API key,
  no cost) and **broadcasts the piece to the owned email list** exactly once. The curated photo
  shows as the article hero, an index thumbnail (`PostCover`, with the branded `>` placeholder
  when a cover is still pending), the homepage feed card, and the share/OG card. The `getFeedPosts`
  homepage stream includes Greenville Works posts.
- `/find-an-agent` — the **real-estate referral connector** (added July 2026, replaced the
  removed `/guides`; briefly shipped as a `/for-sale` listings tab, reshaped once the goal
  became clear). Alex is a licensed SC agent but has a full-time job and does NOT practice, so
  the play is to capture legit buyer/seller intent and **refer it to active agents for a
  referral fee** (referrals are not local: relocation leads to any market count, which fits the
  national Alex Prompts audience). Deliberately NOT a listings page: a new domain cannot
  out-rank the portals on listing searches, and Alex cannot service clients. The page is
  honest connector copy (Greenville + relocating anywhere) plus an email **capture**
  (`SubscribeForm`, `source="agent-referral"`) that Alex follows up on and hands to a vetted
  agent. Static, not Supabase-backed, low-maintenance by design. Keep it light: the site's #1
  job is the tech-sales portfolio, referrals are a side stream. (The eXp BoldTrail IDX site
  Alex set up is not used here; if he goes referral-only to save active dues he loses it, and
  this model does not need it.)
- `/archive` + `/archive/[slug]` — issue archive, backed by Supabase `blog_posts`.
  **Auto-mirrored from Substack:** `/api/sync-substack` (daily Vercel cron, `vercel.json`)
  reads the publication RSS feed, converts each post's HTML to markdown via
  `src/lib/substack.ts` (turndown; images kept as `<figure>`/`<figcaption>`), and upserts
  rows as `PUBLISHED`. So posting on Substack populates the site with no manual step.
- `/review` — token-gated draft editor (not in nav). `/api/publish` + `/api/review/save`
  drive the manual publish flow (flip `blog_posts.status` to `PUBLISHED`, revalidate
  `/archive`). Kept for engine-generated drafts; the Substack mirror is the live path.

**`src/lib/site.ts` is the brand single-source-of-truth** (name, author, tagline, oneLiner,
description, email, url, `socials`, `newsletterUrl`). The Claude-for-real-estate teaching
exports (`tools`, `principles`, `realEstateOutcomes`, `outcomes`, `manifesto`) were **deleted
in July 2026** with the voice-3 removal; do not reintroduce them. Edit handles/domain there and
nav/footer/JSON-LD/sitemap update together. One `TODO(alex)` remains: confirm the contact
email.

## Supabase

- Env: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public, RLS-guarded).
  `SUPABASE_SERVICE_KEY` for the publish route, the Substack sync, and the owned email list.
- **`subscribers`** is the **owned email list** (the asset we control, separate from
  Substack). Service-key only (RLS denies anon). Double opt-in: a signup is `pending` with
  a `confirm_token`, the email link flips it to `confirmed`, and only confirmed rows get
  broadcasts. `unsub_token` is the per-recipient unsubscribe token. Driven by
  `src/lib/subscribers.ts` + `/api/subscribe`, `/api/subscribe/confirm`, `/api/unsubscribe`.
  Sending is `/api/broadcast?id=<postId>` (Resend via `src/lib/email.ts`), authed with
  `PUBLISH_SECRET` via an `Authorization: Bearer` header (preferred) or `?token=` for a manual
  click, and it emails a published post to the list. This is the channel for **site-only content**
  (Greenville `/real-estate`, Greenville Works `/greenville-works`) that never goes to Substack. `blog_posts.last_broadcast_at`
  stamps a sent post so a re-trigger does not double-send (override with `&force=1`). The
  on-site capture is `components/SubscribeForm.tsx` (in `ToolShell` + `ArticleView`); Substack
  stays available as a secondary link. **Requires the `subscribers` table + `last_broadcast_at`
  column from `supabase/schema.sql` to be applied.**
- **`blog_posts`** is the only content table the site uses. Columns used: `id`, `title`,
  `slug`, `summary`, `body_md`, `cover_image`, `tags`, `status` (`DRAFT`/`PUBLISHED`),
  `published_at`, `created_at`, `author`. Public SELECT via RLS on `status = PUBLISHED`.
  `cover_image` holds the post card hero (set during the Substack sync from the RSS
  `<enclosure>`); reads fall back to the first body image when it is null, so the site
  works even before the column is added. The dental
  `cluster` column is ignored (taxonomy dropped); other dental tables
  (`market_signals`, `enriched_leads`, `website_prospects`, `clients`) are leftovers from
  the old project — unused by this site.

## Environment Variables

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://www.alexprompts.com` — **www is canonical** (the apex 308-redirects to www at Vercel; www is the real serving host). Drives canonical/sitemap/robots/OG. If this env var is set in Vercel it must be the www URL (or unset, to use the code default). |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Safe to expose; RLS controls access. |
| `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` | Service key — never commit. Used by `/api/publish`. |
| `PUBLISH_SECRET` | Shared secret for `/review` + `/api/publish` + `/api/review/save`. |
| `NEXT_PUBLIC_SUBSTACK_URL` | Substack publication base (subdomain or custom domain, NOT the `/@handle` profile). Drives the Subscribe button (`/subscribe`) and the archive RSS mirror (`/feed`). Defaults to `https://alexprompts.substack.com` — confirm. |
| `SUBSTACK_FEED_URL` | Optional override for the feed URL. Defaults to `${NEXT_PUBLIC_SUBSTACK_URL}/feed`. |
| `CRON_SECRET` | Authorizes the Vercel cron calls to **both** `/api/sync-substack` and `/api/finalize-greenville` (Vercel auto-sends it as `Authorization: Bearer …` on any cron whenever this env var is set). You invent the value (any random string); if it is unset the scheduled calls 401 and silently do nothing. Manual runs bypass it with `?token=${PUBLISH_SECRET}`. Production scope only. |
| `GOOGLE_PLACES_API_KEY` | Server-only key for the `/tools/area-scan` tool **only**. Uses **Places API (New) only** — Text Search (geocode the address) + Nearby Search (counts) + Autocomplete, so no separate Geocoding API setup is needed. Restrict this key to Places API (New) in the console. Never exposed to the client. **Unset = the tool renders a clean "not configured" state**, so the site runs fine without it. Set hard per-API daily QUOTAs (`SearchTextRequest`, `SearchNearbyRequest`, `AutocompletePlacesRequest`) below the free tier — that quota, not the code, is what prevents any invoice. **This is a SEPARATE key from `GOOGLE_MAPS_KEY`** (below); the two are split so each is quota-capped to just the APIs it needs. |
| `GOOGLE_MAPS_KEY` | Server-only key for the **Greenville cover FALLBACK only** (`src/lib/greenvilleImage.ts`, run from the `/api/finalize-greenville` cron). Greenville covers now come from a **curated, committed photo library** (`src/lib/greenvilleCovers.ts` + `public/greenville/library/`) that needs NO key, so this Google path effectively never runs for a Greenville piece (it only fires for a non-Greenville pin). When it does, it uses three classic Maps Platform APIs: **Geocoding**, **Maps Static**, and **Street View Static** — enable exactly those on this key and restrict it to them. Intentionally SEPARATE from `GOOGLE_PLACES_API_KEY` so billing is capped per-key. Read order in code is `GOOGLE_MAPS_KEY` → `GOOGLE_MAPS_API_KEY` → `GOOGLE_PLACES_API_KEY`. **Unset is fine**: curated-library covers still work; only the (rare) off-map fallback is skipped, and the post still publishes and broadcasts. Set hard per-API daily quotas below the free tier. |
| `AREA_SCAN_DAILY_CAP` / `AREA_SCAN_RATE_LIMIT` | Optional. Soft, in-memory backstops in `src/lib/areaScan.ts` (default 250 Google calls/day, 6 scans/min/IP). Best-effort on serverless (reset on cold start); the console quota is the real cap. |
| `CENSUS_API_KEY` | **Required for the area-scan "neighborhood profile."** The Census *data* API needs a free key (the geocoder does not); without it the profile degrades to hidden (the rest of the scan still works). The key is free with no billing account, so the zero-billing guarantee holds. Sign up: https://api.census.gov/data/key_signup.html |
| `ANTHROPIC_API_KEY` | **OPTIONAL, and off by default.** The monthly Greenville cover-library grower (`scripts/greenville/cover_ingest.py`, run from `.github/workflows/greenville-covers.yml`) runs **free** with `--no-vision` and needs no key: it proposes license-clean, landscape, high-res Wikimedia Commons candidates in a PR, and the human review is the quality gate. Set this repo secret and drop `--no-vision` **only** if you want a cheap Claude Haiku **vision** pre-filter to score candidates first. That path is metered API usage (a few cents per run), so it is intentionally opt-in to preserve the site's zero-billing guarantee. Never used by the site at runtime. |
| `RESEND_API_KEY` | Server-only key for the **owned email list** (`src/lib/email.ts`). Powers the double opt-in confirmation and the `/api/broadcast` sends. **Unset = capture still works** (subscribers are stored) but no email goes out, and `/api/subscribe` returns `note: "email_not_configured"`. Resend's sending domain must be verified by DNS before mail actually delivers; free tier ~100 emails/day, 2 req/s. |
| `EMAIL_FROM` | The verified sender for owned-list email, e.g. `Alex Prompts <alex@alexprompts.com>`. Required alongside `RESEND_API_KEY` for sending. **Legacy alias `MAIL_FROM` is also accepted** (`EMAIL_FROM` wins if both are set) — some deploy envs still use the old `MAIL_FROM` name; prefer `EMAIL_FROM` for new setup. |
| `EMAIL_REPLY_TO` | Optional reply-to address for owned-list email. |
| `SUBSCRIBE_RATE_LIMIT` | Optional. Per-IP signups/hour allowed on `/api/subscribe` (default 5). Plus a hardcoded per-address cap of 3 confirmation sends/hour. Soft, in-memory (`src/lib/rateLimit.ts`, resets on cold start); blunts signup spam and confirmation-email bombing. |

> The dental scraper vars (`ROD_*`, `PDL_API_KEY`, `TESSERACT_CMD`, etc.) belong only
> to `scripts/_archive/` and are not needed to run this site or the `ai_news` engine.
> (`GOOGLE_PLACES_API_KEY` is now also used by the site's area-scan tool, above; the
> retired archive used the same name for its own Places scraping.)

## Deployment

- **Platform:** Vercel (Hobby), auto-deploy on push to `main`.
- **Repo:** https://github.com/jsteryous/alexprompts (renamed from `rebbadvisors-website`; the old URL still redirects).
- **Production:** alexprompts.com (confirm DNS).

```bash
npm run dev | npm run build | npm run lint | npx vercel --prod
```
