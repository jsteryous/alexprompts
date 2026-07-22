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


if __name__ == "__main__":
    unittest.main()
