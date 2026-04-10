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
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env.local")

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(message)s")
log = logging.getLogger(__name__)

SCRIPTS_DIR = Path(__file__).resolve().parent
GEMINI_MODEL = "gemini-2.5-flash"

# ── Category buckets ──────────────────────────────────────────────────────────
# Edit freely. These constrain the topic space without fixing individual topics.
# Weight a category by listing it more than once.

CATEGORIES = [
    # Company Brain — accessible AI for service businesses with multiple moving parts
    "Company Brain (AI for service businesses) — how a private local AI helps a trade contractor with 5+ active jobs stay organized: answering questions from past quotes, job notes, and client emails without the owner stopping work to explain it; why most 'AI for business' tools fail service companies and what actually works",

    # LLC Owner Finder — public records lead intelligence, accessible angle
    "LLC Owner Finder (lead intelligence for Upstate SC trades) — how Greenville County deed transfers, SOS filings, and mortgage records reveal who the real decision-maker is behind an LLC; why calling the right person on day 1 vs. day 21 is the difference between winning and losing a bid; what the public records actually look like and how to read them",

    # Greenville commercial real estate — news pegged to local market activity
    "Greenville SC commercial real estate and development — new industrial parks, major commercial property transfers, large-scale infrastructure investments in Upstate SC, and which local trades contractors should be positioning themselves to work with the owners behind those projects",

    # Practical operations for trade businesses
    "Running a local service business — estimating, follow-up, managing crews on multiple concurrent jobs, keeping job notes in a format a new employee can actually use; real workflows that save time without adding another app to manage",

    # Reading and using public records — no-code, practical angle
    "Public records for local businesses — how to read Greenville County deed transfers, LLC filings, and mortgage filings to find leads before competitors do; no coding required; what the documents mean in plain English and what action to take",

    # Digital tools for trades — honest, opinionated comparisons
    "Digital tools for trades businesses — CRMs, quoting software, AI assistants, route optimization, invoicing; what actually saves time for a 5–15 person service company vs. what just adds overhead",
]

# ── Topic generation prompt ───────────────────────────────────────────────────

_TOPIC_PROMPT_TEMPLATE = """\
You generate article topic briefs for REBB Advisors, a Greenville SC company that
helps local service businesses (HVAC, plumbing, landscaping, electrical, cleaning)
find better leads and run smarter operations.

The audience is a local service business owner or office manager — NOT a developer.
The ideal topic makes that reader think: "I had no idea I could do this — and now I'm
going to try it."

## Content categories (rotate through these, don't repeat the same category twice in a row)
{categories}

## Recently published titles (do not repeat these angles)
{recent_titles}

## What makes a GOOD topic brief
- Specific enough that a reader knows exactly what they will learn from the title alone
- Takes a clear position or reveals something non-obvious for a local trade contractor
- Procedural or comparative — not "here's why X matters" but "here's exactly how X works"
- Grounded in Greenville SC or Upstate SC market reality where relevant
- Accessible: the insight should land for a business owner, not just a developer
- Can be borderline uncomfortable — says the thing most business guides quietly skip

Good examples:
- "How Greenville County deed records can tell you who to call before a new construction project breaks ground — and how to find the owner behind the LLC"
- "Why a 10-person HVAC company with 8 active jobs needs a Company Brain, not a group chat"
- "How to read a Greenville County property transfer record: what the document means, what the LLC name hides, and how to find the real decision-maker"
- "The difference between calling a lead on day 1 vs. day 21 after a property transfer — real numbers from Upstate SC trades contractors"
- "What Greenville's new industrial corridor means for local contractors: which property transfers to watch and who owns what"
- "How a local plumbing company used public mortgage filings to find commercial clients before competitors did"
- "Company Brain vs. a shared Google Drive: why a service company with 6 crews needs something smarter than folders"
- "How to stop losing institutional knowledge when an estimator leaves: what a Company Brain actually stores and how teams use it"

## Hard rules — never produce these
- Seasonal framing: "Why spring is important for..."
- Starts with "Why your..." — sounds like a lecture, not insight
- Generic small business advice that could have been written in 2015
- Vague outcome promises: "...and how it can transform your business"
- Listicles with no specific claim: "5 things every contractor should know"
- Anything that requires the reader to be a developer to understand or act on it

## Task
Generate exactly 3 topic candidates, each from a DIFFERENT category above.
Score each on specificity (0–100), where 100 means the title alone tells you \
exactly what you will learn and names at least one concrete thing.
Pick the highest-scoring candidate as the winner.

Return ONLY valid JSON — no markdown fences, no explanation, nothing else:
{{
  "candidates": [
    {{"topic": "...", "category": "...", "score": 0}},
    {{"topic": "...", "category": "...", "score": 0}},
    {{"topic": "...", "category": "...", "score": 0}}
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
        log.warning("Supabase credentials not set — recent titles unavailable.")
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
        log.warning(f"Could not fetch recent titles: {exc}")
        return []


def generate_topic(recent_titles: list[str]) -> str:
    """Ask Gemini to generate 3 scored topic candidates and return the winner."""
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

    categories_str = "\n".join(f"- {c}" for c in CATEGORIES)
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

    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=1.2,  # higher creativity for topic generation
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

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as exc:
        log.error(f"Gemini returned invalid JSON for topic generation: {exc}")
        log.error(f"Raw response:\n{raw}")
        sys.exit(1)

    candidates = data.get("candidates", [])
    winner = data.get("winner", "").strip()

    log.info("Generated candidates:")
    for c in candidates:
        log.info(f"  [{c.get('score', '?'):>3}] [{c.get('category', '?')[:30]}]  {c.get('topic', '')}")

    if not winner:
        log.error("No winner returned in Gemini topic-generation response.")
        sys.exit(1)

    log.info(f"Winner: {winner!r}")
    return winner


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description="Weekly Market Insights runner")
    parser.add_argument(
        "--dry-run", action="store_true",
        help="Generate and print the selected topic, then exit without writing an article",
    )
    args = parser.parse_args()

    recent_titles = fetch_recent_titles()
    topic = generate_topic(recent_titles)

    if args.dry_run:
        log.info("DRY RUN — no article generated.")
        return

    cmd = [sys.executable, str(SCRIPTS_DIR / "generate_insights.py"), "--topic", topic]
    log.info("Running generate_insights.py...")
    result = subprocess.run(cmd, cwd=str(SCRIPTS_DIR))
    sys.exit(result.returncode)


if __name__ == "__main__":
    main()
