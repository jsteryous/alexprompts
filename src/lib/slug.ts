/**
 * URL slugs for `blog_posts.slug`.
 *
 * Shared by the Substack mirror (which derives a slug when a feed item has no
 * usable path segment), the /admin "Write Article" flow (which mints a
 * placeholder for a brand-new draft), and the editor (which keeps a new draft's
 * slug following its title until Alex edits the slug himself). One function so
 * a slug written by hand and a slug written by a script are the same shape.
 */

/** Lowercase, hyphenated, ASCII-only. Empty string when there is nothing usable. */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

/** What a stored slug is allowed to look like. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(s: string): boolean {
  return s.length > 0 && s.length <= 120 && SLUG_PATTERN.test(s);
}

/** The placeholder a hand-started draft is created with, before it has a title. */
export function placeholderSlug(): string {
  return `untitled-${Math.random().toString(36).slice(2, 8)}`;
}

/** Is this slug still the minted placeholder (so the title may drive it)? */
export function isPlaceholderSlug(s: string): boolean {
  return /^untitled(-|$)/.test(s);
}
