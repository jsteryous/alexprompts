import Link from "next/link";
import Image from "next/image";
import {
  site,
  socials,
  coverage,
  newsletterUrl,
  principles,
  manifesto,
  trackRecord,
} from "@/lib/site";
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
      <h3 className="theme-text-primary text-2xl md:text-4xl font-bold tracking-tight leading-tight mb-4 group-hover:opacity-80">
        {post.title}
      </h3>
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
      <h3 className="theme-text-primary text-2xl md:text-3xl font-bold tracking-tight leading-tight mt-5 mb-4">
        The first issue is loading.
      </h3>
      <p className="theme-text-secondary text-base md:text-lg leading-relaxed max-w-xl mx-auto mb-7">
        Subscribe now and the very first one lands in your inbox the day it ships.
        No spam. No filler. One read a week.
      </p>
      <SubscribeButton className="px-7 py-3.5" />
    </div>
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

export default async function HomePage() {
  const posts = await getPublishedPosts(7);
  const [featured, ...rest] = posts;

  return (
    <>
      {/* ── Hero ── */}
      <section className="theme-section-contrast relative overflow-hidden pt-28 md:pt-36 pb-16 md:pb-24">
        <div className="absolute inset-0" aria-hidden>
          <Image
            src="/img/hero-earth-limb.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(8,10,14,0.94) 0%, rgba(8,10,14,0.78) 48%, rgba(8,10,14,0.4) 100%), linear-gradient(0deg, rgba(8,10,14,0.95) 0%, rgba(8,10,14,0) 45%)",
            }}
          />
        </div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <Eyebrow className="mb-5">No hype. No doom. Just the frontier.</Eyebrow>
          <h1 className="theme-text-primary text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.04] max-w-4xl">
            {site.tagline}
            <span className="caret" aria-hidden>▌</span>
          </h1>
          <p className="theme-text-contrast-muted text-lg md:text-xl leading-relaxed max-w-2xl mt-6">
            {site.oneLiner}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mt-9">
            <SubscribeButton className="px-7 py-3.5" />
            <Link
              href="/archive"
              className="theme-link inline-flex items-center gap-2 font-medium px-2 py-3.5 text-sm"
            >
              Read the latest issue <ArrowIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
          <p className="theme-text-muted text-sm mt-10 border-t theme-border pt-5 max-w-2xl">
            We don&apos;t build the future. We listen to the people who are, and argue about
            what it means.
          </p>
        </div>
      </section>

      {/* ── Top content ── */}
      <section className="theme-page pt-14 md:pt-20 pb-16">
        <div className="max-w-5xl mx-auto px-6">
          <Eyebrow className="mb-6">Fresh off the wire</Eyebrow>
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

      {/* ── What we're about ── */}
      <section className="theme-section-contrast py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6">
          <Eyebrow className="mb-8">What we&apos;re about</Eyebrow>
          <div className="space-y-5 md:space-y-6">
            {manifesto.map((para, i) => (
              <p
                key={i}
                className={`leading-relaxed ${
                  i === 0
                    ? "theme-text-primary text-xl md:text-2xl font-medium tracking-tight"
                    : "theme-text-contrast-muted text-base md:text-lg"
                }`}
              >
                {para}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ── How every issue works (the method) ── */}
      <section className="theme-section-contrast relative overflow-hidden border-y theme-border py-16 md:py-24">
        <div className="absolute inset-0" aria-hidden>
          <Image
            src="/img/dario-amodei.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-right"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(8,10,14,0.95) 0%, rgba(8,10,14,0.8) 45%, rgba(8,10,14,0.3) 100%), linear-gradient(0deg, rgba(8,10,14,0.7) 0%, rgba(8,10,14,0.22) 35%)",
            }}
          />
        </div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="max-w-2xl mb-10">
            <Eyebrow className="mb-4">How every issue works</Eyebrow>
            <h2 className="theme-text-primary text-2xl md:text-3xl font-bold tracking-tight leading-snug">
              We start with the builders&apos; own words and pressure-test them. Five steps,
              every time.
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

      {/* ── The track record ── */}
      <section className="theme-section py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-2xl mb-10">
            <Eyebrow className="mb-4">The track record</Eyebrow>
            <h2 className="theme-text-primary text-2xl md:text-3xl font-bold tracking-tight leading-snug mb-4">
              Very smart people have a long history of betting against technology, confidently,
              and losing.
            </h2>
            <p className="theme-text-muted text-base md:text-lg leading-relaxed">
              This does not make every optimist right. It raises the bar for &ldquo;this time is
              different.&rdquo;
            </p>
          </div>

          <figure className="mb-10 md:mb-12 max-w-xl">
            <div className="theme-card-strong border theme-border rounded-xl p-2 shadow-sm">
              <Image
                src="/img/elon-prediction.jpg"
                alt="Elon Musk post: for time-based predictions he aims for the 50th-percentile date, so half land early and half late, but the prediction rarely fails to come true over time."
                width={901}
                height={362}
                sizes="(max-width: 768px) 100vw, 36rem"
                className="w-full h-auto rounded-md"
              />
            </div>
            <figcaption className="theme-text-muted text-sm mt-3 leading-relaxed">
              Elon Musk on his own record. Direction is the easy part.
              Timing is where almost everyone, optimist and skeptic alike, gets humbled.
            </figcaption>
          </figure>

          <ul className="grid gap-5 md:grid-cols-2">
            {trackRecord.map((r) => (
              <li key={r.who} className="theme-card border theme-border rounded-xl p-6 flex flex-col">
                <p className="theme-text-primary text-lg md:text-xl font-semibold leading-snug mb-4">
                  &ldquo;{r.quote}&rdquo;
                </p>
                <p className="theme-text-secondary text-sm font-medium">
                  {r.who}
                  <span className="theme-text-muted font-normal">
                    {" "}· {r.role} · {r.year}
                  </span>
                </p>
                <p className="theme-text-muted text-sm leading-relaxed mt-2">{r.aftermath}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Coverage ── */}
      <section className="theme-section-muted border-y theme-border py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <Eyebrow className="mb-6">On our radar</Eyebrow>
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
      <section id="follow" className="theme-section py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-8">
            <Eyebrow className="mb-4">Where to find us</Eyebrow>
            <h2 className="theme-text-primary text-2xl md:text-3xl font-bold tracking-tight max-w-2xl">
              Short clips during the week. The full argument in your inbox.
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
      <section className="theme-section-contrast relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0" aria-hidden>
          <Image
            src="/img/falcon-heavy-launch.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(53, 72, 108, 0.82) 0%, rgba(53, 72, 108, 0.82) 50%, rgba(53, 72, 108, 0.82) 100%)",
            }}
          />
        </div>
        <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
          <h2 className="theme-text-primary text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Position yourself accordingly.
          </h2>
          <p className="theme-text-contrast-muted text-base md:text-lg mb-8 leading-relaxed">
            One issue a week. Free. The builders&apos; biggest claim, translated and
            pressure-tested, and the question worth arguing about.
          </p>
          <SubscribeButton className="px-8 py-4" />
        </div>
      </section>
    </>
  );
}
