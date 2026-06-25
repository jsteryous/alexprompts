/**
 * Single source of truth for Alex Prompts brand + links + voice.
 *
 * Edit handles/URLs here and every page (nav, footer, JSON-LD, sitemap) updates.
 * Voice mirrors the Claude routine's writer pass
 * (scripts/ai_news/routine/pass3_writer.md). NOTE: the site is narrowed to a
 * single tool: helping people get more out of Claude. The scripts/ pipeline +
 * brand docs still describe the old frontier-news brand and lag this file.
 *
 * Positioning rule: this brand is Claude-only. Every surface should make the
 * 3-second scan obvious. We exist to help people get more out of Claude. Do not
 * reintroduce other tools (ChatGPT, Gemini, etc.) into the copy.
 *
 * TODO(alex): confirm the contact email.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://alexprompts.com";

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

  // The brand spine. The job: show real estate agents and investors how to point
  // Claude at their actual work. Listings, market research, deal analysis, lead
  // follow-up, marketing. Plain English, no code, no hype. Not in real estate? A
  // lot of it helps anyone, and we say so. The how-to is the product.
  tagline: "Claude for real estate agents and investors.",
  oneLiner:
    "Most agents and investors use Claude like a search box. Alex Prompts shows real estate pros how to make it write listings, run market research, analyze deals, and handle the follow-up, with no code and no jargon. Not in real estate? A lot of it helps anyone.",
  description:
    "Alex Prompts helps real estate agents and investors get real work out of Claude. Most pros " +
    "type one question and stop, and never see that the same tool can write their listings, pull " +
    "market research into a client-ready summary, analyze a deal, and keep the follow-up moving. " +
    "We show you exactly how, calmly and step by step, with no code and no hype. Not active in " +
    "real estate? A lot of what we cover adds value to just about anyone.",

  // The touchstone idea. Claude keeps getting more capable, and most people keep
  // using it the same shallow way. The scarce thing is someone who closes that gap.
  creed:
    "Claude keeps getting more capable, and the gap between what it can do and what most people actually ask of it keeps getting wider. We stand in that gap. We find the new thing Claude can now do, and we show you exactly how to do it.",
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

/** The Subscribe button target: Substack's one-click subscribe page. */
export const newsletterUrl = `${SUBSTACK_URL}/subscribe`;

/** The parts of Claude the guides teach. Renders in the footer; signals what
 *  you'll learn to use and doubles as search-friendly terms. We are Claude-only,
 *  so these are Claude's surfaces, not rival tools. Edit freely as coverage shifts. */
export const tools = [
  "Projects",
  "Artifacts",
  "Claude Code",
  "Connectors",
  "Files and images",
  "Web search",
  "The Claude apps",
] as const;

/**
 * The teaching approach, in order. Renders as the homepage "how every guide
 * works" strip and the About page. This IS the promise to the reader; keep the
 * voice in sync with scripts/ai_news/routine/pass3_writer.md.
 */
export const principles = [
  {
    title: "Start from a real outcome",
    body: "We begin with something you actually want to make or solve, not a tour of buttons. The goal comes first and Claude comes second.",
  },
  {
    title: "Assume nothing",
    body: "We go slow enough for someone who just opened Claude for the first time. Every step is shown in plain words, with nothing skipped and no jargon left undefined.",
  },
  {
    title: "Skip the hype",
    body: "No big music, no breathless promises, no selling. Just the honest steps, including the fiddly parts and the places Claude still falls short.",
  },
  {
    title: "Leave you able to do it again",
    body: "The point is not to watch. The point is that you can do it yourself afterward, and the next thing too, because you learned how Claude thinks and not just one recipe.",
  },
  {
    title: "Keep up with Claude for you",
    body: "Claude ships new features constantly. We stay on top of every update so we can show you the new thing it can now do, often before you knew to ask for it.",
  },
] as const;

/**
 * The PRIMARY value display: concrete real-estate jobs Claude can do for an agent
 * or investor. Renders as the homepage "what you'll do in real estate" grid (text
 * cards, no art). Keep each an OUTCOME a pro recognizes from their week, and keep
 * the promise in the Claude lane (how to use the tool), not a claim of real-estate
 * mastery. Fair-housing and not-advice caveats are baked into the copy on purpose.
 */
export const realEstateOutcomes = [
  {
    title: "Write listings that sell",
    body: "Turn property details into clean, fair-housing-safe listing copy in minutes instead of an hour.",
  },
  {
    title: "Run the market research",
    body: "Pull comps, trends, and neighborhood notes into a client-ready summary you can actually hand over.",
  },
  {
    title: "Analyze a deal fast",
    body: "Work through rent, ROI, and the what-ifs on a property without wrestling a spreadsheet.",
  },
  {
    title: "Never drop a lead",
    body: "Draft the follow-up emails and texts, and keep your pipeline moving, so nobody falls through the cracks.",
  },
  {
    title: "Market yourself",
    body: "Generate a week of posts, captions, and emails in your own voice, so you actually stay visible.",
  },
  {
    title: "Make sense of the paperwork",
    body: "Get a plain-English read on a contract or clause before you call your broker. Information, not legal advice.",
  },
] as const;

/**
 * The "helps anyone" set, for the "not active in real estate? no problem" section.
 * Concrete things any normal person can learn to do with Claude. Renders as a
 * homepage grid. Keep each one an OUTCOME (a thing you finish), never a tool (a
 * thing you tour). `art` maps to a flat scene in components/OutcomeArt.tsx.
 */
export const outcomes = [
  {
    title: "Build your own website",
    body: "Put a real personal site online with no coding experience, with Claude writing and previewing it for you.",
    art: "website",
  },
  {
    title: "Organize the mess",
    body: "Sort the years of photos, files, and notes you have been avoiding, with Claude doing the sorting.",
    art: "organize",
  },
  {
    title: "Make something personal",
    body: "A custom kids' book, a birthday message, or a gift made just for one person, drafted with Claude in an afternoon.",
    art: "gift",
  },
  {
    title: "Research a big decision",
    body: "A car, a house, or a medical question, worked through with Claude and its web search without getting fooled by it.",
    art: "research",
  },
  {
    title: "Automate the boring parts",
    body: "The repetitive admin of a job, a side hustle, or a household, handed to Claude once and handled for you.",
    art: "automate",
  },
  {
    title: "Plan something real",
    body: "A two-week trip, an event, or a budget, turned from a vague idea into a concrete plan inside a Claude Project.",
    art: "plan",
  },
] as const;

/**
 * The "what we're about" blurb. Prose, not bullets. It demonstrates the promise
 * (we help you get far more out of Claude) instead of claiming it: most people use
 * a sliver of the tool, the job is to show you the rest, and staying on top of every
 * Claude update is the engine that keeps finding the next thing you can now do.
 * Voice = house style (no em dashes, no fragments). Claude-only: do not name rival tools.
 * Rendered as paragraphs; the first reads as the lead.
 */
export const manifesto = [
  `If you sell or invest in real estate, you are probably using Claude like a search box. You ask a question, read the answer, and close the tab. Meanwhile the same tool can write your listings, pull market research into a summary a client will actually read, run the numbers on a deal, and keep your follow-up moving. The gap is not your ability. It is that no one showed you how to point it at your actual work.`,
  `That is the whole job here. We take a real task from your week and walk it one step at a time inside Claude, slow enough that nothing is assumed and plain enough that nothing needs a second read. No hype, because hype makes you feel behind. No jargon, because jargon makes you feel dumb. Just the steps, including the fiddly parts most tutorials skip.`,
  `Not active in real estate? A lot of this still lands. The skills that draft a listing also draft your emails, and the ones that size up a deal also sort your files and plan your week. We stay on top of every Claude release, find the next thing it can do for you, and bring it back in plain English.`,
] as const;
