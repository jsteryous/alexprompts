#!/usr/bin/env python3
"""
run_daily.py — REBB Advisors daily data pipeline orchestrator

Sequence:
  1. gvl_monitor.py --scrape all      (GovOS deeds + SC SOS)
  2. gvl_monitor.py --mode mortgages  (CountyWeb MTG/CON filings)
  3. enrich.py --run-pending          (LLC → human enrichment)
  4. Email alert for any enriched lead with score > HIGH_CONFIDENCE_THRESHOLD
     created during this run

Usage:
    python run_daily.py
    python run_daily.py --dry-run        # skip Supabase writes and email sends
    python run_daily.py --days 14        # scraper look-back window (default: 7)
    python run_daily.py --no-deeds       # skip deed scraper (mortgages + enrich only)
    python run_daily.py --no-mortgages   # skip mortgage scraper
    python run_daily.py --no-enrich      # skip enrichment pass
    python run_daily.py --no-alert       # skip high-confidence email alert

Required env vars (in .env.local):
    SUPABASE_URL / SUPABASE_SERVICE_KEY
    RESEND_API_KEY
    NOTIFICATION_EMAIL
    ROD_EMAIL / ROD_PASSWORD / ROD_VIEWER_USERNAME
"""

import os
import sys
import subprocess
import argparse
from datetime import datetime, timezone, timedelta
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env.local")

RESEND_API_KEY     = os.environ.get("RESEND_API_KEY")
NOTIFICATION_EMAIL = os.environ.get("NOTIFICATION_EMAIL", "alex@rebbadvisors.com")
SUPABASE_URL         = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

# Leads with score above this threshold trigger an immediate email alert.
HIGH_CONFIDENCE_THRESHOLD = 80

SCRIPTS_DIR = Path(__file__).parent
PYTHON      = sys.executable


# ── Subprocess helpers ────────────────────────────────────────────────────────

def run_step(label: str, cmd: list[str], dry_run: bool = False) -> bool:
    """Run a subprocess step, stream output, return True on success."""
    print(f"\n{'─' * 60}")
    print(f"  STEP: {label}")
    print(f"{'─' * 60}")
    if dry_run:
        cmd = [c for c in cmd if c != "--dry-run"] + ["--dry-run"]
    print(f"  $ {' '.join(cmd)}\n")

    result = subprocess.run(cmd, cwd=SCRIPTS_DIR)
    if result.returncode != 0:
        print(f"\n  ✗ {label} exited with code {result.returncode}")
        return False
    return True


# ── High-confidence alert ─────────────────────────────────────────────────────

def get_supabase():
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        return None
    from supabase import create_client
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


def fetch_high_confidence_leads(since: datetime) -> list[dict]:
    """
    Return enriched_leads rows that were created after `since` and have
    score > HIGH_CONFIDENCE_THRESHOLD with enrichment_status = 'enriched'.
    """
    client = get_supabase()
    if not client:
        return []

    resp = (
        client.table("enriched_leads")
        .select("*")
        .eq("enrichment_status", "enriched")
        .gt("score", HIGH_CONFIDENCE_THRESHOLD)
        .gte("created_at", since.isoformat())
        .order("score", desc=True)
        .execute()
    )
    return resp.data or []


def _fmt_currency(val) -> str:
    if val is None:
        return "not disclosed"
    try:
        return f"${float(val):,.0f}"
    except (TypeError, ValueError):
        return "not disclosed"


def _tag_badge(tag: str) -> str:
    colors = {
        "HOT":  ("#fef2f2", "#dc2626"),
        "WARM": ("#fffbeb", "#d97706"),
        "COLD": ("#f9fafb", "#6b7280"),
    }
    tag = (tag or "WARM").upper()
    bg, color = colors.get(tag, colors["WARM"])
    return (
        f'<span style="display:inline-block;background:{bg};color:{color};'
        f'font-size:11px;font-weight:700;letter-spacing:.08em;padding:2px 8px;'
        f'border-radius:4px">{tag}</span>'
    )


def build_alert_html(leads: list[dict], run_ts: str) -> str:
    cards = []
    for lead in leads:
        name      = lead.get("principal_name") or "—"
        role      = lead.get("principal_role") or ""
        entity    = lead.get("location") or "—"
        event     = lead.get("event_type") or "—"
        valuation = _fmt_currency(lead.get("valuation"))
        score     = lead.get("score") or "—"
        tag       = (lead.get("tag") or "WARM").upper()
        evidence  = lead.get("search_evidence") or ""
        notes     = lead.get("notes") or ""

        evidence_html = (
            f'<a href="{evidence}" style="color:#22c55e;font-size:12px">Source →</a>'
            if evidence else ""
        )
        notes_html = (
            f'<div style="margin-top:8px;font-size:11px;color:#888;'
            f'background:#f9fafb;padding:8px 10px;border-radius:6px;'
            f'white-space:pre-wrap">{notes}</div>'
            if notes else ""
        )

        cards.append(f"""
<div style="border:1px solid #dc2626;border-left:3px solid #dc2626;
            border-radius:8px;padding:16px 18px;margin-bottom:14px;background:#fff">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
    <span style="font-size:17px;font-weight:700;color:#0a0a0a">{name}</span>
    <div style="display:flex;gap:6px;align-items:center">
      {_tag_badge(tag)}
      <span style="font-size:12px;color:#6b7280;font-weight:600">score {score}</span>
    </div>
  </div>
  {f'<div style="font-size:12px;color:#6b7280;margin-bottom:4px">{role}</div>' if role else ''}
  <div style="font-size:13px;color:#374151;margin-bottom:4px"><strong>{entity}</strong></div>
  <div style="font-size:12px;color:#6b7280;margin-bottom:10px">
    {event} &nbsp;·&nbsp; Loan amount: <strong>{valuation}</strong>
  </div>
  {f'<div style="margin-top:6px">{evidence_html}</div>' if evidence_html else ''}
  {notes_html}
</div>""")

    count = len(leads)
    cards_html = "\n".join(cards)

    return f"""<!DOCTYPE html>
<html><body style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;
                   max-width:600px;margin:40px auto;color:#0a0a0a;padding:0 16px">

  <p style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
            color:#16a34a;margin:0 0 12px">REBB Advisors · Upstate Multiplier</p>

  <h2 style="margin:0 0 4px;font-size:22px;line-height:1.3">
    🔥 {count} High-Confidence Lead{'s' if count != 1 else ''} Found
  </h2>
  <p style="color:#6b7280;font-size:14px;margin:0 0 24px">
    Score &gt; {HIGH_CONFIDENCE_THRESHOLD} · enriched this run · {run_ts}
  </p>

  <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 24px">

  {cards_html}

  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0 16px">
  <p style="font-size:11px;color:#aaa">
    Run <code>python weekly_leads_digest.py</code> for the full pipeline report.
  </p>
</body></html>"""


def send_alert(leads: list[dict], run_ts: str, dry_run: bool = False) -> None:
    if not leads:
        print("\n  No high-confidence leads to alert on.")
        return

    count = len(leads)
    names = ", ".join(r.get("principal_name") or "?" for r in leads[:3])
    if count > 3:
        names += f" +{count - 3} more"

    subject = f"REBB Alert: {count} high-confidence lead{'s' if count != 1 else ''} — {names}"
    html    = build_alert_html(leads, run_ts)

    print(f"\n  {'─' * 56}")
    print(f"  HIGH-CONFIDENCE ALERT: {count} lead(s) → {NOTIFICATION_EMAIL}")
    for lead in leads:
        valuation = _fmt_currency(lead.get("valuation"))
        print(f"    · {lead.get('principal_name')} (score {lead.get('score')}) — {valuation}")

    if dry_run:
        print("  [dry-run] Skipping email send.")
        return

    if not RESEND_API_KEY:
        print("  ✗ RESEND_API_KEY not set — skipping alert email.")
        return

    resp = requests.post(
        "https://api.resend.com/emails",
        headers={
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "from":    "REBB Advisors <noreply@rebbadvisors.com>",
            "to":      [NOTIFICATION_EMAIL],
            "subject": subject,
            "html":    html,
        },
        timeout=15,
    )

    if resp.status_code in (200, 201):
        print(f"  ✓ Alert sent (id: {resp.json().get('id', '?')})")
    else:
        print(f"  ✗ Resend error {resp.status_code}: {resp.text}")


# ── Orchestrator ──────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description="REBB daily data pipeline")
    parser.add_argument("--dry-run",       action="store_true", help="No DB writes, no emails")
    parser.add_argument("--days",          type=int, default=7,  help="Scraper look-back window (default: 7)")
    parser.add_argument("--no-deeds",      action="store_true", help="Skip deed scraper")
    parser.add_argument("--no-mortgages",  action="store_true", help="Skip mortgage scraper")
    parser.add_argument("--no-enrich",     action="store_true", help="Skip enrichment pass")
    parser.add_argument("--no-alert",      action="store_true", help="Skip high-confidence email alert")
    args = parser.parse_args()

    run_start = datetime.now(timezone.utc)
    run_ts    = run_start.strftime("%Y-%m-%d %H:%M UTC")

    print(f"\n{'═' * 60}")
    print(f"  REBB Daily Pipeline  ·  {run_ts}")
    if args.dry_run:
        print("  MODE: DRY RUN — no writes, no emails")
    print(f"{'═' * 60}")

    ok = True

    # ── Step 1: Deeds (GovOS + SC SOS) ───────────────────────────────────────
    if not args.no_deeds:
        ok &= run_step(
            "Deed scraper — GovOS + SC SOS",
            [PYTHON, "gvl_monitor.py", "--scrape", "all", "--days", str(args.days)],
            dry_run=args.dry_run,
        )

    # ── Step 2: Mortgages (CountyWeb) ─────────────────────────────────────────
    if not args.no_mortgages:
        ok &= run_step(
            "Mortgage scraper — CountyWeb MTG/CON",
            [PYTHON, "gvl_monitor.py", "--mode", "mortgages", "--days", str(args.days)],
            dry_run=args.dry_run,
        )

    # ── Step 3: Enrichment ────────────────────────────────────────────────────
    if not args.no_enrich:
        ok &= run_step(
            "Lead enrichment — LLC → human",
            [PYTHON, "enrich.py", "--run-pending"],
            dry_run=args.dry_run,
        )

    # ── Step 4: High-confidence alert ─────────────────────────────────────────
    if not args.no_alert:
        if args.dry_run:
            print(f"\n  [dry-run] Would query enriched_leads for score > {HIGH_CONFIDENCE_THRESHOLD} since {run_ts}")
        else:
            hot_leads = fetch_high_confidence_leads(since=run_start)
            send_alert(hot_leads, run_ts, dry_run=False)

    # ── Summary ───────────────────────────────────────────────────────────────
    elapsed = (datetime.now(timezone.utc) - run_start).seconds
    print(f"\n{'═' * 60}")
    print(f"  Pipeline {'complete' if ok else 'finished with errors'}  ·  {elapsed}s elapsed")
    print(f"{'═' * 60}\n")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
