import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getPublishedPosts } from "@/lib/posts";
import { liveTools } from "@/lib/tools";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/briefing`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/tools`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/greenville-works`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/archive`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/real-estate`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/find-a-pro`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/subscribe`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
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

  // Each post lives at exactly one route, by tag: Greenville real-estate posts under
  // /real-estate, Greenville Works pieces under /greenville-works, Upstate Brief
  // issues under /briefing, the rest (newsletter) under /archive.
  const issues = await getPublishedPosts(undefined, "newsletter");
  const realEstate = await getPublishedPosts(undefined, "realestate");
  const works = await getPublishedPosts(undefined, "works");
  const briefs = await getPublishedPosts(undefined, "briefing");
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
  const worksRoutes: MetadataRoute.Sitemap = works.map((p) => ({
    url: `${SITE_URL}/greenville-works/${p.slug}`,
    lastModified: p.published_at ? new Date(p.published_at) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  const briefRoutes: MetadataRoute.Sitemap = briefs.map((p) => ({
    url: `${SITE_URL}/briefing/${p.slug}`,
    lastModified: p.published_at ? new Date(p.published_at) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...toolRoutes,
    ...issueRoutes,
    ...realEstateRoutes,
    ...worksRoutes,
    ...briefRoutes,
  ];
}
