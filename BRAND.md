# Alex Prompts — BrandScript (StoryBrand)

The positioning spine. Every surface where we *talk about ourselves* should tell this
one story: the reader is the hero, the noise is the villain, Alex is the guide.

> **Guardrail (decided June 2026):** StoryBrand lives in the **positioning layer** only.
> Site copy, the welcome email, channel bios, video intros/outros, hooks, and CTAs.
> It does **not** touch the analytical engine. The truth-seeking method in
> `scripts/ai_news/digest.py` (`WRITER_PROMPT`) and `shorts.py` stays as is: steelman,
> optimism-as-a-finding, separate capability claims from sales pitch. The rigorous method
> is *how we earn the right to be the guide* (our authority). StoryBrand is how we frame
> and sell it. If positioning ever bends the analysis, we have become the noise we fight.

## The SB7 roles

| Role | Alex Prompts |
|---|---|
| **Hero** | A smart, curious person who is *not* an insider, making real decisions on long time horizons (career, money, kids, what to build). |
| **The force (not the villain)** | **AI.** Enormous, fast, morally neutral. The dragon, not the enemy. It can be tamed, which is why we stay optimistic. |
| **Villain** | **The noise.** The hype-and-doom feed that profits when you stay confused and afraid. |
| **Problem (external)** | Too much frontier-tech news, no way to tell what's real from what's sold. |
| **Problem (internal)** | You feel anxious and behind, unsure whether to be excited or scared. |
| **Problem (philosophical)** | You shouldn't have to be an insider, or trade your peace of mind, to understand the most important story of your lifetime. |
| **Guide** | Alex Prompts. *Empathy:* "I got tired of it too." *Authority:* one biggest story a week, facts separated from the sales pitch, the other side steelmanned. |
| **Plan** | 1. Open one email a week. 2. Read it in a coffee. 3. Reply and argue. |
| **Stakes (failure)** | Keep drowning in noise. Decide from fear. Bet on a dying paradigm or miss the emerging one. |
| **Success** | You see the shape of what's coming. You decide from understanding, not fear. You're the person in the room who actually knows. |

## The villain, framed (so it has teeth)

An abstract villain scares no one. Give *the noise* a motive, a face, and a single shape:

- **Motive:** it does not want you informed, because an informed person closes the app. It
  wants you scrolling, so it sells you a feeling instead of an understanding.
- **Face (a scene the reader lives):** the headline that says AI just cured a disease,
  right above the one that says AI is coming for your job. The 11pm scroll that leaves you
  wired, worried, and no smarter. The guy with 400k followers who is always certain and
  quietly wrong.
- **Shape:** hype and doom look like enemies. They are business partners. Two heads, one
  machine, both fed by your attention.

Canonical move: **the enemy is not AI, it is the noise about it.**

## Reusable lines

- **Stakes headline:** "AI will be the best thing that ever happened to you, or the worst.
  What you understand decides which."
- **One-liner (elevator pitch / bios):** "AI hype and doom keep you anxious and no smarter.
  Alex Prompts turns the biggest story from the people building the future into plain
  English each week, so you can see where this is heading and decide from understanding,
  not fear."
- **The reader's part (the plan):** "Open one email a week. Read it in a coffee. Reply and
  tell me where I am wrong."

## Voice (unchanged — see root `CLAUDE.md`)

No em or en dashes. No sentence fragments (the "No hype. No doom." triad is the one
signature exception). Short sentences, strong verbs, open cold and concrete, plain English,
end on the question worth arguing about.

## Where it's applied

- Homepage hero + subscribe CTA (`src/app/page.tsx`).
- About page "The problem" (villain) + "The stance" (guide) (`src/app/about/page.tsx`).
- Article subscribe CTA (`src/app/archive/[slug]/page.tsx`).
- Welcome email (pasted into Substack settings — not in repo).
- `src/lib/site.ts` `oneLiner` (meta description / social cards).
