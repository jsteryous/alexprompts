import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getPublishedPosts } from "@/lib/posts";
import { liveTools } from "@/lib/tools";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/tools`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/guides`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/archive`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/real-estate`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const toolRoutes: MetadataRoute.Sitemap = liveTools()
    .filter((t) => !t.external)
    .map((t) => ({
    url: `${SITE_URL}/tools/${t.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Each post lives at exactly one route, by tag: guides under /guides, Greenville
  // real-estate posts under /real-estate, the rest (newsletter) under /archive.
  const guides = await getPublishedPosts(undefined, "guide");
  const issues = await getPublishedPosts(undefined, "newsletter");
  const realEstate = await getPublishedPosts(undefined, "realestate");
  const guideRoutes: MetadataRoute.Sitemap = guides.map((p) => ({
    url: `${SITE_URL}/guides/${p.slug}`,
    lastModified: p.published_at ? new Date(p.published_at) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
  const issueRoutes: MetadataRoute.Sitemap = issues.map((p) => ({
    url: `${SITE_URL}/archive/${p.slug}`,
    lastModified: p.published_at ? new Date(p.published_at) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  const realEstateRoutes: MetadataRoute.Sitemap = realEstate.map((p) => ({
    url: `${SITE_URL}/real-estate/${p.slug}`,
    lastModified: p.published_at ? new Date(p.published_at) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...toolRoutes, ...guideRoutes, ...issueRoutes, ...realEstateRoutes];
}
