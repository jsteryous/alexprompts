import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { insertLead, leadExistsWithMarker, leadsConfigured } from "@/lib/leads";
import { normalizeEmail } from "@/lib/subscribers";
import { sendEmail } from "@/lib/email";
import { leadNotifyEmail } from "@/lib/emailTemplates";
import { site } from "@/lib/site";

/**
 * POST /api/booking — the Cal.com webhook.
 *
 * A booked call is a lead, and before this route existed it was a lead that only
 * appeared on Alex's calendar. Every conversion query in supabase/queries.sql
 * reads `referral_leads`, so a booking that never landed there was invisible to
 * the only numbers that say whether any of this works. This closes that: a
 * BOOKING_CREATED event becomes a `referral_leads` row with `source =
 * "cal-booking"`, alongside every form submission, and Alex gets the same
 * notification email in its booking variant.
 *
 * SET IT UP: Cal.com → Settings → Developer → Webhooks → New.
 *   Subscriber URL   https://www.rebrew.org/api/booking
 *   Event triggers   Booking created  (leave the rest off; see below)
 *   Secret           the same value as CAL_WEBHOOK_SECRET in Vercel
 *
 * AUTHENTICATION IS MANDATORY HERE, unlike /api/refer. That route is a public
 * form endpoint protected by a rate limit, and the worst a bad actor gets is a
 * junk row. This URL is guessable and does the same write with no human in
 * front of it, so an unsigned request is refused and an unset CAL_WEBHOOK_SECRET
 * takes the whole route offline with a 503 rather than accepting anonymous
 * writes. If bookings are not arriving, that is the first thing to check.
 *
 * ONLY BOOKING_CREATED IS HANDLED. Other triggers get an honest 200 saying they
 * were ignored, because a non-2xx makes Cal.com retry forever and eventually
 * disable the webhook. BOOKING_RESCHEDULED is deliberately not handled: the lead
 * is already in the table and the new time is already on the calendar, so
 * writing a second row would double-count one person. A cancellation likewise
 * does not mark the lead dead, since somebody who booked and cancelled is still
 * someone worth calling.
 *
 * The payload shape is Cal.com's: `{ triggerEvent, createdAt, payload }`, with
 * the booking under `payload` (uid, startTime, attendees[], responses{}). The
 * readers below are deliberately tolerant, because `responses` values arrive
 * either as a bare value or as `{ label, value, isHidden }` depending on the
 * version, and the phone field only exists at all when the event type's location
 * is set to "Attendee Phone Number". Set it to that: it is what makes the
 * booking form collect a number, which is the entire point of the call.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Cal.com signs the raw body with HMAC-SHA256 and sends the hex digest here. */
const SIGNATURE_HEADER = "x-cal-signature-256";

function signatureValid(raw: string, header: string | null, secret: string): boolean {
  if (!header) return false;
  // Tolerate a "sha256=" prefix in case Cal.com ever adds one; the digest is the
  // part after it either way.
  const got = header.trim().replace(/^sha256=/i, "");
  const want = createHmac("sha256", secret).update(raw, "utf8").digest("hex");
  // timingSafeEqual throws on a length mismatch, so check that first. The length
  // of a hex digest is not a secret.
  if (got.length !== want.length) return false;
  return timingSafeEqual(Buffer.from(got, "utf8"), Buffer.from(want, "utf8"));
}

/** A Cal.com `responses` entry is either a bare value or `{ label, value }`. */
function response(responses: unknown, key: string): string | null {
  if (!responses || typeof responses !== "object") return null;
  const entry = (responses as Record<string, unknown>)[key];
  if (entry == null) return null;
  const value =
    typeof entry === "object" && entry !== null && "value" in entry
      ? (entry as { value: unknown }).value
      : entry;
  if (typeof value === "string") return value.trim() || null;
  if (typeof value === "number") return String(value);
  return null;
}

function str(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
}

/**
 * The call time, written out for Alex in Eastern.
 *
 * Hardcoded to America/New_York rather than read from the payload's organizer
 * timezone, because this email has exactly one reader and he is in Greenville.
 * Rendering it in the attendee's timezone would be a trap: he would read 2pm and
 * miss a call that is at 11am his time.
 */
function callTime(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
    timeZone: "America/New_York",
  }).format(d);
}

/**
 * Best-effort attribution recovery.
 *
 * BookCall appends ?ref= and the utm_* params to the booking link, but what
 * Cal.com does with query parameters it does not recognise is not contractual,
 * so they may or may not reach us. They are read out of `metadata` and out of
 * `responses` here, and when they are absent the row simply records that the
 * lead came from a booking. That is honest and still useful: `source =
 * "cal-booking"` alone answers "did the call button work", which is the question
 * this route was built for. Do not fabricate a ref_slug to fill the column.
 */
function attribution(payload: Record<string, unknown>) {
  const meta = (payload.metadata ?? {}) as Record<string, unknown>;
  const pick = (key: string) => str(meta[key], 200) ?? response(payload.responses, key);
  return {
    refSlug: pick("ref"),
    utmSource: pick("utm_source"),
    utmMedium: pick("utm_medium"),
    utmCampaign: pick("utm_campaign"),
    // BookCall puts the page path that produced the booking in utm_content, and
    // `landing_path` is the column that means exactly that.
    landingPath: pick("utm_content"),
  };
}

export async function POST(req: NextRequest) {
  const secret = process.env.CAL_WEBHOOK_SECRET?.trim();
  if (!secret || !leadsConfigured()) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  // The RAW body, read once. Re-serializing parsed JSON would produce different
  // bytes than Cal.com signed and every signature check would fail.
  const raw = await req.text();
  if (!signatureValid(raw, req.headers.get(SIGNATURE_HEADER), secret)) {
    return NextResponse.json({ ok: false, error: "bad_signature" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  // 200, not 4xx: a non-2xx makes Cal.com retry and eventually disable the
  // webhook, and an event we chose not to handle is not a delivery failure.
  if (body.triggerEvent !== "BOOKING_CREATED") {
    return NextResponse.json({ ok: true, status: "ignored", event: body.triggerEvent });
  }

  const payload = (body.payload ?? {}) as Record<string, unknown>;
  const attendees = Array.isArray(payload.attendees)
    ? (payload.attendees as Record<string, unknown>[])
    : [];
  const attendee = attendees[0] ?? {};

  const email = normalizeEmail(response(payload.responses, "email") ?? attendee.email);
  if (!email) {
    // Nothing to follow up with. Still a 200, because retrying will not conjure
    // an email address, and the booking is on the calendar regardless.
    return NextResponse.json({ ok: true, status: "skipped_no_email" });
  }

  const uid = str(payload.uid, 100);
  // The marker that makes a retry idempotent. It has to survive into `message`.
  const marker = uid ? `cal:${uid}` : null;
  if (marker && (await leadExistsWithMarker(marker))) {
    return NextResponse.json({ ok: true, status: "duplicate", uid });
  }

  const startTime = str(payload.startTime, 60);
  const when = callTime(startTime);
  const notes =
    response(payload.responses, "notes") ??
    response(payload.responses, "additionalNotes") ??
    str(payload.additionalNotes, 1500);

  // The message carries the dedup marker, so it is assembled rather than taken
  // straight from the attendee's notes.
  const message = [
    when ? `Booked a call for ${when}.` : "Booked a call.",
    str(payload.title, 200),
    notes,
    marker,
  ]
    .filter(Boolean)
    .join(" · ")
    .slice(0, 2000);

  const lead = {
    name: response(payload.responses, "name") ?? str(attendee.name, 120),
    email,
    phone:
      response(payload.responses, "attendeePhoneNumber") ??
      response(payload.responses, "phone") ??
      str(attendee.phoneNumber, 40),
    // A booking says somebody wants to talk, not whether they are buying or
    // selling, and the booking form does not ask. Alex finds out on the call.
    intent: null,
    location: null,
    movingFrom: null,
    // Somebody who put a specific time on a calendar is not "just exploring".
    timeframe: "asap" as const,
    message,
    source: "cal-booking",
    referrer: null,
    ...attribution(payload),
    // A phone number given to a scheduler so that Alex can call at an agreed
    // time is NOT consent to be texted, and this route has no consent checkbox
    // to point at. See src/lib/legal.ts: only a row with sms_consent may be
    // texted, and nothing here may set it.
    smsConsent: false,
    smsConsentAt: null,
    smsConsentIp: null,
    smsConsentText: null,
  };

  try {
    await insertLead(lead);
  } catch (e) {
    // A 500 is correct here: the write genuinely failed and a Cal.com retry is
    // exactly what should happen next.
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }

  // Cal.com already emails him the booking confirmation, so this notification is
  // the lead-shaped view of it: the phone number, the notes, and where it came
  // from, in the format he reads every other lead in. A mail failure is not
  // fatal, since the row is the source of truth.
  const mail = leadNotifyEmail({ ...lead, kind: "booking", when });
  const send = await sendEmail({
    to: process.env.LEADS_NOTIFY_TO ?? process.env.EMAIL_REPLY_TO ?? site.email,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
    replyTo: email,
  });

  return NextResponse.json({
    ok: true,
    status: "stored",
    ...(send.ok ? {} : { note: "stored_no_email" }),
  });
}
