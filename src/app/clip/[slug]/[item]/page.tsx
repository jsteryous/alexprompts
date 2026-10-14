import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/lib/site";
import { PAPER_FONTS_HREF } from "@/lib/paperFonts";
import { getEdition, editionDateLine } from "@/lib/editions";
import { clipImagePath, clipPath, findClip, parseExcerpt, tornEdge } from "@/lib/clips";
import ClipShare from "@/components/ClipShare";

export const revalidate = 300;

type Props = {
  params: Promise<{ slug: string; item: string }>;
  searchParams: Promise<{ l?: string }>;
};

async function load({ params, searchParams }: Props) {
  const [{ slug, item }, { l }] = await Promise.all([params, searchParams]);
  const edition = await getEdition(slug);
  const clip = edition ? findClip(edition, item) : null;
  if (!edition || !clip) return null;
  return { edition, clip, excerpt: parseExcerpt(clip, l) };
}

/**
 * A clipping's link preview is the clipping itself (/api/clip-image). Clip pages
 * are not indexed: each is a doorway to a number, and the number is the page
 * that should rank.
 */
export async function generateMetadata(props: Props): Promise<Metadata> {
  const found = await load(props);
  if (!found) return { robots: { index: false } };
  const { edition, clip, excerpt } = found;
  const headline = clip.headline?.replace(/\.$/, "");
  const title = excerpt ? `“${excerpt.text.length > 90 ? `${excerpt.text.slice(0, 88).trimEnd()}…` : excerpt.text}”` : headline ?? clip.department;
  const description = `Clipped from The Rebrew Intelligencer, No. ${edition.number}. The real news, printed as a 1945 newspaper.`;
  const image = { url: `${site.url}${clipImagePath(edition.slug, clip.id, excerpt)}`, width: 1200, height: 630, alt: title };
  return {
    title,
    description,
    robots: { index: false, follow: true },
    openGraph: { title, description, type: "article", url: `${site.url}${clipPath(edition.slug, clip.id, excerpt)}`, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
  };
}

export default async function ClipPage(props: Props) {
  const found = await load(props);
  if (!found) notFound();
  const { edition, clip, excerpt } = found;
  const edge = tornEdge(`${edition.slug}/${clip.id}/page`, 100, 100)
    .map(([x, y]) => `${x.toFixed(2)}% ${y.toFixed(2)}%`)
    .join(", ");
  const url = `${site.url}${clipPath(edition.slug, clip.id, excerpt)}`;
  const headline = clip.headline?.replace(/\.$/, "");

  return (
    <section className="theme-page pt-28 md:pt-36 pb-24">
      {/* The same period faces EditionView loads; next/font/google breaks Turbopack (src/CLAUDE.md). */}
      <link
        rel="stylesheet"
        href={PAPER_FONTS_HREF}
        precedence="default"
      />
      <div className="max-w-2xl mx-auto px-4">
        <article className="clip-paper" style={{ clipPath: `polygon(${edge})` }}>
          <header className="text-center">
            <p className="clip-nameplate">The Rebrew Intelligencer</p>
            <div className="clip-rule-heavy" />
            <p className="clip-dateline">
              <span>{clip.department}</span>
              <span>
                No. {edition.number} · {editionDateLine(edition.slug)}
              </span>
            </p>
            <div className="clip-rule" />
          </header>

          {excerpt ? (
            <>
              <blockquote className="clip-excerpt">“{excerpt.text}”</blockquote>
              {headline && <p className="clip-from">From “{headline}”</p>}
            </>
          ) : (
            <>
              {headline && <h1 className="clip-headline">{headline}</h1>}
              {clip.paragraphs.map((p, i) => (
                <p key={i} className={clip.kind === "ad" ? "clip-ad-line" : "clip-body"}>
                  {i === 0 && clip.dateline && <span className="clip-dateline-inline">{clip.dateline}. </span>}
                  {p}
                </p>
              ))}
              {clip.signed && <p className="clip-signed">{clip.signed}</p>}
            </>
          )}

          <p className="clip-credit">Clipped from The Rebrew Intelligencer · rebrew.org</p>
        </article>

        <div className="mt-10">
          <ClipShare
            url={url}
            imageUrl={clipImagePath(edition.slug, clip.id, excerpt)}
            title={headline ?? "The Rebrew Intelligencer"}
            fileName={`intelligencer-no${edition.number}-${clip.id}.png`}
          />
        </div>

        <p className="mt-10 text-center">
          <Link href={`/edition/${edition.slug}#${clip.id}`} className="theme-link type-eyebrow">
            Read the whole edition
          </Link>
        </p>
      </div>
    </section>
  );
}
