import { NextResponse } from "next/server";
import { site } from "@/lib/site";
import {
  ACCENT,
  INK,
  INK_MUTED,
  INK_SOFT,
  PAPER,
  RULE,
  RULE_STRONG,
  SANS,
  SERIF,
  SURFACE,
} from "@/lib/brand";

/**
 * A small standalone HTML result page for browser-facing GET routes: the email
 * confirmation link, unsubscribe, and the engines' one-click publish link.
 * Self-contained styles, no app shell, because these render outside the Next
 * layout and cannot reach Tailwind or the theme tokens.
 *
 * REBUILT ON THE BRAND, August 26, 2026. This is a more important surface than
 * its size suggests and it was the most off-brand thing on the site: a
 * `#f9fafb` page with a 16px-rounded white card, a coloured circle badge, and
 * system sans. Two of the three routes that use it are the FIRST thing a new
 * subscriber sees after handing over an address, in the half-second between
 * trusting us and being on the list, and it looked like a different product.
 *
 * The design is the site's, reduced to one card: paper stock, a squared ruled
 * box, the nameplate, a serif heading, sans furniture. The circle badge is gone
 * rather than restyled, because a coloured status pill is an app pattern and
 * this system says the type and the rules carry it. An eyebrow above the
 * heading does the same job in the same visual language.
 *
 * `body` is trusted HTML, not text: callers pass anchor tags through it. Every
 * caller is first-party, so nothing here is escaped, and nothing user-supplied
 * may be routed into it.
 */
export function htmlPage(heading: string, body: string, status = 200): NextResponse {
  return new NextResponse(resultPageMarkup(heading, body, status), {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

/** The markup, split out so a route that already builds its own NextResponse can
 *  reuse the exact same page rather than growing a second copy of it. */
export function resultPageMarkup(heading: string, body: string, status = 200): string {
  const ok = status >= 200 && status < 300;
  // The status word, as an eyebrow. Oxblood when things went right, because
  // oxblood is simply the brand's colour here and not a "success" green; a
  // muted grey when they did not, so a failure reads as quieter rather than as
  // an alarm. This palette has no semantic red to spend, since red IS the brand.
  const eyebrow = ok ? "Done" : "Something went wrong";
  const eyebrowColor = ok ? ACCENT : INK_MUTED;
  const host = site.url.replace(/^https?:\/\//, "").replace(/^www\./, "");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="robots" content="noindex" />
  <title>${heading} · ${site.name}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:${SANS};background:${PAPER};color:${INK};min-height:100vh;
         display:flex;align-items:center;justify-content:center;padding:24px;
         -webkit-font-smoothing:antialiased}
    .card{background:${SURFACE};border:1px solid ${RULE_STRONG};
          padding:38px 40px 34px;max-width:480px;width:100%}
    .plate{display:flex;align-items:center;gap:10px}
    ${/* Accent, matching `.wordmark-mark` in globals.css: the mark is oxblood
          beside an ink wordmark everywhere it appears. */ ""}
    .plate svg{width:30px;height:30px;flex:none;color:${ACCENT}}
    .name{font-family:${SERIF};font-size:26px;font-weight:700;
          letter-spacing:-0.01em;line-height:1.1}
    .rule{border-top:2px solid ${ACCENT};margin:12px 0 9px}
    .beat{font-size:11px;font-weight:700;letter-spacing:0.13em;
          text-transform:uppercase;color:${ACCENT}}
    .eyebrow{display:block;font-size:11px;font-weight:700;letter-spacing:0.13em;
             text-transform:uppercase;color:${eyebrowColor};margin:30px 0 10px}
    h1{font-family:${SERIF};font-size:24px;font-weight:700;line-height:1.22;
       letter-spacing:-0.012em;margin-bottom:10px}
    p{font-family:${SERIF};font-size:17px;color:${INK_SOFT};line-height:1.55}
    p a{color:${ACCENT};text-decoration:underline}
    .back{display:inline-block;margin-top:28px;font-size:13px;font-weight:600;
          color:${INK};text-decoration:none;border:1px solid ${RULE_STRONG};
          padding:10px 18px}
    .back:hover{border-color:${INK};background:${RULE}}
  </style>
</head>
<body>
  <main class="card">
    <div class="plate">
      ${/* The mark, inline. Unlike email this is a real browser, so the SVG from
           src/components/Mark.tsx renders directly and inherits currentColor,
           which is how the site header draws it too. */ ""}
      <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <polygon points="6,14 15.5,5.5 25,14" fill="currentColor"/>
        <path fill="currentColor" fill-rule="evenodd" d="M8 14h15v10H8z M13.5 18h4v6h-4z"/>
        <rect x="5" y="25" width="21" height="2" fill="currentColor"/>
        <path d="M23 16.5C27.5 16.5 27.5 22 23 22" fill="none" stroke="currentColor" stroke-width="2.8"/>
      </svg>
      <span class="name">${site.name}</span>
    </div>
    <div class="rule"></div>
    <div class="beat">${site.tagline}</div>

    <span class="eyebrow">${eyebrow}</span>
    <h1>${heading}</h1>
    <p>${body}</p>
    <a class="back" href="/">Go to ${host}</a>
  </main>
</body>
</html>`;
}
