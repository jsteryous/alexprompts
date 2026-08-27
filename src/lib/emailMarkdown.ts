import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { SITE_URL } from "@/lib/site";

/**
 * Markdown -> inline-styled HTML for EMAIL. Deliberately separate from
 * `renderMarkdown.ts` (the site pipeline) for two reasons that make sharing
 * impossible rather than merely awkward:
 *
 *   1. Email clients drop <style> blocks, external CSS, and class attributes,
 *      so every element needs its style inlined. The site relies on Tailwind's
 *      `theme-prose` classes, which arrive in an inbox as unstyled text.
 *   2. The site rewrites Supabase images to relative `/_next/image?...` URLs for
 *      the responsive srcset. A relative URL cannot resolve in a mail client, so
 *      email keeps the original absolute src and caps width with inline CSS.
 *
 * Same trusted pair underneath (marked + sanitize-html), and the styles are
 * injected through sanitize-html's `transformTags` rather than by regexing the
 * rendered HTML, so we never hand-parse markup.
 */

/**
 * REBUILT ON THE BRAND, August 26, 2026, alongside `emailTemplates.ts`. This
 * file was still rendering the retired pre-newspaper-pass system: indigo links,
 * a sans-serif reading surface, and rounded images. Colours and typefaces now
 * come from `lib/brand.ts`, which mirrors globals.css.
 *
 * TWO CHANGES ARE SUBSTANTIVE RATHER THAN COSMETIC, and both come straight from
 * decisions the site already made and email had never inherited:
 *
 *   1. THE BODY IS SERIF. The site's editorial split puts `.theme-prose` in the
 *      Charter stack because that is what makes a page read as a publication.
 *      A broadcast IS the article, in full, so it is the one email that most
 *      needs the reading surface to match. Sans stays on the furniture below.
 *
 *   2. PROSE LINKS ARE INK, NOT ACCENT. globals.css moved `.theme-prose a` to
 *      underlined ink with an accent-tinted underline because "the old bare
 *      accent colour made a paragraph with three citations look like a nav
 *      bar." That reasoning is stronger here, not weaker: these pieces are
 *      sourced against primary documents and routinely carry a dozen links, and
 *      in the inbox every one of them was rendering as bright indigo. The
 *      accent-tinted underline degrades safely: clients that do not support
 *      `text-decoration-color` (older Outlook) simply draw an ink underline,
 *      which is still the print convention and still correct.
 */
import { ACCENT, INK, INK_MUTED, RULE, RULE_STRONG, SANS, SERIF, WASH } from "@/lib/brand";

/** The accent at 55% over white, matching `.theme-prose a`'s underline tint in
 *  globals.css. Precomputed because email CSS has no `color-mix()`. */
const ACCENT_UNDERLINE = "#c78686";

/**
 * Per-tag inline styles. Sizes are a touch larger than the site's because inbox
 * reading skews mobile and Gmail's own body text sits at 16px. Margins are
 * bottom-only: `margin-top` collapse is inconsistent across Outlook versions,
 * so stacking one direction keeps rhythm predictable.
 *
 * Headings step DOWN from the email's own <h1> in `emailTemplates.ts`. A body
 * `##` that renders at the same size as the article title flattens the hierarchy
 * the writer built.
 */
const STYLES: Record<string, string> = {
  p: `margin:0 0 18px;font-family:${SERIF};font-size:17px;line-height:1.62;color:${INK};`,
  h1: `margin:30px 0 12px;font-family:${SERIF};font-size:23px;font-weight:700;line-height:1.25;letter-spacing:-0.012em;color:${INK};`,
  h2: `margin:32px 0 12px;font-family:${SERIF};font-size:20px;font-weight:700;line-height:1.3;letter-spacing:-0.012em;color:${INK};`,
  h3: `margin:26px 0 10px;font-family:${SERIF};font-size:17px;font-weight:700;line-height:1.4;color:${INK};`,
  h4: `margin:22px 0 8px;font-family:${SERIF};font-size:16px;font-weight:700;color:${INK};`,
  // The gap AFTER a list is deliberately much larger than the gap BETWEEN its
  // items (26px vs 6px). The engines write a bulleted run and then a closing
  // contrast sentence as a plain paragraph, e.g. five ZIPs that gained the most
  // followed by "Taylors' 29687 moved least." At an even 18px/8px that trailing
  // paragraph read as a sixth bullet whose marker had gone missing. Inline CSS
  // has no sibling selector to special-case it, so the ratio does the work.
  ul: `margin:0 0 26px;padding-left:22px;`,
  ol: `margin:0 0 26px;padding-left:22px;`,
  li: `margin:0 0 6px;font-family:${SERIF};font-size:17px;line-height:1.58;color:${INK};`,
  // A pull quote reads as display type on the site, not as a muted aside
  // (`.theme-prose blockquote p` explicitly un-italicises it), so the italic is
  // gone here too. The rule on the left is the strong one, since rules are
  // structure in this system.
  blockquote: `margin:0 0 22px;padding:2px 0 2px 18px;border-left:3px solid ${RULE_STRONG};font-family:${SERIF};color:${INK_MUTED};`,
  // Ink with an accent-tinted underline. See the note at the top of this file:
  // a sourced piece carries a dozen citations, and rendering them all in the
  // brand colour turns a paragraph into a nav bar.
  a: `color:${INK};text-decoration:underline;text-decoration-color:${ACCENT_UNDERLINE};text-underline-offset:2px;`,
  strong: `font-weight:700;color:${INK};`,
  b: `font-weight:700;color:${INK};`,
  em: `font-style:italic;`,
  i: `font-style:italic;`,
  hr: `border:0;border-top:1px solid ${RULE_STRONG};margin:30px 0;`,
  // Square. A rounded photo is a card and a squared one is a plate, which is the
  // same call `.theme-prose img` makes on the site.
  img: `display:block;width:100%;max-width:100%;height:auto;margin:0 0 10px;`,
  // Substack-mirrored posts arrive as real <figure>/<figcaption> pairs, and both
  // tags are in sanitize-html's defaults, so they were passing through UNSTYLED:
  // a caption rendered as ordinary body copy, indistinguishable from the
  // sentence above it. Sans, small, muted, and flush left is the press
  // convention and what the site already does.
  figure: `margin:0 0 24px;`,
  figcaption: `margin:0;font-family:${SANS};font-size:13px;line-height:1.5;color:${INK_MUTED};text-align:left;`,
  // No published post uses a pipe table today, but the engines are free to emit
  // one, and an unstyled email table collapses into unreadable run-on text.
  // Sans, because a table is furniture rather than a reading surface.
  table: `width:100%;border-collapse:collapse;margin:0 0 22px;font-family:${SANS};font-size:14px;`,
  th: `text-align:left;padding:8px 10px;border-bottom:2px solid ${RULE_STRONG};color:${INK};font-weight:700;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;`,
  td: `padding:8px 10px;border-bottom:1px solid ${RULE};color:${INK};vertical-align:top;`,
  code: `font-family:ui-monospace,Menlo,Consolas,monospace;font-size:14px;background:${WASH};color:${ACCENT};padding:2px 5px;`,
  pre: `margin:0 0 22px;padding:14px;background:${WASH};overflow-x:auto;font-size:14px;`,
};

/** Make a root-relative URL absolute. Mail clients have no page origin to
 *  resolve against, so `/real-estate/foo` would simply be a dead link. */
function absolutize(url: string | undefined): string | undefined {
  if (!url) return url;
  if (url.startsWith("/")) return `${SITE_URL}${url}`;
  return url;
}

/** Build the transformTags map: inline the style, absolutize links and images. */
function buildTransforms(): sanitizeHtml.IOptions["transformTags"] {
  const transforms: NonNullable<sanitizeHtml.IOptions["transformTags"]> = {};
  for (const tag of Object.keys(STYLES)) {
    transforms[tag] = (tagName, attribs) => {
      const next: Record<string, string> = { ...attribs, style: STYLES[tagName] };
      if (tagName === "a") {
        const href = absolutize(attribs.href);
        if (href) next.href = href;
        // Outbound sources open in a new tab; webmail ignores it but native
        // clients honor it, and it keeps the reader's place in the email.
        next.target = "_blank";
        next.rel = "noopener noreferrer";
      }
      if (tagName === "img") {
        const src = absolutize(attribs.src);
        if (src) next.src = src;
        // Width/height attributes from the editor fight the fluid inline style
        // in Outlook, which honors the attribute over the CSS.
        delete next.width;
        delete next.height;
      }
      return { tagName, attribs: next };
    };
  }
  return transforms;
}

/**
 * Render a post body for email. Returns inline-styled, sanitized HTML.
 * `body_md` is first-party, but it is sanitized anyway for the same
 * defense-in-depth reason the site pipeline gives.
 */
export async function renderEmailBody(md: string): Promise<string> {
  return sanitizeHtml(await marked(md ?? "", { breaks: true }), {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img", "h1", "h2"],
    allowedAttributes: {
      // `style` is what carries all the formatting, so it must survive on every
      // tag. Leaving `allowedStyles` unset keeps the values verbatim; setting it
      // would silently drop any property not enumerated.
      "*": ["style"],
      a: ["href", "target", "rel", "style"],
      img: ["src", "alt", "style"],
    },
    transformTags: buildTransforms(),
  });
}
