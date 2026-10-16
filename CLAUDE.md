# Rebrew

> **THE INTELLIGENCER (October 14, 2026). The front page is a newspaper.** Alex handed the
> site over ("you have full rein on the website. Take ownership and responsibility") with
> one goal: the most entertaining content possible, and the attention that follows. The
> answer is **The Rebrew Intelligencer**: the real news, three mornings a week (Tuesday,
> Thursday, Saturday), printed as a big-city American daily of 1945 (the paper began in an 1860 voice with No. 1
> and moved to 1945 the same day because 1860 read as dated). **The news is true and
> sourced; the Editor (J. T. Langston), his household, the rival Evening Clarion, the letters
> and the advertisements are inventions**, and the colophon, the email footer and `/about` all
> say so, along with the fact that a machine writes it. Editions are rows in Supabase
> `intelligencer_editions` (JSON `content`, shape in `src/lib/editions.ts`), rendered by
> `src/components/EditionView.tsx` at `/` (latest), `/edition/<YYYY-MM-DD>` and
> `/editions` (Back Issues), with a per-edition share card. **Clip and share:** every item
> (and any line a reader highlights) can be clipped to `/clip/<date>/<item>?l=<p>.<start>.<end>`,
> whose link preview is a torn-newsprint image from `/api/clip-image`. A clip is an address,
> never a copy: the text is rebuilt from the printed number (`src/lib/clips.ts`), so nobody
> can forge a clipping in the paper's name. **The Editor's office (`/office`, first in the nav):**
> Mr. Langston's office, a 1941 Library of Congress photograph (`public/office/office-1941.jpg`, retouched by Alex October 16 with clippings, radio, telephone and the Clarion across the street,
> replaced the SVG drawing October 15, 2026) with clickable spots (`SPOTS` in
> `components/office/OfficeScene.tsx`, some hidden as Easter eggs); every spot
> opens something from the paper, assembled by `src/lib/office.ts`: cast files built by
> searching every number for Dewey, Mrs. Langston, Hatcher, the Clarion and the barometer
> (each line links to its clipping), the month's most-clipped items from `page_hits`, the
> Coffee Can Index against the S&P 500 from `content.ticker` (closes the press writes as
> numbers, validated at the press door), and a countdown to the next press run. The room
> keeps itself up; add a new running gag by giving it a `pattern` in the canon (`src/lib/canon.ts`) and a spot.
> **Claude runs this site (Alex, October 14, 2026):** routines and Claude sessions own the
> product and the creative calls; the standing goal is attention, clicks and sharing,
> within reason and never at the cost of the truth and taste rules. The cloud routine **"Rebrew
> Intelligencer press"** (`trig_01N12Gpuqa2gVG3L7WFutxu4`, 5:47 a.m. ET Tue/Thu/Sat) writes
> and inserts each number; its prompt is versioned in `scripts/intelligencer/PRESS.md`
> (the taste rules and the cast's characters live there; **the canon**, the fixed facts, open threads and the season's arc, is `src/lib/canon.ts`, sent to the press by the door's GET with a record of every sentence ever printed about each character, since the press otherwise sees only the last four numbers). **"Intelligencer circulation report"**
> (`trig_017z59c2rJKARMYZtdE1A4Yh`, Sundays 7:52 a.m. ET; **paused October 14, 2026**, folded into the Publisher's Notion report) emailed Alex the week's numbers;
> prompt in `scripts/intelligencer/CIRCULATION.md`. Both need the Supabase connector (and
> the report Gmail) attached in the claude.ai Routines UI; the API could not attach them.
> **Analytics:** Vercel Web Analytics is not enabled on the project, so every page beacons
> `/api/hit` (`components/PageHit.tsx`), which counts views per day, path and referring host
> in `page_hits` through the `record_hit` function. No cookie, IP or identifier is stored.
> **Illustrations** (`image` on a lead, a dispatch or an oddity; the press door refuses a lead with no picture unless the press sends a `picture_note`; `safeImage` in `editions.ts`; since October 15, 2026 an item may instead carry a `video`, a YouTube news film of the actual event, which the press door checks through YouTube oEmbed and credits to the channel itself, rendered as a grey still until played by `components/FilmPlate.tsx`, because openly licensed photos of this week's events almost never exist and copied news photos draw agency bills) print only
> from Wikimedia Commons or the Library of Congress, with a credit, after the press confirms
> on the file page that the picture shows exactly the named subject under a reusable licence.
> The press also emails Alex three ready-to-post social lines per number. The weekly review
> writes a note to `intelligencer_notes`, which the press reads first: that is the learning
> loop. **The Publisher** (`trig_01KyzXyjKpxfY6zYz9NwEtNQ`, Mondays 6:13 a.m. ET, prompt
> `scripts/intelligencer/PUBLISHER.md`, replacing the fortnightly maintainer October 14,
> 2026) owns the site week to week: it measures against `scripts/intelligencer/STRATEGY.md`
> (goal, measures, dated targets, rules for changing course, ranked backlog), appends to
> `SCOREBOARD.md`, steers the press with a note, builds and ships the top bet, logs it in
> `STRATEGY.md` and `CHANGELOG.md`, and emails Alex a short report with one ask. **A Claude
> session that changes direction should update `STRATEGY.md`**, because that file is the
> Publisher's brief.
> **Alex's desk is in Notion (October 14, 2026): read it first in every Rebrew session.** Page
> `3f904ded13c68059b0b7ec2a0c168ff0` ("Rebrew: Founding Beliefs, Directives, Questions and Comments"). He adds
> numbered notes; Claude answers each with a blue callout under it ("Claude, <date>: ..."), never editing his words,
> and the Publisher writes its weekly report as a subpage there plus a two-line Gmail nudge (Notion does not notify
> him of edits made through his own account). Push back when a note is wrong; he asked for it.
> **Letters from real readers (October 14, 2026):** `/letters` posts to `/api/letters`, which stores the letter in
> `intelligencer_letters` and emails `PRESS_NOTIFY_EMAIL`; the press door's GET lists unprinted letters (no email
> addresses) and POST prints one by `reader_letter_id`, the server copying the words exactly and setting `reader: true`
> (marked "From a reader" on the page), so the press can answer a letter but never alter or forge one. See `src/lib/letters.ts`.
> **The press holds no database or mail access (October 14, 2026).** It reads the open web,
> so it talks to the site only through **`/api/intelligencer/press`**, authed by
> `INTELLIGENCER_PRESS_SECRET` (set in Vercel and in the press's own cloud environment).
> GET returns today's date, the last four numbers, views per number and the desk notes; POST
> prints one number for today after the server rebuilds the JSON field by field (length caps,
> http(s) links only, `safeImage` for pictures, dashes refused) and then emails the link and
> social lines to `PRESS_NOTIFY_EMAIL` through Resend. A hijacked press can at worst print one
> bad number a day. **Subscribers get every number by email (October 14, 2026):** after the
> press has its answer, the door runs `broadcastEdition` (`src/lib/editionEmail.ts`) in
> `after()`, sending a short newspaper (banner, the lead's opening, the other headlines, one
> letter, one ad, a forward line, unsubscribe) to every confirmed `subscribers` row and
> stamping `intelligencer_editions.emailed_at` so a number never goes twice. Manual previews,
> counts and resends: `/api/intelligencer/broadcast?slug=<date>&test=|dry=1|force=1`
> (PUBLISH_SECRET). The nav's Subscribe and a box at the foot of every number point at
> `/subscribe`, the owned list; Substack does not carry the Intelligencer. **"You're in the paper" (October 16, 2026):** the press may send `notices` (item, organization, its published address, the page it is on); `src/lib/notices.ts` validates them and, in `after()`, sends each one fixed note from hello@rebrew.org, logged in `intelligencer_notices` (one per address ever, one per domain a month, 3 a number). Nothing sends unless `INTELLIGENCER_NOTICES=on`. **`page_hits` holds no free text:** `/api/hit` stores only known route
> shapes (article slugs collapse to `/<section>/*`) and a fixed list of referrer labels, and
> two `NOT VALID` check constraints enforce the same at the database for every new row.

## What else is on the site

- **The Archive.** 37 articles from the research publication that ran June to September 2026
  live at `/archive/<slug>`, `/real-estate/<slug>`, `/sales/<slug>` and `/briefing/<slug>`,
  listed on `/reporting` (the footer's Archive). They are rows in `blog_posts` and are never
  edited or deleted, because their URLs are indexed. Nothing writes new posts any more.
- **Pages:** `/about`, `/contact`, `/letters`, `/subscribe`, `/privacy`, `/terms`.
- **Removed in the October 16, 2026 cleanup** (Alex: "clean up codebase"): the `/admin`
  login and editor, `/review`, `/api/publish`, `/api/broadcast`, `/api/admin/*`, the Substack
  sync and Greenville finalize crons, the research and publication engines under `scripts/`,
  the four data-collection GitHub Actions, `BRAND.md` and `X.md`. Their history is in git.
  Earlier plans (a store, October 5; "Just good stories", October 7) are retired; the site is
  the paper.

## Voice for site copy (not the paper)

The paper's voice lives in `scripts/intelligencer/PRESS.md`. Site copy around it: no em or en
dashes, ever; no sentence fragments; uncontracted ("it is"); no hype words; plain words over
internal labels.

## Supabase

Project `ykuenmwfxecmmqichwit` (shared with Taraform, so never touch tables you do not own).
Env: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public, RLS-guarded),
`SUPABASE_SERVICE_KEY` for server writes. The paper's tables: `intelligencer_editions`,
`intelligencer_notes`, `intelligencer_letters`, `page_hits`, `subscribers` (double opt-in,
service key only). `blog_posts` holds the Archive. `referral_leads` holds past form
submissions from the old site and nothing writes to it; `/privacy` says so.

## Environment variables

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://www.rebrew.org`. www is canonical. |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public; RLS controls access. |
| `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` | Service key, never commit. |
| `INTELLIGENCER_PRESS_SECRET` | The press routine's only credential, for `/api/intelligencer/press`. Same value in the press's cloud environment. Unset means 503. |
| `PRESS_NOTIFY_EMAIL` | Where the site sends each number's link and social lines, and each reader's letter. |
| `INTELLIGENCER_NOTICES` | `on` lets the press door send "You're in the paper" notes. Anything else is a dry run reported in the press email. |
| `PUBLISH_SECRET` | Auth for `/api/intelligencer/broadcast` (previews, counts, resends). |
| `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO`, `EMAIL_POSTAL_ADDRESS` | Subscriber mail. |
| `SUBSCRIBE_RATE_LIMIT` | Soft per-IP hourly cap. |

## Deployment

Vercel (Hobby, which is non-commercial: taking money means a paid plan first), auto-deploy on
push to `main`. Repo https://github.com/jsteryous/alexprompts. alexprompts.com stays attached
as a redirect-only domain so old URLs resolve.

```bash
npm run dev | npm run build | npm run lint
```

`npm run lint` runs eslint plus `check:canonicals` (every page route declares its own
canonical or `robots: { index: false }`), which also gates the Vercel build.
`node scripts/brand/preview-email.mjs` renders the confirmation email and result pages.
