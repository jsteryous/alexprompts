"""
approve_post.py — Flip a blog_post status in Supabase.

Usage:
    python approve_post.py --id <uuid> --status PUBLISHED
    python approve_post.py --id <uuid> --status APPROVED
    python approve_post.py --id <uuid> --status DRAFT
    python approve_post.py --list-drafts

Valid statuses: DRAFT | APPROVED | PUBLISHED

Reads .env.local from the project root automatically.

Required env vars:
    SUPABASE_URL         (or NEXT_PUBLIC_SUPABASE_URL)
    SUPABASE_SERVICE_KEY — service role key; bypasses RLS for writes
"""

import argparse
import logging
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env.local")

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(message)s")
log = logging.getLogger(__name__)

VALID_STATUSES = {"DRAFT", "APPROVED", "PUBLISHED"}


def get_client():
    url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")
    if not url or not key:
        log.error("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env.local")
        sys.exit(1)
    return create_client(url, key)


def list_drafts(client) -> None:
    result = (
        client.table("blog_posts")
        .select("id, title, status, created_at, topic")
        .in_("status", ["DRAFT", "APPROVED"])
        .order("created_at", desc=True)
        .execute()
    )
    posts = result.data
    if not posts:
        print("No DRAFT or APPROVED posts found.")
        return

    sep = "─" * 72
    print(f"\n{sep}")
    print(f"  {'STATUS':<12} {'CREATED':<22} TITLE")
    print(sep)
    for p in posts:
        created = p.get("created_at", "")[:19].replace("T", " ")
        print(f"  {p['status']:<12} {created:<22} {p['title']}")
        print(f"  {'ID:':<12} {p['id']}")
        if p.get("topic"):
            print(f"  {'Topic:':<12} {p['topic'][:70]}")
        print()
    print(f"  {len(posts)} post(s) pending review.")
    print(f"{sep}\n")


def update_status(client, post_id: str, new_status: str) -> None:
    if new_status not in VALID_STATUSES:
        log.error(f"Invalid status '{new_status}'. Must be one of: {', '.join(VALID_STATUSES)}")
        sys.exit(1)

    # Fetch current row first so we can show a diff
    fetch = client.table("blog_posts").select("id, title, status").eq("id", post_id).execute()
    if not fetch.data:
        log.error(f"No post found with id={post_id}")
        sys.exit(1)

    post = fetch.data[0]
    old_status = post["status"]

    if old_status == new_status:
        log.info(f"Post '{post['title']}' is already {new_status}. Nothing changed.")
        return

    updates = {"status": new_status}
    if new_status == "PUBLISHED":
        from datetime import datetime, timezone
        updates["published_at"] = datetime.now(timezone.utc).isoformat()

    client.table("blog_posts").update(updates).eq("id", post_id).execute()

    sep = "─" * 60
    print(f"\n{sep}")
    print(f"  STATUS UPDATED")
    print(sep)
    print(f"  ID     : {post_id}")
    print(f"  Title  : {post['title']}")
    print(f"  Before : {old_status}")
    print(f"  After  : {new_status}")
    if new_status == "PUBLISHED":
        print(f"  Live at: /insights/{post_id}")
    print(f"{sep}\n")


def main() -> None:
    parser = argparse.ArgumentParser(description="Manage blog_post status in Supabase")
    parser.add_argument("--id", help="Post UUID to update")
    parser.add_argument(
        "--status",
        choices=list(VALID_STATUSES),
        help="New status: DRAFT | APPROVED | PUBLISHED",
    )
    parser.add_argument("--list-drafts", action="store_true",
                        help="List all DRAFT and APPROVED posts")
    args = parser.parse_args()

    client = get_client()

    if args.list_drafts:
        list_drafts(client)
        return

    if not args.id or not args.status:
        parser.error("--id and --status are required unless using --list-drafts")

    update_status(client, args.id, args.status)


if __name__ == "__main__":
    main()
