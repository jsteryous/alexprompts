import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { sectionOf } from "@/lib/posts";
import { isAuthorized, tokenAuthorized } from "@/lib/adminAuth";
import { htmlPage } from "@/lib/htmlPage";

/** Public URL base for each section, so the confirmation link and the
 *  revalidation path match where the post actually lives. */
const SECTION_BASE = {
  realestate: "/real-estate",
  sales: "/sales",
  briefing: "/briefing",
  newsletter: "/archive",
} as const;

type PublishResult =
  | { ok: true; already: boolean; title: string; path: string; finalizeNote: string }
  | { ok: false; status: number; heading: string; message: string };

/** Flip a draft to PUBLISHED and bust the ISR cache. Auth is the caller's job. */
async function publishPost(id: string): Promise<PublishResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    return { ok: false, status: 500, heading: "Configuration error", message: "Supabase service key is not set on the server." };
  }

  const client = createClient(url, key);

  const { data: rows, error: fetchErr } = await client
    .from("blog_posts")
    .select("id, title, slug, status, tags, body_md, cover_image")
    .eq("id", id)
    .single();

  if (fetchErr || !rows) {
    return { ok: false, status: 404, heading: "Not found", message: `No post found with ID: ${id}` };
  }

  // A draft started by hand can be empty, since autosave has to be able to
  // store it mid-sentence. Publishing one is a different matter: an empty title
  // ships an untitled card and an empty body ships a blank page.
  if (rows.status !== "PUBLISHED" && (!rows.title?.trim() || !rows.body_md?.trim())) {
    return {
      ok: false,
      status: 400,
      heading: "Not ready",
      message: "This draft still needs a title and a body.",
    };
  }

  const section = sectionOf(rows);
  const base = SECTION_BASE[section];
  const path = `${base}/${rows.slug}`;

  if (rows.status === "PUBLISHED") {
    return { ok: true, already: true, title: rows.title, path, finalizeNote: "" };
  }

  const { error: updateErr } = await client
    .from("blog_posts")
    .update({ status: "PUBLISHED", published_at: new Date().toISOString() })
    .eq("id", id);

  if (updateErr) {
    return { ok: false, status: 500, heading: "Database error", message: updateErr.message };
  }

  // No automatic cover. Publishing used to stamp a photo from the curated
  // Greenville library on any row that had none, which meant a piece Alex had
  // just read through could go live under a stock photo he never picked. The
  // cover is now whatever he set in the editor, and an empty one stays empty.
  const coverSet = Boolean(rows.cover_image);

  // Bust the ISR cache so the section index + the post show the new issue
  // immediately (otherwise it waits up to the 300s revalidate window).
  revalidatePath(base);
  revalidatePath(path);

  // Local-section posts get their owned-list broadcast from the daily finalize
  // cron once they are PUBLISHED; newsletter posts do not (those come from
  // Substack).
  const finalizeNote =
    section === "newsletter"
      ? ""
      : coverSet
        ? " The subscriber email goes out with the daily finalize cron."
        : " It goes live without a cover photo; the subscriber email goes out with the daily finalize cron.";

  return { ok: true, already: false, title: rows.title, path, finalizeNote };
}

// GET /api/publish?id=<uuid>&token=<secret>
// The content routine's one-click email link. TOKEN-ONLY auth (never the admin
// cookie), so it cannot be triggered by CSRF. Returns a friendly HTML page.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const token = searchParams.get("token");

  if (!process.env.PUBLISH_SECRET) {
    return htmlPage("Configuration error", "PUBLISH_SECRET is not set on the server.", 500);
  }
  if (!id) {
    return htmlPage("Missing parameters", "The link is incomplete. Check the email.", 400);
  }
  if (!tokenAuthorized(token)) {
    return htmlPage("Unauthorized", "Invalid token. This link may have been tampered with.", 403);
  }

  const r = await publishPost(id);
  if (!r.ok) return htmlPage(r.heading, r.message, r.status);
  if (r.already) {
    return htmlPage("Already published", `"${r.title}" is already live at <a href="${r.path}">${r.path}</a>.`, 200);
  }
  return htmlPage("Published", `"${r.title}" is now live at <a href="${r.path}">${r.path}</a>.${r.finalizeNote}`, 200);
}

// POST /api/publish  { id, token? }
// The /admin dashboard + editor Publish action. Cookie OR body-token auth.
// A SameSite=Lax cookie is not sent on cross-site POST, so this is CSRF-safe;
// we also require a same-origin request as defense in depth. Returns JSON.
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

  const r = await publishPost(id);
  if (!r.ok) return NextResponse.json({ error: r.message }, { status: r.status });
  return NextResponse.json({ ok: true, already: r.already, path: r.path });
}

/** Reject a cross-site Origin. Same-origin fetches send a matching Origin (or,
 *  in some cases, none at all — allowed, since the Lax cookie already gates
 *  cross-site requests). */
function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

