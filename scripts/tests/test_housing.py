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


if __name__ == "__main__":
    unittest.main()
