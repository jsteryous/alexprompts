import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ThemeProvider from "@/components/ThemeProvider";
import DarkModeToggle from "@/components/DarkModeToggle";

export const metadata: Metadata = {
  title: "REBB Advisors — Lead Generation & Marketing for Greenville SC Trades",
  description:
    "REBB Advisors helps Greenville County service businesses — HVAC, landscaping, pool, pressure washing — find high-value contracts before competitors do. Powered by daily property transfer and business filing data.",
  keywords: [
    "lead generation Greenville SC",
    "marketing for service businesses Greenville",
    "HVAC marketing Greenville SC",
    "landscaping marketing Upstate SC",
    "local SEO Greenville SC",
    "Greenville County property data leads",
  ],
  openGraph: {
    title: "REBB Advisors — Lead Generation & Marketing for Greenville SC Trades",
    description:
      "We programmatically sync Greenville County property transfers and business filings to surface your next contract before competitors know it exists.",
    type: "website",
    url: "https://rebbadvisors.com",
    siteName: "REBB Advisors",
  },
  twitter: {
    card: "summary_large_image",
    title: "REBB Advisors — Lead Generation & Marketing for Greenville SC Trades",
    description:
      "We programmatically sync Greenville County property transfers and business filings to surface your next contract before competitors know it exists.",
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
        {/* Prevent flash of wrong theme on page load */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('rebb-theme');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
        {/* LocalBusiness structured data */}
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
                "Proactive lead intelligence and marketing systems for Greenville County service businesses — HVAC, landscaping, pool, pressure washing, and trades.",
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
                "Lead Intelligence",
                "Local SEO",
                "Web Development",
                "Outreach Automation",
              ],
              knowsAbout: [
                "Greenville County property transfers",
                "Lead generation for service businesses",
                "Google Business Profile optimization",
                "Marketing automation",
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
