# Alex Prompts — BrandScript (StoryBrand)

The positioning spine. Every surface where we *talk about ourselves* should tell this
one story: the reader (a real-estate agent or investor) is the hero, the gap between what
Claude can do and how shallowly they use it is the villain, Alex is the guide.

> **Guardrail (decided June 2026):** StoryBrand lives in the **positioning layer** only.
> Site copy, the welcome email, channel bios, video intros/outros, hooks, and CTAs.
> It does **not** touch the analytical engine. The truth-seeking method in the news/analysis
> routines (`scripts/ai_news/routine/` and `scripts/greenville/routine/`) stays as is:
> steelman, optimism-as-a-finding, separate what a tool can do from what is being sold. The
> rigorous method is *how we earn the right to be the guide* (our authority). StoryBrand is
> how we frame and sell it. If positioning ever bends the analysis, we lose the authority.

## What we sell (the product)

How-to: we show real-estate agents and investors how to point Claude at their actual work,
in plain English, no code, no hype. "The how-to is the product." See `src/lib/site.ts`,
the live single-source-of-truth for this positioning.

## The SB7 roles

| Role | Alex Prompts |
|---|---|
| **Hero** | A working real-estate agent or investor. Busy, not technical, using Claude like a search box and leaving real work on the table. (Secondary hero: anyone who wants to get real work out of Claude. "Not in real estate? A lot of it helps anyone.") |
| **The force (not the villain)** | **Claude.** It keeps getting more capable, faster than most people keep up with. The tool is not the enemy; it is the underused engine. |
| **Villain** | **The gap.** The distance between what Claude can already do for your business and the shallow way you actually use it, kept wide by hype (which makes you feel behind) and jargon (which makes you feel dumb). |
| **Problem (external)** | You use Claude like a search box. No one showed you how to point it at listings, market research, a deal, or your follow-up. |
| **Problem (internal)** | You feel behind on AI and unsure where to start, and you do not want to look like you don't get it. |
| **Problem (philosophical)** | You shouldn't have to be technical, or burn hours you don't have, to get real work out of the most important tool of your career. |
| **Guide** | Alex Prompts. *Empathy:* "I used it like a search box too." *Authority:* a real-estate agent who shows you exactly how, step by step, no code, and stays on top of every Claude update so you don't have to. |
| **Plan** | 1. Subscribe. 2. Take one real task from your week. 3. Follow the steps and do it in Claude yourself. |
| **Stakes (failure)** | Keep using a sliver of the tool. Lose hours to busywork. Fall behind the agents and investors who learned to put AI to work. |
| **Success** | Claude writes your listings, pulls your market research into a client-ready summary, runs the numbers on a deal, and keeps your follow-up moving. You stay current, and you're the pro who is ahead. |

## The villain, framed (so it has teeth)

An abstract villain motivates no one. Give *the gap* a face and a single shape:

- **Motive:** the gap grows on its own. Claude ships new capability constantly, and the
  busy pro never has time to learn it, so the distance between what the tool can do and
  what you ask of it widens every month you do nothing.
- **Face (a scene the reader lives):** you type one question into Claude, read the answer,
  and close the tab, while the same tool could have written the whole listing. The agent
  down the hall who quietly automated their follow-up and now lists twice as much. The
  feeling that everyone is "using AI" and you are still not sure how.
- **Shape:** hype and jargon look like help. They are the gap's bodyguards. Hype makes you
  feel behind so you freeze; jargon makes you feel dumb so you quit. Both keep the gap wide.

Canonical move: **the enemy is not the tool, it is the gap between what it can do and how
you use it.**

## Reusable lines

- **Stakes headline:** "The agents who put AI to work will pull ahead of the ones who
  don't. The gap is not talent. It is knowing how."
- **One-liner (elevator pitch / bios):** "Most agents and investors use Claude like a
  search box. Alex Prompts shows real-estate pros how to make it write listings, run market
  research, analyze deals, and handle the follow-up, with no code and no jargon. Not in real
  estate? A lot of it helps anyone."
- **The reader's part (the plan):** "Subscribe. Take one task from your week. Do it in
  Claude with us, step by step."

## Voice (unchanged — see root `CLAUDE.md`)

No em or en dashes. No sentence fragments (the "No hype. No jargon. Just the steps." triad
is the one signature exception). Short sentences, strong verbs, open cold and concrete,
plain English, end on a real outcome or a question worth arguing about.

## Where it's applied

- Homepage hero + subscribe CTA (`src/app/page.tsx`).
- About page "the problem" (villain) + "the promise" (guide) (`src/app/about/page.tsx`).
- Article subscribe CTA (the shared `src/components/ArticleView.tsx`).
- Welcome email (pasted into Substack settings — not in repo).
- `src/lib/site.ts` `oneLiner`, `tagline`, `manifesto` (meta description / social cards /
  homepage copy).
