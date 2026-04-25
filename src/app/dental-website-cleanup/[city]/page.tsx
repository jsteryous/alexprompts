import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
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
import { cities, citySlugs, type CitySlug } from "@/lib/cities";
import CityAuditStats from "@/components/CityAuditStats";
import { fetchCityStats } from "@/lib/cityStats";

type Props = { params: Promise<{ city: string }> };

export const revalidate = 3600;

export function generateStaticParams() {
  return citySlugs.map((slug) => ({ city: slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: slug } = await params;
  const city = cities[slug as CitySlug];
  if (!city) return {};
  const url = `https://rebbadvisors.com/dental-website-cleanup/${city.slug}`;
  const title = `Dental Website Cleanup in ${city.name} SC | REBB Advisors`;
  const description = `Dental website cleanup for ${city.name} and ${city.county} County practices. $1,500. HIPAA-compliant intake swap, Weave sync preserved, five business days. Larger rebuilds scoped to your project. Free audit first.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url,
      siteName: "REBB Advisors",
    },
    alternates: { canonical: url },
  };
}

export default async function CityPage({ params }: Props) {
  const { city: slug } = await params;
  const city = cities[slug as CitySlug];
  if (!city) notFound();

  const cityStats = await fetchCityStats(city.county);

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Dental Website Cleanup in ${city.name} SC`,
    serviceType: "Website cleanup and modernization",
    provider: {
      "@type": "ProfessionalService",
      name: "REBB Advisors",
      url: "https://rebbadvisors.com",
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: `${city.county} County, South Carolina`,
    },
    offers: {
      "@type": "Offer",
      price: "1500",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      description:
        "Dental website cleanup \u2014 mobile fixes, HIPAA-compliant contact form replacement, speed pass, visual refresh. Larger rebuilds scoped per project.",
    },
  };

  const neighborhoodList =
    city.neighborhoods.length > 1
      ? `${city.neighborhoods.slice(0, -1).join(", ")}, and ${city.neighborhoods.at(-1)}`
      : city.neighborhoods[0];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="theme-page pt-24 md:pt-32">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="grid gap-16 lg:grid-cols-[1.05fr,0.95fr] items-center">
            <div>
              <span className="theme-label inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-5">
                Website Cleanup for {city.name} Dental Practices
              </span>
              <h1 className="theme-text-primary text-5xl md:text-6xl font-bold tracking-tight leading-[1.02] mb-6">
                Your {city.name} dental site
                <br />
                is costing you patients.
              </h1>
              <p className="theme-text-secondary text-lg leading-relaxed mb-4 max-w-2xl">
                Dental website cleanup for {city.county} County practices. $1,500. Screenshots of what&rsquo;s broken before you pay a dollar.
              </p>
              <p className="theme-text-secondary text-base leading-relaxed mb-4 max-w-2xl">
                Broken contact form. Slow on phones. Copyright says 2019. Patients across {city.county} County Google your practice, tap the first result, and close the tab before they read a word. They don&rsquo;t call to tell you why.
              </p>
              <p className="theme-text-muted text-base leading-relaxed mb-10 max-w-2xl">
                Send us the URL. We reply with screenshots of what we found &mdash; free. If your site&rsquo;s fine, we&rsquo;ll say so.
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

      <section className="theme-section-muted border-y theme-border py-10 md:py-12">
        <div className="max-w-6xl mx-auto px-6">
          <p className="theme-text-secondary text-sm md:text-base leading-relaxed">
            <span className="theme-label text-xs font-semibold uppercase tracking-widest mr-2">
              Service area
            </span>
            Serving dental practices across {city.county} County &mdash; including {neighborhoodList}.
          </p>
        </div>
      </section>

      <HipaaSection />
      <ProcessSection />
      <CompetenceSection />
      {cityStats ? (
        <CityAuditStats
          cityName={city.name}
          county={city.county}
          stats={cityStats}
        />
      ) : (
        <BeforeAfterSection />
      )}
      <StakesSection />
      <PricingSection />
      <FaqSection />
      <FinalCtaSection />
    </>
  );
}
