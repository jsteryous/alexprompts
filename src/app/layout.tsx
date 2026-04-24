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
    "Dental website cleanup for Greenville SC and Upstate practices. $1,500. HIPAA-compliant intake swap, Weave sync preserved, five business days. Larger rebuilds scoped to your project. Free audit first.",
  keywords: [
    "dental website cleanup Greenville SC",
    "dentist website repair",
    "fix dental booking form",
    "mobile friendly dental website",
    "HIPAA compliant dental contact form",
    "dental practice website modernization",
  ],
  openGraph: {
    title: "REBB Advisors - Dental Website Cleanup in Greenville SC",
    description:
      "Dental website cleanup starting at $1,500. HIPAA-compliant intake, Weave/LocalMed/RevenueWell sync preserved, five business days. Free audit and written proposal first.",
    type: "website",
    url: "https://rebbadvisors.com",
    siteName: "REBB Advisors",
  },
  twitter: {
    card: "summary_large_image",
    title: "REBB Advisors - Dental Website Cleanup in Greenville SC",
    description:
      "Dental website cleanup. $1,500. HIPAA-compliant intake. Weave sync preserved. Free audit first.",
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
                "Dental website cleanup and scoped rebuilds for practices in Greenville SC and the Upstate. HIPAA-compliant contact form replacement, Weave / LocalMed / RevenueWell sync preservation, Map Pack visibility. Every engagement starts with a free audit and a written proposal.",
              slogan: "Confused customers don't buy.",
              priceRange: "$1,500+",
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
                "Dental Website Rebuild",
                "HIPAA-Compliant Dental Intake Forms",
                "Dental Local SEO",
                "Dental Google Business Profile Management",
              ],
              knowsAbout: [
                "Dental practice website cleanup",
                "HIPAA-compliant dental contact forms",
                "Dental patient-engagement platform integration",
                "Weave, LocalMed, and RevenueWell synchronization",
                "Mobile-friendly dental websites",
                "Dental practice local SEO and Map Pack visibility",
                "Dentist schema markup and Google Business Profile optimization",
              ],
              makesOffer: {
                "@type": "Offer",
                name: "Dental Website Cleanup",
                description:
                  "Flat-fee dental website cleanup: mobile fixes, HIPAA-compliant contact form replacement, speed pass, visual refresh. Existing Weave / LocalMed / RevenueWell sync preserved and tested before handoff. Ships in five business days or less. Larger rebuilds scoped per project.",
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
