import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ThemeProvider from "@/components/ThemeProvider";
import DarkModeToggle from "@/components/DarkModeToggle";

export const metadata: Metadata = {
  metadataBase: new URL("https://rebbadvisors.com"),
  title: "REBB Advisors - Dental Website Cleanup in Greenville SC",
  description:
    "REBB Advisors fixes and grows dental practice websites in Greenville SC. Three tiers from $1,500 Cleanup to Growth and Dominance retainers. Free audit and written proposal before you commit.",
  keywords: [
    "dental website cleanup Greenville SC",
    "dentist website repair",
    "fix dental booking form",
    "mobile friendly dental website",
    "dental practice website modernization",
    "outdated dentist website fix",
  ],
  openGraph: {
    title: "REBB Advisors - Dental Website Cleanup in Greenville SC",
    description:
      "Three-tier dental website engagements: Cleanup ($1,500 flat), Growth ($3,500 + $500/mo), Dominance ($7,500 + $1,200/mo). Free audit and written proposal.",
    type: "website",
    url: "https://rebbadvisors.com",
    siteName: "REBB Advisors",
  },
  twitter: {
    card: "summary_large_image",
    title: "REBB Advisors - Dental Website Cleanup in Greenville SC",
    description:
      "Three-tier dental website engagements. Cleanup, Growth, Dominance. Free audit and written proposal.",
  },
  alternates: {
    canonical: "https://rebbadvisors.com",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={GeistSans.variable}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('rebb-theme');var shouldUseDark=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',shouldUseDark);}catch(e){}})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              name: "REBB Advisors",
              url: "https://rebbadvisors.com",
              email: "alex@rebbadvisors.com",
              description:
                "Tiered website cleanup, growth, and dominance engagements for dental practices. From flat-fee Cleanup ($1,500) to Growth ($3,500 setup + $500/mo) to Dominance ($7,500 setup + $1,200/mo). Every engagement starts with a free audit and a written proposal.",
              slogan: "Confused customers don't buy.",
              priceRange: "$1,500 - $7,500+",
              areaServed: [
                { "@type": "AdministrativeArea", name: "Greenville County, South Carolina" },
                { "@type": "AdministrativeArea", name: "Spartanburg County, South Carolina" },
                { "@type": "AdministrativeArea", name: "Anderson County, South Carolina" },
                { "@type": "AdministrativeArea", name: "Pickens County, South Carolina" },
                { "@type": "AdministrativeArea", name: "Oconee County, South Carolina" },
              ],
              address: {
                "@type": "PostalAddress",
                addressLocality: "Greenville",
                addressRegion: "SC",
                addressCountry: "US",
              },
              serviceType: [
                "Dental Website Cleanup",
                "Dental Website Modernization",
                "Dental Local SEO",
                "Dental Google Business Profile Management",
                "Dental Website Content Marketing",
                "Dental Website Redesign",
              ],
              knowsAbout: [
                "Dental practice website cleanup",
                "Broken dental booking forms",
                "Mobile-friendly dental websites",
                "Dental practice local SEO",
                "Dental Google Business Profile optimization",
                "Dental practice website credibility",
              ],
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "Dental Website Engagement Tiers",
                itemListElement: [
                  {
                    "@type": "Offer",
                    name: "Cleanup",
                    description:
                      "One-time, 48-hour flat-fee cleanup: broken booking-form repair, mobile layout fixes, SSL and trust cleanup, basic modernization.",
                    price: "1500",
                    priceCurrency: "USD",
                    availability: "https://schema.org/InStock",
                    category: "Web design",
                    itemOffered: {
                      "@type": "Service",
                      name: "Dental Website Cleanup",
                      serviceType: "Website cleanup and modernization",
                    },
                  },
                  {
                    "@type": "Offer",
                    name: "Growth",
                    description:
                      "Cleanup plus ongoing local SEO, schema, Google Business Profile management, and two blog posts per month. Month-to-month retainer.",
                    price: "3500",
                    priceCurrency: "USD",
                    availability: "https://schema.org/InStock",
                    category: "Digital marketing",
                    itemOffered: {
                      "@type": "Service",
                      name: "Dental Website Growth",
                      serviceType: "Local SEO and content marketing",
                    },
                    priceSpecification: {
                      "@type": "UnitPriceSpecification",
                      price: "500",
                      priceCurrency: "USD",
                      billingIncrement: 1,
                      unitCode: "MON",
                    },
                  },
                  {
                    "@type": "Offer",
                    name: "Dominance",
                    description:
                      "Growth plus visual refresh, four long-form posts per month, active link building, review generation, and quarterly CRO. Month-to-month retainer.",
                    price: "7500",
                    priceCurrency: "USD",
                    availability: "https://schema.org/InStock",
                    category: "Digital marketing",
                    itemOffered: {
                      "@type": "Service",
                      name: "Dental Website Dominance",
                      serviceType: "Full-service dental website marketing",
                    },
                    priceSpecification: {
                      "@type": "UnitPriceSpecification",
                      price: "1200",
                      priceCurrency: "USD",
                      billingIncrement: 1,
                      unitCode: "MON",
                    },
                  },
                ],
              },
            }),
          }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <Nav />
          <main>{children}</main>
          <Footer />
          <DarkModeToggle />
        </ThemeProvider>
      </body>
    </html>
  );
}
