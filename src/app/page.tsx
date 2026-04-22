import Link from "next/link";
import { BrokenPhoneHero } from "@/components/VisualMocks";
import {
  ArrowIcon,
  HipaaSection,
  ProcessSection,
  CompetenceSection,
  BeforeAfterSection,
  StakesSection,
  PricingSection,
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
                Dental Website Cleanup &middot; Greenville SC
              </span>
              <h1 className="theme-text-primary text-5xl md:text-6xl font-bold tracking-tight leading-[1.02] mb-6">
                Your website is costing
                <br />
                you patients.
              </h1>
              <p className="theme-text-secondary text-lg leading-relaxed mb-4 max-w-2xl">
                Dental website cleanup. $1,500. Screenshots of what&rsquo;s broken before you pay a dollar.
              </p>
              <p className="theme-text-secondary text-base leading-relaxed mb-4 max-w-2xl">
                Broken contact form. Slow on phones. Copyright says 2019. A patient Googles your practice, taps the first result, and closes the tab before they read a word. They don&rsquo;t call to tell you why. They call the office down the street.
              </p>
              <p className="theme-text-muted text-base leading-relaxed mb-10 max-w-2xl">
                Send us the URL. We reply with screenshots of what&rsquo;s wrong &mdash; free. If the site is fine, the note says so.
              </p>
              <Link
                href="/contact"
                className="theme-cta-accent inline-flex items-center justify-center gap-2 text-base font-semibold px-7 py-3.5 rounded-xl"
              >
                Show me what&rsquo;s broken
                <ArrowIcon />
              </Link>
              {/* TODO: requires sample proposal asset — do not ship live until this exists */}
              <p className="theme-text-muted text-xs mt-5">
                Starting at $1,500.{" "}
                <Link href="/sample-proposal" className="theme-link underline underline-offset-4">
                  See a sample proposal
                </Link>{" "}
                before you send the URL.
              </p>
            </div>

            <div className="flex justify-center lg:justify-end">
              <BrokenPhoneHero />
            </div>
          </div>
        </div>
      </section>

      <HipaaSection />
      <ProcessSection />
      <CompetenceSection />
      <BeforeAfterSection />
      <StakesSection />
      <PricingSection />
      <FaqSection />
      <LeadMagnetSection />
      <FinalCtaSection />
    </>
  );
}
