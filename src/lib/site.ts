/**
 * Single source of truth for the Alex Prompts brand + links.
 *
 * Edit handles/URLs here and every surface (nav, footer, JSON-LD, sitemap,
 * metadata) updates. Voice mirrors the content engines' writer passes: plain
 * English, complete sentences, no em dashes, no hype.
 *
 * Positioning (July 2026): Alex Prompts is Alex Steryous's personal site. Two
 * kinds of content live here, honest plain-English writing on Greenville real
 * estate and on how South Carolina is changing (SC Technology, engine name
 * Greenville Works; statewide since July 10, 2026), plus the free real-estate
 * tools he built himself. It doubles as a build-in-public portfolio (see /about)
 * and a referral connector (see /find-a-pro). The earlier "Claude for real
 * estate agents and investors" teaching framing was removed in July 2026; do NOT
 * reintroduce a single-tool, how-to-use-Claude positioning anywhere in the copy.
 *
 * TODO(alex): confirm the contact email.
 */

// Canonical host is www (July 2026): the apex 308-redirects to www at Vercel and
// Cloudflare proxies www, so www is the real serving host. Everything canonical
// (sitemap locs, per-page canonicals, OG, robots) derives from this one value, so
// it MUST match where the site actually serves or Google gets mixed signals.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://www.alexprompts.com";

// Substack publication base (NOT the profile page). Drives the Subscribe button
// (-> /subscribe) and the archive RSS mirror (-> /feed, see lib/substack.ts).
// Confirmed June 2026: https://alexprompts.substack.com. Override with
// NEXT_PUBLIC_SUBSTACK_URL only if a custom domain is set up later. One place,
// and the button + sync both pick it up.
export const SUBSTACK_URL =
  process.env.NEXT_PUBLIC_SUBSTACK_URL?.replace(/\/$/, "") ?? "https://alexprompts.substack.com";

/** RSS feed the archive mirror reads. Server-only; override with SUBSTACK_FEED_URL. */
export function substackFeedUrl(): string {
  return process.env.SUBSTACK_FEED_URL?.replace(/\/$/, "") ?? `${SUBSTACK_URL}/feed`;
}

export const site = {
  name: "Alex Prompts",
  author: "Alex Steryous",
  email: "hello@alexprompts.com", // TODO(alex): confirm contact inbox
  url: SITE_URL,

  // The brand spine. These strings drive the page titles, the meta descriptions,
  // the OG cards, and the footer, so keep them true and tight. No hype, no doom,
  // and no "plain English" phrasing anywhere (dropped July 2026, it read as
  // unpolished).
  //
  // REWRITTEN AUGUST 2026 for the consolidation. Three content tracks became one
  // publication about WHO PAYS FOR SOUTH CAROLINA'S GROWTH, written for the
  // professional (loan officer, closing attorney, agent, banker, developer) whose
  // living depends on knowing the market, and built on primary documents. See
  // scripts/publication/SPEC.md.
  //
  // "Better real estate decisions." (July 21, 2026) was retired because it no
  // longer covers the work: a piece comparing two states' incentive grants is
  // off-mission under it, and stretching every growth story until it lands on a
  // property decision is how the writing gets weak. Earlier taglines, for the
  // record: "Questions worth asking." (July 11, an orphaned pun on the retired
  // AI-prompts positioning), "Growth is good." (one day), and "Where real estate
  // meets technology."
  //
  // The publication is deliberately still UNNAMED, so `name` stays "Alex Prompts"
  // as a placeholder. When the name lands it changes HERE and every surface
  // follows, which is the entire point of this file.
  tagline: "Who pays for South Carolina's growth.",
  oneLiner:
    "Alex Steryous goes back through South Carolina's permits, grant agreements, and county records to find out what actually got built.",
  description:
    "Every project in South Carolina arrives with a press release, a rendering, and a " +
    "jobs number, and almost nobody goes back to check what happened. Alex Steryous does, " +
    "using the permits, the grant agreements, the minutes, and the county records, and " +
    "writes up what he finds. Plus a set of free real-estate tools he built himself.",
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
