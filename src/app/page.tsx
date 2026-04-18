import Link from "next/link";
import {
  BrokenPhoneHero,
  AestheticBeforeAfterMock,
  FormErrorMock,
  CrampedMobileMock,
  StaleFooterMock,
} from "@/components/VisualMocks";

function ArrowIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

const brokenExamples = [
  {
    title: "Dated look",
    caption:
      "Gray-on-gray, clip-art teeth, beveled buttons. The practice looks frozen in 2012 — new patients judge the office by it.",
    visual: <AestheticBeforeAfterMock />,
  },
  {
    title: "Booking form 404",
    caption:
      "Appointment forms posting to dead endpoints. The patient hits submit, sees an error, and calls the practice down the street.",
    visual: <FormErrorMock />,
  },
  {
    title: "No mobile viewport",
    caption:
      "Desktop layout pinch-zoomed into a phone. Most new-patient searches happen on a phone — they bounce before they read a word.",
    visual: <CrampedMobileMock />,
  },
  {
    title: "Stale copyright",
    caption:
      "Footer still says 2019. The office looks closed — whether it is or not. Trust leaks before the patient sees your hours.",
    visual: <StaleFooterMock />,
  },
];

const processSteps = [
  {
    step: "01",
    title: "We show you what is broken",
    body: "You send your site. We review it and send back screenshots of the issues worth fixing.",
  },
  {
    step: "02",
    title: "You approve the cleanup scope",
    body: "Flat price. Clear scope. If the site actually needs a visual refresh or a rebuild instead, we tell you before taking the job.",
  },
  {
    step: "03",
    title: "We fix it in 48 hours",
    body: "Booking forms work, the mobile experience gets cleaned up, and the practice looks like someone still runs it.",
  },
];

const outcomes = [
  "Your site works on phones",
  "Patients can actually book an appointment",
  "The practice looks modern instead of abandoned",
  "You stop losing bookings to practices with cleaner sites",
];

export default function HomePage() {
  return (
    <>
      <section className="theme-page pt-24 md:pt-32">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="grid gap-16 lg:grid-cols-[1.05fr,0.95fr] items-center">
            <div>
              <span className="theme-label inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-5">
                Website Cleanup for Dental Practices
              </span>
              <h1 className="theme-text-primary text-5xl md:text-6xl font-bold tracking-tight leading-[1.02] mb-6">
                Your dental site is quietly
                <br />
                costing you new patients.
              </h1>
              <p className="theme-text-secondary text-lg leading-relaxed mb-4 max-w-2xl">
                Booking forms that 404. Layouts that crumble on phones. A copyright year still stuck in 2019.
                Patients close the tab and call the practice down the street — they do not call you to tell you why.
              </p>
              <p className="theme-text-muted text-base leading-relaxed mb-10 max-w-2xl">
                Send us the URL. We reply with screenshots of what is broken. No sales call, no pitch deck.
              </p>
              <Link
                href="/contact"
                className="theme-cta-accent inline-flex items-center justify-center gap-2 text-base font-semibold px-7 py-3.5 rounded-xl"
              >
                Show Me What&apos;s Broken
                <ArrowIcon />
              </Link>
              <p className="theme-text-muted text-xs mt-5">
                Free audit. Flat-fee cleanup if it is a fit. If the site needs a full visual refresh instead, we say so.
              </p>
            </div>

            <div className="flex justify-center lg:justify-end">
              <BrokenPhoneHero />
            </div>
          </div>
        </div>
      </section>

      <section id="what-we-fix" className="theme-section-contrast py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-14">
            <span className="theme-label inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-4">
              Visual Proof
            </span>
            <h2 className="theme-text-primary text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5">
              This is what broken
              <br />
              actually looks like.
            </h2>
            <p className="theme-text-contrast-muted text-base leading-relaxed">
              Not a giant website report. Four problems the audit catches on dental-practice sites — each costs
              new-patient calls in a way the office rarely sees.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {brokenExamples.map((item) => (
              <div key={item.title} className="theme-card border rounded-2xl p-5 flex flex-col gap-4">
                <div>{item.visual}</div>
                <div>
                  <p className="theme-text-primary text-base font-semibold mb-1.5">{item.title}</p>
                  <p className="theme-text-contrast-muted text-sm leading-relaxed">{item.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="process" className="theme-section py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <span className="theme-label inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-4">
              Simple Process
            </span>
            <h2 className="theme-text-primary text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5">
              Three steps.
              <br />
              No mystery.
            </h2>
            <p className="theme-text-muted leading-relaxed">
              Confused customers do not buy. This offer is intentionally simple so you know exactly what happens next.
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
        </div>
      </section>

      <section id="pricing" className="theme-section-muted theme-border py-24 md:py-32 border-y">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid gap-16 lg:grid-cols-[0.9fr,1.1fr] items-start">
            <div>
              <span className="theme-label inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-4">
                The Offer
              </span>
              <h2 className="theme-text-primary text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5">
                Website cleanup.
                <br />
                $1,200.
                <br />
                48-hour turnaround.
              </h2>
              <p className="theme-text-muted leading-relaxed mb-8">
                One service. One price. One timeline.
                If the practice site needs a visual refresh or a rebuild instead, we quote that separately — no surprises.
              </p>
              <Link
                href="/contact"
                className="theme-cta inline-flex items-center gap-2 font-semibold px-7 py-3.5 rounded-xl"
              >
                Request Free Screenshots
                <ArrowIcon />
              </Link>
            </div>

            <div className="grid gap-4">
              <div className="theme-card-strong border rounded-3xl p-8">
                <p className="theme-text-muted text-xs font-semibold uppercase tracking-[0.2em] mb-3">
                  Included
                </p>
                <ul className="space-y-3">
                  {[
                    "Broken booking-form diagnosis and cleanup",
                    "Mobile layout fixes on key pages",
                    "Basic modernization and trust cleanup",
                    "Clear contact path and CTA cleanup",
                  ].map((item) => (
                    <li key={item} className="theme-text-secondary text-sm leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="theme-card border rounded-3xl p-8">
                <p className="theme-text-muted text-xs font-semibold uppercase tracking-[0.2em] mb-3">
                  Not Included
                </p>
                <ul className="space-y-3">
                  {[
                    "Open-ended retainers",
                    "Custom app development",
                    "A full-site rebuild disguised as a quick fix",
                    "Agency-style bundles with a dozen moving parts",
                  ].map((item) => (
                    <li key={item} className="theme-text-secondary text-sm leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="theme-card-warn border rounded-3xl p-8">
                <p className="theme-warn-badge inline-block text-xs font-semibold uppercase tracking-[0.2em] px-2.5 py-1 rounded-full mb-4">
                  If It Needs More
                </p>
                <p className="theme-text-secondary text-sm leading-relaxed">
                  Sometimes the audit reveals the site needs a full visual refresh, not just a cleanup.
                  We quote that separately after the screenshots — you see the issues first, then decide.
                  The refresh is the upsell, not the bait.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="theme-section py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid gap-12 lg:grid-cols-[1fr,1fr] items-start">
            <div>
              <span className="theme-label inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-4">
                What Success Looks Like
              </span>
              <h2 className="theme-text-primary text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5">
                Your site works.
                <br />
                The practice looks current.
                <br />
                Patients actually book.
              </h2>
              <p className="theme-text-muted leading-relaxed">
                You should not lose new patients because the website looks abandoned.
                They are judging the practice by the site whether that is fair or not.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {outcomes.map((item) => (
                <div key={item} className="theme-card-accent border rounded-2xl p-5">
                  <p className="theme-text-primary text-sm font-semibold leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="theme-section-contrast py-24 md:py-28">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <span className="theme-label inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-4">
              Direct Call To Action
            </span>
            <h2 className="theme-text-primary text-3xl md:text-4xl font-bold mb-3">
              Reply with your practice website.
              <br />
              We&apos;ll show you what is broken.
            </h2>
            <p className="theme-text-contrast-muted">
              Free audit. If the cleanup is the right fit, we quote the flat fee and turn it around in 48 hours.
            </p>
          </div>
          <Link
            href="/contact"
            className="theme-cta-accent inline-flex items-center gap-2 font-semibold px-7 py-3.5 rounded-xl"
          >
            Get Free Screenshots
            <ArrowIcon />
          </Link>
        </div>
      </section>
    </>
  );
}
