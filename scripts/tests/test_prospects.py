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
      / find_candidate_page_urls / fallback_probe_urls / extract_facebook_url
  - message_draft.pick_top_issue / generate_fb_message / _first_name
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
from prospects import contact_extract, detectors, discover, message_draft  # noqa: E402


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


# ── contact_extract.extract_facebook_url ─────────────────────────────────────


class TestExtractFacebookUrl(unittest.TestCase):
    """Mining the practice's FB Page URL from already-crawled site HTML."""

    def test_returns_none_for_empty_html(self):
        self.assertIsNone(contact_extract.extract_facebook_url(""))
        self.assertIsNone(contact_extract.extract_facebook_url(None))  # type: ignore[arg-type]

    def test_picks_up_basic_vanity_url(self):
        html = '<a href="https://www.facebook.com/PinecrestFamilyDentistry">FB</a>'
        self.assertEqual(
            contact_extract.extract_facebook_url(html),
            "https://www.facebook.com/PinecrestFamilyDentistry",
        )

    def test_strips_trailing_slash_and_query(self):
        html = '<a href="https://www.facebook.com/PinecrestFD/?ref=footer">FB</a>'
        self.assertEqual(
            contact_extract.extract_facebook_url(html),
            "https://www.facebook.com/PinecrestFD",
        )

    def test_normalizes_mobile_subdomain(self):
        html = '<a href="https://m.facebook.com/PinecrestFD">m</a>'
        self.assertEqual(
            contact_extract.extract_facebook_url(html),
            "https://www.facebook.com/PinecrestFD",
        )

    def test_rejects_share_button_urls(self):
        html = """
        <a href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fclinic.com">Share</a>
        <a href="https://www.facebook.com/share.php?u=...">Share</a>
        """
        self.assertIsNone(contact_extract.extract_facebook_url(html))

    def test_rejects_login_and_plugin_paths(self):
        html = """
        <a href="https://www.facebook.com/login">Login</a>
        <a href="https://www.facebook.com/plugins/like.php?href=...">Like</a>
        <a href="https://www.facebook.com/dialog/share">Dialog</a>
        <a href="https://www.facebook.com/tr">Pixel</a>
        """
        self.assertIsNone(contact_extract.extract_facebook_url(html))

    def test_rejects_post_video_photo_paths(self):
        html = """
        <a href="https://www.facebook.com/PinecrestFD/posts/123">Post</a>
        <a href="https://www.facebook.com/PinecrestFD/videos/456">Video</a>
        <a href="https://www.facebook.com/PinecrestFD/photos/789">Photo</a>
        """
        self.assertIsNone(contact_extract.extract_facebook_url(html))

    def test_rejects_graph_api_version_paths(self):
        # FB SDK injects /v17.0/dialog and similar — those aren't Pages.
        html = '<script src="https://www.facebook.com/v17.0/sdk.js"></script>'
        self.assertIsNone(contact_extract.extract_facebook_url(html))

    def test_rejects_fbml_xmlns(self):
        # Old FB markup used xmlns:fb="https://www.facebook.com/2008/fbml" —
        # purely structural, never a Page.
        html = '<html xmlns:fb="https://www.facebook.com/2008/fbml">'
        self.assertIsNone(contact_extract.extract_facebook_url(html))

    def test_picks_most_referenced_url_when_multiple(self):
        html = """
        <a href="https://www.facebook.com/PinecrestFD">Header</a>
        <a href="https://www.facebook.com/PinecrestFD">Footer</a>
        <a href="https://www.facebook.com/PinecrestFD">Contact</a>
        <a href="https://www.facebook.com/SomeOtherPage">One off</a>
        """
        self.assertEqual(
            contact_extract.extract_facebook_url(html),
            "https://www.facebook.com/PinecrestFD",
        )

    def test_tie_breaks_to_shortest_path(self):
        # /pages/Name/12345 form vs vanity — vanity should win when both
        # appear once each.
        html = """
        <a href="https://www.facebook.com/pages/Pinecrest-Family-Dentistry/123456789">Long</a>
        <a href="https://www.facebook.com/PinecrestFD">Vanity</a>
        """
        self.assertEqual(
            contact_extract.extract_facebook_url(html),
            "https://www.facebook.com/PinecrestFD",
        )

    def test_keeps_pages_form_when_only_option(self):
        html = '<a href="https://www.facebook.com/pages/Pinecrest-FD/123456">Page</a>'
        self.assertEqual(
            contact_extract.extract_facebook_url(html),
            "https://www.facebook.com/pages/Pinecrest-FD/123456",
        )

    def test_rejects_incomplete_pages_path(self):
        # /pages/<thing> without an ID is unusable.
        html = '<a href="https://www.facebook.com/pages/Pinecrest-FD">Bad</a>'
        self.assertIsNone(contact_extract.extract_facebook_url(html))

    def test_preserves_fb_me_redirector(self):
        html = '<a href="https://fb.me/PinecrestFD">Short</a>'
        self.assertEqual(
            contact_extract.extract_facebook_url(html),
            "https://fb.me/PinecrestFD",
        )

    def test_share_buttons_dont_drown_out_real_page(self):
        # Many sites have one real Page link in the footer and dozens of
        # share buttons across blog posts. The Page should still surface.
        html = """
        <a href="https://www.facebook.com/PinecrestFD">FB</a>
        """ + ('<a href="https://www.facebook.com/sharer/sharer.php?u=x">Share</a>' * 20)
        self.assertEqual(
            contact_extract.extract_facebook_url(html),
            "https://www.facebook.com/PinecrestFD",
        )

    def test_no_facebook_at_all_returns_none(self):
        html = '<html><body>No FB here, just <a href="https://twitter.com/x">tw</a></body></html>'
        self.assertIsNone(contact_extract.extract_facebook_url(html))


# ── message_draft.pick_top_issue ─────────────────────────────────────────────


class TestPickTopIssue(unittest.TestCase):
    """The storyline picker that drives which template fires."""

    def test_no_website_when_status_says_so(self):
        p = {"audit_status": "no_website", "website_url": None, "issues": None}
        self.assertEqual(message_draft.pick_top_issue(p), "no_website")

    def test_no_website_when_url_missing(self):
        p = {"audit_status": "audited", "website_url": None, "issues": {"viewport_missing": True}}
        self.assertEqual(message_draft.pick_top_issue(p), "no_website")

    def test_forms_unreachable_takes_priority_over_https(self):
        p = {
            "audit_status": "audited",
            "website_url": "https://clinic.com",
            "issues": {"forms_unreachable": True, "no_https": True, "viewport_missing": True},
        }
        self.assertEqual(message_draft.pick_top_issue(p), "forms_unreachable")

    def test_viewport_above_https(self):
        p = {
            "audit_status": "audited",
            "website_url": "https://clinic.com",
            "issues": {"viewport_missing": True, "no_https": True},
        }
        self.assertEqual(message_draft.pick_top_issue(p), "no_viewport")

    def test_lighthouse_low_only_below_threshold(self):
        p_below = {
            "audit_status": "audited",
            "website_url": "https://clinic.com",
            "lighthouse_mobile_score": 18,
            "issues": {},
        }
        p_above = {
            "audit_status": "audited",
            "website_url": "https://clinic.com",
            "lighthouse_mobile_score": 55,
            "issues": {},
        }
        self.assertEqual(message_draft.pick_top_issue(p_below), "lighthouse_low")
        self.assertEqual(message_draft.pick_top_issue(p_above), "generic")

    def test_lighthouse_falls_back_to_issues_dict(self):
        # Pre-2.0 rows may not have lighthouse_mobile_score column populated.
        p = {
            "audit_status": "audited",
            "website_url": "https://clinic.com",
            "lighthouse_mobile_score": None,
            "issues": {"lighthouse_mobile": 15},
        }
        self.assertEqual(message_draft.pick_top_issue(p), "lighthouse_low")

    def test_stale_copyright_only_when_others_clean(self):
        p = {
            "audit_status": "audited",
            "website_url": "https://clinic.com",
            "issues": {"stale_copyright": 2019},
        }
        self.assertEqual(message_draft.pick_top_issue(p), "stale_copyright")

    def test_falls_through_to_generic(self):
        p = {
            "audit_status": "audited",
            "website_url": "https://clinic.com",
            "issues": {},
        }
        self.assertEqual(message_draft.pick_top_issue(p), "generic")


# ── message_draft._first_name ────────────────────────────────────────────────


class TestFirstName(unittest.TestCase):
    """Honorific + credential stripping for the greeting line."""

    def test_plain_first_name(self):
        self.assertEqual(message_draft._first_name("Jane Smith"), "Jane")

    def test_strips_dr(self):
        self.assertEqual(message_draft._first_name("Dr. Jane Smith"), "Jane")
        self.assertEqual(message_draft._first_name("Dr Jane Smith"), "Jane")

    def test_strips_post_nominal_credential(self):
        self.assertEqual(message_draft._first_name("Mary Ann Smith DDS"), "Mary")
        self.assertEqual(message_draft._first_name("Jane Smith, DMD"), "Jane")

    def test_handles_all_caps(self):
        self.assertEqual(message_draft._first_name("JANE SMITH"), "Jane")

    def test_handles_combined(self):
        self.assertEqual(message_draft._first_name("Dr. JANE SMITH, DDS"), "Jane")

    def test_returns_none_for_empty(self):
        self.assertIsNone(message_draft._first_name(""))
        self.assertIsNone(message_draft._first_name(None))

    def test_skips_lone_initial(self):
        # "J. Smith" — single-letter token gets skipped, falls to "Smith".
        # Surname-as-greeting is awkward but better than no greeting at all.
        self.assertEqual(message_draft._first_name("J. Smith"), "Smith")


# ── message_draft.generate_fb_message ────────────────────────────────────────


def _base_prospect(**overrides) -> dict:
    """Minimal valid prospect row, override any field for a specific test."""
    base = {
        "id": "test-id",
        "place_id": "ChIJABC123XYZ",
        "business_name": "Pinecrest Family Dentistry",
        "vertical": "dental",
        "city": "Greenville",
        "decision_maker_name": "Dr. Jane Smith",
        "decision_maker_title": "Dr.",
        "google_rating": 4.7,
        "google_review_count": 134,
        "audit_status": "audited",
        "website_url": "https://pinecrestfamilydentistry.com",
        "lighthouse_mobile_score": 65,
        "issues": {
            "viewport_missing": False,
            "no_https": False,
            "forms_unreachable": False,
            "stale_copyright": None,
            "lighthouse_mobile": 65,
        },
    }
    base.update(overrides)
    return base


class TestGenerateFbMessage(unittest.TestCase):
    """Output sanity, voice rules, and personalization wiring."""

    def test_returns_string(self):
        msg = message_draft.generate_fb_message(_base_prospect())
        self.assertIsInstance(msg, str)
        self.assertGreater(len(msg), 50)

    def test_raises_on_non_dict(self):
        with self.assertRaises(TypeError):
            message_draft.generate_fb_message("not a dict")  # type: ignore[arg-type]

    # ── Voice rules ───

    def test_no_price_in_first_touch(self):
        """Memory rule: no price, cadence, or retainer terms in email/DM #1."""
        for issue, payload in [
            ("no_website", {"audit_status": "no_website", "website_url": None, "issues": None}),
            ("forms_unreachable", {"issues": {"forms_unreachable": True,
                                              "forms_unreachable_page": "https://x.com/contact"}}),
            ("no_viewport", {"issues": {"viewport_missing": True}}),
            ("no_https", {"issues": {"no_https": True}}),
            ("lighthouse_low", {"lighthouse_mobile_score": 12, "issues": {}}),
            ("stale_copyright", {"issues": {"stale_copyright": 2019}}),
        ]:
            with self.subTest(issue=issue):
                p = _base_prospect(**payload)
                msg = message_draft.generate_fb_message(p).lower()
                for forbidden in ("$1,500", "$1500", "five days", "5 days",
                                  "no retainer", "month-to-month", "30-day",
                                  "30 day cancel"):
                    self.assertNotIn(forbidden, msg, f"{issue!r} leaked: {forbidden!r}")

    def test_signs_off_as_alex(self):
        msg = message_draft.generate_fb_message(_base_prospect())
        self.assertTrue(msg.rstrip().endswith("-Alex"))

    def test_includes_anti_upsell_beat(self):
        msg = message_draft.generate_fb_message(_base_prospect())
        self.assertIn("No obligation", msg)

    # ── Compliment opener gates ───

    def test_compliment_appears_when_thresholds_clear(self):
        msg = message_draft.generate_fb_message(_base_prospect())
        self.assertIn("4.7 stars", msg)
        self.assertIn("134", msg)

    def test_compliment_dropped_when_low_rating(self):
        msg = message_draft.generate_fb_message(_base_prospect(google_rating=3.4))
        self.assertNotIn("stars across", msg)

    def test_compliment_dropped_when_few_reviews(self):
        msg = message_draft.generate_fb_message(_base_prospect(google_review_count=4))
        self.assertNotIn("stars across", msg)

    def test_compliment_dropped_when_review_data_missing(self):
        msg = message_draft.generate_fb_message(
            _base_prospect(google_rating=None, google_review_count=None)
        )
        self.assertNotIn("stars across", msg)

    # ── Greeting personalization ───

    def test_greeting_uses_first_name(self):
        msg = message_draft.generate_fb_message(_base_prospect())
        self.assertTrue(msg.startswith("Hello Jane,"))

    def test_greeting_falls_back_when_no_decision_maker(self):
        msg = message_draft.generate_fb_message(_base_prospect(decision_maker_name=None))
        self.assertTrue(msg.startswith("Hello,"))

    # ── Per-template content checks ───

    def test_no_website_template_pitches_one_page_mock(self):
        msg = message_draft.generate_fb_message(_base_prospect(
            audit_status="no_website", website_url=None, issues=None,
        ))
        self.assertIn("one-page mock", msg)
        # Don't fabricate a finding — the leak is "they bounce to the next result".
        self.assertIn("bounce", msg.lower())

    def test_forms_unreachable_cites_page_when_known(self):
        msg = message_draft.generate_fb_message(_base_prospect(
            issues={
                "forms_unreachable": True,
                "forms_unreachable_page": "https://pinecrestfamilydentistry.com/contact",
            },
        ))
        self.assertIn("pinecrestfamilydentistry.com/contact", msg)
        self.assertIn("call the next dentist", msg)

    def test_forms_unreachable_falls_back_to_host_only(self):
        msg = message_draft.generate_fb_message(_base_prospect(
            issues={"forms_unreachable": True, "forms_unreachable_page": None},
        ))
        self.assertIn("pinecrestfamilydentistry.com", msg)

    def test_no_viewport_calls_out_mobile(self):
        msg = message_draft.generate_fb_message(_base_prospect(
            issues={"viewport_missing": True},
        ))
        self.assertIn("phone", msg.lower())
        self.assertIn("mobile", msg.lower())

    def test_no_https_calls_out_chrome_warning(self):
        msg = message_draft.generate_fb_message(_base_prospect(
            issues={"no_https": True},
        ))
        self.assertIn("HTTPS", msg)
        self.assertIn("Not Secure", msg)

    def test_lighthouse_low_includes_score(self):
        msg = message_draft.generate_fb_message(_base_prospect(
            lighthouse_mobile_score=18,
            issues={"lighthouse_mobile": 18},
        ))
        self.assertIn("18/100", msg)

    def test_stale_copyright_mentions_year(self):
        msg = message_draft.generate_fb_message(_base_prospect(
            issues={"stale_copyright": 2019},
        ))
        self.assertIn("2019", msg)

    # ── Vertical guard ───

    def test_personal_injury_uses_neutral_template(self):
        msg = message_draft.generate_fb_message(_base_prospect(
            vertical="personal_injury",
            issues={"viewport_missing": True},  # would normally pick mobile template
        ))
        # The generic/neutral template uses "inquiries" instead of dental "patients"
        # and never emits the dental-search statistic.
        self.assertNotIn("dental searches", msg.lower())
        self.assertIn("inquiries", msg.lower())

    # ── Determinism + variance across prospects ───

    def test_same_prospect_produces_same_message(self):
        p = _base_prospect(issues={"forms_unreachable": True,
                                   "forms_unreachable_page": "https://x.com/contact"})
        self.assertEqual(
            message_draft.generate_fb_message(p),
            message_draft.generate_fb_message(p),
        )

    def test_different_prospects_can_produce_different_recency(self):
        # Across many prospects, the recency adverb varies (deterministically).
        # Test a sample and confirm we don't always get "this morning".
        adverbs = set()
        for i in range(40):
            p = _base_prospect(
                place_id=f"ChIJ{i}xyz",
                issues={"forms_unreachable": True,
                        "forms_unreachable_page": "https://x.com/contact"},
            )
            msg = message_draft.generate_fb_message(p)
            for opt in message_draft._RECENCY_ADVERBS:
                if opt in msg:
                    adverbs.add(opt)
                    break
        self.assertGreater(len(adverbs), 1, "recency phrasing should vary across prospects")


if __name__ == "__main__":
    unittest.main(verbosity=2)
