import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { site } from "@/lib/site";
import { getEdition, neighbours } from "@/lib/editions";
import EditionView from "@/components/EditionView";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const edition = await getEdition(slug);
  if (!edition) return { alternates: { canonical: `${site.url}/edition/${slug}` } };
  const title = `${edition.headline} (No. ${edition.number})`;
  const description = edition.summary ?? "The Rebrew Intelligencer: the real news, printed as a 1945 newspaper.";
  return {
    title,
    description,
    alternates: { canonical: `${site.url}/edition/${edition.slug}` },
    openGraph: { title, description, type: "article", url: `${site.url}/edition/${edition.slug}` },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** One number of The Rebrew Intelligencer at its permanent address. */
export default async function EditionPage({ params }: Props) {
  const { slug } = await params;
  const edition = await getEdition(slug);
  if (!edition) notFound();
  const { prev, next } = await neighbours(edition.number);
  return <EditionView edition={edition} prev={prev} next={next} />;
}
