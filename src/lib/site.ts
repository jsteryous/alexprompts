/**
 * Single source of truth for Alex Prompts brand + links + voice.
 *
 * Edit handles/URLs here and every page (nav, footer, JSON-LD, sitemap) updates.
 * Voice mirrors the Claude routine's writer pass
 * (scripts/ai_news/routine/pass3_writer.md). NOTE: the site is repositioned
 * to AI how-to education; the scripts/ pipeline + brand docs still describe the
 * old frontier-news brand and lag this file.
 *
 * TODO(alex): confirm the contact email. The `tagline` is a placeholder you're
 * still refining — swapping it is a one-line change here.
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

  // The brand spine. The job: take the powerful AI tools that feel built for
  // engineers, and show curious non-technical people how to actually use them.
  // Start from a real outcome, go slow, no jargon, no hype. The frontier-watching
  // is the engine (we find the new thing you can now do); the how-to is the product.
  tagline: "Do more with AI than you think you can.",
  oneLiner:
    "Powerful AI tools feel like they were built for engineers. Alex Prompts shows curious, non-technical people how to actually use them, one real project at a time, with no jargon and no hype.",
  description:
    "Alex Prompts helps curious, non-technical people do real things with AI. We take the " +
    "powerful tools that feel locked behind a wall built for engineers, and we show you how " +
    "to use them, calmly and step by step. We start from a real outcome you want, we go slow " +
    "enough that nothing is assumed, and we skip the hype. The name is a double meaning: the " +
    "AI prompts, and the questions worth asking about where this is all going.",

  // The touchstone idea. The tools keep outrunning the instructions, so the
  // scarce thing is someone who stands in the gap and shows you across.
  creed:
    "The tools keep getting more powerful, and the gap between what they can do and what a normal person can actually access keeps getting wider. We stand in that gap. We find the new thing you can now do, and we show you exactly how to do it.",
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

/** The tools the guides teach. Renders in the footer; signals what you'll learn
 *  to use and doubles as search-friendly terms. Edit freely as coverage shifts. */
export const tools = [
  "ChatGPT",
  "Claude",
  "Gemini",
  "Perplexity",
  "Midjourney",
  "Suno",
  "NotebookLM",
] as const;

/**
 * The teaching approach, in order. Renders as the homepage "how every guide
 * works" strip and the About page. This IS the promise to the reader; keep the
 * voice in sync with scripts/ai_news/routine/pass3_writer.md.
 */
export const principles = [
  {
    title: "Start from a real outcome",
    body: "We begin with something you actually want to make or do, not a tour of buttons. The goal comes first and the tool comes second.",
  },
  {
    title: "Assume nothing",
    body: "We go slow enough for someone who has never opened the app. Every step is shown in plain words, with nothing skipped and no jargon left undefined.",
  },
  {
    title: "Skip the hype",
    body: "No big music, no breathless promises, no selling. Just the honest steps, including the fiddly parts and the places the tool still falls short.",
  },
  {
    title: "Leave you able to do it again",
    body: "The point is not to watch. The point is that you can do it yourself afterward, and the next thing too, because you learned the fundamentals and not just the recipe.",
  },
  {
    title: "Stay at the frontier for you",
    body: "The tools change every month. We stay out at the edge so we can show you the new thing you can now do, often before you knew to ask for it.",
  },
] as const;

/**
 * The proof of the promise: concrete things a non-technical person can learn to
 * do. Renders as the homepage "what you'll learn" grid, replacing the old
 * lab-logo coverage chips as the value display. Keep each one an OUTCOME (a thing
 * you finish), never a tool (a thing you tour).
 */
export const outcomes = [
  {
    title: "Build your own website",
    body: "Put a real personal site online with no coding experience, letting AI do the heavy lifting.",
  },
  {
    title: "Organize the mess",
    body: "Sort the years of photos, files, and notes you have been avoiding, with AI doing the sorting.",
  },
  {
    title: "Make something personal",
    body: "A custom kids' book, a birthday video, or a gift made just for one person, finished in an afternoon.",
  },
  {
    title: "Research a big decision",
    body: "A car, a house, or a medical question, worked through with AI without getting fooled by it.",
  },
  {
    title: "Automate the boring parts",
    body: "The repetitive admin of a job, a side hustle, or a household, set up once and handled for you.",
  },
  {
    title: "Plan something real",
    body: "A two-week trip, an event, or a budget, turned from a vague idea into a concrete plan.",
  },
] as const;

/**
 * The "what we're about" blurb. Prose, not bullets. It demonstrates the promise
 * (we make locked-away AI usable for normal people) instead of claiming it: the
 * wall is real but short, the job is to show you across, and the frontier-watching
 * is the engine that keeps finding the next thing you can now do.
 * Voice = house style (no em dashes, no fragments).
 * Rendered as paragraphs; the first reads as the lead.
 */
export const manifesto = [
  `Powerful AI is here, and most people are locked out of it. Not because they are not smart enough, but because the tools were built by engineers for engineers, and the instructions assume things nobody ever taught you. The gap is not your ability. It is that no one has shown you, calmly and from the beginning.`,
  `That is the whole job here. We take a real thing you want to do, and we walk it one step at a time, slow enough that nothing is assumed and plain enough that nothing needs a second read. There is no hype, because hype makes you feel behind. There is no jargon, because jargon makes you feel dumb. There are just the actual steps, including the fiddly parts most tutorials quietly skip.`,
  `The tools get more powerful every month, and every jump opens a new wave of things a normal person can suddenly do, if someone shows them how. That is where we live. We stay out at the frontier, we find the next thing you can now do, and we bring it back in plain English so you can do it too. You came to watch one walkthrough. You stay because the locked rooms keep opening.`,
] as const;
