import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How It Works — The Multiplier · REBB Advisors",
  description:
    "We watch Greenville County public records every day, unmask the LLC, and put a ranked call list in your dashboard every Monday. One real lead in 30 days or full refund.",
  openGraph: {
    title: "How It Works — The Multiplier · REBB Advisors",
    description:
      "Daily property and business filing data turned into a ranked call list. One new lead in 30 days or full refund.",
    type: "website",
    url: "https://rebbadvisors.com/how-it-works",
  },
  alternates: { canonical: "https://rebbadvisors.com/how-it-works" },
};

const steps = [
  {
    step: "01",
    title: "We talk for 30 minutes",
    duration: "Day 1",
    body: "We go over your trade, your service area, and what a good job looks like for you. We use that to filter the data so your call list only shows the property types and deal sizes that actually matter to your business.",
    details: [
      "Tell us your trade and ideal job size",
      "We configure filters for your market",
      "Dashboard access sent same day",
    ],
  },
  {
    step: "02",
    title: "Your dashboard goes live",
    duration: "Days 1–2",
    body: "You get a login to your private dashboard showing live Greenville County data — property transfers, new business filings, and mortgages — already filtered and scored for your trade. You can see what happened this week before your first call list drops.",
    details: [
      "Private login — your data, your view",
      "Greenville County records, updated daily",
      "Scored and ranked by revenue potential",
    ],
  },
  {
    step: "03",
    title: "The Multiplier starts running",
    duration: "Days 3–7",
    body: "We run the first full data pull. Property transfers get cross-referenced with tax records, state filings, and public data to surface the actual decision-maker behind each LLC. Your first ranked call list lands Monday morning.",
    details: [
      "First call list delivered within the week",
      "Real names, real contact info, real reasons to call",
      "HOT signals trigger same-day alerts by email",
    ],
  },
  {
    step: "04",
    title: "Monday mornings: you know who to call",
    duration: "Every week",
    body: "Every Monday you get a short, ranked list. Each entry: who the person is, what changed, why it matters for your trade, and how to reach them. You don't analyze anything. You just make the calls.",
    details: [
      "Scored 0–100 by deal size, recency, and trade match",
      "Name, phone, email — or we flag it as manual review",
      "Opening line included — not a generic script",
    ],
  },
  {
    step: "05",
    title: "The guarantee",
    duration: "Within 30 days",
    body: "One real lead you wouldn't have found otherwise. A property that just changed hands, a business that just started up, someone who hasn't talked to a single contractor yet. If we don't deliver it within 30 days, you get a full refund.",
    details: [
      "Full refund if no new lead surfaced in 30 days",
      "No questions. No case to make.",
      "Keep going if it works — no long-term contract required",
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-white pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 mb-4">
            The Process
          </span>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-black mb-5 leading-tight">
            How It Works
          </h1>
          <p className="text-xl text-gray-500 max-w-xl leading-relaxed">
            From a 30-minute call to a ranked list of people you can call this
            week — before they&apos;ve talked to anyone.
          </p>
        </div>
      </section>

      {/* How The Multiplier Works */}
      <section className="bg-gray-50 py-20 md:py-28 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 mb-4">
            The Multiplier
          </span>
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-5 leading-tight">
                We watch three public data sources. Every day.
              </h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                When money changes hands or a business formally starts, it creates
                a paper trail in public records before anyone ever Googles a
                contractor. That&apos;s the window. We live in it.
              </p>
              <div className="space-y-5">
                {[
                  {
                    label: "Greenville County Register of Deeds",
                    body: "Every commercial property transfer filed in the county. New owner, new address, transaction value — recorded within 24–48 hours of closing.",
                  },
                  {
                    label: "SC Secretary of State Filings",
                    body: "Every new LLC and corporation registered in Greenville County. A new business filing almost always means a new location, new lease, and a fresh vendor slate.",
                  },
                  {
                    label: "Municipal Permit Database",
                    body: "Industrial and commercial construction permits. A permit means a building is about to change — and someone needs to do the work.",
                  },
                ].map((src) => (
                  <div key={src.label} className="flex gap-4">
                    <div className="mt-1 w-5 h-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-black mb-1">{src.label}</p>
                      <p className="text-sm text-gray-500 leading-relaxed">{src.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {/* Example signal */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Example Signal</p>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm font-semibold text-black">4401 Pelham Rd — Greenville Office Park</p>
                    <p className="text-xs text-gray-400 mt-0.5">Property Transfer · 12,000 sq ft · $1.4M</p>
                  </div>
                  <span className="flex-shrink-0 text-xs font-bold bg-red-50 text-red-600 px-2.5 py-1 rounded-full">HOT</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
                  <span className="font-semibold text-black">What this means:</span> A new owner just took possession of a 12,000 sq ft commercial property. Previous vendor relationships are up for grabs. The new owner is in decision-making mode right now — before they&apos;ve talked to anyone.
                </p>
              </div>

              {/* The call */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">The Play for a GC</p>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">
                  We find the actual person behind the LLC. You call them this week — not after they post a bid, not after they&apos;ve talked to five other contractors.
                </p>
                <div className="bg-gray-950 rounded-xl p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Opening line</p>
                  <p className="text-sm text-gray-200 leading-relaxed italic">
                    &ldquo;I saw the transfer on 4401 Pelham — congratulations. I specialize in commercial buildouts in Greenville County. Are you planning any tenant improvements on that space?&rdquo;
                  </p>
                </div>
              </div>

              {/* Comparison */}
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className="grid grid-cols-2 divide-x divide-gray-100">
                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Traditional Lead Gen</p>
                    <ul className="space-y-2 text-sm text-gray-500">
                      <li>Prospect searches, you compete</li>
                      <li>8–12 contractors get the same lead</li>
                      <li>Race to the bottom on price</li>
                      <li>Days to weeks of lag</li>
                    </ul>
                  </div>
                  <div className="p-5 bg-green-50">
                    <p className="text-xs font-semibold uppercase tracking-widest text-green-700 mb-3">The Multiplier</p>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>You call before they search</li>
                      <li>Often the only call they get</li>
                      <li>You set the price</li>
                      <li>Signal fires within 24–48 hrs</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Monday Call List */}
      <section className="bg-white py-16 md:py-20 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 mb-4">
              The Deliverable
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4 leading-tight">
              Every Monday morning: a ranked call list.
            </h2>
            <p className="text-gray-500 leading-relaxed">
              Each signal is scored 0–100 by lead quality — deal size, property type, recency,
              and match to your trade. Your dashboard shows the full list. You answer one question:{" "}
              <span className="font-semibold text-black">who do I call this week to make money?</span>
            </p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="bg-white pb-24 md:pb-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="divide-y divide-gray-100">
            {steps.map((item) => (
              <div key={item.step} className="py-12 grid md:grid-cols-12 gap-8">
                <div className="md:col-span-1">
                  <span className="text-xs font-semibold text-gray-300">{item.step}</span>
                </div>
                <div className="md:col-span-5">
                  <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                    {item.duration}
                  </div>
                  <h2 className="text-2xl font-bold text-black mb-3">{item.title}</h2>
                  <p className="text-gray-500 leading-relaxed">{item.body}</p>
                </div>
                <div className="md:col-span-5 md:col-start-8">
                  <ul className="space-y-3">
                    {item.details.map((d) => (
                      <li key={d} className="flex items-start gap-3">
                        <div className="mt-0.5 w-5 h-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-600">{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantee callout */}
      <section className="bg-gray-50 py-16 md:py-20 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 mb-4">
              The Guarantee
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4 leading-tight">
              One lead. 30 days. Or you don&apos;t pay.
            </h2>
            <p className="text-gray-500 leading-relaxed">
              We don&apos;t charge retainers or lock you into long-term contracts.
              If The Multiplier doesn&apos;t surface a lead you wouldn&apos;t have found
              on your own within 30 days, we refund everything. No case to make. No questions.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-950 py-24">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Ready to see what&apos;s in the data?
            </h2>
            <p className="text-gray-400">
              30 minutes. We&apos;ll pull live GVL records on the call and show you exactly who&apos;s out there right now.
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
