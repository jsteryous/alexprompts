import type { Metadata } from "next";
import { site } from "@/lib/site";
import { PAPER_FONTS_HREF } from "@/lib/paperFonts";
import { getOfficeData } from "@/lib/office";
import OfficeScene from "@/components/office/OfficeScene";

export const revalidate = 300;

const title = "The Editor's Office";
const description =
  "Mr. J. T. Langston is out. Have a look around his office: the coffee can, the missing barometer, Hatcher's portrait and everything else from the pages of The Rebrew Intelligencer.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${site.url}/office` },
  openGraph: { title, description, type: "website", url: `${site.url}/office` },
  twitter: { card: "summary_large_image", title, description },
};

/**
 * THE EDITOR'S OFFICE (October 14, 2026). The paper's world as a room to poke
 * around in: a real 1941 photograph with clickable spots (components/office/OfficeScene.tsx), fed
 * from the printed numbers by src/lib/office.ts, so the room keeps itself up.
 */
export default async function OfficePage() {
  const data = await getOfficeData();
  return (
    <section className="theme-page pt-24 md:pt-28 pb-20">
      <link
        rel="stylesheet"
        href={PAPER_FONTS_HREF}
        precedence="default"
      />
      <div className="max-w-6xl mx-auto px-3 md:px-6">
        <header className="text-center mb-5 md:mb-7">
          <h1 className="office-title">The Editor&apos;s Office</h1>
          <p className="office-sub">Mr. Langston is out. Have a look around. Everything in here comes from the paper.</p>
        </header>
        <OfficeScene data={data} />
      </div>
    </section>
  );
}
