"use client";

import { useState } from "react";
import { COMPETITOR_TYPES } from "@/lib/areaScan";

/**
 * Area scan UI (Tier 2). Posts an address + competitor type to /api/area-scan and
 * renders the category counts and a saturation read. All Google calls happen on
 * the server; this component only ever sees counts and names, never the key.
 *
 * `configured` is passed from the server page so we can show a clear "not set up
 * yet" state when GOOGLE_PLACES_API_KEY is missing, instead of a failing fetch.
 */

type CategoryResult = { key: string; label: string; count: number; capped: boolean; examples: string[] };
type Saturation = "sparse" | "moderate" | "crowded";
type ScanData = {
  location: { formattedAddress: string; lat: number; lng: number };
  radiusMeters: number;
  categories: CategoryResult[];
  competitor: CategoryResult & { saturation: Saturation };
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

function fmtCount(c: CategoryResult): string {
  return c.capped ? `${c.count}+` : String(c.count);
}

export function AreaScan({ configured }: { configured: boolean }) {
  const [address, setAddress] = useState("");
  const [competitorType, setCompetitorType] = useState<string>(COMPETITOR_TYPES[0].value);
  const [radius, setRadius] = useState<number>(1609);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ScanData | null>(null);

  const inputCls = "theme-field w-full px-3 py-2.5 text-sm";

  async function scan() {
    setError(null);
    setLoading(true);
    setData(null);
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

          {/* Competitor saturation headline */}
          <div className="theme-card-strong border theme-border rounded-2xl p-6 mb-6">
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
            {data.competitor.examples.length > 0 && (
              <p className="theme-text-muted text-xs mt-2">
                e.g. {data.competitor.examples.join(", ")}
              </p>
            )}
          </div>

          {/* Neighborhood amenity counts */}
          <div className="theme-text-muted text-xs font-semibold uppercase tracking-widest mb-3">
            What is already nearby
          </div>
          <ul className="grid gap-4 grid-cols-2 sm:grid-cols-3">
            {data.categories.map((c) => (
              <li key={c.key} className="theme-card-muted border theme-border rounded-xl p-4">
                <div className="theme-text-primary text-2xl font-bold tabular-nums">{fmtCount(c)}</div>
                <div className="theme-text-muted text-xs font-semibold uppercase tracking-widest mt-1">
                  {c.label}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
