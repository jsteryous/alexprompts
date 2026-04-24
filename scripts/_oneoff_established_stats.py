"""
One-off: how broken are the "visibly successful" dental practices?

For audited dental rows, bucket by Google review count (a proxy for
established / busy practices) and report:
  - % with forms_unreachable (dead contact form)
  - % with viewport_missing (desktop-only on mobile)
  - % with lighthouse_mobile < 50
  - % with ANY of the above
  - median Lighthouse in each bucket
  - HOT/WARM share

Buckets: <50 reviews, 50-99, 100-249, 250-499, 500+.

Run: python scripts/_oneoff_established_stats.py
"""
from __future__ import annotations

import os
import statistics
import sys
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client


def pct(num: int, denom: int) -> str:
    if denom <= 0:
        return "   —  "
    return f"{round(100 * num / denom):>3d}%  ({num}/{denom})"


def bucket_label(n: int | None) -> str:
    if n is None:
        return "unknown"
    if n < 50:
        return "<50 reviews"
    if n < 100:
        return "50-99 reviews"
    if n < 250:
        return "100-249 reviews"
    if n < 500:
        return "250-499 reviews"
    return "500+ reviews"


BUCKETS = [
    "<50 reviews",
    "50-99 reviews",
    "100-249 reviews",
    "250-499 reviews",
    "500+ reviews",
    "unknown",
]


def main() -> int:
    load_dotenv(Path(__file__).resolve().parent.parent / ".env.local")
    url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")
    if not url or not key:
        print("SUPABASE_URL / SUPABASE_SERVICE_KEY missing.", file=sys.stderr)
        return 1

    client = create_client(url, key)

    rows: list[dict] = []
    page_size = 1000
    offset = 0
    while True:
        resp = (
            client.table("website_prospects")
            .select(
                "place_id, county, audit_status, severity_score, severity_tag, "
                "google_rating, google_review_count, lighthouse_mobile_score, issues"
            )
            .eq("vertical", "dental")
            .eq("audit_status", "audited")
            .range(offset, offset + page_size - 1)
            .execute()
        )
        batch = resp.data or []
        rows.extend(batch)
        if len(batch) < page_size:
            break
        offset += page_size

    print(f"Audited dental rows: {len(rows)}\n")

    by_bucket: dict[str, list[dict]] = {b: [] for b in BUCKETS}
    for r in rows:
        by_bucket[bucket_label(r.get("google_review_count"))].append(r)

    header = (
        f"{'Bucket':<18}  {'n':>4}  "
        f"{'broken form':<14}  {'no viewport':<14}  "
        f"{'LH<50':<14}  {'any issue':<14}  "
        f"{'LH median':>10}  {'HOT+WARM':<14}"
    )
    print(header)
    print("-" * len(header))

    for b in BUCKETS:
        bucket = by_bucket[b]
        n = len(bucket)
        if n == 0:
            continue

        forms_broken = sum(
            1 for r in bucket if (r.get("issues") or {}).get("forms_unreachable")
        )
        no_viewport = sum(
            1 for r in bucket if (r.get("issues") or {}).get("viewport_missing")
        )
        lh_scores = [
            r["lighthouse_mobile_score"]
            for r in bucket
            if isinstance(r.get("lighthouse_mobile_score"), int)
        ]
        lh_under_50 = sum(1 for s in lh_scores if s < 50)
        lh_median = int(statistics.median(lh_scores)) if lh_scores else None

        any_issue = sum(
            1
            for r in bucket
            if (r.get("issues") or {}).get("forms_unreachable")
            or (r.get("issues") or {}).get("viewport_missing")
            or (
                isinstance(r.get("lighthouse_mobile_score"), int)
                and r["lighthouse_mobile_score"] < 50
            )
        )

        hot_warm = sum(
            1 for r in bucket if r.get("severity_tag") in ("HOT", "WARM")
        )

        print(
            f"{b:<18}  {n:>4}  "
            f"{pct(forms_broken, n):<14}  {pct(no_viewport, n):<14}  "
            f"{pct(lh_under_50, len(lh_scores)):<14}  {pct(any_issue, n):<14}  "
            f"{(lh_median if lh_median is not None else '—'):>10}  "
            f"{pct(hot_warm, n):<14}"
        )

    print()
    print("--- High-review cohort (>=100 reviews) ---")
    established = [
        r for r in rows if (r.get("google_review_count") or 0) >= 100
    ]
    n = len(established)
    if n == 0:
        print("No audited practices with ≥100 reviews yet.")
        return 0

    forms_broken = sum(
        1 for r in established if (r.get("issues") or {}).get("forms_unreachable")
    )
    no_viewport = sum(
        1 for r in established if (r.get("issues") or {}).get("viewport_missing")
    )
    no_https = sum(
        1 for r in established if (r.get("issues") or {}).get("no_https")
    )
    mixed = sum(
        1 for r in established if (r.get("issues") or {}).get("mixed_content")
    )
    lh_scores = [
        r["lighthouse_mobile_score"]
        for r in established
        if isinstance(r.get("lighthouse_mobile_score"), int)
    ]
    lh_under_50 = sum(1 for s in lh_scores if s < 50)
    lh_under_30 = sum(1 for s in lh_scores if s < 30)

    any_issue = sum(
        1
        for r in established
        if (r.get("issues") or {}).get("forms_unreachable")
        or (r.get("issues") or {}).get("viewport_missing")
        or (r.get("issues") or {}).get("no_https")
        or (
            isinstance(r.get("lighthouse_mobile_score"), int)
            and r["lighthouse_mobile_score"] < 50
        )
    )
    hot = sum(1 for r in established if r.get("severity_tag") == "HOT")
    warm = sum(1 for r in established if r.get("severity_tag") == "WARM")
    ratings = [
        float(r["google_rating"])
        for r in established
        if r.get("google_rating") is not None
    ]

    print(f"n (established, >=100 Google reviews): {n}")
    print(
        f"Avg Google rating in cohort: "
        f"{round(statistics.mean(ratings), 2) if ratings else '—'}"
    )
    print()
    print(f"Broken contact form (404/410):  {pct(forms_broken, n)}")
    print(f"No mobile viewport tag:         {pct(no_viewport, n)}")
    print(f"Not served over HTTPS:          {pct(no_https, n)}")
    print(f"Mixed HTTP/HTTPS content:       {pct(mixed, n)}")
    print(
        f"Lighthouse mobile < 50:         {pct(lh_under_50, len(lh_scores))}"
    )
    print(
        f"Lighthouse mobile < 30:         {pct(lh_under_30, len(lh_scores))}"
    )
    print(
        f"Lighthouse median:              "
        f"{int(statistics.median(lh_scores)) if lh_scores else '—'} (n={len(lh_scores)})"
    )
    print()
    print(f"ANY of {{broken form, no viewport, no HTTPS, LH<50}}: {pct(any_issue, n)}")
    print(f"HOT severity (>=70):            {pct(hot, n)}")
    print(f"WARM severity (40-69):          {pct(warm, n)}")
    print(f"HOT + WARM:                     {pct(hot + warm, n)}")

    print()
    print("--- Very established cohort (>=250 reviews) ---")
    vip = [r for r in rows if (r.get("google_review_count") or 0) >= 250]
    n = len(vip)
    if n > 0:
        any_issue = sum(
            1
            for r in vip
            if (r.get("issues") or {}).get("forms_unreachable")
            or (r.get("issues") or {}).get("viewport_missing")
            or (r.get("issues") or {}).get("no_https")
            or (
                isinstance(r.get("lighthouse_mobile_score"), int)
                and r["lighthouse_mobile_score"] < 50
            )
        )
        forms_broken = sum(
            1 for r in vip if (r.get("issues") or {}).get("forms_unreachable")
        )
        lh_scores = [
            r["lighthouse_mobile_score"]
            for r in vip
            if isinstance(r.get("lighthouse_mobile_score"), int)
        ]
        lh_under_50 = sum(1 for s in lh_scores if s < 50)
        print(f"n (>=250 reviews): {n}")
        print(f"Broken contact form:  {pct(forms_broken, n)}")
        print(f"Lighthouse < 50:      {pct(lh_under_50, len(lh_scores))}")
        print(f"ANY critical issue:   {pct(any_issue, n)}")
    else:
        print("No audited practices with ≥250 reviews yet.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
