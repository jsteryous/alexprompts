import { NextRequest, NextResponse } from "next/server";
import { autocompleteAddress, type ScanErrorCode } from "@/lib/areaScan";
import { getTool } from "@/lib/tools";

// POST /api/area-autocomplete  { input }
// Address type-ahead for the area-scan field. Server-only proxy; the Google key
// never reaches the client. Gated to "live" like the scan route, so it is off
// (404) until the tool launches.

const STATUS: Record<ScanErrorCode, number> = {
  not_configured: 503,
  rate_limited: 429,
  daily_cap: 429,
  bad_request: 400,
  geocode_failed: 422,
  upstream_error: 502,
};

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

export async function POST(req: NextRequest) {
  if (getTool("area-scan")?.status !== "live") {
    return NextResponse.json({ ok: false, code: "not_configured", message: "Not available." }, { status: 404 });
  }

  let body: { input?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, code: "bad_request", message: "Invalid request." }, { status: 400 });
  }

  const result = await autocompleteAddress(body.input ?? "", clientIp(req));
  const status = result.ok ? 200 : STATUS[result.code];
  return NextResponse.json(result, { status });
}
