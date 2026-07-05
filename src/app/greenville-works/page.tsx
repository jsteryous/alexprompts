import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { getPublishedPosts, formatDate } from "@/lib/posts";
import { PostCover } from "@/components/PostCover";

export const metadata: Metadata = {
  title: "Greenville Works",
  description:
    "How Greenville is changing, and what those changes mean for where we live, work, and invest. " +
    "Development, infrastructure, utilities, manufacturing, transportation, and the technology reshaping " +
    "the Upstate, explained in plain English.",
  alternates: { canonical: `${site.url}/greenville-works` },
};

export const revalidate = 300;

export default async function GreenvilleWorksPage() {
  const posts = await getPublishedPosts(undefined, "works");

  return (
    <>
      <section className="theme-page theme-border pt-32 pb-16 border-b">
        <div className="max-w-3xl mx-auto px-6">
          <span className="theme-label inline-block text-xs font-semibold uppercase tracking-widest mb-4">
            Greenville Works
          </span>
          <h1 className="theme-text-primary text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
            How Greenville is changing, and what it means
          </h1>
          <p className="theme-text-muted text-lg max-w-xl leading-relaxed">
            I take one thing that is reshaping the Upstate, a new subdivision, a widening road, a
            data center, a factory, the power grid, or the technology behind them, and work out
            how it actually works and what it means for where we live, work, and invest. Plain
            English, no hype, and I name the trade-offs honestly.
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
                Each one takes a single change reshaping Greenville apart and shows what it means
                for where we live, work, and invest.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
