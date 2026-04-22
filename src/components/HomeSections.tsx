import Link from "next/link";

export function ArrowIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

const processSteps = [
  {
    step: "01",
    title: "Send us the URL.",
    body: "That\u2019s the whole intake. No form with 14 questions, no discovery call, no sales sequence.",
  },
  {
    step: "02",
    title: "Get screenshots back \u2014 free.",
    body: "Within 48 hours we reply with the issues worth fixing and a written quote. If the site is already fine, the note says so.",
  },
  {
    step: "03",
    title: "Say yes, and it\u2019s fixed in a week.",
    body: "Payment on approval. Cleanup ships in five business days or less.",
  },
];

export const faqs = [
  {
    q: "What is the free audit and proposal exactly?",
    a: "You send your practice URL. Within 48 hours we reply with screenshots of what is broken and a written quote \u2014 scope, price, timeline. No sales call, no follow-up sequence. If the site is already fine, the note says that.",
  },
  {
    q: "What is included in the $1,500 Cleanup?",
    a: "Mobile layout fixes. A contact-form replacement that lands in a HIPAA-compliant destination under a signed Business Associate Agreement, with the documentation for your compliance binder. A speed pass \u2014 Lighthouse improvements, image compression, unused scripts removed. A visual refresh so the practice looks current: hero, buttons, contact path. Your existing Weave, LocalMed, or RevenueWell sync is preserved and tested before handoff. Ships in five business days or less.",
  },
  {
    q: "What if my site needs more than the Cleanup?",
    a: "We will say so in the quote. Larger rebuilds are scoped to your project \u2014 send the URL, we will tell you what it actually needs, and we will work within your budget. Rebuild engagements run month-to-month after the build phase with 30-day cancellation. No long-term contracts.",
  },
  {
    q: "Do you touch our Weave or schedule-sync setup?",
    a: "Only to preserve it. Before we swap anything, we document what is wired to your current site. We submit a test record through the new contact form and show you the entry on the receiving end before we invoice. We do not migrate or reconfigure your patient-engagement tools \u2014 those belong to your front desk.",
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

export function HipaaSection() {
  return (
    <section className="theme-section-contrast py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-3xl">
          <span className="theme-label inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-4">
            Liability hiding in plain sight
          </span>
          <h2 className="theme-text-primary text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
            Your contact form is probably
            <br />
            a HIPAA problem.
          </h2>
          <p className="theme-text-contrast-muted text-base leading-relaxed mb-5">
            A patient types <em>&ldquo;I&rsquo;ve had a cracked molar for two weeks and need it pulled&rdquo;</em> into the contact form on your site. They hit submit. The moment that message &mdash; a symptom tied to an identified patient &mdash; lands in your inbox, it&rsquo;s Protected Health Information.
          </p>
          <p className="theme-text-contrast-muted text-base leading-relaxed mb-4">
            Then the form quietly does one of these:
          </p>
          <ul className="space-y-2.5 mb-6">
            <li className="theme-text-contrast-muted text-base leading-relaxed flex gap-3">
              <span className="theme-label font-bold mt-0.5">&mdash;</span>
              <span>Stores submissions in a plugin database with no retention policy and no audit log.</span>
            </li>
            <li className="theme-text-contrast-muted text-base leading-relaxed flex gap-3">
              <span className="theme-label font-bold mt-0.5">&mdash;</span>
              <span>Submits through a plugin on a host you don&rsquo;t have a Business Associate Agreement with.</span>
            </li>
            <li className="theme-text-contrast-muted text-base leading-relaxed flex gap-3">
              <span className="theme-label font-bold mt-0.5">&mdash;</span>
              <span>Lands in a Gmail inbox that was never set up under a Google Workspace BAA.</span>
            </li>
            <li className="theme-text-contrast-muted text-base leading-relaxed flex gap-3">
              <span className="theme-label font-bold mt-0.5">&mdash;</span>
              <span>Routes through a form service whose terms of service explicitly exclude healthcare.</span>
            </li>
          </ul>
          <p className="theme-text-contrast-muted text-base leading-relaxed mb-4">
            Most front-desk staff don&rsquo;t know which of those four is happening on your site right now. Most dentists haven&rsquo;t thought about it since their last compliance training. But if HHS &mdash; the federal agency that enforces HIPAA &mdash; comes with a records request, it&rsquo;s the practice on the hook, not the form plugin.
          </p>
          <p className="theme-text-contrast-muted text-base leading-relaxed mb-8">
            Cleanup replaces the intake form with one that posts into a destination covered by a signed Business Associate Agreement, and hands you the documentation for the file. If you already run new-patient intake through Weave or LocalMed, we point the site at that flow instead of duplicating capture.
          </p>
          {/* TODO: add synthetic non-compliant dental contact form mock to VisualMocks.tsx
              — red callouts on plugin-stored PHI, no-BAA destination, no retention policy.
              Inline here when asset exists. */}
          <Link
            href="/contact"
            className="theme-cta-accent inline-flex items-center gap-2 text-base font-semibold px-7 py-3.5 rounded-xl"
          >
            Send us your URL
            <ArrowIcon />
          </Link>
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
            How it works
          </span>
          <h2 className="theme-text-primary text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5">
            Three steps.
            <br />
            One week.
          </h2>
          <p className="theme-text-muted leading-relaxed">
            One entry point &mdash; the audit. One deliverable &mdash; a written quote with screenshots. You decide what happens next.
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
          {/* TODO: requires sample proposal asset \u2014 do not ship live until this exists */}
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

export function CompetenceSection() {
  return (
    <section className="theme-section-muted border-y theme-border py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-3xl mb-12">
          <span className="theme-label inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-4">
            We won&rsquo;t break the front desk
          </span>
          <h2 className="theme-text-primary text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5">
            Your Weave sync survives
            <br />
            the cleanup.
          </h2>
          <p className="theme-text-muted text-base leading-relaxed mb-4">
            Every dentist who&rsquo;s been through a website redesign has the same story. The new site goes live on a Monday. By Wednesday the front desk is on the phone with Weave support because new appointments aren&rsquo;t syncing to the schedule. Nobody admits it&rsquo;s the website&rsquo;s fault for three days. The practice bleeds a week of confirmations.
          </p>
          <p className="theme-text-muted text-base leading-relaxed">
            We don&rsquo;t do that. Before we swap anything, we document what&rsquo;s wired to your current site &mdash; and we test that it still fires after handoff.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="theme-card border rounded-3xl p-7">
            <h3 className="theme-text-primary text-base font-bold mb-3">Weave, LocalMed, RevenueWell.</h3>
            <p className="theme-text-secondary text-sm leading-relaxed">
              If your site posts into one of these for new-patient intake or recall reminders, we preserve the endpoint your front desk built. We submit a test record through the live form and show you the entry on the receiving end before we invoice.
            </p>
          </div>
          <div className="theme-card border rounded-3xl p-7">
            <h3 className="theme-text-primary text-base font-bold mb-3">HIPAA-compliant intake.</h3>
            <p className="theme-text-secondary text-sm leading-relaxed">
              The replacement form lands in a destination covered by a signed Business Associate Agreement. You get the documentation for your compliance binder.
            </p>
          </div>
          <div className="theme-card border rounded-3xl p-7">
            <h3 className="theme-text-primary text-base font-bold mb-3">Map Pack visibility.</h3>
            <p className="theme-text-secondary text-sm leading-relaxed">
              Dentist-specific schema markup, Google Business Profile category alignment, consistent name/address/phone across citations &mdash; the things that move your pin forward when a patient searches &ldquo;dentist near me&rdquo; on their phone.
            </p>
          </div>
        </div>

        <p className="theme-text-muted text-sm mt-8">
          None of this is add-on scope. It&rsquo;s what Cleanup means.
        </p>
      </div>
    </section>
  );
}

export function BeforeAfterSection() {
  return (
    <section className="theme-section py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl mb-8">
          <span className="theme-label inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-4">
            Before / after
          </span>
          <h2 className="theme-text-primary text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5">
            Real dental practices,
            <br />
            real repairs.
          </h2>
        </div>
        {/* TODO: populate with real before/after case studies \u2014 anonymized only with
            explicit written permission from the practice. Per brief, target two
            studies that hit different emotional registers:
              1. Cosmetic / Invisalign practice \u2014 younger demographic, mobile-first
                 visual proof.
              2. Implant / full-arch practice \u2014 older demographic, trust and
                 authority proof.
            Do NOT ship placeholder images. VisualMocks.tsx is for synthetic
            "other people's broken sites" only and is not the right home for these.
            Replace the italic placeholder below with real case studies when at
            least one exists. */}
        <p className="theme-text-muted text-sm italic">
          Case studies shipping soon. Coming from real Greenville-area practices &mdash; with their permission.
        </p>
      </div>
    </section>
  );
}

export function StakesSection() {
  return (
    <section className="theme-section-contrast py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-3xl mb-10">
          <span className="theme-label inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-4">
            What it costs to wait
          </span>
          <h2 className="theme-text-primary text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5">
            The patient you lost this week
            <br />
            is already in another chair.
          </h2>
          <p className="theme-text-contrast-muted text-base leading-relaxed">
            New-patient searches don&rsquo;t pause for your schedule. They happen every evening, every weekend morning, the minute a crown cracks on a Sunday. If your site is broken when the patient looks, they don&rsquo;t come back when it&rsquo;s fixed. They find the practice on the next map pin.
          </p>
        </div>

        <p className="theme-text-contrast-muted text-base leading-relaxed mb-4 max-w-3xl">
          Three things get worse the longer the cleanup waits:
        </p>
        <ul className="space-y-4 mb-8 max-w-3xl">
          <li className="theme-text-contrast-muted text-base leading-relaxed flex gap-3">
            <span className="theme-label font-bold mt-0.5">&mdash;</span>
            <span>
              <strong className="theme-text-primary">Google&rsquo;s Map Pack weights mobile experience.</strong> Every month your Lighthouse mobile score stays low, your pin drifts further from the top of the local results. Your competitor&rsquo;s doesn&rsquo;t.
            </span>
          </li>
          <li className="theme-text-contrast-muted text-base leading-relaxed flex gap-3">
            <span className="theme-label font-bold mt-0.5">&mdash;</span>
            <span>
              <strong className="theme-text-primary">Reviews compound off new patients.</strong> The patients who can&rsquo;t get through your booking form aren&rsquo;t leaving reviews. Their five-star count grows; yours doesn&rsquo;t.
            </span>
          </li>
          <li className="theme-text-contrast-muted text-base leading-relaxed flex gap-3">
            <span className="theme-label font-bold mt-0.5">&mdash;</span>
            <span>
              <strong className="theme-text-primary">The form&rsquo;s liability window keeps widening.</strong> Every new submission into a non-BAA destination is another record on the pile.
            </span>
          </li>
        </ul>

        <p className="theme-text-contrast-muted text-base leading-relaxed max-w-3xl">
          The site isn&rsquo;t hurting existing patients. They already know where to park. Every bounce is a new patient &mdash; the one who was going to replace the patient who moved away last month.
        </p>
      </div>
    </section>
  );
}

export function PricingSection() {
  return (
    <section id="pricing" className="theme-section-muted theme-border py-24 md:py-32 border-y">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-3xl">
          <span className="theme-label inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-4">
            Pricing
          </span>
          <h2 className="theme-text-primary text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
            Website builds
            <br />
            starting at $1,500.
          </h2>
          <p className="theme-text-secondary text-base leading-relaxed mb-4">
            The Cleanup is $1,500. It covers the four fixes &mdash; mobile, contact form, speed, outdated look &mdash; a HIPAA-compliant intake swap, and we preserve your Weave, LocalMed, or RevenueWell sync before handoff.
          </p>
          <p className="theme-text-secondary text-base leading-relaxed mb-8">
            Larger rebuilds are scoped to your project. Send what you need; we&rsquo;ll work within your budget.
          </p>
          <Link
            href="/contact"
            className="theme-cta-accent inline-flex items-center gap-2 font-semibold px-7 py-3.5 rounded-xl"
          >
            Show me what&rsquo;s broken
            <ArrowIcon />
          </Link>
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
              Honest answers about the audit, the Cleanup, and what happens after you hit reply.
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
            Send the URL
          </span>
          <h2 className="theme-text-primary text-3xl md:text-4xl font-bold mb-3">
            Reply with your practice website.
            <br />
            You&rsquo;ll have screenshots inside 48 hours.
          </h2>
          <p className="theme-text-contrast-muted">
            Free audit. Screenshots plus a written quote. No call, no follow-up sequence. If the site is fine, the note says so.
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
