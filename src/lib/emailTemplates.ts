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

/**
 * The postal address CAN-SPAM requires on commercial email. Read from the
 * environment so it can be set without a deploy and so no placeholder ever
 * ships as a real address. When it is unset the line is simply omitted, which
 * is the honest failure mode, but note that sending commercial mail without it
 * is the one compliance gap in this file. Use a PO box, not a home address.
 */
const POSTAL_ADDRESS = process.env.EMAIL_POSTAL_ADDRESS ?? "";

/**
 * The owned-list footer. Wording is deliberately true for BOTH intake paths:
 * someone who used the on-site form and someone Alex added by hand after they
 * said yes on a call. The old text claimed "you subscribed at alexprompts.com",
 * which is false for a manual add and is the fastest way to earn a spam
 * complaint from a contact who does not remember a form.
 */
function listFooter(unsubUrl: string): string {
  return `You are getting this because you asked to be on the ${site.name} list.<br />
     <a href="${unsubUrl}" style="color:${MUTED};text-decoration:underline;">Unsubscribe</a>${
       POSTAL_ADDRESS ? `<br /><span style="color:${MUTED};">${POSTAL_ADDRESS}</span>` : ""
     }`;
}

/** Shared shell: a centered card, the brand wordmark, the body, and a footer.
 *  `footer` carries the unsubscribe / physical-address line (CAN-SPAM).
 *  `maxWidth` widens the card for full-article sends; a 520px column is right
 *  for a short notification but too narrow to read 1,200 words in. */
function shell(bodyHtml: string, footer: string, maxWidth = 520): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f4f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:${maxWidth}px;background:#ffffff;border:1px solid ${BORDER};border-radius:16px;overflow:hidden;">
        <tr><td style="padding:32px 36px 8px;">
          <div style="font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${ACCENT};">${site.name}</div>
        </td></tr>
        <tr><td style="padding:8px 36px 28px;color:${INK};font-size:16px;line-height:1.6;">
          ${bodyHtml}
        </td></tr>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:${maxWidth}px;">
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

/**
 * The referral offer, appended to full-content sends on the tracks where the
 * site itself shows `ReferralCta`. The link carries `?ref=<slug>` and email UTMs
 * so a lead that starts in an inbox still lands in `referral_leads` with its
 * attribution intact and shows up in `supabase/queries.sql`.
 */
function referralBlock(referralUrl: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 4px;">
      <tr><td style="background:#f7f7fb;border:1px solid ${BORDER};border-radius:12px;padding:22px 24px;">
        <div style="font-size:17px;font-weight:700;color:${INK};margin:0 0 8px;">Thinking of making a move?</div>
        <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:${MUTED};">
          Let me know if you&rsquo;re thinking about selling, or if you&rsquo;re looking to buy!
        </p>
        <div>${btn(referralUrl, "Get in touch")}</div>
      </td></tr>
    </table>`;
}

/**
 * A broadcast email for a published site post.
 *
 * Two shapes. When `bodyHtml` is supplied the FULL article ships in the email
 * (the Morning Brew model): the reader gets the whole thing in the inbox and the
 * site link becomes a convenience for forwarding rather than a toll gate. This
 * is the right default for a list of sphere professionals, where a click-through
 * is friction on a five-minute read and the habit is the whole point. Without
 * `bodyHtml` it falls back to the original title-plus-summary notification, so
 * any caller that has no body still works.
 */
export function postBroadcastEmail(opts: {
  title: string;
  summary: string | null;
  postUrl: string;
  unsubUrl: string;
  /** Inline-styled article HTML from `renderEmailBody`. Omit for the teaser. */
  bodyHtml?: string | null;
  /** Raw markdown, used verbatim for the text/plain part (markdown reads fine). */
  bodyMd?: string | null;
  /** When set, append the referral offer. Mirrors the site's per-section flag. */
  referralUrl?: string | null;
}): { subject: string; html: string; text: string } {
  const { title, summary, postUrl, unsubUrl, bodyHtml, bodyMd, referralUrl } = opts;
  const subject = title;

  if (!bodyHtml) {
    const html = shell(
      `<h1 style="font-size:22px;font-weight:700;margin:0 0 14px;color:${INK};line-height:1.3;">${escapeHtml(title)}</h1>
       ${summary ? `<p style="margin:0 0 24px;color:${MUTED};">${escapeHtml(summary)}</p>` : ""}
       <p style="margin:0 0 8px;">${btn(postUrl, "Read it")}</p>`,
      listFooter(unsubUrl),
    );
    const text = `${title}\n\n${summary ?? ""}\n\nRead it: ${postUrl}\n\nUnsubscribe: ${unsubUrl}`;
    return { subject, html, text };
  }

  const html = shell(
    `<h1 style="font-size:24px;font-weight:700;margin:0 0 12px;color:${INK};line-height:1.28;">${escapeHtml(title)}</h1>
     ${
       summary
         ? `<p style="margin:0 0 18px;font-size:17px;line-height:1.55;color:${MUTED};">${escapeHtml(summary)}</p>`
         : ""
     }
     <p style="margin:0 0 22px;font-size:13px;color:${MUTED};">
       <a href="${postUrl}" style="color:${MUTED};text-decoration:underline;">View this on the site</a>
     </p>
     <hr style="border:0;border-top:1px solid ${BORDER};margin:0 0 24px;" />
     ${bodyHtml}
     ${referralUrl ? referralBlock(referralUrl) : ""}
     <p style="margin:22px 0 0;font-size:13px;color:${MUTED};">
       <a href="${postUrl}" style="color:${ACCENT};text-decoration:underline;">Read it on the site</a>
     </p>`,
    listFooter(unsubUrl),
    600,
  );

  // Markdown is already readable as plain text, so it is the text/plain part
  // verbatim. A stripped-tags conversion would only lose the link targets.
  const text = `${title}\n\n${summary ? `${summary}\n\n` : ""}${bodyMd ?? ""}\n\nRead it on the site: ${postUrl}\n\nUnsubscribe: ${unsubUrl}`;
  return { subject, html, text };
}

/** Internal notification to Alex when a referral lead comes in via /find-a-pro.
 *  This goes to Alex, not the lead, so it is plain and information-dense: it leads
 *  with the qualifying details so he can follow up warm within a day. */
export function leadNotifyEmail(lead: {
  name: string | null;
  email: string;
  phone: string | null;
  intent: string | null;
  location: string | null;
  movingFrom: string | null;
  timeframe: string | null;
  message: string | null;
  refSlug?: string | null;
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
}): { subject: string; html: string; text: string } {
  const who = lead.name?.trim() || lead.email;
  const subject = `New referral lead: ${who}`;

  const rows: Array<[string, string | null]> = [
    ["Name", lead.name],
    ["Email", lead.email],
    ["Phone", lead.phone],
    ["Looking to", prettyIntent(lead.intent)],
    ["Market", lead.location],
    ["Moving from", lead.movingFrom],
    ["Timeframe", prettyTimeframe(lead.timeframe)],
    ["Notes", lead.message],
    ["Came from", leadSource(lead)],
  ];

  const rowsHtml = rows
    .filter(([, v]) => v && v.trim())
    .map(
      ([label, v]) =>
        `<tr>
           <td style="padding:6px 12px 6px 0;color:${MUTED};font-size:14px;white-space:nowrap;vertical-align:top;">${label}</td>
           <td style="padding:6px 0;color:${INK};font-size:14px;">${escapeHtml(v as string)}</td>
         </tr>`,
    )
    .join("");

  const html = shell(
    `<h1 style="font-size:21px;font-weight:700;margin:0 0 14px;color:${INK};">New referral lead</h1>
     <p style="margin:0 0 18px;color:${MUTED};">Someone asked to be matched with a pro through /find-a-pro. Reach out while it is warm.</p>
     <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">${rowsHtml}</table>
     <p style="margin:22px 0 0;">${btn(`mailto:${escapeHtml(lead.email)}`, "Reply to this lead")}</p>`,
    `Sent from the ${site.name} referral form at ${site.url}/find-a-pro.`,
  );

  const text = rows
    .filter(([, v]) => v && v.trim())
    .map(([label, v]) => `${label}: ${v}`)
    .join("\n");

  return { subject, html, text: `New referral lead\n\n${text}` };
}

/** A human one-line "where did this lead come from" for the notification, from the
 *  first-party attribution. Prefers the article that drove it, then a campaign tag,
 *  then the raw referrer. */
function leadSource(lead: {
  refSlug?: string | null;
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
}): string | null {
  if (lead.refSlug?.trim()) return `Article: ${lead.refSlug.trim()}`;
  const utm = [lead.utmSource, lead.utmMedium, lead.utmCampaign].filter(Boolean).join(" / ");
  if (utm) return `Campaign: ${utm}`;
  if (lead.referrer?.trim()) return lead.referrer.trim();
  return null;
}

function prettyIntent(v: string | null): string | null {
  if (v === "buying") return "Buy a home";
  if (v === "selling") return "Sell a home";
  if (v === "both") return "Buy and sell";
  return v;
}

function prettyTimeframe(v: string | null): string | null {
  if (v === "asap") return "As soon as possible";
  if (v === "3_months") return "In the next 3 months";
  if (v === "6_months") return "In the next 6 months";
  if (v === "exploring") return "Just exploring";
  return v;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
