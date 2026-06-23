/**
 * Substack feed -> archive mirror.
 *
 * Reads the publication RSS feed (`<publication>/feed`), which carries the FULL
 * post HTML in `content:encoded` (images included), and converts each post into
 * the same Markdown shape the manual publish flow stores in `blog_posts.body_md`.
 * That keeps ONE render pipeline: marked -> sanitize-html -> theme-prose.
 *
 * Pure functions (parse/convert) are kept separate from the network fetch so they
 * can be reasoned about and tested without a live feed. Called only server-side by
 * /api/sync-substack.
 */
import { XMLParser } from "fast-xml-parser";
import TurndownService from "turndown";

export interface SubstackPost {
  slug: string;
  title: string;
  summary: string | null;
  body_md: string;
  published_at: string | null;
  author: string | null;
  tags: string[] | null;
  /** Substack's designated post cover, from the RSS <enclosure> tag. null when
   *  a post has none; the read side then falls back to the first body image. */
  cover_image: string | null;
}

// ── HTML -> Markdown ──────────────────────────────────────────────────────────

const td = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
  emDelimiter: "*",
});

td.remove(["script", "style"]);

// Substack wraps images as <figure><img><figcaption>. Emit raw <figure> HTML so
// the caption survives as a real <figcaption> (marked passes block HTML through,
// sanitize-html keeps figure/figcaption/img, and the typography `prose` styles them).
td.addRule("figure", {
  filter: "figure",
  replacement: (_content, node) => {
    const el = node as unknown as {
      querySelector(sel: string): { getAttribute(n: string): string | null; textContent: string | null } | null;
    };
    const img = el.querySelector("img");
    const src = img?.getAttribute("src") ?? "";
    if (!src) return "";
    const alt = escapeHtml(img?.getAttribute("alt") ?? "");
    const cap = el.querySelector("figcaption")?.textContent?.trim();
    const caption = cap ? `<figcaption>${escapeHtml(cap)}</figcaption>` : "";
    return `\n\n<figure><img src="${src}" alt="${alt}" loading="lazy" />${caption}</figure>\n\n`;
  },
});

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Feed parsing ──────────────────────────────────────────────────────────────

const parser = new XMLParser({
  // Attributes are kept (prefixed `@_`) so we can read the <enclosure url="...">
  // cover image. Text-only CDATA elements (title, link, content:encoded, ...)
  // still parse to plain strings, so asText() is unaffected.
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  // content:encoded / dc:creator keep their namespaced keys (default behaviour).
  isArray: (name) => name === "item" || name === "category",
});

/** The post's cover image from its RSS <enclosure url="...">, if any. */
function enclosureUrl(item: Record<string, unknown>): string | null {
  const enc = item.enclosure;
  const one = Array.isArray(enc) ? enc[0] : enc;
  const url =
    one && typeof one === "object" ? (one as Record<string, unknown>)["@_url"] : null;
  return typeof url === "string" && /^https?:\/\//i.test(url) ? url : null;
}

function asText(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  if (typeof v === "object" && "#text" in (v as Record<string, unknown>)) {
    return String((v as Record<string, unknown>)["#text"] ?? "");
  }
  return "";
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function slugFromLink(link: string, title: string): string {
  try {
    const seg = new URL(link).pathname.split("/").filter(Boolean).pop();
    if (seg && seg !== "p") return seg;
  } catch {
    /* fall through to title slug */
  }
  return slugify(title) || "untitled";
}

function excerpt(html: string, max = 280): string {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "";
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

function toIso(pubDate: string): string | null {
  const d = new Date(pubDate);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Parse a Substack RSS document into archive-ready posts. Pure + testable. */
export function parseSubstackFeed(xmlText: string): SubstackPost[] {
  const xml = parser.parse(xmlText) as {
    rss?: { channel?: { item?: unknown[] } };
  };
  const items = xml.rss?.channel?.item ?? [];

  const posts: SubstackPost[] = [];
  for (const raw of items) {
    const item = raw as Record<string, unknown>;
    const title = asText(item.title).trim();
    const link = asText(item.link).trim();
    const html = asText(item["content:encoded"]) || asText(item.description);
    if (!title || !html) continue;

    const tags = (item.category as unknown[] | undefined)
      ?.map(asText)
      .map((t) => t.trim())
      .filter(Boolean);

    posts.push({
      slug: slugFromLink(link, title),
      title,
      summary: excerpt(asText(item.description) || html) || null,
      body_md: td.turndown(html).trim(),
      published_at: toIso(asText(item.pubDate)),
      author: asText(item["dc:creator"]).trim() || null,
      tags: tags && tags.length ? Array.from(new Set(tags)) : null,
      cover_image: enclosureUrl(item),
    });
  }
  return posts;
}

/** Fetch + parse the live feed. Throws on a non-OK response. */
export async function fetchSubstackPosts(feedUrl: string): Promise<SubstackPost[]> {
  const res = await fetch(feedUrl, {
    headers: { "User-Agent": "alex-prompts-site/1.0 (+https://alexprompts.com)" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`feed responded ${res.status}`);
  return parseSubstackFeed(await res.text());
}
