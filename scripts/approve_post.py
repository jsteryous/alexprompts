"""
approve_post.py — Review, edit, and publish blog drafts.

Usage:
    python approve_post.py --list-drafts
    python approve_post.py --id <uuid> --view
    python approve_post.py --id <uuid> --edit
    python approve_post.py --id <uuid> --status PUBLISHED
    python approve_post.py --id <uuid> --status DRAFT

Valid statuses: DRAFT | APPROVED | PUBLISHED

Reads .env.local from the project root automatically.

Required env vars:
    SUPABASE_URL         (or NEXT_PUBLIC_SUPABASE_URL)
    SUPABASE_SERVICE_KEY — service role key; bypasses RLS for writes

Optional env vars:
    EDITOR               — editor command for --edit (default: notepad on Windows, nano elsewhere)
                           Use "code --wait" for VS Code
"""

import argparse
import logging
import os
import subprocess
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client

# Import summary extractor from the sibling module
sys.path.insert(0, str(Path(__file__).resolve().parent))
from generate_insights import extract_summary  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env.local")

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(message)s")
log = logging.getLogger(__name__)

VALID_STATUSES = {"DRAFT", "APPROVED", "PUBLISHED"}
SEP = "─" * 72


def get_client():
    url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")
    if not url or not key:
        log.error("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env.local")
        sys.exit(1)
    return create_client(url, key)


def fetch_post(client, post_id: str) -> dict:
    result = (
        client.table("blog_posts")
        .select("id, title, slug, summary, body_md, status, created_at, topic, tags")
        .eq("id", post_id)
        .execute()
    )
    if not result.data:
        log.error(f"No post found with id={post_id}")
        sys.exit(1)
    return result.data[0]


# ── list-drafts ───────────────────────────────────────────────────────────────

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

    print(f"\n{SEP}")
    print(f"  {'STATUS':<12} {'CREATED':<22} TITLE")
    print(SEP)
    for p in posts:
        created = p.get("created_at", "")[:19].replace("T", " ")
        print(f"  {p['status']:<12} {created:<22} {p['title']}")
        print(f"  {'ID:':<12} {p['id']}")
        if p.get("topic"):
            print(f"  {'Topic:':<12} {p['topic'][:70]}")
        print()
    print(f"  {len(posts)} post(s) pending review.")
    print(f"{SEP}\n")
    print("  Commands:")
    print("    python approve_post.py --id <uuid> --view")
    print("    python approve_post.py --id <uuid> --edit")
    print(f"{SEP}\n")


# ── view ──────────────────────────────────────────────────────────────────────

def view_post(client, post_id: str) -> None:
    post = fetch_post(client, post_id)
    created = post.get("created_at", "")[:19].replace("T", " ")

    print(f"\n{SEP}")
    print(f"  {post['status']} · {post['title']}")
    print(f"  ID: {post_id}  |  Created: {created}")
    if post.get("topic"):
        print(f"  Topic: {post['topic']}")
    print(SEP)
    print()
    print(post.get("body_md", ""))
    print()
    print(SEP)
    print(f"  Summary: {post.get('summary', '(none)')}")
    print(SEP)
    print()
    print("  Next steps:")
    print(f"    python approve_post.py --id {post_id} --edit")
    print(f"    python approve_post.py --id {post_id} --status PUBLISHED")
    print()


# ── edit ──────────────────────────────────────────────────────────────────────

def edit_post(client, post_id: str) -> None:
    post = fetch_post(client, post_id)

    # Write body to a temp .md file
    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".md", delete=False, encoding="utf-8",
        prefix=f"rebb_draft_{post_id[:8]}_"
    ) as tmp:
        tmp.write(f"# {post['title']}\n\n")
        tmp.write(post.get("body_md", ""))
        tmp_path = tmp.name

    # Determine editor
    default_editor = "notepad" if sys.platform == "win32" else "nano"
    editor = os.getenv("EDITOR", default_editor)

    print(f"\n  Opening draft in {editor!r} — save and close to continue.")
    print(f"  File: {tmp_path}\n")

    try:
        subprocess.run([editor, tmp_path], check=True)
    except subprocess.CalledProcessError:
        log.error(f"Editor exited with an error. Your file is still at: {tmp_path}")
        sys.exit(1)

    # Read back
    edited = Path(tmp_path).read_text(encoding="utf-8").strip()
    Path(tmp_path).unlink(missing_ok=True)

    # Split title / body (same logic as generate_insights)
    lines = edited.splitlines()
    if lines and lines[0].startswith("# "):
        new_title = lines[0].lstrip("# ").strip()
        new_body = "\n".join(lines[1:]).strip()
    else:
        new_title = post["title"]
        new_body = edited

    # Show diff summary
    old_chars = len(post.get("body_md", ""))
    new_chars = len(new_body)
    delta = new_chars - old_chars
    sign = "+" if delta >= 0 else ""
    print(f"\n{SEP}")
    print(f"  EDIT SUMMARY")
    print(SEP)
    print(f"  Title  : {new_title}")
    print(f"  Body   : {old_chars} → {new_chars} chars ({sign}{delta})")
    print(SEP)

    if new_body == post.get("body_md", "") and new_title == post["title"]:
        print("\n  No changes detected. Nothing saved.\n")
        return

    new_summary = extract_summary(new_body)

    # Confirm
    print("\n  What would you like to do?")
    print("  [p] Save edits and PUBLISH now")
    print("  [s] Save edits as DRAFT (review later)")
    print("  [x] Discard edits")
    choice = input("\n  Choice [p/s/x]: ").strip().lower()

    if choice == "x":
        print("  Edits discarded.\n")
        return

    updates: dict = {"title": new_title, "body_md": new_body, "summary": new_summary}

    if choice == "p":
        updates["status"] = "PUBLISHED"
        # Only set published_at on first publish — preserve original date on re-publish
        if not post.get("published_at"):
            updates["published_at"] = datetime.now(timezone.utc).isoformat()
    else:
        updates["status"] = "DRAFT"

    client.table("blog_posts").update(updates).eq("id", post_id).execute()

    action = "PUBLISHED" if choice == "p" else "saved as DRAFT"
    print(f"\n  Done — edits {action}.")
    if choice == "p":
        print(f"  Live at: /insights/{post['slug']}\n")


# ── status update ─────────────────────────────────────────────────────────────

def update_status(client, post_id: str, new_status: str) -> None:
    if new_status not in VALID_STATUSES:
        log.error(f"Invalid status '{new_status}'. Must be one of: {', '.join(VALID_STATUSES)}")
        sys.exit(1)

    fetch = client.table("blog_posts").select("id, title, slug, status, published_at").eq("id", post_id).execute()
    if not fetch.data:
        log.error(f"No post found with id={post_id}")
        sys.exit(1)

    post = fetch.data[0]
    old_status = post["status"]

    if old_status == new_status:
        log.info(f"Post '{post['title']}' is already {new_status}. Nothing changed.")
        return

    updates: dict = {"status": new_status}
    if new_status == "PUBLISHED" and not post.get("published_at"):
        # Only set published_at on first publish — preserve original date on re-publish
        updates["published_at"] = datetime.now(timezone.utc).isoformat()

    client.table("blog_posts").update(updates).eq("id", post_id).execute()

    print(f"\n{SEP}")
    print(f"  STATUS UPDATED")
    print(SEP)
    print(f"  ID     : {post_id}")
    print(f"  Title  : {post['title']}")
    print(f"  Before : {old_status}")
    print(f"  After  : {new_status}")
    if new_status == "PUBLISHED":
        print(f"  Live at: /insights/{post['slug']}")
    print(f"{SEP}\n")


# ── main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description="Review, edit, and publish blog drafts")
    parser.add_argument("--id", help="Post UUID")
    parser.add_argument(
        "--status",
        choices=list(VALID_STATUSES),
        help="Set status: DRAFT | APPROVED | PUBLISHED",
    )
    parser.add_argument("--list-drafts", action="store_true",
                        help="List all DRAFT and APPROVED posts")
    parser.add_argument("--view", action="store_true",
                        help="Print full post body to terminal")
    parser.add_argument("--edit", action="store_true",
                        help="Open post in editor, save changes, optionally publish")
    args = parser.parse_args()

    client = get_client()

    if args.list_drafts:
        list_drafts(client)
        return

    if not args.id:
        parser.error("--id is required with --view, --edit, or --status")

    if args.view:
        view_post(client, args.id)
    elif args.edit:
        edit_post(client, args.id)
    elif args.status:
        update_status(client, args.id, args.status)
    else:
        parser.error("Specify --view, --edit, or --status")


if __name__ == "__main__":
    main()
