# Rebrew

> **THE REFRAME (October 7, 2026). The website is a story publication.**
> Slogan: **"Just good stories."** Internal mission (never printed as a mission
> statement): **to share the most entertaining stories of incredible people or events.**
> True, timeless stories of people and things that lasted: history, bravery, adversity
> overcome, and the money, building and craft behind them. Not local, not news. The site
> is **minimalist and timeless**: serif type on paper, one column, the slogan, a plain
> list of story titles, one Subscribe link (to Substack, the primary channel). Stories
> are posts tagged `story` (`getStories` in `src/lib/posts.ts`); the Substack sync tags
> posts published on or after October 7, 2026 automatically. Earlier work keeps its URLs
> and is listed on `/reporting`, which the footer calls the Archive. Drafts come from the
> weekly cloud routine "Rebrew weekly story draft". **`/buying-or-selling` was removed the
> same day** ("get rid of buying or selling"): the page and its form are deleted, the path
> and its two older aliases 308 to `/`, and the in-article and email buy/sell CTAs are off.
> **The best-agents landing page went too**, with QuickContact, `/api/refer`, `leads.ts`,
> `attribution.ts`, the SMS consent strings and the `/terms#sms` section: the site now
> collects nothing but newsletter emails. `/best-real-estate-agents-greenville-sc` 308s to
> `/`. `referral_leads` still holds past submissions, and `/privacy` says so. The store section below predates this reframe and
> was not discussed again; ask Alex before acting on it.

> **THE PIVOT (October 5, 2026).** Rebrew is becoming a **store**: classy, high-quality
> office decor and men's goods with a finance and real estate theme, for bankers and the
> people around them. The publication made no money (3 subscribers, 0 referral leads in
> its life), so the editorial mission is retired as the site's purpose. Everything below
> this line describes the store. The publication's machinery is documented under
> **LEGACY** at the bottom and still exists in the repo.

**Rebrew**, at **rebrew.org**, sells goods a banker would keep on a desk, wear to work, or
give to a client: office decor and men's goods tied to finance and real estate. Brand
single-source-of-truth is still **`src/lib/site.ts`** (name, tagline, domain, handles),
and its tagline and description still say "Greenville Real Estate & Sales Performance"
until the store copy is written. Change them there and every surface follows.

## What we sell

**Classy and very high quality. Not necessarily expensive.** Alex's words, and the test
for every item:

- **Quality is the bar, price is not.** A $40 piece that is built well beats a $400 piece
  that is only branded. Judge materials, construction, and condition, never the label
  alone.
- **The theme earns its place.** Bulls and bears, ticker tape, ledgers, architecture,
  blueprints, maps, keys, money motifs. Subtle beats loud; a theme a client notices on
  the second look is the right volume. No novelty gags.
- **Categories in scope:** desk and office decor (bookends, paperweights, desk sets,
  framed prints, clocks, globes, letter openers), men's goods (ties, cufflinks, tie bars,
  pocket squares, money clips, wallets, pens, card cases), and client and closing gifts.
- **Pre-owned and new are both allowed.** Pre-owned designer pieces (Hermès finance-motif
  ties are the first test, sourced in Japanese bundles at roughly $15 to $22 a tie and
  resold at $65 to $100) sit beside new goods from makers. Condition is graded and stated
  on every pre-owned item.

**The audience** is bankers first: commercial and investment bankers, loan officers,
wealth managers, then the real estate side (developers, brokers, closing attorneys) and
anyone buying a gift for one of them. Alex works in this world, so his network is the
first sales channel, before any search traffic exists.

## Hard rules

- **AUTHENTIC OR NOTHING.** Counterfeits are common in exactly the categories we buy
  (Hermès ties, Montblanc pens). Every branded item is checked before it is listed, and
  anything that cannot be authenticated is not sold. Selling a fake, even by accident,
  costs the marketplace accounts and the brand.
- **NO IMPLIED AFFILIATION.** A third-party brand name describes a genuine item and
  nothing more. Never use another brand's name or logo in our own product names,
  category names, or ads, and never imply Rebrew is an authorized dealer unless it is.
- **NEVER FABRICATE.** No invented reviews, sales counts, scarcity ("only 2 left" when it
  is not true), "as seen in," or provenance. Product copy describes the actual item in the
  actual photos. This is the old house rule, carried over intact: the writing may run
  right up to the line, and fabrication is the line.
- **REAL PHOTOS, HONEST CONDITION.** Pre-owned listings show the real item, including
  flaws, with a stated condition grade.
- **Before checkout goes live:** a South Carolina retail license and sales tax collection
  (SC Department of Revenue), a published returns policy and shipping terms on the site,
  and a Vercel plan that permits commercial use (the project is on **Hobby**, which is
  non-commercial; move to Pro, or put checkout on a commerce platform). Confirm each of
  these rather than assuming.

## Strategy, as of the pivot

1. **Prove sell-through before building.** The first test is two tie bundles (about $120)
   listed on eBay and shown to colleagues. Track cost, sale price, fees, and days to sell.
   Six weeks of that decides whether the store is worth building.
2. **Sell where buyers already are.** eBay, Poshmark, Grailed, and Alex's network come
   first. rebrew.org has no traffic, so the storefront follows the inventory, not the
   other way around.
3. **Then the storefront.** Simplest thing that works: a product grid with Stripe
   Payment Links or a hosted commerce platform. No custom cart, accounts, or inventory
   system until volume demands one.
4. **The site's existing pages stay up** until the storefront replaces them, because
   published URLs keep resolving. Do not delete content routes without redirects.

**Open decisions (ask Alex, do not assume):** whether the name stays Rebrew or the store
gets its own (Rebrew reads as real estate today); what replaces the tagline and masthead;
which platform hosts
checkout.

## Copy and voice

Product and site copy follow the house voice that the publication built, because it is
still the right voice for a quality store:

- **No em dashes or en dashes, ever.** No sentence fragments. Vary sentence length.
- **Uncontracted** site copy ("it is", not "it's"). The exception is `ReferralCta`, where
  Alex wrote the contractions himself.
- **Colons sparingly**, only to introduce a real list.
- **No hype.** Banned: "game-changer," "elevate your," "must-have," "luxury" as filler,
  "curated" as filler, "in plain English." Say what the thing is made of and why it is
  good.
- **The tells to avoid** (structural, not lexical): the abstract-noun opener, the balanced
  tricolon payoff, the noun pile performing rigor, uniform sentence shape, and the neat
  "not X, but Y" closer. Read it aloud; if it sounds read from a card, rewrite it.
- **A product description** opens on the object itself (material, maker, era, motif),
  states condition plainly, and ends. Two to four sentences is usually right.

## Supabase

Env: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public, RLS-guarded);
`SUPABASE_SERVICE_KEY` for server writes. Project is "Taraform" (`ykuenmwfxecmmqichwit`).

Existing tables, unchanged by the pivot:

- **`blog_posts`**: every article. Public SELECT via RLS on `status = PUBLISHED`.
  `body_md` is the source of truth. Sections split by tag (`src/lib/posts.ts`
  `sectionOf`); `/reporting` tabs split by `topic:` tag (`src/lib/topics.ts`).
- **`subscribers`**: the owned email list, double opt-in, service-key only. Becomes the
  store's customer list; a confirmed subscriber can be told about new inventory.
- **`referral_leads`**: past submissions from the removed buy/sell forms. Nothing writes
  to it any more. Service-key only.

No product, order, or inventory tables exist yet. **Add them only when the storefront is
being built**, in `supabase/schema.sql`, with RLS on from the first migration.

Broadcast email still works: **`/api/broadcast?id=<postId>`** sends a post to confirmed
subscribers through Resend (`src/lib/email.ts`), authed with `PUBLISH_SECRET`. `test=` sends
one preview, `dry=1` reports the count, `force=1` resends.

## Environment variables

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://www.rebrew.org`. **www is canonical** (the apex 308-redirects to www). |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public; RLS controls access. |
| `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` | Service key, never commit. |
| `PUBLISH_SECRET` | `/admin` login, `/review`, `/api/publish`, `/api/review/save`, `/api/broadcast`. |
| `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO` | Owned-list mail. Unset key means capture works but nothing sends. |
| `EMAIL_POSTAL_ADDRESS` | Footer address; CAN-SPAM requires one. Use a PO box. |
| `CRON_SECRET` | Authorizes the Vercel crons (`/api/sync-substack`, `/api/finalize-greenville`). |
| `NEXT_PUBLIC_SUBSTACK_URL` / `SUBSTACK_FEED_URL` | Substack mirror into `/archive`. Base defaults to `https://rebrew.substack.com` (moved from `alexprompts.substack.com` October 1, 2026); if set in Vercel it must be the rebrew subdomain or unset. |
| `SUBSCRIBE_RATE_LIMIT` / `REFER_RATE_LIMIT` | Soft per-IP hourly caps. |

Payment keys (Stripe or a commerce platform) do not exist yet. When they arrive they are
server-only and never committed.

## Deployment

- **Vercel (Hobby)**, auto-deploy on push to `main`. Hobby is non-commercial; see Hard
  rules before taking payments.
- **Repo:** https://github.com/jsteryous/alexprompts
- **Production:** rebrew.org, canonical `www.rebrew.org` (Cloudflare DNS to Vercel).
  **alexprompts.com stays attached as a redirect-only domain** so old article URLs
  resolve.

```bash
npm run dev | npm run build | npm run lint
```

`npm run lint` runs eslint plus two gates that also fail the Vercel build:
`check:canonicals` (every page route declares its own canonical, or `robots: { index:
false }`) and `check:editor` (the admin editor's markdown round trip is lossless against
every row in the database). A new product or shop route must declare its canonical too.

## LEGACY: the publication (dormant, not deleted)

Rebrew ran as a research publication on Greenville real estate and sales performance from
June to September 2026. Its machinery is still in the repo and parts still run:

- **Content routes stay live:** `/reporting` (with the Real Estate, Finance, Urban
  Economics, and Lifestyle tabs), `/real-estate`, `/sales`, `/briefing`, `/archive`,
  `/about` (`/buying-or-selling` and the best-agents page were removed October 7, 2026
  and redirect home). Their docs are
  in **`src/CLAUDE.md`**, which also holds the design system (clean-cut newspaper, oxblood
  accent, serif reading surface, squared corners, two surfaces only) and the `/admin`
  editor. The design system carries over to the store unless Alex changes it.
- **Engines:** `scripts/research/` (spec in `scripts/research/SPEC.md`) and the shared
  writer, verifier, and editor passes in `scripts/publication/routine/`. Docs in
  **`scripts/CLAUDE.md`**. The article routines are **cloud routines** whose prompts live
  outside the repo; pausing them is done in Alex's Routines list, not here.
- **Still scheduled:** the Vercel crons in `vercel.json` (daily Substack sync, daily
  Greenville finalize/broadcast) and four data-collection GitHub Actions in
  `.github/workflows/` (`collect-commercial`, `collect-greenville`, `collect-housing`,
  `collect-records`), which commit refreshed data to `main`. Each one triggers a deploy;
  disable them if the data is no longer wanted.
- **`BRAND.md`** is the publication's StoryBrand script. It does not describe the store.
- **Rules that still bind while those pages are live:** never explain the referral
  business model in user-facing copy (no "I will connect you with a vetted agent," no
  "free," no "I do not practice"); the South Carolina licensee disclosure stays on
  `/terms`; a link never points at a data file
  (`.csv`, `.pdf`, `.xlsx`, and so on).
- Alex's three editorial rules (August 15, 2026) governed every article: **1. It must be a
  true story. 2. Make it as entertaining as possible without fabricating. 3. Have fun.**
  Rule 2's hard line is the same one the store keeps.
