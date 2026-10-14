# The Rebrew Intelligencer: changes to the site

The maintainer routine (prompt in `MAINTAINER.md`) appends one dated entry per change.

- **2026-10-14.** The paper launched: front page, back numbers, per-number share cards, first-party pageview counts.
- **2026-10-14.** Illustrations: a lead or dispatch may carry an openly licensed picture from Wikimedia Commons or the Library of Congress, printed in ink with its credit. The press emails Alex three ready-to-post social lines with each number, and the weekly review leaves notes the press reads.

- **2026-10-14** (session). The fortnightly maintainer became the weekly Publisher (PUBLISHER.md), with STRATEGY.md as its brief
  and SCOREBOARD.md as its record. Backlog: edition email to subscribers, 1945 typography, Real or Ashby?
- **2026-10-14** (session). 1945 typography: Oswald banner heads, Libre Bodoni decks and departments, blackletter nameplate
  kept. Paper, clip page and image, share card and office (src/lib/paperFonts.ts, src/lib/ogFonts.ts).
- **2026-10-14** (session). Every number by email to confirmed subscribers (src/lib/editionEmail.ts, sent from the press door
  in after()); Subscribe now points at the owned list; a sign-up box closes every number.
- **2026-10-14** (session). The press must explain surprises: when a result runs against its obvious reading (Citi beat
  and fell, and No. 1 said nobody could account for it), it searches for the reason and prints it, attributed. Live in the
  routine. Desk note 2 asks No. 2 for a "Further to" item on Citi.
- **2026-10-14** (session). John 8:32 replaces the "inventions" line under the nameplate (page, email, share card);
  the disclosure stays in the colophon, the email footer and /about. PRESS.md gains the paper's faith and Saturday's
  "For the Lord's Day."; /about says what the name means.
- **2026-10-14** (session). Letters to the Editor from real readers: /letters (form, no links, 1,500 characters) stores
  to `intelligencer_letters` and emails Alex; the press door shows unprinted letters (never the email) and prints one by
  `reader_letter_id`, copying the reader's words exactly and marking it "From a reader". Every number links to /letters.
- **2026-10-14** (session). The Publisher reads Alex's Notion desk and reports there (subpage plus callouts under his
  notes), with a two-line Gmail nudge; its limits now name the colophon, not the masthead, and include the letters form.
- **2026-10-14** (session). Circulation report paused (routine disabled): the Publisher measures the same numbers and
  reports in Notion, so Alex gets one weekly report, not two.
- **2026-10-14** (session). The writing. No. 1 closed eight news paragraphs on an Editor quip and ran two gags twice, so
  the press now keeps every invented person out of the news (any item may be clipped alone and must be true end to end),
  each gag runs once a number, the lead is 4 to 6 paragraphs and dispatches 2. New department **Strange but True**
  (`content.oddities`, clip ids `odd-N`): 2 or 3 verified odd true stories, printed after the wire and sent in full in the
  subscribers' email.
- **2026-10-14** (session). Design: favicon is the nameplate's blackletter R; the light/dim switch moved into the nav.
  Pictures: the press now illustrates with **period plates**, real 1930 to 1955 photographs from the Library of
  Congress of the same kind of thing (the Exchange floor, a bank's tellers), captioned with their year, alongside exact
  subject pictures; the lead should carry one. The lead's picture now heads the subscribers' email.
