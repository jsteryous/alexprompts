import type { Metadata } from "next";
import Link from "next/link";
import { site, socials, coverage, newsletterUrl, principles } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `Who writes ${site.name} and the framework behind it. ${site.oneLiner}`,
  alternates: { canonical: `${site.url}/about` },
};

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
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

export default function AboutPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="theme-page pt-32 md:pt-36 pb-16 md:pb-20">
        <div className="max-w-2xl mx-auto px-6">
          <Eyebrow className="mb-5">About</Eyebrow>
          <h1 className="theme-text-primary text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] mb-6">
            Change is the only constant.
          </h1>
          <p className="theme-text-secondary text-lg md:text-xl leading-relaxed">
            Understanding technology has become as essential as reading was two
            hundred years ago. If you can&apos;t read, you&apos;re shut out of modern
            society. If you don&apos;t understand the forces shaping the next ten to
            thirty years, you&apos;re increasingly shut out of economic opportunity,
            political decisions, and personal control over your life.
          </p>
          <p className="theme-text-muted text-sm mt-8 border-t theme-border pt-5">
            Written by {site.author}.
          </p>
        </div>
      </section>

      {/* ── The problem ── */}
      <section className="theme-section py-16 md:py-24 border-t theme-border">
        <div className="max-w-2xl mx-auto px-6">
          <Eyebrow className="mb-5">The problem</Eyebrow>
          <h2 className="theme-text-primary text-2xl md:text-4xl font-bold tracking-tight leading-tight mb-6">
            It is not AI. It is the noise about it.
          </h2>
          <div className="theme-prose prose max-w-none">
            <p>
              Open any feed and you get a miracle and an apocalypse in the same thirty
              seconds. AI just cured a disease. AI is coming for your job. Buy this. Fear
              that. The feed does not want you informed, because an informed person closes
              the app. It wants you scrolling, so it sells you a feeling instead of an
              understanding, and you go to bed wired, worried, and no smarter than you woke
              up.
            </p>
          </div>
          <blockquote className="theme-card-accent border rounded-2xl p-7 md:p-8 mt-8">
            <p className="theme-text-primary text-xl md:text-2xl font-semibold tracking-tight leading-snug">
              Hype and doom look like enemies. They are business partners.
            </p>
            <p className="theme-text-secondary text-base leading-relaxed mt-3">
              Both trade your attention for a take you will have forgotten by morning.
            </p>
          </blockquote>
        </div>
      </section>

      {/* ── The stance ── */}
      <section className="theme-section-contrast py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6">
          <Eyebrow className="mb-5">The stance</Eyebrow>
          <h2 className="theme-text-primary text-2xl md:text-4xl font-bold tracking-tight leading-tight mb-6">
            We don&apos;t build the future. We listen to the people who are.
          </h2>
          <p className="theme-text-contrast-muted text-base md:text-lg leading-relaxed mb-10">
            Alan Kay said it in 1971. &ldquo;The best way to predict the future is to
            invent it.&rdquo; We are not the ones inventing it. We watch closely. The
            people building it talk constantly about what they are making and what they
            expect to happen next. We take those predictions apart, give the
            counterarguments their due, and ask what is actually worth acting on.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 mb-10">
            <div className="theme-card-strong border theme-border rounded-xl p-6">
              <p className="theme-text-primary text-lg font-semibold leading-snug mb-3">
                &ldquo;Work will become optional.&rdquo;
              </p>
              <p className="theme-text-muted text-sm font-medium">Elon Musk</p>
            </div>
            <div className="theme-card-strong border theme-border rounded-xl p-6">
              <p className="theme-text-primary text-lg font-semibold leading-snug mb-3">
                Serious warnings about what happens to jobs.
              </p>
              <p className="theme-text-muted text-sm font-medium">Dario Amodei</p>
            </div>
          </div>

          <p className="theme-text-contrast-muted text-base md:text-lg leading-relaxed">
            These are not pundits. They are the builders, and the surest way to predict the
            future is to build it, so I take them seriously. I just do not take them as
            settled. When someone says work will be optional, the right response is not
            applause or panic. It is a better question. Optional for whom? On what timeline?
            Paid how? That is the work {site.name} does.
          </p>
        </div>
      </section>

      {/* ── The method ── */}
      <section className="theme-section py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-2xl mb-10">
            <Eyebrow className="mb-4">The method</Eyebrow>
            <h2 className="theme-text-primary text-2xl md:text-3xl font-bold tracking-tight leading-snug">
              Every issue runs the same way. Five steps, every time.
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

      {/* ── Why "Prompts" ── */}
      <section className="theme-section py-16 md:py-24 border-t theme-border">
        <div className="max-w-2xl mx-auto px-6">
          <Eyebrow className="mb-5">Why &ldquo;Prompts&rdquo;</Eyebrow>
          <h2 className="theme-text-primary text-2xl md:text-4xl font-bold tracking-tight leading-tight mb-6">
            A double meaning, on purpose.
          </h2>
          <div className="theme-prose prose max-w-none">
            <p>
              The AI prompts, and prompting real discussion. Every article, video, and post
              is built to do one thing. Ask a simple question that turns out to be hard, the
              kind that gets the most opinionated person in the room to actually say what
              they think. I am not here to hand you a conclusion. I am here to give you the
              facts, the strongest version of every side, my honest read, and then the
              question worth arguing about.
            </p>
            <p>
              None of this is investment advice. It is a grounded belief that groundbreaking
              technology is how new work, new industries, and stronger economies get made,
              paired with a refusal to pretend the hard parts are not real.
            </p>
          </div>
        </div>
      </section>

      {/* ── What I cover ── */}
      <section className="theme-section-muted border-y theme-border py-14 md:py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <Eyebrow className="mb-6">What I cover</Eyebrow>
          <div className="flex flex-wrap justify-center gap-2.5 mb-6">
            {coverage.map((c) => (
              <span
                key={c}
                className="theme-card-strong theme-text-secondary border theme-border text-sm font-medium px-4 py-2 rounded-full"
              >
                {c}
              </span>
            ))}
          </div>
          <p className="theme-text-muted text-base leading-relaxed">
            And how to reason strategically about the future. The content is always free. I
            appreciate any support you send my way. I appreciate you joining the argument
            even more.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="theme-section-contrast py-20 md:py-28">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="theme-text-primary text-2xl md:text-4xl font-bold tracking-tight mb-4">
            Prompt the future. Pontificate with us.
          </h2>
          <p className="theme-text-contrast-muted text-base md:text-lg mb-8 leading-relaxed">
            Subscribe for the weekly issue, or follow the clips wherever you watch.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <a
              href={newsletterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="theme-cta-accent inline-flex items-center gap-2 font-semibold px-7 py-3.5 rounded-xl"
            >
              Subscribe free
              <ArrowIcon />
            </a>
            <Link href="/archive" className="theme-link inline-flex items-center gap-2 font-medium px-5 py-3.5 text-sm">
              Browse the archive <ArrowIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
          <p className="theme-text-muted text-sm mt-8">
            {socials.map((s) => s.label).join(" · ")}
          </p>
        </div>
      </section>
    </>
  );
}
