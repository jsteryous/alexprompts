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
  /**
   * A letter from a real reader (src/lib/letters.ts). Set only by the press door
   * when it copies a stored letter, never by the press itself; the page marks it.
   */
  reader?: boolean;
  /** An illustration. Printed only when its URL is on an allowed host. */
  image?: PaperImage;
  /** A news film of the actual event, embedded from YouTube. Takes the place of `image`. */
  video?: PaperVideo;
}

/**
 * A news film (October 15, 2026). Openly licensed photographs of this week's
 * events almost never exist, and copying a news photograph invites a bill from
 * the agency, but the local station's own report is usually on YouTube, and
 * YouTube lets anyone embed it. The press door confirms the film exists and
 * may be embedded through YouTube's oEmbed, and writes the channel's name into
 * `credit` itself, so the press cannot misattribute it.
 */
export interface PaperVideo {
  /** The eleven-character YouTube video id. */
  youtube?: string;
  caption?: string;
  /** The channel, as YouTube reports it. Set by the press door. */
  credit?: string;
  source?: string;
}

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

/** The film's id, caption, credit and still when the id is well formed; otherwise null. */
export function safeVideo(v: PaperVideo | undefined): { id: string; caption: string; credit: string; source: string; still: string } | null {
  if (!v?.youtube || !YOUTUBE_ID.test(v.youtube)) return null;
  return {
    id: v.youtube,
    caption: v.caption ?? "",
    credit: v.credit ?? "YouTube",
    source: `https://www.youtube.com/watch?v=${v.youtube}`,
    still: `https://i.ytimg.com/vi/${v.youtube}/hqdefault.jpg`,
  };
}

/**
 * An illustration for a lead, a dispatch or an oddity (October 14, 2026; oddities
 * October 15).
 *
 * Only openly licensed or public domain pictures are printed, and only from
 * hosts that serve them for reuse: Wikimedia Commons and the Library of
 * Congress. The press routine must confirm on the file page that the picture
 * shows exactly the named subject and that its licence allows reuse, and it
 * writes the author and licence into `credit`. A news agency photograph is
 * never used. The page prints every picture as an engraving would have been,
 * in ink on paper, so a modern photograph sits in the period page.
 */
export interface PaperImage {
  url?: string;
  /** What the picture shows, in the paper's voice, and true. */
  caption?: string;
  /** Author and licence, e.g. "Photograph by Jane Doe, CC BY-SA 4.0, via Wikimedia Commons". */
  credit?: string;
  /** The file page the picture and its licence were checked on. */
  source?: string;
}

const IMAGE_HOSTS = /^(upload\.wikimedia\.org|commons\.wikimedia\.org|tile\.loc\.gov|www\.loc\.gov)$/;

/** The picture's URL when it is https on an allowed host and carries a credit; otherwise null. */
export function safeImage(img: PaperImage | undefined): { url: string; caption: string; credit: string; source: string | null } | null {
  if (!img?.url || !img.credit) return null;
  try {
    const u = new URL(img.url);
    if (u.protocol !== "https:" || !IMAGE_HOSTS.test(u.hostname)) return null;
    return { url: u.toString(), caption: img.caption ?? "", credit: img.credit, source: safeUrl(img.source) };
  } catch {
    return null;
  }
}

export interface PaperAd {
  headline?: string;
  lines?: string[];
}

export interface PaperSource {
  title?: string;
  url?: string;
}

/**
 * The latest session's closes as numbers (October 14, 2026), written by the
 * press beside the prose market column so the Editor's office can chart them
 * without parsing sentences. Optional: No. 1 predates it.
 */
export interface Ticker {
  /** The trading day the closes are from, YYYY-MM-DD. */
  session?: string;
  dow?: number;
  sp500?: number;
  nasdaq?: number;
}

export interface EditionContent {
  lead?: PaperItem;
  dispatches?: PaperItem[];
  /** Short true stories that need no joke. Clipped as `odd-N`. */
  oddities?: PaperItem[];
  markets?: PaperItem;
  editorial?: PaperItem;
  letters?: PaperItem[];
  amusements?: PaperItem[];
  miscellany?: PaperItem[];
  advertisements?: PaperAd[];
  sources?: PaperSource[];
  /** Ready-to-post lines for social media, written by the press. Not printed. */
  social?: string[];
  ticker?: Ticker;
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

/** The newest numbers with their content, for the Editor's office. */
export async function getRecentEditions(limit = 60): Promise<Edition[]> {
  const sb = client();
  if (!sb) return [];
  const { data } = await sb
    .from(TABLE)
    .select("number, slug, headline, summary, content, published_at")
    .eq("status", "published")
    .order("number", { ascending: false })
    .limit(limit);
  return (data as Edition[] | null) ?? [];
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
