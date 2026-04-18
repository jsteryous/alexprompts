"""
contact_extract.py — Pull emails + decision-maker name/title from a prospect's site.

Pure functions over already-captured HTML + visible text. No network calls,
no DB calls. The audit loop crawls up to 3 candidate contact/about/team pages
per prospect and passes the combined content through here.

Goal: surface the human we should actually email, not info@.

Email ranking (0-100, higher = better):
  95 — both DM first AND last name appear in local part
  85 — "dr.<lastname>" / "<lastname>dds" pattern
  80 — owner@, founder@, partner@, principal@
  75 — DM surname match only (surname inbox — shared by family/firm)
  70 — firstname.lastname / f.lastname style
  55 — DM first-name match only
  30 — low-priority shared (appointments@, billing@, hr@)
  20 — unclassified single-word local part
  10 — shared inbox (info@, contact@, office@, reception@)
   0 — blocklisted (noreply@, postmaster@, etc.)
Off-domain email → -20 adjustment (clamped at 0).

Surname-only vs full-match distinction: `smith@firm.com` when DM is "Jane Smith"
is a shared inbox (husband/partner/family), not a direct line to Jane. Elevating
it to a full DM match overstates confidence for outreach. 75 keeps it near the
top but below genuine personal addresses.

Decision-maker extraction looks for:
  - "Dr. Jane Smith" (dental) / "Jane Smith, DDS"
  - "Jane Smith, Esq." / ", Partner" / ", Founder" / ", Owner"
  - "Owner: Jane Smith" / "Founder: ..."
Business-name surname bump: if the practice is "Smith Family Dentistry" and
a candidate is "Jane Smith", its score is boosted.
"""

from __future__ import annotations

import re
from typing import Iterable, Optional
from urllib.parse import urlparse

# ── Candidate page discovery ─────────────────────────────────────────────────

# Path fragments worth following from the home page. Matched case-insensitive
# as a substring of the URL path.
CANDIDATE_CONTACT_PATHS = (
    "about", "contact",
    "team", "staff",
    "meet-the-doctor", "meet-the-doctors", "meet-the-team", "meet-dr",
    "doctors", "our-doctors", "dentist", "dentists", "our-dentists",
    "attorneys", "our-attorneys", "lawyers", "our-lawyers",
    "leadership", "partners", "founders", "providers",
)


# Always-probe fallback paths when href discovery finds nothing. Dentists and
# law firms often put these in a footer/hamburger menu that doesn't render as
# a plain <a> on the mobile home page.
FALLBACK_PROBE_PATHS = (
    "/contact", "/contact-us", "/about", "/about-us",
    "/meet-the-doctor", "/our-team", "/attorneys",
)


def fallback_probe_urls(home_url: str, already_found: Iterable[str], limit: int = 3) -> list[str]:
    """
    Build absolute URLs for well-known contact-ish paths on the same origin
    as `home_url`, excluding any already in `already_found`. Cap at `limit`.
    Callers should fetch these speculatively — 404s are expected.
    """
    try:
        base = urlparse(home_url)
    except Exception:
        return []
    if not base.netloc:
        return []
    existing = {u.rstrip("/") for u in already_found}
    root = f"{base.scheme}://{base.netloc}"
    out: list[str] = []
    for path in FALLBACK_PROBE_PATHS:
        url = f"{root}{path}"
        if url.rstrip("/") in existing:
            continue
        out.append(url)
        if len(out) >= limit:
            break
    return out


def find_candidate_page_urls(home_url: str, links: Iterable[str], limit: int = 3) -> list[str]:
    """
    From href values collected on the home page, pick same-origin internal
    links whose path looks like a contact/about/team page. Returns ≤ `limit`
    URLs in discovery order, deduplicated.
    """
    try:
        base = urlparse(home_url)
    except Exception:
        return []
    if not base.netloc:
        return []

    seen: set[str] = set()
    matches: list[str] = []
    for href in links:
        if not href or not isinstance(href, str):
            continue
        href = href.strip()
        if href.startswith(("mailto:", "tel:", "javascript:", "#")):
            continue
        if not href.startswith(("http://", "https://")):
            continue
        u = urlparse(href)
        if u.netloc != base.netloc:
            continue
        path = u.path.lower().strip("/")
        if not path:
            continue
        if not any(frag in path for frag in CANDIDATE_CONTACT_PATHS):
            continue
        key = f"{u.scheme}://{u.netloc}{u.path}"
        if key in seen:
            continue
        seen.add(key)
        matches.append(key)
        if len(matches) >= limit:
            break
    return matches


# ── Email extraction ─────────────────────────────────────────────────────────

_EMAIL_RE = re.compile(r"[A-Za-z0-9][A-Za-z0-9._%+\-]*@[A-Za-z0-9.\-]+\.[A-Za-z]{2,24}")
_MAILTO_RE = re.compile(r'mailto:([^"\'>\s?]+)', re.I)
_CF_DATA_RE = re.compile(r'data-cfemail\s*=\s*["\']([0-9a-fA-F]+)["\']', re.I)
_CF_HREF_RE = re.compile(r'/cdn-cgi/l/email-protection#([0-9a-fA-F]+)', re.I)

EMAIL_BLOCKLIST_LOCAL_PARTS = {
    "noreply", "no-reply", "donotreply", "do-not-reply",
    "mailer-daemon", "postmaster", "webmaster",
}

GENERIC_LOCAL_PARTS = {
    "info", "contact", "office", "reception", "admin", "hello",
    "help", "support", "mail", "email", "inquiries", "inquiry",
    "general", "frontdesk", "front-desk", "scheduling", "schedule",
    "team", "staff",
}

LOW_PRIORITY_LOCAL_PARTS = {
    "appointments", "appointment", "billing", "hr", "careers", "jobs",
    "sales", "marketing", "accounting", "records", "referral", "referrals",
    "newpatient", "newpatients", "newclient", "newclients",
}

OWNERSHIP_LOCAL_PARTS = {
    "owner", "founder", "partner", "principal", "attorney",
    "lawyer", "doctor", "doctors", "dentist",
}

# Obvious non-contact email-shaped strings we see in templates / tracking scripts
_SPURIOUS_EMAIL_SUBSTRINGS = (
    "sentry.io", "wixpress.com", "example.com", "domain.com",
    "yourdomain", "sample.com", ".png", ".jpg", ".webp", ".gif", ".svg",
)


def _decode_cf_email(hex_str: str) -> Optional[str]:
    """
    Decode a Cloudflare email-obfuscation payload.
    Format: first byte = XOR key, remaining bytes = XOR'd email chars.
    """
    try:
        data = bytes.fromhex(hex_str)
        if len(data) < 2:
            return None
        key = data[0]
        decoded = "".join(chr(b ^ key) for b in data[1:])
        return decoded if "@" in decoded else None
    except ValueError:
        return None


def extract_emails(html: str, text: str) -> list[str]:
    """All unique emails found in page html + visible text, lowercased.
    Also decodes Cloudflare `data-cfemail` / `/cdn-cgi/l/email-protection` obfuscation."""
    found: set[str] = set()
    for m in _MAILTO_RE.finditer(html or ""):
        raw = m.group(1).split("?")[0].strip().lower()
        if "@" in raw:
            found.add(raw)
    for src in (html or "", text or ""):
        for m in _EMAIL_RE.finditer(src):
            found.add(m.group(0).lower())
    # Cloudflare email obfuscation
    for pattern in (_CF_DATA_RE, _CF_HREF_RE):
        for m in pattern.finditer(html or ""):
            decoded = _decode_cf_email(m.group(1))
            if decoded and _EMAIL_RE.fullmatch(decoded):
                found.add(decoded.lower())
    return sorted(found)


def _is_blocklisted(email: str) -> bool:
    if any(s in email for s in _SPURIOUS_EMAIL_SUBSTRINGS):
        return True
    local = email.split("@", 1)[0]
    return local in EMAIL_BLOCKLIST_LOCAL_PARTS


def _normalize_host(host: Optional[str]) -> Optional[str]:
    if not host:
        return None
    h = host.lower().strip()
    if h.startswith("www."):
        h = h[4:]
    return h or None


def _domain_matches(email: str, site_host: Optional[str]) -> bool:
    """True when the email domain is (a subdomain of) the site host, or vice versa."""
    host = _normalize_host(site_host)
    if not host:
        return True  # can't verify; don't penalize
    email_dom = email.rsplit("@", 1)[-1].lower()
    return email_dom == host or email_dom.endswith("." + host) or host.endswith("." + email_dom)


def _name_tokens(name: str) -> list[str]:
    """Lowercase alphabetic tokens in a person name, excluding honorifics/credentials."""
    drop = {"dr", "mr", "mrs", "ms", "miss", "esq", "esquire",
            "dds", "dmd", "md", "msd", "phd", "jr", "sr", "ii", "iii", "iv"}
    toks = [t.lower() for t in re.findall(r"[A-Za-z]{2,}", name or "")]
    return [t for t in toks if t not in drop]


def _score_email(
    email: str,
    decision_maker_name: Optional[str],
    site_host: Optional[str],
) -> tuple[int, str]:
    local = email.split("@", 1)[0].lower()
    local_alpha = re.sub(r"[^a-z]", "", local)

    domain_adj = 0 if _domain_matches(email, site_host) else -20

    # Decision-maker match — tiered: full match > dr.<lastname> > surname-only > first-name only.
    # Single-token segment matches are treated as partial (not "full DM match") because
    # a surname local part is usually a family/firm shared inbox, not a personal line.
    if decision_maker_name:
        parts = _name_tokens(decision_maker_name)
        if parts:
            first, last = parts[0], parts[-1]
            segments = set(re.split(r"[._\-]", local))

            # For substring ("in local_alpha") checks, require ≥3 chars so short
            # tokens like "Li" / "Jo" don't false-match inside unrelated locals.
            def _token_match(tok: str) -> bool:
                if not tok:
                    return False
                if tok in segments:
                    return True
                return len(tok) >= 3 and tok in local_alpha

            dr_aliases = (f"dr{last}", f"dr.{last}", f"{last}dds", f"{last}dmd") if last else ()

            first_matches = _token_match(first)
            last_matches  = _token_match(last)
            distinct_names = first != last  # single-token DMs (rare) — treat as surname-only

            if distinct_names and first_matches and last_matches:
                return max(0, 95 + domain_adj), "DM full match"
            if local in dr_aliases:
                return max(0, 85 + domain_adj), "dr.<lastname>"
            if last_matches:
                return max(0, 75 + domain_adj), "DM surname match"
            if first_matches and distinct_names:
                return max(0, 55 + domain_adj), "DM first-name match"

    if local in OWNERSHIP_LOCAL_PARTS:
        return max(0, 80 + domain_adj), f"{local}@"

    # firstname.lastname or f.lastname
    if re.fullmatch(r"[a-z]+\.[a-z]+", local) or re.fullmatch(r"[a-z]\.[a-z]{2,}", local):
        return max(0, 70 + domain_adj), "personal (first.last)"

    if local in LOW_PRIORITY_LOCAL_PARTS:
        return max(0, 30 + domain_adj), f"{local}@"

    if local in GENERIC_LOCAL_PARTS:
        return max(0, 10 + domain_adj), f"{local}@"

    # Unclassified — single-word local part, possibly a person but ambiguous
    if re.fullmatch(r"[a-z]{3,}", local):
        return max(0, 20 + domain_adj), "unclassified"

    return max(0, 15 + domain_adj), "unclassified"


def rank_emails(
    emails: Iterable[str],
    decision_maker_name: Optional[str] = None,
    site_host: Optional[str] = None,
) -> list[dict]:
    """
    Score + sort candidate emails. Returns:
        [{"email": str, "score": int, "role_hint": str}, ...]
    Higher score first; ties broken alphabetically.
    """
    out: list[dict] = []
    for e in {x.lower() for x in emails}:
        if not _EMAIL_RE.fullmatch(e):
            continue
        if _is_blocklisted(e):
            continue
        score, hint = _score_email(e, decision_maker_name, site_host)
        out.append({"email": e, "score": score, "role_hint": hint})
    out.sort(key=lambda r: (-r["score"], r["email"]))
    return out


# ── Decision-maker extraction ────────────────────────────────────────────────

_NAME = r"[A-Z][a-z'’\-]{1,24}(?:\s+[A-Z]\.?)?\s+[A-Z][a-z'’\-]{1,24}"

# (pattern, default title label, base weight)
# Order is documentation-only — every pattern runs, winner = highest weight × frequency.
_DM_PATTERNS: list[tuple[re.Pattern, str, int]] = [
    (re.compile(rf"(?:Owner|Founder|Founding Partner|Managing Partner|Principal)\s*[:\-—]\s*({_NAME})"), "Owner", 100),
    (re.compile(rf"({_NAME}),?\s+(?:Owner|Founder|Founding Partner|Managing Partner|Principal)\b"), "Owner", 100),
    (re.compile(rf"({_NAME}),?\s+Partner\b"),                            "Partner", 75),
    (re.compile(rf"(?:Meet|About)\s+Dr\.?\s+({_NAME})"),                 "Dr.",     70),
    (re.compile(rf"Dr\.?\s+({_NAME})(?=,?\s+(?:DDS|DMD|MD|MSD))"),       "Dr.",     65),
    (re.compile(rf"Dr\.?\s+({_NAME})"),                                  "Dr.",     55),
    (re.compile(rf"({_NAME}),?\s+(?:DDS|DMD|MD|MSD)\b"),                 "DDS",     58),
    (re.compile(rf"({_NAME}),?\s+Esq(?:uire)?\.?\b"),                    "Esq.",    55),
    (re.compile(rf"({_NAME}),?\s+Attorney(?:\s+at\s+Law)?\b"),           "Attorney", 50),
]

_BUSINESS_NAME_STOPWORDS = {
    "dental", "dentistry", "family", "smile", "smiles", "cosmetic",
    "orthodontics", "pediatric", "general", "oral", "surgery",
    "associates", "group", "clinic", "law", "firm", "injury",
    "attorneys", "attorney", "office", "offices", "center", "centers",
    "personal", "professional", "and", "the", "of", "at",
}


def _title_from_match(match_text: str, fallback: str) -> str:
    m = re.search(
        r"(Managing Partner|Founding Partner|Founder|Owner|Principal|Partner|"
        r"Attorney at Law|Attorney|Esquire|Esq\.?|DDS|DMD|MD|MSD)",
        match_text,
        re.I,
    )
    if m:
        t = m.group(0)
        if t.lower().startswith("esq"):
            return "Esq."
        return t
    return fallback


def _clean_name(raw: str) -> str:
    parts = [p for p in re.split(r"\s+", raw.strip()) if p]
    return " ".join(p.title() if p.isupper() else p for p in parts)


def _is_false_positive_name(name: str) -> bool:
    lower = name.lower()
    for bad in ("new patient", "office hours", "our team", "our office",
                "privacy policy", "family dentistry", "dental associates",
                "law firm", "personal injury", "free consultation",
                "main street", "meet our", "contact us", "meet the"):
        if bad in lower:
            return True
    caps = [t for t in name.split() if t and t[0].isupper()]
    if len(caps) < 2:
        return True
    return False


def _surname_hint(business_name: Optional[str]) -> Optional[str]:
    if not business_name:
        return None
    tokens = [t for t in re.findall(r"[A-Za-z]{3,}", business_name)
              if t.lower() not in _BUSINESS_NAME_STOPWORDS]
    return tokens[-1].lower() if tokens else None


def extract_decision_maker(
    text: str,
    business_name: Optional[str] = None,
) -> tuple[Optional[str], Optional[str]]:
    """Best-effort (name, title) from visible page text. (None, None) if nothing found."""
    if not text:
        return None, None

    candidates: dict[tuple[str, str], int] = {}
    for pattern, label, weight in _DM_PATTERNS:
        for m in pattern.finditer(text):
            name = _clean_name(m.group(1))
            if _is_false_positive_name(name):
                continue
            title = _title_from_match(m.group(0), label)
            key = (name, title)
            candidates[key] = max(candidates.get(key, 0), weight) + 1  # +1 per mention

    if not candidates:
        return None, None

    hint = _surname_hint(business_name)
    if hint:
        candidates = {
            k: (v + 40 if hint in k[0].lower() else v)
            for k, v in candidates.items()
        }

    (name, title), _score = max(candidates.items(), key=lambda kv: kv[1])
    return name, title
