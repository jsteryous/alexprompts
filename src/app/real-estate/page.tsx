import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { getPublishedPosts, formatDate } from "@/lib/posts";
import { PostCover } from "@/components/PostCover";

export const metadata: Metadata = {
  title: "Moving to Greenville, SC",
  description:
    "Honest guides to moving to and buying in Greenville, South Carolina. Neighborhoods, " +
    "prices, commutes, property taxes, and the real trade-offs, grounded in current local data.",
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
            Greenville, SC
          </span>
          <h1 className="theme-text-primary text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
            Honest guides to moving to and buying in Greenville
          </h1>
          <p className="theme-text-muted text-lg max-w-xl leading-relaxed">
            Where to live, what it really costs, and how buying here actually works. Every
            guide is grounded in current local data with sources you can check, and every
            figure is dated because prices move. When you are ready for a human in your
            corner, I connect you with a vetted local agent at no cost.
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
