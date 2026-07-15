import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/adminAuth";
import { sectionOf } from "@/lib/posts";

const SECTION_BASE: Record<string, string> = {
  realestate: "/real-estate",
  works: "/greenville-works",
  briefing: "/briefing",
  newsletter: "/archive",
};

// POST /api/review/save
// Body: { id, token?, title, summary, body_md, cover_image?, cover_credit? }
// Cookie- or token-gated (PUBLISH_SECRET). Updates an existing blog_posts row.
// cover_image/cover_credit are only written when the keys are present, so older
// callers that omit them never clear a cover. A null cover_image clears the
// custom cover, which hands the post back to the curated-library resolution at
// publish time. If the post is already PUBLISHED, revalidates its section.
export async function POST(req: NextRequest) {
  const secret = process.env.PUBLISH_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  let payload: {
    id?: string;
    token?: string;
    title?: string;
    summary?: string;
    body_md?: string;
    cover_image?: string | null;
    cover_credit?: string | null;
  };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { id, token, title, summary, body_md } = payload;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  // Authorize by the admin cookie (the /admin flow) or the legacy body token.
  if (!isAuthorized(req, token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  if (typeof title !== "string" || typeof body_md !== "string") {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (!title.trim() || !body_md.trim()) {
    return NextResponse.json({ error: "Title and body cannot be empty" }, { status: 400 });
  }

  const hasCover = Object.prototype.hasOwnProperty.call(payload, "cover_image");
  const hasCredit = Object.prototype.hasOwnProperty.call(payload, "cover_credit");
  if (hasCover && payload.cover_image !== null && typeof payload.cover_image !== "string") {
    return NextResponse.json({ error: "Invalid cover_image" }, { status: 400 });
  }
  if (hasCredit && payload.cover_credit !== null && typeof payload.cover_credit !== "string") {
    return NextResponse.json({ error: "Invalid cover_credit" }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const client = createClient(url, key);

  const { data: existing, error: fetchErr } = await client
    .from("blog_posts")
    .select("id, slug, status, tags")
    .eq("id", id)
    .single();
  if (fetchErr || !existing) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const patch: Record<string, string | null> = {
    title: title.trim(),
    summary: (summary ?? "").trim() || null,
    body_md,
  };
  if (hasCover) {
    patch.cover_image = (payload.cover_image ?? "").trim() || null;
  }
  if (hasCredit) {
    patch.cover_credit = (payload.cover_credit ?? "").trim() || null;
  }

  let { error: updateErr } = await client.from("blog_posts").update(patch).eq("id", id);
  // cover_credit may not exist on older schemas (the finalize cron makes the
  // same allowance); retry without it rather than failing the whole save.
  if (updateErr && "cover_credit" in patch) {
    delete patch.cover_credit;
    updateErr = (await client.from("blog_posts").update(patch).eq("id", id)).error;
  }
  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  if (existing.status === "PUBLISHED") {
    const base = SECTION_BASE[sectionOf(existing)] ?? "/archive";
    revalidatePath(base);
    revalidatePath(`${base}/${existing.slug}`);
  }

  return NextResponse.json({ ok: true });
}
