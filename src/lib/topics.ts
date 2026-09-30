/**
 * TOPICS — the four tabs on /reporting (added September 30, 2026, at Alex's call):
 * Real Estate, Finance, Urban Economics, Lifestyle.
 *
 * A topic is NOT a section. The section (posts.ts `sectionOf`) decides a post's
 * URL and never moves once it is published. The topic decides only which tab it
 * shows under, so it can be changed on a live post without breaking anything.
 * Keeping the two apart is what let the tabs arrive without a single redirect.
 *
 * A topic is stored as one prefixed tag, `topic:<key>`, beside the section tag.
 * The prefix keeps it from colliding with a plain topical tag an engine writes
 * (the old `real estate` tag, `energy`) and makes it trivial to hide from the
 * article's tag badges, which show the label instead.
 *
 * Sales pieces are deliberately filed under Real Estate: Alex is moving away
 * from sales content and expects what remains to converge with real estate.
 */

export type TopicKey = "real-estate" | "finance" | "urban-economics" | "lifestyle";

export const TOPIC_PREFIX = "topic:";

/** Tab order on /reporting. */
export const TOPICS: { key: TopicKey; label: string }[] = [
  { key: "real-estate", label: "Real Estate" },
  { key: "finance", label: "Finance" },
  { key: "urban-economics", label: "Urban Economics" },
  { key: "lifestyle", label: "Lifestyle" },
];

export function topicTag(key: TopicKey): string {
  return `${TOPIC_PREFIX}${key}`;
}

export function isTopicTag(tag: string): boolean {
  return tag.toLowerCase().startsWith(TOPIC_PREFIX);
}

export function isTopicKey(value: unknown): value is TopicKey {
  return typeof value === "string" && TOPICS.some((t) => t.key === value);
}

/** The one topic a post is filed under, or null if it has none yet. */
export function topicOf(post: { tags: string[] | null }): TopicKey | null {
  for (const tag of post.tags ?? []) {
    if (!isTopicTag(tag)) continue;
    const key = tag.slice(TOPIC_PREFIX.length).toLowerCase();
    if (isTopicKey(key)) return key;
  }
  return null;
}

export function topicLabel(key: TopicKey): string {
  return TOPICS.find((t) => t.key === key)?.label ?? key;
}

/** Set a post's topic (or clear it with null), keeping every other tag in place. */
export function retagForTopic(tags: string[], next: TopicKey | null): string[] {
  const kept = tags.filter((t) => !isTopicTag(t));
  return next ? [...kept, topicTag(next)] : kept;
}
