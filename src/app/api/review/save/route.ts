import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/adminAuth";
import { sectionOf } from "@/lib/posts";
import { isValidSlug } from "@/lib/slug";

const SECTION_BASE: Record<string, string> = {
  realestate: "/real-estate",
  sales: "/sales",
  briefing: "/briefing",
  newsletter: "/archive",
};

// POST /api/review/save
// Body: { id, token?, title, summary, body_md, cover_image?, cover_credit?,
//         slug?, tags? }
// Cookie- or token-gated (PUBLISH_SECRET). Updates an existing blog_posts row.
// cover_image/cover_credit are only written when the keys are present, so older
// callers that omit them never clear a cover. A null cover_image clears the
// custom cover, which hands the post back to the curated-library resolution at
// publish time. If the post is already PUBLISHED, revalidates its section.
//
// slug and tags arrived with the editor's post-settings panel, and both are
// DRAFT-ONLY: a published post owns a live, probably indexed URL, and its
// section tag is what that URL hangs off, so neither may move underneath it.
// The editor locks both fields once a post is published; the guards here are
// what actually enforce it.
//
// An empty title or body is allowed on a DRAFT and refused on a published post.
// A draft started from /admin's Write Article button is empty by definition, and
// autosave has to be able to store it while it is still being written.
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
    slug?: string;
    tags?: string[];
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

  const isDraft = existing.status !== "PUBLISHED";
  if (!isDraft && (!title.trim() || !body_md.trim())) {
    return NextResponse.json({ error: "Title and body cannot be empty" }, { status: 400 });
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

  // The URL. Only moves on a draft, and only to a slug nothing else holds.
  const nextSlug = typeof payload.slug === "string" ? payload.slug.trim() : null;
  if (nextSlug !== null && nextSlug !== existing.slug) {
    if (!isDraft) {
      return NextResponse.json(
        { error: "A published post keeps its URL. Unpublish it first." },
        { status: 409 },
      );
    }
    if (!isValidSlug(nextSlug)) {
      return NextResponse.json(
        { error: "A URL is lowercase letters, numbers, and hyphens." },
        { status: 400 },
      );
    }
    const { data: clash } = await client
      .from("blog_posts")
      .select("id")
      .eq("slug", nextSlug)
      .neq("id", id)
      .maybeSingle();
    if (clash) {
      return NextResponse.json({ error: "That URL is already taken." }, { status: 409 });
    }
    patch.slug = nextSlug;
  }

  // The section. Same rule as the slug: a published post's section is its URL.
  const tagPatch: Record<string, string[]> = {};
  if (Array.isArray(payload.tags)) {
    const tags = payload.tags
      .filter((t): t is string => typeof t === "string")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 12);
    const changed =
      tags.length !== (existing.tags ?? []).length ||
      tags.some((t, i) => t !== (existing.tags ?? [])[i]);
    if (changed) {
      if (!isDraft) {
        return NextResponse.json(
          { error: "A published post keeps its section. Unpublish it first." },
          { status: 409 },
        );
      }
      tagPatch.tags = tags;
    }
  }

  let { error: updateErr } = await client
    .from("blog_posts")
    .update({ ...patch, ...tagPatch })
    .eq("id", id);
  // cover_credit may not exist on older schemas (the finalize cron makes the
  // same allowance); retry without it rather than failing the whole save.
  if (updateErr && "cover_credit" in patch) {
    delete patch.cover_credit;
    updateErr = (
      await client
        .from("blog_posts")
        .update({ ...patch, ...tagPatch })
        .eq("id", id)
    ).error;
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
