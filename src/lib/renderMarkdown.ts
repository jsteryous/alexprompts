import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { isOptimizableHost } from "@/lib/imageHosts";

/**
 * The one markdown -> sanitized HTML pipeline for post bodies. Shared by the
 * article renderer (ArticleView) and the /admin editor preview, so what an
 * editor previews is byte-identical to what ships. sanitize-html is pure JS
 * (no jsdom), so it loads cleanly in the serverless runtime. body_md is
 * first-party, but we sanitize anyway as defense-in-depth against a tampered
 * row and against anything pasted into the editor.
 */

/**
 * Body images pasted through the admin editor land in Supabase Storage as
 * full-size files (a pasted screenshot PNG runs multiple MB) and used to ship
 * to readers untouched, which wrecked mobile LCP on any article whose body
 * leads with an image. Route those through the Next image optimizer with a
 * responsive srcset so a phone gets a ~100KB AVIF instead. The widths used
 * here must exist in next.config's deviceSizes (640/828/1080 are defaults).
 * Which hosts qualify is src/lib/imageHosts.ts, the same list next.config
 * builds images.remotePatterns from, so the two cannot disagree. A host that
 * is not on it (Substack CDN images in mirrored posts) keeps its original
 * src, since un-whitelisted hosts would 400 at the optimizer; those still get
 * lazy-loading below.
 */
function optimizedImgAttribs(
  attribs: Record<string, string>,
  isFirstImage: boolean
): Record<string, string> {
  const out: Record<string, string> = { ...attribs, decoding: "async" };
  // The first body image is the LCP on image-led articles: keep it eager and
  // hint the browser. Everything below it lazy-loads.
  if (isFirstImage) {
    out.fetchpriority = "high";
    delete out.loading;
  } else {
    out.loading = "lazy";
  }
  const src = attribs.src ?? "";
  try {
    if (isOptimizableHost(new URL(src).hostname)) {
      const opt = (w: number) =>
        `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75`;
      out.src = opt(1080);
      out.srcset = `${opt(640)} 640w, ${opt(828)} 828w, ${opt(1080)} 1080w`;
      out.sizes = "(max-width: 720px) 100vw, 672px";
    }
  } catch {
    // not an absolute URL; leave it alone
  }
  return out;
}

/**
 * `breaks: true` makes a single Enter a real line break, the way every
 * WYSIWYG editor (Substack included) behaves. CommonMark's default is to fold
 * a soft newline into the surrounding paragraph, which silently ran hand-typed
 * lines together in the /admin editor. Verified safe across the whole published
 * corpus: the only mid-paragraph soft newlines that existed were list lead-ins
 * (unaffected) and two lines that were meant to be separate all along.
 */
const MARKED_OPTS = { breaks: true } as const;

export async function renderPostHtml(md: string): Promise<string> {
  let imageIndex = 0;
  return sanitizeHtml(await marked(md ?? "", MARKED_OPTS), {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img", "h1", "h2"],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: [
        "src",
        "srcset",
        "sizes",
        "alt",
        "loading",
        "fetchpriority",
        "decoding",
        "width",
        "height",
      ],
      a: ["href", "name", "target", "rel"],
    },
    transformTags: {
      img: (tagName, attribs) => ({
        tagName,
        attribs: optimizedImgAttribs(attribs, imageIndex++ === 0),
      }),
    },
  });
}
