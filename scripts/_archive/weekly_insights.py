"""
weekly_insights.py — Autonomously generates a fresh article topic each week using
Gemini, then calls generate_insights.py to produce the article.

How it works:
  1. Pulls recent article titles from Supabase (avoids repeating angles)
  2. Asks Gemini to generate 3 topic candidates and score them
  3. Passes the highest-scoring topic to generate_insights.py

No fixed topic list. No state file. Runs indefinitely without maintenance.

Usage:
    python weekly_insights.py               # generate topic + article
    python weekly_insights.py --dry-run     # show selected topic, stop before article
"""

import argparse
import json
import logging
import os
import subprocess
import sys
import time
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env.local")

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(message)s")
log = logging.getLogger(__name__)

SCRIPTS_DIR = Path(__file__).resolve().parent
GEMINI_MODEL = "gemini-2.5-flash"

# Topic clusters — source of truth is src/lib/clusters.ts. Keep in sync with
# VALID_CLUSTERS in generate_insights.py. Every category below maps to exactly
# one cluster. The weekly runner passes the winning cluster through to
# generate_insights.py via --cluster, which persists it to blog_posts.cluster.
VALID_CLUSTERS = {
    "booking-forms",
    "mobile-experience",
    "trust-and-stale-content",
    "lighthouse-core-vitals",
    "cleanup-vs-rebuild",
}

# ── Category buckets ──────────────────────────────────────────────────────────
# Each entry is (cluster_slug, brief). Weight a cluster by listing more entries
# for it. Gemini generates one candidate per cluster present in the prompt.

CATEGORIES: list[tuple[str, str]] = [
    # Broken booking / contact forms — the #1 audit finding
    ("booking-forms",
     "Broken booking and contact forms on dental practice websites — how to tell when a form is actually submitting vs. silently 404ing, why 'it worked when I tested it' isn't enough, what a practice loses per week when new-patient forms are dead, and how to test your own form in under 60 seconds without a developer"),

    # Mobile viewport / mobile experience
    ("mobile-experience",
     "Mobile experience on dental practice websites — why desktop-designed sites get pinch-zoomed on phones, how a missing viewport tag drops a practice out of Google's mobile results, why iPhone Safari and Android Chrome can render the same site completely differently, and the 3-minute self-check any office manager can run"),

    # New-patient trust signals
    ("trust-and-stale-content",
     "New-patient trust signals on a dental website — what a first-time patient looks for in the first 10 seconds (real staff photos, insurance clarity, address/hours matching Google, clear new-patient pricing), what actively damages trust (stock photos of strangers in lab coats, stale copyright, broken phone links), and the difference a cleanup makes on conversion"),

    # Online booking reality check
    ("booking-forms",
     "Online booking on a dental practice site that actually works — why embedded booking widgets fail on iPhone Safari but pass on desktop, why 'click to call' is still the highest-converting path for most practices, and when a custom booking form beats third-party scheduling"),

    # Google Business Profile ↔ website alignment
    ("trust-and-stale-content",
     "Google Business Profile and website alignment for dental practices — how a mismatched phone number, address, or hours between your GBP and your website footer tanks local pack ranking, how to audit the two in 10 minutes, and why fixing this usually moves the needle faster than any on-page SEO change"),

    # Speed / Lighthouse / Core Web Vitals
    ("lighthouse-core-vitals",
     "Why dental practice websites load slowly and what actually fixes it — the real culprits (uncompressed hero images, embedded chat widgets, 14 tracking pixels), why a slow site hurts both patient experience and Google ranking, how to read a Lighthouse score without a developer, and which problems are cheap to fix vs. which require a rebuild"),

    # Cleanup vs. rebuild decision
    ("cleanup-vs-rebuild",
     "When a dental website needs a cleanup vs. a full rebuild — specific signals that cleanup is the right call (working CMS, decent structure, fixable issues) vs. signals the foundation is gone (no mobile framework, no content management, abandoned platform), why REBB will tell a practice to rebuild even though cleanup is our offer, and what a rebuild actually involves"),

    # Insurance carrier pages
    ("trust-and-stale-content",
     "Insurance, pricing, and transparency pages on a dental website — why an out-of-date insurance list actively loses new patients at the decision moment, why 'call for pricing' converts worse than a simple starting-price range, and the handful of pages every dental site needs that most are missing"),

    # HIPAA-aware web practices (practical, not legal advice)
    ("trust-and-stale-content",
     "HIPAA-aware practices for dental websites — what a dental practice should and shouldn't collect on a contact form, why most dental form plugins handle PHI incorrectly by default, and the practical setup that keeps a practice safe without making the form unusable"),
]

# ── Topic generation prompt ───────────────────────────────────────────────────

_TOPIC_PROMPT_TEMPLATE = """\
You generate article topic briefs for REBB Advisors, a Greenville SC firm that does
flat-fee website cleanup for dental practices. The lead magnet is a free screenshot
audit: practice sends their URL, REBB replies with screenshots of what's broken.
If cleanup fixes it, REBB quotes the flat fee. If it needs a rebuild, REBB says so.

The audience is a dental practice owner or office manager — NOT a developer, and
NOT interested in being pitched SEO packages. The ideal topic makes that reader
think: "we probably have this problem — let me go check our site right now."

## Topic clusters (each bullet is a category; the bracketed slug is the cluster it belongs to)
{categories}

## Recently published titles (do not repeat these angles)
{recent_titles}

## What makes a GOOD topic brief
- Specific enough that a reader knows exactly what they will learn from the title alone
- Takes a clear position or reveals something non-obvious about dental practice websites
- Procedural or comparative — not "here's why X matters" but "here's exactly how X works"
- Grounded in the actual failures REBB sees on dental sites (dead booking forms, no
  mobile viewport, stale copyright, mismatched GBP, low Lighthouse scores)
- Accessible: the insight should land for a practice owner, not a developer
- Can be borderline uncomfortable — says the thing most dental-marketing blogs quietly skip

Good examples:
- "How to tell if your dental practice's contact form is silently broken — a 60-second test any office manager can run"
- "Why your dental website looks fine on your phone but terrible on every new patient's phone"
- "The difference between a dental website cleanup and a rebuild — and how to tell which one you actually need"
- "Why a 'Call for pricing' page is losing your dental practice new patients — and what to put there instead"
- "What a Google Business Profile–website mismatch costs a dental practice in local search, and how to fix it in 10 minutes"
- "Why most dental site contact forms handle patient information incorrectly, and the simple fix"
- "The three things a new dental patient checks in the first 10 seconds on your website"
- "Why your insurance list page is probably years out of date, and why new patients are bouncing because of it"

## Hard rules — never produce these
- Seasonal framing: "Why spring is important for..."
- Starts with "Why your..." unless followed by something genuinely specific
- Generic "5 reasons every dental website needs..." listicles
- Vague outcome promises: "...and how it can transform your practice"
- Anything about SEO rankings, lead volume, or revenue guarantees
- References to other verticals (law firms, HVAC, chiropractors, etc.)
- Pitching retainers, ongoing SEO, marketing strategy, or social media management
- Anything that requires the reader to be a developer to understand or act on it

## Task
Generate exactly 3 topic candidates, each from a DIFFERENT cluster above.
For each candidate include the exact cluster slug (the value inside the brackets)
from the category line it came from.
Score each on specificity (0–100), where 100 means the title alone tells you \
exactly what you will learn and names at least one concrete thing.
Pick the highest-scoring candidate as the winner.

Return ONLY valid JSON — no markdown fences, no explanation, nothing else:
{{
  "candidates": [
    {{"topic": "...", "cluster": "<cluster-slug>", "score": 0}},
    {{"topic": "...", "cluster": "<cluster-slug>", "score": 0}},
    {{"topic": "...", "cluster": "<cluster-slug>", "score": 0}}
  ],
  "winner": "..."
}}
"""


# ── Helpers ───────────────────────────────────────────────────────────────────

def fetch_recent_titles(n: int = 20) -> list[str]:
    """Pull the last N article titles from Supabase to avoid repeating angles."""
    url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")
    if not url or not key:
        log.warning("Supabase credentials not set — recent titles unavailable. Topics will not avoid repeats.")
        return []
    try:
        from supabase import create_client
        client = create_client(url, key)
        result = (
            client.table("blog_posts")
            .select("title")
            .order("created_at", desc=True)
            .limit(n)
            .execute()
        )
        return [row["title"] for row in result.data]
    except Exception as exc:
        log.error(
            f"Could not fetch recent titles from Supabase: {exc}\n"
            "  Proceeding without deduplication — topic may repeat a recent article."
        )
        return []


def _call_gemini_for_topics(client, prompt: str, types) -> dict:
    """Call Gemini and parse JSON response. Retries up to 3 times with backoff."""
    last_exc: Exception | None = None
    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=1.0,  # max safe value; 1.2 can be silently clamped
                ),
            )
            raw = response.text.strip()

            # Strip markdown code fences if Gemini wraps the JSON anyway
            if raw.startswith("```"):
                lines = raw.splitlines()
                raw = "\n".join(lines[1:])
                if raw.rstrip().endswith("```"):
                    raw = raw[: raw.rfind("```")]
                raw = raw.strip()

            return json.loads(raw)
        except json.JSONDecodeError as exc:
            last_exc = exc
            log.warning(f"Gemini returned invalid JSON (attempt {attempt + 1}/3): {exc}")
            log.warning(f"Raw response:\n{response.text[:500]}")
        except Exception as exc:
            last_exc = exc
            log.warning(f"Gemini call failed (attempt {attempt + 1}/3): {exc}")

        if attempt < 2:
            wait = 2 ** attempt
            log.info(f"Retrying in {wait}s...")
            time.sleep(wait)

    log.error(f"Gemini topic generation failed after 3 attempts: {last_exc}")
    sys.exit(1)


def generate_topic(recent_titles: list[str]) -> tuple[str, str | None]:
    """Ask Gemini to generate 3 scored topic candidates and return the winner.

    Returns (topic, cluster_slug). cluster_slug is None if Gemini returned a
    value that does not match any known slug — the caller should still proceed
    but skip --cluster so the draft lands with cluster=NULL for manual triage.
    """
    try:
        from google import genai
        from google.genai import types
    except ImportError:
        log.error("google-genai not installed. Run: pip install google-genai")
        sys.exit(1)

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        log.error("GEMINI_API_KEY not set in .env.local")
        sys.exit(1)

    categories_str = "\n".join(f"- [{slug}] {brief}" for slug, brief in CATEGORIES)
    titles_str = (
        "\n".join(f"- {t}" for t in recent_titles)
        if recent_titles
        else "(none yet — this is the first article)"
    )

    prompt = _TOPIC_PROMPT_TEMPLATE.format(
        categories=categories_str,
        recent_titles=titles_str,
    )

    client = genai.Client(api_key=api_key)
    log.info("Asking Gemini to generate topic candidates...")

    data = _call_gemini_for_topics(client, prompt, types)

    candidates = data.get("candidates", [])
    winner_topic = data.get("winner", "").strip()

    log.info("Generated candidates:")
    for c in candidates:
        log.info(
            f"  [{c.get('score', '?'):>3}] [{c.get('cluster', '?')[:30]}]  {c.get('topic', '')}"
        )

    if not candidates:
        log.error("No candidates returned in Gemini topic-generation response.")
        sys.exit(1)

    # Validate winner is one of the actual candidates; fall back to highest score if not
    candidate_topics = [c["topic"] for c in candidates if c.get("topic")]
    if winner_topic not in candidate_topics:
        log.warning(
            f"Winner {winner_topic!r} not found in candidate list — "
            "falling back to highest-scored candidate."
        )
        best = max(candidates, key=lambda c: c.get("score", 0))
        winner_topic = best["topic"]
        winner_cluster = best.get("cluster", "")
    else:
        winner_cluster = next(
            (c.get("cluster", "") for c in candidates if c.get("topic") == winner_topic),
            "",
        )

    winner_cluster = (winner_cluster or "").strip()
    if winner_cluster and winner_cluster not in VALID_CLUSTERS:
        log.warning(
            f"Gemini returned cluster {winner_cluster!r} which is not in the valid set "
            f"({sorted(VALID_CLUSTERS)}). Dropping — draft will land unclassified."
        )
        winner_cluster = ""

    log.info(f"Winner: {winner_topic!r}  (cluster={winner_cluster or 'NONE'})")
    return winner_topic, (winner_cluster or None)


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description="Weekly Market Insights runner")
    parser.add_argument(
        "--dry-run", action="store_true",
        help="Generate and print the selected topic, then exit without writing an article",
    )
    args = parser.parse_args()

    recent_titles = fetch_recent_titles()
    topic, cluster = generate_topic(recent_titles)

    if args.dry_run:
        log.info("DRY RUN — no article generated.")
        return

    cmd = [sys.executable, str(SCRIPTS_DIR / "generate_insights.py"), "--topic", topic]
    if cluster:
        cmd.extend(["--cluster", cluster])
    log.info("Running generate_insights.py...")
    result = subprocess.run(cmd, cwd=str(SCRIPTS_DIR))
    sys.exit(result.returncode)


if __name__ == "__main__":
    main()
