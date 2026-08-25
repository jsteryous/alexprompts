import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { getFeedPosts, postHref, sectionLabel, formatDate, type ArchivePost } from "@/lib/posts";
import { PostCover } from "@/components/PostCover";
import { SubscribeForm } from "@/components/SubscribeForm";

// The homepage used to inherit its canonical from the root layout. That
// inheritance was the trap that could deindex any new route (see layout.tsx),
// so it is gone and the homepage declares its own, like every other page.
// (Next normalizes the root path, so this emits `https://www.alexprompts.com`
// with no trailing slash, unchanged from what the layout used to produce.)
export const metadata: Metadata = {
  alternates: { canonical: `${site.url}/` },
};

export const revalidate = 300;

/**
 * THE FRONT PAGE (restructured August 2026, the consolidation).
 *
 * The homepage now does ONE job: convince a qualified stranger to hand over an
 * email address. It used to do five (a content feed, a mission statement, a
 * tools spotlight, a follow row, and a subscribe CTA buried at the very
 * bottom), which is four too many and put the single most important element
 * below four screens of scrolling.
 *
 * The order is deliberate and it is the newsletter convention: say what this is
 * and ask, THEN show the work. The standfirst is a compact masthead statement
 * rather than a marketing hero, and the archive underneath it is the argument
 * that the promise is real.
 *
 * REMOVED and not to be re-added without a reason: the "mission" contrast panel
 * (folded into the standfirst, since a mission stated twice on one page is
 * stated badly), the "Where to find us" social card grid (the footer already
 * carries every handle, and on a site whose owned list is the asset, a row of
 * links to other people's platforms was pointing the one job off-site), and the
 * free-tools row (the nine tools were deleted outright in August 2026; they
 * served the consumer buyer this publication no longer writes for).
 *
 * The standfirst copy tracks scripts/publication/SPEC.md and must stay in sync
 * with site.ts and the SubscribeForm default promise. Two earlier drafts of this
 * page are the reason that sync is called out: it led with "Somebody should go
 * back and check." (the accountability beat) and then with "Three hundred jobs,
 * and nobody says what the company does." (the company beat), each of which was
 * left stranded when the beat moved underneath it.
 *
 * WHAT THE COPY IS FOR, and the thing to preserve if you rewrite it: a reader
 * should learn in one screen that they can get an insightful picture of how
 * South Carolina businesses are doing, what the long-term trends are, and what
 * the real estate market is doing and WHY. Trends and incentives are the spine.
 *
 * An August 14, 2026 draft led on claim-testing ("people in this market say
 * things... checking is the work here") and Alex cut it: testing what people
 * believe is ONE input, not the job, and building the front page on it made the
 * publication sound smaller than it is. Do not put it back at the top.
 *
 * PLAINED AND NARROWED TO GREENVILLE, August 25, 2026, on Alex's instruction
 * ("we write about greenville real estate. just put things in plain wording").
 * The headline had been "A clear picture of real estate and business in South
 * Carolina.", which restated the eyebrow above it almost word for word, ran to
 * five lines of display type, and was a fragment in a house style that bans
 * them. The narrowing is not a demotion of the business beat, it is a
 * correction to what the archive actually is: 34 of 36 published pieces mention
 * Greenville. If the statewide ambition in CLAUDE.md becomes real in the
 * published work, widen this line then and not before.
 *
 * NOT IN THIS COPY ON PURPOSE: academic research, and sales performance. Alex
 * asked for both in the same instruction. Zero of the 36 published pieces cite
 * an academic source and zero touch sales performance, so the claim would have
 * been false on the front page of a publication whose first rule is that it is
 * a true story. Add the line when a piece earns it.
 *
 * That draft was also the site's worst prose, and the reasons are worth keeping
 * because they recur. It opened on an abstract noun ("Checking is the work
 * here."), it paid off in a tidy tricolon ("what the evidence supports, what it
 * does not, and where it is genuinely unclear"), it piled five source types into
 * one list to perform specificity, and every sentence ran the same length and
 * shape. That combination reads as machine-written no matter how true it is.
 */

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

/** Section kicker. The faint "> " that used to prefix every one of these was
 *  part of the retired AI-prompt motif and was removed in the August 2026
 *  newspaper pass (see globals.css). A kicker is a rule and a word. */
function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`theme-label type-eyebrow inline-block border-t-2 pt-2 ${className}`}
      style={{ borderColor: "var(--accent)" }}
    >
      {children}
    </span>
  );
}

function FeaturedStory({ post }: { post: ArchivePost }) {
  return (
    <Link
      href={postHref(post)}
      className="block group border-b theme-border pb-10"
    >
      <PostCover
        src={post.cover_image}
        alt={post.title}
        priority
        sizes="(max-width: 1024px) 100vw, 976px"
        className="aspect-[2/1] w-full mb-7"
      />
      <div className="flex items-center gap-3 mb-4">
        <span className="theme-badge type-eyebrow px-2 py-1">
          {sectionLabel(post)}
        </span>
        {post.published_at && (
          <time className="theme-text-muted type-eyebrow">
            {formatDate(post.published_at)}
          </time>
        )}
      </div>
      <h2 className="theme-text-primary type-h1 mb-4 max-w-4xl group-hover:opacity-80">
        {post.title}
      </h2>
      {post.summary && (
        <p className="theme-text-secondary type-body-lg max-w-3xl mb-5">
          {post.summary}
        </p>
      )}
      <span className="theme-text-primary inline-flex items-center gap-1.5 text-sm font-semibold">
        Read it <ArrowIcon className="w-3.5 h-3.5" />
      </span>
    </Link>
  );
}

function EmptyLead() {
  return (
    <div className="border-b theme-border pb-10">
      <h2 className="theme-text-primary type-h1 mb-4">
        The first issue is on its way.
      </h2>
      <p className="theme-text-secondary type-body-lg max-w-2xl">
        Subscribe above and it lands in your inbox the day it ships.
      </p>
    </div>
  );
}

export default async function HomePage() {
  const posts = await getFeedPosts(7);
  const [featured, ...rest] = posts;

  return (
    <>
      {/* ── Standfirst + the ask ───────────────────────────────────────────
          The one job. Compact on purpose: a masthead statement, two short
          paragraphs, and the form. Everything below this is the evidence that
          the promise is worth taking. ── */}
      <section className="theme-page pt-32 pb-14 md:pb-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-start">
            <div className="max-w-2xl">
              {/* NO EYEBROW HERE, deliberately. It rendered site.tagline, and once
                  that narrowed to "Greenville Real Estate" on August 25, 2026 it
                  said the same words as the headline directly beneath it, once at
                  11px and once at 72px, which reads as a mistake rather than as
                  structure. The headline is now the masthead statement and does
                  the eyebrow's job. Every other Eyebrow on the page still earns
                  its rule because it labels a section the reader is arriving at. */}
              <h1 className="theme-text-primary type-display mb-6">
                Articles here cover Greenville real estate.
              </h1>
              <p className="theme-text-secondary type-body-lg mb-4">
                Most of what gets written about this market is a headline number with
                nothing behind it. I go to the county record and work out what the number
                actually means.
              </p>
              <p className="theme-text-secondary type-body-lg">
                That covers how homes are really selling here, and where prices have been
                heading over years rather than quarters. When a deal looks arbitrary, there
                is usually a tax rule underneath it, and finding that rule is the
                interesting part.
              </p>
            </div>

            <div className="theme-card-contrast border theme-border p-7 md:p-8">
              <SubscribeForm source="home-standfirst" />
            </div>
          </div>
        </div>
      </section>

      {/* ── The work ── */}
      <section className="theme-section py-14 md:py-16 border-t theme-border">
        <div className="max-w-5xl mx-auto px-6">
          <Eyebrow className="mb-8">Latest</Eyebrow>
          {featured ? <FeaturedStory post={featured} /> : <EmptyLead />}

          {rest.length > 0 && (
            <>
              <div className="flex items-end justify-between mt-10 mb-6 gap-4">
                <h2 className="theme-text-primary type-h3">More to read</h2>
                <Link href="/archive" className="theme-link inline-flex items-center gap-1.5 text-sm font-medium whitespace-nowrap">
                  Full archive <ArrowIcon className="w-3.5 h-3.5" />
                </Link>
              </div>
              <ul className="grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((p) => (
                  <li key={p.id}>
                    <Link href={postHref(p)} className="h-full flex flex-col group">
                      <PostCover
                        src={p.cover_image}
                        alt={p.title}
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 312px"
                        className="aspect-[16/9] w-full mb-4"
                      />
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <span className="theme-badge type-eyebrow px-1.5 py-0.5">
                          {sectionLabel(p)}
                        </span>
                        {p.published_at && (
                          <time className="theme-text-muted type-eyebrow">
                            {formatDate(p.published_at)}
                          </time>
                        )}
                      </div>
                      <h3 className="theme-text-primary type-title mb-2 group-hover:opacity-80">
                        {p.title}
                      </h3>
                      {p.summary && (
                        <p className="theme-text-muted type-small line-clamp-3">
                          {p.summary}
                        </p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>

    </>
  );
}
