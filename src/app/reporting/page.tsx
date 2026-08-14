import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { getPublishedPosts, postHref, sectionLabel, formatDate } from "@/lib/posts";
import { PostCover } from "@/components/PostCover";

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
 */

export const metadata: Metadata = {
  title: "Reporting",
  description:
    "Every piece, newest first. How South Carolina businesses are actually doing, where the " +
    "real estate market is heading, and what is driving both.",
  alternates: { canonical: `${site.url}/reporting` },
};

export const revalidate = 300;

export default async function ReportingPage() {
  const posts = await getPublishedPosts();

  return (
    <>
      <section className="theme-page theme-border pt-32 pb-14 border-b">
        <div className="max-w-3xl mx-auto px-6">
          <span
            className="theme-label type-eyebrow inline-block border-t-2 pt-2 mb-6"
            style={{ borderColor: "var(--accent)" }}
          >
            Reporting
          </span>
          <h1 className="theme-text-primary type-h1 mb-5">
            Everything, newest first.
          </h1>
          <p className="theme-text-muted type-body-lg max-w-xl">
            Real estate and business in South Carolina. Some pieces take a single company
            apart. Others follow a trend back a few years, or work out what is really
            driving a market that looks like it moved on its own. The older weekly briefs
            and area guides are in here too.
          </p>
        </div>
      </section>

      <section className="theme-section py-16">
        <div className="max-w-3xl mx-auto px-6">
          {posts.length > 0 ? (
            <ul className="divide-y theme-border">
              {posts.map((p) => (
                <li key={p.id} className="py-7 first:pt-0">
                  <Link
                    href={postHref(p)}
                    className="group grid grid-cols-1 sm:grid-cols-[12rem_1fr] gap-5"
                  >
                    <PostCover
                      src={p.cover_image}
                      alt={p.title}
                      sizes="(max-width: 640px) 100vw, 192px"
                      className="aspect-[16/9] w-full border theme-border"
                    />
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="theme-badge type-eyebrow px-2 py-1">
                          {sectionLabel(p)}
                        </span>
                        {p.published_at && (
                          <time className="theme-text-muted type-eyebrow">
                            {formatDate(p.published_at)}
                          </time>
                        )}
                      </div>
                      <h2 className="theme-text-primary type-h3 mb-2 group-hover:opacity-80">
                        {p.title}
                      </h2>
                      {p.summary && (
                        <p className="theme-text-muted type-body leading-relaxed">{p.summary}</p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="border theme-border p-10">
              <p className="theme-text-secondary type-body-lg mb-2">
                The first pieces are on the way.
              </p>
              <p className="theme-text-muted type-body">
                Each one takes something people in this market believe, or a company behind
                it, and checks it against the record.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
