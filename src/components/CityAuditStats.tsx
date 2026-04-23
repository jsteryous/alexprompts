import { type CityStats } from "@/lib/cityStats";

type Props = {
  cityName: string;
  county: string;
  stats: CityStats;
};

function StatTile({
  value,
  label,
  emphasis,
}: {
  value: string;
  label: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`theme-card border rounded-2xl p-5 md:p-6 flex flex-col gap-2 ${
        emphasis ? "theme-card-accent" : ""
      }`}
    >
      <span className="theme-text-primary text-3xl md:text-4xl font-bold tracking-tight leading-none">
        {value}
      </span>
      <span className="theme-text-muted text-xs md:text-sm leading-snug">
        {label}
      </span>
    </div>
  );
}

function buildTakeaways(s: CityStats, cityName: string): string[] {
  const lines: string[] = [];

  if (s.forms_unreachable_pct >= 20) {
    lines.push(
      `Roughly ${s.forms_unreachable_pct}% of audited ${cityName}-area practices have a contact or booking form pointing at a dead endpoint. Every one of those is a lost new-patient booking the front desk never sees.`,
    );
  } else if (s.forms_unreachable > 0) {
    lines.push(
      `${s.forms_unreachable} audited ${cityName}-area practices have a contact or booking form pointing at a dead endpoint — a silent new-patient leak.`,
    );
  }

  if (s.lh_median !== null && s.lh_median < 60) {
    lines.push(
      `The median mobile Lighthouse score across the ${cityName} set is ${s.lh_median}/100. Google's Map Pack weights mobile performance — if your number is lower, a competitor is drifting above you every month.`,
    );
  }

  if (s.high_rated_n >= 3 && s.high_rated_broken_pct >= 40) {
    lines.push(
      `${s.high_rated_broken} of ${s.high_rated_n} practices in ${cityName} with a 4.5+ Google rating have a site carrying at least one critical issue. Great reviews, broken storefront — a recurring pattern, and the one that's easiest to leapfrog.`,
    );
  }

  if (s.stale_copyright_2plus_pct >= 25) {
    lines.push(
      `${s.stale_copyright_2plus_pct}% of audited sites still display a footer copyright year that's 2+ years stale. It signals "we haven't looked at this site in a while" to every patient who scrolls down.`,
    );
  }

  if (s.n_no_website > 0) {
    lines.push(
      `${s.n_no_website} ${cityName}-area dental practices in our discovery set have no website at all — Google Business Profile only.`,
    );
  }

  return lines.slice(0, 3);
}

export default function CityAuditStats({ cityName, county, stats }: Props) {
  const takeaways = buildTakeaways(stats, cityName);
  const lhDisplay =
    stats.lh_median !== null ? `${stats.lh_median}/100` : "—";

  return (
    <section className="theme-section py-20 md:py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-3xl mb-10">
          <span className="theme-label inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-4">
            What we&rsquo;ve found in {county} County
          </span>
          <h2 className="theme-text-primary text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5">
            We&rsquo;ve audited{" "}
            <span className="theme-label">{stats.n_audited}</span>{" "}
            {cityName}-area dental sites.
            <br />
            Here&rsquo;s what keeps breaking.
          </h2>
          <p className="theme-text-secondary text-base leading-relaxed">
            This is first-party data &mdash; not an industry study, not a vendor
            report. Every row is a {county} County dental site we ran through a
            headless-browser audit: mobile + desktop screenshots, form-endpoint
            probing, HTTPS and viewport checks, Lighthouse mobile score.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          <StatTile
            value={`${stats.n_audited}`}
            label={`${cityName}-area dental sites audited`}
            emphasis
          />
          <StatTile
            value={lhDisplay}
            label="Median mobile Lighthouse score"
          />
          <StatTile
            value={`${stats.forms_unreachable_pct}%`}
            label="Have a contact form pointing at a dead endpoint"
          />
          <StatTile
            value={`${stats.stale_copyright_2plus_pct}%`}
            label="Show a footer copyright 2+ years stale"
          />
        </div>

        {takeaways.length > 0 && (
          <ul className="space-y-4 max-w-3xl">
            {takeaways.map((line) => (
              <li
                key={line}
                className="theme-text-secondary text-base leading-relaxed flex gap-3"
              >
                <span className="theme-label font-bold mt-0.5 select-none">
                  &rarr;
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        )}

        <p className="theme-text-muted text-xs md:text-sm italic mt-10 max-w-3xl leading-relaxed">
          Methodology: headless-browser audit of dental practice websites in{" "}
          {county} County, {stats.generated_at}. n = {stats.n_audited}{" "}
          audited. Counts refresh as the audit pipeline runs.
        </p>
      </div>
    </section>
  );
}
