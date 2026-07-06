import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/adminAuth";
import { renderPostHtml } from "@/lib/renderMarkdown";

// POST /api/admin/preview  { md }  [?token=<secret>]
// Renders draft markdown through the SAME marked + sanitize-html pipeline the
// article page uses, so the editor preview matches the live post exactly and is
// safe to inject. Cookie-authed (/admin) or ?token= fallback (/review).
export async function POST(req: NextRequest) {
  if (!process.env.PUBLISH_SECRET) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }
  const token = new URL(req.url).searchParams.get("token");
  if (!isAuthorized(req, token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  let md = "";
  try {
    const b = await req.json();
    md = typeof b?.md === "string" ? b.md : "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const html = await renderPostHtml(md);
  return NextResponse.json({ html });
}
