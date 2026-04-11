import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "LLC Owner Finder Beta - REBB Advisors",
  description:
    "LLC Owner Finder is REBB's early-access beta for resolving Greenville-area public records into usable contractor outreach signals. Experimental, hands-on, and still being refined.",
  openGraph: {
    title: "LLC Owner Finder Beta - REBB Advisors",
    description:
      "An experimental early-access workflow for turning public records into contractor outreach signals before buyers start searching.",
    type: "website",
    url: "https://rebbadvisors.com/lead-intelligence",
  },
  alternates: { canonical: "https://rebbadvisors.com/lead-intelligence" },
};

export default function LeadIntelligencePage() {
  return (
    <>
      <section className="bg-white pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-amber-700 mb-4">
            LLC Owner Finder — Early Access
          </span>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-black mb-5 leading-tight">
            We find the owner.
            <br />
            You make the sale.
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
            Daily sync of Greenville County property transfers, SOS filings,
            and mortgage records. We unmask the LLC to surface the
            decision-maker — name, phone, email — before they start shopping
            around.
          </p>
        </div>
      </section>

      <section className="bg-gray-950 text-white py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-amber-400 mb-4">
                Why It Exists
              </span>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-5">
                The window is open
                <br />
                before they start
                <br />
                calling around.
              </h2>
              <p className="text-gray-400 leading-relaxed mb-6">
                When commercial property changes hands, a new LLC files, or a
                mortgage closes — there&apos;s a short window where vendor
                decisions haven&apos;t been made yet. No one&apos;s been called.
                No one&apos;s been hired.
              </p>
              <p className="text-gray-400 leading-relaxed">
                LLC Owner Finder surfaces that moment: the owner, their contact
                info, and the signal — before the rest of the market catches up.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  label: "Day 0",
                  event: "Public filing lands",
                  status: "A transfer, filing, or permit creates a signal.",
                  hot: true,
                },
                {
                  label: "Day 2-3",
                  event: "Owner starts planning work",
                  status: "Vendor decisions may still be wide open.",
                  hot: true,
                },
                {
                  label: "Day 7+",
                  event: "Owner starts searching or calling around",
                  status: "Competition rises fast.",
                  hot: false,
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className={`border rounded-xl p-5 ${
                    row.hot ? "border-amber-500/30 bg-amber-500/5" : "border-white/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div
                        className={`text-xs font-bold uppercase tracking-widest mb-1 ${
                          row.hot ? "text-amber-400" : "text-gray-500"
                        }`}
                      >
                        {row.label}
                      </div>
                      <div className="text-sm font-semibold text-white mb-1">{row.event}</div>
                      <div className={`text-xs ${row.hot ? "text-amber-300" : "text-gray-500"}`}>
                        {row.status}
                      </div>
                    </div>
                    {row.hot && (
                      <span className="flex-shrink-0 text-xs font-bold bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full">
                        WINDOW OPEN
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-14">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-amber-700 mb-4">
              Where It Stands
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-black leading-tight">
              Working pipeline.
              <br />
              Still sharpening the output.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-gray-100 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-black mb-4">What is working</h3>
              <ul className="space-y-3 text-sm text-gray-500">
                <li>We can pull live public-record signals from multiple sources.</li>
                <li>We can often identify useful commercial events before normal search behavior catches up.</li>
                <li>The workflow can surface real outreach opportunities in the right circumstances.</li>
              </ul>
            </div>

            <div className="border border-gray-100 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-black mb-4">What is still being refined</h3>
              <ul className="space-y-3 text-sm text-gray-500">
                <li>Consistent LLC-to-person resolution quality.</li>
                <li>Contact accuracy and confidence on every record.</li>
                <li>Clean delivery and productized reporting instead of hands-on review.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-20 md:py-28 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-amber-700 mb-4">
                How Beta Access Works
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-black leading-tight mb-5">
                This is a hands-on pilot,
                <br />
                not a polished SaaS.
              </h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                If we discuss LLC Owner Finder with a prospect, the framing needs
                to stay honest: this is an early-access workflow for testing fit,
                not a finished dashboard product with guaranteed clean outputs.
              </p>
              <p className="text-gray-500 leading-relaxed">
                The right beta users are trades or service businesses that
                understand the opportunity, can tolerate iteration, and are open
                to a manual or concierge-style delivery while the process improves.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  title: "Limited fit conversations",
                  body: "We only discuss the beta with businesses where the territory, trade, and sales motion make sense.",
                },
                {
                  title: "Expectation-setting first",
                  body: "We are explicit that signal quality, contact quality, and delivery format are still being refined.",
                },
                {
                  title: "Manual review where needed",
                  body: "The process may involve human review and judgment instead of a fully polished feed.",
                },
                {
                  title: "Learning-focused delivery",
                  body: "The purpose of beta access is to prove value and improve the workflow, not pretend it is already finished.",
                },
              ].map((item) => (
                <div key={item.title} className="bg-white border border-gray-200 rounded-2xl p-6">
                  <div className="text-sm font-semibold text-black mb-1">{item.title}</div>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-14">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-amber-700 mb-4">
              Role In The Business
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-black leading-tight">
              Company Brain is the core offer.
              <br />
              LLC Owner Finder is the experiment.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="border border-gray-100 rounded-2xl p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-green-700 mb-4">
                Core Offer
              </p>
              <h3 className="text-xl font-bold text-black mb-3">Company Brain Setup</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                A private operational knowledge system for owner-led service
                businesses that need better internal retrieval, fewer
                interruptions, and more durable company memory.
              </p>
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800 transition-colors"
              >
                See the main setup process
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            <div className="border border-amber-200 bg-amber-50 rounded-2xl p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-700 mb-4">
                Beta Initiative
              </p>
              <h3 className="text-xl font-bold text-black mb-3">LLC Owner Finder</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                An early-access public-record signal workflow with real promise,
                but still too experimental to position as a polished flagship
                product.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                We discuss it selectively and honestly with prospects who are a
                credible fit for beta participation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-950 py-24">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Want to discuss the beta honestly?
            </h2>
            <p className="text-gray-400">
              We can talk through fit, current limitations, and whether early
              access makes sense for your trade and territory.
            </p>
          </div>
          <Link
            href="/contact"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-amber-400 text-black font-semibold px-7 py-3.5 rounded-xl hover:bg-amber-300 transition-colors"
          >
            Ask About Beta Access
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
