import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Lead Intelligence for Greenville SC — The Upstate Multiplier · REBB Advisors",
  description:
    "Daily Greenville County property transfers and new business filings — cross-referenced to real decision-makers. Know who to call before your competitors do. Built for Upstate SC service businesses.",
  openGraph: {
    title: "The Upstate Multiplier — Lead Intelligence for Greenville SC",
    description:
      "Daily Greenville County property and business filing data surfaced as ranked, actionable leads for local service businesses.",
    type: "website",
    url: "https://rebbadvisors.com/lead-intelligence",
  },
  alternates: { canonical: "https://rebbadvisors.com/lead-intelligence" },
};

export default function LeadIntelligencePage() {
  return (
    <>
      {/* Header */}
      <section className="bg-white pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 mb-4">
            The Upstate Multiplier
          </span>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-black mb-5 leading-tight">
            Know who to call
            <br />
            before they search.
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
            Every week, money changes hands in Greenville County. Properties sell.
            Businesses incorporate. Permits get pulled. Every one of those events
            is a warm prospect — if you move first.
          </p>
        </div>
      </section>

      {/* The core problem */}
      <section className="bg-gray-950 text-white py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-500 mb-4">
                The Window
              </span>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-5">
                There&apos;s a 48-hour gap
                <br />
                between a public filing
                <br />
                and a Google search.
              </h2>
              <p className="text-gray-400 leading-relaxed mb-6">
                When a commercial property changes hands, the new owner spends the
                first week making decisions — vendors, contractors, service
                providers. They haven&apos;t put out a bid yet. They haven&apos;t
                posted on Angi. They&apos;re still in their own head.
              </p>
              <p className="text-gray-400 leading-relaxed">
                That window is exactly when you want to call. Not after they&apos;ve
                talked to five competitors. Not after they&apos;ve posted an RFP.
                Right now, while you&apos;re still the only voice in the room.
              </p>
            </div>
            <div className="space-y-4">
              {[
                {
                  label: "Day 0",
                  event: "Property transfer recorded at Register of Deeds",
                  status: "You know. Competitors don't.",
                  hot: true,
                },
                {
                  label: "Day 2–3",
                  event: "New owner starts calling vendors",
                  status: "You're already in conversation.",
                  hot: true,
                },
                {
                  label: "Day 7–14",
                  event: "Owner Googles \"commercial HVAC Greenville\"",
                  status: "10 competitors. Bidding war.",
                  hot: false,
                },
                {
                  label: "Day 21+",
                  event: "RFP posted to bid boards",
                  status: "Race to the bottom on price.",
                  hot: false,
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className={`border rounded-xl p-5 ${
                    row.hot ? "border-green-500/30 bg-green-500/5" : "border-white/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div
                        className={`text-xs font-bold uppercase tracking-widest mb-1 ${
                          row.hot ? "text-green-400" : "text-gray-500"
                        }`}
                      >
                        {row.label}
                      </div>
                      <div className="text-sm font-semibold text-white mb-1">{row.event}</div>
                      <div className={`text-xs ${row.hot ? "text-green-400" : "text-gray-500"}`}>
                        {row.status}
                      </div>
                    </div>
                    {row.hot && (
                      <span className="flex-shrink-0 text-xs font-bold bg-green-500/20 text-green-400 px-2.5 py-1 rounded-full">
                        ACT NOW
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The three data sources */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-14">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 mb-4">
              The Data Sources
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-black leading-tight">
              Three public records feeds.
              <br />
              Monitored daily. Delivered weekly.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: "01",
                title: "Greenville County Register of Deeds",
                body: "Every commercial property transfer filed in the county. New owner, address, transaction value — recorded within 24–48 hours of closing. We filter for commercial and industrial transfers above your threshold.",
                bullets: [
                  "Owner of record + contact resolution",
                  "Property type and square footage",
                  "Transaction value (proxy for deal size)",
                ],
              },
              {
                number: "02",
                title: "SC Secretary of State Filings",
                body: "Every new LLC and corporation registered in Greenville County. A new business filing almost always means a new location, new lease, and a fresh vendor slate. The business hasn't hired anyone yet.",
                bullets: [
                  "Registered agent and principal contacts",
                  "Business category and SIC code",
                  "Filing date — recency drives score",
                ],
              },
              {
                number: "03",
                title: "Municipal Permit Database",
                body: "Industrial and commercial construction permits. A permit means a building is about to change hands, expand, or get renovated — and someone needs to do the work before the project starts.",
                bullets: [
                  "Permit type (commercial, industrial, renovation)",
                  "Valuation and scope",
                  "General contractor if listed",
                ],
              },
            ].map((src) => (
              <div key={src.number} className="border border-gray-100 rounded-2xl p-8 hover:border-gray-200 transition-colors">
                <div className="text-xs font-semibold text-gray-300 mb-4">{src.number}</div>
                <h3 className="text-lg font-bold text-black mb-3">{src.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">{src.body}</p>
                <ul className="space-y-2">
                  {src.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-xs text-gray-500">
                      <span className="mt-1 w-1 h-1 rounded-full bg-green-500 flex-shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The deliverable */}
      <section className="bg-gray-50 py-20 md:py-28 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 mb-4">
                The Deliverable
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-black leading-tight mb-5">
                Monday morning.
                <br />
                Ranked call list.
                <br />
                No dashboard required.
              </h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                You don&apos;t analyze data. You don&apos;t log into a platform. You get
                a short, scored list of the highest-value prospects from the past
                week — with a real name, a real number, and a reason to call.
              </p>
              <p className="text-gray-500 leading-relaxed mb-8">
                Each prospect is scored 0–100 by deal size, property type,
                recency, and match to your trade. The top five are the five calls
                you make Monday morning.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-black text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-gray-800 transition-colors"
              >
                Get Your First List
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Sample report card */}
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
                  {
                    priority: "4",
                    name: "Blue Ridge Facility Group LLC",
                    trigger: "New business filing · Facilities Mgmt",
                    note: "Multi-site operator. Landscaping + janitorial.",
                    score: "79",
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
                <span className="text-xs text-gray-400">5 more signals in full report →</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-14">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 mb-4">
              What You Get
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-black leading-tight">
              Everything needed to make the call. Nothing you don&apos;t.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Weekly ranked prospect list",
                body: "Top 5–10 signals from the past 7 days, scored and sorted by revenue potential for your trade.",
              },
              {
                title: "Decision-maker resolution",
                body: "We match LLC filings and deed records to a real person — name, title, and contact info where available.",
              },
              {
                title: "Signal context",
                body: "Each record includes the economic trigger — what changed, the dollar value, and why it matters for your business category.",
              },
              {
                title: "Opening line suggestion",
                body: "One sentence that makes cold calls warm. Specific to the property event, not a generic pitch script.",
              },
              {
                title: "Trade-specific filtering",
                body: "HVAC, landscaping, electrical, pool — the list is tuned to the property types and deal sizes that match your service.",
              },
              {
                title: "Delivered every Monday",
                body: "Before the work week starts. While the decision-maker is still in planning mode and hasn't talked to anyone.",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 p-6 border border-gray-100 rounded-2xl hover:border-gray-200 transition-colors">
                <div className="mt-0.5 w-5 h-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold text-black mb-1">{item.title}</div>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-950 py-24">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              See what&apos;s in the data right now.
            </h2>
            <p className="text-gray-400">
              We&apos;ll pull live GVL records on our first call and walk you through the signals.
            </p>
          </div>
          <Link
            href="/contact"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-green-500 text-black font-semibold px-7 py-3.5 rounded-xl hover:bg-green-400 transition-colors"
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
