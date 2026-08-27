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
      // The connector was renamed from "Find an Agent" to "Find a Pro" (broader
      // than agents: it fronts a vetted bench of agents, loan officers, and closing
      // attorneys). Permanent redirect keeps every old link alive: in-article CTAs,
      // engine-written closing lines, external shares, and the ?ref= attribution
      // query survives the hop.
      {
        source: "/find-an-agent",
        destination: "/find-a-pro",
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
