import Link from "next/link";
import LiveSignalFeed from "@/components/LiveSignalFeed";

export default function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="min-h-screen flex items-center bg-white pt-16">
        <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left: Copy */}
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 mb-6">
                Upstate SC · Proactive Lead Intelligence
              </span>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-black leading-[1.05] mb-6">
                Your next big
                <br />
                contract just
                <br />
                changed hands.
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed mb-4">
                Most agencies wait for your customers to search. We don&apos;t.
              </p>
              <p className="text-lg text-gray-500 leading-relaxed mb-10">
                We programmatically sync Greenville County property transfers
                and new business filings to identify your next high-value
                contract before your competitors even know it exists.
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

            {/* Right: Live Signal Feed */}
            <LiveSignalFeed />
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
              Every agency playbook hands your prospects to competitors before
              you even know they exist.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-white/10 rounded-2xl overflow-hidden">
            {[
              {
                label: "The Creative Play",
                title: "Branding, logos & storytelling",
                body: "Beautiful — and useless if no one needs you yet. You can't brand your way to a $40K contract that hasn't been put out for bid.",
              },
              {
                label: "The Inbound Play",
                title: "SEO, Google Ads & social",
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

      {/* ── How We Do It (Three Pillars) ── */}
      <section className="bg-white py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-16">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 mb-4">
              How We Do It
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-black leading-tight">
              Three systems.
              <br />
              One unfair advantage.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* The Signal */}
            <div className="border border-gray-100 rounded-2xl p-8 hover:border-gray-200 transition-colors">
              {/* Icon */}
              <div className="w-12 h-12 bg-gray-950 rounded-xl flex items-center justify-center mb-6">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="2" fill="#22c55e" />
                  <path d="M12 12 m-5 0 a5 5 0 1 1 10 0 a5 5 0 1 1 -10 0" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3 2" fill="none" opacity="0.6" />
                  <path d="M12 12 m-9 0 a9 9 0 1 1 18 0 a9 9 0 1 1 -18 0" stroke="#22c55e" strokeWidth="1" strokeDasharray="3 3" fill="none" opacity="0.3" />
                  <path d="M12 2v2M12 20v2M2 12h2M20 12h2" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
                </svg>
              </div>
              <div className="text-xs font-semibold uppercase tracking-widest text-green-600 mb-2">01 · The Signal</div>
              <h3 className="text-xl font-bold text-black mb-3">Municipal Data Monitoring</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                Our Python-driven engine monitors municipal data daily to flag
                economic triggers — new leases, property sales, industrial
                permits — the moment they hit public record.
              </p>
              <ul className="space-y-2 text-xs text-gray-500">
                <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-green-500" />Property transfer filings</li>
                <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-green-500" />New business registrations</li>
                <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-green-500" />Industrial & commercial permits</li>
              </ul>
            </div>

            {/* The Resolution */}
            <div className="border border-gray-100 rounded-2xl p-8 hover:border-gray-200 transition-colors">
              {/* Icon */}
              <div className="w-12 h-12 bg-gray-950 rounded-xl flex items-center justify-center mb-6">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <circle cx="10" cy="8" r="3" stroke="#22c55e" strokeWidth="1.5" />
                  <path d="M4 20c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M18 10l1.5 1.5L22 9" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="19" cy="10" r="3.5" stroke="#22c55e" strokeWidth="1" opacity="0.4" />
                </svg>
              </div>
              <div className="text-xs font-semibold uppercase tracking-widest text-green-600 mb-2">02 · The Resolution</div>
              <h3 className="text-xl font-bold text-black mb-3">Decision-Maker Identification</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                We match fragmented public records to find the specific
                decision-maker — not just a generic LLC name. You get a real
                person, not a dead end.
              </p>
              <ul className="space-y-2 text-xs text-gray-500">
                <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-green-500" />Cross-referenced owner data</li>
                <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-green-500" />Contact enrichment</li>
                <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-green-500" />Weekly call list, ready to dial</li>
              </ul>
            </div>

            {/* The Infrastructure */}
            <div className="border border-gray-100 rounded-2xl p-8 hover:border-gray-200 transition-colors">
              {/* Icon */}
              <div className="w-12 h-12 bg-gray-950 rounded-xl flex items-center justify-center mb-6">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path d="M13 3L4 14h7v7l9-11h-7z" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M19 3h2M21 5v2" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
                  <path d="M3 5h1M3 8h1" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
                </svg>
              </div>
              <div className="text-xs font-semibold uppercase tracking-widest text-green-600 mb-2">03 · The Infrastructure</div>
              <h3 className="text-xl font-bold text-black mb-3">Lightning-Fast Capture Systems</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                We deploy lightning-fast React systems that capture and warm up
                those leads on autopilot — while you&apos;re still on the job
                site.
              </p>
              <ul className="space-y-2 text-xs text-gray-500">
                <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-green-500" />100/100 site performance</li>
                <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-green-500" />Automated SMS & email sequences</li>
                <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-green-500" />Instant lead response, zero manual work</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Multiplier Deep Dive ── */}
      <section className="bg-gray-50 py-24 md:py-32 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 mb-4">
                The Upstate Multiplier
              </span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-black leading-tight mb-5">
                &ldquo;Who do I call
                <br />
                this week to
                <br />
                make money?&rdquo;
              </h2>
              <p className="text-lg text-gray-500 leading-relaxed mb-6">
                Answered every Monday morning. We pull Greenville County
                property transfers and cross-reference them with new business
                filings — then match them to decision-makers with real contact
                info.
              </p>
              <p className="text-base text-gray-500 leading-relaxed">
                You get a short, prioritized list of warm prospects. Not a
                lead form submission. Not a cold scraped database. Real
                economic events that just happened in your service area.
              </p>
            </div>

            {/* Dashboard mockup */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-black">Weekly Intelligence Report</div>
                  <div className="text-xs text-gray-400 mt-0.5">Greenville County · Week of Apr 7, 2026</div>
                </div>
                <span className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full">
                  9 signals
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {[
                  {
                    priority: "1",
                    name: "Marcus T., Verdmont Properties",
                    trigger: "Commercial transfer · 7842 Augusta Rd",
                    note: "No HVAC contract on file. 4,200 sqft.",
                    score: "98",
                  },
                  {
                    priority: "2",
                    name: "Sarah K., Greenville Logistics LLC",
                    trigger: "New business filing · Industrial",
                    note: "Warehouse operator. Electrical + HVAC needs.",
                    score: "91",
                  },
                  {
                    priority: "3",
                    name: "Owner of record, 1204 Laurens Rd",
                    trigger: "Industrial permit · Phase 2 renovation",
                    note: "$280K scope. Subcontractors needed.",
                    score: "84",
                  },
                ].map((row) => (
                  <div key={row.priority} className="px-6 py-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-green-700">#{row.priority}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-black mb-0.5">{row.name}</div>
                        <div className="text-xs text-green-700 mb-1">{row.trigger}</div>
                        <div className="text-xs text-gray-500">{row.note}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-bold text-black">{row.score}</div>
                        <div className="text-xs text-gray-400">score</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                <span className="text-xs text-gray-400">6 more signals in full report →</span>
              </div>
            </div>
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
                We build your site and plug in The Multiplier — manually at
                first if needed. The goal: one lead you wouldn&apos;t have
                found otherwise within 30 days. If we don&apos;t deliver it,
                you don&apos;t pay.
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
                  body: "Pre-optimized React build. 100/100 Lighthouse. Live before your competitor finishes their brand guidelines deck.",
                },
                {
                  title: "The Multiplier dashboard — live GVL data",
                  body: "Weekly sync of property transfers, business filings, and permits. Short list of warm targets, every Monday.",
                },
                {
                  title: "Automated lead capture & follow-up",
                  body: "Instant response and logic-based follow-up for every inbound lead. Handles itself while you're on the job.",
                },
                {
                  title: "30-day money-back guarantee",
                  body: "One real lead you wouldn't have found otherwise. Or full refund. No case to make.",
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
            Book a 30-minute call. We&apos;ll pull live Greenville County data
            on the call and show you exactly what&apos;s sitting there right now.
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
