import type { Metadata } from "next";
import { site } from "@/lib/site";
import { ReferralForm } from "@/components/ReferralForm";

export const metadata: Metadata = {
  title: "Find an Agent",
  description:
    "Buying or selling, in Greenville, SC or relocating anywhere? Tell me what you need and " +
    "I will hand-pick a vetted agent worth your time, plus the lender and closing attorney " +
    "who make a deal go smoothly, and stay in your corner until it closes. No cost to you.",
  alternates: { canonical: `${site.url}/find-a-pro` },
};

const steps = [
  {
    n: "1",
    title: "Tell me what you need",
    body: "A few quick details below. Buying or selling, where, and roughly when. That is enough for me to point you in the right direction.",
  },
  {
    n: "2",
    title: "I hand-pick your pro",
    body: "I reach out, learn a little more, and match you with an agent I would trust with my own family. If you also need a good loan officer or a closing attorney, I know the ones who earn their keep. Local here in Greenville, or in whatever city you are moving to.",
  },
  {
    n: "3",
    title: "I stay in your corner",
    body: "I am not handing you off and disappearing. I check that you are being taken care of, and I am a text away if anything feels off. It costs you nothing.",
  },
];

const trust = [
  {
    title: "A vetted bench, not a coin flip",
    body: "The gap between a good agent and a bad one is thousands of dollars and a lot of stress. The same is true of a lender who misses a deadline. I hand-pick the professionals you work with instead of leaving it to whoever answers a portal form first.",
  },
  {
    title: "Greenville, or wherever you are headed",
    body: "I am local here in the Upstate, and if you are relocating I will find you a strong agent in that market too. Referrals are not limited to my zip code, and neither is my help.",
  },
  {
    title: "Free to you, and no pressure",
    body: "You never pay me. If your sale closes, the agent I refer you to shares part of their commission with me. So I only win when you are genuinely taken care of.",
  },
];

export default function FindAProPage() {
  return (
    <>
      {/* Form first: a curious visitor can act immediately and scroll for the rest. */}
      <section className="theme-page theme-border pt-32 pb-16 border-b">
        <div className="max-w-3xl mx-auto px-6">
          <span className="theme-label inline-block text-xs font-semibold uppercase tracking-widest mb-4">
            Real estate referrals · Greenville + anywhere
          </span>
          <h1 className="theme-text-primary text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
            Buying or selling? I&apos;ll connect you with a pro worth your time.
          </h1>
          <p className="theme-text-muted text-lg max-w-xl leading-relaxed">
            I am a licensed real estate agent in South Carolina, and my edge is knowing which
            professionals actually earn their keep. Tell me what you are trying to do, here in
            Greenville or in whatever city you are moving to, and I will hand-pick an agent I would
            trust with my own family, then stay in your corner until it closes. It costs you nothing.
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

          <p className="theme-text-muted text-xs leading-relaxed mt-10 max-w-xl">
            {site.author} is a licensed real estate agent with eXp Realty in South Carolina. If I
            refer you to an agent and your sale closes, I may receive a referral fee from that agent,
            at no cost to you. This page is information only and is not financial, legal, or
            investment advice.
          </p>
        </div>
      </section>
    </>
  );
}
