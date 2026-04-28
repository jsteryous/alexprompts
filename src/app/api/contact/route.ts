import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    firstName,
    companyName,
    websiteUrl,
    businessType,
    email,
  } = body as {
    firstName?: string;
    companyName?: string;
    websiteUrl?: string;
    businessType?: string;
    email?: string;
  };

  if (!websiteUrl || !email) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: "Email service not configured." }, { status: 500 });
  }

  const headline =
    [firstName, companyName].filter(Boolean).join(" — ") || websiteUrl;

  const htmlBody = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#0a0a0a">
      <div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:16px 20px;border-radius:8px;margin-bottom:28px">
        <p style="margin:0;font-size:14px;font-weight:600;color:#16a34a;text-transform:uppercase;letter-spacing:.05em">New Audit Request</p>
        <p style="margin:4px 0 0;font-size:22px;font-weight:700;color:#0a0a0a">${headline}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;width:160px">Website</td><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-weight:500"><a href="${websiteUrl}" style="color:#16a34a">${websiteUrl}</a></td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280">Email</td><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-weight:500"><a href="mailto:${email}" style="color:#16a34a">${email}</a></td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280">First Name</td><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-weight:500">${firstName || "-"}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280">Practice</td><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-weight:500">${companyName || "-"}</td></tr>
        <tr><td style="padding:10px 0;color:#6b7280">Type</td><td style="padding:10px 0;font-weight:500">${businessType || "-"}</td></tr>
      </table>
    </div>
  `;

  const subject = `New audit request: ${headline}`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM || "REBB Advisors <noreply@rebbadvisors.com>",
      to: ["alex@rebbadvisors.com"],
      reply_to: email,
      subject,
      html: htmlBody,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Resend error:", err);
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
