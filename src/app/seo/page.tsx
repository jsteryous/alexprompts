import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Local SEO for Greenville SC Service Businesses — REBB Advisors",
  description:
    "Technical SEO audits, Google Business Profile optimization, and local pack rankings for Greenville County HVAC, landscaping, and trades businesses. Free audit on your first call.",
  openGraph: {
    title: "Local SEO for Greenville SC Service Businesses — REBB Advisors",
    description:
      "Technical SEO audits and GBP optimization for Greenville County trades. Free audit on your first call.",
    type: "website",
    url: "https://rebbadvisors.com/seo",
  },
  alternates: { canonical: "https://rebbadvisors.com/seo" },
};

export default function SeoPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-white pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 mb-4">
            Local SEO
          </span>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-black mb-5 leading-tight">
            When they do search,
            <br />
            you need to win.
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
            Proactive outreach finds leads before they search. SEO wins them
            when they do. Both matter. Most local service businesses are
            invisible in both places.
          </p>
        </div>
      </section>

      {/* The honest take */}
      <section className="bg-gray-950 text-white py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-500 mb-4">
              The Honest Take
            </span>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-5">
              SEO is reactive by nature.
              <br />
              But it still has to work.
            </h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              We don&apos;t lead with SEO because it puts you in competition with
              everyone else the moment a prospect searches. By then you&apos;ve
              already lost the first-mover advantage.
            </p>
            <p className="text-gray-400 leading-relaxed">
              But SEO is still infrastructure. Referrals Google you. Past
              customers come back through search. Warm LLC Owner Finder prospects
              verify you before they call back. If your local presence is broken,
              every other channel leaks.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-white/10 rounded-2xl overflow-hidden">
            {[
              {
                label: "Your Google Business Profile",
                problem: "Unclaimed, incomplete, or buried under competitors in the local 3-pack.",
                cost: "You're losing calls every week to businesses with worse reviews but better profiles.",
              },
              {
                label: "Your Site's Technical Health",
                problem: "Slow load times, broken mobile layout, missing schema markup, duplicate pages.",
                cost: "Google deprioritizes your site even when your content is better than competitors'.",
              },
              {
                label: "Your Local Citations",
                problem: "Inconsistent NAP (name, address, phone) across directories erodes Google's confidence.",
                cost: "The map pack algorithm treats consistency as a trust signal — you can't rank without it.",
              },
            ].map((item) => (
              <div key={item.label} className="bg-gray-950 p-8 md:p-10">
                <div className="text-xs font-semibold uppercase tracking-widest text-green-500 mb-4">{item.label}</div>
                <div className="text-sm font-semibold text-white mb-3">{item.problem}</div>
                <p className="text-sm text-gray-400 leading-relaxed">{item.cost}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The audit */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 mb-4">
                The Audit
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-black leading-tight mb-5">
                We tell you exactly what&apos;s broken
                <br />
                and what it&apos;s costing you.
              </h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                No 40-page PDF full of buzzwords. A focused report: here are the
                five things holding your local rankings down, here&apos;s how to fix
                each one, here&apos;s what moves the needle most.
              </p>
              <p className="text-gray-500 leading-relaxed mb-8">
                We run every client through the audit before we touch anything.
                If your local presence is already strong, we tell you that too.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-black text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-gray-800 transition-colors"
              >
                Request an Audit
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            <div className="space-y-4">
              {[
                {
                  step: "01",
                  title: "Google Business Profile review",
                  body: "Completeness score, photo quality, review velocity, Q&A, category accuracy, and map pack position vs. top three competitors.",
                },
                {
                  step: "02",
                  title: "Technical site audit",
                  body: "Core Web Vitals, mobile usability, crawl errors, page speed, schema markup, internal linking, and indexation gaps.",
                },
                {
                  step: "03",
                  title: "Citation consistency check",
                  body: "NAP audit across 40+ directories including Yelp, Angi, HomeAdvisor, BBB, and local Greenville-specific sources.",
                },
                {
                  step: "04",
                  title: "Local keyword gap analysis",
                  body: "Which high-intent local searches you&apos;re invisible for — and which competitors are winning them.",
                },
                {
                  step: "05",
                  title: "Prioritized fix list",
                  body: "Ranked by impact. We focus on what moves the needle first, not what fills a report.",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-5 p-6 border border-gray-100 rounded-2xl hover:border-gray-200 transition-colors">
                  <div className="text-xs font-semibold text-gray-300 pt-0.5 w-6 flex-shrink-0">{item.step}</div>
                  <div>
                    <div className="text-sm font-semibold text-black mb-1">{item.title}</div>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GBP deep dive */}
      <section className="bg-gray-50 py-20 md:py-28 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-14">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 mb-4">
              Google Business Profile
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-black leading-tight">
              The highest-ROI single fix
              <br />
              for most local service businesses.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <p className="text-gray-500 leading-relaxed">
                For trades businesses in Greenville County, a fully optimized
                GBP profile typically outperforms a $1,500/month Google Ads
                spend. The map pack shows at the top of search results. It&apos;s
                free real estate — most businesses have never claimed it properly.
              </p>
              <p className="text-gray-500 leading-relaxed">
                We optimize the profile, build a review generation system (no
                fake reviews — a process that actually gets real customers to
                leave them), and monitor for ranking shifts week over week.
              </p>
            </div>
            <div className="space-y-3">
              {[
                "Profile claimed and verified",
                "All 150+ attributes completed for your category",
                "Service area configured precisely",
                "Photo strategy — before/after, team, job sites",
                "Review generation process installed",
                "Response templates for reviews (positive + negative)",
                "Google Posts cadence set up",
                "Monthly ranking position tracking",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What we don't do */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 mb-4">
              What We Don&apos;t Do
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-black mb-5 leading-tight">
              No content farms. No link schemes. No monthly SEO retainers with vague deliverables.
            </h2>
            <p className="text-gray-500 leading-relaxed mb-4">
              We don&apos;t publish 500-word blog posts about &ldquo;The Top 10 Reasons to Hire
              a Landscaper.&rdquo; We don&apos;t sell you a link package. We don&apos;t lock you into
              a retainer for work that takes three months to show results and six months to explain.
            </p>
            <p className="text-gray-500 leading-relaxed">
              We fix what&apos;s broken, optimize what matters, and move on. SEO is
              infrastructure — once it&apos;s right, it stays right.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-950 py-24">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              See where you stand.
            </h2>
            <p className="text-gray-400">
              Free audit on our first call. We&apos;ll show you your map pack position and top gaps.
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
