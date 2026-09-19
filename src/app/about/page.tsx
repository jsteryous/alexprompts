import type { Metadata } from "next";
import { site, CONTACT_EMAIL } from "@/lib/site";

/**
 * THE MASTHEAD (rewritten August 2026, the consolidation).
 *
 * This page used to be a resume. Six sections, most of them about Alex: a
 * personality piece on why he likes sales, a "want a site like this?" side
 * offer, and an "under the hood" teardown written to impress a hiring manager.
 * It is now a masthead, which is a different document. It tells a READER what
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
 *    instead of hyping me.
 *
 * REPOINTED AT THE RESEARCH August 25, 2026, when Alex set the beat as
 * Greenville real estate and sales performance, backed by academic research and
 * data.
 *
 * ---- SCALED DOWN AND DEPERSONALIZED, September 18, 2026 ----
 *
 * Alex asked to scale the page down and to take his personal information off
 * the site. Six sections became four, and four categories of personal
 * information came off entirely. None of them returns:
 *
 * - THE PHOTO. public/alex.jpg was DELETED from the repo, not merely left
 *   unreferenced, and the byline block that held it went with it.
 * - THE CAREER HISTORY. Eight years of business development and sales, IT
 *   recruiting into SaaS into land acquisition, and "I live in Greenville."
 *   What survives is the one fact a reader needs and the law requires anyway,
 *   which is that Alex holds a South Carolina real estate license.
 * - THE PERSONAL GMAIL. Every "write to me" surface resolves to
 *   hello@rebrew.org now, through CONTACT_EMAIL, which is an alias for
 *   site.email so the two addresses cannot drift apart.
 * - THE LINKEDIN PROFILE. LINKEDIN_URL is gone from src/lib/site.ts, so the
 *   "Connect on LinkedIn" button here and on /contact went with it.
 *
 * WHAT THE DEPERSONALIZING IS FOR, so a later pass does not read it as modesty
 * and helpfully undo it: the authority on this site comes from the documents,
 * and a masthead that leads with a face and a resume invites a reader to audit
 * the writer instead of the evidence.
 *
 * ---- THE NAME CAME OFF TOO, September 19, 2026 ----
 *
 * Alex: "make sure any mention of me is off the site." The byline here and in
 * the footer, the article-page byline default, the SEO keywords list, and the
 * homepage JSON-LD all named him and now read `site.name` ("Rebrew") instead;
 * `site.author` is deleted. The "Who writes it" heading below reads "I write
 * Rebrew." rather than naming him. The ONE exception is the South Carolina
 * licensee disclosure on /terms, /buying-or-selling, and the best-agents
 * landing page, which state law requires to name the actual licensed person:
 * those import `LICENSEE_NAME` from src/lib/site.ts, never `site.author`,
 * which no longer exists. Do not add his name back anywhere else on this
 * reasoning that the disclosure already names him; the disclosure is the one
 * place it is legally required, not a license to reintroduce it elsewhere.
 *
 * WHAT ELSE MOVED in the scale-down. "Who it is for" lost its own section and
 * survives as the third paragraph of the opening statement, because two
 * sentences said what four paragraphs had been saying. "Who writes it" and
 * "Get in touch" merged, which is the natural order anyway: here is who writes
 * this, here is how to reach him.
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
      {/* The statement. No photo here, and as of September 2026 no photo
          anywhere on the page: the masthead is about the publication. The third
          paragraph is the old "Who it is for" section, compressed. */}
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
          <p className="theme-text-secondary type-body-lg mb-5">
            We read that work, put it next to what the Greenville numbers are doing, and
            write up what is interesting. I started because I wanted to read it.
          </p>
          <p className="theme-text-secondary type-body-lg">
            If you are about to buy or sell a house here, nearly everything written for you
            is either a listing site or a person with a stake in what you decide. Agents
            read this too, and a fair number of them are the reason a piece gets written.
          </p>
        </div>
      </section>

      {/* The method. This is the credibility section, and it is about the work
          rather than the writer, which is the point. */}
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
                Work from the real estate, marketing, and economics journals. Every piece
                says which study it is drawing on, so you can go and read it.
              </p>
            </li>
            <li>
              <h3 className="theme-text-primary type-title mb-1">Greenville sales data</h3>
              <p className="theme-text-contrast-muted type-body leading-relaxed">
                What houses here listed for, what they closed at, and how long they sat,
                lined up over years rather than quarters. A median can sit perfectly still
                on top of a market that changed completely underneath it.
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
            shows the arithmetic. Estimates are labeled as estimates.
          </p>
        </div>
      </section>

      {/* The stance. The distinction here is the easiest thing on the site to
          get wrong in a rewrite. A piece DOES reach a conclusion; that is the
          product. What it withholds is advocacy, meaning a recommendation about
          what the reader should do. Assess, do not advise. Do not let this
          collapse back into "a buyer reads it this way, a seller reads it that
          way", which is the both-sides mush that emptied the old weekly brief.

          Cut from four paragraphs to two in the September 2026 scale-down. The
          market-opinion paragraph went with them: what people in the business
          believe is one input rather than the job, and it never needed its own
          paragraph on the masthead. */}
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
              What you will not get is a recommendation about what to buy, sell, hold, or
              build. Best practice is a finding rather than an instruction, so if the
              research says a house that starts well over comparable sales tends to close
              for less and sit longer, that goes in exactly as it was measured. What you do
              about your own house is still yours to decide. You have the deal in front of
              you and the context I do not.
            </p>
          </div>
        </div>
      </section>

      {/* Who writes it, and the ask. Merged into one section on September 18,
          2026. No photo and no career history: read the depersonalizing note at
          the top of this file before putting either one back.

          Tips lead the ask, because at this list size a reader who sends a
          document is worth more than a reader who does not, and the short warm
          buy or sell invitation closes. Do NOT grow that invitation into an
          explanation of the referral mechanism; see the root CLAUDE.md. */}
      <section className="theme-section-contrast py-20 md:py-28">
        <div className="max-w-2xl mx-auto px-6">
          <Eyebrow className="mb-5">Who writes it</Eyebrow>
          <h2 className="theme-text-primary type-h2 mb-6">
            I write {site.name}.
          </h2>
          <p className="theme-text-contrast-muted type-body-lg leading-relaxed mb-5">
            I am a licensed real estate agent in South Carolina, and I have read this
            material in my own time for years, whether it is a journal article, a working
            paper, or anything else where somebody took the trouble to measure something
            properly. Writing it up is mostly an excuse to keep going.
          </p>
          {/* Independence stated WITHOUT the phrase "I do not practice", which
              is banned site-wide: it disqualifies Alex at the exact moment a
              reader is deciding whether he can help. See the strategic-direction
              note in the root CLAUDE.md. */}
          <p className="theme-text-contrast-muted type-body-lg leading-relaxed mb-8">
            Being in the business is useful for hearing what people are saying. Not having
            a deal riding on any of it is useful for writing down what the records actually
            show.
          </p>
          <p className="theme-text-contrast-muted type-body-lg leading-relaxed mb-5">
            If you have come across a paper worth reading, or you have seen something in
            the field that the research seems to miss, send it over. That goes double for
            anyone who lists and sells for a living. Corrections are welcome too, and if
            something here is wrong I will fix it where everyone can see it.
          </p>
          <p className="theme-text-contrast-muted type-body-lg leading-relaxed mb-9">
            And if you are looking to buy or thinking of selling, let me know.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="theme-cta-accent inline-flex items-center gap-2 font-semibold px-7 py-3.5"
          >
            {CONTACT_EMAIL}
            <ArrowIcon />
          </a>
        </div>
      </section>
    </>
  );
}
