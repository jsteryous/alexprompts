import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Follow-Up Systems - Secondary Engagement - REBB Advisors",
  description:
    "Follow-up systems are a secondary REBB engagement, not the core offer. When useful, REBB may help owner-led service businesses tighten missed-call and estimate follow-up workflows.",
  openGraph: {
    title: "Follow-Up Systems - Secondary Engagement - REBB Advisors",
    description:
      "A secondary operational support engagement for owner-led service businesses that need tighter follow-up after initial contact.",
    type: "website",
    url: "https://rebbadvisors.com/outreach-automation",
  },
  alternates: { canonical: "https://rebbadvisors.com/outreach-automation" },
};

export default function OutreachAutomationPage() {
  return (
    <>
      <section className="bg-white pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
            Secondary Engagement
          </span>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-black mb-5 leading-tight">
            Follow-Up Systems
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
            REBB does not lead with outreach automation as a standalone agency
            service. In the right situations, it can be useful supporting work
            for owner-led service businesses that already have obvious follow-up
            leakage.
          </p>
        </div>
      </section>

      <section className="bg-gray-50 py-20 md:py-28 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
                Where It Fits
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-black leading-tight mb-5">
                Useful after the core operational problems are clear.
              </h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                If a company is missing calls, letting estimates go stale, or
                dropping warm inquiries, a tighter follow-up system may help. But
                REBB is not positioning itself as a broad automation shop.
              </p>
              <p className="text-gray-500 leading-relaxed">
                Most of the time, this kind of work only makes sense after the
                underlying knowledge and workflow issues are understood.
              </p>
            </div>

            <div className="space-y-4">
              {[
                "Missed-call text-back workflows",
                "Estimate follow-up sequences",
                "Simple intake and handoff improvements",
                "Operational support around an existing sales process",
              ].map((item) => (
                <div key={item} className="bg-white border border-gray-200 rounded-2xl p-5 text-sm text-gray-600">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-700 mb-4">
              Main Direction
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-black leading-tight mb-5">
              The core REBB offer is still Company Brain.
            </h2>
            <p className="text-gray-500 leading-relaxed mb-8">
              If you are trying to understand what REBB primarily does, start
              there. Follow-up systems are adjacent operational support, not the
              center of the business.
            </p>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 bg-black text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-gray-800 transition-colors"
            >
              See the Main Offer
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
