import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/adminAuth";

/**
 * POST /api/admin/delete  { id, token? }
 *
 * Permanently removes a DRAFT blog_posts row, so the /admin review queue can be
 * cleared without a trip to the Supabase dashboard. This also keeps the
 * Greenville engine running: its STEP 1 guard in
 * scripts/greenville/routine/orchestrator.md stops the whole run once three
 * evergreen drafts are pending, so an abandoned draft silently switches the
 * content engine off.
 *
 * There is deliberately NO GET form. A state-changing GET that trusts a
 * SameSite=Lax cookie is CSRF-able, and this operation cannot be undone, so it
 * never gets a one-click email link the way /api/publish does.
 *
 * DRAFT-ONLY BY DESIGN. A published post owns a live, probably indexed URL;
 * removing one is a content and SEO decision, not queue cleanup. Unpublish it
 * in the editor first if it genuinely needs to go.
 */
export async function POST(req: NextRequest) {
  if (!process.env.PUBLISH_SECRET) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }
  if (!sameOrigin(req)) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }

  let id: string | undefined;
  let token: string | undefined;
  try {
    const b = await req.json();
    id = typeof b?.id === "string" ? b.id : undefined;
    token = typeof b?.token === "string" ? b.token : undefined;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  if (!isAuthorized(req, token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    return NextResponse.json(
      { error: "Supabase service key is not set on the server." },
      { status: 500 },
    );
  }
  const client = createClient(url, key);

  // Read the row first so a published post is refused by status rather than by
  // hoping the caller sent the right id.
  const { data: row, error: fetchErr } = await client
    .from("blog_posts")
    .select("id, title, status")
    .eq("id", id)
    .single();

  if (fetchErr || !row) {
    return NextResponse.json({ error: `No post found with ID: ${id}` }, { status: 404 });
  }
  if (row.status !== "DRAFT") {
    return NextResponse.json(
      { error: "Only drafts can be deleted. Unpublish this post first." },
      { status: 409 },
    );
  }

  // Scope the delete by status as well as id, so a publish landing between the
  // read above and this write cannot take a live post with it.
  const { error: deleteErr } = await client
    .from("blog_posts")
    .delete()
    .eq("id", id)
    .eq("status", "DRAFT");

  if (deleteErr) {
    return NextResponse.json({ error: deleteErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, title: row.title });
}

/** Reject a cross-site Origin. Mirrors the check in /api/publish. */
function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}
