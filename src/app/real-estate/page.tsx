import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { getPublishedPosts, formatDate } from "@/lib/posts";
import { PostCover } from "@/components/PostCover";

/**
 * THE REAL ESTATE section index, one of the two live sections as of August 25,
 * 2026 (the other is /sales). It was titled "Moving to Greenville, SC", which
 * described the relocation guides that make up most of the archive here but is
 * too narrow for a section that now also holds the market and development
 * pieces. The route and the `greenville` tag are unchanged.
 */
export const metadata: Metadata = {
  title: "Real Estate",
  description:
    "The Greenville market and what is actually happening to it. Neighborhoods, prices, " +
    "property taxes, what is getting built, and the trade-offs, grounded in local data.",
  alternates: { canonical: `${site.url}/real-estate` },
};

export const revalidate = 300;

export default async function RealEstatePage() {
  const posts = await getPublishedPosts(undefined, "realestate");

  return (
    <>
      <section className="theme-page theme-border pt-32 pb-16 border-b">
        <div className="max-w-3xl mx-auto px-6">
          <span className="theme-label inline-block text-xs font-semibold uppercase tracking-widest mb-4">
            Real Estate
          </span>
          <h1 className="theme-text-primary text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
            The Greenville market, and what is really happening to it
          </h1>
          <p className="theme-text-muted text-lg max-w-xl leading-relaxed">
            Where to live, what it really costs, what is getting built, and how buying here
            actually works. Every figure is dated, because prices move, and every source is
            one you can go and check. When you are ready for a human in your corner, tell me
            what you are working on and I will help.
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
                    href={`/real-estate/${p.slug}`}
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
              <p className="theme-text-secondary text-lg mb-2">The first guide is on its way.</p>
              <p className="theme-text-muted text-sm">
                Honest, data-grounded guides to moving to and buying in Greenville, one
                question at a time.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
