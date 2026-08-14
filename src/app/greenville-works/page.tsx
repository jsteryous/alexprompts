import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { getPublishedPosts, formatDate } from "@/lib/posts";
import { PostCover } from "@/components/PostCover";

/**
 * The BUSINESS section index. Relabelled from "SC Technology" August 14, 2026
 * with the scope widening; the route and the `greenville works` tag are
 * deliberately unchanged, because every published article URL hangs off them.
 *
 * This page is no longer the nav's Reporting target. /reporting lists every
 * piece across every tag and is the broad view; this is the narrow one, reached
 * from article breadcrumbs, the sitemap, and search.
 */
export const metadata: Metadata = {
  title: "Business",
  description:
    "How South Carolina companies actually make money, who pays them, why they sit where " +
    "they sit, and what would break them. Built from filings, permits, job postings, and " +
    "county records.",
  alternates: { canonical: `${site.url}/greenville-works` },
};

export const revalidate = 300;

export default async function GreenvilleWorksPage() {
  const posts = await getPublishedPosts(undefined, "works");

  return (
    <>
      <section className="theme-page theme-border pt-32 pb-16 border-b">
        <div className="max-w-3xl mx-auto px-6">
          <span
            className="theme-label type-eyebrow inline-block border-t-2 pt-2 mb-6"
            style={{ borderColor: "var(--accent)" }}
          >
            Business
          </span>
          <h1 className="theme-text-primary type-h1 mb-5">
            How the companies here actually make money
          </h1>
          <p className="theme-text-muted type-body-lg max-w-xl">
            A company announces three hundred jobs and the coverage stops there. These pieces
            take one South Carolina business apart instead: what it really sells, who pays it
            and why they keep paying, why it sits where it sits, and what would break it.
            Built from filings, permits, job postings, and county records.
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
                    href={`/greenville-works/${p.slug}`}
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
                Each one takes a single change reshaping South Carolina apart and shows what it
                means for where we live, work, and invest.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
