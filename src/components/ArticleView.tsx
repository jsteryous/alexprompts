import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import Link from "next/link";
import { site } from "@/lib/site";
import { coverImageFromBody, formatDate, sectionOf, type FullPost } from "@/lib/posts";
import { SubscribeForm } from "@/components/SubscribeForm";
import { ReferralCta } from "@/components/ReferralCta";

/** Which section the article lives in, for breadcrumb + canonical + back-link. */
export interface ArticleSection {
  label: string; // "Archive" | "Real Estate" | "Greenville Works"
  basePath: string; // "/archive" | "/real-estate" | "/greenville-works"
  /** Section-specific line for the footer subscribe box. Falls back to the
   *  general Claude blurb when omitted. */
  blurb?: string;
  /** Show the in-article referral CTA (links to /find-an-agent). On for the
   *  high-intent /real-estate section, where a reader is the best referral lead. */
  showReferralCta?: boolean;
}

/**
 * Shared renderer for a single post, used by /archive/[slug], /real-estate/[slug],
 * and /greenville-works/[slug]. The routes differ only in which `section` (and which post type)
 * they pass; the heavy markdown -> sanitize -> JSON-LD pipeline lives here once.
 */
export default async function ArticleView({
  post,
  section,
}: {
  post: FullPost;
  section: ArticleSection;
}) {
  // body_md is first-party (Substack mirror + token-gated publish), but sanitize
  // anyway as defense-in-depth against a tampered row. sanitize-html is pure JS
  // (no jsdom), so it loads cleanly in the serverless runtime.
  const bodyHtml = sanitizeHtml(await marked(post.body_md ?? ""), {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img", "h1", "h2"],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "loading", "width", "height"],
      a: ["href", "name", "target", "rel"],
    },
  });
  const authorName = post.author ?? site.author;
  const published = post.published_at ?? null;
  const canonical = `${site.url}${section.basePath}/${post.slug}`;
  const subscribeBlurb =
    section.blurb ??
    "I send clear walkthroughs, free. Each one is a real thing you can do with Claude, shown step by step, with nothing assumed and no jargon left undefined.";

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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.cover_image}
                alt={post.title}
                loading="eager"
                decoding="async"
                className="theme-border w-full rounded-xl border"
              />
              {post.cover_credit && (
                <figcaption className="theme-text-muted mt-2 text-xs">
                  {post.cover_credit}
                </figcaption>
              )}
            </figure>
          )}
          <div className="theme-prose prose max-w-none" dangerouslySetInnerHTML={{ __html: bodyHtml }} />

          {/* The referral CTA comes BEFORE the newsletter box on purpose: on a
              referral-first site, the buy/sell offer outranks audience growth. */}
          {section.showReferralCta && (
            <div className="mt-14">
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
          <SubscribeForm
            source={`article:${sectionOf(post)}`}
            heading="Get the next one in your inbox."
            blurb={subscribeBlurb}
            cta="Subscribe free"
          />
        </div>
      </section>
    </>
  );
}
