import type { Metadata } from "next";
import { site } from "@/lib/site";
import { SubscribeForm } from "@/components/SubscribeForm";

export const metadata: Metadata = {
  title: "Subscribe",
  description:
    "A clear picture of Greenville real estate, about every other week. How the market is " +
    "really moving, where prices have been heading, and what is driving it.",
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
 * us with an address. Keep it in sync with site.ts, the homepage standfirst,
 * and the SubscribeForm default.
 */
export default function SubscribePage() {
  return (
    <section className="theme-page pt-36 pb-24 min-h-[70vh]">
      <div className="max-w-2xl mx-auto px-6">
        <SubscribeForm
          source="subscribe-page"
          heading="A clear read on Greenville real estate"
          blurb="About every other week, one piece on how the Greenville market is actually moving, where prices have been heading over years rather than quarters, or what is really driving a decision everybody else reported as news. Built on public records, with every number sourced. Free, and you can leave any time."
          cta="Subscribe free"
        />
      </div>
    </section>
  );
}
