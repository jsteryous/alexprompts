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
  const post = await getPost(slug, "realestate");
  if (!post) return { title: "Not found" };
  const image = articleOgImage(post);
  return {
    title: post.title,
    description: post.summary ?? undefined,
    alternates: { canonical: `${site.url}/real-estate/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.summary ?? undefined,
      type: "article",
      url: `${site.url}/real-estate/${post.slug}`,
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

export default async function RealEstatePostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug, "realestate");
  if (!post) notFound();
  return (
    <ArticleView
      post={post}
      section={{
        label: "Real Estate",
        basePath: "/real-estate",
        blurb:
          "I send free, step-by-step walkthroughs on putting Claude to work in real estate. The listings, the market research, the deal analysis, and the follow-up, shown plainly so you can do them yourself.",
      }}
    />
  );
}
