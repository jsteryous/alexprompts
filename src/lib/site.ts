/**
 * Single source of truth for Alex Prompts brand + links.
 *
 * Edit handles/URLs here and every page (nav, footer, JSON-LD, sitemap) updates.
 * Voice + coverage mirror scripts/ai_news/ (WRITER_PROMPT + collect.py ENTITIES);
 * keep them in sync when the editorial brand shifts.
 *
 * TODO(alex): confirm the contact email below.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://alexprompts.com";

export const site = {
  name: "Alex Prompts",
  author: "Alex Steryous",
  email: "hello@alexprompts.com", // TODO(alex): confirm contact inbox
  url: SITE_URL,

  // The brand spine. Mirrors scripts/ai_news WRITER_PROMPT.
  tagline: "Frontier tech, translated.",
  oneLiner:
    "The companies building the future, explained clearly. Then the question worth arguing about.",
  description:
    "Alex Prompts covers the companies building the future. We translate the week in " +
    "frontier AI and hard tech into plain English, take the builders at their word and " +
    "pressure-test it, steelman the skeptic, and land on a grounded take. Every piece ends " +
    "on a simple, hard question worth arguing about. The name is a double meaning: the AI " +
    "prompts, and prompting real discussion.",
} as const;

/**
 * The editorial method, in order. Renders as the homepage "how we cover it" strip
 * and the About page. This is the brand's promise to the reader; keep it in sync
 * with the voice in scripts/ai_news/digest.py (WRITER_PROMPT).
 */
export const principles = [
  {
    title: "Inform clearly",
    body: "What actually happened, in plain English. No jargon, no hype, no doom. You leave understanding the trajectory, not just the headline.",
  },
  {
    title: "Read the builders",
    body: "We take the people building the future at their word, then pressure-test it. The easiest way to predict the future is to build it, so we start with what the builders are actually saying.",
  },
  {
    title: "Steelman the skeptic",
    body: "The strongest version of the other side, argued honestly before we land anywhere. The crowd, and legacy media, are confidently wrong often enough that the consensus is worth doubting.",
  },
  {
    title: "A grounded take, then a prompt",
    body: "A clear, logical read on what it means. Not investment advice. Then the simple, hard question worth arguing about, because the point is to start the conversation.",
  },
] as const;

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
