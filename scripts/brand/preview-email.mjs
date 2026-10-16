/**
 * Render the confirmation email and the two result pages to HTML files you can
 * open in a browser, without sending anything to anyone. Preview a number of the
 * Intelligencer with /api/intelligencer/broadcast?slug=<date>&test=you@example.com.
 *
 * A browser is not an email client and will flatter the output. Use this to catch
 * layout and brand drift, then confirm anything risky with a real test send.
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
const H = await jiti.import(path.join(root, "src/lib/htmlPage.ts"));

const files = {
  "1-confirm.html": T.confirmEmail(
    "https://www.rebrew.org/api/subscribe/confirm?token=abc123",
  ).html,
  "2-page-confirmed.html": H.resultPageMarkup(
    "You are on the list",
    "Thanks for confirming. The next piece will land in your inbox.",
    200,
  ),
  "3-page-error.html": H.resultPageMarkup(
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
