"use client";

import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    websiteUrl: "",
    businessType: "",
    phone: "",
    email: "",
    biggestIssue: "",
    timeline: "",
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
            Free Website Screenshots
          </span>
          <h1 className="theme-text-primary text-5xl md:text-6xl font-bold tracking-tight mb-5 leading-tight">
            Send your website.
            <br />
            We&apos;ll show you what is broken.
          </h1>
          <p className="theme-text-muted text-xl max-w-2xl leading-relaxed">
            If your practice site is a fit for the cleanup offer, we&apos;ll send back the issues worth fixing and move forward on the $1,200, 48-hour website cleanup.
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
                  <h2 className="theme-text-primary text-xl font-bold mb-2">Expect a reply within 1 business day.</h2>
                  <p className="theme-text-muted text-sm leading-relaxed">
                    We&apos;ll review the site, then send back the issues worth fixing and whether the cleanup offer is the right fit.
                  </p>
                </div>
              ) : (
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="grid sm:grid-cols-2 gap-4">
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
                        required
                        className="theme-card-strong theme-text-primary w-full border rounded-lg px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="theme-text-secondary block text-xs font-semibold mb-2 uppercase tracking-wide">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        placeholder="Smith"
                        className="theme-card-strong theme-text-primary w-full border rounded-lg px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="theme-text-secondary block text-xs font-semibold mb-2 uppercase tracking-wide">
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={form.companyName}
                      onChange={handleChange}
                      placeholder="Smith Family Dental"
                      required
                      className="theme-card-strong theme-text-primary w-full border rounded-lg px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="theme-text-secondary block text-xs font-semibold mb-2 uppercase tracking-wide">
                      Website URL
                    </label>
                    <input
                      type="url"
                      name="websiteUrl"
                      value={form.websiteUrl}
                      onChange={handleChange}
                      placeholder="https://example.com"
                      required
                      className="theme-card-strong theme-text-primary w-full border rounded-lg px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="theme-text-secondary block text-xs font-semibold mb-2 uppercase tracking-wide">
                        Practice Type
                      </label>
                      <select
                        name="businessType"
                        value={form.businessType}
                        onChange={handleChange}
                        required
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
                    <div>
                      <label className="theme-text-secondary block text-xs font-semibold mb-2 uppercase tracking-wide">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="(555) 000-0000"
                        className="theme-card-strong theme-text-primary w-full border rounded-lg px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      />
                    </div>
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
                      placeholder="john@example.com"
                      required
                      className="theme-card-strong theme-text-primary w-full border rounded-lg px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="theme-text-secondary block text-xs font-semibold mb-2 uppercase tracking-wide">
                      Biggest Issue
                    </label>
                    <textarea
                      name="biggestIssue"
                      value={form.biggestIssue}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Booking form does not work, bad mobile experience, site looks outdated, or whatever you already suspect."
                      className="theme-card-strong theme-text-primary w-full border rounded-lg px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-y"
                    />
                  </div>

                  <div>
                    <label className="theme-text-secondary block text-xs font-semibold mb-2 uppercase tracking-wide">
                      Timeline
                    </label>
                    <select
                      name="timeline"
                      value={form.timeline}
                      onChange={handleChange}
                      className="theme-card-strong theme-text-primary w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition appearance-none"
                    >
                      <option value="">Select one...</option>
                      <option>This week</option>
                      <option>This month</option>
                      <option>Just exploring</option>
                    </select>
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
                    {status === "loading" ? "Sending..." : "Send My Website"}
                  </button>

                  <p className="theme-text-muted text-xs text-center">
                    Best fit is a dental practice with a site that is clearly leaking new-patient calls.
                  </p>
                </form>
              )}
            </div>

            <div className="space-y-10">
              <div>
                <h2 className="theme-text-primary text-2xl font-bold mb-4">
                  What happens next?
                </h2>
                <ul className="space-y-4">
                  {[
                    {
                      title: "We review the actual site",
                      body: "Not a generic sales call. We look at the pages, the forms, the mobile experience, and the obvious trust issues.",
                    },
                    {
                      title: "We send screenshots of the problems",
                      body: "You get clear proof of what is broken so you are not buying blind.",
                    },
                    {
                      title: "We decide whether the $1,200 cleanup fits",
                      body: "If it is a cleanup job, we move fast. If it really needs a rebuild, we say that directly.",
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
                  This is not a broad agency retainer and not a vague digital strategy conversation.
                </p>
                <p className="theme-text-contrast-muted text-sm leading-relaxed">
                  The offer is simple: identify what is broken, decide if the quick cleanup fits, then fix it fast.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
