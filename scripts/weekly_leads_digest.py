#!/usr/bin/env python3
"""
weekly_leads_digest.py — Weekly enriched leads email digest for REBB Advisors

Queries enriched_leads for the past N days and sends a ranked HTML email
to NOTIFICATION_EMAIL via Resend.

Usage:
    python weekly_leads_digest.py                 # last 7 days
    python weekly_leads_digest.py --days 14       # look back 14 days
    python weekly_leads_digest.py --all           # every enriched lead
    python weekly_leads_digest.py --dry-run       # print email HTML, don't send

Required env vars (in .env.local):
    SUPABASE_URL / SUPABASE_SERVICE_KEY
    RESEND_API_KEY
    NOTIFICATION_EMAIL
"""

import os
import sys
import argparse
from datetime import datetime, timezone, timedelta
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env.local")

SUPABASE_URL         = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")
RESEND_API_KEY       = os.environ.get("RESEND_API_KEY")
NOTIFICATION_EMAIL   = os.environ.get("NOTIFICATION_EMAIL", "alex@rebbadvisors.com")


# ── Supabase ──────────────────────────────────────────────────────────────────

def get_supabase():
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        return None
    from supabase import create_client
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


def fetch_leads(days_back: int | None) -> tuple[list[dict], list[dict]]:
    """
    Returns (enriched_leads, pending_leads) — both sorted HOT→COLD, high score first.
    If days_back is None, returns all rows.
    """
    client = get_supabase()
    if not client:
        print("ERROR: Supabase not configured.")
        sys.exit(1)

    query = client.table("enriched_leads").select("*").order("score", desc=True)

    if days_back is not None:
        cutoff = (datetime.now(timezone.utc) - timedelta(days=days_back)).isoformat()
        query = query.gte("created_at", cutoff)

    result = query.execute()
    rows = result.data or []

    enriched = [r for r in rows if r.get("enrichment_status") == "enriched"]
    pending  = [r for r in rows if r.get("enrichment_status") == "pending"]
    return enriched, pending


# ── HTML helpers ──────────────────────────────────────────────────────────────

_TAG_COLORS = {
    "HOT":  ("#fef2f2", "#dc2626", "#dc2626"),  # bg, text, border
    "WARM": ("#fffbeb", "#d97706", "#d97706"),
    "COLD": ("#f9fafb", "#6b7280", "#d1d5db"),
}


def _tag_badge(tag: str) -> str:
    tag = (tag or "WARM").upper()
    bg, color, _ = _TAG_COLORS.get(tag, _TAG_COLORS["WARM"])
    return (
        f'<span style="display:inline-block;background:{bg};color:{color};'
        f'font-size:11px;font-weight:700;letter-spacing:.08em;padding:2px 8px;'
        f'border-radius:4px">{tag}</span>'
    )


def _fmt_currency(val) -> str:
    if val is None:
        return "—"
    try:
        return f"${float(val):,.0f}"
    except (TypeError, ValueError):
        return "—"


def _lead_card(lead: dict, idx: int) -> str:
    name      = lead.get("principal_name") or "—"
    role      = lead.get("principal_role") or ""
    company   = lead.get("entity_name") or lead.get("location") or "—"
    location  = lead.get("location") or "—"
    valuation = _fmt_currency(lead.get("valuation"))
    score     = lead.get("score") or "—"
    tag       = (lead.get("tag") or "WARM").upper()
    email     = lead.get("contact_email") or ""
    phone     = lead.get("contact_phone") or ""
    linkedin  = lead.get("linkedin_url") or ""
    evidence  = lead.get("search_evidence") or ""
    event     = lead.get("event_type") or ""
    notes     = lead.get("notes") or ""

    _, _, border_color = _TAG_COLORS.get(tag, _TAG_COLORS["WARM"])

    contact_lines = []
    if email:
        contact_lines.append(
            f'<a href="mailto:{email}" style="color:#22c55e;text-decoration:none">{email}</a>'
        )
    if phone:
        contact_lines.append(
            f'<a href="tel:{phone}" style="color:#22c55e;text-decoration:none">{phone}</a>'
        )
    if linkedin:
        contact_lines.append(
            f'<a href="{linkedin}" style="color:#22c55e;text-decoration:none">LinkedIn →</a>'
        )
    contact_html = " &nbsp;·&nbsp; ".join(contact_lines) if contact_lines else '<span style="color:#aaa">No contact found</span>'

    evidence_html = (
        f'<a href="{evidence}" style="color:#888;font-size:11px;text-decoration:none">Source →</a>'
        if evidence else ""
    )

    notes_html = (
        f'<div style="margin-top:8px;font-size:11px;color:#888;background:#f9fafb;'
        f'padding:8px 10px;border-radius:6px;white-space:pre-wrap">{notes}</div>'
        if notes else ""
    )

    return f"""
<div style="border:1px solid {border_color};border-left:3px solid {border_color};
            border-radius:8px;padding:16px 18px;margin-bottom:12px;background:#fff">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">
    <div>
      <span style="font-size:13px;font-weight:700;color:#0a0a0a">#{idx} &nbsp;</span>
      <span style="font-size:16px;font-weight:700;color:#0a0a0a">{name}</span>
      {f'<span style="font-size:13px;color:#6b7280"> · {role}</span>' if role else ''}
    </div>
    <div style="display:flex;gap:6px;align-items:center">
      {_tag_badge(tag)}
      <span style="font-size:12px;color:#6b7280;font-weight:600">score {score}</span>
    </div>
  </div>
  <div style="font-size:13px;color:#374151;margin-bottom:4px">
    <strong>{company}</strong>
    {f' &nbsp;·&nbsp; {location}' if location != company else ''}
  </div>
  <div style="font-size:12px;color:#6b7280;margin-bottom:10px">
    {event} &nbsp;·&nbsp; {valuation}
  </div>
  <div style="font-size:13px;margin-bottom:6px">{contact_html}</div>
  {f'<div style="margin-top:6px">{evidence_html}</div>' if evidence_html else ''}
  {notes_html}
</div>"""


def build_email_html(
    enriched: list[dict],
    pending: list[dict],
    days_back: int | None,
    generated_at: str,
) -> str:
    window_label = f"last {days_back} day{'s' if days_back != 1 else ''}" if days_back else "all time"
    enriched_count = len(enriched)
    pending_count  = len(pending)
    hot_count      = sum(1 for r in enriched if (r.get("tag") or "").upper() == "HOT")

    enriched_cards = "".join(_lead_card(r, i + 1) for i, r in enumerate(enriched))
    pending_cards  = "".join(_lead_card(r, i + 1) for i, r in enumerate(pending))

    if not enriched and not pending:
        body_html = '<p style="color:#6b7280;font-size:15px">No new leads in this window.</p>'
    else:
        body_html = ""
        if enriched:
            body_html += f"""
<h3 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;
           color:#22c55e;margin:0 0 12px">Enriched Leads — {enriched_count} found</h3>
{enriched_cards}"""
        if pending:
            body_html += f"""
<h3 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;
           color:#d97706;margin:24px 0 12px">Pending Manual Review — {pending_count} unresolved</h3>
<p style="font-size:12px;color:#6b7280;margin:0 0 12px">
  LLC owner could not be auto-identified. Check notes for mailing address and Neumo link.
</p>
{pending_cards}"""

    return f"""<!DOCTYPE html>
<html><body style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;
                   max-width:640px;margin:40px auto;color:#0a0a0a;padding:0 16px">

  <p style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
            color:#16a34a;margin:0 0 12px">REBB Advisors · Upstate Multiplier</p>

  <h2 style="margin:0 0 4px;font-size:22px;line-height:1.3">
    Weekly Leads Digest
  </h2>
  <p style="color:#6b7280;font-size:14px;margin:0 0 24px">
    {window_label} &nbsp;·&nbsp;
    <strong style="color:#0a0a0a">{enriched_count} enriched</strong>
    {f', <strong style="color:#dc2626">{hot_count} HOT</strong>' if hot_count else ''}
    {f', {pending_count} pending manual review' if pending_count else ''}
  </p>

  <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 24px">

  {body_html}

  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0 16px">
  <p style="font-size:11px;color:#aaa">
    Generated {generated_at} · Run <code>python enrich.py --run-pending</code> to process queue
  </p>
</body></html>"""


# ── Send via Resend ───────────────────────────────────────────────────────────

def send_digest(html: str, enriched_count: int, pending_count: int, days_back: int | None) -> None:
    if not RESEND_API_KEY:
        print("ERROR: RESEND_API_KEY not set in .env.local")
        sys.exit(1)
    if not NOTIFICATION_EMAIL:
        print("ERROR: NOTIFICATION_EMAIL not set in .env.local")
        sys.exit(1)

    window = f"last {days_back}d" if days_back else "all"
    subject = f"REBB Leads Digest ({window}) — {enriched_count} enriched"
    if pending_count:
        subject += f", {pending_count} pending"

    resp = requests.post(
        "https://api.resend.com/emails",
        headers={
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "from": "REBB Advisors <noreply@rebbadvisors.com>",
            "to": [NOTIFICATION_EMAIL],
            "subject": subject,
            "html": html,
        },
        timeout=15,
    )

    if resp.status_code in (200, 201):
        data = resp.json()
        print(f"  ✓  Digest sent to {NOTIFICATION_EMAIL} (id: {data.get('id', '?')})")
    else:
        print(f"  ✗  Resend error {resp.status_code}: {resp.text}")
        sys.exit(1)


# ── CLI ───────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description="REBB Weekly Leads Email Digest")
    parser.add_argument("--days", type=int, default=7,
                        help="Look-back window in days (default: 7)")
    parser.add_argument("--all", action="store_true",
                        help="Include all enriched leads regardless of date")
    parser.add_argument("--dry-run", action="store_true",
                        help="Print the email HTML to stdout without sending")
    args = parser.parse_args()

    days_back = None if args.all else args.days
    window_label = "all time" if days_back is None else f"last {days_back} days"

    print(f"Fetching enriched leads ({window_label})...")
    enriched, pending = fetch_leads(days_back)
    print(f"  {len(enriched)} enriched · {len(pending)} pending")

    if not enriched and not pending:
        print("No leads found in window. Exiting.")
        return

    generated_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    html = build_email_html(enriched, pending, days_back, generated_at)

    if args.dry_run:
        print("\n── Email HTML preview ──────────────────────────────────────\n")
        print(html)
        return

    send_digest(html, len(enriched), len(pending), days_back)


if __name__ == "__main__":
    main()
