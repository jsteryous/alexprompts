/**
 * messageDraft.ts — TypeScript port of scripts/prospects/message_draft.py.
 *
 * Generates a single FB Messenger draft per prospect for the dashboard
 * outreach card. Kept in lockstep with the Python module — the same voice
 * rules apply (villain-led, real-data compliment, no price in first touch,
 * "-Alex" sign-off). When you edit one, edit both. Tests for the canonical
 * version live in scripts/tests/test_prospects.py.
 *
 * The Python version is the source of truth: it powers any future batch
 * generation (digest emails, CSV exports, etc.). This port exists so the
 * Next.js dashboard can pre-fill drafts without spawning a Python subprocess.
 */

const LIGHTHOUSE_LEAD_THRESHOLD = 30;
const COMPLIMENT_MIN_RATING = 4.0;
const COMPLIMENT_MIN_REVIEWS = 10;

const HONORIFICS_AND_CREDENTIALS = new Set([
  "dr", "mr", "mrs", "ms", "miss",
  "esq", "esquire",
  "dds", "dmd", "md", "msd", "phd",
  "jr", "sr", "ii", "iii", "iv",
]);

const RECENCY_ADVERBS = [
  "this morning",
  "earlier today",
  "today",
  "this week",
  "earlier this week",
  "the other day",
] as const;

export interface DraftableProspect {
  place_id?: string | null;
  business_name?: string | null;
  vertical?: string | null;
  decision_maker_name?: string | null;
  google_rating?: number | null;
  google_review_count?: number | null;
  audit_status?: string | null;
  website_url?: string | null;
  lighthouse_mobile_score?: number | null;
  issues?: {
    viewport_missing?: boolean | null;
    no_https?: boolean | null;
    forms_unreachable?: boolean | null;
    forms_unreachable_page?: string | null;
    stale_copyright?: number | null;
    lighthouse_mobile?: number | null;
  } | null;
}

export type IssueKey =
  | "no_website"
  | "forms_unreachable"
  | "no_viewport"
  | "no_https"
  | "lighthouse_low"
  | "stale_copyright"
  | "generic";

// ── Helpers ────────────────────────────────────────────────────────────────

function firstName(name: string | null | undefined): string | null {
  if (!name) return null;
  const tokens = name.match(/[A-Za-z][A-Za-z'’\-]*/g) ?? [];
  for (const tok of tokens) {
    const bare = tok.replace(/[^a-zA-Z]/g, "").toLowerCase();
    if (HONORIFICS_AND_CREDENTIALS.has(bare)) continue;
    if (bare.length < 2) continue;
    if (tok === tok.toUpperCase()) {
      return tok.charAt(0).toUpperCase() + tok.slice(1).toLowerCase();
    }
    return tok;
  }
  return null;
}

function hostname(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url.includes("://") ? url : "https://" + url);
    let host = u.hostname.toLowerCase();
    if (host.startsWith("www.")) host = host.slice(4);
    return host || null;
  } catch {
    return null;
  }
}

/**
 * Stable hash → index. Same prospect gets the same recency phrase across
 * reruns; different prospects get different phrases so the same word doesn't
 * appear in every drafted message.
 *
 * Tiny FNV-1a — collision properties don't matter, we just need spread.
 */
function stableIndex(seed: string, mod: number): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return Math.abs(h) % mod;
}

function recencyPhrase(seed: string): string {
  return RECENCY_ADVERBS[stableIndex(seed, RECENCY_ADVERBS.length)];
}

function formTargetLabel(p: DraftableProspect): string {
  const host = hostname(p.website_url) ?? "your site";
  const pageUrl = p.issues?.forms_unreachable_page;
  if (!pageUrl) return host;
  try {
    const path = new URL(pageUrl).pathname.replace(/\/$/, "");
    return path && path !== "" ? `${host}${path}` : host;
  } catch {
    return host;
  }
}

function complimentLine(p: DraftableProspect): string | null {
  const rating = p.google_rating;
  const reviews = p.google_review_count;
  if (rating == null || reviews == null) return null;
  if (rating < COMPLIMENT_MIN_RATING || reviews < COMPLIMENT_MIN_REVIEWS) return null;
  return `${rating.toFixed(1)} stars across ${reviews} Google reviews. That reputation is earned.`;
}

function greeting(name: string | null): string {
  return name ? `Hello ${name},` : "Hello,";
}

function assemble(g: string, compliment: string | null, body: string[]): string {
  const parts: string[] = [g];
  if (compliment) parts.push(compliment);
  parts.push(...body);
  parts.push("-Alex");
  return parts.join("\n\n");
}

// ── Issue picker ───────────────────────────────────────────────────────────

export function pickTopIssue(p: DraftableProspect): IssueKey {
  if (p.audit_status === "no_website" || !p.website_url) return "no_website";
  const issues = p.issues ?? {};
  if (issues.forms_unreachable) return "forms_unreachable";
  if (issues.viewport_missing) return "no_viewport";
  if (issues.no_https) return "no_https";

  const lh = p.lighthouse_mobile_score ?? issues.lighthouse_mobile ?? null;
  if (lh != null && lh < LIGHTHOUSE_LEAD_THRESHOLD) return "lighthouse_low";

  if (issues.stale_copyright) return "stale_copyright";
  return "generic";
}

// ── Templates ──────────────────────────────────────────────────────────────

type TemplateFn = (
  p: DraftableProspect,
  fn: string | null,
  cmp: string | null
) => string;

const noWebsite: TemplateFn = (p, fn, cmp) => {
  const practice = p.business_name ?? "your practice";
  return assemble(greeting(fn), cmp, [
    "About half of new dental searches start on Google. Patients click " +
      "expecting a website — yours doesn't come up. They bounce to the next " +
      "result and you never hear about it.",
    `Want me to send a one-page mock of what ${practice}'s site could look ` +
      "like? Takes a day. No obligation.",
  ]);
};

const formsUnreachable: TemplateFn = (p, fn, cmp) => {
  const target = formTargetLabel(p);
  const when = recencyPhrase(`${p.place_id ?? ""}:forms`);
  return assemble(greeting(fn), cmp, [
    `Quick thing — I tried the contact form on ${target} ${when}. Submit ` +
      "returns an error. Patients fill it out, hit send, get nothing. Most " +
      "don't try again. They call the next dentist.",
    "Want me to send a free audit writeup of what's leaking? Takes a day. " +
      "No obligation.",
  ]);
};

const noViewport: TemplateFn = (p, fn, cmp) => {
  const host = hostname(p.website_url) ?? "your site";
  const when = recencyPhrase(`${p.place_id ?? ""}:mobile`);
  return assemble(greeting(fn), cmp, [
    `Pulled ${host} up on my phone ${when}. Text is microscopic, buttons ` +
      "cut off — the site isn't built for mobile. About 70% of dental " +
      "searches happen on phones now. Most patients bounce in two seconds.",
    "Want me to send a one-page mock of the mobile redesign? Takes a day. " +
      "No obligation.",
  ]);
};

const noHttps: TemplateFn = (p, fn, cmp) => {
  const host = hostname(p.website_url) ?? "your site";
  return assemble(greeting(fn), cmp, [
    `${host} doesn't have HTTPS. Chrome shows a 'Not Secure' warning to ` +
      "every patient who visits — most click away before they read anything. " +
      "That's first-impression revenue gone before they know who you are.",
    "Want me to send a free audit writeup? Takes a day. No obligation.",
  ]);
};

const lighthouseLow: TemplateFn = (p, fn, cmp) => {
  const host = hostname(p.website_url) ?? "your site";
  const score = p.lighthouse_mobile_score ?? p.issues?.lighthouse_mobile ?? null;
  const clause = score != null ? `came back at ${score}/100` : "came back very low";
  return assemble(greeting(fn), cmp, [
    `Ran a Google PageSpeed check on ${host}. Mobile score ${clause}. ` +
      "Patients bail on a slow load around three seconds — you're losing the " +
      "click before they ever read your name.",
    "Want me to send a free audit writeup? Takes a day. No obligation.",
  ]);
};

const staleCopyright: TemplateFn = (p, fn, cmp) => {
  const host = hostname(p.website_url) ?? "your site";
  const year = p.issues?.stale_copyright;
  const clause = year ? `says ${year}` : "is years out of date";
  return assemble(greeting(fn), cmp, [
    `Quick thing — the copyright on ${host} ${clause}. Most patients won't ` +
      "notice consciously, but it nudges the same instinct as a dusty lobby. " +
      "They wonder if anyone's still home.",
    "Want me to send a free audit writeup of what else might be reading " +
      "stale? Takes a day. No obligation.",
  ]);
};

const genericTemplate: TemplateFn = (p, fn, cmp) => {
  const practice = p.business_name ?? "your practice";
  return assemble(greeting(fn), cmp, [
    `Took a look at ${practice}'s site. A few things on it are quietly ` +
      "leaking inquiries — small mechanical issues most owners never see " +
      "because the site looks fine when they visit it on their own laptop.",
    "Want me to send a free audit writeup? Takes a day. No obligation.",
  ]);
};

const TEMPLATES: Record<IssueKey, TemplateFn> = {
  no_website: noWebsite,
  forms_unreachable: formsUnreachable,
  no_viewport: noViewport,
  no_https: noHttps,
  lighthouse_low: lighthouseLow,
  stale_copyright: staleCopyright,
  generic: genericTemplate,
};

/**
 * Build the FB Messenger draft string for a prospect. See module docstring
 * for voice rules. Returns "" only if the prospect dict is empty/invalid.
 */
export function generateFbMessage(p: DraftableProspect): string {
  if (!p || typeof p !== "object") return "";
  const fn = firstName(p.decision_maker_name);
  const cmp = complimentLine(p);

  // Outbound voice is dental-specific (memory note dated 2026-04-29). Other
  // verticals fall back to the vertical-neutral template.
  if (p.vertical && p.vertical !== "dental") {
    return genericTemplate(p, fn, cmp);
  }
  const key = pickTopIssue(p);
  return (TEMPLATES[key] ?? genericTemplate)(p, fn, cmp);
}

/**
 * URL we send the user to when we don't have a resolved Facebook Page —
 * pre-fills FB's pages search with the business name and city. Requires the
 * user to be logged in (they are; outbound runs from their personal FB).
 */
export function fbSearchUrl(p: { business_name?: string | null; city?: string | null }): string {
  const q = [p.business_name, p.city].filter(Boolean).join(" ");
  return `https://www.facebook.com/search/pages?q=${encodeURIComponent(q)}`;
}
