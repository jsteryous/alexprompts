"""
digest.py — Weekly website-prospects email digest.

Queries website_prospects for HOT/WARM rows that haven't been emailed yet,
sends a ranked HTML digest to NOTIFICATION_EMAIL via Resend, then stamps
emailed_at so the next run skips them. Dedup is enforced by the column,
not by date-window gymnastics.

Usage:
    python -m prospects.digest              # send (marks emailed_at)
    python -m prospects.digest --dry-run    # print HTML, do not send or mark
    python -m prospects.digest --min-severity 50
"""

from __future__ import annotations

import argparse
import logging
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

import requests
from dotenv import load_dotenv
from supabase import create_client

import sys as _sys
_sys.path.insert(0, str(Path(__file__).parent.parent))
from lib.email_format import tag_badge  # noqa: E402

load_dotenv(Path(__file__).parent.parent.parent / ".env.local")

_log = logging.getLogger(__name__)

NOTIFICATION_EMAIL = os.getenv("NOTIFICATION_EMAIL", "alex@rebbadvisors.com")
MAIL_FROM = os.getenv("MAIL_FROM", "REBB Advisors <noreply@rebbadvisors.com>")


def _sb():
    url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")
    if not url or not key:
        _log.error("SUPABASE_URL / SUPABASE_SERVICE_KEY missing")
        sys.exit(1)
    return create_client(url, key)


def fetch_new_prospects(min_severity: int) -> list[dict]:
    sb = _sb()
    rows = (
        sb.table("website_prospects")
        .select(
            "id, business_name, vertical, city, county, phone, website_url, "
            "google_rating, google_review_count, audit_status, issues, "
            "severity_score, severity_tag, mobile_screenshot_url, desktop_screenshot_url, "
            "lighthouse_mobile_score, primary_email, fallback_email, "
            "decision_maker_name, decision_maker_title"
        )
        .is_("emailed_at", "null")
        .in_("severity_tag", ["HOT", "WARM"])
        .in_("audit_status", ["audited", "no_website"])
        .gte("severity_score", min_severity)
        .order("severity_score", desc=True)
        .execute()
        .data
        or []
    )
    return rows


def mark_emailed(ids: list[str]) -> None:
    if not ids:
        return
    sb = _sb()
    now = datetime.now(timezone.utc).isoformat()
    sb.table("website_prospects").update({"emailed_at": now}).in_("id", ids).execute()


def _issue_labels(issues: dict | None, audit_status: str) -> list[str]:
    if audit_status == "no_website":
        return ["No website"]
    if not issues:
        return []
    labels = []
    if issues.get("viewport_missing"):
        labels.append("No mobile viewport")
    if issues.get("no_https"):
        labels.append("No HTTPS")
    if issues.get("mixed_content"):
        labels.append("Mixed content")
    if issues.get("forms_unreachable"):
        page_url = issues.get("forms_unreachable_page") or ""
        path = ""
        if page_url:
            try:
                from urllib.parse import urlparse
                path = (urlparse(page_url).path or "").rstrip("/") or "/"
            except Exception:
                path = ""
        status = issues.get("forms_unreachable_status")
        suffix = f" on {path}" if path and path != "/" else ""
        if status:
            suffix += f" (POST → {status})"
        labels.append(f"Broken form{suffix}")
    stale = issues.get("stale_copyright")
    if stale:
        labels.append(f"Copyright {stale}")
    lh = issues.get("lighthouse_mobile")
    if lh is not None and lh < 40:
        labels.append(f"Lighthouse {lh}")
    jq = issues.get("jquery_version")
    if jq and jq.startswith(("1.", "2.")):
        labels.append(f"jQuery {jq}")
    return labels


def _card(row: dict, idx: int) -> str:
    name = row.get("business_name") or "—"
    vertical = (row.get("vertical") or "").replace("_", " ").title()
    city = row.get("city") or ""
    county = row.get("county") or ""
    location = ", ".join(x for x in [city, county] if x) or "—"
    phone = row.get("phone") or ""
    url = row.get("website_url") or ""
    rating = row.get("google_rating")
    reviews = row.get("google_review_count") or 0
    tag = (row.get("severity_tag") or "WARM").upper()
    score = row.get("severity_score") or 0
    screenshot = row.get("mobile_screenshot_url") or row.get("desktop_screenshot_url") or ""
    primary_email = row.get("primary_email") or ""
    fallback_email = row.get("fallback_email") or ""
    dm_name = row.get("decision_maker_name") or ""
    dm_title = row.get("decision_maker_title") or ""

    issue_labels = _issue_labels(row.get("issues") or {}, row.get("audit_status") or "")
    issues_html = "".join(
        f'<span style="display:inline-block;background:#fef2f2;color:#dc2626;'
        f'font-size:11px;font-weight:600;padding:2px 8px;border-radius:4px;'
        f'margin:2px 4px 2px 0">{label}</span>'
        for label in issue_labels
    )

    rating_html = (
        f'<span style="color:#6b7280">★ {rating} · {reviews} reviews</span>'
        if rating else ""
    )
    phone_html = (
        f'<a href="tel:{phone}" style="color:#22c55e;text-decoration:none">{phone}</a>'
        if phone else ""
    )
    if primary_email:
        email_html = (
            f'<a href="mailto:{primary_email}" style="color:#22c55e;text-decoration:none">'
            f'{primary_email}</a>'
        )
    elif fallback_email:
        # Honest labeling — don't pretend a generic inbox is the owner's line.
        email_html = (
            f'<a href="mailto:{fallback_email}" style="color:#6b7280;text-decoration:none">'
            f'{fallback_email}</a> '
            f'<span style="color:#9ca3af;font-size:11px">(shared inbox)</span>'
        )
    else:
        email_html = ""
    dm_html = ""
    if dm_name:
        dm_html = (
            f'<span style="color:#0a0a0a;font-weight:600">{dm_name}</span>'
            + (f' <span style="color:#6b7280">· {dm_title}</span>' if dm_title else "")
        )
    url_html = (
        f'<a href="{url}" style="color:#22c55e;text-decoration:none;word-break:break-all">{url}</a>'
        if url else '<span style="color:#dc2626;font-weight:600">No website</span>'
    )
    shot_html = (
        f'<a href="{screenshot}"><img src="{screenshot}" alt="mobile screenshot" '
        f'style="max-width:100%;border:1px solid #e5e7eb;border-radius:6px;margin-top:10px"/></a>'
        if screenshot else ""
    )

    border = "#dc2626" if tag == "HOT" else "#d97706"

    return f"""
<div style="border:1px solid {border};border-left:3px solid {border};
            border-radius:8px;padding:16px 18px;margin-bottom:12px;background:#fff">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">
    <div>
      <span style="font-size:13px;font-weight:700;color:#0a0a0a">#{idx} &nbsp;</span>
      <span style="font-size:16px;font-weight:700;color:#0a0a0a">{name}</span>
      <span style="font-size:12px;color:#6b7280"> · {vertical}</span>
    </div>
    <div style="display:flex;gap:6px;align-items:center">
      {tag_badge(tag)}
      <span style="font-size:12px;color:#6b7280;font-weight:600">severity {score}</span>
    </div>
  </div>
  <div style="font-size:13px;color:#374151;margin-bottom:4px">{location} &nbsp;·&nbsp; {rating_html}</div>
  <div style="font-size:12px;margin-bottom:8px">{url_html}</div>
  {f'<div style="font-size:12px;margin-bottom:4px">{dm_html}</div>' if dm_html else ''}
  {f'<div style="font-size:12px;margin-bottom:4px">✉ {email_html}</div>' if email_html else ''}
  {f'<div style="font-size:12px;margin-bottom:8px">{phone_html}</div>' if phone_html else ''}
  <div>{issues_html}</div>
  {shot_html}
</div>"""


def build_html(rows: list[dict], generated_at: str) -> str:
    hot = [r for r in rows if (r.get("severity_tag") or "").upper() == "HOT"]
    warm = [r for r in rows if (r.get("severity_tag") or "").upper() == "WARM"]

    body = ""
    if hot:
        body += (
            '<h3 style="font-size:13px;font-weight:700;text-transform:uppercase;'
            'letter-spacing:.1em;color:#dc2626;margin:0 0 12px">'
            f'HOT — {len(hot)} prospects</h3>'
        )
        body += "".join(_card(r, i + 1) for i, r in enumerate(hot))
    if warm:
        body += (
            '<h3 style="font-size:13px;font-weight:700;text-transform:uppercase;'
            'letter-spacing:.1em;color:#d97706;margin:24px 0 12px">'
            f'WARM — {len(warm)} prospects</h3>'
        )
        body += "".join(_card(r, i + 1) for i, r in enumerate(warm))
    if not body:
        body = '<p style="color:#6b7280;font-size:15px">No new HOT/WARM prospects this week.</p>'

    return f"""<!DOCTYPE html>
<html><body style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;
                   max-width:640px;margin:40px auto;color:#0a0a0a;padding:0 16px">
  <p style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
            color:#16a34a;margin:0 0 12px">REBB Advisors · Website Prospects</p>
  <h2 style="margin:0 0 4px;font-size:22px;line-height:1.3">Weekly Prospect Digest</h2>
  <p style="color:#6b7280;font-size:14px;margin:0 0 24px">
    <strong style="color:#dc2626">{len(hot)} HOT</strong> ·
    <strong style="color:#d97706">{len(warm)} WARM</strong>
    &nbsp;·&nbsp; new since last digest
  </p>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 24px">
  {body}
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0 16px">
  <p style="font-size:11px;color:#aaa">
    Generated {generated_at} · Dashboard: rebbadvisors.com/dashboard/prospects
  </p>
</body></html>"""


def send_email(html: str, hot_count: int, warm_count: int) -> None:
    key = os.getenv("RESEND_API_KEY")
    if not key:
        _log.error("RESEND_API_KEY not set")
        sys.exit(1)

    subject = f"REBB Prospects — {hot_count} HOT, {warm_count} WARM"
    resp = requests.post(
        "https://api.resend.com/emails",
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        json={
            "from": MAIL_FROM,
            "to": [NOTIFICATION_EMAIL],
            "subject": subject,
            "html": html,
        },
        timeout=15,
    )
    if resp.status_code not in (200, 201):
        _log.error("Resend error %s: %s", resp.status_code, resp.text)
        sys.exit(1)
    _log.info("digest sent to %s", NOTIFICATION_EMAIL)


def run(min_severity: int = 40, dry_run: bool = False) -> int:
    rows = fetch_new_prospects(min_severity)
    hot = sum(1 for r in rows if (r.get("severity_tag") or "").upper() == "HOT")
    warm = len(rows) - hot
    _log.info("prospect digest: %d new (%d HOT, %d WARM)", len(rows), hot, warm)

    if not rows:
        _log.info("nothing to send")
        return 0

    html = build_html(rows, datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"))

    if dry_run:
        print(html)
        return 0

    send_email(html, hot, warm)
    mark_emailed([r["id"] for r in rows])
    _log.info("marked %d rows emailed_at", len(rows))
    return 0


def main() -> int:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s  %(levelname)s  %(message)s",
        datefmt="%H:%M:%S",
    )
    ap = argparse.ArgumentParser()
    ap.add_argument("--min-severity", type=int, default=40,
                    help="Only include prospects at or above this severity (default 40 = WARM threshold)")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()
    return run(min_severity=args.min_severity, dry_run=args.dry_run)


if __name__ == "__main__":
    sys.exit(main())
