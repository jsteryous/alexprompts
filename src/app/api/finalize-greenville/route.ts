import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { broadcastPost } from "@/lib/broadcast";
import { renderCover } from "@/lib/greenvilleImage";
import { REALESTATE_TAG } from "@/lib/posts";

/**
 * GET /api/finalize-greenville
 *
 * The reconciler for the nightly Greenville routine. The routine's Claude agent
 * runs in a sandbox that can only reach the world through MCP connectors, so it
 * publishes the /real-estate row (via the Supabase MCP) but cannot render the
 * cover image or send the owned-list broadcast, both of which need normal egress.
 * This job, on Vercel, does those two mechanical steps for any recently published
 * greenville post that still needs them.
 *
 * It is idempotent and self-healing: two independent sub-steps, each guarded by a
 * null check, so a failed render never blocks the email and a missed run is picked
 * up next time. Scoped to the last few days so a genuinely place-less post (cover
 * stays null forever) does not churn indefinitely.
 *
 * Auth: Vercel Cron (Authorization: Bearer <CRON_SECRET>) or a manual run with
 * ?token=<PUBLISH_SECRET>. Wired as a daily cron in vercel.json, after the routine.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** How far back to reconcile. A post older than this that still has no cover is
 *  treated as permanently place-less and left alone (flagged in the response). */
const WINDOW_DAYS = 3;

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

  const db = createClient(url, key);
  const since = new Date(Date.now() - WINDOW_DAYS * 86400_000).toISOString();

  const { data: posts, error } = await db
    .from("blog_posts")
    .select("id, slug, cover_image, image_address, last_broadcast_at")
    .eq("status", "PUBLISHED")
    .contains("tags", [REALESTATE_TAG])
    .gte("created_at", since)
    .or("cover_image.is.null,last_broadcast_at.is.null")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const results: Record<string, unknown>[] = [];

  for (const p of posts ?? []) {
    const r: Record<string, unknown> = { slug: p.slug };

    // Sub-step 1: resolve + set the cover, when it is missing and we have a pin.
    // renderCover prefers the curated library (no key needed) and only falls back
    // to Google, which throws a clear error if its key is missing.
    if (!p.cover_image && p.image_address) {
      try {
        const { cover, coverKind, credit } = await renderCover(p.image_address);
        // Write the cover and, when present, its credit. cover_credit may not be
        // migrated yet (42703 = undefined_column); degrade to cover-only so the
        // image still lands before the column exists.
        const patch = credit ? { cover_image: cover, cover_credit: credit } : { cover_image: cover };
        let upErr = (await db.from("blog_posts").update(patch).eq("id", p.id)).error;
        if (upErr?.code === "42703" && credit) {
          upErr = (await db.from("blog_posts").update({ cover_image: cover }).eq("id", p.id)).error;
          if (!upErr) r.credit = "skipped: cover_credit column missing";
        }
        if (upErr) throw new Error(upErr.message);
        r.image = `set (${coverKind})`;
        revalidatePath(`/real-estate/${p.slug}`);
        revalidatePath("/real-estate");
      } catch (e) {
        r.image = `failed: ${(e as Error).message}`;
      }
    } else if (!p.cover_image) {
      r.image = "no image_address to render";
    }

    // Sub-step 2: broadcast to the owned list, when it has not gone out yet.
    if (!p.last_broadcast_at) {
      const { body } = await broadcastPost(db, p.id as string);
      r.broadcast = body;
    }

    results.push(r);
  }

  return NextResponse.json({ ok: true, windowDays: WINDOW_DAYS, considered: posts?.length ?? 0, results });
}
