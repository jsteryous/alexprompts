import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_MAX_AGE } from "@/lib/adminAuth";

// POST /api/admin/login  { password }
// A correct password (=== PUBLISH_SECRET) sets the httpOnly admin cookie so the
// person can use /admin without ever putting the secret in a URL.
export async function POST(req: NextRequest) {
  const secret = process.env.PUBLISH_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Server misconfigured (PUBLISH_SECRET unset)" }, { status: 500 });
  }

  let password = "";
  try {
    const body = await req.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (password !== secret) {
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
