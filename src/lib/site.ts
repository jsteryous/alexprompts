/**
 * Single source of truth for Alex Prompts brand + links + voice.
 *
 * Edit handles/URLs here and every page (nav, footer, JSON-LD, sitemap) updates.
 * Voice + coverage mirror scripts/ai_news/ (WRITER_PROMPT + collect.py ENTITIES);
 * keep them in sync when the editorial brand shifts.
 *
 * TODO(alex): confirm the contact email. The `tagline` is a placeholder you're
 * still refining — swapping it is a one-line change here.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://alexprompts.com";

export const site = {
  name: "Alex Prompts",
  author: "Alex Steryous",
  email: "hello@alexprompts.com", // TODO(alex): confirm contact inbox
  url: SITE_URL,

  // The brand spine. The job: read what the builders say about the future (what
  // they're building AND what they predict), measure it against the present,
  // make the honest case for the upside, steelman the skeptics against history's
  // track record, then end on the questions worth arguing about.
  tagline: "The future, in the builders' own words.",
  oneLiner:
    "We read what the people building the future are actually saying, weigh it against the present and the skeptics, and end on the questions worth arguing about.",
  description:
    "Alex Prompts covers the companies building the future. We take what the tech leaders " +
    "say, both what they are building and what they predict, and translate it into plain " +
    "English. We measure the claim against the present, make the honest case for why it " +
    "could be good for people, give the skeptics their due against history's track record, " +
    "and end on a few real questions worth arguing about. The name is a double meaning: the " +
    "AI prompts, and prompting the reader.",

  // The touchstone idea. NOTE: the canonical line "The best way to predict the
  // future is to invent it" is Alan Kay (1971); the "create it" variant is
  // misattributed all over (Lincoln, Drucker, Bezos). A truth-first brand should
  // not stamp a shaky citation on its homepage, so we use it unattributed.
  creed:
    "The surest way to predict the future is to build it. We are not building it. We are listening to the people who are, and arguing about what it means.",
} as const;

/** Social + newsletter links. The "follow everywhere" row + footer derive from this. */
export const socials = [
  {
    key: "substack",
    label: "Substack",
    handle: "Read the newsletter",
    url: "https://substack.com/@alexprompts",
    primary: true,
  },
  {
    key: "youtube",
    label: "YouTube",
    handle: "@alexprompts",
    url: "https://www.youtube.com/@Alexprompts",
  },
  {
    key: "tiktok",
    label: "TikTok",
    handle: "@alexprompts",
    url: "https://www.tiktok.com/@alex_prompts",
  },
  {
    key: "x",
    label: "X",
    handle: "@alexprompts",
    url: "https://x.com/alexpromptz",
  },
] as const;

export const newsletterUrl =
  socials.find((s) => s.key === "substack")?.url ?? "#";

/** Companies covered. Mirrors collect.py ENTITIES (the discovery/scoring set). */
export const coverage = [
  "Anthropic",
  "OpenAI",
  "Google DeepMind",
  "xAI",
  "Meta AI",
  "Nvidia",
  "Tesla",
  "SpaceX",
  "Neuralink",
] as const;

/**
 * The method, in order. Renders as the homepage "how it works" strip and the
 * About page. This IS the editorial promise; keep it in sync with the voice in
 * scripts/ai_news/digest.py (WRITER_PROMPT).
 */
export const principles = [
  {
    title: "Start with the builders",
    body: "We begin with what the people building the future are actually saying and shipping, from AI datacenters in orbit to “work will be optional.” Their words and their work are the raw material.",
  },
  {
    title: "Measure it against today",
    body: "We hold the claim up against the present. What exists right now, what would have to change for the promise to land, and the honest distance between the keynote and the demo.",
  },
  {
    title: "Make the case for the upside",
    body: "Where the evidence supports it, we say plainly why this is good for people, economically and socially. Optimism is a finding, not a reflex. When the facts turn, so do we.",
  },
  {
    title: "Then call the skeptics",
    body: "We give the strongest version of the doubt its due, and we check it against history, where confident predictions about technology have a famously bad track record.",
  },
  {
    title: "And we prompt you",
    body: "Every piece ends on a few genuine questions worth arguing about, the kind a thoughtful person could answer either way. That is the point. Alex Prompts.",
  },
] as const;

/** Manifesto lines. Renders as a bold "what we believe" band. Voice, with spine. */
export const beliefs = [
  "Progress is the default. Stagnation is the exception that needs explaining.",
  "We are not building the future. We are listening closely to the people who are.",
  "Hype and doom are both lazy. The truth is more interesting than either.",
  "Optimism is a finding, not a vibe. When the facts turn, so do we.",
  "The smartest people in the room have a long history of being wrong about technology.",
  "Every story should end in an argument worth having.",
] as const;

/**
 * The track record. Verified, famous misfires by very smart people betting
 * against technology. The recurring brand device behind "doubt the consensus."
 * Framing (carried in the section copy, not here): this does NOT prove every
 * optimist right. It raises the bar for "this time is different."
 * Keep these VERIFIED. Do not add apocryphal ones (the "five computers" Watson
 * quote, the Western Union telephone memo, the Gates "640K" line are all myths).
 */
export const trackRecord = [
  {
    who: "Irving Fisher",
    role: "Yale economist",
    year: "1929",
    quote: "Stock prices have reached what looks like a permanently high plateau.",
    aftermath: "Days later, the market crashed into the Great Depression.",
  },
  {
    who: "Paul Krugman",
    role: "economist",
    year: "1998",
    quote: "By 2005 or so, it will become clear that the Internet's impact on the economy has been no greater than the fax machine's.",
    aftermath: "The internet reshaped the entire economy.",
  },
  {
    who: "Steve Ballmer",
    role: "Microsoft CEO",
    year: "2007",
    quote: "There's no chance that the iPhone is going to get any significant market share.",
    aftermath: "The iPhone went on to define the modern phone.",
  },
  {
    who: "Robert Metcalfe",
    role: "co-inventor of Ethernet",
    year: "1995",
    quote: "The Internet will soon go spectacularly supernova and in 1996 catastrophically collapse.",
    aftermath: "In 1997 he blended a copy of the column and ate it on stage.",
  },
] as const;
