import Link from "next/link";

/**
 * In-article referral CTA for the high-intent /real-estate pages. A reader on a
 * relocation or cost-of-living guide is the site's best referral lead, so every
 * such article ends with a styled offer that links to the /find-a-pro form,
 * independent of whatever closing line the content engine happened to write.
 *
 * It links to the dedicated conversion page (with the qualifying form) rather than
 * embedding the form, so the capture lives in one place and articles stay light.
 */
export function ReferralCta({
  slug,
  heading = "Buying or selling in Greenville?",
  blurb = "I am a licensed South Carolina agent, and I match buyers and sellers with an agent I would trust with my own family, here or in whatever city you are moving to. It costs you nothing.",
  cta = "Find a pro worth your time",
}: {
  /** The article slug this CTA sits on, carried into /find-a-pro as ?ref= for
   *  first-party attribution (which article drove the lead). */
  slug?: string;
  heading?: string;
  blurb?: string;
  cta?: string;
}) {
  const href = slug
    ? `/find-a-pro?ref=${encodeURIComponent(slug)}#connect`
    : "/find-a-pro#connect";
  return (
    <div className="theme-card-strong border theme-border rounded-2xl p-7 sm:p-9 text-center">
      <span className="theme-label inline-block text-xs font-semibold uppercase tracking-widest mb-3">
        Real estate referrals
      </span>
      <h2 className="theme-text-primary type-h3 mb-3">{heading}</h2>
      <p className="theme-text-muted text-base leading-relaxed max-w-lg mx-auto mb-6">{blurb}</p>
      <Link
        href={href}
        className="theme-cta-accent font-semibold px-6 py-3 rounded-xl inline-block"
      >
        {cta}
      </Link>
    </div>
  );
}
