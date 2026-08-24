import { marked } from "marked";
import TurndownService from "turndown";
// @ts-expect-error -- turndown-plugin-gfm ships no types
import { gfm } from "turndown-plugin-gfm";

/**
 * The markdown <-> HTML bridge for the WYSIWYG editor.
 *
 * `blog_posts.body_md` stays the source of truth: the three content engines
 * write markdown, `renderMarkdown.ts` renders the site from it, and
 * `emailMarkdown.ts` renders the broadcast from it. The editor is the only
 * place that ever leaves markdown, and it comes straight back on save.
 *
 * Both directions run in the BROWSER (marked and turndown are both isomorphic),
 * so the editor never round-trips through the network to reformat a keystroke.
 *
 * The one rule that matters here: this pair must be STABLE. Loading a post and
 * saving it without typing has to give back markdown that renders identically.
 * `scripts/checks/editor-roundtrip.mjs` asserts that against every row in the
 * database and runs as part of `npm run lint`, so a change here that breaks an
 * engine-written body fails the build instead of a published article.
 */

/** Markdown -> HTML for loading into the editor. */
export function mdToEditorHtml(md: string): string {
  // `breaks: true` matches renderMarkdown.ts, so a single Enter is a real line
  // break in the editor exactly as it is on the published page.
  return marked.parse(md ?? "", { breaks: true, async: false }) as string;
}

const escapeAttr = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

function makeTurndown(): TurndownService {
  const td = new TurndownService({
    // House style, matched to what the engines already write so a hand-edited
    // post stays diff-clean against an engine-written one.
    headingStyle: "atx", // ## Heading, not the underline form
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "*",
    strongDelimiter: "**",
    linkStyle: "inlined",
    hr: "---",
    // Site and email both render with `breaks: true`, so a bare newline IS a
    // line break. Turndown's default trailing-two-spaces form would survive but
    // leaves invisible whitespace at the end of every line.
    br: "",
  });
  td.use(gfm);

  // THE AUGUST 24 BUG, GUARDED AT THE SERIALIZER.
  //
  // A markdown emphasis delimiter may not span a line break and may not sit
  // next to whitespace: `**text\n**` is literal asterisks on the page, not bold.
  // The editor makes that shape easy to produce, because selecting a line by
  // triple-click or shift+down carries the line's hard break along, and TipTap
  // faithfully marks it as `<strong>text<br></strong>`. Turndown's stock rule
  // wraps the whole run and writes exactly the markdown that shipped broken.
  //
  // Emitting one delimited run PER LINE is the fix, and putting it here means
  // every path is covered at once: the bubble menu, Ctrl+B, the `**` input rule,
  // and anything pasted in from elsewhere.
  const perLineEmphasis = (delimiter: string) => (content: string) => {
    if (!content.trim()) return content;
    return content
      .split("\n")
      .map((line) => {
        const lead = /^\s*/.exec(line)![0];
        const rest = line.slice(lead.length);
        const trail = /\s*$/.exec(rest)![0];
        const core = rest.slice(0, rest.length - trail.length);
        return core ? `${lead}${delimiter}${core}${delimiter}${trail}` : line;
      })
      .join("\n");
  };
  td.addRule("strongPerLine", {
    filter: ["strong", "b"],
    replacement: perLineEmphasis("**"),
  });
  td.addRule("emphasisPerLine", {
    filter: ["em", "i"],
    replacement: perLineEmphasis("*"),
  });

  // TipTap wraps every list item's text in a paragraph (`<li><p>text</p></li>`).
  // Turndown reads that as a LOOSE list and pads each item with blank lines,
  // which marked then renders back with a <p> inside every <li> and visibly
  // looser spacing than the engines' own lists. Unwrap the paragraph when it is
  // the item's only child; a genuinely multi-paragraph item keeps its blank line.
  td.addRule("tightListItem", {
    filter: (node) => node.nodeName === "P" && node.parentNode?.nodeName === "LI",
    replacement: (content, node) => {
      const siblings = Array.from(node.parentNode?.childNodes ?? []).filter(
        (n) => n.nodeType === 1,
      );
      return siblings.length === 1 ? content : `${content}\n\n`;
    },
  });

  // Captioned images have no markdown spelling, so a figure stays HTML. `marked`
  // passes block-level HTML straight through and sanitize-html allows
  // figure/figcaption, so this renders unchanged on the site and in email.
  //
  // A figure is preserved even when it has NO caption, which looks redundant and
  // is not: the two Substack-mirrored archive posts store their images that way,
  // and degrading them to `![](src)` would swap a `<figure>` for a `<p>` and move
  // the image onto different prose margins. A plain markdown image stays a plain
  // markdown image, so both spellings survive a load/save untouched.
  td.addRule("figure", {
    filter: "figure",
    replacement: (_content, node) => {
      const el = node as unknown as HTMLElement;
      const img = el.querySelector("img");
      if (!img) return "";
      const src = escapeAttr(img.getAttribute("src") ?? "");
      const alt = escapeAttr(img.getAttribute("alt") ?? "");
      const caption = el.querySelector("figcaption")?.textContent?.trim() ?? "";
      const cap = caption ? `<figcaption>${caption}</figcaption>` : "";
      return `\n\n<figure><img src="${src}" alt="${alt}" />${cap}</figure>\n\n`;
    },
  });

  return td;
}

const turndown = makeTurndown();

/** Editor HTML -> markdown for saving back into `body_md`. */
export function editorHtmlToMd(html: string): string {
  return (
    turndown
      .turndown(html ?? "")
      // Turndown leaves a run of blank lines wherever a block was removed.
      .replace(/\n{3,}/g, "\n\n")
      .trim() + "\n"
  );
}
