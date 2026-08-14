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
  // THE SCOPE WIDENED August 14, 2026 (Alex's call, second pass same day). The
  // publication is the go-to source for a clear picture of the REAL ESTATE AND
  // BUSINESS landscape in South Carolina. Real estate and business are CO-EQUAL
  // now; the earlier "real estate is a bonus, not a requirement" framing is dead,
  // and company teardowns are one recurring form rather than the whole beat.
  // See scripts/publication/SPEC.md.
  //
  // THE TAGLINE IS ALEX'S OWN WORDS AND IS VERBATIM. Do not "improve" it into a
  // sentence, and do not expand the ampersand. It is deliberately a plain label
  // rather than a slogan: it names the territory the way a masthead names a beat,
  // and it survives the publication getting a real name later. Two prior taglines
  // died of being slogan-shaped, so the bar here is mechanical description.
  //
  // Retired, for the record: "How South Carolina actually makes money." (two
  // days, too narrow once real estate became co-equal), "Who pays for South
  // Carolina's growth." (two days, accountability-beat leftover that read as
  // watchdog), "Better real estate decisions." (July 21), "Questions worth
  // asking." (July 11, an orphaned pun on the retired AI-prompts positioning),
  // "Growth is good." (one day), "Where real estate meets technology."
  //
  // The publication is deliberately still UNNAMED, so `name` stays "Alex Prompts"
  // as a placeholder. When the name lands it changes HERE and every surface
  // follows, which is the entire point of this file.
  //
  // WHAT THE COPY IS FOR: a reader should learn immediately that they can get an
  // insightful picture of how South Carolina businesses are doing, what the
  // long-term trends are, and what the real estate market is doing and WHY.
  // TRENDS and INCENTIVES are the spine. A draft that led on testing what people
  // in the market claim was cut August 14, 2026; that is one input, not the job,
  // and leading with it made the publication sound smaller than it is.
  tagline: "SC Real Estate & Business",
  oneLiner:
    "Alex Steryous writes about how South Carolina businesses are actually doing, where the real estate market has been heading, and the incentives driving both.",
  description:
    "Plenty of places report that a company added three hundred jobs or that a subdivision " +
    "got approved. Alex Steryous writes the layer underneath: whether a business is durable, " +
    "what years of sales have really done to a submarket, and which rule or tax structure is " +
    "driving behavior that otherwise looks random. Built on public records, with every " +
    "number sourced.",
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
