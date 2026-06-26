"""
Tests for scripts/ai_news/ pure functions (the beat+corroboration collector).

Run from the repo root:
    python -m unittest scripts.tests.test_ai_news -v

Covers the functions that silently break when query/parse/scoring is tweaked:
  - collect.google_news_url / parse_news_rss
  - collect.is_finance_noise / is_seo_farm / is_noise   (the two noise filters)
  - collect.normalize_title / cluster_headlines / cluster_score / rank_clusters
  - collect.pick_biggest
  - collect.to_json / from_json round-trip + render_payload
"""

from __future__ import annotations

import sys
import unittest
from pathlib import Path

_SCRIPTS_DIR = Path(__file__).resolve().parent.parent
if str(_SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPTS_DIR))

from ai_news import collect  # noqa: E402
from ai_news.collect import Collection, Headline, StoryCluster  # noqa: E402


# ── query building ────────────────────────────────────────────────────────────

class TestQueryBuilding(unittest.TestCase):
    def test_google_news_url_encodes_and_bounds_window(self):
        url = collect.google_news_url('(Zillow OR Redfin) (AI)', when_days=7)
        self.assertTrue(url.startswith("https://news.google.com/rss/search?q="))
        self.assertIn("when%3A7d", url)        # 'when:7d' url-encoded
        self.assertIn("Zillow", url)
        self.assertIn("ceid=US:en", url)


# ── RSS parsing ───────────────────────────────────────────────────────────────

_RSS = """<?xml version="1.0"?>
<rss version="2.0"><channel>
  <item>
    <title>Brokerage AI adoption rises, productivity gains remain uneven - HousingWire</title>
    <link>https://example.com/a</link>
    <pubDate>Mon, 09 Jun 2025 10:00:00 GMT</pubDate>
    <source url="https://housingwire.com">HousingWire</source>
  </item>
  <item>
    <title>Second story - The Real Deal</title>
    <link>https://example.com/b</link>
  </item>
</channel></rss>"""


class TestRssParsing(unittest.TestCase):
    def test_parses_items(self):
        items = collect.parse_news_rss(_RSS)
        self.assertEqual(len(items), 2)
        self.assertEqual(items[0]["source"], "HousingWire")
        self.assertEqual(items[1]["source"], "")        # no <source> element
        self.assertIsNone(items[1]["published"])

    def test_limit(self):
        self.assertEqual(len(collect.parse_news_rss(_RSS, limit=1)), 1)

    def test_skips_items_missing_title_or_link(self):
        bad = "<rss><channel><item><title>no link</title></item></channel></rss>"
        self.assertEqual(collect.parse_news_rss(bad), [])

    def test_malformed_xml_returns_empty(self):
        self.assertEqual(collect.parse_news_rss("<not xml"), [])


# ── noise filters ─────────────────────────────────────────────────────────────

class TestNoiseFilters(unittest.TestCase):
    def test_finance_noise_drops_ipo(self):
        self.assertTrue(collect.is_finance_noise(
            "San Francisco AI giant Anthropic files for IPO after $965 billion valuation"))

    def test_finance_noise_drops_stock_chatter(self):
        self.assertTrue(collect.is_finance_noise("Which Funds Are Best For AI Exposure?  shares jump"))

    def test_finance_noise_keeps_home_valuation_story(self):
        # "home value" must NOT trip the finance filter (no IPO/stock terms).
        self.assertFalse(collect.is_finance_noise(
            "New AI tool claims it can analyze any home value in 30 seconds"))

    def test_seo_farm_matches_known_domain(self):
        self.assertTrue(collect.is_seo_farm("appinventiv.com"))

    def test_seo_farm_rejects_real_outlet(self):
        self.assertFalse(collect.is_seo_farm("HousingWire"))

    def test_is_noise_combines_both(self):
        self.assertTrue(collect.is_noise("Anthropic files for IPO", "BBC"))
        self.assertTrue(collect.is_noise("16 Applications of AI in Real Estate", "appinventiv.com"))
        self.assertFalse(collect.is_noise("How AI may be messing with home prices", "CNBC"))


# ── normalization + clustering ────────────────────────────────────────────────

class TestNormalize(unittest.TestCase):
    def test_strips_publisher_suffix_and_punctuation(self):
        self.assertEqual(
            collect.normalize_title("AI Reshapes the Agent - Forbes"),
            "ai reshapes the agent",
        )

    def test_same_story_different_publisher_same_key(self):
        a = collect.normalize_title("How AI may be messing with home prices - CNBC")
        b = collect.normalize_title("How AI may be messing with home prices - Yahoo")
        self.assertEqual(a, b)


class TestClustering(unittest.TestCase):
    def _headlines(self) -> list[Headline]:
        # Same story surfaced by two beats and two outlets, plus a singleton.
        return [
            Headline("AI prices homes - CNBC", "u1", "CNBC", None, "Valuation"),
            Headline("AI prices homes - Yahoo", "u2", "Yahoo", None, "Agent tools"),
            Headline("Zillow ships AI search - HousingWire", "u3", "HousingWire", None, "Portals"),
        ]

    def test_clusters_merge_by_normalized_title(self):
        clusters = collect.cluster_headlines(self._headlines())
        self.assertEqual(len(clusters), 2)
        big = max(clusters, key=collect.cluster_score)
        self.assertEqual(sorted(big.beats), ["Agent tools", "Valuation"])
        self.assertEqual(sorted(big.outlets), ["CNBC", "Yahoo"])
        self.assertEqual(big.appearances, 2)

    def test_cluster_score_weights_beats_over_outlets(self):
        # 2 beats (3.0*2) + 2 outlets (2.0*2) + 2 appearances (1.0*2) = 12
        c = StoryCluster("t", "u", "CNBC", None,
                         beats=["Valuation", "Agent tools"], outlets=["CNBC", "Yahoo"], appearances=2)
        self.assertEqual(collect.cluster_score(c), 12.0)

    def test_rank_and_pick_biggest(self):
        clusters = collect.cluster_headlines(self._headlines())
        ranked = collect.rank_clusters(clusters)
        self.assertEqual(collect.normalize_title(ranked[0].title), "ai prices homes")
        self.assertEqual(collect.pick_biggest(clusters).title, "AI prices homes - CNBC")

    def test_pick_biggest_skips_empty(self):
        self.assertIsNone(collect.pick_biggest([StoryCluster("", "", "", None)]))

    def test_pick_biggest_empty(self):
        self.assertIsNone(collect.pick_biggest([]))


# ── JSON hand-off (CI collects -> cloud routine reads) ────────────────────────

class TestSerialization(unittest.TestCase):
    def _sample(self) -> Collection:
        big = StoryCluster("AI prices homes", "u1", "CNBC", "Mon",
                           beats=["Valuation", "Agent tools"], outlets=["CNBC", "Yahoo"], appearances=2)
        other = StoryCluster("Zillow ships AI search", "u3", "HousingWire", "Tue",
                             beats=["Portals"], outlets=["HousingWire"], appearances=1)
        return Collection(
            clusters=[big, other],
            biggest=big,
            beat_counts={"Valuation": 5, "Agent tools": 4, "Portals": 3},
            generated_at="2026-06-26 12:00 UTC",
        )

    def test_round_trips_losslessly(self):
        c = self._sample()
        back = collect.from_json(collect.to_json(c))
        self.assertEqual(back.generated_at, c.generated_at)
        self.assertEqual(back.beat_counts, c.beat_counts)
        self.assertEqual(back.biggest.title, "AI prices homes")
        self.assertEqual([s.title for s in back.clusters],
                         ["AI prices homes", "Zillow ships AI search"])
        # score is a derived property; it recomputes on the rebuilt object.
        self.assertEqual(back.biggest.score, c.biggest.score)

    def test_round_trips_none_biggest(self):
        c = Collection(clusters=[], biggest=None, beat_counts={}, generated_at="2026-06-26 12:00 UTC")
        back = collect.from_json(collect.to_json(c))
        self.assertIsNone(back.biggest)
        self.assertEqual(back.clusters, [])

    def test_payload_renders_from_rebuilt_collection(self):
        # The routine renders the rebuilt collection; it must not error.
        back = collect.from_json(collect.to_json(self._sample()))
        payload = collect.render_payload(back)
        self.assertIn("Collected 2026-06-26 12:00 UTC", payload)
        self.assertIn("BIGGEST STORY", payload)
        self.assertIn("AI prices homes", payload)


if __name__ == "__main__":
    unittest.main(verbosity=2)
