import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// GET /dashboard/prospects/[id]/packet[?download=1]
//
// Supabase Storage serves uploaded HTML with `Content-Type: text/plain`,
// `X-Content-Type-Options: nosniff`, and a sandboxing CSP — a deliberate
// security measure to prevent buckets being used as XSS / phishing vectors.
// That makes `packet_html_url` unrenderable in a browser tab. We proxy the
// HTML through this route so we can re-serve it as `text/html`. Auth is
// enforced upstream by `proxy.ts` (matcher: /dashboard/:path*). The Storage
// URL is read from the prospect row, not from the request, so there's no
// SSRF surface.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    return new NextResponse("Server misconfigured", { status: 500 });
  }

  const sb = createClient(url, key);
  const { data: row, error } = await sb
    .from("website_prospects")
    .select("packet_html_url, business_name")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return new NextResponse(`Lookup failed: ${error.message}`, { status: 500 });
  }
  if (!row?.packet_html_url) {
    return new NextResponse("No packet on file for this prospect", { status: 404 });
  }

  const upstream = await fetch(row.packet_html_url, { cache: "no-store" });
  if (!upstream.ok) {
    return new NextResponse(`Packet fetch failed (${upstream.status})`, { status: 502 });
  }
  const html = await upstream.text();

  const headers: Record<string, string> = {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Robots-Tag": "noindex, nofollow",
  };

  if (req.nextUrl.searchParams.get("download") === "1") {
    const slug = (row.business_name || "packet")
      .replace(/[^A-Za-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase() || "packet";
    headers["Content-Disposition"] = `attachment; filename="${slug}-packet.html"`;
  }

  return new NextResponse(html, { status: 200, headers });
}
