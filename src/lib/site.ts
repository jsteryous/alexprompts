/**
 * Single source of truth for the Alex Prompts brand + links.
 *
 * Edit handles/URLs here and every surface (nav, footer, JSON-LD, sitemap,
 * metadata) updates. Voice mirrors the content engines' writer passes: plain
 * English, complete sentences, no em dashes, no hype.
 *
 * Positioning (July 2026): Alex Prompts is Alex Steryous's personal site. Two
 * kinds of content live here, honest plain-English writing on Greenville real
 * estate and on how the Upstate is changing (Greenville Works), plus the free real-estate
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

  // The brand spine. What the site actually is: honest writing on Greenville
  // real estate and on technology, plus the free tools Alex built. No hype, no
  // doom, and no "plain English" phrasing anywhere (dropped July 2026, it read
  // as unpolished). These strings drive the page titles, the meta descriptions,
  // the OG cards, and the footer, so keep them true and tight.
  tagline: "Where real estate meets technology.",
  oneLiner:
    "Alex Prompts is where Alex Steryous writes about Greenville real estate and the technology reshaping it, and shares the free tools he builds along the way.",
  description:
    "Alex Prompts is Alex Steryous's site for clear, honest writing on Greenville, " +
    "South Carolina real estate and the technology reshaping it, plus a suite of free " +
    "real-estate tools he engineered himself. No hype and no doom, just a straight look " +
    "at what is actually happening and why it matters.",
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
