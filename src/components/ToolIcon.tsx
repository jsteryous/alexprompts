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

function Taraform() {
  // A CRM pipeline board: columns of deal cards, the last one accented, moving
  // an acquisition toward close.
  return (
    <>
      <rect x={7} y={9} width={34} height={30} rx={3} {...soft} />
      <rect x={7} y={9} width={34} height={30} rx={3} {...stroke} />
      <line x1={7} y1={15} x2={41} y2={15} {...stroke} />
      <line x1={18.3} y1={15} x2={18.3} y2={39} {...stroke} />
      <line x1={29.6} y1={15} x2={29.6} y2={39} {...stroke} />
      <rect x={10} y={19} width={5.5} height={4} rx={1} {...stroke} />
      <rect x={10} y={26} width={5.5} height={4} rx={1} {...stroke} />
      <rect x={21.3} y={19} width={5.5} height={4} rx={1} {...stroke} />
      <rect x={32.6} y={19} width={5.5} height={4} rx={1.2} {...soft} />
      <rect x={32.6} y={19} width={5.5} height={4} rx={1.2} {...stroke} />
    </>
  );
}

function CostOfLiving() {
  // A balance scale: comparing what an income buys in two cities.
  return (
    <>
      <circle cx={24} cy={12} r={2} {...soft} />
      <circle cx={24} cy={12} r={2} {...stroke} />
      <line x1={24} y1={12} x2={24} y2={38} {...stroke} />
      <line x1={10} y1={14} x2={38} y2={14} {...stroke} />
      <path d="M18 40 L24 38 L30 40" {...stroke} />
      <line x1={15} y1={40} x2={33} y2={40} {...stroke} />
      <path d="M10 14 L6 22 M10 14 L14 22" {...stroke} />
      <path d="M5 22 Q10 28 15 22" {...soft} />
      <path d="M5 22 Q10 28 15 22" {...stroke} />
      <path d="M38 14 L34 22 M38 14 L42 22" {...stroke} />
      <path d="M33 22 Q38 28 43 22" {...soft} />
      <path d="M33 22 Q38 28 43 22" {...stroke} />
    </>
  );
}

function PropertyTax() {
  // A house with a percent sign: the tax rate on a home, owner vs rental.
  return (
    <>
      <path d="M9 23 L24 11 L39 23" {...stroke} />
      <path d="M13 20 V39 H35 V20" {...soft} />
      <path d="M13 20 V39 H35 V20" {...stroke} />
      <circle cx={19} cy={28} r={2.2} {...stroke} />
      <circle cx={29} cy={33} r={2.2} {...stroke} />
      <line x1={30} y1={26} x2={18} y2={35} {...stroke} />
    </>
  );
}

function Schools() {
  // A graduation cap: a home's zoned schools and their ratings.
  return (
    <>
      <path d="M24 11 L42 18 L24 25 L6 18 Z" {...soft} />
      <path d="M24 11 L42 18 L24 25 L6 18 Z" {...stroke} />
      <path d="M14 21 V29 C14 32 34 32 34 29 V21" {...stroke} />
      <line x1={42} y1={18} x2={42} y2={30} {...stroke} />
      <circle cx={42} cy={31} r={1.7} {...soft} />
      <circle cx={42} cy={31} r={1.7} {...stroke} />
    </>
  );
}

function WireSafety() {
  // A shield with a check: verifying the domain before the money moves.
  return (
    <>
      <path d="M24 7 L39 13 V23 C39 32.5 32 38.8 24 41.5 C16 38.8 9 32.5 9 23 V13 Z" {...soft} />
      <path d="M24 7 L39 13 V23 C39 32.5 32 38.8 24 41.5 C16 38.8 9 32.5 9 23 V13 Z" {...stroke} />
      <path d="M17.5 24 L22.5 29 L31 19" {...stroke} />
    </>
  );
}

const icons: Record<string, () => React.ReactElement> = {
  "deal-analyzer": DealAnalyzer,
  mortgage: Mortgage,
  "area-scan": AreaScan,
  "cost-of-living": CostOfLiving,
  "property-tax": PropertyTax,
  schools: Schools,
  "wire-safety": WireSafety,
  "buyers-list": BuyersList,
  taraform: Taraform,
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
