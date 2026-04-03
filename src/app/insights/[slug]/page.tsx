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
      <section className="bg-white pt-32 pb-12 border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-6">
          <Link
            href="/insights"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-black transition-colors mb-8"
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
                  className="text-xs font-semibold uppercase tracking-widest text-green-700 bg-green-50 px-2 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-black leading-tight mb-4">
            {post.title}
          </h1>

          {post.summary && (
            <p className="text-lg text-gray-500 leading-relaxed mb-6">{post.summary}</p>
          )}

          <div className="flex items-center gap-3 text-sm text-gray-400">
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
      <section className="bg-white py-16">
        <div className="max-w-2xl mx-auto px-6">
          <div
            className="prose prose-gray max-w-none"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-gray-950 py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-500 mb-4">
            REBB Advisors
          </span>
          <h2 className="text-3xl font-bold text-white tracking-tight mb-4">
            See what&apos;s moving in your market this week.
          </h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            We pull live Greenville County data and show you exactly which
            properties and businesses just changed hands.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-green-500 text-black font-semibold px-7 py-3.5 rounded-xl hover:bg-green-400 transition-colors"
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
