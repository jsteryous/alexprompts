import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ThemeProvider from "@/components/ThemeProvider";
import DarkModeToggle from "@/components/DarkModeToggle";

export const metadata: Metadata = {
  title: "REBB Advisors - Dental Website Cleanup in Greenville SC",
  description:
    "REBB Advisors fixes broken dental practice websites in Greenville SC. Booking forms, mobile issues, dead pages, and outdated trust leaks cleaned up fast with a clear fixed-price offer.",
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
      "Clear website cleanup offer for dental practices: broken booking forms, mobile issues, and outdated trust leaks fixed fast.",
    type: "website",
    url: "https://rebbadvisors.com",
    siteName: "REBB Advisors",
  },
  twitter: {
    card: "summary_large_image",
    title: "REBB Advisors - Dental Website Cleanup in Greenville SC",
    description:
      "Broken booking forms, mobile issues, and outdated dental practice websites fixed fast.",
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
                "Website cleanup and modernization for dental practices with broken booking forms, mobile issues, and outdated trust leaks.",
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
                "Dental Website Cleanup",
                "Dental Website Modernization",
                "Dental Booking Form Repair",
                "Mobile Dental Website Fixes",
              ],
              knowsAbout: [
                "Dental practice website cleanup",
                "Broken dental booking forms",
                "Mobile-friendly dental websites",
                "Dental practice website credibility",
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
