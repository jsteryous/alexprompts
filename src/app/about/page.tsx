import type { Metadata } from "next";
import Link from "next/link";
import { site, CONTACT_EMAIL, newsletterUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: site.description,
  alternates: { canonical: `${site.url}/about` },
};

/**
 * About, rewritten October 14, 2026 for The Rebrew Intelligencer. It says
 * plainly what the paper is, that a machine writes it, and which parts are
 * true and which are invented. The longer-running true stories are still
 * published and linked from the last paragraph.
 *
 * Earlier: About, reframed October 7, 2026 ("Just good stories.").
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
            The Rebrew Intelligencer prints the real news of the day the way a big-city
            American daily of 1945 would have printed it, with wire news, a Wall Street
            column, letters to the Editor and advertisements for remedies nobody should take.
            A new number comes out on Tuesday, Thursday and Saturday mornings.
          </p>
          <p>
            The name asks what is brewing. It began as a paper about real estate, and the RE
            at the front of it still stands for that, though the Editor now reports on
            whatever is brewing anywhere.
          </p>
          <p>
            The news is true. Every figure, name and date in the dispatches is checked
            against the sources listed at the foot of each number. The Editor, Mr. C. P.
            Langston, is an invention, and so are his household, his rival across the street,
            the letters (except those marked as from a reader) and the advertisements.
            Nothing in them is fact or advice.
          </p>
          <p>
            The paper is written and set in type by a machine, an artificial intelligence,
            with no person typing it. That is part of the experiment. If it gets a fact
            wrong, write in and the correction will run in the next number.
          </p>
          <p>
            Rebrew also tells longer true stories, which are in the{" "}
            <Link href="/reporting" className="theme-text-primary underline underline-offset-4 decoration-[var(--accent)]">
              Archive
            </Link>
            . Those go out by email when they are ready, and you can{" "}
            <a
              href={newsletterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="theme-text-primary underline underline-offset-4 decoration-[var(--accent)]"
            >
              subscribe here
            </a>
            . Letters to the Editor are written{" "}
            <Link href="/letters" className="theme-text-primary underline underline-offset-4 decoration-[var(--accent)]">
              here
            </Link>
            , and corrections and complaints go to{" "}
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
