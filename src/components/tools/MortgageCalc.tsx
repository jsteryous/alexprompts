"use client";

import { useMemo, useState } from "react";

/**
 * Mortgage + affordability calculator. Two modes off one set of math:
 *  - "payment": price + down + rate + term  -> monthly payment
 *  - "afford":  a target monthly payment    -> the price it buys
 * Pure client-side, no API. Pre-filled so numbers show on load.
 */

type Mode = "payment" | "afford";

const num = (s: string) => {
  const n = parseFloat(s.replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};
const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function piPayment(principal: number, ratePct: number, years: number): number {
  const r = ratePct / 100 / 12;
  const n = years * 12;
  if (n <= 0) return 0;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

/** Inverse: the loan a given monthly payment supports. */
function loanFromPayment(payment: number, ratePct: number, years: number): number {
  const r = ratePct / 100 / 12;
  const n = years * 12;
  if (n <= 0) return 0;
  if (r === 0) return payment * n;
  return (payment * (1 - Math.pow(1 + r, -n))) / r;
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

export function MortgageCalc() {
  const [mode, setMode] = useState<Mode>("payment");

  // Shared loan terms.
  const [rate, setRate] = useState("6.9");
  const [term, setTerm] = useState("30");
  const [downPct, setDownPct] = useState("20");

  // Payment mode input.
  const [price, setPrice] = useState("400000");
  // Afford mode input.
  const [budget, setBudget] = useState("2500");

  // Monthly extras both modes fold into the total / budget.
  const [taxAnnual, setTaxAnnual] = useState("4000");
  const [insAnnual, setInsAnnual] = useState("1600");
  const [hoaMonthly, setHoaMonthly] = useState("0");

  const extrasMonthly = useMemo(
    () => num(taxAnnual) / 12 + num(insAnnual) / 12 + num(hoaMonthly),
    [taxAnnual, insAnnual, hoaMonthly],
  );

  const result = useMemo(() => {
    const d = num(downPct) / 100;
    if (mode === "payment") {
      const p = num(price);
      const loan = p * (1 - d);
      const pi = piPayment(loan, num(rate), num(term));
      return { pi, total: pi + extrasMonthly, loan, price: p, down: p * d };
    }
    // Afford: subtract the fixed extras from the budget, then back into a price.
    const forPI = Math.max(num(budget) - extrasMonthly, 0);
    const loan = loanFromPayment(forPI, num(rate), num(term));
    const affordPrice = d < 1 ? loan / (1 - d) : loan;
    return { pi: forPI, total: num(budget), loan, price: affordPrice, down: affordPrice * d };
  }, [mode, price, budget, rate, term, downPct, extrasMonthly]);

  return (
    <div>
      {/* Mode toggle */}
      <div className="inline-flex rounded-xl border theme-border p-1 theme-card-strong mb-6">
        {(["payment", "afford"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg ${
              mode === m ? "theme-cta" : "theme-text-secondary"
            }`}
          >
            {m === "payment" ? "Payment from price" : "Price from budget"}
          </button>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
          {mode === "payment" ? (
            <div className="sm:col-span-2">
              <Field label="Home price" value={price} onChange={setPrice} prefix="$" />
            </div>
          ) : (
            <div className="sm:col-span-2">
              <Field label="Monthly budget (all in)" value={budget} onChange={setBudget} prefix="$" />
            </div>
          )}
          <Field label="Down payment" value={downPct} onChange={setDownPct} suffix="%" step="0.5" />
          <Field label="Interest rate" value={rate} onChange={setRate} suffix="%" step="0.1" />
          <Field label="Loan term" value={term} onChange={setTerm} suffix="yrs" />
          <Field label="Property tax / yr" value={taxAnnual} onChange={setTaxAnnual} prefix="$" />
          <Field label="Insurance / yr" value={insAnnual} onChange={setInsAnnual} prefix="$" />
          <Field label="HOA / mo" value={hoaMonthly} onChange={setHoaMonthly} prefix="$" />
        </form>

        <div className="grid gap-4 content-start">
          <div className="theme-card-strong border theme-border rounded-xl p-6">
            <div className="theme-text-muted text-xs font-semibold uppercase tracking-widest">
              {mode === "payment" ? "Total monthly payment" : "Price you can afford"}
            </div>
            <div className="theme-text-primary text-3xl md:text-4xl font-bold tracking-tight tabular-nums mt-1.5">
              {mode === "payment" ? usd(result.total) : usd(result.price)}
            </div>
            <div className="theme-text-muted text-xs mt-1">
              {mode === "payment"
                ? `${usd(result.pi)} principal + interest, plus ${usd(extrasMonthly)} taxes, insurance, HOA`
                : `${usd(result.down)} down, ${usd(result.loan)} loan`}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="theme-card-muted border theme-border rounded-xl p-5">
              <div className="theme-text-muted text-xs font-semibold uppercase tracking-widest">
                {mode === "payment" ? "Loan amount" : "Monthly P&I"}
              </div>
              <div className="theme-text-primary text-xl font-bold tabular-nums mt-1">
                {mode === "payment" ? usd(result.loan) : usd(result.pi)}
              </div>
            </div>
            <div className="theme-card-muted border theme-border rounded-xl p-5">
              <div className="theme-text-muted text-xs font-semibold uppercase tracking-widest">
                Down payment
              </div>
              <div className="theme-text-primary text-xl font-bold tabular-nums mt-1">
                {usd(result.down)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
