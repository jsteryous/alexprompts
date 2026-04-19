import Link from "next/link";

export interface InsightsListPost {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  tags: string[];
  published_at: string | null;
  created_at: string;
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function InsightsPostList({
  posts,
  emptyMessage = "No published insights yet. Check back soon.",
}: {
  posts: InsightsListPost[];
  emptyMessage?: string;
}) {
  if (posts.length === 0) {
    return (
      <section className="theme-section py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6 py-24 text-center">
          <p className="theme-text-muted text-sm">{emptyMessage}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="theme-section py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6">
        {posts.map((post, idx) => (
          <article
            key={post.id}
            className={`theme-border py-10 group ${idx === 0 ? "" : "border-t"}`}
          >
            <div className="flex flex-col md:flex-row md:items-start md:gap-16">
              <div className="flex-shrink-0 w-36 mb-3 md:mb-0">
                <time className="theme-text-muted text-xs font-medium">
                  {formatDate(post.published_at ?? post.created_at)}
                </time>
              </div>
              <div className="flex-1 min-w-0">
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="theme-badge text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <h2 className="theme-text-primary text-xl md:text-2xl font-bold tracking-tight mb-2 transition-colors">
                  <Link
                    href={`/insights/${post.slug}`}
                    className="theme-text-primary hover:opacity-80"
                  >
                    {post.title}
                  </Link>
                </h2>
                {post.summary && (
                  <p className="theme-text-muted text-sm leading-relaxed mb-4 max-w-2xl">
                    {post.summary}
                  </p>
                )}
                <Link
                  href={`/insights/${post.slug}`}
                  className="theme-text-primary inline-flex items-center gap-1.5 text-sm font-medium hover:opacity-80 transition-opacity"
                >
                  Read more
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
