import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const checklistHtml = `
  <div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;color:#0f1411;line-height:1.55">
    <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#1f7d4e;text-transform:uppercase;letter-spacing:.12em">REBB Advisors · Free Checklist</p>
    <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;letter-spacing:-0.01em">5 things we check on every dental site</h1>
    <p style="margin:0 0 28px;font-size:15px;color:#4a544c">Walk your site through these in 15 minutes before you decide what's worth fixing.</p>

    <div style="border-top:1px solid #e5e7eb;padding-top:20px">
      <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#1f7d4e;letter-spacing:.18em">01</p>
      <p style="margin:0 0 6px;font-size:17px;font-weight:700">The booking form actually submits</p>
      <p style="margin:0 0 22px;font-size:14px;color:#4a544c">Fill it out with test info, hit submit, and watch where it lands. A 404, a silent <code>mailto:</code> that opens Outlook, or a reload with no confirmation — all common, all kill new-patient calls. Also check: does a confirmation email actually arrive?</p>
    </div>

    <div style="border-top:1px solid #e5e7eb;padding-top:20px">
      <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#1f7d4e;letter-spacing:.18em">02</p>
      <p style="margin:0 0 6px;font-size:17px;font-weight:700">The phone is a real tap-to-call link</p>
      <p style="margin:0 0 22px;font-size:14px;color:#4a544c">On mobile, view source and confirm the phone number is an <code>&lt;a href="tel:..."&gt;</code> link, not plain text or an image. If patients have to copy-paste a number, half of them give up.</p>
    </div>

    <div style="border-top:1px solid #e5e7eb;padding-top:20px">
      <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#1f7d4e;letter-spacing:.18em">03</p>
      <p style="margin:0 0 6px;font-size:17px;font-weight:700">The mobile viewport isn't pinch-zoomed</p>
      <p style="margin:0 0 22px;font-size:14px;color:#4a544c">View source, search for <code>meta name="viewport"</code>. If it's missing, your site is showing the desktop layout shrunk to a phone — the single cheapest fix that moves conversions. Also check: at 375px width, is any tap target smaller than 44px square?</p>
    </div>

    <div style="border-top:1px solid #e5e7eb;padding-top:20px">
      <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#1f7d4e;letter-spacing:.18em">04</p>
      <p style="margin:0 0 6px;font-size:17px;font-weight:700">The footer copyright year is current</p>
      <p style="margin:0 0 22px;font-size:14px;color:#4a544c">A 2019 copyright tells patients the office might be closed. Trust leaks before they read your hours. While you're down there: click every footer link and confirm none 404, and confirm the address bar shows the padlock (valid SSL, no mixed-content warnings).</p>
    </div>

    <div style="border-top:1px solid #e5e7eb;padding-top:20px">
      <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#1f7d4e;letter-spacing:.18em">05</p>
      <p style="margin:0 0 6px;font-size:17px;font-weight:700">Lighthouse mobile performance isn't red</p>
      <p style="margin:0 0 22px;font-size:14px;color:#4a544c">Open Chrome DevTools → Lighthouse → Mobile → Performance. Anything under 40 means the page loads slowly enough that new-patient searches bounce before the hero finishes painting. LCP over 4s and CLS over 0.25 are the usual culprits on older dental sites.</p>
    </div>

    <div style="margin-top:32px;padding:24px;background:#f4f0e8;border-radius:12px">
      <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#0f1411">Want us to just audit it for you?</p>
      <p style="margin:0 0 16px;font-size:14px;color:#4a544c">Send your URL. We reply within one business day with screenshots of what's broken and a written proposal naming the tier that fits — Cleanup ($1,500), Growth ($3,500 + $500/mo), or Dominance (custom scope). If the site is already fine, the proposal says that.</p>
      <a href="https://rebbadvisors.com/contact" style="display:inline-block;background:#1f7d4e;color:#fff;font-weight:600;font-size:14px;padding:12px 22px;border-radius:10px;text-decoration:none">Get Free Audit →</a>
    </div>

    <p style="margin:32px 0 0;font-size:12px;color:#8a8f8c">REBB Advisors · Greenville SC · Website cleanup for dental practices.</p>
  </div>
`;

export async function POST(req: NextRequest) {
  const { email, source } = await req.json();

  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email required." }, { status: 400 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: "Email service not configured." }, { status: 500 });
  }

  const supaUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supaKey = process.env.SUPABASE_SERVICE_KEY;
  if (supaUrl && supaKey) {
    try {
      const supa = createClient(supaUrl, supaKey);
      await supa
        .from("lead_magnet_subscribers")
        .upsert({ email, source: source ?? "homepage" }, { onConflict: "email" });
    } catch (err) {
      console.error("lead_magnet_subscribers upsert failed:", err);
    }
  }

  const sendChecklist = fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM || "REBB Advisors <noreply@rebbadvisors.com>",
      to: [email],
      subject: "5 things we check on every dental site",
      html: checklistHtml,
    }),
  });

  const notifyInternal = fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM || "REBB Advisors <noreply@rebbadvisors.com>",
      to: [process.env.NOTIFICATION_EMAIL || "alex@rebbadvisors.com"],
      subject: `New checklist subscriber: ${email}`,
      html: `<p>New lead-magnet subscriber.</p><p><b>Email:</b> ${email}<br/><b>Source:</b> ${source ?? "homepage"}</p>`,
    }),
  });

  const [checklistRes] = await Promise.all([sendChecklist, notifyInternal]);

  if (!checklistRes.ok) {
    const err = await checklistRes.text();
    console.error("Resend error (checklist):", err);
    return NextResponse.json({ error: "Failed to send checklist." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
