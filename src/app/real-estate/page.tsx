import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { getPublishedPosts, formatDate } from "@/lib/posts";
import { PostCover } from "@/components/PostCover";

export const metadata: Metadata = {
  title: "Greenville Real Estate",
  description:
    "Greenville, SC real estate, both sides. The local housing story with the consensus " +
    "and the strongest counter-case laid out so you can decide for yourself.",
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
            Greenville real estate, both sides
          </h1>
          <p className="theme-text-muted text-lg max-w-xl leading-relaxed">
            The local housing story, what most people think, and the strongest case for the
            other side. You get the whole argument, then you decide. Information only, not
            financial advice.
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
              <p className="theme-text-secondary text-lg mb-2">No posts yet.</p>
              <p className="theme-text-muted text-sm">
                The first Greenville real-estate breakdown is on its way.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
