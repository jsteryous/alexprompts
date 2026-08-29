/**
 * Render every email template to HTML files you can open in a browser, without
 * sending anything to anyone.
 *
 * There was no way to look at an email short of firing a real send at a real
 * inbox (`/api/broadcast?test=you@example.com`), which needs Resend configured
 * and a verified domain, and which is a slow loop for a styling change. This
 * renders all four templates plus both result pages against a fixture body that
 * exercises every element the engines actually emit.
 *
 * A browser is not an email client and will flatter the output: it honours CSS
 * that Gmail and Outlook drop. Use this to catch layout, hierarchy, and brand
 * drift, then confirm anything risky with a real test send.
 *
 * Run: node scripts/brand/preview-email.mjs [outDir]
 * Default outDir is .preview/email/ (gitignored).
 */
import { createJiti } from "jiti";
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const out = process.argv[2] ?? path.join(root, ".preview", "email");
mkdirSync(out, { recursive: true });

const jiti = createJiti(import.meta.url, {
  alias: { "@": path.join(root, "src") },
  interopDefault: true,
});

const T = await jiti.import(path.join(root, "src/lib/emailTemplates.ts"));
const M = await jiti.import(path.join(root, "src/lib/emailMarkdown.ts"));
const H = await jiti.import(path.join(root, "src/lib/htmlPage.ts"));

// A fixture that exercises every element the engines emit: a clippable lead,
// headings, a citation-dense paragraph (the case that used to render as a nav
// bar), a list with a trailing contrast sentence, a pull quote, a table, and a
// captioned figure (which was passing through completely unstyled).
const md = `Greenville homebuyers have more leverage than a year ago: inventory is up 12%, homes are taking 52 days to sell (vs. 43), and the median sale price is still $330K, per the Greenville MLS.

## What the research actually says

Four studies bear on this, and they disagree in an interesting way. The [Zillow research library](https://www.zillow.com/research/data/) publishes the raw series, the [FHFA index](https://www.fhfa.gov) smooths it, and the [Census building-permit survey](https://www.census.gov/construction/bps/) is the one that leads.

- Days on market moved first, in March.
- Price followed about five months later.
- Inventory is still below where it sat in 2019.

Taylors' 29687 moved least of the six ZIPs.

> A median can sit perfectly still on top of a distribution that changed completely underneath.

### The submarket cut

| ZIP | Days on market | Change |
| --- | --- | --- |
| 29601 | 61 | +18 |
| 29605 | 44 | +9 |
| 29687 | 39 | +2 |

<figure><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Greenville_SC_skyline.jpg/640px-Greenville_SC_skyline.jpg" alt="Greenville" /><figcaption>Median days on market, Greenville County, 2019 to 2026.</figcaption></figure>

That is the whole finding, and it is worth sitting with before anybody calls it a trend.`;

const post = {
  title: "What five years of Greenville sale prices actually show",
  summary: "The median barely moved. Underneath it, almost everything did.",
  postUrl: "https://www.rebrew.org/sales/greenville-sale-prices",
  unsubUrl: "https://www.rebrew.org/api/unsubscribe?token=preview",
};

const bodyHtml = await M.renderEmailBody(md);

const files = {
  "1-broadcast.html": T.postBroadcastEmail({
    ...post,
    bodyHtml,
    bodyMd: md,
    referralUrl: "https://www.rebrew.org/buying-or-selling?ref=preview",
  }).html,
  "2-teaser.html": T.postBroadcastEmail(post).html,
  "3-confirm.html": T.confirmEmail(
    "https://www.rebrew.org/api/subscribe/confirm?token=abc123",
  ).html,
  "4-lead.html": T.leadNotifyEmail({
    name: "Dana Whitfield",
    email: "dana@example.com",
    phone: "864-555-0142",
    intent: "selling",
    location: "Greenville, SC",
    movingFrom: "Charlotte, NC",
    timeframe: "3_months",
    message: "Relocating for work in the spring and want to understand pricing before we list.",
    refSlug: "greenville-sale-prices",
    smsConsent: true,
  }).html,
  "5-page-confirmed.html": H.resultPageMarkup(
    "You are on the list",
    "Thanks for confirming. The next piece will land in your inbox.",
    200,
  ),
  "6-page-error.html": H.resultPageMarkup(
    "Unauthorized",
    "Invalid token. This link may have been tampered with.",
    403,
  ),
};

for (const [name, html] of Object.entries(files)) {
  writeFileSync(path.join(out, name), html);
}

const kb = (s) => (Buffer.byteLength(s) / 1024).toFixed(1);
console.log(`wrote ${Object.keys(files).length} files to ${out}\n`);
for (const [name, html] of Object.entries(files)) {
  console.log(`  ${name.padEnd(24)} ${kb(html).padStart(6)} KB`);
}
console.log(`\nGmail clips a message over ~102KB. The broadcast is the only one that grows with content.`);

// Guard against the retired design system creeping back in. These are the exact
// values the August 2026 newspaper pass removed from the site and that email
// kept shipping for weeks afterwards.
const all = Object.values(files).join("\n");
const banned = {
  "4f46e5": "retired indigo accent",
  "border-radius": "rounded corners (the radius scale is 0 everywhere)",
  "#f4f4f6": "retired grey app-shell background",
  "#0a0c10": "retired off-token ink",
  "#e5e7eb": "retired border grey",
};
const hits = Object.entries(banned)
  .map(([needle, why]) => [needle, why, all.split(needle).length - 1])
  .filter(([, , n]) => n > 0);
if (hits.length) {
  console.log("\nRETIRED DESIGN VALUES STILL PRESENT:");
  for (const [needle, why, n] of hits) console.log(`  ${needle} x${n}  (${why})`);
  process.exitCode = 1;
} else {
  console.log("\nNo retired design values found.");
}

// A double quote inside a font stack closes the style="..." attribute it is
// interpolated into, and the browser then discards the WHOLE declaration. The
// symptom is every font in the message falling back to the client default
// (Times, in most mail clients), which looks like a design choice rather than a
// bug and is invisible in a diff. This shipped once, on August 26, 2026, and was
// caught only by rendering the email and looking at it. See the note on SERIF
// and SANS in src/lib/brand.ts.
const truncated = all.match(/font-family:[^;"']*"/g) ?? [];
if (truncated.length) {
  console.log(
    `\nBROKEN font-family ATTRIBUTES: ${truncated.length}. A double-quoted family name is closing its style attribute early; use single quotes.`,
  );
  console.log(`  first: ${truncated[0]}`);
  process.exitCode = 1;
} else {
  console.log("No truncated font-family declarations.");
}
