/**
 * Post data access — published Alex Prompts content stored in Supabase
 * `blog_posts`. One table holds three kinds of content, split by tag:
 *   - tagged `greenville`       -> REAL-ESTATE post        (-> /real-estate)
 *   - tagged `greenville works` -> GREENVILLE WORKS piece  (-> /greenville-works)
 *   - everything else           -> NEWSLETTER issue        (-> /archive)
 * Returns [] / null when env is unset so the site builds and renders without a
 * database (empty lists, not a crash).
 */
import { createClient } from "@supabase/supabase-js";
import { SITE_URL } from "@/lib/site";

/** Content kind, derived from tags. Each post lives at exactly one section. The
 *  `works` key is the internal discriminator for the "Greenville Works" section
 *  (route /greenville-works), set by the scripts/tech routine. */
export type PostType = "newsletter" | "realestate" | "works";

/** A post tagged this (case-insensitive) is a Greenville real-estate post. Set by
 *  the scripts/greenville routine. */
export const REALESTATE_TAG = "greenville";

/** A post tagged this (case-insensitive) is a Greenville Works piece (how the
 *  region is changing: development, infrastructure, utilities, manufacturing,
 *  transportation, and technology when it touches the Upstate). Set by the
 *  scripts/tech routine. The tag is `greenville works`; the route is
 *  `/greenville-works`. Distinct from REALESTATE_TAG (`greenville`) so the two
 *  sections never collide. */
export const WORKS_TAG = "greenville works";

export interface ArchivePost {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  tags: string[] | null;
  published_at: string | null;
  created_at: string | null;
  /** Card hero image, derived from the first image in the body (see
   *  coverImageFromBody). null renders a branded placeholder. */
  cover_image: string | null;
}

export interface FullPost extends ArchivePost {
  body_md: string | null;
  author: string | null;
  /** Attribution line for the cover, shown under the article hero. Set by the
   *  Greenville finalize cron for curated (CC-BY) library covers; null otherwise. */
  cover_credit: string | null;
}

function hasTag(post: { tags: string[] | null }, tag: string): boolean {
  return (post.tags ?? []).some((t) => t.toLowerCase() === tag);
}

export function isRealEstate(post: { tags: string[] | null }): boolean {
  return hasTag(post, REALESTATE_TAG);
}

export function isWorks(post: { tags: string[] | null }): boolean {
  return hasTag(post, WORKS_TAG);
}

/** The single section a post belongs to. Real-estate wins over Greenville Works if
 *  tags somehow overlap; everything untagged falls through to the newsletter. */
export function sectionOf(post: { tags: string[] | null }): PostType {
  if (isRealEstate(post)) return "realestate";
  if (isWorks(post)) return "works";
  return "newsletter";
}

/**
 * The first usable image URL in a post body, for use as a card cover. Handles
 * both Substack-mirrored `<img src="...">` (the common case) and markdown
 * `![alt](url)`, picking whichever appears first. Returns null when there is no
 * absolute http(s) image, so the card falls back to a branded placeholder.
 *
 * This derives the cover at read time instead of storing it. If post bodies grow
 * large or we want an editor-chosen cover, add a `cover_image` column to
 * `blog_posts`, set it during the Substack sync, and prefer it over this.
 */
export function coverImageFromBody(body: string | null): string | null {
  if (!body) return null;
  const candidates: { idx: number; url: string }[] = [];
  const html = body.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (html) candidates.push({ idx: html.index ?? Infinity, url: html[1] });
  const md = body.match(/!\[[^\]]*\]\(\s*([^)\s]+)/);
  if (md) candidates.push({ idx: md.index ?? Infinity, url: md[1] });
  if (!candidates.length) return null;
  candidates.sort((a, b) => a.idx - b.idx);
  const url = candidates[0].url.trim();
  return /^https?:\/\//i.test(url) ? url : null;
}

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

/**
 * Published posts, newest first. Pass `type` to get only one section (e.g. only
 * newsletter issues). The tag split is done in JS (the set is small and a
 * Postgres "array does not contain" filter mishandles null-tag rows).
 */
export async function getPublishedPosts(limit?: number, type?: PostType): Promise<ArchivePost[]> {
  const c = client();
  if (!c) return [];
  // Prefer Substack's stored cover (cover_image, set during sync from the RSS
  // <enclosure>); fall back to the first body image. body_md is selected only
  // for that fallback, then dropped so list payloads stay lean.
  const cols = "id, title, slug, summary, tags, published_at, created_at, body_md";
  const primary = await c
    .from("blog_posts")
    .select(`${cols}, cover_image`)
    .eq("status", "PUBLISHED")
    .order("published_at", { ascending: false });
  // 42703 = undefined_column: the cover_image migration has not run yet. Degrade
  // gracefully to body-derived covers instead of blanking the whole list.
  const res =
    primary.error?.code === "42703"
      ? await c
          .from("blog_posts")
          .select(cols)
          .eq("status", "PUBLISHED")
          .order("published_at", { ascending: false })
      : primary;
  if (res.error) {
    console.error("blog_posts fetch error:", res.error.message);
    return [];
  }
  type Row = Omit<ArchivePost, "cover_image"> & {
    body_md: string | null;
    cover_image?: string | null;
  };
  let rows: ArchivePost[] = ((res.data ?? []) as unknown as Row[]).map(
    ({ body_md, cover_image, ...rest }) => ({
      ...rest,
      cover_image: cover_image ?? coverImageFromBody(body_md),
    }),
  );
  if (type) rows = rows.filter((r) => sectionOf(r) === type);
  return limit ? rows.slice(0, limit) : rows;
}

/**
 * The homepage "fresh" feed: newsletter issues, Greenville real-estate posts, AND
 * Greenville Works pieces, newest first, merged into one stream. Every published post
 * belongs to one of those three sections, so the feed is simply all of them. This is
 * what the homepage shows so the latest real-estate post or Greenville Works piece can
 * lead alongside the newsletter, not only `/archive` issues.
 */
export async function getFeedPosts(limit?: number): Promise<ArchivePost[]> {
  return getPublishedPosts(limit);
}

/** The canonical route a post lives at, derived from its section. Used by the
 *  homepage feed, which mixes sections and must link each card to the right page. */
export function postHref(post: { tags: string[] | null; slug: string }): string {
  const section = sectionOf(post);
  const base =
    section === "realestate"
      ? "/real-estate"
      : section === "works"
        ? "/greenville-works"
        : "/archive";
  return `${base}/${post.slug}`;
}

/** Short, human label for a post's section, for a card badge. The two tracks
 *  read "Real Estate" and "Technology" so a first-time visitor sees the site's
 *  two subjects at a glance (the internal tags/URLs keep the Greenville names). */
export function sectionLabel(post: { tags: string[] | null }): string {
  const section = sectionOf(post);
  return section === "realestate"
    ? "Real Estate"
    : section === "works"
      ? "Technology"
      : "Newsletter";
}

/**
 * One published post by slug. Pass `type` to enforce its canonical section:
 * a real-estate post requested as a newsletter issue (or vice versa) returns null,
 * so each post lives at exactly one route (/real-estate/... or /archive/...).
 */
export async function getPost(slug: string, type?: PostType): Promise<FullPost | null> {
  const c = client();
  if (!c) return null;
  // Prefer the stored cover_image (set by the Substack sync or the Greenville
  // finalize cron); fall back to the first body image. The two-query dance mirrors
  // getPublishedPosts: degrade gracefully if the cover_image column is missing
  // (42703 = undefined_column) instead of returning null for the whole article.
  const cols = "id, title, slug, summary, body_md, tags, published_at, created_at, author";
  const primary = await c
    .from("blog_posts")
    .select(`${cols}, cover_image, cover_credit`)
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .single();
  const { data } =
    primary.error?.code === "42703"
      ? await c.from("blog_posts").select(cols).eq("slug", slug).eq("status", "PUBLISHED").single()
      : primary;
  if (!data) return null;
  if (type && sectionOf(data) !== type) return null;
  const row = data as FullPost & { cover_image?: string | null; cover_credit?: string | null };
  return {
    ...row,
    cover_image: row.cover_image ?? coverImageFromBody(row.body_md),
    cover_credit: row.cover_credit ?? null,
  } as FullPost;
}

/**
 * The share-card image for an article (Open Graph + Twitter). Prefers the post's
 * own lead image so a link shared over iMessage/SMS, Slack, or X shows the real
 * story photo; falls back to the branded site card when the post has no image.
 * The root `app/opengraph-image.tsx` is NOT inherited by the [slug] routes, so
 * each article must set this explicitly or it ships with no preview image at all.
 */
export function articleOgImage(post: { cover_image: string | null }): string {
  return post.cover_image ?? `${SITE_URL}/opengraph-image`;
}

export function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
