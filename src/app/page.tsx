import type { Metadata } from "next";
import { site } from "@/lib/site";
import { getLatestEdition, neighbours } from "@/lib/editions";
import EditionView from "@/components/EditionView";

// Every page declares its own canonical (see layout.tsx and check:canonicals).
export const metadata: Metadata = {
  alternates: { canonical: `${site.url}/` },
};

export const revalidate = 300;

/**
 * THE FRONT PAGE IS THE NEWSPAPER (October 14, 2026).
 *
 * Alex handed the site over with one goal, the most entertaining content
 * possible and the attention that follows it, and the answer was The Rebrew
 * Intelligencer: the real news, three mornings a week, printed as an 1860s
 * broadsheet. The front page always shows the latest number; each number also
 * keeps its own URL at /edition/<date>, and /editions lists them all.
 *
 * Editions are rows in `intelligencer_editions`, written by the cloud routine
 * "Rebrew Intelligencer press". The true stories that used to live here are
 * still published at their URLs and listed on /reporting (the Archive).
 */
export default async function HomePage() {
  const edition = await getLatestEdition();

  if (!edition) {
    return (
      <section className="theme-page pt-40 pb-32">
        <p className="font-serif theme-text-secondary text-center text-[1.1875rem]">
          The first number of the Intelligencer is at the press.
        </p>
      </section>
    );
  }

  const { prev } = await neighbours(edition.number);
  return <EditionView edition={edition} prev={prev} />;
}
