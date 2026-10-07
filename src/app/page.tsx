import type { Metadata } from "next";
import Link from "next/link";
import { site, newsletterUrl } from "@/lib/site";
import { getStories, postHref, formatDate } from "@/lib/posts";

// Every page declares its own canonical (see layout.tsx and check:canonicals).
export const metadata: Metadata = {
  alternates: { canonical: `${site.url}/` },
};

export const revalidate = 300;

/**
 * THE FRONT PAGE, reframed October 7, 2026 ("Just good stories.").
 *
 * Minimalist on purpose, and the restraint is the design. One column, the
 * slogan, the stories as a plain list of titles, and one way to subscribe at the
 * bottom. No cover images, no badges, no feed grid, no calls to action above the
 * stories. A reader should see the slogan and then the first title, and nothing
 * should compete with either.
 *
 * Only posts tagged `story` appear here (see getStories in lib/posts.ts). The
 * real estate and sales work from the earlier beats keeps its URLs and lives on
 * /reporting, linked from the footer as the Archive.
 *
 * Subscribe points at Substack, which Alex made the primary channel in October
 * 2026. The owned list and its form still exist on /subscribe.
 */
export default async function HomePage() {
  const stories = await getStories();

  return (
    <section className="theme-page pt-36 md:pt-44 pb-24">
      <div className="max-w-2xl mx-auto px-6">
        <header className="text-center mb-16 md:mb-20">
          <h1 className="font-serif italic theme-text-primary text-[2.25rem] md:text-[3rem] leading-tight tracking-tight">
            {site.headline}
          </h1>
          <div className="mx-auto mt-8 h-px w-12 bg-[var(--accent)]" aria-hidden="true" />
        </header>

        {stories.length > 0 ? (
          <ol className="border-t theme-border">
            {stories.map((s) => (
              <li key={s.id} className="border-b theme-border">
                <Link href={postHref(s)} className="group block py-9">
                  {s.published_at && (
                    <time className="theme-text-muted type-eyebrow block mb-3">
                      {formatDate(s.published_at)}
                    </time>
                  )}
                  <h2 className="font-serif theme-text-primary text-[1.625rem] md:text-[1.875rem] leading-snug group-hover:opacity-70">
                    {s.title}
                  </h2>
                  {s.summary && (
                    <p className="font-serif theme-text-secondary text-[1.0625rem] leading-relaxed mt-3">
                      {s.summary}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <p className="font-serif theme-text-secondary text-center text-[1.1875rem]">
            The first story is on its way.
          </p>
        )}

        <div className="text-center mt-20">
          <p className="font-serif theme-text-secondary text-[1.0625rem] mb-6">
            New stories by email, when they are ready.
          </p>
          <a
            href={newsletterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="theme-cta type-eyebrow inline-block px-7 py-3.5"
          >
            Subscribe
          </a>
        </div>
      </div>
    </section>
  );
}
