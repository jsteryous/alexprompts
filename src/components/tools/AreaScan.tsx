"use client";

import { useMemo, useState } from "react";
import { COMPETITOR_TYPES } from "@/lib/areaScan";
import { AreaScanMap } from "@/components/tools/AreaScanMap";

/**
 * Area scan UI (Tier 2). Posts an address + competitor type to /api/area-scan and
 * renders the category counts and a saturation read. All Google calls happen on
 * the server; this component only ever sees counts and names, never the key.
 *
 * `configured` is passed from the server page so we can show a clear "not set up
 * yet" state when GOOGLE_PLACES_API_KEY is missing, instead of a failing fetch.
 */

type PlaceItem = { name: string; lat: number; lng: number };
type CategoryResult = { key: string; label: string; count: number; capped: boolean; places: PlaceItem[] };
type Saturation = "sparse" | "moderate" | "crowded";
type Demographics = {
  geography: string;
  year: number;
  population?: number;
  populationGrowthPct?: number;
  medianHouseholdIncome?: number;
  medianHomeValue?: number;
  medianGrossRent?: number;
  ownerPct?: number;
  renterPct?: number;
};
type ScanData = {
  location: { formattedAddress: string; lat: number; lng: number };
  radiusMeters: number;
  categories: CategoryResult[];
  competitor: CategoryResult & { saturation: Saturation };
  demographics: Demographics | null;
};

const RADII = [
  { value: 805, label: "0.5 mi" },
  { value: 1609, label: "1 mi" },
  { value: 3219, label: "2 mi" },
] as const;

const SATURATION_COPY: Record<Saturation, { label: string; tone: string; note: string }> = {
  sparse: { label: "Sparse", tone: "tone-good", note: "Few competitors nearby. Room to enter." },
  moderate: { label: "Moderate", tone: "tone-warm", note: "A working market, not saturated yet." },
  crowded: { label: "Crowded", tone: "tone-hot", note: "Already well served. Differentiation matters." },
};

function fmtCount(c: { count: number; capped: boolean }): string {
  return c.capped ? `${c.count}+` : String(c.count);
}

/** Open the place on Google Maps by name + coordinates. */
function mapsUrl(p: PlaceItem): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.name} ${p.lat},${p.lng}`)}`;
}

const usd0 = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/** The demographic stats to show, in order, derived from a Demographics object. */
function demoStats(d: Demographics): { label: string; value: string; hint?: string }[] {
  const out: { label: string; value: string; hint?: string }[] = [];
  if (d.medianHouseholdIncome != null)
    out.push({ label: "Median income", value: usd0(d.medianHouseholdIncome), hint: "per household" });
  if (d.medianHomeValue != null)
    out.push({ label: "Median home value", value: usd0(d.medianHomeValue) });
  if (d.medianGrossRent != null)
    out.push({ label: "Median rent", value: `${usd0(d.medianGrossRent)}/mo` });
  if (d.ownerPct != null && d.renterPct != null)
    out.push({ label: "Owner / renter", value: `${d.ownerPct}% / ${d.renterPct}%`, hint: "of occupied homes" });
  if (d.population != null) {
    const growth =
      d.populationGrowthPct != null
        ? `${d.populationGrowthPct >= 0 ? "+" : ""}${d.populationGrowthPct}% over ~5 yrs`
        : undefined;
    out.push({ label: "Population", value: d.population.toLocaleString("en-US"), hint: growth });
  }
  return out;
}

export function AreaScan({ configured }: { configured: boolean }) {
  const [address, setAddress] = useState("");
  const [competitorType, setCompetitorType] = useState<string>(COMPETITOR_TYPES[0].value);
  const [radius, setRadius] = useState<number>(1609);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ScanData | null>(null);
  // Which category/competitor list is expanded, by key (null = none).
  const [openKey, setOpenKey] = useState<string | null>(null);

  // Combine every amenity point into one heat layer (stable per scan). Declared
  // before any early return so the hook order never changes.
  const heatPoints = useMemo(
    () => (data ? data.categories.flatMap((c) => c.places.map((p) => ({ lat: p.lat, lng: p.lng }))) : []),
    [data],
  );

  // The expanded category for the panel under the grid. The competitor list
  // expands inline inside its own card, so it is intentionally not handled here
  // (keeps the disclosure next to whatever you clicked).
  const openCategory = useMemo(
    () => (data && openKey ? data.categories.find((c) => c.key === openKey) ?? null : null),
    [data, openKey],
  );

  const toggle = (k: string) => setOpenKey((prev) => (prev === k ? null : k));

  const inputCls = "theme-field w-full px-3 py-2.5 text-sm";

  async function scan() {
    setError(null);
    setLoading(true);
    setData(null);
    setOpenKey(null);
    try {
      const res = await fetch("/api/area-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, competitorType, radius }),
      });
      const json = await res.json();
      if (json.ok) setData(json.data as ScanData);
      else setError(json.message ?? "Something went wrong.");
    } catch {
      setError("Could not reach the scanner. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!configured) {
    return (
      <div className="theme-card-warn border theme-border rounded-xl p-6">
        <h2 className="theme-text-primary text-lg font-semibold mb-2">Scanner not configured yet</h2>
        <p className="theme-text-muted text-sm leading-relaxed">
          This tool needs a Google Places API key with billing guardrails in place. It will go live
          here once that is set up.
        </p>
      </div>
    );
  }

  const sat = data ? SATURATION_COPY[data.competitor.saturation] : null;

  return (
    <div>
      <form
        className="grid gap-4 sm:grid-cols-[1fr_auto] items-end"
        onSubmit={(e) => {
          e.preventDefault();
          if (!loading) scan();
        }}
      >
        <label className="block sm:col-span-2">
          <span className="theme-text-secondary text-sm font-medium">Address or place</span>
          <input
            className={`${inputCls} mt-1.5`}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main St, Greenville SC"
          />
        </label>
        <label className="block">
          <span className="theme-text-secondary text-sm font-medium">Business type to size up</span>
          <select
            className={`${inputCls} mt-1.5`}
            value={competitorType}
            onChange={(e) => setCompetitorType(e.target.value)}
          >
            {COMPETITOR_TYPES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-2 items-end">
          <label className="block">
            <span className="theme-text-secondary text-sm font-medium">Radius</span>
            <select
              className={`${inputCls} mt-1.5`}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
            >
              {RADII.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            disabled={loading || !address.trim()}
            className="theme-cta-accent font-semibold px-6 py-2.5 rounded-xl disabled:opacity-50"
          >
            {loading ? "Scanning..." : "Scan"}
          </button>
        </div>
      </form>

      {error && (
        <div className="theme-card-warn border theme-border rounded-xl p-4 mt-6">
          <p className="theme-text-primary text-sm">{error}</p>
        </div>
      )}

      {data && sat && (
        <div className="mt-8">
          <p className="theme-text-muted text-sm mb-5">
            Within {RADII.find((r) => r.value === data.radiusMeters)?.label ?? ""} of{" "}
            <span className="theme-text-secondary font-medium">{data.location.formattedAddress}</span>
          </p>

          {/* Heatmap of everything nearby */}
          {heatPoints.length > 0 && (
            <div className="mb-6">
              <AreaScanMap
                center={{ lat: data.location.lat, lng: data.location.lng }}
                radiusMeters={data.radiusMeters}
                points={heatPoints}
              />
              <p className="theme-text-muted text-xs mt-2">
                Warmer areas have more going on nearby. The pin is your address.
              </p>
            </div>
          )}

          {/* Neighborhood profile (free Census/ACS data) */}
          {data.demographics && demoStats(data.demographics).length > 0 && (
            <div className="mb-6">
              <div className="theme-text-muted text-xs font-semibold uppercase tracking-widest mb-3">
                Neighborhood profile
              </div>
              <ul className="grid gap-4 grid-cols-2 lg:grid-cols-3">
                {demoStats(data.demographics).map((s) => (
                  <li key={s.label} className="theme-card-muted border theme-border rounded-xl p-4">
                    <div className="theme-text-muted text-xs font-semibold uppercase tracking-widest">
                      {s.label}
                    </div>
                    <div className="theme-text-primary text-xl font-bold tabular-nums mt-1">{s.value}</div>
                    {s.hint && <div className="theme-text-muted text-xs mt-0.5">{s.hint}</div>}
                  </li>
                ))}
              </ul>
              <p className="theme-text-muted text-xs mt-2">
                Source: US Census ACS {data.demographics.year} 5-year estimates, {data.demographics.geography}.
                Estimates, not exact.
              </p>
            </div>
          )}

          {/* Subject result: the business type searched. The list expands inline
              inside this card, right under the toggle, so it appears on click
              without scrolling. */}
          <div
            className="theme-card-strong border theme-border rounded-2xl p-6 mb-6"
            style={openKey === data.competitor.key ? openCardStyle : undefined}
          >
            <button
              type="button"
              onClick={() => toggle(data.competitor.key)}
              aria-expanded={openKey === data.competitor.key}
              disabled={data.competitor.count === 0}
              className="w-full text-left block"
            >
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="theme-text-muted text-xs font-semibold uppercase tracking-widest mb-1">
                    {data.competitor.label}
                  </div>
                  <div className="theme-text-primary text-3xl font-bold tabular-nums">
                    {fmtCount(data.competitor)}
                    <span className="theme-text-muted text-base font-normal"> nearby</span>
                  </div>
                </div>
                <span
                  className={`${sat.tone} border text-sm font-semibold uppercase tracking-widest px-3 py-1.5 rounded-lg`}
                >
                  {sat.label}
                </span>
              </div>
              <p className="theme-text-muted text-sm mt-3">{sat.note}</p>
              {data.competitor.count > 0 && (
                <span className="theme-label text-xs font-semibold inline-flex items-center gap-1 mt-3">
                  {openKey === data.competitor.key ? "Hide the list" : "See the list"}
                  <Chevron open={openKey === data.competitor.key} />
                </span>
              )}
            </button>
            {openKey === data.competitor.key && data.competitor.places.length > 0 && (
              <div className="mt-5 pt-5 border-t theme-border">
                <PlaceList places={data.competitor.places} capped={data.competitor.capped} />
              </div>
            )}
          </div>

          {/* Neighborhood amenity counts (click a card to list them) */}
          <div className="theme-text-muted text-xs font-semibold uppercase tracking-widest mb-3">
            What is already nearby
          </div>
          <ul className="grid gap-4 grid-cols-2 sm:grid-cols-3">
            {data.categories.map((c) => {
              const open = openKey === c.key;
              return (
                <li key={c.key}>
                  <button
                    type="button"
                    onClick={() => toggle(c.key)}
                    aria-expanded={open}
                    disabled={c.count === 0}
                    className="theme-card-muted border theme-border rounded-xl p-4 w-full text-left block h-full disabled:opacity-60"
                    style={open ? openCardStyle : undefined}
                  >
                    <div className="theme-text-primary text-2xl font-bold tabular-nums">{fmtCount(c)}</div>
                    <div className="theme-text-muted text-xs font-semibold uppercase tracking-widest mt-1 flex items-center justify-between gap-1">
                      {c.label}
                      {c.count > 0 && <Chevron open={open} />}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Detail panel for the open amenity category, directly under the grid. */}
          {openCategory && openCategory.places.length > 0 && (
            <div className="theme-card-strong border theme-border rounded-2xl p-6 mt-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="theme-text-primary text-lg font-semibold">
                  {openCategory.label}{" "}
                  <span className="theme-text-muted font-normal">({fmtCount(openCategory)})</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setOpenKey(null)}
                  className="theme-text-muted text-xs font-semibold uppercase tracking-widest"
                >
                  Close
                </button>
              </div>
              <PlaceList places={openCategory.places} capped={openCategory.capped} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const openCardStyle: React.CSSProperties = {
  borderColor: "var(--accent)",
  boxShadow: "0 0 0 1px var(--accent)",
};

/** A numbered, two-column list of places, each linking out to Google Maps.
 *  Shared by the competitor card (inline) and the category panel. */
function PlaceList({ places, capped }: { places: PlaceItem[]; capped: boolean }) {
  return (
    <>
      <ul className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
        {places.map((p, i) => (
          <li key={`${p.name}-${i}`}>
            <a
              href={mapsUrl(p)}
              target="_blank"
              rel="noopener noreferrer"
              className="theme-link text-sm py-1.5 inline-flex items-baseline gap-2 hover:underline"
            >
              <span className="theme-text-muted tabular-nums text-xs w-5 shrink-0">{i + 1}.</span>
              {p.name}
            </a>
          </li>
        ))}
      </ul>
      {capped && (
        <p className="theme-text-muted text-xs mt-4">
          Showing the 20 closest. There may be more in this radius.
        </p>
      )}
    </>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      className={`transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}
