import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { broadcastPost } from "@/lib/broadcast";
import { BRIEFING_TAG, REALESTATE_TAG, SALES_TAG, sectionOf } from "@/lib/posts";

/**
 * GET /api/finalize-greenville
 *
 * The broadcast reconciler for the content routines. The Claude agents run in a
 * sandbox that can only reach the world through MCP connectors, so each publishes
 * its blog_posts row (via the Supabase MCP) but cannot send the owned-list
 * broadcast, which needs normal egress. This job, on Vercel, does that one
 * mechanical step for any recently published post that has not had it. The daily
 * run is at 13:00 UTC (vercel.json) so a piece Alex publishes in the morning ET
 * still broadcasts the same day (Hobby allows only 2 crons; the review packet's
 * one-click broadcast link is the primary same-minute path).
 *
 * It used to render the cover photo here too, from the curated Greenville library.
 * That step is gone: there is no automatic cover anywhere any more, so a post
 * carries the photo Alex chose in the editor or none at all.
 *
 * It is idempotent and self-healing: the send is guarded by a null check on
 * last_broadcast_at, so a missed run is picked up next time. Scoped to the last
 * few days so the query stays small.
 *
 * Auth: Vercel Cron (Authorization: Bearer <CRON_SECRET>) or a manual run with
 * ?token=<PUBLISH_SECRET>. Wired as a daily cron in vercel.json, after the routine.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** How far back to reconcile, measured from when a post went live (published_at),
 *  not when the agent created the draft. Draft-first means a post can sit in review
 *  for days before Alex publishes it, and the broadcast must fire once it does, so
 *  the window tracks publish time and is generous. A post published longer ago than
 *  this that never went out is left alone. */
const WINDOW_DAYS = 7;

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
    .select("id, slug, tags, last_broadcast_at")
    .eq("status", "PUBLISHED")
    .overlaps("tags", [REALESTATE_TAG, SALES_TAG, BRIEFING_TAG])
    .gte("published_at", since)
    .is("last_broadcast_at", null)
    .order("published_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const results: Record<string, unknown>[] = [];

  for (const p of posts ?? []) {
    const r: Record<string, unknown> = { slug: p.slug };
    // Report the post's own section: /real-estate for a `greenville` post,
    // /sales for a sales-performance piece, /briefing for an archived brief.
    const section = sectionOf(p);
    r.section =
      section === "sales" ? "/sales" : section === "briefing" ? "/briefing" : "/real-estate";

    // Broadcast to the owned list. The query above already narrowed this to
    // posts that have never had one.
    const { body } = await broadcastPost(db, p.id as string);
    r.broadcast = body;

    results.push(r);
  }

  return NextResponse.json({ ok: true, windowDays: WINDOW_DAYS, considered: posts?.length ?? 0, results });
}
