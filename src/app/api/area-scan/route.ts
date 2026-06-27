import { NextRequest, NextResponse } from "next/server";
import { runAreaScan, type ScanErrorCode, type ScanRadius } from "@/lib/areaScan";
import { getTool } from "@/lib/tools";

// POST /api/area-scan  { address, competitorType, radius }
// Server-only proxy for the area-scan tool. The Google key never reaches the
// client; guardrails (cache, rate limit, daily cap) live in lib/areaScan.ts.

const STATUS: Record<ScanErrorCode, number> = {
  not_configured: 503,
  rate_limited: 429,
  daily_cap: 429,
  bad_request: 400,
  geocode_failed: 422,
  upstream_error: 502,
};

const ALLOWED_RADII: ScanRadius[] = [805, 1609, 3219];

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

export async function POST(req: NextRequest) {
  // `soon` means truly off: the paid endpoint is unreachable until the tool is
  // flipped to `live` in src/lib/tools.ts, so there are zero possible Google
  // calls before launch.
  if (getTool("area-scan")?.status !== "live") {
    return NextResponse.json({ ok: false, code: "not_configured", message: "Not available." }, { status: 404 });
  }

  let body: { address?: string; competitorType?: string; radius?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, code: "bad_request", message: "Invalid request." }, { status: 400 });
  }

  const radius = ALLOWED_RADII.includes(body.radius as ScanRadius)
    ? (body.radius as ScanRadius)
    : 1609;

  const result = await runAreaScan(
    body.address ?? "",
    body.competitorType ?? "",
    radius,
    clientIp(req),
  );

  const status = result.ok ? 200 : STATUS[result.code];
  return NextResponse.json(result, { status });
}
