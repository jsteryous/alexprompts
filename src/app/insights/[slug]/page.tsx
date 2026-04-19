import { createClient } from "@supabase/supabase-js";
import { marked } from "marked";
import Link from "next/link";
import { notFound } from "next/navigation";
import { clusters, isClusterSlug } from "@/lib/clusters";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const client = createClient(url, key);
  const { data } = await client
    .from("blog_posts")
    .select(
      "id, title, slug, summary, body_md, tags, published_at, author, cluster",
    )
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .single();
  return data;
}

async function getRelated(
  clusterSlug: string,
  excludeId: string,
  limit = 3,
): Promise<
  { id: string; title: string; slug: string; summary: string | null; published_at: string | null }[]
> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  const client = createClient(url, key);
  const { data, error } = await client
    .from("blog_posts")
    .select("id, title, slug, summary, published_at")
    .eq("status", "PUBLISHED")
    .eq("cluster", clusterSlug)
    .neq("id", excludeId)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("related posts fetch error:", error.message);
    return [];
  }
  return data ?? [];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export const revalidate = 60;

export default async function InsightPost({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const bodyHtml = await marked(post.body_md ?? "");
  const authorName = post.author ?? "REBB Advisors";
  const published = post.published_at ?? null;
  const cluster = isClusterSlug(post.cluster) ? clusters[post.cluster] : null;
  const related = cluster ? await getRelated(cluster.slug, post.id) : [];

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.summary ?? undefined,
    datePublished: published,
    dateModified: published,
    author: {
      "@type": "Organization",
      name: authorName,
      url: "https://rebbadvisors.com",
    },
    publisher: {
      "@type": "Organization",
      name: "REBB Advisors",
      url: "https://rebbadvisors.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://rebbadvisors.com/insights/${post.slug}`,
    },
    ...(cluster ? { articleSection: cluster.name } : {}),
  };

  const breadcrumbItems = [
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
    ...(cluster
      ? [
          {
            "@type": "ListItem",
            position: 3,
            name: cluster.name,
            item: `https://rebbadvisors.com/insights/topics/${cluster.slug}`,
          },
        ]
      : []),
    {
      "@type": "ListItem",
      position: cluster ? 4 : 3,
      name: post.title,
      item: `https://rebbadvisors.com/insights/${post.slug}`,
    },
  ];
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* ── Header ── */}
      <section className="theme-page theme-border pt-32 pb-12 border-b">
        <div className="max-w-2xl mx-auto px-6">
          {/* Breadcrumbs */}
          <nav
            className="theme-text-muted text-xs mb-8 flex flex-wrap items-center gap-1.5"
            aria-label="Breadcrumb"
          >
            <Link href="/insights" className="hover:opacity-80">
              Insights
            </Link>
            {cluster && (
              <>
                <span aria-hidden>›</span>
                <Link
                  href={`/insights/topics/${cluster.slug}`}
                  className="hover:opacity-80"
                >
                  {cluster.name}
                </Link>
              </>
            )}
          </nav>

          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="theme-badge text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="theme-text-primary text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-4">
            {post.title}
          </h1>

          {post.summary && (
            <p className="theme-text-muted text-lg leading-relaxed mb-6">{post.summary}</p>
          )}

          <div className="theme-text-muted flex items-center gap-3 text-sm">
            <span>{post.author ?? "REBB Advisors"}</span>
            {post.published_at && (
              <>
                <span>·</span>
                <time>{formatDate(post.published_at)}</time>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <section className="theme-section py-16">
        <div className="max-w-2xl mx-auto px-6">
          <div
            className="theme-prose prose max-w-none"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        </div>
      </section>

      {/* ── Related posts ── */}
      {related.length > 0 && cluster && (
        <section className="theme-section-muted border-t theme-border py-16">
          <div className="max-w-2xl mx-auto px-6">
            <span className="theme-label inline-block text-xs font-semibold uppercase tracking-widest mb-4">
              More on {cluster.name}
            </span>
            <ul className="divide-y theme-border">
              {related.map((r) => (
                <li key={r.id} className="py-5">
                  <Link href={`/insights/${r.slug}`} className="group block">
                    <h3 className="theme-text-primary text-lg font-semibold mb-1 group-hover:opacity-80">
                      {r.title}
                    </h3>
                    {r.summary && (
                      <p className="theme-text-muted text-sm leading-relaxed">
                        {r.summary}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={`/insights/topics/${cluster.slug}`}
              className="theme-text-primary inline-flex items-center gap-1.5 text-sm font-medium mt-6 hover:opacity-80"
            >
              All {cluster.name.toLowerCase()} posts
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="theme-section-contrast py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <span className="theme-label inline-block text-xs font-semibold uppercase tracking-widest mb-4">
            REBB Advisors
          </span>
          <h2 className="theme-text-primary text-3xl font-bold tracking-tight mb-4">
            Want to see what&apos;s broken on your site?
          </h2>
          <p className="theme-text-contrast-muted mb-8 leading-relaxed">
            Send us your URL. We&apos;ll reply with screenshots of what&apos;s
            broken — no sales call. If cleanup fixes it, we quote the flat fee.
            If it needs a rebuild, we say so.
          </p>
          <Link
            href="/contact"
            className="theme-cta-accent inline-flex items-center gap-2 font-semibold px-7 py-3.5 rounded-xl"
          >
            Show Me What&apos;s Broken
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
