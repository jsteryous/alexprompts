import "server-only";
import { createClient } from "@supabase/supabase-js";

export type CityStats = {
  county: string;
  n_audited: number;
  n_no_website: number;
  lh_median: number | null;
  lh_sample: number;
  lh_under_50_pct: number;
  forms_unreachable: number;
  forms_unreachable_pct: number;
  viewport_missing: number;
  viewport_missing_pct: number;
  no_https: number;
  no_https_pct: number;
  stale_copyright_2plus: number;
  stale_copyright_2plus_pct: number;
  high_rated_broken: number;
  high_rated_broken_pct: number;
  high_rated_n: number;
  hot: number;
  warm: number;
  generated_at: string;
};

type Row = {
  audit_status: string | null;
  severity_score: number | null;
  severity_tag: string | null;
  google_rating: number | null;
  lighthouse_mobile_score: number | null;
  issues: Record<string, unknown> | null;
};

const MIN_CITATION_N = 3;

function pct(num: number, denom: number): number {
  if (denom <= 0) return 0;
  return Math.round((100 * num) / denom);
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid];
}

export type PortfolioStats = {
  n_audited: number;
  counties: string[];
  // "Upstate" when audited counties ⊂ Upstate Tier 1; "South Carolina"
  // once the audit pool spans Midlands/Lowcountry/Coast. Derived, not stored.
  region_label: "Upstate" | "South Carolina";
  lh_median: number | null;
  lh_sample: number;
  lh_under_50_pct: number;
  // Established cohort: audited practices with >=100 Google reviews.
  // This is the StoryBrand "authority" stat — established practices with
  // strong reputations whose sites silently underperform.
  established_n: number;
  established_avg_rating: number | null;
  established_lh_under_50_pct: number;
  generated_at: string;
};

const PORTFOLIO_MIN_N = 10;
const ESTABLISHED_MIN_REVIEWS = 100;
const ESTABLISHED_MIN_N = 10;
const UPSTATE_COUNTIES = new Set([
  "greenville",
  "spartanburg",
  "anderson",
  "pickens",
  "oconee",
]);

export async function fetchPortfolioStats(): Promise<PortfolioStats | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;

  const client = createClient(url, key);
  const { data, error } = await client
    .from("website_prospects")
    .select(
      "audit_status, lighthouse_mobile_score, county, google_rating, google_review_count",
    )
    .eq("vertical", "dental")
    .eq("audit_status", "audited");

  if (error) {
    console.error("[portfolioStats]:", error.message);
    return null;
  }
  const rows = (data ?? []) as {
    lighthouse_mobile_score: number | null;
    county: string | null;
    google_rating: number | null;
    google_review_count: number | null;
  }[];
  const n = rows.length;
  if (n < PORTFOLIO_MIN_N) return null;

  const counties = Array.from(
    new Set(rows.map((r) => r.county).filter((c): c is string => Boolean(c))),
  ).sort();
  const regionLabel: "Upstate" | "South Carolina" =
    counties.length > 0 &&
    counties.every((c) => UPSTATE_COUNTIES.has(c.toLowerCase()))
      ? "Upstate"
      : "South Carolina";

  const lhScores = rows
    .map((r) => r.lighthouse_mobile_score)
    .filter((s): s is number => typeof s === "number");

  const established = rows.filter(
    (r) => (r.google_review_count ?? 0) >= ESTABLISHED_MIN_REVIEWS,
  );
  const establishedN = established.length;
  const establishedRatings = established
    .map((r) => r.google_rating)
    .filter((x): x is number => typeof x === "number");
  const establishedLhScores = established
    .map((r) => r.lighthouse_mobile_score)
    .filter((s): s is number => typeof s === "number");
  const establishedAvgRating =
    establishedRatings.length > 0
      ? Math.round(
          (establishedRatings.reduce((a, b) => a + b, 0) /
            establishedRatings.length) *
            10,
        ) / 10
      : null;
  const establishedUnder50Pct = pct(
    establishedLhScores.filter((s) => s < 50).length,
    establishedLhScores.length,
  );

  return {
    n_audited: n,
    counties,
    region_label: regionLabel,
    lh_median: median(lhScores),
    lh_sample: lhScores.length,
    lh_under_50_pct: pct(lhScores.filter((s) => s < 50).length, lhScores.length),
    established_n: establishedN >= ESTABLISHED_MIN_N ? establishedN : 0,
    established_avg_rating:
      establishedN >= ESTABLISHED_MIN_N ? establishedAvgRating : null,
    established_lh_under_50_pct:
      establishedN >= ESTABLISHED_MIN_N ? establishedUnder50Pct : 0,
    generated_at: new Date().toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }),
  };
}

export async function fetchCityStats(county: string): Promise<CityStats | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;

  const client = createClient(url, key);
  const { data, error } = await client
    .from("website_prospects")
    .select(
      "audit_status, severity_score, severity_tag, google_rating, lighthouse_mobile_score, issues",
    )
    .eq("vertical", "dental")
    .ilike("county", county);

  if (error) {
    console.error(`[cityStats] ${county}:`, error.message);
    return null;
  }
  const rows = (data ?? []) as Row[];
  const audited = rows.filter((r) => r.audit_status === "audited");
  const n = audited.length;
  if (n < MIN_CITATION_N) return null;

  const noWebsite = rows.filter((r) => r.audit_status === "no_website").length;

  const has = (key: string) =>
    audited.filter((r) => Boolean(r.issues?.[key])).length;

  const viewportMissing = has("viewport_missing");
  const noHttps = has("no_https");
  const formsUnreachable = has("forms_unreachable");

  const nowYear = new Date().getUTCFullYear();
  const staleCopyright2plus = audited.filter((r) => {
    const y = r.issues?.stale_copyright;
    return typeof y === "number" && nowYear - y >= 2;
  }).length;

  const lhScores = audited
    .map((r) => r.lighthouse_mobile_score)
    .filter((s): s is number => typeof s === "number");
  const lhMedian = median(lhScores);
  const lhUnder50 = lhScores.filter((s) => s < 50).length;

  const highRated = audited.filter((r) => (r.google_rating ?? 0) >= 4.5);
  const highRatedBroken = highRated.filter(
    (r) => (r.severity_score ?? 0) >= 40,
  ).length;

  const hot = audited.filter((r) => r.severity_tag === "HOT").length;
  const warm = audited.filter((r) => r.severity_tag === "WARM").length;

  return {
    county,
    n_audited: n,
    n_no_website: noWebsite,
    lh_median: lhMedian,
    lh_sample: lhScores.length,
    lh_under_50_pct: pct(lhUnder50, lhScores.length),
    forms_unreachable: formsUnreachable,
    forms_unreachable_pct: pct(formsUnreachable, n),
    viewport_missing: viewportMissing,
    viewport_missing_pct: pct(viewportMissing, n),
    no_https: noHttps,
    no_https_pct: pct(noHttps, n),
    stale_copyright_2plus: staleCopyright2plus,
    stale_copyright_2plus_pct: pct(staleCopyright2plus, n),
    high_rated_broken: highRatedBroken,
    high_rated_broken_pct: pct(highRatedBroken, highRated.length),
    high_rated_n: highRated.length,
    hot,
    warm,
    generated_at: new Date().toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }),
  };
}
