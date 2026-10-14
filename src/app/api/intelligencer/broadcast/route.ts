import { createClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { subscribersConfigured } from "@/lib/subscribers";
import { broadcastEdition } from "@/lib/editionEmail";

/**
 * GET /api/intelligencer/broadcast?slug=<YYYY-MM-DD>
 *   Email a printed number of the Intelligencer to the confirmed list by hand.
 *   The press door already does this automatically after every number; this is
 *   for previews, counts and resends.
 *
 *   &test=you@example.com  send one preview to that address, record nothing
 *   &dry=1                 report the recipient count without sending
 *   &force=1               resend a number that was already emailed
 *
 * Auth is PUBLISH_SECRET, as for /api/broadcast: `Authorization: Bearer <secret>`
 * (preferred) or `?token=<secret>` for a manual click.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function secretMatches(provided: string | null, secret: string): boolean {
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams;
  const auth = req.headers.get("authorization");
  const provided = (auth?.startsWith("Bearer ") ? auth.slice(7) : null) ?? q.get("token");
  const secret = process.env.PUBLISH_SECRET;
  if (!secret) return NextResponse.json({ ok: false, error: "PUBLISH_SECRET not set" }, { status: 500 });
  if (!secretMatches(provided, secret)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 403 });

  const slug = q.get("slug") ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(slug)) return NextResponse.json({ ok: false, error: "slug must be YYYY-MM-DD" }, { status: 400 });
  if (!subscribersConfigured()) return NextResponse.json({ ok: false, error: "supabase not configured" }, { status: 503 });

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
  const { status, body } = await broadcastEdition(db, slug, {
    test: q.get("test"),
    dry: q.get("dry") === "1",
    force: q.get("force") === "1",
  });
  return NextResponse.json(body, { status });
}
