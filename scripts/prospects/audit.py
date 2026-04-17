"""
audit.py — Run the detector suite against one prospect's website.

Flow per prospect:
  1. Skip if audit_status = 'no_website' — nothing to probe.
  2. Launch Playwright, request mobile viewport (iPhone 12) first.
  3. Navigate with a 20s timeout; record final URL (catches http→https redirects).
  4. Wait for networkidle (bounded); read rendered HTML + visible text.
  5. Full-page mobile screenshot → bytes → Supabase Storage.
  6. Switch to desktop viewport (1440×900), repeat screenshot.
  7. Run the HTML-only detectors (viewport/https/copyright/forms/jquery).
  8. Run PageSpeed Insights mobile (network call — slowest step).
  9. Compute severity + upsert into website_prospects.
"""

from __future__ import annotations

import logging
import os
import re
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
from urllib.parse import urlparse

from dotenv import load_dotenv
from playwright.sync_api import Error as PlaywrightError
from playwright.sync_api import sync_playwright
from supabase import create_client

from . import detectors
from .detectors import AuditFindings

load_dotenv(Path(__file__).parent.parent.parent / ".env.local")

_log = logging.getLogger(__name__)

STORAGE_BUCKET = "prospect-audits"
NAV_TIMEOUT_MS = 20_000
NETWORKIDLE_TIMEOUT_MS = 5_000


@dataclass
class AuditResult:
    prospect_id: str
    final_url: Optional[str] = None
    findings: AuditFindings = None  # type: ignore[assignment]
    severity_score: int = 0
    severity_tag: str = "COLD"
    mobile_screenshot_url: Optional[str] = None
    desktop_screenshot_url: Optional[str] = None
    error: Optional[str] = None


# ── Supabase helpers ─────────────────────────────────────────────────────────

def _get_supabase():
    url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")
    if not url or not key:
        raise RuntimeError("SUPABASE_URL / SUPABASE_SERVICE_KEY required")
    return create_client(url, key)


def _upload_screenshot(sb, prospect_id: str, kind: str, png_bytes: bytes) -> Optional[str]:
    """Upload PNG to Supabase Storage; return public URL or None on failure."""
    ts = int(time.time())
    path = f"{prospect_id}/{kind}-{ts}.png"
    try:
        sb.storage.from_(STORAGE_BUCKET).upload(
            path,
            png_bytes,
            {"content-type": "image/png", "upsert": "true"},
        )
        return sb.storage.from_(STORAGE_BUCKET).get_public_url(path)
    except Exception as e:
        _log.warning("screenshot upload failed (%s): %s", kind, e)
        return None


# ── Playwright capture ───────────────────────────────────────────────────────

def _capture(url: str) -> tuple[Optional[str], str, str, bytes, bytes, Optional[str]]:
    """
    Returns (final_url, rendered_html, rendered_text, mobile_png, desktop_png, error).
    Any single-step failure returns a partial tuple with an error string.
    """
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        try:
            # Mobile pass
            mobile_ctx = browser.new_context(
                viewport={"width": 390, "height": 844},
                device_scale_factor=2,
                is_mobile=True,
                has_touch=True,
                user_agent=(
                    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) "
                    "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 "
                    "Mobile/15E148 Safari/604.1"
                ),
            )
            m_page = mobile_ctx.new_page()
            try:
                resp = m_page.goto(url, timeout=NAV_TIMEOUT_MS, wait_until="domcontentloaded")
            except PlaywrightError as e:
                return None, "", "", b"", b"", f"navigation failed: {e}"

            if resp is None:
                return None, "", "", b"", b"", "no response"

            final_url = m_page.url
            try:
                m_page.wait_for_load_state("networkidle", timeout=NETWORKIDLE_TIMEOUT_MS)
            except PlaywrightError:
                pass  # networkidle can time out on analytics-heavy sites; that's fine

            rendered_html = m_page.content()
            rendered_text = m_page.evaluate("() => document.body ? document.body.innerText : ''")
            mobile_png = m_page.screenshot(full_page=True)
            mobile_ctx.close()

            # Desktop pass
            d_ctx = browser.new_context(
                viewport={"width": 1440, "height": 900},
                user_agent=(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                ),
            )
            d_page = d_ctx.new_page()
            try:
                d_page.goto(url, timeout=NAV_TIMEOUT_MS, wait_until="domcontentloaded")
                try:
                    d_page.wait_for_load_state("networkidle", timeout=NETWORKIDLE_TIMEOUT_MS)
                except PlaywrightError:
                    pass
                desktop_png = d_page.screenshot(full_page=True)
            except PlaywrightError:
                desktop_png = b""
            d_ctx.close()

            return final_url, rendered_html, rendered_text or "", mobile_png, desktop_png, None
        finally:
            browser.close()


# ── Audit orchestrator ───────────────────────────────────────────────────────

def audit_prospect(
    prospect_id: str,
    website_url: Optional[str],
    pagespeed_key: Optional[str] = None,
) -> AuditResult:
    result = AuditResult(prospect_id=prospect_id, findings=AuditFindings())

    # No-website class: maximum severity, no audit needed
    if not website_url:
        result.severity_score = 100
        result.severity_tag = "HOT"
        return result

    final_url, html, text, mobile_png, desktop_png, err = _capture(website_url)
    if err:
        result.error = err
        result.findings.errors.append(err)
        return result

    result.final_url = final_url

    # Detectors over rendered state
    findings = result.findings
    findings.viewport_missing = detectors.detect_viewport_missing(html)
    findings.no_https         = detectors.detect_no_https(final_url or website_url)
    findings.mixed_content    = detectors.detect_mixed_content(html, final_url or website_url)
    findings.stale_copyright  = detectors.detect_stale_copyright(text)
    findings.jquery_version   = detectors.detect_jquery_version(html)

    forms_found, unreachable, unverifiable, triggering_status = detectors.detect_forms(
        html, final_url or website_url,
    )
    findings.forms_found = forms_found
    findings.forms_unreachable = unreachable
    findings.forms_unreachable_status = triggering_status
    findings.forms_unverifiable = unverifiable

    # Lighthouse last — slowest + most likely to time out
    findings.lighthouse_mobile = detectors.detect_lighthouse_mobile(
        final_url or website_url, pagespeed_key,
    )

    # Upload screenshots
    sb = _get_supabase()
    if mobile_png:
        result.mobile_screenshot_url = _upload_screenshot(sb, prospect_id, "mobile", mobile_png)
    if desktop_png:
        result.desktop_screenshot_url = _upload_screenshot(sb, prospect_id, "desktop", desktop_png)

    result.severity_score, result.severity_tag = detectors.score_severity(findings, has_website=True)
    return result


def save_audit(result: AuditResult) -> None:
    """Persist audit result to website_prospects."""
    sb = _get_supabase()
    status = "error" if result.error else "audited"

    payload = {
        "audited_at": datetime.now(timezone.utc).isoformat(),
        "audit_status": status,
        "issues": result.findings.to_jsonb() if result.findings else None,
        "severity_score": result.severity_score,
        "severity_tag": result.severity_tag,
        "mobile_screenshot_url": result.mobile_screenshot_url,
        "desktop_screenshot_url": result.desktop_screenshot_url,
        "lighthouse_mobile_score": result.findings.lighthouse_mobile if result.findings else None,
        "audit_error": result.error,
    }
    sb.table("website_prospects").update(payload).eq("id", result.prospect_id).execute()
