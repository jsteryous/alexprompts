import { createClient } from "@supabase/supabase-js";
import { marked } from "marked";
import Link from "next/link";
import { notFound } from "next/navigation";

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
    .select("id, title, slug, summary, body_md, tags, published_at, author")
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .single();
  return data;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

export const revalidate = 60;

export default async function InsightPost({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const bodyHtml = await marked(post.body_md ?? "");

  return (
    <>
      {/* ── Header ── */}
      <section className="theme-page theme-border pt-32 pb-12 border-b">
        <div className="max-w-2xl mx-auto px-6">
          <Link
            href="/insights"
            className="theme-text-muted hover:opacity-80 inline-flex items-center gap-1.5 text-sm transition-opacity mb-8"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            Market Insights
          </Link>

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

      {/* ── CTA ── */}
      <section className="theme-section-contrast py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <span className="theme-label inline-block text-xs font-semibold uppercase tracking-widest mb-4">
            REBB Advisors
          </span>
          <h2 className="theme-text-primary text-3xl font-bold tracking-tight mb-4">
            See what&apos;s moving in your market this week.
          </h2>
          <p className="theme-text-contrast-muted mb-8 leading-relaxed">
            We pull live Greenville County data and show you exactly which
            properties and businesses just changed hands.
          </p>
          <Link
            href="/contact"
            className="theme-cta-accent inline-flex items-center gap-2 font-semibold px-7 py-3.5 rounded-xl"
          >
            Book a Free Call
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
