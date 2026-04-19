"use client";

import { useState } from "react";

const checks = [
  {
    n: "01",
    title: "The booking form actually submits",
    body: "We fill it out, hit submit, and watch where it lands. A 404, a silent mailto: that opens Outlook, or a form that just reloads the page — all common, all kill new-patient calls.",
  },
  {
    n: "02",
    title: "The phone is a real tap-to-call link",
    body: "On mobile, the phone number has to be a tel: link. If it's a plain text number or an image, patients copy-paste and give up half the time.",
  },
  {
    n: "03",
    title: "The mobile viewport isn't pinch-zoomed",
    body: "Missing <meta name=\"viewport\"> is the single cheapest fix that moves conversions. We check layout at 375px and confirm tap targets are ≥44px.",
  },
  {
    n: "04",
    title: "The footer copyright year is current",
    body: "A 2019 copyright tells patients the office might be closed. Trust leaks before they read your hours. We also check broken links and SSL.",
  },
  {
    n: "05",
    title: "Lighthouse mobile performance isn't red",
    body: "Anything under 40 on Lighthouse mobile means the page loads slowly enough that new-patient searches bounce before the hero finishes painting.",
  },
];

export function LeadMagnetSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/lead-magnet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "homepage" }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="checklist" className="theme-section-muted theme-border border-y py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid gap-12 lg:grid-cols-[1.05fr,0.95fr] items-start">
          <div>
            <span className="theme-label inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-4">
              Free Checklist
            </span>
            <h2 className="theme-text-primary text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5">
              5 things we check
              <br />
              on every dental site.
            </h2>
            <p className="theme-text-muted text-base leading-relaxed mb-8 max-w-xl">
              Not ready to send the URL yet? Get the exact checklist we run on every audit. Five items you can walk through in 15 minutes before you decide what&apos;s worth fixing.
            </p>

            <ul className="space-y-5 mb-10">
              {checks.map((c) => (
                <li key={c.n} className="flex gap-4">
                  <span className="theme-label text-xs font-semibold tracking-[0.22em] mt-1 flex-shrink-0">
                    {c.n}
                  </span>
                  <div>
                    <p className="theme-text-primary text-base font-semibold mb-1">{c.title}</p>
                    <p className="theme-text-secondary text-sm leading-relaxed">{c.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:sticky lg:top-24">
            <div className="theme-card-strong border rounded-3xl p-8 md:p-10">
              {status === "success" ? (
                <div className="text-center py-6">
                  <div className="theme-card-accent border w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="theme-text-primary text-xl font-bold mb-2">Check your inbox.</h3>
                  <p className="theme-text-muted text-sm leading-relaxed">
                    The full checklist is on its way. If it doesn&apos;t arrive in a few minutes, check spam or email alex@rebbadvisors.com directly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <p className="theme-label text-xs font-semibold uppercase tracking-[0.22em] mb-2">
                      Get the full checklist
                    </p>
                    <h3 className="theme-text-primary text-2xl font-bold leading-tight mb-2">
                      Emailed in 60 seconds.
                    </h3>
                    <p className="theme-text-secondary text-sm leading-relaxed">
                      One email. The five checks, copy-paste ready. No sequence, no pitch, no auto-DMs.
                    </p>
                  </div>

                  <div>
                    <label className="theme-text-secondary block text-xs font-semibold mb-2 uppercase tracking-wide">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@practice.com"
                      required
                      className="theme-card theme-text-primary w-full border rounded-lg px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    />
                  </div>

                  {status === "error" && (
                    <p className="text-xs text-red-600">
                      Something went wrong. Try again or email alex@rebbadvisors.com.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="theme-cta-accent w-full font-semibold text-sm py-3.5 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {status === "loading" ? "Sending..." : "Send Me The Checklist"}
                  </button>

                  <p className="theme-text-muted text-xs leading-relaxed">
                    Prefer we just audit it for you? <a href="/contact" className="theme-link underline underline-offset-4">Send the URL instead</a> and skip the checklist.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
