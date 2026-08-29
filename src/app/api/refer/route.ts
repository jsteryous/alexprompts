import { NextRequest, NextResponse } from "next/server";
import { insertLead, leadsConfigured, type LeadIntent, type LeadTimeframe } from "@/lib/leads";
import { normalizeEmail } from "@/lib/subscribers";
import { sendEmail } from "@/lib/email";
import { leadNotifyEmail } from "@/lib/emailTemplates";
import { rateLimited } from "@/lib/rateLimit";
import { site } from "@/lib/site";
import { SMS_CONSENT_TEXT } from "@/lib/legal";

// POST /api/refer  { name?, email?, phone?, intent?, location?, movingFrom?, timeframe?, message?, source? }
// At least one of `email` and `phone` is required; everything else is optional.
// Public, referral-lead capture for /buying-or-selling. Stores a qualified lead in
// Supabase `referral_leads` (service key, server-side) and emails Alex a
// notification so he can follow up warm. NOT the newsletter: no double opt-in.
//
// Hardening mirrors /api/subscribe: per-IP rate limit, and the store still
// succeeds when email is not configured (the row is the source of truth).
export const dynamic = "force-dynamic";

const HOUR = 3_600_000;
// Per-IP referral submits/hour. Reuses SUBSCRIBE_RATE_LIMIT's default of 5; a
// real buyer submits once, so this only blunts abuse.
const IP_LIMIT = Number(process.env.REFER_RATE_LIMIT ?? 5);

const INTENTS: LeadIntent[] = ["buying", "selling", "both"];
const TIMEFRAMES: LeadTimeframe[] = ["asap", "3_months", "6_months", "exploring"];

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

/** Trim, cap length, and coerce empty to null so optional fields stay clean. */
function str(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
}

/** Where the lead notification goes. A dedicated inbox var wins, then the
 *  reply-to, then the brand contact address. */
function notifyTo(): string {
  return process.env.LEADS_NOTIFY_TO ?? process.env.EMAIL_REPLY_TO ?? site.email;
}

export async function POST(req: NextRequest) {
  if (!leadsConfigured()) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  if (rateLimited(`refer:ip:${clientIp(req)}`, IP_LIMIT, HOUR)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  // EITHER A PHONE OR AN EMAIL, as of August 29, 2026. The quick contact form on
  // the Greenville page asks for both and requires one, because its whole job is
  // to be answerable in two taps and a mandatory email address loses the person
  // who would rather just be called. The full form on /buying-or-selling still
  // marks email required in its own markup; this route is the floor under both.
  //
  // The database column was NOT NULL until the same day (see supabase/schema.sql).
  // The pair is what has to be non-empty, so validate it here rather than
  // leaving Postgres to reject a row nobody validated.
  const email = normalizeEmail(body.email);
  const phoneRaw = str(body.phone, 40);
  if (!email && !phoneRaw) {
    // Order matters. Somebody who typed a malformed address and nothing else has
    // to be told the address is wrong; answering "give me a phone or an email"
    // to a person looking at the email they just typed is nonsense. Only a
    // genuinely empty submission gets the generic message.
    const typedSomething = !!str(body.email, 200);
    return NextResponse.json(
      { ok: false, error: typedSomething ? "invalid_email" : "need_contact" },
      { status: 400 },
    );
  }
  // A malformed email alongside a usable phone number is not worth blocking on.
  // The number is enough to make the call, and the empty email column is a
  // truthful record of what was actually given.

  const intentRaw = str(body.intent, 20);
  const timeframeRaw = str(body.timeframe, 20);

  // SMS consent. The client sends a boolean and nothing else: the wording is
  // stamped here from src/lib/legal.ts, because a consent record assembled from
  // request-body strings proves nothing about what the person actually saw.
  // Consent with no phone number is meaningless, so it is not recorded, which
  // keeps the table from carrying rows that claim a texting right over an empty
  // number.
  const phone = phoneRaw;
  const smsConsent = body.smsConsent === true && !!phone;

  const lead = {
    name: str(body.name, 120),
    email,
    phone,
    intent: (INTENTS as string[]).includes(intentRaw ?? "") ? (intentRaw as LeadIntent) : null,
    location: str(body.location, 160),
    movingFrom: str(body.movingFrom, 160),
    timeframe: (TIMEFRAMES as string[]).includes(timeframeRaw ?? "")
      ? (timeframeRaw as LeadTimeframe)
      : null,
    message: str(body.message, 2000),
    source: str(body.source, 80) ?? "buying-or-selling",
    refSlug: str(body.refSlug, 200),
    referrer: str(body.referrer, 500),
    landingPath: str(body.landingPath, 300),
    utmSource: str(body.utmSource, 120),
    utmMedium: str(body.utmMedium, 120),
    utmCampaign: str(body.utmCampaign, 120),
    smsConsent,
    smsConsentAt: smsConsent ? new Date().toISOString() : null,
    smsConsentIp: smsConsent ? clientIp(req) : null,
    smsConsentText: smsConsent ? SMS_CONSENT_TEXT : null,
  };

  try {
    await insertLead(lead);
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }

  // Notify Alex. The store already succeeded, so a mail failure is not fatal:
  // the row is the source of truth and he can see it in Supabase either way.
  const mail = leadNotifyEmail(lead);
  const send = await sendEmail({
    to: notifyTo(),
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
    // Only when there is one. Hitting reply on a phone-only lead should do
    // nothing rather than send mail to an address that was never given.
    ...(email ? { replyTo: email } : {}),
  });

  return NextResponse.json({
    ok: true,
    status: "ok",
    ...(send.ok ? {} : { note: "stored_no_email" }),
  });
}
