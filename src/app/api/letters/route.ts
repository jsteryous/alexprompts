import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimited } from "@/lib/rateLimit";
import { sendEmail } from "@/lib/email";
import { normalizeEmail } from "@/lib/subscribers";
import { LETTER_MAX, LETTER_MIN, SIGNED_MAX, cleanLetterText, hasLink } from "@/lib/letters";

// POST /api/letters  { body, signed, email?, company? }
// A letter to the Editor from a real reader (see src/lib/letters.ts). Stored for
// the press to consider, and forwarded to Alex so he sees every letter. `company`
// is a honeypot: people never see it, so anything in it is a bot, which gets the
// same success answer and nothing stored.
export const dynamic = "force-dynamic";

const HOUR = 3_600_000;

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);
}

export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });

  if (rateLimited(`letter:ip:${clientIp(req)}`, 3, HOUR)) {
    return NextResponse.json({ ok: false, error: "The Editor asks that you write no more than three letters an hour." }, { status: 429 });
  }

  let raw: Record<string, unknown>;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }
  if (typeof raw.company === "string" && raw.company.trim()) return NextResponse.json({ ok: true });

  const body = cleanLetterText(raw.body, LETTER_MAX);
  const signed = cleanLetterText(raw.signed, SIGNED_MAX)?.replace(/\s+/g, " ") ?? null;
  if (!body || body.length < LETTER_MIN) {
    return NextResponse.json({ ok: false, error: `A letter runs between ${LETTER_MIN} and ${LETTER_MAX} characters.` }, { status: 400 });
  }
  if (!signed || signed.length < 2) {
    return NextResponse.json({ ok: false, error: "Sign your letter, with your name or a pen name." }, { status: 400 });
  }
  if (hasLink(body) || hasLink(signed)) {
    return NextResponse.json({ ok: false, error: "The paper prints no links in letters. Please take it out and send again." }, { status: 400 });
  }
  const email = raw.email ? normalizeEmail(raw.email) : null;
  if (raw.email && !email) {
    return NextResponse.json({ ok: false, error: "That email address does not look right. It is optional." }, { status: 400 });
  }

  const sb = createClient(url, key);
  const { data, error } = await sb.from("intelligencer_letters").insert({ body, signed, email }).select("id").single();
  if (error) return NextResponse.json({ ok: false, error: "insert_failed" }, { status: 500 });

  const to = process.env.PRESS_NOTIFY_EMAIL;
  if (to) {
    await sendEmail({
      to,
      subject: `Letter to the Editor No. ${data.id}, from ${signed}`,
      text: `${body}\n\n${signed}${email ? `\n${email}` : ""}`,
      html:
        `<div style="font-family:Georgia,serif;font-size:16px;line-height:1.6;max-width:640px;white-space:pre-wrap">` +
        `${escapeHtml(body)}\n\n<i>${escapeHtml(signed)}</i>${email ? `\n${escapeHtml(email)}` : ""}</div>`,
    });
  }

  return NextResponse.json({ ok: true });
}
