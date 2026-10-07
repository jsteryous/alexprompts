import type { Metadata } from "next";
import { site, CONTACT_EMAIL, newsletterUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: site.description,
  alternates: { canonical: `${site.url}/about` },
};

/**
 * About, reframed October 7, 2026 ("Just good stories.").
 *
 * Three short paragraphs: what this is, the one promise that matters (it is
 * true), and how to reach us. The internal mission ("to share the most
 * entertaining stories of incredible people or events") steers the writing and
 * is deliberately NOT printed here as a mission statement.
 *
 * Carried over from the earlier masthead and still binding: no photo, no
 * resume, and no personal name (Alex asked for his name off the site on
 * September 19, 2026). The page speaks for the publication, not the person.
 */
export default function AboutPage() {
  return (
    <section className="theme-page pt-36 md:pt-44 pb-24">
      <div className="max-w-xl mx-auto px-6">
        <h1 className="font-serif italic theme-text-primary text-center text-[2.25rem] md:text-[2.75rem] leading-tight tracking-tight">
          About
        </h1>
        <div className="mx-auto mt-8 mb-14 h-px w-12 bg-[var(--accent)]" aria-hidden="true" />

        <div className="font-serif theme-text-secondary text-[1.125rem] md:text-[1.1875rem] leading-[1.75] space-y-6">
          <p>
            Rebrew tells true stories about incredible people and the things they built.
            Some of them are famous. Most of the best ones are not.
          </p>
          <p>
            Every story here is true. Each scene and each quote comes from the record, and
            where the record goes quiet, the story says so rather than filling the gap.
          </p>
          <p>
            New stories go out by email when they are ready, and you can{" "}
            <a
              href={newsletterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="theme-text-primary underline underline-offset-4 decoration-[var(--accent)]"
            >
              subscribe here
            </a>
            . If you know a story worth telling, write to{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="theme-text-primary underline underline-offset-4 decoration-[var(--accent)]"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
