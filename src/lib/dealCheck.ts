/**
 * The math behind /check-a-deal: a rental property run through the checks a
 * lender runs before lending on it, in order, with the weakest one deciding.
 *
 * Pure functions, no React, so the worked example on the page and in
 * scripts/checks/deal-check.mjs can be asserted against the same code the form
 * runs. Every rate is a fraction (0.07), never a percent (7).
 *
 * TAXES AND INSURANCE ARE HELD FIXED when the solver moves the price. That is
 * a simplification: a lower purchase price lowers the reassessed tax bill a
 * little. Holding them fixed makes the "price that works" slightly
 * conservative, which is the safe direction for an estimate meant to stop a
 * bad purchase.
 */

export type DealInputs = {
  price: number;
  rentMonthly: number;
  taxesAnnual: number;
  insuranceAnnual: number;
  hoaMonthly: number;
  downPct: number;
  rate: number;
  termYears: number;
  closingCosts: number;
  vacancyPct: number;
  maintenancePct: number;
  capexPct: number;
  managementPct: number;
  appreciationPct: number;
  hurdlePct: number;
};

/** The lender's minimum. Most DSCR and commercial lenders want 1.20 to 1.25. */
export const DSCR_TARGET = 1.25;

/** Monthly principal-and-interest payment on a fully amortizing loan. */
export function monthlyPayment(loan: number, rate: number, termYears: number): number {
  const n = termYears * 12;
  if (loan <= 0 || n <= 0) return 0;
  const r = rate / 12;
  if (r === 0) return loan / n;
  return (loan * r) / (1 - Math.pow(1 + r, -n));
}

/** Principal repaid during the first twelve payments. */
export function firstYearPrincipal(loan: number, rate: number, termYears: number): number {
  const pmt = monthlyPayment(loan, rate, termYears);
  const r = rate / 12;
  let balance = loan;
  let paid = 0;
  for (let i = 0; i < Math.min(12, termYears * 12); i++) {
    const principal = pmt - balance * r;
    paid += principal;
    balance -= principal;
  }
  return paid;
}

export type DealResult = {
  grossRent: number;
  vacancy: number;
  maintenance: number;
  capex: number;
  management: number;
  hoa: number;
  totalExpenses: number;
  noi: number;
  capRate: number;
  loan: number;
  debtService: number;
  /** Annual debt service as a share of the loan: what borrowing costs per year. */
  loanConstant: number;
  dscr: number;
  cashFlow: number;
  cashInvested: number;
  cashOnCash: number;
  principalPaydown: number;
  appreciation: number;
  totalReturn: number;
  totalReturnPct: number;
  /** Share of the total return that is the appreciation assumption. */
  appreciationShare: number;
  /** Cash flow after one more month of vacancy than assumed. */
  stressCashFlow: number;
  /** Occupancy needed to cover every expense and the loan. */
  breakEvenOccupancy: number;
};

export function analyze(d: DealInputs): DealResult {
  const grossRent = d.rentMonthly * 12;
  const vacancy = grossRent * d.vacancyPct;
  const maintenance = grossRent * d.maintenancePct;
  const capex = grossRent * d.capexPct;
  const management = grossRent * d.managementPct;
  const hoa = d.hoaMonthly * 12;
  const totalExpenses =
    vacancy + d.taxesAnnual + d.insuranceAnnual + maintenance + capex + management + hoa;
  const noi = grossRent - totalExpenses;

  const loan = d.price * (1 - d.downPct);
  const debtService = monthlyPayment(loan, d.rate, d.termYears) * 12;
  const loanConstant = loan > 0 ? debtService / loan : 0;
  const dscr = debtService > 0 ? noi / debtService : Infinity;

  const cashFlow = noi - debtService;
  const cashInvested = d.price * d.downPct + d.closingCosts;
  const cashOnCash = cashInvested > 0 ? cashFlow / cashInvested : 0;

  const principalPaydown = firstYearPrincipal(loan, d.rate, d.termYears);
  const appreciation = d.price * d.appreciationPct;
  const totalReturn = cashFlow + principalPaydown + appreciation;
  const totalReturnPct = cashInvested > 0 ? totalReturn / cashInvested : 0;
  const appreciationShare = totalReturn > 0 ? appreciation / totalReturn : 1;

  // Every cost except vacancy, plus the loan, as a share of a full year's rent.
  const fixedNeed = totalExpenses - vacancy + debtService;
  const breakEvenOccupancy = grossRent > 0 ? fixedNeed / grossRent : Infinity;

  return {
    grossRent,
    vacancy,
    maintenance,
    capex,
    management,
    hoa,
    totalExpenses,
    noi,
    capRate: d.price > 0 ? noi / d.price : 0,
    loan,
    debtService,
    loanConstant,
    dscr,
    cashFlow,
    cashInvested,
    cashOnCash,
    principalPaydown,
    appreciation,
    totalReturn,
    totalReturnPct,
    appreciationShare,
    stressCashFlow: cashFlow - d.rentMonthly,
    breakEvenOccupancy,
  };
}

export type Grade = "pass" | "thin" | "fail";

export type Check = {
  key: "dscr" | "cash" | "leverage" | "stress" | "appreciation";
  label: string;
  grade: Grade;
  value: string;
  note: string;
};

const pct = (x: number, digits = 1) => `${(x * 100).toFixed(digits)}%`;
const usd = (x: number) =>
  `${x < 0 ? "-" : ""}$${Math.round(Math.abs(x)).toLocaleString("en-US")}`;

/** The five verdict checks, in the order a lender reads them. */
export function grade(d: DealInputs, r: DealResult): Check[] {
  const checks: Check[] = [];

  checks.push({
    key: "dscr",
    label: "Does the rent carry the loan?",
    value: Number.isFinite(r.dscr) ? r.dscr.toFixed(2) : "No loan",
    grade: !Number.isFinite(r.dscr) || r.dscr >= DSCR_TARGET ? "pass" : r.dscr >= 1 ? "thin" : "fail",
    note: !Number.isFinite(r.dscr)
      ? "With no loan there is no payment to cover."
      : r.dscr >= DSCR_TARGET
        ? `Income covers the payment ${r.dscr.toFixed(2)} times, above the ${DSCR_TARGET} most lenders want.`
        : r.dscr >= 1
          ? `Income covers the payment, but with less cushion than the ${DSCR_TARGET} most lenders want.`
          : "Income does not cover the payment. You would be feeding this property every month.",
  });

  checks.push({
    key: "cash",
    label: "Does your cash earn its keep?",
    value: pct(r.cashOnCash),
    grade: r.cashOnCash >= d.hurdlePct ? "pass" : r.cashOnCash > 0 ? "thin" : "fail",
    note:
      r.cashOnCash >= d.hurdlePct
        ? `Your ${usd(r.cashInvested)} earns more than the ${pct(d.hurdlePct)} you could get elsewhere.`
        : r.cashOnCash > 0
          ? `Your ${usd(r.cashInvested)} earns less than the ${pct(d.hurdlePct)} you said it could earn elsewhere.`
          : `Your ${usd(r.cashInvested)} earns nothing in cash. Every month costs you money.`,
  });

  const positive = r.loan <= 0 || r.capRate > r.loanConstant;
  checks.push({
    key: "leverage",
    label: "Does borrowing help or hurt?",
    value: `${pct(r.capRate)} vs ${pct(r.loanConstant)}`,
    grade: positive ? "pass" : "thin",
    note: positive
      ? "The property earns more on its price than the loan costs, so the debt adds to your return."
      : "The loan costs more per year than the property earns on its price, so every borrowed dollar lowers your cash return.",
  });

  checks.push({
    key: "stress",
    label: "Can it survive a bad month?",
    value: usd(r.stressCashFlow),
    grade: r.stressCashFlow >= 0 ? "pass" : "fail",
    note:
      r.stressCashFlow >= 0
        ? `One more vacant month than planned still leaves ${usd(r.stressCashFlow)} for the year.`
        : `One more vacant month than planned turns the year negative, and it takes ${pct(r.breakEvenOccupancy, 0)} occupancy just to break even.`,
  });

  checks.push({
    key: "appreciation",
    label: "How much rests on a guess?",
    value: pct(Math.min(Math.max(r.appreciationShare, 0), 1), 0),
    grade: r.appreciationShare <= 0.5 ? "pass" : "thin",
    note:
      r.totalReturn <= 0
        ? "The total return is negative even after appreciation."
        : r.appreciationShare <= 0.5
          ? "Most of the return comes from rent and loan paydown, which you can see today."
          : `About ${pct(r.appreciationShare, 0)} of the return is the appreciation assumption, which nobody can promise.`,
  });

  return checks;
}

export function weakest(checks: Check[]): Grade {
  if (checks.some((c) => c.grade === "fail")) return "fail";
  if (checks.some((c) => c.grade === "thin")) return "thin";
  return "pass";
}

/**
 * The highest price at which `ok` still holds, found by bisection. Every check
 * this is used for gets easier as the price falls (smaller loan, smaller down
 * payment), so the passing region is everything below one boundary. Returns
 * null when even a near-zero price fails, which means the rent cannot support
 * the deal at any price under these terms.
 */
export function maxPriceWhere(d: DealInputs, ok: (r: DealResult) => boolean): number | null {
  let lo = 1;
  let hi = Math.max(d.price, 1) * 4;
  if (!ok(analyze({ ...d, price: lo }))) return null;
  if (ok(analyze({ ...d, price: hi }))) return hi;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (ok(analyze({ ...d, price: mid }))) lo = mid;
    else hi = mid;
  }
  return lo;
}

/** Down payment share at which DSCR reaches the target, or null if none does. */
export function downPctForDscr(d: DealInputs): number | null {
  const r = analyze(d);
  if (r.noi <= 0) return null;
  const maxDebtService = r.noi / DSCR_TARGET;
  const perDollar = monthlyPayment(1, d.rate, d.termYears) * 12;
  if (perDollar <= 0) return null;
  const maxLoan = maxDebtService / perDollar;
  return Math.min(Math.max(1 - maxLoan / d.price, 0), 1);
}

/** Monthly rent at which DSCR reaches the target at the current price. */
export function rentForDscr(d: DealInputs): number | null {
  const shareKept =
    1 - d.vacancyPct - d.maintenancePct - d.capexPct - d.managementPct;
  if (shareKept <= 0) return null;
  const r = analyze(d);
  const neededNoi = r.debtService * DSCR_TARGET;
  const fixed = d.taxesAnnual + d.insuranceAnnual + d.hoaMonthly * 12;
  return (neededNoi + fixed) / shareKept / 12;
}

/** The worked example from the page, and the form's starting values. */
export const EXAMPLE: DealInputs = {
  price: 280000,
  rentMonthly: 2600,
  taxesAnnual: 3000,
  insuranceAnnual: 2000,
  hoaMonthly: 0,
  downPct: 0.25,
  rate: 0.07,
  termYears: 30,
  closingCosts: 8000,
  vacancyPct: 0.05,
  maintenancePct: 0.08,
  capexPct: 0.05,
  managementPct: 0.08,
  appreciationPct: 0.03,
  hurdlePct: 0.05,
};
