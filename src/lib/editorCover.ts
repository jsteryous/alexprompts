/**
 * Cover preview for the draft editors (/admin/edit/[id] and /review).
 *
 * Drafts used to look cover-less during review because the finalize cron only
 * touches PUBLISHED rows. The publish route now stamps the curated library
 * cover the moment Alex publishes, and this helper shows him, while he is
 * still reviewing, exactly which photo that will be. Same resolution rules as
 * the publish route: the writer's image_address, with the city-level default
 * for a local-section row that is missing one.
 */
import { DEFAULT_SUBJECT, resolveLibraryCover } from "@/lib/greenvilleCovers";
import { sectionOf } from "@/lib/posts";

export interface EditorCover {
  url: string;
  label: string;
  credit: string | null;
}

export function resolveEditorCover(post: {
  tags: string[] | null;
  slug?: string | null;
  cover_image?: string | null;
  cover_credit?: string | null;
  image_address?: string | null;
}): EditorCover | null {
  if (post.cover_image) {
    return { url: post.cover_image, label: "Cover", credit: post.cover_credit ?? null };
  }
  if (sectionOf(post) === "newsletter") return null;
  const lib = resolveLibraryCover(post.image_address ?? DEFAULT_SUBJECT, post.slug ?? "");
  if (!lib) return null;
  return {
    url: lib.url,
    label: `Publishes with this cover (${lib.subject})`,
    credit: lib.credit,
  };
}
