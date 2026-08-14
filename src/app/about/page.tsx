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
    "A publication about how South Carolina companies actually make money, built from filings, permits, job postings, and county records, and written for the people who build and buy here.",
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
            Announcements are not information.
          </h1>
          <p className="theme-text-secondary type-body-lg mb-5">
            A company announces three hundred jobs. The story runs, the ribbon gets cut,
            and the coverage stops there. Almost nobody writes down what the company
            actually sells, who pays it, why it chose that site, or what would have to go
            wrong for the whole thing to come apart.
          </p>
          <p className="theme-text-secondary type-body-lg">
            That gap is the entire reason this exists. Every other week I take one South
            Carolina company apart and answer the only question that really matters about
            a business, which is how it makes money and what would break it.
          </p>
        </div>
      </section>

      {/* ── The method. This is the credibility section, and it is about the
          work rather than the writer, which is the point. ── */}
      <section className="theme-section-contrast py-20 md:py-28">
        <div className="max-w-2xl mx-auto px-6">
          <Eyebrow className="mb-5">The method</Eyebrow>
          <h2 className="theme-text-primary type-h2 mb-6">
            Everything here starts with a document.
          </h2>
          <p className="theme-text-contrast-muted type-body-lg leading-relaxed mb-6">
            The claim that a company is growing is worth nothing by itself. The forty
            engineering roles it posted in six months is worth something, because you can
            go and count them. So every characterization in a piece is anchored to
            something you could pull up yourself.
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
                signed. A building is a commitment that is hard to walk back quietly.
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

      {/* ── Who it is for. Alex's note: speak to the reader. This is that. ── */}
      <section className="theme-section py-20 md:py-28">
        <div className="max-w-2xl mx-auto px-6">
          <Eyebrow className="mb-5">Who it is for</Eyebrow>
          <h2 className="theme-text-primary type-h2 mb-6">
            People who build and buy here.
          </h2>
          <div className="theme-prose prose max-w-none">
            <p>
              Developers, real estate entrepreneurs, and the people who work around a
              deal. If you are trying to decide what a site is worth, who is realistically
              going to lease it, or whether the employer three miles away is expanding or
              quietly shrinking, the company behind the announcement will tell you more
              than the announcement ever does.
            </p>
            <p>
              Local business coverage answers the question of what happened. It rarely
              answers the question you are actually holding, which is whether the thing is
              durable. A company that looks enormous can rest on two customers. A company
              nobody has heard of can be the reason a whole corridor has water and power.
              Those are the facts that move a decision, and they are sitting in public
              records that nobody reads.
            </p>
            <p>
              It covers South Carolina rather than one county, because capital does not
              stop at a county line. The Upstate is home and wins the close calls.
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
