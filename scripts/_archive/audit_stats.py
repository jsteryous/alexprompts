"""
audit_stats.py — proprietary aggregate stats from website_prospects.

Used by generate_insights.py to ground AI-written articles in first-party data
(dental sites REBB has actually audited). This is the EEAT moat: stats no one
else has.

Public:
    fetch_dental_stats(client) -> dict
    stats_prompt_block(stats)  -> str   (markdown, for system prompt injection)
    stats_methodology_md(stats) -> str  (markdown footer appended to post body)

Pure data — no side effects. Caller owns the Supabase client.
"""
from __future__ import annotations

import statistics
from datetime import datetime, timezone
from typing import Any


COUNTY_LABELS = {
    # Upstate
    "greenville": "Greenville",
    "spartanburg": "Spartanburg",
    "anderson": "Anderson",
    "pickens": "Pickens",
    "oconee": "Oconee",
    # Charleston tri-county
    "charleston": "Charleston",
    "berkeley": "Berkeley",
    "dorchester": "Dorchester",
    # Midlands
    "richland": "Richland",
    "lexington": "Lexington",
    # Pee Dee / Coast
    "horry": "Horry",
    "florence": "Florence",
    # Other metros
    "york": "York",
    "aiken": "Aiken",
    "beaufort": "Beaufort",
}


def _pct(num: int, denom: int) -> int:
    if denom <= 0:
        return 0
    return round(100 * num / denom)


def fetch_dental_stats(client) -> dict[str, Any]:
    """Pull audited dental rows and compute aggregate stats.

    Returns {} if fewer than 5 audited rows (not enough signal to cite).
    """
    rows: list[dict] = []
    page_size = 1000
    offset = 0
    while True:
        resp = (
            client.table("website_prospects")
            .select(
                "place_id, website_url, county, audit_status, severity_score, "
                "severity_tag, google_rating, google_review_count, "
                "lighthouse_mobile_score, issues"
            )
            .eq("vertical", "dental")
            .range(offset, offset + page_size - 1)
            .execute()
        )
        batch = resp.data or []
        rows.extend(batch)
        if len(batch) < page_size:
            break
        offset += page_size

    total_discovered = len(rows)
    audited = [r for r in rows if r.get("audit_status") == "audited"]
    no_website = [r for r in rows if r.get("audit_status") == "no_website"]
    n = len(audited)

    if n < 5:
        return {}

    def count(pred) -> int:
        return sum(1 for r in audited if pred(r.get("issues") or {}))

    viewport_missing = count(lambda i: bool(i.get("viewport_missing")))
    no_https = count(lambda i: bool(i.get("no_https")))
    mixed_content = count(lambda i: bool(i.get("mixed_content")))
    forms_unreachable = count(lambda i: bool(i.get("forms_unreachable")))

    now_year = datetime.now(timezone.utc).year
    stale_copyright_2plus = count(
        lambda i: isinstance(i.get("stale_copyright"), int)
        and (now_year - i["stale_copyright"]) >= 2
    )
    stale_copyright_3plus = count(
        lambda i: isinstance(i.get("stale_copyright"), int)
        and (now_year - i["stale_copyright"]) >= 3
    )

    lh_scores = [
        r["lighthouse_mobile_score"]
        for r in audited
        if isinstance(r.get("lighthouse_mobile_score"), int)
    ]
    lh_median = int(statistics.median(lh_scores)) if lh_scores else None
    lh_under_50 = sum(1 for s in lh_scores if s < 50)
    lh_under_30 = sum(1 for s in lh_scores if s < 30)

    ratings = [
        float(r["google_rating"])
        for r in audited
        if r.get("google_rating") is not None
    ]
    high_rated = [r for r in audited if (r.get("google_rating") or 0) >= 4.5]
    high_rated_broken = sum(
        1
        for r in high_rated
        if (r.get("severity_score") or 0) >= 40
    )

    hot = sum(1 for r in audited if r.get("severity_tag") == "HOT")
    warm = sum(1 for r in audited if r.get("severity_tag") == "WARM")

    counties = sorted(
        {r.get("county") for r in rows if r.get("county")}
    )
    county_labels = [COUNTY_LABELS.get(c, c.title()) for c in counties]

    return {
        "generated_at": datetime.now(timezone.utc).strftime("%B %Y"),
        "total_discovered": total_discovered,
        "n_audited": n,
        "n_no_website": len(no_website),
        "counties": counties,
        "counties_label": ", ".join(county_labels) or "the Upstate",
        "viewport_missing": viewport_missing,
        "viewport_missing_pct": _pct(viewport_missing, n),
        "no_https": no_https,
        "no_https_pct": _pct(no_https, n),
        "mixed_content": mixed_content,
        "mixed_content_pct": _pct(mixed_content, n),
        "forms_unreachable": forms_unreachable,
        "forms_unreachable_pct": _pct(forms_unreachable, n),
        "stale_copyright_2plus": stale_copyright_2plus,
        "stale_copyright_2plus_pct": _pct(stale_copyright_2plus, n),
        "stale_copyright_3plus": stale_copyright_3plus,
        "stale_copyright_3plus_pct": _pct(stale_copyright_3plus, n),
        "lh_sample": len(lh_scores),
        "lh_median": lh_median,
        "lh_under_50": lh_under_50,
        "lh_under_50_pct": _pct(lh_under_50, len(lh_scores)),
        "lh_under_30": lh_under_30,
        "lh_under_30_pct": _pct(lh_under_30, len(lh_scores)),
        "high_rated_n": len(high_rated),
        "high_rated_broken": high_rated_broken,
        "high_rated_broken_pct": _pct(high_rated_broken, len(high_rated)),
        "avg_rating": round(statistics.mean(ratings), 2) if ratings else None,
        "hot": hot,
        "warm": warm,
        "hot_warm_pct": _pct(hot + warm, n),
    }


def stats_prompt_block(stats: dict[str, Any]) -> str:
    """Markdown block injected into Gemini's system prompt.

    Gemini is instructed to cite at least two of these figures verbatim so the
    article carries first-party evidence Google's helpful-content system
    rewards. Returns empty string when no stats are available.
    """
    if not stats:
        return ""

    n = stats["n_audited"]
    c = stats["counties_label"]
    lh = stats["lh_median"]
    lh_line = (
        f"- Median mobile Lighthouse score: {lh} (n={stats['lh_sample']}; "
        f"{stats['lh_under_50_pct']}% score under 50, "
        f"{stats['lh_under_30_pct']}% under 30)."
        if lh is not None
        else ""
    )

    high_rated_line = (
        f"- Of {stats['high_rated_n']} practices with a Google rating ≥4.5 stars, "
        f"{stats['high_rated_broken']} ({stats['high_rated_broken_pct']}%) "
        f"have a site with ≥1 critical issue. "
        f"(Great reviews, broken storefront — a recurring pattern.)"
        if stats["high_rated_n"] >= 3
        else ""
    )

    no_site_line = (
        f"- {stats['n_no_website']} dental practices in our discovery set "
        f"have no website at all (Google Business Profile only)."
        if stats["n_no_website"] > 0
        else ""
    )

    lines = [
        "## REBB FIRST-PARTY AUDIT DATA — CITE AT LEAST TWO FIGURES VERBATIM",
        "",
        f"As of {stats['generated_at']}, REBB Advisors has programmatically audited "
        f"{n} dental practice websites across {c} counties. From that dataset:",
        "",
        f"- {stats['forms_unreachable']} of {n} ({stats['forms_unreachable_pct']}%) "
        f"have a contact or booking form posting to a dead endpoint (404/410).",
        f"- {stats['viewport_missing']} of {n} ({stats['viewport_missing_pct']}%) "
        f"are missing a mobile viewport tag (desktop-only layout on phones).",
        f"- {stats['no_https']} of {n} ({stats['no_https_pct']}%) "
        f"are not served over HTTPS.",
        f"- {stats['mixed_content']} of {n} ({stats['mixed_content_pct']}%) "
        f"load mixed HTTP/HTTPS assets (browser 'not secure' warning).",
        f"- {stats['stale_copyright_2plus']} of {n} ({stats['stale_copyright_2plus_pct']}%) "
        f"display a footer copyright year 2+ years stale; "
        f"{stats['stale_copyright_3plus']} ({stats['stale_copyright_3plus_pct']}%) "
        f"are 3+ years stale.",
        lh_line,
        high_rated_line,
        no_site_line,
        f"- {stats['hot']} audited sites scored HOT (≥70) and {stats['warm']} scored WARM "
        f"(40-69) on REBB's severity index — "
        f"{stats['hot_warm_pct']}% of audited practices have at least one issue worth fixing.",
        "",
        "Rules when citing these figures:",
        "- Cite at least TWO distinct statistics verbatim with exact numbers (e.g., "
        "'{forms_unreachable} of {n}' or '{pct}% of sites we audited').",
        "- Attribute: 'REBB Advisors' audit data' or 'sites we audited' — never a "
        "vague 'industry study' or 'research shows'.",
        "- If no stat above is relevant to the article's angle, pick a different "
        "angle — do NOT fabricate stats or cite generic third-party figures.",
        "- Never name a specific practice, website, or city-level count small "
        "enough to identify one.",
    ]
    return "\n".join([line for line in lines if line != ""])


def stats_methodology_md(stats: dict[str, Any]) -> str:
    """Markdown footer appended to published article body.

    Surfaces REBB's methodology so cited stats are verifiable — a Google EEAT
    signal (first-party, dated, bounded).
    """
    if not stats:
        return ""
    return (
        "\n\n---\n\n"
        "## Methodology\n\n"
        f"Figures in this article are from REBB Advisors' ongoing audit of dental "
        f"practice websites in {stats['counties_label']} counties "
        f"(Upstate South Carolina). As of {stats['generated_at']}, the dataset "
        f"covers {stats['n_audited']} audited practice websites "
        f"(n discovered: {stats['total_discovered']}). "
        "Each audit is a headless-browser capture on mobile and desktop, with "
        "automated checks for missing viewport tags, unreachable form endpoints "
        "(404/410), HTTPS and mixed-content status, stale footer copyright years, "
        "and a Google PageSpeed Insights Lighthouse mobile score. Severity is "
        "scored 0-100 across those signals. The dataset excludes practices "
        "without a public website. Counts update continuously; the figures "
        "cited here are accurate as of publication."
    )


if __name__ == "__main__":
    import json
    import os
    import sys
    from pathlib import Path

    from dotenv import load_dotenv
    from supabase import create_client

    load_dotenv(Path(__file__).resolve().parent.parent / ".env.local")
    url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")
    if not url or not key:
        print("SUPABASE_URL / SUPABASE_SERVICE_KEY missing.", file=sys.stderr)
        sys.exit(1)

    stats = fetch_dental_stats(create_client(url, key))
    if not stats:
        print("Insufficient audited rows (<5) — stats unavailable.")
        sys.exit(0)

    print(json.dumps(stats, indent=2))
    print("\n" + "=" * 60)
    print("PROMPT BLOCK:")
    print("=" * 60)
    print(stats_prompt_block(stats))
    print("\n" + "=" * 60)
    print("METHODOLOGY FOOTER:")
    print("=" * 60)
    print(stats_methodology_md(stats))
