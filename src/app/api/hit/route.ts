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
 * agent, paths and referrers are reduced to fixed labels (below), and each IP
 * is held to a soft cap, which keeps casual inflation and junk rows out.
 */
const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|quora|whatsapp|headless|lighthouse/i;

/**
 * NO FREE TEXT REACHES THE TABLE (tightened October 14, 2026). The routines read
 * `page_hits`, and anything a stranger can type into a path or a Referer header
 * would otherwise arrive in front of a model as text. So a path is stored only
 * as one of the site's known shapes, article slugs collapse to their section,
 * and a referrer is stored only as one of the named sources below, or "other".
 */
const STATIC_PATHS = new Set([
  "/", "/editions", "/about", "/reporting", "/archive", "/real-estate", "/sales",
  "/briefing", "/contact", "/privacy", "/terms", "/subscribe", "/office", "/letters",
]);
const SECTIONS = new Set(["archive", "real-estate", "sales", "briefing"]);

function knownPath(raw: string): string | null {
  const path = raw.toLowerCase().replace(/\/+$/, "") || "/";
  if (STATIC_PATHS.has(path)) return path;
  if (/^\/edition\/\d{4}-\d{2}-\d{2}$/.test(path)) return path;
  if (/^\/clip\/\d{4}-\d{2}-\d{2}\/(lead|market|realty|editorial|(dispatch|odd|letter|amusement|around|ad)-\d{1,2})$/.test(path)) return path;
  const m = path.match(/^\/([a-z-]+)\/[a-z0-9-]{1,150}$/);
  if (m && SECTIONS.has(m[1])) return `/${m[1]}/*`;
  return null;
}

/** Referring site, as a fixed label. Unknown hosts are "other"; our own is "". */
const SOURCES: [RegExp, string][] = [
  [/(^|\.)(rebrew\.org|alexprompts\.com|vercel\.app)$/, ""],
  [/(^|\.)google\./, "google"],
  [/(^|\.)bing\.com$/, "bing"],
  [/(^|\.)duckduckgo\.com$/, "duckduckgo"],
  [/(^|\.)(x\.com|twitter\.com|t\.co)$/, "x"],
  [/(^|\.)(facebook\.com|fb\.com|fb\.me)$/, "facebook"],
  [/(^|\.)instagram\.com$/, "instagram"],
  [/(^|\.)(linkedin\.com|lnkd\.in)$/, "linkedin"],
  [/(^|\.)reddit\.com$/, "reddit"],
  [/(^|\.)threads\.(net|com)$/, "threads"],
  [/(^|\.)bsky\.app$/, "bluesky"],
  [/(^|\.)substack\.com$/, "substack"],
  [/(^|\.)news\.ycombinator\.com$/, "hackernews"],
  [/(^|\.)(youtube\.com|youtu\.be)$/, "youtube"],
  [/(^|\.)tiktok\.com$/, "tiktok"],
  [/(^|\.)(mail\.google\.com|outlook\.live\.com|outlook\.office\.com|mail\.yahoo\.com)$/, "email"],
  [/(^|\.)(chatgpt\.com|perplexity\.ai|claude\.ai)$/, "ai-assistant"],
];

function sourceOf(ref: unknown): string {
  if (typeof ref !== "string" || !ref) return "";
  let host: string;
  try {
    host = new URL(ref).hostname.toLowerCase();
  } catch {
    return "";
  }
  for (const [re, label] of SOURCES) if (re.test(host)) return label;
  return "other";
}

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
  const path = knownPath(typeof body.path === "string" ? body.path : "");
  if (!path) return new NextResponse(null, { status: 204 });
  const ref = sourceOf(body.ref);

  await createClient(url, key).rpc("record_hit", { p_path: path, p_referrer: ref });
  return new NextResponse(null, { status: 204 });
}
