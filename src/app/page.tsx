import Link from "next/link";
import { socials, newsletterUrl, manifesto, outcomes, realEstateOutcomes, principles } from "@/lib/site";
import { getPublishedPosts, formatDate, type ArchivePost } from "@/lib/posts";
import { OutcomeArt, type OutcomeArtSlug } from "@/components/OutcomeArt";
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
    <span className={`theme-label inline-block text-xs font-semibold uppercase tracking-[0.2em] ${className}`}>
      <span className="opacity-50">{"> "}</span>
      {children}
    </span>
  );
}

function FeaturedStory({ post }: { post: ArchivePost }) {
  return (
    <Link
      href={`/archive/${post.slug}`}
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
            Latest walkthrough
          </span>
          {post.published_at && (
            <time className="theme-text-muted text-xs uppercase tracking-widest">
              {formatDate(post.published_at)}
            </time>
          )}
        </div>
        <h3 className="theme-text-primary text-2xl md:text-4xl font-bold tracking-tight leading-tight mb-4 group-hover:opacity-80">
          {post.title}
        </h3>
        {post.summary && (
          <p className="theme-text-secondary text-base md:text-lg leading-relaxed max-w-3xl mb-5">
            {post.summary}
          </p>
        )}
        <span className="theme-text-primary inline-flex items-center gap-1.5 text-sm font-semibold">
          Read the walkthrough <ArrowIcon className="w-3.5 h-3.5" />
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
      <h3 className="theme-text-primary text-2xl md:text-3xl font-bold tracking-tight leading-tight mt-5 mb-4">
        The first walkthrough is on its way.
      </h3>
      <p className="theme-text-secondary text-base md:text-lg leading-relaxed max-w-xl mx-auto mb-7">
        Subscribe now and the very first one lands in your inbox the day it ships.
        You will get one clear walkthrough at a time, and nothing else.
      </p>
      <SubscribeButton className="px-7 py-3.5" />
    </div>
  );
}

export default async function HomePage() {
  const posts = await getPublishedPosts(7, "newsletter");
  const [featured, ...rest] = posts;

  return (
    <>
      {/* ── Hero ── */}
      <section className="theme-page relative overflow-hidden pt-32 md:pt-40 pb-16 md:pb-24">
        <span
          className="prompt-watermark absolute -right-8 top-8 text-[16rem] md:text-[24rem] hidden sm:block select-none"
          aria-hidden
        >
          {">"}
        </span>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <Eyebrow className="mb-5">For real estate agents and investors</Eyebrow>
          <h1 className="theme-text-primary text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.04] max-w-4xl">
            Claude for real estate agents and investors.
            <span className="caret" aria-hidden>▌</span>
          </h1>
          <p className="theme-text-secondary text-lg md:text-xl leading-relaxed max-w-2xl mt-6">
            Most agents and investors use Claude like a search box. It can do far more. Alex
            Prompts shows you how to make it write your listings, run your market research,
            analyze a deal, and handle the follow-up, in plain English, with no code to write
            and nothing skipped.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mt-8">
            <SubscribeButton className="px-7 py-3.5" />
            <Link
              href="#learn"
              className="theme-link inline-flex items-center gap-2 font-medium px-2 py-3.5 text-sm"
            >
              See what you&apos;ll learn <ArrowIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── What you'll do in real estate (primary value) ── */}
      <section id="learn" className="theme-section py-20 md:py-28 border-t theme-border">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <Eyebrow className="mb-4">What you&apos;ll do with Claude</Eyebrow>
            <h2 className="theme-text-primary text-3xl md:text-4xl font-bold tracking-tight leading-tight">
              Point Claude at the work your week is already full of.
            </h2>
            <p className="theme-text-secondary text-lg leading-relaxed mt-4">
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
                <h3 className="theme-text-primary text-lg font-semibold leading-snug mb-2">
                  {o.title}
                </h3>
                <p className="theme-text-muted text-sm leading-relaxed">{o.body}</p>
              </li>
            ))}
          </ul>
          <Link
            href="/guides"
            className="theme-link inline-flex items-center gap-2 font-medium mt-8 text-sm"
          >
            Browse all guides <ArrowIcon className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* ── Not in real estate? (the "helps anyone" set) ── */}
      <section className="theme-section py-20 md:py-28 border-t theme-border">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <Eyebrow className="mb-4">Not active in real estate? No problem</Eyebrow>
            <h2 className="theme-text-primary text-3xl md:text-4xl font-bold tracking-tight leading-tight">
              A lot of what we cover adds value to just about anyone.
            </h2>
            <p className="theme-text-secondary text-lg leading-relaxed mt-4">
              The same Claude skills reach well beyond real estate. Here is the kind of thing you
              will be able to do, whatever your line of work.
            </p>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {outcomes.map((o) => (
              <li
                key={o.title}
                className="theme-card-strong border theme-border rounded-xl overflow-hidden h-full flex flex-col"
              >
                <div
                  className="flex items-center justify-center aspect-[16/9]"
                  style={{ background: "var(--accent-soft)" }}
                >
                  <OutcomeArt
                    slug={o.art as OutcomeArtSlug}
                    className="theme-label w-24 h-24"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="theme-text-primary text-lg font-semibold leading-snug mb-2">
                    {o.title}
                  </h3>
                  <p className="theme-text-muted text-sm leading-relaxed">{o.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── How every guide works (the approach) ── */}
      <section className="theme-section-muted border-y theme-border py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <Eyebrow className="mb-4">How every guide works</Eyebrow>
            <h2 className="theme-text-primary text-3xl md:text-4xl font-bold tracking-tight leading-tight">
              The same calm, careful approach every time.
            </h2>
          </div>
          <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {principles.map((p, i) => (
              <li
                key={p.title}
                className="theme-card-strong border theme-border rounded-xl p-6 flex gap-4"
              >
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

      {/* ── Latest guides ── */}
      <section className="theme-section py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <Eyebrow className="mb-6">Fresh from the newsletter</Eyebrow>
          {featured ? <FeaturedStory post={featured} /> : <EmptyLead />}

          {rest.length > 0 && (
            <>
              <div className="flex items-end justify-between mt-12 mb-6 gap-4">
                <h2 className="theme-text-primary text-xl md:text-2xl font-bold tracking-tight">
                  More walkthroughs
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
                      className="theme-card border theme-border rounded-xl overflow-hidden h-full flex flex-col hover:opacity-90 transition-opacity"
                    >
                      <PostCover
                        src={p.cover_image}
                        alt={p.title}
                        className="aspect-[16/9] w-full border-b theme-border"
                      />
                      <div className="p-6 flex flex-col flex-1">
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
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>

      {/* ── What we're about ── */}
      <section className="theme-section py-20 md:py-28 border-t theme-border">
        <div className="max-w-3xl mx-auto px-6">
          <Eyebrow className="mb-8">What we&apos;re about</Eyebrow>
          <div className="space-y-5 md:space-y-6">
            {manifesto.map((para, i) => (
              <p
                key={i}
                className={`leading-relaxed ${
                  i === 0
                    ? "theme-text-primary text-xl md:text-2xl font-medium tracking-tight"
                    : "theme-text-secondary text-base md:text-lg"
                }`}
              >
                {para}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ── Follow ── */}
      <section id="follow" className="theme-section py-16 md:py-24 border-t theme-border">
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-8">
            <Eyebrow className="mb-4">Where to find us</Eyebrow>
            <h2 className="theme-text-primary text-2xl md:text-3xl font-bold tracking-tight max-w-2xl">
              Short walkthroughs during the week. The full guide in your inbox.
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
          <h2 className="theme-text-primary text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Put Claude to work in your business.
          </h2>
          <p className="theme-text-contrast-muted text-base md:text-lg mb-8 leading-relaxed">
            One real walkthrough at a time, free in your inbox.
          </p>
          <SubscribeButton className="px-8 py-4" />
        </div>
      </section>
    </>
  );
}
