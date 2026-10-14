/**
 * THE EDITOR'S OFFICE (October 14, 2026). Everything the objects in /office
 * show, assembled from the printed numbers so the room changes with every
 * edition and nobody has to keep it up by hand.
 *
 * - The cast files (Thaddeus, Mrs. Ashby, Fenwick, the Evening Clarion, the
 *   barometer) are every sentence that names them, newest first, each linked to
 *   its clipping. A newcomer can catch up on the running jokes in two minutes.
 * - The corkboard is the month's most-clipped items, counted from real views of
 *   /clip pages in `page_hits`.
 * - The coffee can and the ticker read `content.ticker`, the closes the press
 *   writes as numbers. No sentence is ever parsed for a figure.
 * - The calendar counts down to the next press run (Tue, Thu, Sat, 5:47 a.m. ET).
 */
import { createClient } from "@supabase/supabase-js";
import { getRecentEditions, type Edition, type PaperItem, type Ticker } from "@/lib/editions";
import { clipPath, clipsOf, findClip } from "@/lib/clips";

export interface Snippet {
  text: string;
  href: string;
  number: number;
}

export type CastKey = "thaddeus" | "mrsAshby" | "fenwick" | "clarion" | "barometer";

const CAST: Record<CastKey, RegExp> = {
  thaddeus: /\bThaddeus\b/,
  mrsAshby: /\bMrs\.? Ashby\b/,
  fenwick: /\bFenwick\b/,
  clarion: /\bClarion\b/,
  barometer: /\bbarometer\b/i,
};

/** Words that end in a full stop without ending a sentence. */
const ABBREVIATION = /(?:^|[\s(“"])(Mr|Mrs|Ms|Dr|St|Mt|Jr|Sr|No|Co|Inc|Gov|Sen|Rep|Gen|Lt|Capt|Prof|Rev|U\.S|[A-Z])$/;

/** Sentence spans in a paragraph, so a snippet can link to its exact words. */
function sentences(p: string): { start: number; end: number }[] {
  const out: { start: number; end: number }[] = [];
  let start = 0;
  for (let i = 0; i < p.length; i++) {
    if (!".!?".includes(p[i])) continue;
    if (p[i] === "." && ABBREVIATION.test(p.slice(Math.max(0, i - 6), i))) continue;
    let end = i + 1;
    while (end < p.length && /["”’)\].!?]/.test(p[end])) end++;
    if (end < p.length && !/\s/.test(p[end])) continue;
    out.push({ start, end });
    start = end;
    while (start < p.length && /\s/.test(p[start])) start++;
    i = start - 1;
  }
  if (start < p.length && p.slice(start).trim()) out.push({ start, end: p.length });
  return out;
}

function castFiles(editions: Edition[], perPerson = 10): Record<CastKey, Snippet[]> {
  const files = Object.fromEntries(Object.keys(CAST).map((k) => [k, [] as Snippet[]])) as Record<CastKey, Snippet[]>;
  for (const edition of editions) {
    for (const clip of clipsOf(edition)) {
      clip.paragraphs.forEach((para, p) => {
        for (const { start, end } of sentences(para)) {
          const text = para.slice(start, end).trim();
          if (text.length < 12 || end - start > 420) continue;
          for (const key of Object.keys(CAST) as CastKey[]) {
            if (files[key].length >= perPerson || !CAST[key].test(text)) continue;
            files[key].push({ text, number: edition.number, href: clipPath(edition.slug, clip.id, { p, start, end }) });
          }
        }
      });
    }
  }
  return files;
}

export interface Clipped {
  href: string;
  title: string;
  department: string;
  number: number;
  views: number;
}

/** The month's most-viewed clip pages. Server only: page_hits is service-key. */
async function mostClipped(editions: Edition[], limit = 6): Promise<Clipped[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return [];
  const since = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const { data } = await createClient(url, key)
    .from("page_hits")
    .select("path, views")
    .like("path", "/clip/%")
    .gte("day", since);
  const totals = new Map<string, number>();
  for (const row of (data as { path: string; views: number }[] | null) ?? []) {
    totals.set(row.path, (totals.get(row.path) ?? 0) + (row.views ?? 0));
  }
  const bySlug = new Map(editions.map((e) => [e.slug, e]));
  const out: Clipped[] = [];
  for (const [path, views] of [...totals].sort((a, b) => b[1] - a[1])) {
    const [, , slug, id] = path.split("/");
    const edition = bySlug.get(slug);
    const clip = edition ? findClip(edition, id) : null;
    if (!edition || !clip) continue;
    out.push({
      href: path,
      title: clip.headline?.replace(/\.$/, "") ?? clip.paragraphs[0].slice(0, 80),
      department: clip.department,
      number: edition.number,
      views,
    });
    if (out.length >= limit) break;
  }
  return out;
}

/** Minutes east of UTC for New York at a given instant. */
function nyOffsetMinutes(at: Date): number {
  const name = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", timeZoneName: "shortOffset" })
    .formatToParts(at)
    .find((p) => p.type === "timeZoneName")?.value;
  const m = name?.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  return m ? (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] ?? 0)) : -300;
}

/** The next press run: Tuesday, Thursday or Saturday at 5:47 a.m. in New York. */
export function nextPressRun(now = new Date()): Date {
  for (let d = 0; d < 9; d++) {
    const probe = new Date(now.getTime() + d * 86400000);
    const ymd = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(probe);
    const [y, m, day] = ymd.split("-").map(Number);
    const weekday = new Date(Date.UTC(y, m - 1, day)).getUTCDay();
    if (![2, 4, 6].includes(weekday)) continue;
    const guess = Date.UTC(y, m - 1, day, 5, 47);
    const at = new Date(guess - nyOffsetMinutes(new Date(guess)) * 60000);
    if (at.getTime() > now.getTime()) return at;
  }
  return new Date(now.getTime() + 2 * 86400000);
}

/** The S&P 500's close on the last trading day of 1997, the year before Fenwick. */
export const SP500_END_1997 = 970.43;

export interface OfficeData {
  latest: { number: number; slug: string; headline: string; summary: string | null } | null;
  editions: { number: number; slug: string; headline: string }[];
  nextRun: string;
  ticker: (Ticker & { number: number }) | null;
  marketsItem: PaperItem | null;
  editorial: { item: PaperItem; href: string } | null;
  weather: { text: string; href: string } | null;
  amusements: { item: PaperItem; href: string }[];
  cast: Record<CastKey, Snippet[]>;
  clipped: Clipped[];
}

function firstWith<T>(editions: Edition[], pick: (e: Edition) => T | null | undefined): [T, Edition] | null {
  for (const e of editions) {
    const v = pick(e);
    if (v) return [v, e];
  }
  return null;
}

export async function getOfficeData(): Promise<OfficeData> {
  const editions = await getRecentEditions(60);
  const latest = editions[0] ?? null;

  const tick = firstWith(editions, (e) => (e.content?.ticker?.sp500 ? e.content.ticker : null));
  const weather = firstWith(editions, (e) => {
    const i = (e.content?.miscellany ?? []).findIndex((m) => /weather/i.test(m.headline ?? "") && m.paragraphs?.length);
    return i >= 0 ? { text: e.content.miscellany![i].paragraphs![0], href: clipPath(e.slug, `around-${i + 1}`) } : null;
  });

  return {
    latest: latest && { number: latest.number, slug: latest.slug, headline: latest.headline, summary: latest.summary },
    editions: editions.map((e) => ({ number: e.number, slug: e.slug, headline: e.headline })),
    nextRun: nextPressRun().toISOString(),
    ticker: tick ? { ...tick[0], number: tick[1].number } : null,
    marketsItem: latest?.content?.markets ?? null,
    editorial: latest?.content?.editorial ? { item: latest.content.editorial, href: clipPath(latest.slug, "editorial") } : null,
    weather: weather ? weather[0] : null,
    amusements: (latest?.content?.amusements ?? []).map((item, i) => ({ item, href: clipPath(latest!.slug, `amusement-${i + 1}`) })),
    cast: castFiles(editions),
    clipped: await mostClipped(editions),
  };
}
