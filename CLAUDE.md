# Rebrew

Domain context lives in nested files:
- **`src/CLAUDE.md`** — frontend stack, routes, design system, the admin editor, SEO.
- **`scripts/CLAUDE.md`** — the content engine.
- **`scripts/research/SPEC.md`** — the LIVE engine's spec. Outranks both of the above.
- **`BRAND.md`** — the StoryBrand BrandScript. Drives positioning copy (site, welcome
  email, bios, CTAs). Deliberately OUT of the truth-seeking writer method.

> **THE THREE RULES (Alex, August 15, 2026). They outrank every other editorial
> instruction in this repo, including the rest of this file.**
> **1. It must be a true story. 2. Make it as entertaining as possible without
> fabricating. 3. Have fun.**
>
> Rule 1 says STORY, which is a genre instruction: the spec had been written in the
> register of an intelligence memo and that register was producing memos. Rule 2 is a
> MAXIMUM, not a threshold, so among candidates that clear every bar, take the one with
> the best story. Fabricating is the single hard line, and every sourcing, arithmetic,
> verifier, and legal rule exists to let the writing run right up to it safely. Rule 3 is
> not decoration: a bored writer and a writer enjoying the material produce visibly
> different prose, and Alex reads this publication as well as writing it.

## What this is

**Rebrew**, at **rebrew.org**, is Alex Steryous's publication on **Greenville real estate
and sales performance**. Tagline: `Greenville Real Estate & Sales Performance`. Masthead
headline: "What's brewing in Real Estate." Brand single-source-of-truth is
**`src/lib/site.ts`**; edit handles and domain there and every surface follows.

The beat narrowed to **Greenville** on August 25, 2026 ("it's a real narrowing, take the
whole masthead to greenville"). That was a correction to the archive, not an ambition
being trimmed: 34 of 36 published pieces mention Greenville and none was meaningfully
statewide, so the front page had been promising territory the work did not cover.

The promise, in Alex's own words, is that *"We read research papers about real estate and
sales performance and share what we find interesting."* The reader should land here and
immediately get an insightful read on how the market is moving and why. **Alex is a reader
of this publication, not only its author.** If a question would bore him, that is real
information about the question.

### The north star is REFERRAL REVENUE

Alex is a licensed SC agent with a full-time job. The site's job is to earn a conversation
with a qualified buyer or seller, which he then refers to an active agent for a fee
(`/buying-or-selling`). Relocation leads to any market count.

> **NEVER EXPLAIN THE BUSINESS MODEL. THE ENTIRE MECHANISM IS INTERNAL CONTEXT and never
> appears in user-facing copy, on the site or in an article.**
>
> Nothing anywhere may say Alex will refer, match, connect, hand off, or introduce the
> reader to an agent; may call an agent "vetted," "hand-picked," "trusted," or "in my
> network"; may say the help is "free" or "at no cost to you"; or may say he does not
> practice or does not take clients.
>
> Two failures, one cause. "I do not practice" disqualifies Alex at the exact moment the
> reader is deciding whether he can help. "I will connect you with a vetted agent" makes
> the reader feel brokered before they have said hello. Both describe how Alex gets paid
> instead of what the reader came for.
>
> State what he IS ("licensed real estate agent in South Carolina"), keep the invitation
> short and warm ("let me know if you are looking to buy or thinking of selling"), and let
> the one-line licensee disclosure in the `/buying-or-selling` fine print be the only
> mention of a fee anywhere. The engines carry this as a writer rule and a hard editor
> cut-gate. See memory `no-referral-mechanism-in-copy`.

**Distribution, not the site, is the bottleneck.** Organic SEO is dead as a growth lever
(zero-click search plus AI Overviews), which is why the evergreen how-to guides are dead
as a CATEGORY rather than merely deprioritized. The faster channel is Alex's **sphere of
influence**: mortgage loan officers, estate attorneys, the solid agents he already knows.
Warm intros close far better than cold. The site is the credibility layer that makes those
conversations land. See memory `referral-funnel-traction`.

## Editorial posture

**ASSESS, DO NOT ADVISE.** The posture is the intelligence analyst's, not the columnist's,
and it is the easiest thing on the site to get wrong. A piece **DOES** reach a conclusion
about whether the evidence supports a claim; that is the product, and refusing to land is
not neutrality. A piece does **NOT** advocate: no recommendation about what to buy, sell,
hold, or build, and no editorializing about whether any of it is good for the state. Other
people's opinions are subject matter, quoted and attributed and tested. Do not collapse
this into "a buyer reads it this way, a seller reads it that way," which is the both-sides
mush that emptied the old weekly brief.

**YEARS, NOT QUARTERS.** A quarterly move is noise and is what everyone else already
published, so the default horizon is long. Note that a median can sit perfectly still on
top of a distribution that changed completely underneath.

**INCENTIVES EXPLAIN BEHAVIOR.** When a market or a company does something that looks
arbitrary or like a matter of taste, there is usually a tax structure, financing term,
subsidy, assessment schedule, or zoning threshold underneath making it rational. Finding
it is the highest-value move available.

**Pro-growth, held honestly.** The stance is pro growth, investment, and business, and it
drives the ENGINES (the verdict ledger, the prosperity question), not the homepage copy.
Steelman the strongest opposing view, then arrive at an honest conclusion, then end on a
genuinely earned question. See memory `pro-growth-editorial-stance`.

**Claims are one input, not the beat.** An opinion held by someone in this market is a
fact about the market, so what people say gets collected and tested against the record
(`scripts/publication/claims.md`). But it runs at about one issue in three and it is
**never the front-page promise**: a draft that made claim-testing the site's headline
mechanism was cut because it made the publication sound smaller than it is.

**The reader** is the developer and the real estate entrepreneur, with the loan officer,
closing attorney, agent, banker, and economic-development professional behind them. Alex
is NOT a developer and no copy may imply he is: the authority comes from the documents,
not the byline. He is also a new agent with little transaction experience, so never write
veteran-agent or sales-mastery copy.

## Voice

The canonical rules live in the live writer/editor passes
(`scripts/publication/routine/pass3_writer.md`, `pass3b_verifier.md`, `pass4_editor.md`,
shared
with the research engine). Site copy must match them.

- **No em dashes or en dashes, ever.** Use periods, commas, or restructure. The engines
  enforce this; the website has no automated backstop, so do not introduce them in copy.
- **No sentence fragments.** Every sentence has a subject and a finite verb, never a
  clipped burst for effect.
- **Vary sentence length in BOTH directions.** A run of long clause-heavy sentences of
  similar length is as much a machine tell as a run of clipped ones, and it is the more
  common failure. Put a short sentence next to a long one on purpose. The test is a
  subject and a finite verb, not a word count.
- **Use colons sparingly.** Avoid the colon-as-drumroll and the "Label: payoff"
  construction. A colon only introduces a genuine list.
- **Site copy is UNCONTRACTED** ("who is", never "who's"). The one deliberate exception is
  `ReferralCta`, where Alex wrote the contractions himself. Do not "fix" them.
- **Banned fluff:** "in an unprecedented move," "sent ripples," "the AI landscape,"
  "game-changer," "a new era." Also banned from site copy since July 2026: **"in plain
  English"** (Alex found it unpolished).
- Open cold and concrete: a fact, a scene, or a number. Translate any jargon in one
  sentence a smart 15-year-old understands.

### THE FOUR TELLS

Added August 14, 2026, after Alex read a homepage draft and said "it is so obviously
written by AI." These are STRUCTURAL, not lexical, which is why they survive every
banned-word list. The offending paragraph was:

> *"Checking is the work here. I take the claims moving around this market, and the
> companies and deals underneath them, and test them against filings, permits, deeds, job
> postings, and county records. You get what the evidence supports, what it does not, and
> where it is genuinely unclear."*

Every sentence in it is true and the paragraph is still unusable.

1. **The abstract-noun opener.** "Checking is the work here." Naming an activity as a
   subject and predicating it is a construction almost nobody uses out loud. Start with a
   person doing something, or with the concrete thing.
2. **The tricolon payoff.** "What the evidence supports, what it does not, and where it is
   genuinely unclear." Three balanced parallel items closing a sentence is the single
   loudest tell in the language. A list of three is fine when it is a real list of real
   things; it is a tell when the three are rhetorically balanced and land as a flourish.
   **Break it: use two, or four, or make one item a different shape.**
3. **The noun pile as proof.** "Filings, permits, deeds, job postings, and county records."
   Stacking five source types performs rigor instead of demonstrating it. Name one or two,
   or name the specific document that actually mattered.
4. **Uniform sentence shape.** Not just length, which the rhythm rule covers, but SHAPE:
   three sentences in a row that each open with a subject and run to a compound object.

The general test: read it aloud. If it sounds like it is being read from a card rather
than said, it is one of these. A fifth, added September 2026: **the neat inversion as a
paragraph closer** ("not X, but Y"). See memory `the-four-ai-tells` and
`anti-slop-is-a-rewrite-not-a-rulebook` — example SENTENCES in a prompt get copied verbatim
into the output, and long banned lists produce rule-following prose; the fix is fewer rules
plus a real rewrite pass.

### NEVER NARRATE THE PROCESS

No piece tells the reader what the pipeline tried, what it could not reach, or what it fell
back to: "the usual host was unreachable," "the MLS indicators were not available this
week," "I could not confirm." A human columnist never writes these because a human never
experiences a failed fetch; they go to the other source and come back with the number. This
was the strongest LLM fingerprint in a shipped brief, stronger than any word choice.

**The line:** a limitation that lives in the WORLD may be stated once, attached to the
figure it affects ("no one publishes this figure, so treat it as approximate"), because any
reader who went looking would meet the same wall. A limitation that exists only because a
retrieval attempt failed is cut without replacement. Retrieval friction goes to the review
packet under SOURCING NOTES, which is where Alex reads about the machinery.

Two companion rules ship with it: **one caveat per section** (hedging density reads as
machine diligence, not editorial confidence) and **state a figure once** (repeating
"24.2% vs 1.9%" three times is model reinforcement). See memory `never-narrate-the-process`.

### A LINK OPENS A PAGE, NEVER A DOWNLOAD

No link in an article may point at a data file, meaning a URL ending in `.csv`, `.xls`,
`.xlsx`, `.pdf`, `.zip`, or `.json`. A brief once shipped with a dozen figures linked to
raw Zillow CSVs and its lead figure linked to a half-megabyte PDF, so a reader who clicked
"61 homes" got a file download. That reads as a broken site and makes real sourcing look
like a bug.

The fix is a split the engines carry in their data and their passes. The **verify URL** is
the exact file a number came out of; it stays internal and is what the verifier re-opens to
ground-truth the figure. The **cite URL** is the human landing page a reader may click (for
every Zillow series that is `https://www.zillow.com/research/data/`). Where a source
publishes only a document, as GGAR's monthly indicators and most county budgets and agendas
do, the figure is **attributed in words with no link at all**, which is complete sourcing
and never a defect.

Two companion rules: **one link per source per piece**, at first mention (eleven figures
pointing at one landing page reads as machine output), and **attribution is required, a
link is not**. See memory `links-open-pages-never-downloads`.

### CLIPPABLE LEADS

The opening sentence and the first sentence under each heading are written to survive being
lifted out and pasted into X or Nextdoor. They stand alone, name the place and the thing
measured, lead with the plain-language meaning and then stack two or three figures that
earn it, keep a short source tag inside ("per the Greenville MLS"), and target under 200
characters. The model sentence:

> *"Greenville homebuyers have more leverage than a year ago: inventory is up 12%, homes
> are taking 52 days to sell (vs. 43), and the median sale price is still $330K, per the
> Greenville MLS."*

These are complete sentences, not fragments, and the rest of the prose still flows. A colon
introducing a genuine list of figures is correct here and is not the banned drumroll.

**Compress the prose, never the evidence** is the governing rule: cutting a figure, a
baseline, or the source tag to hit a character count is a failure, not good editing. State
the market MECHANIC the figures measure ("more leverage"), never a verdict ("the market is
loosening faster than the country") or advice ("buyers should offer under asking").

### Other writing rules baked into the passes

No signpost transitions. First person on judgment, not on effort. Show the seams when
numbers conflict. Be pointed on the standard, not on the verdict. For a guide aimed at
non-professionals, state **how it works and who pays BEFORE any research**, and hedge only
the contested part. CTA placement differs by track on purpose. See memories
`writing-style-coaching-rules` and `guide-writing-money-and-plumbing-first`.

## The content engine

See `scripts/CLAUDE.md`, and `scripts/research/SPEC.md` first. **Claude routines only;
Gemini was removed June 2026.** Everything is **draft-first**: a routine inserts a DRAFT
`blog_posts` row and Alex reviews and publishes at `/admin`. See memory
`publishing-draft-first`.

**`scripts/research/` is the live engine.** One research paper per issue: what it asked,
the trick that let it find out, what it found, whether it has held up, and the model it
leaves you holding. Tagged `sales` or `greenville`.

**`scripts/publication/` stops producing, but three of its passes are LIVE and shared**:
`routine/pass3_writer.md`, `routine/pass3b_verifier.md`, `routine/pass4_editor.md`. They
hold the house voice, the
four tells, the legal gate, and the fair-housing line. The research engine hands each one
to its sub-agent with a short delta. **Do not delete them and do not fork a second copy**,
which is how the voice rules drift.

Dormant but present: `greenville/` (its `commercial.py` collector still refreshes
`src/data/commercialSales.json` as research input, so do not delete it for looking
orphaned), `tech/`, `briefing/`. Retired to `scripts/_archive/`: the national Saturday
engine `ai_news/` and the legacy dental pipeline. Do not revive either.

**The article routines are CLOUD routines, not repo cron**, and their prompts live only in
the routine. A run that finishes in 1 to 3 minutes is a stand-down, not work. See memory
`cloud-routine-lineup`.

## Supabase

Env: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public, RLS-guarded);
`SUPABASE_SERVICE_KEY` for publish, sync, and the owned list. Project is "Taraform"
(`ykuenmwfxecmmqichwit`). See memory `supabase-project-and-owned-list`.

**`blog_posts`** is the only content table the site uses. Columns: `id`, `title`, `slug`,
`summary`, `body_md`, `cover_image`, `cover_credit`, `tags`, `status` (`DRAFT`/`PUBLISHED`),
`published_at`, `created_at`, `author`, `last_broadcast_at`. Public SELECT via RLS on
`status = PUBLISHED`. **`body_md` is the source of truth** for the site, the broadcast
email, and every engine. Sections are split by tag, see `src/lib/posts.ts` `sectionOf`.
Leftover dental tables (`market_signals`, `enriched_leads`, `website_prospects`, `clients`)
are unused.

**`subscribers`** is the **owned email list**, the asset we control, separate from
Substack. Service-key only. Double opt-in: a signup is `pending` with a `confirm_token`,
the email link flips it to `confirmed`, and only confirmed rows get broadcasts.
`unsub_token` is the per-recipient unsubscribe token. Driven by `src/lib/subscribers.ts`
plus `/api/subscribe`, `/api/subscribe/confirm`, `/api/unsubscribe`.

Sending is **`/api/broadcast?id=<postId>`** (Resend via `src/lib/email.ts`), authed with
`PUBLISH_SECRET` as a Bearer header or a `token` query param. It is the channel for
site-only content that never goes to Substack. Params: `test=you@example.com` sends one
preview and touches neither the list nor the stamp, `dry=1` reports the recipient count,
`force=1` resends past the `last_broadcast_at` stamp.

**Broadcasts carry the FULL ARTICLE** (the Morning Brew model), not a teaser: a
click-through is friction on a five-minute read, and the list is sphere professionals whose
habit is the whole point. `src/lib/emailMarkdown.ts` renders `body_md` to inline-styled
email HTML and is deliberately SEPARATE from the site's `renderMarkdown.ts`, because email
clients drop classes and style blocks and the site rewrites images to relative
`/_next/image` URLs that cannot resolve in an inbox. Rendered once per send. Worst case
measured across the corpus is 19KB, about 19% of Gmail's ~102KB clip threshold. One list
gets ALL broadcasts; there is no per-category segmentation by design.

**`referral_leads`** is the `/buying-or-selling` conversion table and the site's #1 revenue
path. Service-key only, deliberately separate from `subscribers`: someone filling in the
referral form is a HOT lead asking to be contacted, not a newsletter signup, so there is no
double opt-in. Columns: `name`, `email` (nullable), `phone`, `intent`, `location`,
`moving_from`, `timeframe`, `message`, `source`, `status` (new/contacted/placed/dead),
`contacted_at`, plus first-party attribution (`ref_slug`, `referrer`, `landing_path`,
`utm_source`, `utm_medium`, `utm_campaign`). Written by `/api/refer` via `src/lib/leads.ts`,
which also emails Alex a notification with a "Came from" line. The store succeeds even when
Resend is unconfigured; the row is the source of truth.

**A phone OR an email is enough**, and the pair is what is required. Demanding an email
loses the person who would rather be called; demanding a phone loses the one who is not
ready to be. Enforced in the form, in `/api/refer`, and by `email` being nullable.

Attribution queries live in **`supabase/queries.sql`** (read-only, paste into the Supabase
SQL editor): leads by article including the zero-lead guides, channel mix, capture surface,
funnel by intent, weekly trend, response time, open work queue. All exclude
`status = 'dead'`, which is where test rows go, so a test submit never inflates a rate.

**Requires `blog_posts`, `subscribers`, and `referral_leads` from `supabase/schema.sql` to
be applied.**

## Environment variables

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://www.rebrew.org` — **www is canonical** (the apex 308-redirects to www at Vercel). Drives canonical/sitemap/robots/OG. If set in Vercel it MUST be the www URL, or unset to use the code default. |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Safe to expose; RLS controls access. |
| `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` | Service key, never commit. |
| `PUBLISH_SECRET` | Shared secret for the `/admin` login, `/review`, `/api/publish`, `/api/review/save`, `/api/broadcast`. |
| `NEXT_PUBLIC_SUBSTACK_URL` | Substack base (subdomain, NOT the profile page). Defaults to `https://alexprompts.substack.com`, deliberately unchanged by the Rebrew rename: the subdomain is the publication's identity over there, and renaming is a job on Substack with its own redirect. |
| `SUBSTACK_FEED_URL` | Optional override. Defaults to the Substack base plus `/feed`. |
| `CRON_SECRET` | Authorizes the Vercel cron calls to `/api/sync-substack` and `/api/finalize-greenville`. You invent the value; Vercel sends it as an `Authorization: Bearer` header. Unset means the scheduled calls 401 silently. Manual runs bypass it with the publish secret. Production scope only. |
| `RESEND_API_KEY` | Server-only key for the owned list (`src/lib/email.ts`). **Unset means capture still works** (subscribers are stored) but no mail goes out. The sending domain must be DNS-verified in Resend. Free tier is ~100 emails/day, 2 req/s. |
| `EMAIL_FROM` | Verified sender, e.g. `Rebrew <alex@rebrew.org>`. **Cannot change until Resend verifies rebrew.org by DNS**; sending from an unverified domain fails. Legacy alias `MAIL_FROM` is accepted and `EMAIL_FROM` wins. |
| `EMAIL_REPLY_TO` | Optional reply-to for owned-list mail. |
| `EMAIL_POSTAL_ADDRESS` | Physical address printed in the email footer. **CAN-SPAM requires one**, and it matters most for contacts Alex added by hand off a sphere call. Unset means the line is omitted, since no placeholder ever ships, which leaves that gap open. Use a PO box, not a home address. |
| `LEADS_NOTIFY_TO` | Where `/api/refer` sends the lead notification. Falls back to `EMAIL_REPLY_TO`, then `site.email`. Set it to the inbox Alex actually watches. The lead is stored regardless, so an unset inbox never loses one. |
| `SUBSCRIBE_RATE_LIMIT` / `REFER_RATE_LIMIT` | Optional per-IP hourly caps (default 5 each), plus a hardcoded 3 confirmation sends per hour per address. Soft and in-memory (`src/lib/rateLimit.ts`), so they reset on a cold start. |

**Dead. Delete these from the deploy env:** `GOOGLE_PLACES_API_KEY`, `CENSUS_API_KEY`,
`AREA_SCAN_DAILY_CAP`, `AREA_SCAN_RATE_LIMIT` (the nine tools were deleted August 14, 2026,
which removed the operation's only paid API surface), plus `GOOGLE_MAPS_KEY` and
`ANTHROPIC_API_KEY` (the auto-cover and its photo library went August 27, 2026). The dental
scraper vars (`ROD_*`, `PDL_API_KEY`, `TESSERACT_CMD`) belong only to `scripts/_archive/`.

## Deployment

- **Platform:** Vercel (Hobby), auto-deploy on push to `main`.
- **Repo:** https://github.com/jsteryous/alexprompts
- **Production:** rebrew.org, canonical host `www.rebrew.org` (Cloudflare DNS to Vercel).
  **alexprompts.com stays attached as a redirect-only domain** so every published article
  URL keeps resolving. Do not let it lapse without redirecting the article paths.

```bash
npm run dev | npm run build | npm run lint | npx vercel --prod
```

`npm run lint` runs eslint plus two gates that also fail the Vercel build:
`check:canonicals` (every page route declares its own canonical) and `check:editor` (the
WYSIWYG markdown round trip is lossless against every row in the database).
