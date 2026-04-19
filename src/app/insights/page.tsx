import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { clusters, clusterSlugs } from "@/lib/clusters";
import {
  InsightsPostList,
  type InsightsListPost,
} from "@/components/InsightsPostList";

export const metadata: Metadata = {
  title: "Insights — Dental Practice Websites, Fixed · REBB Advisors",
  description:
    "Tactical articles for dental practice owners and office managers in Greenville SC: broken booking forms, mobile experience, new-patient trust signals, and when a website cleanup beats a full rebuild.",
  alternates: { canonical: "https://rebbadvisors.com/insights" },
};

interface BlogPost extends InsightsListPost {
  cluster: string | null;
}

async function getPublishedPosts(): Promise<BlogPost[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return [];

  const client = createClient(url, key);
  const { data, error } = await client
    .from("blog_posts")
    .select("id, title, slug, summary, tags, published_at, created_at, cluster")
    .eq("status", "PUBLISHED")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("blog_posts fetch error:", error.message);
    return [];
  }
  return data ?? [];
}

export const revalidate = 60;

export default async function InsightsPage() {
  const posts = await getPublishedPosts();
  const clusterCounts = clusterSlugs.reduce<Record<string, number>>(
    (acc, slug) => {
      acc[slug] = posts.filter((p) => p.cluster === slug).length;
      return acc;
    },
    {},
  );

  return (
    <>
      {/* ── Header ── */}
      <section className="theme-page theme-border pt-32 pb-16 border-b">
        <div className="max-w-6xl mx-auto px-6">
          <span className="theme-label inline-block text-xs font-semibold uppercase tracking-widest mb-4">
            Greenville SC · Dental Website Insights
          </span>
          <h1 className="theme-text-primary text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
            What breaks on
            <br />
            dental websites
          </h1>
          <p className="theme-text-muted text-lg max-w-xl leading-relaxed">
            Field notes from auditing dental practice websites in the Upstate —
            broken booking forms, mobile layouts that lose patients, and the
            handful of fixes that actually move the needle.
          </p>
        </div>
      </section>

      {/* ── Browse by topic ── */}
      <section className="theme-section-muted border-b theme-border py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-6">
          <span className="theme-label inline-block text-xs font-semibold uppercase tracking-widest mb-6">
            Browse by topic
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {clusterSlugs.map((slug) => {
              const c = clusters[slug];
              const count = clusterCounts[slug] ?? 0;
              return (
                <Link
                  key={slug}
                  href={`/insights/topics/${slug}`}
                  className="theme-card hover:opacity-90 transition-opacity p-4 rounded-lg flex flex-col gap-2 min-h-[88px]"
                >
                  <span className="theme-text-primary text-sm font-semibold leading-tight">
                    {c.name}
                  </span>
                  <span className="theme-text-muted text-xs">
                    {count === 0
                      ? "Coming soon"
                      : `${count} ${count === 1 ? "article" : "articles"}`}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Post list ── */}
      <InsightsPostList posts={posts} />
    </>
  );
}
