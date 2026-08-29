import type { Metadata } from "next";
import Link from "next/link";
import { site, CONTACT_EMAIL, LINKEDIN_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "How to reach Alex Steryous: send a paper, a document, or a correction, or start a " +
    "buying or selling conversation.",
  alternates: { canonical: `${site.url}/contact` },
};

/**
 * The contact page (added August 28, 2026). Footer only, deliberately not in the
 * nav, because the nav carries one button and that button is the buy/sell page.
 *
 * WHY IT EXISTS when /about already ends on a "Get in touch" block and
 * /buying-or-selling already has a form. Those two surfaces both assume they
 * know why you are writing. A reader who has a document, a correction, or a
 * question that is not a transaction had to scroll a masthead to find an
 * address, and a publication that asks for tips in its masthead should have one
 * obvious place that just gives you the address. It is also the page a stranger
 * looks for before deciding a site is run by a real person.
 *
 * THE DIVISION OF LABOUR, and the reason this page does not grow a form: the
 * buy/sell form on /buying-or-selling qualifies a lead and writes to
 * referral_leads, so anything transactional belongs there and is linked below
 * rather than duplicated. Everything else is email, which is the right primitive
 * for the ask this page actually makes, since a tip usually arrives as an
 * attachment and no form takes attachments.
 *
 * Copy rules, same as everywhere: uncontracted, no em or en dashes, no
 * fragments, and never explain the referral mechanism (root CLAUDE.md).
 */
function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

export default function ContactPage() {
  return (
    <section className="theme-page pt-32 pb-24 min-h-[70vh]">
      <div className="max-w-2xl mx-auto px-6">
        <span className="theme-label inline-block text-xs font-semibold uppercase tracking-widest mb-4">
          Contact
        </span>
        <h1 className="theme-text-primary type-h1 mb-6">Get in touch.</h1>

        <p className="theme-text-muted type-body-lg leading-relaxed mb-5">
          Email reaches me directly, and I read all of it. Write about anything you have seen in
          the Greenville market, or about anything on this site.
        </p>
        <p className="theme-text-muted type-body-lg leading-relaxed mb-5">
          Send along a paper or a set of numbers if you think it is worth a look. Attachments are
          welcome. If something here is wrong, tell me and I will fix it where everyone can see
          it.
        </p>
        <p className="theme-text-muted type-body-lg leading-relaxed mb-9">
          If you are looking to buy or thinking of selling, start on the{" "}
          <Link href="/buying-or-selling" className="theme-link underline">
            buying or selling page
          </Link>{" "}
          instead. It asks the few things I need in order to be useful on the first call.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="theme-cta-accent inline-flex items-center gap-2 font-semibold px-7 py-3.5"
          >
            {CONTACT_EMAIL}
            <ArrowIcon />
          </a>
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="theme-link inline-flex items-center gap-2 font-medium px-5 py-3.5 text-sm"
          >
            Connect on LinkedIn <ArrowIcon className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
