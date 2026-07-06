import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/adminAuth";

// POST /api/review/save
// Body: { id: string, token: string, title: string, summary: string, body_md: string }
// Token-gated (PUBLISH_SECRET). Updates an existing blog_posts row.
// If the post is already PUBLISHED, revalidates the live page + index.
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

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const client = createClient(url, key);

  const { data: existing, error: fetchErr } = await client
    .from("blog_posts")
    .select("id, slug, status")
    .eq("id", id)
    .single();
  if (fetchErr || !existing) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const { error: updateErr } = await client
    .from("blog_posts")
    .update({
      title: title.trim(),
      summary: (summary ?? "").trim() || null,
      body_md,
    })
    .eq("id", id);
  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  if (existing.status === "PUBLISHED") {
    revalidatePath("/archive");
    revalidatePath(`/archive/${existing.slug}`);
  }

  return NextResponse.json({ ok: true });
}
