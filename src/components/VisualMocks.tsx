// Synthetic visual mocks of broken dental-practice websites.
// No real company names, logos, or identifiable layouts.
// Pure presentational server components — no state, no interactivity.

function ToothIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" className={className}>
      <path d="M16 2 C 8 2 6 6 6 11 C 6 14 7 17 8 19 C 9 21 10 29 12 29 C 14 29 14 21 16 21 C 18 21 18 29 20 29 C 22 29 23 21 24 19 C 25 17 26 14 26 11 C 26 6 24 2 16 2 Z" />
    </svg>
  );
}

function BrowserChrome({ url }: { url?: string }) {
  return (
    <div className="h-7 bg-neutral-100 border-b border-neutral-200 flex items-center gap-1.5 px-3">
      <span className="w-2 h-2 rounded-full bg-red-400/80" />
      <span className="w-2 h-2 rounded-full bg-yellow-400/80" />
      <span className="w-2 h-2 rounded-full bg-green-400/80" />
      {url && (
        <span className="ml-3 text-[10px] text-neutral-500 font-mono truncate">
          {url}
        </span>
      )}
    </div>
  );
}

export function BrokenPhoneHero() {
  return (
    <div className="relative mx-auto w-[260px] md:w-[280px] select-none" aria-hidden="true">
      <style>{`
        @keyframes rebb-spin { to { transform: rotate(360deg); } }
        @keyframes rebb-progress {
          0% { width: 18%; }
          40% { width: 38%; }
          70% { width: 52%; }
          100% { width: 64%; }
        }
        @keyframes rebb-tick {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
      `}</style>

      <div
        className="rounded-[2.5rem] border-[10px] border-neutral-900 bg-white shadow-2xl overflow-hidden relative"
        style={{ aspectRatio: "9 / 18" }}
      >
        <BrowserChrome url="smiledental.com" />

        <div
          className="absolute left-0 right-0 h-[3px] bg-red-500"
          style={{
            top: 28,
            animation: "rebb-progress 4s ease-out infinite",
          }}
        />

        <div className="p-3 text-neutral-800">
          <div className="flex items-center gap-1.5 mb-3">
            <ToothIcon className="w-4 h-4 text-neutral-400" />
            <span className="text-[10px] font-bold tracking-tight text-neutral-400">
              SMILE DENTAL
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="h-3 bg-neutral-100 rounded w-[85%]" />
            <div className="h-3 bg-neutral-100 rounded w-[70%]" />
          </div>

          <div className="mt-8 mb-8 flex flex-col items-center justify-center">
            <div
              className="w-9 h-9 rounded-full border-[3px] border-neutral-200 border-t-neutral-700"
              style={{ animation: "rebb-spin 0.9s linear infinite" }}
            />
            <div className="mt-3 text-[9px] text-neutral-400 tracking-wide">
              Loading&hellip;
            </div>
          </div>

          <div className="space-y-1.5 opacity-60">
            <div className="h-2 bg-neutral-100 rounded w-full" />
            <div className="h-2 bg-neutral-100 rounded w-[92%]" />
            <div className="h-2 bg-neutral-100 rounded w-[78%]" />
          </div>

          <div className="mt-4 rounded border border-neutral-200 bg-neutral-50 p-2">
            <div className="text-[7px] uppercase tracking-wider text-neutral-400 font-semibold mb-1">
              Book appointment
            </div>
            <div className="h-4 rounded border border-neutral-200 bg-white flex items-center px-1.5 text-[8px] text-neutral-700">
              Jennif<span className="inline-block w-px h-2 bg-neutral-700 ml-px animate-pulse" />
            </div>
            <div className="h-4 rounded border border-neutral-200 bg-white mt-1" />
            <div className="h-4 rounded border border-neutral-200 bg-white mt-1" />
          </div>
        </div>

        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-2 w-12 h-[3px] rounded-full bg-neutral-900"
        />
      </div>

      <div
        className="absolute -right-4 md:-right-10 top-[18%] flex items-center gap-2"
        style={{ animation: "rebb-tick 1s steps(2, end) infinite" }}
      >
        <span className="font-mono text-[11px] font-bold text-red-600 bg-white border border-red-300 px-2 py-1 rounded-full shadow-md tabular-nums">
          4.2s
        </span>
      </div>

      <div className="absolute -left-6 md:-left-14 bottom-[18%] flex items-center gap-1.5">
        <svg width="34" height="34" viewBox="0 0 40 40" fill="none" className="text-neutral-700">
          <path
            d="M32 28 C 28 14 14 10 6 14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M6 14 L 11 9 M6 14 L 11 19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <span className="text-[10px] font-semibold text-neutral-700 leading-tight">
          swipe<br />back
        </span>
      </div>
    </div>
  );
}

/* ============================================================
 * Aesthetic before/after — dental-office flavor
 * ============================================================ */

function DatedDentalCard() {
  return (
    <div
      className="rounded-md border-2 border-neutral-400 shadow-md overflow-hidden text-center h-full"
      style={{
        fontFamily: '"Times New Roman", Times, serif',
        background: "linear-gradient(180deg, #ece0c4 0%, #d6c29a 100%)",
      }}
    >
      <div className="py-4 px-3">
        <ToothIcon className="w-10 h-10 mx-auto text-neutral-500/70" />
        <div
          className="text-[13px] font-bold italic mt-1 leading-tight"
          style={{
            color: "#4a3d1f",
            textShadow: "1px 1px 0 rgba(255,255,255,0.6)",
          }}
        >
          Welcome to
          <br />
          Smile Dental!
        </div>
        <div
          className="mt-1 text-[8px] leading-tight"
          style={{ color: "#665944" }}
        >
          Your Family Dentist Since 1997
        </div>
        <div
          className="mt-3 inline-block px-3 py-1 rounded text-[8px] font-bold border"
          style={{
            background: "linear-gradient(180deg, #c8b57f 0%, #8a7a4f 100%)",
            borderColor: "#5c4a2a",
            color: "#fff",
            textShadow: "1px 1px 0 rgba(0,0,0,0.4)",
          }}
        >
          CLICK HERE
        </div>
        <div
          className="mt-3 text-[7px]"
          style={{ color: "#1e3a8a", textDecoration: "underline" }}
        >
          contact us today!
        </div>
      </div>
    </div>
  );
}

function ModernDentalCard() {
  return (
    <div className="rounded-md border border-neutral-200 bg-white shadow-md overflow-hidden h-full">
      <div className="py-4 px-3">
        <div className="flex items-center gap-1.5">
          <ToothIcon className="w-3.5 h-3.5 text-teal-600" />
          <span className="text-[8px] font-semibold tracking-tight text-neutral-800">
            SMILE DENTAL
          </span>
        </div>
        <div className="mt-4 text-[14px] font-bold text-neutral-900 leading-[1.1] tracking-tight">
          A calmer
          <br />
          dentist visit.
        </div>
        <div className="mt-1 text-[8px] text-neutral-500 leading-tight">
          Modern care. No rushed cleanings.
        </div>
        <div className="mt-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-teal-600 text-white text-[8px] font-semibold">
          Book now
          <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
        <div className="mt-3 flex items-center gap-0.5 text-[7px]">
          <span className="text-amber-500 tracking-tighter">★★★★★</span>
          <span className="text-neutral-500 ml-1">4.9 · 312 reviews</span>
        </div>
      </div>
    </div>
  );
}

export function AestheticBeforeAfterMock() {
  return (
    <div className="grid grid-cols-2 gap-3" aria-hidden="true">
      <div className="flex flex-col">
        <div className="mb-1.5 flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">
            Before
          </span>
        </div>
        <DatedDentalCard />
      </div>
      <div className="flex flex-col">
        <div className="mb-1.5 flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">
            After
          </span>
        </div>
        <ModernDentalCard />
      </div>
    </div>
  );
}

/* ============================================================
 * Form error (booking flow broken)
 * ============================================================ */

export function FormErrorMock() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-md overflow-hidden" aria-hidden="true">
      <BrowserChrome url="smiledental.com/appointments" />
      <div className="p-4 bg-neutral-50">
        <div className="flex items-center gap-1.5 mb-2">
          <ToothIcon className="w-3.5 h-3.5 text-teal-600" />
          <span className="text-[10px] font-bold tracking-tight text-neutral-900">
            SMILE DENTAL
          </span>
        </div>
        <div className="text-[13px] text-neutral-900 font-bold leading-tight">
          Schedule Your Appointment
        </div>
        <div className="text-[9px] text-neutral-500 mb-3 mt-0.5">
          Same-week availability · Most insurance accepted
        </div>

        <div className="space-y-1.5">
          <div>
            <div className="text-[7px] uppercase tracking-wider text-neutral-500 mb-0.5 font-semibold">
              Name
            </div>
            <div className="h-5 bg-white border border-neutral-200 rounded" />
          </div>
          <div>
            <div className="text-[7px] uppercase tracking-wider text-neutral-500 mb-0.5 font-semibold">
              Phone
            </div>
            <div className="h-5 bg-white border border-neutral-200 rounded" />
          </div>
          <div>
            <div className="text-[7px] uppercase tracking-wider text-neutral-500 mb-0.5 font-semibold">
              Preferred Date
            </div>
            <div className="h-5 bg-white border border-neutral-200 rounded flex items-center px-1.5 text-[8px] text-neutral-400">
              <span>mm / dd / yyyy</span>
              <svg className="w-2.5 h-2.5 ml-auto text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
          </div>
          <div className="h-6 bg-teal-600 rounded text-[8px] font-semibold text-white flex items-center justify-center mt-2 tracking-wide">
            BOOK APPOINTMENT
          </div>
        </div>

        <div className="mt-3 bg-red-50 border border-red-300 rounded-md p-2 flex items-start gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-px">
            !
          </div>
          <div className="min-w-0">
            <div className="text-red-700 text-[10px] font-semibold">
              404 Not Found
            </div>
            <div className="text-red-600 text-[8px] font-mono mt-0.5 truncate">
              POST /book-appointment
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 * Cramped mobile (desktop layout crushed into phone)
 * ============================================================ */

export function CrampedMobileMock() {
  return (
    <div
      className="rounded-xl border border-neutral-200 bg-neutral-100 overflow-hidden flex items-center justify-center py-6"
      aria-hidden="true"
    >
      <div
        className="w-[156px] rounded-[1.5rem] border-[6px] border-neutral-900 bg-white overflow-hidden relative shadow-xl"
        style={{ aspectRatio: "9 / 17" }}
      >
        <div className="h-4 bg-neutral-100 border-b border-neutral-200 flex items-center justify-center">
          <div className="w-10 h-1 bg-neutral-900 rounded-full" />
        </div>
        <div
          className="origin-top-left"
          style={{ transform: "scale(0.33)", width: "440px", height: "auto" }}
        >
          <div className="h-10 bg-neutral-900 flex items-center justify-between px-4 text-white text-[11px]">
            <span className="inline-flex items-center gap-1 font-bold tracking-tight">
              <ToothIcon className="w-3 h-3 text-teal-400" />
              SMILE DENTAL
            </span>
            <span className="flex gap-3 text-neutral-300 text-[10px]">
              <span>Home</span>
              <span>Services</span>
              <span>New Patients</span>
              <span>Our Team</span>
              <span>Insurance</span>
              <span>Reviews</span>
              <span>Contact</span>
            </span>
          </div>
          <div className="p-4">
            <div className="text-[22px] font-bold tracking-tight text-neutral-900 leading-tight">
              Family dentist since 2008.
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              Cleanings, fillings, crowns, whitening, and more — all in one office.
            </div>
            <div className="grid grid-cols-4 gap-2 mt-3">
              {["Cleanings", "Fillings", "Crowns", "Whitening"].map((label) => (
                <div
                  key={label}
                  className="h-16 bg-teal-50 rounded border border-teal-100 flex flex-col items-center justify-center gap-1"
                >
                  <ToothIcon className="w-4 h-4 text-teal-600" />
                  <span className="text-[9px] text-neutral-700 font-medium">
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 h-2 bg-neutral-100 rounded" />
            <div className="mt-1 h-2 bg-neutral-100 rounded w-[80%]" />
          </div>
        </div>
        <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[6px] font-mono text-red-500 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
          no viewport
        </span>
      </div>
    </div>
  );
}

/* ============================================================
 * Stale copyright / abandoned look
 * ============================================================ */

export function StaleFooterMock() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-md overflow-hidden" aria-hidden="true">
      <BrowserChrome />
      <div className="bg-white">
        <div className="p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <ToothIcon className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-[10px] font-bold tracking-tight text-neutral-500">
              SMILE DENTAL
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="h-2 bg-neutral-100 rounded w-3/4" />
            <div className="h-2 bg-neutral-100 rounded w-2/3" />
            <div className="h-2 bg-neutral-100 rounded w-4/5" />
            <div className="h-2 bg-neutral-100 rounded w-1/2" />
          </div>
        </div>
        <div className="border-t border-neutral-200 bg-neutral-900 px-4 py-4">
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <div className="text-[7px] uppercase tracking-wider text-neutral-500 font-semibold mb-1">
                Address
              </div>
              <div className="text-[8px] text-neutral-300 leading-tight">
                123 Main St
                <br />
                Greenville SC
              </div>
            </div>
            <div>
              <div className="text-[7px] uppercase tracking-wider text-neutral-500 font-semibold mb-1">
                Hours
              </div>
              <div className="text-[8px] text-neutral-300 leading-tight">
                Mon – Fri
                <br />
                8am – 5pm
              </div>
            </div>
            <div>
              <div className="text-[7px] uppercase tracking-wider text-neutral-500 font-semibold mb-1">
                Call
              </div>
              <div className="text-[8px] text-neutral-300 leading-tight">
                (864) 555-0100
              </div>
            </div>
          </div>
          <div className="border-t border-neutral-700 pt-2 text-[10px] text-neutral-400 font-mono">
            ©{" "}
            <span className="bg-red-500/25 text-red-300 px-1.5 py-0.5 rounded border border-red-500/40 font-bold">
              2019
            </span>{" "}
            Smile Dental · All Rights Reserved
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 * Lighthouse gauge (kept for future use; not on current homepage)
 * ============================================================ */

export function LighthouseGaugeMock() {
  const score = 28;
  const circumference = 2 * Math.PI * 44;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-md overflow-hidden" aria-hidden="true">
      <BrowserChrome url="PageSpeed Insights" />
      <div className="p-5 flex items-center justify-center gap-5 bg-white">
        <div className="relative">
          <svg width="110" height="110" viewBox="0 0 110 110">
            <circle cx="55" cy="55" r="44" fill="none" stroke="#fee2e2" strokeWidth="9" />
            <circle
              cx="55"
              cy="55"
              r="44"
              fill="none"
              stroke="#dc2626"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 55 55)"
            />
            <text
              x="55"
              y="60"
              textAnchor="middle"
              fontSize="28"
              fontWeight="800"
              fill="#dc2626"
              fontFamily="ui-sans-serif, system-ui"
            >
              {score}
            </text>
          </svg>
        </div>
        <div className="text-left">
          <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
            Performance
          </div>
          <div className="text-xs text-neutral-700 mt-1 leading-snug">
            Mobile score
          </div>
          <div className="mt-2 inline-flex items-center gap-1 bg-red-50 border border-red-300 rounded px-2 py-0.5 text-[10px] font-semibold text-red-700">
            Poor
          </div>
        </div>
      </div>
    </div>
  );
}
