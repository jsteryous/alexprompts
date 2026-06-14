/**
 * Archive data access — published Alex Prompts issues stored in Supabase
 * `blog_posts`. Reuses the existing table/publish flow; the dental cluster
 * taxonomy was dropped. Returns [] / null when env is unset so the site builds
 * and renders without a database (empty archive, not a crash).
 */
import { createClient } from "@supabase/supabase-js";

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

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function getPublishedPosts(limit?: number): Promise<ArchivePost[]> {
  const c = client();
  if (!c) return [];
  let q = c
    .from("blog_posts")
    .select("id, title, slug, summary, tags, published_at, created_at")
    .eq("status", "PUBLISHED")
    .order("published_at", { ascending: false });
  if (limit) q = q.limit(limit);
  const { data, error } = await q;
  if (error) {
    console.error("blog_posts fetch error:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getPost(slug: string): Promise<FullPost | null> {
  const c = client();
  if (!c) return null;
  const { data } = await c
    .from("blog_posts")
    .select("id, title, slug, summary, body_md, tags, published_at, created_at, author")
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .single();
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
