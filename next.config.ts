import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
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
