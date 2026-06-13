"""
shorts.py — Turn the week's research into a queue of shoot-ready short-form scripts.

Short-form is the discovery engine for Alex Prompts; the newsletter is the capture.
This reuses the digest's collection + research brief (no extra reporter pass) and
produces several scripts so one weekly research pass becomes a week of posts.

Primary format: voiceover over b-roll / screen recordings, occasionally on camera.
So scripts are spoken narration with [VISUAL: ...] cues, hook-first.

Usually invoked through `digest.py` (the weekly email bundles newsletter + scripts).
Standalone:
    cd scripts
    python -m ai_news.shorts            # collect -> research -> scripts, print
    python -m ai_news.shorts --count 8
"""

from __future__ import annotations

import argparse
import logging
import sys

from ai_news.collect import Collection, collect_all
from ai_news.digest import (REPORTER_TASK, render_payload, run_reporter,
                            strip_em_dashes)
from ai_news.llm import generate

log = logging.getLogger(__name__)

SHORTS_MODEL = "gemini-2.5-pro"
SHORTS_FALLBACK_MODEL = "gemini-2.5-flash"

SHORTS_PROMPT = """\
You write short-form video scripts for "Alex Prompts," a brand that translates
frontier AI and hard tech for a curious general audience on TikTok, YouTube Shorts,
Reels, and X. The name is a double meaning: AI prompts, and prompting real discussion.

PRIMARY FORMAT: Alex narrates in first person (voiceover) over b-roll and screen
recordings, occasionally on camera. So write spoken narration with visual cues, not
an essay.

VOICE:
- Spoken, not written. Short sentences. The way a sharp, curious friend actually talks.
- Energy without hype. Optimistic about technology and human flourishing, honest about
  the hard parts. Curious, never breathless.
- Plain English. Translate any jargon in one spoken line a 15-year-old gets.
- NO em dashes. NO corporate filler. Banned: "in an unprecedented move," "game-changer,"
  "the AI landscape," "sent ripples," "dive into," "buckle up," "did you know."

EACH SCRIPT runs 15 to 45 seconds (about 40 to 110 spoken words) and contains:
- HOOKS: 4 different first-line options. The first 3 seconds decide everything. Make
  them concrete, surprising, or mildly contrarian. A specific fact or number beats a
  question. No "Did you know," no "Imagine if."
- SCRIPT: the spoken body, written exactly as Alex would say it out loud. One idea,
  landed clearly. Translate the key term. End on a line that prompts a thought or a
  question, the kind that earns a comment.
- CTA: one short spoken line to the newsletter, varied per script (for example,
  "Full breakdown's in the newsletter, link in bio").
- VISUALS: 2 to 4 [VISUAL: ...] cues marking what b-roll or screen recording to cut to.
- CAPTION: a posting caption plus 2 to 3 relevant hashtags.

Produce {n} scripts. Lead with the biggest story (use the research brief for facts),
then spread the rest across different stories from the signal so the week's posts do
not repeat. Be accurate: only state facts supported by the brief or the signal, and
confirm with search if unsure. Never invent numbers, names, or quotes.

Return markdown. For each script:
## Script N - <one-line topic>
**Hooks**
1. ...
**Script**
...
**CTA**
...
**Visuals**
- [VISUAL: ...]
**Caption**
...
"""

SHORTS_TASK = """\
RESEARCH BRIEF (top story):
{brief}

THIS WEEK'S SIGNAL (other stories to spread across the remaining scripts):
{payload}
"""


def build_shorts(collection: Collection, brief: str, count: int = 6) -> str:
    """Generate `count` short-form scripts from the week's brief + signal."""
    log.info("Short-form pass: writing %d scripts ...", count)
    scripts = generate(
        SHORTS_PROMPT.format(n=count),
        SHORTS_TASK.format(brief=brief, payload=render_payload(collection)),
        SHORTS_MODEL, fallback_model=SHORTS_FALLBACK_MODEL,
    )
    return strip_em_dashes(scripts)


def main() -> int:
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):  # pragma: no cover
        pass
    logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(message)s")

    p = argparse.ArgumentParser(description="Alex Prompts short-form script queue")
    p.add_argument("--count", type=int, default=6, help="number of scripts (default 6)")
    p.add_argument("--days", type=int, default=7, help="lookback window (default 7)")
    args = p.parse_args()

    collection = collect_all(when_days=args.days)
    brief = run_reporter(collection)
    scripts = build_shorts(collection, brief, count=args.count)

    print("\n" + "=" * 70 + "\nSHORT-FORM QUEUE — Alex Prompts\n" + "=" * 70 + "\n")
    print(scripts)
    print("\n" + "=" * 70)
    return 0


if __name__ == "__main__":
    sys.exit(main())
