import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/review", "/dashboard", "/api/"],
    },
    sitemap: "https://rebbadvisors.com/sitemap.xml",
  };
}
