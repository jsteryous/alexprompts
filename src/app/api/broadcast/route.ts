import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { getConfirmedSubscribers, subscribersConfigured } from "@/lib/subscribers";
import { sendEmail } from "@/lib/email";
import { postBroadcastEmail } from "@/lib/emailTemplates";
import { postHref } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";

/**
 * GET /api/broadcast?id=<postId>&token=<PUBLISH_SECRET>
 *   Email a published post to the confirmed owned list. This is the path that
 *   reaches people about site-only content (Greenville /real-estate, /guides)
 *   that never goes to Substack.
 *
 * Optional params:
 *   &test=you@example.com  send a single preview to that address, do not record
 *   &dry=1                 report the recipient count without sending
 *   &force=1               resend even if this post was already broadcast
 *
 * Gated by PUBLISH_SECRET (same secret as the publish flow). Deliberately manual,
 * not auto-on-publish, so a send is always an explicit action.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const token = searchParams.get("token");
  const test = searchParams.get("test");
  const dry = searchParams.get("dry") === "1";
  const force = searchParams.get("force") === "1";

  const secret = process.env.PUBLISH_SECRET;
  if (!secret) return NextResponse.json({ ok: false, error: "PUBLISH_SECRET not set" }, { status: 500 });
  if (token !== secret) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 403 });
  if (!id) return NextResponse.json({ ok: false, error: "missing id" }, { status: 400 });
  if (!subscribersConfigured()) {
    return NextResponse.json({ ok: false, error: "supabase not configured" }, { status: 503 });
  }

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

  const { data: post, error: postErr } = await db
    .from("blog_posts")
    .select("id, title, slug, summary, tags, status, last_broadcast_at")
    .eq("id", id)
    .maybeSingle();
  if (postErr) return NextResponse.json({ ok: false, error: postErr.message }, { status: 500 });
  if (!post) return NextResponse.json({ ok: false, error: "post not found" }, { status: 404 });
  if (post.status !== "PUBLISHED") {
    return NextResponse.json({ ok: false, error: "post is not published" }, { status: 409 });
  }
  if (post.last_broadcast_at && !force && !test) {
    return NextResponse.json(
      { ok: false, error: "already broadcast", last_broadcast_at: post.last_broadcast_at, hint: "add &force=1 to resend" },
      { status: 409 },
    );
  }

  const postUrl = `${SITE_URL}${postHref(post)}`;

  // Preview send: one email to the tester, no list, no stamp.
  if (test) {
    const mail = postBroadcastEmail({
      title: post.title,
      summary: post.summary,
      postUrl,
      unsubUrl: `${SITE_URL}/api/unsubscribe?token=preview`,
    });
    const r = await sendEmail({ to: test, subject: mail.subject, html: mail.html, text: mail.text });
    return NextResponse.json({ ok: r.ok, mode: "test", to: test, error: r.error });
  }

  const recipients = await getConfirmedSubscribers();
  if (dry) {
    return NextResponse.json({ ok: true, mode: "dry", recipients: recipients.length, post: post.slug });
  }

  let sent = 0;
  const failed: { email: string; error?: string }[] = [];
  for (const r of recipients) {
    const unsubUrl = `${SITE_URL}/api/unsubscribe?token=${r.unsub_token}`;
    const mail = postBroadcastEmail({ title: post.title, summary: post.summary, postUrl, unsubUrl });
    const res = await sendEmail({
      to: r.email,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      headers: {
        "List-Unsubscribe": `<${unsubUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });
    if (res.ok) sent++;
    else failed.push({ email: r.email, error: res.error });
  }

  // Stamp the post so a stray re-trigger does not double-send (override with force).
  await db.from("blog_posts").update({ last_broadcast_at: new Date().toISOString() }).eq("id", post.id);

  return NextResponse.json({
    ok: true,
    mode: "broadcast",
    post: post.slug,
    recipients: recipients.length,
    sent,
    failed: failed.length,
    failures: failed.slice(0, 10),
  });
}
