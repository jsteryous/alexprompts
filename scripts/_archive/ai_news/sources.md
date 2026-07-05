# Source registry — primary data for the Saturday research engine

Hand this whole file to the researcher pass every week. These are the go-to public sources
for real-estate, development, and investment questions. Prefer a PRIMARY source (the index,
the filing, the census table, the peer-reviewed study) over a blog summarizing it. Always
record the exact series/table id, the date pulled, and the source's own caveat.

**Reachability (checked 2026-06-28 from a sandbox like the routine's):** these are plain
APIs and CSV downloads, NOT the Google-News-style endpoints that 403 a datacenter IP. FHFA,
Zillow, and FRED's keyless CSV returned 200; Census and FRED's JSON API are key-gated, not
blocked. So the routine fetches these live. The one exception is the NREL developer API
(solar), which failed to connect from the sandbox; for solar, fall back to WebSearch +
cited reports, or a clean-IP fetch, and do not block the run on it.

## Housing prices and appreciation

- **FRED (St. Louis Fed) — keyless CSV, no key required.** The fastest path to a clean time
  series. `https://fred.stlouisfed.org/graph/fredgraph.csv?id=<SERIES_ID>`. Thousands of
  housing and economic series. Useful ids:
  - `ATNHPIUS24860Q` — FHFA All-Transactions House Price Index, Greenville-Anderson-Mauldin
    SC MSA (this is the local anchor series).
  - `USSTHPI` — FHFA HPI, United States. State series exist (e.g. `SCSTHPI` for SC).
  - `MSPUS` / `MEDLISPRI` families — median sale and list prices. `RRVRUSQ156N` — rental
    vacancy. `CSUSHPISA` — Case-Shiller national.
  Caveat: a repeat-sales index (FHFA, Case-Shiller) tracks the same homes over time, which
  is the honest way to measure appreciation; a median-price series moves with the mix of
  what sold, so do not read it as appreciation.
- **FHFA House Price Index — direct CSVs.** `https://www.fhfa.gov/hpi/download` (200). The
  metro, state, and ZIP datasets behind the FRED series, when you need the full panel.
- **Zillow Research — public CSVs, no key.** `https://files.zillowstatic.com/research/public_csvs/...`
  ZHVI (home values) and ZORI (rents) by metro and ZIP. Good for recent, granular moves.
  Caveat: Zillow's model, not a transaction index; method has changed over time.
- **Redfin Data Center — public TSV/CSV.** Sale prices, days-on-market, inventory by metro.

## People, place, and neighborhoods

- **Census / American Community Survey (ACS) — needs `CENSUS_API_KEY` (already in env for
  the area-scan tool; free, no billing).** `https://api.census.gov/data/<year>/acs/acs5?get=<vars>&for=<geo>&key=<KEY>`.
  Median home value `B25077_001E`, median rent `B25064_001E`, owner-occupancy `B25003`,
  income `B19013_001E`, commute, age of housing. South Carolina state FIPS = `45`;
  Greenville County = `045`. Pull tract-level for neighborhood comparisons.
  Caveat: ACS 5-year is a rolling estimate with margins of error; report the MOE on small
  geographies, do not treat a tract estimate as exact.
- **Greenville County ArcGIS — free public parcel/assessment service.** Already used by
  `scripts/greenville/commercial.py`; reuse that pattern. Parcel geometry, assessed value,
  sale history, land use. The backbone for any per-acre or local-comparison question.
- **BLS** (employment, wages — housing demand drivers) and **HUD** (Fair Market Rents,
  assisted housing) round out the local picture.

## Cities, land value, and what pays for itself

- **Lincoln Institute of Land Policy** — property-tax data ("Significant Features of the
  Property Tax"), land-value research, the case for taxing land. The serious source on how
  cities raise revenue from real estate.
- **Strong Towns / Urban3** — value-per-acre analyses and municipal fiscal-productivity
  case studies. Great for "what adds the most value and revenue to a city." Cite their
  method; these are analyses of specific cities, so check before generalizing to Greenville.

## Solar and energy

- **LBNL "Selling Into the Sun"** — the landmark study on what rooftop solar does to home
  resale value. Use its premium estimate AND its controls/limits.
- **EIA** — electricity rates by state (the denominator of any payback math).
- **DSIRE** (`https://www.dsireusa.org/`, 301 → reachable) — state and utility solar
  incentives, including South Carolina, the inputs to a real ROI.
- **NREL PVWatts** — modeled production for a roof. API is key-gated (free) and did NOT
  connect from the sandbox on 2026-06-28; if it stays unreachable, fall back to published
  PVWatts figures via WebSearch and say so. Do not block the run on it.

## Academic and contested questions

- **NBER, SSRN, Google Scholar, Real Estate Economics, J. of Urban Economics, J. of Housing
  Economics** — for questions where causation is contested (HOAs, gentrification, school
  effects). Read the abstract AND the identification strategy: a study that controls for
  neighborhood and uses a natural experiment beats a raw correlation. Report the effect size
  AND what the authors say they could not rule out.

## Rules for using any source

1. Record the exact id/table, the geography, the date range, and the date you pulled it.
2. Quote the figure as the source states it; do not round away the uncertainty.
3. Carry the source's own caveat into the brief (margin of error, vendor model, single-city
   study, correlation only). A number without its caveat is how the old news engine got
   burned.
4. Repeat-sales index for appreciation; median price only for "what is selling." Never swap
   them.
5. If two good sources disagree, report both and the likely reason, do not pick the tidier one.
