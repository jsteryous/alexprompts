import Image from "next/image";
import { SITE_URL } from "@/lib/site";

/**
 * Card hero image for posts. Renders the post's cover when one exists, and a
 * branded ">" placeholder panel when it does not, so every card carries a
 * consistent visual header instead of a mix of image and naked text cards.
 *
 * Caller owns shape: pass aspect ratio + any rounding/border via `className`
 * (this clips its contents with overflow-hidden), and a `sizes` hint matching
 * that layout so the browser picks the right variant.
 *
 * Two rendering paths, chosen by where the cover lives:
 * - SAME-ORIGIN covers (the committed /greenville/library photos, stored as
 *   SITE_URL-absolute URLs) and SUPABASE covers (the old streetview PNGs,
 *   whitelisted in next.config remotePatterns) go through next/image, which
 *   serves a responsive srcset in AVIF/WebP. This is the mobile-LCP fix: a
 *   phone gets a ~60KB variant sized to its viewport instead of the full
 *   1400px ~300KB JPEG (or a multi-MB streetview PNG).
 * - Other REMOTE covers (the Substack CDN) stay a plain <img>: their hosts
 *   vary, and an un-whitelisted host would make next/image throw at request
 *   time, so the plain tag is the resilient choice there.
 */

const SUPABASE_HOST = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname;
  } catch {
    return null;
  }
})();

/** Cover URL -> a src next/image can optimize (root-relative path for
 *  same-origin, the absolute URL for the whitelisted Supabase host); null
 *  for any other remote host. */
function optimizableSrc(src: string): string | null {
  if (src.startsWith("/")) return src;
  try {
    const url = new URL(src);
    const site = new URL(SITE_URL);
    const strip = (h: string) => h.replace(/^www\./, "");
    if (strip(url.hostname) === strip(site.hostname)) return url.pathname;
    if (SUPABASE_HOST && url.hostname === SUPABASE_HOST) return src;
  } catch {
    return null;
  }
  return null;
}

export function PostCover({
  src,
  alt = "",
  className = "",
  priority = false,
  sizes = "100vw",
}: {
  src: string | null;
  alt?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  // NO COVER, NO SLOT (August 2026 newspaper pass). This used to render a
  // branded ">" panel, then briefly a blank plate, and the blank plate was
  // worse: it reserved a few hundred pixels of nothing above the headline and
  // read as a broken image. Not every story in a paper carries art, and one
  // that doesn't simply leads with its headline. Callers pass the aspect box
  // via `className`, so returning null collapses the slot cleanly.
  if (!src) return null;

  const optimizable = optimizableSrc(src);
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {optimizable ? (
        <Image
          src={optimizable}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  );
}
