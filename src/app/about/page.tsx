import type { Metadata } from "next";
import Link from "next/link";
import { site, socials, realEstateOutcomes, newsletterUrl, principles } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `Who writes ${site.name} and the approach behind it. ${site.oneLiner}`,
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
            I help real estate pros put Claude to work.
          </h1>
          <p className="theme-text-secondary text-lg md:text-xl leading-relaxed">
            I am fascinated by what Claude can do, and I am in real estate, so I put the two
            together. I work out how to make it write listings, run market research, analyze
            deals, and handle the busywork, then I show you in plain English. You will not need
            to write code, and nothing is assumed.
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
            You are not underusing Claude because you are slow.
          </h2>
          <div className="theme-prose prose max-w-none">
            <p>
              You open Claude, you ask it a question, you get a good answer, and you stop. Almost
              every agent and investor stops there. Nobody showed you that the same box can draft
              a fair-housing-safe listing in minutes, turn comps into a summary your client will
              actually read, pressure-test a deal, or answer the leads sitting in your inbox. The
              depth is there. It was just never explained for the work you actually do.
            </p>
          </div>
          <blockquote className="theme-card-accent border rounded-2xl p-7 md:p-8 mt-8">
            <p className="theme-text-primary text-xl md:text-2xl font-semibold tracking-tight leading-snug">
              The depth is real. It is also reachable, once someone shows you where to look.
            </p>
            <p className="theme-text-secondary text-base leading-relaxed mt-3">
              Standing next to you, calmly pointing out the next thing Claude can do for your
              business, is the entire job here.
            </p>
          </blockquote>
        </div>
      </section>

      {/* ── Why I do this ── */}
      <section className="theme-section-contrast py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6">
          <Eyebrow className="mb-5">Why I do this</Eyebrow>
          <h2 className="theme-text-primary text-2xl md:text-4xl font-bold tracking-tight leading-tight mb-6">
            I taught myself the scary version, then aimed it at real estate.
          </h2>
          <p className="theme-text-contrast-muted text-base md:text-lg leading-relaxed mb-6">
            I am genuinely fascinated by Claude, so I go places most people would not bother to
            go. I taught myself Claude Code, the corner that lives in a command line and looks
            like it was built to keep normal people out. Then I made a plain walkthrough of it.
            No fast cuts, no music, no performance. Just here is the thing, here is exactly what
            to do, and you can do this too.
          </p>
          <p className="theme-text-contrast-muted text-base md:text-lg leading-relaxed">
            It helped people who had tried and bounced off. That told me two things at once. The
            hunger to actually use this tool is everywhere, and the thing in the way is almost
            never intelligence. It is that nobody slowed down and showed them. I work in real
            estate, so that is where I aim it first. The listings, the research, the deals, the
            follow-up. If you are not in real estate, most of it still travels, and I will say so
            when it does.
          </p>
        </div>
      </section>

      {/* ── The approach ── */}
      <section className="theme-section py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-2xl mb-10">
            <Eyebrow className="mb-4">How every guide works</Eyebrow>
            <h2 className="theme-text-primary text-2xl md:text-3xl font-bold tracking-tight leading-snug">
              The same calm, careful approach every time.
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
              A prompt is what you type to tell Claude what you want, and learning to write good
              ones is half the skill. A prompt is also a nudge, the small push to finally make
              the thing you have been putting off. Alex Prompts is built to do both. I teach you
              what to say to Claude, and I prompt you to go and actually do it.
            </p>
            <p>
              Claude is changing what is possible faster than anyone can keep up, so every guide
              leaves a little room for the bigger question underneath. Not only how to do the
              thing, but what it means that you suddenly can.
            </p>
          </div>
        </div>
      </section>

      {/* ── What you'll learn ── */}
      <section className="theme-section-muted border-y theme-border py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-2xl mb-10">
            <Eyebrow className="mb-4">What you&apos;ll learn</Eyebrow>
            <h2 className="theme-text-primary text-2xl md:text-3xl font-bold tracking-tight leading-snug">
              The real jobs from your week, done step by step.
            </h2>
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
          <p className="theme-text-muted text-base leading-relaxed mt-8">
            Not active in real estate? A lot of these skills travel. New guides frequently,
            always free. I appreciate any support you send my way.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="theme-section-contrast py-20 md:py-28">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="theme-text-primary text-2xl md:text-4xl font-bold tracking-tight mb-4">
            Start with one job you do every week.
          </h2>
          <p className="theme-text-contrast-muted text-base md:text-lg mb-8 leading-relaxed">
            Subscribe for new walkthroughs, or follow the short ones wherever you watch.
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
              Browse the guides <ArrowIcon className="w-3.5 h-3.5" />
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
