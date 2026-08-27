/**
 * Single source of truth for the Rebrew brand + links.
 *
 * Edit handles/URLs here and every surface (nav, footer, JSON-LD, sitemap,
 * metadata) updates. Voice mirrors the content engines' writer passes: plain
 * English, complete sentences, no em dashes, no hype.
 *
 * THE PUBLICATION IS NAMED REBREW, at rebrew.org (August 24, 2026). It had been
 * running unnamed since the August 2026 consolidation, with "Alex Prompts" and
 * the nav label "Reporting" sitting in as placeholders until a name landed. Both
 * of those were always meant to change here first, which is the entire point of
 * this file.
 *
 * NARROWED TO GREENVILLE, August 25, 2026, on Alex's instruction ("we write
 * about greenville real estate ... it's a real narrowing, take the whole
 * masthead to greenville"). The beat is Greenville real estate, built on
 * primary documents. This replaces the August 14 statewide "REAL ESTATE AND
 * BUSINESS landscape in South Carolina" scope with real estate and business
 * co-equal.
 *
 * The narrowing is a correction to the archive, not an ambition being trimmed:
 * 34 of the 36 published pieces mention Greenville, none is statewide in any
 * meaningful way, and the front page had been promising a territory the work
 * did not cover. scripts/publication/SPEC.md still carries the older statewide
 * language and is now BEHIND this file on scope; reconcile it there.
 *
 * The old host stays alive. alexprompts.com 301s to rebrew.org so every
 * published article URL, every subscriber who has the old link, and the engines'
 * review links keep working. Do not let it lapse without redirecting the
 * article paths somewhere.
 *
 * Do NOT reintroduce the retired "Claude for real estate agents and investors"
 * teaching positioning, or the free-tools framing (the nine tools were deleted
 * August 14, 2026).
 */

// Canonical host is www, carried over from the alexprompts.com setup: the apex
// 308-redirects to www at Vercel and Cloudflare proxies www, so www is the real
// serving host. Everything canonical (sitemap locs, per-page canonicals, OG,
// robots) derives from this one value, so it MUST match where the site actually
// serves or Google gets mixed signals. If you would rather serve the bare apex
// now that the domain is short, this is the one line to change, but change the
// Vercel primary domain in the same sitting so the two never disagree.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://www.rebrew.org";

// Substack publication base (NOT the profile page). Drives the Subscribe button
// (-> /subscribe) and the archive RSS mirror (-> /feed, see lib/substack.ts).
// STILL alexprompts.substack.com after the Rebrew rename, on purpose: a Substack
// publication's subdomain is its identity over there, the two mirrored archive
// posts link to it by absolute URL, and renaming it is a job to do on Substack
// with its own redirect, not a string to flip here. Override with
// NEXT_PUBLIC_SUBSTACK_URL once that is done. One place, and the button + sync
// both pick it up.
export const SUBSTACK_URL =
  process.env.NEXT_PUBLIC_SUBSTACK_URL?.replace(/\/$/, "") ?? "https://alexprompts.substack.com";

/** RSS feed the archive mirror reads. Server-only; override with SUBSTACK_FEED_URL. */
export function substackFeedUrl(): string {
  return process.env.SUBSTACK_FEED_URL?.replace(/\/$/, "") ?? `${SUBSTACK_URL}/feed`;
}

export const site = {
  name: "Rebrew",
  author: "Alex Steryous",
  // TODO(alex): this inbox has to actually exist and be verified in Resend
  // before the next broadcast goes out. See the note on SUBSTACK_URL below.
  email: "hello@rebrew.org",
  url: SITE_URL,

  // The brand spine. These strings drive the page titles, the meta descriptions,
  // the OG cards, and the footer, so keep them true and tight. No hype, no doom,
  // and no "plain English" phrasing anywhere (dropped July 2026, it read as
  // unpolished).
  //
  // THE SCOPE NARROWED August 25, 2026 (Alex's call) to GREENVILLE REAL ESTATE.
  // It had widened on August 14 to the real estate and business landscape of the
  // whole state, with the two co-equal. That was aspirational: the published
  // archive is a Greenville publication (34 of 36 pieces), so the masthead was
  // naming a beat the work did not cover.
  //
  // Business is not banned from the publication and company teardowns remain a
  // good form. It simply stopped being half of the STATED territory, because a
  // masthead names what a reader will reliably get.
  //
  // SALES PERFORMANCE WAS ADDED August 25, 2026, on Alex's instruction: "we
  // discuss real estate, specifically in greenville, and sales performance
  // (often linked to real estate sales) backed by academic research and data."
  // The publishing had already moved first: the August 24 and August 25 pieces
  // are both research reads, one on what the housing research says about getting
  // the best sale price and one on whether sales leaderboards actually work. This
  // file was the last thing still describing the old beat.
  //
  // What the reader is promised: research and data on the Greenville market and
  // on how sales actually get made, written up for buyers and sellers who want to
  // know what a good agent does and how a sale gets positioned.
  // See scripts/publication/SPEC.md, which still carries the older statewide
  // language and is behind this file on scope.
  //
  // THE TAGLINE IS A PLAIN LABEL, not a slogan. Do not "improve" it into a
  // sentence and do not expand the ampersand. It names the territory the way a
  // masthead names a beat, and two prior taglines died of being slogan-shaped,
  // so the bar here is mechanical description. The first half was Alex's own
  // words; the second half was added with sales performance on August 25, 2026
  // and tracks the headline he wrote on the front page.
  //
  // Retired, for the record: "SC Real Estate & Business" (August 14 to 25, 2026,
  // killed by the Greenville narrowing), "How South Carolina actually makes money." (two
  // days, too narrow once real estate became co-equal), "Who pays for South
  // Carolina's growth." (two days, accountability-beat leftover that read as
  // watchdog), "Better real estate decisions." (July 21), "Questions worth
  // asking." (July 11, an orphaned pun on the retired AI-prompts positioning),
  // "Growth is good." (one day), "Where real estate meets technology."
  //
  // The tagline is deliberately NOT the name and does not repeat it. "Rebrew"
  // says nothing about the beat on its own, which is normal for a masthead, so
  // the tagline carries the whole job of naming the territory.
  //
  // WHAT THE COPY IS FOR: a reader should learn immediately that they can get an
  // insightful picture of what the Greenville market is really doing and WHY.
  // TRENDS and INCENTIVES are the spine. A draft that led on testing what people
  // in the market claim was cut August 14, 2026; that is one input, not the job,
  // and leading with it made the publication sound smaller than it is.
  tagline: "Greenville Real Estate & Sales Performance",

  // THE MASTHEAD STATEMENT. Alex's line, written on the front page August 26,
  // 2026, and moved here the same day so it stops being homepage-only copy.
  //
  // It belongs in this file because it is doing brand work, not page work: it
  // is the one line that connects the NAME to the BEAT. "Rebrew" says nothing
  // about real estate on its own, and the coffee-cup-and-house mark
  // (src/components/Mark.tsx) says it only to someone who already gets the
  // joke. This sentence is where the pun pays off, so every surface that
  // introduces the publication cold should be able to reach it. The share card
  // does; the homepage does. Both now read it from here rather than each
  // keeping a copy, which is how the old subscribe-page promise drifted a week
  // behind the beat.
  //
  // Keep the period. It is a statement, not a headline fragment, and the house
  // style bans fragments.
  headline: "What’s brewing in Real Estate.",

  oneLiner:
    "Research and data on Greenville real estate and on sales performance, read and written up by Alex Steryous.",
  description:
    "We read research papers about real estate and sales performance and share what we find " +
    "interesting. What the Greenville numbers are doing, what the evidence says about " +
    "positioning a sale, and what good agents actually do.",
} as const;

/** Social + newsletter links. The "follow everywhere" row + footer derive from this. */
export const socials = [
  {
    key: "substack",
    label: "Substack",
    handle: "Read the newsletter",
    url: SUBSTACK_URL,
    primary: true,
  },
  {
    key: "youtube",
    label: "YouTube",
    handle: "@alex_prompts",
    url: "https://www.youtube.com/@alex_prompts",
  },
  {
    key: "tiktok",
    label: "TikTok",
    handle: "@alex_prompts",
    url: "https://www.tiktok.com/@alex_prompts",
  },
  {
    key: "x",
    label: "X",
    handle: "@steryously",
    url: "https://x.com/steryously",
  },
] as const;

/** The Subscribe button target: Substack's one-click subscribe page. */
export const newsletterUrl = `${SUBSTACK_URL}/subscribe`;
