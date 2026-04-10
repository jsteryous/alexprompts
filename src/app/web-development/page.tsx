import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Web Development for Greenville SC Service Businesses — REBB Advisors",
  description:
    "High-speed React and Next.js sites for Greenville County HVAC, landscaping, and trades businesses. 100/100 Lighthouse. Live in 5 days. Built to convert, not just look good.",
  openGraph: {
    title: "Web Development for Greenville SC Service Businesses — REBB Advisors",
    description:
      "High-speed React sites for Upstate SC trades. 100/100 Lighthouse. Live in 5 days.",
    type: "website",
    url: "https://rebbadvisors.com/web-development",
  },
  alternates: { canonical: "https://rebbadvisors.com/web-development" },
};

export default function WebDevelopmentPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-white pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 mb-4">
            Web Development
          </span>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-black mb-5 leading-tight">
            A site that works
            <br />
            as hard as you do.
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
            Most trades business websites are slow, look cheap, and lose
            leads. We build fast, conversion-focused React sites that make your
            business look like what it is — and capture every lead that lands on
            them.
          </p>
        </div>
      </section>

      {/* The problem with most contractor sites */}
      <section className="bg-gray-950 text-white py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-500 mb-4">
              The Problem
            </span>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-5">
              Your website is probably
              <br />
              losing you contracts.
            </h2>
            <p className="text-gray-400 leading-relaxed">
              A prospect calls you off an LLC Owner Finder lead. First thing they do is
              Google you. If your site takes four seconds to load, looks like it
              was built in 2014, or sends them to a contact form with no response
              for 24 hours — you lost the deal you already had.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-white/10 rounded-2xl overflow-hidden">
            {[
              {
                label: "Speed",
                stat: "53%",
                body: "of mobile users abandon a site that takes more than 3 seconds to load. Your slow site is pre-qualifying leads out of your funnel before they see your phone number.",
              },
              {
                label: "First Impression",
                stat: "0.05s",
                body: "is how long it takes a visitor to form an opinion about your site. If it looks dated or crowded, they close it. They don't call. They go to your competitor.",
              },
              {
                label: "Lead Capture",
                stat: "24hrs",
                body: "average response time on most contractor contact forms. Leads go cold in hours. By the time you call back, they've already hired someone else.",
              },
            ].map((item) => (
              <div key={item.label} className="bg-gray-950 p-8 md:p-10">
                <div className="text-xs font-semibold uppercase tracking-widest text-green-500 mb-3">{item.label}</div>
                <div className="text-4xl font-bold text-white mb-3">{item.stat}</div>
                <p className="text-sm text-gray-400 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we build */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-14">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 mb-4">
              What We Build
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-black leading-tight">
              Fast by design.
              <br />
              Not fast for a contractor site.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "React / Next.js stack",
                body: "Built on the same framework used by Vercel, Notion, and Linear. Server-side rendering, edge caching, and instant page transitions — out of the box.",
              },
              {
                title: "100/100 Lighthouse scores",
                body: "Performance, SEO, accessibility, and best practices — all at 100. Not 80. Not 94. This isn't a stretch goal; it's the starting point.",
              },
              {
                title: "Mobile-first layout",
                body: "Over 60% of local service searches happen on mobile. We design for phone first, desktop second — not the other way around.",
              },
              {
                title: "Instant lead response",
                body: "Forms that trigger an immediate text-back. Missed calls that auto-respond within 60 seconds. No lead sits cold for 24 hours.",
              },
              {
                title: "Live in 5 days",
                body: "We work from a pre-optimized template tuned for service businesses — then customize it to your brand, trade, and market. Not months. Days.",
              },
              {
                title: "Managed hosting & deploys",
                body: "We handle the infrastructure. Zero-downtime deploys, SSL, CDN, and uptime monitoring included. You don't think about the site — it just runs.",
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

      {/* The 5-day build */}
      <section className="bg-gray-50 py-20 md:py-28 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 mb-4">
                The Build Process
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-black leading-tight mb-5">
                Live in 5 days.
                <br />
                Not 5 weeks.
              </h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                We don&apos;t start from a blank Figma file and spend three weeks
                in &ldquo;discovery.&rdquo; We start from a production-ready template built
                for service businesses, tune it to your brand and trade, and ship.
              </p>
              <p className="text-gray-500 leading-relaxed mb-8">
                We can scope the build on our first call — standalone or bundled with
                the LLC Owner Finder dashboard.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-black text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-gray-800 transition-colors"
              >
                Start the Conversation
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            <div className="space-y-0 divide-y divide-gray-100">
              {[
                {
                  day: "Day 1",
                  title: "Intake & configuration",
                  body: "Brand colors, logo, copy, photos, service list. We gather everything in one session.",
                },
                {
                  day: "Day 2–3",
                  title: "Build",
                  body: "Template customized to your trade, brand, and local market. Contact forms, lead capture, and mobile layout.",
                },
                {
                  day: "Day 4",
                  title: "Review",
                  body: "You review a staging build. One round of revisions included.",
                },
                {
                  day: "Day 5",
                  title: "Go live",
                  body: "DNS cutover, SSL cert, CDN configuration, Google Search Console connected.",
                },
                {
                  day: "Ongoing",
                  title: "Managed & monitored",
                  body: "Uptime alerts, zero-downtime deploys, and a team that answers when something breaks.",
                },
              ].map((item) => (
                <div key={item.day} className="py-5 flex gap-6">
                  <div className="text-xs font-semibold text-gray-300 w-16 flex-shrink-0 pt-0.5">{item.day}</div>
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

      {/* Tech callout */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 mb-4">
              Why It Matters
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-black mb-5 leading-tight">
              Speed isn&apos;t a feature. It&apos;s the product.
            </h2>
            <p className="text-gray-500 leading-relaxed mb-4">
              Google ranks fast sites higher in local search. Slow sites get
              penalized. A site that loads in under a second doesn&apos;t just
              convert better — it ranks better, costs less to run ads against,
              and makes your whole local presence stronger.
            </p>
            <p className="text-gray-500 leading-relaxed">
              We don&apos;t use WordPress, Wix, or Squarespace. Those platforms
              carry performance overhead that caps your Lighthouse scores in the
              70s. Our stack starts at 100 and stays there.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-950 py-24">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Ready to ship in 5 days?
            </h2>
            <p className="text-gray-400">
              Book a call. We&apos;ll scope the build and walk through the process.
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
