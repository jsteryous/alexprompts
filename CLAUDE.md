# Rebrew

> **THE INTELLIGENCER (October 14, 2026). The front page is a newspaper.** Alex handed the
> site over ("you have full rein on the website. Take ownership and responsibility") with
> one goal: the most entertaining content possible, and the attention that follows. The
> answer is **The Rebrew Intelligencer**: the real news, three mornings a week (Tuesday,
> Thursday, Saturday), printed as a big-city American daily of 1945 (the paper began in an 1860 voice with No. 1
> and moved to 1945 the same day because 1860 read as dated). **The news is true and
> sourced; the Editor (C. P. Ashby), his household, the rival Evening Clarion, the letters
> and the advertisements are inventions**, and the colophon, the email footer and `/about` all
> say so, along with the fact that a machine writes it. Editions are rows in Supabase
> `intelligencer_editions` (JSON `content`, shape in `src/lib/editions.ts`), rendered by
> `src/components/EditionView.tsx` at `/` (latest), `/edition/<YYYY-MM-DD>` and
> `/editions` (Back Issues), with a per-edition share card. **Clip and share:** every item
> (and any line a reader highlights) can be clipped to `/clip/<date>/<item>?l=<p>.<start>.<end>`,
> whose link preview is a torn-newsprint image from `/api/clip-image`. A clip is an address,
> never a copy: the text is rebuilt from the printed number (`src/lib/clips.ts`), so nobody
> can forge a clipping in the paper's name. **The Editor's office (`/office`, first in the nav):**
> Mr. Ashby's 1945 office drawn in SVG (`components/office/OfficeScene.tsx`); every object
> opens something from the paper, assembled by `src/lib/office.ts`: cast files built by
> searching every number for Thaddeus, Mrs. Ashby, Fenwick, the Clarion and the barometer
> (each line links to its clipping), the month's most-clipped items from `page_hits`, the
> Coffee Can Index against the S&P 500 from `content.ticker` (closes the press writes as
> numbers, validated at the press door), and a countdown to the next press run. The room
> keeps itself up; add a new running gag by adding its regex to `CAST` and an object.
> **Claude runs this site (Alex, October 14, 2026):** routines and Claude sessions own the
> product and the creative calls; the standing goal is attention, clicks and sharing,
> within reason and never at the cost of the truth and taste rules. The cloud routine **"Rebrew
> Intelligencer press"** (`trig_01N12Gpuqa2gVG3L7WFutxu4`, 5:47 a.m. ET Tue/Thu/Sat) writes
> and inserts each number; its prompt is versioned in `scripts/intelligencer/PRESS.md`
> (the cast bible and the taste rules live there). **"Intelligencer circulation report"**
> (`trig_017z59c2rJKARMYZtdE1A4Yh`, Sundays 7:52 a.m. ET) emails Alex the week's numbers;
> prompt in `scripts/intelligencer/CIRCULATION.md`. Both need the Supabase connector (and
> the report Gmail) attached in the claude.ai Routines UI; the API could not attach them.
> **Analytics:** Vercel Web Analytics is not enabled on the project, so every page beacons
> `/api/hit` (`components/PageHit.tsx`), which counts views per day, path and referring host
> in `page_hits` through the `record_hit` function. No cookie, IP or identifier is stored.
> **Illustrations** (`image` on a lead or dispatch, `safeImage` in `editions.ts`) print only
> from Wikimedia Commons or the Library of Congress, with a credit, after the press confirms
> on the file page that the picture shows exactly the named subject under a reusable licence.
> The press also emails Alex three ready-to-post social lines per number. The weekly review
> writes a note to `intelligencer_notes`, which the press reads first: that is the learning
> loop. **The Publisher** (`trig_01KyzXyjKpxfY6zYz9NwEtNQ`, Mondays 6:13 a.m. ET, prompt
> `scripts/intelligencer/PUBLISHER.md`, replacing the fortnightly maintainer October 14,
> 2026) owns the site week to week: it measures against `scripts/intelligencer/STRATEGY.md`
> (goal, measures, dated targets, rules for changing course, ranked backlog), appends to
> `SCOREBOARD.md`, steers the press with a note, builds and ships the top bet, logs it in
> `STRATEGY.md` and `CHANGELOG.md`, and emails Alex a short report with one ask. **A Claude
> session that changes direction should update `STRATEGY.md`**, because that file is the
> Publisher's brief.
> **Alex's desk is in Notion (October 14, 2026): read it first in every Rebrew session.** Page
> `3f904ded13c68059b0b7ec2a0c168ff0` ("Rebrew: Founding Beliefs, Directives, Questions and Comments"). He adds
> numbered notes; Claude answers each with a blue callout under it ("Claude, <date>: ..."), never editing his words,
> and the Publisher writes its weekly report as a subpage there plus a two-line Gmail nudge (Notion does not notify
> him of edits made through his own account). Push back when a note is wrong; he asked for it.
> **Letters from real readers (October 14, 2026):** `/letters` posts to `/api/letters`, which stores the letter in
> `intelligencer_letters` and emails `PRESS_NOTIFY_EMAIL`; the press door's GET lists unprinted letters (no email
> addresses) and POST prints one by `reader_letter_id`, the server copying the words exactly and setting `reader: true`
> (marked "From a reader" on the page), so the press can answer a letter but never alter or forge one. See `src/lib/letters.ts`.
> **The press holds no database or mail access (October 14, 2026).** It reads the open web,
> so it talks to the site only through **`/api/intelligencer/press`**, authed by
> `INTELLIGENCER_PRESS_SECRET` (set in Vercel and in the press's own cloud environment).
> GET returns today's date, the last four numbers, views per number and the desk notes; POST
> prints one number for today after the server rebuilds the JSON field by field (length caps,
> http(s) links only, `safeImage` for pictures, dashes refused) and then emails the link and
> social lines to `PRESS_NOTIFY_EMAIL` through Resend. A hijacked press can at worst print one
> bad number a day. **Subscribers get every number by email (October 14, 2026):** after the
> press has its answer, the door runs `broadcastEdition` (`src/lib/editionEmail.ts`) in
> `after()`, sending a short newspaper (banner, the lead's opening, the other headlines, one
> letter, one ad, a forward line, unsubscribe) to every confirmed `subscribers` row and
> stamping `intelligencer_editions.emailed_at` so a number never goes twice. Manual previews,
> counts and resends: `/api/intelligencer/broadcast?slug=<date>&test=|dry=1|force=1`
> (PUBLISH_SECRET). The nav's Subscribe and a box at the foot of every number point at
> `/subscribe`, the owned list; Substack does not carry the Intelligencer. **`page_hits` holds no free text:** `/api/hit` stores only known route
> shapes (article slugs collapse to `/<section>/*`) and a fixed list of referrer labels, and
> two `NOT VALID` check constraints enforce the same at the database for every new row.
> The "Just good stories" posts below keep their URLs and live in the Archive.

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
  `sectionOf`). `topic:` tags remain on rows but nothing public reads them.
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
| `INTELLIGENCER_PRESS_SECRET` | At least 24 characters. The press routine's only credential, for `/api/intelligencer/press`. Same value in the press's cloud environment. Unset means the route answers 503. |
| `PRESS_NOTIFY_EMAIL` | Where the site sends each new number's link and social lines. Server-side only, so the press cannot change the recipient. |

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

- **Content routes stay live:** `/reporting` (the Archive, with no categories since
  October 7, 2026), `/real-estate`, `/sales`, `/briefing`, `/archive`,
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
