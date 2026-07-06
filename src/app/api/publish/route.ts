import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { sectionOf } from "@/lib/posts";
import { isAuthorized } from "@/lib/adminAuth";

/** Public URL base for each section, so the confirmation link and the
 *  revalidation path match where the post actually lives. */
const SECTION_BASE = {
  realestate: "/real-estate",
  works: "/greenville-works",
  newsletter: "/archive",
} as const;

// GET /api/publish?id=<uuid>&token=<secret>
// Called from the "Publish" button in the draft review email. Works for every
// section: newsletter drafts (/archive) and the draft-first Greenville
// (/real-estate) and Greenville Works (/greenville-works) engine posts.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id    = searchParams.get("id");
  const token = searchParams.get("token");

  const secret = process.env.PUBLISH_SECRET;

  // ── Validate ────────────────────────────────────────────────────────────
  if (!secret) {
    return html("Configuration error", "PUBLISH_SECRET is not set on the server.", 500);
  }
  if (!id) {
    return html("Missing parameters", "The link is incomplete. Check the email.", 400);
  }
  // Authorize by the admin cookie (the /admin flow) or the legacy ?token= link.
  if (!isAuthorized(req, token)) {
    return html("Unauthorized", "Log in at /admin, or use a valid publish link.", 403);
  }

  // ── Supabase ─────────────────────────────────────────────────────────────
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    return html("Configuration error", "Supabase service key is not set on the server.", 500);
  }

  const client = createClient(url, key);

  // Fetch post first so we can show the title and route by section
  const { data: rows, error: fetchErr } = await client
    .from("blog_posts")
    .select("id, title, slug, status, tags")
    .eq("id", id)
    .single();

  if (fetchErr || !rows) {
    return html("Not found", `No post found with ID: ${id}`, 404);
  }

  const base = SECTION_BASE[sectionOf(rows)];
  const path = `${base}/${rows.slug}`;

  if (rows.status === "PUBLISHED") {
    return html(
      "Already published",
      `"${rows.title}" is already live at <a href="${path}" style="color:#4f46e5">${path}</a>.`,
      200,
    );
  }

  // Flip to PUBLISHED
  const { error: updateErr } = await client
    .from("blog_posts")
    .update({ status: "PUBLISHED", published_at: new Date().toISOString() })
    .eq("id", id);

  if (updateErr) {
    return html("Database error", updateErr.message, 500);
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

  return html(
    "Published",
    `"${rows.title}" is now live at <a href="${path}" style="color:#4f46e5">${path}</a>.${finalizeNote}`,
    200,
  );
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
