import Link from "next/link";

export default function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="min-h-screen flex items-center bg-white pt-16">
        <div className="max-w-6xl mx-auto px-6 py-28 md:py-36">
          <div className="max-w-3xl">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 mb-6">
              Lead Automation for Local Service Businesses
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-black leading-[1.05] mb-6">
              Stop Losing
              <br />
              Leads.
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 leading-relaxed max-w-xl mb-10">
              We install systems that respond instantly and follow up until the
              job is booked.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-black text-white text-base font-medium px-7 py-3.5 rounded-xl hover:bg-gray-800 transition-colors"
              >
                Get More Jobs
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
          </div>
        </div>
      </section>

      {/* ── Problem ── */}
      <section className="bg-gray-950 text-white py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-16">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-500 mb-4">
              The Problem
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              Every missed call is a job booked by your competitor.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-white/10 rounded-2xl overflow-hidden">
            {[
              {
                stat: "62%",
                title: "of calls go unanswered",
                body: "Most service businesses miss more than half their inbound calls. Each one is a potential $500–$5,000 job walking out the door.",
              },
              {
                stat: "30 min",
                title: "average response time",
                body: "The average business takes 30 minutes to respond to a web lead. Studies show response within 5 minutes increases conversion by 100x.",
              },
              {
                stat: "0",
                title: "follow-ups sent",
                body: "Most businesses send one message, hear nothing back, and move on. Deals are closed on the 5th–12th follow-up. You're not sending them.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-gray-950 p-8 md:p-10">
                <div className="text-4xl font-bold text-green-400 mb-3">{item.stat}</div>
                <div className="text-base font-semibold text-white mb-3">{item.title}</div>
                <p className="text-sm text-gray-400 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Solution ── */}
      <section className="bg-white py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-16">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 mb-4">
              The Fix
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-black leading-tight">
              A system that never sleeps, never forgets, and always follows up.
            </h2>
            <p className="mt-5 text-lg text-gray-500 leading-relaxed">
              We build and install a done-for-you automation layer on top of your
              existing business. When a lead comes in—call, text, web form—your
              system responds in seconds and follows up until they book.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                label: "Instant Response",
                title: "First contact in under 60 seconds",
                body: "Every new lead gets an immediate, personalized text or email the moment they reach out. No more \"I'll call them back later.\"",
                icon: (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
              },
              {
                label: "Automated Follow-Up",
                title: "Persistent follow-up without the manual work",
                body: "Multi-step sequences that text, email, and re-engage cold leads over days and weeks. Set it once. Run forever.",
                icon: (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ),
              },
              {
                label: "Lead Capture",
                title: "Every channel, one inbox",
                body: "Missed calls, web forms, Facebook ads, Google leads—all routed into a single pipeline you can see and manage.",
                icon: (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ),
              },
              {
                label: "Booking Automation",
                title: "Leads book directly on your calendar",
                body: "Qualified leads can schedule estimates and jobs directly—no back and forth, no phone tag.",
                icon: (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div
                key={item.label}
                className="border border-gray-100 rounded-2xl p-8 hover:border-gray-200 transition-colors"
              >
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mb-5">
                  {item.icon}
                </div>
                <div className="text-xs font-semibold uppercase tracking-widest text-green-600 mb-2">
                  {item.label}
                </div>
                <h3 className="text-lg font-semibold text-black mb-3">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-gray-50 py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-xl mb-16">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 mb-4">
              How It Works
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-black">
              Up and running in days, not months.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Onboarding Call",
                body: "We spend 45 minutes mapping your current lead flow, identifying the gaps, and designing a system built around your business.",
              },
              {
                step: "02",
                title: "We Build It",
                body: "Our team installs your automation system—integrating your existing tools, writing your follow-up sequences, and connecting your lead sources.",
              },
              {
                step: "03",
                title: "Leads Get Booked",
                body: "Your system goes live. Every new lead is contacted instantly and followed up automatically. You focus on the work.",
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="text-6xl font-bold text-gray-100 mb-4 select-none leading-none">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <Link
              href="/how-it-works"
              className="text-sm font-medium text-black underline underline-offset-4 hover:text-green-700 transition-colors"
            >
              See the full process
            </Link>
          </div>
        </div>
      </section>

      {/* ── Offer ── */}
      <section className="bg-white py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 mb-4">
                What You Get
              </span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-black leading-tight mb-5">
                One system.<br />Everything included.
              </h2>
              <p className="text-lg text-gray-500 leading-relaxed">
                We don&apos;t sell software. We install a complete, done-for-you
                lead capture and follow-up operation—built, managed, and optimized
                for your business.
              </p>
            </div>

            <div className="space-y-4">
              {[
                "Missed call text-back (responds in &lt;60 seconds)",
                "Multi-step SMS & email follow-up sequences",
                "Unified lead inbox — every channel in one place",
                "Online booking & estimate scheduling",
                "Review request automation",
                "Monthly reporting & optimization",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span
                    className="text-sm text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: item }}
                  />
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
            Ready to stop losing jobs?
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Book a free 30-minute call. We&apos;ll show you exactly what your lead
            capture looks like right now—and what it should look like.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-green-500 text-black font-semibold text-base px-8 py-4 rounded-xl hover:bg-green-400 transition-colors"
          >
            Book a Free Call
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
