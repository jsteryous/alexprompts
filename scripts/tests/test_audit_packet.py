"""
Tests for scripts/prospects/audit_packet.py — the print-ready packet renderer.

Covers the pure rendering path (no DB, no network):

    build_findings(prospect, issues, today)   -> list[Finding] severity-sorted, capped 4
    render_letter_html(...)                    -> str
    render_audit_html(...)                     -> str
    render_packet_html(...)                    -> str
    render_envelope_text(prospect)             -> str
    render_followup_dm(prospect, findings)     -> str

Voice rules locked here so a future copy edit can't quietly regress them:
  - First-touch packet contains NO price ($1,500 / 4500 / 500/mo) — those move to follow-up.
  - Villain framing — patient/revenue loss is the headline; mechanism is evidence.
  - Verify-yourself line on every finding (falsifiable claims = credible claims).
  - Sample-proposal URL is in the letter as fine-print P.S., not a primary CTA.

Run from the repo root:
    python -m unittest scripts.tests.test_audit_packet -v
"""

from __future__ import annotations

import sys
import unittest
from datetime import date
from pathlib import Path

_SCRIPTS_DIR = Path(__file__).resolve().parent.parent
if str(_SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPTS_DIR))

from prospects import audit_packet  # noqa: E402
from prospects.audit_packet import (  # noqa: E402
    _looks_like_real_person_name,
    _practice_greeting_name,
    _split_us_address,
    build_findings,
    render_audit_html,
    render_envelope_text,
    render_followup_dm,
    render_letter_html,
    render_packet_html,
)


# ── Sample fixtures ────────────────────────────────────────────────────────

TODAY = date(2026, 5, 3)

DENTAL_HOT_FORM_BROKEN = {
    "place_id": "ChIJ_TEST_FORM_BROKEN",
    "business_name": "Pinecrest Family Dentistry",
    "vertical": "dental",
    "address": "2100 Poinsett Hwy",
    "city": "Greenville",
    "county": "Greenville",
    "phone": "(864) 555-0142",
    "website_url": "https://pinecrestdental.example",
    "google_rating": 4.8,
    "google_review_count": 124,
    "audit_status": "audited",
    "decision_maker_name": "Dr. Sarah Patel",
    "decision_maker_title": "Owner",
    "contact_status": "not_contacted",
    "severity_score": 95,
    "severity_tag": "HOT",
    "lighthouse_mobile_score": 32,
    "issues": {
        "viewport_missing": True,
        "no_https": False,
        "forms_unreachable": True,
        "forms_unreachable_status": 404,
        "forms_unreachable_action": "https://pinecrestdental.example/old-form-handler",
        "forms_unreachable_page": "https://pinecrestdental.example/contact",
        "stale_copyright": 2019,
        "lighthouse_mobile": 32,
    },
}

DENTAL_NO_WEBSITE = {
    "place_id": "ChIJ_TEST_NO_WEBSITE",
    "business_name": "Hometown Dental Care",
    "vertical": "dental",
    "address": "12 Main St",
    "city": "Easley",
    "county": "Pickens",
    "phone": "(864) 555-9876",
    "website_url": None,
    "google_rating": 4.6,
    "google_review_count": 41,
    "audit_status": "no_website",
    "decision_maker_name": None,
    "severity_score": 100,
    "severity_tag": "HOT",
    "issues": None,
}


# ── build_findings ──────────────────────────────────────────────────────────


class TestBuildFindings(unittest.TestCase):

    def test_no_website_yields_single_critical_finding(self):
        findings = build_findings(DENTAL_NO_WEBSITE, {}, TODAY)
        self.assertEqual(len(findings), 1)
        self.assertEqual(findings[0].severity, "critical")
        # Villain framing — patients walking away, not "no DNS record"
        self.assertIn("phone", findings[0].headline.lower())
        # Verify-yourself line is reproducible by the recipient
        self.assertTrue(findings[0].verify)

    def test_caps_at_four_even_when_everything_fires(self):
        issues = dict(DENTAL_HOT_FORM_BROKEN["issues"] or {})
        issues.update({
            "no_https": True,
            "mixed_content": True,
            "forms_unreachable": True,
            "viewport_missing": True,
            "stale_copyright": 2019,
            "lighthouse_mobile": 18,
        })
        findings = build_findings(DENTAL_HOT_FORM_BROKEN, issues, TODAY)
        self.assertLessEqual(len(findings), 4)

    def test_severity_sort_critical_before_low(self):
        findings = build_findings(
            DENTAL_HOT_FORM_BROKEN, DENTAL_HOT_FORM_BROKEN["issues"], TODAY,
        )
        severities = [f.severity for f in findings]
        # All criticals come before any non-critical
        last_critical = max(
            (i for i, s in enumerate(severities) if s == "critical"),
            default=-1,
        )
        first_non_critical = min(
            (i for i, s in enumerate(severities) if s != "critical"),
            default=len(severities),
        )
        self.assertLess(last_critical, first_non_critical)

    def test_finding_evidence_cites_concrete_url_or_value(self):
        # Every claim must be falsifiable — generic "your site is bad" is banned.
        findings = build_findings(
            DENTAL_HOT_FORM_BROKEN, DENTAL_HOT_FORM_BROKEN["issues"], TODAY,
        )
        for f in findings:
            self.assertTrue(f.verify, f"Missing verify line for: {f.headline}")
            self.assertTrue(f.evidence, f"Missing evidence for: {f.headline}")
            self.assertTrue(f.observed_on, f"Missing observed_on for: {f.headline}")

    def test_lighthouse_score_quoted_in_evidence(self):
        # A core "extreme accuracy" guarantee — we cite the actual number.
        findings = build_findings(
            DENTAL_HOT_FORM_BROKEN, DENTAL_HOT_FORM_BROKEN["issues"], TODAY,
        )
        lh_finding = next(
            (f for f in findings if "PageSpeed" in f.evidence or "/100" in f.evidence),
            None,
        )
        if lh_finding:  # not capped out by higher-severity findings
            self.assertIn("32", lh_finding.evidence)


# ── render_letter_html ──────────────────────────────────────────────────────


class TestLetterRendering(unittest.TestCase):

    def test_no_dollar_amount_in_first_touch_letter(self):
        # Memory rule: first touch leads with free audit, NOT price.
        # Both the public anchor ($1,500 Cleanup) and the proposal numbers
        # ($4,500 setup + $500/mo) belong in the written proposal, not here.
        findings = build_findings(
            DENTAL_HOT_FORM_BROKEN, DENTAL_HOT_FORM_BROKEN["issues"], TODAY,
        )
        letter = render_letter_html(DENTAL_HOT_FORM_BROKEN, findings, TODAY)
        for forbidden in ("$1,500", "$4,500", "$500/mo", "$500 per month",
                          "1500", "4500"):
            self.assertNotIn(
                forbidden, letter,
                f"Letter must not include {forbidden!r} on first touch",
            )

    def test_letter_addresses_owner_when_known(self):
        findings = build_findings(
            DENTAL_HOT_FORM_BROKEN, DENTAL_HOT_FORM_BROKEN["issues"], TODAY,
        )
        letter = render_letter_html(DENTAL_HOT_FORM_BROKEN, findings, TODAY)
        # "Dr. Patel," — formed from decision_maker_name's last token
        self.assertIn("Dr. Patel", letter)

    def test_letter_falls_back_when_no_decision_maker(self):
        findings = build_findings(DENTAL_NO_WEBSITE, {}, TODAY)
        letter = render_letter_html(DENTAL_NO_WEBSITE, findings, TODAY)
        # Should NOT print 'Dr. None' or fabricate a name
        self.assertNotIn("Dr. None", letter)
        self.assertIn("Hometown Dental Care", letter)

    def test_letter_includes_proposal_anchor_in_ps(self):
        findings = build_findings(
            DENTAL_HOT_FORM_BROKEN, DENTAL_HOT_FORM_BROKEN["issues"], TODAY,
        )
        letter = render_letter_html(DENTAL_HOT_FORM_BROKEN, findings, TODAY)
        self.assertIn("rebbadvisors.com/sample-proposal", letter)

    def test_letter_omits_punchy_anti_upsell_block(self):
        # The "No retainers locking you in / No marketing-strategy calls /
        # Month-to-month, 30-day cancel" paragraph and the "If you'd be better
        # off doing nothing… The proposal is the product." closer were pulled
        # in May 2026 — they read as agency-pitch on first touch and the user
        # flagged them as too punchy for correspondence. Locked here so a
        # voice rev doesn't quietly reintroduce them.
        findings = build_findings(
            DENTAL_HOT_FORM_BROKEN, DENTAL_HOT_FORM_BROKEN["issues"], TODAY,
        )
        letter = render_letter_html(DENTAL_HOT_FORM_BROKEN, findings, TODAY)
        for forbidden in (
            "No retainers locking you in",
            "marketing-strategy calls",
            "Month-to-month, 30-day cancel",
            "be better off doing nothing",
        ):
            self.assertNotIn(
                forbidden, letter,
                f"Letter must not include {forbidden!r} on first touch",
            )


# ── render_audit_html ───────────────────────────────────────────────────────


class TestAuditRendering(unittest.TestCase):

    def test_audit_page_includes_villain_punch(self):
        findings = build_findings(
            DENTAL_HOT_FORM_BROKEN, DENTAL_HOT_FORM_BROKEN["issues"], TODAY,
        )
        audit = render_audit_html(DENTAL_HOT_FORM_BROKEN, findings, TODAY)
        self.assertIn("Every silent bounce takes the whole arc", audit)

    def test_audit_page_renders_proof_frame(self):
        findings = build_findings(
            DENTAL_HOT_FORM_BROKEN, DENTAL_HOT_FORM_BROKEN["issues"], TODAY,
        )
        audit = render_audit_html(DENTAL_HOT_FORM_BROKEN, findings, TODAY)
        self.assertIn("The proposal is the product", audit)

    def test_audit_page_handles_zero_findings_gracefully(self):
        # The revalidation path can drop every finding (forms repaired, HTTPS
        # added since audit). In that case the packet still ships, but with a
        # gracious "looks like you fixed it" message instead of an empty grid.
        audit = render_audit_html(DENTAL_HOT_FORM_BROKEN, [], TODAY)
        self.assertIn("resolved", audit.lower())

    def test_audit_escapes_business_name(self):
        evil = dict(DENTAL_HOT_FORM_BROKEN)
        evil["business_name"] = "Smith & <Sons> Dental"
        findings = build_findings(evil, evil["issues"], TODAY)
        audit = render_audit_html(evil, findings, TODAY)
        self.assertNotIn("<Sons>", audit)
        self.assertIn("&lt;Sons&gt;", audit)


# ── render_packet_html ──────────────────────────────────────────────────────


class TestPacketRendering(unittest.TestCase):

    def test_packet_contains_both_pages(self):
        findings = build_findings(
            DENTAL_HOT_FORM_BROKEN, DENTAL_HOT_FORM_BROKEN["issues"], TODAY,
        )
        packet = render_packet_html(DENTAL_HOT_FORM_BROKEN, findings, TODAY)
        # Letter content
        self.assertIn("Dr. Patel", packet)
        # Audit content
        self.assertIn("Every silent bounce", packet)
        # Page break marker — two .sheet sections in the same doc
        self.assertEqual(packet.count('<section class="sheet">'), 2)


# ── render_envelope_text ────────────────────────────────────────────────────


class TestEnvelope(unittest.TestCase):

    def test_envelope_includes_practice_and_address(self):
        env = render_envelope_text(DENTAL_HOT_FORM_BROKEN)
        self.assertIn("Pinecrest Family Dentistry", env)
        self.assertIn("2100 Poinsett Hwy", env)
        self.assertIn("Greenville, SC", env)
        self.assertIn("Personal & Confidential", env)

    def test_envelope_falls_back_when_no_owner_known(self):
        env = render_envelope_text(DENTAL_NO_WEBSITE)
        self.assertIn("Owner / Practice Manager", env)
        self.assertIn("Hometown Dental Care", env)


# ── render_followup_dm ──────────────────────────────────────────────────────


class TestFollowupDm(unittest.TestCase):

    def test_dm_references_mailed_letter(self):
        # Stacking the DM on top of the mail is the whole tactical play —
        # the DM must reference the letter or it's just another cold ping.
        findings = build_findings(
            DENTAL_HOT_FORM_BROKEN, DENTAL_HOT_FORM_BROKEN["issues"], TODAY,
        )
        dm = render_followup_dm(DENTAL_HOT_FORM_BROKEN, findings)
        self.assertIn("letter", dm.lower())
        self.assertIn("Pinecrest Family Dentistry", dm)
        self.assertIn("-Alex", dm)


# ── Decision-maker name sanitization ────────────────────────────────────────


class TestPersonNameGuard(unittest.TestCase):
    """The contact extractor occasionally ingests insurer or holding-company
    names from page footers ("Physicians Mutual / Principal", "Delta Dental").
    Addressing a letter to "Dr. Mutual" torches credibility — these tests
    lock the guard against that class of failure."""

    def test_real_person_passes(self):
        self.assertTrue(_looks_like_real_person_name("Jay Myers"))
        self.assertTrue(_looks_like_real_person_name("John H. Atcheson"))
        self.assertTrue(_looks_like_real_person_name("Dr. Sarah O'Brien"))

    def test_company_or_role_blocked(self):
        # Real cases pulled from the live DB — these MUST fail the guard.
        self.assertFalse(_looks_like_real_person_name("Physicians Mutual"))
        self.assertFalse(_looks_like_real_person_name("Delta Dental Insurance"))
        self.assertFalse(_looks_like_real_person_name("Smith Holdings LLC"))
        self.assertFalse(_looks_like_real_person_name("Pinecrest Associates"))

    def test_credentials_only_blocked(self):
        self.assertFalse(_looks_like_real_person_name("DDS"))
        self.assertFalse(_looks_like_real_person_name(""))
        self.assertFalse(_looks_like_real_person_name(None))

    def test_greeting_falls_back_when_name_is_company(self):
        prospect = dict(DENTAL_HOT_FORM_BROKEN, decision_maker_name="Physicians Mutual")
        greeting = _practice_greeting_name(prospect)
        # Never fabricate "Dr. Mutual" — fall back to the bare salutation.
        self.assertNotIn("Mutual", greeting)
        self.assertNotIn("Dr.", greeting)
        self.assertEqual(greeting.strip().lower(), "hello")


# ── US address parsing ──────────────────────────────────────────────────────


class TestAddressParsing(unittest.TestCase):

    def test_drops_usa_country_suffix(self):
        street, csz = _split_us_address("2548 Norris Hwy, Six Mile, SC 29682, USA")
        self.assertEqual(street, "2548 Norris Hwy")
        self.assertEqual(csz, "Six Mile, SC 29682")

    def test_handles_suite_in_street(self):
        street, csz = _split_us_address(
            "6134 White Horse Rd Suite C, Greenville, SC 29611, USA"
        )
        self.assertEqual(street, "6134 White Horse Rd Suite C")
        self.assertEqual(csz, "Greenville, SC 29611")

    def test_returns_blanks_when_input_empty(self):
        self.assertEqual(_split_us_address(""), ("", ""))
        self.assertEqual(_split_us_address(None), ("", ""))

    def test_inline_comma_in_street_does_not_bleed_into_city_line(self):
        # Real Charleston row: '112 1/2, Ashley Ave, Charleston, SC 29401, USA'.
        # Old parser put '112 1/2' on the street line and 'Ashley Ave, …' on
        # the city line — illegible mailing label.
        street, csz = _split_us_address(
            "112 1/2, Ashley Ave, Charleston, SC 29401, USA"
        )
        self.assertEqual(street, "112 1/2, Ashley Ave")
        self.assertEqual(csz, "Charleston, SC 29401")


# ── Letter does not double-escape return-address middot separator ───────────


class TestLetterEscaping(unittest.TestCase):

    def test_no_double_escaped_html_entities(self):
        findings = build_findings(
            DENTAL_HOT_FORM_BROKEN, DENTAL_HOT_FORM_BROKEN["issues"], TODAY,
        )
        letter = render_letter_html(DENTAL_HOT_FORM_BROKEN, findings, TODAY)
        # Earlier rev had `&amp;middot;` rendering literally in the header.
        # The string '&amp;middot;' must NEVER appear in any rendered packet.
        self.assertNotIn("&amp;middot;", letter)
        self.assertNotIn("&amp;mdash;", letter)


if __name__ == "__main__":
    unittest.main()
