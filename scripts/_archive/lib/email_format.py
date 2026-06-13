"""
email_format.py — Shared HTML formatting helpers for REBB email alerts and digests.

Imported by run_daily.py and weekly_leads_digest.py.
"""

TAG_COLORS: dict[str, tuple[str, str, str]] = {
    "HOT":  ("#fef2f2", "#dc2626", "#dc2626"),  # bg, text, border
    "WARM": ("#fffbeb", "#d97706", "#d97706"),
    "COLD": ("#f9fafb", "#6b7280", "#d1d5db"),
}


def fmt_currency(val) -> str:
    """Format a numeric valuation as a dollar string, or '—' if missing/invalid."""
    if val is None:
        return "—"
    try:
        return f"${float(val):,.0f}"
    except (TypeError, ValueError):
        return "—"


def tag_badge(tag: str) -> str:
    """Return an inline HTML <span> pill for a HOT/WARM/COLD tag."""
    tag = (tag or "WARM").upper()
    bg, color, _ = TAG_COLORS.get(tag, TAG_COLORS["WARM"])
    return (
        f'<span style="display:inline-block;background:{bg};color:{color};'
        f'font-size:11px;font-weight:700;letter-spacing:.08em;padding:2px 8px;'
        f'border-radius:4px">{tag}</span>'
    )
