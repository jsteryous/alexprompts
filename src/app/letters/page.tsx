import type { Metadata } from "next";
import { site } from "@/lib/site";
import { LetterForm } from "@/components/LetterForm";

export const metadata: Metadata = {
  title: "Letters to the Editor",
  description: "Write to Mr. J. T. Langston, Editor of The Rebrew Intelligencer. The best letters are printed, with his reply.",
  alternates: { canonical: `${site.url}/letters` },
};

/**
 * Letters to the Editor from real readers (October 14, 2026; see
 * src/lib/letters.ts). Printed letters are marked as from a reader on the page,
 * which is what keeps the colophon's "the letters are inventions" true.
 */
export default function LettersPage() {
  return (
    <section className="theme-page pt-36 md:pt-44 pb-24">
      <div className="max-w-xl mx-auto px-6">
        <h1 className="font-serif italic theme-text-primary text-center text-[2.25rem] md:text-[2.75rem] leading-tight tracking-tight">
          Letters to the Editor
        </h1>
        <div className="mx-auto mt-8 mb-10 h-px w-12 bg-[var(--accent)]" aria-hidden="true" />
        <div className="font-serif theme-text-secondary text-[1.0625rem] leading-[1.7] space-y-4 mb-10">
          <p>
            Mr. Langston reads every letter that reaches his desk, and prints the best of them beside his
            reply. Write about the news, about something the paper got wrong, or about any modern
            nuisance you would like explained to a man of 1945.
          </p>
          <p>
            Letters are printed as you write and sign them, and carry no links. Your email
            address is never printed and is used only if the Editor wishes to write back.
          </p>
        </div>
        <LetterForm />
      </div>
    </section>
  );
}
