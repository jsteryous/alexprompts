"""
Tests for scripts/prospects/ pure functions.

Run from the repo root:
    python -m unittest scripts.tests.test_prospects -v

Or from inside scripts/:
    python -m unittest tests.test_prospects -v

Covers the functions most likely to silently break when regex/scoring is tweaked:
  - discover.is_practitioner_name
  - detectors.detect_viewport_missing / no_https / mixed_content / stale_copyright
      / jquery_version / forms / score_severity
  - contact_extract.extract_emails / rank_emails / extract_decision_maker
      / find_candidate_page_urls / fallback_probe_urls
"""

from __future__ import annotations

import os
import sys
import unittest
from datetime import datetime
from pathlib import Path
from unittest.mock import MagicMock, patch

# Make the `prospects` package importable regardless of CWD.
_SCRIPTS_DIR = Path(__file__).resolve().parent.parent
if str(_SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPTS_DIR))

# Supabase client construction runs at import time for some modules via
# `load_dotenv` → OK, but audit.py would try to init a client. We only import
# the pure modules here.
from prospects import contact_extract, detectors, discover  # noqa: E402


# ── discover.is_practitioner_name ────────────────────────────────────────────


class TestIsPractitionerName(unittest.TestCase):
    """The filter that keeps individual dentist/attorney GBPs out of the pipeline."""

    def test_bare_person_name_is_practitioner(self):
        # "Doty Karen" — Google Places often returns Last-First with no suffix.
        self.assertTrue(discover.is_practitioner_name("Doty Karen"))
        self.assertTrue(discover.is_practitioner_name("Karen Doty"))
        self.assertTrue(discover.is_practitioner_name("Jane Smith"))

    def test_credential_suffix_is_practitioner(self):
        self.assertTrue(discover.is_practitioner_name("Hammes Emily DDS"))
        self.assertTrue(discover.is_practitioner_name("Karen Doty, DDS"))
        self.assertTrue(discover.is_practitioner_name("John O'Brien, Esq."))
        self.assertTrue(discover.is_practitioner_name("Jane Smith MD"))

    def test_practice_keywords_beats_credential(self):
        # Practice/firm keywords always win — these are the outreach target.
        self.assertFalse(discover.is_practitioner_name("Smith Family Dentistry"))
        self.assertFalse(discover.is_practitioner_name("Pickens Dental Associates"))
        self.assertFalse(discover.is_practitioner_name("Jones & Associates Law Firm"))
        self.assertFalse(discover.is_practitioner_name("Greenville Oral Surgery"))
        self.assertFalse(discover.is_practitioner_name("Smith Orthodontics PLLC"))

    def test_empty_is_not_practitioner(self):
        self.assertFalse(discover.is_practitioner_name(""))
        self.assertFalse(discover.is_practitioner_name("   "))

    def test_long_name_with_credential_still_practitioner(self):
        self.assertTrue(discover.is_practitioner_name("Mary Ann Smith DDS"))

    def test_business_with_person_name_is_not_practitioner(self):
        # Eponymous practices must not get dropped.
        self.assertFalse(discover.is_practitioner_name("Dr. Jane Smith Dentistry"))
        self.assertFalse(discover.is_practitioner_name("John Smith Law Firm"))


# ── detectors: cheap HTML-only detectors ─────────────────────────────────────


class TestDetectViewportMissing(unittest.TestCase):
    def test_missing_when_no_meta(self):
        self.assertTrue(detectors.detect_viewport_missing("<html><head></head></html>"))

    def test_present_standard(self):
        html = '<meta name="viewport" content="width=device-width, initial-scale=1">'
        self.assertFalse(detectors.detect_viewport_missing(html))

    def test_present_single_quotes(self):
        html = "<meta name='viewport' content='width=device-width'>"
        self.assertFalse(detectors.detect_viewport_missing(html))

    def test_present_uppercase(self):
        html = '<META NAME="VIEWPORT" CONTENT="width=device-width">'
        self.assertFalse(detectors.detect_viewport_missing(html))


class TestDetectNoHttps(unittest.TestCase):
    def test_http(self):
        self.assertTrue(detectors.detect_no_https("http://example.com/"))

    def test_https(self):
        self.assertFalse(detectors.detect_no_https("https://example.com/"))


class TestDetectMixedContent(unittest.TestCase):
    def test_https_with_http_script(self):
        html = '<script src="http://cdn.example.com/js"></script>'
        self.assertTrue(detectors.detect_mixed_content(html, "https://a.com/"))

    def test_https_clean(self):
        html = '<script src="https://cdn.example.com/js"></script>'
        self.assertFalse(detectors.detect_mixed_content(html, "https://a.com/"))

    def test_http_page_always_false(self):
        # Mixed content only matters on HTTPS pages.
        html = '<script src="http://cdn.example.com/js"></script>'
        self.assertFalse(detectors.detect_mixed_content(html, "http://a.com/"))

    def test_http_text_link_is_not_mixed(self):
        # Bare anchor to http:// is not mixed content.
        html = '<p>See <a href="http://old.com/">old site</a></p>'
        self.assertFalse(detectors.detect_mixed_content(html, "https://a.com/"))


class TestDetectStaleCopyright(unittest.TestCase):
    # Pin "now" so tests don't drift year-to-year.
    NOW = datetime(2026, 4, 22)

    def test_three_years_stale(self):
        # 2026 - 2023 = 3 → hits the ≥3 threshold.
        self.assertEqual(
            detectors.detect_stale_copyright("© 2023 Acme Co", now=self.NOW),
            2023,
        )

    def test_four_years_stale(self):
        self.assertEqual(
            detectors.detect_stale_copyright("Copyright 2022", now=self.NOW),
            2022,
        )

    def test_two_years_not_stale(self):
        self.assertIsNone(
            detectors.detect_stale_copyright("© 2024 Acme", now=self.NOW),
        )

    def test_range_uses_latest(self):
        # "© 2020-2024" — most-recent year is 2024, not stale.
        self.assertIsNone(
            detectors.detect_stale_copyright("© 2020-2024 Acme", now=self.NOW),
        )

    def test_stale_range(self):
        self.assertEqual(
            detectors.detect_stale_copyright("© 2018–2021", now=self.NOW),
            2021,
        )

    def test_no_match(self):
        self.assertIsNone(
            detectors.detect_stale_copyright("Welcome to our site", now=self.NOW),
        )

    def test_out_of_range_ignored(self):
        # 1985 falls below the plausibility floor (1995).
        self.assertIsNone(
            detectors.detect_stale_copyright("Copyright 1985", now=self.NOW),
        )

    def test_picks_max_when_multiple(self):
        text = "© 2019 main footer. Press kit © 2024."
        self.assertIsNone(  # latest is 2024, not stale
            detectors.detect_stale_copyright(text, now=self.NOW),
        )


class TestDetectJqueryVersion(unittest.TestCase):
    def test_extracts_version(self):
        html = '<script src="/js/jquery-1.8.3.min.js"></script>'
        self.assertEqual(detectors.detect_jquery_version(html), "1.8.3")

    def test_extracts_without_minified(self):
        html = '<script src="/static/jquery.2.1.0.js"></script>'
        self.assertEqual(detectors.detect_jquery_version(html), "2.1.0")

    def test_none_when_absent(self):
        self.assertIsNone(detectors.detect_jquery_version("<html></html>"))


# ── detectors.detect_forms (with mocked requests.get) ────────────────────────


def _mock_response(status_code: int) -> MagicMock:
    r = MagicMock()
    r.status_code = status_code
    return r


class TestDetectForms(unittest.TestCase):
    """detect_forms only flips `unreachable` on 404/410. Everything else demotes."""

    def test_no_forms(self):
        result = detectors.detect_forms("<html><body>hi</body></html>", "https://a.com/")
        self.assertEqual(result.forms_found, 0)
        self.assertFalse(result.unreachable)

    @patch("prospects.detectors.requests.get")
    def test_404_is_unreachable(self, mock_get):
        mock_get.return_value = _mock_response(404)
        html = '<form action="https://a.com/submit" method="post"></form>'
        result = detectors.detect_forms(html, "https://a.com/")
        self.assertEqual(result.forms_found, 1)
        self.assertTrue(result.unreachable)
        self.assertEqual(result.unreachable_status, 404)
        self.assertEqual(result.unreachable_action, "https://a.com/submit")

    @patch("prospects.detectors.requests.get")
    def test_410_is_unreachable(self, mock_get):
        mock_get.return_value = _mock_response(410)
        html = '<form action="/gone"></form>'
        result = detectors.detect_forms(html, "https://a.com/")
        self.assertTrue(result.unreachable)
        self.assertEqual(result.unreachable_status, 410)
        self.assertEqual(result.unreachable_action, "https://a.com/gone")

    @patch("prospects.detectors.requests.get")
    def test_405_is_unverifiable_not_unreachable(self, mock_get):
        # 405 means "GET not allowed but POST might work" — NOT a broken form.
        mock_get.return_value = _mock_response(405)
        html = '<form action="/submit"></form>'
        result = detectors.detect_forms(html, "https://a.com/")
        self.assertFalse(result.unreachable)
        self.assertEqual(result.unverifiable, 1)

    @patch("prospects.detectors.requests.get")
    def test_500_is_unverifiable(self, mock_get):
        mock_get.return_value = _mock_response(500)
        html = '<form action="/submit"></form>'
        result = detectors.detect_forms(html, "https://a.com/")
        self.assertFalse(result.unreachable)
        self.assertEqual(result.unverifiable, 1)

    @patch("prospects.detectors.requests.get")
    def test_200_is_ok(self, mock_get):
        mock_get.return_value = _mock_response(200)
        html = '<form action="/submit"></form>'
        result = detectors.detect_forms(html, "https://a.com/")
        self.assertFalse(result.unreachable)
        self.assertEqual(result.unverifiable, 0)

    @patch("prospects.detectors.requests.get")
    def test_network_error_demotes(self, mock_get):
        import requests as _requests
        mock_get.side_effect = _requests.RequestException("boom")
        html = '<form action="/submit"></form>'
        result = detectors.detect_forms(html, "https://a.com/")
        self.assertFalse(result.unreachable)
        self.assertEqual(result.unverifiable, 1)

    def test_empty_action_is_unverifiable(self):
        html = '<form></form><form action=""></form><form action="#"></form>'
        result = detectors.detect_forms(html, "https://a.com/")
        self.assertEqual(result.forms_found, 3)
        self.assertEqual(result.unverifiable, 3)
        self.assertFalse(result.unreachable)

    def test_javascript_action_is_unverifiable(self):
        html = '<form action="javascript:void(0)"></form>'
        result = detectors.detect_forms(html, "https://a.com/")
        self.assertEqual(result.unverifiable, 1)
        self.assertFalse(result.unreachable)

    @patch("prospects.detectors.requests.get")
    def test_first_404_among_many_wins(self, mock_get):
        # First 404 encountered owns the status+action fields.
        mock_get.side_effect = [
            _mock_response(200),
            _mock_response(404),
            _mock_response(404),
        ]
        html = (
            '<form action="/a"></form>'
            '<form action="/broken"></form>'
            '<form action="/also-broken"></form>'
        )
        result = detectors.detect_forms(html, "https://a.com/")
        self.assertTrue(result.unreachable)
        self.assertEqual(result.unreachable_action, "https://a.com/broken")


# ── detectors.score_severity ─────────────────────────────────────────────────


class TestScoreSeverity(unittest.TestCase):
    def test_no_website_is_max(self):
        score, tag = detectors.score_severity(detectors.AuditFindings(), has_website=False)
        self.assertEqual((score, tag), (100, "HOT"))

    def test_clean_site(self):
        score, tag = detectors.score_severity(detectors.AuditFindings(), has_website=True)
        self.assertEqual(score, 0)
        self.assertEqual(tag, "COLD")

    def test_viewport_only_is_warm(self):
        f = detectors.AuditFindings(viewport_missing=True)
        score, tag = detectors.score_severity(f, has_website=True)
        self.assertEqual(score, 35)
        self.assertEqual(tag, "COLD")  # 35 < 40 threshold

    def test_viewport_and_https_is_warm(self):
        f = detectors.AuditFindings(viewport_missing=True, no_https=True)
        score, tag = detectors.score_severity(f, has_website=True)
        self.assertEqual(score, 65)
        self.assertEqual(tag, "WARM")

    def test_full_house_caps_at_100(self):
        f = detectors.AuditFindings(
            viewport_missing=True,
            no_https=True,
            mixed_content=True,
            forms_unreachable=True,
            stale_copyright=2010,
            lighthouse_mobile=10,
        )
        score, tag = detectors.score_severity(f, has_website=True)
        self.assertEqual(score, 100)
        self.assertEqual(tag, "HOT")

    def test_lighthouse_bands(self):
        # >=40 = no points
        self.assertEqual(
            detectors.score_severity(
                detectors.AuditFindings(lighthouse_mobile=55), has_website=True,
            )[0],
            0,
        )
        # 20..39 = +15
        self.assertEqual(
            detectors.score_severity(
                detectors.AuditFindings(lighthouse_mobile=35), has_website=True,
            )[0],
            15,
        )
        # <20 = +25
        self.assertEqual(
            detectors.score_severity(
                detectors.AuditFindings(lighthouse_mobile=15), has_website=True,
            )[0],
            25,
        )

    def test_stale_copyright_caps_at_20(self):
        # 2026 - 2000 = 26 years → 5 * 26 = 130 → capped at 20
        f = detectors.AuditFindings(stale_copyright=2000)
        score, _ = detectors.score_severity(f, has_website=True)
        self.assertEqual(score, 20)

    def test_tag_thresholds(self):
        # score 39 → COLD, 40 → WARM, 69 → WARM, 70 → HOT
        def tag_for(score_target: int) -> str:
            # Craft findings that sum to score_target-ish via viewport (+35) and LH bands.
            f = detectors.AuditFindings()
            remaining = score_target
            if remaining >= 35:
                f.viewport_missing = True
                remaining -= 35
            if remaining >= 30:
                f.no_https = True
                remaining -= 30
            return detectors.score_severity(f, has_website=True)[1]

        self.assertEqual(tag_for(0), "COLD")
        self.assertEqual(tag_for(35), "COLD")
        self.assertEqual(tag_for(65), "WARM")
        self.assertEqual(tag_for(70), "WARM")  # 35+30 = 65 (closest we can build)


# ── contact_extract.extract_emails ───────────────────────────────────────────


class TestExtractEmails(unittest.TestCase):
    def test_plain_text(self):
        found = contact_extract.extract_emails("", "Reach us at jane@example.com today.")
        self.assertIn("jane@example.com", found)

    def test_mailto_href(self):
        html = '<a href="mailto:owner@clinic.com?subject=hi">Email us</a>'
        found = contact_extract.extract_emails(html, "")
        self.assertIn("owner@clinic.com", found)

    def test_dedup_across_sources(self):
        html = '<a href="mailto:Jane@Clinic.com">x</a>'
        text = "or write jane@clinic.com"
        found = contact_extract.extract_emails(html, text)
        # lowercased and deduplicated
        self.assertEqual([e for e in found if "clinic" in e], ["jane@clinic.com"])

    def test_cloudflare_data_cfemail(self):
        # Build a Cloudflare-obfuscated payload for 'test@example.com'.
        plain = "test@example.com"
        key = 0x42
        obfs = bytes([key]) + bytes(ord(c) ^ key for c in plain)
        html = f'<a class="__cf_email__" data-cfemail="{obfs.hex()}">[email protected]</a>'
        found = contact_extract.extract_emails(html, "")
        self.assertIn("test@example.com", found)

    def test_cloudflare_href_protection(self):
        plain = "office@firm.com"
        key = 0x5A
        obfs = bytes([key]) + bytes(ord(c) ^ key for c in plain)
        html = f'<a href="/cdn-cgi/l/email-protection#{obfs.hex()}">Email</a>'
        found = contact_extract.extract_emails(html, "")
        self.assertIn("office@firm.com", found)


# ── contact_extract.rank_emails ──────────────────────────────────────────────


class TestRankEmails(unittest.TestCase):
    """Scoring tiers documented at the top of contact_extract.py."""

    def test_dm_full_match(self):
        ranked = contact_extract.rank_emails(
            ["jane.smith@clinic.com"],
            decision_maker_name="Jane Smith",
            site_host="clinic.com",
        )
        self.assertEqual(ranked[0]["email"], "jane.smith@clinic.com")
        self.assertEqual(ranked[0]["score"], 95)
        self.assertEqual(ranked[0]["role_hint"], "DM full match")

    def test_dr_lastname_alias(self):
        ranked = contact_extract.rank_emails(
            ["dr.smith@clinic.com"],
            decision_maker_name="Jane Smith",
            site_host="clinic.com",
        )
        self.assertEqual(ranked[0]["score"], 85)

    def test_surname_only(self):
        ranked = contact_extract.rank_emails(
            ["smith@clinic.com"],
            decision_maker_name="Jane Smith",
            site_host="clinic.com",
        )
        # Surname-only is intentionally 75 not 95 — often a family inbox.
        self.assertEqual(ranked[0]["score"], 75)
        self.assertEqual(ranked[0]["role_hint"], "DM surname match")

    def test_first_name_only(self):
        ranked = contact_extract.rank_emails(
            ["jane@clinic.com"],
            decision_maker_name="Jane Smith",
            site_host="clinic.com",
        )
        self.assertEqual(ranked[0]["score"], 55)

    def test_ownership_local_part(self):
        ranked = contact_extract.rank_emails(
            ["owner@clinic.com"],
            decision_maker_name=None,
            site_host="clinic.com",
        )
        self.assertEqual(ranked[0]["score"], 80)

    def test_first_last_pattern(self):
        ranked = contact_extract.rank_emails(
            ["bob.jones@firm.com"],
            decision_maker_name=None,
            site_host="firm.com",
        )
        self.assertEqual(ranked[0]["score"], 70)

    def test_generic_inbox(self):
        ranked = contact_extract.rank_emails(
            ["info@clinic.com"],
            decision_maker_name=None,
            site_host="clinic.com",
        )
        self.assertEqual(ranked[0]["score"], 10)

    def test_low_priority(self):
        ranked = contact_extract.rank_emails(
            ["appointments@clinic.com"],
            decision_maker_name=None,
            site_host="clinic.com",
        )
        self.assertEqual(ranked[0]["score"], 30)

    def test_blocklisted_dropped(self):
        ranked = contact_extract.rank_emails(
            ["noreply@clinic.com", "info@clinic.com"],
            site_host="clinic.com",
        )
        locals_ = [r["email"].split("@")[0] for r in ranked]
        self.assertNotIn("noreply", locals_)
        self.assertIn("info", locals_)

    def test_off_domain_penalty(self):
        on = contact_extract.rank_emails(
            ["owner@clinic.com"], site_host="clinic.com",
        )[0]["score"]
        off = contact_extract.rank_emails(
            ["owner@gmail.com"], site_host="clinic.com",
        )[0]["score"]
        self.assertEqual(on - off, 20)

    def test_spurious_domain_filtered(self):
        ranked = contact_extract.rank_emails(
            ["jane@example.com", "real@clinic.com"],
            site_host="clinic.com",
        )
        self.assertNotIn("jane@example.com", [r["email"] for r in ranked])
        self.assertIn("real@clinic.com", [r["email"] for r in ranked])

    def test_sort_order(self):
        ranked = contact_extract.rank_emails(
            ["info@clinic.com", "jane.smith@clinic.com", "owner@clinic.com"],
            decision_maker_name="Jane Smith",
            site_host="clinic.com",
        )
        scores = [r["score"] for r in ranked]
        self.assertEqual(scores, sorted(scores, reverse=True))

    def test_short_first_name_no_substring_false_match(self):
        # DM "Li Chen" — "li" (2 chars) must NOT substring-match "billing" etc.
        ranked = contact_extract.rank_emails(
            ["billing@clinic.com"],
            decision_maker_name="Li Chen",
            site_host="clinic.com",
        )
        self.assertEqual(ranked[0]["role_hint"], "billing@")


# ── contact_extract.extract_decision_maker ───────────────────────────────────


class TestExtractDecisionMaker(unittest.TestCase):
    def test_empty_text(self):
        self.assertEqual(contact_extract.extract_decision_maker(""), (None, None))

    def test_meet_dr(self):
        name, title = contact_extract.extract_decision_maker("Meet Dr. Jane Smith today!")
        self.assertEqual(name, "Jane Smith")
        self.assertEqual(title, "Dr.")

    def test_owner_label(self):
        name, title = contact_extract.extract_decision_maker("Owner: Jane Smith, founder.")
        self.assertEqual(name, "Jane Smith")
        self.assertEqual(title, "Owner")

    def test_trailing_credential(self):
        name, title = contact_extract.extract_decision_maker("Jane Smith, DDS is accepting new patients.")
        self.assertEqual(name, "Jane Smith")
        self.assertEqual(title, "DDS")

    def test_esquire(self):
        name, title = contact_extract.extract_decision_maker("John Doe, Esq. represents clients across SC.")
        self.assertEqual(name, "John Doe")
        self.assertEqual(title, "Esq.")

    def test_attorney_title(self):
        name, title = contact_extract.extract_decision_maker("John Doe, Attorney at Law")
        self.assertEqual(name, "John Doe")
        self.assertIn("Attorney", title)

    def test_business_name_hint_breaks_tie(self):
        # Two equally-attested candidates — business-name surname picks the winner.
        text = (
            "Dr. Bob Jones joined in 2001. Dr. Bob Jones is wonderful. "
            "Dr. Jane Smith leads our practice."
        )
        # Without hint, Jones wins (2 mentions beats Smith's 1).
        no_hint, _ = contact_extract.extract_decision_maker(text)
        self.assertEqual(no_hint, "Bob Jones")
        # With hint pointing at "Smith", hint adds +40 and flips the winner.
        hinted, _ = contact_extract.extract_decision_maker(text, business_name="Smith Family Dentistry")
        self.assertEqual(hinted, "Jane Smith")

    def test_false_positive_names_rejected(self):
        # "Our Team" would match the name regex but is a known false positive.
        self.assertEqual(
            contact_extract.extract_decision_maker("Meet Our Team for details."),
            (None, None),
        )

    def test_no_match_returns_none(self):
        self.assertEqual(
            contact_extract.extract_decision_maker("Welcome. We provide modern dentistry."),
            (None, None),
        )


# ── contact_extract candidate-page helpers ───────────────────────────────────


class TestFindCandidatePageUrls(unittest.TestCase):
    def test_picks_same_origin_contact_paths(self):
        urls = contact_extract.find_candidate_page_urls(
            "https://clinic.com/",
            [
                "https://clinic.com/about",
                "https://clinic.com/contact-us",
                "https://clinic.com/services",  # no keyword
                "https://external.com/about",   # other origin
                "mailto:hi@clinic.com",
                "#section",
                "javascript:void(0)",
            ],
            limit=3,
        )
        self.assertIn("https://clinic.com/about", urls)
        self.assertIn("https://clinic.com/contact-us", urls)
        self.assertNotIn("https://clinic.com/services", urls)
        self.assertNotIn("https://external.com/about", urls)

    def test_respects_limit(self):
        urls = contact_extract.find_candidate_page_urls(
            "https://clinic.com/",
            [
                "https://clinic.com/about",
                "https://clinic.com/contact",
                "https://clinic.com/team",
                "https://clinic.com/meet-the-doctor",
            ],
            limit=2,
        )
        self.assertEqual(len(urls), 2)

    def test_dedupes(self):
        urls = contact_extract.find_candidate_page_urls(
            "https://clinic.com/",
            [
                "https://clinic.com/about",
                "https://clinic.com/about",
                "https://clinic.com/about?ref=nav",
            ],
            limit=5,
        )
        # Query-stripped key means all three dedupe to one.
        self.assertEqual(len(urls), 1)


class TestFallbackProbeUrls(unittest.TestCase):
    def test_builds_absolute_urls(self):
        urls = contact_extract.fallback_probe_urls(
            "https://clinic.com/",
            already_found=[],
            limit=3,
        )
        self.assertEqual(len(urls), 3)
        for u in urls:
            self.assertTrue(u.startswith("https://clinic.com/"))

    def test_excludes_already_found(self):
        urls = contact_extract.fallback_probe_urls(
            "https://clinic.com/",
            already_found=["https://clinic.com/contact", "https://clinic.com/about"],
            limit=3,
        )
        for u in urls:
            self.assertNotIn(u.rstrip("/"), {"https://clinic.com/contact", "https://clinic.com/about"})


if __name__ == "__main__":
    unittest.main(verbosity=2)
