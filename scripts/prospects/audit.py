"""
audit.py — Run the detector suite against one prospect's website.

Flow per prospect:
  1. Skip if audit_status = 'no_website' — nothing to probe.
  2. Launch Playwright mobile viewport (iPhone 12), navigate home.
  3. Wait for networkidle (bounded); read rendered HTML + visible text + anchor hrefs.
  4. Full-page mobile screenshot → bytes → Supabase Storage.
  5. Same mobile context: follow up to 3 same-origin candidate contact/about/team
     pages (from contact_extract.find_candidate_page_urls), collect html + text.
  6. Switch to desktop viewport (1440×900), repeat screenshot.
  7. Run the HTML-only detectors (viewport/https/copyright/forms/jquery) on home.
  8. Run PageSpeed Insights mobile (slowest step).
  9. Run contact_extract over the combined page corpus: decision-maker name/title,
     emails, ranked with decision-maker hint + same-domain boost.
 10. Compute severity + upsert into website_prospects.
"""

from __future__ import annotations

import logging
import os
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
from urllib.parse import urlparse

from dotenv import load_dotenv
from playwright.sync_api import Error as PlaywrightError
from playwright.sync_api import sync_playwright
from supabase import create_client

from . import contact_extract, detectors
from .detectors import AuditFindings

load_dotenv(Path(__file__).parent.parent.parent / ".env.local")

_log = logging.getLogger(__name__)

STORAGE_BUCKET = "prospect-audits"
NAV_TIMEOUT_MS = 20_000
NETWORKIDLE_TIMEOUT_MS = 5_000
EXTRA_PAGE_NAV_TIMEOUT_MS = 12_000
EXTRA_PAGE_NETWORKIDLE_TIMEOUT_MS = 3_000
MAX_EXTRA_PAGES = 3
# primary_email is reserved for person-identified addresses — score ≥ 50 clears:
#   95 DM full match · 85 dr.<lastname> · 80 ownership · 75 surname · 70 first.last · 55 DM first-name
# Everything below (info@/billing@/unclassified) goes to fallback_email so the
# dashboard can render confidence honestly instead of treating a generic inbox
# as the headline contact for outreach.
PRIMARY_EMAIL_MIN_SCORE = 50


@dataclass
class _CaptureResult:
    final_url: Optional[str] = None
    home_html: str = ""
    home_text: str = ""
    extra_pages: list[dict] = field(default_factory=list)  # [{url, html, text}]
    mobile_png: bytes = b""
    desktop_png: bytes = b""
    error: Optional[str] = None


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
    contact_emails: list[dict] = field(default_factory=list)
    primary_email: Optional[str] = None      # person-identified (score ≥ 50)
    fallback_email: Optional[str] = None     # best shared/generic inbox when no primary
    decision_maker_name: Optional[str] = None
    decision_maker_title: Optional[str] = None
    facebook_url: Optional[str] = None       # mined from site HTML, used for FB outreach


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


def _lookup_business_name(sb, prospect_id: str) -> Optional[str]:
    try:
        r = (
            sb.table("website_prospects")
            .select("business_name")
            .eq("id", prospect_id)
            .limit(1)
            .execute()
        )
        if r.data:
            return r.data[0].get("business_name")
    except Exception as e:
        _log.debug("business_name lookup failed: %s", e)
    return None


# ── Playwright capture ───────────────────────────────────────────────────────

def _collect_hrefs(page) -> list[str]:
    try:
        raw = page.evaluate(
            "() => Array.from(document.querySelectorAll('a[href]'))"
            ".map(a => a.href).filter(Boolean)"
        )
    except PlaywrightError:
        return []
    return raw if isinstance(raw, list) else []


def _capture_extra_page(ctx, url: str) -> Optional[dict]:
    """Navigate an already-open mobile context to a secondary page. Returns None on failure."""
    page = ctx.new_page()
    try:
        try:
            page.goto(url, timeout=EXTRA_PAGE_NAV_TIMEOUT_MS, wait_until="domcontentloaded")
        except PlaywrightError as e:
            _log.debug("extra-page nav failed for %s: %s", url, e)
            return None
        try:
            page.wait_for_load_state("networkidle", timeout=EXTRA_PAGE_NETWORKIDLE_TIMEOUT_MS)
        except PlaywrightError:
            pass
        try:
            html = page.content()
            text = page.evaluate("() => document.body ? document.body.innerText : ''") or ""
        except PlaywrightError as e:
            _log.debug("extra-page read failed for %s: %s", url, e)
            return None
        return {"url": page.url, "html": html, "text": text}
    finally:
        try:
            page.close()
        except PlaywrightError:
            pass


def _capture(url: str) -> _CaptureResult:
    """One browser launch, mobile + extras + desktop. Errors surface via .error."""
    result = _CaptureResult()
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
                result.error = f"navigation failed: {e}"
                mobile_ctx.close()
                return result

            if resp is None:
                result.error = "no response"
                mobile_ctx.close()
                return result

            result.final_url = m_page.url
            try:
                m_page.wait_for_load_state("networkidle", timeout=NETWORKIDLE_TIMEOUT_MS)
            except PlaywrightError:
                pass

            result.home_html = m_page.content()
            result.home_text = m_page.evaluate(
                "() => document.body ? document.body.innerText : ''"
            ) or ""
            result.mobile_png = m_page.screenshot(full_page=True)

            # Follow candidate contact/about/team pages (same origin, same browser context)
            hrefs = _collect_hrefs(m_page)
            candidates = contact_extract.find_candidate_page_urls(
                result.final_url, hrefs, limit=MAX_EXTRA_PAGES,
            )
            try:
                m_page.close()
            except PlaywrightError:
                pass

            for candidate_url in candidates:
                extra = _capture_extra_page(mobile_ctx, candidate_url)
                if extra:
                    result.extra_pages.append(extra)

            # If href discovery came up short, probe well-known fallback paths
            # (many sites hide Contact in a JS-rendered nav we couldn't see).
            if len(result.extra_pages) < MAX_EXTRA_PAGES:
                already = [p["url"] for p in result.extra_pages] + [result.final_url]
                slots_left = MAX_EXTRA_PAGES - len(result.extra_pages)
                for fallback_url in contact_extract.fallback_probe_urls(
                    result.final_url, already, limit=slots_left,
                ):
                    extra = _capture_extra_page(mobile_ctx, fallback_url)
                    if extra:
                        result.extra_pages.append(extra)

            mobile_ctx.close()

            # Desktop pass — screenshot only
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
                result.desktop_png = d_page.screenshot(full_page=True)
            except PlaywrightError:
                result.desktop_png = b""
            d_ctx.close()

            return result
        finally:
            browser.close()


# ── Audit orchestrator ───────────────────────────────────────────────────────

def _resolve_contacts(
    capture: _CaptureResult,
    business_name: Optional[str],
) -> tuple[list[dict], Optional[str], Optional[str], Optional[str], Optional[str]]:
    """Run extractors against the combined page corpus. Returns
    (ranked_emails, primary_email, fallback_email, decision_maker_name, decision_maker_title)."""
    combined_text = "\n".join(
        [capture.home_text] + [p.get("text", "") for p in capture.extra_pages]
    )
    combined_html = "\n".join(
        [capture.home_html] + [p.get("html", "") for p in capture.extra_pages]
    )

    dm_name, dm_title = contact_extract.extract_decision_maker(combined_text, business_name)

    emails = contact_extract.extract_emails(combined_html, combined_text)
    site_host = urlparse(capture.final_url or "").netloc or None
    ranked = contact_extract.rank_emails(emails, decision_maker_name=dm_name, site_host=site_host)

    primary = next(
        (r["email"] for r in ranked if r["score"] >= PRIMARY_EMAIL_MIN_SCORE),
        None,
    )
    # Fallback = best surviving address below the primary threshold. Only set
    # when there's no primary — otherwise we're just echoing a lower-ranked
    # noise email.
    fallback: Optional[str] = None
    if primary is None:
        fallback = next(
            (r["email"] for r in ranked if 0 < r["score"] < PRIMARY_EMAIL_MIN_SCORE),
            None,
        )
    return ranked, primary, fallback, dm_name, dm_title


def audit_prospect(
    prospect_id: str,
    website_url: Optional[str],
    pagespeed_key: Optional[str] = None,
    business_name: Optional[str] = None,
) -> AuditResult:
    result = AuditResult(prospect_id=prospect_id, findings=AuditFindings())

    # No-website class: maximum severity, no audit needed
    if not website_url:
        result.severity_score = 100
        result.severity_tag = "HOT"
        return result

    # Look up business_name from DB if not supplied (used as a surname hint for
    # decision-maker ranking — safe to skip for smoke tests).
    if not business_name and prospect_id != "smoke-test":
        try:
            business_name = _lookup_business_name(_get_supabase(), prospect_id)
        except Exception:
            pass

    capture = _capture(website_url)
    if capture.error:
        result.error = capture.error
        result.findings.errors.append(capture.error)
        return result

    result.final_url = capture.final_url

    # Detectors run against home only — extras are for contact extraction.
    findings = result.findings
    findings.viewport_missing = detectors.detect_viewport_missing(capture.home_html)
    findings.no_https         = detectors.detect_no_https(capture.final_url or website_url)
    findings.mixed_content    = detectors.detect_mixed_content(
        capture.home_html, capture.final_url or website_url
    )
    findings.stale_copyright  = detectors.detect_stale_copyright(capture.home_text)
    findings.jquery_version   = detectors.detect_jquery_version(capture.home_html)

    # Forms live on /contact as often as on home — scan every captured page and
    # aggregate. First DEFINITIVE 404/410 wins (we record which page + which
    # action URL triggered so outreach can quote the exact broken endpoint).
    home_page_url = capture.final_url or website_url
    pages_for_forms: list[tuple[str, str]] = [(home_page_url, capture.home_html)]
    for p in capture.extra_pages:
        if p.get("html"):
            pages_for_forms.append((p.get("url") or home_page_url, p["html"]))

    total_forms = 0
    total_unverifiable = 0
    for page_url, page_html in pages_for_forms:
        res = detectors.detect_forms(page_html, page_url)
        total_forms += res.forms_found
        total_unverifiable += res.unverifiable
        if res.unreachable and not findings.forms_unreachable:
            findings.forms_unreachable = True
            findings.forms_unreachable_status = res.unreachable_status
            findings.forms_unreachable_action = res.unreachable_action
            findings.forms_unreachable_page = page_url
    findings.forms_found = total_forms
    findings.forms_unverifiable = total_unverifiable

    findings.lighthouse_mobile = detectors.detect_lighthouse_mobile(
        capture.final_url or website_url, pagespeed_key,
    )

    # Contact extraction across home + crawled pages
    ranked_emails, primary_email, fallback_email, dm_name, dm_title = _resolve_contacts(
        capture, business_name,
    )
    result.contact_emails = ranked_emails
    result.primary_email = primary_email
    result.fallback_email = fallback_email
    result.decision_maker_name = dm_name
    result.decision_maker_title = dm_title

    # Facebook page mining — same crawled HTML the contact extractor saw.
    combined_html_for_fb = "\n".join(
        [capture.home_html] + [p.get("html", "") for p in capture.extra_pages]
    )
    result.facebook_url = contact_extract.extract_facebook_url(combined_html_for_fb)

    _log.info(
        "  ↳ contact: dm=%s (%s) · %d emails · primary=%s  fallback=%s · fb=%s",
        dm_name or "—",
        dm_title or "—",
        len(ranked_emails),
        primary_email or "—",
        fallback_email or "—",
        result.facebook_url or "—",
    )

    # Upload screenshots (skip for smoke test)
    if prospect_id != "smoke-test":
        sb = _get_supabase()
        if capture.mobile_png:
            result.mobile_screenshot_url = _upload_screenshot(
                sb, prospect_id, "mobile", capture.mobile_png
            )
        if capture.desktop_png:
            result.desktop_screenshot_url = _upload_screenshot(
                sb, prospect_id, "desktop", capture.desktop_png
            )

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
        "contact_emails": result.contact_emails or None,
        "primary_email": result.primary_email,
        "fallback_email": result.fallback_email,
        "decision_maker_name": result.decision_maker_name,
        "decision_maker_title": result.decision_maker_title,
        "facebook_url": result.facebook_url,
    }
    try:
        resp = sb.table("website_prospects").update(payload).eq("id", result.prospect_id).execute()
    except Exception as e:
        _log.error("save_audit update failed for %s: %s", result.prospect_id, e)
        raise
    if not resp.data:
        _log.warning(
            "save_audit affected 0 rows for %s — check column names exist in DB",
            result.prospect_id,
        )


def persist_audit_failure(prospect_id: str, error_msg: str) -> None:
    """
    Mark a prospect as 'error' after an unhandled exception in audit_prospect.

    Without this, a row that crashes before save_audit runs stays audit_status=
    'pending' forever and re-enters every --audit-pending batch. Writing a
    minimal error record takes it out of the queue AND makes the failure
    visible in the dashboard.
    """
    try:
        result = AuditResult(
            prospect_id=prospect_id,
            findings=AuditFindings(),
            error=error_msg[:500],
        )
        save_audit(result)
    except Exception as e:
        _log.error("persist_audit_failure also failed for %s: %s", prospect_id, e)
