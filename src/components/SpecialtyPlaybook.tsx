import type { PracticeTypeSlug } from "@/lib/practiceTypes";

type SectionHeadProps = {
  eyebrow: string;
  headlineTop: string;
  headlineBottom: string;
  lede: string;
};

function SectionHead({ eyebrow, headlineTop, headlineBottom, lede }: SectionHeadProps) {
  return (
    <div className="max-w-3xl mb-12">
      <span className="theme-label inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-4">
        {eyebrow}
      </span>
      <h2 className="theme-text-primary text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5">
        {headlineTop}
        <br />
        {headlineBottom}
      </h2>
      <p className="theme-text-secondary text-base leading-relaxed">{lede}</p>
    </div>
  );
}

/* ── Cosmetic: anatomy of a case-result tile ───────────────────────────────── */

function CosmeticPlaybook() {
  return (
    <section className="theme-section-muted border-y theme-border py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHead
          eyebrow="The cosmetic playbook"
          headlineTop="The case result is"
          headlineBottom="the product."
          lede="Cosmetic patients research for weeks before they book. They compare before/afters across five sites in a single tab session. If your case tiles are unlabeled, undated, and decorative, they read as stock photography — and lose to the practice next door whose tiles read as proof."
        />

        <div className="grid gap-10 md:grid-cols-[1.05fr,0.95fr] items-start">
          <div className="theme-card theme-border border rounded-3xl p-6 md:p-8">
            <p className="theme-label text-xs font-semibold uppercase tracking-widest mb-5">
              Anatomy of a case-result tile
            </p>

            <div className="theme-card-muted rounded-2xl border theme-border overflow-hidden">
              <div className="relative aspect-[4/3] theme-card-strong flex items-center justify-center">
                <div className="grid grid-cols-2 w-full h-full">
                  <div className="theme-card-muted flex items-center justify-center text-xs theme-text-muted font-medium tracking-widest uppercase border-r theme-border">
                    Before
                  </div>
                  <div className="theme-card-strong flex items-center justify-center text-xs theme-text-primary font-medium tracking-widest uppercase">
                    After
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="theme-badge inline-block text-[11px] font-bold uppercase tracking-[0.18em] px-3 py-1 rounded-full">
                    8 veneers
                  </span>
                  <span className="theme-text-muted text-xs">
                    6-week treatment &middot; Greenville patient, age 34
                  </span>
                </div>
                <p className="theme-text-secondary text-sm leading-relaxed">
                  Replaced worn enamel on the upper arch after 15 years of
                  grinding. Shade matched to existing canines so the corners of
                  the smile don&rsquo;t fluoresce.
                </p>
              </div>
            </div>

            <p className="theme-text-muted text-xs mt-4 italic">
              Illustrative layout &mdash; not a real patient case.
            </p>
          </div>

          <div>
            <p className="theme-label text-xs font-semibold uppercase tracking-widest mb-4">
              What cosmetic patients compare
            </p>
            <ul className="space-y-4">
              {[
                {
                  t: "Proof of range.",
                  b: "Six or more cases visible in one scroll, not a hero carousel. Patients want to see that you handle cases like theirs, not one hero smile on rotation.",
                },
                {
                  t: "Written narrative.",
                  b: "Two sentences per case. What was done, what was preserved, how long it took. Decorative galleries read as stock; narrated ones read as portfolio.",
                },
                {
                  t: "Recency signal.",
                  b: "Dates or “recent cases” framing. Cosmetic patients assume an old case is an old practice, and old practices take old photos.",
                },
                {
                  t: "Quiet HIPAA hygiene.",
                  b: "No identifying features in the frame. No EXIF data on the image. Written authorization on file. The site should not be the place a compliance issue lives.",
                },
              ].map((item) => (
                <li key={item.t} className="theme-text-secondary text-sm md:text-base leading-relaxed flex gap-3">
                  <span className="theme-label font-bold mt-0.5 select-none">&rarr;</span>
                  <span>
                    <strong className="theme-text-primary">{item.t}</strong> {item.b}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Pediatric: 14-field vs. 4-field form comparison ───────────────────────── */

function PediatricPlaybook() {
  const bloated = [
    "Legal guardian name",
    "Guardian DOB",
    "Guardian SSN (last 4)",
    "Primary insurance carrier",
    "Insurance policy #",
    "Insurance group #",
    "Secondary insurance carrier",
    "Secondary policy #",
    "Pharmacy name + address",
    "Full medical history",
    "Full dental history",
    "Previous dentist name + phone",
    "How did you hear about us?",
    "Preferred appointment time",
  ];
  const tight = [
    "Child's first name",
    "Child's age",
    "Reason for visit",
    "Best time to reach you",
  ];

  return (
    <section className="theme-section-muted border-y theme-border py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHead
          eyebrow="The pediatric playbook"
          headlineTop="The mobile form is"
          headlineBottom="where bookings die."
          lede="A parent on a phone at 8pm, holding a fussy child, will not fill out 14 fields. The fix is not a prettier form. The fix is fewer fields."
        />

        <div className="grid gap-8 md:grid-cols-2">
          <div className="theme-card-muted theme-border border rounded-3xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-5">
              <p className="theme-label text-xs font-semibold uppercase tracking-widest">
                Typical new-patient form
              </p>
              <span className="theme-warn-badge inline-block text-[11px] font-bold uppercase tracking-[0.16em] px-3 py-1 rounded-full">
                14 fields
              </span>
            </div>
            <ul className="space-y-2">
              {bloated.map((field) => (
                <li
                  key={field}
                  className="theme-card theme-border border rounded-lg px-3 py-2 text-xs md:text-sm theme-text-muted"
                >
                  {field}
                </li>
              ))}
            </ul>
            <p className="theme-text-muted text-xs italic mt-5">
              Bail-out typically happens around field five.
            </p>
          </div>

          <div className="theme-card theme-border border rounded-3xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-5">
              <p className="theme-label text-xs font-semibold uppercase tracking-widest">
                What mobile actually needs
              </p>
              <span className="theme-badge inline-block text-[11px] font-bold uppercase tracking-[0.16em] px-3 py-1 rounded-full">
                4 fields
              </span>
            </div>
            <ul className="space-y-2 mb-6">
              {tight.map((field) => (
                <li
                  key={field}
                  className="theme-card-strong theme-border border rounded-lg px-3 py-2.5 text-sm theme-text-primary font-medium"
                >
                  {field}
                </li>
              ))}
            </ul>
            <div className="theme-card-muted theme-border border rounded-xl p-4">
              <p className="theme-text-secondary text-sm leading-relaxed">
                <strong className="theme-text-primary">Rule of thumb.</strong>{" "}
                Everything insurance- and history-related moves to a post-book
                email or in-office paperwork. The website&rsquo;s job is the
                appointment. Billing comes next.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              t: "Sticky tap-to-call",
              b: "Evening callers close tabs. A tap-to-call phone pinned to the header catches the appointments that wouldn't have become form submissions.",
            },
            {
              t: "First-visit page",
              b: "Linked from the hero, not buried. Four things: what the room looks like, whether you can be in it, what will and won't happen, how long it takes.",
            },
            {
              t: "Split new vs. existing",
              b: "Existing patients get a one-field flow. Lumping them into the new-patient form is the single biggest mobile-booking leak.",
            },
          ].map((item) => (
            <div key={item.t} className="theme-card theme-border border rounded-2xl p-5">
              <p className="theme-text-primary text-sm font-semibold mb-2">{item.t}</p>
              <p className="theme-text-secondary text-sm leading-relaxed">{item.b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Sedation: 3-column comparison table ───────────────────────────────────── */

function SedationPlaybook() {
  const rows: { label: string; nitrous: string; oral: string; iv: string }[] = [
    {
      label: "What it feels like",
      nitrous: "A slight floating, still fully aware.",
      oral: "Drowsy, very calm, fuzzy edges to the visit.",
      iv: "Mostly not present. Most patients don't remember it.",
    },
    {
      label: "Good for",
      nitrous: "Mild anxiety, cleanings, short visits.",
      oral: "Moderate anxiety, longer visits, crowns, multiple fillings.",
      iv: "Severe anxiety, long complex work, wisdom teeth, full arch.",
    },
    {
      label: "Drive home?",
      nitrous: "Yes, right after.",
      oral: "No — you'll need someone to drive.",
      iv: "No — you'll need an escort home.",
    },
    {
      label: "Recovery",
      nitrous: "Wears off within minutes.",
      oral: "Groggy for 2–4 hours. Rest the day.",
      iv: "Groggy for 2–3 hours. Full day of rest recommended.",
    },
  ];

  return (
    <section className="theme-section-muted border-y theme-border py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHead
          eyebrow="The sedation playbook"
          headlineTop="Fearful patients need"
          headlineBottom="to self-qualify."
          lede="Patients who search “sedation dentist near me” are pre-committed to the category. They don't need convincing that sedation exists — they need to know which option is right for them before they pick up the phone."
        />

        <div className="theme-card theme-border border rounded-3xl overflow-hidden mb-10">
          <div className="grid grid-cols-4 theme-card-muted">
            <div className="px-4 py-4 md:px-6 md:py-5 text-xs md:text-sm font-semibold theme-text-muted uppercase tracking-wider">
              &nbsp;
            </div>
            <div className="px-4 py-4 md:px-6 md:py-5 text-sm md:text-base font-bold theme-text-primary border-l theme-border">
              Nitrous
            </div>
            <div className="px-4 py-4 md:px-6 md:py-5 text-sm md:text-base font-bold theme-text-primary border-l theme-border">
              Oral (pill)
            </div>
            <div className="px-4 py-4 md:px-6 md:py-5 text-sm md:text-base font-bold theme-text-primary border-l theme-border">
              IV
            </div>
          </div>
          {rows.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-4 border-t theme-border"
            >
              <div className="px-4 py-4 md:px-6 md:py-5 text-xs md:text-sm font-semibold theme-label uppercase tracking-wider">
                {row.label}
              </div>
              <div className="px-4 py-4 md:px-6 md:py-5 text-xs md:text-sm theme-text-secondary leading-relaxed border-l theme-border">
                {row.nitrous}
              </div>
              <div className="px-4 py-4 md:px-6 md:py-5 text-xs md:text-sm theme-text-secondary leading-relaxed border-l theme-border">
                {row.oral}
              </div>
              <div className="px-4 py-4 md:px-6 md:py-5 text-xs md:text-sm theme-text-secondary leading-relaxed border-l theme-border">
                {row.iv}
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="theme-card theme-border border rounded-2xl p-6">
            <p className="theme-label text-xs font-semibold uppercase tracking-widest mb-3">
              What patients Google
            </p>
            <ul className="space-y-2 theme-text-primary text-sm md:text-base">
              <li>&ldquo;haven&rsquo;t been to a dentist in years&rdquo;</li>
              <li>&ldquo;needles terrify me&rdquo;</li>
              <li>&ldquo;bad gag reflex&rdquo;</li>
              <li>&ldquo;last visit was traumatic&rdquo;</li>
            </ul>
          </div>
          <div className="theme-card-muted theme-border border rounded-2xl p-6">
            <p className="theme-label text-xs font-semibold uppercase tracking-widest mb-3">
              What sites actually say
            </p>
            <ul className="space-y-2 theme-text-muted text-sm md:text-base line-through decoration-1 decoration-dashed">
              <li>&ldquo;dental anxiety&rdquo;</li>
              <li>&ldquo;oral sedation protocol&rdquo;</li>
              <li>&ldquo;conscious sedation services&rdquo;</li>
              <li>&ldquo;compassionate anxiety management&rdquo;</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Emergency: 3-step routing timeline ────────────────────────────────────── */

function EmergencyPlaybook() {
  const steps: { n: string; title: string; body: string; badge: string }[] = [
    {
      n: "01",
      title: "Time-of-day check",
      body: "Site detects hours and flips a live badge. Business hours: “Open now — tap to call.” After hours: “After-hours line — tap to call on-call.” No static phone number that lies.",
      badge: "Open now",
    },
    {
      n: "02",
      title: "Route by urgency",
      body: "True emergencies hit the on-call line with one tap. Urgent-but-not-severe patients see a triage page with a same-day slot banner and a “book first slot tomorrow” button.",
      badge: "Route",
    },
    {
      n: "03",
      title: "Confirmation that sticks",
      body: "On booking, a text confirmation arrives in under a minute with the address, parking notes, and “if pain worsens, call this number.” The patient stops shopping.",
      badge: "Confirmed",
    },
  ];

  return (
    <section className="theme-section-muted border-y theme-border py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHead
          eyebrow="The emergency playbook"
          headlineTop="One tap, one call,"
          headlineBottom="one confirmation."
          lede="A cracked molar at 9pm is the highest-intent query in dentistry. The patient will spend less than 60 seconds on your site. The routing has to be honest, live, and obvious."
        />

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.n} className="theme-card theme-border border rounded-3xl p-7">
              <div className="flex items-center justify-between mb-5">
                <p className="theme-label text-xs font-semibold uppercase tracking-[0.22em]">
                  {step.n}
                </p>
                <span className="theme-badge inline-block text-[11px] font-bold uppercase tracking-[0.18em] px-3 py-1 rounded-full">
                  {step.badge}
                </span>
              </div>
              <h3 className="theme-text-primary text-xl md:text-2xl font-bold leading-tight mb-3">
                {step.title}
              </h3>
              <p className="theme-text-secondary text-sm md:text-base leading-relaxed">
                {step.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 theme-card-strong theme-border border rounded-3xl p-6 md:p-8 grid gap-4 md:grid-cols-[1fr,auto] items-center">
          <div>
            <p className="theme-label text-xs font-semibold uppercase tracking-widest mb-2">
              Same-day slot banner
            </p>
            <p className="theme-text-primary text-base md:text-lg font-semibold">
              &ldquo;Two same-day emergency slots open. Cutoff 3pm today.&rdquo;
            </p>
            <p className="theme-text-secondary text-sm mt-2">
              Wired to practice hours. Goes dark when full. Never promises what
              the schedule can&rsquo;t deliver.
            </p>
          </div>
          <div className="theme-badge inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.18em] self-start md:self-auto">
            <span className="w-2 h-2 rounded-full bg-current" />
            Live
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── FFS / Membership: 3 pricing cards ─────────────────────────────────────── */

function MembershipPlaybook() {
  const tiers = [
    {
      name: "Adult Preventive",
      price: "$39",
      per: "/mo",
      includes: [
        "2 cleanings / year",
        "2 exams / year",
        "All routine X-rays",
        "15% off all treatment",
      ],
      featured: false,
    },
    {
      name: "Adult + Perio",
      price: "$59",
      per: "/mo",
      includes: [
        "3 periodontal maintenance visits",
        "2 exams / year",
        "All routine X-rays",
        "20% off all treatment",
      ],
      featured: true,
    },
    {
      name: "Child",
      price: "$29",
      per: "/mo",
      includes: [
        "2 cleanings / year",
        "2 exams / year",
        "Fluoride + sealants included",
        "15% off all treatment",
      ],
      featured: false,
    },
  ];

  return (
    <section className="theme-section-muted border-y theme-border py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHead
          eyebrow="The FFS playbook"
          headlineTop="The pricing page"
          headlineBottom="is the positioning."
          lede="Out-of-network works when the site makes the model obvious before a patient ever calls. Membership tiers priced openly, services transparently costed, and a Join button that actually collects payment."
        />

        <div className="grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-3xl border p-7 flex flex-col ${
                tier.featured ? "theme-card-accent" : "theme-card theme-border"
              }`}
            >
              <div className="mb-5">
                <p className="theme-label text-xs font-semibold uppercase tracking-widest mb-1">
                  {tier.featured ? "Most chosen" : "Plan"}
                </p>
                <h3 className="theme-text-primary text-xl md:text-2xl font-bold leading-tight">
                  {tier.name}
                </h3>
              </div>
              <div className="flex items-baseline gap-1 mb-5">
                <span className="theme-text-primary text-4xl font-bold tracking-tight">
                  {tier.price}
                </span>
                <span className="theme-text-muted text-sm">{tier.per}</span>
              </div>
              <ul className="space-y-2 mb-6 flex-1">
                {tier.includes.map((line) => (
                  <li
                    key={line}
                    className="theme-text-secondary text-sm leading-relaxed flex gap-2"
                  >
                    <span className="theme-label font-bold mt-0.5 select-none">
                      &rarr;
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <div
                className={`inline-flex items-center justify-center gap-2 font-semibold px-5 py-2.5 rounded-xl text-sm ${
                  tier.featured ? "theme-cta-accent" : "theme-cta"
                }`}
              >
                Join &mdash; Stripe
              </div>
            </div>
          ))}
        </div>

        <p className="theme-text-muted text-xs md:text-sm italic mt-6 max-w-3xl leading-relaxed">
          Illustrative tiers &mdash; your plan, pricing, and inclusions are
          what actually ship. The point is that they live on a page, not in a PDF.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="theme-card theme-border border rounded-2xl p-6">
            <p className="theme-label text-xs font-semibold uppercase tracking-widest mb-3">
              Keep on the site
            </p>
            <ul className="space-y-2 theme-text-primary text-sm md:text-base">
              <li>&ldquo;Starting at&rdquo; prices on every common procedure</li>
              <li>Membership-discounted price next to each</li>
              <li>One honest line on how out-of-network filing works</li>
              <li>Stripe-backed Join button, not a PDF</li>
            </ul>
          </div>
          <div className="theme-card-muted theme-border border rounded-2xl p-6">
            <p className="theme-label text-xs font-semibold uppercase tracking-widest mb-3">
              Cut from the homepage
            </p>
            <ul className="space-y-2 theme-text-muted text-sm md:text-base line-through decoration-1 decoration-dashed">
              <li>&ldquo;We accept most insurances&rdquo;</li>
              <li>Insurance-logo strip</li>
              <li>&ldquo;Fill out this form to verify your benefits&rdquo;</li>
              <li>PDF-only plan details</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function SpecialtyPlaybook({ slug }: { slug: PracticeTypeSlug }) {
  switch (slug) {
    case "cosmetic-dentist-website":
      return <CosmeticPlaybook />;
    case "pediatric-dentist-website":
      return <PediatricPlaybook />;
    case "sedation-dentist-website":
      return <SedationPlaybook />;
    case "emergency-dentist-website":
      return <EmergencyPlaybook />;
    case "fee-for-service-dentist-website":
      return <MembershipPlaybook />;
  }
}
