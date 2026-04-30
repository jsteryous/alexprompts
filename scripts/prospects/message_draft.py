"""
message_draft.py — Generate a cold-outreach FB Messenger draft per prospect.

Pure functions over a website_prospects row dict. No DB writes, no network.
The dashboard pre-fills the output into prospect cards for one-click
copy → paste into Facebook Messenger.

Voice rules (mirrors scripts/voice_anchors.py + the user's
memory/cold_email_no_price_first_touch.md note):

  - First touch leads with the *villain* — hidden patient/revenue loss.
    The technical audit finding is the *mechanism* of the leak, never the
    headline.
  - Compliment opener uses real first-party Google review data
    (rating ≥ 4.0 AND review_count ≥ 10). Below that threshold the
    compliment is dropped — fake praise reads as agency-speak.
  - NO price, NO cadence, NO retainer terms in the first touch. The free
    one-page mock or audit writeup is the lead. Price re-enters in
    follow-up #2 only.
  - Period-separated, blunt voice. One anti-upsell beat
    ("No obligation.") per draft.
  - Sign-off "-Alex".

Templates are vertical-aware: dental prospects get dental-specific stats
("about half of new dental searches start on Google"), other verticals fall
back to a vertical-neutral generic template.
"""

from __future__ import annotations

import hashlib
import re
from typing import Optional
from urllib.parse import urlparse


# ── Thresholds ──────────────────────────────────────────────────────────────

# Below this Lighthouse mobile score the slow-load storyline takes the lead.
LIGHTHOUSE_LEAD_THRESHOLD = 30

# Compliment opener is only used when both gates clear — fake praise on a
# 3.2-star, 4-review practice torches credibility instantly.
COMPLIMENT_MIN_RATING = 4.0
COMPLIMENT_MIN_REVIEWS = 10


# ── Name + URL helpers ──────────────────────────────────────────────────────

# Honorifics + post-nominal credentials that should never become the greeting
# first name. "Dr. Jane Smith DDS" → "Jane".
_HONORIFICS_AND_CREDENTIALS = frozenset({
    "dr", "mr", "mrs", "ms", "miss",
    "esq", "esquire",
    "dds", "dmd", "md", "msd", "phd",
    "jr", "sr", "ii", "iii", "iv",
})


def _first_name(decision_maker_name: Optional[str]) -> Optional[str]:
    """Best-effort first name from a decision-maker string. Drops honorifics
    and post-nominal credentials. Preserves apostrophes/hyphens within the
    token; title-cases ALL-CAPS input. Returns None if no usable token."""
    if not decision_maker_name:
        return None
    tokens = re.findall(r"[A-Za-z][A-Za-z'’\-]*", decision_maker_name)
    for tok in tokens:
        bare = re.sub(r"[^a-zA-Z]", "", tok).lower()
        if bare in _HONORIFICS_AND_CREDENTIALS:
            continue
        if len(bare) < 2:
            continue
        if tok.isupper():
            return tok.capitalize()
        return tok
    return None


def _hostname(url: Optional[str]) -> Optional[str]:
    """Bare hostname (no scheme, no www., no path). None on parse failure."""
    if not url:
        return None
    try:
        parsed = urlparse(url if "://" in url else "https://" + url)
        host = (parsed.netloc or "").lower()
    except Exception:
        return None
    if not host:
        return None
    if host.startswith("www."):
        host = host[4:]
    return host or None


def _form_target_label(prospect: dict) -> str:
    """Return ``host`` or ``host/path`` when the broken-form page URL is
    known. Lets us cite the exact page so the prospect can verify the leak
    themselves without needing technical context."""
    host = _hostname(prospect.get("website_url")) or "your site"
    issues = prospect.get("issues") or {}
    page_url = issues.get("forms_unreachable_page")
    if not page_url:
        return host
    try:
        path = urlparse(page_url).path.rstrip("/")
    except Exception:
        return host
    if path and path != "":
        return f"{host}{path}"
    return host


def _stable_choice(seed: str, options: tuple) -> str:
    """Stable hash → index. Same prospect always gets the same variant
    across reruns; different prospects get different variants so the same
    word doesn't appear in every drafted message."""
    if not options:
        raise ValueError("options must be non-empty")
    h = hashlib.md5((seed or "").encode("utf-8")).hexdigest()
    return options[int(h[:8], 16) % len(options)]


# ── Issue picker ────────────────────────────────────────────────────────────

# Which storyline drives the draft. Severity-of-impact first; among ties,
# whichever the prospect can verify themselves wins (forms > viewport > https).
_ISSUE_KEYS = (
    "no_website",
    "forms_unreachable",
    "no_viewport",
    "no_https",
    "lighthouse_low",
    "stale_copyright",
    "generic",
)


def pick_top_issue(prospect: dict) -> str:
    """Choose the message storyline. Returns one of ``_ISSUE_KEYS``."""
    if prospect.get("audit_status") == "no_website" or not prospect.get("website_url"):
        return "no_website"

    issues = prospect.get("issues") or {}
    if issues.get("forms_unreachable"):
        return "forms_unreachable"
    if issues.get("viewport_missing"):
        return "no_viewport"
    if issues.get("no_https"):
        return "no_https"

    lh = prospect.get("lighthouse_mobile_score")
    if lh is None:
        lh = issues.get("lighthouse_mobile")
    if lh is not None and lh < LIGHTHOUSE_LEAD_THRESHOLD:
        return "lighthouse_low"

    if issues.get("stale_copyright"):
        return "stale_copyright"

    return "generic"


# ── Compliment opener ───────────────────────────────────────────────────────

def _compliment_line(prospect: dict) -> Optional[str]:
    rating = prospect.get("google_rating")
    reviews = prospect.get("google_review_count")
    if rating is None or reviews is None:
        return None
    try:
        rating_f = float(rating)
        reviews_i = int(reviews)
    except (TypeError, ValueError):
        return None
    if rating_f < COMPLIMENT_MIN_RATING or reviews_i < COMPLIMENT_MIN_REVIEWS:
        return None
    return f"{rating_f:.1f} stars across {reviews_i} Google reviews. That reputation is earned."


# ── Recency adverb (deterministic per prospect, varied across the list) ─────

_RECENCY_ADVERBS = (
    "this morning",
    "earlier today",
    "today",
    "this week",
    "earlier this week",
    "the other day",
)


def _recency_phrase(seed: str) -> str:
    return _stable_choice(seed, _RECENCY_ADVERBS)


# ── Templates ───────────────────────────────────────────────────────────────

def _greeting(first_name: Optional[str]) -> str:
    return f"Hello {first_name}," if first_name else "Hello,"


def _assemble(greeting: str, compliment: Optional[str], body_paragraphs: list[str]) -> str:
    """Stitch greeting → compliment → body paragraphs → '-Alex' with blank
    lines between each block. Body paragraphs are joined with blank lines."""
    parts: list[str] = [greeting]
    if compliment:
        parts.append(compliment)
    parts.extend(body_paragraphs)
    parts.append("-Alex")
    return "\n\n".join(parts)


def _no_website(prospect: dict, first_name: Optional[str], compliment: Optional[str]) -> str:
    practice = prospect.get("business_name", "your practice")
    return _assemble(_greeting(first_name), compliment, [
        "About half of new dental searches start on Google. Patients click "
        "expecting a website — yours doesn't come up. They bounce to the next "
        "result and you never hear about it.",
        f"Want me to send a one-page mock of what {practice}'s site could look "
        "like? Takes a day. No obligation.",
    ])


def _forms_unreachable(prospect: dict, first_name: Optional[str], compliment: Optional[str]) -> str:
    target = _form_target_label(prospect)
    when = _recency_phrase(str(prospect.get("place_id", "")) + ":forms")
    return _assemble(_greeting(first_name), compliment, [
        f"Quick thing — I tried the contact form on {target} {when}. Submit "
        "returns an error. Patients fill it out, hit send, get nothing. Most "
        "don't try again. They call the next dentist.",
        "Want me to send a free audit writeup of what's leaking? Takes a day. "
        "No obligation.",
    ])


def _no_viewport(prospect: dict, first_name: Optional[str], compliment: Optional[str]) -> str:
    host = _hostname(prospect.get("website_url")) or "your site"
    when = _recency_phrase(str(prospect.get("place_id", "")) + ":mobile")
    return _assemble(_greeting(first_name), compliment, [
        f"Pulled {host} up on my phone {when}. Text is microscopic, buttons "
        "cut off — the site isn't built for mobile. About 70% of dental "
        "searches happen on phones now. Most patients bounce in two seconds.",
        "Want me to send a one-page mock of the mobile redesign? Takes a day. "
        "No obligation.",
    ])


def _no_https(prospect: dict, first_name: Optional[str], compliment: Optional[str]) -> str:
    host = _hostname(prospect.get("website_url")) or "your site"
    return _assemble(_greeting(first_name), compliment, [
        f"{host} doesn't have HTTPS. Chrome shows a 'Not Secure' warning to "
        "every patient who visits — most click away before they read anything. "
        "That's first-impression revenue gone before they know who you are.",
        "Want me to send a free audit writeup? Takes a day. No obligation.",
    ])


def _lighthouse_low(prospect: dict, first_name: Optional[str], compliment: Optional[str]) -> str:
    host = _hostname(prospect.get("website_url")) or "your site"
    score = prospect.get("lighthouse_mobile_score")
    if score is None:
        score = (prospect.get("issues") or {}).get("lighthouse_mobile")
    score_clause = f"came back at {score}/100" if score is not None else "came back very low"
    return _assemble(_greeting(first_name), compliment, [
        f"Ran a Google PageSpeed check on {host}. Mobile score {score_clause}. "
        "Patients bail on a slow load around three seconds — you're losing the "
        "click before they ever read your name.",
        "Want me to send a free audit writeup? Takes a day. No obligation.",
    ])


def _stale_copyright(prospect: dict, first_name: Optional[str], compliment: Optional[str]) -> str:
    host = _hostname(prospect.get("website_url")) or "your site"
    year = (prospect.get("issues") or {}).get("stale_copyright")
    year_clause = f"says {year}" if year else "is years out of date"
    return _assemble(_greeting(first_name), compliment, [
        f"Quick thing — the copyright on {host} {year_clause}. Most patients "
        "won't notice consciously, but it nudges the same instinct as a dusty "
        "lobby. They wonder if anyone's still home.",
        "Want me to send a free audit writeup of what else might be reading "
        "stale? Takes a day. No obligation.",
    ])


def _generic(prospect: dict, first_name: Optional[str], compliment: Optional[str]) -> str:
    """Vertical-neutral fallback for non-dental prospects or rows where no
    individual finding clearly dominates. Uses 'inquiries' instead of
    'patients' so it reads cleanly for personal-injury too."""
    practice = prospect.get("business_name", "your practice")
    return _assemble(_greeting(first_name), compliment, [
        f"Took a look at {practice}'s site. A few things on it are quietly "
        "leaking inquiries — small mechanical issues most owners never see "
        "because the site looks fine when they visit it on their own laptop.",
        "Want me to send a free audit writeup? Takes a day. No obligation.",
    ])


_TEMPLATE_BY_ISSUE = {
    "no_website": _no_website,
    "forms_unreachable": _forms_unreachable,
    "no_viewport": _no_viewport,
    "no_https": _no_https,
    "lighthouse_low": _lighthouse_low,
    "stale_copyright": _stale_copyright,
    "generic": _generic,
}


def generate_fb_message(prospect: dict) -> str:
    """
    Build one cold-outreach DM draft for the given prospect row.

    Reads (all optional except business_name in practice — missing fields just
    drop the corresponding personalization):

        business_name, decision_maker_name, google_rating, google_review_count,
        audit_status, website_url, vertical, issues (jsonb dict),
        lighthouse_mobile_score, place_id

    Returns a multi-line string ready to copy/paste into FB Messenger.
    Raises TypeError if `prospect` is not a dict.
    """
    if not isinstance(prospect, dict):
        raise TypeError("prospect must be a dict")

    first_name = _first_name(prospect.get("decision_maker_name"))
    compliment = _compliment_line(prospect)

    # Outbound voice is dental-specific (memory: outbound is dental-only as of
    # 2026-04-29). For other verticals, use the vertical-neutral fallback.
    vertical = prospect.get("vertical")
    if vertical and vertical != "dental":
        return _generic(prospect, first_name, compliment)

    issue_key = pick_top_issue(prospect)
    fn = _TEMPLATE_BY_ISSUE.get(issue_key, _generic)
    return fn(prospect, first_name, compliment)
