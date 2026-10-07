import type { Metadata } from "next";
import { site } from "@/lib/site";
import { LEGAL_UPDATED } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Rebrew collects, uses, and shares the information you give it.",
  alternates: { canonical: `${site.url}/privacy` },
};

/**
 * The privacy policy, rewritten October 7, 2026 when the site became a story
 * publication and the last contact form came off. What remains is the newsletter,
 * page views, and server logs. The paragraph on earlier forms stays because
 * `referral_leads` still holds what people sent through them, and a policy has to
 * cover data that is still kept. Linked from the footer, out of the nav and the
 * sitemap.
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
            {site.name} publishes true stories. This page explains what information the site
            collects, why it collects it, and who else ever sees it. It covers {site.url} and the
            emails sent from it.
          </p>

          {/* Each bold label ends with an explicit {" "} so the space after
              </strong> cannot be trimmed when a JSX text run is split at an
              HTML entity. */}
          <h2>What is collected</h2>
          <p>
            Almost nothing happens here unless you type it in. There is no advertising network on
            this site, and no tracking pixel following you around the web.
          </p>
          <ul>
            <li>
              <strong>Newsletter signups.</strong>{" "}Signing up on this site stores your email
              address and the date you confirmed it. Subscriptions through Substack are held by
              Substack under its own privacy policy.
            </li>
            <li>
              <strong>Page views.</strong>{" "}Vercel, which hosts the site, counts visits to each page
              along with the country, the browser, and the site that linked you. It sets no cookie
              and it keeps no name, email address, or IP address.
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
          <p>
            Earlier versions of this site had contact forms. If you sent something through one,
            those details are kept only to answer you and are deleted on request. Any consent you
            gave to receive text messages is never shared or sold.
          </p>

          <h2>How the information is used</h2>
          <p>
            An email address is used to send you what you asked for, which is the newsletter. Your
            information is not used to build a profile and it is not handed to an advertising
            platform.
          </p>

          <h2>Who else sees it</h2>
          <p>Your information is never sold. It is shared in exactly two situations.</p>
          <ul>
            <li>
              <strong>Service providers who run the site.</strong>{" "}The database, the email
              delivery, and the hosting are handled by outside companies acting on instructions.
              They may process the data only to provide that service, never for their own purposes.
            </li>
            <li>
              <strong>When the law requires it.</strong>{" "}A valid legal demand can compel
              disclosure, and so can a situation involving fraud or somebody&rsquo;s safety.
            </li>
          </ul>

          <h2>How long it is kept</h2>
          <p>
            Newsletter subscriptions are kept until you unsubscribe. Anything else is deleted on
            request.
          </p>

          <h2>Your choices</h2>
          <p>
            Every email carries an unsubscribe link that works immediately. To see what is held
            about you, correct it, or have it deleted, email{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a> and say so plainly. No particular form
            of words is needed.
          </p>

          <h2>Children</h2>
          <p>
            This site is meant for adults and is not directed at children under 13. Information is
            not knowingly collected from them. If you believe a child sent something in, email the
            address above and it will be removed.
          </p>

          <h2>Changes</h2>
          <p>If this policy changes, the date at the top changes with it.</p>

          <h2>Contact</h2>
          <p>
            {site.name}. Email <a href={`mailto:${site.email}`}>{site.email}</a>.
          </p>
        </div>
      </div>
    </section>
  );
}
