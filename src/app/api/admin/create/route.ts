import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/adminAuth";
import { BRIEFING_TAG, REALESTATE_TAG, SALES_TAG } from "@/lib/posts";
import { placeholderSlug } from "@/lib/slug";
import { site } from "@/lib/site";

/**
 * POST /api/admin/create  { token?, section? }
 *
 * Mints an empty DRAFT row and hands back its id, so /admin's "Write Article"
 * button can drop Alex straight into the composer the way Substack's "New post"
 * does. Everything the row needs to exist is set here and nothing else: the
 * title, the body, the cover, and the URL are all the editor's job.
 *
 * The slug is a placeholder (`untitled-xxxxxx`) rather than an empty string,
 * because `blog_posts.slug` is NOT NULL UNIQUE. The editor keeps it following
 * the title until the slug is edited by hand, so a piece that gets a real title
 * gets a real URL without a separate step.
 *
 * The section defaults to Business (`greenville works`), which is where the
 * publication's live work lands; the editor's settings panel can move it.
 */

const SECTION_TAGS: Record<string, string[]> = {
  sales: [SALES_TAG],
  realestate: [REALESTATE_TAG],
  briefing: [BRIEFING_TAG],
  newsletter: [],
};

export async function POST(req: NextRequest) {
  if (!process.env.PUBLISH_SECRET) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }
  if (!sameOrigin(req)) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }

  let token: string | undefined;
  let section = "sales";
  try {
    const b = await req.json().catch(() => ({}));
    if (typeof b?.token === "string") token = b.token;
    if (typeof b?.section === "string" && b.section in SECTION_TAGS) section = b.section;
  } catch {
    /* an empty body is fine; the defaults cover it */
  }

  if (!isAuthorized(req, token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    return NextResponse.json(
      { error: "Supabase service key is not set on the server." },
      { status: 500 },
    );
  }
  const client = createClient(url, key);

  const { data, error } = await client
    .from("blog_posts")
    .insert({
      title: "",
      slug: placeholderSlug(),
      body_md: "",
      summary: null,
      tags: SECTION_TAGS[section],
      status: "DRAFT",
      author: site.author,
    })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Could not create the draft." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, id: data.id });
}

/** Reject a cross-site Origin. Mirrors the check in /api/publish. */
function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}
