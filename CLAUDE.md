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
> `content-two-track-strategy`. Content is moving to **two tracks**: **real-estate pieces as
> vertical proof** (about 2/week, "I can take a technology and go deep on one industry's
> real problems") and **tech deep-dives in Alex's own voice** (1 to 2/week, each on one
> AI/SaaS capability: what it actually does in plain English, the concrete business value in
> a real vertical, and the honest limits). Depth beats volume here, because a hiring manager
> reads two or three pieces, not a feed. The public site copy described below still presents
> the brand as Claude-for-real-estate for now; that RE-facing framing is retained
> deliberately and re-messaging the site is a separate, later call.

> **CURRENT POSITIONING (June 2026): Claude for real-estate agents and investors.** The
> brand is **Claude-only** and aimed at **real-estate professionals**. The site +
> newsletter teach agents and investors how to point Claude at their actual work
> (listings, market research, deal analysis, lead follow-up, marketing), in plain English,
> no code, no hype. "Not active in real estate? A lot of it helps anyone" is the secondary
> promise. The brand single-source-of-truth is **`src/lib/site.ts`** (tagline: *"Claude for
> real estate agents and investors."*). Do **not** reintroduce other tools (ChatGPT,
> Gemini, Perplexity, etc.) into any site/social/OG copy, and do **not** revive the old
> frontier-tech-news framing.

**Alex Prompts** is a personal media brand by Alex Steryous. Alex is a real-estate agent;
the brand helps agents and investors get real work out of Claude, and keeps them current
on how AI is changing their field. It publishes on **Substack (the newsletter and home
base), YouTube, TikTok, and X**. Building an audience and monetizing is the long-term
ambition, but the near-term job is the tech-sales portfolio described in the strategic
direction note above.

**The job has two modes, one audience (agents + investors):**
1. **HOW-TO education** — the site + newsletter's core product. Take a real task from a
   pro's week and walk it step by step inside Claude, slow enough that nothing is assumed.
   "The how-to is the product." This is what `src/lib/site.ts` describes.
2. **RESEARCH + analysis** — answering the hard questions about real estate, development, and
   investment, for the same reader. The Saturday national video + article (`scripts/ai_news/`)
   has Claude research one useful, evergreen question against real public data; the Greenville
   local engine (`scripts/greenville/`) covers the biggest local story, both sides. These make
   the audience smarter; they do not replace the how-to.

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

## The content engines (`scripts/ai_news/` + `scripts/greenville/`)

See `scripts/CLAUDE.md`. **Claude routines only — Gemini was removed.** Two siblings, both
serving real-estate agents and investors:

- **`ai_news/`** — the **national Saturday research engine** (directory name is legacy; no
  longer news). Two committed inputs (`questions.md`, the question bank; `sources.md`, the
  primary-data registry) drive the **Saturday Claude routine** (`scripts/ai_news/routine/`,
  an orchestrator plus isolated Opus passes: researcher → thesis → writer → editor →
  performer → article), which has Claude research one useful, evergreen real-estate question
  against real public data and writes it in two renderings (a 6–10 min voiceover video script
  + a Substack article), delivered to Google Drive and Gmail. No collector: the data APIs are
  not IP-blocked, so the routine fetches live.
- **`greenville/`** — the **local Greenville, SC** engine. A daily routine that turns the
  biggest local real-estate story into a both-sides website post (`/real-estate`) + an X
  post. See `scripts/greenville/CLAUDE.md`.

Both were reoriented from the old frontier-tech-news brand in June 2026; the legacy dental
pipeline is retired under `scripts/_archive/` — do not revive either.

## Site structure

- `/` — **content-first landing.** Slimmed July 2026 to lead with the writing, not a
  brochure: **fresh from Alex Prompts** (featured latest issue + recent, driven by
  `getFeedPosts`) is now the lead section → **tools spotlight** (the live tools, clickable,
  driven by `liveTools()`) → real-estate outcomes (`realEstateOutcomes`) → follow →
  subscribe. The old "Start here" hero/pillars, the "helps anyone" (`outcomes`) grid, the
  "how every guide works" (`principles`) strip, and the manifesto (`what we're about`)
  section were **removed** to cut the monotone and to de-emphasize the "guide for Claude"
  framing while the value prop is still being figured out. Their data still lives in
  `site.ts` (`outcomes`, `principles`, `manifesto`, `tools`) and `principles`/
  `realEstateOutcomes` still render on `/about`; the rest are currently unused but kept for
  reuse. The *Subscribe* CTA still rides along. Content is free, money model is later.
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
- `/about` — who Alex is, the how-to promise (the manifesto in real-estate terms), the
  teaching method, and the name.
- `/archive` + `/archive/[slug]` — issue archive, backed by Supabase `blog_posts`.
  **Auto-mirrored from Substack:** `/api/sync-substack` (daily Vercel cron, `vercel.json`)
  reads the publication RSS feed, converts each post's HTML to markdown via
  `src/lib/substack.ts` (turndown; images kept as `<figure>`/`<figcaption>`), and upserts
  rows as `PUBLISHED`. So posting on Substack populates the site with no manual step.
- `/review` — token-gated draft editor (not in nav). `/api/publish` + `/api/review/save`
  drive the manual publish flow (flip `blog_posts.status` to `PUBLISHED`, revalidate
  `/archive`). Kept for engine-generated drafts; the Substack mirror is the live path.

**`src/lib/site.ts` is the brand single-source-of-truth** (name, author, tagline, oneLiner,
description, social links, and the Claude-for-real-estate teaching content: `tools`,
`principles`, `realEstateOutcomes`, `outcomes`, `manifesto`). Edit handles/domain there and
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
  (Greenville `/real-estate`, `/guides`) that never goes to Substack. `blog_posts.last_broadcast_at`
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
| `NEXT_PUBLIC_SITE_URL` | `https://alexprompts.com` (confirm). Drives canonical/sitemap/robots. |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Safe to expose; RLS controls access. |
| `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` | Service key — never commit. Used by `/api/publish`. |
| `PUBLISH_SECRET` | Shared secret for `/review` + `/api/publish` + `/api/review/save`. |
| `NEXT_PUBLIC_SUBSTACK_URL` | Substack publication base (subdomain or custom domain, NOT the `/@handle` profile). Drives the Subscribe button (`/subscribe`) and the archive RSS mirror (`/feed`). Defaults to `https://alexprompts.substack.com` — confirm. |
| `SUBSTACK_FEED_URL` | Optional override for the feed URL. Defaults to `${NEXT_PUBLIC_SUBSTACK_URL}/feed`. |
| `CRON_SECRET` | Authorizes the Vercel cron calls to **both** `/api/sync-substack` and `/api/finalize-greenville` (Vercel auto-sends it as `Authorization: Bearer …` on any cron whenever this env var is set). You invent the value (any random string); if it is unset the scheduled calls 401 and silently do nothing. Manual runs bypass it with `?token=${PUBLISH_SECRET}`. Production scope only. |
| `GOOGLE_PLACES_API_KEY` | Server-only key for the `/tools/area-scan` tool **only**. Uses **Places API (New) only** — Text Search (geocode the address) + Nearby Search (counts) + Autocomplete, so no separate Geocoding API setup is needed. Restrict this key to Places API (New) in the console. Never exposed to the client. **Unset = the tool renders a clean "not configured" state**, so the site runs fine without it. Set hard per-API daily QUOTAs (`SearchTextRequest`, `SearchNearbyRequest`, `AutocompletePlacesRequest`) below the free tier — that quota, not the code, is what prevents any invoice. **This is a SEPARATE key from `GOOGLE_MAPS_KEY`** (below); the two are split so each is quota-capped to just the APIs it needs. |
| `GOOGLE_MAPS_KEY` | Server-only key for the **Greenville cover renderer** (`src/lib/greenvilleImage.ts`, run from the `/api/finalize-greenville` cron). Uses three classic Maps Platform APIs: **Geocoding**, **Maps Static**, and **Street View Static** — enable exactly those on this key and restrict it to them. Intentionally SEPARATE from `GOOGLE_PLACES_API_KEY` so billing is capped per-key. Read order in code is `GOOGLE_MAPS_KEY` → `GOOGLE_MAPS_API_KEY` → `GOOGLE_PLACES_API_KEY` (the last is a single-key fallback; do not rely on it, since a Places-restricted key returns `REQUEST_DENIED` for these three APIs). **Unset = covers stay null** (finalize reports "renderer not configured"); the post still publishes and broadcasts. Set hard per-API daily quotas below the free tier. |
| `AREA_SCAN_DAILY_CAP` / `AREA_SCAN_RATE_LIMIT` | Optional. Soft, in-memory backstops in `src/lib/areaScan.ts` (default 250 Google calls/day, 6 scans/min/IP). Best-effort on serverless (reset on cold start); the console quota is the real cap. |
| `CENSUS_API_KEY` | **Required for the area-scan "neighborhood profile."** The Census *data* API needs a free key (the geocoder does not); without it the profile degrades to hidden (the rest of the scan still works). The key is free with no billing account, so the zero-billing guarantee holds. Sign up: https://api.census.gov/data/key_signup.html |
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
