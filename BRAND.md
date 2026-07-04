# Alex Prompts — positioning

The positioning spine: how we talk about ourselves on every surface where we do (the site,
bios, CTAs, the welcome email, video intros). It is StoryBrand-informed but it is not one
SB7 story, because the site now serves two different heroes, a hiring manager and a
real-estate lead. Positioning per audience is below.

> **Retired July 2026:** the old BrandScript (hero = a real-estate agent, villain = the gap
> between what Claude can do and how shallowly you use it, guide = Alex teaching Claude) went
> away with the **voice-3 removal**. The "Claude for real estate agents and investors" how-to
> product is gone. Do not reintroduce that framing. See memory `claude-only-rebrand` (now a
> record of the removal), `alexprompts-portfolio-pivot`, and `content-two-track-strategy`.

> **Guardrail (still holds):** positioning lives in the **positioning layer** only. Site copy,
> bios, CTAs, the welcome email, video intros/outros, hooks. It does **not** touch the
> analytical engine. The truth-seeking method in the content routines
> (`scripts/ai_news/routine/`, `scripts/greenville/routine/`, `scripts/tech/routine/`) stays as
> is: steelman, optimism-as-a-finding, separate what a tool can do from what is being sold. The
> rigorous method is *how we earn the right to be believed* (our authority). Positioning is how
> we frame it. If positioning ever bends the analysis, we lose the authority.

## What the site actually is

Alex Steryous's personal site. Two kinds of content live here, honest plain-English writing on
Greenville real estate and on technology more broadly (the Lab), plus the free real-estate
tools he built. It does two jobs, in priority order:

1. **A build-in-public portfolio** that shows Alex to hiring managers: proof that a salesperson
   who is not an engineer genuinely understands technology and can ship with it. This is the #1
   job. The evidence is the site itself, the tools, and the autonomous content engines.
2. **A referral connector** that captures buyer/seller intent and hands it to vetted agents for
   a referral fee. A real but secondary side stream.

`src/lib/site.ts` is the live single-source-of-truth for the brand strings.

## Audience 1: the hiring manager (primary)

Where it's applied: `/about` (the front door for this audience), and the Lab (`/lab`) as the
running proof. A hiring manager arrives by a link Alex puts on a resume, LinkedIn, or in
outreach, not by search.

| Role | For a hiring manager |
|---|---|
| **Hero** | A hiring manager (or founder) who needs someone who can sell a technical product and actually understand it. |
| **Their problem (external)** | Most sales candidates can talk about technology but cannot build or ship, so they sell it shallowly. It is hard to tell who genuinely gets it. |
| **Their problem (internal)** | Hiring the wrong technical seller is expensive and slow to unwind. They want proof, not claims. |
| **Guide** | Alex. *Empathy:* a salesperson, not an engineer, who taught himself to build. *Authority:* this whole site, the tools, and the autonomous engines are the evidence, sitting right there to click. |
| **The plan** | 1. Read `/about` and a Lab piece or two. 2. See that a non-engineer built and runs all of it. 3. Reach out on LinkedIn or by email. |
| **Stakes / success** | Success: they get a seller who understands the product deeply enough to sell it honestly and learns the hard parts fast. The proof is that he already did, unprompted. |

**Reusable lines**
- **The pitch, one sentence:** "I'm a salesperson who taught himself to ship real software with
  AI. This whole site is the proof."
- **The translation (why it matters for sales):** "When I understand how a product genuinely
  works and where it actually helps, I can sell it honestly and well, which is the only way I
  know how to sell."
- Frame every technical feat as evidence of a sales trait, never a brag list: the autonomous
  engines show he can own a system end to end; building inside free tiers shows he respects unit
  economics; doing it solo shows he is a self-starter who learns fast.

## Audience 2: the real-estate lead (secondary)

Where it's applied: `/find-an-agent`, and the close of every evergreen Greenville piece
(`scripts/greenville/topics.md` track).

| Role | For a buyer, seller, or relocator |
|---|---|
| **Hero** | Someone buying or selling, in Greenville or relocating anywhere. |
| **Villain** | The coin flip of picking an agent from whoever answers a portal form first. The gap between a good agent and a bad one is thousands of dollars and a lot of stress. |
| **Guide** | Alex, a licensed SC agent who does not practice full-time but knows which agents earn their keep, hand-picks the match, and stays in your corner. |
| **The plan** | 1. Tell Alex what you are trying to do. 2. He connects you with a vetted agent. 3. He checks in until it closes. |
| **Stakes / success** | Success: you get an agent worth your time, at no cost to you, instead of a stranger from a form. |

**Reusable lines**
- **The hook:** "A vetted agent, not a coin flip."
- **The honesty:** "It costs you nothing. If I refer you and it closes, the agent pays me a
  referral fee. Information only, not financial advice."

## Voice (unchanged — see root `CLAUDE.md`)

No em or en dashes. No sentence fragments. Flowing, complete sentences, plain English, open
cold and concrete, grounded optimism (steelman before you resolve), end on a real outcome or a
question worth arguing about. No hype, no doom.

## Where it's applied

- `/about` — audience 1 (the story, the "Under the hood" technical teardown, the connect CTA).
- `/lab` — audience 1 (the running proof).
- `/find-an-agent` and the evergreen Greenville pieces — audience 2.
- `src/lib/site.ts` `tagline`, `oneLiner`, `description` (page titles, meta descriptions, social
  cards, footer).
- Welcome email (pasted into Substack settings, not in repo).
