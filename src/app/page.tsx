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
import { LeadMagnetSection } from "@/components/LeadMagnetSection";

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
                Dental Practice Websites &middot; Greenville SC
              </span>
              <h1 className="theme-text-primary text-5xl md:text-6xl font-bold tracking-tight leading-[1.02] mb-6">
                Your dental site is quietly
                <br />
                costing you new patients.
              </h1>
              <p className="theme-text-secondary text-lg leading-relaxed mb-4 max-w-2xl">
                Maybe it&rsquo;s a booking form that quietly 404s. Maybe the site loads fine but never shows up when patients Google &ldquo;dentist near me.&rdquo; Maybe it just looks like a practice from 2012. Patients close the tab and call the office down the street &mdash; they don&rsquo;t call to tell you why.
              </p>
              <p className="theme-text-muted text-base leading-relaxed mb-10 max-w-2xl">
                Send us the URL. We reply with screenshots of what is broken and a written proposal naming the tier that actually fits. No sales call, no pitch deck.
              </p>
              <Link
                href="/contact"
                className="theme-cta-accent inline-flex items-center justify-center gap-2 text-base font-semibold px-7 py-3.5 rounded-xl"
              >
                Get Free Audit
                <ArrowIcon />
              </Link>
              <p className="theme-text-muted text-xs mt-5">
                Three tiers, starting at $1,500. <Link href="/sample-proposal" className="theme-link underline underline-offset-4">See a sample proposal</Link> before you send the URL.
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
      <LeadMagnetSection />
      <FinalCtaSection />
    </>
  );
}
