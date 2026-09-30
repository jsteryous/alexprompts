import type { Metadata } from "next";
import { site } from "@/lib/site";
import { getPublishedPosts } from "@/lib/posts";
import { ReportingView } from "./ReportingView";

/**
 * REPORTING — every published piece, one list (added August 14, 2026).
 *
 * The nav's "Reporting" tab used to point at /greenville-works, which showed
 * only posts carrying the `greenville works` tag. That made the site's main
 * section a filter on one engine's output rather than the publication's body of
 * work, and it hid the real-estate pieces from the one tab a reader clicks.
 *
 * This page filters on nothing. It lists every PUBLISHED post regardless of tag,
 * and links each one through postHref() so it lands on its own canonical route.
 * That matters: the ARTICLE urls are untouched by this page existing. A piece
 * still lives at /greenville-works/<slug>, /real-estate/<slug>, /briefing/<slug>,
 * or /archive/<slug>, so nothing published breaks and the engines keep writing
 * the tags they already write.
 *
 * The per-section index pages still exist and are still linked from the footer
 * under "Archives". They are now the narrow view and this is the broad one.
 *
 * TOPIC TABS (September 30, 2026). Real Estate, Finance, Urban Economics, and
 * Lifestyle sit above the list as links to /reporting/<topic>, which filter on a
 * `topic:` tag (lib/topics.ts). A topic never moves a post's URL.
 */

export const metadata: Metadata = {
  title: "Reporting",
  description:
    "Every piece, newest first. Research and data on the Greenville market and on how sales " +
    "actually get made.",
  alternates: { canonical: `${site.url}/reporting` },
};

export const revalidate = 300;

export default async function ReportingPage() {
  const posts = await getPublishedPosts();

  return (
    <ReportingView
      posts={posts}
      active={null}
      heading="Everything, newest first."
      intro={
        "Greenville real estate and sales performance. Some pieces start with a research " +
        "paper and work out whether it holds up here. Others follow a local trend back a " +
        "few years, or take a single company apart. The older weekly briefs and area " +
        "guides are in here too."
      }
    />
  );
}
