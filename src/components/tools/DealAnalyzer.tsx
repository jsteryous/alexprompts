"use client";

import { useMemo, useState } from "react";

/**
 * Rental deal analyzer. Pure client-side math, no API, no cost. Ships with a
 * worked example pre-filled so a visitor sees real numbers the instant they land
 * (utility-first). Everything recomputes live as fields change.
 */

type Fields = {
  price: string;
  downPct: string;
  rate: string;
  termYears: string;
  rent: string;
  taxAnnual: string;
  insuranceAnnual: string;
  hoaMonthly: string;
  maintenancePct: string;
  vacancyPct: string;
  mgmtPct: string;
  closingRehab: string;
};

const DEFAULTS: Fields = {
  price: "320000",
  downPct: "25",
  rate: "6.9",
  termYears: "30",
  rent: "2450",
  taxAnnual: "3200",
  insuranceAnnual: "1400",
  hoaMonthly: "0",
  maintenancePct: "8",
  vacancyPct: "5",
  mgmtPct: "8",
  closingRehab: "9000",
};

const num = (s: string) => {
  const n = parseFloat(s.replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

/** Standard amortized monthly principal + interest. */
function monthlyPI(principal: number, annualRatePct: number, years: number): number {
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  if (n <= 0) return 0;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

function Field({
  label,
  value,
  onChange,
  prefix,
  suffix,
  step,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="theme-text-secondary text-sm font-medium">{label}</span>
      <div className="relative mt-1.5">
        {prefix && (
          <span className="theme-text-muted absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          type="number"
          inputMode="decimal"
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`theme-field w-full py-2.5 text-sm tabular-nums ${prefix ? "pl-7" : "pl-3"} ${
            suffix ? "pr-9" : "pr-3"
          }`}
        />
        {suffix && (
          <span className="theme-text-muted absolute right-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}

function Stat({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: string;
  tone?: "good" | "hot";
  hint?: string;
}) {
  return (
    <div className="theme-card-strong border theme-border rounded-xl p-5">
      <div className="theme-text-muted text-xs font-semibold uppercase tracking-widest">{label}</div>
      <div
        className={`text-2xl md:text-3xl font-bold tracking-tight tabular-nums mt-1.5 ${
          tone === "good" ? "tone-good-text" : tone === "hot" ? "tone-hot-text" : "theme-text-primary"
        }`}
      >
        {value}
      </div>
      {hint && <div className="theme-text-muted text-xs mt-1 leading-snug">{hint}</div>}
    </div>
  );
}

export function DealAnalyzer() {
  const [f, setF] = useState<Fields>(DEFAULTS);
  const set = (k: keyof Fields) => (v: string) => setF((prev) => ({ ...prev, [k]: v }));

  const r = useMemo(() => {
    const price = num(f.price);
    const down = (num(f.downPct) / 100) * price;
    const loan = Math.max(price - down, 0);
    const pi = monthlyPI(loan, num(f.rate), num(f.termYears));
    const rent = num(f.rent);

    const tax = num(f.taxAnnual) / 12;
    const insurance = num(f.insuranceAnnual) / 12;
    const hoa = num(f.hoaMonthly);
    const maintenance = (num(f.maintenancePct) / 100) * rent;
    const vacancy = (num(f.vacancyPct) / 100) * rent;
    const mgmt = (num(f.mgmtPct) / 100) * rent;

    // Operating expenses exclude debt service (that is what NOI is built on).
    const opEx = tax + insurance + hoa + maintenance + vacancy + mgmt;
    const noiMonthly = rent - opEx;
    const noiAnnual = noiMonthly * 12;

    const cashFlow = rent - opEx - pi;
    const cashFlowAnnual = cashFlow * 12;

    const invested = down + num(f.closingRehab);
    const capRate = price > 0 ? noiAnnual / price : 0;
    const coc = invested > 0 ? cashFlowAnnual / invested : 0;

    return { loan, pi, opEx, noiAnnual, cashFlow, cashFlowAnnual, invested, capRate, coc };
  }, [f]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr]">
      {/* Inputs */}
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
        <div className="sm:col-span-2">
          <Field label="Purchase price" value={f.price} onChange={set("price")} prefix="$" />
        </div>
        <Field label="Down payment" value={f.downPct} onChange={set("downPct")} suffix="%" step="0.5" />
        <Field label="Interest rate" value={f.rate} onChange={set("rate")} suffix="%" step="0.1" />
        <Field label="Loan term" value={f.termYears} onChange={set("termYears")} suffix="yrs" />
        <Field label="Monthly rent" value={f.rent} onChange={set("rent")} prefix="$" />
        <Field label="Property tax / yr" value={f.taxAnnual} onChange={set("taxAnnual")} prefix="$" />
        <Field label="Insurance / yr" value={f.insuranceAnnual} onChange={set("insuranceAnnual")} prefix="$" />
        <Field label="HOA / mo" value={f.hoaMonthly} onChange={set("hoaMonthly")} prefix="$" />
        <Field label="Closing + rehab" value={f.closingRehab} onChange={set("closingRehab")} prefix="$" />
        <Field label="Maintenance" value={f.maintenancePct} onChange={set("maintenancePct")} suffix="% rent" />
        <Field label="Vacancy" value={f.vacancyPct} onChange={set("vacancyPct")} suffix="% rent" />
        <Field label="Management" value={f.mgmtPct} onChange={set("mgmtPct")} suffix="% rent" />
      </form>

      {/* Results */}
      <div className="grid gap-4 content-start sm:grid-cols-2">
        <Stat
          label="Monthly cash flow"
          value={usd(r.cashFlow)}
          tone={r.cashFlow >= 0 ? "good" : "hot"}
          hint={`${usd(r.cashFlowAnnual)} per year`}
        />
        <Stat
          label="Cash-on-cash"
          value={pct(r.coc)}
          tone={r.coc >= 0 ? "good" : "hot"}
          hint={`on ${usd(r.invested)} invested`}
        />
        <Stat label="Cap rate" value={pct(r.capRate)} hint={`${usd(r.noiAnnual)} NOI / year`} />
        <Stat label="Mortgage (P&I)" value={usd(r.pi)} hint={`loan of ${usd(r.loan)}`} />
        <div className="sm:col-span-2 theme-card-muted border theme-border rounded-xl p-5">
          <div className="theme-text-muted text-xs font-semibold uppercase tracking-widest mb-1">
            Operating expenses
          </div>
          <div className="theme-text-primary text-lg font-semibold tabular-nums">
            {usd(r.opEx)} / mo
          </div>
          <p className="theme-text-muted text-xs mt-1 leading-snug">
            Tax, insurance, HOA, maintenance, vacancy, and management. Mortgage is counted
            separately in cash flow, not in cap rate.
          </p>
        </div>
      </div>
    </div>
  );
}
