import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { sectionOf } from "@/lib/posts";
import { isAuthorized, tokenAuthorized } from "@/lib/adminAuth";

/** Public URL base for each section, so the confirmation link and the
 *  revalidation path match where the post actually lives. */
const SECTION_BASE = {
  realestate: "/real-estate",
  works: "/greenville-works",
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
    .select("id, title, slug, status, tags")
    .eq("id", id)
    .single();

  if (fetchErr || !rows) {
    return { ok: false, status: 404, heading: "Not found", message: `No post found with ID: ${id}` };
  }

  const base = SECTION_BASE[sectionOf(rows)];
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

  // Bust the ISR cache so the section index + the post show the new issue
  // immediately (otherwise it waits up to the 300s revalidate window).
  revalidatePath(base);
  revalidatePath(path);

  // Greenville + Greenville Works posts get their cover and owned-list
  // broadcast from the daily finalize cron once they are PUBLISHED; newsletter
  // posts do not (those come from Substack).
  const finalizeNote =
    sectionOf(rows) === "newsletter"
      ? ""
      : " The cover photo and the subscriber email are sent by the daily finalize cron within a day.";

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
    return html("Configuration error", "PUBLISH_SECRET is not set on the server.", 500);
  }
  if (!id) {
    return html("Missing parameters", "The link is incomplete. Check the email.", 400);
  }
  if (!tokenAuthorized(token)) {
    return html("Unauthorized", "Invalid token. This link may have been tampered with.", 403);
  }

  const r = await publishPost(id);
  if (!r.ok) return html(r.heading, r.message, r.status);
  if (r.already) {
    return html("Already published", `"${r.title}" is already live at <a href="${r.path}" style="color:#4f46e5">${r.path}</a>.`, 200);
  }
  return html("Published", `"${r.title}" is now live at <a href="${r.path}" style="color:#4f46e5">${r.path}</a>.${r.finalizeNote}`, 200);
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

// ── Minimal HTML response page ────────────────────────────────────────────────
function html(heading: string, body: string, status: number) {
  const isOk = status === 200;
  const icon = isOk ? "✓" : "✗";
  const color = isOk ? "#16a34a" : "#dc2626";

  const markup = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${heading} — Alex Prompts</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:system-ui,sans-serif;background:#f9fafb;min-height:100vh;
         display:flex;align-items:center;justify-content:center;padding:24px}
    .card{background:#fff;border:1px solid #e5e7eb;border-radius:16px;
          padding:40px 48px;max-width:480px;width:100%;text-align:center}
    .icon{width:56px;height:56px;border-radius:50%;background:${color}15;
          display:flex;align-items:center;justify-content:center;
          margin:0 auto 20px;font-size:24px;color:${color}}
    h1{font-size:22px;font-weight:700;color:#0a0a0a;margin-bottom:10px}
    p{font-size:15px;color:#555;line-height:1.6}
    .back{display:inline-block;margin-top:28px;font-size:13px;
          color:#0a0a0a;text-decoration:none;border:1px solid #e5e7eb;
          padding:8px 18px;border-radius:8px}
    .back:hover{border-color:#aaa}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${icon}</div>
    <h1>${heading}</h1>
    <p>${body}</p>
    <a class="back" href="/">← alexprompts.com</a>
  </div>
</body>
</html>`;

  return new NextResponse(markup, {
    status,
    headers: { "Content-Type": "text/html" },
  });
}
