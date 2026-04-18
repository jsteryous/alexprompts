import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    firstName,
    lastName,
    companyName,
    websiteUrl,
    businessType,
    phone,
    email,
    biggestIssue,
    timeline,
  } = body;

  if (!firstName || !companyName || !websiteUrl || !businessType || !email) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: "Email service not configured." }, { status: 500 });
  }

  const htmlBody = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#0a0a0a">
      <div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:16px 20px;border-radius:8px;margin-bottom:28px">
        <p style="margin:0;font-size:14px;font-weight:600;color:#16a34a;text-transform:uppercase;letter-spacing:.05em">New Website Cleanup Request</p>
        <p style="margin:4px 0 0;font-size:22px;font-weight:700;color:#0a0a0a">${firstName} ${lastName}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;width:160px">Company</td><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-weight:500">${companyName}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280">Website</td><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-weight:500"><a href="${websiteUrl}" style="color:#16a34a">${websiteUrl}</a></td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280">Type</td><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-weight:500">${businessType || "-"}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280">Email</td><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-weight:500"><a href="mailto:${email}" style="color:#16a34a">${email}</a></td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280">Phone</td><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-weight:500">${phone || "-"}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280">Timeline</td><td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-weight:500">${timeline || "-"}</td></tr>
        <tr><td style="padding:10px 0;vertical-align:top;color:#6b7280">Biggest Issue</td><td style="padding:10px 0;font-weight:500;white-space:pre-wrap">${biggestIssue || "-"}</td></tr>
      </table>
    </div>
  `;

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
      subject: `New website cleanup request: ${firstName} ${lastName} - ${companyName}`,
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
