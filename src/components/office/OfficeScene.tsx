"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { OfficeData, Snippet } from "@/lib/office";
import { SP500_END_1997 } from "@/lib/office";

/**
 * THE EDITOR'S OFFICE (October 14, 2026). Mr. C. P. Ashby's office in 1945, drawn
 * in ink on newsprint, with every object on the wall and the desk opening
 * something from the paper. All of it is data (src/lib/office.ts), so the room
 * changes with every number. The list under the drawing reaches every object
 * too, for phones and keyboards.
 */

const INK = "#1d1912";
const NEWSPRINT = "#efe5c8";
const OXBLOOD = "#9a2323";

type Key =
  | "window"
  | "calendar"
  | "barometer"
  | "fenwick"
  | "corkboard"
  | "stack"
  | "candlestick"
  | "ticker"
  | "typewriter"
  | "coffee"
  | "note"
  | "phone"
  | "radio";

const LABELS: Record<Key, { name: string; hint: string }> = {
  typewriter: { name: "The typewriter", hint: "Today's paper" },
  calendar: { name: "The calendar", hint: "When the next edition comes out" },
  coffee: { name: "The coffee can", hint: "The Editor's savings, against the market" },
  ticker: { name: "The stock ticker", hint: "The latest closes" },
  barometer: { name: "The empty nail", hint: "The weather, and the missing barometer" },
  fenwick: { name: "The portrait of Fenwick", hint: "The Fenwick file" },
  phone: { name: "Thaddeus's telephone", hint: "The Thaddeus file" },
  note: { name: "A note from Mrs. Ashby", hint: "Everything Mrs. Ashby has said" },
  window: { name: "The window", hint: "The Evening Clarion, across the street" },
  corkboard: { name: "The corkboard", hint: "The most-clipped clippings" },
  stack: { name: "The stack of old papers", hint: "Every back issue" },
  radio: { name: "The radio", hint: "Stage, screen and radio" },
  candlestick: { name: "The Editor's telephone", hint: "The Editor's latest opinion" },
};

const ORDER: Key[] = [
  "typewriter", "calendar", "coffee", "ticker", "fenwick", "phone", "note",
  "window", "barometer", "corkboard", "radio", "candlestick", "stack",
];

const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2 });

function nyParts(iso: string) {
  const d = new Date(iso);
  const part = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", ...o }).format(d);
  return { weekday: part({ weekday: "long" }), month: part({ month: "long" }), day: part({ day: "numeric" }) };
}

/** Two short lines from a headline, broken at a word, for the sheet in the typewriter. */
function twoLines(text: string, width = 24): [string, string] {
  const words = text.toUpperCase().split(/\s+/);
  let a = "";
  let i = 0;
  while (i < words.length && (a + " " + words[i]).trim().length <= width) a = (a + " " + words[i++]).trim();
  let b = words.slice(i).join(" ");
  if (b.length > width) b = `${b.slice(0, width - 1).replace(/\s+\S*$/, "")}…`;
  return [a, b];
}

// ── The drawing ─────────────────────────────────────────────────────────────

function Obj({
  k,
  onOpen,
  onHover,
  children,
}: {
  k: Key;
  onOpen: (k: Key) => void;
  onHover: (k: Key | null, e?: React.MouseEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <g
      className="office-obj"
      role="button"
      tabIndex={0}
      aria-label={`${LABELS[k].name}: ${LABELS[k].hint}`}
      onClick={() => onOpen(k)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen(k))}
      onMouseMove={(e) => onHover(k, e)}
      onMouseLeave={() => onHover(null)}
    >
      {children}
    </g>
  );
}

function Scene({ data, onOpen, onHover }: { data: OfficeData; onOpen: (k: Key) => void; onHover: (k: Key | null, e?: React.MouseEvent) => void }) {
  const run = nyParts(data.nextRun);
  const [line1, line2] = twoLines(data.latest?.headline ?? "The first number is at the press");
  const t = data.ticker;
  const tape = t
    ? `S&P ${fmt(t.sp500 ?? 0)}   DOW ${t.dow ? fmt(t.dow) : "..."}   NASDAQ ${t.nasdaq ? fmt(t.nasdaq) : "..."}   S&P ${fmt(t.sp500 ?? 0)}`
    : "THE TICKER IS WARMING UP   THE TICKER IS WARMING UP";
  const pinned = Math.min(5, Math.max(3, data.clipped.length));
  const s = { stroke: INK, strokeWidth: 4, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

  return (
    <svg viewBox="0 0 1600 1000" className="office-svg" role="group" aria-label="The Editor's office">
      <defs>
        <pattern id="dots" width="9" height="9" patternUnits="userSpaceOnUse">
          <circle cx="4.5" cy="4.5" r="1.5" fill={INK} opacity="0.18" />
        </pattern>
        <pattern id="paper-stripe" width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M0 0V28" stroke={INK} strokeWidth="1" opacity="0.05" />
        </pattern>
        <pattern id="cork" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="4" r="1.3" fill="#7d5a32" opacity="0.5" />
          <circle cx="10" cy="10" r="1.1" fill="#e2c08a" opacity="0.6" />
        </pattern>
        <pattern id="grain" width="220" height="40" patternUnits="userSpaceOnUse">
          <path d="M0 12C60 6 120 18 220 10M0 30C70 24 150 36 220 28" fill="none" stroke="#7d5a32" strokeWidth="2" opacity="0.35" />
        </pattern>
        <path id="tape-path" d="M560 815C575 860 600 905 650 930S760 962 860 965S1000 960 1100 968" />
      </defs>

      {/* The wall */}
      <rect x="0" y="0" width="1600" height="660" fill="#ebe1c5" />
      <rect x="0" y="0" width="1600" height="660" fill="url(#paper-stripe)" />
      <rect x="0" y="520" width="1600" height="140" fill="#ddd0aa" />
      <rect x="0" y="520" width="1600" height="140" fill="url(#paper-stripe)" />
      <path d="M0 520H1600" {...s} strokeWidth="6" />

      {/* The window, and the Evening Clarion across the street */}
      <Obj k="window" onOpen={onOpen} onHover={onHover}>
        <rect x="70" y="80" width="450" height="400" fill="#4a3a28" {...s} />
        <rect x="92" y="102" width="406" height="356" fill="#f7f1de" />
        <rect x="92" y="102" width="406" height="96" fill="url(#dots)" />
        <path d="M150 458V200L175 182H445L470 200V458Z" fill="#cdbb90" {...s} strokeWidth="3" />
        <rect x="170" y="206" width="280" height="40" fill={INK} />
        <text x="310" y="234" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="700" fontSize="21" letterSpacing="3" fill={NEWSPRINT}>
          EVENING CLARION
        </text>
        {[270, 336, 402].map((y) =>
          [178, 248, 318, 388].map((x) => (
            <rect key={`${x}-${y}`} x={x} y={y} width="52" height="44" fill={x === 318 && y === 336 ? "#fff6c8" : "#f7f1de"} {...s} strokeWidth="3" />
          )),
        )}
        <circle cx="344" cy="350" r="6" fill={INK} />
        <rect x="337" y="357" width="14" height="22" fill={INK} />
        <rect x="324" y="364" width="40" height="14" fill="#f7f1de" stroke={INK} strokeWidth="2" />
        <path d="M92 176H498" stroke="#4a3a28" strokeWidth="10" />
        <rect x="56" y="476" width="478" height="20" fill="#4a3a28" {...s} strokeWidth="3" />
      </Obj>

      {/* The calendar, marked for the next edition */}
      <Obj k="calendar" onOpen={onOpen} onHover={onHover}>
        <path d="M600 122L665 96L730 122" fill="none" stroke={INK} strokeWidth="2" />
        <circle cx="665" cy="96" r="5" fill={INK} />
        <rect x="590" y="120" width="150" height="200" fill="#fbf6e6" {...s} />
        <rect x="590" y="120" width="150" height="42" fill={OXBLOOD} {...s} />
        <text x="665" y="149" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="700" fontSize="17" letterSpacing="2" fill={NEWSPRINT}>
          {run.month.toUpperCase()}
        </text>
        <text x="665" y="252" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="700" fontSize="70" fill={INK}>
          {run.day}
        </text>
        <ellipse cx="665" cy="228" rx="50" ry="42" fill="none" stroke={OXBLOOD} strokeWidth="3.5" transform="rotate(-8 665 228)" />
        <text x="665" y="300" textAnchor="middle" fontFamily="Georgia, serif" fontSize="12" letterSpacing="1.5" fill={INK}>
          {`NEXT: ${run.weekday.toUpperCase()}`}
        </text>
      </Obj>

      {/* Where the barometer hung: an unfaded circle of wallpaper and a nail */}
      <Obj k="barometer" onOpen={onOpen} onHover={onHover}>
        <circle cx="895" cy="255" r="80" fill="#f6eed8" />
        <circle cx="895" cy="255" r="80" fill="none" stroke={INK} strokeWidth="2" strokeDasharray="6 9" opacity="0.4" />
        <circle cx="895" cy="160" r="6" fill={INK} />
        <g transform="rotate(-7 895 200)">
          <path d="M895 162L895 186" stroke={INK} strokeWidth="2" />
          <rect x="822" y="186" width="148" height="34" fill="#fbf6e6" stroke={INK} strokeWidth="2.5" />
          <text x="896" y="208" textAnchor="middle" fontFamily="Georgia, serif" fontSize="11.5" letterSpacing="0.5" fill={OXBLOOD}>
            OUT FOR DELIVERY
          </text>
        </g>
      </Obj>

      {/* Fenwick, framed, with a dart in him */}
      <Obj k="fenwick" onOpen={onOpen} onHover={onHover}>
        <path d="M1050 100L1105 76L1160 100" fill="none" stroke={INK} strokeWidth="2" />
        <circle cx="1105" cy="76" r="5" fill={INK} />
        <rect x="1020" y="98" width="170" height="226" fill="#8a6a3c" {...s} />
        <rect x="1036" y="114" width="138" height="194" fill="#e3d6b2" {...s} strokeWidth="3" />
        <ellipse cx="1105" cy="208" rx="54" ry="74" fill="#cdbb90" {...s} strokeWidth="3" />
        <path d="M1062 268C1070 238 1088 230 1105 230S1140 238 1148 268" fill={INK} />
        <path d="M1097 236L1105 262L1113 236Z" fill={OXBLOOD} />
        <ellipse cx="1105" cy="192" rx="25" ry="31" fill="#eadbb7" {...s} strokeWidth="3" />
        <path d="M1081 180C1083 160 1127 158 1129 180C1120 170 1092 170 1081 180Z" fill={INK} />
        <circle cx="1096" cy="190" r="2.5" fill={INK} />
        <circle cx="1114" cy="190" r="2.5" fill={INK} />
        <path d="M1088 206C1096 200 1104 206 1105 206C1106 206 1114 200 1122 206C1114 214 1106 208 1105 208C1104 208 1096 214 1088 206Z" fill={INK} />
        <path d="M1096 218C1102 221 1108 221 1114 218" fill="none" stroke={INK} strokeWidth="2" />
        <path d="M1110 170L1168 132" stroke={INK} strokeWidth="4" />
        <path d="M1160 130L1180 116L1172 140Z M1164 138L1186 134L1170 148Z" fill={OXBLOOD} stroke={INK} strokeWidth="1.5" />
        <rect x="1066" y="326" width="78" height="22" fill="#c9a24a" {...s} strokeWidth="2.5" />
        <text x="1105" y="342" textAnchor="middle" fontFamily="Georgia, serif" fontSize="12" letterSpacing="2" fill={INK}>
          FENWICK
        </text>
      </Obj>

      {/* The corkboard of most-clipped clippings */}
      <Obj k="corkboard" onOpen={onOpen} onHover={onHover}>
        <rect x="1230" y="80" width="320" height="390" fill="#6b5132" {...s} />
        <rect x="1246" y="96" width="288" height="358" fill="#b98c56" />
        <rect x="1246" y="96" width="288" height="358" fill="url(#cork)" />
        <rect x="1325" y="106" width="130" height="28" fill="#fbf6e6" stroke={INK} strokeWidth="2.5" />
        <text x="1390" y="125" textAnchor="middle" fontFamily="Georgia, serif" fontSize="12.5" letterSpacing="1.5" fill={INK}>
          MOST CLIPPED
        </text>
        {[
          [1262, 150, -5, 120, 120],
          [1398, 148, 4, 118, 96],
          [1272, 284, 3, 104, 138],
          [1392, 262, -4, 124, 112],
          [1330, 382, 2, 118, 60],
        ]
          .slice(0, pinned)
          .map(([x, y, r, w, h], i) => (
            <g key={i} transform={`rotate(${r} ${x + w / 2} ${y + h / 2})`}>
              <rect x={x} y={y} width={w} height={h} fill={NEWSPRINT} stroke={INK} strokeWidth="2" />
              <rect x={x + 10} y={y + 10} width={w - 20} height="8" fill={INK} opacity="0.8" />
              {Array.from({ length: Math.floor((h - 34) / 11) }, (_, j) => (
                <rect key={j} x={x + 10} y={y + 28 + j * 11} width={w - 20 - ((j * 13) % 22)} height="3.5" fill={INK} opacity="0.35" />
              ))}
              <circle cx={x + w / 2} cy={y + 2} r="6" fill={OXBLOOD} stroke={INK} strokeWidth="1.5" />
            </g>
          ))}
      </Obj>

      {/* The desk */}
      <rect x="0" y="640" width="1600" height="360" fill="#c9a46e" />
      <rect x="0" y="640" width="1600" height="360" fill="url(#grain)" />
      <rect x="0" y="636" width="1600" height="22" fill="#a98450" {...s} strokeWidth="3" />

      {/* The stack of old papers */}
      <Obj k="stack" onOpen={onOpen} onHover={onHover}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect
            key={i}
            x={66 + ((i * 7) % 12)}
            y={866 - i * 30}
            width="262"
            height="36"
            fill={i % 2 ? "#efe5c8" : "#e6dab8"}
            stroke={INK}
            strokeWidth="3"
            transform={`rotate(${(i % 3) - 1} 200 ${880 - i * 30})`}
          />
        ))}
        <rect x="72" y="690" width="256" height="40" fill="#fbf6e6" stroke={INK} strokeWidth="3" transform="rotate(-2 200 710)" />
        <text x="200" y="718" textAnchor="middle" fontFamily="'UnifrakturMaguntia', Georgia, serif" fontSize="24" fill={INK} transform="rotate(-2 200 710)">
          The Intelligencer
        </text>
        <path d="M200 690V900" stroke="#8a6a3c" strokeWidth="5" />
      </Obj>

      {/* The Editor's own telephone */}
      <Obj k="candlestick" onOpen={onOpen} onHover={onHover}>
        <path d="M376 900C386 870 444 870 454 900Z" fill={INK} />
        <ellipse cx="415" cy="900" rx="48" ry="12" fill={INK} />
        <rect x="406" y="700" width="18" height="190" fill={INK} />
        <path d="M388 650H442L432 700H398Z" fill={INK} />
        <ellipse cx="415" cy="650" rx="27" ry="8" fill="#3a332a" stroke={INK} strokeWidth="2" />
        <path d="M424 726H456" stroke={INK} strokeWidth="6" />
        <rect x="448" y="706" width="20" height="86" rx="9" fill={INK} />
        <path d="M458 792C470 850 440 870 452 900" fill="none" stroke={INK} strokeWidth="3" />
      </Obj>

      {/* The stock ticker under its glass dome, with tape running across the desk */}
      <Obj k="ticker" onOpen={onOpen} onHover={onHover}>
        <path d="M560 815C575 860 600 905 650 930S760 962 860 965S1000 960 1100 968" fill="none" stroke={INK} strokeWidth="25" />
        <path d="M560 815C575 860 600 905 650 930S760 962 860 965S1000 960 1100 968" fill="none" stroke="#fbf6e6" strokeWidth="20" />
        <text fontFamily="'Courier New', monospace" fontSize="13" fontWeight="700" fill={INK} letterSpacing="1">
          <textPath href="#tape-path" startOffset="4%">
            {tape}
          </textPath>
        </text>
        <rect x="500" y="820" width="120" height="70" fill="#6b5132" {...s} />
        <path d="M512 820C512 720 608 720 608 820" fill="#e4ece6" fillOpacity="0.55" {...s} strokeWidth="3" />
        <circle cx="560" cy="790" r="16" fill="#c9a24a" stroke={INK} strokeWidth="2.5" />
        <path d="M545 770H575M560 760V774" stroke={INK} strokeWidth="2.5" />
        <path d="M528 760C540 745 552 740 560 740" fill="none" stroke="#ffffff" strokeWidth="3" opacity="0.8" />
      </Obj>

      {/* The typewriter, with today's headline in it */}
      <Obj k="typewriter" onOpen={onOpen} onHover={onHover}>
        <rect x="700" y="560" width="220" height="150" fill="#fbf6e6" {...s} strokeWidth="3" />
        <text x="810" y="590" textAnchor="middle" fontFamily="'UnifrakturMaguntia', Georgia, serif" fontSize="17" fill={INK}>
          The Rebrew Intelligencer
        </text>
        <path d="M716 600H904" stroke={INK} strokeWidth="2" />
        <text x="810" y="622" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="700" fontSize="12.5" fill={INK}>
          {line1}
        </text>
        <text x="810" y="639" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="700" fontSize="12.5" fill={INK}>
          {line2}
        </text>
        {[656, 667, 678].map((y) => (
          <rect key={y} x="722" y={y} width="176" height="3.5" fill={INK} opacity="0.3" />
        ))}
        <rect x="668" y="690" width="284" height="28" rx="14" fill={INK} />
        <circle cx="660" cy="704" r="17" fill="#3a332a" stroke={INK} strokeWidth="3" />
        <circle cx="960" cy="704" r="17" fill="#3a332a" stroke={INK} strokeWidth="3" />
        <path d="M652 720H968L992 870H628Z" fill="#2b2a26" {...s} />
        <path d="M660 730H960L966 760H654Z" fill="#3a3832" />
        <text x="810" y="751" textAnchor="middle" fontFamily="Georgia, serif" fontSize="12" letterSpacing="4" fill="#c9a24a">
          ASHBY No. 5
        </text>
        {[
          [776, 10, 676],
          [804, 10, 690],
          [832, 9, 704],
        ].map(([y, n, x0]) =>
          Array.from({ length: n }, (_, i) => <circle key={`${y}-${i}`} cx={x0 + i * 27} cy={y} r="9.5" fill={NEWSPRINT} stroke={INK} strokeWidth="2.5" />),
        )}
        <rect x="720" y="848" width="180" height="11" rx="5" fill={NEWSPRINT} stroke={INK} strokeWidth="2.5" />
      </Obj>

      {/* The coffee can the Editor keeps his savings in */}
      <Obj k="coffee" onOpen={onOpen} onHover={onHover}>
        <path d="M1010 722V880C1010 896 1120 896 1120 880V722" fill={OXBLOOD} {...s} />
        <rect x="1010" y="772" width="110" height="68" fill={NEWSPRINT} stroke={INK} strokeWidth="3" />
        <text x="1065" y="801" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="700" fontSize="19" letterSpacing="1" fill={INK}>
          COFFEE
        </text>
        <text x="1065" y="824" textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontSize="12" fill={OXBLOOD}>
          {"& savings"}
        </text>
        <ellipse cx="1065" cy="722" rx="55" ry="13" fill="#7d1c1c" {...s} strokeWidth="3" />
        <path d="M1042 716L1086 700L1094 718L1050 732Z" fill="#a9b98f" stroke={INK} strokeWidth="2.5" />
        <text x="1068" y="720" textAnchor="middle" fontFamily="Georgia, serif" fontSize="11" fontWeight="700" fill={INK} transform="rotate(-18 1068 716)">
          $1
        </text>
        <ellipse cx="1072" cy="704" rx="56" ry="13" fill="#b5b0a5" {...s} strokeWidth="3" transform="rotate(-9 1072 704)" />
      </Obj>

      {/* A note from Mrs. Ashby, propped on the desk */}
      <Obj k="note" onOpen={onOpen} onHover={onHover}>
        <path d="M1150 840L1262 840L1252 742L1160 742Z" fill="#fbf6e6" {...s} strokeWidth="3" />
        <text x="1206" y="770" textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontSize="14" fill={INK}>
          Cornelius,
        </text>
        <path d="M1172 788C1186 782 1196 794 1210 788S1234 782 1242 788M1172 806C1188 800 1200 812 1214 806S1232 800 1240 806" fill="none" stroke={INK} strokeWidth="2" />
        <text x="1222" y="830" textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontSize="13" fill={OXBLOOD}>
          M. A.
        </text>
      </Obj>

      {/* Thaddeus's telephone, left on a 1945 desk, screen cracked */}
      <Obj k="phone" onOpen={onOpen} onHover={onHover}>
        <g transform="rotate(-16 1190 920)">
          <rect x="1130" y="890" width="124" height="62" rx="10" fill="#151412" {...s} strokeWidth="3" />
          <rect x="1140" y="898" width="104" height="46" rx="4" fill="#fff8d6" />
          <path d="M1164 900L1182 920L1172 942M1182 920L1206 914L1228 940M1206 914L1214 899" fill="none" stroke={INK} strokeWidth="1.6" />
          <text x="1192" y="926" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="11" fill={OXBLOOD}>
            1.2M views
          </text>
        </g>
      </Obj>

      {/* The radio */}
      <Obj k="radio" onOpen={onOpen} onHover={onHover}>
        <path d="M1300 900V740C1300 670 1350 640 1415 640S1530 670 1530 740V900Z" fill="#8a5a2b" {...s} strokeWidth="5" />
        <path d="M1336 830V752C1336 706 1370 684 1415 684S1494 706 1494 752V830Z" fill="#d9c39a" {...s} strokeWidth="3" />
        {[1356, 1380, 1404, 1428, 1452, 1476].map((x) => (
          <path key={x} d={`M${x} 704V828`} stroke="#8a5a2b" strokeWidth="5" />
        ))}
        <circle cx="1415" cy="864" r="20" fill={NEWSPRINT} stroke={INK} strokeWidth="3" />
        <path d="M1415 864L1426 852" stroke={OXBLOOD} strokeWidth="3" />
        <circle cx="1352" cy="868" r="12" fill={INK} />
        <circle cx="1478" cy="868" r="12" fill={INK} />
        <text x="1548" y="640" fontFamily="Georgia, serif" fontSize="34" fill={INK} className="office-note-a">
          ♪
        </text>
        <text x="1560" y="690" fontFamily="Georgia, serif" fontSize="26" fill={INK} className="office-note-b">
          ♫
        </text>
      </Obj>
    </svg>
  );
}

// ── The panels ──────────────────────────────────────────────────────────────

function Snippets({ items, empty }: { items: Snippet[]; empty: string }) {
  if (items.length === 0) return <p className="office-empty">{empty}</p>;
  return (
    <ul className="office-snippets">
      {items.map((s) => (
        <li key={s.href}>
          <Link href={s.href}>“{s.text}”</Link>
          <span>No. {s.number}</span>
        </li>
      ))}
    </ul>
  );
}

function Countdown({ iso }: { iso: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const ms = Math.max(0, new Date(iso).getTime() - now);
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return (
    <p className="office-countdown" aria-live="off">
      {d > 0 && <span>{d}<small>{d === 1 ? "day" : "days"}</small></span>}
      <span>{h}<small>hours</small></span>
      <span>{m}<small>min</small></span>
      <span>{String(sec).padStart(2, "0")}<small>sec</small></span>
    </p>
  );
}

function Panel({ k, data }: { k: Key; data: OfficeData }) {
  const latest = data.latest;
  switch (k) {
    case "typewriter":
      return latest ? (
        <>
          <p className="office-kicker">No. {latest.number}</p>
          <h3 className="office-head">{latest.headline}</h3>
          {latest.summary && <p>{latest.summary}</p>}
          <Link href="/" className="office-button">Read today&apos;s paper</Link>
        </>
      ) : (
        <p className="office-empty">The first number is still at the press.</p>
      );

    case "calendar": {
      const run = nyParts(data.nextRun);
      return (
        <>
          <p>
            The Intelligencer goes to press at 5:47 in the morning, Eastern time, every Tuesday, Thursday and
            Saturday. The next number is due {run.weekday}, {run.month} {run.day}.
          </p>
          <Countdown iso={data.nextRun} />
          <Link href="/subscribe" className="office-button">Have it delivered</Link>
        </>
      );
    }

    case "coffee": {
      const sp = data.ticker?.sp500;
      const gain = sp ? (sp / SP500_END_1997 - 1) * 100 : null;
      return (
        <>
          <p>
            The Editor keeps his savings in this can, on the grounds that a can has never been sold a share in a branch
            line. Here is how that has gone since 1998, the year of Fenwick.
          </p>
          {gain !== null ? (
            <div className="office-bars">
              <div>
                <span>The coffee can</span>
                <b style={{ width: "2px" }} />
                <em>0 per cent</em>
              </div>
              <div>
                <span>The S&amp;P 500</span>
                <b style={{ width: "100%" }} />
                <em>up {fmt(gain)} per cent</em>
              </div>
              <p className="office-fine">
                The S&amp;P 500 closed 1997 at {fmt(SP500_END_1997)} and closed at {fmt(sp!)} on{" "}
                {data.ticker?.session ?? "the latest session"}, as printed in No. {data.ticker?.number}. Dividends are not
                counted, which is generous to the can.
              </p>
            </div>
          ) : (
            <p className="office-empty">The ticker has not reported a close since the can was last opened. Try again after the next number.</p>
          )}
        </>
      );
    }

    case "ticker": {
      const t = data.ticker;
      return (
        <>
          {t ? (
            <table className="office-table">
              <tbody>
                {t.dow !== undefined && <tr><th>Dow Jones average</th><td>{fmt(t.dow)}</td></tr>}
                {t.sp500 !== undefined && <tr><th>Standard and Poor&apos;s 500</th><td>{fmt(t.sp500)}</td></tr>}
                {t.nasdaq !== undefined && <tr><th>Nasdaq composite</th><td>{fmt(t.nasdaq)}</td></tr>}
              </tbody>
            </table>
          ) : null}
          {t?.session && <p className="office-fine">Closes for {t.session}, from No. {t.number}.</p>}
          {data.marketsItem?.paragraphs?.[0] && <p>{data.marketsItem.paragraphs[0]}</p>}
          {!t && !data.marketsItem && <p className="office-empty">The tape is quiet.</p>}
        </>
      );
    }

    case "barometer":
      return (
        <>
          {data.weather && (
            <>
              <p className="office-kicker">The weather</p>
              <p>
                {data.weather.text} <Link href={data.weather.href}>Clip</Link>
              </p>
            </>
          )}
          <p className="office-kicker">The barometer, so far</p>
          <Snippets items={data.cast.barometer} empty="The barometer has not been heard from." />
        </>
      );

    case "fenwick": {
      const days = Math.floor((Date.now() - Date.UTC(1998, 0, 1)) / 86400000);
      return (
        <>
          <p className="office-big">{days.toLocaleString("en-US")}</p>
          <p className="office-fine">days, at the least, that the Editor has held this grudge.</p>
          <Snippets items={data.cast.fenwick} empty="Fenwick has kept a low profile. The Editor finds this suspicious." />
        </>
      );
    }

    case "phone":
      return <Snippets items={data.cast.thaddeus} empty="Thaddeus has not broken anything yet this week. Give him time." />;

    case "note":
      return <Snippets items={data.cast.mrsAshby} empty="Mrs. Ashby has said nothing for the record, which the Editor finds more alarming than anything she could say." />;

    case "window":
      return <Snippets items={data.cast.clarion} empty="The Clarion's lights are off. The Editor claims not to have noticed." />;

    case "corkboard":
      return data.clipped.length ? (
        <ol className="office-clipped">
          {data.clipped.map((c) => (
            <li key={c.href}>
              <Link href={c.href}>{c.title}</Link>
              <span>
                {c.department}, No. {c.number}. Opened {c.views} {c.views === 1 ? "time" : "times"} this month.
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="office-empty">
          Nothing is pinned up yet. Clip something from <Link href="/">the paper</Link> and it may end up here.
        </p>
      );

    case "stack":
      return (
        <ul className="office-issues">
          {data.editions.map((e) => (
            <li key={e.slug}>
              <Link href={`/edition/${e.slug}`}>
                <span>No. {e.number}</span> {e.headline}
              </Link>
            </li>
          ))}
        </ul>
      );

    case "radio":
      return data.amusements.length ? (
        <>
          {data.amusements.map((a) => (
            <div key={a.href} className="office-item">
              {a.item.headline && <h3 className="office-head">{a.item.headline}</h3>}
              <p>{a.item.paragraphs?.[0]}</p>
              <Link href={a.href}>Clip this</Link>
            </div>
          ))}
        </>
      ) : (
        <p className="office-empty">Static.</p>
      );

    case "candlestick":
      return data.editorial ? (
        <>
          {data.editorial.item.headline && <h3 className="office-head">{data.editorial.item.headline}</h3>}
          {(data.editorial.item.paragraphs ?? []).slice(0, 2).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <Link href={data.editorial.href} className="office-button">Clip the Editor</Link>
        </>
      ) : (
        <p className="office-empty">The Editor is not taking calls.</p>
      );
  }
}

// ── The room ────────────────────────────────────────────────────────────────

export default function OfficeScene({ data }: { data: OfficeData }) {
  const [open, setOpen] = useState<Key | null>(null);
  const [hover, setHover] = useState<{ k: Key; x: number; y: number } | null>(null);
  const frame = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const onHover = (k: Key | null, e?: React.MouseEvent) => {
    if (!k || !e || !frame.current) return setHover(null);
    const r = frame.current.getBoundingClientRect();
    setHover({ k, x: e.clientX - r.left, y: e.clientY - r.top });
  };

  return (
    <>
      <div ref={frame} className="office-frame">
        <Scene data={data} onOpen={setOpen} onHover={onHover} />
        {hover && !open && (
          <div className="office-tag" style={{ left: hover.x, top: hover.y }}>
            <b>{LABELS[hover.k].name}</b>
            <span>{LABELS[hover.k].hint}</span>
          </div>
        )}
      </div>

      <nav aria-label="Things in the office" className="office-list">
        {ORDER.map((k) => (
          <button key={k} type="button" onClick={() => setOpen(k)}>
            <b>{LABELS[k].name}</b>
            <span>{LABELS[k].hint}</span>
          </button>
        ))}
      </nav>

      {open && (
        <div className="office-scrim" onClick={() => setOpen(null)}>
          <aside className="office-panel" role="dialog" aria-modal="true" aria-label={LABELS[open].name} onClick={(e) => e.stopPropagation()}>
            <div className="office-panel-top">
              <h2>{LABELS[open].name}</h2>
              <button ref={closeRef} type="button" onClick={() => setOpen(null)}>
                Close
              </button>
            </div>
            <Panel k={open} data={data} />
          </aside>
        </div>
      )}
    </>
  );
}
