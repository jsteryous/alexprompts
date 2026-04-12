import Link from "next/link";
import CompanyBrainDemo from "@/components/CompanyBrainDemo";

const painPoints = [
  "Your estimator asks if a quote was already sent.",
  "Your PM asks what got promised on a job.",
  "Your office asks where an invoice or CO lives.",
  "Everyone asks you because you're still the system.",
];

const setupSteps = [
  {
    step: "01",
    title: "Map the knowledge mess",
    body: "We find where answers live now — inboxes, folders, estimates, notes, vendor docs, and the owner's memory.",
  },
  {
    step: "02",
    title: "Build the first version",
    body: "We structure a private Company Brain around the internal questions that cause real drag, not around generic AI demos.",
  },
  {
    step: "03",
    title: "Train and tune",
    body: "We pressure-test it with real team questions, improve weak spots, and make it something people actually use.",
  },
];

const fitPoints = [
  "5–25 person HVAC, plumbing, electrical, roofing, GC, or similar service teams",
  "Owner still answers routine operational questions most days",
  "Knowledge spread across email, notes, shared drives, and job folders",
  "Need faster onboarding, fewer interruptions, and more durable company memory",
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-white pt-24 md:pt-32">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="grid lg:grid-cols-[1.2fr,0.8fr] gap-14 items-start">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-green-700 mb-5">
                Greenville SC — Owner-Led Service Businesses
              </span>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-black leading-[1.02] mb-6">
                Stop being
                <br />
                your company&apos;s
                <br />
                search bar.
              </h1>
              <p className="text-lg text-gray-700 leading-relaxed mb-4 max-w-2xl">
                Your team gets answers in seconds. You get pulled in for
                judgment calls, not routine lookups.
              </p>
              <p className="text-base text-gray-500 leading-relaxed mb-10 max-w-2xl">
                Company Brain is a private AI system built from your actual
                company documents — quotes, job notes, emails, and SOPs.
                Private by default. No training on your data.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 bg-black text-white text-base font-medium px-7 py-3.5 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Book a Setup Call
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
              <p className="text-xs text-gray-400">
                High-touch setup. Built for teams that already have too much
                context trapped in too many places.
              </p>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-3xl p-8 md:p-10">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                    Typical Week
                  </p>
                  <h2 className="text-2xl font-bold text-black mt-2">
                    The owner is still the system.
                  </h2>
                </div>
                <span className="text-xs font-bold bg-green-100 text-green-800 px-3 py-1 rounded-full">
                  Common Pain
                </span>
              </div>
              <div className="space-y-3">
                {painPoints.map((item) => (
                  <div
                    key={item}
                    className="bg-white border border-stone-200 rounded-2xl px-4 py-4 text-sm text-gray-600 leading-relaxed"
                  >
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-stone-200">
                <p className="text-sm text-gray-500 leading-relaxed">
                  Most first engagements complete in under 30 days. The team
                  gets a trusted place to check first — the owner gets their
                  time back.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Brain demo */}
      <section className="bg-gray-950 text-white py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-[0.95fr,1.05fr] gap-16 items-start">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-green-500 mb-4">
                How It Works
              </span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5">
                Your company
                <br />
                already knows
                <br />
                the answer.
              </h2>
              <p className="text-gray-400 leading-relaxed text-lg mb-4">
                Every quote, email, job note, and vendor call holds context
                your team needs daily. Company Brain reads it all, connects
                the dots, and answers questions with citations back to the
                source.
              </p>
              <p className="text-gray-500 leading-relaxed mb-8">
                The more you feed it, the sharper it gets. Knowledge
                compounds instead of disappearing across inboxes and
                turnover.
              </p>
              <ul className="space-y-2.5">
                {[
                  "Email threads and attachments",
                  "Quotes, invoices, and job notes",
                  "Shared drives and SOPs",
                  "Vendor docs and call notes",
                  "Owner tribal knowledge — written down once",
                ].map((s) => (
                  <li key={s} className="flex items-center gap-3 text-sm text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <CompanyBrainDemo />
          </div>
        </div>
      </section>

      {/* Setup process */}
      <section className="bg-white py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-[0.9fr,1.1fr] gap-16 items-start">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-green-700 mb-4">
                Setup Process
              </span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-black leading-tight mb-5">
                Ready in weeks.
                <br />
                Built around how
                <br />
                you actually work.
              </h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                Not a login we throw over the fence. The first version is
                scoped around real questions, connected to real sources, and
                tuned with the people who need it most.
              </p>
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-2 bg-black text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-gray-800 transition-colors"
              >
                See The Full Process
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            <div className="space-y-4">
              {setupSteps.map((item) => (
                <div key={item.step} className="border border-gray-100 rounded-2xl p-7">
                  <div className="text-xs font-semibold text-gray-300 mb-3">{item.step}</div>
                  <h3 className="text-xl font-bold text-black mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Best fit */}
      <section className="bg-gray-50 py-24 md:py-32 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-[0.9fr,1.1fr] gap-16 items-start">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-green-700 mb-4">
                Best Fit
              </span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-black leading-tight mb-5">
                Built for the company
                <br />
                that keeps asking
                <br />
                the owner.
              </h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                If the owner is still the fastest path to any answer, and the
                team has grown complex enough that this creates real drag —
                that&apos;s who this is built for.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-black text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-gray-800 transition-colors"
              >
                See If You Fit
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {fitPoints.map((item) => (
                <div key={item} className="bg-white border border-gray-200 rounded-2xl p-5 text-sm text-gray-600 leading-relaxed">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Data security — trust checkpoint before CTA */}
      <section className="bg-white py-24 md:py-32 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-16">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-green-700 mb-4">
              Data Security
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-black leading-tight mb-5">
              Your documents
              <br />
              aren&apos;t for training
              <br />
              someone else&apos;s AI.
            </h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              Most AI tools are consumer products. Uploading your quotes,
              contracts, and job history to them carries real risks that most
              business owners don&apos;t read the fine print on.
            </p>
            <div className="space-y-3">
              {[
                {
                  label: "Your data may train the model.",
                  body: "Consumer AI tools — ChatGPT, Claude.ai free and paid plans — can use your inputs to improve future versions of the model. Your pricing, customer details, and internal processes become part of the training set.",
                },
                {
                  label: "Retention isn't guaranteed.",
                  body: "Consumer products have no committed deletion timeline. Your documents sit on third-party servers indefinitely unless you manually request removal — and even then it isn't always clean.",
                },
                {
                  label: "\"Private\" doesn't mean no one sees it.",
                  body: "AI providers reserve the right to review conversations for safety and trust purposes. Sensitive contracts, proformas, or personnel notes have no privilege protections once uploaded.",
                },
              ].map((item) => (
                <div key={item.label} className="border border-gray-100 rounded-2xl p-6">
                  <p className="text-sm font-semibold text-black mb-1">{item.label}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                tag: "Maximum Privacy",
                title: "Air-Gapped",
                subtitle: "Nothing leaves your building.",
                body: "The AI model runs entirely on your hardware using open-source models. No data ever touches an external server. Best fit for regulated industries or highly sensitive documents.",
                tradeoff: "Tradeoff: lower model quality than cloud AI.",
                accent: "bg-gray-950 text-white",
                tagStyle: "bg-white/10 text-gray-300",
                bodyStyle: "text-gray-400",
                tradeoffStyle: "text-gray-600",
              },
              {
                tag: "REBB Default",
                title: "API — Secure by Design",
                subtitle: "Commercial-grade. Not the consumer chatbot.",
                body: "We use Claude's commercial API — a contractually different product from Claude.ai. By default: your data is never used to train the model, retained for 7 days only, then deleted. No opting in required.",
                tradeoff: "Best quality. Contractually clean. This is what we recommend for most clients.",
                accent: "bg-green-950 text-white",
                tagStyle: "bg-green-500/20 text-green-400",
                bodyStyle: "text-gray-400",
                tradeoffStyle: "text-green-500",
              },
              {
                tag: "Middle Ground",
                title: "Hybrid",
                subtitle: "Docs local. Queries go out, not documents.",
                body: "Your source documents stay on your machine or internal network. When someone asks a question, only the question and the matched excerpt — not the full file — are sent to the API.",
                tradeoff: "Best of both: local control with full model quality.",
                accent: "bg-gray-950 text-white",
                tagStyle: "bg-white/10 text-gray-300",
                bodyStyle: "text-gray-400",
                tradeoffStyle: "text-gray-400",
              },
            ].map((card) => (
              <div key={card.title} className={`${card.accent} rounded-2xl p-7 flex flex-col`}>
                <span className={`inline-block text-xs font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full mb-5 self-start ${card.tagStyle}`}>
                  {card.tag}
                </span>
                <h3 className="text-xl font-bold mb-1">{card.title}</h3>
                <p className="text-sm font-medium text-gray-300 mb-4">{card.subtitle}</p>
                <p className={`text-sm leading-relaxed mb-5 flex-1 ${card.bodyStyle}`}>{card.body}</p>
                <p className={`text-xs leading-relaxed border-t border-white/10 pt-4 ${card.tradeoffStyle}`}>{card.tradeoff}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-white py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-gray-400 mb-4">
              Primary Next Step
            </span>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-black mb-6 leading-tight">
              Your team is still
              <br />
              calling the owner.
              <br />
              Let&apos;s fix that.
            </h2>
            <p className="text-lg md:text-xl text-gray-500 mb-10 leading-relaxed">
              We map the knowledge mess, build the first usable version, and
              tune it until the team asks the system before they ask you.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-black text-white font-semibold text-base px-8 py-4 rounded-xl hover:bg-gray-800 transition-colors"
            >
              Book a Setup Call
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
