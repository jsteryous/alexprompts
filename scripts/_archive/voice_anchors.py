"""
voice_anchors.py — canonical marketing voice for AI-generated /insights articles.

Used by generate_insights.py alongside audit_stats. The audit_stats block gives
articles factual grounding (proprietary stats); voice_anchors gives them tonal
grounding (the actual StoryBrand language from rebbadvisors.com so generated
articles echo the site's voice instead of reading like a generic dental SEO
blog post).

Edit the constants below when homepage copy meaningfully shifts. They are a
hand-curated mirror of `src/app/page.tsx` + `src/components/HomeSections.tsx`
— not auto-scraped (deliberate: the maintainer decides what counts as voice
canon).

Public:
    voice_prompt_block() -> str   (markdown, for system prompt injection)
    recent_titles_block(client, limit=10) -> str
"""
from __future__ import annotations

from typing import Any


# ── Canonical phrases (mirror of live homepage copy) ────────────────────────

ONE_LINER = (
    "REBB finds and fixes hidden patient loss. Not 'web design,' not "
    "'performance optimization,' not 'dental marketing.'"
)

HERO_EYEBROW = "You're a great dentist."
HERO_H1 = "Your patients love you. Your website doesn't show it."
HERO_LEDE = (
    "You earned a five-star reputation in person. On a phone, a four-second "
    "delay sends a new patient to the next pin. What walks away isn't one "
    "cleaning — it's years of recall, the family they'd have brought, and the "
    "case you'd have caught a year in."
)
HERO_PUNCH = "Most dentists never see them leave. We do."

VILLAIN_FRAME = (
    "The villain is the revenue arc lost — not a slow site, not a missing "
    "tag. Frame any failure mode as 'the patient you never meet, multiplied "
    "by every month the leak has been silent.'"
)
VILLAIN_SCENE = (
    "It's 9pm. Someone searches 'dentist near me.' They tap your pin first. "
    "Your site hangs. They swipe back and book the next one. You will never "
    "know they existed."
)
VILLAIN_PUNCH = "Every silent bounce takes the whole arc."

PROOF_FRAME = "The proposal is the product. If the audit shows no engagement is needed, we say so."

ANTI_UPSELL = [
    "No marketing-strategy calls.",
    "No retainers locking you in.",
    "No 'digital transformation.'",
    "If a cleanup fixes it, we say so. If you need a rebuild, we say that too.",
    "Month-to-month, 30-day cancel — never long-term contracts.",
]

CTA = "See if your website is losing patients"  # the body CTA across the public site
CTA_NAV = "Get Free Audit"                       # button-shortform in nav

PROHIBITED_PHRASES = [
    # Generic agency-speak the public site refuses to use
    "digital transformation",
    "in today's competitive landscape",
    "Google penalizes",       # translate to outcome — see voice rules below
    "5 reasons your dental practice",
    "SEO strategy",
    "ongoing optimization",
    "leverage", "synergy", "robust", "best-in-class",
]


def voice_prompt_block() -> str:
    """Markdown block injected into the Gemini system prompt."""
    return f"""## REBB Voice Anchors (echo these — do not invent alternatives)

The following phrases come straight from rebbadvisors.com. Articles must read
as continuous voice with the live site, not as a generic dental SEO blog.

**One-liner anchor:** {ONE_LINER}

**Homepage hero (the audience-frame):**
- Eyebrow: "{HERO_EYEBROW}"
- H1: "{HERO_H1}"
- Lede: "{HERO_LEDE}"
- Punch: "{HERO_PUNCH}"

**Villain framing — use this shape, not mechanism-only "your site is slow":**
- {VILLAIN_FRAME}
- Scene the homepage uses: "{VILLAIN_SCENE}"
- Closer: "{VILLAIN_PUNCH}"

**Proof / anti-upsell (the credibility play):**
- "{PROOF_FRAME}"
- Anti-upsell beats: {' '.join(ANTI_UPSELL)}

**CTA:** Body CTAs link to /contact and read "{CTA}". Never invent alternates.

**Phrases the public site will NEVER use** (do not write any of these, even as
rhetorical color): {', '.join(repr(p) for p in PROHIBITED_PHRASES)}

**Voice rules that follow from the above:**
- Frame failure modes as revenue lost (the patient you never meet, the family
  they'd have brought, the case you'd have caught a year in) — not as
  technical mechanism.
- Translate SEO mechanics into patient-visible outcomes. Prefer "patients
  searching on phones don't see you as high" over "Google penalizes your
  site." Prefer "patients leave before the page is usable" over "your Core
  Web Vitals are failing."
- Period-separated short sentences over comma-stitched clauses.
- The audit / written proposal is the deliverable. The audit decides scope.
"""


# ── Recent titles (avoid repetition) ────────────────────────────────────────

def recent_titles_block(client: Any, limit: int = 10) -> str:
    """Pull the last N PUBLISHED post titles + their topics so Gemini can
    avoid repeating angles. Returns empty string on any failure (non-fatal).
    """
    try:
        result = (
            client.table("blog_posts")
            .select("title, topic, cluster, created_at")
            .eq("status", "PUBLISHED")
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        rows = result.data or []
    except Exception:
        return ""

    if not rows:
        return ""

    lines = []
    for r in rows:
        title = (r.get("title") or "").strip()
        cluster = (r.get("cluster") or "").strip()
        if title:
            lines.append(f"- [{cluster or 'uncategorized'}] {title}")

    if not lines:
        return ""

    return (
        "## Recently Published (do NOT repeat these angles)\n\n"
        "The following articles already exist on /insights. Do not write a "
        "near-duplicate angle, do not re-use the same lead scene, and do not "
        "open with the same hook. Pick a different concrete failure mode or "
        "a different patient scenario.\n\n"
        + "\n".join(lines)
    )


if __name__ == "__main__":
    # python -m voice_anchors  → print the block (sanity check)
    print(voice_prompt_block())
