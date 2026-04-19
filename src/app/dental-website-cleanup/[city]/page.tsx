import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
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
import { cities, citySlugs, type CitySlug } from "@/lib/cities";

type Props = { params: Promise<{ city: string }> };

export function generateStaticParams() {
  return citySlugs.map((slug) => ({ city: slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: slug } = await params;
  const city = cities[slug as CitySlug];
  if (!city) return {};
  const url = `https://rebbadvisors.com/dental-website-cleanup/${city.slug}`;
  const title = `Dental Website Cleanup in ${city.name} SC | REBB Advisors`;
  const description = `Flat-fee dental practice website cleanup for ${city.name} and the ${city.county} County area. Booking forms fixed, mobile layouts cleaned up, 48-hour turnaround. Free screenshot audit.`;
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
      price: "1200",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
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
                is quietly losing new patients.
              </h1>
              <p className="theme-text-secondary text-lg leading-relaxed mb-4 max-w-2xl">
                Booking forms that 404. Layouts that crumble on phones. A copyright year still stuck in 2019. Patients across {city.county} County close the tab and call the practice down the street &mdash; they do not call to tell you why.
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

      <VisualProofSection />
      <ProcessSection />
      <PricingSection />
      <OutcomesSection />
      <FaqSection />
      <FinalCtaSection />
    </>
  );
}
