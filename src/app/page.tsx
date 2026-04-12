import Link from "next/link";
import CompanyBrainDemo from "@/components/CompanyBrainDemo";

// ── icons ────────────────────────────────────────────────────────────

function EnvelopeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="3.5" width="13" height="10" rx="1.5" />
      <path d="M1.5 5.5l6.5 4.5 6.5-4.5" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 1.5H3.5A1 1 0 002.5 2.5v11a1 1 0 001 1h9a1 1 0 001-1V7l-4.5-5.5z" />
      <path d="M9 1.5V7h4.5" />
      <path d="M5.5 9.5h5M5.5 11.5h3.5" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 4.5a1 1 0 011-1h3.5l1.5 1.5H13a1 1 0 011 1v6a1 1 0 01-1 1h-10a1 1 0 01-1-1v-7.5z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13.5 10.5l-2.5-1a1 1 0 00-1 .2l-1 1a8.5 8.5 0 01-4.7-4.7l1-1a1 1 0 00.2-1l-1-2.5A1 1 0 003.5 1.5H2a1 1 0 00-1 1C1 8.9 7.1 15 14.5 15a1 1 0 001-1v-1.5a1 1 0 00-2-2z" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="2" width="11" height="13" rx="1" />
      <path d="M5.5 2a2.5 2.5 0 015 0" />
      <path d="M5 7h6M5 9.5h6M5 12h4" />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="1.5" width="12" height="13" rx="1" />
      <path d="M5 5h6M5 7.5h6M5 10h4" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="5" r="2.5" />
      <path d="M1 13.5c0-2.8 2.2-5 5-5s5 2.2 5 5" />
      <path d="M11 3.5a2.5 2.5 0 010 5M15 13.5a5 5 0 00-4-4.9" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="2.5" width="13" height="12" rx="1.5" />
      <path d="M5 1.5v2M11 1.5v2M1.5 6.5h13" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="5.5" r="2.5" />
      <path d="M2.5 14c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5" />
    </svg>
  );
}

function CheckIcon({ green = false }: { green?: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="flex-shrink-0">
      <circle cx="7.5" cy="7.5" r="7.5" fill={green ? "#22c55e" : "#22c55e"} />
      <path d="M4 7.5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="flex-shrink-0">
      <circle cx="7.5" cy="7.5" r="7.5" fill="#e5e7eb" />
      <path d="M5 5l5 5M10 5l-5 5" stroke="#9ca3af" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function PartialIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="flex-shrink-0">
      <circle cx="7.5" cy="7.5" r="7.5" fill="#fef3c7" />
      <path d="M4.5 7.5h6" stroke="#d97706" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

function BrainIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2a4.5 4.5 0 014.5 4.5v.5M9.5 2a4.5 4.5 0 00-4.5 4.5v.5M9.5 2v2M14 7h1.5a4.5 4.5 0 010 9H14M5 7H3.5a4.5 4.5 0 000 9H5M14 16v2a4 4 0 01-4 4 4 4 0 01-4-4v-2M14 16H5" />
    </svg>
  );
}

// ── data ─────────────────────────────────────────────────────────────

const painScenarios = [
  { role: "Estimator", scenario: "Your lead estimator gives notice. Half your pricing logic is in his head." },
  { role: "Office", scenario: "Your estimator asks if a quote was already sent to this client." },
  { role: "PM", scenario: "Your PM asks what got promised on a job from last spring." },
  { role: "Owner", scenario: "Everyone asks you — because you're still the system." },
];

const docSources = [
  { icon: "envelope", label: "Email threads" },
  { icon: "file", label: "Quote PDFs" },
  { icon: "folder", label: "Job folders" },
  { icon: "phone", label: "Vendor call notes" },
  { icon: "clipboard", label: "SOPs & policies" },
  { icon: "note", label: "Job notes" },
];

const comparisons = [
  {
    solution: "Shared drive / Notion / wiki",
    note: "Someone has to write it first",
    behaviorChange: true,
    worksOnMess: false as boolean | "partial",
    queryable: false as boolean | "partial",
  },
  {
    solution: "Hire SOP consultant",
    note: "Major project; output still isn't queryable",
    behaviorChange: true,
    worksOnMess: false as boolean | "partial",
    queryable: false as boolean | "partial",
  },
  {
    solution: "NotebookLM / Claude Projects",
    note: "Works up to ~50 docs. No live inboxes, no ongoing curation",
    behaviorChange: true,
    worksOnMess: "partial" as boolean | "partial",
    queryable: "partial" as boolean | "partial",
  },
];

const setupSteps = [
  {
    week: "Week 1",
    title: "Map the knowledge mess",
    body: "We get access to the inboxes, drives, and job systems that matter. We find the landmines — the \"OLD pricing DO NOT USE\" folder that's been the reference for three years, the shared inbox nobody monitors, the estimator who keeps everything in a personal Gmail.",
  },
  {
    week: "Week 2–3",
    title: "Build and tune",
    body: "We pick one high-value slice — the last 3 years of accepted quotes, the vendor email threads — and build the first working index. Then we sit with your estimator and PM and have them ask real questions from their actual workday. Half the answers will be incomplete on first pass. We fix it.",
  },
  {
    week: "Week 4",
    title: "Handoff and guardrails",
    body: "We train the team on how to ask questions that work, how to flag wrong answers, and how to add new documents going forward. We set up a feedback loop so we can tune it again in 30 days.",
  },
  {
    week: "Ongoing",
    title: "Monthly tuning and curation",
    body: "New documents need to be ingested. Stale ones flagged. The team finds new failure modes. If you're not in a retainer relationship, the system decays. If you are, it compounds. This is why we price it as an ongoing engagement.",
  },
];

const fitPoints = [
  { icon: "users", text: "5–25 person HVAC, plumbing, electrical, roofing, GC, or similar service team" },
  { icon: "calendar", text: "In business 8+ years with context accumulated across hundreds of jobs" },
  { icon: "person", text: "Owner still answers routine operational questions most days" },
  { icon: "folder", text: "Knowledge spread across email, notes, drives, and job folders — never formalized" },
];

function FitIcon({ icon }: { icon: string }) {
  if (icon === "users") return <UsersIcon />;
  if (icon === "calendar") return <CalendarIcon />;
  if (icon === "person") return <PersonIcon />;
  return <FolderIcon />;
}

function SourceIcon({ icon }: { icon: string }) {
  if (icon === "envelope") return <EnvelopeIcon />;
  if (icon === "file") return <FileIcon />;
  if (icon === "phone") return <PhoneIcon />;
  if (icon === "clipboard") return <ClipboardIcon />;
  if (icon === "note") return <NoteIcon />;
  return <FolderIcon />;
}

function CompCell({ value }: { value: boolean | "partial" }) {
  if (value === true) return <CheckIcon green />;
  if (value === "partial") return <PartialIcon />;
  return <XIcon />;
}

// ── Pipeline diagram (How It Works illustration) ──────────────────────

function PipelineDiagram() {
  return (
    <div className="mt-8 p-5 bg-white/[0.04] border border-white/[0.07] rounded-2xl">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30 mb-5">
        How it flows
      </p>
      <div className="flex items-stretch gap-3">
        {/* Source docs column */}
        <div className="flex flex-col gap-2 flex-shrink-0 justify-center">
          {[
            { icon: "envelope", label: "Sent email" },
            { icon: "file", label: "Quote PDFs" },
            { icon: "folder", label: "Job notes" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2 bg-white/[0.05] border border-white/[0.07] rounded-lg px-2.5 py-1.5">
              <span className="text-white/35 flex-shrink-0"><SourceIcon icon={s.icon} /></span>
              <span className="text-[11px] text-white/40 leading-none">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Arrow left */}
        <div className="flex items-center flex-1 min-w-0">
          <div className="flex-1 h-px bg-white/10" />
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="flex-shrink-0">
            <path d="M1 5h8M6 2l3 3-3 3" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Company Brain node */}
        <div className="flex flex-col items-center justify-center flex-shrink-0 gap-2">
          <div className="w-14 h-14 rounded-2xl bg-green-500/15 border border-green-500/25 flex items-center justify-center text-green-400">
            <BrainIcon />
          </div>
          <span className="text-[10px] text-white/35 text-center leading-tight max-w-[60px]">Company Brain</span>
        </div>

        {/* Arrow right */}
        <div className="flex items-center flex-1 min-w-0">
          <div className="flex-1 h-px bg-white/10" />
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="flex-shrink-0">
            <path d="M1 5h8M6 2l3 3-3 3" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Answer block */}
        <div className="flex-shrink-0 flex items-center">
          <div className="bg-green-500/[0.1] border border-green-500/[0.2] rounded-xl px-3 py-3 max-w-[130px]">
            <p className="text-[11px] text-green-300/80 leading-relaxed">Answer with source citation</p>
          </div>
        </div>
      </div>

      {/* Honest caveat */}
      <p className="text-[11px] text-white/25 leading-relaxed mt-5 pt-4 border-t border-white/[0.06]">
        Ten years of documents also means ten years of outdated pricing and superseded SOPs. Part of what we do is teach the system which sources to trust, and flag conflicts instead of guessing.
      </p>
    </div>
  );
}

// ── page ─────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-white pt-24 md:pt-32">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="grid lg:grid-cols-[1.2fr,0.8fr] gap-14 items-start">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-green-700 mb-5">
                Greenville SC — Owner-Led Service Businesses
              </span>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-black leading-[1.02] mb-6">
                Your lead estimator
                <br />
                gives notice.
                <br />
                Where does 10 years
                <br />
                of knowledge go?
              </h1>
              <p className="text-lg text-gray-700 leading-relaxed mb-3 max-w-2xl">
                Company Brain is a private AI knowledge system built from the
                documents your company already has — quotes, job notes, emails,
                SOPs, and vendor files.
              </p>
              <p className="text-base text-gray-500 leading-relaxed mb-10 max-w-2xl">
                You don&apos;t need to build a wiki or retrain your team on new
                software. The behavior change is on our side — we do the
                ingestion, tuning, and ongoing curation. Your team just asks
                questions.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 bg-black text-white text-base font-medium px-7 py-3.5 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Book a Setup Call
                  <ArrowIcon />
                </Link>
              </div>
              <p className="text-xs text-gray-400">
                Two to four weeks of scoped setup, then ongoing tuning.
                Not a self-serve tool.
              </p>
            </div>

            {/* Pain card */}
            <div className="bg-stone-50 border border-stone-200 rounded-3xl p-8 md:p-10">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                    Typical Week
                  </p>
                  <h2 className="text-xl font-bold text-black mt-2">
                    The owner is still the system.
                  </h2>
                </div>
                <span className="text-xs font-bold bg-green-100 text-green-800 px-3 py-1 rounded-full whitespace-nowrap">
                  Sound familiar?
                </span>
              </div>
              <div className="space-y-3">
                {painScenarios.map((item) => (
                  <div
                    key={item.scenario}
                    className="bg-white border border-stone-200 rounded-2xl px-4 py-3.5 flex items-start gap-3"
                  >
                    <span className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-stone-400 w-16 flex-shrink-0 pt-0.5">
                      {item.role}
                    </span>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {item.scenario}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-stone-200">
                <p className="text-sm text-gray-500 leading-relaxed">
                  As long as you&apos;re the system, you&apos;re also the ceiling.
                  Every new hire and every expansion adds to the load.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Company Brain demo ── */}
      <section className="bg-gray-950 text-white py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-[0.95fr,1.05fr] gap-16 items-start">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-green-500 mb-4">
                How It Works
              </span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5">
                Your company
                <br />
                already knows
                <br />
                the answer.
              </h2>
              <p className="text-gray-400 leading-relaxed text-base mb-6">
                Ten years of knowledge is sitting in your sent folder, quote
                files, and job notes right now. Nobody can find it fast enough
                to use it — so they ask the person who already knows. Company
                Brain reads everything that&apos;s already there and returns
                answers with citations back to the source.
              </p>

              {/* Document source grid */}
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-3">
                What it reads
              </p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {docSources.map((src) => (
                  <div
                    key={src.label}
                    className="flex items-center gap-2 bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white/60"
                  >
                    <span className="flex-shrink-0 text-white/40">
                      <SourceIcon icon={src.icon} />
                    </span>
                    <span className="text-xs leading-tight">{src.label}</span>
                  </div>
                ))}
              </div>

              <PipelineDiagram />
            </div>

            <CompanyBrainDemo />
          </div>
        </div>
      </section>

      {/* ── Comparison ── */}
      <section className="bg-white py-24 md:py-32 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-green-700 mb-4">
              Why Not Just Use...
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-black leading-tight mb-5">
              Every other solution
              <br />
              asks you to change first.
            </h2>
            <p className="text-gray-500 leading-relaxed">
              The tools already exist. The problem is they all require someone
              to start putting things in before they return anything useful.
              Company Brain starts with what&apos;s already there.
            </p>
          </div>

          {/* Comparison table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 pr-6 text-xs font-semibold uppercase tracking-widest text-gray-400 w-[38%]">
                    Solution
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-widest text-gray-400 w-[20%]">
                    Behavior change first?
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-widest text-gray-400 w-[20%]">
                    Works on existing mess?
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-widest text-gray-400 w-[22%]">
                    Conversationally queryable?
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row) => (
                  <tr key={row.solution} className="border-b border-gray-50">
                    <td className="py-4 pr-6">
                      <p className="text-sm font-semibold text-black">{row.solution}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{row.note}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <XIcon />
                        <span className="text-xs text-gray-400">Required</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <CompCell value={row.worksOnMess} />
                        <span className="text-xs text-gray-400">
                          {row.worksOnMess === "partial" ? "Partially" : "No"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <CompCell value={row.queryable} />
                        <span className="text-xs text-gray-400">
                          {row.queryable === "partial" ? "Partially" : "No"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Company Brain row — highlighted */}
                <tr className="bg-green-50 border border-green-200 rounded-2xl">
                  <td className="py-5 pr-6 pl-5 rounded-l-2xl">
                    <p className="text-sm font-bold text-black">Company Brain</p>
                    <p className="text-xs text-green-700 mt-0.5">Ingests what&apos;s already there</p>
                  </td>
                  <td className="py-5 px-4">
                    <div className="flex items-center gap-2">
                      <CheckIcon />
                      <span className="text-xs font-semibold text-green-700">Not required</span>
                    </div>
                  </td>
                  <td className="py-5 px-4">
                    <div className="flex items-center gap-2">
                      <CheckIcon />
                      <span className="text-xs font-semibold text-green-700">Yes</span>
                    </div>
                  </td>
                  <td className="py-5 px-4 rounded-r-2xl">
                    <div className="flex items-center gap-2">
                      <CheckIcon />
                      <span className="text-xs font-semibold text-green-700">Yes — with citations</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* NotebookLM honest note */}
          <p className="text-xs text-gray-400 mt-6 leading-relaxed max-w-2xl">
            For a 3-person shop with a clean Google Drive and 200 documents, NotebookLM is probably the right answer — it&apos;s free and it works. Company Brain is for the 14-year company with thousands of documents across scattered systems that no consumer tool was built to handle.
          </p>
        </div>
      </section>

      {/* ── Setup process ── */}
      <section className="bg-white py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-[0.9fr,1.1fr] gap-16 items-start">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-green-700 mb-4">
                Setup Process
              </span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-black leading-tight mb-5">
                Ready in weeks.
                <br />
                Built around how
                <br />
                you actually work.
              </h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                Not a login we throw over the fence. The first version is
                scoped around real questions, connected to real sources, and
                tuned with the people who need it most. The hard part isn&apos;t
                the technology — it&apos;s the judgment calls about what to
                ingest, what to exclude, and how to handle conflicts.
                That&apos;s the consulting.
              </p>

              {/* Estimator vault callout */}
              <div className="bg-gray-950 text-white rounded-2xl p-6 mb-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-green-500 mb-3">
                  Where we start
                </p>
                <p className="text-sm text-gray-300 leading-relaxed mb-0">
                  &ldquo;What happens if your lead estimator leaves tomorrow?
                  We start there — build his vault while he&apos;s still here,
                  feed it with 5 years of quotes and emails, capture what&apos;s
                  only in his head. Highest-risk gap first. Then expand.&rdquo;
                </p>
              </div>

              {/* Pricing transparency */}
              <div className="border border-gray-100 rounded-2xl p-5 mb-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Pricing</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Engagements start with a scoped setup fee, then a monthly
                  retainer for re-ingestion, tuning, and team support. The
                  retainer is what keeps the system current — without it, it
                  decays. We&apos;ll scope both numbers on the first call.
                </p>
              </div>

              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-2 bg-black text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-gray-800 transition-colors"
              >
                See The Full Process
                <ArrowIcon />
              </Link>
            </div>

            {/* Setup steps with week timeline */}
            <div className="relative">
              {/* Vertical connecting line */}
              <div className="absolute left-[19px] top-8 bottom-8 w-px bg-gray-100 hidden sm:block" aria-hidden="true" />
              <div className="space-y-4">
                {setupSteps.map((item, i) => (
                  <div key={item.week} className="relative flex gap-5">
                    {/* Week dot */}
                    <div className="flex-shrink-0 flex flex-col items-center">
                      <div className={`w-[38px] h-[38px] rounded-full border-2 flex items-center justify-center text-[10px] font-bold z-10 ${
                        item.week === "Ongoing"
                          ? "bg-green-50 border-green-200 text-green-700"
                          : "bg-white border-gray-200 text-gray-400"
                      }`}>
                        {i + 1}
                      </div>
                    </div>
                    <div className="flex-1 border border-gray-100 rounded-2xl p-6 mb-0">
                      <div className="text-xs font-semibold text-green-700 mb-1.5">{item.week}</div>
                      <h3 className="text-lg font-bold text-black mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Best fit ── */}
      <section className="bg-gray-50 py-24 md:py-32 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-[0.9fr,1.1fr] gap-16 items-start">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-green-700 mb-4">
                Best Fit
              </span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-black leading-tight mb-5">
                Built for the company
                <br />
                with years of context
                <br />
                and nowhere to put it.
              </h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                Tenure plus accumulated chaos — not just headcount. A 2-year
                startup doesn&apos;t have this problem. A 14-year GC with 3
                PMs and 10 subs does.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-black text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-gray-800 transition-colors"
              >
                See If You Fit
                <ArrowIcon />
              </Link>
            </div>

            <div className="space-y-4">
              {/* Who it IS for */}
              <div className="grid sm:grid-cols-2 gap-4">
                {fitPoints.map((item) => (
                  <div
                    key={item.text}
                    className="bg-white border border-gray-200 rounded-2xl p-5 flex items-start gap-3"
                  >
                    <span className="mt-0.5 w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0 text-green-700">
                      <FitIcon icon={item.icon} />
                    </span>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>

              {/* Who this isn't for */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-amber-700 mb-3">
                  Who this isn&apos;t for
                </p>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  If you&apos;re under 8 years old, under 5 people, or your documents
                  already live cleanly in one system — you probably don&apos;t need us.
                  Try NotebookLM or Claude Projects first. They&apos;re free, and for
                  a tidy operation they&apos;ll do the job.
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  We&apos;ll tell you this on the first call if it applies. The
                  people who do fit trust the rest of what we say because of it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Data security ── */}
      <section className="bg-white py-24 md:py-32 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-16">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-green-700 mb-4">
              Data Security
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-black leading-tight mb-5">
              Your documents
              <br />
              aren&apos;t for training
              <br />
              someone else&apos;s AI.
            </h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              Most AI tools are consumer products. Uploading your quotes,
              contracts, and job history to them carries real risks that most
              business owners don&apos;t read the fine print on.
            </p>
            <div className="space-y-3">
              {[
                {
                  label: "Your data may train the model.",
                  body: "Consumer AI tools — ChatGPT, Claude.ai free and paid plans — can use your inputs to improve future versions of the model. Your pricing, customer details, and internal processes become part of the training set.",
                },
                {
                  label: "Retention isn't guaranteed.",
                  body: "Consumer products have no committed deletion timeline. Your documents sit on third-party servers indefinitely unless you manually request removal — and even then it isn't always clean.",
                },
                {
                  label: "\"Private\" doesn't mean no one sees it.",
                  body: "AI providers reserve the right to review conversations for safety and trust purposes. Sensitive contracts, proformas, or personnel notes have no privilege protections once uploaded.",
                },
              ].map((item) => (
                <div key={item.label} className="border border-gray-100 rounded-2xl p-6">
                  <p className="text-sm font-semibold text-black mb-1">{item.label}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                tag: "Maximum Privacy",
                title: "Air-Gapped",
                subtitle: "Nothing leaves your building.",
                body: "The AI model runs entirely on your hardware using open-source models. No data ever touches an external server. Best fit for regulated industries or highly sensitive documents.",
                tradeoff: "Tradeoff: lower model quality than cloud AI.",
                accent: "bg-gray-950 text-white",
                tagStyle: "bg-white/10 text-gray-300",
                bodyStyle: "text-gray-400",
                tradeoffStyle: "text-gray-600",
              },
              {
                tag: "REBB Default",
                title: "API — Secure by Design",
                subtitle: "Commercial-grade. Not the consumer chatbot.",
                body: "We use Claude's commercial API — a contractually different product from Claude.ai. By default: your data is never used to train the model, retained for 7 days only, then deleted. No opting in required.",
                tradeoff: "Best quality. Contractually clean. This is what we recommend for most clients.",
                accent: "bg-green-950 text-white",
                tagStyle: "bg-green-500/20 text-green-400",
                bodyStyle: "text-gray-400",
                tradeoffStyle: "text-green-500",
              },
              {
                tag: "Middle Ground",
                title: "Hybrid",
                subtitle: "Docs local. Queries go out, not documents.",
                body: "Your source documents stay on your machine or internal network. When someone asks a question, only the question and the matched excerpt — not the full file — are sent to the API.",
                tradeoff: "Best of both: local control with full model quality.",
                accent: "bg-gray-950 text-white",
                tagStyle: "bg-white/10 text-gray-300",
                bodyStyle: "text-gray-400",
                tradeoffStyle: "text-gray-400",
              },
            ].map((card) => (
              <div key={card.title} className={`${card.accent} rounded-2xl p-7 flex flex-col`}>
                <span className={`inline-block text-xs font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full mb-5 self-start ${card.tagStyle}`}>
                  {card.tag}
                </span>
                <h3 className="text-xl font-bold mb-1">{card.title}</h3>
                <p className="text-sm font-medium text-gray-300 mb-4">{card.subtitle}</p>
                <p className={`text-sm leading-relaxed mb-5 flex-1 ${card.bodyStyle}`}>{card.body}</p>
                <p className={`text-xs leading-relaxed border-t border-white/10 pt-4 ${card.tradeoffStyle}`}>{card.tradeoff}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-white py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.25em] text-gray-400 mb-4">
              Primary Next Step
            </span>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-black mb-6 leading-tight">
              Your team is still
              <br />
              calling the owner.
              <br />
              Let&apos;s fix that.
            </h2>
            <p className="text-lg md:text-xl text-gray-500 mb-10 leading-relaxed">
              We map the knowledge mess, build the first usable version, and
              tune it until the team asks the system before they ask you.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-black text-white font-semibold text-base px-8 py-4 rounded-xl hover:bg-gray-800 transition-colors"
            >
              Book a Setup Call
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
