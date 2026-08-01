import type { Metadata } from "next";
import { site } from "@/lib/site";
import { ReferralForm } from "@/components/ReferralForm";

export const metadata: Metadata = {
  title: "Buying or Selling",
  description:
    "Buying or selling in Greenville, SC, or moving here from somewhere else? Tell me what " +
    "you are working on and I will help you figure out the real numbers, the right timing, " +
    "and what has to happen first. It costs you nothing.",
  alternates: { canonical: `${site.url}/find-a-pro` },
};

/**
 * Copy rule for this page (August 1, 2026): it never explains the referral
 * mechanism. Earlier drafts led with "I hand-pick a vetted agent" and "the agent
 * I refer you to shares part of their commission with me." That is Alex's
 * business model, not the reader's situation, and reading it before you have
 * even said what you need makes the page feel like a lead broker rather than a
 * person who knows this market. The site's job is to earn the conversation with
 * a buyer or seller. Alex handles the introduction himself, in that
 * conversation, once he knows what they actually need.
 *
 * The one place compensation still appears is the fine print at the bottom,
 * which is a licensee disclosure, not marketing copy. Keep it short and factual.
 */
const steps = [
  {
    n: "1",
    title: "Tell me what you need",
    body: "A few quick details below. Buying or selling, where, and roughly when. That is enough for me to be useful on the first call.",
  },
  {
    n: "2",
    title: "We talk it through",
    body: "I reach out, usually within a day. We go through what you are trying to do, what it realistically costs in this market right now, and what has to happen first. No pitch and no pressure, and if the honest answer is that you should wait, I will tell you that.",
  },
  {
    n: "3",
    title: "I stay in your corner",
    body: "From there I make sure the whole thing is handled well, including the loan officer and the closing attorney if you need them. I am a text away until it closes.",
  },
];

const trust = [
  {
    title: "Straight answers, not a sales pitch",
    body: "This is the biggest financial decision most people make, and it deserves a real number rather than an encouraging one. If the house is overpriced or the timing is wrong, that is what you will hear from me.",
  },
  {
    title: "Greenville, or wherever you are headed",
    body: "I am local here in the Upstate and I know it well. If you are moving in from another state or heading out of one, I can help with that side too. My help is not limited to my zip code.",
  },
  {
    title: "Free to you, and no pressure",
    body: "You never pay me anything, and there is no obligation at the end of the conversation. Ask your questions, get the real answer, and decide on your own timeline.",
  },
];

export default function FindAProPage() {
  return (
    <>
      {/* Form first: a curious visitor can act immediately and scroll for the rest. */}
      <section className="theme-page theme-border pt-32 pb-16 border-b">
        <div className="max-w-3xl mx-auto px-6">
          {/* Eyebrow and headline lead with the reader's situation, not the
              referral mechanism (reframed July 30, 2026 alongside the nav label,
              finished August 1, 2026). "Real estate referrals" and "I hand-pick a
              vetted agent" both described how Alex gets paid, which is not what a
              buyer or seller showed up for. */}
          <span className="theme-label inline-block text-xs font-semibold uppercase tracking-widest mb-4">
            Buying or selling · Greenville + anywhere
          </span>
          <h1 className="theme-text-primary text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
            Buying or selling? Tell me what you are working on.
          </h1>
          <p className="theme-text-muted text-lg max-w-xl leading-relaxed text-center mx-auto">
            I am a licensed real estate agent in South Carolina, and I write most of what is on
            this site, so I spend my week in the actual Greenville numbers. Tell me what you are
            trying to do, here or in whatever city you are moving to, and I will help you get the
            real answer on what it costs, what it is worth, and what has to happen first. It costs
            you nothing.
          </p>

          <div
            id="connect"
            className="theme-card-strong border theme-border rounded-2xl p-6 sm:p-9 scroll-mt-24 mt-10"
          >
            <div className="text-center max-w-lg mx-auto mb-8">
              <h2 className="theme-text-primary type-h3 mb-2">Tell me what you need</h2>
              <p className="theme-text-muted text-base leading-relaxed">
                Takes about a minute. The more you share, the better the match. No obligation, and I
                will not add you to any list.
              </p>
            </div>
            <ReferralForm source="find-a-pro" />
          </div>
        </div>
      </section>

      {/* The reassurance, below the fold for anyone who wants to understand it first. */}
      <section className="theme-section py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="theme-text-primary type-h3 mb-8">How this works</h2>
          <ol className="grid gap-6 sm:grid-cols-3 mb-14">
            {steps.map((s) => (
              <li key={s.n} className="relative">
                <div
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full mb-3 font-semibold text-sm theme-label"
                  style={{ background: "var(--accent-soft)" }}
                >
                  {s.n}
                </div>
                <h3 className="theme-text-primary type-title mb-2">{s.title}</h3>
                <p className="theme-text-muted type-small leading-relaxed">{s.body}</p>
              </li>
            ))}
          </ol>

          <ul className="grid gap-5 sm:grid-cols-3">
            {trust.map((c) => (
              <li key={c.title} className="theme-card border theme-border rounded-xl p-6">
                <h3 className="theme-text-primary type-title mb-2">{c.title}</h3>
                <p className="theme-text-muted type-small leading-relaxed">{c.body}</p>
              </li>
            ))}
          </ul>

          {/* Licensee disclosure, not marketing copy. It stays because Alex holds
              an active SC license and may be compensated on a closed transaction;
              it is deliberately the only place on the site that mentions a fee. */}
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
