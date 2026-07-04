"""
Autonomous cover-library grower for the Greenville /real-estate engine.

The evergreen guides market Greenville, so their covers should be beautiful,
iconic Greenville photos, not geocoded street corners. `src/lib/greenvilleCovers.json`
holds a hand-picked set; this script grows it without a human hand-picking each
one. The hard part is not fetching photos, it is judging quality: a raw Wikimedia
Commons search returns watermarked and mediocre shots as readily as good ones. So
this automates the eyeball pass a person would do:

  1. For each existing subject, search Wikimedia Commons for freely-licensed,
     landscape, high-resolution candidates it does not already have.
  2. Score each candidate with a cheap Claude vision call (Haiku): is it an
     attractive, on-subject hero with no watermark or overlaid text?
  3. Save the accepted ones into public/greenville/library/, append them to
     greenvilleCovers.json and CREDITS.md (attribution pulled straight from the
     Commons metadata), so the resolver rotates them in.

It only GROWS existing subjects (the writer's subject vocabulary is fixed in
pass_evergreen.md); it never invents a subject. Run it from a GitHub Action that
opens a PR, so a human still eyeballs the additions before they go live.

Usage (from the scripts/ directory):
    python -m greenville.cover_ingest --max-new 3
    python -m greenville.cover_ingest --subject liberty-bridge --dry-run
    python -m greenville.cover_ingest --no-vision           # skip the AI gate (testing)

Env:
    ANTHROPIC_API_KEY   required unless --no-vision or --dry-run.
"""
from __future__ import annotations

import argparse
import base64
import json
import re
import sys
import time
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import quote

import requests

REPO = Path(__file__).resolve().parents[2]
LIBRARY_DIR = REPO / "public" / "greenville" / "library"
COVERS_JSON = REPO / "src" / "lib" / "greenvilleCovers.json"
CREDITS_MD = LIBRARY_DIR / "CREDITS.md"

COMMONS_API = "https://commons.wikimedia.org/w/api.php"
USER_AGENT = "AlexPromptsCoverBot/1.0 (https://www.alexprompts.com; jsteryous@gmail.com)"
VISION_MODEL = "claude-haiku-4-5"

# Existing subjects -> the Commons searches that surface good candidates for them.
# Only subjects already in the writer's vocabulary (pass_evergreen.md) belong here.
SUBJECT_QUERIES: dict[str, list[str]] = {
    "downtown-falls": ["Downtown Greenville South Carolina Reedy River", "RiverPlace Greenville South Carolina"],
    "liberty-bridge": ["Liberty Bridge Greenville Falls Park", "Falls Park on the Reedy Greenville"],
    "reedy-river": ["Reedy River Falls Park Greenville South Carolina"],
    "north-main": ["North Main Street Greenville South Carolina", "Main Street Greenville South Carolina downtown"],
    "west-end": ["West End Greenville South Carolina", "Greenville South Carolina skyline"],
    "swamp-rabbit-trail": ["Swamp Rabbit Trail Greenville South Carolina"],
    "travelers-rest": ["Travelers Rest South Carolina downtown"],
}

MIN_WIDTH = 1600  # source pixels on the long edge; heroes need real resolution
THUMB_WIDTH = 1600  # what we download and commit
VISION_THUMB = 1024  # smaller render for the (cheap) vision call
VISION_ACCEPT = 70  # minimum score to keep a candidate


class _TagStripper(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.parts: list[str] = []

    def handle_data(self, data: str) -> None:
        self.parts.append(data)


def strip_html(s: str) -> str:
    p = _TagStripper()
    p.feed(s or "")
    return re.sub(r"\s+", " ", "".join(p.parts)).strip()


def load_covers() -> dict:
    return json.loads(COVERS_JSON.read_text(encoding="utf-8"))


def existing_sources(covers: dict) -> set[str]:
    out: set[str] = set()
    for entries in covers["subjects"].values():
        for e in entries:
            if e.get("source"):
                out.add(e["source"])
    return out


def commons_search(query: str, limit: int = 20) -> list[dict]:
    """Return raw imageinfo dicts for File-namespace search hits."""
    params = {
        "action": "query",
        "format": "json",
        "generator": "search",
        "gsrsearch": query,
        "gsrnamespace": "6",
        "gsrlimit": str(limit),
        "prop": "imageinfo",
        "iiprop": "url|size|extmetadata",
        "iiurlwidth": str(THUMB_WIDTH),
    }
    r = requests.get(COMMONS_API, params=params, headers={"User-Agent": USER_AGENT}, timeout=30)
    r.raise_for_status()
    pages = (r.json().get("query") or {}).get("pages") or {}
    return [p for p in pages.values() if p.get("imageinfo")]


def license_ok(meta: dict) -> bool:
    lic = (meta.get("License", {}).get("value") or "").lower()
    short = (meta.get("LicenseShortName", {}).get("value") or "").lower()
    blob = f"{lic} {short}"
    if any(bad in blob for bad in ("non-free", "nonfree", "fair use", "copyright", "all rights")):
        return False
    return any(good in blob for good in ("cc0", "cc-by", "cc by", "public domain", "pd-"))


def credit_for(meta: dict) -> str | None:
    """CC-BY/BY-SA images need a visible credit; CC0 and public domain do not."""
    short = meta.get("LicenseShortName", {}).get("value") or ""
    low = short.lower()
    if "cc0" in low or "public domain" in low or low.startswith("pd"):
        return None
    artist = strip_html(meta.get("Artist", {}).get("value") or "")
    artist = re.split(r"\s+from\s+", artist)[0].strip() or "Unknown"
    if len(artist) > 60:
        artist = artist[:57].rstrip() + "..."
    return f"Photo: {artist}, {short}, via Wikimedia Commons"


def candidates_for(subject: str, existing: set[str], min_width: int) -> list[dict]:
    """De-duplicated, license-clean, landscape candidates, best resolution first."""
    seen: set[str] = set()
    out: list[dict] = []
    for query in SUBJECT_QUERIES[subject]:
        for page in commons_search(query):
            info = page["imageinfo"][0]
            src = info.get("descriptionurl")
            if not src or src in existing or src in seen:
                continue
            w, h = info.get("width", 0), info.get("height", 0)
            if w <= h or w < min_width:
                continue  # portrait/square or too small for a hero
            if not info.get("thumburl") or not license_ok(info.get("extmetadata", {})):
                continue
            seen.add(src)
            out.append(info)
    out.sort(key=lambda i: i.get("width", 0), reverse=True)
    return out


def fetch(url: str) -> bytes:
    r = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=60)
    r.raise_for_status()
    return r.content


VISION_PROMPT = (
    "You are grading a candidate lead photo for an article about {subject_desc}. "
    "It will be the hero image at the top of the page, so it must look like a real, "
    "attractive photograph of that subject. Reject it if it has a watermark, a logo, "
    "overlaid text, or a URL stamped on it; if it is a map, screenshot, diagram, sign, "
    "or a dull close-up; or if it does not clearly show the stated subject. "
    "Respond with ONLY a JSON object, no prose: "
    '{{"score": <0-100>, "on_subject": <bool>, "watermark": <bool>, "reason": "<short>"}}'
)

SUBJECT_DESC = {
    "downtown-falls": "downtown Greenville, South Carolina, along the Reedy River",
    "liberty-bridge": "the Liberty Bridge and Falls Park in downtown Greenville, South Carolina",
    "reedy-river": "the Reedy River falls at Falls Park in Greenville, South Carolina",
    "north-main": "the Main Street storefront district of downtown Greenville, South Carolina",
    "west-end": "the West End and skyline of downtown Greenville, South Carolina",
    "swamp-rabbit-trail": "the Swamp Rabbit Trail greenway near Greenville, South Carolina",
    "travelers-rest": "downtown Travelers Rest, South Carolina",
}


def vision_score(client, subject: str, image: bytes, media_type: str = "image/jpeg") -> dict:
    b64 = base64.standard_b64encode(image).decode("ascii")
    msg = client.messages.create(
        model=VISION_MODEL,
        max_tokens=400,
        messages=[{
            "role": "user",
            "content": [
                {"type": "image", "source": {"type": "base64", "media_type": media_type, "data": b64}},
                {"type": "text", "text": VISION_PROMPT.format(subject_desc=SUBJECT_DESC[subject])},
            ],
        }],
    )
    text = "".join(b.text for b in msg.content if b.type == "text")
    m = re.search(r"\{.*\}", text, re.DOTALL)
    if not m:
        raise ValueError(f"no JSON in vision reply: {text[:200]}")
    return json.loads(m.group(0))


def append_credit_row(entry: dict, subject: str) -> None:
    """Append one attribution row to CREDITS.md (best-effort; table format)."""
    if not CREDITS_MD.exists():
        return
    lic = "CC0" if entry["credit"] is None else entry["credit"].split(", ", 1)[-1].replace(", via Wikimedia Commons", "")
    author = "—" if entry["credit"] is None else entry["credit"].split(", ", 1)[0].replace("Photo: ", "")
    src = entry.get("source", "")
    row = f"| `{entry['file']}` | {subject} | [source]({src}) | {author} | {lic} |\n"
    with CREDITS_MD.open("a", encoding="utf-8") as fh:
        fh.write(row)


def main() -> int:
    ap = argparse.ArgumentParser(description="Grow the Greenville cover library, vision-gated.")
    ap.add_argument("--max-new", type=int, default=3, help="stop after adding this many photos total")
    ap.add_argument("--per-subject", type=int, default=1, help="max new photos per subject per run")
    ap.add_argument("--subject", action="append", help="limit to these subject(s)")
    ap.add_argument("--min-width", type=int, default=MIN_WIDTH)
    ap.add_argument("--dry-run", action="store_true", help="list candidates, write nothing, no vision")
    ap.add_argument("--no-vision", action="store_true", help="skip the AI gate (accept by heuristics)")
    args = ap.parse_args()

    covers = load_covers()
    existing = existing_sources(covers)
    subjects = args.subject or list(SUBJECT_QUERIES)
    unknown = [s for s in subjects if s not in covers["subjects"]]
    if unknown:
        print(f"unknown subject(s), not in greenvilleCovers.json: {unknown}", file=sys.stderr)
        return 2

    client = None
    if not args.dry_run and not args.no_vision:
        try:
            import anthropic
        except ImportError:
            print("anthropic SDK not installed (pip install anthropic), or pass --no-vision", file=sys.stderr)
            return 2
        client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY

    added = 0
    for subject in subjects:
        if added >= args.max_new:
            break
        cands = candidates_for(subject, existing, args.min_width)
        print(f"[{subject}] {len(cands)} candidate(s)")
        taken = 0
        for info in cands:
            if added >= args.max_new or taken >= args.per_subject:
                break
            meta = info.get("extmetadata", {})
            src = info["descriptionurl"]
            if args.dry_run:
                print(f"  candidate {info['width']}x{info['height']}  {src}")
                continue
            try:
                if client is not None:
                    vurl = info["thumburl"].replace(f"/{THUMB_WIDTH}px-", f"/{VISION_THUMB}px-")
                    media_type = "image/png" if vurl.lower().endswith(".png") else "image/jpeg"
                    verdict = vision_score(client, subject, fetch(vurl), media_type)
                    ok = verdict.get("score", 0) >= VISION_ACCEPT and verdict.get("on_subject") and not verdict.get("watermark")
                    print(f"  score={verdict.get('score')} on_subject={verdict.get('on_subject')} "
                          f"watermark={verdict.get('watermark')} -> {'KEEP' if ok else 'skip'}  ({verdict.get('reason','')[:60]})")
                    if not ok:
                        continue
                # allocate the next filename for this subject
                n = len(covers["subjects"][subject]) + 1
                fname = f"{subject}-{n}.jpg"
                (LIBRARY_DIR / fname).write_bytes(fetch(info["thumburl"]))
                entry = {
                    "file": fname,
                    "alt": SUBJECT_DESC[subject].capitalize() + ".",
                    "credit": credit_for(meta),
                    "source": src,
                }
                covers["subjects"][subject].append(entry)
                append_credit_row(entry, subject)
                existing.add(src)
                added += 1
                taken += 1
                print(f"  ADDED {fname}  <- {src}")
                time.sleep(1)  # be polite to Commons + the API
            except Exception as e:  # noqa: BLE001 - one bad candidate should not kill the run
                print(f"  candidate failed: {e}", file=sys.stderr)

    if not args.dry_run and added:
        COVERS_JSON.write_text(json.dumps(covers, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"\nDone. Added {added} photo(s).{' (dry run)' if args.dry_run else ''}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
