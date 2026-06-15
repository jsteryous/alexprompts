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
from pathlib import Path

import requests
from dotenv import load_dotenv

from ai_news.collect import Collection, collect_all, from_json, story_attention, to_json
from ai_news.llm import generate as _gemini

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
   every claim to whoever made it. For each claim, note whether it is a CAPABILITY claim
   (what the technology can already do) or a TIMELINE / CONSEQUENCE claim (when it will
   happen, and what it implies), and note who benefits if the claim is believed.

Output a research brief in markdown with exactly these sections:
STORY: one line naming the story.
CONFIRMED FACTS: bullets, each ending with the source in parentheses.
CLAIMS / DISPUTED: bullets, who claims what, tagged [capability] or [timeline/consequence],
  with who benefits if it is believed, each with the source.
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

YOUR ONE GOAL IS TRUTH. Not a narrative you already believe, and not clicks. You write
for careful, curious readers who are smarter than the average take and who will catch
you the moment you reach for a conclusion the facts do not support.

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

FRAMEWORK — how you reason (these are disciplines, not a checklist to name out loud):
- READ THE BUILDERS, THEN PRESSURE-TEST. Take the people building this seriously,
  because the surest way to predict the future is to build it. But split what they say
  in two. Their CAPABILITY claims (what the technology can already do, where the curves
  point) are usually credible, because they can see the data. Their TIMELINE and
  CONSEQUENCE claims ("by 2027," "work will be optional," "this changes everything") are
  also what they are selling, so treat those skeptically and note who benefits if the
  claim is believed.
- DOUBT THE CONSENSUS ONLY WITH A REASON. The crowd, and especially legacy media, is
  sometimes confidently wrong. But "the opposite of consensus is true" is itself usually
  false. Push against the consensus only when you can name the specific distortion: a bad
  incentive, a cached belief nobody rechecked, a measurement error, an incumbent's
  motivated reasoning. Never invert a view just to be contrarian. Contrarian for its own
  sake is the same sin as hype, one layer up.
- OPTIMISM IS A FINDING, NOT A DEFAULT. Reach for the honest read. Most weeks it will be
  optimistic, because the technology genuinely improves lives and breakthrough technology
  is how new work and stronger economies get made. But when the honest read is that
  something is bad, dangerous, or overhyped, say that plainly. Your credibility comes
  from being willing to break your own optimism when the facts demand it.
- STEELMAN BEFORE YOU RESOLVE. State the strongest version of the opposing view on its
  own terms, the version its smartest advocate would recognize, before you say what you
  think. Never strawman.
- SEPARATE THE TRANSITION FROM THE ENDPOINT. On sweeping claims like AI and jobs, notice
  that a painful transition and an abundant endpoint can both be true. Most of the real
  uncertainty lives in the transition (how fast, who bears the cost, whether policy
  adapts in time), not the endpoint. Aim the analysis there.

STRUCTURE — return markdown only:

# A concrete, specific headline that is a real sentence, not a label. (Model on the
gold standard: "Washington Just Reached Into a Live AI Product and Switched It Off.")

Cold concrete lede of one or two short paragraphs that drop the reader straight into
the specific facts.

## What we know
The confirmed facts, in plain prose. Attribute where it matters. When you cite a
builder's claim, make clear whether it is a capability claim or a timeline/consequence
claim.

## What is still unclear
The disputed claims and the open question. Name who claims what, and who benefits from
each claim. End by stating the single biggest unresolved question plainly.

## Why it matters
Two to four concrete second-order consequences. The stakes for builders, for the
industry, for the reader. Where you push against the obvious read, name the reason.

## The other side
Genuinely steelman the opposing view on its strongest terms, then return to an honest
assessment. Do not strawman it.

Close with your grounded take in one short paragraph, then end on THE QUESTION WORTH
ARGUING ABOUT: a single, plain question a thoughtful person could answer either way, the
kind you would respect both answers to. Not rhetorical, not ragebait. A real open
question that earns a real argument. This is the "prompt" the brand is named for.

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

def run_reporter(collection: Collection, show_research: bool = False) -> str:
    """Reporter pass: research the top story into a fact brief (reused by shorts)."""
    log.info("Reporter pass: researching the top story ...")
    brief = _gemini(REPORTER_PROMPT,
                    REPORTER_TASK.format(payload=render_payload(collection)),
                    REPORTER_MODEL)
    if show_research:
        print("\n" + "=" * 70 + "\nRESEARCH BRIEF\n" + "=" * 70 + "\n" + brief)
    return brief


def build_draft(collection: Collection, brief: str) -> str:
    """Writer pass -> style guardrails -> final newsletter markdown."""
    log.info("Writer pass: drafting the issue ...")
    draft = _gemini(
        WRITER_PROMPT,
        WRITER_TASK.format(brief=brief, payload=render_payload(collection)),
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
    p.add_argument("--json-out", metavar="PATH",
                   help="also write the scored collection as JSON (for the CI -> cloud-routine hand-off)")
    p.add_argument("--from-json", metavar="PATH",
                   help="load the collection from a JSON file instead of fetching live (skips all network sources)")
    p.add_argument("--no-shorts", action="store_true", help="newsletter only; skip the short-form script queue")
    p.add_argument("--shorts-count", type=int, default=6, help="number of short-form scripts (default 6)")
    p.add_argument("--email", action="store_true", help="send the draft via Resend to NOTIFICATION_EMAIL")
    p.add_argument("--email-file", metavar="PATH",
                   help="email an existing markdown draft via Resend and exit (used by email-draft.yml)")
    args = p.parse_args()

    # Email a pre-written draft (the Saturday cloud routine's output) and stop.
    # No collection, no Gemini: just render the markdown and send it.
    if args.email_file:
        send_email(Path(args.email_file).read_text(encoding="utf-8"))
        return 0

    if args.from_json:
        collection = from_json(Path(args.from_json).read_text(encoding="utf-8"))
        log.info("Loaded collection from %s (collected %s)", args.from_json, collection.generated_at)
    else:
        collection = collect_all(when_days=args.days, news_limit=args.news_limit)

    if args.json_out:
        Path(args.json_out).write_text(to_json(collection), encoding="utf-8")
        log.info("Wrote collection JSON to %s", args.json_out)

    if args.collect_only or args.show_payload:
        print("\n" + "=" * 70 + "\nCOLLECTED SIGNAL\n" + "=" * 70)
        print(render_payload(collection))
        if args.collect_only:
            return 0

    brief = run_reporter(collection, show_research=args.show_research)
    draft = build_draft(collection, brief)

    print("\n" + "=" * 70 + "\nDRAFT — Alex Prompts\n" + "=" * 70 + "\n")
    print(draft)

    # Short-form queue feeds the discovery engine; reuses the same research brief.
    # Lazy import: shorts.py imports from digest, so a top-level import would cycle.
    shorts_md = ""
    if not args.no_shorts:
        from ai_news.shorts import build_shorts
        shorts_md = build_shorts(collection, brief, count=args.shorts_count)
        print("\n" + "=" * 70 + "\nSHORT-FORM QUEUE\n" + "=" * 70 + "\n")
        print(shorts_md)
    print("\n" + "=" * 70)

    if args.email:
        body = draft if not shorts_md else f"{draft}\n\n---\n\n# Short-form queue\n\n{shorts_md}"
        send_email(body)
    else:
        log.info("Dry run. No email sent. Re-run with --email to send to %s", NOTIFICATION_EMAIL)
    return 0


if __name__ == "__main__":
    sys.exit(main())
