import { NextRequest, NextResponse } from "next/server";
import { subscribersConfigured, unsubscribeByToken } from "@/lib/subscribers";
import { htmlPage } from "@/lib/htmlPage";

// /api/unsubscribe?token=<uuid>
// GET  -> the link people click in an email; returns a result page.
// POST -> RFC 8058 one-click unsubscribe (List-Unsubscribe-Post header); returns 200.
// Both flip the matching row to unsubscribed and are idempotent.
export const dynamic = "force-dynamic";

async function run(token: string | null): Promise<string | null> {
  if (!token) return null;
  return unsubscribeByToken(token);
}

export async function GET(req: NextRequest) {
  if (!subscribersConfigured()) {
    return htmlPage("Not available", "The subscription service is not configured.", 503);
  }
  const token = new URL(req.url).searchParams.get("token");
  let email: string | null;
  try {
    email = await run(token);
  } catch {
    return htmlPage("Something went wrong", "Please try the link again in a moment.", 500);
  }
  if (!email) {
    return htmlPage("Link not recognized", "This unsubscribe link is not valid.", 400);
  }
  return htmlPage(
    "You're unsubscribed",
    "You will not get any more emails from this list. You can resubscribe any time on the site.",
    200,
  );
}

export async function POST(req: NextRequest) {
  if (!subscribersConfigured()) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
  const token = new URL(req.url).searchParams.get("token");
  try {
    const email = await run(token);
    return NextResponse.json({ ok: !!email });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
