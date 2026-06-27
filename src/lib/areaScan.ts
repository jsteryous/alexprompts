/**
 * Server-only logic for the /tools/area-scan tool (Tier 2). Geocodes an address,
 * then counts nearby places by category and for a chosen competitor type, to give
 * an investor a 60-second read on how built-up / saturated an area is.
 *
 * GUARDRAILS (the user must never be invoiced):
 *  - The HARD guarantee is a per-API daily QUOTA set in Google Cloud Console below
 *    the free monthly allotment. Quotas hard-stop with an error; budgets do not.
 *    See the setup notes in CLAUDE.md / the PR description.
 *  - This module adds soft backstops: a 24h response cache (cuts repeat calls to
 *    ~zero), per-IP rate limiting, and a daily ceiling on upstream Google calls.
 *    On serverless these are best-effort per instance and reset on cold start, so
 *    they REDUCE spend but do not replace the console quota. For a durable shared
 *    cap, move the counters to Vercel KV / Upstash later.
 *
 * No key configured -> every entry point returns { code: "not_configured" } so the
 * tool renders a clean setup state instead of crashing. The key is read from
 * GOOGLE_PLACES_API_KEY and never leaves the server.
 */

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

/** Daily ceiling on real Google calls (geocode + each nearby search counts as 1).
 *  Soft backstop only; the console quota is the real cap. Override with env. */
const DAILY_CALL_CAP = Number(process.env.AREA_SCAN_DAILY_CAP ?? 250);
/** Per-IP scans allowed inside the rolling window. */
const RATE_LIMIT = Number(process.env.AREA_SCAN_RATE_LIMIT ?? 6);
const RATE_WINDOW_MS = 60_000;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
/** Nearby search caps results at 20; that is plenty for a "how crowded" signal. */
const MAX_RESULTS = 20;

export type ScanRadius = 805 | 1609 | 3219; // 0.5, 1, 2 miles in meters.

/** Fixed categories that read as "neighborhood maturity" for residential plays.
 *  Multiple type strings in one entry are unioned in a single Google call. */
export const SCAN_CATEGORIES = [
  { key: "grocery", label: "Grocery", types: ["supermarket", "grocery_store"] },
  { key: "dining", label: "Restaurants", types: ["restaurant"] },
  { key: "cafes", label: "Coffee", types: ["cafe", "coffee_shop"] },
  { key: "schools", label: "Schools", types: ["school", "primary_school", "secondary_school"] },
  { key: "fitness", label: "Gyms", types: ["gym", "fitness_center"] },
  { key: "parks", label: "Parks", types: ["park"] },
] as const;

/** Competitor types an investor/developer might be sizing up. Conservative list of
 *  well-known Places API (New) Table A type strings to avoid invalid-type errors. */
export const COMPETITOR_TYPES = [
  { value: "restaurant", label: "Restaurant" },
  { value: "cafe", label: "Coffee shop" },
  { value: "gym", label: "Gym / fitness" },
  { value: "convenience_store", label: "Convenience store" },
  { value: "supermarket", label: "Grocery store" },
  { value: "gas_station", label: "Gas station" },
  { value: "car_wash", label: "Car wash" },
  { value: "car_repair", label: "Auto repair" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "bar", label: "Bar" },
  { value: "hair_salon", label: "Hair salon" },
  { value: "laundry", label: "Laundromat" },
] as const;

export type ScanErrorCode =
  | "not_configured"
  | "rate_limited"
  | "daily_cap"
  | "bad_request"
  | "geocode_failed"
  | "upstream_error";

export type LatLng = { lat: number; lng: number };

export type CategoryResult = {
  key: string;
  label: string;
  count: number;
  /** True when the count hit the 20 cap, so it is "20+". */
  capped: boolean;
  examples: string[];
  /** Coordinates of each found place, for the heatmap. */
  points: LatLng[];
};

export type Saturation = "sparse" | "moderate" | "crowded";

export type ScanResult = {
  location: { formattedAddress: string; lat: number; lng: number };
  radiusMeters: number;
  categories: CategoryResult[];
  competitor: CategoryResult & { saturation: Saturation };
};

export type ScanResponse =
  | { ok: true; data: ScanResult }
  | { ok: false; code: ScanErrorCode; message: string };

export function isConfigured(): boolean {
  return Boolean(API_KEY);
}

// ── soft, in-memory guardrail + cache state (per serverless instance) ──────────
const cache = new Map<string, { at: number; value: unknown }>();
const ipHits = new Map<string, number[]>();
const dayCounter = { day: "", count: 0 };

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Returns false (and does not increment) once the daily ceiling is reached. */
function reserveCall(): boolean {
  const day = todayKey();
  if (dayCounter.day !== day) {
    dayCounter.day = day;
    dayCounter.count = 0;
  }
  if (dayCounter.count >= DAILY_CALL_CAP) return false;
  dayCounter.count += 1;
  return true;
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (ipHits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_LIMIT) {
    ipHits.set(ip, hits);
    return true;
  }
  hits.push(now);
  ipHits.set(ip, hits);
  return false;
}

function cacheGet<T>(key: string): T | undefined {
  const hit = cache.get(key);
  if (!hit) return undefined;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    cache.delete(key);
    return undefined;
  }
  return hit.value as T;
}

function cacheSet(key: string, value: unknown): void {
  cache.set(key, { at: Date.now(), value });
}

class ScanError extends Error {
  constructor(public code: ScanErrorCode, message: string) {
    super(message);
  }
}

// Resolve an address to coordinates via Places API (New) Text Search, so the whole
// tool stays under the Places-New quotas (SearchText + SearchNearby) and needs no
// separate Geocoding API setup. Same {formattedAddress, lat, lng} result.
async function geocode(address: string): Promise<{ formattedAddress: string; lat: number; lng: number }> {
  const key = `geo:${address.toLowerCase().trim()}`;
  const cached = cacheGet<{ formattedAddress: string; lat: number; lng: number }>(key);
  if (cached) return cached;

  if (!reserveCall()) throw new ScanError("daily_cap", "Daily scan limit reached.");
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY as string,
      "X-Goog-FieldMask": "places.formattedAddress,places.location",
    },
    body: JSON.stringify({ textQuery: address, maxResultCount: 1 }),
  });
  if (!res.ok) throw new ScanError("upstream_error", "Lookup service error.");
  const json = (await res.json()) as {
    places?: { formattedAddress?: string; location?: { latitude: number; longitude: number } }[];
  };
  const first = json.places?.[0];
  if (!first?.location) {
    throw new ScanError("geocode_failed", "Could not find that address.");
  }
  const out = {
    formattedAddress: first.formattedAddress ?? address,
    lat: first.location.latitude,
    lng: first.location.longitude,
  };
  cacheSet(key, out);
  return out;
}

type NearbyResult = { count: number; capped: boolean; examples: string[]; points: LatLng[] };

async function nearby(
  lat: number,
  lng: number,
  radius: number,
  types: readonly string[],
): Promise<NearbyResult> {
  // Round coords so nearby lookups for the same block share a cache entry.
  const ck = `nb:${lat.toFixed(3)},${lng.toFixed(3)}:${radius}:${[...types].sort().join(",")}`;
  const cached = cacheGet<NearbyResult>(ck);
  if (cached) return cached;

  if (!reserveCall()) throw new ScanError("daily_cap", "Daily scan limit reached.");
  const res = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY as string,
      // displayName + location stay in the same Nearby Search SKU; location feeds
      // the heatmap.
      "X-Goog-FieldMask": "places.displayName,places.location",
    },
    body: JSON.stringify({
      includedTypes: types,
      maxResultCount: MAX_RESULTS,
      locationRestriction: { circle: { center: { latitude: lat, longitude: lng }, radius } },
      rankPreference: "DISTANCE",
    }),
  });
  if (!res.ok) throw new ScanError("upstream_error", "Places service error.");
  const json = (await res.json()) as {
    places?: { displayName?: { text?: string }; location?: { latitude: number; longitude: number } }[];
  };
  const places = json.places ?? [];
  const out: NearbyResult = {
    count: places.length,
    capped: places.length >= MAX_RESULTS,
    examples: places
      .map((p) => p.displayName?.text)
      .filter((t): t is string => Boolean(t))
      .slice(0, 3),
    points: places
      .map((p) => p.location)
      .filter((l): l is { latitude: number; longitude: number } => Boolean(l))
      .map((l) => ({ lat: l.latitude, lng: l.longitude })),
  };
  cacheSet(ck, out);
  return out;
}

function saturationOf(count: number, capped: boolean): Saturation {
  if (capped || count >= 12) return "crowded";
  if (count >= 5) return "moderate";
  return "sparse";
}

/**
 * Run a full area scan. `ip` is used only for rate limiting. Returns a tagged
 * response (never throws for expected conditions) so the route can map codes to
 * HTTP status and the UI can show a friendly message.
 */
export async function runAreaScan(
  address: string,
  competitorType: string,
  radius: ScanRadius,
  ip: string,
): Promise<ScanResponse> {
  if (!API_KEY) return { ok: false, code: "not_configured", message: "Scanner is not configured yet." };
  if (!address.trim()) return { ok: false, code: "bad_request", message: "Enter an address." };
  const comp = COMPETITOR_TYPES.find((c) => c.value === competitorType);
  if (!comp) return { ok: false, code: "bad_request", message: "Pick a valid business type." };
  if (rateLimited(ip)) {
    return { ok: false, code: "rate_limited", message: "Too many scans. Wait a minute and try again." };
  }

  try {
    const location = await geocode(address);
    const categories: CategoryResult[] = [];
    for (const cat of SCAN_CATEGORIES) {
      const r = await nearby(location.lat, location.lng, radius, cat.types);
      categories.push({ key: cat.key, label: cat.label, ...r });
    }
    const compRaw = await nearby(location.lat, location.lng, radius, [comp.value]);
    return {
      ok: true,
      data: {
        location,
        radiusMeters: radius,
        categories,
        competitor: {
          key: comp.value,
          label: comp.label,
          ...compRaw,
          saturation: saturationOf(compRaw.count, compRaw.capped),
        },
      },
    };
  } catch (e) {
    if (e instanceof ScanError) return { ok: false, code: e.code, message: e.message };
    return { ok: false, code: "upstream_error", message: "Something went wrong. Try again." };
  }
}
