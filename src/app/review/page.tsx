import { createClient } from "@supabase/supabase-js";
import { marked } from "marked";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ id?: string; token?: string }>;
}

async function getPost(id: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  const client = createClient(url, key);
  const { data } = await client
    .from("blog_posts")
    .select("id, title, slug, summary, body_md, status, created_at, topic, tags")
    .eq("id", id)
    .single();
  return data;
}

export default async function ReviewPage({ searchParams }: Props) {
  const { id, token } = await searchParams;
  const secret = process.env.PUBLISH_SECRET;

  // ── Auth ──────────────────────────────────────────────────────────────────
  if (!secret || !id || !token || token !== secret) {
    return <ErrorPage heading="Unauthorized" body="Invalid or missing token." />;
  }

  const post = await getPost(id);
  if (!post) {
    return <ErrorPage heading="Not found" body={`No post found with ID: ${id}`} />;
  }

  const publishUrl = `/api/publish?id=${id}&token=${token}`;
  const bodyHtml = await marked(post.body_md ?? "");
  const created = post.created_at?.slice(0, 10) ?? "";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-green-600">
            REBB Advisors · Draft Review
          </span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded font-medium uppercase">
            {post.status}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-black transition-colors"
          >
            ← Site
          </Link>
          {post.status !== "PUBLISHED" && (
            <a
              href={publishUrl}
              className="inline-flex items-center gap-2 bg-green-500 text-black font-semibold text-sm px-5 py-2 rounded-lg hover:bg-green-400 transition-colors"
            >
              Publish Now →
            </a>
          )}
          {post.status === "PUBLISHED" && (
            <Link
              href={`/insights/${post.slug}`}
              className="inline-flex items-center gap-2 bg-black text-white font-semibold text-sm px-5 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              View Live →
            </Link>
          )}
        </div>
      </div>

      {/* ── Article ── */}
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Meta */}
        <div className="mb-8">
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
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-black leading-tight mb-3">
            {post.title}
          </h1>
          {post.summary && (
            <p className="text-lg text-gray-500 leading-relaxed mb-4">{post.summary}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-gray-400">
            {created && <span>Generated {created}</span>}
            {post.topic && <span>· Topic: {post.topic}</span>}
          </div>
        </div>

        <hr className="border-gray-200 mb-8" />

        {/* Body */}
        <div
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />

        {/* Bottom CTA */}
        {post.status !== "PUBLISHED" && (
          <div className="mt-16 pt-8 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">Ready to go live?</p>
            <a
              href={publishUrl}
              className="inline-flex items-center gap-2 bg-green-500 text-black font-semibold px-6 py-3 rounded-xl hover:bg-green-400 transition-colors"
            >
              Publish Now →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function ErrorPage({ heading, body }: { heading: string; body: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-12 max-w-md w-full text-center">
        <h1 className="text-xl font-bold text-black mb-3">{heading}</h1>
        <p className="text-sm text-gray-500">{body}</p>
        <Link href="/" className="inline-block mt-6 text-sm text-gray-500 hover:text-black">
          ← rebbadvisors.com
        </Link>
      </div>
    </div>
  );
}
