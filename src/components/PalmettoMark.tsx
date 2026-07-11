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
      {/* crescent, tucked into the upper-left corner, clear of the tree */}
      <path
        d="M6 2.8 A 3.15 3.15 0 1 0 8.03 8.05 A 3.9 3.9 0 0 1 6 2.8 Z"
        fill="currentColor"
      />
      {/* palmetto, right side: trunk + five drooping fronds from one crown */}
      <g stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
        <path d="M16.5 21 V9.5" />
        <path d="M16.5 9.5 C16.5 8 16.5 6.6 16.5 5.2" />
        <path d="M16.5 9.5 C15.8 7.3 14.4 6.1 12.8 6.3" />
        <path d="M16.5 9.5 C17.2 7.3 18.6 6.1 20.2 6.3" />
        <path d="M16.5 9.5 C14.8 8.7 13 8.9 11.7 10.3" />
        <path d="M16.5 9.5 C18.2 8.7 20 8.9 21.3 10.3" />
      </g>
    </svg>
  );
}
