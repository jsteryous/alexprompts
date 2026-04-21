import Link from "next/link";
import {
  AestheticBeforeAfterMock,
  FormErrorMock,
  CrampedMobileMock,
  StaleFooterMock,
} from "./VisualMocks";

export function ArrowIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

const brokenExamples = [
  {
    title: "Dated look",
    caption:
      "Gray-on-gray, clip-art teeth, beveled buttons. The practice looks frozen in 2012 \u2014 new patients judge the office by it.",
    visual: <AestheticBeforeAfterMock />,
  },
  {
    title: "No mobile viewport",
    caption:
      "Desktop layout pinch-zoomed into a phone. Most new-patient searches happen on a phone \u2014 they bounce before they read a word.",
    visual: <CrampedMobileMock />,
  },
  {
    title: "Stale copyright",
    caption:
      "Footer still says 2019. The office looks closed \u2014 whether it is or not. Trust leaks before the patient sees your hours.",
    visual: <StaleFooterMock />,
  },
];

const processSteps = [
  {
    step: "01",
    title: "We audit your site",
    body: "You send your URL. We review it and send back screenshots of the issues worth fixing \u2014 booking forms, mobile, trust leaks, speed.",
  },
  {
    step: "02",
    title: "You get a written proposal",
    body: "Every audit comes back as a real proposal, not a sales pitch. Scope, price, timeline, and which tier is the honest fit \u2014 or none, if the site is already fine.",
  },
  {
    step: "03",
    title: "We execute the tier you approve",
    body: "Cleanup ships in 48 hours. Growth and Dominance run on published milestones. You see exactly what was done at the end of every month.",
  },
];

const outcomes = [
  "Patients book without hitting a dead form",
  "Your site loads fast and looks right on every phone",
  "You show up first when patients Google \u201Cdentist near me\u201D",
  "New reviews arrive steadily \u2014 and Google notices",
];

export const faqs = [
  {
    q: "What is the free audit and proposal exactly?",
    a: "You send your practice URL. Within one business day we reply with screenshots of what is broken and a written proposal naming the tier that actually fits \u2014 scope, price, timeline. No sales call, no follow-up sequence. If the site is already fine, the proposal says that.",
  },
  {
    q: "How do the three tiers differ?",
    a: "Cleanup ($1,500) is a one-time 48-hour fix for the things on your site that are quietly losing you patients \u2014 broken forms, mobile problems, stale footer. No retainer. Growth ($3,500 setup + $500/month) adds the ongoing work that makes new patients find you first on Google: listing management, content written for what patients actually search, review responses, monthly reporting. Dominance is custom \u2014 a visual refresh, more content, authority building, and dedicated landing pages, scoped and priced inside the proposal for practices fighting to be the default choice in their ZIP code.",
  },
  {
    q: "Are the monthly retainers locked in?",
    a: "No. Growth and Dominance are month-to-month after the setup phase. Cancel with 30 days notice. We do not use long-term contracts \u2014 if the work is not producing results, neither of us should be stuck.",
  },
  {
    q: "What if my site needs a full rebuild instead?",
    a: "We tell you in the proposal. If the audit reveals Cleanup will not hold up and a rebuild is the honest answer, we quote it as Dominance or a custom scope \u2014 you see the reasoning before you decide. The rebuild is the upsell after the audit, not the bait in the hero.",
  },
  {
    q: "Do you only work with dental practices in Greenville?",
    a: "Dental practices only. Greenville County is home base and we cover the full Upstate \u2014 Spartanburg, Anderson, Pickens, and Oconee counties. Specialty included: general, pediatric, ortho, oral surgery, cosmetic/implants, perio, endo.",
  },
];

export const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export function VisualProofSection() {
  return (
    <section id="what-we-fix" className="theme-section-contrast py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl mb-14">
          <span className="theme-label inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-4">
            Visual Proof
          </span>
          <h2 className="theme-text-primary text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5">
            This is what broken
            <br />
            actually looks like.
          </h2>
          <p className="theme-text-contrast-muted text-base leading-relaxed">
            Not a giant website report. Four problems the audit catches on dental-practice sites &mdash; each costs new-patient calls in a way the office rarely sees.
          </p>
        </div>

        <div className="space-y-6">
          <div className="theme-card-strong border rounded-3xl p-6 md:p-10">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div>
                <span className="theme-warn-badge inline-block text-xs uppercase tracking-widest font-semibold px-2.5 py-1 rounded-full mb-4">
                  Worst offender
                </span>
                <p className="theme-text-primary text-2xl md:text-3xl font-bold mb-3 leading-tight">
                  Booking form 404
                </p>
                <p className="theme-text-contrast-muted text-base leading-relaxed">
                  The patient fills out the appointment form, hits submit, and lands on a 404. They close the tab and call the practice down the street. The office never sees the lead &mdash; they just keep wondering why the phone is quiet.
                </p>
              </div>
              <div>
                <FormErrorMock />
              </div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {brokenExamples.map((item) => (
              <div key={item.title} className="theme-card border rounded-2xl p-5 flex flex-col gap-4">
                <div>{item.visual}</div>
                <div>
                  <p className="theme-text-primary text-base font-semibold mb-1.5">{item.title}</p>
                  <p className="theme-text-contrast-muted text-sm leading-relaxed">{item.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProcessSection() {
  return (
    <section id="process" className="theme-section py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl mb-12">
          <span className="theme-label inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-4">
            Simple Process
          </span>
          <h2 className="theme-text-primary text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5">
            Three steps.
            <br />
            No mystery.
          </h2>
          <p className="theme-text-muted leading-relaxed">
            Confused customers do not buy. One entry point &mdash; the audit. One deliverable &mdash; a written proposal. You decide what happens next.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {processSteps.map((item) => (
            <div key={item.step} className="theme-card border rounded-3xl p-8">
              <p className="theme-label text-xs font-semibold uppercase tracking-[0.22em] mb-4">{item.step}</p>
              <h3 className="theme-text-primary text-2xl font-bold leading-tight mb-3">{item.title}</h3>
              <p className="theme-text-secondary text-sm leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Link
            href="/sample-proposal"
            className="theme-link text-sm font-semibold inline-flex items-center gap-1.5"
          >
            See a sample proposal
            <ArrowIcon />
          </Link>
        </div>
      </div>
    </section>
  );
}

export const tiers = [
  {
    slug: "cleanup",
    name: "Cleanup",
    tagline: "Stop losing patients who are already trying to book you.",
    setupPrice: "$1,500",
    setupNote: "one-time",
    monthlyPrice: null,
    monthlyNote: "No retainer",
    timeline: "48-hour turnaround",
    bestFor:
      "Your site works but is quietly embarrassing. The booking form\u2019s broken. It looks bad on a phone. The footer still says 2019.",
    included: [
      "Your booking and contact forms actually work \u2014 on every device",
      "Your site displays and scrolls properly on phones",
      "Copyright year, broken links, and the padlock in the address bar all correct",
      "Hero, buttons, and contact flow refreshed so the practice looks current",
      "Before/after screenshots at handoff, so you see exactly what changed",
    ],
    featured: false,
    cta: "Get Free Audit",
  },
  {
    slug: "growth",
    name: "Growth",
    tagline: "Be the dentist new patients see first \u2014 month after month.",
    setupPrice: "$3,500",
    setupNote: "setup",
    monthlyPrice: "$500",
    monthlyNote: "per month, month-to-month",
    timeline: "2-3 week build, ongoing from month 2",
    bestFor:
      "You\u2019re an established practice. The site is okay. You want to show up when patients in your area Google \u201Cdentist near me\u201D \u2014 and keep showing up.",
    included: [
      "Everything in Cleanup",
      "Your Google listing claimed, filled out, and optimized every month so new patients find you first",
      "Home and top service pages rewritten to match what patients actually search for",
      "Two patient-facing articles a month, written about questions your patients actually ask",
      "New reviews monitored; we draft responses, you approve",
      "Listed correctly across the directories Google checks when ranking local dentists",
      "A monthly email showing what shipped and what moved",
    ],
    featured: true,
    cta: "Get Free Audit",
  },
  {
    slug: "dominance",
    name: "Dominance",
    tagline: "Own your ZIP code. Be the default dentist for every procedure.",
    setupPrice: "Let\u2019s talk",
    setupNote: "custom scope",
    monthlyPrice: null,
    monthlyNote: "Scope and retainer priced in the proposal",
    timeline: "Timeline confirmed in proposal",
    bestFor:
      "Multi-provider, expansion-stage, or fighting a crowded market. You want to be the default dentist choice in your ZIP code \u2014 for cleanings, implants, ortho, all of it.",
    included: [
      "Everything in Growth",
      "A visual refresh designed around new-patient conversion \u2014 not redesign for its own sake",
      "Four long-form articles a month that earn search traffic over time",
      "Mentions and links from other local and dental sites to boost your authority",
      "Automated review requests sent to patients after appointments",
      "Before/after galleries, treatment explainers, and dedicated pages for insurance and new patients",
      "A quarterly review \u2014 what\u2019s working, what we\u2019re doubling down on next",
    ],
    featured: false,
    cta: "Get Free Audit",
  },
] as const;

export function PricingSection() {
  return (
    <section id="pricing" className="theme-section-muted theme-border py-24 md:py-32 border-y">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-3xl mb-14">
          <span className="theme-label inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-4">
            Tiered Pricing
          </span>
          <h2 className="theme-text-primary text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5">
            Three tiers.
            <br />
            One honest proposal.
          </h2>
          <p className="theme-text-muted leading-relaxed">
            Every audit comes back as a written proposal naming the tier that actually fits. You pick. No upsells, no surprise line items.{" "}
            <Link href="/sample-proposal" className="theme-link font-semibold underline underline-offset-4">
              See a sample proposal
            </Link>
            .
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.slug}
              className={`${
                tier.featured ? "theme-card-strong" : "theme-card"
              } border rounded-3xl p-8 flex flex-col relative`}
            >
              {tier.featured && (
                <span className="theme-badge absolute top-5 right-5 text-[10px] font-semibold uppercase tracking-[0.18em] px-2.5 py-1 rounded-full">
                  Most practices
                </span>
              )}
              <p className="theme-label text-xs font-semibold uppercase tracking-[0.22em] mb-2">
                Tier {tier.slug === "cleanup" ? "01" : tier.slug === "growth" ? "02" : "03"}
              </p>
              <h3 className="theme-text-primary text-2xl font-bold mb-1.5">{tier.name}</h3>
              <p className="theme-text-secondary text-sm mb-6">{tier.tagline}</p>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="theme-text-primary text-4xl font-bold tracking-tight">
                    {tier.setupPrice}
                  </span>
                  <span className="theme-text-muted text-sm">{tier.setupNote}</span>
                </div>
                {tier.monthlyPrice ? (
                  <p className="theme-text-secondary text-sm mt-1">
                    + <span className="font-semibold">{tier.monthlyPrice}</span> {tier.monthlyNote}
                  </p>
                ) : (
                  <p className="theme-text-muted text-sm mt-1">{tier.monthlyNote}</p>
                )}
                <p className="theme-text-muted text-xs mt-2">{tier.timeline}</p>
              </div>

              <p className="theme-text-secondary text-sm leading-relaxed mb-5">{tier.bestFor}</p>

              <ul className="space-y-2.5 mb-8 flex-1">
                {tier.included.map((item) => (
                  <li key={item} className="theme-text-secondary text-sm leading-relaxed flex gap-2">
                    <span className="theme-label font-bold mt-0.5">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/contact"
                className={`${
                  tier.featured ? "theme-cta-accent" : "theme-cta"
                } inline-flex items-center justify-center gap-2 font-semibold px-5 py-3 rounded-xl text-sm`}
              >
                {tier.cta}
                <ArrowIcon />
              </Link>
            </div>
          ))}
        </div>

        <div className="theme-card-warn border rounded-3xl p-6 md:p-8 mt-10">
          <p className="theme-warn-badge inline-block text-xs font-semibold uppercase tracking-[0.2em] px-2.5 py-1 rounded-full mb-3">
            Not sure which tier?
          </p>
          <p className="theme-text-secondary text-sm md:text-base leading-relaxed">
            Don&apos;t guess. Send the URL. The free audit tells you which tier your site actually needs &mdash; and if none of them do, we&apos;ll say that too. The proposal is the product; the tier is just how it ships.
          </p>
        </div>
      </div>
    </section>
  );
}

export function OutcomesSection() {
  return (
    <section className="theme-section py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr,1fr] items-start">
          <div>
            <span className="theme-label inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-4">
              What Success Looks Like
            </span>
            <h2 className="theme-text-primary text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5">
              Your site works.
              <br />
              The practice looks current.
              <br />
              Patients actually book.
            </h2>
            <p className="theme-text-muted leading-relaxed">
              You should not lose new patients because the website looks abandoned. They are judging the practice by the site whether that is fair or not.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {outcomes.map((item) => (
              <div key={item} className="theme-card-accent border rounded-2xl p-5">
                <p className="theme-text-primary text-sm font-semibold leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function FaqSection() {
  return (
    <section id="faq" className="theme-section py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid gap-14 lg:grid-cols-[0.85fr,1.15fr] items-start">
          <div>
            <span className="theme-label inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-4">
              FAQ
            </span>
            <h2 className="theme-text-primary text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5">
              The questions
              <br />
              worth answering.
            </h2>
            <p className="theme-text-muted leading-relaxed">
              Five honest answers about the audit, the tiers, and what happens after you hit reply.
            </p>
          </div>

          <div className="theme-border border-t">
            {faqs.map((faq) => (
              <details key={faq.q} className="group theme-border border-b py-5">
                <summary className="flex items-start justify-between gap-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <span className="theme-text-primary text-base md:text-lg font-semibold leading-snug">
                    {faq.q}
                  </span>
                  <span className="theme-text-muted text-3xl leading-none mt-0.5 transition-transform group-open:rotate-45 select-none">
                    +
                  </span>
                </summary>
                <p className="theme-text-secondary text-sm md:text-base leading-relaxed mt-3 pr-8">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function FinalCtaSection() {
  return (
    <section className="theme-section-contrast py-24 md:py-28">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="max-w-2xl">
          <span className="theme-label inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-4">
            Direct Call To Action
          </span>
          <h2 className="theme-text-primary text-3xl md:text-4xl font-bold mb-3">
            Reply with your practice website.
            <br />
            You&apos;ll have a proposal tomorrow.
          </h2>
          <p className="theme-text-contrast-muted">
            Free audit. Written proposal with the tier that honestly fits. No call, no pitch, no follow-up sequence.
          </p>
        </div>
        <Link
          href="/contact"
          className="theme-cta-accent inline-flex items-center gap-2 font-semibold px-7 py-3.5 rounded-xl"
        >
          Get Free Audit
          <ArrowIcon />
        </Link>
      </div>
    </section>
  );
}
