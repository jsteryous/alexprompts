import type { Metadata } from "next";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site, newsletterUrl } from "@/lib/site";
import { getPost, formatDate } from "@/lib/posts";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Not found" };
  return {
    title: post.title,
    description: post.summary ?? undefined,
    alternates: { canonical: `${site.url}/archive/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.summary ?? undefined,
      type: "article",
      url: `${site.url}/archive/${post.slug}`,
    },
  };
}

export default async function ArchivePost({ params }: Props) {
  const { slug } = await params;

  // TEMP DIAGNOSTIC: surface the real production error (Next redacts server
  // error messages to a digest in prod). Remove after root cause is found.
  let post: Awaited<ReturnType<typeof getPost>> = null;
  let bodyHtml = "";
  let stage = "getPost";
  try {
    post = await getPost(slug);
    if (!post) notFound();
    stage = "marked";
    const md = await marked(post.body_md ?? "");
    stage = "sanitize";
    bodyHtml = DOMPurify.sanitize(md);
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e && String((e as { digest?: string }).digest).startsWith("NEXT_")) {
      throw e; // notFound()/redirect signals must propagate
    }
    return (
      <pre style={{ whiteSpace: "pre-wrap", padding: 40, paddingTop: 120, fontSize: 13 }}>
        {`DIAGNOSTIC — failed at stage: ${stage}\nslug: ${slug}\n\n${String(e)}\n\n${(e as Error)?.stack ?? "(no stack)"}`}
      </pre>
    );
  }

  const authorName = post.author ?? site.author;
  const published = post.published_at ?? null;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.summary ?? undefined,
    datePublished: published,
    dateModified: published,
    author: { "@type": "Person", name: authorName, url: site.url },
    publisher: { "@type": "Organization", name: site.name, url: site.url },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${site.url}/archive/${post.slug}`,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${site.url}/` },
      { "@type": "ListItem", position: 2, name: "Archive", item: `${site.url}/archive` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${site.url}/archive/${post.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <section className="theme-page theme-border pt-32 pb-12 border-b">
        <div className="max-w-2xl mx-auto px-6">
          <nav className="theme-text-muted text-xs mb-8 flex flex-wrap items-center gap-1.5" aria-label="Breadcrumb">
            <Link href="/archive" className="hover:opacity-80">Archive</Link>
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
          <div className="theme-prose prose max-w-none" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
        </div>
      </section>

      <section className="theme-section-contrast py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <span className="theme-label inline-block text-xs font-semibold uppercase tracking-widest mb-4">
            {site.name}
          </span>
          <h2 className="theme-text-primary text-2xl md:text-3xl font-bold tracking-tight mb-4">
            See the next one coming.
          </h2>
          <p className="theme-text-contrast-muted mb-8 leading-relaxed">
            One read a week. The biggest story from the frontier, the facts split from the
            sales pitch, and the honest open question at the end. Free. You walk away
            oriented, not anxious.
          </p>
          <a
            href={newsletterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="theme-cta-accent inline-flex items-center gap-2 font-semibold px-7 py-3.5 rounded-xl"
          >
            Subscribe free
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </section>
    </>
  );
}
