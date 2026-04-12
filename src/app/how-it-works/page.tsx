import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How It Works - Company Brain Setup - REBB Advisors",
  description:
    "See how REBB sets up a private Company Brain for owner-led service businesses in Greenville and Upstate SC, from knowledge mapping through rollout and tuning.",
  openGraph: {
    title: "How It Works - Company Brain Setup - REBB Advisors",
    description:
      "A hands-on setup process for private company knowledge systems built around the way your team already works.",
    type: "website",
    url: "https://rebbadvisors.com/how-it-works",
  },
  alternates: { canonical: "https://rebbadvisors.com/how-it-works" },
};

const phases = [
  {
    step: "01",
    label: "Map the mess",
    timing: "Week 1",
    title: "We find where the answers already live.",
    body: "We start with the actual places your team pulls context from now: inboxes, shared drives, estimates, job notes, SOPs, vendor files, and the owner.",
    bullets: [
      "Inventory the sources worth trusting",
      "Identify who gets interrupted most",
      "Surface the repeat internal questions",
    ],
  },
  {
    step: "02",
    label: "Build the first version",
    timing: "Week 1",
    title: "We structure a useful Company Brain first, not a software demo.",
    body: "The first version is built around the questions that cause real drag. We connect the right context, shape the retrieval flow, and keep the scope grounded.",
    bullets: [
      "Set up the core source set",
      "Define the first workflows to support",
      "Keep it private and company-specific",
    ],
  },
  {
    step: "03",
    label: "Pressure test it",
    timing: "Week 2",
    title: "We test it against the questions your team already asks.",
    body: "Before wider rollout, we use real company questions to see where the system is strong, where retrieval is thin, and where the owner still needs to stay in the loop.",
    bullets: [
      "Run real office, PM, and field questions",
      "Tighten weak answers and missing sources",
      "Define what should escalate to the owner",
    ],
  },
  {
    step: "04",
    label: "Roll out and tune",
    timing: "First 30 days",
    title: "We turn it into a working habit for the team.",
    body: "The goal is not installation alone. The goal is that the team asks the system first, trusts the answers when appropriate, and stops routing every lookup through the owner.",
    bullets: [
      "Train the people who use it most",
      "Tune around recurring friction",
      "Improve adoption with source-backed answers",
    ],
  },
];

const deliverables = [
  {
    title: "Knowledge map",
    body: "A practical view of where company answers live now and which sources are worth feeding into the system first.",
  },
  {
    title: "First-use workflows",
    body: "A clear starting scope for the questions that matter most, like quotes, promises, documents, job context, and handoffs.",
  },
  {
    title: "Private setup",
    body: "A company-specific internal system designed for operational retrieval, not generic AI theater or public-facing content.",
  },
  {
    title: "Tuning window",
    body: "Hands-on refinement after rollout so the first version gets better from actual usage instead of staying static.",
  },
];

const fitPoints = [
  "5-25 person HVAC, plumbing, electrical, roofing, GC, or similar service teams",
  "Owner still answers routine internal questions most days",
  "Knowledge spread across email, notes, shared drives, and job folders",
  "Team loses time re-checking promises, documents, and prior decisions",
];

const nonFitPoints = [
  "A generic chatbot widget for the website",
  "A broad AI consulting engagement with no clear workflow target",
  "A polished self-serve SaaS platform handed over on day one",
  "A replacement for owner judgment on edge cases and exceptions",
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="bg-white pt-32 pb-18 md:pt-40 md:pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-[1.15fr,0.85fr] gap-14 items-start">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-green-700 mb-5">
                Company Brain Setup
              </span>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-black leading-[1.02] mb-6">
                How REBB installs
                <br />
                a working Company Brain
                <br />
                around your team.
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed mb-4 max-w-2xl">
                This is a hands-on setup process for owner-led service businesses
                where the answers already exist, but the team still has to call
                the owner to find them.
              </p>
              <p className="text-base text-gray-500 leading-relaxed mb-10 max-w-2xl">
                We map the knowledge mess, build a first usable version, test it
                against real company questions, and tune it until the team can ask
                the system first.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 bg-black text-white text-base font-medium px-7 py-3.5 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Book a Setup Call
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center text-base font-medium text-gray-600 px-7 py-3.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:text-black transition-colors"
                >
                  See If You Fit
                </Link>
              </div>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-3xl p-8 md:p-10">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                    Typical Engagement
                  </p>
                  <h2 className="text-2xl font-bold text-black mt-2">
                    First usable system in weeks, then tune it.
                  </h2>
                </div>
                <span className="text-xs font-bold bg-green-100 text-green-800 px-3 py-1 rounded-full">
                  High Touch
                </span>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  "Week 1: map sources and recurring questions",
                  "Week 1: build the first retrieval structure",
                  "Week 2: test against real internal requests",
                  "First 30 days: train, refine, and improve trust",
                ].map((item) => (
                  <div
                    key={item}
                    className="bg-white border border-stone-200 rounded-2xl px-4 py-4 text-sm text-gray-600 leading-relaxed"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-stone-200">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 mb-3">
                  Main Outcome
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  The team gets a trusted internal place to check first, while the
                  owner gets pulled in for judgment calls instead of routine lookups.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-950 text-white py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-green-500 mb-4">
                What This Is
              </span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5">
                A setup service for
                <br />
                company memory,
                <br />
                not generic AI advice.
              </h2>
              <p className="text-gray-400 leading-relaxed text-lg mb-6">
                Your job management software tracks jobs. Your shared drive
                stores files. Neither one answers a question. Company Brain
                reads the documents your company already has — emails, quotes,
                notes, vendor files — and makes them queryable without asking
                anyone to change how they work.
              </p>
              <p className="text-gray-400 leading-relaxed">
                The knowledge is already there. It&apos;s just trapped. REBB does
                the hard work of pulling it out, structuring it, and making it
                something the team actually uses.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="border border-white/10 rounded-2xl p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-500 mb-4">
                  Strong Fit
                </p>
                <ul className="space-y-3 text-sm text-gray-300">
                  {fitPoints.map((item) => (
                    <li key={item} className="leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border border-white/10 rounded-2xl p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300 mb-4">
                  Not The Offer
                </p>
                <ul className="space-y-3 text-sm text-gray-400">
                  {nonFitPoints.map((item) => (
                    <li key={item} className="leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-14">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-green-700 mb-4">
              The Process
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-black leading-tight mb-5">
              Four phases from
              <br />
              knowledge sprawl
              <br />
              to working usage.
            </h2>
            <p className="text-lg text-gray-500 leading-relaxed">
              The point is not to ship a clever interface. The point is to make
              routine internal retrieval faster, calmer, and less dependent on one
              person.
            </p>
          </div>

          <div className="space-y-6">
            {phases.map((phase) => (
              <div
                key={phase.step}
                className="grid lg:grid-cols-[140px,1fr,320px] gap-6 border border-gray-100 rounded-3xl p-8 md:p-10"
              >
                <div>
                  <div className="text-xs font-semibold text-gray-300 mb-2">{phase.step}</div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-green-700">
                    {phase.label}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 mb-3">
                    {phase.timing}
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-3 leading-tight">
                    {phase.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed">{phase.body}</p>
                </div>

                <ul className="space-y-3">
                  {phase.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span className="text-sm text-gray-600 leading-relaxed">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-20 md:py-28 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-[0.9fr,1.1fr] gap-16 items-start">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-green-700 mb-4">
                What You Get
              </span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-black leading-tight mb-5">
                The first deliverable
                <br />
                is a usable internal
                <br />
                retrieval system.
              </h2>
              <p className="text-gray-500 leading-relaxed">
                Not a vague strategy deck. Not a pile of prompts. Not a generic AI
                rollout plan. The goal is a first version your team can actually
                use and improve.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {deliverables.map((item) => (
                <div key={item.title} className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-black mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="border border-gray-100 rounded-3xl p-8 md:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-400 mb-4">
                Before
              </p>
              <h2 className="text-2xl font-bold text-black mb-4">
                The owner is still the company&apos;s search bar.
              </h2>
              <ul className="space-y-3 text-sm text-gray-500">
                <li>Key person leaves — pricing logic, vendor context, and job history go with them</li>
                <li>Answers trapped in inboxes, folders, and the owner&apos;s memory</li>
                <li>Constant interruptions for questions that have already been answered a hundred times</li>
                <li>Slow onboarding because everything useful lives in people, not somewhere findable</li>
              </ul>
            </div>

            <div className="border border-green-200 bg-green-50 rounded-3xl p-8 md:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-700 mb-4">
                After
              </p>
              <h2 className="text-2xl font-bold text-black mb-4">
                The team checks the system before it checks the owner.
              </h2>
              <ul className="space-y-3 text-sm text-gray-700">
                <li>When a key person leaves, the knowledge stays</li>
                <li>New hires get up to speed faster because context is findable</li>
                <li>The owner gets pulled into judgment calls, not routine lookups</li>
                <li>The company can grow without proportionally growing the owner&apos;s workload</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-amber-50 border-y border-amber-200 py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-amber-700 mb-4">
              Beta Initiative
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-black leading-tight mb-4">
              LLC Owner Finder is separate and still experimental.
            </h2>
            <p className="text-gray-600 leading-relaxed">
              The public-record lead workflow can be discussed as an early-access
              beta, but it is not the main offer on this page. Company Brain setup
              is the core service. LLC Owner Finder remains a lower-risk pilot
              conversation while the workflow matures.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-black py-24 md:py-28">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Want to see if your team is a fit?
            </h2>
            <p className="text-gray-400">
              We&apos;ll look at where answers live now, what your team keeps asking,
              and whether a Company Brain setup would solve a real operational
              bottleneck.
            </p>
          </div>
          <Link
            href="/contact"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-green-500 text-black font-semibold px-7 py-3.5 rounded-xl hover:bg-green-400 transition-colors"
          >
            Book a Setup Call
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
