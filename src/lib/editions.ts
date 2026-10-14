/**
 * THE REBREW INTELLIGENCER (October 14, 2026). Data access for the paper.
 *
 * Every edition is one row in Supabase `intelligencer_editions` (see
 * supabase/schema.sql). `content` is JSON in the shape of `EditionContent`
 * below, written by the cloud routine "Rebrew Intelligencer press" with the
 * Supabase connector. The public reads only `status = 'published'` rows through
 * RLS, so the anon client is enough here. A new row shows up on the site within
 * the page's revalidate window; nothing deploys.
 *
 * The routine writes this JSON by hand, so every reader below is defensive:
 * a missing section renders as nothing rather than crashing the front page.
 */
import { createClient } from "@supabase/supabase-js";

/** One column item: a headline, an optional dateline, and plain paragraphs. */
export interface PaperItem {
  headline?: string;
  /** Extra decks under the headline, smaller each step. */
  decks?: string[];
  dateline?: string;
  paragraphs?: string[];
  /** Letters to the Editor sign off with this. */
  signed?: string;
}

export interface PaperAd {
  headline?: string;
  lines?: string[];
}

export interface PaperSource {
  title?: string;
  url?: string;
}

export interface EditionContent {
  lead?: PaperItem;
  dispatches?: PaperItem[];
  markets?: PaperItem;
  editorial?: PaperItem;
  letters?: PaperItem[];
  amusements?: PaperItem[];
  miscellany?: PaperItem[];
  advertisements?: PaperAd[];
  sources?: PaperSource[];
}

export interface Edition {
  number: number;
  slug: string;
  headline: string;
  summary: string | null;
  content: EditionContent;
  published_at: string;
}

export type EditionListing = Omit<Edition, "content">;

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? createClient(url, key) : null;
}

const TABLE = "intelligencer_editions";

export async function getLatestEdition(): Promise<Edition | null> {
  const sb = client();
  if (!sb) return null;
  const { data } = await sb
    .from(TABLE)
    .select("number, slug, headline, summary, content, published_at")
    .eq("status", "published")
    .order("number", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as Edition | null) ?? null;
}

export async function getEdition(slug: string): Promise<Edition | null> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(slug)) return null;
  const sb = client();
  if (!sb) return null;
  const { data } = await sb
    .from(TABLE)
    .select("number, slug, headline, summary, content, published_at")
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();
  return (data as Edition | null) ?? null;
}

export async function listEditions(): Promise<EditionListing[]> {
  const sb = client();
  if (!sb) return [];
  const { data } = await sb
    .from(TABLE)
    .select("number, slug, headline, summary, published_at")
    .eq("status", "published")
    .order("number", { ascending: false });
  return (data as EditionListing[] | null) ?? [];
}

/** The neighbours of an edition, for the "previous / next number" links. */
export async function neighbours(number: number): Promise<{ prev: EditionListing | null; next: EditionListing | null }> {
  const all = await listEditions();
  return {
    prev: all.find((e) => e.number === number - 1) ?? null,
    next: all.find((e) => e.number === number + 1) ?? null,
  };
}

export function editionHref(e: { slug: string }): string {
  return `/edition/${e.slug}`;
}

/** "WEDNESDAY, OCTOBER 14, 2026", from the slug so time zones cannot shift it. */
export function editionDateLine(slug: string): string {
  const [y, m, d] = slug.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12));
  return date
    .toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })
    .toUpperCase();
}

/** Roman numerals for the volume line. Volume I is the paper's first year. */
export function roman(n: number): string {
  const table: [number, string][] = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
    [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let out = "";
  for (const [v, s] of table) while (n >= v) { out += s; n -= v; }
  return out;
}

/** The paper began October 14, 2026; each year from then is a new volume. */
export function volumeOf(slug: string): number {
  const [y, m, d] = slug.split("-").map(Number);
  const start = Date.UTC(2026, 9, 14);
  const at = Date.UTC(y, m - 1, d);
  return Math.max(1, Math.floor((at - start) / (365.25 * 86400000)) + 1);
}

/** Only http(s) links are printed; anything else in the JSON is dropped. */
export function safeUrl(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}
