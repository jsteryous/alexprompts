import Link from "next/link";
import { BrokenPhoneHero } from "@/components/VisualMocks";
import {
  ArrowIcon,
  HipaaSection,
  ProcessSection,
  CompetenceSection,
  BeforeAfterSection,
  StakesSection,
  SuccessSection,
  PricingSection,
  FaqSection,
  FinalCtaSection,
  faqJsonLd,
} from "@/components/HomeSections";
import { LeadMagnetSection } from "@/components/LeadMagnetSection";
import { fetchPortfolioStats } from "@/lib/cityStats";

export const revalidate = 3600;

export default async function HomePage() {
  const portfolio = await fetchPortfolioStats();

  const leanIntro = (
    <p className="theme-text-secondary text-base md:text-lg leading-relaxed">
      Same pattern, almost every audit. These are the three fixes that show up most.
    </p>
  );

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
                You&rsquo;re a great dentist.
              </span>
              <h1 className="theme-text-primary text-5xl md:text-6xl font-bold tracking-tight leading-[1.02] mb-6">
                Your patients love you.
                <br />
                Your website doesn&rsquo;t show it.
              </h1>
              <p className="theme-text-secondary text-lg md:text-xl leading-relaxed mb-4 max-w-2xl">
                You earned a five-star reputation in person. On a phone, a four-second delay sends a new patient to the next pin. What walks away isn&rsquo;t one cleaning &mdash; it&rsquo;s years of recall, the family they&rsquo;d have brought, and the case you&rsquo;d have caught a year in.
              </p>
              <p className="theme-text-primary text-lg md:text-xl leading-relaxed mb-10 max-w-2xl font-semibold">
                Most dentists never see them leave. We do.
              </p>
              <Link
                href="/contact"
                className="theme-cta-accent inline-flex items-center justify-center gap-2 text-base font-semibold px-7 py-3.5 rounded-xl"
              >
                See if your website is losing patients
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

      <StakesSection
        cohortN={portfolio?.established_n}
        cohortAvgRating={portfolio?.established_avg_rating ?? null}
        cohortUnder50Pct={portfolio?.established_lh_under_50_pct}
        cohortRegionLabel={portfolio?.region_label}
      />
      <BeforeAfterSection intro={leanIntro} />
      <ProcessSection />
      <CompetenceSection />
      <HipaaSection />
      <SuccessSection />
      <PricingSection />
      <FaqSection />
      <LeadMagnetSection />
      <FinalCtaSection />
    </>
  );
}
