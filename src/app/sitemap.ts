import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { citySlugs } from "@/lib/cities";
import { clusterSlugs } from "@/lib/clusters";
import { practiceTypeSlugs } from "@/lib/practiceTypes";

const BASE_URL = "https://rebbadvisors.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/sample-proposal`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE_URL}/insights`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
  ];

  const cityRoutes: MetadataRoute.Sitemap = citySlugs.map((slug) => ({
    url: `${BASE_URL}/dental-website-cleanup/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const practiceTypeRoutes: MetadataRoute.Sitemap = practiceTypeSlugs.map((slug) => ({
    url: `${BASE_URL}/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const clusterRoutes: MetadataRoute.Sitemap = clusterSlugs.map((slug) => ({
    url: `${BASE_URL}/insights/topics/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return [...staticRoutes, ...cityRoutes, ...practiceTypeRoutes, ...clusterRoutes];

  const client = createClient(url, key);
  const { data } = await client
    .from("blog_posts")
    .select("slug, published_at, updated_at")
    .eq("status", "PUBLISHED");

  const postRoutes: MetadataRoute.Sitemap = (data ?? []).map((post) => ({
    url: `${BASE_URL}/insights/${post.slug}`,
    lastModified: new Date(post.updated_at ?? post.published_at),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...cityRoutes, ...practiceTypeRoutes, ...clusterRoutes, ...postRoutes];
}
