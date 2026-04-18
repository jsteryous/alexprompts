import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Case Study — REBB Advisors",
  description: "How we helped a local service business stop losing leads and increase booked jobs.",
  robots: { index: false, follow: false },
};

export default function CaseStudyPage() {
  return (
    <>
      {/* Header */}
      <section className="theme-page theme-border pt-32 pb-16 md:pt-40 md:pb-20 border-b">
        <div className="max-w-6xl mx-auto px-6">
          <span className="theme-label inline-block text-xs font-semibold uppercase tracking-widest mb-4">
            Case Study
          </span>
          <h1 className="theme-text-primary text-5xl md:text-6xl font-bold tracking-tight mb-5 leading-tight">
            Coming Soon
          </h1>
          <p className="theme-text-muted text-xl max-w-xl leading-relaxed">
            We&apos;re documenting results from our current clients. Check back
            shortly for a detailed breakdown of lead volume, response times, and
            booked jobs.
          </p>
        </div>
      </section>

      {/* Placeholder metrics */}
      <section className="theme-section-muted theme-border border-y py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              { metric: "—", label: "Increase in booked jobs" },
              { metric: "—", label: "Average response time" },
              { metric: "—", label: "Leads recovered per month" },
            ].map((item) => (
              <div key={item.label} className="theme-card border rounded-2xl p-8">
                <div className="theme-text-primary text-4xl font-bold mb-2">{item.metric}</div>
                <div className="theme-text-muted text-sm">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="theme-card border rounded-2xl p-8 md:p-12 max-w-2xl">
            <p className="theme-text-muted text-sm uppercase tracking-widest font-semibold mb-4">
              What to expect
            </p>
            <p className="theme-text-secondary leading-relaxed mb-4">
              Every case study will include a full breakdown of the business
              situation before we came in, exactly what we installed, and the
              measurable results over 30, 60, and 90 days.
            </p>
            <p className="theme-text-muted leading-relaxed text-sm">
              No vague claims. No cherry-picked screenshots. Real numbers from
              real local service businesses.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="theme-section-contrast py-24">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h2 className="theme-text-primary text-3xl md:text-4xl font-bold mb-2">
              Want to be our next case study?
            </h2>
            <p className="theme-text-contrast-muted">
              We&apos;re onboarding a small cohort of local service businesses now.
            </p>
          </div>
          <Link
            href="/contact"
            className="theme-cta-accent flex-shrink-0 inline-flex items-center gap-2 font-semibold px-7 py-3.5 rounded-xl"
          >
            Apply Now
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
