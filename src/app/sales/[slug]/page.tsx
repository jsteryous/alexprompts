import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { site } from "@/lib/site";
import { getPost, articleOgImage } from "@/lib/posts";
import ArticleView from "@/components/ArticleView";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug, "sales");
  if (!post) return { title: "Not found" };
  const image = articleOgImage(post);
  return {
    title: post.title,
    description: post.summary ?? undefined,
    alternates: { canonical: `${site.url}/sales/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.summary ?? undefined,
      type: "article",
      url: `${site.url}/sales/${post.slug}`,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary ?? undefined,
      images: [image],
    },
  };
}

export default async function SalesPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug, "sales");
  if (!post) notFound();
  return (
    <ArticleView
      post={post}
      section={{
        label: "Sales",
        basePath: "/sales",
        // ON as of August 25, 2026. This section was created out of the old
        // /greenville-works, where the CTA was deliberately off because those
        // pieces were company teardowns for developers. Sales carries the
        // seller-facing research now, and the August 24 piece on getting the
        // best sale price had a buy/sell link pasted into its body by hand
        // because nothing rendered one. That is the section telling you what it
        // needs.
        showReferralCta: true,
      }}
    />
  );
}
