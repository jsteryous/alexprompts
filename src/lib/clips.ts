/**
 * CLIP AND SHARE (October 14, 2026). Every item in a number of the Intelligencer
 * can be clipped out and shared on its own: a letter, an advertisement, a
 * dispatch, or one or two sentences a reader highlighted.
 *
 * A clip is an ADDRESS, never a copy. `/clip/<date>/<item>` names an item in a
 * printed number, and a highlighted line adds `?l=<paragraph>.<start>.<end>`,
 * character offsets into that paragraph. The page and the share image both
 * rebuild the text from the database, so nobody can make a clipping that puts
 * words in the paper's mouth: an address that does not point at real text in a
 * real number renders nothing.
 *
 * Item ids are positional (`letter-2` is the second letter) and stable because
 * a printed number is never edited.
 */
import type { Edition, PaperItem } from "@/lib/editions";

/** Department names as printed. EditionView reads these too, so they cannot drift. */
export const DEPARTMENTS = {
  lead: "Page One",
  dispatch: "By Wire",
  odd: "Strange but True",
  market: "Wall Street",
  editorial: "The Editor's Desk",
  letter: "Letters to the Editor",
  amusement: "Stage, Screen and Radio",
  around: "Around Town",
  ad: "Advertisement",
} as const;

export type ClipKind = keyof typeof DEPARTMENTS;

export interface Clip {
  id: string;
  kind: ClipKind;
  department: string;
  headline?: string;
  dateline?: string;
  /** Paragraphs for an item, the lines for an advertisement. */
  paragraphs: string[];
  signed?: string;
}

/** The id an item is clipped by, e.g. clipId("letter", 0) is "letter-1". */
export function clipId(kind: ClipKind, index?: number): string {
  return index === undefined ? kind : `${kind}-${index + 1}`;
}

function fromItem(kind: ClipKind, item: PaperItem | undefined, index?: number): Clip | null {
  const paragraphs = (item?.paragraphs ?? []).filter((p) => typeof p === "string" && p.trim());
  if (!item || paragraphs.length === 0) return null;
  return {
    id: clipId(kind, index),
    kind,
    department: DEPARTMENTS[kind],
    headline: item.headline,
    dateline: item.dateline,
    paragraphs,
    signed: item.signed,
  };
}

/** Every clippable item in a number, in page order. */
export function clipsOf(edition: Edition): Clip[] {
  const c = edition.content ?? {};
  const out: (Clip | null)[] = [
    fromItem("lead", c.lead),
    ...(c.dispatches ?? []).map((d, i) => fromItem("dispatch", d, i)),
    ...(c.oddities ?? []).map((o, i) => fromItem("odd", o, i)),
    fromItem("market", c.markets),
    fromItem("editorial", c.editorial),
    ...(c.letters ?? []).map((l, i) => fromItem("letter", l, i)),
    ...(c.amusements ?? []).map((a, i) => fromItem("amusement", a, i)),
    ...(c.miscellany ?? []).map((m, i) => fromItem("around", m, i)),
    ...(c.advertisements ?? []).map((ad, i) => {
      const lines = (ad.lines ?? []).filter((l) => typeof l === "string" && l.trim());
      if (!ad.headline && lines.length === 0) return null;
      return { id: clipId("ad", i), kind: "ad" as const, department: DEPARTMENTS.ad, headline: ad.headline, paragraphs: lines };
    }),
  ];
  return out.filter((x): x is Clip => x !== null);
}

const ID = /^(lead|market|editorial|(dispatch|odd|letter|amusement|around|ad)-\d{1,2})$/;

export function findClip(edition: Edition, id: string): Clip | null {
  if (!ID.test(id)) return null;
  return clipsOf(edition).find((c) => c.id === id) ?? null;
}

/** A highlighted line: which paragraph, which characters, and the text itself. */
export interface Excerpt {
  p: number;
  start: number;
  end: number;
  text: string;
}

const MAX_EXCERPT = 420;

/**
 * Reads `?l=<paragraph>.<start>.<end>` against the clip's own text. The range is
 * widened to whole words and trimmed, so a sloppy drag still clips cleanly.
 * Anything that does not resolve to real text returns null and the whole item
 * is shown instead.
 */
export function parseExcerpt(clip: Clip, l: string | undefined | null): Excerpt | null {
  const m = typeof l === "string" ? l.match(/^(\d{1,2})\.(\d{1,5})\.(\d{1,5})$/) : null;
  if (!m) return null;
  const p = Number(m[1]);
  const para = clip.paragraphs[p];
  if (!para) return null;
  let start = Math.max(0, Number(m[2]));
  let end = Math.min(para.length, Number(m[3]));
  if (end <= start) return null;
  while (start > 0 && /\S/.test(para[start - 1])) start--;
  while (end < para.length && /\S/.test(para[end])) end++;
  while (start < end && /\s/.test(para[start])) start++;
  while (end > start && /\s/.test(para[end - 1])) end--;
  if (end - start < 3 || end - start > MAX_EXCERPT) return null;
  return { p, start, end, text: para.slice(start, end) };
}

/** `?l=` value for an excerpt, or "" for the whole item. */
export function excerptParam(e: { p: number; start: number; end: number } | null): string {
  return e ? `${e.p}.${e.start}.${e.end}` : "";
}

export function clipPath(slug: string, id: string, e?: { p: number; start: number; end: number } | null): string {
  const l = excerptParam(e ?? null);
  return `/clip/${slug}/${id}${l ? `?l=${l}` : ""}`;
}

export function clipImagePath(slug: string, id: string, e?: { p: number; start: number; end: number } | null): string {
  const l = excerptParam(e ?? null);
  return `/api/clip-image?slug=${slug}&item=${id}${l ? `&l=${l}` : ""}`;
}

/**
 * The ragged edge of a clipping, as points on a w x h box: the top and bottom
 * are torn in small uneven teeth, the sides waver. Seeded by the clip's address,
 * so the same clipping always tears the same way.
 */
export function tornEdge(seed: string, w: number, h: number): [number, number][] {
  let s = 2166136261;
  for (let i = 0; i < seed.length; i++) s = Math.imul(s ^ seed.charCodeAt(i), 16777619);
  const rand = () => {
    s = Math.imul(s ^ (s >>> 15), 2246822507);
    s = Math.imul(s ^ (s >>> 13), 3266489909);
    return ((s ^= s >>> 16) >>> 0) / 4294967296;
  };
  const tooth = h * 0.028;
  const sway = w * 0.004;
  const pts: [number, number][] = [];
  const steps = 46;
  for (let i = 0; i <= steps; i++) pts.push([(w * i) / steps, tooth * (0.2 + rand())]);
  for (let i = 1; i < 8; i++) pts.push([w - sway * rand(), (h * i) / 8]);
  for (let i = steps; i >= 0; i--) pts.push([(w * i) / steps, h - tooth * (0.2 + rand())]);
  for (let i = 7; i > 0; i--) pts.push([sway * rand(), (h * i) / 8]);
  return pts;
}
