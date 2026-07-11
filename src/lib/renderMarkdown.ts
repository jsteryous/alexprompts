import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

/**
 * The one markdown -> sanitized HTML pipeline for post bodies. Shared by the
 * article renderer (ArticleView) and the /admin editor preview, so what an
 * editor previews is byte-identical to what ships. sanitize-html is pure JS
 * (no jsdom), so it loads cleanly in the serverless runtime. body_md is
 * first-party, but we sanitize anyway as defense-in-depth against a tampered
 * row and against anything pasted into the editor.
 */

const SUPABASE_HOST = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname;
  } catch {
    return null;
  }
})();

/**
 * Body images pasted through the admin editor land in Supabase Storage as
 * full-size files (a pasted screenshot PNG runs multiple MB) and used to ship
 * to readers untouched, which wrecked mobile LCP on any article whose body
 * leads with an image. Route those through the Next image optimizer with a
 * responsive srcset so a phone gets a ~100KB AVIF instead. The widths used
 * here must exist in next.config's deviceSizes (640/828/1080 are defaults)
 * and the Supabase host must be in images.remotePatterns (next.config derives
 * it from the same env var). Other remote hosts (Substack CDN images in
 * mirrored posts) are left on their original src, since un-whitelisted hosts
 * would 400 at the optimizer; they still get lazy-loading below.
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
  if (SUPABASE_HOST) {
    try {
      if (new URL(src).hostname === SUPABASE_HOST) {
        const opt = (w: number) =>
          `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75`;
        out.src = opt(1080);
        out.srcset = `${opt(640)} 640w, ${opt(828)} 828w, ${opt(1080)} 1080w`;
        out.sizes = "(max-width: 720px) 100vw, 672px";
      }
    } catch {
      // not an absolute URL; leave it alone
    }
  }
  return out;
}

export async function renderPostHtml(md: string): Promise<string> {
  let imageIndex = 0;
  return sanitizeHtml(await marked(md ?? ""), {
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
