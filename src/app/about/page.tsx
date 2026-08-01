import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { site } from "@/lib/site";

const LINKEDIN_URL = "https://www.linkedin.com/in/alex-steryous-404266182/";
const CONTACT_EMAIL = "jsteryous@gmail.com";

export const metadata: Metadata = {
  title: "About Alex",
  description:
    "Alex Steryous is a sales and business development pro who got curious about AI and started building with it. Alex Prompts is the result. Say hi.",
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
    <span className={`theme-label type-eyebrow inline-block ${className}`}>
      <span className="opacity-50">{"> "}</span>
      {children}
    </span>
  );
}

export default function AboutPage() {
  return (
    <>
      {/* ── Hero: photo + intro ── */}
      <section className="theme-page pt-32 md:pt-36 pb-16 md:pb-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid gap-10 md:grid-cols-[minmax(0,320px)_1fr] md:gap-12 items-center">
            <div className="mx-auto md:mx-0 w-full max-w-[280px]">
              <div className="overflow-hidden rounded-2xl border theme-border theme-card-strong shadow-sm">
                <Image
                  src="/alex.jpg"
                  alt="Alex Steryous"
                  width={560}
                  height={840}
                  priority
                  sizes="(max-width: 768px) 280px, 320px"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
            <div>
              <Eyebrow className="mb-5">About</Eyebrow>
              <h1 className="theme-text-primary type-display mb-6">
                Hey, I&apos;m Alex.
              </h1>
              <p className="theme-text-secondary type-body-lg mb-5">
                I have spent about eight years in business development and sales. I started in
                IT recruiting, moved into SaaS sales, and most recently worked in land
                acquisitions and real estate, where I even got my realtor&apos;s license.
                Technology, however broad, is where I have always been most passionate.
                Career-wise, I am a technical salesperson, and this website is something I can
                share beyond just a resume.
              </p>
              <p className="theme-text-secondary type-body-lg">
                Alex Prompts is my commentary on how tech and real estate converge. This site also serves as a 
                sales funnel for real estate leads. Long-term, this site will rank first for certain Google searches,
                which will drive traffic and generate leads.
                Using my sales skills, I have built and continue to build long-term relationships with competent loan officers, attorneys, and agents.
                Using AI, I also built a set of basic tools for real estate: a mortgage
                calculator, a rental deal analyzer, an SC property tax estimator, a Greenville
                school lookup, a neighborhood area scan for investors, a Greenville
                cost-of-living calculator, a wire-fraud safety checker, and a scanner of
                Greenville commercial buyers. I also
                built a custom CRM. I call it Taraform, and it is free to use if you are trying to build your own RE business and would like
                to create an account at taraform.org
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── The bridge: sales + building ── */}
      <section className="theme-section-contrast py-20 md:py-28">
        <div className="max-w-2xl mx-auto px-6">
          <Eyebrow className="mb-5">What gets me going</Eyebrow>
          <h2 className="theme-text-primary type-h2 mb-6">
            Tech is what drives the world forward.
          </h2>
          <p className="theme-text-contrast-muted type-body-lg leading-relaxed mb-6">
            I&rsquo;m truly passionate about technology, and I understand technology is a very
            broad term. But it&rsquo;s true. I read about the stuff changing the world in my
            free time, and I&rsquo;m fascinated by it. I&rsquo;ll read about anything from
            solar panels to underwater sea cables to mainstream stuff like Tesla&rsquo;s FSD
            cars or Anduril&rsquo;s autonomous drones.
          </p>
          <p className="theme-text-contrast-muted type-body-lg leading-relaxed">
            That same curiosity is what makes me good in a sales seat. When I understand how a
            product genuinely works and where it actually helps, I can sell it honestly and
            well, which is the only way I know how to sell.
          </p>
        </div>
      </section>

      {/* ── Why sales ── */}
      <section className="theme-section py-20 md:py-28">
        <div className="max-w-2xl mx-auto px-6">
          <Eyebrow className="mb-5">Why sales</Eyebrow>
          <h2 className="theme-text-primary type-h2 mb-6">
            Everyone is in sales.
          </h2>
          <div className="theme-prose prose max-w-none">
            <p>
              Everyone is in sales, whether they call it that or not. Every job interview is a
              sales motion. Every internal pitch, every budget defense, every attempt to get
              buy-in from a boss or a cross-functional team runs on the same skill. I chose sales
              because it&rsquo;s the one field where that skill is out in the open, named
              directly, and rewarded for what it actually is.
            </p>
            <p>
              I&rsquo;m extroverted and I like people, genuinely, not as a professional
              performance. That shows up differently depending on the stage of the relationship.
              I have plenty of cold calling experience and I don&rsquo;t dread it the way a lot of
              people do. I like the first conversation, the one where you have to earn attention
              fast and think on your feet. But the part of the job I care about most is what
              happens after the deal closes. I&rsquo;d rather grow an account over two years than
              win one and move on. Renewals, expansions, and being the person a client actually
              wants to call when something goes wrong, that&rsquo;s the work that keeps me
              engaged, because it rewards patience and follow-through as much as it rewards a good
              pitch.
            </p>
            <p>
              I&rsquo;m also drawn to how competitive this field is, and I mean that as a selling
              point, not a warning. Sales is one of the few jobs where performance isn&rsquo;t up
              for debate. Your numbers are posted, tracked, and visible to everyone around you.
              There&rsquo;s no ambiguity about how you&rsquo;re doing, and no mystery about what to
              work on next. I want to be somewhere my results speak for themselves, because I trust
              what they&rsquo;ll say.
            </p>
            <p>
              What people tend to miss is how much relationship work happens quietly, outside the
              calls that get tracked. Finding the actual decision-maker inside an account,
              understanding what they&rsquo;re measured on internally, and knowing who else needs
              to be looped in before a renewal or expansion conversation even starts, that&rsquo;s
              closer to investigative work than to pitching. Some of the best openings come from a
              warm path through someone in your network who knows a person on the inside, rather
              than a cold list. Figuring out that path, and then doing the slower work of turning
              it into a real relationship, is what I find most satisfying about this job.
            </p>
          </div>
        </div>
      </section>

      {/* ── What Alex Prompts is ── */}
      {/* Follows "Why sales" on the same light surface, so a hairline rule marks the
          break instead of a third background colour. */}
      <section className="theme-section border-t theme-border py-16 md:py-24">
        <div className="max-w-2xl mx-auto px-6">
          <Eyebrow className="mb-5">What this is</Eyebrow>
          <h2 className="theme-text-primary type-h2 mb-6">
            So, what is Alex Prompts?
          </h2>
          <div className="theme-prose prose max-w-none">
            <p>
              Beyond demonstrating technical aptitude, this is a commentary outlet on real estate in Greenville, South Carolina,
              plus a handful of free tools. Alex Prompts serves two functions:
              first, it differentiates me as a sales professional by showcasing a true passion for technology instead of just saying so. 
              It also serves as a lead generator. As a sales-minded professional, I understand that having inboud leads and building sales funnels are paramount to maintaining a pipeline and increasing deal volume.
            </p>
            <p>
              The tools on here are real and free to use. There is a rental deal analyzer, a mortgage
              and affordability calculator, an SC property tax estimator, and a commercial buyers
              list pulled from public county records. The real estate writing is meant to inform potential buyers and sellers. The technical articles are mostly research based.
              I share what I&rsquo;ve been learning.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link href="/tools" className="theme-cta inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-xl text-sm">
              See the tools <ArrowIcon className="w-4 h-4" />
            </Link>
            <Link href="/real-estate" className="theme-link inline-flex items-center gap-2 font-medium px-4 py-3 text-sm">
              Read the real estate coverage <ArrowIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Under the hood: the technical build ── */}
      <section className="theme-section-contrast py-20 md:py-28">
        <div className="max-w-2xl mx-auto px-6">
          <Eyebrow className="mb-5">Under the hood</Eyebrow>
          <h2 className="theme-text-primary type-h2 mb-6">
            How this site actually works, since I built all of it.
          </h2>
          <p className="theme-text-contrast-muted type-body-lg leading-relaxed mb-6">
            I am not an engineer by training. I taught myself every piece of this with AI,
            because I wanted to see how far a curious salesperson could get. Here is what is
            running behind the pages you are reading.
          </p>
          <ul className="space-y-5">
            <li>
              <h3 className="theme-text-primary type-title mb-1">The writing publishes itself</h3>
              <p className="theme-text-contrast-muted type-body leading-relaxed">
                Most of the posts are not hand-published one at a time. On a schedule, a set of
                AI agents I wrote research a real Greenville story or a technology topic, draft
                it, check their own facts against public data, and publish straight to the
                site. I get an email afterward to spot-check, and I can pull anything that
                misses.
              </p>
            </li>
            <li>
              <h3 className="theme-text-primary type-title mb-1">A real email system</h3>
              <p className="theme-text-contrast-muted type-body leading-relaxed">
                The subscribe box is genuine double opt-in. You confirm your address, every
                message has a working unsubscribe, and the whole thing runs on scheduled jobs
                and a Postgres database rather than a plugin.
              </p>
            </li>
            <li>
              <h3 className="theme-text-primary type-title mb-1">The tools and the data</h3>
              <p className="theme-text-contrast-muted type-body leading-relaxed">
                The calculators run entirely in your browser. The commercial buyers list is
                pulled automatically from public county records, and the map and street-view
                covers on the real estate posts are generated after each post goes live.
              </p>
            </li>
            <li>
              <h3 className="theme-text-primary type-title mb-1">Built solo, for free</h3>
              <p className="theme-text-contrast-muted type-body leading-relaxed">
                I designed, wrote, and run all of it myself, and I kept the whole system
                inside free tiers, so it costs essentially nothing to operate. That constraint
                was half the fun and half the point.
              </p>
            </li>
          </ul>
          <p className="theme-text-contrast-muted type-body-lg leading-relaxed mt-8">
            Last thing: a big purpose behind this website is to meet new people and establish great relationships.
            If you are in tech, real estate, or an adjacent industry, please let me know!
          </p>
        </div>
      </section>

      {/* ── Light "want one like this?" ── */}
      {/* A light strip between two dark panels, so the surfaces already separate it
          and the old border-y was redundant. */}
      <section className="theme-section py-14 md:py-16">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="theme-text-primary type-h3 mb-3">
            Want a site like this one?
          </h2>
          <p className="theme-text-muted type-body">
            Want your own custom domain and layout? I can teach you how to do it for free, or I can build one for you.
            My email is below.
          </p>
        </div>
      </section>

      {/* ── Connect CTA ── */}
      <section className="theme-section-contrast py-20 md:py-28">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <Eyebrow className="mb-5">Let&apos;s talk</Eyebrow>
          <h2 className="theme-text-primary type-h2 mb-4">
            I would love to introduce myself.
          </h2>
          <p className="theme-text-contrast-muted type-body-lg mb-8">
            Are you a sales professional? Do you share a passion for technology? Looking for a new home, or just want to talk about Greenville? Let me know!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="theme-cta-accent inline-flex items-center gap-2 font-semibold px-7 py-3.5 rounded-xl"
            >
              Connect on LinkedIn
              <ArrowIcon />
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="theme-link inline-flex items-center gap-2 font-medium px-5 py-3.5 text-sm"
            >
              {CONTACT_EMAIL} <ArrowIcon className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
