"use client";

const exchanges = [
  {
    q: "What did we quote the Henderson job?",
    a: "Quote #312, Sept 3 — $4,200 for a full 3-ton replacement, Carrier 16-SEER, haul-off included. Accepted pending permit approval.",
    src: "Quote #312 · Email thread Sep 3–5",
  },
  {
    q: "Did we ever work with the Riverside HOA?",
    a: "Two jobs in 2023. Deck repair $3,400 in July, exterior painting $8,100 in October. Point of contact was Linda Torres.",
    src: "Job folder J-2023-041 · J-2023-078",
  },
  {
    q: "What's Ferguson's lead time on HVAC equipment right now?",
    a: "Per the March 15 vendor call: copper fittings 2–3 days, HVAC equipment currently 2–3 weeks backorder.",
    src: "Vendor call notes Mar 15",
  },
];

export default function CompanyBrainDemo() {
  return (
    <div className="bg-[#0a0f0b] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.07] bg-white/[0.03]">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
        </div>
        <span className="text-xs text-white/35 ml-2 font-mono tracking-wide">Company Brain</span>
      </div>

      <div className="p-5 space-y-6">
        {exchanges.map((ex, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-end">
              <div className="bg-white/[0.08] text-white/75 text-sm px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-[88%] leading-relaxed">
                {ex.q}
              </div>
            </div>
            <div className="flex justify-start">
              <div className="max-w-[92%]">
                <div className="bg-green-500/[0.1] border border-green-500/[0.18] text-green-100/90 text-sm px-4 py-2.5 rounded-2xl rounded-tl-sm leading-relaxed">
                  {ex.a}
                </div>
                <div className="mt-1.5 ml-1 flex items-center gap-1.5 text-[11px] text-white/50 font-mono">
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M3 6h6M6 3v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  {ex.src}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
