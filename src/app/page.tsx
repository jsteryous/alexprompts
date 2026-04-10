import Link from "next/link";
import LiveSignalFeed from "@/components/LiveSignalFeed";

export default function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="min-h-screen flex items-center bg-white pt-16">
        <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 mb-4">
                Greenville SC · Trade Contractors
              </span>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-black leading-[1.05] mb-6">
                We find the owner.
                <br />
                You make the sale.
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed mb-4">
                Every week, commercial properties sell in Greenville County. The buyer is almost always an LLC. We find the actual person behind it — name, phone, email — before your competitors even know the property changed hands.
              </p>
              <p className="text-base text-gray-500 leading-relaxed mb-10">
                Monday morning you get a ranked call list. Not a cold database. A short list of real people, with a reason to call each one.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 bg-black text-white text-base font-medium px-7 py-3.5 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Get Dashboard Access
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
                30-day money-back guarantee — one qualified lead or full refund.
              </p>
            </div>

            <LiveSignalFeed />
          </div>
        </div>
      </section>

      {/* ── Two Products ── */}
      <section className="bg-gray-950 text-white py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-16">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-500 mb-4">
              What We Build For You
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              Two tools.
              <br />
              One unfair advantage.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-white/10 rounded-2xl p-10 hover:border-green-500/30 transition-colors">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-6">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <circle cx="10" cy="8" r="3" stroke="#22c55e" strokeWidth="1.5" />
                  <path d="M4 20c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M18 10l1.5 1.5L22 9" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="text-xs font-semibold uppercase tracking-widest text-green-500 mb-3">01 · The Multiplier</div>
              <h3 className="text-2xl font-bold text-white mb-3">Get the cell behind the LLC</h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                That commercial building that just sold? It was bought by an LLC. We find the actual human behind it — name, cell, email — and put them on your call list. Every Monday, new targets.
              </p>
              <ul className="space-y-2">
                {[
                  "Greenville County property transfers, daily",
                  "Business filings and commercial permits",
                  "Real person. Real contact. Real reason to call.",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-white/10 rounded-2xl p-10 hover:border-green-500/30 transition-colors">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-6">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" stroke="#22c55e" strokeWidth="1.5" />
                  <path d="M8 10h8M8 14h5" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="text-xs font-semibold uppercase tracking-widest text-green-500 mb-3">02 · Company Brain</div>
              <h3 className="text-2xl font-bold text-white mb-3">Stop being your team&apos;s Google</h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                Your team calls you for everything. &ldquo;Did we quote this guy?&rdquo; &ldquo;What did we pay the roofer?&rdquo; We give you a private AI that reads your emails and notes — so your team asks it instead of you.
              </p>
              <ul className="space-y-2">
                {[
                  "Lives on your office computer. Completely private.",
                  "Knows your quotes, projects, and history",
                  "Your team gets answers. You stay on the job.",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── How LLC Piercing Works ── */}
      <section className="bg-white py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-16">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 mb-4">
              How It Works
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-black leading-tight">
              From public filing
              <br />
              to a name and number.
            </h2>
            <p className="mt-5 text-lg text-gray-500">
              The county records the sale. We do the detective work. You make the call.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                step: "01",
                title: "We watch every filing",
                body: "Property transfers, new business registrations, and commercial permits hit Greenville County records daily. We pull them the same morning.",
                icon: (
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="3" stroke="#22c55e" strokeWidth="1.5" />
                    <path d="M7 9h10M7 12h7M7 15h5" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "We unmask the LLC",
                body: "Most buyers hide behind an LLC name. We cross-reference tax records, state filings, and public data to surface the actual decision-maker — name, phone, email.",
                icon: (
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                    <circle cx="10" cy="8" r="3" stroke="#22c55e" strokeWidth="1.5" />
                    <path d="M4 20c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M18 10l1.5 1.5L22 9" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
              },
              {
                step: "03",
                title: "Monday: your call list",
                body: "Ranked by opportunity score. Each entry: person's name, what happened, why it matters for your trade, and how to reach them. You call. They weren't expecting anyone.",
                icon: (
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                    <rect x="5" y="2" width="14" height="20" rx="2" stroke="#22c55e" strokeWidth="1.5" />
                    <path d="M9 7h6M9 11h6M9 15h4" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="16" cy="17" r="1" fill="#22c55e" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-5">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-gray-950 rounded-2xl flex items-center justify-center">
                    {item.icon}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-green-600 tracking-widest uppercase mb-2">Step {item.step}</div>
                  <h3 className="text-lg font-bold text-black mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Window ── */}
      <section className="bg-gray-50 py-24 md:py-32 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 mb-4">
                The Window
              </span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-black leading-tight mb-5">
                There&apos;s a 48-hour gap
                <br />
                between a public filing
                <br />
                and a Google search.
              </h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                When a commercial property changes hands, the new owner spends the
                first week making decisions — vendors, contractors, service
                providers. They haven&apos;t put out a bid yet. They haven&apos;t
                posted on Angi. They&apos;re still in their own head.
              </p>
              <p className="text-gray-500 leading-relaxed">
                That window is exactly when you want to call. Not after they&apos;ve
                talked to five competitors. Not after they&apos;ve posted an RFP.
                Right now, while you&apos;re still the only voice in the room.
              </p>
            </div>
            <div className="space-y-4">
              {[
                {
                  label: "Day 0",
                  event: "Property transfer recorded at Register of Deeds",
                  status: "You know. Competitors don't.",
                  hot: true,
                },
                {
                  label: "Day 2–3",
                  event: "New owner starts calling vendors",
                  status: "You're already in conversation.",
                  hot: true,
                },
                {
                  label: "Day 7–14",
                  event: "Owner Googles \"commercial HVAC Greenville\"",
                  status: "10 competitors. Bidding war.",
                  hot: false,
                },
                {
                  label: "Day 21+",
                  event: "RFP posted to bid boards",
                  status: "Race to the bottom on price.",
                  hot: false,
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className={`border rounded-xl p-5 ${
                    row.hot
                      ? "border-green-200 bg-green-50"
                      : "border-gray-100 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div
                        className={`text-xs font-bold uppercase tracking-widest mb-1 ${
                          row.hot ? "text-green-600" : "text-gray-400"
                        }`}
                      >
                        {row.label}
                      </div>
                      <div className="text-sm font-semibold text-black mb-1">{row.event}</div>
                      <div className={`text-xs ${row.hot ? "text-green-600" : "text-gray-400"}`}>
                        {row.status}
                      </div>
                    </div>
                    {row.hot && (
                      <span className="flex-shrink-0 text-xs font-bold bg-green-500/20 text-green-700 px-2.5 py-1 rounded-full">
                        ACT NOW
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Dashboard Preview ── */}
      <section className="bg-white py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 mb-4">
                Your Dashboard
              </span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-black leading-tight mb-5">
                &ldquo;Who do I call
                <br />
                this week to
                <br />
                make money?&rdquo;
              </h2>
              <p className="text-lg text-gray-500 leading-relaxed mb-4">
                Answered every Monday morning. Ranked by opportunity. Each entry shows you who just became a qualified prospect — and exactly why.
              </p>
              <p className="text-base text-gray-500 leading-relaxed mb-8">
                Not a cold database. Not a lead form submission. Real economic events that just happened in your service area, matched to a real person you can call today.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-black text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-gray-800 transition-colors"
              >
                Get Dashboard Access
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Dashboard mockup */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-950">
                <div>
                  <div className="text-sm font-semibold text-white">Weekly Intelligence Report</div>
                  <div className="text-xs text-gray-500 mt-0.5">Greenville County · Week of Apr 7, 2026</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-semibold text-green-400">LIVE</span>
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {[
                  {
                    priority: "1",
                    name: "Marcus Trent",
                    company: "Verdmont Properties LLC",
                    trigger: "Commercial transfer · 7842 Augusta Rd",
                    note: "No HVAC vendor on file. 4,200 sqft.",
                    score: "98",
                    tag: "HOT",
                    contact: "(864) 555-0192",
                  },
                  {
                    priority: "2",
                    name: "Sarah Kim",
                    company: "Greenville Logistics LLC",
                    trigger: "New business filing · Industrial",
                    note: "Warehouse operator. Electrical + HVAC needs.",
                    score: "91",
                    tag: "HOT",
                    contact: "(864) 555-0347",
                  },
                  {
                    priority: "3",
                    name: "David Okafor",
                    company: "1204 Laurens Rd Holdings",
                    trigger: "Industrial permit · Phase 2 renovation",
                    note: "$280K scope. Subcontractors needed.",
                    score: "84",
                    tag: "WARM",
                    contact: "dokafor@laurensrd.com",
                  },
                ].map((row) => (
                  <div key={row.priority} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-green-700">#{row.priority}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <div className="text-sm font-bold text-black">{row.name}</div>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${row.tag === "HOT" ? "bg-red-50 text-red-600" : "bg-yellow-50 text-yellow-700"}`}>
                            {row.tag}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mb-1">{row.company}</div>
                        <div className="text-xs text-green-700 mb-1">{row.trigger}</div>
                        <div className="text-xs text-gray-500 mb-2">{row.note}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {row.contact}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-bold text-black">{row.score}</div>
                        <div className="text-xs text-gray-400">score</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">6 more leads in full report</span>
                <span className="text-xs font-semibold text-green-600">View all →</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Company Brain ── */}
      <section className="bg-gray-950 text-white py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Chat mockup */}
            <div className="bg-gray-900 rounded-2xl border border-white/10 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" stroke="black" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Company Brain</div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-xs text-gray-400">Online · knows your business</span>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-4">
                {[
                  { from: "team", text: "Did Leslie Circle get the certificate of occupancy?" },
                  { from: "ai", text: "Yes — CO issued March 14th. Final punch list cleared by Mike on the 12th. Owner signed off same day." },
                  { from: "team", text: "What did we pay the roofer last month?" },
                  { from: "ai", text: "$4,200 to Peak Roofing on March 28th. Invoice #2847. Paid via check." },
                  { from: "team", text: "Has anyone followed up with the Garlington Rd quote?" },
                  { from: "ai", text: "Not yet. Quote sent Feb 9th — $18,400 for full HVAC install. No reply on file. Want me to draft a follow-up?" },
                ].map((msg, i) => (
                  <div key={i} className={`flex ${msg.from === "team" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.from === "team"
                        ? "bg-white/10 text-gray-200 rounded-tr-sm"
                        : "bg-green-500/10 border border-green-500/20 text-gray-300 rounded-tl-sm"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Copy */}
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-500 mb-4">
                Company Brain
              </span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5">
                Stop being your
                <br />
                team&apos;s Google.
              </h2>
              <p className="text-lg text-gray-400 leading-relaxed mb-5">
                Your team interrupts you all day for answers that already exist somewhere — in your email, your notes, your old quotes. Every call costs you focus time you don&apos;t have.
              </p>
              <p className="text-base text-gray-400 leading-relaxed mb-8">
                We set up a private AI that lives on your office computer. It reads your emails and project notes so it knows what you know. Your team stops calling you. You stop losing hours to questions that have already been answered.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "100% private — all data stays on your machine",
                  "Reads your emails, quotes, and job notes automatically",
                  "Your team gets instant answers. You stay on the job.",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-400">
                    <span className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-green-500 text-black font-semibold px-7 py-3.5 rounded-xl hover:bg-green-400 transition-colors"
              >
                Get Dashboard Access
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── The Offer ── */}
      <section className="bg-white py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 mb-4">
                The Offer
              </span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-black leading-tight mb-5">
                30-Day Risk-Free
                <br />
                Revenue Sprint
              </h2>
              <p className="text-lg text-gray-500 leading-relaxed mb-4">
                Get dashboard access. See live Greenville County data. Get your first ranked call list within the week.
              </p>
              <p className="text-base text-gray-500 leading-relaxed mb-8">
                One real lead you wouldn&apos;t have found otherwise within 30 days — or full refund. No case to make.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-green-500 text-black font-semibold px-7 py-3.5 rounded-xl hover:bg-green-400 transition-colors"
              >
                Get Dashboard Access
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <p className="text-xs text-gray-400 mt-4">No long-term contract · Cancel anytime</p>
            </div>

            <div className="space-y-4">
              {[
                {
                  title: "Weekly call list, every Monday",
                  body: "Ranked by opportunity score. Real names, real contacts, real reasons to call. Pulled from live Greenville County public records.",
                },
                {
                  title: "LLC unmasked — human decision-maker found",
                  body: "We don't hand you an LLC name and call it a lead. We find the actual owner and put their contact info in your dashboard.",
                },
                {
                  title: "Company Brain — your team stops calling you",
                  body: "Private AI that knows your emails, quotes, and project history. Your team gets answers instantly. You get your time back.",
                },
                {
                  title: "30-day money-back guarantee",
                  body: "One real lead you wouldn't have found otherwise. Or full refund. No questions.",
                },
              ].map((item) => (
                <div key={item.title} className="border border-gray-100 rounded-xl p-6 hover:border-gray-200 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-black mb-1">{item.title}</div>
                      <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-black py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
            Stop competing.
            <br />
            Start winning first.
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Book a 30-minute call. We&apos;ll pull live Greenville County data on the call and show you exactly who&apos;s in your area right now.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-green-500 text-black font-semibold text-base px-8 py-4 rounded-xl hover:bg-green-400 transition-colors"
          >
            Get Dashboard Access
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
