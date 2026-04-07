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
    "Technical SEO — how search engines actually work: Core Web Vitals, crawling, JavaScript rendering, indexing, schema markup",
    "Web development — React, Next.js, TypeScript, Tailwind, build tools, performance, real architectural trade-offs",
    "AI tools for builders — Claude Code, Cursor, Copilot, agentic coding, what LLMs get right and where they confidently fail",
    "Data pipelines and management — enrichment, deduplication, normalization, CRM auditing, public records parsing",
    "Public records and data journalism — Greenville County deeds, LLC filings, OCR on government documents, building scrape pipelines",
    "Local business intelligence — how Upstate SC service businesses can use public data to find clients before competitors do",
]

# ── Topic generation prompt ───────────────────────────────────────────────────

_TOPIC_PROMPT_TEMPLATE = """\
You generate article topic briefs for REBB Advisors, a Greenville SC tech agency.

The articles are technical, detail-oriented, and written for a reader who builds things.
The ideal topic makes that reader think: "I can't believe they published this for free \
— I actually learned something specific I didn't know."

## Content categories (rotate through these, don't repeat the same category twice in a row)
{categories}

## Recently published titles (do not repeat these angles)
{recent_titles}

## What makes a GOOD topic brief
- Names a specific mechanism, tool, format, data source, or command
- Takes a clear position or reveals something non-obvious
- Procedural or comparative — not "here's why X matters" but "here's exactly how X works"
- Specific enough that a lazy writer cannot produce a generic article from it
- Can be borderline uncomfortable — says the thing most guides quietly skip

Good examples:
- "How Google crawls JavaScript SPAs — why a React site can be invisible to search engines and exactly what to do about it"
- "OCR on scanned government documents: getting structured data out of TIFFs and PDFs with pytesseract — real accuracy numbers and failure modes"
- "Claude Code vs Cursor vs GitHub Copilot: a real comparison from someone who uses all three daily — where each one wins and where it fails"
- "How to clean a dirty contact database: deduplication, normalization, and the exact Python process with thefuzz and pandas"
- "Supabase vs Firebase vs PlanetScale for a small production app: schema, pricing, and the one thing each gets wrong"
- "Tailwind CSS v4 vs v3: what the @theme migration actually involves and whether it's worth it"
- "What an agentic AI coding session actually looks like: tool use, context windows, and where the model confidently hallucinates"
- "Next.js App Router vs Pages Router: an honest comparison of trade-offs for a real production site in 2026"

## Hard rules — never produce these
- Seasonal framing: "Why Q2 is important for..."
- Starts with "Why your..." — sounds like a lecture, not insight
- Generic advice that could have been written in 2018
- No specific tool, platform, data format, or named technology in the title
- Vague outcome promises: "...and how it can transform your business"
- Listicles with no specific claim: "5 things every developer should know about SEO"

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
