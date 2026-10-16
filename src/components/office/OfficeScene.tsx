"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { OfficeData, Snippet } from "@/lib/office";
import { SP500_END_1997 } from "@/lib/office";

/**
 * THE EDITOR'S OFFICE (October 14, 2026; a real photograph since October 15).
 * The room is a 1941 private office in Hartford, photographed by
 * Gottscho-Schleisner (Library of Congress, no known restrictions), which
 * Mr. Langston has borrowed. The SVG drawing it replaced read as clip art; Alex
 * liked the period photographs. Each spot on the photograph opens something
 * from the paper, assembled by src/lib/office.ts, so the room changes with
 * every number. Spots marked `hidden` show nothing until the pointer finds
 * them and stay out of the list under the photograph: those are the Easter
 * eggs. Every spot is still a button, so a keyboard reaches all of them.
 */

type Key =
  | "window"
  | "calendar"
  | "barometer"
  | "hatcher"
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
  typewriter: { name: "The desk", hint: "Today's paper" },
  calendar: { name: "The door to the press room", hint: "When the next number comes out" },
  coffee: { name: "The cabinet", hint: "The coffee can, against the market" },
  ticker: { name: "The ticker's plug", hint: "The latest closes" },
  barometer: { name: "The empty nail", hint: "Where the barometer hung" },
  hatcher: { name: "The portrait", hint: "The Hatcher file" },
  phone: { name: "The visitor's chair", hint: "Where Dewey sits with his telephone" },
  note: { name: "The blotter", hint: "Notes from Mrs. Langston" },
  window: { name: "The window", hint: "The Evening Clarion, across the street" },
  corkboard: { name: "The bare wall", hint: "The most-clipped clippings" },
  stack: { name: "The desk drawers", hint: "Every back issue" },
  radio: { name: "The armchair by the window", hint: "Stage, screen and radio" },
  candlestick: { name: "The Editor's chair", hint: "The Editor's latest opinion" },
};

/** Each spot as a box on the photograph, in per cent of its width and height. */
const SPOTS: { k: Key; l: number; t: number; w: number; h: number; hidden?: boolean }[] = [
  { k: "corkboard", l: 6, t: 20, w: 24, h: 34 },
  { k: "window", l: 39.5, t: 13, w: 11, h: 45 },
  { k: "hatcher", l: 75, t: 34.5, w: 6, h: 14 },
  { k: "calendar", l: 85, t: 15, w: 11, h: 61 },
  { k: "coffee", l: 69.5, t: 50, w: 13.5, h: 24 },
  { k: "radio", l: 56, t: 56.5, w: 13, h: 9.5 },
  { k: "candlestick", l: 9.5, t: 60, w: 7, h: 30 },
  { k: "note", l: 30, t: 63, w: 15, h: 6 },
  { k: "typewriter", l: 16.5, t: 69, w: 27, h: 6 },
  { k: "stack", l: 16.5, t: 75, w: 26, h: 20 },
  { k: "phone", l: 53, t: 66, w: 18, h: 29 },
  { k: "barometer", l: 63, t: 27.5, w: 2.5, h: 3.5, hidden: true },
  { k: "ticker", l: 63.3, t: 46.5, w: 2.2, h: 3.5, hidden: true },
];

const ORDER: Key[] = [
  "typewriter", "calendar", "coffee", "hatcher", "phone", "note",
  "window", "corkboard", "radio", "candlestick", "stack",
];

const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2 });

function nyParts(iso: string) {
  const d = new Date(iso);
  const part = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", ...o }).format(d);
  return { weekday: part({ weekday: "long" }), month: part({ month: "long" }), day: part({ day: "numeric" }) };
}

// ── The photograph ──────────────────────────────────────────────────────────

function Photo({ onOpen, onHover }: { onOpen: (k: Key) => void; onHover: (k: Key | null, e?: React.MouseEvent) => void }) {
  return (
    <div className="office-photo">
      {/* A local copy of a public domain photograph; next/image adds nothing at this size. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/office/office-1941.jpg" alt="A 1941 private office: a desk, two leather armchairs, a tall curtained window, a cabinet, a framed picture and a door." width={560} height={396} />
      {SPOTS.map((s) => (
        <button
          key={s.k}
          type="button"
          className={`office-spot${s.hidden ? " office-spot-hidden" : ""}`}
          style={{ left: `${s.l}%`, top: `${s.t}%`, width: `${s.w}%`, height: `${s.h}%` }}
          aria-label={`${LABELS[s.k].name}: ${LABELS[s.k].hint}`}
          onClick={() => onOpen(s.k)}
          onMouseMove={(e) => onHover(s.k, e)}
          onMouseLeave={() => onHover(null)}
        />
      ))}
    </div>
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
            line. Here is how that has gone since 1998, the year of Hatcher.
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

    case "hatcher": {
      const days = Math.floor((Date.now() - Date.UTC(1998, 0, 1)) / 86400000);
      return (
        <>
          <p className="office-big">{days.toLocaleString("en-US")}</p>
          <p className="office-fine">days, at the least, that the Editor has held this grudge.</p>
          <Snippets items={data.cast.hatcher} empty="Hatcher has kept a low profile. The Editor finds this suspicious." />
        </>
      );
    }

    case "phone":
      return <Snippets items={data.cast.dewey} empty="Dewey has not broken anything yet this week. Give him time." />;

    case "note":
      return <Snippets items={data.cast.mrsLangston} empty="Mrs. Langston has said nothing for the record, which the Editor finds more alarming than anything she could say." />;

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
        <Photo onOpen={setOpen} onHover={onHover} />
        <p className="office-credit">
          A private office in Hartford, Connecticut, 1941, which Mr. Langston has borrowed.{" "}
          <a href="https://www.loc.gov/item/2018740583/" target="_blank" rel="noopener noreferrer">
            Gottscho-Schleisner, Library of Congress
          </a>
        </p>
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
