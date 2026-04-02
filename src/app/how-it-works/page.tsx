import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How It Works — REBB Advisors",
  description:
    "A step-by-step look at how we install automated lead capture and follow-up systems for local service businesses.",
};

const steps = [
  {
    step: "01",
    title: "Discovery Call",
    duration: "45 minutes",
    body: "We map your entire lead flow from first contact to closed job. Where are leads coming from? Where are they falling off? What does your current follow-up look like? Most businesses are shocked to see how many leads are quietly slipping out.",
    details: [
      "Review inbound channels (calls, web, social)",
      "Identify response time and follow-up gaps",
      "Define your ideal booking journey",
    ],
  },
  {
    step: "02",
    title: "System Design",
    duration: "3–5 days",
    body: "We design a custom automation system around your business. Every sequence is written for your services, your market, and your voice. Nothing generic. Nothing templated.",
    details: [
      "Custom follow-up scripts and sequences",
      "Integration plan for your existing tools",
      "Pipeline stages and lead routing logic",
    ],
  },
  {
    step: "03",
    title: "Build & Install",
    duration: "7–10 days",
    body: "We build and install everything. Missed-call text-back, lead capture forms, follow-up automations, booking links, review requests—all connected and tested before we hand it over.",
    details: [
      "Full system build and configuration",
      "Integration with your phone, CRM, and calendar",
      "End-to-end testing before launch",
    ],
  },
  {
    step: "04",
    title: "Go Live",
    duration: "Day 10–14",
    body: "Your system goes live. Every new lead now gets an instant response and a follow-up sequence that runs automatically. You focus on the job. The system handles the rest.",
    details: [
      "Live walkthrough of your new system",
      "Team training (30 minutes)",
      "Monitoring for the first 7 days post-launch",
    ],
  },
  {
    step: "05",
    title: "Optimize",
    duration: "Ongoing",
    body: "Every month we review your lead data, conversion rates, and sequence performance. We adjust what isn't working and double down on what is.",
    details: [
      "Monthly performance review",
      "Sequence testing and optimization",
      "New automations as your business grows",
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-white pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-600 mb-4">
            The Process
          </span>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-black mb-5 leading-tight">
            How It Works
          </h1>
          <p className="text-xl text-gray-500 max-w-xl leading-relaxed">
            From your first call to a fully running lead system in under two weeks.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="bg-white pb-24 md:pb-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="divide-y divide-gray-100">
            {steps.map((item) => (
              <div key={item.step} className="py-12 grid md:grid-cols-12 gap-8">
                <div className="md:col-span-1">
                  <span className="text-xs font-semibold text-gray-300">{item.step}</span>
                </div>
                <div className="md:col-span-5">
                  <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                    {item.duration}
                  </div>
                  <h2 className="text-2xl font-bold text-black mb-3">{item.title}</h2>
                  <p className="text-gray-500 leading-relaxed">{item.body}</p>
                </div>
                <div className="md:col-span-5 md:col-start-8">
                  <ul className="space-y-3">
                    {item.details.map((d) => (
                      <li key={d} className="flex items-start gap-3">
                        <div className="mt-0.5 w-5 h-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-600">{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-950 py-24">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Ready to get started?
            </h2>
            <p className="text-gray-400">
              Book a free call and we&apos;ll walk you through your current lead flow.
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
