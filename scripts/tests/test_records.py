"""
Tests for scripts/greenville/records.py pure functions.

Run from the repo root:
    python -m unittest scripts.tests.test_records -v

The value of this engine is entirely in the analysis being defensible, so these
tests pin the guards that keep a wrong finding out of an article:
  - records.entity_key (conservative grouping; truncation must not over-merge)
  - records.find_assemblies (single-day closings and institutions are NOT assembly)
  - records.repeat_pairs (validated-only, construction pairs dropped, hold floor)
  - records.summarize_pairs / index_by_year (robust stats, thin years omitted)
"""

from __future__ import annotations

import sys
import unittest
from pathlib import Path

_SCRIPTS_DIR = Path(__file__).resolve().parent.parent
if str(_SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPTS_DIR))

from greenville import records  # noqa: E402


def _row(**kw):
    base = {
        "pin": "P1", "date": "2022-01-01", "buyer": "ACME LLC", "seller": "OLD",
        "price": 500_000, "saleType": "CASH (LAND)", "trueSale": "YES",
        "landUse": "6800", "street": "Main St", "mktArea": "A",
        "lotSize": 1.0, "lat": 34.85, "lng": -82.40,
    }
    base.update(kw)
    return base


# ── naming ────────────────────────────────────────────────────────────────────

class TestEntityKey(unittest.TestCase):
    def test_strips_legal_and_state_noise(self):
        for name in ["ENIGMA CORP", "ENIGMA CORPORATION", "ENIGMA CORPORATION LLC",
                     "ENIGMA CORP NEV CORP", "ENIGMA INC NEVADA CORP"]:
            self.assertEqual(records.entity_key(name), "ENIGMA", name)

    def test_does_not_merge_distinct_owners(self):
        self.assertNotEqual(records.entity_key("WHITE INVESTMENTS"),
                            records.entity_key("WHITMAN INVESTMENTS"))

    def test_punctuation_and_spacing_normalized(self):
        self.assertEqual(records.entity_key("C.Y.L.  Holdings, L.L.C."), "C Y L")


class TestGeoAndDates(unittest.TestCase):
    def test_haversine_known_short_distance(self):
        # ~0.1 degree of latitude is ~11km.
        d = records.haversine_km((34.80, -82.40), (34.90, -82.40))
        self.assertTrue(10.5 < d < 11.5, d)

    def test_months_between(self):
        self.assertEqual(records.months_between("2020-01-01", "2022-07-01"), 30)

    def test_centroid_point_and_polygon(self):
        self.assertEqual(records.centroid({"x": -82.4, "y": 34.8}), (34.8, -82.4))
        lat, lng = records.centroid({"rings": [[[-82.0, 34.0], [-82.0, 36.0],
                                                [-80.0, 36.0], [-80.0, 34.0]]]})
        self.assertAlmostEqual(lat, 35.0)
        self.assertAlmostEqual(lng, -81.0)

    def test_centroid_missing(self):
        self.assertEqual(records.centroid({}), (None, None))


# ── assembly ──────────────────────────────────────────────────────────────────

class TestFindAssemblies(unittest.TestCase):
    def _three_adjacent(self, buyer="ACME LLC"):
        return [
            _row(pin="P1", buyer=buyer, date="2021-03-01", lat=34.8500, lng=-82.4000),
            _row(pin="P2", buyer=buyer, date="2022-06-01", lat=34.8505, lng=-82.4005),
            _row(pin="P3", buyer=buyer, date="2023-09-01", lat=34.8510, lng=-82.4010),
        ]

    def test_finds_multi_year_adjacent_assembly(self):
        found = records.find_assemblies(self._three_adjacent())
        self.assertEqual(len(found), 1)
        self.assertEqual(found[0]["parcels"], 3)
        self.assertEqual(found[0]["entity"], "ACME")

    def test_single_day_closing_is_not_assembly(self):
        rows = self._three_adjacent()
        for r in rows:
            r["date"] = "2024-12-09"
        self.assertEqual(records.find_assemblies(rows), [])

    def test_span_shorter_than_six_months_rejected(self):
        rows = self._three_adjacent()
        rows[0]["date"], rows[1]["date"], rows[2]["date"] = \
            "2024-01-01", "2024-02-01", "2024-03-01"
        self.assertEqual(records.find_assemblies(rows), [])

    def test_dispersed_portfolio_is_not_assembly(self):
        rows = self._three_adjacent()
        rows[1]["lng"], rows[2]["lng"] = -82.20, -82.60   # miles apart
        self.assertEqual(records.find_assemblies(rows), [])

    def test_institutions_and_lenders_excluded(self):
        for buyer in ["CITY OF GREENVILLE", "BANK OF TRAVELERS REST"]:
            self.assertEqual(records.find_assemblies(self._three_adjacent(buyer)), [],
                             buyer)

    def test_stale_assembly_excluded(self):
        rows = self._three_adjacent()
        for r, d in zip(rows, ["2012-01-01", "2013-01-01", "2014-01-01"]):
            r["date"] = d
        self.assertEqual(records.find_assemblies(rows), [])

    def test_nominal_spend_flagged_as_control_transfer(self):
        rows = self._three_adjacent()
        for r in rows:
            r["price"], r["lotSize"] = 10, 50.0
        found = records.find_assemblies(rows)
        self.assertTrue(found[0]["controlTransferOnly"])

    def test_quitclaims_do_not_count_as_acquisition(self):
        rows = self._three_adjacent()
        rows[2]["saleType"] = "QUITCLAIM"
        self.assertEqual(records.find_assemblies(rows), [])

    def test_names_recorded_for_audit(self):
        rows = self._three_adjacent()
        rows[1]["buyer"] = "ACME LLC"
        rows[2]["buyer"] = "ACME PROPERTIES INC"
        found = records.find_assemblies(rows)
        self.assertEqual(found[0]["names"], ["ACME LLC", "ACME PROPERTIES INC"])

    def test_display_name_is_the_fullest_county_string(self):
        # entity_key strips "PROPERTIES", which would label this cluster "OUTDOOR".
        self.assertEqual(records.display_name({"OUTDOOR PROPERTIES LLC", "OUTDOOR"}),
                         "OUTDOOR PROPERTIES LLC")
        self.assertEqual(records.display_name(set()), "")


class TestFindPortfolios(unittest.TestCase):
    def _scattered(self, n, buyer="ENIGMA CORP", start_year=2015):
        return [_row(pin=f"P{i}", buyer=buyer, date=f"{start_year + i % 8}-06-01",
                     lat=34.7 + i * 0.03, lng=-82.5 + i * 0.02) for i in range(n)]

    def test_finds_dispersed_holder_that_assembly_misses(self):
        rows = self._scattered(10)
        self.assertEqual(records.find_assemblies(rows), [])   # not adjacent
        pf = records.find_portfolios(rows)
        self.assertEqual(len(pf), 1)
        self.assertEqual(pf[0]["parcels"], 10)
        self.assertGreater(pf[0]["spreadKm"], 5)

    def test_below_threshold_ignored(self):
        self.assertEqual(records.find_portfolios(self._scattered(4)), [])

    def test_merges_name_variants_into_one_holder(self):
        rows = self._scattered(5, "ENIGMA CORP") + \
            self._scattered(5, "ENIGMA CORPORATION LLC", start_year=2018)
        for i, r in enumerate(rows):
            r["pin"] = f"Q{i}"
        pf = records.find_portfolios(rows)
        self.assertEqual(len(pf), 1)
        self.assertEqual(pf[0]["parcels"], 10)
        self.assertEqual(pf[0]["names"], ["ENIGMA CORP", "ENIGMA CORPORATION LLC"])

    def test_stale_holder_excluded(self):
        rows = self._scattered(10, start_year=2005)
        self.assertEqual(records.find_portfolios(rows), [])

    def test_institutions_excluded(self):
        self.assertEqual(records.find_portfolios(self._scattered(10, "CITY OF GREER")), [])


# ── repeat-sale index ─────────────────────────────────────────────────────────

class TestRepeatPairs(unittest.TestCase):
    def test_basic_pair_math(self):
        rows = [
            _row(pin="P1", date="2018-01-01", price=1_000_000),
            _row(pin="P1", date="2023-01-01", price=2_000_000),
        ]
        pairs, built = records.repeat_pairs(rows)
        self.assertEqual(len(pairs), 1)
        self.assertEqual(pairs[0]["totalPct"], 100.0)
        self.assertEqual(pairs[0]["heldYears"], 5.0)
        self.assertAlmostEqual(pairs[0]["annualPct"], 14.9, places=1)
        self.assertEqual(built, 0)

    def test_unvalidated_sales_excluded_by_default(self):
        rows = [
            _row(pin="P1", date="2018-01-01", price=1_000_000),
            _row(pin="P1", date="2025-01-01", price=50_000, trueSale=""),
        ]
        self.assertEqual(records.repeat_pairs(rows)[0], [])
        # ...but reachable when explicitly asked for.
        loose, _ = records.repeat_pairs(rows, validated_only=False)
        self.assertEqual(len(loose), 1)

    def test_county_flagged_non_market_always_excluded(self):
        rows = [
            _row(pin="P1", date="2018-01-01", price=1_000_000),
            _row(pin="P1", date="2023-01-01", price=5_000_000, trueSale="NO"),
        ]
        self.assertEqual(records.repeat_pairs(rows, validated_only=False)[0], [])

    def test_construction_pair_dropped(self):
        rows = [
            _row(pin="P1", date="2018-01-01", price=200_000, saleType="CASH (LAND)"),
            _row(pin="P1", date="2023-01-01", price=3_000_000,
                 saleType="CASH (LAND AND BUILDING)"),
        ]
        pairs, built = records.repeat_pairs(rows)
        self.assertEqual(pairs, [])
        self.assertEqual(built, 1)

    def test_short_hold_dropped(self):
        rows = [
            _row(pin="P1", date="2023-01-01", price=1_000_000),
            _row(pin="P1", date="2023-08-01", price=1_400_000),
        ]
        self.assertEqual(records.repeat_pairs(rows)[0], [])

    def test_nominal_prices_never_enter_the_index(self):
        rows = [
            _row(pin="P1", date="2018-01-01", price=1_000_000),
            _row(pin="P1", date="2023-01-01", price=5, saleType="UNKNOWN"),
        ]
        self.assertEqual(records.repeat_pairs(rows, validated_only=False)[0], [])


class TestSummaries(unittest.TestCase):
    def _pairs(self):
        return [
            {"annualPct": 5.0, "totalPct": 20.0, "heldYears": 4.0, "soldOn": "2023-01-01"},
            {"annualPct": 10.0, "totalPct": 50.0, "heldYears": 4.0, "soldOn": "2023-05-01"},
            {"annualPct": -3.0, "totalPct": -10.0, "heldYears": 4.0, "soldOn": "2023-09-01"},
        ]

    def test_summarize_uses_median_and_loss_share(self):
        s = records.summarize_pairs(self._pairs())
        self.assertEqual(s["pairs"], 3)
        self.assertEqual(s["medianAnnualPct"], 5.0)
        self.assertEqual(s["lossCount"], 1)
        self.assertEqual(s["lossSharePct"], 33)

    def test_summarize_empty(self):
        self.assertEqual(records.summarize_pairs([]), {"pairs": 0})

    def test_thin_years_omitted(self):
        self.assertEqual(records.index_by_year(self._pairs()), [])
        self.assertEqual(len(records.index_by_year(self._pairs(), min_n=3)), 1)


# ── parsing ───────────────────────────────────────────────────────────────────

class TestParseRows(unittest.TestCase):
    def _feature(self, **attrs):
        base = {"PIN": "P1", "SALEDATE": 1774224000000, "SALEPRICE": 500000,
                "PURNAME": "ACME LLC", "STREET": "PELHAM", "STRTYP": "RD",
                "TRUESALE": "YES", "SALETYPE": "CASH (LAND)", "LOTSIZE": 2.5}
        base.update(attrs)
        return {"attributes": base, "geometry": {"x": -82.34, "y": 34.86}}

    def test_parses_and_keeps_zero_price(self):
        rec = records.parse_row(self._feature(SALEPRICE=0))
        self.assertEqual(rec["price"], 0)          # control transfers are kept
        self.assertEqual(rec["date"], "2026-03-23")
        self.assertEqual(rec["street"], "Pelham Rd")

    def test_rows_without_pin_or_date_dropped(self):
        self.assertIsNone(records.parse_row(self._feature(PIN="")))
        self.assertIsNone(records.parse_row(self._feature(SALEDATE=None)))

    def test_dedup_on_pin_date_price(self):
        feats = [self._feature(), self._feature(), self._feature(SALEPRICE=999999)]
        self.assertEqual(len(records.parse_rows(feats)), 2)


if __name__ == "__main__":
    unittest.main()
