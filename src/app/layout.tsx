import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ThemeProvider from "@/components/ThemeProvider";
import DarkModeToggle from "@/components/DarkModeToggle";

export const metadata: Metadata = {
  title: "REBB Advisors - Company Brain for Greenville SC Service Businesses",
  description:
    "REBB Advisors sets up a private Company Brain for owner-led service businesses in Greenville and Upstate SC so teams can find answers across email, notes, files, and job history without interrupting the owner.",
  keywords: [
    "company brain Greenville SC",
    "AI knowledge base for service businesses",
    "private AI for HVAC company",
    "internal search for contractors",
    "owner-led service business systems",
    "company knowledge assistant Greenville",
  ],
  openGraph: {
    title: "REBB Advisors - Company Brain for Greenville SC Service Businesses",
    description:
      "Private company knowledge systems for owner-led service businesses. Help your team find answers without pulling the owner into every routine question.",
    type: "website",
    url: "https://rebbadvisors.com",
    siteName: "REBB Advisors",
  },
  twitter: {
    card: "summary_large_image",
    title: "REBB Advisors - Company Brain for Greenville SC Service Businesses",
    description:
      "Private company knowledge systems for owner-led service businesses in Greenville and Upstate SC.",
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
            __html: `(function(){try{var t=localStorage.getItem('rebb-theme');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`,
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
                "Private Company Brain setup for owner-led service businesses in Greenville and Upstate SC.",
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
                "Company Brain Setup",
                "Private AI Knowledge Base",
                "Internal Search for Service Businesses",
                "LLC Owner Finder Beta",
              ],
              knowsAbout: [
                "Private company knowledge systems",
                "Operational knowledge retrieval",
                "Internal AI for service businesses",
                "Greenville service business workflows",
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
