"""
classify_post.py — Backfill topic clusters on existing blog posts via Gemini.

Every article on /insights belongs to exactly one of 5 topic clusters, which
power the /insights/topics/{slug} hub pages, article breadcrumbs, and the
"related posts" rail. New posts get a cluster at generation time; this tool
backfills posts that predate clustering (or re-classifies on --override).

Usage:
    python classify_post.py --id <uuid>                 # classify one post
    python classify_post.py --all                       # classify all posts missing cluster
    python classify_post.py --all --override            # re-classify every post
    python classify_post.py --all --status PUBLISHED    # restrict to PUBLISHED
    python classify_post.py --id <uuid> --dry-run       # preview, don't save

Required env vars (same as generate_insights.py):
    GEMINI_API_KEY
    SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)
    SUPABASE_SERVICE_KEY
"""

import argparse
import json
import logging
import os
import sys
import time
from pathlib import Path

from dotenv import load_dotenv

sys.path.insert(0, str(Path(__file__).resolve().parent))
from generate_insights import VALID_CLUSTERS  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env.local")

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(message)s")
log = logging.getLogger(__name__)

GEMINI_MODEL = "gemini-2.5-flash"

# Cluster definitions — intentionally a tight copy of src/lib/clusters.ts so
# Gemini has enough context to assign confidently. Update both when clusters
# change.
CLUSTER_DEFINITIONS = {
    "booking-forms":
        "Broken booking / contact forms. Forms posting to dead endpoints (404/405), "
        "silent submission failures, testing forms without a developer, online booking "
        "widgets that fail on iPhone Safari, click-to-call reliability.",
    "mobile-experience":
        "Mobile layout and viewport. Missing viewport meta tag, desktop sites pinch-zoomed "
        "on phones, iPhone vs. Android rendering differences, tap target sizes, mobile "
        "Google ranking signals.",
    "trust-and-stale-content":
        "New-patient trust signals, stale content, and Google Business Profile alignment. "
        "Stale copyright years, stock vs. real staff photos, out-of-date insurance carrier "
        "lists, 'call for pricing' vs. transparent pricing, GBP/website phone/address/hours "
        "mismatches, HIPAA-aware form handling.",
    "lighthouse-core-vitals":
        "Site speed, Lighthouse scores, Core Web Vitals. Uncompressed hero images, embedded "
        "chat widgets, tracking pixel bloat, reading a Lighthouse score, which speed issues "
        "are cheap to fix vs. require a rebuild.",
    "cleanup-vs-rebuild":
        "Deciding between a website cleanup vs. a full rebuild. Signals cleanup is enough, "
        "signals the foundation is gone, what a rebuild actually involves, when REBB will "
        "tell a practice to rebuild even though cleanup is the offer.",
}

_CLASSIFY_PROMPT_TEMPLATE = """\
You classify articles for REBB Advisors, a firm that does flat-fee website cleanup \
for dental practices.

## The 5 topic clusters

{cluster_definitions}

## Rules
- Every article maps to exactly ONE cluster — pick the single best fit, not a \
blend.
- If an article covers multiple topics, pick the cluster that matches the \
article's strongest / primary angle.
- Use ONLY these exact cluster slugs: {valid_slugs}
- Return ONLY valid JSON — no markdown fences, no explanation, nothing else.

## Article to classify

Title: {title}

Summary: {summary}

First portion of body:
{body_excerpt}

## Task
Return JSON of the form:
{{"cluster": "<slug>", "confidence": 0-100, "rationale": "one short sentence"}}
"""


def _call_gemini(client, types, prompt: str, max_retries: int = 3) -> dict:
    last_exc: Exception | None = None
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(temperature=0.2),
            )
            raw = response.text.strip()
            if raw.startswith("```"):
                lines = raw.splitlines()
                raw = "\n".join(lines[1:])
                if raw.rstrip().endswith("```"):
                    raw = raw[: raw.rfind("```")]
                raw = raw.strip()
            return json.loads(raw)
        except json.JSONDecodeError as exc:
            last_exc = exc
            log.warning(f"Gemini returned invalid JSON (attempt {attempt + 1}/{max_retries}): {exc}")
        except Exception as exc:
            last_exc = exc
            log.warning(f"Gemini call failed (attempt {attempt + 1}/{max_retries}): {exc}")
        if attempt < max_retries - 1:
            time.sleep(2 ** attempt)
    raise RuntimeError(f"Gemini classification failed after {max_retries} attempts: {last_exc}")


def classify(client, types, title: str, summary: str | None, body_md: str) -> dict:
    """Call Gemini, return {cluster, confidence, rationale}. Validates cluster slug."""
    excerpt = (body_md or "")[:1200]
    prompt = _CLASSIFY_PROMPT_TEMPLATE.format(
        cluster_definitions="\n".join(
            f"- [{slug}] {defn}" for slug, defn in CLUSTER_DEFINITIONS.items()
        ),
        valid_slugs=", ".join(sorted(VALID_CLUSTERS)),
        title=title,
        summary=summary or "(no summary)",
        body_excerpt=excerpt,
    )
    result = _call_gemini(client, types, prompt)
    cluster = (result.get("cluster") or "").strip()
    if cluster not in VALID_CLUSTERS:
        raise ValueError(
            f"Gemini returned invalid cluster {cluster!r}. "
            f"Must be one of: {sorted(VALID_CLUSTERS)}"
        )
    return {
        "cluster": cluster,
        "confidence": int(result.get("confidence", 0) or 0),
        "rationale": (result.get("rationale") or "").strip(),
    }


def _get_gemini_client():
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
    return genai.Client(api_key=api_key), types


def _get_supabase():
    from supabase import create_client
    url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")
    if not url or not key:
        log.error("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env.local")
        sys.exit(1)
    return create_client(url, key)


def _fetch_targets(supabase, post_id: str | None, override: bool, status_filter: str | None):
    query = supabase.table("blog_posts").select("id, title, summary, body_md, cluster, status")
    if post_id:
        query = query.eq("id", post_id)
    else:
        if not override:
            query = query.is_("cluster", "null")
        if status_filter:
            query = query.eq("status", status_filter)
        query = query.order("created_at", desc=True)
    result = query.execute()
    return result.data or []


def main() -> None:
    parser = argparse.ArgumentParser(description="Classify blog posts into topic clusters")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--id", help="Classify one post by UUID")
    group.add_argument("--all", action="store_true", help="Classify all posts missing cluster")
    parser.add_argument("--override", action="store_true",
                        help="With --all, re-classify posts that already have a cluster")
    parser.add_argument("--status", choices=["DRAFT", "APPROVED", "PUBLISHED"],
                        help="With --all, restrict to this status")
    parser.add_argument("--dry-run", action="store_true",
                        help="Preview classifications without writing to the DB")
    args = parser.parse_args()

    supabase = _get_supabase()
    gemini, types = _get_gemini_client()

    targets = _fetch_targets(supabase, args.id, args.override, args.status)
    if not targets:
        log.info("No posts matched. Nothing to classify.")
        return

    log.info(f"Classifying {len(targets)} post(s)...")
    updated = 0
    failed = 0
    for idx, post in enumerate(targets, 1):
        title = post["title"]
        log.info(f"[{idx}/{len(targets)}] {title[:80]}")
        try:
            result = classify(gemini, types, title, post.get("summary"), post.get("body_md") or "")
        except Exception as exc:
            log.error(f"  Classification failed: {exc}")
            failed += 1
            continue

        print(
            f"    → cluster={result['cluster']}  "
            f"confidence={result['confidence']}  "
            f"rationale={result['rationale']}"
        )
        if post.get("cluster") and post["cluster"] != result["cluster"]:
            print(f"    (was: {post['cluster']})")

        if args.dry_run:
            continue

        supabase.table("blog_posts").update({"cluster": result["cluster"]}).eq("id", post["id"]).execute()
        updated += 1
        # Gentle rate-limit — Gemini free tier is generous but not infinite
        if idx < len(targets):
            time.sleep(0.5)

    print()
    if args.dry_run:
        log.info(f"DRY RUN — reviewed {len(targets)}, would update {len(targets) - failed}, {failed} failed.")
    else:
        log.info(f"Done. Updated {updated}, failed {failed}.")


if __name__ == "__main__":
    main()
