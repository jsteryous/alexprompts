import { NextRequest, NextResponse } from "next/server";
import { normalizeEmail, subscribersConfigured, upsertPending } from "@/lib/subscribers";
import { sendEmail } from "@/lib/email";
import { confirmEmail } from "@/lib/emailTemplates";
import { SITE_URL } from "@/lib/site";

// POST /api/subscribe  { email, source? }
// Public, owned-list signup. Stores a pending subscriber and emails a double
// opt-in confirmation link. The Supabase service key stays server-side; nothing
// here is exposed to the client beyond a friendly status.
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!subscribersConfigured()) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  let body: { email?: string; source?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const email = normalizeEmail(body.email);
  if (!email) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }
  const source =
    typeof body.source === "string" && body.source.trim() ? body.source.trim().slice(0, 80) : null;

  let result;
  try {
    result = await upsertPending(email, source);
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }

  // Already on the list and confirmed: nothing to send.
  if (result.state === "already") {
    return NextResponse.json({ ok: true, status: "already" });
  }

  const confirmUrl = `${SITE_URL}/api/subscribe/confirm?token=${result.confirmToken}`;
  const mail = confirmEmail(confirmUrl);
  const send = await sendEmail({ to: email, subject: mail.subject, html: mail.html, text: mail.text });

  // Email not wired up yet (no RESEND_API_KEY): keep the pending row so the list
  // still builds locally, but tell the client confirmation could not be sent.
  if (!send.ok && send.error === "not_configured") {
    return NextResponse.json({ ok: true, status: "pending", note: "email_not_configured" });
  }
  if (!send.ok) {
    return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, status: "pending" });
}
