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

      {/* ── Dashboard mockup ── */}
      <section className="bg-white py-20 md:py-28 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-10">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-amber-700 mb-4">
              Sample Output
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-black leading-tight mb-4">
              A ranked call list,
              <br />
              ready every Monday.
            </h2>
            <p className="text-gray-500 leading-relaxed">
              Each scored signal shows the decision-maker, their contact info,
              and the public record that triggered it. Highest-confidence leads
              first.
            </p>
          </div>

          {/* Dashboard frame */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Toolbar */}
            <div className="bg-gray-950 px-5 py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                </div>
                <span className="text-xs text-white/35 font-mono ml-2">rebbadvisors.com/dashboard</span>
              </div>
              <span className="text-xs font-semibold text-amber-400">
                Monday Digest · 14 signals this week
              </span>
            </div>

            {/* Column headers */}
            <div className="bg-gray-50 border-b border-gray-100 px-5 py-2.5 grid grid-cols-[56px_1fr_140px_120px_160px] gap-4 text-[10px] font-semibold uppercase tracking-widest text-gray-400 hidden md:grid">
              <span>Score</span>
              <span>Owner</span>
              <span>Signal</span>
              <span>Location</span>
              <span>Contact</span>
            </div>

            {/* Lead rows */}
            {[
              {
                score: 91,
                tag: "HOT",
                name: "Marcus T. Holloway",
                role: "Deed Grantee",
                event: "Property Transfer",
                valuation: "$1.4M",
                location: "1247 Pelham Rd",
                sublocation: "Greenville SC 29615",
                email: "m.holloway@midlandsdev.com",
                phone: "(864) 555-0182",
                status: "enriched",
              },
              {
                score: 84,
                tag: "HOT",
                name: "Jennifer R. Sikes",
                role: "Deed Grantee",
                event: "Mortgage Filing",
                valuation: "$680K",
                location: "329 Augusta Rd",
                sublocation: "Greenville SC 29605",
                email: "jsikes@trident-sc.com",
                phone: "(864) 555-0341",
                status: "enriched",
              },
              {
                score: 72,
                tag: "WARM",
                name: "Westside Holdings LLC",
                role: "LLC — Unresolved",
                event: "New Business Filing",
                valuation: "—",
                location: "Greenville County",
                sublocation: "SC SOS Filing",
                email: "—",
                phone: "(864) 555-0207",
                status: "pending",
              },
            ].map((lead) => (
              <div
                key={lead.name}
                className="border-b border-gray-100 last:border-0 px-5 py-4 grid md:grid-cols-[56px_1fr_140px_120px_160px] gap-4 items-start"
              >
                {/* Score */}
                <div className="flex flex-col items-center gap-1">
                  <span className={`text-xl font-bold leading-none ${
                    lead.tag === "HOT" ? "text-amber-500" : "text-gray-400"
                  }`}>
                    {lead.score}
                  </span>
                  <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${
                    lead.tag === "HOT"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    {lead.tag}
                  </span>
                </div>

                {/* Owner */}
                <div>
                  <p className="text-sm font-semibold text-black leading-snug">{lead.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{lead.role}</p>
                </div>

                {/* Signal */}
                <div>
                  <p className="text-xs font-medium text-gray-700">{lead.event}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{lead.valuation}</p>
                </div>

                {/* Location */}
                <div>
                  <p className="text-xs text-gray-700 leading-snug">{lead.location}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{lead.sublocation}</p>
                </div>

                {/* Contact */}
                <div className="space-y-1">
                  <p className={`text-xs font-mono leading-snug ${
                    lead.email === "—" ? "text-gray-300" : "text-gray-600"
                  }`}>
                    {lead.email}
                  </p>
                  <p className="text-xs text-gray-500 font-mono">{lead.phone}</p>
                  <span className={`inline-block text-[9px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded ${
                    lead.status === "enriched"
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {lead.status === "enriched" ? "Enriched" : "Pending review"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 mt-4 leading-relaxed">
            Illustrative sample — names, addresses, and contact fields reflect the real structure of output. Actual data is live Greenville County public records.
          </p>
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
