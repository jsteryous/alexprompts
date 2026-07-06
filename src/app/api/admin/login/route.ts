import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { ADMIN_COOKIE, ADMIN_MAX_AGE } from "@/lib/adminAuth";
import { rateLimited } from "@/lib/rateLimit";

// Per-IP login attempts allowed per window, to blunt password brute-forcing.
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

/** Constant-time string comparison so a wrong password does not leak how many
 *  leading characters were right via response timing. */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

// POST /api/admin/login  { password }
// A correct password (=== PUBLISH_SECRET) sets the httpOnly admin cookie so the
// person can use /admin without ever putting the secret in a URL.
export async function POST(req: NextRequest) {
  const secret = process.env.PUBLISH_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Server misconfigured (PUBLISH_SECRET unset)" }, { status: 500 });
  }

  if (rateLimited(`admin-login:${clientIp(req)}`, MAX_ATTEMPTS, WINDOW_MS)) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  let password = "";
  try {
    const body = await req.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!password || !safeEqual(password, secret)) {
    return NextResponse.json({ error: "Wrong password." }, { status: 403 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_MAX_AGE,
  });
  return res;
}

// DELETE /api/admin/login  — log out (clear the cookie).
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
