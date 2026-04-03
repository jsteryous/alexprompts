"""
generate_insights.py — AI content generator for REBB Advisors Market Insights

Usage:
    python generate_insights.py --topic "Why Greenville pool companies lose Q2 contracts"
    python generate_insights.py --topic "..." --dry-run         # preview without saving
    python generate_insights.py --topic "..." --discord-webhook URL

Reads .env.local from the project root automatically.

Required env vars:
    GEMINI_API_KEY          — Google AI Studio key
    SUPABASE_URL            — same as NEXT_PUBLIC_SUPABASE_URL
    SUPABASE_SERVICE_KEY    — service role key (bypasses RLS for writes)

Optional env vars:
    DISCORD_WEBHOOK_URL     — Discord incoming webhook for "Review Needed" alerts
    RESEND_API_KEY          — Resend.com API key for email notifications
    NOTIFICATION_EMAIL      — address to send "Review Needed" emails to
"""

import argparse
import logging
import os
import re
import sys
import unicodedata
from datetime import datetime, timezone
from pathlib import Path

import requests
from dotenv import load_dotenv
from supabase import create_client

# ── Load .env.local from project root ───────────────────────────────────────
ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env.local")

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(message)s")
log = logging.getLogger(__name__)

GEMINI_MODEL = "gemini-2.5-flash"

SYSTEM_PROMPT = """You are a sharp B2B content strategist writing for REBB Advisors,
a proactive lead-intelligence agency serving Upstate SC service businesses
(HVAC, landscaping, pool, pressure washing, electrical, facilities management).

Tone: confident, blunt, specific. No fluff. No generic marketing language.
Audience: owner-operators of local service businesses in Greenville County.
Format: Markdown. Use ## headers, bullet lists where appropriate.
Length: 600–900 words.
End with a one-sentence call to action referencing REBB Advisors.

Do NOT include a YAML front matter block or a title at the top —
the title will be extracted separately."""


# ── Helpers ──────────────────────────────────────────────────────────────────

def slugify(text: str) -> str:
    """Convert a string to a URL-safe slug."""
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text[:100]


def extract_title_and_body(markdown: str) -> tuple[str, str]:
    """
    Gemini often returns a leading # Title line even when asked not to.
    If it does, split it out; otherwise synthesise a title from the topic.
    """
    lines = markdown.strip().splitlines()
    if lines and lines[0].startswith("# "):
        title = lines[0].lstrip("# ").strip()
        body = "\n".join(lines[1:]).strip()
    else:
        # No leading title — caller will supply one
        title = ""
        body = markdown.strip()
    return title, body


def extract_summary(body_md: str, max_chars: int = 280) -> str:
    """Return the first non-header paragraph, truncated."""
    for line in body_md.splitlines():
        line = line.strip()
        if line and not line.startswith("#"):
            return line[:max_chars] + ("…" if len(line) > max_chars else "")
    return ""


def generate_with_gemini(topic: str) -> str:
    """Call the Gemini API and return the raw Markdown string."""
    try:
        from google import genai
        from google.genai import types
    except ImportError:
        log.error("google-genai is not installed. Run: pip install google-genai")
        sys.exit(1)

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        log.error("GEMINI_API_KEY not set in .env.local")
        sys.exit(1)

    client = genai.Client(api_key=api_key)

    log.info(f"Calling Gemini ({GEMINI_MODEL}) for topic: {topic!r}")
    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=topic,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
        ),
    )
    return response.text


def save_draft(supabase_client, title: str, slug: str, body_md: str,
               summary: str, topic: str) -> dict:
    """Insert a DRAFT blog post and return the row."""
    row = {
        "title": title,
        "slug": slug,
        "body_md": body_md,
        "summary": summary,
        "tags": [],
        "status": "DRAFT",
        "topic": topic,
        "gemini_model": GEMINI_MODEL,
    }
    result = supabase_client.table("blog_posts").insert(row).execute()
    return result.data[0]


def send_email_notification(post_id: str, title: str, summary: str,
                             body_md: str) -> None:
    """Send a 'Review Needed' email via Resend (https://resend.com)."""
    api_key = os.getenv("RESEND_API_KEY")
    to_addr = os.getenv("NOTIFICATION_EMAIL")
    if not api_key or not to_addr:
        log.info("RESEND_API_KEY / NOTIFICATION_EMAIL not set — skipping email.")
        return

    approve_cmd = f"python approve_post.py --id {post_id} --status PUBLISHED"
    edit_cmd    = f"python approve_post.py --id {post_id} --edit"
    view_cmd    = f"python approve_post.py --id {post_id} --view"

    # Plain-text preview of the first ~800 chars of body
    preview = body_md[:800] + ("\n\n[… truncated]" if len(body_md) > 800 else "")

    html = f"""
<html><body style="font-family:system-ui,sans-serif;max-width:640px;margin:40px auto;color:#0a0a0a">
  <p style="font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#16a34a">
    REBB Advisors · Market Insights
  </p>
  <h2 style="margin:8px 0 4px">{title}</h2>
  <p style="color:#555;margin:0 0 24px">{summary or "(no summary)"}</p>

  <table style="border-collapse:collapse;width:100%;margin-bottom:24px">
    <tr><td style="padding:6px 12px 6px 0;color:#888;font-size:13px;white-space:nowrap">Post ID</td>
        <td style="padding:6px 0;font-family:monospace;font-size:13px">{post_id}</td></tr>
    <tr><td style="padding:6px 12px 6px 0;color:#888;font-size:13px">Status</td>
        <td style="padding:6px 0;font-size:13px">DRAFT</td></tr>
  </table>

  <p style="font-size:13px;font-weight:600;margin-bottom:6px">Terminal commands (run from scripts/):</p>
  <pre style="background:#f4f4f5;padding:14px;border-radius:8px;font-size:12px;overflow-x:auto">{view_cmd}
{edit_cmd}
{approve_cmd}</pre>

  <details style="margin-top:24px">
    <summary style="cursor:pointer;font-size:13px;color:#555">Preview article body</summary>
    <pre style="background:#fafafa;border:1px solid #e5e7eb;padding:14px;border-radius:8px;font-size:12px;white-space:pre-wrap;margin-top:8px">{preview}</pre>
  </details>
</body></html>"""

    try:
        resp = requests.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={
                "from": "REBB Insights <onboarding@resend.dev>",
                "to": [to_addr],
                "subject": f"[Review Needed] {title}",
                "html": html,
            },
            timeout=10,
        )
        resp.raise_for_status()
        log.info(f"Email sent to {to_addr}.")
    except requests.RequestException as exc:
        body = getattr(exc.response, "text", "") if hasattr(exc, "response") else ""
        log.warning(f"Email notification failed (non-fatal): {exc} — {body}")


def send_discord_notification(webhook_url: str, post_id: str, title: str,
                               summary: str) -> None:
    """POST a 'Review Needed' embed to a Discord webhook."""
    payload = {
        "embeds": [
            {
                "title": f"Review Needed: {title}",
                "description": summary or "*(no summary)*",
                "color": 0x22C55E,  # green-500
                "fields": [
                    {"name": "Post ID", "value": f"`{post_id}`", "inline": True},
                    {"name": "Status", "value": "DRAFT", "inline": True},
                    {
                        "name": "Approve command",
                        "value": f"```\npython approve_post.py --id {post_id} --status PUBLISHED\n```",
                        "inline": False,
                    },
                ],
                "footer": {"text": "REBB Advisors · Market Insights engine"},
            }
        ]
    }
    try:
        resp = requests.post(webhook_url, json=payload, timeout=10)
        resp.raise_for_status()
        log.info("Discord notification sent.")
    except requests.RequestException as exc:
        log.warning(f"Discord notification failed (non-fatal): {exc}")


# ── Main ─────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description="Generate a Market Insights draft with Gemini")
    parser.add_argument("--topic", help="Article topic / prompt")
    parser.add_argument("--dry-run", action="store_true",
                        help="Generate and preview without saving to Supabase")
    parser.add_argument("--discord-webhook", default=os.getenv("DISCORD_WEBHOOK_URL"),
                        help="Discord webhook URL for 'Review Needed' alert")
    parser.add_argument("--test-email", action="store_true",
                        help="Send a test email via Resend and exit (no generation)")
    args = parser.parse_args()

    # ── Test email mode ──────────────────────────────────────────────────────
    if args.test_email:
        log.info("Sending test email...")
        send_email_notification(
            post_id="00000000-test-0000-0000-000000000000",
            title="Test: REBB Insights Email is Working",
            summary="This is a test notification confirming your Resend integration is live.",
            body_md="## Test Article\n\nIf you received this, email notifications are configured correctly.\n\nYou will receive one of these each time a new draft is generated.",
        )
        return

    if not args.topic:
        parser.error("--topic is required (or use --test-email)")

    # 1. Generate content
    raw_markdown = generate_with_gemini(args.topic)

    # 2. Parse title / body
    title, body_md = extract_title_and_body(raw_markdown)
    if not title:
        # Fallback: derive title from topic
        title = args.topic.strip().rstrip(".")
    slug = slugify(title)
    summary = extract_summary(body_md)

    # 3. Print preview
    separator = "─" * 60
    print(f"\n{separator}")
    print(f"  DRAFT PREVIEW")
    print(separator)
    print(f"  Title   : {title}")
    print(f"  Slug    : {slug}")
    print(f"  Summary : {summary}")
    print(separator)
    print()
    print(body_md[:1200] + ("\n\n[… truncated for preview]" if len(body_md) > 1200 else ""))
    print()

    if args.dry_run:
        log.info("DRY RUN — nothing written to Supabase.")
        return

    # 4. Connect to Supabase
    url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")
    if not url or not key:
        log.error("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env.local")
        sys.exit(1)

    client = create_client(url, key)

    # 5. Save DRAFT
    post = save_draft(client, title, slug, body_md, summary, args.topic)
    post_id = post["id"]

    print(f"{separator}")
    print(f"  DRAFT SAVED")
    print(separator)
    print(f"  ID      : {post_id}")
    print(f"  Title   : {title}")
    print(f"  Created : {post.get('created_at', 'n/a')}")
    print()
    print("  To approve and publish:")
    print(f"    python approve_post.py --id {post_id} --status PUBLISHED")
    print(f"{separator}\n")

    # 6. Notifications (email + optional Discord — both non-fatal)
    send_email_notification(post_id, title, summary, body_md)

    if args.discord_webhook:
        send_discord_notification(args.discord_webhook, post_id, title, summary)


if __name__ == "__main__":
    main()
