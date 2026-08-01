import Link from "next/link";

/**
 * The buy/sell offer that rides along with high-intent content.
 *
 * Framing note (July 30, 2026): this used to lead with the mechanism ("Real
 * estate referrals", "Find an agent worth your time"). That describes Alex's
 * business model, not the reader's situation, and it presumes the reader has
 * already decided they want an agent. The site does the work of FINDING buyers
 * and sellers first, so the copy opens on where the reader actually is.
 *
 * THE RULE, finished August 1, 2026 and applying to every user-facing surface
 * including the three engines' article closes: no copy anywhere explains that
 * Alex refers or matches leads, and none of it says he does not practice or does
 * not take clients. Both framings make a buyer feel handed off before they have
 * even said hello. Alex qualifies the person first and handles the introduction
 * himself once he knows what they need. The only surviving mention of a fee is
 * the licensee disclosure in the /find-a-pro fine print.
 *
 * Keep this copy SHORT. It is an invitation, not an explanation.
 *
 * Two variants, because placement changes the job:
 *   full   - the closing block. Room to explain, for a reader who finished.
 *   inline - sits mid-article, interrupting a skim, so it is accent-tinted and
 *            says less. Its job is to be impossible to scroll past.
 *
 * It links to /find-a-pro rather than embedding the form, so capture lives in one
 * place and articles stay light.
 */
export function ReferralCta({
  slug,
  variant = "full",
  heading = "Thinking of making a move?",
  blurb = "Let me know if you’re thinking about selling, or if you’re looking to buy!",
  cta = "Get in touch",
}: {
  /** The article slug this CTA sits on, carried into /find-a-pro as ?ref= for
   *  first-party attribution (which article drove the lead). */
  slug?: string;
  variant?: "full" | "inline";
  heading?: string;
  blurb?: string;
  cta?: string;
}) {
  const href = slug
    ? `/find-a-pro?ref=${encodeURIComponent(slug)}#connect`
    : "/find-a-pro#connect";

  const inline = variant === "inline";

  return (
    <div
      className={
        inline
          ? "theme-card-accent border theme-border rounded-2xl p-6 sm:p-7"
          : "theme-card-strong border theme-border rounded-2xl p-7 sm:p-9 text-center"
      }
    >
      <span
        className={`theme-label inline-block text-xs font-semibold uppercase tracking-widest ${
          inline ? "mb-2" : "mb-3"
        }`}
      >
        Buying or selling
      </span>
      <h2 className={`theme-text-primary ${inline ? "type-title mb-2" : "type-h3 mb-3"}`}>
        {heading}
      </h2>
      <p
        className={`theme-text-muted leading-relaxed ${
          inline ? "text-sm mb-5" : "text-base max-w-lg mx-auto mb-6"
        }`}
      >
        {blurb}
      </p>
      <Link
        href={href}
        className={`theme-cta-accent font-semibold rounded-xl inline-block ${
          inline ? "px-5 py-2.5 text-sm" : "px-6 py-3"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}
