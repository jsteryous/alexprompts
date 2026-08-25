/**
 * THE REBREW MARK. A pitched roof caps a mug body, the handle sits right, a
 * saucer bar grounds it, and a doorway is cut up from the base of the house.
 * Coffee and a house, one silhouette.
 *
 * Chosen August 25, 2026 alongside the plated favicon at `src/app/icon.svg`.
 * The two are the SAME drawing in two dresses, not two logos: the favicon
 * carries its own oxblood plate because a browser tab's background is not ours
 * to control, and this one draws in `currentColor` because the masthead's
 * background is.
 *
 * WHY THIS DOES NOT CONTRADICT THE NO-GLYPH RULE. The August 2026 newspaper
 * pass deleted the blinking `▌` caret and the giant `>` watermark and wrote
 * down "a publication's mark is its name set in type. Do not add a glyph
 * back." That rule was aimed at the retired AI-prompt motif, which was a
 * terminal affectation left over from the Alex Prompts positioning and stood
 * for nothing once the name changed. A publication's own mark is a different
 * object. The caret ban stands exactly as written; this is not a route around
 * it, so do not read this file as licence to reintroduce a caret, a chevron,
 * a blink, or a `>`.
 *
 * The doorway is a real hole (`fillRule="evenodd"`), never a shape painted in
 * the background colour. That is deliberate: the mark sits on the header
 * surface in light mode and on a different surface in dark, and a painted cut
 * would have to track both. A hole tracks nothing.
 *
 * Sized in `em` by the caller so it scales with the wordmark, which is fluid
 * (24px on a phone, 30px on a desktop). Do not hardcode pixels here.
 */
export default function Mark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* roof, overhanging the body by two units on each side so it reads as eaves */}
      <polygon points="6,14 15.5,5.5 25,14" fill="currentColor" />
      {/* body with the doorway subtracted */}
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M8 14h15v10H8z M13.5 18h4v6h-4z"
      />
      {/* saucer */}
      <rect x="5" y="25" width="21" height="2" fill="currentColor" />
      {/* handle */}
      <path
        d="M23 16.5C27.5 16.5 27.5 22 23 22"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.8"
      />
    </svg>
  );
}
