/**
 * The remote hosts the Next image optimizer is allowed to fetch, in ONE place.
 *
 * Three files need this list and they must agree, or images silently fall off
 * the fast path: `next.config.ts` (`images.remotePatterns`, which is what the
 * optimizer enforces), `components/PostCover.tsx` (card and hero covers), and
 * `lib/renderMarkdown.ts` (images inside an article body). They disagreed
 * until August 27, 2026, and the cost was real: covers moved to Pexels when
 * Alex started picking his own photos, nothing whitelisted that host, so
 * PostCover fell back to a plain <img> and the homepage shipped three
 * full-resolution originals of 3.0MB, 7.4MB, and 3.9MB to render three 312px
 * thumbnails. Eighteen of the thirty-seven published posts were on that path.
 *
 * A host earns a place here only if we trust it and it actually appears in
 * `blog_posts.cover_image` or in a body. An un-whitelisted host is not a
 * crash: both callers check this list first and leave the original `src`
 * alone, so the image still renders, just unoptimized.
 *
 * Kept dependency-free on purpose. `next.config.ts` imports it outside the
 * app's module graph, so no `@/` alias, no React, no server-only imports.
 */

/** The site's own Supabase Storage, where admin-editor uploads land. Derived
 *  from env so a project move follows automatically; null when unset, which is
 *  the local-without-env case. */
export const SUPABASE_IMAGE_HOST: string | null = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname;
  } catch {
    return null;
  }
})();

/** Stock and reference hosts Alex pulls covers from by hand. Pexels is the
 *  standing one: it serves originals at full camera resolution, which is
 *  exactly the case the optimizer exists for. Wikimedia is the leftover from
 *  the deleted cover library, still on one published post.
 *
 *  substackcdn.com is deliberately ABSENT. Those two mirrored posts come
 *  through Substack's own fetch proxy, which has already resized them, and
 *  the mirror's hosts vary in a way a fixed allowlist cannot track. */
const STATIC_IMAGE_HOSTS = ["images.pexels.com", "upload.wikimedia.org"];

/** Every host the optimizer may fetch. */
export const OPTIMIZABLE_IMAGE_HOSTS: string[] = [
  ...STATIC_IMAGE_HOSTS,
  ...(SUPABASE_IMAGE_HOST ? [SUPABASE_IMAGE_HOST] : []),
];

/** True when the optimizer will accept an absolute URL on this host. */
export function isOptimizableHost(hostname: string): boolean {
  return OPTIMIZABLE_IMAGE_HOSTS.includes(hostname);
}
