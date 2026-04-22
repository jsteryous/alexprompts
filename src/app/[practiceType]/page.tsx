import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
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
import {
  practiceTypes,
  practiceTypeSlugs,
  type PracticeTypeSlug,
} from "@/lib/practiceTypes";

type Props = { params: Promise<{ practiceType: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return practiceTypeSlugs.map((slug) => ({ practiceType: slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { practiceType: slug } = await params;
  const pt = practiceTypes[slug as PracticeTypeSlug];
  if (!pt) return {};
  const url = `https://rebbadvisors.com/${pt.slug}`;
  return {
    title: pt.metaTitle,
    description: pt.metaDescription,
    openGraph: {
      title: pt.metaTitle,
      description: pt.metaDescription,
      type: "website",
      url,
      siteName: "REBB Advisors",
    },
    alternates: { canonical: url },
  };
}

export default async function PracticeTypePage({ params }: Props) {
  const { practiceType: slug } = await params;
  const pt = practiceTypes[slug as PracticeTypeSlug];
  if (!pt) notFound();

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: pt.serviceName,
    serviceType: "Website cleanup and modernization for dental practices",
    provider: {
      "@type": "ProfessionalService",
      name: "REBB Advisors",
      url: "https://rebbadvisors.com",
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Upstate South Carolina",
    },
    offers: {
      "@type": "Offer",
      price: "1500",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      description: pt.serviceDescription,
    },
  };

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
                {pt.heroEyebrow}
              </span>
              <h1 className="theme-text-primary text-5xl md:text-6xl font-bold tracking-tight leading-[1.02] mb-6">
                {pt.heroH1Top}
                <br />
                {pt.heroH1Bottom}
              </h1>
              <p className="theme-text-secondary text-lg leading-relaxed mb-4 max-w-2xl">
                {pt.heroLede}
              </p>
              <p className="theme-text-secondary text-base leading-relaxed mb-10 max-w-2xl">
                {pt.heroBody}
              </p>
              <Link
                href="/contact"
                className="theme-cta-accent inline-flex items-center justify-center gap-2 text-base font-semibold px-7 py-3.5 rounded-xl"
              >
                Show me what&rsquo;s broken
                <ArrowIcon />
              </Link>
              <p className="theme-text-muted text-xs mt-5">
                Starting at $1,500.{" "}
                <Link href="/sample-proposal" className="theme-link underline underline-offset-4">
                  See a sample proposal
                </Link>{" "}
                before you send the URL.
              </p>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="relative aspect-[4/3] w-full max-w-[520px] overflow-hidden rounded-3xl theme-border border">
                <Image
                  src={pt.image}
                  alt={pt.alt}
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                  priority
                />
              </div>
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
      <FinalCtaSection />
    </>
  );
}
