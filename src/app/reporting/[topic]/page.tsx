import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { site } from "@/lib/site";
import { getPublishedPosts } from "@/lib/posts";
import { TOPICS, isTopicKey, topicLabel, topicOf, type TopicKey } from "@/lib/topics";
import { ReportingView } from "../ReportingView";

/**
 * One topic tab of /reporting: the same list, filtered to posts carrying that
 * topic's `topic:` tag. Four static pages, one per entry in lib/topics.ts; any
 * other value 404s. Posts still link to their own section routes, so these pages
 * add no article URLs.
 */

type Props = {
  params: Promise<{ topic: string }>;
};

/** Meta descriptions only. The tabs themselves show no intro (Alex, Sept 30, 2026). */
const DESCRIPTIONS: Record<TopicKey, string> = {
  "real-estate":
    "These pieces follow what Greenville homes and buildings sell for, and who is buying them.",
  finance:
    "Here is what it costs to buy and own a house in Greenville, from the mortgage rate down " +
    "to the tax bill.",
  "urban-economics":
    "Greenville grows where the incentives point. These pieces trace who paid for the road " +
    "or the arena, and what they expected back.",
  lifestyle:
    "Living in Greenville has a texture the price data misses, and these pieces measure it " +
    "wherever it can be measured.",
};

export const revalidate = 300;
export const dynamicParams = false;

export function generateStaticParams() {
  return TOPICS.map((t) => ({ topic: t.key }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topic } = await params;
  if (!isTopicKey(topic)) return {};
  return {
    title: `${topicLabel(topic)} Reporting`,
    description: DESCRIPTIONS[topic],
    alternates: { canonical: `${site.url}/reporting/${topic}` },
  };
}

export default async function ReportingTopicPage({ params }: Props) {
  const { topic } = await params;
  if (!isTopicKey(topic)) notFound();
  const posts = (await getPublishedPosts()).filter((p) => topicOf(p) === topic);

  return (
    <ReportingView
      posts={posts}
      active={topic}
      heading={topicLabel(topic)}
    />
  );
}
