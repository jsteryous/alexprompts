import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
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
  keywords: [
    "how to use Claude",
    "Claude tutorial",
    "Claude for beginners",
    "Claude AI guide",
    "get more out of Claude",
    "Claude Projects",
    "Claude Code tutorial",
    "Claude for non-technical people",
    "learn Claude step by step",
    "Alex Prompts",
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
  alternates: {
    canonical: site.url,
  },
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
        "Writes Alex Prompts, helping people get more out of Claude through plain, step-by-step guides.",
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
      </body>
    </html>
  );
}
