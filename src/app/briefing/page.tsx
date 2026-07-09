import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { getPublishedPosts, formatDate } from "@/lib/posts";
import { PostCover } from "@/components/PostCover";
import { SubscribeForm } from "@/components/SubscribeForm";

export const metadata: Metadata = {
  title: "Upstate Brief",
  description:
    "The Upstate Brief, a five-minute Monday read on Upstate South Carolina real estate. " +
    "Mortgage rates, what actually sold in Greenville County, projects and permits that moved, " +
    "and one thing worth watching.",
  alternates: { canonical: `${site.url}/briefing` },
};

export const revalidate = 300;

export default async function BriefingPage() {
  const posts = await getPublishedPosts(undefined, "briefing");

  return (
    <>
      <section className="theme-page theme-border pt-32 pb-16 border-b">
        <div className="max-w-3xl mx-auto px-6">
          <span className="theme-label inline-block text-xs font-semibold uppercase tracking-widest mb-4">
            Upstate Brief
          </span>
          <h1 className="theme-text-primary text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
            The week in Upstate real estate, in five minutes
          </h1>
          <p className="theme-text-muted text-lg max-w-xl leading-relaxed">
            Every Monday morning I publish one brief with the week in local real estate. Where
            mortgage rates landed, what actually sold in Greenville County and at what price per
            foot, which projects moved through the county, and one concrete thing worth watching.
            Every number links to its source, and a quiet week says so instead of padding.
          </p>
        </div>
      </section>

      {/* The brief goes out on the owned list only (never Substack), so the
          capture lives right on the section page. */}
      <section className="theme-section-contrast py-14 border-b theme-border">
        <div className="max-w-2xl mx-auto px-6">
          <SubscribeForm
            source="briefing-index"
            heading="Get it in your inbox on Mondays"
            blurb="One email every Monday morning with the full brief. Free, and you can leave any time."
            cta="Subscribe free"
            showSubstackLink={false}
          />
        </div>
      </section>

      <section className="theme-section py-16">
        <div className="max-w-3xl mx-auto px-6">
          {posts.length > 0 ? (
            <ul className="divide-y theme-border">
              {posts.map((p) => (
                <li key={p.id} className="py-7 first:pt-0">
                  <Link
                    href={`/briefing/${p.slug}`}
                    className="group grid grid-cols-1 sm:grid-cols-[12rem_1fr] gap-5"
                  >
                    <PostCover
                      src={p.cover_image}
                      alt={p.title}
                      className="aspect-[16/9] w-full rounded-lg border theme-border"
                    />
                    <div>
                      {p.published_at && (
                        <time className="theme-text-muted text-xs uppercase tracking-widest">
                          {formatDate(p.published_at)}
                        </time>
                      )}
                      <h2 className="theme-text-primary text-xl md:text-2xl font-semibold leading-snug mt-2 mb-2 group-hover:opacity-80">
                        {p.title}
                      </h2>
                      {p.summary && (
                        <p className="theme-text-muted text-base leading-relaxed">{p.summary}</p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="theme-card border theme-border rounded-xl p-10 text-center">
              <p className="theme-text-secondary text-lg mb-2">The first brief lands soon.</p>
              <p className="theme-text-muted text-sm">
                One Monday post with the week in Upstate real estate. Rates, what sold, what got
                approved, and what to watch.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
