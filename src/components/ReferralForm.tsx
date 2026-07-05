"use client";

import { useEffect, useRef, useState } from "react";

/** First-party attribution captured once on mount from the URL and referrer, so we
 *  can see which article or channel drove a lead without any third-party analytics. */
interface Attribution {
  refSlug: string | null;
  referrer: string | null;
  landingPath: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
}

/**
 * The /find-a-pro conversion form. Unlike SubscribeForm (email-only newsletter
 * double opt-in), this captures a QUALIFIED referral lead (intent + market +
 * timeframe) and POSTs to /api/refer, which stores it and emails Alex. The extra
 * fields are the difference between a warm follow-up and a cold one, so the small
 * added friction is worth it. Keep the field count tight to protect conversion.
 */

type State = "idle" | "submitting" | "done" | "error";
type Intent = "buying" | "selling" | "both";

const INTENTS: { value: Intent; label: string }[] = [
  { value: "buying", label: "Buy a home" },
  { value: "selling", label: "Sell a home" },
  { value: "both", label: "Both" },
];

const TIMEFRAMES = [
  { value: "asap", label: "As soon as possible" },
  { value: "3_months", label: "In the next 3 months" },
  { value: "6_months", label: "In the next 6 months" },
  { value: "exploring", label: "Just exploring for now" },
];

export function ReferralForm({ source = "find-a-pro" }: { source?: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [intent, setIntent] = useState<Intent | "">("");
  const [location, setLocation] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");
  const attribution = useRef<Attribution | null>(null);

  // Capture attribution once, on mount. The in-article CTA passes ?ref=<slug>;
  // document.referrer and any utm_* params cover organic, social, and paid.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const val = (k: string) => params.get(k)?.trim() || null;
    attribution.current = {
      refSlug: val("ref"),
      referrer: document.referrer || null,
      landingPath: window.location.pathname || null,
      utmSource: val("utm_source"),
      utmMedium: val("utm_medium"),
      utmCampaign: val("utm_campaign"),
    };
  }, []);

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
          phone,
          intent: intent || undefined,
          location,
          timeframe: timeframe || undefined,
          message,
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
      <div className="max-w-xl mx-auto text-center py-4">
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
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="theme-text-primary font-semibold text-lg mb-1">Got it, thank you.</p>
        <p className="theme-text-muted text-sm leading-relaxed max-w-md mx-auto">
          I read every one of these myself. I will reach out within a day or two to learn a
          little more and line up an agent I trust. If it is urgent, just reply to my email.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="max-w-xl mx-auto text-left space-y-5">
      <div>
        <span className="theme-text-primary type-small font-semibold block mb-2">
          I&apos;m looking to
        </span>
        <div className="grid grid-cols-3 gap-2">
          {INTENTS.map((opt) => {
            const active = intent === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setIntent(opt.value)}
                aria-pressed={active}
                className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
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

      <div className="grid gap-4 sm:grid-cols-2">
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

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="theme-text-primary type-small font-semibold block mb-1.5">
            Phone <span className="theme-text-muted font-normal">(optional)</span>
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            className="theme-field w-full px-4 py-3 text-sm"
          />
        </label>
        <label className="block">
          <span className="theme-text-primary type-small font-semibold block mb-1.5">
            Which area?
          </span>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Greenville, SC, or the city you're headed to"
            className="theme-field w-full px-4 py-3 text-sm"
          />
        </label>
      </div>

      <label className="block">
        <span className="theme-text-primary type-small font-semibold block mb-1.5">Timeframe</span>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="theme-field w-full px-4 py-3 text-sm"
        >
          <option value="">Pick one</option>
          {TIMEFRAMES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="theme-text-primary type-small font-semibold block mb-1.5">
          Anything else? <span className="theme-text-muted font-normal">(optional)</span>
        </span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="Price range, must-haves, where you're moving from, whatever helps."
          className="theme-field w-full px-4 py-3 text-sm resize-y"
        />
      </label>

      <button
        type="submit"
        disabled={state === "submitting"}
        className="theme-cta-accent font-semibold px-6 py-3 rounded-xl disabled:opacity-60 w-full sm:w-auto"
      >
        {state === "submitting" ? "Sending..." : "Connect me with a pro"}
      </button>

      {state === "error" && <p className="tone-hot-text text-sm">{error}</p>}
    </form>
  );
}
