/**
 * Flat line illustrations for the homepage "what you'll learn" outcomes grid.
 *
 * Deliberately NOT technology imagery. Each scene shows the *outcome* a
 * non-technical reader gets (a finished site, sorted photos, a gift), never a
 * chip / robot / datacenter. House look: one rounded tinted panel, single
 * 2px line weight, accent-colored. Drawn with `currentColor` so the parent's
 * text color (use `theme-label` = `var(--accent)`) tints them, which keeps
 * light + dark mode correct with zero extra CSS. Add a new scene by adding a
 * key here and an `art` slug on the matching outcome in `lib/site.ts`.
 */

export type OutcomeArtSlug =
  | "website"
  | "organize"
  | "gift"
  | "research"
  | "automate"
  | "plan";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const soft = { fill: "currentColor", fillOpacity: 0.14, stroke: "none" };

function Website() {
  return (
    <>
      <rect x={8} y={8} width={32} height={22} rx={3} {...stroke} />
      <line x1={8} y1={14} x2={40} y2={14} {...stroke} />
      <circle cx={12} cy={11} r={1} {...soft} fillOpacity={0.6} />
      <circle cx={15.5} cy={11} r={1} {...soft} fillOpacity={0.6} />
      <circle cx={19} cy={11} r={1} {...soft} fillOpacity={0.6} />
      <rect x={12} y={18} width={9} height={8} rx={1.5} {...soft} />
      <line x1={25} y1={19} x2={36} y2={19} {...stroke} />
      <line x1={25} y1={23} x2={34} y2={23} {...stroke} />
      <line x1={25} y1={27} x2={31} y2={27} {...stroke} />
    </>
  );
}

function Organize() {
  return (
    <>
      {/* scattered → neat: a tidy stack of three photo frames with a check */}
      <rect x={9} y={10} width={16} height={13} rx={2} {...stroke} transform="rotate(-9 17 16)" />
      <rect x={13} y={13} width={18} height={14} rx={2} {...soft} />
      <rect x={13} y={13} width={18} height={14} rx={2} {...stroke} />
      <circle cx={19} cy={19} r={2} {...stroke} />
      <path d="M14 27l5-5 4 3 4-4" {...stroke} />
      <path d="M30 9l2.4 2.4L37 7" {...stroke} />
      <circle cx={33} cy={9} r={6} {...stroke} />
    </>
  );
}

function Gift() {
  return (
    <>
      <rect x={12} y={17} width={24} height={15} rx={2} {...stroke} />
      <rect x={10} y={12} width={28} height={6} rx={1.5} {...soft} />
      <rect x={10} y={12} width={28} height={6} rx={1.5} {...stroke} />
      <line x1={24} y1={12} x2={24} y2={32} {...stroke} />
      <path d="M24 12c-1-3-7-5-7-1.5C17 13 22 12 24 12z" {...stroke} />
      <path d="M24 12c1-3 7-5 7-1.5C31 13 26 12 24 12z" {...stroke} />
    </>
  );
}

function Research() {
  return (
    <>
      <rect x={9} y={7} width={20} height={26} rx={2.5} {...stroke} />
      <line x1={13} y1={13} x2={25} y2={13} {...stroke} />
      <line x1={13} y1={18} x2={25} y2={18} {...stroke} />
      <line x1={13} y1={23} x2={20} y2={23} {...stroke} />
      <circle cx={30} cy={24} r={7} {...soft} />
      <circle cx={30} cy={24} r={7} {...stroke} />
      <line x1={35} y1={29} x2={40} y2={34} {...stroke} />
      <path d="M27 24l2 2 4-4" {...stroke} />
    </>
  );
}

function Automate() {
  return (
    <>
      {/* set-it-once loop: two curved arrows around a checked stack */}
      <path d="M14 13a11 11 0 0 1 19 1" {...stroke} />
      <path d="M34 23a11 11 0 0 1-19-1" {...stroke} />
      <path d="M33 9v5h-5" {...stroke} />
      <path d="M15 27v-5h5" {...stroke} />
      <rect x={19} y={16} width={10} height={8} rx={1.5} {...soft} />
      <path d="M20.5 20l2 2 4-4" {...stroke} />
    </>
  );
}

function Plan() {
  return (
    <>
      <rect x={8} y={9} width={24} height={23} rx={3} {...stroke} />
      <line x1={8} y1={15} x2={32} y2={15} {...stroke} />
      <line x1={14} y1={7} x2={14} y2={12} {...stroke} />
      <line x1={26} y1={7} x2={26} y2={12} {...stroke} />
      <rect x={12} y={19} width={5} height={4} rx={1} {...soft} />
      <line x1={20} y1={21} x2={28} y2={21} {...stroke} />
      <line x1={12} y1={27} x2={24} y2={27} {...stroke} />
      {/* destination pin */}
      <path d="M36 18c3 0 5 2 5 5 0 3-5 8-5 8s-5-5-5-8c0-3 2-5 5-5z" {...soft} />
      <path d="M36 18c3 0 5 2 5 5 0 3-5 8-5 8s-5-5-5-8c0-3 2-5 5-5z" {...stroke} />
      <circle cx={36} cy={23} r={1.6} {...stroke} />
    </>
  );
}

const scenes: Record<OutcomeArtSlug, () => React.ReactElement> = {
  website: Website,
  organize: Organize,
  gift: Gift,
  research: Research,
  automate: Automate,
  plan: Plan,
};

export function OutcomeArt({
  slug,
  className = "",
}: {
  slug: OutcomeArtSlug;
  className?: string;
}) {
  const Scene = scenes[slug];
  return (
    <svg
      viewBox="0 0 48 40"
      role="img"
      aria-hidden
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <Scene />
    </svg>
  );
}
