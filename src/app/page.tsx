import Link from "next/link";
import { BrokenPhoneHero } from "@/components/VisualMocks";
import {
  ArrowIcon,
  VisualProofSection,
  ProcessSection,
  PricingSection,
  OutcomesSection,
  FaqSection,
  FinalCtaSection,
  faqJsonLd,
} from "@/components/HomeSections";

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <section className="theme-page pt-24 md:pt-32">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="grid gap-16 lg:grid-cols-[1.05fr,0.95fr] items-center">
            <div>
              <span className="theme-label inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-5">
                Website Cleanup for Dental Practices
              </span>
              <h1 className="theme-text-primary text-5xl md:text-6xl font-bold tracking-tight leading-[1.02] mb-6">
                Your dental site is quietly
                <br />
                costing you new patients.
              </h1>
              <p className="theme-text-secondary text-lg leading-relaxed mb-4 max-w-2xl">
                Booking forms that 404. Layouts that crumble on phones. A copyright year still stuck in 2019. Patients close the tab and call the practice down the street &mdash; they do not call you to tell you why.
              </p>
              <p className="theme-text-muted text-base leading-relaxed mb-10 max-w-2xl">
                Send us the URL. We reply with screenshots of what is broken. No sales call, no pitch deck.
              </p>
              <Link
                href="/contact"
                className="theme-cta-accent inline-flex items-center justify-center gap-2 text-base font-semibold px-7 py-3.5 rounded-xl"
              >
                Show Me What&apos;s Broken
                <ArrowIcon />
              </Link>
              <p className="theme-text-muted text-xs mt-5">
                Free audit. Flat-fee cleanup if it is a fit. If the site needs a full visual refresh instead, we say so.
              </p>
            </div>

            <div className="flex justify-center lg:justify-end">
              <BrokenPhoneHero />
            </div>
          </div>
        </div>
      </section>

      <VisualProofSection />
      <ProcessSection />
      <PricingSection />
      <OutcomesSection />
      <FaqSection />
      <FinalCtaSection />
    </>
  );
}
