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
 * The beat is unchanged by the rename: a clear picture of the REAL ESTATE AND
 * BUSINESS landscape in South Carolina, built on primary documents, with real
 * estate and business co-equal. See scripts/publication/SPEC.md, which outranks
 * this comment wherever the two disagree.
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
  // The tagline is deliberately NOT the name and does not repeat it. "Rebrew"
  // says nothing about the beat on its own, which is normal for a masthead, so
  // the tagline carries the whole job of naming the territory.
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
