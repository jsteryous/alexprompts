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
export async function renderPostHtml(md: string): Promise<string> {
  return sanitizeHtml(await marked(md ?? ""), {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img", "h1", "h2"],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "loading", "width", "height"],
      a: ["href", "name", "target", "rel"],
    },
  });
}
