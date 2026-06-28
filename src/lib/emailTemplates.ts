/**
 * Branded HTML email templates. Plain inline-styled HTML (email clients ignore
 * <style> and external CSS), kept deliberately simple and light so it renders the
 * same in Gmail, Apple Mail, and Outlook. Voice matches the house style: no em
 * dashes, complete sentences, no hype.
 */
import { site } from "@/lib/site";

const ACCENT = "#4f46e5";
const INK = "#0a0c10";
const MUTED = "#555";
const BORDER = "#e5e7eb";

/** Shared shell: a centered card, the brand wordmark, the body, and a footer.
 *  `footer` carries the unsubscribe / physical-address line (CAN-SPAM). */
function shell(bodyHtml: string, footer: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f4f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid ${BORDER};border-radius:16px;overflow:hidden;">
        <tr><td style="padding:32px 36px 8px;">
          <div style="font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${ACCENT};">${site.name}</div>
        </td></tr>
        <tr><td style="padding:8px 36px 28px;color:${INK};font-size:16px;line-height:1.6;">
          ${bodyHtml}
        </td></tr>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
        <tr><td style="padding:18px 36px;color:${MUTED};font-size:12px;line-height:1.6;text-align:center;">
          ${footer}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function btn(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:${ACCENT};color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:13px 26px;border-radius:10px;">${label}</a>`;
}

/** Double opt-in confirmation email. */
export function confirmEmail(confirmUrl: string): { subject: string; html: string; text: string } {
  const subject = `Confirm your subscription to ${site.name}`;
  const html = shell(
    `<h1 style="font-size:21px;font-weight:700;margin:0 0 14px;color:${INK};">One quick step</h1>
     <p style="margin:0 0 22px;">Tap the button to confirm you want new posts from ${site.name} by email. If you did not request this, you can ignore it and nothing will be sent.</p>
     <p style="margin:0 0 24px;">${btn(confirmUrl, "Confirm my email")}</p>
     <p style="margin:0;color:${MUTED};font-size:13px;">Or paste this link into your browser:<br /><a href="${confirmUrl}" style="color:${ACCENT};word-break:break-all;">${confirmUrl}</a></p>`,
    `You are receiving this because someone entered this address at ${site.url}.`,
  );
  const text = `Confirm your subscription to ${site.name} by opening this link: ${confirmUrl}\n\nIf you did not request this, ignore this email.`;
  return { subject, html, text };
}

/** A "new post" broadcast email for a published site post. */
export function postBroadcastEmail(opts: {
  title: string;
  summary: string | null;
  postUrl: string;
  unsubUrl: string;
}): { subject: string; html: string; text: string } {
  const { title, summary, postUrl, unsubUrl } = opts;
  const subject = title;
  const html = shell(
    `<h1 style="font-size:22px;font-weight:700;margin:0 0 14px;color:${INK};line-height:1.3;">${escapeHtml(title)}</h1>
     ${summary ? `<p style="margin:0 0 24px;color:${MUTED};">${escapeHtml(summary)}</p>` : ""}
     <p style="margin:0 0 8px;">${btn(postUrl, "Read it")}</p>`,
    `You are getting this because you subscribed at ${site.url}.<br />
     <a href="${unsubUrl}" style="color:${MUTED};text-decoration:underline;">Unsubscribe</a>`,
  );
  const text = `${title}\n\n${summary ?? ""}\n\nRead it: ${postUrl}\n\nUnsubscribe: ${unsubUrl}`;
  return { subject, html, text };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
