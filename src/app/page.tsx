import Link from "next/link";
import { socials, newsletterUrl, realEstateOutcomes } from "@/lib/site";
import { getFeedPosts, postHref, sectionLabel, formatDate, type ArchivePost } from "@/lib/posts";
import { liveTools, audienceLabel, toolHref } from "@/lib/tools";
import { ToolIcon } from "@/components/ToolIcon";
import { PostCover } from "@/components/PostCover";

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

function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`theme-label type-eyebrow inline-block ${className}`}>
      <span className="opacity-50">{"> "}</span>
      {children}
    </span>
  );
}

function FeaturedStory({ post }: { post: ArchivePost }) {
  return (
    <Link
      href={postHref(post)}
      className="theme-card border theme-border rounded-2xl overflow-hidden block group"
    >
      <PostCover
        src={post.cover_image}
        alt={post.title}
        priority
        className="aspect-[2/1] w-full border-b theme-border"
      />
      <div className="p-8 md:p-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="theme-badge text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded">
            {sectionLabel(post)}
          </span>
          {post.published_at && (
            <time className="theme-text-muted text-xs uppercase tracking-widest">
              {formatDate(post.published_at)}
            </time>
          )}
        </div>
        <h3 className="theme-text-primary type-h2 mb-4 group-hover:opacity-80">
          {post.title}
        </h3>
        {post.summary && (
          <p className="theme-text-secondary type-body-lg max-w-3xl mb-5">
            {post.summary}
          </p>
        )}
        <span className="theme-text-primary inline-flex items-center gap-1.5 text-sm font-semibold">
          Read it <ArrowIcon className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}

function EmptyLead() {
  return (
    <div className="theme-card border theme-border rounded-2xl p-8 md:p-12 text-center">
      <span className="theme-badge text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded">
        First walkthrough incoming
      </span>
      <h3 className="theme-text-primary type-h2 mt-5 mb-4">
        The first walkthrough is on its way.
      </h3>
      <p className="theme-text-secondary type-body-lg max-w-xl mx-auto mb-7">
        Subscribe now and the very first one lands in your inbox the day it ships.
        You will get one clear walkthrough at a time, and nothing else.
      </p>
      <SubscribeButton className="px-7 py-3.5" />
    </div>
  );
}

export default async function HomePage() {
  const posts = await getFeedPosts(7);
  const [featured, ...rest] = posts;

  return (
    <>
      {/* ── Lead: fresh reads first (newsletter issues + local real-estate posts) ── */}
      <section className="theme-page relative overflow-hidden pt-32 pb-16 md:pb-20">
        <span
          className="prompt-watermark absolute -right-8 top-8 text-[16rem] md:text-[20rem] hidden sm:block select-none"
          aria-hidden
        >
          {">"}
        </span>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <Eyebrow className="mb-6">Fresh from Alex Prompts</Eyebrow>
          {featured ? <FeaturedStory post={featured} /> : <EmptyLead />}

          {rest.length > 0 && (
            <>
              <div className="flex items-end justify-between mt-12 mb-6 gap-4">
                <h2 className="theme-text-primary type-h3">
                  More to read
                </h2>
                <Link href="/archive" className="theme-link inline-flex items-center gap-1.5 text-sm font-medium whitespace-nowrap">
                  Full archive <ArrowIcon className="w-3.5 h-3.5" />
                </Link>
              </div>
              <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={postHref(p)}
                      className="theme-card border theme-border rounded-xl overflow-hidden h-full flex flex-col hover:opacity-90 transition-opacity"
                    >
                      <PostCover
                        src={p.cover_image}
                        alt={p.title}
                        className="aspect-[16/9] w-full border-b theme-border"
                      />
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-2.5 mb-3">
                          <span className="theme-badge text-[0.65rem] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded">
                            {sectionLabel(p)}
                          </span>
                          {p.published_at && (
                            <time className="theme-text-muted text-xs uppercase tracking-widest">
                              {formatDate(p.published_at)}
                            </time>
                          )}
                        </div>
                        <h3 className="theme-text-primary type-title mb-2">
                          {p.title}
                        </h3>
                        {p.summary && (
                          <p className="theme-text-muted type-small line-clamp-3">
                            {p.summary}
                          </p>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>

      {/* ── Tools spotlight: actual, usable tools right on the homepage ── */}
      <section className="theme-section py-16 md:py-20 border-t theme-border">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div className="max-w-2xl">
              <Eyebrow className="mb-4">Tools, no sign-up</Eyebrow>
              <h2 className="theme-text-primary type-h2">
                Useful the second you land.
              </h2>
            </div>
            <Link href="/tools" className="theme-link hidden sm:inline-flex items-center gap-1.5 text-sm font-medium whitespace-nowrap">
              All tools <ArrowIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {liveTools().map((t) => (
              <li key={t.slug}>
                <Link
                  href={toolHref(t)}
                  {...(t.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="theme-card border theme-border rounded-xl p-6 h-full flex flex-col group hover:opacity-90 transition-opacity"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="inline-flex items-center justify-center w-11 h-11 rounded-xl shrink-0"
                      style={{ background: "var(--accent-soft)" }}
                    >
                      <ToolIcon slug={t.slug} className="theme-label w-6 h-6" />
                    </span>
                    <span className="theme-badge text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded">
                      {audienceLabel[t.audience]}
                    </span>
                  </div>
                  <h3 className="theme-text-primary type-title mb-2">{t.title}</h3>
                  <p className="theme-text-muted type-small flex-1">{t.blurb}</p>
                  <span className="theme-text-primary inline-flex items-center gap-1.5 text-sm font-semibold mt-4">
                    {t.cta} <ArrowIcon className="w-3.5 h-3.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── What you'll do in real estate (primary value) ── */}
      <section id="learn" className="theme-section py-20 md:py-28 border-t theme-border">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <Eyebrow className="mb-4">What you&apos;ll do with Claude</Eyebrow>
            <h2 className="theme-text-primary type-h2">
              Point Claude at the work your week is already full of.
            </h2>
            <p className="theme-text-secondary type-body-lg mt-4">
              Not a tour of buttons. The actual jobs an agent or investor does, shown step by
              step, so you can do them in a fraction of the time.
            </p>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {realEstateOutcomes.map((o) => (
              <li
                key={o.title}
                className="theme-card-strong border theme-border rounded-xl p-6 h-full flex flex-col"
              >
                <h3 className="theme-text-primary type-title mb-2">
                  {o.title}
                </h3>
                <p className="theme-text-muted type-small">{o.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Follow ── */}
      <section id="follow" className="theme-section py-16 md:py-24 border-t theme-border">
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-8">
            <Eyebrow className="mb-4">Where to find us</Eyebrow>
            <h2 className="theme-text-primary type-h2 max-w-2xl">
              Follow along during the week, or get it all in your inbox.
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
      <section className="theme-section-contrast py-24 md:py-32">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="theme-text-primary type-h2 mb-4">
            Get it in your inbox.
          </h2>
          <p className="theme-text-contrast-muted type-body-lg mb-8">
            The newsletter, free. Unsubscribe anytime.
          </p>
          <SubscribeButton className="px-8 py-4" />
        </div>
      </section>
    </>
  );
}
