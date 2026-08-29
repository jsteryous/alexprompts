"use client";

import Link from "next/link";
import { useState } from "react";
import { useAttribution } from "@/lib/attribution";
import { SMS_CONSENT_TEXT } from "@/lib/legal";

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
 * THE SMS CONSENT CHECKBOX IS THE ONE PIECE OF FRICTION THAT EARNS ITS PLACE.
 * A phone number typed into this box is permission to call, not permission to
 * text: 10DLC and TCPA want an explicit, separately-checked opt-in carrying the
 * exact wording in src/lib/legal.ts. It shipped without one on August 29, 2026
 * and Alex asked for it back the same day, which is the right call, because a
 * text gets answered faster than a call and one tap is cheap next to that.
 *
 * Four rules govern it and none of them is stylistic:
 *   - UNCHECKED by default. Carrier vetting rejects a pre-checked box.
 *   - NEVER required to submit, and never bundled into the button. Consent to
 *     be texted cannot be the price of getting an answer.
 *   - The wording renders WHOLE, not summarized. Every clause in it is checked
 *     during vetting: the brand name, what the messages are about, the rates
 *     line, the frequency line, and the STOP and HELP keywords.
 *   - It is ALWAYS VISIBLE, not revealed once a phone number is typed. Hiding
 *     it until it applies is better UX and it is what I would otherwise do, but
 *     a vetting reviewer opening this page has to see the opt-in without
 *     knowing to type anything first, and the already-registered form on
 *     /buying-or-selling shows it unconditionally. The two flows agreeing is
 *     worth more than the saved line.
 *
 * The client posts only the boolean. /api/refer stamps the wording server-side
 * from src/lib/legal.ts and drops the consent entirely when no phone number
 * came with it, so the table never carries a texting right over an empty
 * number, and a year from now the row still says what was on screen.
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
  // Unchecked by default and never part of the submit validation. See the note
  // above: both of those are compliance requirements, not preferences.
  const [smsConsent, setSmsConsent] = useState(false);
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
          // Only the boolean crosses the wire. The server stamps the consent
          // wording, because a consent record the client could have written
          // says nothing about what was actually on screen.
          smsConsent,
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
          {/* Says back what they actually agreed to, so nobody is surprised by
              the channel the reply arrives on. */}
          {phone.trim() && smsConsent
            ? "I will text or call you within a day to hear what you are working on."
            : phone.trim()
              ? "I will call you within a day to hear what you are working on."
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

      {/* The consent block. The wording comes from src/lib/legal.ts so that what
          is shown here, what /terms repeats, and what gets stored on the lead
          row are one string. The two links sit OUTSIDE it, which keeps the
          stored copy plain text matching the screen byte for byte, and puts the
          terms one tap away at the moment consent is given. */}
      <label className="flex gap-3 items-start mb-5">
        <input
          type="checkbox"
          checked={smsConsent}
          onChange={(e) => setSmsConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--accent)]"
        />
        <span className="theme-text-muted text-xs leading-relaxed">
          {SMS_CONSENT_TEXT} Optional, and leaving it unchecked does not change the answer you
          get. See the{" "}
          <Link href="/privacy" className="theme-link underline">
            Privacy Policy
          </Link>{" "}
          and the{" "}
          <Link href="/terms#sms" className="theme-link underline">
            SMS terms
          </Link>
          .
        </span>
      </label>

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
