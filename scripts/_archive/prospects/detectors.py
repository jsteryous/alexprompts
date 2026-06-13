"""
detectors.py — Individual website-problem detectors.

Each detector is a pure function against rendered page state. Scope is narrow
on purpose: five high-confidence, low-false-positive signals that map to a
concrete fix we can pitch. Visual/UX judgments are out of scope — those need
human review.

Detectors:
  1. viewport_missing       — no <meta name="viewport">
  2. https_issues           — site doesn't redirect HTTP→HTTPS, or mixed content
  3. stale_copyright        — rendered copyright year ≥3 years behind
  4. forms_unreachable      — forms with an absolute action URL returning 404/410
  5. lighthouse_mobile      — PageSpeed Insights mobile score <40

A "detector hit" is recorded only when the signal is unambiguous. For forms
with no action / JS-only submission we record `forms_unverifiable` but do not
flag — verbosity here produces false positives that kill the pitch.

Forms policy: only HTTP 404 (Not Found) and 410 (Gone) flip `forms_unreachable`.
405 / 403 / 5xx / network errors are ambiguous (server may accept POST, IP may
be blocked, error may be transient) and get demoted to `forms_unverifiable`.
"""

from __future__ import annotations

import logging
import os
import re
import time
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
from urllib.parse import urljoin, urlparse

import requests

_log = logging.getLogger(__name__)

USER_AGENT = (
    "REBBAdvisorsBot/1.0 (+https://rebbadvisors.com/contact; "
    "website audit for local outreach)"
)
PAGESPEED_URL = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"

STALE_COPYRIGHT_THRESHOLD_YEARS = 3
LIGHTHOUSE_MOBILE_FAIL = 40


@dataclass
class AuditFindings:
    viewport_missing: bool = False
    no_https: bool = False
    mixed_content: bool = False
    stale_copyright: Optional[int] = None          # year shown on page, if stale
    forms_found: int = 0
    forms_unreachable: bool = False
    forms_unreachable_status: Optional[int] = None # 404 / 410 that triggered the flag
    forms_unreachable_action: Optional[str] = None # the dead POST target URL
    forms_unreachable_page: Optional[str] = None   # the page URL hosting the broken form
    forms_unverifiable: int = 0                    # JS-only / no-action / ambiguous
    lighthouse_mobile: Optional[int] = None        # 0-100
    jquery_version: Optional[str] = None
    errors: list[str] = field(default_factory=list)

    def any_issue(self) -> bool:
        return any([
            self.viewport_missing,
            self.no_https,
            self.mixed_content,
            self.stale_copyright is not None,
            self.forms_unreachable,
            self.lighthouse_mobile is not None and self.lighthouse_mobile < LIGHTHOUSE_MOBILE_FAIL,
        ])

    def to_jsonb(self) -> dict:
        return {
            "viewport_missing":         self.viewport_missing,
            "no_https":                 self.no_https,
            "mixed_content":            self.mixed_content,
            "stale_copyright":          self.stale_copyright,
            "forms_found":              self.forms_found,
            "forms_unreachable":        self.forms_unreachable,
            "forms_unreachable_status": self.forms_unreachable_status,
            "forms_unreachable_action": self.forms_unreachable_action,
            "forms_unreachable_page":   self.forms_unreachable_page,
            "forms_unverifiable":       self.forms_unverifiable,
            "lighthouse_mobile":        self.lighthouse_mobile,
            "jquery_version":           self.jquery_version,
        }


@dataclass
class FormsResult:
    forms_found: int = 0
    unreachable: bool = False
    unreachable_status: Optional[int] = None  # 404 / 410
    unreachable_action: Optional[str] = None  # the dead resolved URL
    unverifiable: int = 0


# ── 1. Viewport ──────────────────────────────────────────────────────────────

def detect_viewport_missing(rendered_html: str) -> bool:
    """True when no <meta name="viewport"> exists. Mobile is effectively broken."""
    return re.search(
        r'<meta[^>]+name\s*=\s*["\']viewport["\']',
        rendered_html,
        re.I,
    ) is None


# ── 2. HTTPS ─────────────────────────────────────────────────────────────────

def detect_no_https(final_url: str) -> bool:
    """True when the final landing URL is served over plain HTTP."""
    return urlparse(final_url).scheme != "https"


def detect_mixed_content(rendered_html: str, final_url: str) -> bool:
    """
    True when an HTTPS page references http:// subresources (script/img/link/iframe).
    Only relevant when the main page is HTTPS.
    """
    if urlparse(final_url).scheme != "https":
        return False
    # Look for http:// in src= or href= on subresources (not bare text links)
    pattern = re.compile(
        r'<(?:script|img|link|iframe)[^>]+(?:src|href)\s*=\s*["\']http://',
        re.I,
    )
    return bool(pattern.search(rendered_html))


# ── 3. Stale copyright ───────────────────────────────────────────────────────

_COPYRIGHT_RE = re.compile(
    r"(?:©|&copy;|copyright)\s*(\d{4})(?:\s*[-–]\s*(\d{4}))?",
    re.I,
)


def detect_stale_copyright(rendered_text: str, now: Optional[datetime] = None) -> Optional[int]:
    """
    Return the most recent copyright year found if it is ≥N years stale,
    else None. Must be passed *rendered* text — many sites inject the year
    via document.write() at load time. Checks all matches and keeps the max.
    """
    now = now or datetime.now()
    current_year = now.year
    matches = _COPYRIGHT_RE.findall(rendered_text)
    if not matches:
        return None

    best = 0
    for start, end in matches:
        y = int(end) if end else int(start)
        # Ignore future-dated or implausibly-old values from unrelated text
        if 1995 <= y <= current_year + 1:
            best = max(best, y)
    if best == 0:
        return None
    if current_year - best >= STALE_COPYRIGHT_THRESHOLD_YEARS:
        return best
    return None


# ── 4. Forms ─────────────────────────────────────────────────────────────────

_FORM_RE = re.compile(r"<form\b[^>]*>", re.I)
_ACTION_RE = re.compile(r'\baction\s*=\s*["\']([^"\']*)["\']', re.I)
_METHOD_RE = re.compile(r'\bmethod\s*=\s*["\']([^"\']*)["\']', re.I)


def _extract_forms(rendered_html: str) -> list[dict]:
    forms = []
    for tag in _FORM_RE.findall(rendered_html):
        action_m = _ACTION_RE.search(tag)
        method_m = _METHOD_RE.search(tag)
        forms.append({
            "action": (action_m.group(1) if action_m else "").strip(),
            "method": (method_m.group(1).lower() if method_m else "get"),
        })
    return forms


DEFINITIVE_BROKEN_STATUSES = {404, 410}


def detect_forms(rendered_html: str, base_url: str) -> FormsResult:
    """
    Scan one page for <form> tags and probe their action URLs.

    A form is "unreachable" only if its action URL resolves to an HTTP status in
    DEFINITIVE_BROKEN_STATUSES (404 / 410) — the endpoint definitively does not
    exist. Every other response (including 405, 403, 5xx, redirects to unknown
    pages, and network errors) is demoted to `unverifiable`.

    Rationale: 405 means the server just refuses GET but probably accepts POST;
    5xx may be transient; network errors may be our IP getting blocked. We
    optimize for zero false positives because a bad claim in a cold email
    torches sender credibility. 404 / 410 are unambiguous — we can quote the
    status AND the dead URL in outreach and the recipient can verify.
    """
    forms = _extract_forms(rendered_html)
    if not forms:
        return FormsResult()

    out = FormsResult(forms_found=len(forms))

    for f in forms:
        action = f["action"]
        if not action or action in ("#", "/") or action.lower().startswith("javascript:"):
            out.unverifiable += 1
            continue
        try:
            resolved = urljoin(base_url, action)
        except Exception:
            out.unverifiable += 1
            continue
        if not resolved.startswith(("http://", "https://")):
            out.unverifiable += 1
            continue
        try:
            r = requests.get(
                resolved,
                headers={"User-Agent": USER_AGENT},
                timeout=10,
                allow_redirects=True,
            )
            if r.status_code in DEFINITIVE_BROKEN_STATUSES:
                out.unreachable = True
                if out.unreachable_status is None:
                    out.unreachable_status = r.status_code
                    out.unreachable_action = resolved
                _log.info("form action DEFINITIVELY broken: %s → %d", resolved, r.status_code)
            elif 400 <= r.status_code < 600:
                out.unverifiable += 1
                _log.info("form action ambiguous status (demoted): %s → %d", resolved, r.status_code)
        except requests.RequestException as e:
            out.unverifiable += 1
            _log.info("form action network error (demoted): %s (%s)", resolved, e)

    return out


# ── 5. PageSpeed Insights (Lighthouse in the cloud) ──────────────────────────

def detect_lighthouse_mobile(url: str, api_key: Optional[str]) -> Optional[int]:
    """
    Return the mobile performance score (0-100) from PageSpeed Insights, or
    None on failure. API key recommended (25k/day quota) but not required
    (anonymous is rate-limited but works).
    """
    params = {
        "url": url,
        "strategy": "mobile",
        "category": "performance",
    }
    if api_key:
        params["key"] = api_key
    try:
        r = requests.get(PAGESPEED_URL, params=params, timeout=60)
    except requests.RequestException as e:
        _log.warning("PageSpeed network error for %s: %s", url, e)
        return None

    if r.status_code != 200:
        _log.warning("PageSpeed %s for %s: %s", r.status_code, url, r.text[:200])
        return None

    try:
        j = r.json()
        perf = j["lighthouseResult"]["categories"]["performance"]["score"]
        return int(round(perf * 100)) if perf is not None else None
    except (KeyError, TypeError, ValueError):
        return None


# ── 6. jQuery version (bonus signal, not scored) ─────────────────────────────

_JQUERY_RE = re.compile(
    r'jquery[.-](\d+\.\d+(?:\.\d+)?)(?:\.min)?\.js',
    re.I,
)


def detect_jquery_version(rendered_html: str) -> Optional[str]:
    m = _JQUERY_RE.search(rendered_html)
    return m.group(1) if m else None


# ── Severity scoring ─────────────────────────────────────────────────────────

def score_severity(findings: AuditFindings, has_website: bool) -> tuple[int, str]:
    """
    Map findings → 0-100 score + HOT/WARM/COLD tag. Higher score = worse site.
    No website = maximum severity — that's the easiest pitch of all.
    """
    if not has_website:
        return 100, "HOT"

    score = 0
    if findings.viewport_missing:   score += 35     # mobile-broken is catastrophic
    if findings.no_https:           score += 30
    if findings.mixed_content:      score += 10
    if findings.forms_unreachable:  score += 30
    if findings.stale_copyright is not None:
        years_stale = datetime.now().year - findings.stale_copyright
        score += min(20, 5 * years_stale)
    if findings.lighthouse_mobile is not None:
        if findings.lighthouse_mobile < 20:
            score += 25
        elif findings.lighthouse_mobile < LIGHTHOUSE_MOBILE_FAIL:
            score += 15

    score = min(100, score)
    if score >= 70:   tag = "HOT"
    elif score >= 40: tag = "WARM"
    else:             tag = "COLD"
    return score, tag
