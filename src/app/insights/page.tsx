import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

export const metadata: Metadata = {
  title: "Market Insights — Greenville SC Lead Generation & Marketing · REBB Advisors",
  description:
    "Tactical articles on lead generation, local SEO, and outreach automation for Greenville County service businesses — HVAC, landscaping, pool, pressure washing, and trades.",
  alternates: { canonical: "https://rebbadvisors.com/insights" },
};

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  tags: string[];
  published_at: string | null;
  created_at: string;
}

async function getPublishedPosts(): Promise<BlogPost[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return [];

  const client = createClient(url, key);
  const { data, error } = await client
    .from("blog_posts")
    .select("id, title, slug, summary, tags, published_at, created_at")
    .eq("status", "PUBLISHED")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("blog_posts fetch error:", error.message);
    return [];
  }
  return data ?? [];
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export const revalidate = 60; // ISR: re-fetch every 60 s

export default async function InsightsPage() {
  const posts = await getPublishedPosts();

  return (
    <>
      {/* ── Header ── */}
      <section className="bg-white pt-32 pb-16 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 mb-4">
            Upstate SC · Market Insights
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-black leading-tight mb-4">
            What&apos;s moving
            <br />
            Greenville this week
          </h1>
          <p className="text-lg text-gray-500 max-w-xl leading-relaxed">
            Data-driven analysis of property transfers, business filings, and
            economic signals for local service contractors.
          </p>
        </div>
      </section>

      {/* ── Post list ── */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          {posts.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-gray-400 text-sm">No published insights yet. Check back soon.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {posts.map((post) => (
                <article key={post.id} className="py-10 group">
                  <div className="flex flex-col md:flex-row md:items-start md:gap-16">
                    {/* Date */}
                    <div className="flex-shrink-0 w-36 mb-3 md:mb-0">
                      <time className="text-xs text-gray-400 font-medium">
                        {formatDate(post.published_at ?? post.created_at)}
                      </time>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs font-semibold uppercase tracking-widest text-green-700 bg-green-50 px-2 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <h2 className="text-xl md:text-2xl font-bold text-black tracking-tight mb-2 group-hover:text-green-700 transition-colors">
                        <Link href={`/insights/${post.slug}`}>{post.title}</Link>
                      </h2>

                      {post.summary && (
                        <p className="text-sm text-gray-500 leading-relaxed mb-4 max-w-2xl">
                          {post.summary}
                        </p>
                      )}

                      <Link
                        href={`/insights/${post.slug}`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-black hover:text-green-700 transition-colors"
                      >
                        Read more
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
