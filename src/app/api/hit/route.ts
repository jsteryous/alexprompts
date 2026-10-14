import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimited } from "@/lib/rateLimit";

/**
 * First-party pageview counter (October 14, 2026).
 *
 * Vercel Web Analytics is not enabled on the project, and the Intelligencer
 * routines need numbers they can read with the Supabase connector anyway, so
 * every page beacons here once per view (components/PageHit.tsx). It stores a
 * daily count per path and referring host in `page_hits` and nothing else: no
 * cookie, no IP, no user agent, no identifier. Crawlers are skipped by user
 * agent, paths must look like a site path, and each IP is held to a soft cap,
 * which keeps casual inflation and junk rows out.
 */
const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|quora|whatsapp|headless|lighthouse/i;
const PATH = /^\/[a-z0-9\-/]{0,150}$/;

export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return new NextResponse(null, { status: 204 });
  if (BOT.test(req.headers.get("user-agent") ?? "")) return new NextResponse(null, { status: 204 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(`hit:${ip}`, 120, 60 * 60 * 1000)) return new NextResponse(null, { status: 204 });

  let body: { path?: unknown; ref?: unknown };
  try {
    body = await req.json();
  } catch {
    return new NextResponse(null, { status: 204 });
  }
  const path = typeof body.path === "string" ? body.path.toLowerCase() : "";
  if (!PATH.test(path) || path.startsWith("/admin") || path.startsWith("/review")) {
    return new NextResponse(null, { status: 204 });
  }
  let ref = "";
  if (typeof body.ref === "string" && body.ref) {
    try {
      const host = new URL(body.ref).hostname.replace(/^www\./, "").toLowerCase();
      if (!/(^|\.)rebrew\.org$|(^|\.)alexprompts\.com$|vercel\.app$/.test(host)) ref = host.slice(0, 100);
    } catch {
      ref = "";
    }
  }

  await createClient(url, key).rpc("record_hit", { p_path: path, p_referrer: ref });
  return new NextResponse(null, { status: 204 });
}
