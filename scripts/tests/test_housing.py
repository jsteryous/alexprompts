"""
Tests for scripts/greenville/housing.py pure functions.

Run from the repo root:
    python -m unittest scripts.tests.test_housing -v

Covers the functions that silently break the committed residential-pulse dataset
when the Zillow parse/normalize logic is tweaked:
  - housing.month_columns
  - housing.find_row
  - housing.row_series (blank cells dropped, oldest first)
  - housing.pct_change (MoM / YoY, not-enough-history -> None)
  - housing.summarize
  - housing.build_metric / build_dataset (shape + graceful empties)
"""

from __future__ import annotations

import sys
import unittest
from pathlib import Path

_SCRIPTS_DIR = Path(__file__).resolve().parent.parent
if str(_SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPTS_DIR))

from greenville import housing  # noqa: E402


# A tiny two-row Zillow file in the real schema: a header with metadata columns
# then five month columns, a Greenville MSA row, the US row, and an unrelated row.
_HEADER = ["RegionID", "SizeRank", "RegionName", "RegionType", "StateName",
           "2025-02-28", "2025-03-31", "2025-04-30", "2026-05-31", "2026-06-30"]
_CSV = "\n".join([
    ",".join(_HEADER),
    '395055,61,"Greenville, SC",msa,SC,300000,,305000,315000,317097',
    '102001,0,"United States",country,,360000,362000,364000,371000,372995',
    '394913,1,"New York, NY",msa,NY,600000,601000,602000,610000,611000',
])


class TestColumns(unittest.TestCase):
    def test_month_columns_are_the_date_headers(self):
        self.assertEqual(housing.month_columns(_HEADER), [5, 6, 7, 8, 9])

    def test_non_date_headers_ignored(self):
        self.assertEqual(housing.month_columns(["RegionName", "note-2025"]), [])


class TestFindRow(unittest.TestCase):
    def setUp(self):
        import csv, io
        self.rows = list(csv.reader(io.StringIO(_CSV)))[1:]  # data rows only

    def test_finds_exact_region(self):
        row = housing.find_row(self.rows, "Greenville, SC")
        self.assertIsNotNone(row)
        self.assertEqual(row[3], "msa")

    def test_missing_region_is_none(self):
        self.assertIsNone(housing.find_row(self.rows, "Nowhere, ZZ"))


class TestRowSeries(unittest.TestCase):
    def test_drops_blanks_and_sorts_oldest_first(self):
        row = ["1", "61", "Greenville, SC", "msa", "SC",
               "300000", "", "305000", "315000", "317097"]
        series = housing.row_series(_HEADER, row)
        # the blank 2025-03-31 cell is dropped -> 4 points, oldest first
        self.assertEqual([p["month"] for p in series],
                         ["2025-02-28", "2025-04-30", "2026-05-31", "2026-06-30"])
        self.assertEqual(series[0]["value"], 300000.0)
        self.assertEqual(series[-1]["value"], 317097.0)


class TestPctChange(unittest.TestCase):
    def _series(self, *vals):
        return [{"month": f"m{i}", "value": v} for i, v in enumerate(vals)]

    def test_mom_and_yoy(self):
        s = self._series(*[100 + i for i in range(13)])  # 100..112, latest 112
        self.assertEqual(housing.pct_change(s, 1), round((112 - 111) / 111 * 100, 1))
        self.assertEqual(housing.pct_change(s, 12), 12.0)  # 112 vs 100

    def test_not_enough_history_is_none(self):
        self.assertIsNone(housing.pct_change(self._series(100), 12))

    def test_zero_base_is_none(self):
        self.assertIsNone(housing.pct_change(self._series(0, 100), 1))


class TestSummarize(unittest.TestCase):
    def test_none_on_empty(self):
        self.assertIsNone(housing.summarize([]))

    def test_rounds_latest_and_reports_changes(self):
        s = [{"month": "a", "value": 300000.0}, {"month": "b", "value": 315000.4}]
        out = housing.summarize(s)
        self.assertEqual(out["latest"], 315000)
        self.assertEqual(out["mom_pct"], round((315000.4 - 300000) / 300000 * 100, 1))
        self.assertIsNone(out["yoy_pct"])  # only two points


class TestBuildMetricAndDataset(unittest.TestCase):
    def test_build_metric_shape(self):
        block = housing.build_metric(_CSV, "ZHVI test", "Greenville, SC")
        self.assertEqual(block["latest_month"], "2026-06-30")
        self.assertEqual(block["greenville"]["latest"], 317097)
        self.assertEqual(block["national"]["latest"], 372995)
        self.assertTrue(len(block["series"]) >= 1)
        # Greenville MoM from 315000 -> 317097
        self.assertEqual(block["greenville"]["mom_pct"],
                         round((317097 - 315000) / 315000 * 100, 1))

    def test_build_metric_degrades_on_empty_text(self):
        block = housing.build_metric("", "ZHVI test", "Greenville, SC")
        self.assertIsNone(block["greenville"])
        self.assertEqual(block["series"], [])

    def test_build_dataset_shape(self):
        ds = housing.build_dataset(_CSV, _CSV, "Greenville, SC")
        self.assertEqual(ds["metro"], "Greenville, SC")
        self.assertIn("home_value", ds)
        self.assertIn("rent", ds)
        self.assertIn("Zillow", ds["source"])
        self.assertEqual(ds["home_value"]["greenville"]["latest"], 317097)

    def test_build_dataset_survives_missing_feed(self):
        ds = housing.build_dataset(None, None, "Greenville, SC")
        self.assertIsNone(ds["home_value"]["greenville"])
        self.assertIsNone(ds["rent"]["greenville"])


# A 14-month vitals file (enough history for a year-over-year point at index -13)
# in the same schema. Greenville values are a linear 0.20 -> 0.33 ramp so the
# scaled percents and the YoY math are easy to reason about by hand.
_V_MONTHS = [f"2025-{m:02d}-28" for m in range(1, 13)] + ["2026-01-31", "2026-02-28"]
_V_HEADER = ["RegionID", "SizeRank", "RegionName", "RegionType", "StateName"] + _V_MONTHS
_V_GVL = [round(0.20 + 0.01 * i, 2) for i in range(14)]   # 0.20 .. 0.33
_V_USA = [round(0.18 + 0.01 * i, 2) for i in range(14)]   # 0.18 .. 0.31
_V_CSV = "\n".join([
    ",".join(_V_HEADER),
    ",".join(["1", "61", '"Greenville, SC"', "msa", "SC"] + [str(v) for v in _V_GVL]),
    ",".join(["2", "0", '"United States"', "country", ""] + [str(v) for v in _V_USA]),
])


class TestVitals(unittest.TestCase):
    def test_scale_series_multiplies_values(self):
        s = [{"month": "a", "value": 0.30}, {"month": "b", "value": 0.33}]
        scaled = housing.scale_series(s, 100)
        self.assertEqual(scaled[-1]["value"], 33.0)
        # identity when scale is 1 (returns the same list, untouched)
        self.assertIs(housing.scale_series(s, 1), s)

    def test_vitals_summary_carries_prior_year_absolute(self):
        # 14 points 0.20..0.33; summary reads absolutes, not just percent moves
        series = [{"month": m, "value": v} for m, v in zip(_V_MONTHS, _V_GVL)]
        out = housing.vitals_summary(series, decimals=2)
        self.assertEqual(out["latest"], 0.33)
        self.assertEqual(out["prior_month"], 0.32)
        self.assertEqual(out["prior_year"], 0.21)   # index -13

    def test_build_vitals_metric_scales_fraction_to_percent(self):
        block = housing.build_vitals_metric(
            _V_CSV, "Price cut share", "percent", "Greenville, SC",
            decimals=1, scale=100)
        self.assertEqual(block["unit"], "percent")
        self.assertEqual(block["latest_month"], "2026-02-28")
        self.assertEqual(block["greenville"]["latest"], 33.0)      # 0.33 * 100
        self.assertEqual(block["greenville"]["prior_year"], 21.0)  # 0.21 * 100
        self.assertEqual(block["national"]["latest"], 31.0)        # 0.31 * 100
        # YoY is scale-invariant: (0.33 - 0.21) / 0.21 * 100
        self.assertEqual(block["greenville"]["yoy_pct"],
                         round((0.33 - 0.21) / 0.21 * 100, 1))

    def test_build_vitals_metric_counts_are_integers(self):
        block = housing.build_vitals_metric(
            _V_CSV, "Inventory", "homes", "Greenville, SC", decimals=0, scale=1)
        # decimals=0 keeps whole numbers; the 0.33 ramp rounds to 0 here, which is
        # fine for the shape assertion (real count feeds are whole numbers already)
        self.assertIsInstance(block["greenville"]["latest"], int)

    def test_build_vitals_metric_degrades_on_empty(self):
        block = housing.build_vitals_metric("", "x", "days", "Greenville, SC", 0, 1)
        self.assertIsNone(block["greenville"])
        self.assertEqual(block["series"], [])

    def test_build_dataset_includes_market_vitals(self):
        vitals_texts = {key: _V_CSV for key, *_rest in housing.VITALS}
        ds = housing.build_dataset(_CSV, _CSV, "Greenville, SC", vitals_texts)
        self.assertIn("market_vitals", ds)
        self.assertEqual(set(ds["market_vitals"].keys()),
                         {key for key, *_rest in housing.VITALS})
        self.assertEqual(ds["market_vitals"]["sale_to_list"]["unit"], "percent")


# A ZIP-level file in the real Zip schema: four extra metadata columns (State,
# City, Metro, CountyName) before the months. Two Greenville County ZIPs, one
# out-of-county ZIP that must be filtered out, and one out-of-state row that
# shares the county NAME (a real collision: Greenville County exists in several
# states), which is why the filter checks state as well.
_Z_HEADER = ["RegionID", "SizeRank", "RegionName", "RegionType", "StateName",
             "State", "City", "Metro", "CountyName",
             "2025-06-30", "2026-05-31", "2026-06-30"]
_Z_CSV = "\n".join([
    ",".join(_Z_HEADER),
    '1,100,29681,zip,SC,SC,Simpsonville,"Greenville, SC",Greenville County,263,330,339',
    '2,300,29690,zip,SC,SC,Travelers Rest,"Greenville, SC",Greenville County,94,125,131',
    '3,400,29302,zip,SC,SC,Spartanburg,"Spartanburg, SC",Spartanburg County,80,90,95',
    '4,500,29681,zip,TX,TX,Elsewhere,"Dallas, TX",Greenville County,10,11,12',
])


class TestSubmarkets(unittest.TestCase):
    def setUp(self):
        import csv, io
        self.rows = list(csv.reader(io.StringIO(_Z_CSV)))

    def test_column_index_by_name(self):
        self.assertEqual(housing.column_index(_Z_HEADER, "CountyName"), 8)
        self.assertEqual(housing.column_index(_Z_HEADER, "City"), 6)
        self.assertIsNone(housing.column_index(_Z_HEADER, "NotAColumn"))

    def test_county_rows_filters_county_and_state(self):
        rows = housing.county_rows(self.rows[1:], _Z_HEADER, "Greenville County", "SC")
        self.assertEqual([r[2] for r in rows], ["29681", "29690"])

    def test_county_rows_empty_when_columns_absent(self):
        # A Metro-schema header has no CountyName, so the submarket parse must
        # degrade to nothing rather than mis-index into month data.
        self.assertEqual(housing.county_rows(self.rows[1:], _HEADER, "Greenville County", "SC"), [])

    def test_build_submarket_metric_keys_by_zip_and_carries_city(self):
        table = housing.build_submarket_metric(_Z_CSV, "Greenville County", "SC", 0, 1)
        self.assertEqual(set(table), {"29681", "29690"})
        self.assertEqual(table["29681"]["city"], "Simpsonville")
        self.assertEqual(table["29681"]["latest"], 339)
        self.assertEqual(table["29681"]["latest_month"], "2026-06-30")

    def test_build_submarket_metric_scales_percent_metrics(self):
        table = housing.build_submarket_metric(_Z_CSV, "Greenville County", "SC", 1, 100)
        self.assertEqual(table["29690"]["latest"], 13100.0)  # 131 * 100

    def test_build_submarket_metric_degrades_on_empty(self):
        self.assertEqual(housing.build_submarket_metric("", "Greenville County", "SC", 0, 1), {})

    def test_build_submarkets_ranks_by_inventory(self):
        texts = {key: _Z_CSV for key, *_rest in housing.SUBMARKET_METRICS}
        block = housing.build_submarkets(texts, "Greenville County", "SC")
        self.assertEqual([z["zip"] for z in block["zips"]], ["29681", "29690"])
        self.assertEqual(block["zips"][0]["city"], "Simpsonville")
        self.assertEqual(block["county"], "Greenville County")
        self.assertEqual(block["latest_month"], "2026-06-30")

    def test_build_submarkets_flags_thin_zips(self):
        thin_csv = _Z_CSV.replace(
            '2,300,29690,zip,SC,SC,Travelers Rest,"Greenville, SC",Greenville County,94,125,131',
            '2,300,29690,zip,SC,SC,Travelers Rest,"Greenville, SC",Greenville County,9,10,11')
        texts = {key: thin_csv for key, *_rest in housing.SUBMARKET_METRICS}
        block = housing.build_submarkets(texts, "Greenville County", "SC")
        by_zip = {z["zip"]: z for z in block["zips"]}
        self.assertTrue(by_zip["29690"]["thin"])   # 11 listings, under the floor
        self.assertFalse(by_zip["29681"]["thin"])  # 339 listings

    def test_build_submarkets_keeps_zip_missing_one_metric(self):
        # Only inventory reports for this county; the other three metrics are blank
        # feeds. The ZIP must survive with None for what is missing.
        texts = {key: ("" if key != "inventory" else _Z_CSV)
                 for key, *_rest in housing.SUBMARKET_METRICS}
        block = housing.build_submarkets(texts, "Greenville County", "SC")
        top = block["zips"][0]
        self.assertIsNotNone(top["inventory"])
        self.assertIsNone(top["days_to_pending"])
        self.assertIsNone(top["price_cut_share"])

    def test_build_submarkets_empty_without_texts(self):
        block = housing.build_submarkets({}, "Greenville County", "SC")
        self.assertEqual(block["zips"], [])
        self.assertIsNone(block["latest_month"])

    def test_build_dataset_includes_submarkets(self):
        texts = {key: _Z_CSV for key, *_rest in housing.SUBMARKET_METRICS}
        ds = housing.build_dataset(_CSV, _CSV, "Greenville, SC", None, texts)
        self.assertEqual(ds["submarkets"]["county"], "Greenville County")
        self.assertEqual(len(ds["submarkets"]["zips"]), 2)

    def test_build_dataset_without_submarket_texts(self):
        ds = housing.build_dataset(_CSV, _CSV, "Greenville, SC")
        self.assertEqual(ds["submarkets"]["zips"], [])


if __name__ == "__main__":
    unittest.main()
