"use client";

import { useMemo, useState } from "react";

/**
 * South Carolina property-tax estimator, tuned for Greenville County.
 *
 * The SC formula, in plain English:
 *   assessed value = market value x assessment ratio
 *   annual tax     = assessed value x (millage / 1000)
 *
 * Two things trip up buyers, and this tool exists to show both:
 *  1. The assessment ratio is 4% for an owner-occupied PRIMARY residence and
 *     6% for a second home or rental (SC Code 12-43-220).
 *  2. Under Act 388, an owner-occupied primary residence is exempt from the
 *     SCHOOL OPERATING millage (funded instead by a statewide penny sales tax).
 *     A rental pays it. That is why the same house costs far less in tax as a
 *     primary home than as an investment.
 * Age 65+, totally disabled, or legally blind owners also get the Homestead
 * Exemption: the first $50,000 of market value is exempt on a primary residence
 * (SC Code 12-37-250).
 *
 * Pure client-side, no API. Millage varies by district and changes at each
 * reassessment, so millage is an adjustable input with representative Greenville
 * County defaults (see the tool note for sourcing). A mill is $1 of tax per
 * $1,000 of assessed value.
 */

type Residency = "primary" | "investment";

const PRIMARY_RATIO = 0.04;
const OTHER_RATIO = 0.06;
const HOMESTEAD_EXEMPT_FMV = 50_000;

/**
 * Representative Greenville County millage, 2025 tax year. These are DEFAULTS to
 * be confirmed against the county Auditor's district millage sheet, not an exact
 * district rate. The school operating portion (~158.2 mills) is the Greenville
 * County Schools General Fund millage, the part Act 388 removes for an
 * owner-occupied home.
 */
const DEFAULT_TOTAL_MILLS = "300";
const DEFAULT_SCHOOL_OP_MILLS = "158.2";

const num = (s: string) => {
  const n = parseFloat(s.replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};
const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const usdMonthly = (n: number) =>
  (n / 12).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

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
            suffix ? "pr-12" : "pr-3"
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

/** One scenario's tax, so we can show the selected one and the contrast. */
function taxFor(
  residency: Residency,
  price: number,
  totalMills: number,
  schoolOpMills: number,
  homestead: boolean,
) {
  if (residency === "primary") {
    const fmv = homestead ? Math.max(price - HOMESTEAD_EXEMPT_FMV, 0) : price;
    const assessed = fmv * PRIMARY_RATIO;
    const mills = Math.max(totalMills - schoolOpMills, 0); // Act 388 removes school operating
    return { assessed, mills, tax: (assessed * mills) / 1000 };
  }
  const assessed = price * OTHER_RATIO;
  return { assessed, mills: totalMills, tax: (assessed * totalMills) / 1000 };
}

export function PropertyTax() {
  const [residency, setResidency] = useState<Residency>("primary");
  const [price, setPrice] = useState("350000");
  const [totalMills, setTotalMills] = useState(DEFAULT_TOTAL_MILLS);
  const [schoolOpMills, setSchoolOpMills] = useState(DEFAULT_SCHOOL_OP_MILLS);
  const [homestead, setHomestead] = useState(false);

  const { selected, other, otherLabel, savings, effectiveRate } = useMemo(() => {
    const p = num(price);
    const t = num(totalMills);
    const s = num(schoolOpMills);
    const primary = taxFor("primary", p, t, s, homestead);
    const investment = taxFor("investment", p, t, s, false);

    const sel = residency === "primary" ? primary : investment;
    const oth = residency === "primary" ? investment : primary;

    // What Act 388 saves a primary residence: the school operating millage it
    // does not pay, on the owner-occupied assessed value.
    const act388Savings = (primary.assessed * s) / 1000;

    return {
      selected: sel,
      other: oth,
      otherLabel: residency === "primary" ? "As a second home or rental" : "As a primary residence",
      savings: act388Savings,
      effectiveRate: p > 0 ? (sel.tax / p) * 100 : 0,
    };
  }, [residency, price, totalMills, schoolOpMills, homestead]);

  return (
    <div>
      {/* Residency toggle */}
      <div className="inline-flex rounded-xl border theme-border p-1 theme-card-strong mb-6">
        {(["primary", "investment"] as Residency[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setResidency(r)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg ${
              residency === r ? "theme-cta" : "theme-text-secondary"
            }`}
          >
            {r === "primary" ? "Primary residence (4%)" : "Second home / rental (6%)"}
          </button>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
          <div className="sm:col-span-2">
            <Field label="Purchase price (market value)" value={price} onChange={setPrice} prefix="$" />
          </div>
          <Field label="Total millage" value={totalMills} onChange={setTotalMills} suffix="mills" step="1" />
          <Field
            label="School operating millage"
            value={schoolOpMills}
            onChange={setSchoolOpMills}
            suffix="mills"
            step="0.1"
          />
          {residency === "primary" && (
            <label className="sm:col-span-2 flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={homestead}
                onChange={(e) => setHomestead(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[var(--accent)]"
              />
              <span className="theme-text-secondary text-sm">
                Owner is 65+, totally disabled, or legally blind
                <span className="theme-text-muted"> (Homestead Exemption: first $50,000 of value)</span>
              </span>
            </label>
          )}
          <p className="sm:col-span-2 theme-text-muted text-xs leading-relaxed">
            A mill is $1 of tax per $1,000 of assessed value. Millage varies by district and changes at
            reassessment. The defaults are representative Greenville County figures. Confirm your
            district on the county Auditor&apos;s millage sheet.
          </p>
        </form>

        <div className="grid gap-4 content-start">
          <div className="theme-card-strong border theme-border rounded-xl p-6">
            <div className="theme-text-muted text-xs font-semibold uppercase tracking-widest">
              Estimated annual property tax
            </div>
            <div className="theme-text-primary text-3xl md:text-4xl font-bold tracking-tight tabular-nums mt-1.5">
              {usd(selected.tax)}
            </div>
            <div className="theme-text-muted text-xs mt-1">
              about {usdMonthly(selected.tax)} a month, an effective {effectiveRate.toFixed(2)}% of price
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="theme-card-muted border theme-border rounded-xl p-5">
              <div className="theme-text-muted text-xs font-semibold uppercase tracking-widest">
                Assessed value
              </div>
              <div className="theme-text-primary text-xl font-bold tabular-nums mt-1">
                {usd(selected.assessed)}
              </div>
            </div>
            <div className="theme-card-muted border theme-border rounded-xl p-5">
              <div className="theme-text-muted text-xs font-semibold uppercase tracking-widest">
                Millage applied
              </div>
              <div className="theme-text-primary text-xl font-bold tabular-nums mt-1">
                {selected.mills.toLocaleString("en-US", { maximumFractionDigits: 1 })}
              </div>
            </div>
          </div>

          {/* The teaching contrast: the same house under the other status. */}
          <div className="theme-card-muted border theme-border rounded-xl p-5">
            <div className="theme-text-muted text-xs font-semibold uppercase tracking-widest">
              {otherLabel}
            </div>
            <div className="theme-text-primary text-xl font-bold tabular-nums mt-1">
              {usd(other.tax)}
              <span className="theme-text-muted text-sm font-medium"> / yr</span>
            </div>
            {residency === "primary" && savings > 0 && (
              <div className="theme-text-muted text-xs mt-1.5">
                Living in it saves about {usd(savings)} a year in school operating tax under Act 388,
                on top of the lower 4% assessment.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
