import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { getPublishedPosts, postHref, formatDate } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Archive",
  description: "Everything Rebrew has published, newest first.",
  alternates: { canonical: `${site.url}/reporting` },
};

export const revalidate = 300;

/**
 * THE ARCHIVE, linked from the footer. Every published post, newest first, as a
 * plain list of date, title and summary in the same minimalist style as the
 * homepage.
 *
 * NO CATEGORIES (October 7, 2026, Alex's call). The Real Estate, Finance, Urban
 * Economics and Lifestyle tabs, their /reporting/<topic> routes and the section
 * badges are gone; the old topic URLs redirect here. The `topic:` tags still sit
 * on the rows and the editor can still set them, but nothing public reads them.
 *
 * The path stays /reporting so links to it keep working. It creates no article
 * URLs; each post still lives at its own section route via postHref().
 */
export default async function ArchivePage() {
  const posts = await getPublishedPosts();

  return (
    <section className="theme-page pt-36 md:pt-44 pb-24">
      <div className="max-w-2xl mx-auto px-6">
        <header className="text-center mb-16">
          <h1 className="font-serif italic theme-text-primary text-[2.25rem] md:text-[2.75rem] leading-tight tracking-tight">
            Archive
          </h1>
          <div className="mx-auto mt-8 h-px w-12 bg-[var(--accent)]" aria-hidden="true" />
        </header>

        {posts.length > 0 ? (
          <ol className="border-t theme-border">
            {posts.map((p) => (
              <li key={p.id} className="border-b theme-border">
                <Link href={postHref(p)} className="group block py-8">
                  {p.published_at && (
                    <time className="theme-text-muted type-eyebrow block mb-3">
                      {formatDate(p.published_at)}
                    </time>
                  )}
                  <h2 className="font-serif theme-text-primary text-[1.375rem] md:text-[1.5rem] leading-snug group-hover:opacity-70">
                    {p.title}
                  </h2>
                  {p.summary && (
                    <p className="font-serif theme-text-secondary text-[1rem] leading-relaxed mt-2">
                      {p.summary}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <p className="font-serif theme-text-secondary text-center text-[1.1875rem]">
            Nothing here yet.
          </p>
        )}
      </div>
    </section>
  );
}
