#!/usr/bin/env node
/**
 * Deal-check guard: the /check-a-deal math must reproduce the worked example.
 *
 * The example ($280,000 house, $2,600 rent, 25% down at 7% for 30 years) is
 * the one Alex wrote out by hand, and the page opens on it. If a refactor of
 * src/lib/dealCheck.ts moves any of these figures, the page would be telling
 * readers something different from the arithmetic it claims to show.
 *
 * Run: npm run check:deal   (also runs on `npm run lint`)
 * Needs Node 22.6+ for --experimental-strip-types, which package.json passes.
 */

import {
  DSCR_TARGET,
  EXAMPLE,
  analyze,
  grade,
  maxPriceWhere,
  weakest,
} from "../../src/lib/dealCheck.ts";

const r = analyze(EXAMPLE);
const failures = [];
const near = (label, got, want, tol) => {
  if (Math.abs(got - want) > tol) failures.push(`${label}: got ${got}, want ${want} (±${tol})`);
};

near("NOI", r.noi, 18088, 0.5);
near("cap rate", r.capRate, 0.0646, 0.0001);
near("loan constant", r.loanConstant, 0.0798, 0.0001);
near("annual debt service", r.debtService, 16766, 1);
near("DSCR", r.dscr, 1.08, 0.005);
near("cash flow", r.cashFlow, 1322, 1);
near("cash invested", r.cashInvested, 78000, 0.5);
near("cash-on-cash", r.cashOnCash, 0.017, 0.0005);
near("principal paydown", r.principalPaydown, 2133, 1);
near("total return", r.totalReturn, 11855, 1.5);
near("total return %", r.totalReturnPct, 0.152, 0.0005);
near("appreciation share", r.appreciationShare, 0.70, 0.01);
if (r.stressCashFlow >= 0) failures.push("stress test: an extra vacant month should turn the year negative");

const verdict = weakest(grade(EXAMPLE, r));
if (verdict !== "fail") failures.push(`verdict: got ${verdict}, want fail`);

const lenderPrice = maxPriceWhere(EXAMPLE, (x) => x.dscr >= DSCR_TARGET);
near("price at DSCR 1.25", lenderPrice ?? 0, 242000, 500);
near("cash-on-cash at that price", analyze({ ...EXAMPLE, price: lenderPrice ?? 0 }).cashOnCash, 0.053, 0.0005);

if (failures.length) {
  console.error("deal-check: the math no longer matches the worked example:");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("deal-check: worked example reproduces.");
