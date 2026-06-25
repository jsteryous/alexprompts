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

  // The brand spine. The job: take one tool, Claude, and show people how to get
  // far more out of it than they currently do. Start from a real outcome, go slow,
  // no jargon, no hype. We stay on top of every Claude update so we can show you
  // the new thing it can now do; the how-to is the product.
  tagline: "Get more out of Claude.",
  oneLiner:
    "You are paying for Claude and using a sliver of what it can do. Alex Prompts shows you how to do the real things it is capable of, one project at a time, with no code to write and no jargon to decode.",
  description:
    "Alex Prompts helps you get more out of Claude. Most people type one question and stop, " +
    "and they never see what the tool can actually do. We take a real thing you want to make " +
    "or solve, and we show you how to do it in Claude, calmly and step by step. We go slow " +
    "enough that nothing is assumed, and we skip the hype. The name is a double meaning: the " +
    "prompts you type into Claude, and the questions worth asking about where this is all going.",

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
 * The proof of the promise: concrete things a non-technical person can learn to
 * do. Renders as the homepage "what you'll learn" grid, replacing the old
 * lab-logo coverage chips as the value display. Keep each one an OUTCOME (a thing
 * you finish), never a tool (a thing you tour). `art` maps to a flat scene in
 * components/OutcomeArt.tsx — outcome imagery (a finished site, sorted photos),
 * never technology imagery. Swap to a photo later by replacing that scene.
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
  `You are probably using a sliver of Claude. Most people type one question, read the answer, and close the tab, and they never find out the tool can build, organize, research, and automate real things for them. The gap is not your ability. It is that no one has shown you, calmly and from the beginning, what Claude can actually do.`,
  `That is the whole job here. We take a real thing you want to make or solve, and we walk it one step at a time inside Claude, slow enough that nothing is assumed and plain enough that nothing needs a second read. There is no hype, because hype makes you feel behind. There is no jargon, because jargon makes you feel dumb. There are just the actual steps, including the fiddly parts most tutorials quietly skip.`,
  `Claude gets more capable every few weeks, and every update opens a new wave of things you can suddenly do, if someone shows you how. That is where we live. We stay on top of every release, we find the next thing Claude can now do for you, and we bring it back in plain English. You came to learn one thing. You stay because the tool keeps growing and we keep showing you the new rooms.`,
] as const;
