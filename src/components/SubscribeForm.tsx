"use client";

import { useState } from "react";
import { newsletterUrl } from "@/lib/site";

/**
 * Inline email capture for the OWNED list (Supabase + /api/subscribe), the asset
 * we control, separate from Substack. It posts the address, kicks off double
 * opt-in, and shows a "check your inbox" state. Substack stays available as a
 * secondary link for anyone who prefers it. Drop this wherever we want to catch a
 * reader on-site instead of bouncing them to a third party.
 *
 * `source` records where the signup happened (e.g. "tool:deal-analyzer",
 * "article:greenville") so we can see which surfaces convert.
 */

type State = "idle" | "submitting" | "done" | "error";

export function SubscribeForm({
  source,
  heading = "Get new posts by email",
  blurb = "One email when something new goes up on the site, including the local Greenville posts and the Greenville Works pieces that never hit Substack. Free, and you can leave any time.",
  cta = "Subscribe",
  showSubstackLink = true,
}: {
  source: string;
  heading?: string;
  blurb?: string;
  cta?: string;
  showSubstackLink?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState<string>("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "submitting") return;
    setState("submitting");
    setMessage("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        // Uniform success: the API never reveals whether the address was already
        // subscribed, so the message stays neutral and covers both cases.
        setState("done");
        if (json.note === "email_not_configured") {
          setMessage("You're on the list. Confirmation email is not wired up yet, so you're all set.");
        }
      } else if (res.status === 429) {
        setState("error");
        setMessage("Too many tries. Give it a minute and try again.");
      } else {
        setState("error");
        setMessage(json.error === "invalid_email" ? "That email does not look right." : "Something went wrong. Try again.");
      }
    } catch {
      setState("error");
      setMessage("Could not reach the server. Try again.");
    }
  }

  if (state === "done") {
    return (
      <div className="max-w-md mx-auto text-center">
        <div
          className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
          style={{ background: "var(--accent-soft)" }}
        >
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="theme-label">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="theme-text-primary font-semibold text-lg mb-1">Almost there</p>
        <p className="theme-text-contrast-muted text-sm leading-relaxed">
          {message ||
            "Check your inbox and tap the link to confirm. If you are already subscribed, you are all set."}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto text-center">
      {heading && (
        <h2 className="theme-text-primary text-2xl md:text-3xl font-bold tracking-tight mb-3">{heading}</h2>
      )}
      {blurb && <p className="theme-text-contrast-muted text-base mb-6 leading-relaxed">{blurb}</p>}
      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2.5">
        <label className="sr-only" htmlFor={`sub-${source}`}>
          Email address
        </label>
        <input
          id={`sub-${source}`}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          className="theme-field flex-1 px-4 py-3 text-sm"
        />
        <button
          type="submit"
          disabled={state === "submitting"}
          className="theme-cta-accent font-semibold px-6 py-3 rounded-xl disabled:opacity-60 whitespace-nowrap"
        >
          {state === "submitting" ? "Sending..." : cta}
        </button>
      </form>
      {state === "error" && <p className="tone-hot-text text-sm mt-3">{message}</p>}
      {showSubstackLink && (
        <p className="theme-text-contrast-muted text-xs mt-4">
          Prefer Substack?{" "}
          <a href={newsletterUrl} target="_blank" rel="noopener noreferrer" className="theme-link underline">
            Subscribe there instead
          </a>
          .
        </p>
      )}
    </div>
  );
}
