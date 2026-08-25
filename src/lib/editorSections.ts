/**
 * The sections a post can be filed under, as the editor's settings panel needs
 * them: a label, the route it publishes to, and the tag that puts it there.
 *
 * `sectionOf` in posts.ts is still the authority on reading a section OFF a row;
 * this is the write side, the small table the settings panel offers. The keys
 * match `PostType` so the two never drift.
 */
import type { PostType } from "@/lib/posts";
import { BRIEFING_TAG, REALESTATE_TAG, WORKS_TAG } from "@/lib/posts";

export type SectionKey = PostType;

export const SECTIONS: Record<SectionKey, { label: string; base: string; tag: string | null }> = {
  works: { label: "Business", base: "/greenville-works", tag: WORKS_TAG },
  realestate: { label: "Real Estate", base: "/real-estate", tag: REALESTATE_TAG },
  briefing: { label: "Upstate Brief", base: "/briefing", tag: BRIEFING_TAG },
  newsletter: { label: "Archive", base: "/archive", tag: null },
};

/** Every tag that decides a section, so a section change can swap exactly one. */
const SECTION_TAGS = [REALESTATE_TAG, WORKS_TAG, BRIEFING_TAG];

/**
 * Move a post to `next`, keeping every tag that is not a section tag. Tags are
 * shown as badges on the published article, so the topical ones a writer added
 * have to survive a section change.
 */
export function retagForSection(tags: string[], next: SectionKey): string[] {
  const kept = tags.filter((t) => !SECTION_TAGS.includes(t.toLowerCase()));
  const tag = SECTIONS[next].tag;
  return tag ? [tag, ...kept] : kept;
}
