import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Outreach Automation for Greenville SC Service Businesses — REBB Advisors",
  description:
    "Automated email and SMS follow-up sequences for Greenville County HVAC, landscaping, and trades. Every inbound lead gets an instant response — while you're on the job site.",
  openGraph: {
    title: "Outreach Automation for Greenville SC Service Businesses — REBB Advisors",
    description:
      "Automated follow-up sequences for Upstate SC trades. Never miss a lead while you're on the job site.",
    type: "website",
    url: "https://rebbadvisors.com/outreach-automation",
  },
  alternates: { canonical: "https://rebbadvisors.com/outreach-automation" },
};

export default function OutreachAutomationPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-white pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 mb-4">
            Outreach Automation
          </span>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-black mb-5 leading-tight">
            Follow up with every lead.
            <br />
            Without thinking about it.
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
            You can&apos;t answer every call on the job site. You can&apos;t send
            follow-up emails after every estimate. We automate the sequences
            so nothing falls through — and the system keeps working while
            you&apos;re busy doing the actual work.
          </p>
        </div>
      </section>

      {/* The problem */}
      <section className="bg-gray-950 text-white py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-500 mb-4">
              The Leaky Bucket
            </span>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-5">
              You&apos;re generating leads.
              <br />
              You&apos;re not capturing them.
            </h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              A prospect calls during a job. You can&apos;t answer. They leave a
              voicemail — or they don&apos;t. They called two other contractors while
              they had momentum. By the time you call back at 6pm, they&apos;ve
              already booked someone.
            </p>
            <p className="text-gray-400 leading-relaxed">
              This happens dozens of times a month for most trades businesses.
              It&apos;s not a people problem. It&apos;s a systems problem. And it&apos;s fixable.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-white/10 rounded-2xl overflow-hidden">
            {[
              {
                label: "Missed Calls",
                stat: "78%",
                body: "of customers who call a local business and can't reach anyone will not call back. They go to the next result. You paid to generate that lead.",
              },
              {
                label: "Speed to Lead",
                stat: "5 min",
                body: "Leads contacted within 5 minutes convert at 21x the rate of leads contacted after 30 minutes. The window closes faster than most business owners realize.",
              },
              {
                label: "Follow-Up Attempts",
                stat: "80%",
                body: "of sales require 5 or more follow-up touchpoints. Most service businesses give up after one call. The deal was still there — you just stopped reaching for it.",
              },
            ].map((item) => (
              <div key={item.label} className="bg-gray-950 p-8 md:p-10">
                <div className="text-xs font-semibold uppercase tracking-widest text-green-500 mb-3">{item.label}</div>
                <div className="text-4xl font-bold text-white mb-3">{item.stat}</div>
                <p className="text-sm text-gray-400 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we install */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-14">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 mb-4">
              What We Install
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-black leading-tight">
              Three systems that run
              <br />
              without you.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: "01",
                title: "Missed Call Text-Back",
                bullets: [
                  "Fires within 60 seconds of a missed call",
                  "Personalized to your business name",
                  "Links directly to booking or estimate form",
                  "Converts voicemail-shy prospects immediately",
                ],
                note: "This alone recovers most of the leads a trades business loses every week.",
              },
              {
                number: "02",
                title: "Inbound Lead Sequence",
                bullets: [
                  "Instant confirmation email on every form submission",
                  "Day 1, Day 3, Day 7 follow-up cadence",
                  "Sequence pauses when they respond",
                  "Reactivation message after 30 days of silence",
                ],
                note: "Runs automatically. You only talk to leads when they're ready to talk back.",
              },
              {
                number: "03",
                title: "Estimate Follow-Up",
                bullets: [
                  "Automated check-in 48 hours after estimate sent",
                  "Objection-handling message at Day 5",
                  "Final urgency message at Day 10",
                  "Closed-lost feedback request if no response",
                ],
                note: "Most estimates that don't close immediately just need one more nudge. The system sends it.",
              },
            ].map((item) => (
              <div key={item.number} className="border border-gray-100 rounded-2xl p-8 hover:border-gray-200 transition-colors">
                <div className="text-xs font-semibold text-gray-300 mb-4">{item.number}</div>
                <h3 className="text-lg font-bold text-black mb-5">{item.title}</h3>
                <ul className="space-y-2.5 mb-6">
                  {item.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-gray-500">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-green-500 flex-shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-400 border-t border-gray-100 pt-4 leading-relaxed italic">
                  {item.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Multiplier outreach */}
      <section className="bg-gray-50 py-20 md:py-28 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 mb-4">
                Outbound + Automation
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-black leading-tight mb-5">
                The Multiplier surfaces the lead.
                <br />
                The sequence warms them up.
              </h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                When you cold-call a Multiplier prospect and they don&apos;t answer,
                most contractors give up. We don&apos;t. We install a short outbound
                sequence — email or SMS — that runs automatically after your first
                contact attempt.
              </p>
              <p className="text-gray-500 leading-relaxed mb-8">
                The message is specific to the signal that surfaced them. Not
                &ldquo;Hey just checking in!&rdquo; — something like &ldquo;Following up on the
                Pelham Rd property — wanted to make sure you got my message.&rdquo;
                That specificity gets responses.
              </p>
              <Link
                href="/lead-intelligence"
                className="inline-flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-700 transition-colors"
              >
                Learn about The Upstate Multiplier
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            {/* Sequence mockup */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="text-sm font-semibold text-black">Outbound Sequence: New Property Transfer</div>
                <div className="text-xs text-gray-400 mt-0.5">Triggered after first call attempt goes unanswered</div>
              </div>
              <div className="divide-y divide-gray-50">
                {[
                  {
                    day: "Day 1",
                    channel: "SMS",
                    preview: "Hi Marcus — this is [Name] with [Company]. Saw the transfer on 7842 Augusta Rd and wanted to connect. Do you have 5 min this week?",
                    status: "Sent",
                  },
                  {
                    day: "Day 3",
                    channel: "Email",
                    preview: "Subject: 7842 Augusta Rd — Commercial HVAC\n\nFollowing up on my text. We specialize in commercial HVAC for property transitions in Greenville County...",
                    status: "Sent",
                  },
                  {
                    day: "Day 7",
                    channel: "SMS",
                    preview: "Last message from me — just want to make sure you have options for HVAC before you get locked in. Happy to do a quick site walk at no charge.",
                    status: "Pending",
                  },
                ].map((msg) => (
                  <div key={msg.day} className="px-6 py-4">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-300">{msg.day}</span>
                        <span className="text-xs font-semibold uppercase tracking-wide text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                          {msg.channel}
                        </span>
                      </div>
                      <span className={`text-xs font-semibold ${msg.status === "Sent" ? "text-gray-400" : "text-amber-500"}`}>
                        {msg.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-line">{msg.preview}</p>
                  </div>
                ))}
              </div>
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                <span className="text-xs text-gray-400">Sequence pauses automatically on reply</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What we don't do */}
      <section className="bg-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 mb-4">
              How We Build
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-black mb-5 leading-tight">
              We write the sequences ourselves. Specific to your trade, your market, and your offer.
            </h2>
            <p className="text-gray-500 leading-relaxed mb-4">
              We don&apos;t hand you a template library and a login. We write the
              copy, set up the triggers, connect to your phone number and email
              domain, and test everything before it touches a real lead.
            </p>
            <p className="text-gray-500 leading-relaxed">
              The sequences run on infrastructure we manage. You get notified
              when someone responds. You take it from there.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-950 py-24">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Stop losing leads you already earned.
            </h2>
            <p className="text-gray-400">
              We&apos;ll audit your current lead flow on the first call and show you exactly where the gaps are.
            </p>
          </div>
          <Link
            href="/contact"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-green-500 text-black font-semibold px-7 py-3.5 rounded-xl hover:bg-green-400 transition-colors"
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
