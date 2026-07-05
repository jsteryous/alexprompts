import { NextRequest, NextResponse } from "next/server";
import { insertLead, leadsConfigured, type LeadIntent, type LeadTimeframe } from "@/lib/leads";
import { normalizeEmail } from "@/lib/subscribers";
import { sendEmail } from "@/lib/email";
import { leadNotifyEmail } from "@/lib/emailTemplates";
import { rateLimited } from "@/lib/rateLimit";
import { site } from "@/lib/site";

// POST /api/refer  { name?, email, phone?, intent?, location?, movingFrom?, timeframe?, message?, source? }
// Public, referral-lead capture for /find-a-pro. Stores a qualified lead in
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

  const email = normalizeEmail(body.email);
  if (!email) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  const intentRaw = str(body.intent, 20);
  const timeframeRaw = str(body.timeframe, 20);

  const lead = {
    name: str(body.name, 120),
    email,
    phone: str(body.phone, 40),
    intent: (INTENTS as string[]).includes(intentRaw ?? "") ? (intentRaw as LeadIntent) : null,
    location: str(body.location, 160),
    movingFrom: str(body.movingFrom, 160),
    timeframe: (TIMEFRAMES as string[]).includes(timeframeRaw ?? "")
      ? (timeframeRaw as LeadTimeframe)
      : null,
    message: str(body.message, 2000),
    source: str(body.source, 80) ?? "find-a-pro",
    refSlug: str(body.refSlug, 200),
    referrer: str(body.referrer, 500),
    landingPath: str(body.landingPath, 300),
    utmSource: str(body.utmSource, 120),
    utmMedium: str(body.utmMedium, 120),
    utmCampaign: str(body.utmCampaign, 120),
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
    replyTo: email,
  });

  return NextResponse.json({
    ok: true,
    status: "ok",
    ...(send.ok ? {} : { note: "stored_no_email" }),
  });
}
