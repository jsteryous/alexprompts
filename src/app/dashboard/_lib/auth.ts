import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Cookie-session user lookup for dashboard server components.
// `proxy.ts` already enforces auth on /dashboard/*; this is for rendering
// the signed-in email in the shell and for any secondary display checks.
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
