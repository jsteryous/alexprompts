"use client";

import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    businessType: "",
    teamSize: "",
    serviceArea: "",
    phone: "",
    email: "",
    mainPain: "",
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
      <section className="bg-white pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 mb-4">
            Company Brain Setup
          </span>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-black mb-5 leading-tight">
            Book a Setup Call
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
            We&apos;ll look at where company knowledge lives today, where your team
            gets stuck, and whether a Company Brain setup is a good fit for your
            business.
          </p>
        </div>
      </section>

      <section className="bg-white pb-24 md:pb-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div className="bg-gray-50 rounded-2xl p-8 md:p-10">
              {status === "success" ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-black mb-2">Expect a reply within 1 business day.</h2>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    We&apos;ll review your intake, then reach out if the fit looks
                    right for a Company Brain setup conversation.
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
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={form.companyName}
                      onChange={handleChange}
                      placeholder="Smith Mechanical"
                      required
                      className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                        Business Type
                      </label>
                      <select
                        name="businessType"
                        value={form.businessType}
                        onChange={handleChange}
                        required
                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition appearance-none"
                      >
                        <option value="">Select one...</option>
                        <option>HVAC</option>
                        <option>Plumbing</option>
                        <option>Electrical</option>
                        <option>Roofing</option>
                        <option>General Contractor</option>
                        <option>Remodeling</option>
                        <option>Landscaping</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                        Team Size
                      </label>
                      <select
                        name="teamSize"
                        value={form.teamSize}
                        onChange={handleChange}
                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-black focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition appearance-none"
                      >
                        <option value="">Select one...</option>
                        <option>1-4</option>
                        <option>5-10</option>
                        <option>11-25</option>
                        <option>26-50</option>
                        <option>50+</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                      Service Area
                    </label>
                    <input
                      type="text"
                      name="serviceArea"
                      value={form.serviceArea}
                      onChange={handleChange}
                      placeholder="Greenville, Spartanburg, Anderson"
                      className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
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
                        placeholder="john@smithmechanical.com"
                        required
                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                      Main Pain Point
                    </label>
                    <textarea
                      name="mainPain"
                      value={form.mainPain}
                      onChange={handleChange}
                      rows={4}
                      placeholder="What questions keep bouncing back to you or your office? What knowledge is hardest to find fast?"
                      className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-y"
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
                    {status === "loading" ? "Sending..." : "Book My Setup Call"}
                  </button>

                  <p className="text-xs text-gray-400 text-center">
                    Best fit is usually owner-led service businesses with 5-25 people and too much company knowledge trapped in too many places.
                  </p>
                </form>
              )}
            </div>

            <div className="space-y-10">
              <div>
                <h2 className="text-2xl font-bold text-black mb-4">
                  What happens on the call?
                </h2>
                <ul className="space-y-4">
                  {[
                    {
                      title: "We map where answers live now",
                      body: "Email, drives, SOPs, notes, estimates, and tribal knowledge. We want to understand the current mess before suggesting a system.",
                    },
                    {
                      title: "We identify the repeat questions",
                      body: "The best setups start with the questions your PMs, office staff, and field team already keep asking every week.",
                    },
                    {
                      title: "We decide if the fit is real",
                      body: "If a Company Brain setup makes sense, we outline the first version. If it does not, we will say that directly.",
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
                  Strongest Fit
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    "HVAC",
                    "Plumbing",
                    "Electrical",
                    "Roofing",
                    "General Contractors",
                    "Remodelers",
                    "Commercial Subs",
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

              <div className="bg-gray-950 rounded-2xl p-8 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-500 mb-4">
                  What We Are Not Selling
                </p>
                <p className="text-sm text-gray-300 leading-relaxed mb-3">
                  This is not generic AI consulting, a chatbot widget, or a broad
                  marketing audit.
                </p>
                <p className="text-sm text-gray-400 leading-relaxed">
                  The offer is a private Company Brain setup for businesses where
                  operational knowledge already exists but is too hard for the
                  team to retrieve quickly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
