"""
Tests for scripts/greenville/ pure functions.

Run from the repo root:
    python -m unittest scripts.tests.test_greenville -v

Covers the functions that silently break when query/parse/cluster/score is
tweaked:
  - collect.google_news_url
  - collect.parse_news_rss
  - collect.is_listing_noise / normalize_title
  - collect.cluster_headlines / cluster_score / rank_clusters / pick_biggest
  - collect.to_json / from_json round-trip
"""

from __future__ import annotations

import sys
import unittest
from pathlib import Path

_SCRIPTS_DIR = Path(__file__).resolve().parent.parent
if str(_SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPTS_DIR))

from greenville import collect  # noqa: E402
from greenville.collect import Collection, Headline, StoryCluster  # noqa: E402


# ── query building ────────────────────────────────────────────────────────────

class TestQueryBuilding(unittest.TestCase):
    def test_google_news_url_encodes_and_bounds_window(self):
        url = collect.google_news_url('"Greenville SC" housing', when_days=14)
        self.assertTrue(url.startswith("https://news.google.com/rss/search?q="))
        self.assertIn("when%3A14d", url)   # 'when:14d' url-encoded
        self.assertIn("Greenville", url)
        self.assertIn("ceid=US:en", url)


# ── RSS parsing ───────────────────────────────────────────────────────────────

SAMPLE_RSS = """<?xml version="1.0"?>
<rss version="2.0"><channel>
  <item>
    <title>Greenville home prices climb again - The State</title>
    <link>https://news.google.com/rss/articles/aaa</link>
    <source url="https://thestate.com">The State</source>
    <pubDate>Tue, 16 Jun 2026 07:00:00 GMT</pubDate>
  </item>
  <item>
    <title>No link here</title>
    <link></link>
  </item>
</channel></rss>"""


class TestParseRss(unittest.TestCase):
    def test_parse_extracts_fields_and_skips_linkless(self):
        items = collect.parse_news_rss(SAMPLE_RSS)
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0]["title"], "Greenville home prices climb again - The State")
        self.assertEqual(items[0]["source"], "The State")
        self.assertEqual(items[0]["published"], "Tue, 16 Jun 2026 07:00:00 GMT")

    def test_parse_bad_xml_returns_empty(self):
        self.assertEqual(collect.parse_news_rss("<not xml"), [])

    def test_parse_respects_limit(self):
        many = "<rss><channel>" + "".join(
            f"<item><title>t{i}</title><link>l{i}</link></item>" for i in range(20)
        ) + "</channel></rss>"
        self.assertEqual(len(collect.parse_news_rss(many, limit=5)), 5)


# ── listing noise + normalization ─────────────────────────────────────────────

class TestNoiseAndNormalize(unittest.TestCase):
    def test_listing_addresses_are_noise(self):
        self.assertTrue(collect.is_listing_noise("6 Goodrich St, Greenville, SC 29611 - Realtor.com"))
        self.assertTrue(collect.is_listing_noise("206 Telford Dr, Greenville, SC 29617 - Realtor.com"))
        self.assertTrue(collect.is_listing_noise("12 Main St, Greer, South Carolina - Zillow"))

    def test_real_stories_are_not_noise(self):
        self.assertFalse(collect.is_listing_noise("Greenville County passes $475M budget - Post and Courier"))
        self.assertFalse(collect.is_listing_noise("This $5M historic home in SC just broke a sales record - The State"))

    def test_normalize_strips_publisher_and_punctuation(self):
        a = collect.normalize_title("Greenville home prices climb again - The State")
        b = collect.normalize_title("Greenville home prices climb again! - WYFF")
        self.assertEqual(a, b)
        self.assertEqual(a, "greenville home prices climb again")


# ── clustering + scoring ──────────────────────────────────────────────────────

def _h(title, beat, source, link="x"):
    return Headline(title=title, link=link, source=source, published=None, beat=beat)


class TestClustering(unittest.TestCase):
    def test_same_story_across_beats_and_outlets_merges(self):
        headlines = [
            _h("County passes new budget - The State", "Market", "The State"),
            _h("County passes new budget - WYFF", "Policy", "WYFF"),
            _h("County passes new budget - The State", "Upstate", "The State"),
        ]
        clusters = collect.cluster_headlines(headlines)
        self.assertEqual(len(clusters), 1)
        c = clusters[0]
        self.assertCountEqual(c.beats, ["Market", "Policy", "Upstate"])
        self.assertCountEqual(c.outlets, ["The State", "WYFF"])
        self.assertEqual(c.appearances, 3)

    def test_score_rewards_breadth(self):
        broad = StoryCluster(title="t", link="l", source="s",
                             published=None, beats=["A", "B", "C"],
                             outlets=["X", "Y"], appearances=4)
        narrow = StoryCluster(title="t2", link="l2", source="s",
                              published=None, beats=["A"], outlets=["X"],
                              appearances=1)
        self.assertGreater(collect.cluster_score(broad), collect.cluster_score(narrow))

    def test_pick_biggest_is_top_score(self):
        clusters = [
            StoryCluster(title="small", link="l1", source="s", published=None,
                         beats=["A"], outlets=["X"], appearances=1),
            StoryCluster(title="big", link="l2", source="s", published=None,
                         beats=["A", "B"], outlets=["X", "Y"], appearances=3),
        ]
        self.assertEqual(collect.pick_biggest(clusters).title, "big")

    def test_pick_biggest_none_when_empty(self):
        self.assertIsNone(collect.pick_biggest([]))


# ── serialization round-trip ──────────────────────────────────────────────────

class TestSerialization(unittest.TestCase):
    def test_json_round_trips(self):
        c = collect.Collection(
            clusters=[StoryCluster(title="t", link="l", source="The State",
                                   published="Tue, 16 Jun 2026 07:00:00 GMT",
                                   beats=["Market", "Policy"], outlets=["The State"],
                                   appearances=2)],
            biggest=StoryCluster(title="t", link="l", source="The State",
                                 published=None, beats=["Market"], outlets=["The State"],
                                 appearances=1),
            beat_counts={"Market": 9, "Policy": 10},
            generated_at="2026-06-25 19:15 UTC",
        )
        back = collect.from_json(collect.to_json(c))
        self.assertEqual(back.generated_at, c.generated_at)
        self.assertEqual(back.beat_counts, c.beat_counts)
        self.assertEqual(back.clusters[0].beats, ["Market", "Policy"])
        self.assertEqual(back.biggest.title, "t")
        # derived score survives because inputs do
        self.assertEqual(back.clusters[0].score, c.clusters[0].score)


if __name__ == "__main__":
    unittest.main()
