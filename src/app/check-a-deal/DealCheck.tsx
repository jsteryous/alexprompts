"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  DSCR_TARGET,
  EXAMPLE,
  analyze,
  downPctForDscr,
  grade,
  maxPriceWhere,
  rentForDscr,
  weakest,
  type DealInputs,
  type Grade,
} from "@/lib/dealCheck";

/**
 * The form and the verdict for /check-a-deal. All math lives in
 * src/lib/dealCheck.ts; this file only parses fields and lays out results.
 *
 * Fields are strings, not numbers, so a reader can clear a box and type
 * without it snapping back to 0 mid-edit, and so "280,000" pastes cleanly.
 *
 * THE DEAL LIVES IN THE URL. Every edit rewrites the query string with
 * replaceState (no history spam), so "Copy link" hands a loan officer or a
 * partner the exact deal on screen. That is the whole sharing feature, and it
 * needs no storage.
 */

type Unit = "usd" | "pct" | "years";

type Field = {
  key: keyof DealInputs;
  param: string;
  label: string;
  unit: Unit;
  hint?: string;
};

const GROUPS: { title: string; note?: string; fields: Field[] }[] = [
  {
    title: "The property",
    note:
      "On taxes, South Carolina assesses a rental at 6% of value, not the 4% an owner who lives there pays, and a rental does not get the owner's exemption from school operating taxes. The bill on a listing is usually the owner's, so ask the county for the rental figure.",
    fields: [
      { key: "price", param: "p", label: "Purchase price", unit: "usd" },
      { key: "rentMonthly", param: "r", label: "Rent per month", unit: "usd" },
      { key: "taxesAnnual", param: "t", label: "Taxes per year", unit: "usd" },
      { key: "insuranceAnnual", param: "i", label: "Insurance per year", unit: "usd" },
      { key: "hoaMonthly", param: "h", label: "HOA per month", unit: "usd" },
    ],
  },
  {
    title: "The loan",
    fields: [
      { key: "downPct", param: "d", label: "Down payment", unit: "pct" },
      {
        key: "rate",
        param: "ir",
        label: "Interest rate",
        unit: "pct",
        hint: "Rental loans usually price above a home loan.",
      },
      { key: "termYears", param: "n", label: "Loan term", unit: "years" },
      { key: "closingCosts", param: "c", label: "Closing costs", unit: "usd" },
    ],
  },
  {
    title: "What you assume",
    fields: [
      { key: "vacancyPct", param: "v", label: "Vacancy", unit: "pct", hint: "Rent you never collect." },
      { key: "maintenancePct", param: "m", label: "Maintenance", unit: "pct" },
      {
        key: "capexPct",
        param: "x",
        label: "Big replacements",
        unit: "pct",
        hint: "Roof, HVAC, water heater.",
      },
      {
        key: "managementPct",
        param: "g",
        label: "Management",
        unit: "pct",
        hint: "Count it even if you self-manage. A lender does.",
      },
      { key: "appreciationPct", param: "a", label: "Appreciation per year", unit: "pct" },
      {
        key: "hurdlePct",
        param: "hu",
        label: "Your hurdle",
        unit: "pct",
        hint: "What this cash earns somewhere safer. The deal has to beat it.",
      },
    ],
  },
];

const FIELDS = GROUPS.flatMap((g) => g.fields);

type Values = Record<keyof DealInputs, string>;

function toDisplay(n: number, unit: Unit): string {
  if (unit === "pct") return String(Math.round(n * 10000) / 100);
  if (unit === "usd") return Math.round(n).toLocaleString("en-US");
  return String(n);
}

function exampleValues(): Values {
  const out = {} as Values;
  for (const f of FIELDS) out[f.key] = toDisplay(EXAMPLE[f.key], f.unit);
  return out;
}

/** Re-display a typed value in the house format ("280000" becomes "280,000"). */
function tidy(s: string, unit: Unit): string {
  const n = parse(s);
  return unit === "usd" ? Math.round(n).toLocaleString("en-US") : String(n);
}

function parse(s: string): number {
  const n = parseFloat(s.replace(/[$,%\s]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function toInputs(v: Values): DealInputs {
  const out = {} as DealInputs;
  for (const f of FIELDS) {
    const n = parse(v[f.key]);
    out[f.key] = f.unit === "pct" ? n / 100 : n;
  }
  return out;
}

const usd = (x: number) =>
  `${x < 0 ? "-" : ""}$${Math.round(Math.abs(x)).toLocaleString("en-US")}`;
const usdK = (x: number) =>
  Math.abs(x) >= 1000 ? `$${Math.round(x / 1000).toLocaleString("en-US")},000` : usd(x);
const pct = (x: number, digits = 1) => `${(x * 100).toFixed(digits)}%`;

const GRADE_LABEL: Record<Grade, string> = { pass: "Passes", thin: "Thin", fail: "Fails" };
const GRADE_TONE: Record<Grade, string> = { pass: "tone-good", thin: "tone-warm", fail: "tone-hot" };

function Chip({ g }: { g: Grade }) {
  return (
    <span className={`${GRADE_TONE[g]} border type-eyebrow px-2 py-1 whitespace-nowrap`}>
      {GRADE_LABEL[g]}
    </span>
  );
}

export default function DealCheck() {
  const [values, setValues] = useState<Values>(exampleValues);
  const [copied, setCopied] = useState(false);
  const [resultsInView, setResultsInView] = useState(false);
  const edited = useRef(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Read a shared deal out of the URL once, on mount.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl: Partial<Values> = {};
    for (const f of FIELDS) {
      const raw = params.get(f.param);
      if (raw !== null && raw.trim() !== "") fromUrl[f.key] = tidy(raw, f.unit);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from the URL
    if (Object.keys(fromUrl).length) setValues((v) => ({ ...v, ...fromUrl }));
  }, []);

  // Write the deal back into the URL on every edit (not on a plain visit,
  // which keeps the address clean until there is a deal worth sharing).
  useEffect(() => {
    if (!edited.current) return;
    const params = new URLSearchParams(window.location.search);
    for (const f of FIELDS) params.set(f.param, String(parse(values[f.key])));
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  }, [values]);

  // The phone summary bar hides once the full verdict is on screen.
  useEffect(() => {
    const el = resultsRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setResultsInView(e.isIntersecting), {
      threshold: 0.05,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const inputs = useMemo(() => toInputs(values), [values]);
  const r = useMemo(() => analyze(inputs), [inputs]);
  const checks = useMemo(() => grade(inputs, r), [inputs, r]);
  const verdict = weakest(checks);

  const fixes = useMemo(() => {
    const allClear = maxPriceWhere(inputs, (x) => weakest(grade(inputs, x)) === "pass");
    const lenderPrice = maxPriceWhere(inputs, (x) => x.dscr >= DSCR_TARGET);
    const lenderCoc = lenderPrice !== null ? analyze({ ...inputs, price: lenderPrice }).cashOnCash : null;
    const down = downPctForDscr(inputs);
    const downCoc = down !== null ? analyze({ ...inputs, downPct: down }).cashOnCash : null;
    const rent = rentForDscr(inputs);
    return { allClear, lenderPrice, lenderCoc, down, downCoc, rent };
  }, [inputs]);

  const priceText = usd(inputs.price);
  const headline =
    verdict === "pass"
      ? `At ${priceText}, this works as an income property.`
      : verdict === "thin"
        ? `At ${priceText}, this works, but with no room for error.`
        : `At ${priceText}, this fails as an income property.`;

  const worst = checks.find((c) => c.grade === verdict && verdict !== "pass");

  function set(key: keyof DealInputs, s: string) {
    edited.current = true;
    setValues((v) => ({ ...v, [key]: s }));
  }

  async function copyLink() {
    try {
      const params = new URLSearchParams();
      for (const f of FIELDS) params.set(f.param, String(parse(values[f.key])));
      await navigator.clipboard.writeText(
        `${window.location.origin}${window.location.pathname}?${params.toString()}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16 items-start">
      {/* INPUTS */}
      <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-10" noValidate>
        {GROUPS.map((group) => (
          <fieldset key={group.title}>
            <legend className="theme-text-primary type-eyebrow mb-4 pb-2 border-b theme-border w-full">
              {group.title}
            </legend>
            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
              {group.fields.map((f) => (
                <label key={f.key} className="block">
                  <span className="theme-text-secondary type-small font-medium block mb-1.5">
                    {f.label}
                  </span>
                  <span className="relative block">
                    {f.unit === "usd" && (
                      <span className="theme-text-muted absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none">
                        $
                      </span>
                    )}
                    <input
                      type="text"
                      inputMode="decimal"
                      value={values[f.key]}
                      onChange={(e) => set(f.key, e.target.value)}
                      onFocus={(e) => e.target.select()}
                      onBlur={() => set(f.key, tidy(values[f.key], f.unit))}
                      className={`theme-field w-full py-2.5 text-sm tabular-nums ${
                        f.unit === "usd" ? "pl-7 pr-3" : "pl-3 pr-14"
                      }`}
                    />
                    {f.unit !== "usd" && (
                      <span className="theme-text-muted absolute right-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none">
                        {f.unit === "pct" ? "%" : "years"}
                      </span>
                    )}
                  </span>
                  {f.hint && (
                    <span className="theme-text-muted text-xs block mt-1.5 leading-snug">
                      {f.hint}
                    </span>
                  )}
                </label>
              ))}
            </div>
            {group.note && (
              <p className="theme-text-muted text-xs leading-relaxed mt-4">{group.note}</p>
            )}
          </fieldset>
        ))}

        <div className="flex flex-wrap gap-x-6 gap-y-2 type-small">
          <button type="button" onClick={copyLink} className="theme-link underline">
            {copied ? "Link copied" : "Copy a link to this deal"}
          </button>
          <button
            type="button"
            onClick={() => {
              edited.current = false;
              setValues(exampleValues());
              window.history.replaceState(null, "", window.location.pathname);
            }}
            className="theme-link underline"
          >
            Reset to the example
          </button>
        </div>
      </form>

      {/* RESULTS */}
      <div ref={resultsRef} id="verdict" className="scroll-mt-24">
        <span className="theme-label type-eyebrow block mb-3">The verdict</span>
        <h2 className="theme-text-primary type-h2 mb-4">{headline}</h2>
        <p className="theme-text-secondary type-body-lg leading-relaxed mb-8">
          {verdict === "pass"
            ? "Every check clears. The rent carries the loan with room to spare, and the return does not lean on appreciation."
            : worst?.note}
        </p>

        <ol className="border-t theme-border-strong">
          {checks.map((c, i) => (
            <li key={c.key} className="border-b theme-border py-4">
              <div className="flex items-baseline justify-between gap-4">
                <span className="theme-text-primary font-semibold">
                  <span className="theme-text-muted tabular-nums mr-2">{i + 1}.</span>
                  {c.label}
                </span>
                <span className="flex items-baseline gap-3 shrink-0">
                  <span className="theme-text-primary tabular-nums text-sm">{c.value}</span>
                  <Chip g={c.grade} />
                </span>
              </div>
              <p className="theme-text-muted type-small mt-1.5 leading-relaxed">{c.note}</p>
            </li>
          ))}
        </ol>

        {/* WHAT WOULD MAKE IT WORK. The same math run backward. */}
        <div className="mt-10">
          <h3 className="theme-text-primary type-h3 mb-4">
            {verdict === "pass" ? "How much room there is" : "What would make it work"}
          </h3>
          <ul className="flex flex-col gap-3 theme-text-secondary leading-relaxed">
            {fixes.allClear !== null ? (
              <li>
                The highest price that clears every check is{" "}
                <strong className="theme-text-primary">{usdK(fixes.allClear)}</strong>
                {verdict === "pass"
                  ? `, ${usdK(Math.max(fixes.allClear - inputs.price, 0))} above this one.`
                  : "."}
              </li>
            ) : (
              <li>
                No price clears every check at this rent and these terms. Look at the rent, the
                expenses, or the appreciation assumption before the price.
              </li>
            )}
            {verdict !== "pass" && r.dscr < DSCR_TARGET && fixes.lenderPrice !== null && fixes.lenderCoc !== null && (
              <li>
                A lender would see a {DSCR_TARGET} ratio at about{" "}
                <strong className="theme-text-primary">{usdK(fixes.lenderPrice)}</strong>, where
                your cash would earn {pct(fixes.lenderCoc)}.
              </li>
            )}
            {verdict !== "pass" && r.dscr < DSCR_TARGET && fixes.down !== null && fixes.downCoc !== null && fixes.down < 1 && (
              <li>
                Keeping the price and putting {pct(fixes.down, 0)} down also reaches {DSCR_TARGET},
                but your cash would earn only {pct(fixes.downCoc)}.
              </li>
            )}
            {verdict !== "pass" && r.dscr < DSCR_TARGET && fixes.rent !== null && (
              <li>
                At this price, the rent would need to be about{" "}
                <strong className="theme-text-primary">{usd(Math.ceil(fixes.rent / 25) * 25)}</strong>{" "}
                a month.
              </li>
            )}
          </ul>
        </div>

        {/* THE LEDGER. Collapsed by default so the verdict leads. */}
        <details className="mt-10 border-t theme-border-strong pt-4 group">
          <summary className="theme-text-primary font-semibold cursor-pointer list-none flex justify-between items-center">
            The full math
            <span className="theme-text-muted type-small group-open:hidden">Show</span>
            <span className="theme-text-muted type-small hidden group-open:inline">Hide</span>
          </summary>
          <table className="w-full mt-4 text-sm tabular-nums">
            <tbody className="theme-text-secondary">
              <Row label="Rent for the year" value={usd(r.grossRent)} />
              <Row label={`Vacancy (${pct(inputs.vacancyPct, 0)})`} value={usd(-r.vacancy)} />
              <Row label="Property taxes" value={usd(-inputs.taxesAnnual)} />
              <Row label="Insurance" value={usd(-inputs.insuranceAnnual)} />
              {r.hoa > 0 && <Row label="HOA" value={usd(-r.hoa)} />}
              <Row label={`Maintenance (${pct(inputs.maintenancePct, 0)})`} value={usd(-r.maintenance)} />
              <Row label={`Big replacements (${pct(inputs.capexPct, 0)})`} value={usd(-r.capex)} />
              <Row label={`Management (${pct(inputs.managementPct, 0)})`} value={usd(-r.management)} />
              <Row label="Net operating income" value={usd(r.noi)} strong />
              <Row label={`Loan payments on ${usd(r.loan)}`} value={usd(-r.debtService)} />
              <Row label="Cash flow" value={usd(r.cashFlow)} strong />
              <Row label="Principal paid down, year one" value={usd(r.principalPaydown)} />
              <Row label={`Appreciation (${pct(inputs.appreciationPct, 0)})`} value={usd(r.appreciation)} />
              <Row label="Total return" value={usd(r.totalReturn)} strong />
              <Row label="Cash you put in" value={usd(r.cashInvested)} />
              <Row label="Total return on that cash" value={pct(r.totalReturnPct)} strong />
              <Row label="Occupancy needed to break even" value={pct(r.breakEvenOccupancy, 0)} />
            </tbody>
          </table>
        </details>

        <p className="theme-text-muted type-small leading-relaxed mt-10">
          This is arithmetic on the numbers you entered. It is not a loan approval or investment
          advice, and the result is only as good as the rent and expense figures behind it.
        </p>
      </div>

      {/* The phone summary. On a small screen the verdict sits below fifteen
          fields, so every edit would otherwise be invisible. */}
      {!resultsInView && (
        <a
          href="#verdict"
          className="theme-card-strong lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t theme-border-strong pl-5 pr-20 py-3 flex items-center justify-between gap-3"
        >
          <span className="flex items-center gap-3 min-w-0">
            <Chip g={verdict} />
            <span className="theme-text-secondary text-sm tabular-nums truncate">
              DSCR {Number.isFinite(r.dscr) ? r.dscr.toFixed(2) : "n/a"} · Cash {pct(r.cashOnCash)}
            </span>
          </span>
          <span className="theme-text-primary text-sm font-semibold shrink-0">See why</span>
        </a>
      )}

      <div className="lg:col-span-2 border-t theme-border pt-8">
        <p className="theme-text-secondary leading-relaxed max-w-2xl">
          Looking at a property in Greenville?{" "}
          <Link href="/buying-or-selling?ref=check-a-deal" className="theme-text-primary underline">
            Let me know
          </Link>{" "}
          if you are looking to buy, and send the numbers along.
        </p>
      </div>
    </div>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <tr className={strong ? "border-t theme-border" : ""}>
      <td className={`py-1.5 pr-4 ${strong ? "theme-text-primary font-semibold" : ""}`}>{label}</td>
      <td className={`py-1.5 text-right ${strong ? "theme-text-primary font-semibold" : ""}`}>{value}</td>
    </tr>
  );
}
