# Alex Prompts

This file is loaded everywhere. Domain-specific context is in nested `CLAUDE.md` files:
- **`src/CLAUDE.md`** — frontend tech stack, project-structure couplings, design system, SEO.
- **`scripts/CLAUDE.md`** — the content engines: the Greenville local real-estate
  engine (`greenville/`), Greenville Works (`tech/`), and the weekly Upstate Brief
  (`briefing/`), all draft-first. (The national Saturday engine `ai_news/` was killed July
  2026 and archived to `scripts/_archive/`.)
- **`BRAND.md`** — the StoryBrand BrandScript (villain = the noise, hero = the reader, guide
  = Alex). Drives all *positioning* copy (site, welcome email, bios, CTAs). Stays OUT of the
  truth-seeking writer method by design.

## What this is

> **STRATEGIC DIRECTION (July 2026, revised): the north star is REFERRAL REVENUE.** The
> site's real job is to generate **inbound relocation/buyer/seller leads that Alex refers to
> vetted agents for a referral fee** (`/find-a-pro`). Alex is a licensed SC agent who does
> not practice, so he captures the intent and hands it off. **THE ENTIRE MECHANISM IS INTERNAL
> CONTEXT. It never appears in user-facing copy, on the site or in an article** (finished August 1,
> 2026, extending the July 30 removal of "I do not practice"). Nothing anywhere may say Alex will
> refer, match, connect, hand off, or introduce the reader to an agent; may call an agent "vetted,"
> "hand-picked," "trusted," or "in my network"; may say the help is "free" or "at no cost to you";
> or may say he does not practice or does not take clients. Two different failures, one cause:
> "I do not practice" disqualifies Alex at the exact moment the reader is deciding whether he can
> help, and "I will connect you with a vetted agent" makes the reader feel brokered before they have
> said hello. Both describe how Alex gets paid instead of what the reader came for.
> **The site's job is to earn a conversation with a qualified buyer or seller. Alex handles the
> introduction himself, in that conversation, once he knows what they need.** State what he IS
> ("licensed real estate agent in South Carolina"), keep the buy/sell invitation short and warm
> ("let me know if you are looking to buy or thinking of selling"), and let the one-line licensee
> disclosure in the `/find-a-pro` fine print be the only mention of a fee anywhere. The three
> engines carry this as a NEVER EXPLAIN THE BUSINESS MODEL rule in their writer passes and as a
> hard cut-gate in their editor passes. This SUPERSEDES the earlier
> "tech-sales portfolio first" framing: the portfolio is now a **secondary, opportunistic
> benefit**, not the driver. The `/about` page still works as a hiring-manager front door if
> Alex happens to share the site on a job board, but the site is no longer built *for* hiring
> managers. See memory `alexprompts-portfolio-pivot` and `content-two-track-strategy`.
>
> Content runs on **two tracks**, now prioritized by their contribution to referral leads:
> 1. **The lead engine: evergreen local-SEO real-estate guides** (`scripts/greenville/` →
>    `/real-estate`, about 2/week). This is the track that carries buyer/relocation intent and
>    funnels to `/find-a-pro`. It is the priority; it is a slow-compounding SEO bet on a new
>    domain (6 to 18 months), so pair it with the relationship channel below.
> 2. **The credibility/authority layer: Greenville Works** (`scripts/tech/` →
>    `/greenville-works`, first-person deep-dives in Alex's own voice, about 1/week (scaled back
>    from 1 to 2 via a code cadence guard, July 2026); renamed from the national "Lab" tech track
>    in July 2026; **statewide South Carolina since July 10, 2026**, user-facing label "SC
>    Technology"). Each takes ONE thing where **technology or capital is reshaping South
>    Carolina** apart (data centers, the power grid and energy, fiber and connectivity,
>    manufacturing and automation at big employers, the port and logistics, who is buying and
>    with whose capital, and property technology
>    where it touches buying/selling/investing; the Upstate is home turf and wins ties),
>    explains how it works, and names the honest
>    trade-offs. That **tech-and-capital-meets-real-estate intersection is the niche** and the
>    differentiator (sharpened July 8, 2026; **deep-tech core sharpened July 15, 2026**: every piece
>    centers on a real technology or engineered system and takes its workings apart one level deeper
>    than local coverage, with capital and politics as the lens, never the whole subject); roads, water and sewer capacity, subdivisions, and
>    rezonings are only a secondary, occasional beat, allowed when they carry a real tech, capital,
>    or real-estate through-line. It builds local topical authority and makes Alex look legit, but
>    it does NOT directly capture leads, so it is the lower-priority track, deliberately slowed:
>    it gave up its weekly slot to the Upstate Brief in July 2026 and now runs about MONTHLY
>    (a scheduler change; the engine is untouched).
> 3. **The sphere artifact: the Upstate Brief** (`scripts/briefing/` → `/briefing`, added
>    July 9, 2026). ONE fixed-format Monday briefing read in five minutes. **Written for BUYERS
>    and SELLERS** (settled July 27, 2026), which is the same audience the referral funnel serves:
>    where the market stands, a buyer-versus-seller leverage read, **which ZIPs in Greenville
>    County have the room to negotiate** (the submarket cut), local development news, rates, and one
>    thing to watch. The professionals in Alex's sphere (loan officers, attorneys, agents) read that
>    same brief and forward it to their own clients, so there is no second version and no investor
>    audience. It exists for DISTRIBUTION: it is the recurring deliverable for Alex's sphere calls
>    ("want me to add you to the Monday brief?"), the concrete promise behind the owned-list
>    subscribe CTA, and it is Monday-perishable (publish Monday morning or delete; never late).
>    The two commercial-deed sections it launched with were cut July 27, 2026 (months-stale data,
>    wrong audience). See `scripts/briefing/SPEC.md` and memory `upstate-brief-weekly-engine`.
>
> **Referral revenue does not come from the blog alone.** Organic SEO is the long game; the
> faster channel is Alex's **sphere of influence** (mortgage loan officers, estate attorneys,
> the solid agents he already knows). The site is the credibility layer that makes those
> conversations land, and the Upstate Brief is the recurring excuse to be in their inbox. The public site copy below still presents the brand as
> Claude-for-real-estate; re-messaging the site is a separate, later call.

> **CURRENT POSITIONING (July 2026): Alex Steryous's personal site.** The old "Claude for
> real-estate agents and investors" teaching framing (the "voice 3" how-to product) was
> **removed in July 2026**. The site is now Alex's personal place with two kinds of content,
> honest writing on **Greenville real estate** and on **how the Upstate is
> changing** (Greenville Works), plus the free **real-estate tools** he built. Its primary
> goal is the **referral connector**: capture buyer/seller/relocation leads and hand them to
> vetted agents for a referral fee (see `/find-a-pro`). A **build-in-public portfolio** that
> showcases Alex to hiring managers (see `/about`) is a secondary, opportunistic benefit, not
> the site's job. The brand single-source-of-truth is **`src/lib/site.ts`** (tagline/slogan:
> *"Better real estate decisions."* since July 21, 2026, was *"Questions worth asking."* from
> July 11, "Growth is good." for one day before that, and "Where real estate meets technology."
> earlier; the slogan is now outcome-forward (it signals what the site is FOR and spans every
> reader who makes a real-estate decision, buyer/seller/loan officer/agent) and headlines the OG
> share card. "Questions worth asking." was a pun on the retired AI-prompts positioning, so it
> was dropped; the homepage mission headline was reworked to match the new slogan the same day;
> the phrase "in plain English" was dropped from
> ALL site copy July 9, 2026 because Alex found it unpolished — do not reintroduce it in
> user-facing copy). Do **not** reintroduce the
> single-tool, how-to-use-Claude teaching positioning, and do **not** revive the old
> frontier-tech-news framing. See memory `alexprompts-portfolio-pivot`,
> `content-two-track-strategy`, and `greenville-evergreen-seo-track`.

**Alex Prompts** is a personal media brand by Alex Steryous. It publishes on **Substack (the
newsletter and home base), YouTube, TikTok, and X**. The job is the referral lead stream
described in the strategic direction note above; building an audience is the supporting
longer-term goal, and the tech-sales portfolio is an opportunistic side benefit via `/about`.

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

This is the method for the analysis pieces. NOTE: the **Saturday national research engine was
killed July 5, 2026** (archived to `scripts/_archive/ai_news/`), and the Greenville local news
track was retired July 2026, so the two methods below are kept as **reference for the research
discipline** (honesty, hunt-the-confounder, steelman) that the LIVE local engines still inherit,
not as descriptions of running engines. The how-to teaching approach for the site + newsletter is
a SEPARATE thing and lives in `src/lib/site.ts` `principles` (start from a real outcome, assume
nothing, skip the hype, leave you able to do it again). Do not conflate the two.

The **Saturday research method** (retired, `scripts/_archive/ai_news/`), in order:
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

## Voice (mirror of the live engine writer passes — keep in sync)

The canonical voice rules live in the live engines' writer/editor passes
(`scripts/tech/routine/pass3_writer.md` for Greenville Works' first-person voice,
`scripts/greenville/routine/pass_evergreen.md` for the evergreen guides). The retired Saturday
engine's `pass3_writer.md` carried the same house style but now lives under
`scripts/_archive/ai_news/`. Site copy must match these rules:

- **No em dashes or en dashes, ever.** Use periods, commas, or restructure. (The routine
  enforces this in its passes; the website has no automated backstop, so do not introduce
  dashes in copy.)
- **No sentence fragments.** Every sentence has a subject and a verb, never a clipped burst for effect.
- **Flowing, complete sentences**, the way a person explains something out loud. Vary sentence length
  naturally, **and in BOTH directions** (tightened August 3, 2026): a run of long clause-heavy
  sentences of similar length is as much a machine tell as a run of clipped ones, and it is the more
  common failure. Put a short sentence next to a long one on purpose. Short is allowed and often
  better; the test is a subject and a finite verb, not a word count, so this is not a licence for
  fragments. Clarity carries the weight, not punchiness or staccato.
- **Never narrate the process** (August 3, 2026, all three engines). No piece tells the reader what
  the pipeline tried, what it could not reach, or what it fell back to ("the usual host was
  unreachable," "the MLS indicators were not available this week," "I could not confirm"). A human
  columnist never writes these, because a human never experiences a failed fetch; they go to the
  other source and come back with the number. This was the strongest LLM fingerprint in a shipped
  Upstate Brief. A limitation that lives in the WORLD may be stated once, attached to the figure it
  affects ("no one publishes this figure, so treat it as approximate"); one that exists only because
  a retrieval attempt failed is cut. Human newsletters hide the plumbing. Two companion rules ship
  with it: **one caveat per section** (hedging density reads as machine diligence, not editorial
  confidence) and **state a figure once** (repeating "24.2% vs 1.9%" three times is model
  reinforcement). See `scripts/CLAUDE.md` and memory `never-narrate-the-process`.
- **Clippable leads** (added July 27, 2026, all three engines). The opening sentence and the first
  sentence under each heading are written to survive being lifted out and pasted into X or Nextdoor:
  they stand alone, name the place and the thing measured, lead with the plain-language meaning and
  then stack two or three figures that earn it, keep a short source tag inside ("per the Greenville
  MLS"), and target under 200 characters. The model sentence is *"Greenville homebuyers have more
  leverage than a year ago: inventory is up 12%, homes are taking 52 days to sell (vs. 43), and the
  median sale price is still $330K, per the Greenville MLS."* This does NOT relax the rule above:
  those are complete sentences, not fragments, and the rest of the prose still flows. **Compress the
  prose, never the evidence** is the governing rule; cutting a figure, a baseline, or the source tag
  to hit a character count is a failure, not good editing. A colon introducing a genuine list of
  figures is correct here and is not the banned drumroll. State the market MECHANIC the figures
  measure ("more leverage"), never a verdict ("the market is loosening faster than the country") or
  advice ("buyers should offer under asking").
- **A link opens a page, never a download** (added August 10, 2026, all three engines). No link in
  an article may point at a data file, meaning a URL ending in `.csv`, `.xls`, `.xlsx`, `.pdf`,
  `.zip`, or `.json`. The August 10 Upstate Brief shipped with roughly a dozen figures linked to raw
  Zillow CSVs and its lead figure linked to a half-megabyte ShowingTime PDF, so a reader who clicked
  the words "61 homes" got a file download instead of a page. That reads as a broken site and it
  makes real sourcing look like a bug. The fix is a split the engines now carry in their data and
  their passes: the **verify URL** is the exact file a number came out of, it stays internal, and it
  is what the verifier re-opens to ground-truth the figure; the **cite URL** is the human landing
  page a reader may click (for every Zillow series that is `https://www.zillow.com/research/data/`,
  which also documents them). Where a source publishes only a document, as GGAR's monthly indicators
  and most county budgets and agendas do, the figure is **attributed in words with no link at all**,
  which is complete sourcing and never a defect. Two companion rules ship with it: **one link per
  source per piece**, at first mention (eleven figures pointing at one landing page reads as machine
  output; a columnist cites a source once), and **attribution is required, a link is not**.
- **Use colons sparingly.** Avoid the colon-as-drumroll and the "Label: payoff" construction; a colon only introduces a genuine list. Restructure into a full sentence where you can.
- Open cold and concrete. Lead with a fact, a scene, or a number.
- Plain English. Translate any jargon in one sentence a smart 15-year-old understands.
- **Grounded optimism.** Steelman the strongest opposing view before resolving.
- Banned fluff: "in an unprecedented move," "sent ripples," "the AI landscape,"
  "game-changer," "a new era," etc.

## The content engines (`scripts/greenville/` + `scripts/tech/` + `scripts/briefing/`)

See `scripts/CLAUDE.md`. **Claude routines only — Gemini was removed.** Three live engines, all
LOCAL to Greenville: the evergreen `/real-estate` lead engine, Greenville Works (the
local-change credibility track), and the weekly Upstate Brief (the sphere/distribution
artifact). All are **draft-first** (they insert DRAFT; Alex reviews and
publishes at `/review`; see memory `publishing-draft-first`). The old national Saturday research
engine (`ai_news/`) was **KILLED July 5, 2026** and archived to `scripts/_archive/ai_news/`. See
the strategic-direction and two-track notes above.

- **`_archive/ai_news/`** — the **RETIRED** national Saturday research engine (killed July 5,
  2026; couldn't out-rank national queries and had no distribution). Archived, reversible, nothing
  scheduled. Its weekly cloud-agent routine must also be deleted in the Claude scheduler.
- **`greenville/`** — the **local Greenville, SC** engine. A nightly **self-sourcing evergreen
  local-SEO** engine: each eligible night (about two a week) it writes one substantial,
  data-grounded local guide (`/real-estate`) + an X post, targeting a winnable long-tail local
  query and funneling relocation/buyer leads to `/find-a-pro`. **Draft-first** (July 2026): it
  inserts a DRAFT and Alex publishes it at `/review`. It prefers the optional
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
  isolated passes: scout → researcher → angle → writer → editor) takes ONE thing where
  **technology or capital is reshaping South Carolina** apart (a data center, the grid, fiber,
  automation at a factory, the port, who is buying and why, proptech; statewide since July 10,
  2026 with the Upstate as home turf; roads/water/subdivisions only as a
  secondary beat that carries a tech/capital/real-estate through-line) in
  **Alex's own first-person voice**, grounds it with web search, names the honest trade-offs,
  and funnels relocation/buyer leads to `/find-a-pro` where the topic fits, then inserts a
  **DRAFT** `blog_posts` row tagged `greenville works` for **`/greenville-works`** (**draft-first**
  as of July 2026, was live; the review email carries the post id + a `/review` link Alex uses to
  publish, same manual flow as the Greenville engine). Its job is twofold: unify the
  site around one local promise (better SEO and referral leads) and still prove Alex can take a
  real system apart and translate it into what it means for a business. Target cadence about
  1/week, set by the CLOUD SCHEDULE (one night, e.g. Sunday), with a STEP 0B safety guard as a
  backstop only (skip on a same-day duplicate run, or when 2+ Greenville Works drafts are already
  awaiting review): it is the lower-priority credibility track now that referral revenue is the
  north star and the `/real-estate` evergreen engine is the lead engine. **July 9, 2026: its
  weekly slot went to the Upstate Brief; reschedule the Works cloud routine to about MONTHLY**
  (engine untouched). See `scripts/tech/routine/README.md`.
- **`briefing/`** — the **Upstate Brief engine** (added July 9, 2026). A **Mondays-only** cloud
  routine (schedule ~08:00 UTC, after the Sunday 22:00 UTC housing-data refresh) that writes
  ONE fixed-format weekly briefing for `/briefing` (tag `briefing`), **for buyers and sellers**:
  the Upstate vs the country, a buyer-versus-seller leverage read, **Where the leverage is** (the
  ZIP-level submarket cut across Greenville County: the spread, the movers, one rotating angle),
  around town, rates from primary sources, one concrete watch indicator. No
  scout or angle pass (the format is the angle), but it does add a dedicated **verifier** between
  the writer and the editor that re-opens every external web source and cuts what will not confirm:
  collector → writer → verifier → editor, then a **DRAFT** insert and a review packet whose links
  include the one-click `/api/broadcast` send. Cross-week dedup recalls recent published briefs from
  Supabase. **The commercial-deed sections were CUT July 27, 2026** ("Who's buying" + "What traded":
  a third of the brief on months-stale data for an investor audience the brief does not serve);
  `commercialSales.json` still powers `/tools/buyers-list` and must not come back into the brief.
  **Monday-perishable:** Alex publishes + broadcasts Monday morning or deletes the draft; the
  orchestrator refuses to run while a briefing DRAFT is pending. Optional steer file
  `briefing/watchlist.md`. See `scripts/briefing/SPEC.md` + `scripts/briefing/routine/README.md`.

The two RE engines were reoriented from the old frontier-tech-news brand in June 2026; the
Lab was added July 2026 for the portfolio pivot, then refocused into Greenville Works later in
July 2026 to unify the site around the local vertical. The legacy dental pipeline is retired
under `scripts/_archive/` — do not revive it.

## Site structure

> **CONSOLIDATION, August 12 to 14, 2026. Read `scripts/publication/SPEC.md` first; it
> outranks this section wherever the two disagree.** Three content tracks became ONE
> publication about **the South Carolina economy explained through its COMPANIES**, built on
> primary documents, cadence about every two weeks and published ON FINDING. The question
> every issue answers is **how does this company actually make money, and what would break
> it**, and the hard rule is that every issue produces at least one number nobody had computed.
>
> **The beat moved once, on August 12.** The first spec was an ACCOUNTABILITY beat, going back
> and checking announced promises against the record. Alex read it and said it was not
> interesting to him and that he would rather the beat be business. That criterion is decisive
> and is not to be re-argued: he writes this for years. Some site copy shipped on the old beat
> before the rewrite caught up (the tagline "Who pays for South Carolina's growth.", the
> homepage headline "Somebody should go back and check."); all of it was moved to the company
> beat on August 14. If you find prose anywhere that sounds like a watchdog auditing promises,
> it is a leftover and it is wrong.
>
> **The reader is the DEVELOPER and the real estate entrepreneur** (narrowed August 14, 2026
> from the whole professional bench), with the loan officer, closing attorney, agent, banker,
> and economic-development professional behind them. They still read and forward it; they are
> just not what the piece is aimed at. Alex is NOT a developer and no copy may imply he is:
> the authority comes from the documents, not the byline.
> `scripts/briefing/` and the `scripts/greenville/` evergreen track STOP PRODUCING; their
> published work and routes stay live and reachable from the footer under "Archives". The
> engine evolves from `scripts/tech/`, so new pieces still carry the `greenville works` tag
> and land at `/greenville-works` (**the route is deliberately unchanged**; renaming it would
> break every published URL, the sitemap, and the tag the engine writes).
> **The publication is deliberately UNNAMED** until a few issues exist, so `site.name` is
> still "Alex Prompts" as a placeholder and the nav label for the live section is the
> placeholder **"Reporting"**. Those two strings are the first things to change when the name
> lands. Also settled: SEO is no longer a growth lever (zero-click search plus AI Overviews),
> so the evergreen how-to guides are dead as a CATEGORY, not merely deprioritized.
>
> **THE NINE FREE TOOLS ARE DELETED (August 14, 2026), not hidden.** `/tools` and every
> `/tools/<slug>` route 404s now, and `src/lib/tools.ts`, `src/components/tools/`,
> `ToolShell`, `ToolIcon`, `areaScan.ts`, `wireSafety.ts`, `/api/area-scan`, and
> `/api/area-autocomplete` are gone from the repo. They served the consumer buyer, the
> audience this publication stopped serving, and a calculator suite under a masthead reads as
> a lead-gen site rather than something you read. **This removes the operation's only paid API
> surface**, so `GOOGLE_PLACES_API_KEY`, `CENSUS_API_KEY`, `AREA_SCAN_DAILY_CAP`, and
> `AREA_SCAN_RATE_LIMIT` are now unused by the site (the env table below is stale on this).
> `scripts/greenville/commercial.py` and `src/data/commercialSales.json` SURVIVE as engine
> research input even though nothing in `src/` imports the dataset any more; do not delete the
> collector for looking orphaned. `src/lib/rateLimit.ts` also stays (subscribe, refer, admin
> login).
>
> **Nav is `Reporting | About` plus Subscribe and the Buying or Selling CTA.** The three
> content tracks stopped being peers; `/briefing` and `/real-estate` keep every published
> piece and moved to the footer under "Archives".
>
> **What follows is STALE where it describes the old three-track nav, the old five-section
> homepage, the nine tools, and the "Better real estate decisions." tagline.** Kept for
> history; it gets rewritten in one pass when the publication is named.

- `/` — **the front page (RESTRUCTURED August 2026).** Does ONE job, convince a qualified
  stranger to hand over an email address, in three sections: **standfirst + the ask** (a
  compact masthead statement, the headline "Somebody should go back and check.", two
  paragraphs, and an inline `SubscribeForm`, all above the fold) → **the work** (featured
  latest + a "More to read" grid from `getFeedPosts`) → **tools**, demoted from a nine-card
  icon grid to one line and a row of text links, because they are a side door and not the
  point. **REMOVED:** the "mission" contrast panel (folded into the standfirst, since a
  mission stated twice on one page is stated badly) and the "Where to find us" social card
  grid (the footer carries every handle, and a row of links to other people's platforms was
  pointing the one job off-site). Do not re-add either without a reason.

- **HISTORY, the pre-consolidation landing:** it was a **content-first landing.** Led with the
  writing, not a brochure: **fresh from
  Alex Prompts** (featured latest issue + recent, driven by `getFeedPosts`) is the lead
  section → **the mission** (July 10, 2026: replaced the "behind the site" tech-stack blurb;
  REWRITTEN BY ALEX July 11, 2026, then REWORKED July 21, 2026 to track the "Better real estate
  decisions." slogan: headline **"Better real estate decisions."** (same as the slogan,
  deliberately), then the ONE-sentence mission (emphasized) "Alex Prompts helps South
  Carolinians make smarter real estate decisions, with honest writing on the market, the
  technology reshaping it, and free tools to run the numbers yourself.", then two closing
  paragraphs ("Most media tells people what to think." / "Alex Prompts gives you the facts and
  the trade-offs, so the call stays yours. The last decision is who is in your corner, and that
  is the one I help with directly."). **The closer was extended July 29, 2026 to name the
  handoff.** It used to end at "so the call stays yours", which read as a promise that the reader
  never needs anyone, the one thing a referral business cannot tell people; the mission was
  fulfillable without the reader ever making contact. The fix frames the introduction as the LAST
  step of the decision rather than a bolted-on CTA, and it is honest because Alex is licensed and
  does not compete for the client. The final clause is deliberately first person (the rest of the
  block is third person) so a reader sees a person doing the handoff, not a form. Note the whole
  site's copy is UNCONTRACTED ("who is", never "who's"); there is not one contraction anywhere in
  `src/`, so keep it that way. The earlier
  pro-growth manifesto ("Grow or die." then briefly "Growth is good." / "from no to how" /
  "Stagnation is death.") was REMOVED from the homepage that same day; the pro-growth stance
  still drives the engines' editorial method (see memory `pro-growth-editorial-stance`) but is
  no longer stated as the homepage mission — the mission sentence always LEADS and the
  explanation never repeats it; keeps the Meet Alex → `/about` link; the full under-the-hood
  teardown still lives on `/about`; see memory `pro-growth-editorial-stance`) → **tools spotlight** (the live tools,
  clickable, driven by `liveTools()`, framed as engineering) → follow → subscribe. The old "Start here" hero/pillars, the "helps anyone" grid, the "how
  every guide works" strip, the manifesto, and the "what you'll do with Claude"
  (`realEstateOutcomes`) grid were all **removed** (the last one in July 2026 with the voice-3
  removal). The teaching-content exports they used (`tools`, `principles`, `realEstateOutcomes`,
  `outcomes`, `manifesto`) were **deleted from `site.ts`**; do not reintroduce them. The
  *Subscribe* CTA still rides along. Content is free, money model is later.
- `/tools` + `/tools/<slug>` — **DELETED August 14, 2026. All nine tools are gone and these
  routes 404.** See the consolidation banner at the top of this section. The paragraph below is
  HISTORY, kept because it records what existed and why each tool cost nothing to run; do not
  read it as a description of the live site, and do not rebuild any of it without a reason that
  survives the "this publication is not a lead-gen site" test. HISTORY:
  **free, no-sign-up tools for the audience**, the single
  source being `src/lib/tools.ts` (`toolCatalog`), which is the ONLY authority on what is
  live; check it before describing the tools anywhere in copy or docs. **Nine live as of July
  27, 2026:** `deal-analyzer` (rental cash flow / cap rate / cash-on-cash), `mortgage`
  (payment + affordability), `property-tax` (SC estimator), `schools` (Greenville lookup),
  `cost-of-living` (BEA RPP compare), `wire-safety` (wire-fraud check), `buyers-list`
  (Greenville County commercial sales: buyer/LLC, price, date, address), `area-scan` (Google
  Places neighborhood/saturation), and `taraform` (the external CRM at taraform.org, no local
  route). (The `listing-prompt` builder was removed July 21, 2026: it served agents, the
  audience the site dropped with voice-3, so it did not fit the referral-revenue north star.
  Three pieces of live copy still advertised it until July 27; when a tool ships or is
  removed, grep `src/` for its name.) Every tool but `area-scan` costs nothing to run:
  most are pure client-side with no API, and `buyers-list` reads a committed JSON dataset
  (`src/data/commercialSales.json`) built by `scripts/greenville/commercial.py` from the
  county's free public ArcGIS service, so that page is statically generated. **`area-scan`
  went LIVE (it was registered `soon`), and it is the one tool that calls a paid Google API.**
  Alex confirmed the console-side daily quotas on July 27, 2026, and those quotas, not the
  code, are what cap billing. The code still fails safe: with `GOOGLE_PLACES_API_KEY` unset,
  `src/lib/areaScan.ts` returns `not_configured` and the page renders a clean "not configured"
  panel. Every tool page wraps in `components/ToolShell.tsx` (header + honest not-advice
  note + soft subscribe capture). The registry feeds the hub, the homepage spotlight, nav,
  footer, and sitemap, so a tool ships in one place and appears everywhere.
- `/about` — **REWRITTEN August 14, 2026 as the publication's MASTHEAD.** It opens on the
  reader's problem ("Announcements are not information."), spends its credibility section on
  the METHOD (filings, job postings counted over time, permits and deeds, incentive agreements
  and minutes) rather than on Alex, names who it is for, reaches the author last and briefly,
  and closes by asking for tips and documents plus the short warm buy/sell invitation. **Three
  things were deleted and must not return.** (1) The "under the hood" section that told readers
  "a set of AI agents I wrote research a real Greenville story, draft it, check their own facts,
  and publish straight to the site" — on a publication whose whole value is that a person read
  the primary documents, that is fatal on contact. The engine still drafts and Alex still
  reviews and publishes; that is a workflow detail, not a masthead claim. (2) The business
  model, stated outright as "a sales funnel for real estate leads" and "a lead generator",
  which also violates the NEVER EXPLAIN THE BUSINESS MODEL rule. (3) The credibility pitch, per
  Alex's instruction to speak to the reader instead of hyping him; the eight years of BD, sales,
  and land acquisition appear once, as the reason he knows how to do this work, never as a
  boast. The "want a site like this?" side offer went too. The paragraph below is HISTORY:
  the **opportunistic hiring-manager front door** (if Alex shares the site on a
  job board he can link resumes/LinkedIn straight here, not to `/`). It is no longer what the
  site is *for* (referral revenue is the north star), but it costs nothing to keep and catches
  a hiring manager when one happens to look. Who Alex is (salesperson, ~8 yrs BD/sales, aiming
  back into tech sales), why he built
  the site, an "Under the hood" technical teardown of how the site works (self-publishing AI
  agents, the double-opt-in email system, the tools + auto-rendered covers, built solo inside
  free tiers) framed as proof he is a self-taught builder who genuinely enjoys tech, then a
  LinkedIn + email connect CTA. Fully custom copy (no longer renders `site.ts` teaching
  exports). Serves everyone, not only hiring managers, so it never literally addresses them.
- `/greenville-works` + `/greenville-works/[slug]` — **Greenville Works**, the local-change
  track. **User-facing label is "SC Technology"** (July 10, 2026; was "Upstate Technology" from
  the July 9 nav clarity pass, and briefly "Technology" earlier that same day): the nav tab,
  footer link, homepage feed badge, the page `<title>`, the index eyebrow, the article
  breadcrumb, and the `/admin` badge all say SC Technology; "Greenville Works" survives as the
  engine/series name in docs and the tag.
  URLs, the `greenville works` tag, and internal `works` keys are UNCHANGED (added July 2026 as the "Lab" for the portfolio pivot, then renamed and refocused
  from national tech to Greenville-local later that month, then niche-sharpened to the
  tech-and-capital-meets-real-estate intersection July 8, 2026, then **widened to STATEWIDE South
  Carolina July 10, 2026** because the Upstate alone may not carry the cadence and Alex wants the
  whole state's tech story; the Upstate stays home turf and wins ties). First-person deep-dives
  that take ONE thing where **technology or capital is reshaping South Carolina** apart (data
  centers, the grid and energy, fiber, manufacturing and automation, the port and logistics, who
  is buying and with whose capital, proptech; roads/water/subdivisions only as a secondary beat
  with a real through-line), explain how it works, show what it means for where we live, work,
  and invest, and name the honest trade-offs. Backed by Supabase `blog_posts` tagged
  `greenville works` (a tag-routed section in `src/lib/posts.ts` `sectionOf`, internal
  `PostType` key `works`, distinct from the `greenville` real-estate tag), written as a **DRAFT**
  by the `scripts/tech/` routine (**draft-first** as of July 2026, was live) and published by Alex
  at `/review` after he reviews the emailed piece. On publish, `/api/publish` sets the article
  **cover photo** immediately from the same curated Greenville library the `/real-estate` pieces
  use (the writer names a `subject:`, stored in `image_address`, with the city-level default when
  it is missing; no API key, no cost; the draft editors preview the resolved photo via
  `src/lib/editorCover.ts` — added July 10, 2026, covers used to wait for the daily cron), and the
  `/api/finalize-greenville` cron remains the backstop that also **broadcasts the piece to the
  owned email list** exactly once. The curated photo
  shows as the article hero, an index thumbnail (`PostCover`, with the branded `>` placeholder
  when a cover is still pending), the homepage feed card, and the share/OG card. The `getFeedPosts`
  homepage stream includes Greenville Works posts.
- `/briefing` + `/briefing/[slug]` — the **Upstate Brief** (added July 9, 2026): one
  fixed-format Monday post with the week in Upstate real estate in five minutes. Tag-routed via
  `sectionOf` (tag `briefing`, internal `PostType` key `briefing`, section label "Briefing");
  written as a DRAFT by `scripts/briefing/`, published + broadcast by Alex Monday morning
  (one-click broadcast link in the packet; the 13:00 UTC finalize cron is the backstop for
  cover + broadcast). The index page carries its own owned-list `SubscribeForm` because the
  brief never goes to Substack. In nav as "Upstate Brief". This is the site's subscribe promise
  ("Get the Upstate Brief every Monday") and the deliverable for Alex's sphere calls.
- **Nav clarity pass (July 9, 2026, "if you confuse you lose"):** every nav label states its
  promise in the visitor's words. The nav reads **Upstate Brief | Tools | Moving to
  Greenville | SC Technology | Buying or Selling | About** (**"Find an Agent" became "Buying or
  Selling" July 30, 2026**: the old label named the mechanism and assumed the visitor had already
  decided they wanted an agent, when the site's actual job is to help buyers and sellers first
  and hand the lead off second. The ROUTE stays `/find-a-pro` because renaming it would break
  inbound links, the sitemap, and the `ref=` attribution already stored in `referral_leads`. The
  same reframe hit the footer link, the `/find-a-pro` eyebrow and headline, and the `ReferralCta`
  copy, which no longer opens on "Real estate referrals". **August 1, 2026 finished the job**: the
  page `<title>` still read "Find an Agent" (so the BROWSER TAB said it even though the nav did
  not), and the body still explained the mechanism. Title is now "Buying or Selling", the H1 is
  "Buying or selling? Tell me what you are working on.", the three steps are tell me / we talk it
  through / I stay in your corner, the trust cards lost "A vetted bench, not a coin flip" and the
  commission-split card, and the `ReferralForm` submit button went from "Connect me with a pro" to
  "Send it over"; routes and tags unchanged;
  `/briefing`, `/real-estate`, `/greenville-works`, `/find-a-pro`; the tech tab became "SC
  Technology" July 10 with the statewide widening), and the `/archive`
  newsletter mirror was DROPPED from the nav (footer only). Homepage card badges match
  ("Upstate Brief", "SC Technology"; the real-estate badge stays the compact topic chip
  "Real Estate" since investor/tax guides fit it better than "Moving to Greenville"). The
  `/real-estate` index hero was also rewritten then; it had still carried the retired news
  track's "both sides" copy. **July 10, 2026: the nav's Subscribe CTA now points at
  `/subscribe`** (a dedicated owned-list capture page) instead of Substack, since the
  subscribe promise (the Monday Brief) only ships on the owned list; the owned list is ONE
  list, every confirmed subscriber gets every broadcast (Brief + Greenville guides + SC
  Technology), no per-category segmentation by design. Substack is demoted to the form's
  secondary link.
- `/find-a-pro` — the **real-estate referral connector** (added July 2026, replaced the
  removed `/guides`; briefly shipped as a `/for-sale` listings tab, reshaped once the goal
  became clear). Alex is a licensed SC agent but has a full-time job and does NOT practice, so
  the play is to capture legit buyer/seller intent and **refer it to active agents for a
  referral fee** (referrals are not local: relocation leads to any market count, which fits the
  national Alex Prompts audience). Deliberately NOT a listings page: a new domain cannot
  out-rank the portals on listing searches, and Alex cannot service clients. **This page is the
  site's #1 conversion surface** now that referral revenue is the north star. It was rebuilt
  July 2026 from a light email capture into a real conversion page: honest first-person copy +
  a "How this works" 3-step + trust cards (all of which were rewritten August 1, 2026 to stop
  explaining the referral mechanism; see the strategic-direction note above, and the copy-rule
  comment at the top of `src/app/find-a-pro/page.tsx`), and a **qualifying lead form** (`ReferralForm`) that
  captures intent (buy/sell/both), market, timeframe, and contact, then POSTs to **`/api/refer`**.
  That route stores a row in the Supabase **`referral_leads`** table (service key, RLS-denied to
  anon, NOT the newsletter `subscribers` list, so no double opt-in for a hot lead) and emails Alex
  a notification (`leadNotifyEmail`) so he can follow up warm. The store succeeds even when Resend
  is unconfigured (the row is the source of truth). **Requires the `referral_leads` table from
  `supabase/schema.sql` to be applied.** (The eXp BoldTrail IDX site
  Alex set up is not used here; if he goes referral-only to save active dues he loses it, and
  this model does not need it.)
- `/archive` + `/archive/[slug]` — issue archive, backed by Supabase `blog_posts`.
  **Auto-mirrored from Substack:** `/api/sync-substack` (daily Vercel cron, `vercel.json`)
  reads the publication RSS feed, converts each post's HTML to markdown via
  `src/lib/substack.ts` (turndown; images kept as `<figure>`/`<figcaption>`), and upserts
  rows as `PUBLISHED`. So posting on Substack populates the site with no manual step.
- `/admin` — the **draft review hub** (not in nav; the primary way Alex reviews drafts).
  Log in once with a password (= `PUBLISH_SECRET`); `/api/admin/login` sets an httpOnly
  `ap_admin` cookie (rate-limited, constant-time compare), so the secret never rides in a URL.
  `/admin` lists every DRAFT `blog_posts` row with Edit (`/admin/edit/[id]`, the shared
  `review/Editor`) + one-click Publish, plus recently published. Auth lives in
  `src/lib/adminAuth.ts`. This replaces the fragile `/review?token=` flow (URL-special chars in
  the secret broke it) but that flow still works.
- `/review` — token-gated draft editor (not in nav), the legacy per-draft link the engine
  emails carry (`/review?id=..&token=..`). `/api/publish` + `/api/review/save` drive the manual
  publish flow (flip `blog_posts.status` to `PUBLISHED`, revalidate the section). `GET
  /api/publish?token=` is the routine's one-click email publish (token-only, never the cookie, so
  it is not CSRF-able); `POST /api/publish` is the cookie-authed `/admin` publish. Kept for
  engine-generated drafts; the Substack mirror is the live path for newsletter posts.

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
  (Greenville `/real-estate`, Greenville Works `/greenville-works`, the Upstate Brief
  `/briefing`) that never goes to Substack. Useful params: `&test=you@example.com` sends ONE
  preview and touches neither the list nor the stamp, `&dry=1` reports the recipient count
  without sending, `&force=1` resends. **July 29, 2026: broadcasts carry the FULL ARTICLE**
  (the Morning Brew model), not a title-plus-summary teaser. A click-through is friction on a
  five-minute read, and the list is sphere professionals whose habit is the whole point.
  `src/lib/emailMarkdown.ts` renders `body_md` to inline-styled email HTML; it is deliberately
  SEPARATE from the site's `renderMarkdown.ts` because email clients drop classes and `<style>`
  blocks, and because the site rewrites images to relative `/_next/image` URLs that cannot
  resolve in an inbox. Rendered once per send, not per recipient. Worst case measured across all
  24 published posts is 19KB, about 19% of Gmail's ~102KB clip threshold, so there is wide
  headroom. Full-content sends widen the card to 600px and, on the `greenville` track only
  (mirroring `ArticleView`'s `showReferralCta`), append the referral offer linking to
  `/find-a-pro?ref=<slug>&utm_source=email&utm_medium=broadcast&utm_campaign=owned-list`, so an
  inbox-originated lead still attributes in `supabase/queries.sql`.
  `blog_posts.last_broadcast_at`
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
- **`referral_leads`** is the **`/find-a-pro` conversion table** (the site's #1 revenue
  path). Service-key only (RLS denies anon), deliberately separate from `subscribers`: a person
  who fills out the referral form is a HOT lead asking to be contacted, not a newsletter signup,
  so there is no double opt-in. Columns: `name`, `email`, `phone`, `intent` (buying/selling/both),
  `location`, `moving_from`, `timeframe`, `message`, `source`, `status` (new/contacted/placed/dead),
  `contacted_at`, plus **first-party attribution** (Phase 4, no third-party analytics): `ref_slug`
  (the article slug the in-article `ReferralCta` carried in `?ref=`), `referrer` (document.referrer),
  `landing_path`, and `utm_source`/`utm_medium`/`utm_campaign`. `ReferralForm` captures these on
  mount and posts them; `/api/refer` stores them and the notification (`leadNotifyEmail`) shows a
  "Came from" line (article > campaign > referrer). The attribution queries live in
  **`supabase/queries.sql`** (read-only, paste into the Supabase SQL editor): leads by article,
  every published guide *including the zero-lead ones*, channel mix, capture surface, the funnel
  by intent, weekly trend, response time, and the open work queue. All of them exclude
  `status = 'dead'`, which is where test rows go, so a test submit never inflates a rate.
  Written by `/api/refer` (via `src/lib/leads.ts`), which also emails Alex a notification. **Requires
  the `referral_leads` table + attribution columns from `supabase/schema.sql` to be applied.**

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
| `EMAIL_POSTAL_ADDRESS` | The physical mailing address printed in the owned-list email footer. **CAN-SPAM requires one on commercial email**, and it matters most for contacts Alex ADDED BY HAND off a sphere call rather than through the form. Unset = the line is simply omitted (no placeholder ever ships), which leaves the one compliance gap open, so set it before the list grows past Alex's own addresses. Use a PO box, not a home address. Read in `src/lib/emailTemplates.ts`. |
| `SUBSCRIBE_RATE_LIMIT` | Optional. Per-IP signups/hour allowed on `/api/subscribe` (default 5). Plus a hardcoded per-address cap of 3 confirmation sends/hour. Soft, in-memory (`src/lib/rateLimit.ts`, resets on cold start); blunts signup spam and confirmation-email bombing. |
| `LEADS_NOTIFY_TO` | Optional. Where `/api/refer` sends the referral-lead notification email. Falls back to `EMAIL_REPLY_TO`, then `site.email` (`hello@alexprompts.com`). Set this to the inbox Alex actually watches so a new lead pings him fast. The lead is stored in `referral_leads` regardless, so an unset/unverified inbox never loses a lead. |
| `REFER_RATE_LIMIT` | Optional. Per-IP referral-form submits/hour on `/api/refer` (default 5). Soft, in-memory (same `rateLimit.ts` caveat). A real buyer submits once, so this only blunts abuse. |

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
