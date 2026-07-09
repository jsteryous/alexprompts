/**
 * Pure logic for the /tools/wire-safety check: domain parsing, DNS reads over
 * Cloudflare's public DNS-over-HTTPS JSON API, RDAP registration lookup, and
 * lookalike-domain generation. Kept free of React/JSX so it runs in the
 * browser (from components/tools/WireSafety.tsx) and directly under Node for
 * testing. Everything here is client-side and free: both endpoints send
 * Access-Control-Allow-Origin: *, need no key, and cost nothing.
 *
 * Honesty contract: every lookup degrades to an explicit "could not check"
 * value (null) rather than guessing. A wrong answer in a wire-fraud tool is
 * worse than no answer, so callers must render null as unknown, never as good
 * or bad.
 */

const DOH = "https://cloudflare-dns.com/dns-query";

/** Free personal mail providers. Their checks all pass, which would read as
 * reassuring, so the UI shows an explicit warning card instead. */
export const FREE_MAIL = new Set([
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "aol.com",
  "icloud.com",
  "me.com",
  "msn.com",
  "live.com",
  "proton.me",
  "protonmail.com",
  "mail.com",
  "gmx.com",
]);

/** Common two-part public suffixes, enough for the registrable-domain guess. */
const TWO_PART_TLDS = new Set([
  "co.uk",
  "org.uk",
  "com.au",
  "net.au",
  "co.nz",
  "co.jp",
  "com.br",
  "com.mx",
  "co.in",
  "com.co",
]);

export type DohAnswer = { name: string; type: number; TTL: number; data: string };
export type DohResult = { ok: true; status: number; answers: DohAnswer[] } | { ok: false };

async function doh(name: string, type: "A" | "MX" | "TXT"): Promise<DohResult> {
  try {
    const res = await fetch(`${DOH}?name=${encodeURIComponent(name)}&type=${type}`, {
      headers: { accept: "application/dns-json" },
    });
    if (!res.ok) return { ok: false };
    const json = await res.json();
    return {
      ok: true,
      status: typeof json.Status === "number" ? json.Status : -1,
      answers: Array.isArray(json.Answer) ? json.Answer : [],
    };
  } catch {
    return { ok: false };
  }
}

/** TXT data arrives quoted and possibly split into chunks; join to one string. */
export function txtValue(data: string): string {
  return data.replace(/^"|"$/g, "").split('" "').join("");
}

/** Accepts an email address, a URL, or a bare domain; returns the hostname. */
export function extractDomain(raw: string): string | null {
  let s = raw.trim().toLowerCase();
  if (!s) return null;
  const at = s.lastIndexOf("@");
  if (at >= 0) s = s.slice(at + 1);
  s = s.replace(/^[a-z]+:\/\//, "").split(/[/?#\s]/)[0].replace(/\.+$/, "");
  try {
    s = new URL(`http://${s}`).hostname;
  } catch {
    return null;
  }
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(s) ? s : null;
}

/** Naive eTLD+1: the domain someone actually registered. */
export function registrableDomain(host: string): string {
  const parts = host.split(".");
  if (parts.length <= 2) return host;
  const lastTwo = parts.slice(-2).join(".");
  if (TWO_PART_TLDS.has(lastTwo)) return parts.slice(-3).join(".");
  return lastTwo;
}

/**
 * The close spellings a scammer would register: look-alike character swaps
 * (rn for m, 0 for o), other endings, a dropped letter, swapped neighbors,
 * a doubled letter. Capped so the check stays fast and polite to the resolver.
 */
export function lookalikeCandidates(reg: string): string[] {
  const dot = reg.indexOf(".");
  const name = reg.slice(0, dot);
  const tld = reg.slice(dot + 1);
  const seen = new Set<string>([reg]);
  const out: string[] = [];
  const push = (d: string) => {
    if (!seen.has(d) && /^[a-z0-9][a-z0-9-]*\.[a-z.]{2,}$/.test(d)) {
      seen.add(d);
      out.push(d);
    }
  };

  const glyphSwaps: Array<[string, string]> = [
    ["rn", "m"],
    ["m", "rn"],
    ["cl", "d"],
    ["d", "cl"],
    ["vv", "w"],
    ["w", "vv"],
    ["o", "0"],
    ["0", "o"],
    ["l", "1"],
    ["1", "l"],
  ];
  for (const [from, to] of glyphSwaps) {
    let i = name.indexOf(from);
    while (i !== -1) {
      push(`${name.slice(0, i)}${to}${name.slice(i + from.length)}.${tld}`);
      i = name.indexOf(from, i + 1);
    }
  }
  for (const t of ["com", "co", "net", "org", "us", "info"]) {
    if (t !== tld) push(`${name}.${t}`);
  }
  if (name.length > 4) {
    for (let i = 0; i < name.length; i++) {
      push(`${name.slice(0, i)}${name.slice(i + 1)}.${tld}`);
    }
  }
  for (let i = 0; i < name.length - 1; i++) {
    if (name[i] === name[i + 1]) continue;
    push(`${name.slice(0, i)}${name[i + 1]}${name[i]}${name.slice(i + 2)}.${tld}`);
  }
  for (let i = 0; i < name.length; i++) {
    push(`${name.slice(0, i + 1)}${name[i]}${name.slice(i + 1)}.${tld}`);
  }
  return out.slice(0, 20);
}

async function fetchRegistration(
  reg: string,
): Promise<{ checked: boolean; date: string | null }> {
  try {
    const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(reg)}`, {
      headers: { accept: "application/rdap+json" },
    });
    if (!res.ok) return { checked: false, date: null };
    const json = await res.json();
    const events: Array<{ eventAction?: string; eventDate?: string }> = Array.isArray(
      json.events,
    )
      ? json.events
      : [];
    const ev = events.find((e) => e.eventAction === "registration");
    return { checked: true, date: ev?.eventDate ?? null };
  } catch {
    return { checked: false, date: null };
  }
}

export interface Report {
  host: string;
  reg: string;
  freeMail: boolean;
  nxdomain: boolean;
  resolves: boolean | null;
  mx: boolean | null;
  spfFound: boolean | null;
  dmarc: { found: boolean; policy: string | null } | null;
  ageChecked: boolean;
  regDate: string | null;
  ageDays: number | null;
  lookalikesChecked: number;
  lookalikeHits: string[];
}

export function parseDmarc(res: DohResult): { found: boolean; policy: string | null } | null {
  if (!res.ok) return null;
  for (const ans of res.answers) {
    if (ans.type !== 16) continue;
    const v = txtValue(ans.data);
    if (/^v=DMARC1\b/i.test(v)) {
      const m = v.match(/(?:^|;)\s*p\s*=\s*([a-z]+)/i);
      return { found: true, policy: m ? m[1].toLowerCase() : null };
    }
  }
  return { found: false, policy: null };
}

export async function runChecks(host: string): Promise<Report> {
  const reg = registrableDomain(host);
  const candidates = lookalikeCandidates(reg);

  const dnsP = Promise.all([
    doh(host, "A"),
    doh(host, "MX"),
    doh(host, "TXT"),
    doh(`_dmarc.${host}`, "TXT"),
    doh(`_dmarc.${reg}`, "TXT"),
  ]);
  const rdapP = fetchRegistration(reg);
  const lookP = Promise.all(candidates.map((d) => doh(d, "A")));
  const [[a, mxRes, txt, dmarcHost, dmarcReg], rdap, looks] = await Promise.all([
    dnsP,
    rdapP,
    lookP,
  ]);

  const resolves = a.ok ? a.answers.length > 0 : null;
  const mx = mxRes.ok ? mxRes.answers.some((x) => x.type === 15) : null;
  const nxdomain = a.ok && mxRes.ok && a.status === 3 && mxRes.status === 3;

  const spfFound = txt.ok
    ? txt.answers.some((x) => x.type === 16 && /^v=spf1(\s|$)/i.test(txtValue(x.data)))
    : null;

  // DMARC discovery starts at the exact domain and falls back to the
  // registrable domain, mirroring how receivers actually look it up.
  const dHost = parseDmarc(dmarcHost);
  const dReg = parseDmarc(dmarcReg);
  const dmarc = dHost?.found ? dHost : dReg?.found ? dReg : dHost ?? dReg;

  const ageDays = rdap.date
    ? Math.max(0, Math.floor((Date.now() - Date.parse(rdap.date)) / 86400000))
    : null;

  const lookalikeHits = candidates.filter((_, i) => {
    const r = looks[i];
    return r.ok && r.answers.length > 0;
  });

  return {
    host,
    reg,
    freeMail: FREE_MAIL.has(reg),
    nxdomain,
    resolves,
    mx,
    spfFound,
    dmarc,
    ageChecked: rdap.checked && rdap.date !== null,
    regDate: rdap.date,
    ageDays,
    lookalikesChecked: candidates.length,
    lookalikeHits,
  };
}
