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
base), YouTube, TikTok, and X**; the goal is to build an audience and monetize on the
internet.

**The job has two modes, one audience (agents + investors):**
1. **HOW-TO education** — the site + newsletter's core product. Take a real task from a
   pro's week and walk it step by step inside Claude, slow enough that nothing is assumed.
   "The how-to is the product." This is what `src/lib/site.ts` describes.
2. **NEWS + analysis** — how AI is changing real estate, for the same reader. The Saturday
   national video + article (`scripts/ai_news/`) and the Greenville local engine
   (`scripts/greenville/`). These keep the audience current; they do not replace the how-to.

**The name is a double meaning:** the *AI prompts*, and *prompting real discussion*. Every
piece (article, video, TikTok, X post) exists to stimulate discussion. It asks a simple
question that turns out to be hard, the kind that gets opinionated people to say what they
actually think.

### Editorial framework (the POV behind the NEWS/analysis content)

This is the method for the news/analysis pieces (the Saturday national engine and the
Greenville local engine). The how-to teaching approach for the site + newsletter is a
SEPARATE thing and lives in `src/lib/site.ts` `principles` (start from a real outcome,
assume nothing, skip the hype, leave you able to do it again). Do not conflate the two.

The news method, in order:
1. **Inform clearly** — what actually happened, plain English, no hype/doom.
2. **Read the builders** — take the people building the tools at their word, then
   pressure-test it. Start from what the companies actually shipped and said.
3. **Steelman the skeptic** — the strongest version of the other side, argued honestly
   before landing anywhere.
4. **A grounded take, then a prompt** — a clear, logical read (NOT investment, legal, or
   financial advice), then the hard question worth arguing about.

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
- **No sentence fragments.** Every sentence has a subject and a verb.
- Punch comes from short sentences and strong verbs, not dashes or fragments.
- Open cold and concrete. Lead with a fact, a scene, or a number.
- Plain English. Translate any jargon in one sentence a smart 15-year-old understands.
- **Grounded optimism.** Steelman the strongest opposing view before resolving.
- Banned fluff: "in an unprecedented move," "sent ripples," "the AI landscape,"
  "game-changer," "a new era," etc.

## The content engines (`scripts/ai_news/` + `scripts/greenville/`)

See `scripts/CLAUDE.md`. **Claude routines only — Gemini was removed.** Two siblings, both
serving real-estate agents and investors:

- **`ai_news/`** — the **national AI-for-real-estate** engine. A GitHub Action
  (`collect-signal.yml`) scores the week's signal across AI-x-real-estate beats
  (`collect.py` + `digest.py`) and commits it; the **Saturday Claude routine**
  (`scripts/ai_news/routine/`, an orchestrator plus isolated Opus passes) reads it and
  writes one story in two renderings (a 6–10 min voiceover video script + a Substack
  article), delivered to Google Drive and Gmail.
- **`greenville/`** — the **local Greenville, SC** engine. A daily routine that turns the
  biggest local real-estate story into a both-sides website post (`/real-estate`) + an X
  post. See `scripts/greenville/CLAUDE.md`.

Both were reoriented from the old frontier-tech-news brand in June 2026; the legacy dental
pipeline is retired under `scripts/_archive/` — do not revive either.

## Site structure

- `/` — **utility-first landing.** Reordered June 2026 to "get into it immediately":
  hero → **Start here** pillars (Tools / Guides / Local) → **tools spotlight** (the live
  tools, clickable, driven by `liveTools()`) → **fresh from the newsletter** (latest issue
  + recent) → real-estate outcomes (`realEstateOutcomes`) → "helps anyone" (`outcomes`) →
  how every guide works (`principles`) → manifesto → follow → subscribe. Utility leads,
  the *Subscribe* CTA still rides along (utility is the hook, email is the catch). Content
  is free, money model is later.
- `/tools` + `/tools/<slug>` — **free, no-sign-up tools for the audience**, the single
  source being `src/lib/tools.ts` (`toolCatalog`). Live: `deal-analyzer` (rental cash
  flow / cap rate / cash-on-cash), `mortgage` (payment + affordability), `listing-prompt`
  (builds a fair-housing-safe Claude prompt, copy + "Open in Claude" deep link). All are
  pure client-side, no API, no cost. `area-scan` (Google Places neighborhood/saturation)
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
  `SUPABASE_SERVICE_KEY` for the publish route only.
- **`blog_posts`** is the only table the site uses now. Columns used: `id`, `title`,
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
| `CRON_SECRET` | Authorizes the Vercel cron call to `/api/sync-substack` (sent as `Authorization: Bearer …`). Manual runs use `?token=${PUBLISH_SECRET}`. |
| `GOOGLE_PLACES_API_KEY` | Server-only key for the `/tools/area-scan` tool (Geocoding API + Places API New). Never exposed to the client. **Unset = the tool renders a clean "not configured" state**, so the site runs fine without it. Set a hard per-API daily QUOTA in Google Cloud Console below the free tier — that quota, not the code, is what prevents any invoice. |
| `AREA_SCAN_DAILY_CAP` / `AREA_SCAN_RATE_LIMIT` | Optional. Soft, in-memory backstops in `src/lib/areaScan.ts` (default 250 Google calls/day, 6 scans/min/IP). Best-effort on serverless (reset on cold start); the console quota is the real cap. |

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
