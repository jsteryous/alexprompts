import Link from "next/link";
import { site } from "@/lib/site";
import { renderPostHtml } from "@/lib/renderMarkdown";
import { coverImageFromBody, formatDate, sectionOf, type FullPost } from "@/lib/posts";
import { SubscribeForm } from "@/components/SubscribeForm";
import { ReferralCta } from "@/components/ReferralCta";
import { splitAtMidHeading } from "@/lib/articleCta";
import { PostCover } from "@/components/PostCover";

/** Which section the article lives in, for breadcrumb + canonical + back-link. */
export interface ArticleSection {
  label: string; // "Sales" | "Real Estate" | "Upstate Brief" | "Archive"
  basePath: string; // "/sales" | "/real-estate" | "/briefing" | "/archive"
  /** Show the buy/sell CTA (links to /find-a-pro), both mid-article and at the
   *  close. On for the sections whose readers are buyers and sellers, which as of
   *  August 25, 2026 means /sales, /real-estate, and /briefing. Off for /archive
   *  alone, whose readers came for the newsletter. */
  showReferralCta?: boolean;
}

/**
 * Shared renderer for a single post, used by /sales/[slug], /real-estate/[slug],
 * /briefing/[slug], and /archive/[slug]. The routes differ only in which `section`
 * (and which post type) they pass; the heavy markdown -> sanitize -> JSON-LD
 * pipeline lives here once.
 */
export default async function ArticleView({
  post,
  section,
}: {
  post: FullPost;
  section: ArticleSection;
}) {
  // Shared markdown -> sanitized HTML pipeline (also used by the /admin preview).
  const bodyHtml = await renderPostHtml(post.body_md ?? "");
  // Sections that carry the buy/sell offer get it mid-article too, not only at
  // the end, so a skimmer cannot miss it. Null on short or flat pieces.
  const midSplit = section.showReferralCta ? splitAtMidHeading(bodyHtml) : null;
  const authorName = post.author ?? site.author;
  const published = post.published_at ?? null;
  const canonical = `${site.url}${section.basePath}/${post.slug}`;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.summary ?? undefined,
    datePublished: published,
    dateModified: published,
    author: { "@type": "Person", name: authorName, url: site.url },
    publisher: { "@type": "Organization", name: site.name, url: site.url },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${site.url}/` },
      { "@type": "ListItem", position: 2, name: section.label, item: `${site.url}${section.basePath}` },
      { "@type": "ListItem", position: 3, name: post.title, item: canonical },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <section className="theme-page theme-border pt-32 pb-12 border-b">
        <div className="max-w-2xl mx-auto px-6">
          <nav className="theme-text-muted text-xs mb-8 flex flex-wrap items-center gap-1.5" aria-label="Breadcrumb">
            <Link href={section.basePath} className="hover:opacity-80">{section.label}</Link>
          </nav>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span key={tag} className="theme-badge text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="theme-text-primary text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-4">
            {post.title}
          </h1>

          {post.summary && (
            <p className="theme-text-muted text-lg leading-relaxed mb-6">{post.summary}</p>
          )}

          <div className="theme-text-muted flex items-center gap-3 text-sm">
            <span>{authorName}</span>
            {published && (
              <>
                <span>·</span>
                <time>{formatDate(published)}</time>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="theme-section py-16">
        <div className="max-w-2xl mx-auto px-6">
          {/* Show the stored cover as a hero only when the body does not already
              lead with an image. New Greenville posts have a text-only body (the
              cover is rendered into cover_image by the finalize cron), so the hero
              belongs here. Substack bodies and older Greenville posts embed
              their image inline, so adding a hero would print it twice. */}
          {post.cover_image && !coverImageFromBody(post.body_md) && (
            <figure className="mb-10">
              {/* PostCover (not a raw img) so the hero is the article's mobile
                  LCP done right: responsive AVIF variants for library covers,
                  priority preload, and a reserved 2/1 box (the natural-height
                  img reserved no space, so the whole article shifted down when
                  it arrived). 2/1 matches the homepage featured crop. */}
              <PostCover
                src={post.cover_image}
                alt={post.title}
                priority
                sizes="(max-width: 720px) 100vw, 624px"
                className="theme-border aspect-[2/1] w-full rounded-xl border"
              />
              {post.cover_credit && (
                <figcaption className="theme-text-muted mt-2 text-xs">
                  {post.cover_credit}
                </figcaption>
              )}
            </figure>
          )}
          {/* Two placements, because one below the fold was missable (see
              lib/articleCta.ts). The mid-body box catches the skimmer; the
              closing box catches the finisher. splitAtMidHeading returns null on
              short or flat articles, and then the body renders in one piece. */}
          {midSplit ? (
            <>
              <div
                className="theme-prose prose max-w-none"
                dangerouslySetInnerHTML={{ __html: midSplit.before }}
              />
              <div className="my-10">
                <ReferralCta slug={post.slug} variant="inline" />
              </div>
              <div
                className="theme-prose prose max-w-none"
                dangerouslySetInnerHTML={{ __html: midSplit.after }}
              />
            </>
          ) : (
            <div className="theme-prose prose max-w-none" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
          )}

          {/* The referral CTA comes BEFORE the newsletter box on purpose: on a
              referral-first site, the buy/sell offer outranks audience growth. */}
          {section.showReferralCta && (
            <div className="mt-12">
              <ReferralCta slug={post.slug} />
            </div>
          )}
        </div>
      </section>

      <section className="theme-section-contrast py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <span className="theme-label inline-block text-xs font-semibold uppercase tracking-widest mb-4">
            {site.name}
          </span>
          {/* Deliberately BARE: no heading, no blurb, just the field and the
              button under the wordmark. Alex's call, August 26, 2026, in the
              same pass that reduced the buy/sell CTA to one line. A reader who
              has just finished the piece has already had the pitch; the pitch
              was the piece. The full promise still leads on /subscribe and on
              the homepage, where a stranger meets it cold and needs it. */}
          <SubscribeForm
            source={`article:${sectionOf(post)}`}
            heading=""
            blurb=""
            cta="Subscribe free"
          />
        </div>
      </section>
    </>
  );
}
