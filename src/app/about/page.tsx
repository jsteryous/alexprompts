import type { Metadata } from "next";
import Link from "next/link";
import { site, socials, coverage, newsletterUrl, principles } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `Who writes ${site.name} and the framework behind it. ${site.oneLiner}`,
  alternates: { canonical: `${site.url}/about` },
};

export default function AboutPage() {
  return (
    <>
      <section className="theme-page pt-32 pb-16">
        <div className="max-w-2xl mx-auto px-6">
          <span className="theme-label inline-block text-xs font-semibold uppercase tracking-widest mb-5">
            About
          </span>
          <h1 className="theme-text-primary text-3xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
            I cover the future, and I want to argue about it with you.
          </h1>
          <p className="theme-text-secondary text-lg md:text-xl leading-relaxed">
            {site.name} is written by {site.author}. It is about the companies building the
            future, written for smart people who do not have time to follow it full time and
            who would rather think than be told what to think.
          </p>
        </div>
      </section>

      <section className="theme-section py-12 md:py-16">
        <div className="max-w-2xl mx-auto px-6 theme-prose prose max-w-none">
          <h2>The problem</h2>
          <p>
            The pace is the problem. Every week an AI lab ships something, a rocket flies, a
            chip launches, a chart goes vertical. The coverage splits into two useless piles.
            One says everything is a miracle. The other says everything is the end. Both are
            easier to write than the truth, and both leave you with a feeling instead of an
            understanding.
          </p>

          <h2>The stance</h2>
          <p>
            Here is the bias I will be upfront about. The crowd is often wrong, and legacy
            media is often most wrong of all. When the entire room agrees on something obvious
            about technology, the opposite is frequently closer to the truth. People said the
            internet was a fad. People said smartphones were toys. Today the consensus says AI
            ends work. I think the more likely story is the one nobody is selling. New kinds of
            jobs that do not exist yet, stronger economies, and demand for human work we cannot
            picture from here.
          </p>
          <p>
            I hold that view loosely and honestly. It runs straight into the people actually
            building this. Elon Musk says work will become optional. Dario Amodei warns about
            what happens to jobs. These are not pundits. They are the builders, and the easiest
            way to predict the future is to build it, so I take them seriously. I just do not
            take them as settled. When someone says work will be optional, the right response is
            not applause or panic. It is a better question. Optional for whom. On what timeline.
            Paid how. That is the work {site.name} does.
          </p>

          <h2>The method</h2>
          <p>Every issue runs the same way.</p>
          <ul>
            {principles.map((p) => (
              <li key={p.title}>
                <strong>{p.title}.</strong> {p.body}
              </li>
            ))}
          </ul>

          <h2>Why &ldquo;Prompts&rdquo;</h2>
          <p>
            The name is a double meaning. The AI prompts, and prompting real discussion. Every
            article, video, and post is built to do one thing. Ask a simple question that turns
            out to be hard, the kind that gets the most opinionated person in the room to
            actually say what they think. I am not here to hand you a conclusion. I am here to
            give you the facts, the strongest version of every side, my honest read, and then
            the question worth arguing about.
          </p>
          <p>
            None of this is investment advice. It is a grounded belief that groundbreaking
            technology is how new work, new industries, and stronger economies get made, paired
            with a refusal to pretend the hard parts are not real.
          </p>

          <h2>What I cover</h2>
          <p>{coverage.join(", ")}, and the others actually moving the frontier.</p>

          <h2>How it works</h2>
          <p>
            Short clips during the week on the platforms you already scroll. The full story
            lands in your inbox once a week. The newsletter is free. The clips are how you find
            me. The inbox is how you go deep.
          </p>
        </div>
      </section>

      <section className="theme-section-contrast py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="theme-text-primary text-2xl md:text-3xl font-bold tracking-tight mb-4">
            Come argue about the future.
          </h2>
          <p className="theme-text-contrast-muted mb-8 leading-relaxed">
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
            </a>
            <Link href="/archive" className="theme-link inline-flex items-center gap-2 font-medium px-5 py-3.5 text-sm">
              Browse the archive
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
