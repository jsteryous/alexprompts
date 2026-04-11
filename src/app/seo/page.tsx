import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Local Presence Review - Secondary Engagement - REBB Advisors",
  description:
    "Local SEO and Google Business Profile work are secondary REBB engagements. When necessary, REBB may help owner-led service businesses fix local visibility issues that support the main operational offer.",
  openGraph: {
    title: "Local Presence Review - Secondary Engagement - REBB Advisors",
    description:
      "Supporting work for owner-led service businesses that need their local web presence cleaned up, not REBB's primary offer.",
    type: "website",
    url: "https://rebbadvisors.com/seo",
  },
  alternates: { canonical: "https://rebbadvisors.com/seo" },
};

export default function SeoPage() {
  return (
    <>
      <section className="bg-white pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
            Secondary Engagement
          </span>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-black mb-5 leading-tight">
            Local Presence Review
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
            REBB is not trying to be a traditional SEO agency. Sometimes a
            service business still needs its Google Business Profile, site
            basics, or local presence cleaned up so the rest of the business does
            not leak trust.
          </p>
        </div>
      </section>

      <section className="bg-gray-50 py-20 md:py-28 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
                Honest Scope
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-black leading-tight mb-5">
                This is support work, not the headline.
              </h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                If referrals or prospects look you up and the basics are broken,
                that matters. But REBB does not want to position itself as a
                generic monthly SEO retainer business.
              </p>
              <p className="text-gray-500 leading-relaxed">
                When this work happens, it is usually because fixing trust leaks
                in search and maps supports the broader operational setup.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Google Business Profile cleanup",
                "Basic local trust and citation review",
                "Technical issues hurting credibility",
                "Lightweight visibility fixes, not content-farm SEO",
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
              Start with the main REBB offer.
            </h2>
            <p className="text-gray-500 leading-relaxed mb-8">
              If you are evaluating REBB, the core question is whether a Company
              Brain setup will reduce internal friction and make company knowledge
              easier to retrieve. Local presence work is secondary.
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
