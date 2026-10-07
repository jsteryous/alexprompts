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
// MOVED TO rebrew.substack.com October 1, 2026, on Alex's instruction ("substack
// hyperlink should be at rebrew"). It had stayed alexprompts.substack.com after
// the site rename because the subdomain is the publication's identity over
// there. NEXT_PUBLIC_SUBSTACK_URL still overrides this, so if Vercel sets it to
// the old subdomain, that value wins and must be changed or unset. One place,
// and the button + sync both pick it up.
export const SUBSTACK_URL =
  process.env.NEXT_PUBLIC_SUBSTACK_URL?.replace(/\/$/, "") ?? "https://rebrew.substack.com";

/** RSS feed the archive mirror reads. Server-only; override with SUBSTACK_FEED_URL. */
export function substackFeedUrl(): string {
  return process.env.SUBSTACK_FEED_URL?.replace(/\/$/, "") ?? `${SUBSTACK_URL}/feed`;
}

export const site = {
  name: "Rebrew",
  // The brand inbox, live and receiving as of September 2026. It is now the ONLY
  // address on the site: the personal Gmail that every "write to me" surface used
  // to point at came off in the September 18, 2026 pass. SENDING from it is a
  // separate question and still depends on rebrew.org passing DNS verification in
  // Resend, which is what EMAIL_FROM governs. Receiving does not.
  email: "hello@rebrew.org",
  url: SITE_URL,

  // THE REFRAME, October 7, 2026, in Alex's words.
  //   Slogan: "Just good stories."
  //   Internal mission: to share the most entertaining stories of incredible
  //   people or events.
  // The mission is INTERNAL. It steers what gets written and never appears on
  // the site as a mission statement; the slogan does that job in three words.
  //
  // The stories are true, timeless, and about people or things that lasted:
  // history, bravery, adversity overcome, and the money, building and craft
  // behind them. Not local, not news. Earlier beats, for the record: Greenville
  // real estate and sales performance (August to October 2026), SC real estate
  // and business, and the retired AI-prompts positioning. Their published work
  // stays at its URLs and is listed under the Archive.
  //
  // Keep the tagline exactly as Alex wrote it, period included. It is a
  // complete sentence in spirit and the house style bans dressing it up.
  tagline: "Just good stories.",

  // The homepage statement. Same words as the tagline on purpose: the slogan is
  // the whole pitch, and a second line saying it again at more length would be
  // the redundancy a minimalist page exists to avoid.
  headline: "Just good stories.",

  oneLiner: "True stories of incredible people and events.",
  description:
    "Rebrew tells true stories of incredible people and events, and of the " +
    "things they built that lasted.",
} as const;

/**
 * The one address on the site.
 *
 * This used to be a personal Gmail, kept here because the brand inbox was not
 * live yet. Both facts changed on September 18, 2026: hello@rebrew.org receives
 * mail, and Alex asked for his personal information off the site. So this is now
 * an alias for `site.email` rather than a second address, which means there is
 * exactly one inbox to change and no way for the two to drift apart.
 *
 * Keep the alias rather than rewriting the three call sites to `site.email`.
 * /about, /contact, and the best-agents landing page each mean "the address a
 * reader writes to", which is a different idea from "the address the publication
 * signs its legal pages with", even while the two resolve to the same string.
 *
 * LINKEDIN_URL was deleted in the same pass. The follow row and the JSON-LD
 * sameAs read `socials` below, which never contained it, so nothing else broke.
 * Do not add a personal profile link back to a masthead: the authority on this
 * site comes from the documents, not the byline.
 */
export const CONTACT_EMAIL = site.email;

/**
 * The actual licensed name, September 19, 2026. `site` used to carry an
 * `author` field set to this same string and every "written by" surface read
 * it: the footer, /about, the article byline default, the SEO keywords list,
 * and the homepage Person JSON-LD. Alex asked for his name off the site, so
 * all of that now reads `site.name` ("Rebrew") instead, and this constant is
 * split out for the one thing that cannot follow: South Carolina real estate
 * advertising rules require a licensee disclosure to name the actual licensed
 * person. The four surfaces that legally need it import THIS, never
 * `site.author` (deleted), and nothing else should.
 */
export const LICENSEE_NAME = "Alex Steryous";

/**
 * Social + newsletter links. The "follow everywhere" row, the footer, and the
 * JSON-LD `sameAs` in layout.tsx all derive from this array.
 *
 * X AND TIKTOK MOVED TO @rebrewx, September 18, 2026, on Alex's instruction.
 * They had been @steryously and @alex_prompts, which were personal handles from
 * before the publication had a name. Both URLs are CONSTRUCTED from the handle,
 * since neither platform was to hand when the change came through and both build
 * a profile URL deterministically (x.com/<handle>, tiktok.com/@<handle>). If
 * either profile is not claimed yet, the footer link and the sameAs entry point
 * at a 404, so confirm both resolve.
 *
 * YOUTUBE IS DELIBERATELY UNTOUCHED at @alex_prompts. Alex named X and TikTok and
 * only those two. Do not "finish the job" here on your own: a YouTube handle
 * change breaks every existing link to the channel and is a job to do on YouTube
 * first, then reflect here.
 */
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
    handle: "@rebrewx",
    url: "https://www.tiktok.com/@rebrewx",
  },
  {
    key: "x",
    label: "X",
    handle: "@rebrewx",
    url: "https://x.com/rebrewx",
  },
] as const;

/** The Subscribe button target: Substack's one-click subscribe page. */
export const newsletterUrl = `${SUBSTACK_URL}/subscribe`;
