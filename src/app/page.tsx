import Link from "next/link";

function ArrowIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

const issues = [
  "Contact forms that fail with 404 or 405 errors",
  "Mobile layouts that break on phones",
  "Dead pages, weak calls to action, and trust leaks",
  "Outdated sections that make the business look neglected",
];

const auditChecks = [
  {
    title: "Form failures",
    body: "If a lead form posts to the wrong endpoint or throws a 404 or 405, we catch it fast.",
  },
  {
    title: "Mobile breakage",
    body: "We check whether the site actually works on the device most visitors use first.",
  },
  {
    title: "Credibility issues",
    body: "Weak headlines, stale layouts, broken trust signals, and confusing contact paths get flagged.",
  },
  {
    title: "Fix-first scope",
    body: "We are not selling an open-ended retainer. We identify the problem, fix the problem, and move on.",
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
    title: "You approve the $1,200 cleanup",
    body: "Flat price. Clear scope. If the site actually needs a rebuild instead, we tell you before taking the job.",
  },
  {
    step: "03",
    title: "We fix it in 48 hours",
    body: "Forms work, the mobile experience gets cleaned up, and the site looks like someone still runs the business.",
  },
];

const outcomes = [
  "Your website works on phones",
  "People can actually submit the form",
  "The business looks current instead of neglected",
  "You stop leaking leads to competitors with cleaner sites",
];

export default function HomePage() {
  return (
    <>
      <section className="theme-page pt-24 md:pt-32">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="grid gap-14 lg:grid-cols-[1.1fr,0.9fr] items-start">
            <div>
              <span className="theme-label inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-5">
                Website Cleanup for Local Businesses
              </span>
              <h1 className="theme-text-primary text-5xl md:text-6xl font-bold tracking-tight leading-[1.02] mb-6">
                We fix broken business websites
                <br />
                for $1,200
                <br />
                in 48 hours.
              </h1>
              <p className="theme-text-secondary text-lg leading-relaxed mb-4 max-w-2xl">
                If your forms fail, your site falls apart on mobile, or the whole thing looks dated, we clean it up fast.
                REBB runs a weekly audit that catches broken forms, mobile issues, dead pages, and obvious trust leaks.
              </p>
              <p className="theme-text-muted text-base leading-relaxed mb-10 max-w-2xl">
                This is not a vague marketing package and not an open-ended web project.
                It is a clear website cleanup offer for businesses losing trust because the basics are broken.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <Link
                  href="/contact"
                  className="theme-cta-accent inline-flex items-center justify-center gap-2 text-base font-semibold px-7 py-3.5 rounded-xl"
                >
                  Show Me What&apos;s Broken
                  <ArrowIcon />
                </Link>
                <a
                  href="#pricing"
                  className="theme-card border inline-flex items-center justify-center gap-2 text-base font-medium px-7 py-3.5 rounded-xl theme-text-primary"
                >
                  See Pricing
                </a>
              </div>
              <p className="theme-text-muted text-xs">
                Flat fee for standard cleanup. If your site needs a full rebuild, we will say that directly before any work starts.
              </p>
            </div>

            <div className="theme-card rounded-3xl border p-8 md:p-10">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <p className="theme-text-muted text-xs font-semibold uppercase tracking-[0.2em]">
                    What Gets Fixed
                  </p>
                  <h2 className="theme-text-primary text-2xl font-bold mt-2">
                    The stuff that quietly costs you calls.
                  </h2>
                </div>
                <span className="theme-badge text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  48 Hours
                </span>
              </div>

              <div className="space-y-3">
                {issues.map((item) => (
                  <div key={item} className="theme-card-strong border rounded-2xl px-4 py-4">
                    <p className="theme-text-secondary text-sm leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>

              <div className="theme-border mt-6 pt-6 border-t">
                <p className="theme-text-muted text-sm leading-relaxed">
                  Good businesses lose leads every week because the website looks neglected, the forms do not work,
                  or the phone experience is bad. That is the problem this offer solves.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="what-we-fix" className="theme-section-contrast py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid gap-16 lg:grid-cols-[0.9fr,1.1fr] items-start">
            <div>
              <span className="theme-label inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-4">
                What We Catch
              </span>
              <h2 className="theme-text-primary text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5">
                Every Monday the audit looks
                <br />
                for the things that make a
                <br />
                business look broken.
              </h2>
              <p className="theme-text-contrast-muted text-base leading-relaxed mb-6">
                The point is not to hand you a giant website report.
                The point is to find obvious revenue leaks fast and fix them before they keep costing you calls.
              </p>
              <p className="theme-text-contrast-muted text-base leading-relaxed">
                If the issue is a quick cleanup, that is the $1,200 offer.
                If the site needs a full rebuild, that becomes a separate conversation after the audit.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {auditChecks.map((item) => (
                <div key={item.title} className="theme-card border rounded-2xl p-6">
                  <p className="theme-text-primary text-lg font-semibold mb-2">{item.title}</p>
                  <p className="theme-text-contrast-muted text-sm leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
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
                That is the public offer. One service. One price. One timeline.
                If your site needs more than cleanup, we will tell you instead of pretending the flat fee covers a rebuild.
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
                    "Broken form diagnosis and cleanup",
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
                  Sometimes the audit reveals a site that is too far gone for a cleanup pass.
                  In that case, we will quote a rebuild separately after the quick-fix conversation.
                  The rebuild is the upsell, not the bait.
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
                You look current.
                <br />
                People actually contact you.
              </h2>
              <p className="theme-text-muted leading-relaxed">
                You should not lose business because your website looks abandoned.
                People are judging the business by the site whether that is fair or not.
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
              Reply with your website.
              <br />
              We&apos;ll show you what is broken.
            </h2>
            <p className="theme-text-contrast-muted">
              If the cleanup is the right fit, it is $1,200 and we turn it around in 48 hours.
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
