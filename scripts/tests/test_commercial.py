"""
Tests for scripts/greenville/commercial.py pure functions.

Run from the repo root:
    python -m unittest scripts.tests.test_commercial -v

Covers the functions that silently break the committed buyer's-list dataset when
the query/parse/normalize logic is tweaked:
  - commercial.cutoff_date / build_where / build_url
  - commercial.epoch_ms_to_iso
  - commercial.street_label
  - commercial.parse_feature / parse_features (dedup)
  - commercial.sort_sales
  - commercial.build_dataset
"""

from __future__ import annotations

import sys
import unittest
from datetime import datetime, timezone
from pathlib import Path

_SCRIPTS_DIR = Path(__file__).resolve().parent.parent
if str(_SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPTS_DIR))

from greenville import commercial  # noqa: E402


# ── query building ────────────────────────────────────────────────────────────

class TestQueryBuilding(unittest.TestCase):
    def test_cutoff_date_is_months_back(self):
        today = datetime(2026, 6, 28, tzinfo=timezone.utc)
        # 24 months back lands in mid-2024.
        self.assertTrue(commercial.cutoff_date(24, today).startswith("2024-"))

    def test_build_where_has_price_and_date(self):
        where = commercial.build_where(1000000, "2024-06-01")
        self.assertEqual(where, "SALEPRICE >= 1000000 AND SALEDATE >= DATE '2024-06-01'")

    def test_build_url_targets_commercial_layer_with_latlng(self):
        url = commercial.build_url("SALEPRICE >= 1 AND SALEDATE >= DATE '2024-01-01'", offset=1000)
        self.assertIn("Map_Layers_JS/MapServer/2/query", url)
        self.assertIn("outSR=4326", url)        # geometry comes back as lon/lat
        self.assertIn("resultOffset=1000", url)
        self.assertIn("f=json", url)
        self.assertIn("PURNAME", url)           # the buyer field is requested


# ── date conversion ───────────────────────────────────────────────────────────

class TestEpoch(unittest.TestCase):
    def test_known_epoch_ms(self):
        # 1774224000000 ms is the real SALEDATE that rendered as 2026-03-23.
        self.assertEqual(commercial.epoch_ms_to_iso(1774224000000), "2026-03-23")

    def test_blank_and_junk_are_none(self):
        self.assertIsNone(commercial.epoch_ms_to_iso(None))
        self.assertIsNone(commercial.epoch_ms_to_iso(""))
        self.assertIsNone(commercial.epoch_ms_to_iso("not-a-number"))


# ── street assembly ───────────────────────────────────────────────────────────

class TestStreetLabel(unittest.TestCase):
    def test_assembles_and_title_cases(self):
        attrs = {"STRPRE": "N", "STREET": "HWY 101", "STRTYP": "", "STRSUF": ""}
        self.assertEqual(commercial.street_label(attrs), "N Hwy 101")

    def test_skips_blank_space_parts(self):
        # The source uses a single space to mean "empty".
        attrs = {"STRPRE": " ", "STREET": "PELHAM", "STRTYP": "RD", "STRSUF": " "}
        self.assertEqual(commercial.street_label(attrs), "Pelham Rd")

    def test_empty_when_no_street(self):
        self.assertEqual(commercial.street_label({}), "")


# ── feature parsing ───────────────────────────────────────────────────────────

def _feature(**attrs):
    geom = {"x": attrs.pop("x", -82.34), "y": attrs.pop("y", 34.86)}
    base = {
        "PIN": "0279000201000", "PURNAME": "HOLDINGS V LLC", "SELLNAME": "OLD OWNER",
        "SALEPRICE": 9000000, "SALEDATE": 1774224000000, "STREET": "PELHAM",
        "STRTYP": "RD", "PROPTYPE": "COMMERCIAL", "LANDUSE": "0141",
    }
    base.update(attrs)
    return {"attributes": base, "geometry": geom}


class TestParseFeature(unittest.TestCase):
    def test_full_record(self):
        rec = commercial.parse_feature(_feature())
        self.assertEqual(rec["buyer"], "HOLDINGS V LLC")
        self.assertEqual(rec["price"], 9000000)
        self.assertEqual(rec["saleDate"], "2026-03-23")
        self.assertEqual(rec["street"], "Pelham Rd")
        self.assertEqual(rec["lat"], 34.86)
        self.assertEqual(rec["lng"], -82.34)

    def test_missing_buyer_or_price_dropped(self):
        self.assertIsNone(commercial.parse_feature(_feature(PURNAME="")))
        self.assertIsNone(commercial.parse_feature(_feature(SALEPRICE=0)))

    def test_dedup_on_pin_and_date(self):
        feats = [_feature(), _feature(), _feature(PIN="other")]
        recs = commercial.parse_features(feats)
        self.assertEqual(len(recs), 2)


# ── sorting + dataset ─────────────────────────────────────────────────────────

class TestSortAndDataset(unittest.TestCase):
    def test_sort_newest_first_nulls_last(self):
        sales = [
            {"saleDate": "2025-01-01"},
            {"saleDate": None},
            {"saleDate": "2026-03-01"},
        ]
        ordered = commercial.sort_sales(sales)
        self.assertEqual(ordered[0]["saleDate"], "2026-03-01")
        self.assertIsNone(ordered[-1]["saleDate"])

    def test_build_dataset_shape(self):
        sales = [{"saleDate": "2025-01-01", "price": 1}, {"saleDate": "2026-01-01", "price": 2}]
        ds = commercial.build_dataset(sales, min_price=250000, months=24)
        self.assertEqual(ds["count"], 2)
        self.assertEqual(ds["min_price"], 250000)
        self.assertEqual(ds["months"], 24)
        self.assertEqual(ds["sales"][0]["saleDate"], "2026-01-01")  # sorted
        self.assertIn("Greenville County GIS", ds["source"])


if __name__ == "__main__":
    unittest.main()
