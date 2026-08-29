import Link from "next/link";

/**
 * The buy/sell offer that rides along with high-intent content.
 *
 * ONE QUIET LINE, as of August 26, 2026. Alex: "the cta should just be subtle."
 * It used to be a card: an uppercase eyebrow, a heading, a line of blurb, and a
 * filled accent button, rendered twice per article, with the mid-article copy
 * accent-tinted so it was impossible to scroll past. Three pieces of furniture
 * asking for the same click, on a page whose whole argument is that it is worth
 * reading. The offer is the same; it just stopped shouting.
 *
 * THE COPY IS ALEX'S, VERBATIM, down to the capitals: "Buying or Selling? Let's
 * talk." Do not expand it back into a heading and a paragraph, and do not add an
 * eyebrow above it.
 *
 * Framing note (July 30, 2026), still binding: this used to lead with the
 * mechanism ("Real estate referrals", "Find an agent worth your time"). That
 * describes Alex's business model, not the reader's situation, and it presumes
 * the reader has already decided they want an agent.
 *
 * THE RULE, finished August 1, 2026 and applying to every user-facing surface
 * including the engine's article closes: no copy anywhere explains that Alex
 * refers or matches leads, and none of it says he does not practice or does not
 * take clients. Both framings make a buyer feel handed off before they have even
 * said hello. Alex qualifies the person first and handles the introduction
 * himself once he knows what they need. The only surviving mention of a fee is
 * the licensee disclosure in the /buying-or-selling fine print.
 *
 * It renders TWICE per article and both placements look the same now, because a
 * line that is quiet enough to sit under the last paragraph is also quiet enough
 * to sit mid-article. `variant` survives to set the spacing and the rules around
 * it: `inline` is interrupting prose so it is closed on both sides, `full` is
 * ending the piece so it only needs a rule above.
 *
 * It links to /buying-or-selling rather than embedding a form, so capture lives in one
 * place and articles stay light. Keep this copy in sync with `referralBlock()`
 * in emailTemplates.ts, which is the same line in the inbox.
 */
export function ReferralCta({
  slug,
  variant = "full",
  copy = "Buying or Selling? Let’s talk.",
}: {
  /** The article slug this CTA sits on, carried into /buying-or-selling as ?ref= for
   *  first-party attribution (which article drove the lead). */
  slug?: string;
  variant?: "full" | "inline";
  copy?: string;
}) {
  const href = slug
    ? `/buying-or-selling?ref=${encodeURIComponent(slug)}#connect`
    : "/buying-or-selling#connect";

  const inline = variant === "inline";

  return (
    <p
      className={`theme-border ${
        inline ? "border-y py-4" : "border-t pt-5"
      }`}
    >
      <Link
        href={href}
        className="theme-link type-small font-medium inline-flex items-center gap-1.5"
      >
        {copy}
        <svg
          width="14"
          height="14"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden="true"
          className="w-3 h-3"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </Link>
    </p>
  );
}
