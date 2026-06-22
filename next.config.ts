import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // isomorphic-dompurify pulls in jsdom, whose dynamic requires get dropped by
  // Vercel's serverless function tracing when bundled — the article page renders
  // fine in dev / local `next start` but 500s in production. Keep it external so
  // it loads from node_modules at runtime.
  serverExternalPackages: ["isomorphic-dompurify"],
};

export default nextConfig;
