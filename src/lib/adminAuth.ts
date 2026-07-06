import { cookies } from "next/headers";
import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

/** Cookie that holds the admin session. Its VALUE is the PUBLISH_SECRET itself,
 *  set httpOnly by /api/admin/login after a correct password, so a match proves
 *  the person logged in. Same trust model as the legacy ?token= links, but the
 *  secret never rides in a URL (no browser history, no query-encoding breakage). */
export const ADMIN_COOKIE = "ap_admin";

/** How long a login lasts (30 days). */
export const ADMIN_MAX_AGE = 60 * 60 * 24 * 30;

/** Constant-time equality, guarded for length so it never throws. */
function safeEqual(a: string | undefined | null, b: string): boolean {
  if (!a) return false;
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/** Server-component / server-action check: is this request an authed admin? */
export async function isAdmin(): Promise<boolean> {
  const secret = process.env.PUBLISH_SECRET;
  if (!secret) return false;
  const store = await cookies();
  return safeEqual(store.get(ADMIN_COOKIE)?.value, secret);
}

/** Token-only auth (constant-time). Used by the GET publish link from the
 *  routine's email, which must NOT trust the admin cookie: a state-changing
 *  GET that trusts a SameSite=Lax cookie is CSRF-able. The token in the URL is
 *  itself the defense there (an attacker cannot know it). */
export function tokenAuthorized(token?: string | null): boolean {
  const secret = process.env.PUBLISH_SECRET;
  if (!secret) return false;
  return safeEqual(token, secret);
}

/** Cookie OR token auth (constant-time). Safe only for POST handlers, where a
 *  SameSite=Lax cookie is not sent on cross-site requests. */
export function isAuthorized(req: NextRequest, token?: string | null): boolean {
  const secret = process.env.PUBLISH_SECRET;
  if (!secret) return false;
  if (safeEqual(req.cookies.get(ADMIN_COOKIE)?.value, secret)) return true;
  return safeEqual(token, secret);
}
