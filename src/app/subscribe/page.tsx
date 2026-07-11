import type { Metadata } from "next";
import { site } from "@/lib/site";
import { SubscribeForm } from "@/components/SubscribeForm";

export const metadata: Metadata = {
  title: "Subscribe",
  description:
    "One free email list for everything Alex Prompts publishes. The Upstate Brief every " +
    "Monday, the Greenville guides, and the SC Technology deep-dives.",
  alternates: { canonical: `${site.url}/subscribe` },
};

/**
 * The owned-list capture page the nav CTA points at. One list gets everything:
 * broadcasts go to every confirmed subscriber regardless of which track a post
 * belongs to, so this page promises all of it in one subscription. Substack
 * stays available as the form's secondary link.
 */
export default function SubscribePage() {
  return (
    <section className="theme-page pt-36 pb-24 min-h-[70vh]">
      <div className="max-w-2xl mx-auto px-6">
        <SubscribeForm
          source="subscribe-page"
          heading="One list. Everything we publish."
          blurb="The Upstate Brief every Monday, plus the Greenville guides and the SC Technology deep-dives as they publish. One free subscription covers all of it, and you can leave any time."
          cta="Subscribe free"
        />
      </div>
    </section>
  );
}
