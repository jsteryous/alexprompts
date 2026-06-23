import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { fetchSubstackPosts } from "@/lib/substack";
import { site, substackFeedUrl } from "@/lib/site";

// GET /api/sync-substack
// Mirrors published Substack issues into blog_posts (status PUBLISHED).
// Auth: Vercel Cron (Authorization: Bearer <CRON_SECRET>) or a manual run with
// ?token=<PUBLISH_SECRET>. Runs daily via vercel.json; the newsletter ships weekly.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const token = new URL(req.url).searchParams.get("token");
  const cronSecret = process.env.CRON_SECRET;
  const publishSecret = process.env.PUBLISH_SECRET;
  const isCron = !!cronSecret && auth === `Bearer ${cronSecret}`;
  const isManual = !!publishSecret && token === publishSecret;
  if (!isCron && !isManual) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const feedUrl = substackFeedUrl();
  let posts;
  try {
    posts = await fetchSubstackPosts(feedUrl);
  } catch (e) {
    return NextResponse.json(
      { error: `Feed fetch failed: ${(e as Error).message}`, feed: feedUrl },
      { status: 502 },
    );
  }

  const client = createClient(url, key);
  const changed: string[] = [];
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const p of posts) {
    const { data: existing, error: readErr } = await client
      .from("blog_posts")
      .select("id, body_md, status, cover_image")
      .eq("slug", p.slug)
      .maybeSingle();
    if (readErr) {
      return NextResponse.json({ error: readErr.message, slug: p.slug }, { status: 500 });
    }

    const row = {
      title: p.title,
      slug: p.slug,
      summary: p.summary,
      body_md: p.body_md,
      cover_image: p.cover_image,
      tags: p.tags ?? [],
      author: p.author ?? site.author,
      published_at: p.published_at,
      status: "PUBLISHED" as const,
    };

    if (!existing) {
      const { error } = await client.from("blog_posts").insert(row);
      if (error) return NextResponse.json({ error: error.message, slug: p.slug }, { status: 500 });
      created++;
      changed.push(p.slug);
    } else if (
      existing.body_md !== p.body_md ||
      existing.status !== "PUBLISHED" ||
      existing.cover_image !== p.cover_image
    ) {
      const { error } = await client.from("blog_posts").update(row).eq("id", existing.id);
      if (error) return NextResponse.json({ error: error.message, slug: p.slug }, { status: 500 });
      updated++;
      changed.push(p.slug);
    } else {
      skipped++;
    }
  }

  if (changed.length) {
    revalidatePath("/");
    revalidatePath("/archive");
    revalidatePath("/guides");
    // A post is a guide or a newsletter issue depending on its tags; revalidate
    // both routes for each changed slug (the non-matching one is a cheap no-op).
    for (const slug of changed) {
      revalidatePath(`/archive/${slug}`);
      revalidatePath(`/guides/${slug}`);
    }
  }

  return NextResponse.json({
    ok: true,
    feed: feedUrl,
    total: posts.length,
    created,
    updated,
    skipped,
    changed,
  });
}
