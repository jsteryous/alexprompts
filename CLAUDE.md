# Alex Prompts

This file is loaded everywhere. Domain-specific context is in nested `CLAUDE.md` files:
- **`src/CLAUDE.md`** — frontend tech stack, project-structure couplings, design system, SEO.
- **`scripts/CLAUDE.md`** — the Python content engine (`ai_news/`): newsletter + short-form scripts.
- **`BRAND.md`** — the StoryBrand BrandScript (villain = the noise, hero = the reader, guide
  = Alex). Drives all *positioning* copy (site, welcome email, bios, CTAs). Stays OUT of the
  truth-seeking writer method by design.

## What this is

**Alex Prompts** is a personal media brand by Alex Steryous covering the companies
building the future: the frontier AI labs and hard-tech companies (Anthropic, OpenAI,
Google DeepMind, xAI, Meta AI, Nvidia, Tesla, SpaceX, Neuralink, and others actually
moving the frontier). It publishes on **TikTok, YouTube, X, and Substack**; the goal is
to build an audience and monetize on the internet.

**The job:** ingest the week's highest-signal frontier-tech news, translate the facts
into plain English, separate confirmed facts from claims, and lay out the trajectory we
are on. Optimistic about technology and people, honest about the hard parts.

**The name is a double meaning:** the *AI prompts*, and *prompting real discussion*. Every
piece (article, video, TikTok, X post) exists to stimulate discussion. It asks a simple
question that turns out to be hard, the kind that gets opinionated people to say what they
actually think.

### Editorial framework (the brand's POV — drives all copy)

The method, in order (mirrored in `src/lib/site.ts` `principles` and the homepage):
1. **Inform clearly** — what actually happened, plain English, no hype/doom.
2. **Read the builders** — take the people building the future at their word, then
   pressure-test it. "The easiest way to predict the future is to build it," so start from
   what the builders are actually saying.
3. **Steelman the skeptic** — the strongest version of the other side, argued honestly
   before landing anywhere.
4. **A grounded take, then a prompt** — a clear, logical read (NOT investment advice), then
   the hard question worth arguing about.

The stance, stated honestly:
- **Contrarian / Thiel-esque:** the crowd, especially legacy media, is confidently wrong
  often enough that the consensus is worth doubting. The house lean on AI-and-jobs is that
  groundbreaking tech *creates* new work, new industries, stronger economies, rather than
  ending work. Held loosely and always paired with the steelman.
- **Held in honest tension with the builders.** This lean runs into Musk ("work will be
  optional") and Amodei (job-loss warnings). Do not resolve that by cheering or panicking.
  Resolve it by asking a better question (optional for whom, on what timeline, paid how).
  Take builders seriously, never as settled.
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

The canonical voice lives in `scripts/ai_news/digest.py` (`WRITER_PROMPT`) and
`shorts.py`. Site copy must match it:

- **No em dashes or en dashes, ever.** Use periods, commas, or restructure. (`digest.py`
  has a `strip_em_dashes()` backstop because models ignore the rule — the website has no
  such backstop, so do not introduce dashes in copy.)
- **No sentence fragments.** Every sentence has a subject and a verb.
- Punch comes from short sentences and strong verbs, not dashes or fragments.
- Open cold and concrete. Lead with a fact, a scene, or a number.
- Plain English. Translate any jargon in one sentence a smart 15-year-old understands.
- **Grounded optimism.** Steelman the strongest opposing view before resolving.
- Banned fluff (see `BANNED_PHRASES` in `digest.py`): "in an unprecedented move," "sent
  ripples," "the AI landscape," "game-changer," "a new era," etc.

## The content engine (`scripts/ai_news/`)

Already pivoted to Alex Prompts; see `scripts/CLAUDE.md`. Two-pass Gemini pipeline:
reporter brief (grounded fact-finding) → writer pass (house style). Emits a **newsletter
draft** + a **short-form script queue** and emails them to Alex via Resend for manual
edit/publish. The legacy dental pipeline is retired under `scripts/_archive/` — do not
revive it.

## Site structure

- `/` — **content-first landing page** (a magazine front page, not a marketing splash):
  compact masthead → featured latest issue + recent-issues grid → the editorial method →
  coverage → follow → subscribe. Top content sits high on purpose. Money model is ads
  later; content is free, so the homepage's job is to put the best content in front of a
  visitor immediately.
- `/about` — who Alex is, the editorial framework, the contrarian stance, the name.
- `/archive` + `/archive/[slug]` — issue archive, backed by Supabase `blog_posts`.
  **Auto-mirrored from Substack:** `/api/sync-substack` (daily Vercel cron, `vercel.json`)
  reads the publication RSS feed, converts each post's HTML to markdown via
  `src/lib/substack.ts` (turndown; images kept as `<figure>`/`<figcaption>`), and upserts
  rows as `PUBLISHED`. So posting on Substack populates the site with no manual step.
- `/review` — token-gated draft editor (not in nav). `/api/publish` + `/api/review/save`
  drive the manual publish flow (flip `blog_posts.status` to `PUBLISHED`, revalidate
  `/archive`). Kept for engine-generated drafts; the Substack mirror is the live path.

**`src/lib/site.ts` is the brand single-source-of-truth** (name, author, tagline, social
links, covered-company list). Edit handles/domain there and nav/footer/JSON-LD/sitemap
update together. It currently holds **placeholder** social URLs and domain — confirm and
replace the `TODO(alex)` values.

## Supabase

- Env: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public, RLS-guarded).
  `SUPABASE_SERVICE_KEY` for the publish route only.
- **`blog_posts`** is the only table the site uses now. Columns used: `id`, `title`,
  `slug`, `summary`, `body_md`, `tags`, `status` (`DRAFT`/`PUBLISHED`), `published_at`,
  `created_at`, `author`. Public SELECT via RLS on `status = PUBLISHED`. The dental
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
| `GEMINI_API_KEY` | Content engine (`scripts/ai_news/`). |
| `RESEND_API_KEY` | Emails the weekly draft to Alex. |
| `NOTIFICATION_EMAIL` | Draft recipient (`jsteryous@gmail.com`). |
| `MAIL_FROM` | Resend sender on a verified domain (see `scripts/CLAUDE.md`). |
| `NEXT_PUBLIC_SUBSTACK_URL` | Substack publication base (subdomain or custom domain, NOT the `/@handle` profile). Drives the Subscribe button (`/subscribe`) and the archive RSS mirror (`/feed`). Defaults to `https://alexprompts.substack.com` — confirm. |
| `SUBSTACK_FEED_URL` | Optional override for the feed URL. Defaults to `${NEXT_PUBLIC_SUBSTACK_URL}/feed`. |
| `CRON_SECRET` | Authorizes the Vercel cron call to `/api/sync-substack` (sent as `Authorization: Bearer …`). Manual runs use `?token=${PUBLISH_SECRET}`. |

> The dental scraper vars (`ROD_*`, `PDL_API_KEY`, `GOOGLE_PLACES_API_KEY`,
> `TESSERACT_CMD`, etc.) belong only to `scripts/_archive/` and are not needed to run
> this site or the `ai_news` engine.

## Deployment

- **Platform:** Vercel (Hobby), auto-deploy on push to `main`.
- **Repo:** https://github.com/jsteryous/rebbadvisors-website (repo not yet renamed).
- **Production:** alexprompts.com (confirm DNS).

```bash
npm run dev | npm run build | npm run lint | npx vercel --prod
```
