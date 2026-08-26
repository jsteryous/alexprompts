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
  const post = await getPost(slug, "briefing");
  if (!post) return { title: "Not found" };
  const image = articleOgImage(post);
  return {
    title: post.title,
    description: post.summary ?? undefined,
    alternates: { canonical: `${site.url}/briefing/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.summary ?? undefined,
      type: "article",
      url: `${site.url}/briefing/${post.slug}`,
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

export default async function BriefingPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug, "briefing");
  if (!post) notFound();
  return (
    <ArticleView
      post={post}
      section={{
        label: "Upstate Brief",
        basePath: "/briefing",
        // The brief is written for buyers and sellers, which is exactly who the
        // referral funnel serves, so it carries the buy/sell offer. It shipped
        // without one until July 30, 2026.
        showReferralCta: true,
      }}
    />
  );
}
