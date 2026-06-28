import { NextRequest, NextResponse } from "next/server";
import { normalizeEmail, subscribersConfigured, upsertPending } from "@/lib/subscribers";
import { sendEmail } from "@/lib/email";
import { confirmEmail } from "@/lib/emailTemplates";
import { rateLimited } from "@/lib/rateLimit";
import { SITE_URL } from "@/lib/site";

// POST /api/subscribe  { email, source? }
// Public, owned-list signup. Stores a pending subscriber and emails a double
// opt-in confirmation link. The Supabase service key stays server-side.
//
// Hardening:
//  - Rate limited per IP and per email so the endpoint can't be used to spray
//    confirmation emails (email bombing) or burn the Resend quota.
//  - Uniform success response: it never reveals whether an address is already
//    subscribed, so it can't be used to enumerate the list.
export const dynamic = "force-dynamic";

const HOUR = 3_600_000;
// Per-IP signups/hour and per-address confirmation sends/hour. The per-email cap
// blunts bombing a victim from rotating IPs. Override the IP cap with env.
const IP_LIMIT = Number(process.env.SUBSCRIBE_RATE_LIMIT ?? 5);
const EMAIL_LIMIT = 3;

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

export async function POST(req: NextRequest) {
  if (!subscribersConfigured()) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  if (rateLimited(`sub:ip:${clientIp(req)}`, IP_LIMIT, HOUR)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
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

  // Cap confirmation sends per address regardless of source IP.
  if (rateLimited(`sub:email:${email}`, EMAIL_LIMIT, HOUR)) {
    // Uniform success: do not reveal the address was seen before.
    return NextResponse.json({ ok: true, status: "ok" });
  }

  const source =
    typeof body.source === "string" && body.source.trim() ? body.source.trim().slice(0, 80) : null;

  let result;
  try {
    result = await upsertPending(email, source);
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }

  // Already on the list and confirmed: nothing to send. Return the SAME shape as a
  // fresh signup so the response can't distinguish a member from a non-member.
  if (result.state === "already") {
    return NextResponse.json({ ok: true, status: "ok" });
  }

  const confirmUrl = `${SITE_URL}/api/subscribe/confirm?token=${result.confirmToken}`;
  const mail = confirmEmail(confirmUrl);
  const send = await sendEmail({ to: email, subject: mail.subject, html: mail.html, text: mail.text });

  // Email not wired up yet (no RESEND_API_KEY): keep the pending row so the list
  // still builds locally, but tell the client confirmation could not be sent.
  if (!send.ok && send.error === "not_configured") {
    return NextResponse.json({ ok: true, status: "ok", note: "email_not_configured" });
  }
  if (!send.ok) {
    return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, status: "ok" });
}
