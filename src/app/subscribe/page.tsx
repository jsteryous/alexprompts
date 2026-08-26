import type { Metadata } from "next";
import { site } from "@/lib/site";
import { SubscribeForm } from "@/components/SubscribeForm";

export const metadata: Metadata = {
  title: "Subscribe",
  description:
    "We read research papers about real estate and sales performance and share what we find " +
    "interesting. Subscribe if you would like to learn with us.",
  alternates: { canonical: `${site.url}/subscribe` },
};

/**
 * The owned-list capture page the nav CTA points at. One list gets everything:
 * broadcasts go to every confirmed subscriber regardless of which track a post
 * belongs to. Substack stays available as the form's secondary link.
 *
 * The copy here was still promising "the Upstate Brief every Monday, plus the
 * Greenville guides and the SC Technology deep-dives" a week after all three of
 * those stopped producing, which is the worst place on the site to carry a dead
 * promise: it is the page a reader lands on at the moment they decide to trust
 * us with an address.
 *
 * It now carries NO overrides at all. The SubscribeForm default is Alex's own
 * sentence as of August 25, 2026, so repeating it here in a longer form is how
 * the two drift apart. If the promise changes, it changes in one file.
 */
export default function SubscribePage() {
  return (
    <section className="theme-page pt-36 pb-24 min-h-[70vh]">
      <div className="max-w-2xl mx-auto px-6">
        <SubscribeForm source="subscribe-page" cta="Subscribe free" />
      </div>
    </section>
  );
}
