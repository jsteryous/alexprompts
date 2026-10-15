/**
 * THE INTELLIGENCER BY EMAIL (October 14, 2026). Each printed number goes to the
 * confirmed owned list (`subscribers`), so subscribing is worth doing and readers
 * come back three mornings a week.
 *
 * The press door (/api/intelligencer/press) calls `broadcastEdition` right after
 * a number is printed, in `after()`, so the press is never kept waiting. A manual
 * route (/api/intelligencer/broadcast, PUBLISH_SECRET) sends a preview, reports
 * a dry count, or resends. `intelligencer_editions.emailed_at` is stamped once a
 * send succeeds, so a number never goes out twice by accident; a total failure
 * (Resend not configured, say) leaves it unstamped and retryable.
 *
 * The email is a short newspaper, not the whole number: the banner and the lead's
 * opening, the rest of the front page as headlines, one letter in full and one
 * advertisement, then a button to the whole number. Every link lands on the
 * site, where the clipping and the office are. Fonts: the period faces load in
 * clients that allow web fonts and fall back to Georgia and Arial Narrow in the
 * rest, so it reads as a paper either way.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Edition, PaperItem } from "@/lib/editions";
import { editionDateLine, safeImage, safeVideo } from "@/lib/editions";
import { clipId } from "@/lib/clips";
import { emailConfigured, sendEmail } from "@/lib/email";
import { getConfirmedSubscribers } from "@/lib/subscribers";
import { SITE_URL } from "@/lib/site";

const NEWSPRINT = "#f4ecd6";
const SHEET = "#fbf7ea";
const INK = "#1d1912";
const SOFT = "#4a443a";
const MUTED = "#7a7264";
const OXBLOOD = "#9a2323";
const BLACKLETTER = "'UnifrakturMaguntia', 'Old English Text MT', Georgia, serif";
const BANNER = "'Oswald', 'Arial Narrow', 'Helvetica Neue', Arial, sans-serif";
const HEAD = "'Libre Bodoni', 'Bodoni 72', 'Bodoni MT', Georgia, serif";
const BODY = "Georgia, 'Times New Roman', serif";
const FONTS =
  "https://fonts.googleapis.com/css2?family=Libre+Bodoni:ital,wght@0,700;1,400&family=Oswald:wght@700&family=UnifrakturMaguntia&display=swap";

const POSTAL_ADDRESS = process.env.EMAIL_POSTAL_ADDRESS ?? "";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const paras = (item: PaperItem | undefined, n: number) => (item?.paragraphs ?? []).slice(0, n);

function rule(weight = 1, margin = "14px 0") {
  return `<div style="border-top:${weight}px solid ${INK};font-size:0;line-height:0;margin:${margin};">&nbsp;</div>`;
}

function kicker(text: string) {
  return `<p style="margin:26px 0 8px;font-family:${HEAD};font-weight:700;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:${OXBLOOD};">${esc(text)}</p>`;
}

export function editionEmail(edition: Edition, unsubUrl: string): { subject: string; html: string; text: string } {
  const c = edition.content ?? {};
  const url = `${SITE_URL}/edition/${edition.slug}`;
  const lead = c.lead;
  const headline = (lead?.headline ?? edition.headline).replace(/\.$/, "");
  const leadParas = paras(lead, 2);
  const film = safeVideo(lead?.video);
  // A film cannot play in an email, so its still stands in and links to the page.
  const plate = safeImage(lead?.image) ?? (film ? { url: film.still, caption: film.caption, credit: `${film.credit}, on YouTube`, source: url } : null);
  const dispatches = (c.dispatches ?? []).map((d, i) => ({ d, href: `${url}#${clipId("dispatch", i)}` }));
  const odd = (c.oddities ?? [])[0];
  const letter = (c.letters ?? [])[0];
  const ad = (c.advertisements ?? [])[0];
  const date = editionDateLine(edition.slug);
  const subject = `No. ${edition.number}: ${headline}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
<link rel="stylesheet" href="${FONTS}" />
<title>${esc(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${NEWSPRINT};">
<div style="display:none;max-height:0;overflow:hidden;">${esc(edition.summary ?? headline)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${NEWSPRINT};padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:${SHEET};border:2px solid ${INK};">
<tr><td style="padding:26px 30px 8px;text-align:center;color:${INK};">
  <p style="margin:0;font-family:${HEAD};font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${MUTED};">No. ${edition.number} &middot; Price: Free</p>
  <p style="margin:8px 0 0;font-family:${BLACKLETTER};font-size:40px;line-height:1.05;color:${INK};">The Rebrew Intelligencer</p>
  <p style="margin:8px 0 0;font-family:${HEAD};font-style:italic;font-size:13px;color:${SOFT};">And ye shall know the truth, and the truth shall make you free. John 8:32</p>
  ${rule(3, "14px 0 0")}
  <p style="margin:6px 0;font-family:${HEAD};font-weight:700;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;">${esc(date)}</p>
  ${rule(1, "0")}
</td></tr>
<tr><td style="padding:18px 30px 4px;color:${INK};">
  ${
    plate
      ? `<a href="${url}"><img src="${esc(plate.url)}" alt="${esc(plate.caption)}" width="540" style="display:block;width:100%;max-width:540px;height:auto;border:1px solid ${INK};margin:0 auto 6px;" /></a>
  ${plate.caption ? `<p style="margin:0 0 16px;text-align:center;font-family:${HEAD};font-style:italic;font-size:14px;color:${SOFT};">${esc(plate.caption)}</p>` : ""}`
      : ""
  }
  <h1 style="margin:0;text-align:center;font-family:${BANNER};font-weight:700;font-size:34px;line-height:1.02;text-transform:uppercase;">${esc(headline)}</h1>
  ${(lead?.decks ?? [])
    .slice(0, 1)
    .map((d) => `<p style="margin:10px 0 0;text-align:center;font-family:${HEAD};font-style:italic;font-size:17px;line-height:1.35;color:${SOFT};">${esc(d)}</p>`)
    .join("")}
  ${leadParas
    .map(
      (p, i) =>
        `<p style="margin:${i === 0 ? 18 : 12}px 0 0;font-family:${BODY};font-size:17px;line-height:1.6;">${
          i === 0 && lead?.dateline ? `<b style="font-size:13px;letter-spacing:0.05em;text-transform:uppercase;">${esc(lead.dateline)}.</b> ` : ""
        }${esc(p)}</p>`,
    )
    .join("")}
  <p style="margin:22px 0 4px;text-align:center;">
    <a href="${url}" style="display:inline-block;background:${INK};color:${SHEET};text-decoration:none;font-family:${BANNER};font-weight:700;font-size:15px;letter-spacing:0.08em;text-transform:uppercase;padding:13px 26px;">Read the whole number</a>
  </p>
</td></tr>
${
  dispatches.length
    ? `<tr><td style="padding:4px 30px 0;color:${INK};">
  ${kicker("Also in this number")}
  ${dispatches
    .map(
      ({ d, href }) =>
        `<p style="margin:0 0 10px;font-family:${BANNER};font-weight:700;font-size:16px;line-height:1.2;text-transform:uppercase;"><a href="${href}" style="color:${INK};text-decoration:none;">${esc(
          (d.headline ?? "").replace(/\.$/, ""),
        )}</a>${
          d.decks?.[0] ? `<br /><span style="font-family:${HEAD};font-weight:400;font-style:italic;font-size:14px;text-transform:none;color:${SOFT};">${esc(d.decks[0])}</span>` : ""
        }</p>`,
    )
    .join("")}
</td></tr>`
    : ""
}
${
  odd
    ? `<tr><td style="padding:0 30px;color:${INK};">
  ${kicker("Strange but true")}
  ${odd.headline ? `<p style="margin:0 0 8px;font-family:${BANNER};font-weight:700;font-size:16px;text-transform:uppercase;">${esc(odd.headline.replace(/\.$/, ""))}</p>` : ""}
  ${paras(odd, 3)
    .map((p) => `<p style="margin:0 0 10px;font-family:${BODY};font-size:16px;line-height:1.6;">${esc(p)}</p>`)
    .join("")}
</td></tr>`
    : ""
}
${
  letter
    ? `<tr><td style="padding:0 30px;color:${INK};">
  ${kicker("A letter to the Editor")}
  ${letter.headline ? `<p style="margin:0 0 8px;font-family:${BANNER};font-weight:700;font-size:16px;text-transform:uppercase;">${esc(letter.headline.replace(/\.$/, ""))}</p>` : ""}
  ${paras(letter, 4)
    .map((p) => `<p style="margin:0 0 10px;font-family:${BODY};font-size:16px;line-height:1.6;">${esc(p)}</p>`)
    .join("")}
  ${letter.signed ? `<p style="margin:0;text-align:right;font-family:${HEAD};font-style:italic;font-size:15px;">${esc(letter.signed)}</p>` : ""}
</td></tr>`
    : ""
}
${
  ad
    ? `<tr><td style="padding:22px 30px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:2px solid ${INK};"><tr><td style="padding:3px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${INK};"><tr><td style="padding:16px 18px;text-align:center;color:${INK};">
    <p style="margin:0;font-family:${BANNER};font-weight:700;font-size:20px;line-height:1.1;text-transform:uppercase;">${esc(ad.headline ?? "")}</p>
    ${(ad.lines ?? []).map((l) => `<p style="margin:8px 0 0;font-family:${HEAD};font-style:italic;font-size:15px;line-height:1.35;color:${SOFT};">${esc(l)}</p>`).join("")}
  </td></tr></table>
  </td></tr></table>
</td></tr>`
    : ""
}
<tr><td style="padding:24px 30px 26px;color:${INK};">
  ${rule(1, "0 0 14px")}
  <p style="margin:0;font-family:${HEAD};font-style:italic;font-size:15px;line-height:1.5;text-align:center;">
    Clip any line you like on <a href="${url}" style="color:${OXBLOOD};">the site</a>, or drop in on <a href="${SITE_URL}/office" style="color:${OXBLOOD};">the Editor's office</a>.<br />
    Know someone who would enjoy this? Forward it to them. They can sign up at <a href="${SITE_URL}/subscribe" style="color:${OXBLOOD};">rebrew.org/subscribe</a>.
  </p>
</td></tr>
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
<tr><td style="padding:16px 30px;font-family:Arial,sans-serif;font-size:12px;line-height:1.6;color:${MUTED};text-align:center;">
  You are getting The Rebrew Intelligencer because you asked to, three mornings a week. It is written by a machine; the news in it is true and checked, and the Editor and his advertisements are inventions.<br />
  <a href="${unsubUrl}" style="color:${MUTED};text-decoration:underline;">Unsubscribe</a>${POSTAL_ADDRESS ? `<br />${esc(POSTAL_ADDRESS)}` : ""}
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  const text = [
    `THE REBREW INTELLIGENCER, No. ${edition.number}, ${date}`,
    "",
    headline.toUpperCase(),
    ...(lead?.decks?.[0] ? [lead.decks[0]] : []),
    "",
    ...leadParas.flatMap((p) => [p, ""]),
    `Read the whole number: ${url}`,
    "",
    ...(dispatches.length ? ["ALSO IN THIS NUMBER", ...dispatches.map(({ d, href }) => `${(d.headline ?? "").replace(/\.$/, "")}: ${href}`), ""] : []),
    ...(odd ? ["STRANGE BUT TRUE", ...(odd.headline ? [odd.headline] : []), ...paras(odd, 3), ""] : []),
    ...(letter ? ["A LETTER TO THE EDITOR", ...paras(letter, 4), ...(letter.signed ? [letter.signed] : []), ""] : []),
    "Know someone who would enjoy this? Forward it. They can sign up at " + `${SITE_URL}/subscribe`,
    "",
    `Unsubscribe: ${unsubUrl}`,
    ...(POSTAL_ADDRESS ? [POSTAL_ADDRESS] : []),
  ].join("\n");

  return { subject, html, text };
}

export interface EditionBroadcastOptions {
  /** Send one preview to this address; touch neither the list nor the stamp. */
  test?: string | null;
  /** Report the recipient count without sending. */
  dry?: boolean;
  /** Send even if this number was already emailed. */
  force?: boolean;
}

/** Resend allows two requests a second on the free tier; stay under it. */
const pause = () => new Promise((r) => setTimeout(r, 550));

/** Email the printed number `slug` to the confirmed list. Returns a status and a JSON body. */
export async function broadcastEdition(
  db: SupabaseClient,
  slug: string,
  opts: EditionBroadcastOptions = {},
): Promise<{ status: number; body: Record<string, unknown> }> {
  const { test, dry, force } = opts;
  const { data, error } = await db
    .from("intelligencer_editions")
    .select("number, slug, headline, summary, content, published_at, emailed_at")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) return { status: 500, body: { ok: false, error: error.message } };
  if (!data) return { status: 404, body: { ok: false, error: "no printed number for that date" } };
  const edition = data as Edition & { emailed_at: string | null };

  if (test) {
    const mail = editionEmail(edition, `${SITE_URL}/api/unsubscribe?token=preview`);
    const r = await sendEmail({ to: test, subject: mail.subject, html: mail.html, text: mail.text });
    return { status: r.ok ? 200 : 502, body: { ok: r.ok, mode: "test", to: test, error: r.error } };
  }
  if (edition.emailed_at && !force) {
    return { status: 409, body: { ok: false, error: "already emailed", emailed_at: edition.emailed_at, hint: "add &force=1 to resend" } };
  }

  const recipients = await getConfirmedSubscribers();
  if (dry) return { status: 200, body: { ok: true, mode: "dry", number: edition.number, recipients: recipients.length } };
  if (!emailConfigured()) return { status: 503, body: { ok: false, error: "email not configured (RESEND_API_KEY, EMAIL_FROM)" } };

  let sent = 0;
  const failures: string[] = [];
  for (const r of recipients) {
    const unsubUrl = `${SITE_URL}/api/unsubscribe?token=${r.unsub_token}`;
    const mail = editionEmail(edition, unsubUrl);
    const res = await sendEmail({
      to: r.email,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      headers: { "List-Unsubscribe": `<${unsubUrl}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
    });
    if (res.ok) sent++;
    else failures.push(res.error ?? "unknown");
    await pause();
  }

  // Stamp unless everything failed, so a misconfiguration stays visible and retryable.
  const totalFailure = recipients.length > 0 && sent === 0;
  if (!totalFailure) {
    await db.from("intelligencer_editions").update({ emailed_at: new Date().toISOString() }).eq("slug", slug);
  }
  return {
    status: totalFailure ? 502 : 200,
    body: { ok: !totalFailure, mode: "broadcast", number: edition.number, recipients: recipients.length, sent, failed: failures.length, failures: failures.slice(0, 5) },
  };
}
