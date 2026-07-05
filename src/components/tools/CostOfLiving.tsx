"use client";

import { useMemo, useState } from "react";
import data from "@/data/costOfLiving.json";

/**
 * Greenville cost-of-living compare. Answers "how far does my income go in
 * Greenville versus where I live now?" using BEA Regional Price Parities (all
 * items, US = 100), committed as a static dataset (src/data/costOfLiving.json).
 * Pure client-side, no API.
 *
 * The math is purchasing-power equivalence. To keep the same standard of living
 * moving from an origin metro to Greenville:
 *   equivalent income = income x (RPP_greenville / RPP_origin)
 * Because RPP is a price-level index, a lower Greenville RPP means you need less
 * income to buy the same basket.
 */

const num = (s: string) => {
  const n = parseFloat(s.replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};
const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const TARGET = data.target;

export function CostOfLiving() {
  const [originName, setOriginName] = useState("New York, NY");
  const [income, setIncome] = useState("100000");

  const r = useMemo(() => {
    const origin = data.origins.find((o) => o.name === originName) ?? data.origins[0];
    const inc = num(income);
    const ratio = TARGET.rpp / origin.rpp; // <1 when Greenville is cheaper
    const equivalent = inc * ratio;
    const pctDiff = (ratio - 1) * 100; // negative = Greenville cheaper
    const cheaper = pctDiff < 0;
    const roughlyEqual = Math.abs(pctDiff) < 0.5;
    return { origin, inc, equivalent, pctDiff, cheaper, roughlyEqual };
  }, [originName, income]);

  return (
    <div>
      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
          <label className="block">
            <span className="theme-text-secondary text-sm font-medium">Where you live now</span>
            <select
              value={originName}
              onChange={(e) => setOriginName(e.target.value)}
              className="theme-field w-full py-2.5 px-3 text-sm mt-1.5"
            >
              {data.origins.map((o) => (
                <option key={o.name} value={o.name}>
                  {o.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="theme-text-secondary text-sm font-medium">Your household income</span>
            <div className="relative mt-1.5">
              <span className="theme-text-muted absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none">
                $
              </span>
              <input
                type="number"
                inputMode="decimal"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="theme-field w-full py-2.5 pl-7 pr-3 text-sm tabular-nums"
              />
            </div>
          </label>

          <p className="theme-text-muted text-xs leading-relaxed">
            Comparing {r.origin.name} (price level {r.origin.rpp}) with {TARGET.name} (price level{" "}
            {TARGET.rpp}), where 100 is the U.S. average. BEA Regional Price Parities, {data.year}.
          </p>
        </form>

        <div className="grid gap-4 content-start">
          <div className="theme-card-strong border theme-border rounded-xl p-6">
            <div className="theme-text-muted text-xs font-semibold uppercase tracking-widest">
              Same buying power in Greenville
            </div>
            <div className="theme-text-primary text-3xl md:text-4xl font-bold tracking-tight tabular-nums mt-1.5">
              {usd(r.equivalent)}
            </div>
            <div className="theme-text-muted text-xs mt-1">
              lives like {usd(r.inc)} in {r.origin.name}
            </div>
          </div>

          <div className="theme-card-muted border theme-border rounded-xl p-5">
            <div className="theme-text-muted text-xs font-semibold uppercase tracking-widest">
              Cost of living
            </div>
            {r.roughlyEqual ? (
              <div className="theme-text-primary text-xl font-bold mt-1">
                About the same as {r.origin.name}
              </div>
            ) : (
              <div className="theme-text-primary text-xl font-bold tabular-nums mt-1">
                {Math.abs(r.pctDiff).toFixed(0)}%{" "}
                <span className="font-medium">
                  {r.cheaper ? "cheaper" : "more expensive"} than {r.origin.name}
                </span>
              </div>
            )}
            <div className="theme-text-muted text-xs mt-1.5">
              {r.roughlyEqual
                ? "Overall prices are close, so your income goes about as far in either place."
                : r.cheaper
                  ? `Your income stretches further here. The gap is mostly housing.`
                  : `Greenville prices are higher on this measure, unusual, so double-check housing specifically.`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
