import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  clusters,
  clusterSlugs,
  isClusterSlug,
  type ClusterSlug,
} from "@/lib/clusters";
import {
  InsightsPostList,
  type InsightsListPost,
} from "@/components/InsightsPostList";
import { FinalCtaSection } from "@/components/HomeSections";

type Props = { params: Promise<{ cluster: string }> };

export function generateStaticParams() {
  return clusterSlugs.map((slug) => ({ cluster: slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cluster: slug } = await params;
  if (!isClusterSlug(slug)) return {};
  const c = clusters[slug];
  const url = `https://rebbadvisors.com/insights/topics/${c.slug}`;
  return {
    title: `${c.name} — Dental Website Insights · REBB Advisors`,
    description: c.description,
    openGraph: {
      title: c.hubTitle,
      description: c.description,
      type: "website",
      url,
      siteName: "REBB Advisors",
    },
    alternates: { canonical: url },
  };
}

async function getClusterPosts(
  cluster: ClusterSlug,
): Promise<InsightsListPost[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  const client = createClient(url, key);
  const { data, error } = await client
    .from("blog_posts")
    .select("id, title, slug, summary, tags, published_at, created_at")
    .eq("status", "PUBLISHED")
    .eq("cluster", cluster)
    .order("published_at", { ascending: false });
  if (error) {
    console.error("cluster posts fetch error:", error.message);
    return [];
  }
  return data ?? [];
}

export const revalidate = 60;

export default async function ClusterHubPage({ params }: Props) {
  const { cluster: slug } = await params;
  if (!isClusterSlug(slug)) notFound();
  const c = clusters[slug];
  const posts = await getClusterPosts(slug);
  const others = clusterSlugs
    .filter((s) => s !== slug)
    .map((s) => clusters[s]);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://rebbadvisors.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Insights",
        item: "https://rebbadvisors.com/insights",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: c.name,
        item: `https://rebbadvisors.com/insights/topics/${c.slug}`,
      },
    ],
  };

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: c.hubTitle,
    description: c.description,
    url: `https://rebbadvisors.com/insights/topics/${c.slug}`,
    isPartOf: {
      "@type": "Blog",
      name: "REBB Advisors Insights",
      url: "https://rebbadvisors.com/insights",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />

      <section className="theme-page theme-border pt-32 pb-16 border-b">
        <div className="max-w-6xl mx-auto px-6">
          <nav
            className="theme-text-muted text-xs mb-6 flex flex-wrap items-center gap-1.5"
            aria-label="Breadcrumb"
          >
            <Link href="/insights" className="hover:opacity-80">
              Insights
            </Link>
            <span aria-hidden>›</span>
            <span>{c.name}</span>
          </nav>
          <span className="theme-label inline-block text-xs font-semibold uppercase tracking-widest mb-4">
            Topic · Dental Website Cleanup
          </span>
          <h1 className="theme-text-primary text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-4 max-w-3xl">
            {c.hubTitle}
          </h1>
          <p className="theme-text-muted text-lg leading-relaxed max-w-2xl">
            {c.intro}
          </p>
        </div>
      </section>

      <InsightsPostList
        posts={posts}
        emptyMessage={`We're still writing on ${c.name.toLowerCase()}. Browse other topics below, or send us your URL for a free screenshot audit.`}
      />

      <section className="theme-section-muted border-y theme-border py-12">
        <div className="max-w-6xl mx-auto px-6">
          <span className="theme-label inline-block text-xs font-semibold uppercase tracking-widest mb-4">
            More topics
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {others.map((o) => (
              <Link
                key={o.slug}
                href={`/insights/topics/${o.slug}`}
                className="theme-card hover:opacity-90 transition-opacity p-4 rounded-lg"
              >
                <span className="theme-text-primary text-sm font-semibold leading-tight">
                  {o.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <FinalCtaSection />
    </>
  );
}
