import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ThemeProvider from "@/components/ThemeProvider";
import DarkModeToggle from "@/components/DarkModeToggle";
import { site, socials } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name}: ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  // Three of these used to name the free tools ("rental property calculator",
  // "mortgage calculator", "free real estate tools"). All nine tools were
  // deleted August 14, 2026, so those were advertising routes that now 404.
  // Replaced with the beat the publication actually covers.
  keywords: [
    "South Carolina real estate",
    "South Carolina business",
    "Greenville SC real estate",
    "Upstate South Carolina real estate",
    "SC economic development incentives",
    "South Carolina commercial real estate",
    "moving to Greenville SC",
    "Greenville SC neighborhoods",
    "Rebrew",
    "Alex Steryous",
  ],
  openGraph: {
    title: `${site.name}: ${site.tagline}`,
    description: site.description,
    type: "website",
    url: site.url,
    siteName: site.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name}: ${site.tagline}`,
    description: site.oneLiner,
  },
  // NO `alternates.canonical` here, deliberately (August 2026). Next.js merges
  // metadata shallowly down the tree, so a canonical set on the root layout is
  // INHERITED by every page that does not set its own. A new route that forgot
  // one would silently ship `canonical: https://www.alexprompts.com`, and Google
  // would drop it from the index as "Alternate page with proper canonical tag"
  // while reporting no error anywhere. Leaving it unset makes the failure mode
  // safe instead: a page with no canonical self-canonicalizes by default.
  // Every public page declares its own, enforced by `npm run check:canonicals`.
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      name: site.name,
      url: site.url,
      description: site.description,
      publisher: { "@id": `${site.url}/#person` },
    },
    {
      "@type": "Person",
      "@id": `${site.url}/#person`,
      name: site.author,
      url: site.url,
      email: site.email,
      jobTitle: "Writer",
      description:
        "Writes Rebrew, a publication on South Carolina real estate and business built on primary documents: whether a business is durable, what years of sales have done to a submarket, and which rule or tax structure is driving behavior that looks random.",
      sameAs: socials.map((s) => s.url),
    },
  ],
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
            __html: `(function(){try{var t=localStorage.getItem('alexprompts-theme');var shouldUseDark=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',shouldUseDark);}catch(e){}})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <Nav />
          <main>{children}</main>
          <Footer />
          <DarkModeToggle />
        </ThemeProvider>
        {/* Vercel Web Analytics: cookieless, no PII, no consent banner needed.
            Serves first-party from /_vercel/insights; enable it for the project in
            the Vercel dashboard (Hobby free tier). No-op locally / when disabled. */}
        <Analytics />
      </body>
    </html>
  );
}
