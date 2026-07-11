/**
 * A small, single-color palmetto-and-crescent mark, the South Carolina emblem
 * stylized to fit the design system (inherits currentColor, so color it with a
 * theme utility like `theme-label`). Used as the quiet place-pride mark beside
 * the homepage mission eyebrow and the footer slogan. Deliberately minimal;
 * do not add flag colors or detail.
 */
export function PalmettoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      {/* crescent, upper left */}
      <path
        d="M8.6 3.4 A 4.2 4.2 0 1 0 11.3 10.4 A 5.2 5.2 0 0 1 8.6 3.4 Z"
        fill="currentColor"
      />
      {/* palmetto: trunk + fronds */}
      <g stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
        <path d="M15.5 21 V12" />
        <path d="M15.5 12 C15.5 9.5 15.5 8 15.5 6.5" />
        <path d="M15.5 12 C15 9 13.5 7.5 11.5 7" />
        <path d="M15.5 12 C16 9 17.5 7.5 19.5 7" />
        <path d="M15.5 12 C14 10.5 12 10 10 10.5" />
        <path d="M15.5 12 C17 10.5 19 10 21 10.5" />
      </g>
    </svg>
  );
}
