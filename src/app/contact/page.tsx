"use client";

import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({
    firstName: "",
    companyName: "",
    websiteUrl: "",
    businessType: "",
    email: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <section className="theme-page pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <span className="theme-label inline-block text-xs font-semibold uppercase tracking-widest mb-4">
            Free Audit + Written Proposal
          </span>
          <h1 className="theme-text-primary text-5xl md:text-6xl font-bold tracking-tight mb-5 leading-tight">
            Send your website.
            <br />
            We&apos;ll show you what is broken.
          </h1>
          <p className="theme-text-muted text-xl max-w-2xl leading-relaxed">
            Within 48 hours: screenshots of the issues worth fixing, plus a written proposal &mdash; scope, price, timeline. Cleanup starts at $1,500. If your site needs more, the proposal scopes that. If it&rsquo;s already fine, the proposal says so.
          </p>
        </div>
      </section>

      <section className="theme-section pb-24 md:pb-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div className="theme-card border rounded-2xl p-8 md:p-10">
              {status === "success" ? (
                <div className="text-center py-8">
                  <div className="theme-card-accent border w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h2 className="theme-text-primary text-xl font-bold mb-2">Expect screenshots within 48 hours.</h2>
                  <p className="theme-text-muted text-sm leading-relaxed">
                    We&apos;ll review the site, send back the issues worth fixing, and a written proposal. No call, no follow-up sequence.
                  </p>
                </div>
              ) : (
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div>
                    <label className="theme-text-secondary block text-xs font-semibold mb-2 uppercase tracking-wide">
                      Website URL
                    </label>
                    <input
                      type="url"
                      name="websiteUrl"
                      value={form.websiteUrl}
                      onChange={handleChange}
                      placeholder="https://yourpractice.com"
                      required
                      autoFocus
                      className="theme-card-strong theme-text-primary w-full border rounded-lg px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="theme-text-secondary block text-xs font-semibold mb-2 uppercase tracking-wide">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@yourpractice.com"
                      required
                      className="theme-card-strong theme-text-primary w-full border rounded-lg px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    />
                  </div>

                  <div className="theme-border border-t pt-5">
                    <p className="theme-text-muted text-xs mb-4">
                      Optional &mdash; lets us address the reply to you and route to the right specialty.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="theme-text-secondary block text-xs font-semibold mb-2 uppercase tracking-wide">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={form.firstName}
                          onChange={handleChange}
                          placeholder="John"
                          className="theme-card-strong theme-text-primary w-full border rounded-lg px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                        />
                      </div>
                      <div>
                        <label className="theme-text-secondary block text-xs font-semibold mb-2 uppercase tracking-wide">
                          Practice Name
                        </label>
                        <input
                          type="text"
                          name="companyName"
                          value={form.companyName}
                          onChange={handleChange}
                          placeholder="Smith Family Dental"
                          className="theme-card-strong theme-text-primary w-full border rounded-lg px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="theme-text-secondary block text-xs font-semibold mb-2 uppercase tracking-wide">
                        Practice Type
                      </label>
                      <select
                        name="businessType"
                        value={form.businessType}
                        onChange={handleChange}
                        className="theme-card-strong theme-text-primary w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition appearance-none"
                      >
                        <option value="">Select one...</option>
                        <option>General Dentistry</option>
                        <option>Orthodontics</option>
                        <option>Pediatric Dentistry</option>
                        <option>Oral Surgery</option>
                        <option>Cosmetic / Implants</option>
                        <option>Periodontics</option>
                        <option>Endodontics</option>
                        <option>Other Dental</option>
                      </select>
                    </div>
                  </div>

                  {status === "error" && (
                    <p className="text-xs text-red-600 text-center">
                      Something went wrong. Try again or email alex@rebbadvisors.com directly.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="theme-cta-accent w-full font-semibold text-sm py-4 rounded-xl mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {status === "loading" ? "Sending..." : "Send my URL"}
                  </button>

                  <p className="theme-text-muted text-xs text-center">
                    That&rsquo;s the whole intake. No discovery call, no follow-up sequence.
                  </p>
                </form>
              )}
            </div>

            <div className="space-y-10">
              <div>
                <h2 className="theme-text-primary text-2xl font-bold mb-4">
                  What happens next.
                </h2>
                <ul className="space-y-4">
                  {[
                    {
                      title: "We audit the actual site",
                      body: "Pages, forms, mobile experience, the parts Google scores on. Not a generic checklist.",
                    },
                    {
                      title: "Within 48 hours, screenshots + a written proposal",
                      body: "What is broken, the fixes that move the needle, and the scope and price. Cleanup starts at $1,500. Larger rebuilds are scoped inside the proposal — month-to-month, 30-day cancel.",
                    },
                    {
                      title: "Say yes, and it ships in a week",
                      body: "Cleanup ships in five business days or less. If the site is already fine, the proposal says that and you owe nothing.",
                    },
                  ].map((item) => (
                    <li key={item.title} className="flex gap-4">
                      <div className="theme-card-accent border mt-1 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div>
                        <p className="theme-text-primary text-sm font-semibold mb-1">{item.title}</p>
                        <p className="theme-text-muted text-sm leading-relaxed">{item.body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="theme-border border-t pt-10">
                <h3 className="theme-text-muted text-xs font-semibold mb-4 uppercase tracking-widest">
                  Good Fit
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    "General Dentistry",
                    "Orthodontics",
                    "Pediatric",
                    "Oral Surgery",
                    "Cosmetic / Implants",
                    "Periodontics",
                    "Endodontics",
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="theme-card border theme-text-secondary text-xs font-medium px-3 py-1.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="theme-card-contrast border rounded-2xl p-8">
                <p className="theme-label text-xs font-semibold uppercase tracking-[0.2em] mb-4">
                  Clear Scope
                </p>
                <p className="theme-text-contrast-muted text-sm leading-relaxed mb-3">
                  Not a broad agency retainer. Not a vague digital-strategy conversation.
                </p>
                <p className="theme-text-contrast-muted text-sm leading-relaxed">
                  The proposal is the product. Identify what&rsquo;s broken, name the scope and price, ship the fix.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
