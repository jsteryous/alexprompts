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

1. **Deliver each number by email to confirmed subscribers.** When the press prints, the
   site sends the number (or its best three items with a link) to the owned list through
   the existing Resend broadcast path. Hypothesis: subscribing becomes worth doing and
   readers come back three mornings a week. Moves: subscribers, weekly views. Also point the
   nav's Subscribe link at `/subscribe` (the owned list) instead of Substack, so every
   sign-up is ours and countable.
2. **1945 typography.** The headlines are set in IM Fell, an eighteenth-century face. A 1945
   daily ran banner heads in heavy condensed type and body copy in a sturdy news serif.
   Keep the blackletter nameplate. Apply to the paper, the clip page and image, and the
   office. Hypothesis: the page reads as the era it claims, and reads faster. Moves: time on
   page is not measured, so judge by clip opens and Alex's reaction.
3. **"Real or Ashby?"** A game on each number: six headlines, some true from the news and
   some invented by the Editor, and the reader guesses which. A shareable result grid in the
   Wordle style, with no spoilers. Real headlines come from the printed news; invented ones
   are labelled as inventions once answered. Hypothesis: the paper's premise (the truth
   sounds made up) is most shareable as a game. Moves: views from outside, clip opens.
4. **A share prompt after reading.** At the foot of each number, the single funniest line
   pre-clipped, with one tap to share it.
5. **Forwardable edition emails.** A "Forward to a friend who needs this" line and a
   sign-up link in every edition email.
6. **The office grows.** A new object whenever a new running gag earns one.

## Log

- **2026-10-14.** Strategy written. Baseline zero. The paper moved to a 1945 voice, clip and
  share went live, and the Editor's office went live. The Publisher routine took over from
  the fortnightly maintainer, with this file as its brief.
