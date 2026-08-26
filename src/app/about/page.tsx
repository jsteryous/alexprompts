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
 * REPOINTED AT THE RESEARCH August 25, 2026, when Alex set the beat as
 * Greenville real estate and sales performance, backed by academic research and
 * data. The method section had been four bullets of filings, job postings,
 * permits, and incentive agreements, which is the company-teardown beat and not
 * what the front page now promises. "Who it is for" said developers and real
 * estate entrepreneurs; it says buyers, sellers, and agents now, because that is
 * who Alex named. The record did not go away, it moved down to third.
 *
 * Copy rules: uncontracted (site-wide), no em or en dashes, no fragments.
 */

export const metadata: Metadata = {
  title: "About",
  description:
    "We read research papers about real estate and sales performance and share what we find interesting, next to what the Greenville numbers are actually doing.",
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
            Most real estate advice is somebody&apos;s opinion.
          </h1>
          <p className="theme-text-secondary type-body-lg mb-5">
            There is a real body of research on how houses sell. Economists have measured
            what a listing price does to the final number and how long a house sits when it
            starts too high. Some of the most interesting work is on the agent&apos;s own
            incentives, which do not point in quite the same direction as the seller&apos;s.
            Almost none of that reaches the person who is about to make the decision.
          </p>
          <p className="theme-text-secondary type-body-lg">
            We read that work, put it next to what the Greenville numbers are doing, and
            write up what is interesting. I started because I wanted to read it.
          </p>
        </div>
      </section>

      {/* ── The method. This is the credibility section, and it is about the
          work rather than the writer, which is the point. ── */}
      <section className="theme-section-contrast py-20 md:py-28">
        <div className="max-w-2xl mx-auto px-6">
          <Eyebrow className="mb-5">The method</Eyebrow>
          <h2 className="theme-text-primary type-h2 mb-6">
            Read the study, then check it here.
          </h2>
          <p className="theme-text-contrast-muted type-body-lg leading-relaxed mb-6">
            An opinion about how to price a house is worth very little on its own. A study
            that went and measured it across thousands of real sales is worth quite a lot,
            because somebody counted. The useful question is whether a finding like that
            survives contact with this market, and that is what most pieces here are
            doing.
          </p>
          <ul className="space-y-4 mb-8">
            <li>
              <h3 className="theme-text-primary type-title mb-1">Published research</h3>
              <p className="theme-text-contrast-muted type-body leading-relaxed">
                Work from the real estate, marketing, and economics journals, where a
                finding had to get past a referee before it got printed. Every piece says
                which study it is drawing on, so you can go and read it.
              </p>
            </li>
            <li>
              <h3 className="theme-text-primary type-title mb-1">Greenville sales data</h3>
              <p className="theme-text-contrast-muted type-body leading-relaxed">
                What houses here actually listed for, what they closed at, and how long
                they sat, lined up over years rather than quarters. A median can sit
                perfectly still on top of a market that changed completely underneath it.
              </p>
            </li>
            <li>
              <h3 className="theme-text-primary type-title mb-1">The county record</h3>
              <p className="theme-text-contrast-muted type-body leading-relaxed">
                Deeds, permits, and plats, for the pieces that turn on who bought what and
                when. A deed is the rare document where the price is not a negotiating
                position.
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
              Best practice is a finding, not an instruction. If the research says a house
              that starts well over comparable sales tends to close for less and sit
              longer, that goes in exactly as it was measured, and what you do about your
              own house is still yours to decide.
            </p>
            <p>
              Opinions from people in the business show up here too, because what an
              experienced broker believes is itself a fact about the market and worth
              knowing. Those get attributed and then checked against the same evidence as
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
            Buyers, sellers, and the agents who are good at this.
          </h2>
          <div className="theme-prose prose max-w-none">
            <p>
              If you are about to buy or sell a house in Greenville, almost everything
              written for you is either a listing site or a person with a stake in what you
              decide. The research is not written for you either, since it is written for
              other academics and priced accordingly. This sits in between.
            </p>
            <p>
              Agents read it too, and a fair number of them are the reason a piece gets
              written. Quite a lot of what separates a good one from an average one has
              been measured, from how a house gets positioned before it ever goes live to
              what happens to a price after the first two weeks, and very little of that
              turns up in a training course.
            </p>
            <p>
              It covers Greenville rather than the whole country, because a market is a
              local thing and a national average can be wrong here in both directions.
              Where a finding comes out of a study of somewhere else, which most of them
              do, the piece says so and then goes looking for whether it holds up here.
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
                  The part of that background that matters here is the selling. For eight
                  years the job was to work out why one deal closes and a nearly identical
                  one does not, which is the same question the sales research asks with far
                  better data than I ever had. Reading that work against what I saw in the
                  field is most of the reason this exists.
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
                  I read this material in my own time and always have. Journal articles,
                  working papers, whatever somebody took the trouble to measure properly.
                  Writing it up is mostly an excuse to keep going.
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
            If you have come across a paper worth reading, or you have seen something in
            the field that the research seems to miss, send it over. That goes double for
            anyone who lists and sells for a living. Corrections are welcome too, and if
            something here is wrong I will fix it where everyone can see it.
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
