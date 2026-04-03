import Link from "next/link";

export default function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="min-h-screen flex items-center bg-white pt-16">
        <div className="max-w-6xl mx-auto px-6 py-28 md:py-36">
          <div className="max-w-3xl">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 mb-6">
              Proactive Growth for Upstate SC Service Businesses
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-black leading-[1.05] mb-6">
              The lead is gone
              <br />
              by the time
              <br />
              you Google it.
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 leading-relaxed max-w-2xl mb-10">
              Most agencies wait for someone to search. We identify the contract
              before the search happens — then make sure you win it.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-black text-white text-base font-medium px-7 py-3.5 rounded-xl hover:bg-gray-800 transition-colors"
              >
                Start Your Sprint
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center text-base font-medium text-gray-600 px-7 py-3.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:text-black transition-colors"
              >
                See How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Problem ── */}
      <section className="bg-gray-950 text-white py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-16">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-500 mb-4">
              The Problem With Every Other Agency
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              Passive. Reactive.
              <br />
              Already too late.
            </h2>
            <p className="mt-5 text-lg text-gray-400 leading-relaxed">
              Legacy agencies all run the same playbook. Each one hands your
              prospect to your competitors before you even know they exist.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-white/10 rounded-2xl overflow-hidden">
            {[
              {
                label: "The Creative Play",
                title: "Branding, logos & storytelling",
                body: "Beautiful — and useless if no one needs you yet. You can't brand your way to a $40K landscaping contract that hasn't been put out for bid.",
              },
              {
                label: "The Inbound Play",
                title: "SEO, Google Ads & social media",
                body: "By the time someone types \"Commercial HVAC Greenville\" into Google, they're already looking at 10 competitors. You've already lost the pricing war.",
              },
              {
                label: "The Platform Play",
                title: "ServiceTitan, HubSpot & CRMs",
                body: "Great for managing leads you already have. Worthless for surfacing the ones you don't know exist yet.",
              },
            ].map((item) => (
              <div key={item.label} className="bg-gray-950 p-8 md:p-10">
                <div className="text-xs font-semibold uppercase tracking-widest text-green-500 mb-4">{item.label}</div>
                <div className="text-base font-semibold text-white mb-3">{item.title}</div>
                <p className="text-sm text-gray-400 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Multiplier Callout ── */}
      <section className="bg-white py-24 md:py-32 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 mb-4">
                The Upstate Multiplier
              </span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-black leading-tight mb-5">
                Know who to call
                <br />
                before they know
                <br />
                they need you.
              </h2>
              <p className="text-lg text-gray-500 leading-relaxed">
                We programmatically sync Greenville County property transfers
                with new business filings to identify the exact moment a
                high-value contract is up for grabs — before your competitors
                even know the lead exists.
              </p>
            </div>
            <div className="bg-gray-950 rounded-2xl p-8 md:p-10">
              <div className="text-xs font-semibold uppercase tracking-widest text-green-500 mb-6">
                Weekly Intel Report
              </div>
              <div className="space-y-4">
                {[
                  {
                    type: "Property Transfer",
                    detail: "4,200 sqft commercial — new owner, no service contract",
                    tag: "High value",
                  },
                  {
                    type: "New Business Filing",
                    detail: "Landscaping company formed — needs subcontractors",
                    tag: "Partnership",
                  },
                  {
                    type: "Property Transfer",
                    detail: "Industrial warehouse — HVAC system likely outdated",
                    tag: "High value",
                  },
                ].map((row, i) => (
                  <div key={i} className="flex items-start gap-4 border-b border-white/10 pb-4 last:border-0 last:pb-0">
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">{row.type}</div>
                      <div className="text-sm text-white">{row.detail}</div>
                    </div>
                    <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2.5 py-1 rounded-full flex-shrink-0">
                      {row.tag}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-sm text-gray-400 italic">
                  &ldquo;Who do I call this week to make money?&rdquo; — answered every Monday morning.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Three Pillars ── */}
      <section className="bg-white py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-16">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 mb-4">
              What We Build
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-black leading-tight">
              Three systems.
              <br />
              One unfair advantage.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: "01",
                label: "The Foundation",
                title: "Hosting & Operations",
                body: "High-speed site built and deployed in days. 100/100 SEO scores, sub-second load times, zero downtime. Your site becomes a weapon, not a brochure.",
                items: [
                  "Vite/React — built for speed",
                  "100/100 Lighthouse performance",
                  "Managed security & uptime",
                ],
              },
              {
                number: "02",
                label: "The Multiplier",
                title: "Proprietary Market Intel",
                body: "Weekly Python-driven data syncs pull Greenville County property transfers and new business filings. You get a short list of high-value prospects — before anyone else is calling them.",
                items: [
                  "Live GVL data, weekly sync",
                  "Property transfer alerts",
                  "New business filing tracking",
                ],
              },
              {
                number: "03",
                label: "The Engine",
                title: "Automated Lead Nurturing",
                body: "Logic-based email and SMS sequences that handle every lead while you're on the job site. Instant response. Persistent follow-up. Booked jobs — without lifting a finger.",
                items: [
                  "Missed call text-back in &lt;60s",
                  "Multi-step follow-up sequences",
                  "Automated booking & scheduling",
                ],
              },
            ].map((item) => (
              <div
                key={item.number}
                className="border border-gray-100 rounded-2xl p-8 hover:border-gray-200 transition-colors"
              >
                <div className="text-5xl font-bold text-gray-100 mb-5 leading-none select-none">
                  {item.number}
                </div>
                <div className="text-xs font-semibold uppercase tracking-widest text-green-600 mb-2">
                  {item.label}
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">{item.body}</p>
                <ul className="space-y-2">
                  {item.items.map((i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <div className="mt-0.5 w-4 h-4 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                        <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span
                        className="text-xs text-gray-600 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: i }}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Offer ── */}
      <section className="bg-gray-950 text-white py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-500 mb-4">
                The Offer
              </span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5">
                30-Day Risk-Free
                <br />
                Revenue Sprint
              </h2>
              <p className="text-lg text-gray-400 leading-relaxed mb-8">
                We build your site and plug in The Multiplier — manually if
                needed. The goal is simple: get you one lead you wouldn&apos;t
                have found otherwise within 30 days. If we don&apos;t, you
                don&apos;t pay.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-green-500 text-black font-semibold px-7 py-3.5 rounded-xl hover:bg-green-400 transition-colors"
              >
                Start Your Sprint
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            <div className="space-y-4">
              {[
                {
                  title: "High-speed site, deployed in 5 days",
                  body: "Pre-optimized Vite/React template. Live before your competitor finishes their brand guidelines deck.",
                },
                {
                  title: "The Multiplier dashboard — live GVL data",
                  body: "Weekly sync of property transfers and new business filings. Short list of warm targets, every Monday.",
                },
                {
                  title: "Automated follow-up sequences",
                  body: "Instant response and logic-based follow-up for every lead that comes in. Handles itself.",
                },
                {
                  title: "30-day money-back guarantee",
                  body: "If we don't surface a lead you wouldn't have found on your own, we refund everything. No questions.",
                },
              ].map((item) => (
                <div key={item.title} className="border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white mb-1">{item.title}</div>
                      <p className="text-sm text-gray-400 leading-relaxed">{item.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-black py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
            Stop competing.
            <br />
            Start winning first.
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Book a 30-minute call. We&apos;ll show you exactly which leads are
            sitting in Greenville County data right now — and how fast we can
            get them in front of you.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-green-500 text-black font-semibold text-base px-8 py-4 rounded-xl hover:bg-green-400 transition-colors"
          >
            Book a Free Call
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
