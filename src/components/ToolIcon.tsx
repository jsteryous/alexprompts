/**
 * Line icons for the /tools cards, homepage tools spotlight, and tool page
 * headers. Same house look as OutcomeArt: one 2px line weight, optional soft
 * fill, drawn in `currentColor` so a parent `theme-label` (= var(--accent))
 * tints them and light/dark mode just works. Keyed by the tool's registry slug
 * (src/lib/tools.ts); add a case here when a new tool ships.
 */

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const soft = { fill: "currentColor", fillOpacity: 0.14, stroke: "none" };

function DealAnalyzer() {
  // House with an upward chart inside: investment returns.
  return (
    <>
      <path d="M8 23 L24 11 L40 23" {...stroke} />
      <path d="M12 21 V39 H36 V21" {...stroke} />
      <rect x={16} y={31} width={4} height={6} {...soft} />
      <rect x={16} y={31} width={4} height={6} {...stroke} />
      <rect x={22} y={28} width={4} height={9} {...soft} />
      <rect x={22} y={28} width={4} height={9} {...stroke} />
      <rect x={28} y={24} width={4} height={13} {...soft} />
      <rect x={28} y={24} width={4} height={13} {...stroke} />
    </>
  );
}

function Mortgage() {
  // Calculator: payment + affordability.
  return (
    <>
      <rect x={13} y={7} width={22} height={34} rx={3} {...stroke} />
      <rect x={17} y={11} width={14} height={7} rx={1.5} {...soft} />
      <rect x={17} y={11} width={14} height={7} rx={1.5} {...stroke} />
      <circle cx={19} cy={25} r={1.4} {...stroke} />
      <circle cx={24} cy={25} r={1.4} {...stroke} />
      <circle cx={29} cy={25} r={1.4} {...stroke} />
      <circle cx={19} cy={31} r={1.4} {...stroke} />
      <circle cx={24} cy={31} r={1.4} {...stroke} />
      <circle cx={29} cy={31} r={1.4} {...stroke} />
      <circle cx={19} cy={37} r={1.4} {...stroke} />
      <circle cx={24} cy={37} r={1.4} {...stroke} />
      <circle cx={29} cy={37} r={1.4} {...stroke} />
    </>
  );
}

function ListingPrompt() {
  // Document being written, with an accent sparkle: a Claude-generated listing.
  return (
    <>
      <path d="M15 8 H28 L33 13 V40 H15 Z" {...stroke} />
      <path d="M28 8 V13 H33" {...stroke} />
      <line x1={19} y1={21} x2={29} y2={21} {...stroke} />
      <line x1={19} y1={26} x2={29} y2={26} {...stroke} />
      <line x1={19} y1={31} x2={25} y2={31} {...stroke} />
      <path d="M36 9 l1.3 3.2 3.2 1.3 -3.2 1.3 -1.3 3.2 -1.3 -3.2 -3.2 -1.3 3.2 -1.3 z" {...soft} fillOpacity={0.5} />
      <path d="M36 9 l1.3 3.2 3.2 1.3 -3.2 1.3 -1.3 3.2 -1.3 -3.2 -3.2 -1.3 3.2 -1.3 z" {...stroke} />
    </>
  );
}

function AreaScan() {
  // Map pin over radius rings: a location and what surrounds it.
  return (
    <>
      <ellipse cx={24} cy={36} rx={15} ry={5} {...soft} />
      <ellipse cx={24} cy={36} rx={15} ry={5} {...stroke} />
      <ellipse cx={24} cy={36} rx={8} ry={2.6} {...stroke} />
      <path d="M24 8 c5 0 9 4 9 9 c0 6.5 -9 15 -9 15 s-9 -8.5 -9 -15 c0 -5 4 -9 9 -9 z" {...soft} />
      <path d="M24 8 c5 0 9 4 9 9 c0 6.5 -9 15 -9 15 s-9 -8.5 -9 -15 c0 -5 4 -9 9 -9 z" {...stroke} />
      <circle cx={24} cy={17} r={3} {...stroke} />
    </>
  );
}

function BuyersList() {
  // A ledger of transactions: rows of records with a price coin. The list of
  // who bought what.
  return (
    <>
      <rect x={9} y={8} width={24} height={32} rx={3} {...soft} />
      <rect x={9} y={8} width={24} height={32} rx={3} {...stroke} />
      <line x1={14} y1={16} x2={24} y2={16} {...stroke} />
      <line x1={14} y1={22} x2={28} y2={22} {...stroke} />
      <line x1={14} y1={28} x2={22} y2={28} {...stroke} />
      <circle cx={34} cy={32} r={7} {...soft} />
      <circle cx={34} cy={32} r={7} {...stroke} />
      <path d="M34 28.5 v7 M32 30 h3 a1.6 1.6 0 0 1 0 3 h-2 a1.6 1.6 0 0 0 0 3 h3" {...stroke} />
    </>
  );
}

const icons: Record<string, () => React.ReactElement> = {
  "deal-analyzer": DealAnalyzer,
  mortgage: Mortgage,
  "listing-prompt": ListingPrompt,
  "area-scan": AreaScan,
  "buyers-list": BuyersList,
};

export function ToolIcon({ slug, className = "" }: { slug: string; className?: string }) {
  const Icon = icons[slug];
  if (!Icon) return null;
  return (
    <svg viewBox="0 0 48 48" role="img" aria-hidden className={className} preserveAspectRatio="xMidYMid meet">
      <Icon />
    </svg>
  );
}
