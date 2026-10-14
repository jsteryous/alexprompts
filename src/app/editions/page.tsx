import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { listEditions, editionDateLine, editionHref } from "@/lib/editions";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Back Numbers",
  description: "Every number of The Rebrew Intelligencer, newest first.",
  alternates: { canonical: `${site.url}/editions` },
};

/** Every number of the Intelligencer, newest first, as a plain ruled list. */
export default async function EditionsPage() {
  const editions = await listEditions();
  return (
    <section className="theme-page pt-32 md:pt-40 pb-24">
      <div className="max-w-2xl mx-auto px-6">
        <h1 className="font-serif theme-text-primary text-center text-[2.25rem] md:text-[2.75rem] leading-tight">
          Back Numbers
        </h1>
        <p className="font-serif theme-text-secondary text-center mt-3 mb-12">
          Every number of The Rebrew Intelligencer, newest first.
        </p>
        {editions.length > 0 ? (
          <ol className="border-t theme-border">
            {editions.map((e) => (
              <li key={e.number} className="border-b theme-border">
                <Link href={editionHref(e)} className="group block py-7">
                  <span className="theme-text-muted type-eyebrow block mb-2">
                    No. {e.number}. {editionDateLine(e.slug)}
                  </span>
                  <span className="font-serif theme-text-primary text-[1.375rem] leading-snug group-hover:opacity-70 block">
                    {e.headline}
                  </span>
                  {e.summary && (
                    <span className="font-serif theme-text-secondary text-[1rem] leading-relaxed mt-2 block">
                      {e.summary}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <p className="font-serif theme-text-secondary text-center">The first number is at the press.</p>
        )}
      </div>
    </section>
  );
}
