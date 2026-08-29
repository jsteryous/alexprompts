/**
 * The "book a call" configuration, in one place.
 *
 * WHY A SCHEDULING LINK AND NOT AN AUTH BUTTON. The goal is one click that ends
 * in a phone call. Sign-in with Google cannot do that: OAuth returns a name, an
 * email, and a picture, the phone number sits behind a separate restricted scope
 * that is usually empty anyway, and signing in schedules nothing. A booking page
 * returns a time, a number, a calendar hold, and a reminder, which is the entire
 * workflow.
 *
 * WHY A LINK OUT AND NOT AN EMBED. Cal.com, Calendly, and SavvyCal all embed
 * with a third-party script, and this site deliberately runs no third-party
 * anything: Vercel Web Analytics is cookieless and first-party, which is why
 * there is no consent banner (see src/app/layout.tsx). Dropping a scheduler's
 * script onto the highest-intent page would put third-party cookies on it and
 * take the banner question with them. Opening the booking page in a new tab is
 * still one click and keeps the site clean.
 *
 * PROVIDER-AGNOSTIC ON PURPOSE. NEXT_PUBLIC_BOOKING_URL takes a Cal.com link, a
 * Calendly link, or a Google Calendar appointment-schedule link without any code
 * change. All three ignore query parameters they do not recognise, so the
 * attribution passthrough in BookCall is safe across all of them.
 *
 * UNSET IS A REAL STATE AND MUST STAY SAFE. Until the booking page exists, both
 * of these return null and every surface falls back to the form it already had.
 * Nothing renders a dead button. The env vars are NEXT_PUBLIC_ because they are
 * public links a visitor clicks, not secrets, and because they get inlined at
 * build time so a server component can branch on them too.
 */

/** The scheduling page a visitor books on, or null while none is configured. */
export function bookingUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_BOOKING_URL?.trim();
  return url ? url.replace(/\/$/, "") : null;
}

/**
 * The number a visitor can dial, or null. Rendered as visible text rather than
 * hidden behind a "call now" label, so somebody on a desktop can read it and
 * dial it by hand instead of clicking a `tel:` link their machine cannot handle.
 */
export function phoneNumber(): string | null {
  return process.env.NEXT_PUBLIC_PHONE_NUMBER?.trim() || null;
}

/** `tel:` needs the digits and a leading +, never the parentheses and spaces. */
export function telHref(display: string): string {
  const digits = display.replace(/[^\d+]/g, "");
  return `tel:${digits.startsWith("+") ? digits : `+1${digits.replace(/^1/, "")}`}`;
}
