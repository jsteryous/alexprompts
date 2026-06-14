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
            Change is the only constant. 
          </h1>
          <p className="theme-text-secondary text-lg md:text-xl leading-relaxed">
            {site.name} aims to help with technological literacy (understanding what’s actually happening with AI, biotech, robotics, energy, computing, etc.), which has become as essential today as reading and writing were 200 years ago. If you can’t read, you’re shut out of modern society. If you don’t understand the major technologies shaping the next 10–30 years, you’re increasingly shut out of economic opportunity, political decisions, and personal control over your life.
          </p>
        </div>
      </section>

      <section className="theme-section py-12 md:py-16">
        <div className="max-w-2xl mx-auto px-6 theme-prose prose max-w-none">
          <h2>The problem</h2>
          <p>
            Confusion, fear, anxiety, & over-simplifications. "All work will be optional." "AI is going to change everything." "Start learning AI." All that is potentially true or good advice, but it doesn't help one understand why to take certain actions, or provide any grounding foundations for understanding the trajectory of the future.  
          </p>

          <h2>The stance</h2>
          <p>
            We do agree with the quote from Alan Kay, "The best way to predict the future is to create it." Well, we aren't the ones creating the future. We're simply a part of it. But the people creating the future are often discussing what they're building, why they're building it, and they also frequently make predictions. We analyze those predictions, acknowledge counterpoints, and reason what opportunities there are for us to take advantage of or what risks we should avoid.
          </p>
          <p>
            Elon Musk says work will become optional. Dario Amodei warns about
            what happens to jobs. These are not pundits. They are the builders, and the surest
            way to predict the future is to build it, so I take them seriously. I just do not
            take them as settled. When someone says work will be optional, the right response is
            not applause or panic. It is a better question. Optional for whom? On what timeline?
            Paid how? That is the work {site.name} does.
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
          <p>{coverage.join(", ")}, and how to reason strategically about the future.</p>

          <h2>How it works</h2>
          <p>
            Always free content. We appreciate any and all support. We especially appreciate you joining the discussion.
          </p>
        </div>
      </section>

      <section className="theme-section-contrast py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="theme-text-primary text-2xl md:text-3xl font-bold tracking-tight mb-4">
            Prompt the future. Pontificate with us.
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
