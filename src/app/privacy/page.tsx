import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { LEGAL_UPDATED } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Rebrew collects, uses, and shares the information you give it, including the rules " +
    "around phone numbers and text messages.",
  alternates: { canonical: `${site.url}/privacy` },
};

/**
 * The privacy policy. It exists because 10DLC (A2P text messaging) registration
 * requires a publicly reachable privacy policy URL, and carrier vetting reads
 * this page looking for one specific commitment: that mobile numbers and opt-in
 * consent are never shared or sold for anyone else's marketing. That is the
 * single most common reason a campaign gets rejected. The "Text messages and
 * your mobile number" section below is that commitment, and it must not be
 * softened or removed.
 *
 * LINKED FROM THE FOOTER since August 28, 2026, and deliberately still out of
 * the nav and the sitemap. It had been reachable only from the SMS consent
 * checkbox on the referral form, on the reasoning that a compliance document
 * with a stable URL to paste into a registration form is not part of the
 * publication. That reasoning holds for the nav and misses for the footer: a
 * reader looks for a privacy link in the fine print, and the 10DLC campaign
 * wants the policy reachable from any page. The consent-checkbox link stays,
 * because consent is only informed if the terms are reachable at the moment it
 * is given.
 *
 * The sharing section is honest about the fact that a buyer or seller's details
 * may go to a real estate professional. That is a factual disclosure a privacy
 * policy is required to make, and it is not the never-explain-the-business-model
 * rule breaking down: that rule governs marketing copy, and this page says
 * nothing about how anyone gets paid. The fee disclosure stays where it is, in
 * the fine print on /buying-or-selling.
 */
export default function PrivacyPage() {
  return (
    <section className="theme-page pt-32 pb-24">
      <div className="max-w-2xl mx-auto px-6">
        <span className="theme-label inline-block text-xs font-semibold uppercase tracking-widest mb-4">
          Legal
        </span>
        <h1 className="theme-text-primary type-h1 mb-3">
          Privacy Policy
        </h1>
        <p className="theme-text-muted type-small mb-12">Last updated {LEGAL_UPDATED}.</p>

        <div className="theme-prose prose max-w-none">
          <p>
            {site.name} is a publication written by {site.author} about Greenville real estate and
            sales performance. This page explains what information the site collects, why it
            collects it, and who else ever sees it. It covers {site.url}, along with the emails and
            text messages sent from it.
          </p>

          {/* Every bold label below ends with an explicit {" "} rather than a
              literal space. A JSX text run that also contains an HTML entity
              (&rsquo;, &ldquo;) gets split at the entity, and the leading space
              after </strong> is trimmed with it, so the label collides with the
              first word. It shipped that way on three bullets, one of them the
              Privacy line in the SMS terms that carrier vetting reads. The
              explicit space cannot be trimmed, so it is used on all of them
              rather than only the ones that break today. */}
          <h2>What is collected</h2>
          <p>
            Almost nothing happens here unless you type it in. There is no advertising network on
            this site, and no tracking pixel following you around the web. Here is everything that
            is collected.
          </p>
          <ul>
            <li>
              <strong>Newsletter signups.</strong>{" "}Signing up stores your email address and the date
              you confirmed it. Nothing else is required.
            </li>
            <li>
              <strong>The buying or selling form.</strong>{" "}The form asks for your name and email
              address, whether you are buying or selling, the market you are asking about, and your
              rough timeframe. A phone number is optional, and so is anything you write in the notes
              field.
            </li>
            <li>
              <strong>Where you came from.</strong>{" "}Your submission records the page you sent it
              from, the site that linked you here, and any campaign tag the link carried. That is
              how it is possible to tell which article brought someone in, and none of it follows
              you across other websites.
            </li>
            <li>
              <strong>Page views.</strong>{" "}Vercel, which hosts the site, counts visits to each page
              along with the country, the browser, and the site that linked you. It sets no cookie
              and it keeps no name, email address, or IP address, so a visit cannot be traced back
              to you or followed onto another website.
            </li>
            <li>
              <strong>Ordinary server logs.</strong>{" "}The hosting provider records requests, IP
              addresses included, the way every web server does.
            </li>
          </ul>
          <p>
            One thing is stored in your browser, and that is whether you prefer the light or dark
            theme. It never leaves your device and it is not used to identify you.
          </p>

          <h2>Text messages and your mobile number</h2>
          <p>
            <strong>
              No mobile information will be shared with third parties or affiliates for marketing or
              promotional purposes. Text messaging originator opt-in data and consent are never
              shared with anyone, and are never sold, rented, or licensed under any circumstances.
            </strong>
          </p>
          <p>
            A phone number is optional on the form, and giving one does not sign you up for text
            messages. Texts are sent only if you separately check the consent box, and checking it
            is never a condition of sending the form or of getting an answer. When you do check it,
            what gets recorded is that you agreed, when you agreed, the IP address it came from, and
            the exact wording that was on the screen at the time.
          </p>
          <p>
            You can stop the messages at any moment by replying STOP, and you can reply HELP to
            reach a person. The full messaging terms, including frequency and rates, are in the{" "}
            <Link href="/terms#sms">SMS terms</Link>.
          </p>

          <h2>How the information is used</h2>
          <p>
            An email address is used to send you what you asked for, which is the newsletter. Form
            details are used to answer your question and to follow up about buying or selling, by
            email, by phone, or by text if you consented to text. That is the whole list. Your
            information is not used to build a profile and it is not handed to an advertising
            platform.
          </p>

          <h2>Who else sees it</h2>
          <p>Your information is never sold. It is shared in exactly three situations.</p>
          <ul>
            <li>
              <strong>Service providers who run the site.</strong>{" "}The database, the email delivery,
              the hosting, and the text message delivery are handled by outside companies acting on
              instructions. They may process the data only to provide that service, never for their
              own purposes.
            </li>
            <li>
              <strong>A real estate professional, when you ask for help buying or selling.</strong>{" "}
              If your question needs someone working in your market, the details you sent may be
              passed to a licensed agent so they can help you. Your mobile number is not passed
              along for anyone to market to you, and your text messaging consent is never
              transferred.
            </li>
            <li>
              <strong>When the law requires it.</strong>{" "}A valid legal demand can compel
              disclosure, and so can a situation involving fraud or somebody&rsquo;s safety.
            </li>
          </ul>

          <h2>How long it is kept</h2>
          <p>
            Newsletter subscriptions are kept until you unsubscribe. Form submissions are kept as
            long as they are useful for following up and for the records that consent rules require,
            and they are deleted on request.
          </p>

          <h2>Your choices</h2>
          <p>
            Every email carries an unsubscribe link that works immediately, and every text can be
            stopped by replying STOP. To see what is held about you, correct it, or have it deleted,
            email <a href={`mailto:${site.email}`}>{site.email}</a> and say so plainly. No particular
            form of words is needed.
          </p>

          <h2>Children</h2>
          <p>
            This site is meant for adults and is not directed at children under 13. Information is
            not knowingly collected from them. If you believe a child sent something in, email the
            address above and it will be removed.
          </p>

          <h2>Changes</h2>
          <p>
            If this policy changes, the date at the top changes with it. A change that affects how
            text messages or mobile numbers are handled will go to everyone on the list before it
            takes effect.
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
