import type { Metadata } from "next";
import Image from "next/image";
import { site } from "@/lib/site";

const LINKEDIN_URL = "https://www.linkedin.com/in/alex-steryous-404266182/";
const CONTACT_EMAIL = "jsteryous@gmail.com";

/**
 * THE MASTHEAD (rewritten August 2026, the consolidation).
 *
 * This page used to be a resume. Six sections, most of them about Alex: a
 * personality piece on why he likes sales, a "want a site like this?" side
 * offer, and an "under the hood" teardown written to impress a hiring manager.
 * It is now a masthead, which is a different document: it tells a READER what
 * this publication is, where its facts come from, and who it is for, and it
 * gets to the author last and briefly.
 *
 * Three things were deleted on purpose and should not come back:
 *
 * 1. THE AI-AGENTS SECTION. It told the reader that "a set of AI agents I
 *    wrote research a real Greenville story, draft it, check their own facts,
 *    and publish straight to the site." On a publication whose entire value is
 *    that a person went and read the primary documents, that sentence is fatal
 *    on contact. The engine still drafts, Alex still reviews and publishes, and
 *    that is a workflow detail, not a masthead claim.
 * 2. THE BUSINESS MODEL. It said the site "serves as a sales funnel for real
 *    estate leads" and "also serves as a lead generator." Beyond reading badly,
 *    that is the NEVER EXPLAIN THE BUSINESS MODEL rule in the root CLAUDE.md.
 * 3. THE CREDIBILITY PITCH. Alex's note, August 2026: speak to the reader
 *    instead of hyping me. So the eight years of BD and sales appear once, as
 *    the reason he knows how to do the work, and never as a boast. The photo
 *    moved out of the hero and down into the byline block, which is where a
 *    masthead puts a face.
 *
 * Copy rules: uncontracted (site-wide), no em or en dashes, no fragments.
 */

export const metadata: Metadata = {
  title: "About",
  description:
    "A clear picture of Greenville real estate. Claims from the market, tested against the county record, reported without a recommendation attached.",
  alternates: { canonical: `${site.url}/about` },
};

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

/** Matches the homepage kicker: a rule and a word. The faint "> " prefix that
 *  used to sit here was part of the retired AI-prompt motif, deleted in the
 *  August 2026 newspaper pass. */
function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`theme-label type-eyebrow inline-block border-t-2 pt-2 ${className}`}
      style={{ borderColor: "var(--accent)" }}
    >
      {children}
    </span>
  );
}

export default function AboutPage() {
  return (
    <>
      {/* ── The statement. No photo here on purpose: the hero is about the
          publication, not the person. ── */}
      <section className="theme-page pt-32 md:pt-36 pb-16 md:pb-20">
        <div className="max-w-3xl mx-auto px-6">
          <Eyebrow className="mb-6">About</Eyebrow>
          <h1 className="theme-text-primary type-display mb-7">
            Knowing what is actually going on here is harder than it should be.
          </h1>
          <p className="theme-text-secondary type-body-lg mb-5">
            Greenville produces a lot of announcements. A subdivision gets approved, a
            quarter comes in up or down, an employer says it is expanding. What is missing
            is the layer underneath, where you find out what a submarket has really done
            over five years instead of one quarter, and which rule or tax break is driving
            behavior that otherwise looks like taste.
          </p>
          <p className="theme-text-secondary type-body-lg">
            That layer is what this is for. I started writing it because I wanted to read
            it.
          </p>
        </div>
      </section>

      {/* ── The method. This is the credibility section, and it is about the
          work rather than the writer, which is the point. ── */}
      <section className="theme-section-contrast py-20 md:py-28">
        <div className="max-w-2xl mx-auto px-6">
          <Eyebrow className="mb-5">The method</Eyebrow>
          <h2 className="theme-text-primary type-h2 mb-6">
            It all comes out of the record.
          </h2>
          <p className="theme-text-contrast-muted type-body-lg leading-relaxed mb-6">
            The word that a company is growing is worth nothing by itself. The forty
            engineering roles it posted in six months is worth something, because you can
            go and count them. Everything in a piece is anchored to something you could
            pull up yourself, and most of it is more interesting than people expect once
            you line it up over a few years.
          </p>
          <ul className="space-y-4 mb-8">
            <li>
              <h3 className="theme-text-primary type-title mb-1">Filings and disclosures</h3>
              <p className="theme-text-contrast-muted type-body leading-relaxed">
                What a public company is required to tell its shareholders is usually far
                more candid than what it tells a newspaper.
              </p>
            </li>
            <li>
              <h3 className="theme-text-primary type-title mb-1">Job postings, counted over time</h3>
              <p className="theme-text-contrast-muted type-body leading-relaxed">
                Hiring is a company stating its plans in public without meaning to. What
                it is staffing up tells you which line of business it actually believes in.
              </p>
            </li>
            <li>
              <h3 className="theme-text-primary type-title mb-1">Permits, deeds, and leases</h3>
              <p className="theme-text-contrast-muted type-body leading-relaxed">
                Square footage, what was paid, who holds the paper, and when it was
                signed. A building is a commitment that is hard to walk back quietly, and
                a deed is the rare document where the price is not a negotiating position.
              </p>
            </li>
            <li>
              <h3 className="theme-text-primary type-title mb-1">Incentive agreements and minutes</h3>
              <p className="theme-text-contrast-muted type-body leading-relaxed">
                The terms behind an announcement, including what the company promised in
                exchange and what happens if it does not deliver.
              </p>
            </li>
          </ul>
          <p className="theme-text-contrast-muted type-body-lg leading-relaxed">
            Where a number is calculated rather than published, the piece says so and
            shows the arithmetic. Estimates are labeled as estimates. Where a company
            disputes something, that goes in too.
          </p>
        </div>
      </section>

      {/* ── The stance. The distinction here is the easiest thing on the site to
          get wrong in a rewrite. A piece DOES reach a conclusion; that is the
          product. What it withholds is advocacy, meaning a recommendation about
          what the reader should do. Assess, do not advise. Do not let this
          collapse back into "a buyer reads it this way, a seller reads it that
          way", which is the both-sides mush that emptied the old weekly brief.

          The market-opinion paragraph is deliberately LAST and short. An earlier
          draft opened the whole site on it and Alex cut that: what people believe
          is one input, not the job. ── */}
      <section className="theme-section py-20 md:py-28">
        <div className="max-w-2xl mx-auto px-6">
          <Eyebrow className="mb-5">The stance</Eyebrow>
          <h2 className="theme-text-primary type-h2 mb-6">
            Assessments, not advice.
          </h2>
          <div className="theme-prose prose max-w-none">
            <p>
              A piece here lands somewhere. If the numbers say a submarket has stalled, it
              says that. Refusing to reach a conclusion is not neutrality, it is a waste of
              your time, and there is already plenty of writing about this state that
              carefully avoids saying anything. Where the record genuinely cannot settle a
              question, I say so once and move on rather than hedging every paragraph.
            </p>
            <p>
              What you will not get is a recommendation. Nothing about what you should buy,
              sell, hold, or build, and no speeches about whether any of it is good for
              Greenville. You have the deal in front of you and the context I do not.
              My job stops at handing you an accurate picture of the ground.
            </p>
            <p>
              Opinions from people in the business show up here too, because what an
              experienced broker believes is itself a fact about the market and worth
              knowing. Those get attributed and then checked against the same records as
              everything else.
            </p>
          </div>
        </div>
      </section>

      {/* ── Who it is for. Alex's note: speak to the reader. This is that.
          Same surface as the stance section above, so a hairline marks the
          break rather than a third background colour. ── */}
      <section className="theme-section border-t theme-border py-20 md:py-28">
        <div className="max-w-2xl mx-auto px-6">
          <Eyebrow className="mb-5">Who it is for</Eyebrow>
          <h2 className="theme-text-primary type-h2 mb-6">
            People who build and buy here.
          </h2>
          <div className="theme-prose prose max-w-none">
            <p>
              Developers, real estate entrepreneurs, and the people who work around a
              deal, which means the loan officer, the closing attorney, the agent, and the
              banker. If you are deciding what a site is worth, who is realistically going
              to lease it, or whether the employer three miles away is expanding or quietly
              pulling back, you are the reader.
            </p>
            <p>
              Local coverage answers what happened. It rarely answers the question you are
              actually holding, which is whether the thing is durable. A company that looks
              enormous can rest on two customers. A submarket everyone calls hot can be
              carried by a handful of sales at the top. Most of what settles those
              questions is sitting in public records that nobody reads.
            </p>
            <p>
              It covers Greenville rather than the whole state, because a market is a
              local thing and the record that settles it is held at the county. Where a
              statewide rule or a piece of outside capital is what moves the local
              ground, that is in scope, and it gets covered for what it does here.
            </p>
          </div>
        </div>
      </section>

      {/* ── Who writes it. Last, short, and factual. Same surface as the
          section above, so a hairline rule marks the break rather than a
          third background colour. ── */}
      <section className="theme-section border-t theme-border py-16 md:py-24">
        <div className="max-w-2xl mx-auto px-6">
          <Eyebrow className="mb-5">Who writes it</Eyebrow>
          <div className="grid gap-8 sm:grid-cols-[minmax(0,180px)_1fr] sm:gap-10 items-start">
            <div className="w-full max-w-[180px]">
              <div className="overflow-hidden border theme-border theme-card-strong">
                <Image
                  src="/alex.jpg"
                  alt={site.author}
                  width={560}
                  height={840}
                  sizes="180px"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
            <div>
              <h2 className="theme-text-primary type-h3 mb-4">{site.author}</h2>
              <div className="theme-prose prose max-w-none">
                <p>
                  I have spent about eight years in business development and sales. I
                  started in IT recruiting, moved into SaaS, and most recently worked in
                  land acquisition. I am a licensed real estate agent in South Carolina
                  and I live in Greenville.
                </p>
                <p>
                  The part of that background which matters here is the discovery. For
                  eight years the job was to work out how a company made money, who
                  actually decided things inside it, and what would make them change
                  course, all before I ever picked up the phone. This is the same work
                  with the sales call removed and the sourcing written down.
                </p>
                {/* Independence stated WITHOUT the phrase "I do not practice",
                    which is banned site-wide: it disqualifies Alex at the exact
                    moment a reader is deciding whether he can help. See the
                    strategic-direction note in the root CLAUDE.md. */}
                <p>
                  Being in the business is useful for hearing what people are saying. Not
                  having a deal riding on any of it is useful for writing down what the
                  records actually show.
                </p>
                <p>
                  I also read about this material in my own time and always have. Solar,
                  subsea cable, port automation, whatever is genuinely changing how things
                  get built. Writing it down is mostly an excuse to keep going.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── The ask. Tips first (a reader who sends a document is worth more
          than a reader who does not, especially at this list size), then the
          short warm buy or sell invitation. Do NOT grow that invitation into
          an explanation of the referral mechanism; see the root CLAUDE.md. ── */}
      <section className="theme-section-contrast py-20 md:py-28">
        <div className="max-w-2xl mx-auto px-6">
          <Eyebrow className="mb-5">Get in touch</Eyebrow>
          <h2 className="theme-text-primary type-h2 mb-6">
            Tips and documents are welcome.
          </h2>
          <p className="theme-text-contrast-muted type-body-lg leading-relaxed mb-5">
            If you work at one of these companies, or next door to one, you know things
            the public record does not show. I am glad to keep a source out of a piece.
            Corrections are welcome too, and if something here is wrong I will fix it
            where everyone can see it.
          </p>
          <p className="theme-text-contrast-muted type-body-lg leading-relaxed mb-9">
            And if you are looking to buy or thinking of selling, let me know.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="theme-cta-accent inline-flex items-center gap-2 font-semibold px-7 py-3.5"
            >
              {CONTACT_EMAIL}
              <ArrowIcon />
            </a>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="theme-link inline-flex items-center gap-2 font-medium px-5 py-3.5 text-sm"
            >
              Connect on LinkedIn <ArrowIcon className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
