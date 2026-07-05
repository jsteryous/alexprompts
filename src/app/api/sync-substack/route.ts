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

// Slugs we deliberately keep OFF the site even though they are still in the
// Substack feed. These are legacy off-brand issues (the old frontier-tech-news
// experiment) that dilute the domain's Greenville real-estate topical authority.
// Without this guard the sync would flip them back to PUBLISHED on every run (see
// the status check below), so instead we actively force them to DRAFT and never
// (re)create them. Remove a slug here only if you want it live again.
const SUPPRESSED_SLUGS = new Set<string>([
  "washington-shuts-down-claude-fable",
  "i-feel-like-glm-52-came-out-of-nowhere",
]);

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

    // Suppressed: never publish it. If a prior run (or a manual edit) left it
    // PUBLISHED, demote it back to DRAFT so it drops from the site and search.
    if (SUPPRESSED_SLUGS.has(p.slug)) {
      if (existing && existing.status !== "DRAFT") {
        const { error } = await client
          .from("blog_posts")
          .update({ status: "DRAFT" })
          .eq("id", existing.id);
        if (error) return NextResponse.json({ error: error.message, slug: p.slug }, { status: 500 });
        changed.push(p.slug);
      }
      skipped++;
      continue;
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
    for (const slug of changed) {
      revalidatePath(`/archive/${slug}`);
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
