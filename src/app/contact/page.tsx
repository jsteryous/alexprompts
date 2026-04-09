"use client";

import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    businessType: "",
    phone: "",
    email: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
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
      {/* Header */}
      <section className="bg-white pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 mb-4">
            Get Started
          </span>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-black mb-5 leading-tight">
            Book a Free Call
          </h1>
          <p className="text-xl text-gray-500 max-w-xl leading-relaxed">
            30 minutes. We&apos;ll audit your current lead flow and show you exactly
            where you&apos;re losing jobs—no obligation.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="bg-white pb-24 md:pb-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            {/* Contact form */}
            <div className="bg-gray-50 rounded-2xl p-8 md:p-10">
              {status === "success" ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-black mb-2">Expect a call within 1 business day.</h2>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    We&apos;ll review your trade and service area, then walk you through what&apos;s live in the Greenville County data right now.
                  </p>
                </div>
              ) : (
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        placeholder="John"
                        required
                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        placeholder="Smith"
                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                      What type of business?
                    </label>
                    <select
                      name="businessType"
                      value={form.businessType}
                      onChange={handleChange}
                      className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition appearance-none"
                    >
                      <option value="">Select one...</option>
                      <option>Landscaping</option>
                      <option>Pool Service</option>
                      <option>Pressure Washing</option>
                      <option>HVAC</option>
                      <option>Plumbing</option>
                      <option>Electrical</option>
                      <option>Roofing</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="(555) 000-0000"
                      className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="john@smithlandscaping.com"
                      required
                      className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    />
                  </div>

                  {status === "error" && (
                    <p className="text-xs text-red-600 text-center">
                      Something went wrong. Try again or email us directly at alex@rebbadvisors.com.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full bg-black text-white font-semibold text-sm py-4 rounded-xl hover:bg-gray-800 transition-colors mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {status === "loading" ? "Sending…" : "Book My Free Call"}
                  </button>

                  <p className="text-xs text-gray-400 text-center">
                    30-day money-back guarantee — one qualified lead or full refund. No spam, no pressure.
                  </p>
                </form>
              )}
            </div>

            {/* Side content */}
            <div className="space-y-10">
              <div>
                <h2 className="text-2xl font-bold text-black mb-4">
                  What happens on the call?
                </h2>
                <ul className="space-y-4">
                  {[
                    {
                      title: "We review your lead flow",
                      body: "We look at where leads come from and where they disappear. Most businesses see 3–5 clear gaps immediately.",
                    },
                    {
                      title: "We show you the cost",
                      body: "Using your average job value, we calculate how much revenue is walking out the door each month.",
                    },
                    {
                      title: "We show you the fix",
                      body: "We walk you through exactly what a system for your business would look like—no obligations.",
                    },
                  ].map((item) => (
                    <li key={item.title} className="flex gap-4">
                      <div className="mt-1 w-5 h-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-black mb-1">{item.title}</p>
                        <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-gray-100 pt-10">
                <h3 className="text-sm font-semibold text-black mb-4 uppercase tracking-widest text-xs text-gray-400">
                  Who this is for
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Landscaping",
                    "Pool Services",
                    "Pressure Washing",
                    "HVAC",
                    "Roofing",
                    "Plumbing",
                    "Electrical",
                    "Lawn Care",
                    "Pest Control",
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
