import type { Metadata } from "next";
import Link from "next/link";
import { site, CONTACT_EMAIL } from "@/lib/site";
import { getPublishedPosts, postHref, sectionLabel, formatDate } from "@/lib/posts";
import { bookingUrl } from "@/lib/booking";
import { QuickContact } from "@/components/QuickContact";
import { BookCall } from "@/components/BookCall";

/**
 * THE GREENVILLE AGENTS LANDING PAGE, and the site's second conversion surface.
 *
 * WHAT IT IS FOR. "Best real estate agents in Greenville, SC" is a commercial
 * query typed by somebody who is about to buy or sell and has not picked anyone
 * yet, which is the highest-intent moment this site can catch. Nearly everything
 * ranking for it is a directory selling its slots or a brokerage sorting its own
 * roster by sales volume. There is a real answer to the question and almost
 * nobody gives it, so this page gives it and then makes getting in touch a
 * single button.
 *
 * WHY IT IS A SEPARATE ROUTE FROM /buying-or-selling. That page answers "I have
 * decided, now what": it opens on a form with eight fields because the visitor
 * arrived through the nav having already made up their mind. This one answers "I
 * am comparing", which needs the substance first and the shortest possible ask
 * second (see src/components/QuickContact.tsx). The two do not compete for the
 * same query either, since one is the brand and nav destination and the other is
 * written for a search.
 *
 * WHAT IT MAY NOT DO. It does not rank real agents, name a "top ten", or imply
 * any such list exists, because none does and inventing one would fabricate. It
 * does not explain the referral mechanism, per the root CLAUDE.md, which is the
 * rule every user-facing surface here shares: no referring, matching,
 * connecting, or introducing, nobody is "vetted", nothing is "free", and Alex
 * never says he does not practice. The page earns a conversation. What happens
 * inside that conversation is Alex's to explain in it.
 *
 * It also does not claim Alex is one of the best agents in Greenville. He is
 * licensed and he is new, and the credibility this page trades on is the reading
 * and the record checking, which is what the publication trades on everywhere
 * else.
 *
 * SOURCING. External links are deliberately absent and every claim is attributed
 * in words instead, which the house style treats as complete sourcing. A rotted
 * link is worse than no link on the page a stranger uses to decide whether this
 * site is run by a real person. The one study cited is Levitt and Syverson,
 * Review of Economics and Statistics, 2008, on agent-owned homes.
 */

const TITLE = "Best Real Estate Agents in Greenville, SC";
const DESCRIPTION =
  "No one can hand you an honest ranked list of the best agents in Greenville. Here is what " +
  "separates a good one from an average one, what the research says about how agents price a " +
  "house, and how to check any of it yourself.";
const CANONICAL = `${site.url}/best-real-estate-agents-greenville-sc`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: `${TITLE} · ${site.name}`,
    description: DESCRIPTION,
    type: "article",
    url: CANONICAL,
    siteName: site.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} · ${site.name}`,
    description: DESCRIPTION,
  },
};

export const revalidate = 3600;

/**
 * The four checks. Each heading is a different shape on purpose (statement,
 * imperative, imperative, statement), because four headings built the same way
 * is the uniform-sentence-shape tell the root CLAUDE.md names.
 */
const CHECKS = [
  {
    title: "They will tell you the number you do not want to hear.",
    body:
      "Pricing is where most of the money is won or lost, and the person advising you has a far " +
      "smaller stake in it than you do. Steven Levitt and Chad Syverson compared the houses " +
      "agents sold for clients against the houses those same agents owned themselves, and the " +
      "agent-owned homes sold for about 3.7 percent more while sitting on the market roughly ten " +
      "days longer. The arithmetic behind that is not mysterious. On a $400,000 house, holding " +
      "out for another $10,000 is worth $250 to a listing side earning 2.5 percent, before the " +
      "brokerage takes its share, and it is worth the entire $10,000 to you. Three more weeks on " +
      "the market is cheap for you and expensive for them. The agent worth hiring is the one who " +
      "tells you to wait when waiting is right, and who tells you the number is wrong when it is " +
      "wrong in the other direction.",
  },
  {
    title: "Ask where their last five closings were.",
    body:
      "Greenville County does not move as one market. A run of quick sales off Augusta Road tells " +
      "you very little about what a house will do in Fountain Inn or Travelers Rest, where the " +
      "buyer pool and the pace are both different. Ask for the last five closings with addresses " +
      "and dates, then ask what each one listed at before it sold. Deeds are public record here, " +
      "so anything you are told is checkable, and the checking is most of the reason to ask.",
  },
  {
    title: "Make them show you the comps they threw out.",
    body:
      "Any agent can produce three sales that support whatever price you were hoping to hear. The " +
      "work lives in the ones they rejected, and in the adjustments they made for a finished " +
      "basement, a road with real traffic on it, or a roof with two winters left in it. An agent " +
      "who hands you a price without that reasoning has handed you a guess with a logo on it.",
  },
  {
    title: "The license record is public, so read it.",
    body:
      "South Carolina licenses agents through the Department of Labor, Licensing and Regulation, " +
      "and its public lookup shows whether a license is active, what type it is, and whether any " +
      "disciplinary action is attached to it. The search takes about a minute. Nearly everyone " +
      "comes back clean, which is a fine outcome, because the value of the check is that you did " +
      "it rather than assumed it.",
  },
];

/**
 * The FAQ. ONE array drives both the visible section and the FAQPage JSON-LD
 * below, so the structured data cannot drift from what a reader sees. Google
 * requires the two to match, and it is also the only way this stays true after
 * somebody edits the copy.
 */
const FAQS = [
  {
    q: "Is there an official ranking of the best real estate agents in Greenville?",
    a:
      "No. The state licenses agents and the local association tracks membership, but neither one " +
      "ranks anybody. Most of the lists online are paid placement or a sort by sales volume, and " +
      "volume counts how many transactions an agent closed rather than how well any single one of " +
      "them went for the client.",
  },
  {
    q: "What does a real estate agent cost in Greenville, SC?",
    a:
      "Commission is negotiable and always has been. Since the 2024 changes to how the MLS handles " +
      "compensation, a buyer signs a written agreement stating what their own agent is paid before " +
      "touring a house, and a seller no longer advertises a payment to the buyer agent through the " +
      "MLS. Totals quoted around here still tend to land between 4 and 6 percent of the sale " +
      "price, but the only number that binds you is the one on the agreement you sign.",
  },
  {
    q: "Do I need my own agent to buy new construction?",
    a:
      "The person sitting in the model home is paid by the builder and represents the builder. " +
      "That does not make them dishonest, and it does mean nobody in that room is working for you " +
      "unless you brought someone. Builders commonly require your agent to be with you or named in " +
      "writing on the first visit, so the decision gets made before you walk in the door.",
  },
  {
    q: "How do I check that an agent is licensed in South Carolina?",
    a:
      "Search the name in the license lookup the South Carolina Department of Labor, Licensing and " +
      "Regulation runs for the Real Estate Commission. It shows the license status, the license " +
      "type, and any disciplinary history.",
  },
  {
    q: "What happens after I send the form?",
    a:
      "It lands in my inbox and I read it. I write back within a day or two to hear what you are " +
      "trying to do, what your timing looks like, and what the honest numbers are. There is no " +
      "obligation at the end of that conversation, and if the answer is that you should wait, that " +
      "is what you will hear.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "FAQPage",
      "@id": `${CANONICAL}#faq`,
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${CANONICAL}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: site.url },
        { "@type": "ListItem", position: 2, name: TITLE, item: CANONICAL },
      ],
    },
  ],
};

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden="true"
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

export default async function BestAgentsGreenvillePage() {
  // Prefer the real-estate work, since that is what a reader who got here is
  // asking about. Fall back to the whole feed so the section is never empty on a
  // build where the Greenville tag has nothing recent.
  const realEstate = await getPublishedPosts(4, "realestate");
  const posts = realEstate.length > 0 ? realEstate : await getPublishedPosts(4);
  // With a booking page configured, the call IS the offer and the form drops to
  // being the net underneath it. Without one, the form is the offer and the copy
  // has to say so, because a heading promising a call above nothing but a text
  // box is a broken promise. NEXT_PUBLIC_* is inlined at build, so a server
  // component can read it (see src/lib/booking.ts).
  const canBook = bookingUrl() !== null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* The answer and the ask, both above the fold. A visitor who arrived from
          a search is still comparing, so the honest framing has to come first,
          and the form has to be reachable without a scroll for the one who has
          finished comparing. */}
      <section className="theme-page theme-border pt-32 pb-16 border-b">
        <div className="max-w-3xl mx-auto px-6">
          <span
            className="theme-label type-eyebrow inline-block border-t-2 pt-2 mb-6"
            style={{ borderColor: "var(--accent)" }}
          >
            Greenville, South Carolina
          </span>
          <h1 className="theme-text-primary type-h1 mb-6">
            Best real estate agents in Greenville, SC
          </h1>

          <p className="theme-text-muted type-body-lg leading-relaxed mb-5">
            Every page that promises a ranked list of the best agents in Greenville is either
            selling the slots on it or sorting by sales volume, and neither one answers the
            question you are actually asking. Volume tells you how busy somebody is. It does not
            tell you what they got for the last seller who trusted them, or whether they talked
            that seller out of a price that was never going to work.
          </p>
          <p className="theme-text-muted type-body-lg leading-relaxed mb-10">
            I am {site.author}. I hold a real estate license in South Carolina and I write{" "}
            {site.name}, where I read the research on how houses actually sell and put it next to
            what the Greenville numbers are doing. Below is what separates a good agent from an
            average one, and how to check any of it yourself without taking anyone&apos;s word for
            it. If you would rather skip the reading, tell me what you are working on and I will
            help you figure out where you stand.
          </p>

          <div
            id="connect"
            className="theme-card-strong border theme-border p-6 sm:p-8 scroll-mt-24"
          >
            <h2 className="theme-text-primary type-h3 mb-2">
              {canBook ? "Talk it through with me." : "Tell me what you are working on."}
            </h2>
            <p className="theme-text-muted type-small leading-relaxed mb-6">
              {canBook
                ? "Pick a time and I will call you. Fifteen minutes, no pitch, and you get a straight answer on where you stand before you commit to anything."
                : "One tap and two fields. It comes straight to me, I read every one of these myself, and I answer them."}
            </p>
            <BookCall />
            {canBook && (
              <div className="theme-border border-t mt-8 pt-6">
                <p className="theme-text-muted type-small leading-relaxed mb-5">
                  Would rather not pick a slot yet? Send it over and I will write back.
                </p>
              </div>
            )}
            <QuickContact source="best-agents-greenville-hero" />
            <p className="theme-text-muted type-small leading-relaxed mt-6">
              Would rather write it out? Email me at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="theme-link underline">
                {CONTACT_EMAIL}
              </a>
              . If you want to give me the whole picture up front, the{" "}
              <Link href="/buying-or-selling" className="theme-link underline">
                buying or selling page
              </Link>{" "}
              asks a few more questions.
            </p>
          </div>
        </div>
      </section>

      <section className="theme-section py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="theme-text-primary type-h2 mb-4">
            What actually separates a good agent here
          </h2>
          <p className="theme-text-muted type-body-lg leading-relaxed mb-12">
            None of this requires you to know the market already. It requires you to ask a few
            specific things and to watch what happens when you do.
          </p>

          <div className="grid gap-10">
            {CHECKS.map((c) => (
              <div key={c.title}>
                <h3 className="theme-text-primary type-title mb-3">{c.title}</h3>
                <p className="theme-text-muted type-body leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Same surface as the section above it, so a hairline rule does the
          separating. That is the house convention (see src/CLAUDE.md); there is
          no third background token to reach for. */}
      <section className="theme-section theme-border border-t py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="theme-text-primary type-h2 mb-12">Questions people ask</h2>
          <dl className="grid gap-9">
            {FAQS.map((f) => (
              <div key={f.q}>
                <dt className="theme-text-primary type-title mb-3">{f.q}</dt>
                <dd className="theme-text-muted type-body leading-relaxed">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {posts.length > 0 && (
        <section className="theme-section theme-border border-t py-16 md:py-20">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="theme-text-primary type-h2 mb-4">
              What I have written about this market
            </h2>
            <p className="theme-text-muted type-body-lg leading-relaxed mb-10">
              The rest of the site is the same work at greater length, built on the county records
              and the research rather than on what everybody says.
            </p>
            <ul className="grid gap-6">
              {posts.map((p) => (
                <li key={p.id} className="theme-border border-t pt-5">
                  <Link href={postHref(p)} className="group block">
                    <span className="theme-label type-eyebrow">
                      {sectionLabel(p)} · {formatDate(p.published_at)}
                    </span>
                    <h3 className="theme-text-primary type-title mt-1.5 group-hover:underline">
                      {p.title}
                    </h3>
                    {p.summary && (
                      <p className="theme-text-muted type-small leading-relaxed mt-1.5">
                        {p.summary}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-8">
              <Link
                href="/reporting"
                className="theme-link type-small font-medium inline-flex items-center gap-1.5"
              >
                Everything, newest first
                <ArrowIcon className="w-3 h-3" />
              </Link>
            </p>
          </div>
        </section>
      )}

      {/* The second ask. A reader who worked through the whole page is the most
          likely one to send it, and sending them back up to the hero form is
          friction with no upside. The `source` differs from the hero form so
          supabase/queries.sql can tell the two placements apart. */}
      <section className="theme-section theme-border border-t py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="theme-card-strong border theme-border p-6 sm:p-8">
            <h2 className="theme-text-primary type-h3 mb-2">Buying or selling in Greenville?</h2>
            <p className="theme-text-muted type-small leading-relaxed mb-6">
              Tell me what you are working on and I will help you get to the real number, the right
              timing, and whatever has to happen first. No pitch, and no obligation at the end of
              it.
            </p>
            {canBook && (
              <div className="mb-8">
                <BookCall />
              </div>
            )}
            <QuickContact source="best-agents-greenville-close" />
          </div>

          {/* Licensee disclosure, not marketing copy, and worded exactly as it is
              on /buying-or-selling. It stays because Alex holds an active SC
              license, and it is deliberately the only place a fee is mentioned. */}
          <p className="theme-text-muted text-xs leading-relaxed mt-10 max-w-xl">
            {site.author} is a licensed real estate agent with eXp Realty in South Carolina. I may
            be compensated by a referral fee when a transaction closes, at no cost to you. This page
            is information only and is not financial, legal, or investment advice.
          </p>
        </div>
      </section>
    </>
  );
}
