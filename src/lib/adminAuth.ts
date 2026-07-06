import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

/** Cookie that holds the admin session. Its VALUE is the PUBLISH_SECRET itself,
 *  set httpOnly by /api/admin/login after a correct password, so a match proves
 *  the person logged in. Same trust model as the legacy ?token= links, but the
 *  secret never rides in a URL (no browser history, no query-encoding breakage). */
export const ADMIN_COOKIE = "ap_admin";

/** How long a login lasts (30 days). */
export const ADMIN_MAX_AGE = 60 * 60 * 24 * 30;

/** Server-component / server-action check: is this request an authed admin? */
export async function isAdmin(): Promise<boolean> {
  const secret = process.env.PUBLISH_SECRET;
  if (!secret) return false;
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === secret;
}

/** Route-handler auth: authorize if a valid admin cookie is present OR the
 *  legacy token (query string / body) matches. Keeps the content routine's
 *  one-click /api/publish?token=.. links working alongside the /admin cookie. */
export function isAuthorized(req: NextRequest, token?: string | null): boolean {
  const secret = process.env.PUBLISH_SECRET;
  if (!secret) return false;
  if (req.cookies.get(ADMIN_COOKIE)?.value === secret) return true;
  return !!token && token === secret;
}
