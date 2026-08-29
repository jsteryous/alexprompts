import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { LEGAL_UPDATED, SMS_CONSENT_TEXT, SMS_HELP_EMAIL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "Terms of use for Rebrew, including the SMS messaging terms for the text messages sent " +
    "from the buying or selling form.",
  alternates: { canonical: `${site.url}/terms` },
};

/**
 * Terms of use, with the SMS terms as a named section at #sms.
 *
 * The #sms anchor is the point of the page. A 10DLC campaign registration asks
 * for a messaging terms URL separately from the privacy policy URL, so paste
 * ${site.url}/terms#sms into that field. Everything in that section is checked
 * by carrier vetting: the brand name, what the messages are, the frequency, the
 * rates line, HELP, STOP, the carrier liability line, and a link to the privacy
 * policy. Do not cut any of them for brevity.
 *
 * Like /privacy, this is linked from the footer as of August 28, 2026, and is
 * deliberately still out of the nav and the sitemap. It is also reachable from
 * the SMS consent checkbox on the referral form, which is the moment it most
 * needs to be reachable.
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
            {site.name} is a publication written by {site.author}. Using the site means you accept
            what is on this page. If you do not, the right move is to stop using it.
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
            {site.author} holds an active South Carolina real estate license with eXp Realty. Any
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

          {/* scroll-mt clears the fixed header. /terms#sms is the URL pasted into
              10DLC campaign registration, so the reviewer who follows it has to
              land on this heading rather than under it. */}
          <h2 id="sms" className="scroll-mt-24">
            SMS messaging terms
          </h2>
          <p>
            These terms cover the text messages sent by {site.name} to people who ask for them on
            the buying or selling form.
          </p>
          <ul>
            <li>
              <strong>Program.</strong>{" "}{site.name} sends text messages to people who submit the
              buying or selling form at{" "}
              <Link href="/buying-or-selling">{site.url.replace(/^https?:\/\//, "")}/buying-or-selling</Link> and
              check the box asking for them. The messages are a conversation with {site.author}{" "}
              about the buying or selling question you sent in, which means scheduling a call,
              answering what you asked, and following up on it.
            </li>
            <li>
              <strong>How you opt in.</strong>{" "}You check the consent box on that form. It is
              unchecked by default, and checking it is never required in order to send the form.
              The wording you agree to is this: &ldquo;{SMS_CONSENT_TEXT}&rdquo;
            </li>
            <li>
              <strong>Message frequency.</strong>{" "}Frequency varies, because these are replies in a
              conversation rather than a broadcast.
            </li>
            <li>
              <strong>Cost.</strong>{" "}Message and data rates may apply. {site.name} does not charge
              for the messages, but your mobile carrier may charge you for sending or receiving
              them under your plan.
            </li>
            <li>
              <strong>How to stop.</strong>{" "}Reply STOP to any message and the messages end. You will
              get one confirmation that you have been unsubscribed, and after that nothing further
              unless you opt in again.
            </li>
            <li>
              <strong>How to get help.</strong>{" "}Reply HELP to any message, or email{" "}
              <a href={`mailto:${SMS_HELP_EMAIL}`}>{SMS_HELP_EMAIL}</a>.
            </li>
            <li>
              <strong>Carriers.</strong>{" "}Mobile carriers are not liable for delayed or undelivered
              messages. Delivery depends on your carrier and your device, and it is not guaranteed.
            </li>
            <li>
              <strong>Age.</strong>{" "}You must be 18 or older, and you must either own the mobile
              number you give or be authorized to consent for it.
            </li>
            <li>
              <strong>Privacy.</strong>{" "}Mobile numbers and opt-in consent are never shared or sold
              for anyone else&rsquo;s marketing. See the <Link href="/privacy">Privacy Policy</Link>{" "}
              for the full commitment.
            </li>
          </ul>

          <h2>Liability</h2>
          <p>
            To the extent the law allows, {site.name} and {site.author} are not liable for any
            indirect, incidental, or consequential loss arising from your use of the site or from a
            decision you made after reading it. You are responsible for your own real estate and
            financial decisions.
          </p>

          <h2>Governing law</h2>
          <p>
            These terms are governed by the laws of the State of South Carolina, and any dispute
            belongs in the state or federal courts sitting in Greenville County, South Carolina.
          </p>

          <h2>Changes</h2>
          <p>
            These terms change from time to time, and the date at the top changes with them. A
            change to the SMS section goes to everyone receiving messages before it takes effect.
          </p>

          <h2>Contact</h2>
          <p>
            {site.author}, {site.name}. Email <a href={`mailto:${site.email}`}>{site.email}</a>.
          </p>
        </div>
      </div>
    </section>
  );
}
