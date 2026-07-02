/**
 * Core broadcast send: email a published post to the confirmed owned list and
 * stamp it so a re-trigger does not double-send. Extracted from /api/broadcast so
 * both the manual endpoint (auth-wrapped) and the nightly finalize cron call the
 * same code, with no duplicated Resend/subscriber logic.
 *
 * Callers own auth and env checks; this assumes Supabase is configured and takes a
 * ready service-key client. It returns an HTTP status plus a JSON body so the route
 * can pass them straight through.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { getConfirmedSubscribers } from "@/lib/subscribers";
import { sendEmail } from "@/lib/email";
import { postBroadcastEmail } from "@/lib/emailTemplates";
import { postHref } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";

export interface BroadcastOptions {
  /** Send a single preview to this address, do not touch the list or stamp. */
  test?: string | null;
  /** Report the recipient count without sending. */
  dry?: boolean;
  /** Resend even if the post was already broadcast. */
  force?: boolean;
}

export interface BroadcastOutcome {
  status: number;
  body: Record<string, unknown>;
}

/** Broadcast the post with id `id`. See BroadcastOptions for the preview/dry/force
 *  modes. Returns the HTTP status + JSON body for the caller to return verbatim. */
export async function broadcastPost(
  db: SupabaseClient,
  id: string,
  opts: BroadcastOptions = {},
): Promise<BroadcastOutcome> {
  const { test, dry, force } = opts;

  const { data: post, error: postErr } = await db
    .from("blog_posts")
    .select("id, title, slug, summary, tags, status, last_broadcast_at")
    .eq("id", id)
    .maybeSingle();
  if (postErr) return { status: 500, body: { ok: false, error: postErr.message } };
  if (!post) return { status: 404, body: { ok: false, error: "post not found" } };
  if (post.status !== "PUBLISHED") {
    return { status: 409, body: { ok: false, error: "post is not published" } };
  }
  if (post.last_broadcast_at && !force && !test) {
    return {
      status: 409,
      body: {
        ok: false,
        error: "already broadcast",
        last_broadcast_at: post.last_broadcast_at,
        hint: "add &force=1 to resend",
      },
    };
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
    return { status: 200, body: { ok: r.ok, mode: "test", to: test, error: r.error } };
  }

  const recipients = await getConfirmedSubscribers();
  if (dry) {
    return { status: 200, body: { ok: true, mode: "dry", recipients: recipients.length, post: post.slug } };
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

  // A total wipeout (recipients existed but nothing sent) means a misconfiguration,
  // e.g. Resend/sender env unset or the domain unverified. Do NOT stamp in that case:
  // stamping would mark the post "already broadcast" and permanently mask the failure,
  // so the finalize cron would never retry it. Surface it instead and leave it retryable.
  const totalFailure = recipients.length > 0 && sent === 0;
  if (!totalFailure) {
    // Stamp so a stray re-trigger does not double-send (override with force).
    await db.from("blog_posts").update({ last_broadcast_at: new Date().toISOString() }).eq("id", post.id);
  }

  return {
    status: totalFailure ? 502 : 200,
    body: {
      ok: !totalFailure,
      mode: "broadcast",
      post: post.slug,
      recipients: recipients.length,
      sent,
      failed: failed.length,
      failures: failed.slice(0, 10),
      ...(totalFailure ? { error: "no emails sent (check RESEND_API_KEY + sender/domain)", stamped: false } : {}),
    },
  };
}
