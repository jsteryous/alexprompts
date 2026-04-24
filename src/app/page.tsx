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

function formatCountyList(counties: string[]): string {
  if (counties.length === 0) return "Upstate SC";
  const named = counties.map((c) => `${c.replace(/\s+county\s*$/i, "").trim()}`);
  if (named.length === 1) return `${named[0]} County`;
  if (named.length === 2) return `${named[0]} and ${named[1]} counties`;
  return `${named.slice(0, -1).join(", ")}, and ${named[named.length - 1]} counties`;
}

export default async function HomePage() {
  const portfolio = await fetchPortfolioStats();

  const liveIntro =
    portfolio && portfolio.established_n > 0 ? (
      <p className="theme-text-secondary text-sm md:text-base leading-relaxed">
        Across{" "}
        <strong className="theme-text-primary">
          {portfolio.established_n} Upstate dental practices
        </strong>{" "}
        with 100+ Google reviews and an average{" "}
        <strong className="theme-text-primary">
          {portfolio.established_avg_rating}-star rating
        </strong>
        ,{" "}
        <strong className="theme-text-primary">
          {portfolio.established_lh_under_50_pct}%
        </strong>{" "}
        score below 50 on Google&rsquo;s own mobile performance metric. Great
        practices. Slow websites. These are the three fixes that show up most.
      </p>
    ) : portfolio ? (
      <p className="theme-text-secondary text-sm md:text-base leading-relaxed">
        We&rsquo;ve audited{" "}
        <strong className="theme-text-primary">
          {portfolio.n_audited} dental websites
        </strong>{" "}
        across {formatCountyList(portfolio.counties)}.
        {portfolio.lh_median !== null && (
          <>
            {" "}The median mobile Lighthouse score is{" "}
            <strong className="theme-text-primary">
              {portfolio.lh_median} out of 100
            </strong>
            . {portfolio.lh_under_50_pct}% score below 50.
          </>
        )}{" "}
        These are the three fixes that show up most.
      </p>
    ) : undefined;

  const liveMethodology = portfolio ? (
    <>
      Methodology: headless-browser audit of dental practice websites across{" "}
      {formatCountyList(portfolio.counties)}, {portfolio.generated_at}. n ={" "}
      {portfolio.n_audited} audited. Counts refresh as the audit pipeline runs.
    </>
  ) : undefined;

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
                For dentists whose reputations are better than their websites
              </span>
              <h1 className="theme-text-primary text-5xl md:text-6xl font-bold tracking-tight leading-[1.02] mb-6">
                Your patients love you.
                <br />
                Your website doesn&rsquo;t show it.
              </h1>
              <p className="theme-text-secondary text-lg leading-relaxed mb-4 max-w-2xl">
                You built the practice one patient at a time. Five stars in person. Four seconds of spinner on their phone &mdash; and the new patients clicking through from Google never meet you.
              </p>
              <p className="theme-text-secondary text-base leading-relaxed mb-10 max-w-2xl">
                Free audit. Written proposal. If your site&rsquo;s fine, we&rsquo;ll say so.
              </p>
              <Link
                href="/contact"
                className="theme-cta-accent inline-flex items-center justify-center gap-2 text-base font-semibold px-7 py-3.5 rounded-xl"
              >
                Get your free audit
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
      />
      <BeforeAfterSection intro={liveIntro} methodology={liveMethodology} />
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
