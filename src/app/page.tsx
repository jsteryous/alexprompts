import Link from "next/link";
import LiveSignalFeed from "@/components/LiveSignalFeed";
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
              <p className="text-lg text-gray-600 leading-relaxed mb-4 max-w-2xl">
                Every quote you sent, every promise you made, every job
                decision — it&apos;s somewhere in your inbox, your notes, or your
                memory. Company Brain finds it.
              </p>
              <p className="text-base text-gray-500 leading-relaxed mb-10 max-w-2xl">
                Your team gets answers in seconds. You get pulled in for
                judgment calls, not routine lookups.
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
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center justify-center text-base font-medium text-gray-600 px-7 py-3.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:text-black transition-colors"
                >
                  See How It Works
                </Link>
              </div>
              <p className="text-xs text-gray-400">
                High-touch setup. Private by default. Built for teams that
                already have too much context trapped in too many places.
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
                  Company Brain gives the team a trusted place to ask first,
                  so you get pulled in for exceptions instead of routine
                  lookups.
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
                How It Lands
              </span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-black leading-tight mb-5">
                Hands-on setup,
                <br />
                grounded in your
                <br />
                actual workflow.
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
                The best first clients are owner-led service businesses with
                enough team complexity to feel the pain, but not enough
                process maturity to have solved it cleanly.
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

      {/* LLC Owner Finder + final CTA */}
      <section className="bg-white py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="border border-amber-200 bg-amber-50 rounded-3xl p-8 md:p-10 mb-12">
            <div className="grid lg:grid-cols-[0.9fr,1.1fr] gap-12 items-start">
              <div>
                <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-amber-700 mb-4">
                  LLC Owner Finder — Early Access
                </span>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-black leading-tight mb-5">
                  We find the owner.
                  <br />
                  You make the sale.
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Daily sync of Greenville County property transfers, SOS
                  filings, and mortgage records. We unmask the LLC to surface
                  the decision-maker — name, phone, email — before they start
                  shopping around.
                </p>
                <p className="text-gray-500 leading-relaxed mb-8 text-sm">
                  This is an early-access workflow we&apos;re actively refining.
                  Right trades, right territory, right timing.
                </p>
                <Link
                  href="/lead-intelligence"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-amber-700 hover:text-amber-800 transition-colors"
                >
                  See How It Works
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>

              <div>
                <LiveSignalFeed />
              </div>
            </div>
          </div>

          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-gray-400 mb-4">
              Primary Next Step
            </span>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-black mb-6 leading-tight">
              Your business already
              <br />
              knows the answer.
            </h2>
            <p className="text-lg md:text-xl text-gray-500 mb-10 leading-relaxed">
              We help your team find it without pulling the owner into every
              routine question.
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
