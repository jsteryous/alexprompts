import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ThemeProvider from "@/components/ThemeProvider";
import DarkModeToggle from "@/components/DarkModeToggle";

export const metadata: Metadata = {
  title: "REBB Advisors - Website Cleanup for Local Businesses",
  description:
    "REBB Advisors fixes broken business websites for local businesses. Forms, mobile issues, dead pages, and outdated trust leaks cleaned up fast with a clear fixed-price offer.",
  keywords: [
    "website cleanup Greenville SC",
    "fix broken forms website",
    "mobile friendly website fix",
    "website modernization local business",
    "business website repair",
    "fix outdated website Greenville",
  ],
  openGraph: {
    title: "REBB Advisors - Website Cleanup for Local Businesses",
    description:
      "Clear website cleanup offer for local businesses: broken forms, mobile issues, dead pages, and outdated trust leaks fixed fast.",
    type: "website",
    url: "https://rebbadvisors.com",
    siteName: "REBB Advisors",
  },
  twitter: {
    card: "summary_large_image",
    title: "REBB Advisors - Website Cleanup for Local Businesses",
    description:
      "Broken forms, mobile issues, and outdated business websites fixed fast.",
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
    <html lang="en" suppressHydrationWarning>
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
                "Website cleanup and modernization for local businesses with broken forms, mobile issues, and outdated trust leaks.",
              areaServed: {
                "@type": "AdministrativeArea",
                name: "Greenville County, South Carolina",
              },
              address: {
                "@type": "PostalAddress",
                addressLocality: "Greenville",
                addressRegion: "SC",
                addressCountry: "US",
              },
              serviceType: [
                "Website Cleanup",
                "Website Modernization",
                "Broken Form Repair",
                "Mobile Website Fixes",
              ],
              knowsAbout: [
                "Business website cleanup",
                "Broken web forms",
                "Mobile-friendly websites",
                "Local business website credibility",
              ],
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
