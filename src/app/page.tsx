import Link from "next/link";
import { site, socials, coverage, newsletterUrl, principles } from "@/lib/site";
import { getPublishedPosts, formatDate, type ArchivePost } from "@/lib/posts";

export const revalidate = 300;

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

function SubscribeButton({ className = "" }: { className?: string }) {
  return (
    <a
      href={newsletterUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`theme-cta-accent inline-flex items-center gap-2 font-semibold rounded-xl ${className}`}
    >
      Subscribe free
      <ArrowIcon />
    </a>
  );
}

function FeaturedStory({ post }: { post: ArchivePost }) {
  return (
    <Link
      href={`/archive/${post.slug}`}
      className="theme-card border theme-border rounded-2xl p-8 md:p-10 block group"
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="theme-badge text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded">
          Latest issue
        </span>
        {post.published_at && (
          <time className="theme-text-muted text-xs uppercase tracking-widest">
            {formatDate(post.published_at)}
          </time>
        )}
      </div>
      <h2 className="theme-text-primary text-2xl md:text-4xl font-bold tracking-tight leading-tight mb-4 group-hover:opacity-80">
        {post.title}
      </h2>
      {post.summary && (
        <p className="theme-text-secondary text-base md:text-lg leading-relaxed max-w-3xl mb-5">
          {post.summary}
        </p>
      )}
      <span className="theme-text-primary inline-flex items-center gap-1.5 text-sm font-semibold">
        Read the issue <ArrowIcon className="w-3.5 h-3.5" />
      </span>
    </Link>
  );
}

function EmptyLead() {
  return (
    <div className="theme-card border theme-border rounded-2xl p-8 md:p-12 text-center">
      <span className="theme-badge text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded">
        Issue 001 incoming
      </span>
      <h2 className="theme-text-primary text-2xl md:text-3xl font-bold tracking-tight leading-tight mt-5 mb-4">
        The first issues are on their way.
      </h2>
      <p className="theme-text-secondary text-base md:text-lg leading-relaxed max-w-xl mx-auto mb-7">
        Subscribe now and the very first one lands in your inbox the day it goes out.
        No spam, no noise. One read a week.
      </p>
      <SubscribeButton className="px-7 py-3.5" />
    </div>
  );
}

export default async function HomePage() {
  const posts = await getPublishedPosts(7);
  const [featured, ...rest] = posts;

  return (
    <>
      {/* ── Masthead ── */}
      <section className="theme-page pt-24 md:pt-28">
        <div className="max-w-5xl mx-auto px-6 pt-10 pb-8 md:pt-14 md:pb-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
            <div className="max-w-2xl">
              <span className="theme-label inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-3">
                Frontier tech, weekly
              </span>
              <h1 className="theme-text-primary text-3xl md:text-4xl font-bold tracking-tight leading-[1.1]">
                The companies building the future, in plain English.
              </h1>
              <p className="theme-text-muted text-base md:text-lg mt-3 leading-relaxed">
                {site.oneLiner}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <SubscribeButton className="px-5 py-3 text-sm" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Top content ── */}
      <section className="theme-section pb-16">
        <div className="max-w-5xl mx-auto px-6">
          {featured ? <FeaturedStory post={featured} /> : <EmptyLead />}

          {rest.length > 0 && (
            <>
              <div className="flex items-end justify-between mt-12 mb-6 gap-4">
                <h2 className="theme-text-primary text-xl md:text-2xl font-bold tracking-tight">
                  More issues
                </h2>
                <Link href="/archive" className="theme-link inline-flex items-center gap-1.5 text-sm font-medium whitespace-nowrap">
                  Full archive <ArrowIcon className="w-3.5 h-3.5" />
                </Link>
              </div>
              <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/archive/${p.slug}`}
                      className="theme-card border theme-border rounded-xl p-6 h-full flex flex-col hover:opacity-90 transition-opacity"
                    >
                      {p.published_at && (
                        <time className="theme-text-muted text-xs uppercase tracking-widest mb-3">
                          {formatDate(p.published_at)}
                        </time>
                      )}
                      <h3 className="theme-text-primary text-lg font-semibold leading-snug mb-2">
                        {p.title}
                      </h3>
                      {p.summary && (
                        <p className="theme-text-muted text-sm leading-relaxed line-clamp-3">
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

      {/* ── How we cover it (the editorial method) ── */}
      <section className="theme-section-muted border-y theme-border py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-2xl mb-10">
            <span className="theme-label inline-block text-xs font-semibold uppercase tracking-widest mb-3">
              How we cover it
            </span>
            <h2 className="theme-text-primary text-2xl md:text-3xl font-bold tracking-tight leading-snug">
              Most coverage is hype or doom. Neither helps you decide what to think.
            </h2>
          </div>
          <ol className="grid gap-5 md:grid-cols-2">
            {principles.map((p, i) => (
              <li key={p.title} className="theme-card-strong border theme-border rounded-xl p-6 flex gap-4">
                <span className="theme-label text-sm font-bold tabular-nums pt-0.5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="theme-text-primary text-base font-semibold mb-1.5">{p.title}</h3>
                  <p className="theme-text-muted text-sm leading-relaxed">{p.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Coverage ── */}
      <section className="theme-section py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <span className="theme-label inline-block text-xs font-semibold uppercase tracking-widest mb-6">
            We cover the people building it
          </span>
          <div className="flex flex-wrap justify-center gap-2.5">
            {coverage.map((c) => (
              <span
                key={c}
                className="theme-card-strong theme-text-secondary border theme-border text-sm font-medium px-4 py-2 rounded-full"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Follow ── */}
      <section id="follow" className="theme-section pb-16 md:pb-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-8">
            <span className="theme-label inline-block text-xs font-semibold uppercase tracking-widest mb-3">
              Follow along
            </span>
            <h2 className="theme-text-primary text-2xl md:text-3xl font-bold tracking-tight">
              Short clips during the week. The full story in your inbox.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {socials.map((s) => (
              <a
                key={s.key}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="theme-card-strong border theme-border rounded-xl p-6 flex flex-col gap-1 hover:opacity-90 transition-opacity"
              >
                <span className="theme-text-primary text-base font-semibold">{s.label}</span>
                <span className="theme-text-muted text-sm">{s.handle}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Subscribe CTA ── */}
      <section className="theme-section-contrast py-20 md:py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="theme-text-primary text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Understand the future before it&apos;s common knowledge.
          </h2>
          <p className="theme-text-contrast-muted text-base md:text-lg mb-8 leading-relaxed">
            One issue a week. Free. The biggest story from the frontier, translated, and the
            question worth arguing about.
          </p>
          <SubscribeButton className="px-8 py-4" />
        </div>
      </section>
    </>
  );
}
