import { createClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { subscribersConfigured } from "@/lib/subscribers";
import { broadcastPost } from "@/lib/broadcast";

/**
 * GET /api/broadcast?id=<postId>&token=<PUBLISH_SECRET>
 *   Email a published post to the confirmed owned list. This is the path that
 *   reaches people about site-only content (Greenville /real-estate, Greenville Works /greenville-works)
 *   that never goes to Substack.
 *
 * Optional params:
 *   &test=you@example.com  send a single preview to that address, do not record
 *   &dry=1                 report the recipient count without sending
 *   &force=1               resend even if this post was already broadcast
 *
 * Auth (PUBLISH_SECRET, same secret as the publish flow): send it as
 * `Authorization: Bearer <secret>` (preferred, keeps it out of logs) or, for a
 * manual click, as `?token=<secret>`. Note the query form lands in server/proxy
 * logs and browser history, so prefer the header for anything scripted.
 * Deliberately manual, not auto-on-publish, so a send is always explicit.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Constant-time secret compare (avoids leaking the secret via timing). */
function secretMatches(provided: string | null, secret: string): boolean {
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const test = searchParams.get("test");
  const dry = searchParams.get("dry") === "1";
  const force = searchParams.get("force") === "1";

  const auth = req.headers.get("authorization");
  const headerToken = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const provided = headerToken ?? searchParams.get("token");

  const secret = process.env.PUBLISH_SECRET;
  if (!secret) return NextResponse.json({ ok: false, error: "PUBLISH_SECRET not set" }, { status: 500 });
  if (!secretMatches(provided, secret)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 403 });
  }
  if (!id) return NextResponse.json({ ok: false, error: "missing id" }, { status: 400 });
  if (!subscribersConfigured()) {
    return NextResponse.json({ ok: false, error: "supabase not configured" }, { status: 503 });
  }

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
  const { status, body } = await broadcastPost(db, id, { test, dry, force });
  return NextResponse.json(body, { status });
}
