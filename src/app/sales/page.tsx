import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { getPublishedPosts, formatDate } from "@/lib/posts";
import { PostCover } from "@/components/PostCover";

/**
 * The SALES section index.
 *
 * RENAMED FROM /greenville-works on August 25, 2026, tag and route together, at
 * Alex's call: two live sections, Sales and Real Estate. The old tag named the
 * engine that wrote a piece rather than the subject, so an article about sales
 * leaderboards badged as "Business" and a reader had no way to know what the
 * section was for. Old URLs are kept alive by permanent redirects in
 * next.config.ts; the two data-center pieces that belonged in Real Estate rather
 * than Sales moved with their own redirects, listed ahead of the catch-all.
 *
 * This page is not the nav's Reporting target. /reporting lists every piece
 * across every tag and is the broad view; this is the narrow one, reached from
 * article breadcrumbs, the sitemap, and search.
 */
export const metadata: Metadata = {
  title: "Sales",
  description:
    "What the research says about how a sale actually gets made, from pricing a house to " +
    "whether a leaderboard makes a sales floor perform. Every study named, so you can read it.",
  alternates: { canonical: `${site.url}/sales` },
};

export const revalidate = 300;

export default async function GreenvilleWorksPage() {
  const posts = await getPublishedPosts(undefined, "sales");

  return (
    <>
      <section className="theme-page theme-border pt-32 pb-16 border-b">
        <div className="max-w-3xl mx-auto px-6">
          <span
            className="theme-label type-eyebrow inline-block border-t-2 pt-2 mb-6"
            style={{ borderColor: "var(--accent)" }}
          >
            Sales
          </span>
          <h1 className="theme-text-primary type-h1 mb-5">
            How a sale actually gets made
          </h1>
          <p className="theme-text-muted type-body-lg max-w-xl">
            These pieces start with a study. What a listing price does to the number a house
            finally sells for, whether a leaderboard makes a sales floor perform, what
            actually changes a buyer&apos;s mind. Then they work out whether the finding
            survives contact with the way people really sell here. Every study gets named,
            so you can go and read it yourself.
          </p>
        </div>
      </section>

      <section className="theme-section py-16">
        <div className="max-w-3xl mx-auto px-6">
          {posts.length > 0 ? (
            <ul className="divide-y theme-border">
              {posts.map((p) => (
                <li key={p.id} className="py-7 first:pt-0">
                  <Link
                    href={`/sales/${p.slug}`}
                    className="group grid grid-cols-1 sm:grid-cols-[12rem_1fr] gap-5"
                  >
                    <PostCover
                      src={p.cover_image}
                      alt={p.title}
                      sizes="(max-width: 640px) 100vw, 192px"
                      className="aspect-[16/9] w-full rounded-lg border theme-border"
                    />
                    <div>
                      {p.published_at && (
                        <time className="theme-text-muted text-xs uppercase tracking-widest">
                          {formatDate(p.published_at)}
                        </time>
                      )}
                      <h2 className="theme-text-primary text-xl md:text-2xl font-semibold leading-snug mt-2 mb-2 group-hover:opacity-80">
                        {p.title}
                      </h2>
                      {p.summary && (
                        <p className="theme-text-muted text-base leading-relaxed">{p.summary}</p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="theme-card border theme-border rounded-xl p-10 text-center">
              <p className="theme-text-secondary text-lg mb-2">The first pieces are on the way.</p>
              <p className="theme-text-muted text-sm">
                Each one takes a single change reshaping Greenville apart and shows what it
                means for where we live and invest.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
