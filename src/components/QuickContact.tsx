"use client";

import { useState } from "react";
import { useAttribution } from "@/lib/attribution";

/**
 * The one-click capture. One tap, two fields, one button, and it is the whole
 * point of the Greenville agents landing page.
 *
 * WHY IT IS NOT ReferralForm. That form asks for intent, name, email, phone,
 * area, timeframe, a message, and an SMS consent decision, which is the right
 * trade on /buying-or-selling: somebody who navigated there has already decided
 * to start a conversation, and every extra field makes Alex's first call better.
 * A visitor who arrived from a search for "best real estate agents in Greenville
 * SC" has decided nothing yet. They are comparing, and an eight-field form at
 * that moment is a wall. This asks for the two things that make a reply possible
 * plus the one tap that makes the reply useful.
 *
 * NO PHONE FIELD, on purpose. Collecting a number drags the 10DLC consent
 * checkbox and its paragraph of carrier-mandated wording into a form whose only
 * virtue is that it is short (see src/lib/legal.ts). Anyone who wants a call can
 * say so in the reply, and /buying-or-selling is linked for a reader who would
 * rather give the whole picture up front.
 *
 * Same endpoint, same table, same attribution as the full form, so a lead from
 * here lands in referral_leads next to every other one and shows up in
 * supabase/queries.sql unchanged. `source` distinguishes the two placements on
 * the page, which is how we learn whether the form above the fold or the one at
 * the bottom does the work.
 *
 * Copy rule, same as everywhere: it never explains the referral mechanism. It
 * offers a conversation with a person (root CLAUDE.md).
 */

type State = "idle" | "submitting" | "done" | "error";
type Intent = "buying" | "selling" | "both";

const INTENTS: { value: Intent; label: string }[] = [
  { value: "buying", label: "Buying" },
  { value: "selling", label: "Selling" },
  { value: "both", label: "Both" },
];

export function QuickContact({ source }: { source: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [intent, setIntent] = useState<Intent | "">("");
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");
  const attribution = useAttribution();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "submitting") return;
    setState("submitting");
    setError("");
    try {
      const res = await fetch("/api/refer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          intent: intent || undefined,
          // Not asked for on the form, but true of nearly everyone who lands
          // here, and it saves Alex a question on the first reply. He can
          // correct it in the conversation if they are headed somewhere else.
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
      } else {
        setState("error");
        setError(
          json.error === "invalid_email"
            ? "That email does not look right."
            : "Something went wrong. Try again, or email me directly.",
        );
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
          I read every one of these myself, and I will write back within a day or two to hear
          what you are working on. If it is urgent, reply to my email as soon as it lands.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="text-left">
      <div className="mb-4">
        <span className="theme-text-primary type-small font-semibold block mb-2">I am</span>
        <div className="grid grid-cols-3 gap-2">
          {INTENTS.map((opt) => {
            const active = intent === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setIntent(opt.value)}
                aria-pressed={active}
                className={`border px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "theme-cta-accent border-transparent"
                    : "theme-card-strong theme-border theme-text-secondary"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 mb-4">
        <label className="block">
          <span className="theme-text-primary type-small font-semibold block mb-1.5">Name</span>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            className="theme-field w-full px-4 py-3 text-sm"
          />
        </label>
        <label className="block">
          <span className="theme-text-primary type-small font-semibold block mb-1.5">Email</span>
          <input
            type="email"
            required
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
        {state === "submitting" ? "Sending..." : "Get in touch"}
      </button>

      {state === "error" && <p className="tone-hot-text type-small mt-3">{error}</p>}
    </form>
  );
}
