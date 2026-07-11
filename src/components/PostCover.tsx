/**
 * Card hero image for posts. Renders the post's cover when one exists, and a
 * branded ">" placeholder panel when it does not, so every card carries a
 * consistent visual header instead of a mix of image and naked text cards.
 *
 * Caller owns shape: pass aspect ratio + any rounding/border via `className`
 * (this clips its contents with overflow-hidden). The cover is a plain <img>
 * on purpose: Substack CDN hosts vary, and next/image would need every host
 * whitelisted in next.config remotePatterns. These are decorative thumbnails,
 * so lazy-loading a normal <img> is the resilient choice.
 */
export function PostCover({
  src,
  alt = "",
  className = "",
  priority = false,
}: {
  src: string | null;
  alt?: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: "var(--accent-soft)" }}
        >
          <span
            className="theme-label select-none font-extrabold leading-none"
            style={{ fontSize: "clamp(3rem, 8vw, 6rem)", opacity: 0.22 }}
            aria-hidden
          >
            {">"}
          </span>
        </div>
      )}
    </div>
  );
}
