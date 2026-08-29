"use client";

import { useState } from "react";
import { useAttribution } from "@/lib/attribution";

/**
 * THE SHORTEST POSSIBLE ASK: a number, an address, or both, and one button.
 *
 * WHY IT IS NOT FEWER TAPS THAN THIS. Nothing a page can do will hand Alex a
 * visitor's phone number or email on a single click. No browser exposes it.
 * Sign-in with Google returns an email and a name and never a phone number, and
 * it buys that with an OAuth consent screen that reads as a data grab to a
 * stranger who is comparing agents. The Contact Picker API exists but is Android
 * Chrome only. So the floor is: the person supplies one identifier, and the job
 * of this component is to make supplying it cost as close to nothing as the
 * platform allows.
 *
 * That is what every decision here is for. Two fields and no more. Both carry
 * the autocomplete tokens the OS keychain matches on (`tel`, `email`), so on a
 * phone this is a tap, an autofill chip, a tap, and Send. `inputMode` puts the
 * number pad up for the phone field instead of the alphabet. There is no name
 * field, because a phone number is worth more than a name and Alex can ask for
 * a name in the first sentence he says to them.
 *
 * EITHER ONE IS ENOUGH, and that is the point of the whole redesign. Requiring
 * an email address loses the person who would rather just be called, which in
 * this business is a good lead. Requiring a phone loses the one who is not ready
 * to be called yet. So both fields are optional individually and the button
 * enforces the pair, which is also what /api/refer enforces and, since August
 * 29, 2026, what the database permits (supabase/schema.sql relaxed
 * referral_leads.email to nullable for exactly this).
 *
 * NO SMS CONSENT CHECKBOX, and therefore NO TEXTING. A phone number typed into
 * this box is permission to call, not permission to send marketing texts:
 * 10DLC and TCPA want an explicit, separately-checked opt-in carrying the
 * wording in src/lib/legal.ts, and that wording is a paragraph, which would
 * undo the only thing this form is for. So /api/refer stores these leads with
 * sms_consent = false and the notification email says "NO consent, do not text"
 * in as many words. Do NOT add a phone field to any surface and quietly assume
 * texting rights. If Alex wants to text these leads, the checkbox comes back
 * here, deliberately, with its full wording.
 *
 * The longer ReferralForm on /buying-or-selling still exists and still asks for
 * intent, area, timeframe, and a message, because somebody who navigated there
 * has already decided and the extra fields make Alex's first call better. This
 * one is for the visitor who has decided nothing.
 */

type State = "idle" | "submitting" | "done" | "error";

export function QuickContact({ source }: { source: string }) {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");
  const attribution = useAttribution();

  const hasContact = phone.trim().length > 0 || email.trim().length > 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "submitting") return;
    if (!hasContact) {
      setState("error");
      setError("Give me a phone number or an email and I will take it from there.");
      return;
    }
    setState("submitting");
    setError("");
    try {
      const res = await fetch("/api/refer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          email,
          // Not asked for, but true of nearly everyone who lands here, and it
          // saves Alex a question on the first call. He can correct it in the
          // conversation if they are headed somewhere else.
          location: "Greenville, SC",
          source,
          ...attribution.current,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        setState("done");
      } else if (res.status === 429) {
        setState("error");
        setError("Too many tries. Give it a minute and try again.");
      } else if (json.error === "invalid_email") {
        setState("error");
        setError("That email does not look right. A phone number works too.");
      } else if (json.error === "need_contact") {
        setState("error");
        setError("Give me a phone number or an email and I will take it from there.");
      } else {
        setState("error");
        setError("Something went wrong. Try again, or email me directly.");
      }
    } catch {
      setState("error");
      setError("Could not reach the server. Try again in a moment.");
    }
  }

  if (state === "done") {
    return (
      <div className="text-center py-6">
        <div
          className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
          style={{ background: "var(--accent-soft)" }}
        >
          <svg
            width="22"
            height="22"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            className="theme-label"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="theme-text-primary font-semibold text-lg mb-1">Got it, thank you.</p>
        <p className="theme-text-muted type-small leading-relaxed max-w-md mx-auto">
          {phone.trim()
            ? "I will reach out within a day to hear what you are working on."
            : "I will write back within a day to hear what you are working on."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="text-left" noValidate>
      <div className="grid gap-3 sm:grid-cols-2 mb-4">
        <label className="block">
          <span className="theme-text-primary type-small font-semibold block mb-1.5">Phone</span>
          <input
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(864) 555-0123"
            autoComplete="tel"
            className="theme-field w-full px-4 py-3 text-sm"
          />
        </label>
        <label className="block">
          <span className="theme-text-primary type-small font-semibold block mb-1.5">Email</span>
          <input
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="theme-field w-full px-4 py-3 text-sm"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={state === "submitting"}
        className="theme-cta-accent font-semibold px-6 py-3.5 disabled:opacity-60 w-full"
      >
        {state === "submitting" ? "Sending..." : "Send it to me"}
      </button>

      <p className="theme-text-muted text-xs leading-relaxed mt-3 text-center">
        Either one is enough. No newsletter, and I am the only person who sees it.
      </p>

      {state === "error" && <p className="tone-hot-text type-small mt-3">{error}</p>}
    </form>
  );
}
