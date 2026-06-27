/**
 * Free US Census / ACS demographics for the area-scan tool. This is a government
 * API with NO billing account and no cost, ever, so it fits the zero-billing
 * mandate the way Google cannot. It maps a lat/lng to its Census tract, then
 * pulls ACS 5-year estimates: income, home value, rent, owner/renter mix, and
 * population with a rough ~5-year growth read.
 *
 * Everything is best-effort: any failure returns null or partial data so the
 * area scan never breaks. No key is required; set CENSUS_API_KEY to raise the
 * anonymous rate limit.
 */

const KEY = process.env.CENSUS_API_KEY;
const keyParam = KEY ? `&key=${KEY}` : "";

export type Demographics = {
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

/** ACS 5-year datasets to try, newest first. */
const ACS_YEARS = [2023, 2022];
const GROWTH_LOOKBACK = 5;
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 7000;

const cache = new Map<string, { at: number; value: Demographics | null }>();

type GeoResp = { result?: { geographies?: Record<string, Array<Record<string, string>>> } };
type AcsResp = string[][];
type Tract = { state: string; county: string; tract: string; name: string };

function num(v: string | undefined): number | undefined {
  if (v == null) return undefined;
  const n = Number(v);
  // ACS encodes "no data" as large negative sentinels (e.g. -666666666).
  if (!Number.isFinite(n) || n <= -1_000_000) return undefined;
  return n;
}

async function getJson(url: string): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function tractFor(lat: number, lng: number): Promise<Tract | null> {
  const url = `https://geocoding.geo.census.gov/geocoder/geographies/coordinates?x=${lng}&y=${lat}&benchmark=Public_AR_Current&vintage=Current_Current&format=json`;
  const json = (await getJson(url)) as GeoResp | null;
  const geos = json?.result?.geographies;
  const tract = geos?.["Census Tracts"]?.[0];
  if (!tract) return null;
  const countyName = geos?.["Counties"]?.[0]?.NAME ?? "";
  const stateAbbr = geos?.["States"]?.[0]?.STUSAB ?? "";
  return {
    state: tract.STATE,
    county: tract.COUNTY,
    tract: tract.TRACT,
    name: [countyName, stateAbbr].filter(Boolean).join(", "),
  };
}

async function acsPopulation(year: number, g: Tract): Promise<number | undefined> {
  const url = `https://api.census.gov/data/${year}/acs/acs5?get=B01003_001E&for=tract:${g.tract}&in=state:${g.state}%20county:${g.county}${keyParam}`;
  const json = (await getJson(url)) as AcsResp | null;
  if (!Array.isArray(json) || json.length < 2) return undefined;
  return num(json[1][0]);
}

export async function getDemographics(lat: number, lng: number): Promise<Demographics | null> {
  const ck = `dem:${lat.toFixed(3)},${lng.toFixed(3)}`;
  const hit = cache.get(ck);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.value;

  let result: Demographics | null = null;
  const g = await tractFor(lat, lng);
  if (g) {
    const vars = [
      "B19013_001E", // median household income
      "B01003_001E", // total population
      "B25077_001E", // median home value
      "B25064_001E", // median gross rent
      "B25003_001E", // occupied units
      "B25003_002E", // owner-occupied
      "B25003_003E", // renter-occupied
    ];
    for (const year of ACS_YEARS) {
      const url = `https://api.census.gov/data/${year}/acs/acs5?get=${vars.join(",")}&for=tract:${g.tract}&in=state:${g.state}%20county:${g.county}${keyParam}`;
      const json = (await getJson(url)) as AcsResp | null;
      if (!Array.isArray(json) || json.length < 2) continue;
      const header = json[0];
      const row = json[1];
      const at = (v: string) => num(row[header.indexOf(v)]);

      const totalOcc = at("B25003_001E");
      const owner = at("B25003_002E");
      const renter = at("B25003_003E");
      const ownerPct = totalOcc && owner != null ? Math.round((owner / totalOcc) * 100) : undefined;
      const renterPct = totalOcc && renter != null ? Math.round((renter / totalOcc) * 100) : undefined;

      const population = at("B01003_001E");
      let populationGrowthPct: number | undefined;
      const prevPop = await acsPopulation(year - GROWTH_LOOKBACK, g);
      if (prevPop && population) {
        populationGrowthPct = Math.round(((population - prevPop) / prevPop) * 1000) / 10;
      }

      result = {
        geography: g.name ? `Census tract in ${g.name}` : "Census tract",
        year,
        population,
        populationGrowthPct,
        medianHouseholdIncome: at("B19013_001E"),
        medianHomeValue: at("B25077_001E"),
        medianGrossRent: at("B25064_001E"),
        ownerPct,
        renterPct,
      };
      break;
    }
  }
  cache.set(ck, { at: Date.now(), value: result });
  return result;
}
