import type { Metadata } from "next";
import { site } from "@/lib/site";
import { SubscribeForm } from "@/components/SubscribeForm";

export const metadata: Metadata = {
  title: "Find an Agent",
  description:
    "Buying or selling, in Greenville, SC or relocating anywhere? A licensed agent connects you " +
    "with a vetted agent worth your time and stays in your corner. No cost to you.",
  alternates: { canonical: `${site.url}/find-an-agent` },
};

const reasons = [
  {
    title: "A vetted agent, not a coin flip",
    body: "The gap between a good agent and a bad one is thousands of dollars and a lot of stress. I hand-pick who you work with instead of leaving it to whoever answers a portal form first.",
  },
  {
    title: "Greenville, or wherever you are headed",
    body: "Local here in Greenville, and if you are relocating I will find you a strong agent in that market too. Referrals are not limited to my zip code, and neither is my help.",
  },
  {
    title: "I stay in your corner",
    body: "I am not handing you off and disappearing. I check that you are being taken care of, and I am a text away if something feels off. That is the whole point of going through a person.",
  },
];

export default function FindAnAgentPage() {
  return (
    <>
      <section className="theme-page theme-border pt-32 pb-16 border-b">
        <div className="max-w-3xl mx-auto px-6">
          <span className="theme-label inline-block text-xs font-semibold uppercase tracking-widest mb-4">
            Real estate referrals · Greenville + anywhere
          </span>
          <h1 className="theme-text-primary text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
            Buying or selling? I&apos;ll match you with an agent worth your time.
          </h1>
          <p className="theme-text-muted text-lg max-w-xl leading-relaxed">
            I am a licensed real estate agent in South Carolina, but my day job is not showing
            houses. What I am good at is knowing which agents actually earn their keep. Tell me
            what you are trying to do, here in Greenville or in whatever city you are moving to,
            and I will connect you with someone I would trust with my own family, then stay in your
            corner until it closes. It costs you nothing. Information only, not financial advice.
          </p>
        </div>
      </section>

      <section className="theme-section py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-6">
          <ul className="grid gap-5 sm:grid-cols-3 mb-14">
            {reasons.map((c) => (
              <li key={c.title} className="theme-card-strong border theme-border rounded-xl p-6">
                <h3 className="theme-text-primary type-title mb-2">{c.title}</h3>
                <p className="theme-text-muted type-small">{c.body}</p>
              </li>
            ))}
          </ul>

          <div className="theme-card border theme-border rounded-xl p-8 text-center">
            <h2 className="theme-text-primary type-h3 mb-2">Tell me what you need</h2>
            <p className="theme-text-muted text-base leading-relaxed max-w-lg mx-auto mb-6">
              Leave your email and I will reach out to learn what you are looking for and match you
              with the right agent. No pressure, no obligation.
            </p>
            <SubscribeForm
              source="agent-referral"
              heading=""
              blurb=""
              cta="Connect me with an agent"
              showSubstackLink={false}
            />
          </div>

          <p className="theme-text-muted text-xs leading-relaxed mt-6 max-w-xl">
            {site.author} is a licensed real estate agent with eXp Realty in South Carolina. If I
            refer you to an agent and your sale closes, I may receive a referral fee from that
            agent, at no cost to you. This page is information only and is not financial, legal, or
            investment advice.
          </p>
        </div>
      </section>
    </>
  );
}
