import Image from "next/image";
import Link from "next/link";
import { practiceTypeList } from "@/lib/practiceTypes";

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
    q: "What is included in the Cleanup?",
    a: "Mobile layout fixes. A contact-form replacement that lands in a HIPAA-compliant destination under a signed Business Associate Agreement, with the documentation for your compliance binder. A speed pass \u2014 Lighthouse improvements, image compression, unused scripts removed. A visual refresh so the practice looks current: hero, buttons, contact path. Your existing Weave, LocalMed, or RevenueWell sync is preserved and tested before handoff. Ships in five business days or less. Cleanup starts at $1,500; the audit tells you where your site lands.",
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

export type Faq = { q: string; a: string };

export function buildFaqJsonLd(list: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: list.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export const faqJsonLd = buildFaqJsonLd(faqs);

export function HipaaSection() {
  return (
    <section className="theme-section-contrast py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid gap-12 md:gap-16 md:grid-cols-[0.6fr,1.4fr] items-center">
          <div className="relative aspect-[4/3] w-full max-w-[360px] md:max-w-[420px] mx-auto overflow-hidden rounded-3xl theme-border border">
            <Image
              src="/hipaa.jpg"
              alt="HIPAA compliance and patient data protection"
              fill
              sizes="(min-width: 768px) 420px, 360px"
              className="object-cover"
            />
          </div>
          <div>
            <span className="theme-label inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-4">
              Liability hiding in plain sight
            </span>
            <h2 className="theme-text-primary text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
              Your contact form is probably
              <br />
              a HIPAA problem.
            </h2>
            <p className="theme-text-contrast-muted text-base leading-relaxed mb-5">
              A patient types <em className="theme-text-primary not-italic font-semibold">&ldquo;cracked molar, need it pulled&rdquo;</em> &mdash; that message is Protected Health Information the second it hits your inbox.
            </p>
            <p className="theme-text-contrast-muted text-base leading-relaxed mb-5">
              Most dental forms quietly fail HIPAA: plugin databases with no audit log, hosts without a Business Associate Agreement, Gmail inboxes never set up under a Workspace BAA, form services whose terms exclude healthcare.
            </p>
            <p className="theme-text-contrast-muted text-base leading-relaxed mb-8">
              Cleanup swaps intake for a BAA-backed destination and hands you the documentation for your compliance binder. If HHS comes knocking, it&rsquo;s the practice on the hook &mdash; not the plugin.
            </p>
            <Link
              href="/contact"
              className="theme-cta-accent inline-flex items-center gap-2 text-base font-semibold px-7 py-3.5 rounded-xl"
            >
              Send us your URL
              <ArrowIcon />
            </Link>
          </div>
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
  const practiceTypes = practiceTypeList;
  return (
    <section className="theme-section-muted border-y theme-border py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-3xl mb-14">
          <span className="theme-label inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-4">
            We know how your practice actually works
          </span>
          <h2 className="theme-text-primary text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5">
            Different practices lose patients
            <br />
            in different ways.
          </h2>
          <p className="theme-text-muted text-base leading-relaxed">
            Most web shops pour every dental practice into the same template. We don&rsquo;t.
          </p>
        </div>

        <div className="space-y-10 md:space-y-14">
          {practiceTypes.map((p, i) => (
            <div
              key={p.label}
              className={`grid gap-6 md:gap-10 md:grid-cols-2 items-center ${
                i % 2 === 1 ? "md:[&>div:first-child]:order-2" : ""
              }`}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl theme-border border">
                <Image
                  src={p.image}
                  alt={p.alt}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                  style={
                    p.imagePosition
                      ? { objectPosition: p.imagePosition }
                      : undefined
                  }
                />
              </div>
              <div>
                <p className="theme-label text-sm md:text-base font-extrabold uppercase tracking-[0.22em] mb-4">{p.label}</p>
                <h3 className="theme-text-primary text-2xl md:text-[1.75rem] font-bold leading-snug mb-5">
                  {p.headline}
                </h3>
                <ul className="space-y-2.5 mb-5">
                  {p.bullets.map((b) => (
                    <li
                      key={b}
                      className="theme-text-secondary text-sm md:text-base leading-relaxed flex gap-3"
                    >
                      <span className="theme-label font-bold mt-0.5 select-none">&rarr;</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/${p.slug}`}
                  className="theme-link text-sm font-semibold inline-flex items-center gap-1.5"
                >
                  How we build for {p.label.toLowerCase()} practices
                  <ArrowIcon />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="theme-text-muted text-sm mt-14 max-w-3xl leading-relaxed">
          Every Cleanup also preserves your Weave, LocalMed, or RevenueWell sync, swaps intake to a BAA-backed destination, and aligns your schema for Map Pack visibility. Baseline, not add-on.
        </p>
      </div>
    </section>
  );
}

export type FixPattern = {
  label: string;
  problem: string;
  fix: string;
  result: string;
};

const defaultFixPatterns: FixPattern[] = [
  {
    label: "Speed",
    problem: "Site takes 5.2s to paint on a mid-tier Android over LTE. Patients leave after three.",
    fix: "Compress the hero image. Drop the unused analytics stack. Swap fonts for system defaults. Modern image formats only.",
    result: "Loads in 1.3s. Bounce stops being a speed problem.",
  },
  {
    label: "Contact form",
    problem: "Form submits into a plugin database with no BAA, no audit log, no retention policy.",
    fix: "Replace with intake that lands in a BAA-backed destination. Documentation for your compliance binder included.",
    result: "PHI exposure closed. HHS records request stops being a panic drill.",
  },
  {
    label: "Mobile-first experience",
    problem: "No visible way to book on mobile above the fold. Phone number is plain text, not tap-to-call.",
    fix: "Persistent \u201cBook online\u201d bar, tap-to-call phone in the header, &ldquo;same-day emergency&rdquo; shortcut for high-intent searches.",
    result: "High-intent mobile clicks actually convert instead of bouncing to the next pin.",
  },
];

type BeforeAfterProps = {
  eyebrow?: string;
  headlineTop?: string;
  headlineBottom?: string;
  intro?: React.ReactNode;
  patterns?: FixPattern[];
};

export function BeforeAfterSection({
  eyebrow = "What the audits find",
  headlineTop = "Here\u2019s what breaks.",
  headlineBottom = "Here\u2019s what changes.",
  intro,
  patterns = defaultFixPatterns,
}: BeforeAfterProps = {}) {
  const defaultIntro = (
    <p className="theme-text-secondary text-sm md:text-base leading-relaxed">
      We&rsquo;ve audited <strong className="theme-text-primary">87 dental websites</strong> across Greenville, Spartanburg, Anderson, Pickens, and Oconee counties. The median mobile Lighthouse score is <strong className="theme-text-primary">55 out of 100</strong>. Thirty-nine percent score below 50. These are the fixes that show up most.
    </p>
  );
  return (
    <section className="theme-section py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-3xl mb-10">
          <span className="theme-label inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-4">
            {eyebrow}
          </span>
          <h2 className="theme-text-primary text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
            {headlineTop}
            <br />
            {headlineBottom}
          </h2>
          <div className="theme-card-muted border theme-border rounded-2xl p-5 md:p-6">
            {intro ?? defaultIntro}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {patterns.map((item) => (
            <div key={item.label} className="theme-card border rounded-3xl p-7 flex flex-col items-center text-center">
              <span className="theme-badge inline-block text-xs font-bold uppercase tracking-[0.18em] px-4 py-1.5 rounded-full mb-5">
                {item.label}
              </span>
              <div className="space-y-3.5 text-left w-full">
                <p className="theme-text-secondary text-sm leading-relaxed">
                  <span className="theme-text-primary font-semibold">Problem. </span>
                  {item.problem}
                </p>
                <p className="theme-text-secondary text-sm leading-relaxed">
                  <span className="theme-text-primary font-semibold">Fix. </span>
                  <span dangerouslySetInnerHTML={{ __html: item.fix }} />
                </p>
                <p className="theme-text-secondary text-sm leading-relaxed">
                  <span className="theme-text-primary font-semibold">Result. </span>
                  {item.result}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* TODO: when a real Greenville-area practice gives written permission,
            add a named before/after case study here \u2014 one cosmetic/Invisalign
            (younger, mobile-first visual proof) and one implant/full-arch
            (older, trust/authority proof). Do NOT fabricate or pull from
            the prospects pipeline. */}
        <p className="theme-text-muted text-xs md:text-sm italic mt-8">
          Named case studies from Greenville-area practices coming once we have written permission. Until then, patterns only.
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
            The real diagnosis
          </span>
          <h2 className="theme-text-primary text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5">
            You don&rsquo;t have a traffic problem.
            <br />
            You have a booking problem.
          </h2>
          <p className="theme-text-contrast-muted text-base leading-relaxed mb-4">
            Patients are already finding you. They search &ldquo;dentist near me&rdquo; at 9pm, they tap the map pin, they land on your homepage. Then the site fails them before they finish booking &mdash; the form errors, the phone number isn&rsquo;t tap-to-call on mobile, the page takes six seconds to paint on their carrier.
          </p>
          <p className="theme-text-contrast-muted text-base leading-relaxed">
            Every bounce is a new patient you never met. And a five-star review you&rsquo;ll never get.
          </p>
        </div>

        <p className="theme-text-contrast-muted text-base leading-relaxed mb-4 max-w-3xl">
          Three things compound every month the cleanup waits:
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
              <strong className="theme-text-primary">Reviews compound off new patients.</strong> Patients who can&rsquo;t get through your booking form aren&rsquo;t leaving reviews. Your competitor&rsquo;s five-star count grows; yours doesn&rsquo;t.
            </span>
          </li>
          <li className="theme-text-contrast-muted text-base leading-relaxed flex gap-3">
            <span className="theme-label font-bold mt-0.5">&mdash;</span>
            <span>
              <strong className="theme-text-primary">The form&rsquo;s liability window keeps widening.</strong> Every submission into a non-BAA destination is another record on the pile.
            </span>
          </li>
        </ul>

        <p className="theme-text-contrast-muted text-base leading-relaxed max-w-3xl">
          The site isn&rsquo;t hurting existing patients &mdash; they already know where to park. Every bounce is a new patient. The one who was going to replace the patient who moved away last month.
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
            The Cleanup starts at $1,500. It covers the four fixes &mdash; mobile, contact form, speed, outdated look &mdash; a HIPAA-compliant intake swap, and we preserve your Weave, LocalMed, or RevenueWell sync before handoff.
          </p>
          <p className="theme-text-secondary text-base leading-relaxed mb-8">
            Scope varies by practice. The audit tells you which tier your site actually needs, and larger rebuilds are scoped to your project. Send what you need; we&rsquo;ll work within your budget.
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

export function FaqSection({
  items = faqs,
  eyebrow = "FAQ",
  headlineTop = "The questions",
  headlineBottom = "worth answering.",
  lede = "Honest answers about the audit, the Cleanup, and what happens after you hit reply.",
}: {
  items?: Faq[];
  eyebrow?: string;
  headlineTop?: string;
  headlineBottom?: string;
  lede?: string;
} = {}) {
  return (
    <section id="faq" className="theme-section py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid gap-14 lg:grid-cols-[0.85fr,1.15fr] items-start">
          <div>
            <span className="theme-label inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-4">
              {eyebrow}
            </span>
            <h2 className="theme-text-primary text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5">
              {headlineTop}
              <br />
              {headlineBottom}
            </h2>
            <p className="theme-text-muted leading-relaxed">{lede}</p>
          </div>

          <div className="theme-border border-t">
            {items.map((faq) => (
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
