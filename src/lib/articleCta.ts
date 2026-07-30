/**
 * Where to break an article's rendered HTML so a referral CTA can sit INSIDE the
 * body rather than only after it.
 *
 * Why this exists: the July 27, 2026 Upstate Brief drew 11 visits and the only
 * buy/sell offer sat below the entire article, past the newsletter box in the
 * reader's eyeline. A reader who skims a five-minute brief never reaches it. An
 * end-of-article CTA still converts the people who finish, so we keep it and add
 * a second placement partway down for everyone else.
 *
 * Placement rule: the <h2> nearest the MIDDLE of the body, never the first (the
 * reader has not gotten anything yet, and an offer above the value reads as an
 * ad) and never the last (it would collide with the closing CTA). Measured
 * against the real July 27 brief (7,037 chars, six sections, midpoint 3,518) the
 * cut lands at "Where the leverage is" (offset 2,420), so the box sits directly
 * after the buyer-versus-seller read. That is the intent peak, and it falls out
 * of the midpoint rule rather than being hardcoded, so it keeps working as the
 * brief's format changes. Nothing depends on hitting one specific section.
 *
 * Deliberately NOT placed at the top. For editorial content an offer above the
 * first paragraph costs trust and reads as a banner, which is the opposite of
 * what a five-minute brief for someone's biggest financial decision should feel
 * like.
 */

export interface SplitHtml {
  before: string;
  after: string;
}

export interface SplitOptions {
  /** Skip short pieces: two CTAs inside a few hundred words is spam. */
  minLength?: number;
  /** Need enough sections that a middle one exists between first and last. */
  minHeadings?: number;
}

/**
 * Split `html` at the <h2> closest to its midpoint.
 *
 * Returns null when the article is too short or too flat to place a CTA inside,
 * in which case the caller should render the body unsplit and rely on the
 * closing CTA alone.
 *
 * Safe on the markdown pipeline's output because `<h2` only ever appears at a
 * top-level block boundary there, so both halves are independently well-formed.
 * It is a string split, not a parse, which keeps this a pure server-side
 * function with no DOM and no extra dependency.
 */
export function splitAtMidHeading(
  html: string,
  { minLength = 2500, minHeadings = 3 }: SplitOptions = {},
): SplitHtml | null {
  if (!html || html.length < minLength) return null;

  const positions: number[] = [];
  for (let i = html.indexOf("<h2"); i !== -1; i = html.indexOf("<h2", i + 1)) {
    positions.push(i);
  }
  if (positions.length < minHeadings) return null;

  // Never the first heading, never the last.
  const candidates = positions.slice(1, -1);
  if (candidates.length === 0) return null;

  const midpoint = html.length / 2;
  const cut = candidates.reduce((best, pos) =>
    Math.abs(pos - midpoint) < Math.abs(best - midpoint) ? pos : best,
  );

  return { before: html.slice(0, cut), after: html.slice(cut) };
}
