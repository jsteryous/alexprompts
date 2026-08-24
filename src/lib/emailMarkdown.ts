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

const INK = "#0a0c10";
const MUTED = "#555";
const ACCENT = "#4f46e5";
const BORDER = "#e5e7eb";
const SUBTLE = "#f4f4f6";

/**
 * Per-tag inline styles. Sizes are a touch larger than the site's because inbox
 * reading skews mobile and Gmail's own body text sits at 16px. Margins are
 * bottom-only: `margin-top` collapse is inconsistent across Outlook versions,
 * so stacking one direction keeps rhythm predictable.
 */
const STYLES: Record<string, string> = {
  p: `margin:0 0 18px;font-size:16px;line-height:1.65;color:${INK};`,
  h1: `margin:26px 0 12px;font-size:22px;font-weight:700;line-height:1.3;color:${INK};`,
  h2: `margin:30px 0 12px;font-size:19px;font-weight:700;line-height:1.35;color:${INK};`,
  h3: `margin:24px 0 10px;font-size:16px;font-weight:700;line-height:1.4;color:${INK};`,
  h4: `margin:20px 0 8px;font-size:15px;font-weight:700;color:${INK};`,
  // The gap AFTER a list is deliberately much larger than the gap BETWEEN its
  // items (26px vs 6px). The engines write a bulleted run and then a closing
  // contrast sentence as a plain paragraph, e.g. five ZIPs that gained the most
  // followed by "Taylors' 29687 moved least." At an even 18px/8px that trailing
  // paragraph read as a sixth bullet whose marker had gone missing. Inline CSS
  // has no sibling selector to special-case it, so the ratio does the work.
  ul: `margin:0 0 26px;padding-left:22px;`,
  ol: `margin:0 0 26px;padding-left:22px;`,
  li: `margin:0 0 6px;font-size:16px;line-height:1.6;color:${INK};`,
  blockquote: `margin:0 0 18px;padding:2px 0 2px 16px;border-left:3px solid ${BORDER};color:${MUTED};font-style:italic;`,
  a: `color:${ACCENT};text-decoration:underline;`,
  strong: `font-weight:700;color:${INK};`,
  b: `font-weight:700;color:${INK};`,
  em: `font-style:italic;`,
  i: `font-style:italic;`,
  hr: `border:0;border-top:1px solid ${BORDER};margin:26px 0;`,
  img: `display:block;width:100%;max-width:100%;height:auto;border-radius:10px;margin:0 0 18px;`,
  // No published post uses a pipe table today, but the engines are free to emit
  // one, and an unstyled email table collapses into unreadable run-on text.
  table: `width:100%;border-collapse:collapse;margin:0 0 18px;font-size:15px;`,
  th: `text-align:left;padding:8px 10px;border-bottom:2px solid ${BORDER};color:${INK};font-weight:700;`,
  td: `padding:8px 10px;border-bottom:1px solid ${BORDER};color:${INK};vertical-align:top;`,
  code: `font-family:ui-monospace,Menlo,Consolas,monospace;font-size:14px;background:${SUBTLE};padding:2px 5px;border-radius:4px;`,
  pre: `margin:0 0 18px;padding:14px;background:${SUBTLE};border-radius:8px;overflow-x:auto;font-size:14px;`,
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
