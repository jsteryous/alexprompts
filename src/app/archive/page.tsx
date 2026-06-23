import type { Metadata } from "next";
import Link from "next/link";
import { site, newsletterUrl } from "@/lib/site";
import { getPublishedPosts, formatDate } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Archive",
  description: `Every guide from ${site.name}. Learn to actually use AI, step by step, with no code and no jargon.`,
  alternates: { canonical: `${site.url}/archive` },
};

export const revalidate = 300;

export default async function ArchivePage() {
  const posts = await getPublishedPosts();

  return (
    <>
      <section className="theme-page theme-border pt-32 pb-16 border-b">
        <div className="max-w-3xl mx-auto px-6">
          <span className="theme-label inline-block text-xs font-semibold uppercase tracking-widest mb-4">
            The archive
          </span>
          <h1 className="theme-text-primary text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
            Every guide, in one place
          </h1>
          <p className="theme-text-muted text-lg max-w-xl leading-relaxed">
            Step-by-step walkthroughs for doing real things with AI. Read the back
            catalog here, or get the next one in your inbox.
          </p>
        </div>
      </section>

      <section className="theme-section py-16">
        <div className="max-w-3xl mx-auto px-6">
          {posts.length > 0 ? (
            <ul className="divide-y theme-border">
              {posts.map((p) => (
                <li key={p.id} className="py-7 first:pt-0">
                  <Link href={`/archive/${p.slug}`} className="group block">
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
              <p className="theme-text-secondary text-lg mb-2">No guides published yet.</p>
              <p className="theme-text-muted text-sm mb-6">
                Subscribe and you&apos;ll get the very first one.
              </p>
              <a
                href={newsletterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="theme-cta-accent inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-xl"
              >
                Subscribe free
              </a>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
