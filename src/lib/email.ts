/**
 * Server-only transactional/broadcast email sending.
 *
 * Provider is Resend, called over its plain REST API (no SDK dependency) so the
 * sender stays swappable and the build stays lean. Configure with two env vars:
 *   - RESEND_API_KEY  — the API key (never exposed to the client)
 *   - EMAIL_FROM      — a verified sender, e.g. "Alex Prompts <alex@alexprompts.com>"
 *                       (MAIL_FROM is accepted as a legacy alias)
 *   - EMAIL_REPLY_TO  — optional reply-to address
 *
 * Until those are set, sending is a no-op that reports "not_configured" so the
 * capture flow (storing subscribers) still works locally without an email account.
 * Deliverability note: Resend needs the sending domain verified by DNS before
 * mail actually lands. The free tier caps at ~100 emails/day, 2 requests/second.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/** The verified sender address. Reads EMAIL_FROM, falling back to the legacy
 *  MAIL_FROM name (still used in some deploy envs) so a naming drift does not
 *  silently disable all outgoing mail. */
function fromAddress(): string | undefined {
  return process.env.EMAIL_FROM ?? process.env.MAIL_FROM;
}

export interface SendResult {
  ok: boolean;
  /** "not_configured" when env is missing; otherwise a provider error string. */
  error?: string;
  id?: string;
}

/** True when RESEND_API_KEY + a sender (EMAIL_FROM/MAIL_FROM) are both set. */
export function emailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY && !!fromAddress();
}

export interface SendOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  /** Extra headers, e.g. List-Unsubscribe for broadcasts. */
  headers?: Record<string, string>;
  replyTo?: string;
}

/** Send one email. Returns { ok:false, error:"not_configured" } when env is unset
 *  so callers can keep a pending subscriber row without treating it as a failure. */
export async function sendEmail(opts: SendOptions): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = fromAddress();
  if (!apiKey || !from) return { ok: false, error: "not_configured" };

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
        reply_to: opts.replyTo ?? process.env.EMAIL_REPLY_TO,
        headers: opts.headers,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `resend_${res.status}: ${body.slice(0, 200)}` };
    }
    const json = (await res.json()) as { id?: string };
    return { ok: true, id: json.id };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
