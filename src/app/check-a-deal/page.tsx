import type { Metadata } from "next";
import { site } from "@/lib/site";
import DealCheck from "./DealCheck";

export const metadata: Metadata = {
  title: "Check a Deal",
  description:
    "Run a rental property through the checks a lender runs before lending on it: debt " +
    "coverage, cash return, leverage, a bad-month stress test, and how much rests on appreciation.",
  alternates: { canonical: `${site.url}/check-a-deal` },
};

/**
 * Check a Deal (October 3, 2026). ONE calculator, on purpose.
 *
 * The nine consumer tools were deleted in August 2026 because a calculator
 * suite under a masthead reads as a lead-gen site. This page is a different
 * object: a single underwriting check aimed at the investor reader, built
 * because Alex wants the site to keep people out of bad purchases, and it
 * thinks the way a lender does. It runs the checks in order and lets the
 * WEAKEST one set the verdict, so a deal cannot pass on appreciation while it
 * fails on cash flow. Do not grow it back into a suite.
 *
 * The math is in src/lib/dealCheck.ts and is asserted against the worked
 * example by scripts/checks/deal-check.mjs (runs in `npm run lint`).
 *
 * Copy rules, same as everywhere: uncontracted, no em or en dashes, no
 * fragments, and never explain the referral mechanism (root CLAUDE.md).
 */
export default function CheckADealPage() {
  return (
    <section className="theme-page pt-32 pb-28 lg:pb-24">
      <div className="max-w-6xl mx-auto px-6">
        <header className="max-w-2xl mb-14">
          <span className="theme-label type-eyebrow block mb-4">Check a Deal</span>
          <h1 className="theme-text-primary type-h1 mb-6">Run a rental the way a lender would.</h1>
          <p className="theme-text-secondary type-body-lg leading-relaxed mb-4">
            A bank deciding whether to lend on a rental starts with one question. Does the rent pay
            the loan with room to spare? Upside comes later, if at all.
          </p>
          <p className="theme-text-muted type-body-lg leading-relaxed">
            Put in a property and this page runs the same checks in the order a lender would. The
            weakest one decides the verdict, and the math runs backward to tell you the price at
            which the deal starts to work. It opens on a made-up example: a $280,000 house renting
            for $2,600 a month, with 25% down at 7%.
          </p>
        </header>

        <DealCheck />
      </div>
    </section>
  );
}
