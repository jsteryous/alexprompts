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
          "I write honest, plain-English guides to buying, selling, and living in Greenville, South Carolina, grounded in real local data. Subscribe and I will send the next one straight to your inbox.",
      }}
    />
  );
}
