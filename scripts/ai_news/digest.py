"""
digest.py — Turn the week's collected stories into an editable Alex Prompts draft.

Two-pass, deliberately:
  1. REPORTER pass — Gemini picks the top story, generates the specific
     investigative questions a sharp reader would ask about THAT story, then uses
     Google Search to answer them with concrete facts + named sources. Output is
     a research brief that separates confirmed facts from claims and names the big
     open question. (This is the "let Gemini ask its own questions" step.)
  2. WRITER pass — takes the brief and writes the issue in Alex's house style.
     Separating research from prose stops the model papering over missing facts
     with fluff.

A hard style guide (no em dashes, no fragments, concrete lede, banned phrases)
plus an em-dash stripper guardrail enforce voice, since models ignore the rule.

Usage:
    cd scripts
    python -m ai_news.digest                  # collect -> reporter -> writer, print
    python -m ai_news.digest --show-research   # also print the research brief
    python -m ai_news.digest --collect-only    # just the sourced signal, no Gemini
    python -m ai_news.digest --email           # send the draft to NOTIFICATION_EMAIL
    python -m ai_news.digest --days 14
"""

from __future__ import annotations

import argparse
import logging
import os
import re
import sys
import time
from pathlib import Path

import requests
from dotenv import load_dotenv

from ai_news.collect import Collection, collect_all, story_attention

# ai_news/ is one level deeper than the other scripts, so repo root is 3 up:
# digest.py -> ai_news -> scripts -> repo root.
ROOT = Path(__file__).resolve().parent.parent.parent
load_dotenv(ROOT / ".env.local")

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(message)s")
log = logging.getLogger(__name__)

# Reporter does factual lookup (flash is fine). Writer carries the prose, so it
# gets the stronger model, with a flash fallback if pro is unavailable.
REPORTER_MODEL = "gemini-2.5-flash"
WRITER_MODEL = "gemini-2.5-pro"
WRITER_FALLBACK_MODEL = "gemini-2.5-flash"

# Email defaults. rebbadvisors.com is going away, so send from Resend's shared
# sender. Recipient is whatever NOTIFICATION_EMAIL points to (set it to your Gmail).
MAIL_FROM = os.getenv("MAIL_FROM", "Alex Prompts <onboarding@resend.dev>")
NOTIFICATION_EMAIL = os.getenv("NOTIFICATION_EMAIL", "jsteryous@gmail.com")

# Phrases that betray fluff. The writer prompt bans them; we also warn if any slip
# through so the model's drift is visible during tuning.
BANNED_PHRASES = [
    "in an unprecedented move", "sent ripples", "in today's fast-paced",
    "the ai landscape", "raises important questions", "raises serious questions",
    "it's worth noting", "in the world of", "game-changer", "game changer",
    "the rise of", "navigate the complexities", "ripples through", "a new era",
    "sent shockwaves", "in a bold move", "at the end of the day",
]

# ── Prompts ───────────────────────────────────────────────────────────────────

REPORTER_PROMPT = """\
You are an investigative tech reporter researching the single most important
frontier-tech story of the week for a newsletter. You do NOT write the article.
You produce a factual research brief the writer will use.

Given this week's stories and their engagement signals, do this:
1. Identify the SINGLE most important story. Usually the highest-engagement one,
   but use judgment about what actually matters.
2. Generate the specific factual questions a sharp, curious reader would need
   answered about THIS story. Think like a journalist: who exactly did what, when
   precisely (date and time if available), through what mechanism, what is the
   disputed claim and who disputes it, what are the second-order consequences
   (financial, strategic, governance), and what is the single biggest unresolved
   question (for example: "will access ever be restored?").
3. Use Google Search to answer each question with CONCRETE specifics: named people
   and their titles, exact dates, exact mechanisms, dollar figures, and the outlet
   or source for every fact.
4. Separate what is CONFIRMED from what is CLAIMED or merely SPECULATED. Attribute
   every claim to whoever made it.

Output a research brief in markdown with exactly these sections:
STORY: one line naming the story.
CONFIRMED FACTS: bullets, each ending with the source in parentheses.
CLAIMS / DISPUTED: bullets, who claims what, each with the source.
THE OPEN QUESTION: the single biggest unresolved question, and what each side says.
WHY IT MATTERS: 2 to 4 concrete second-order consequences, sourced where possible.
SOURCES: the outlets and links you relied on.

Be specific or be silent. If you cannot confirm a fact, write "unconfirmed."
Never invent names, dates, or figures.
"""

WRITER_PROMPT = """\
You are Alex Steryous, writing this week's issue of "Alex Prompts," a newsletter
that translates frontier AI and hard tech for an intelligent general reader who is
not a developer. The name is a double meaning: AI prompts, and prompting real
discussion. You are given a research brief on the top story and a list of the other
notable stories this week.

STYLE — non-negotiable:
- NO em dashes or en dashes, ever. Use periods, commas, or restructure the sentence.
- NO sentence fragments. Every sentence has a subject and a verb and is complete.
- Get punch from SHORT sentences and varied length, from strong verbs and concrete
  nouns. Never from dashes or fragments.
- Open cold and concrete. Lead with a fact, a scene, or a number. Never open with an
  abstraction, a definition, or a cliche.
- BANNED phrases and anything resembling them: "in an unprecedented move," "sent
  ripples," "in today's fast-paced world," "the AI landscape," "raises important
  questions," "it's worth noting," "in the world of," "game-changer," "the rise of,"
  "navigate the complexities," "a new era," "sent shockwaves."
- Plain English. Translate any jargon in one sentence a smart 15-year-old understands.
- Optimistic by default about technology and human flourishing, but honest about the
  hard parts. Steelman the strongest opposing view on its own terms before resolving.

STRUCTURE — return markdown only:

# A concrete, specific headline that is a real sentence, not a label. (Model on the
gold standard: "Washington Just Reached Into a Live AI Product and Switched It Off.")

Cold concrete lede of one or two short paragraphs that drop the reader straight into
the specific facts.

## What we know
The confirmed facts, in plain prose. Attribute where it matters.

## What is still unclear
The disputed claims and the open question. Name who claims what. End by stating the
single biggest unresolved question plainly.

## Why it matters
Two to four concrete second-order consequences. The stakes for builders, for the
industry, for the reader.

## The other side
Genuinely steelman the opposing view on its strongest terms, then return to an honest
assessment. Do not strawman it.

Close on the honest open question or what to watch next, in one short paragraph. No
summary, no cliche.

## In other news
For each other notable story, write a short paragraph of full sentences. No dash
bullets. Lead with the company name followed by a verb, like "OpenAI filed ...". Two
or three plain, concrete sentences each. Confirm specifics with search; do not invent.

Write only the article. No preamble, no sign-off.
"""

WRITER_TASK = """\
RESEARCH BRIEF (top story):
{brief}

OTHER NOTABLE STORIES THIS WEEK (raw signal — pick the strongest 3 to 5 for "In
other news," confirm details with search, drop anything you cannot stand behind):
{payload}
"""

REPORTER_TASK = """\
This week's collected signal (headlines and builder-crowd engagement per entity,
plus the flagged highest-engagement story):

{payload}
"""


# ── Payload rendering ─────────────────────────────────────────────────────────

def render_payload(c: Collection) -> str:
    lines: list[str] = [f"Collected {c.generated_at}.\n"]
    if c.biggest:
        b = c.biggest
        lines.append(
            f"FLAGGED HIGHEST-ENGAGEMENT STORY (score {story_attention(b):.0f}):\n"
            f'  "{b.title}" [{b.entity}]\n  {b.url}\n'
            f"  hn_points={b.hn_points} hn_comments={b.hn_comments} reddit={b.reddit_score}\n"
        )
    for r in c.entities:
        lines.append(f"\n### {r.entity}  (attention {r.attention:.0f}, {r.news_count} news items)")
        for h in r.headlines[:6]:
            src = f" — {h['source']}" if h.get("source") else ""
            lines.append(f"  - {h['title']}{src}\n    {h['link']}")
        for s in sorted(r.stories, key=story_attention, reverse=True)[:4]:
            sig = f"hn {s.hn_points}/{s.hn_comments}" if s.source == "hackernews" else f"reddit {s.reddit_score}"
            lines.append(f"  - [{s.source} {sig}] {s.title}\n    {s.url}")
    return "\n".join(lines)


# ── Style guardrails (unit-tested) ────────────────────────────────────────────

def strip_em_dashes(text: str) -> str:
    """Remove em/en dashes the writer slipped in despite the rule.

    Sentence-joining dash (" — Capital") becomes a period. Any other dash becomes a
    comma. A backstop, not the primary mechanism; the prompt does the real work.
    """
    text = re.sub(r"\s*[—–]\s+([A-Z])", r". \1", text)   # join -> sentence break
    text = re.sub(r"\s*[—–]\s*", ", ", text)             # parenthetical -> comma
    return text


def find_fluff(text: str) -> list[str]:
    """Return any banned phrases present (case-insensitive), for a tuning warning."""
    low = text.lower()
    return [p for p in BANNED_PHRASES if p in low]


# ── Gemini ────────────────────────────────────────────────────────────────────

def _gemini(system: str, contents: str, model: str, *,
            grounded: bool = True, fallback_model: str | None = None,
            max_retries: int = 3) -> str:
    """One grounded Gemini call with retry, optionally falling back to a 2nd model."""
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

    client = genai.Client(api_key=api_key)
    cfg_kwargs = {"system_instruction": system, "temperature": 0.7}
    if grounded:
        cfg_kwargs["tools"] = [types.Tool(google_search=types.GoogleSearch())]

    models_to_try = [model] + ([fallback_model] if fallback_model else [])
    last_exc: Exception | None = None
    for m in models_to_try:
        log.info("Gemini call (%s)%s ...", m, " + grounding" if grounded else "")
        for attempt in range(max_retries):
            try:
                response = client.models.generate_content(
                    model=m, contents=contents,
                    config=types.GenerateContentConfig(**cfg_kwargs),
                )
                text = response.text
                if not text or len(text.strip()) < 200:
                    raise ValueError(f"suspiciously short output ({len(text or '')} chars)")
                return text.strip()
            except Exception as exc:
                last_exc = exc
                if attempt < max_retries - 1:
                    wait = 2 ** attempt
                    log.warning("%s attempt %d/%d failed: %s — retrying in %ds",
                                m, attempt + 1, max_retries, exc, wait)
                    time.sleep(wait)
                else:
                    log.warning("%s exhausted retries: %s", m, exc)
        if fallback_model and m != fallback_model:
            log.warning("Falling back to %s ...", fallback_model)

    log.error("Gemini failed on all models: %s", last_exc)
    sys.exit(1)


def build_draft(collection: Collection, show_research: bool = False) -> str:
    """Reporter pass -> writer pass -> style guardrails -> final markdown."""
    payload = render_payload(collection)

    log.info("Reporter pass: researching the top story ...")
    brief = _gemini(REPORTER_PROMPT, REPORTER_TASK.format(payload=payload), REPORTER_MODEL)
    if show_research:
        print("\n" + "=" * 70 + "\nRESEARCH BRIEF\n" + "=" * 70 + "\n" + brief)

    log.info("Writer pass: drafting the issue ...")
    draft = _gemini(
        WRITER_PROMPT,
        WRITER_TASK.format(brief=brief, payload=payload),
        WRITER_MODEL, fallback_model=WRITER_FALLBACK_MODEL,
    )

    draft = strip_em_dashes(draft)
    slipped = find_fluff(draft)
    if slipped:
        log.warning("Fluff phrases slipped through (tighten the prompt or edit): %s", slipped)
    return draft


# ── Email ─────────────────────────────────────────────────────────────────────

def _first_headline(draft: str) -> str:
    for line in draft.splitlines():
        if line.startswith("# "):
            return line[2:].strip()
    return "Alex Prompts — weekly draft"


def render_email_html(draft_md: str) -> str:
    """Rendered HTML for reading + raw markdown in a <pre> for copy/paste."""
    try:
        import markdown as md
        body = md.markdown(draft_md, extensions=["extra"])
    except ImportError:
        log.warning("markdown not installed; sending plain <pre> only.")
        body = ""
    from html import escape
    return f"""<!doctype html><html><body style="font-family:Georgia,serif;
max-width:680px;margin:0 auto;padding:24px;color:#111;line-height:1.6">
<p style="font-family:system-ui;font-size:12px;color:#888;letter-spacing:.05em">
ALEX PROMPTS — DRAFT. Verify every specific claim before sending. Paste into Substack.</p>
{body}
<hr style="margin:40px 0;border:none;border-top:1px solid #ddd">
<p style="font-family:system-ui;font-size:12px;color:#888">Raw markdown (for copy):</p>
<pre style="white-space:pre-wrap;font-size:12px;background:#f6f6f6;padding:16px;
border-radius:6px">{escape(draft_md)}</pre>
</body></html>"""


def send_email(draft_md: str) -> None:
    key = os.getenv("RESEND_API_KEY")
    if not key:
        log.error("RESEND_API_KEY not set")
        sys.exit(1)
    subject = f"Alex Prompts draft — {_first_headline(draft_md)}"
    resp = requests.post(
        "https://api.resend.com/emails",
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        json={"from": MAIL_FROM, "to": [NOTIFICATION_EMAIL],
              "subject": subject, "html": render_email_html(draft_md)},
        timeout=20,
    )
    if resp.status_code not in (200, 201):
        log.error("Resend error %s: %s", resp.status_code, resp.text)
        sys.exit(1)
    log.info("draft emailed to %s", NOTIFICATION_EMAIL)


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> int:
    try:
        sys.stdout.reconfigure(encoding="utf-8")  # Windows cp1252 mangles em-dashes
    except (AttributeError, ValueError):  # pragma: no cover
        pass

    p = argparse.ArgumentParser(description="Alex Prompts weekly digest")
    p.add_argument("--days", type=int, default=7, help="lookback window (default 7)")
    p.add_argument("--news-limit", type=int, default=8, help="headlines per entity (default 8)")
    p.add_argument("--show-research", action="store_true", help="also print the research brief")
    p.add_argument("--show-payload", action="store_true", help="also print the collected signal")
    p.add_argument("--collect-only", action="store_true", help="skip Gemini; show the raw collection")
    p.add_argument("--email", action="store_true", help="send the draft via Resend to NOTIFICATION_EMAIL")
    args = p.parse_args()

    collection = collect_all(when_days=args.days, news_limit=args.news_limit)

    if args.collect_only or args.show_payload:
        print("\n" + "=" * 70 + "\nCOLLECTED SIGNAL\n" + "=" * 70)
        print(render_payload(collection))
        if args.collect_only:
            return 0

    draft = build_draft(collection, show_research=args.show_research)

    print("\n" + "=" * 70 + "\nDRAFT — Alex Prompts\n" + "=" * 70 + "\n")
    print(draft)
    print("\n" + "=" * 70)

    if args.email:
        send_email(draft)
    else:
        log.info("Dry run. No email sent. Re-run with --email to send to %s", NOTIFICATION_EMAIL)
    return 0


if __name__ == "__main__":
    sys.exit(main())
