import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Website Cleanup - Secondary Engagement - REBB Advisors",
  description:
    "Website work is a secondary REBB engagement. When useful, REBB may help owner-led service businesses clean up slow, credibility-hurting sites that undermine the main operational offer.",
  openGraph: {
    title: "Website Cleanup - Secondary Engagement - REBB Advisors",
    description:
      "Supporting website cleanup for owner-led service businesses, not REBB's primary offer.",
    type: "website",
    url: "https://rebbadvisors.com/web-development",
  },
  alternates: { canonical: "https://rebbadvisors.com/web-development" },
};

export default function WebDevelopmentPage() {
  return (
    <>
      <section className="bg-white pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
            Secondary Engagement
          </span>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-black mb-5 leading-tight">
            Website Cleanup
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
            REBB is not positioning itself as a general web shop. Sometimes a
            service business still needs a slow, credibility-hurting website
            cleaned up so the rest of the business is not undermined online.
          </p>
        </div>
      </section>

      <section className="bg-gray-50 py-20 md:py-28 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
                Where It Helps
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-black leading-tight mb-5">
                Only when the site is clearly hurting trust.
              </h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                If prospects look up the business and see a broken, outdated, or
                slow site, that can absolutely damage conversion. But REBB does
                not want to lead with custom website work as the center of the
                brand.
              </p>
              <p className="text-gray-500 leading-relaxed">
                In the right case, website cleanup is a support engagement that
                helps the main operational work land better.
              </p>
            </div>

            <div className="space-y-4">
              {[
                "Speed and mobile cleanup",
                "Simple credibility improvements",
                "Clearer conversion paths and contact flow",
                "Basic modernization instead of open-ended web projects",
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
              Company Brain remains the main offer.
            </h2>
            <p className="text-gray-500 leading-relaxed mb-8">
              If you are trying to understand REBB, start with the Company Brain
              setup. Website work only matters here when it supports the larger
              operational goal.
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
