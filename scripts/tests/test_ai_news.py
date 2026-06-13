"""
Tests for scripts/ai_news/ pure functions.

Run from the repo root:
    python -m unittest scripts.tests.test_ai_news -v

Covers the functions that silently break when query/parse/scoring is tweaked:
  - collect.alias_query / google_news_url
  - collect.parse_news_rss / hn_hit_matches / parse_hn_hits / parse_reddit
  - collect.story_attention / entity_attention / pick_biggest
"""

from __future__ import annotations

import sys
import unittest
from pathlib import Path

_SCRIPTS_DIR = Path(__file__).resolve().parent.parent
if str(_SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPTS_DIR))

from ai_news import collect, digest, shorts  # noqa: E402
from ai_news.collect import Story  # noqa: E402


# ── query building ────────────────────────────────────────────────────────────

class TestQueryBuilding(unittest.TestCase):
    def test_alias_query_wraps_or_group(self):
        self.assertEqual(collect.alias_query(["Anthropic", "Claude"]),
                         '("Anthropic" OR "Claude")')

    def test_alias_query_single(self):
        self.assertEqual(collect.alias_query(["Neuralink"]), '("Neuralink")')

    def test_google_news_url_encodes_and_bounds_window(self):
        url = collect.google_news_url('("xAI" OR "Grok")', when_days=7)
        self.assertTrue(url.startswith("https://news.google.com/rss/search?q="))
        self.assertIn("when%3A7d", url)        # 'when:7d' url-encoded
        self.assertIn("xAI", url)
        self.assertIn("ceid=US:en", url)


# ── RSS parsing ───────────────────────────────────────────────────────────────

_RSS = """<?xml version="1.0"?>
<rss version="2.0"><channel>
  <item>
    <title>Anthropic ships Claude update - The Verge</title>
    <link>https://example.com/a</link>
    <pubDate>Mon, 09 Jun 2025 10:00:00 GMT</pubDate>
    <source url="https://theverge.com">The Verge</source>
  </item>
  <item>
    <title>Second story - TechCrunch</title>
    <link>https://example.com/b</link>
  </item>
</channel></rss>"""


class TestRssParsing(unittest.TestCase):
    def test_parses_items(self):
        items = collect.parse_news_rss(_RSS)
        self.assertEqual(len(items), 2)
        self.assertEqual(items[0]["title"], "Anthropic ships Claude update - The Verge")
        self.assertEqual(items[0]["link"], "https://example.com/a")
        self.assertEqual(items[0]["source"], "The Verge")
        self.assertEqual(items[1]["source"], "")        # no <source> element
        self.assertIsNone(items[1]["published"])

    def test_limit(self):
        self.assertEqual(len(collect.parse_news_rss(_RSS, limit=1)), 1)

    def test_skips_items_missing_title_or_link(self):
        bad = "<rss><channel><item><title>no link</title></item></channel></rss>"
        self.assertEqual(collect.parse_news_rss(bad), [])

    def test_malformed_xml_returns_empty(self):
        self.assertEqual(collect.parse_news_rss("<not xml"), [])


# ── HN / Reddit parsing ───────────────────────────────────────────────────────

class TestHackerNews(unittest.TestCase):
    def test_hn_hit_matches_domain(self):
        self.assertTrue(collect.hn_hit_matches({"url": "https://www.anthropic.com/news/x"},
                                               ["anthropic.com"]))

    def test_hn_hit_rejects_offtopic(self):
        self.assertFalse(collect.hn_hit_matches({"url": "https://reddit.com/r/x"},
                                                ["anthropic.com"]))

    def test_hn_hit_rejects_empty_url(self):
        self.assertFalse(collect.hn_hit_matches({"url": ""}, ["anthropic.com"]))

    def test_parse_hn_hits_filters_and_maps(self):
        payload = {"hits": [
            {"title": "On topic", "url": "https://anthropic.com/p", "points": 120, "num_comments": 45},
            {"title": "Off topic", "url": "https://other.com/p", "points": 999, "num_comments": 1},
        ]}
        stories = collect.parse_hn_hits(payload, "Anthropic", ["anthropic.com"])
        self.assertEqual(len(stories), 1)
        self.assertEqual(stories[0].hn_points, 120)
        self.assertEqual(stories[0].hn_comments, 45)
        self.assertEqual(stories[0].source, "hackernews")


class TestReddit(unittest.TestCase):
    def test_parse_reddit_applies_floor(self):
        payload = {"data": {"children": [
            {"data": {"title": "Big", "url": "https://x/1", "score": 500}},
            {"data": {"title": "Tiny", "url": "https://x/2", "score": 3}},
        ]}}
        stories = collect.parse_reddit(payload, "OpenAI", min_score=25)
        self.assertEqual(len(stories), 1)
        self.assertEqual(stories[0].reddit_score, 500)
        self.assertEqual(stories[0].source, "reddit")

    def test_parse_reddit_prefers_overridden_dest(self):
        payload = {"data": {"children": [
            {"data": {"title": "x", "url": "https://reddit.com/comments/1",
                      "url_overridden_by_dest": "https://openai.com/blog", "score": 99}},
        ]}}
        self.assertEqual(collect.parse_reddit(payload, "OpenAI")[0].url,
                         "https://openai.com/blog")


# ── scoring ───────────────────────────────────────────────────────────────────

class TestScoring(unittest.TestCase):
    def test_story_attention_weights(self):
        s = Story("OpenAI", "t", "u", "hackernews", hn_points=100, hn_comments=50)
        # 1.0*100 + 2.0*50 = 200
        self.assertEqual(collect.story_attention(s), 200.0)

    def test_comments_outweigh_points(self):
        a = Story("x", "t", "u", "hackernews", hn_points=0, hn_comments=100)
        b = Story("x", "t", "u", "hackernews", hn_points=100, hn_comments=0)
        self.assertGreater(collect.story_attention(a), collect.story_attention(b))

    def test_entity_attention_includes_news_volume(self):
        stories = [Story("x", "t", "u", "reddit", reddit_score=10)]
        # 8.0*3 news + 1.5*10 reddit = 39
        self.assertEqual(collect.entity_attention(3, stories), 39.0)

    def test_pick_biggest_returns_highest(self):
        stories = [
            Story("A", "low", "u1", "hackernews", hn_points=10),
            Story("B", "high", "u2", "hackernews", hn_points=10, hn_comments=200),
        ]
        self.assertEqual(collect.pick_biggest(stories).title, "high")

    def test_pick_biggest_skips_empty_titles(self):
        stories = [Story("A", "", "u1", "hackernews", hn_points=9999)]
        self.assertIsNone(collect.pick_biggest(stories))

    def test_pick_biggest_empty(self):
        self.assertIsNone(collect.pick_biggest([]))


# ── style guardrails ──────────────────────────────────────────────────────────

class TestStyleGuardrails(unittest.TestCase):
    def test_sentence_joining_dash_becomes_period(self):
        out = digest.strip_em_dashes("It shipped Friday — Anthropic complied within hours.")
        self.assertEqual(out, "It shipped Friday. Anthropic complied within hours.")

    def test_parenthetical_dash_becomes_comma(self):
        out = digest.strip_em_dashes("the model — its most capable yet — went dark")
        self.assertEqual(out, "the model, its most capable yet, went dark")

    def test_en_dash_also_stripped(self):
        self.assertNotIn("–", digest.strip_em_dashes("a 2020–2026 trend in models"))

    def test_no_dash_left_untouched(self):
        s = "A clean sentence with no dashes at all."
        self.assertEqual(digest.strip_em_dashes(s), s)

    def test_find_fluff_flags_banned(self):
        found = digest.find_fluff("In an unprecedented move that sent ripples through the AI landscape.")
        self.assertIn("in an unprecedented move", found)
        self.assertIn("the ai landscape", found)

    def test_find_fluff_clean_text(self):
        self.assertEqual(digest.find_fluff("Anthropic shut both models off worldwide."), [])

    def test_first_headline_extraction(self):
        md = "# Washington Switched It Off\n\nOn Friday evening..."
        self.assertEqual(digest._first_headline(md), "Washington Switched It Off")

    def test_first_headline_fallback(self):
        self.assertEqual(digest._first_headline("no h1 here"), "Alex Prompts — weekly draft")


# ── short-form ────────────────────────────────────────────────────────────────

class TestShorts(unittest.TestCase):
    def test_prompt_interpolates_count(self):
        self.assertIn("Produce 6 scripts", shorts.SHORTS_PROMPT.format(n=6))

    def test_prompt_bans_em_dashes_and_format(self):
        p = shorts.SHORTS_PROMPT.format(n=4)
        self.assertIn("NO em dashes", p)
        self.assertIn("[VISUAL:", p)
        self.assertIn("voiceover", p.lower())

    def test_build_shorts_is_callable(self):
        self.assertTrue(callable(shorts.build_shorts))


if __name__ == "__main__":
    unittest.main(verbosity=2)
