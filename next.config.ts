import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      // The curated cover library is committed, web-sized (<=1400px, ~300KB)
      // and effectively immutable (new photos land under new filenames via the
      // monthly ingest PR). Vercel serves /public files with max-age=0 by
      // default, which fails Lighthouse's cache-lifetime audit and refetches
      // the homepage LCP image on every visit; a month of caching fixes both
      // while stale-while-revalidate covers the rare in-place replacement.
      {
        source: "/greenville/library/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=86400",
          },
        ],
      },
    ];
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
    ];
  },
};

export default nextConfig;
