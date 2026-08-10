#!/usr/bin/env node
/**
 * Canonical guard: every page route declares its own canonical, or says noindex.
 *
 * WHY THIS EXISTS. Next.js merges metadata shallowly down the route tree, so a
 * `alternates.canonical` on the root layout is inherited by any page that does
 * not set one. A new route that forgot its canonical would ship pointing at the
 * homepage, and Google would quietly drop it from the index as "Alternate page
 * with proper canonical tag" with no build error, no lint warning, and no
 * runtime symptom. The root layout no longer sets one (so the failure mode is
 * safe), and this check makes the omission loud.
 *
 * THE RULE. Every `src/app/**\/page.tsx` must contain either:
 *   - `alternates: { canonical: ... }`  (a public, indexable page), or
 *   - `robots: { index: false }`        (a gated route: /admin, /review)
 *
 * This is a text check, not an AST parse, which is the right altitude: the
 * convention across all 24 routes is a literal `alternates: { canonical: ... }`
 * in the page file, either on a static `metadata` export or inside
 * `generateMetadata`. Pulling the canonical out into a helper would defeat the
 * check, so do not do that without teaching this script about it.
 *
 * Run: npm run check:canonicals   (also runs on `npm run lint` and prebuild)
 */

import { readFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const appDir = join(repoRoot, "src", "app");

/** Every page.tsx under src/app, recursively. */
async function pageFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const found = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...(await pageFiles(full)));
    } else if (entry.name === "page.tsx" || entry.name === "page.ts") {
      found.push(full);
    }
  }
  return found;
}

// `alternates` and `canonical` on the same object, tolerant of formatting and
// of whatever the canonical is built from (template literal, helper call).
const HAS_CANONICAL = /alternates\s*:\s*{[^}]*canonical\s*:/s;
// A page can opt out by telling robots not to index it.
const IS_NOINDEX = /robots\s*:\s*{[^}]*index\s*:\s*false/s;

const files = await pageFiles(appDir);
const missing = files.filter((file) => {
  const source = readFileSync(file, "utf8");
  return !HAS_CANONICAL.test(source) && !IS_NOINDEX.test(source);
});

if (missing.length > 0) {
  const routeOf = (file) =>
    "/" +
    relative(appDir, file)
      .split(sep)
      .slice(0, -1)
      .filter((segment) => !segment.startsWith("(") && !segment.startsWith("@"))
      .join("/");

  console.error(
    `\nCanonical check FAILED. ${missing.length} route${missing.length === 1 ? "" : "s"} ` +
      `ship${missing.length === 1 ? "s" : ""} without a canonical URL:\n`,
  );
  for (const file of missing) {
    console.error(`  ${routeOf(file) || "/"}\n    ${relative(repoRoot, file)}`);
  }
  console.error(
    "\nAdd ONE of these to the page's metadata (or generateMetadata):\n" +
      "\n  alternates: { canonical: `${site.url}/your-route` },   // public page" +
      "\n  robots: { index: false, follow: false },               // gated route\n" +
      "\nWithout a canonical, Google may index the wrong URL or drop the page.\n",
  );
  process.exit(1);
}

console.log(`Canonical check passed: ${files.length} routes.`);
