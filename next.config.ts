import type { NextConfig } from "next";

// The one remote host the image optimizer may fetch: the site's own Supabase
// Storage (admin-editor body images, the old streetview covers). Derived from
// env so a project move follows automatically; when the env is unset the
// render pipeline also skips the rewrite, so the two stay consistent.
const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname;
  } catch {
    return undefined;
  }
})();

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Same-origin covers (the committed library photos) render through
  // next/image (see PostCover), which needs no remotePatterns because the
  // component normalizes them to root-relative paths first. AVIF first for
  // the smallest LCP bytes on mobile; a month of optimizer cache matches the
  // library's own immutable-cache header and keeps transformation counts well
  // inside the Vercel Hobby free tier (zero-billing guarantee).
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2592000,
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https" as const,
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
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
