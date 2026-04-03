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

GEMINI_MODEL = "gemini-1.5-pro"

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
        import google.generativeai as genai
    except ImportError:
        log.error("google-generativeai is not installed. Run: pip install google-generativeai")
        sys.exit(1)

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        log.error("GEMINI_API_KEY not set in .env.local")
        sys.exit(1)

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(
        model_name=GEMINI_MODEL,
        system_instruction=SYSTEM_PROMPT,
    )

    log.info(f"Calling Gemini ({GEMINI_MODEL}) for topic: {topic!r}")
    response = model.generate_content(topic)
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
    parser.add_argument("--topic", required=True, help="Article topic / prompt")
    parser.add_argument("--dry-run", action="store_true",
                        help="Generate and preview without saving to Supabase")
    parser.add_argument("--discord-webhook", default=os.getenv("DISCORD_WEBHOOK_URL"),
                        help="Discord webhook URL for 'Review Needed' alert")
    args = parser.parse_args()

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

    # 6. Optional Discord notification
    if args.discord_webhook:
        send_discord_notification(args.discord_webhook, post_id, title, summary)
    else:
        log.info("No DISCORD_WEBHOOK_URL set — skipping notification. "
                 "Pass --discord-webhook or add it to .env.local.")


if __name__ == "__main__":
    main()
