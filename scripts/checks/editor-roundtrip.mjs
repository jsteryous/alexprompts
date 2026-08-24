/**
 * Gate on the WYSIWYG editor's markdown round trip.
 *
 * The /admin editor is a rich-text surface, so every post it opens goes
 * markdown -> HTML -> (editing) -> markdown. `blog_posts.body_md` is still the
 * source of truth for the site, the broadcast email, and all three content
 * engines, so opening a post and saving it WITHOUT TYPING must not change how
 * it renders. This asserts exactly that against every row in the database, plus
 * a set of literal fixtures so the check still means something with no DB
 * credentials around (CI, a fresh clone).
 *
 * Run by `npm run lint`. If it fails, the fix belongs in
 * `src/lib/editorMarkdown.ts`, not here. Keep the bridge below mirrored with
 * that file.
 */
import { readFileSync } from "node:fs";
import { marked } from "marked";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

// ── the bridge, mirrored from src/lib/editorMarkdown.ts ────────────────────
// (a copy, because that module is TypeScript and this check runs as plain node
// with no build step in front of it)
const mdToEditorHtml = (md) => marked.parse(md ?? "", { breaks: true, async: false });
const escapeAttr = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

function makeTurndown() {
  const td = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "*",
    strongDelimiter: "**",
    linkStyle: "inlined",
    hr: "---",
    br: "",
  });
  td.use(gfm);

  // Mirrors the emphasis and list rules in src/lib/editorMarkdown.ts. See the
  // long comment there for why they exist.
  const perLineEmphasis = (delimiter) => (content) => {
    if (!content.trim()) return content;
    return content
      .split("\n")
      .map((line) => {
        const lead = /^\s*/.exec(line)[0];
        const rest = line.slice(lead.length);
        const trail = /\s*$/.exec(rest)[0];
        const core = rest.slice(0, rest.length - trail.length);
        return core ? `${lead}${delimiter}${core}${delimiter}${trail}` : line;
      })
      .join("\n");
  };
  td.addRule("strongPerLine", { filter: ["strong", "b"], replacement: perLineEmphasis("**") });
  td.addRule("emphasisPerLine", { filter: ["em", "i"], replacement: perLineEmphasis("*") });
  td.addRule("tightListItem", {
    filter: (node) => node.nodeName === "P" && node.parentNode?.nodeName === "LI",
    replacement: (content, node) => {
      const siblings = Array.from(node.parentNode?.childNodes ?? []).filter((n) => n.nodeType === 1);
      return siblings.length === 1 ? content : `${content}

`;
    },
  });
  td.addRule("figure", {
    filter: "figure",
    replacement: (_content, node) => {
      const img = node.querySelector("img");
      if (!img) return "";
      const src = escapeAttr(img.getAttribute("src") ?? "");
      const alt = escapeAttr(img.getAttribute("alt") ?? "");
      const caption = node.querySelector("figcaption")?.textContent?.trim() ?? "";
      const cap = caption ? `<figcaption>${caption}</figcaption>` : "";
      return `\n\n<figure><img src="${src}" alt="${alt}" />${cap}</figure>\n\n`;
    },
  });
  return td;
}
const turndown = makeTurndown();
const editorHtmlToMd = (html) =>
  turndown.turndown(html ?? "").replace(/\n{3,}/g, "\n\n").trim() + "\n";

// ── comparison ─────────────────────────────────────────────────────────────
// Compare RENDERED OUTPUT, not markdown source. Turndown legitimately
// normalises the source (setext headings become atx, `*` bullets become `-`),
// and that is fine as long as the reader sees the same page.
function normalize(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    // Whitespace at the very end of a block never renders, so turndown trimming
    // it is a tidy-up rather than a difference the reader can see.
    .replace(/\s+<\/(p|li|h[1-6]|blockquote|figcaption|td|th)>/g, "</$1>")
    // `loading` and `fetchpriority` on a body image are inert in storage:
    // renderPostHtml sets both per-image at render time (eager + high priority
    // on the first, lazy below it), so whatever a stored <img> carries is
    // overwritten before a reader sees it.
    .replace(/ (loading|fetchpriority|decoding)="[^"]*"/g, "")
    .replace(/> </g, "><")
    .trim();
}

function check(name, md) {
  const once = mdToEditorHtml(md);
  const back = editorHtmlToMd(once);
  const twice = mdToEditorHtml(back);
  const a = normalize(once);
  const b = normalize(twice);
  if (a === b) return null;
  // Report where it actually diverges, so a failure is actionable.
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return {
    name,
    at: i,
    before: a.slice(Math.max(0, i - 90), i + 90),
    after: b.slice(Math.max(0, i - 90), i + 90),
  };
}

// ── fixtures: the constructs the corpus actually uses ──────────────────────
const FIXTURES = {
  "heading + paragraph": "## Where the leverage is\n\nInventory is up 12% over the year.\n",
  "bold and italic": "The **median sale price** is still *roughly flat* this year.\n",
  "soft line break": "Spring listings sell faster.\nWeekend listings get more views.\n",
  "bullet list":
    "The ZIPs that moved most:\n\n- 29662 Mauldin: inventory rose to 61 homes.\n- 29669 Pelzer: the price-cut share climbed 7.3 points.\n",
  "numbered list": "1. Tell me what you are working on.\n2. We talk it through.\n",
  link: "Source: [Greenville Journal](https://greenvillejournal.com/a-story/).\n",
  blockquote: "> The county has not published the agreement.\n",
  image: "![Falls Park in downtown Greenville](https://example.com/falls.jpg)\n",
  "figure with caption":
    '<figure><img src="https://example.com/a.png" alt="Aerial view" /><figcaption>The corner of McDaniel and East.</figcaption></figure>\n',
  "figure without caption": '<figure><img src="https://example.com/a.png" alt="" /></figure>\n',
  "horizontal rule": "One thing to watch.\n\n---\n\nThanks for reading.\n",
  "nested emphasis": "Listing ***well below*** market value.\n",
  "dollar and percent": "Median $317,097, up 24.2% vs 1.9% nationally.\n",
  "underscores in a url": "See https://example.com/a_b_c and the file some_name_here.\n",
  "line starting with a dash": "The read this week:\n\n- up on inventory\n",
  "bold heading line": "**Presentation**\nStaging and photography correlate with faster sales.\n",
};

const failures = [];
for (const [name, md] of Object.entries(FIXTURES)) {
  const f = check(`fixture: ${name}`, md);
  if (f) failures.push(f);
}
let checked = Object.keys(FIXTURES).length;

// ── editor-shaped HTML ─────────────────────────────────────────────────────
// The fixtures above start from markdown, so they only ever exercise the HTML
// that `marked` produces. The editor emits a DIFFERENT shape (TipTap wraps list
// item text in <p>, and marks a selection that carries a line break as
// <strong>text<br></strong>), and that shape is what actually gets saved. These
// assert the markdown the editor writes renders the way the writer meant.
//
// The <strong><br></strong> case is the August 24 bug: bolding a line by
// triple-clicking it selects the trailing break too, and `**text\n**` is
// literal asterisks on the published page.
const EDITOR_CASES = [
  {
    name: "bold carrying a trailing hard break",
    html: "<p><strong>Presentation<br></strong>Staging matters.</p>",
    mustMatch: /<strong>Presentation<\/strong>/,
    mustNotMatch: /\*\*/,
  },
  {
    name: "bold across a hard break, text on both sides",
    html: "<p><strong>Spring listings sell faster.<br>Weekend listings get more views.</strong></p>",
    mustMatch: /<strong>Spring listings sell faster\.<\/strong>/,
    mustNotMatch: /\*\*/,
  },
  {
    name: "italic carrying a trailing space",
    html: "<p>Listing <em>below market value </em>can trigger bids.</p>",
    mustMatch: /<em>below market value<\/em>/,
    mustNotMatch: /\*/,
  },
  {
    name: "tight list item wrapped in a paragraph",
    html: "<ul><li><p>29662 Mauldin: inventory rose to 61 homes.</p></li><li><p>29669 Pelzer: cuts climbed 7.3 points.</p></li></ul>",
    mustMatch: /<li>29662 Mauldin/,
    mustNotMatch: /<li><p>/,
  },
  {
    name: "figure with a caption typed in the editor",
    html: '<figure><img src="https://example.com/a.png" alt=""><figcaption>The corner of McDaniel and East.</figcaption></figure>',
    mustMatch: /<figcaption>The corner of McDaniel and East\.<\/figcaption>/,
  },
  {
    name: "heading and paragraph",
    html: "<h2>Where the leverage is</h2><p>Inventory is up 12%.</p>",
    mustMatch: /<h2>Where the leverage is<\/h2>/,
  },
  {
    name: "link",
    html: '<p>Source: <a href="https://greenvillejournal.com/x/">Greenville Journal</a>.</p>',
    mustMatch: /<a href="https:\/\/greenvillejournal\.com\/x\/">Greenville Journal<\/a>/,
  },
];

for (const c of EDITOR_CASES) {
  checked++;
  const md = editorHtmlToMd(c.html);
  const out = mdToEditorHtml(md);
  const bad = [];
  if (c.mustMatch && !c.mustMatch.test(out)) bad.push(`expected ${c.mustMatch}`);
  if (c.mustNotMatch && c.mustNotMatch.test(out)) bad.push(`must not contain ${c.mustNotMatch}`);
  if (bad.length) {
    failures.push({
      name: `editor: ${c.name}  (${bad.join("; ")})`,
      at: 0,
      before: md.replace(/\n/g, "\n"),
      after: out,
    });
  }
}

// ── every real post, when credentials are available ────────────────────────
function envFromFile() {
  try {
    const out = {};
    for (const line of readFileSync(".env.local", "utf8").split("\n")) {
      const m = /^([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line.trim());
      if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
    return out;
  } catch {
    return {};
  }
}
const env = { ...envFromFile(), ...process.env };
const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (url && key) {
  try {
    const resp = await fetch(`${url}/rest/v1/blog_posts?select=slug,body_md`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (resp.ok) {
      for (const row of await resp.json()) {
        if (!row.body_md) continue;
        checked++;
        const f = check(`post: ${row.slug}`, row.body_md);
        if (f) failures.push(f);
      }
    } else {
      console.log(`  (skipped live posts: Supabase returned ${resp.status})`);
    }
  } catch {
    console.log("  (skipped live posts: Supabase unreachable)");
  }
} else {
  console.log("  (skipped live posts: no Supabase credentials)");
}

if (failures.length) {
  console.error(`\nEditor round trip FAILED on ${failures.length} of ${checked}:\n`);
  for (const f of failures.slice(0, 8)) {
    console.error(`  ${f.name}  (diverges at char ${f.at})`);
    console.error(`    loaded: ...${f.before}...`);
    console.error(`    saved:  ...${f.after}...\n`);
  }
  process.exit(1);
}
console.log(
  `Editor round trip passed: ${checked} bodies render identically after a load/save cycle.`,
);
