# The Rebrew Intelligencer: strategy

Owned by the Publisher routine (see `PUBLISHER.md`), which reads this file every week,
measures against it, and rewrites it when the evidence says so. Every change is logged at
the bottom with its date and its reason. Alex set the goal and the limits; everything else
here is ours to change.

## The goal

Attention: people reading, sharing, coming back and subscribing. Within reason, which
means never at the cost of the truth and taste rules in `PRESS.md`, never anything lewd,
cheap or cruel, and never anything that would embarrass Alex, whose network is the first
audience.

## How we measure it

All first-party and cookieless (`page_hits`, `subscribers`). Recorded weekly, Monday to
Sunday, in `SCOREBOARD.md`.

| Measure | What it tells us | Query |
|---|---|---|
| **Weekly views** (north star) | Is anyone reading | `sum(views)` from `page_hits`, last 7 days |
| Views from outside | Is it spreading | same, where `referrer not in ('', 'other')` plus `'other'` reported separately |
| Clip opens | Are people sharing pieces | `sum(views)` where `path like '/clip/%'` |
| Office visits | Is the world sticky | `sum(views)` where `path = '/office'` |
| Confirmed subscribers | Will they come back | `count(*)` from `subscribers` where `status = 'confirmed'` |
| Numbers printed | Is the press healthy | rows in `intelligencer_editions` that week (should be 3) |

## Targets and checkpoints

Baseline on October 14, 2026: zero on every measure. Targets are deliberately ambitious and
dated, so a miss is visible.

| Checkpoint | Weekly views | Clip opens / week | Confirmed subscribers |
|---|---|---|---|
| November 15, 2026 | 150 | 15 | 15 |
| December 15, 2026 | 500 | 50 | 50 |
| January 31, 2027 | 1,500 | 150 | 150 |

## Rules for changing course

1. **Four flat weeks means change the kind of bet.** If a measure has not moved in four
   weeks, the next bet must be a different kind (distribution, format or a new hook), not
   more polish on what exists.
2. **A missed checkpoint means a written review.** Name what was tried, what moved, what did
   not, and the new plan, in the log below, and say it in that week's report to Alex.
3. **The pivot rule.** If weekly views are still under 100 on January 31, 2027, write a pivot
   memo with three options (a different format, a different audience, or a different
   channel), email it to Alex, and carry out the best option that does not need him.
4. **Never trade the truth for attention.** The news stays true, and the inventions stay
   labelled.

## The biggest risk

**Distribution.** The site has no search traffic and no routine can post on social media.
Until something else works, Alex sharing the paper with his network is the only way new
readers arrive, so every report asks him for one specific, low-effort share (which item,
where, and the line to post with it). Bets that earn distribution without him (email
forwarding, share-worthy formats, anything a reader would send a friend) rank high.

## The backlog

Ranked. The Publisher builds the top bet it can finish and prove in one run, then moves it
to the log with its hypothesis and the measure it should move.

1. **"Real or Ashby?"** A game on each number: six headlines, some true from the news and
   some invented by the Editor, and the reader guesses which. A shareable result grid in the
   Wordle style, with no spoilers. Real headlines come from the printed news; invented ones
   are labelled as inventions once answered. Hypothesis: the paper's premise (the truth
   sounds made up) is most shareable as a game. Moves: views from outside, clip opens.
2. **A share prompt after reading.** At the foot of each number, the single funniest line
   pre-clipped, with one tap to share it.
3. **Subscriber growth loops.** The edition email already carries a forward line. Next: a
   sign-up prompt on clip pages and in the office, and a "forwarded to you?" line at the top
   of the email for readers who did not sign up themselves. Moves: subscribers.
0. **The type-only office (Alex chose it October 14, 2026; build it in your October 19 run).**
   The SVG room reads as clip-art and a redraw in code hits the same ceiling. Rebuild
   `/office` as a newspaper page of ruled boxes in the paper's own type (cast files, Coffee
   Can Index, most clipped, the Clarion, next press run) from the same `src/lib/office.ts`
   data, and retire `OfficeScene.tsx`. Alex cares more about the paper's content than the
   office, so keep it modest.
4. **The office grows.** A new object whenever a new running gag earns one.

## Log

- **2026-10-14.** Strategy written. Baseline zero. The paper moved to a 1945 voice, clip and
  share went live, and the Editor's office went live. The Publisher routine took over from
  the fortnightly maintainer, with this file as its brief.
- **2026-10-14 (session, at Alex's request).** Shipped 1945 typography, taken off the backlog
  out of order: Oswald for banner and story heads, Libre Bodoni for decks, departments,
  letters and ads, the blackletter nameplate kept, body on the system serif. Applied to the
  paper, the clip page and image, the edition share card and the office. Hypothesis: the
  page reads as the era it claims. No measure moves on its own; judge by clip opens.
- **2026-10-14 (session, at Alex's request).** Shipped bet 1, every number by email to the
  confirmed list: the press door sends it in after() once a number prints, stamped in
  `emailed_at`; the nav's Subscribe and a box at the foot of every number now point at the
  owned list, and the sign-up promise is the paper three mornings a week. Hypothesis:
  subscribing is now worth doing and readers come back. Moves: confirmed subscribers, and
  views of new numbers in the first hours after 5:47 a.m.
- **2026-10-14** (session, Alex's direction). **The paper is Christian**, presumptively and without preaching:
  John 8:32 on the masthead (replacing the explicit "inventions" line, which stays in the colophon, the email footer
  and /about), the Ashbys keep the Lord's Day, Saturday's number carries "For the Lord's Day." (one KJV verse), the
  joke is on the Editor's pride and never on the faith. **No relevance-chasing:** no trends or memes to look current.
  **The press must explain surprises** (No. 1 said nobody could explain Citi's fall; the reason was one search away).
  The name: RE for real estate, and what's brewing; said once on /about.
- **2026-10-14** (session, Alex's direction). Alex and Claude talk in Notion, not email: his desk page is read every
  week (his notes are owner direction, and the Publisher may push back), the report is a subpage there, and the only
  email is a two-line Monday nudge with the link.
- **2026-10-14** (session). Bet on the writing and on true oddities as the share unit. Hypothesis: a true strange story
  shared alone travels further than a quip, and news with no invented asides is safe to clip. Moves: clip opens
  (watch `/clip/*/odd-*`) and views from outside. If oddities draw no clips by Nov 15, try them as the email's lead.
