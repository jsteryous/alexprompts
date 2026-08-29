import type { NextConfig } from "next";
import { OPTIMIZABLE_IMAGE_HOSTS } from "./src/lib/imageHosts";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Covers now live in Supabase Storage (Alex uploads his own in the editor;
  // the committed Greenville photo library was deleted August 27, 2026 with the
  // auto-cover). AVIF first for the smallest LCP bytes on mobile, and a month
  // of optimizer cache keeps transformation counts well inside the Vercel Hobby
  // free tier (zero-billing guarantee).
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2592000,
    // Whatever src/lib/imageHosts.ts trusts, so this file and the two render
    // paths cannot drift apart again. Pathname is left open because a stock
    // host organizes its URLs however it likes; the hostname is the control.
    remotePatterns: OPTIMIZABLE_IMAGE_HOSTS.map((hostname) => ({
      protocol: "https" as const,
      hostname,
    })),
  },
  async redirects() {
    return [
      // THE BUY/SELL PAGE HAS HAD THREE PATHS: /find-an-agent, then /find-a-pro,
      // then /buying-or-selling as of August 28, 2026. Both old ones point at the
      // live path DIRECTLY rather than hopping through each other, since a chain
      // costs a round trip and Google follows only so many.
      //
      // The last move was not cosmetic. "Find a pro" named the referral mechanism,
      // and no user-facing surface may name it (see the root CLAUDE.md); a URL is
      // user-facing, since it sits in the address bar, in a shared link, and in the
      // email footer. Permanent redirects keep every old link alive: in-article
      // CTAs, engine-written closing lines, the SMS terms, external shares, and
      // the ?ref= attribution query, which Next carries across the hop.
      {
        source: "/find-an-agent",
        destination: "/buying-or-selling",
        permanent: true,
      },
      {
        source: "/find-a-pro",
        destination: "/buying-or-selling",
        permanent: true,
      },
      // The August 24 seller piece was written over an unrelated draft in the
      // editor, so it published under that draft's slug about fee-in-lieu
      // millage while the article underneath was about pricing a home to sell.
      // It was live for a few hours and never went to the list, so this is
      // insurance against a crawler that caught it rather than a real audience.
      // Safe to drop once the domain move settles.
      {
        source: "/greenville-works/greenville-fee-in-lieu-millage-lock-reimbursement-cost",
        destination: "/sales/how-to-get-the-best-sale-price-as-a-home-seller",
        permanent: true,
      },

      // THE SECTION RENAME, August 25, 2026: /greenville-works became /sales,
      // tag and route together, because the old tag named the engine that wrote
      // a piece instead of the subject a reader is looking for.
      //
      // ORDER MATTERS HERE. Next matches these top to bottom, so the two
      // data-center pieces, which moved to Real Estate rather than Sales because
      // they are about land and power, must be listed BEFORE the catch-all. If
      // they fall through to it they land on /sales/<slug>, which 404s.
      {
        source: "/greenville-works/greenville-grid-data-center-power-who-pays-tariff",
        destination: "/real-estate/greenville-grid-data-center-power-who-pays-tariff",
        permanent: true,
      },
      {
        source: "/greenville-works/northmark-data-center-kohler-spartanburg-upstate-power",
        destination: "/real-estate/northmark-data-center-kohler-spartanburg-upstate-power",
        permanent: true,
      },
      {
        source: "/greenville-works/:slug",
        destination: "/sales/:slug",
        permanent: true,
      },
      {
        source: "/greenville-works",
        destination: "/sales",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
