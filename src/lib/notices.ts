/**
 * "YOU'RE IN THE PAPER" (October 16, 2026). When a number prints, the press may
 * name the organization a news item is about and the contact address that
 * organization publishes, and the press door sends that address one note with
 * the clipping. Alex approved it October 16 as the paper's first distribution
 * bet: the subjects of items are the likeliest people on earth to share them.
 *
 * The press reads the open web, so everything it can steer here is boxed in:
 *   - the note's words are fixed in this file; the press picks only the item, the
 *     organization's name and the address;
 *   - the address must sit on the same domain as the page the press found it on,
 *     and never on a free mail service, so only organizations are written to;
 *   - one note per address, ever (a unique column), one per domain in 30 days,
 *     and at most three per number;
 *   - only news items (the lead, dispatches, oddities, What's Brewing and the
 *     amusements), never the Editor's inventions;
 *   - nothing is sent unless INTELLIGENCER_NOTICES is "on" in Vercel.
 * A bad notice is dropped and reported, and never stops a number printing.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Edition, EditionContent } from "@/lib/editions";
import { clipPath, clipsOf } from "@/lib/clips";
import { sendEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/site";

export const NOTICES_PER_NUMBER = 3;
const DOMAIN_COOLDOWN_DAYS = 30;
const FROM = "The Rebrew Intelligencer <hello@rebrew.org>";
const REPLY_TO = "hello@rebrew.org";

/** Only true news items may be noted; the Editor's departments are inventions. */
const NEWS_ITEM = /^(lead|realty|(dispatch|odd|amusement)-\d{1,2})$/;
const EMAIL = /^[a-z0-9._%+-]{1,64}@([a-z0-9-]+\.)+[a-z]{2,24}$/;
const FREE_MAIL = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "ymail.com", "outlook.com", "hotmail.com", "live.com",
  "msn.com", "aol.com", "icloud.com", "me.com", "mac.com", "proton.me", "protonmail.com", "gmx.com",
  "mail.com", "zoho.com", "yandex.com", "fastmail.com", "hey.com",
]);

export function noticesEnabled(): boolean {
  return process.env.INTELLIGENCER_NOTICES === "on";
}

export interface Notice {
  item: string;
  subject: string;
  email: string;
  domain: string;
  contactPage: string;
  headline: string;
}

function host(url: string): string | null {
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:" ? u.hostname.toLowerCase().replace(/^www\./, "") : null;
  } catch {
    return null;
  }
}

/**
 * Reads the press's `notices` against the printed content. Returns the notices
 * that pass and one line per notice refused, for Alex's email and the response.
 */
export function parseNotices(v: unknown, content: EditionContent): { notices: Notice[]; refused: string[] } {
  const notices: Notice[] = [];
  const refused: string[] = [];
  if (v === undefined || v === null) return { notices, refused };
  if (!Array.isArray(v)) return { notices, refused: ["notices must be an array"] };
  const clips = new Map(clipsOf({ content } as Edition).map((c) => [c.id, c]));

  v.forEach((raw, i) => {
    const o = (raw ?? {}) as Record<string, unknown>;
    const label = `notices[${i}]`;
    const item = typeof o.item === "string" ? o.item.trim() : "";
    const subject = typeof o.subject === "string" ? o.subject.trim().replace(/\s+/g, " ") : "";
    const email = typeof o.email === "string" ? o.email.trim().toLowerCase() : "";
    const contactPage = typeof o.contact_page === "string" ? o.contact_page.trim() : "";
    const clip = clips.get(item);

    if (notices.length >= NOTICES_PER_NUMBER) return void refused.push(`${label}: at most ${NOTICES_PER_NUMBER} notices per number`);
    if (!NEWS_ITEM.test(item) || !clip) return void refused.push(`${label}: item must name a printed news item (lead, realty, dispatch-N, odd-N, amusement-N)`);
    if (subject.length < 2 || subject.length > 120 || /[<>\r\n–—]/.test(subject)) return void refused.push(`${label}: subject must be the organization's name, 2 to 120 characters, no dashes`);
    if (email.length > 254 || !EMAIL.test(email)) return void refused.push(`${label}: email is not a plain address`);
    const domain = email.split("@")[1];
    if (FREE_MAIL.has(domain)) return void refused.push(`${label}: ${domain} is a personal mail service; write only to an organization's own address`);
    const pageHost = host(contactPage);
    if (!pageHost || contactPage.length > 600) return void refused.push(`${label}: contact_page must be the http(s) page where the address is published`);
    if (!(pageHost === domain || pageHost.endsWith(`.${domain}`) || domain.endsWith(`.${pageHost}`))) {
      return void refused.push(`${label}: ${email} is not on the same domain as ${pageHost}`);
    }
    if (notices.some((n) => n.email === email || n.domain === domain)) return void refused.push(`${label}: one notice per organization per number`);

    notices.push({ item, subject, email, domain, contactPage, headline: (clip.headline ?? clip.department).replace(/\.$/, "") });
  });
  return { notices, refused };
}

export function noticeEmail(n: Notice, slug: string): { subject: string; text: string; html: string } {
  const link = `${SITE_URL}${clipPath(slug, n.item)}`;
  const postal = process.env.EMAIL_POSTAL_ADDRESS;
  const lines = [
    "Good morning,",
    `This morning's Rebrew Intelligencer carries an item about ${n.subject}:`,
    `"${n.headline}"`,
    link,
    "The Intelligencer prints the real news three mornings a week, written the way a big-city daily of 1945 would have written it. Every fact in it is checked against its sources. If we got anything wrong, reply to this note and we will print a correction.",
    "This is the only note we will send you.",
    `The Rebrew Intelligencer\nGreenville, S.C.${postal ? `\n${postal}` : ""}`,
  ];
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const html =
    `<div style="font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.6;color:#1d1912;max-width:560px">` +
    `<p>${esc(lines[0])}</p><p>${esc(lines[1])}</p>` +
    `<p style="margin:18px 0"><a href="${esc(link)}" style="color:#9a2323;font-weight:bold;text-decoration:underline">${esc(n.headline)}</a></p>` +
    `<p>${esc(lines[4])}</p><p>${esc(lines[5])}</p>` +
    `<p>${esc(lines[6]).replace(/\n/g, "<br />")}</p></div>`;
  return { subject: `${n.subject} is in this morning's Rebrew Intelligencer`, text: lines.join("\n\n"), html };
}

/**
 * Records and sends each notice. A row is written before the send, so the unique
 * email column refuses a second note even if two runs race; a failed send keeps its
 * row (status 'failed') and is never retried to the same address.
 */
export async function sendNotices(sb: SupabaseClient, slug: string, notices: Notice[]): Promise<string[]> {
  const results: string[] = [];
  const since = new Date(Date.now() - DOMAIN_COOLDOWN_DAYS * 86400000).toISOString();
  for (const n of notices) {
    const { count } = await sb.from("intelligencer_notices").select("id", { count: "exact", head: true })
      .eq("domain", n.domain).gte("created_at", since);
    if (count) {
      results.push(`${n.email}: skipped, ${n.domain} had a note in the last ${DOMAIN_COOLDOWN_DAYS} days`);
      continue;
    }
    const { data: row, error } = await sb.from("intelligencer_notices")
      .insert({ slug, item: n.item, subject: n.subject, email: n.email, domain: n.domain, contact_page: n.contactPage })
      .select("id").single();
    if (error || !row) {
      results.push(`${n.email}: skipped, ${error?.code === "23505" ? "already written to once" : "could not record it"}`);
      continue;
    }
    const mail = noticeEmail(n, slug);
    const sent = await sendEmail({ to: n.email, from: FROM, replyTo: REPLY_TO, ...mail });
    await sb.from("intelligencer_notices").update(
      sent.ok ? { status: "sent", sent_at: new Date().toISOString() } : { status: "failed", error: (sent.error ?? "unknown").slice(0, 300) },
    ).eq("id", row.id);
    results.push(`${n.email}: ${sent.ok ? "sent" : `failed (${sent.error})`}`);
  }
  return results;
}
