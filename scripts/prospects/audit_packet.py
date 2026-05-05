"""
audit_packet.py — Print-ready first-touch direct-mail packets per prospect.

Top-N highest-severity dental rows from website_prospects (audited,
not_contacted, with a mailing address) → one self-contained 2-page HTML
file per prospect, ready to print to PDF and drop in a #10 envelope.

Voice anchors mirror scripts/voice_anchors.py + cold_email_no_price_first_touch
(memory): villain-framed (patient/revenue loss as the headline; technical
issue as evidence); NO price / cadence / retainer in this first touch — the
ask is "reply for a free written proposal." Anti-upsell beats stay in.

Every cited finding includes a "verify it yourself" line — falsifiable
claims are credible claims. Form-action URLs are re-probed live before
rendering so we never ship a packet about a leak that's been fixed since
the original audit. The audit observation date is stamped on every finding.

Pure rendering functions are unit-testable (no DB, no network):

    render_letter_html(prospect, findings, today)         -> str
    render_audit_html(prospect, findings, today)          -> str
    render_packet_html(prospect, findings, today)         -> str   (both pages, page-break)
    render_envelope_text(prospect)                        -> str
    render_followup_dm(prospect, findings)                -> str
    build_findings(prospect, revalidated_issues, today)   -> list[Finding]

CLI:

    python -m prospects.audit_packet --top 5 [--tier upstate] [--out ./out/audit_packets]
    python -m prospects.audit_packet --place-id <id> [--out ...]
    python -m prospects.audit_packet --no-revalidate          # trust DB row, skip live re-probes
"""

from __future__ import annotations

import argparse
import html as _html
import logging
import os
import re
import sys
import time
from dataclasses import dataclass
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Optional
from urllib.parse import urlparse

import requests
from dotenv import load_dotenv

import sys as _sys
_sys.path.insert(0, str(Path(__file__).parent.parent))

from prospects.message_draft import _first_name, _hostname  # noqa: E402

load_dotenv(Path(__file__).parent.parent.parent / ".env.local")

_log = logging.getLogger(__name__)

# Tier 1 = drive-radius for Saturday-morning mail drops + in-person follow-ups.
TIER_1_COUNTIES = ("Greenville", "Spartanburg", "Anderson", "Pickens", "Oconee")

# Same Supabase Storage bucket the audit screenshots use — public reads, service
# key writes. We key packets as {prospect_id}/packet-{ts}.html so the row
# always points at the latest version (older HTMLs stay around as artifacts).
STORAGE_BUCKET = "prospect-audits"

USER_AGENT = (
    "REBBAdvisorsBot/1.0 (+https://rebbadvisors.com/contact; "
    "audit re-verification before mail drop)"
)

# Voice anchors — mirror live homepage. Bumped here so the file is
# self-documenting; canonical source is scripts/voice_anchors.py.
VILLAIN_PUNCH = "Every silent bounce takes the whole arc."
PROOF_FRAME = "The proposal is the product."
SAMPLE_PROPOSAL_URL = "rebbadvisors.com/sample-proposal"

# Sender block. ROD_PHONE / NOTIFICATION_EMAIL / SENDER_NAME defaults match
# the rest of the repo; override via env if needed.
SENDER_NAME = os.getenv("PACKET_SENDER_NAME", "Alex Steryous")
SENDER_EMAIL = os.getenv("NOTIFICATION_EMAIL", "alex@rebbadvisors.com")
SENDER_PHONE = os.getenv("PACKET_SENDER_PHONE", "")  # e.g. "(864) 555-0142"
SENDER_RETURN_ADDRESS = os.getenv(
    "PACKET_SENDER_RETURN_ADDRESS",
    "REBB Advisors\nGreenville, SC",
)


# ── Models ──────────────────────────────────────────────────────────────────

@dataclass
class Finding:
    """One audited issue rendered into the packet.

    Each finding is a complete "claim + evidence + reproduction" unit.
    The headline is the *villain framing* (patients/revenue lost); the
    evidence is the technical mechanism with a citable URL and observed
    value; the verify line is the dentist's reproduction recipe.
    """
    severity: str          # 'critical' | 'high' | 'medium' | 'low'
    headline: str          # patient/revenue-framed headline
    evidence: str          # what we observed + URL + status
    verify: str            # dentist-reproducible test
    impact: str            # one-sentence: who walks away
    observed_on: str       # ISO date string


SEVERITY_ORDER = {"critical": 0, "high": 1, "medium": 2, "low": 3}
SEVERITY_DOT = {
    "critical": ("#dc2626", "Critical"),
    "high":     ("#d97706", "High"),
    "medium":   ("#ca8a04", "Medium"),
    "low":      ("#6b7280", "Low"),
}


# ── Live re-verification (HTTP only — no Playwright) ────────────────────────

def revalidate_issues(prospect: dict, *, do_network: bool = True) -> dict:
    """Return a copy of prospect['issues'] with HTTP-verifiable fields
    re-probed against the live site. Conservative: a finding is dropped from
    the returned dict only when the live response *contradicts* it. If we
    can't reach the site or can't reproduce the test cleanly, we keep the
    audited finding.

    No Playwright here on purpose — re-rendering each site is slow, and the
    JS-dependent detectors (viewport, stale_copyright via document.write)
    have to be trusted from the original audit anyway. The fields we CAN
    re-probe cheaply (HTTPS scheme on final URL, form-action 404/410) get
    re-verified so we don't ship a packet about a fixed form.
    """
    issues = dict(prospect.get("issues") or {})
    if not do_network:
        return issues

    site = prospect.get("website_url")

    # 1. HTTPS claim — falsifiability problem: the detector flags `no_https`
    #    when the saved URL's final landing is HTTP, but modern Chrome's
    #    HTTPS-First Mode silently upgrades any `http://host` the dentist
    #    types in the address bar, so they would not see the "Not Secure"
    #    warning we're claiming. The conservative call: drop the claim
    #    whenever the HTTPS variant of the host responds at all — at that
    #    point real-world patient impact is near zero on modern clients.
    if site and issues.get("no_https"):
        host = urlparse(site).netloc
        if host:
            for candidate in (f"https://{host}", f"https://www.{host.lstrip('www.')}"):
                try:
                    r = requests.head(
                        candidate, headers={"User-Agent": USER_AGENT},
                        timeout=10, allow_redirects=True,
                    )
                    if r.status_code < 500 and urlparse(r.url).scheme == "https":
                        _log.info(
                            "[%s] no_https revalidated FALSE — HTTPS variant "
                            "of host responds %s, modern Chrome will auto-upgrade",
                            prospect.get("business_name"), r.status_code,
                        )
                        issues["no_https"] = False
                        break
                except requests.RequestException:
                    continue

    # 2. Forms unreachable — re-probe the stored action URL.
    if issues.get("forms_unreachable") and issues.get("forms_unreachable_action"):
        action = issues["forms_unreachable_action"]
        try:
            r = requests.get(
                action, headers={"User-Agent": USER_AGENT},
                timeout=10, allow_redirects=True,
            )
            if r.status_code not in (404, 410):
                _log.info(
                    "[%s] forms_unreachable revalidated %s on %s — dropping",
                    prospect.get("business_name"), r.status_code, action,
                )
                issues["forms_unreachable"] = False
        except requests.RequestException:
            pass

    return issues


# ── Findings construction (pure) ────────────────────────────────────────────

def _audit_date_iso(prospect: dict, today: date) -> str:
    """Best-effort observation date. Falls back to today() so a freshly-pulled
    row never claims a stale date. ISO 'YYYY-MM-DD'."""
    raw = prospect.get("audited_at") or prospect.get("created_at")
    if raw:
        try:
            return str(raw)[:10]
        except Exception:
            pass
    return today.isoformat()


def build_findings(prospect: dict, issues: dict, today: date) -> list[Finding]:
    """Translate the issues dict into print-ready Finding rows, severity-sorted.

    Mirrors detectors.py severity weights but expresses each finding in the
    site's villain voice (revenue/patient loss, never bare mechanism). Caps
    at top 4 so the audit page doesn't read as a wall.
    """
    site = prospect.get("website_url") or ""
    host = _hostname(site) or "your site"
    audit_status = prospect.get("audit_status") or ""
    observed = _audit_date_iso(prospect, today)
    findings: list[Finding] = []

    # 0. No website at all — single-finding packet, special framing.
    if audit_status == "no_website" or not site:
        findings.append(Finding(
            severity="critical",
            headline="A new patient searches for you on a phone — and finds nobody home.",
            evidence=(
                "About half of new dental searches start on Google. When the "
                "result has no website, most patients tap the next pin. They "
                "don't call the practice with no link."
            ),
            verify=(
                f"Open Google on a phone. Search '{prospect.get('business_name','your practice')} "
                f"{prospect.get('city','') or 'Greenville'} SC.' "
                "Look for a website link on your listing — there isn't one."
            ),
            impact=(
                "Every visit you'd have earned, every recall they'd have shown "
                "up for, every family member they'd have brought in — you "
                "never meet any of them."
            ),
            observed_on=observed,
        ))
        return findings

    # 1. Forms unreachable — usually the most acute leak.
    if issues.get("forms_unreachable"):
        page = issues.get("forms_unreachable_page") or site
        action = issues.get("forms_unreachable_action") or "(form action URL)"
        status = issues.get("forms_unreachable_status")
        page_path = urlparse(page).path or "/"
        status_clause = f"HTTP {status}" if status else "a dead endpoint"
        findings.append(Finding(
            severity="critical",
            headline="Patients fill out your contact form, hit send, and you never see the message.",
            evidence=(
                f"The contact form on {host}{page_path} posts to "
                f"{action}, which returns {status_clause}. Submissions "
                "silently drop."
            ),
            verify=(
                f"Go to {host}{page_path}, fill out the form with anything, "
                "and submit it. Then check your practice email. Nothing "
                "arrives because the endpoint doesn't exist."
            ),
            impact=(
                "Most patients don't try a second time. They scroll back and "
                "book the next dentist. You never know they tried."
            ),
            observed_on=observed,
        ))

    # 2. Mobile broken — viewport missing.
    if issues.get("viewport_missing"):
        findings.append(Finding(
            severity="critical",
            headline="Your site is unreadable on a phone. About 70% of new-patient searches start there.",
            evidence=(
                f"The HTML for {host} has no <meta name=\"viewport\"> tag. "
                "Phones render the desktop layout pinch-zoomed — text is "
                "microscopic, buttons are off-screen."
            ),
            verify=(
                f"Pull {host} up on your phone. Don't pinch to zoom. Try to "
                "read your services or tap a phone number. Note how long "
                "before your hand moves to swipe back."
            ),
            impact=(
                "Most patients bounce in two seconds. The mobile bounce never "
                "shows up in your inbox — it's the call that never came."
            ),
            observed_on=observed,
        ))

    # 3. No HTTPS — first-impression killer.
    if issues.get("no_https"):
        findings.append(Finding(
            severity="critical",
            headline="Chrome shows your site as 'Not Secure' to every patient who visits.",
            evidence=(
                f"{host} doesn't redirect HTTP traffic to HTTPS. The browser "
                "displays a warning bar before any patient reads the page."
            ),
            verify=(
                f"Visit http://{host} in Chrome on any device. Look at the "
                "address bar — 'Not Secure' next to the URL."
            ),
            impact=(
                "First-impression revenue gone before they read your name. "
                "Patients don't research the warning — they just leave."
            ),
            observed_on=observed,
        ))

    # 4. Lighthouse low — slow site = lost click.
    lh = prospect.get("lighthouse_mobile_score")
    if lh is None:
        lh = issues.get("lighthouse_mobile")
    if lh is not None and lh < 40:
        if lh < 20:
            sev = "critical"
        else:
            sev = "high"
        findings.append(Finding(
            severity=sev,
            headline="Your site is too slow to hold a patient's attention.",
            evidence=(
                f"Google PageSpeed Insights returned a mobile performance "
                f"score of {lh}/100 for {host}. The patient on a phone "
                "watches a blank screen for several seconds."
            ),
            verify=(
                "Go to pagespeed.web.dev, paste your URL, run the mobile "
                f"test. The score for {host} comes back at {lh}."
            ),
            impact=(
                "Patients bail on a slow load around three seconds. The "
                "click is lost before they ever read your name."
            ),
            observed_on=observed,
        ))

    # 5. Mixed content — security warning for HTTPS sites loading HTTP assets.
    if issues.get("mixed_content"):
        findings.append(Finding(
            severity="medium",
            headline="Some assets load over insecure HTTP, breaking the lock icon.",
            evidence=(
                f"{host} is served over HTTPS but loads scripts/images over "
                "plain HTTP. Modern browsers either block the resource or "
                "warn the patient."
            ),
            verify=(
                f"Open {host} in Chrome on a phone or tablet. The browser "
                "either replaces the lock icon with a warning triangle or "
                "shows the page partially blank."
            ),
            impact=(
                "Patients on managed networks (school, hospital, corporate "
                "Wi-Fi) often see the page broken or blocked entirely."
            ),
            observed_on=observed,
        ))

    # 6. Stale copyright — cheap trust leak, easy verify.
    stale = issues.get("stale_copyright")
    if stale:
        findings.append(Finding(
            severity="low",
            headline=f"Your footer reads {stale}. To a new patient that means 'closed.'",
            evidence=(
                f"The copyright line in {host}'s footer says {stale}. Most "
                "patients don't read it consciously — they get the same "
                "instinct as a dusty lobby."
            ),
            verify=(
                f"Open {host} on any device. Scroll to the bottom. The year "
                f"says {stale}."
            ),
            impact=(
                "They wonder if anyone's still there. Some leave to check "
                "your hours. Most just leave."
            ),
            observed_on=observed,
        ))

    # Cap at 4 — more than that and it stops reading as concrete leaks and
    # starts reading as a list. The proposal goes deeper.
    findings.sort(key=lambda f: SEVERITY_ORDER.get(f.severity, 9))
    return findings[:4]


# ── HTML rendering (pure) ───────────────────────────────────────────────────

def _esc(s: Optional[str]) -> str:
    return _html.escape(s or "", quote=True)


# Tokens that mean the captured "decision_maker_name" is actually a company,
# insurer, or institution — not a real person. The contact extractor sometimes
# pulls these from page footers ("Physicians Mutual / Principal", "Delta Dental
# / Provider"). Treat any name containing one of these as missing — we'd
# rather address an envelope to "Owner / Practice Manager" than fabricate
# "Dr. Mutual." Match is whole-word, case-insensitive.
_COMPANY_NAME_TOKENS = (
    "mutual", "insurance", "insurer", "bank", "trust", "trustee",
    "associates", "partners", "holdings", "ventures", "capital",
    "corporation", "corp", "incorporated", "inc", "llc", "lp", "plc",
    "company", "co.", "group", "agency", "foundation", "estate",
    "principal",   # job title leaks through as a name token
)


def _looks_like_real_person_name(name: Optional[str]) -> bool:
    """True when the captured decision_maker_name is plausibly a person.

    False when it contains a token we recognize as a company / institution
    /role marker, or when it has no alphabetic tokens at all. The bar is
    deliberately conservative — fabricating 'Dr. Mutual' on an envelope
    torches credibility instantly, and we only want a Dr.-Lastname greeting
    when we are confident the lastname IS a lastname."""
    if not name or not name.strip():
        return False
    bare = name.lower()
    # Whole-word match — "Inc" should fire but "Incoming" should not.
    for tok in _COMPANY_NAME_TOKENS:
        # Allow trailing punctuation like "Inc." by anchoring on word boundary.
        if re.search(rf"\b{re.escape(tok.rstrip('.'))}\b\.?", bare):
            return False
    # At least one alpha-only token of length >= 2 must remain after stripping
    # honorifics — otherwise it's noise like "DDS" or "Dr. -".
    cleaned = re.sub(r"\b(Dr\.?|Mr\.?|Mrs\.?|Ms\.?|DDS|DMD|MD|Esq\.?)\b\.?",
                     "", name, flags=re.I)
    tokens = re.findall(r"[A-Za-z][A-Za-z'\-]+", cleaned)
    return any(len(t) >= 2 for t in tokens)


def _display_practice_name(prospect: dict) -> str:
    """Practice name, lightly normalized for display. Some Google Places
    rows come in fully lowercase ('westside dentistry'); title-case those.
    Leaves properly-cased names ('Cannon Park Dental') alone — applying
    .title() unconditionally would mangle 'Dr.' → 'Dr.' (fine) but also
    things like 'O'Brien' on edge cases."""
    name = prospect.get("business_name") or "your practice"
    if name == name.lower():
        return name.title()
    return name


def _practice_greeting_name(prospect: dict) -> str:
    """The H1 salutation — 'Dr. Smith,' / 'Hello,'. We never fabricate a
    last name. When no real person name is on file, fall back to the bare
    'Hello,' rather than 'the team at X' (reads as a label, not a greeting)."""
    name = prospect.get("decision_maker_name") or ""
    if not _looks_like_real_person_name(name):
        return "Hello"
    # Strip honorifics, take last token as last name; "Dr. {Last}" reads well
    # for a cold first-touch even without verifying credentials.
    bare = re.sub(r"\b(Dr\.?|Mr\.?|Mrs\.?|Ms\.?|DDS|DMD|MD)\b\.?", "", name, flags=re.I).strip()
    parts = [p for p in re.split(r"\s+", bare) if p]
    if not parts:
        return name.strip()
    last = parts[-1]
    return f"Dr. {last}"


def _recipient_label(prospect: dict) -> str:
    """The bold first line in the recipient block AND the envelope TO line.
    Distinct from the greeting because the recipient block is a label
    ('Owner / Practice Manager') while the greeting is a salutation
    ('Hello,'). Decoupling them lets the no-name case read as plain
    correspondence instead of awkwardly addressing 'the team at lowercase practice'."""
    name = prospect.get("decision_maker_name") or ""
    title = prospect.get("decision_maker_title") or ""
    if not _looks_like_real_person_name(name):
        return "Owner / Practice Manager"
    if title and re.search(r"\bDr\b", title, re.I):
        return f"Dr. {name.strip()}"
    if title:
        return f"{name} ({title})"
    return name.strip()


def _format_long_date(d: date) -> str:
    """Portable 'May 3, 2026' (no leading zero on day) — strftime '%-d' is
    POSIX-only and '%#d' is Windows-only, so we do it by hand."""
    return f"{d.strftime('%B')} {d.day}, {d.year}"


def _shared_page_css() -> str:
    """One CSS block reused across letter + audit + index. Print-optimized:
    8.5x11 paper, ~0.75in margins, conservative type scale, no color logos —
    a B&W home printer should produce something that reads as correspondence,
    not a marketing flyer."""
    return """
        @page { size: letter; margin: 0.75in; }
        :root { color-scheme: light; }
        * { box-sizing: border-box; }
        html, body {
            font-family: 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif;
            color: #111;
            background: #fff;
            font-size: 11.5pt;
            line-height: 1.55;
            margin: 0;
        }
        .sheet {
            max-width: 7.0in;
            margin: 0 auto;
            padding: 0.25in 0;
            page-break-after: always;
        }
        .sheet:last-of-type { page-break-after: auto; }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            border-bottom: 1px solid #111;
            padding-bottom: 6pt;
            margin-bottom: 18pt;
        }
        .brand { font-weight: 700; letter-spacing: 0.04em; }
        .meta  { font-size: 9.5pt; color: #555; }
        .recipient { margin: 22pt 0 18pt; }
        h1 { font-size: 14pt; margin: 0 0 6pt; letter-spacing: -0.01em; }
        h2 { font-size: 11.5pt; margin: 18pt 0 4pt; letter-spacing: 0.02em; text-transform: uppercase; }
        p  { margin: 0 0 9pt; }
        .lede { font-size: 12pt; }
        .signoff { margin-top: 22pt; }
        .signature {
            font-family: 'Brush Script MT', 'Lucida Handwriting', cursive;
            font-size: 18pt;
            line-height: 1;
            margin: 0 0 4pt;
        }
        .findings { margin-top: 6pt; }
        .finding {
            border-top: 1px solid #ddd;
            padding: 10pt 0 6pt;
            page-break-inside: avoid;
        }
        .finding:first-child { border-top: none; padding-top: 0; }
        .sev {
            display: inline-block;
            font-size: 9pt;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            padding: 1pt 6pt;
            border: 1px solid currentColor;
            border-radius: 2pt;
            margin-right: 8pt;
            vertical-align: 2pt;
        }
        .finding h3 { font-size: 12pt; margin: 0 0 4pt; }
        .finding .evidence,
        .finding .verify,
        .finding .impact { font-size: 10.5pt; }
        .finding .verify { color: #444; font-style: italic; }
        .finding .observed { font-size: 8.5pt; color: #888; margin-top: 2pt; }
        .pullquote {
            border-left: 3px solid #111;
            padding: 4pt 0 4pt 14pt;
            font-style: italic;
            margin: 14pt 0;
            color: #333;
        }
        .closing {
            margin-top: 18pt;
            font-size: 10pt;
            color: #333;
        }
        .ps { margin-top: 14pt; font-size: 10.5pt; color: #333; }
    """


def render_letter_html(prospect: dict, findings: list[Finding], today: date) -> str:
    """Page 1 — the cover letter. ~220 words, founder voice, villain framing,
    no price, anti-upsell beats, single ask: reply for a free written proposal."""
    practice_display = _esc(_display_practice_name(prospect))
    city = _esc(prospect.get("city") or "town")
    host_raw = _hostname(prospect.get("website_url"))
    host = _esc(host_raw) if host_raw else None
    rating = prospect.get("google_rating")
    reviews = prospect.get("google_review_count") or 0
    reputation_clause = ""
    try:
        if rating is not None and float(rating) >= 4.0 and int(reviews) >= 10:
            reputation_clause = (
                f"Your {float(rating):.1f}-star reviews across "
                f"{int(reviews)} patients say so."
            )
    except (TypeError, ValueError):
        pass

    addr_block = _format_address_block(prospect)
    recipient = _esc(_recipient_label(prospect))
    greet = _esc(_practice_greeting_name(prospect))
    n_leaks = len(findings)
    if n_leaks == 0:
        leak_count_clause = "audit"
    elif n_leaks == 1:
        leak_count_clause = "leak"
    else:
        leak_count_clause = f"{n_leaks} leaks"

    # No-website prospects need different framing in the lede — there is no
    # site for me to have audited, only a Google search that turned up no
    # link. Saying "I ran an audit of your site" reads false to anyone who
    # checks (and the dentist will).
    audited_on = _esc(_audit_date_iso(prospect, today))
    no_site = (prospect.get("audit_status") == "no_website") or not host_raw
    if no_site:
        lede_third = (
            f"On {audited_on}, I went looking for {practice_display}&rsquo;s "
            "website on Google. There isn&rsquo;t one &mdash; or at least "
            "Google doesn&rsquo;t connect your listing to one. The detail "
            "is on the next page, with the exact search you can run yourself "
            "in thirty seconds."
        )
    else:
        leak_count_word = "thing" if n_leaks == 1 else "things"
        lede_third = (
            f"I ran a free audit of {host} on {audited_on}. Found "
            f"{n_leaks} {leak_count_word} quietly costing you new patients. "
            "The audit is on the next page. Every claim cites the page and "
            "the test, so you can verify it yourself in two minutes."
        )

    # Tight word count is deliberate — dentists scan; a 600-word letter
    # reads as marketing, a ~220-word letter reads as correspondence.
    body_paragraphs = [
        f"You're a great dentist. {reputation_clause}".strip(),
        (
            f"But on a phone, at 9pm, when someone in {city} searches "
            "&ldquo;dentist near me&rdquo; and taps your pin first &mdash; "
            + ("your practice may not even appear." if no_site else
               "your website may be losing them before they ever read your name.")
        ),
        lede_third,
        (
            "If you want a written proposal &mdash; what to fix, what it "
            "costs, what it doesn&rsquo;t &mdash; reply to this letter or "
            "email me. Free. One day. No call required."
        ),
    ]
    body_html = "\n".join(f"        <p>{p}</p>" for p in body_paragraphs)

    sender_phone_line = (
        f'<div>{_esc(SENDER_PHONE)}</div>' if SENDER_PHONE else ""
    )

    return f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<title>Letter — {practice_display}</title>
<style>{_shared_page_css()}</style>
</head><body>
<section class="sheet">
    <div class="header">
        <div class="brand">REBB Advisors</div>
        <div class="meta">{_esc(SENDER_RETURN_ADDRESS.replace(chr(10), ' · '))}</div>
    </div>

    <div class="meta">{_esc(_format_long_date(today))}</div>

    <div class="recipient">
        <div><strong>{recipient}</strong></div>
        <div>{practice_display}</div>
        {addr_block}
    </div>

    <h1>{greet},</h1>

{body_html}

    <div class="signoff">
        <div class="signature">{_esc(SENDER_NAME.split()[0] if SENDER_NAME else 'Alex')}</div>
        <div><strong>{_esc(SENDER_NAME)}</strong></div>
        <div>REBB Advisors</div>
        <div>{_esc(SENDER_EMAIL)}</div>
        {sender_phone_line}
    </div>

    <div class="ps">
        <strong>P.S.</strong> A sanitized example of the written proposal
        lives at {_esc(SAMPLE_PROPOSAL_URL)} &mdash; if the format helps you
        decide whether the real one is worth requesting. The {leak_count_clause}
        and the verify-it-yourself recipe for each are on the next page.
    </div>
</section>
</body></html>"""


def render_audit_html(prospect: dict, findings: list[Finding], today: date) -> str:
    """Page 2 — the findings sheet. Severity-sorted, every claim falsifiable."""
    practice = _esc(_display_practice_name(prospect))
    host = _esc(_hostname(prospect.get("website_url")) or "your site")
    audit_date = _esc(_audit_date_iso(prospect, today))

    findings_html = ""
    if not findings:
        findings_html = (
            "<p>The original audit flagged issues that have since been "
            "resolved on the live site. Nice work. If you want a deeper "
            "look, the offer to send a written proposal still stands.</p>"
        )
    else:
        rows = []
        for f in findings:
            color, label = SEVERITY_DOT.get(f.severity, SEVERITY_DOT["medium"])
            rows.append(f"""
        <div class="finding">
            <span class="sev" style="color:{color}">{_esc(label)}</span>
            <h3>{_esc(f.headline)}</h3>
            <p class="evidence">{_esc(f.evidence)}</p>
            <p class="verify"><strong>Verify it yourself:</strong> {_esc(f.verify)}</p>
            <p class="impact">{_esc(f.impact)}</p>
            <p class="observed">Observed {_esc(f.observed_on)}.</p>
        </div>""")
        findings_html = "\n".join(rows)

    return f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<title>Audit — {practice}</title>
<style>{_shared_page_css()}</style>
</head><body>
<section class="sheet">
    <div class="header">
        <div class="brand">Audit &mdash; {practice}</div>
        <div class="meta">{host} &middot; reviewed {audit_date}</div>
    </div>

    <div class="pullquote">
        What walks away from a five-star practice with a leaky website
        isn&rsquo;t one cleaning. It&rsquo;s years of recall, the family
        they&rsquo;d have brought, and the case you&rsquo;d have caught a
        year in. {_esc(VILLAIN_PUNCH)}
    </div>

    <div class="findings">
{findings_html}
    </div>

    <div class="closing">
        <p><strong>{_esc(PROOF_FRAME)}</strong> If a one-hour cleanup fixes
        this, that&rsquo;s what the proposal will say. If a scoped rebuild
        is the honest answer, that&rsquo;ll be in there too &mdash; with the
        number, the timeline, and what it doesn&rsquo;t include. Reply or
        email {_esc(SENDER_EMAIL)} to get yours. Free, one day,
        no call required.</p>
        <p style="color:#888; font-size:9pt; margin-top:14pt">
            REBB Advisors &middot; Greenville, SC &middot; {_esc(SENDER_EMAIL)}
        </p>
    </div>
</section>
</body></html>"""


def render_packet_html(prospect: dict, findings: list[Finding], today: date) -> str:
    """One self-contained 2-page HTML — print to PDF and the cover letter +
    audit findings end up in the same envelope without juggling files."""
    letter = render_letter_html(prospect, findings, today)
    audit  = render_audit_html(prospect, findings, today)
    # Splice the two <section class="sheet"> blocks into one document.
    letter_body = _extract_body(letter)
    audit_body  = _extract_body(audit)
    practice = _esc(_display_practice_name(prospect))
    return f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<title>{practice} &mdash; REBB audit packet</title>
<style>{_shared_page_css()}</style>
</head><body>
{letter_body}
{audit_body}
</body></html>"""


def _extract_body(doc: str) -> str:
    """Strip everything outside <body>...</body>. Tolerates absent body
    tags by returning the input unchanged — better to render too much than
    to silently drop content."""
    m = re.search(r"<body[^>]*>(.*)</body>", doc, re.S | re.I)
    return m.group(1).strip() if m else doc


def _split_us_address(formatted: Optional[str]) -> tuple[str, str]:
    """Parse a Google formattedAddress into (street_line, city_state_zip).

    The trailing two comma-separated tokens are always (city, state+zip);
    everything before them is the street. This handles inline commas in
    the street ('112 1/2, Ashley Ave, Charleston, SC 29401') without
    mis-splitting them across the two output lines.

    Drops the 'USA' / 'United States' country suffix because US-domestic
    mail doesn't need it. Returns the original string in `street` and an
    empty `csz` whenever the format isn't recognizable enough — we'd
    rather print a slightly long single line than silently drop part of
    the address.
    """
    if not formatted:
        return "", ""
    parts = [p.strip() for p in formatted.split(",") if p.strip()]
    if parts and parts[-1].upper() in ("USA", "UNITED STATES"):
        parts = parts[:-1]
    if len(parts) >= 3:
        # Last two are city + state/zip; everything before is the street.
        street = ", ".join(parts[:-2])
        city_state_zip = f"{parts[-2]}, {parts[-1]}"
        return street, city_state_zip
    if len(parts) == 2:
        return parts[0], parts[1]
    return formatted, ""


def _format_address_block(prospect: dict) -> str:
    """Render the recipient address lines under the practice name. Splits the
    Google-formatted address into a street line + city/state/zip line so the
    block reads as standard US business correspondence — never duplicates the
    city, never trails 'USA'."""
    address = prospect.get("address") or ""
    if not address:
        return ""
    street, csz = _split_us_address(address)
    parts = []
    if street:
        parts.append(f"<div>{_esc(street)}</div>")
    if csz:
        parts.append(f"<div>{_esc(csz)}</div>")
    return "\n        ".join(parts)


# ── Envelope + follow-up sidecars ───────────────────────────────────────────

def render_envelope_text(prospect: dict) -> str:
    """Plain-text envelope copy. The user hand-writes the address block from
    this so a printed label doesn't kill the 'this is correspondence' read."""
    line1 = _recipient_label(prospect)
    practice = _display_practice_name(prospect)
    street, csz = _split_us_address(prospect.get("address") or "")

    lines = [
        "TO:",
        line1,
        practice,
    ]
    if street:
        lines.append(street)
    if csz:
        lines.append(csz)
    lines += [
        "",
        "FROM:",
        SENDER_RETURN_ADDRESS,
        "",
        "HAND-WRITE under the address:",
        "Personal & Confidential",
    ]
    return "\n".join(lines)


def render_followup_dm(prospect: dict, findings: list[Finding]) -> str:
    """Tuesday FB Messenger follow-up that references the mailed packet —
    converts a cold DM into a follow-up, which is the whole point of stacking
    mail before the digital touch."""
    first = _first_name(prospect.get("decision_maker_name")) or ""
    practice = _display_practice_name(prospect)
    leak_count = len(findings)
    if leak_count == 0:
        leak_phrase = "a quick audit"
    elif leak_count == 1:
        leak_phrase = "one thing I think is costing you patients"
    else:
        leak_phrase = f"{leak_count} things I think are costing you patients"
    greeting = f"Hello {first}," if first else "Hello,"
    return (
        f"{greeting}\n\n"
        f"Dropped a letter at {practice} this week — flagged {leak_phrase}. "
        "Wanted to make sure it landed and didn't get tossed with the mail.\n\n"
        "If you'd rather skip the paper, I can send the same audit + "
        "written proposal by email. Free, one day, no call required.\n\n"
        "-Alex"
    )


# ── Supabase fetch ──────────────────────────────────────────────────────────

def _sb():
    from supabase import create_client
    url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")
    if not url or not key:
        _log.error("SUPABASE_URL / SUPABASE_SERVICE_KEY missing in .env.local")
        sys.exit(1)
    return create_client(url, key)


_PACKET_FIELDS = (
    "id, place_id, business_name, vertical, address, city, county, phone, "
    "website_url, google_rating, google_review_count, audit_status, issues, "
    "severity_score, severity_tag, mobile_screenshot_url, "
    "lighthouse_mobile_score, primary_email, fallback_email, "
    "decision_maker_name, decision_maker_title, contact_status, "
    "emailed_at, facebook_url, audited_at, created_at, "
    "packet_html_url, packet_envelope_text, packet_generated_at, "
    "packet_emailed_at"
)


def upload_packet(
    sb,
    prospect_id: str,
    packet_html: str,
    envelope_text: str,
) -> Optional[str]:
    """Upload packet HTML to Supabase Storage, persist URL + envelope on the
    prospect row. Returns the public URL or None on failure.

    Mirrors audit._upload_screenshot — same bucket, same upsert behavior. The
    row update is idempotent: re-running on the same prospect just overwrites
    packet_html_url with the latest timestamped path.
    """
    ts = int(time.time())
    path = f"{prospect_id}/packet-{ts}.html"
    try:
        sb.storage.from_(STORAGE_BUCKET).upload(
            path,
            packet_html.encode("utf-8"),
            {"content-type": "text/html; charset=utf-8", "upsert": "true"},
        )
        url = sb.storage.from_(STORAGE_BUCKET).get_public_url(path)
    except Exception as e:
        _log.warning("packet upload failed (%s): %s", prospect_id, e)
        return None

    try:
        sb.table("website_prospects").update({
            "packet_html_url": url,
            "packet_envelope_text": envelope_text,
            "packet_generated_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", prospect_id).execute()
    except Exception as e:
        # Storage upload succeeded but DB write didn't — log loud, return URL
        # anyway so the caller knows the artifact exists.
        _log.error("packet row update failed (%s): %s", prospect_id, e)

    return url


# ── Daily packet email (one-per-day "go print this" trigger) ────────────────

def send_daily_packet(sb) -> Optional[dict]:
    """Pick the highest-severity dental prospect with a generated packet that
    hasn't yet been emailed-to-print, send the envelope text + a link to the
    packet HTML, and stamp packet_emailed_at so tomorrow's run skips it.

    Returns a small report dict on send, or None if the queue is empty.

    Design note: this is intentionally a single-row send rather than a batch
    digest. The user prints one packet per day, sticks it in an envelope, mails
    it. Sending five at once produces a backlog; sending one keeps the channel
    paced. Severity-desc ordering means the worst-broken practices get the
    physical mail first.
    """
    rows = (
        sb.table("website_prospects")
        .select(
            "id, place_id, business_name, vertical, address, city, county, "
            "website_url, decision_maker_name, decision_maker_title, "
            "severity_score, severity_tag, packet_html_url, "
            "packet_envelope_text, packet_generated_at"
        )
        .eq("vertical", "dental")
        .is_("packet_emailed_at", "null")
        .not_.is_("packet_html_url", "null")
        .order("severity_score", desc=True)
        .limit(1)
        .execute()
        .data
    ) or []

    if not rows:
        return None

    row = rows[0]
    html = _render_daily_email_html(row)
    subject = (
        f"Print today: {row.get('business_name')} "
        f"({row.get('city') or 'unknown city'}, "
        f"sev {row.get('severity_score') or '—'})"
    )

    key = os.getenv("RESEND_API_KEY")
    notify = os.getenv("NOTIFICATION_EMAIL", "alex@rebbadvisors.com")
    mail_from = os.getenv("MAIL_FROM", "REBB Advisors <noreply@rebbadvisors.com>")
    if not key:
        _log.error("RESEND_API_KEY not set — cannot send daily packet")
        return None

    resp = requests.post(
        "https://api.resend.com/emails",
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        json={"from": mail_from, "to": [notify], "subject": subject, "html": html},
        timeout=15,
    )
    if resp.status_code not in (200, 201):
        _log.error("Resend error %s: %s", resp.status_code, resp.text)
        return None

    sb.table("website_prospects").update({
        "packet_emailed_at": datetime.now(timezone.utc).isoformat(),
    }).eq("id", row["id"]).execute()

    return {
        "business_name": row.get("business_name"),
        "severity_score": row.get("severity_score"),
        "packet_url": row.get("packet_html_url"),
    }


def _render_daily_email_html(row: dict) -> str:
    """Tiny one-row email — link to the packet, the envelope text inline so
    the user can hand-write the address from their phone if they're away from
    a printer. Voice tracks the rest of the dashboard chrome (terse, no
    decoration), not the marketing site.

    The packet link points at the dashboard proxy route, NOT the raw Supabase
    Storage URL — Supabase serves stored HTML as text/plain with a sandboxing
    CSP (anti-XSS), so the storage URL renders as raw source in a browser tab.
    The proxy route re-serves with text/html for a clickable inbox experience.
    """
    name = _esc(row.get("business_name") or "Prospect")
    city = _esc(row.get("city") or "")
    addr = _esc(row.get("address") or "—")
    sev = row.get("severity_score") or "—"
    tag = _esc(row.get("severity_tag") or "")
    site = row.get("website_url") or ""
    site_link = (
        f'<a href="{_esc(site)}" style="color:#1f7d4e">{_esc(_hostname(site) or site)}</a>'
        if site else "<em>no website</em>"
    )
    site_origin = os.getenv("NEXT_PUBLIC_SITE_URL", "https://rebbadvisors.com").rstrip("/")
    packet_url = (
        f"{site_origin}/dashboard/prospects/{_esc(row.get('id') or '')}/packet"
        if row.get("id") else _esc(row.get("packet_html_url") or "")
    )
    envelope = _esc(row.get("packet_envelope_text") or "").replace("\n", "<br>")
    dashboard = f"{site_origin}/dashboard/prospects"

    return f"""<!DOCTYPE html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111;max-width:600px;margin:0 auto;padding:24px">
  <h1 style="font-size:20px;margin:0 0 8px">{name}</h1>
  <p style="font-size:13px;color:#555;margin:0 0 20px">
    {city} · severity {sev}{f" {tag}" if tag else ""} · {site_link}
  </p>
  <p style="font-size:14px;margin:0 0 16px">
    <a href="{packet_url}" style="display:inline-block;background:#1f7d4e;color:#fff;text-decoration:none;padding:10px 16px;border-radius:4px;font-weight:600">Open packet ↗</a>
    &nbsp;
    <a href="{dashboard}" style="color:#555;font-size:13px">Dashboard</a>
  </p>
  <p style="font-size:12px;color:#777;margin:0 0 8px">Print &rarr; envelope:</p>
  <pre style="background:#f7f5ee;border:1px solid #e5e7eb;border-radius:4px;padding:14px;font-size:12.5px;line-height:1.5;white-space:pre-wrap;word-break:break-word">{envelope}</pre>
  <p style="font-size:11px;color:#aaa;margin-top:24px">
    Mailing address: {addr}.<br>
    This packet has been stamped <code>packet_emailed_at</code>; tomorrow's run picks the next one.
  </p>
</body></html>"""


def fetch_top_n(
    n: int,
    *,
    tier: str = "any",
    min_severity: int = 40,
    require_not_contacted: bool = False,
) -> list[dict]:
    """Top-N dental prospects with mailable addresses, ranked for direct mail.

    Two-pass selection because the two audit_status values produce very
    different packet experiences:

      Pass 1 — audited rows (multi-finding, often have a decision-maker
      name on file → addressable letter, several falsifiable claims).
      Severity-desc within this pool.

      Pass 2 — no_website rows (single 'they search for you and find no
      site' finding; usually no decision-maker; addressed to 'Owner /
      Practice Manager'). Used to fill remaining slots.

    Direct mail is a fresh channel relative to email/FB Messenger, so by
    default we allow already-contacted prospects through — pass
    require_not_contacted=True to enforce 'never been contacted on any
    channel.' tier='upstate' restricts to Tier-1 counties; 'any' is
    statewide (stamps don't care about drive radius).
    """
    sb = _sb()
    counties = list(TIER_1_COUNTIES) if tier == "upstate" else None

    def _pull(audit_status: str, limit: int) -> list[dict]:
        q = (
            sb.table("website_prospects")
            .select(_PACKET_FIELDS)
            .eq("vertical", "dental")
            .eq("audit_status", audit_status)
            .gte("severity_score", min_severity if audit_status == "audited" else 70)
            .order("severity_score", desc=True)
            .limit(limit)
        )
        if counties:
            q = q.in_("county", counties)
        return q.execute().data or []

    def _eligible(rows: list[dict]) -> list[dict]:
        out = []
        for r in rows:
            if not (r.get("address") or "").strip():
                continue  # can't mail a packet without a street address
            if require_not_contacted and r.get("contact_status") not in (None, "", "not_contacted"):
                continue
            out.append(r)
        return out

    audited = _eligible(_pull("audited", n * 6))
    if len(audited) >= n:
        return audited[:n]

    no_site = _eligible(_pull("no_website", n * 6))
    return (audited + no_site)[:n]


def fetch_by_place_id(place_id: str) -> Optional[dict]:
    sb = _sb()
    rows = (
        sb.table("website_prospects")
        .select(_PACKET_FIELDS)
        .eq("place_id", place_id)
        .limit(1)
        .execute()
        .data
    ) or []
    return rows[0] if rows else None


# ── Output writer ───────────────────────────────────────────────────────────

def _slugify(s: str) -> str:
    s = re.sub(r"[^A-Za-z0-9]+", "-", s.lower()).strip("-")
    return s[:50] or "prospect"


def write_packet(prospect: dict, out_dir: Path, *, do_network: bool = True,
                 today: Optional[date] = None, upload: bool = False,
                 sb=None) -> dict:
    """Render one prospect into out_dir/{slug}/, optionally uploading the
    packet HTML to Supabase Storage so the dashboard can link to it.

    Returns a small report dict so the CLI can print a summary table.
    On `upload=True` the report includes 'packet_url'; left None on failure.
    """
    today = today or date.today()
    issues = revalidate_issues(prospect, do_network=do_network)
    findings = build_findings(prospect, issues, today)

    slug = f"{prospect.get('severity_score') or 0:03d}-{_slugify(prospect.get('business_name') or 'prospect')}"
    pdir = out_dir / slug
    pdir.mkdir(parents=True, exist_ok=True)

    packet_html = render_packet_html(prospect, findings, today)
    envelope_text = render_envelope_text(prospect)

    packet_path = pdir / "packet.html"
    packet_path.write_text(packet_html, encoding="utf-8")

    (pdir / "letter.html").write_text(render_letter_html(prospect, findings, today), encoding="utf-8")
    (pdir / "audit.html").write_text(render_audit_html(prospect, findings, today), encoding="utf-8")
    (pdir / "envelope.txt").write_text(envelope_text, encoding="utf-8")
    (pdir / "followup_dm.txt").write_text(render_followup_dm(prospect, findings), encoding="utf-8")

    packet_url = None
    if upload and sb is not None and prospect.get("id"):
        packet_url = upload_packet(sb, prospect["id"], packet_html, envelope_text)

    return {
        "business_name": prospect.get("business_name"),
        "city": prospect.get("city"),
        "severity_score": prospect.get("severity_score"),
        "decision_maker_name": prospect.get("decision_maker_name"),
        "address": prospect.get("address"),
        "n_findings": len(findings),
        "out": str(packet_path),
        "packet_url": packet_url,
    }


def write_index(reports: list[dict], out_dir: Path) -> Path:
    """Print-friendly index page listing every packet for easy bulk-print."""
    rows_html = []
    for i, r in enumerate(reports, start=1):
        rows_html.append(f"""
        <tr>
            <td>{i}</td>
            <td><strong>{_esc(r.get('business_name'))}</strong></td>
            <td>{_esc(r.get('city'))}</td>
            <td>{_esc(r.get('decision_maker_name') or '—')}</td>
            <td>{r.get('severity_score') or '—'}</td>
            <td>{r.get('n_findings')}</td>
            <td><a href="{_esc(Path(r['out']).relative_to(out_dir).as_posix())}">open</a></td>
        </tr>""")
    body = "\n".join(rows_html)
    html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>REBB audit packets</title>
<style>
body {{ font-family: system-ui, sans-serif; max-width: 900px; margin: 2rem auto; padding: 0 1rem; color: #111; }}
table {{ border-collapse: collapse; width: 100%; }}
th, td {{ text-align: left; padding: 8px 10px; border-bottom: 1px solid #eee; font-size: 14px; }}
th {{ background: #fafafa; font-size: 12px; text-transform: uppercase; letter-spacing: .06em; }}
a {{ color: #1f7d4e; }}
</style></head><body>
<h1>Audit packets — {len(reports)} prospects</h1>
<p>Each packet is a 2-page HTML. Print to PDF (Cmd/Ctrl-P → Save as PDF) → drop both pages in a #10 envelope, hand-write the address block from <code>envelope.txt</code>.</p>
<table>
<thead><tr><th>#</th><th>Practice</th><th>City</th><th>Owner</th><th>Severity</th><th>Findings</th><th></th></tr></thead>
<tbody>{body}</tbody></table>
</body></html>"""
    p = out_dir / "index.html"
    p.write_text(html, encoding="utf-8")
    return p


# ── CLI ─────────────────────────────────────────────────────────────────────

def main() -> int:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(levelname)s  %(message)s",
                        datefmt="%H:%M:%S")
    ap = argparse.ArgumentParser()
    ap.add_argument("--top", type=int, default=5,
                    help="Number of prospects to render (default 5)")
    ap.add_argument("--tier", default="any", choices=["upstate", "any"],
                    help="upstate = Greenville/Spartanburg/Anderson/Pickens/Oconee; any = statewide (default — stamps don't care about drive radius)")
    ap.add_argument("--min-severity", type=int, default=40,
                    help="Minimum severity score for the audited pool (default 40 = WARM+; no_website pool ignores this)")
    ap.add_argument("--require-not-contacted", action="store_true",
                    help="Skip prospects already contacted on any channel (default OFF — direct mail is a new channel)")
    ap.add_argument("--place-id", help="Render exactly this prospect, ignoring --top")
    ap.add_argument("--out", default="./out/audit_packets",
                    help="Output directory")
    ap.add_argument("--no-revalidate", action="store_true",
                    help="Skip live re-probing (faster; trusts DB row)")
    ap.add_argument("--upload", action="store_true",
                    help="Upload each packet to Supabase Storage and stamp "
                         "packet_html_url / packet_envelope_text / "
                         "packet_generated_at on the row so /dashboard/prospects "
                         "can link to it.")
    ap.add_argument("--email", action="store_true",
                    help="After --upload (or against existing rows), email the "
                         "highest-severity packet that hasn't been mailed yet "
                         "to NOTIFICATION_EMAIL via Resend, then stamp "
                         "packet_emailed_at. The daily-packet GH Action's "
                         "main job.")
    args = ap.parse_args()

    out_dir = Path(args.out).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    sb = _sb() if (args.upload or args.email) else None

    if args.place_id:
        row = fetch_by_place_id(args.place_id)
        if not row:
            _log.error("No prospect with place_id=%s", args.place_id)
            return 1
        prospects = [row]
    else:
        prospects = fetch_top_n(
            args.top,
            tier=args.tier,
            min_severity=args.min_severity,
            require_not_contacted=args.require_not_contacted,
        )

    if not prospects and not args.email:
        _log.warning("No eligible prospects matched.")
        return 0

    if prospects:
        _log.info("Rendering %d packet(s) → %s", len(prospects), out_dir)
        reports = []
        for p in prospects:
            try:
                r = write_packet(
                    p, out_dir,
                    do_network=not args.no_revalidate,
                    upload=args.upload, sb=sb,
                )
                _log.info(" ✓ %s — %d findings → %s%s",
                          r["business_name"], r["n_findings"], r["out"],
                          f" (uploaded → {r['packet_url']})" if r.get("packet_url") else "")
                reports.append(r)
            except Exception as e:
                _log.exception("Failed for %s: %s", p.get("business_name"), e)

        if reports:
            idx = write_index(reports, out_dir)
            _log.info("Index: %s", idx)

    if args.email:
        if sb is None:
            sb = _sb()
        try:
            sent = send_daily_packet(sb)
            if sent:
                _log.info("Daily packet emailed: %s", sent)
            else:
                _log.info("Daily packet: nothing to send (queue empty)")
        except Exception as e:
            _log.exception("Daily packet email failed: %s", e)
            return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
