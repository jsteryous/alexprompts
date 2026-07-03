import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { getPublishedPosts, formatDate } from "@/lib/posts";

export const metadata: Metadata = {
  title: "The Lab",
  description:
    "What AI and modern software can actually do, and where they still fall short. One capability at a time, " +
    "explained in plain English, with the real business value and the honest limits.",
  alternates: { canonical: `${site.url}/lab` },
};

export const revalidate = 300;

export default async function LabPage() {
  const posts = await getPublishedPosts(undefined, "lab");

  return (
    <>
      <section className="theme-page theme-border pt-32 pb-16 border-b">
        <div className="max-w-3xl mx-auto px-6">
          <span className="theme-label inline-block text-xs font-semibold uppercase tracking-widest mb-4">
            The Lab
          </span>
          <h1 className="theme-text-primary text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
            What AI can really do, and where it breaks
          </h1>
          <p className="theme-text-muted text-lg max-w-xl leading-relaxed">
            I take one thing AI or a piece of software can now do, work out how it actually
            works, and show where it creates real value for a business and where it still
            falls short. Plain English, no hype, and I tell you the parts that do not work yet.
          </p>
        </div>
      </section>

      <section className="theme-section py-16">
        <div className="max-w-3xl mx-auto px-6">
          {posts.length > 0 ? (
            <ul className="divide-y theme-border">
              {posts.map((p) => (
                <li key={p.id} className="py-7 first:pt-0">
                  <Link href={`/lab/${p.slug}`} className="group block">
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
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="theme-card border theme-border rounded-xl p-10 text-center">
              <p className="theme-text-secondary text-lg mb-2">The first pieces are on the way.</p>
              <p className="theme-text-muted text-sm">
                Each one takes a single AI capability apart and shows what it is actually good for.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
