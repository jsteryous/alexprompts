import type { Metadata } from "next";
import { site, LICENSEE_NAME } from "@/lib/site";
import { LEGAL_UPDATED } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of use for Rebrew.",
  alternates: { canonical: `${site.url}/terms` },
};

/**
 * Terms of use. The SMS messaging terms that used to sit at #sms were removed
 * on October 7, 2026 with the last form that collected text-message consent.
 * Linked from the footer, deliberately out of the nav and the sitemap.
 */
export default function TermsPage() {
  return (
    <section className="theme-page pt-32 pb-24">
      <div className="max-w-2xl mx-auto px-6">
        <span className="theme-label inline-block text-xs font-semibold uppercase tracking-widest mb-4">
          Legal
        </span>
        <h1 className="theme-text-primary type-h1 mb-3">
          Terms
        </h1>
        <p className="theme-text-muted type-small mb-12">Last updated {LEGAL_UPDATED}.</p>

        <div className="theme-prose prose max-w-none">
          <p>
            {site.name} is a publication. Using the site means you accept what is on this page. If
            you do not, the right move is to stop using it.
          </p>

          {/* Every bold label below ends with an explicit {" "} rather than a
              literal space. A JSX text run that also contains an HTML entity
              (&rsquo;, &ldquo;) gets split at the entity, and the leading space
              after </strong> is trimmed with it, so the label collides with the
              first word. It shipped that way on three bullets, one of them the
              Privacy line in the SMS terms that carrier vetting reads. The
              explicit space cannot be trimmed, so it is used on all of them
              rather than only the ones that break today. */}
          <h2>What the writing is and is not</h2>
          <p>
            Everything published here is research and analysis for general information. It is not
            financial, legal, tax, or investment advice, and it is not an appraisal or a valuation
            of any specific property. Reading an article does not create a client relationship, an
            agency relationship, or a fiduciary duty of any kind. Before you act on a number you
            read here, check it against your own situation with a professional who knows your
            circumstances.
          </p>
          <p>
            {LICENSEE_NAME} holds an active South Carolina real estate license with eXp Realty. Any
            listing, market, or transaction commentary is written as a licensee in South Carolina
            and is not an offer to represent you.
          </p>

          <h2>Accuracy</h2>
          <p>
            The work here is built on primary documents, and the figures are checked before they go
            out. Public records still contain errors, sources revise their data after the fact, and
            an article is accurate as of the day it was published rather than the day you read it.
            The site is provided as it is, with no warranty that it is complete, current, or fit for
            any particular purpose. Errors get corrected when they are found, so if you spot one,
            send it to <a href={`mailto:${site.email}`}>{site.email}</a>.
          </p>

          <h2>Your content and ours</h2>
          <p>
            The articles, the data work behind them, and the site design belong to {site.name}. You
            are welcome to quote a passage with attribution and a link. Republishing a whole piece
            needs permission first. Anything you send in, whether through a form, an email, or a
            text, may be used to answer you and to follow up with you.
          </p>

          <h2>Links to other sites</h2>
          <p>
            Articles link to county records, agency data, and other outside sources. Those sites are
            run by other people under their own terms and privacy policies, and linking to a source
            is not an endorsement of it.
          </p>

          <h2>Liability</h2>
          <p>
            To the extent the law allows, {site.name} and {LICENSEE_NAME} are not liable for any
            indirect, incidental, or consequential loss arising from your use of the site or from a
            decision you made after reading it. You are responsible for your own decisions.
          </p>

          <h2>Governing law</h2>
          <p>
            These terms are governed by the laws of the State of South Carolina, and any dispute
            belongs in the state or federal courts sitting in Greenville County, South Carolina.
          </p>

          <h2>Changes</h2>
          <p>
            These terms change from time to time, and the date at the top changes with them.
          </p>

          <h2>Contact</h2>
          <p>
            {site.name}. Email <a href={`mailto:${site.email}`}>{site.email}</a>.
          </p>
        </div>
      </div>
    </section>
  );
}
