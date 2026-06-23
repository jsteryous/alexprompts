/**
 * Post data access — published Alex Prompts content stored in Supabase
 * `blog_posts` (mirrored from Substack). One table holds two kinds of content,
 * split by tag: a post tagged `guide` is a how-to GUIDE (-> /guides); everything
 * else is a NEWSLETTER issue (-> /archive). Returns [] / null when env is unset
 * so the site builds and renders without a database (empty lists, not a crash).
 */
import { createClient } from "@supabase/supabase-js";

/** Content kind, derived from tags. "guide" -> /guides, "newsletter" -> /archive. */
export type PostType = "newsletter" | "guide";

/** A post tagged this (case-insensitive, set on Substack) is a how-to guide. */
export const GUIDE_TAG = "guide";

export interface ArchivePost {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  tags: string[] | null;
  published_at: string | null;
  created_at: string | null;
}

export interface FullPost extends ArchivePost {
  body_md: string | null;
  author: string | null;
}

export function isGuide(post: { tags: string[] | null }): boolean {
  return (post.tags ?? []).some((t) => t.toLowerCase() === GUIDE_TAG);
}

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

/**
 * Published posts, newest first. Pass `type` to get only guides or only
 * newsletter issues. The tag split is done in JS (the set is small and a
 * Postgres "array does not contain" filter mishandles null-tag rows).
 */
export async function getPublishedPosts(limit?: number, type?: PostType): Promise<ArchivePost[]> {
  const c = client();
  if (!c) return [];
  const { data, error } = await c
    .from("blog_posts")
    .select("id, title, slug, summary, tags, published_at, created_at")
    .eq("status", "PUBLISHED")
    .order("published_at", { ascending: false });
  if (error) {
    console.error("blog_posts fetch error:", error.message);
    return [];
  }
  let rows = (data ?? []) as ArchivePost[];
  if (type) rows = rows.filter((r) => isGuide(r) === (type === "guide"));
  return limit ? rows.slice(0, limit) : rows;
}

/**
 * One published post by slug. Pass `type` to enforce its canonical section:
 * a guide requested as a newsletter issue (or vice versa) returns null, so each
 * post lives at exactly one route (/guides/... or /archive/...).
 */
export async function getPost(slug: string, type?: PostType): Promise<FullPost | null> {
  const c = client();
  if (!c) return null;
  const { data } = await c
    .from("blog_posts")
    .select("id, title, slug, summary, body_md, tags, published_at, created_at, author")
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .single();
  if (!data) return null;
  if (type && isGuide(data) !== (type === "guide")) return null;
  return data;
}

export function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
