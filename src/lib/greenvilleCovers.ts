/**
 * Curated Greenville cover library.
 *
 * The Greenville /real-estate pieces are, in effect, marketing Greenville to
 * people deciding whether to move here. A geocoded Street View of a street
 * corner or a red-pin static map is the worst-looking thing we could lead with.
 * So instead of rendering the exact pinned address, we keep a small, hand-picked
 * set of genuinely attractive, freely-licensed Greenville photos and pick the one
 * that best fits the article's subject.
 *
 * The data lives in greenvilleCovers.json (subject -> list of photos), edited by
 * hand and grown autonomously by scripts/greenville/cover_ingest.py (a
 * vision-gated Wikimedia Commons ingester that opens a PR). Keeping the data in
 * JSON is what lets that pipeline append photos without touching this logic.
 * Each image is committed under /public/greenville/library and served by Vercel,
 * so there is no runtime API, no key, no cost, and no external dependency. The
 * finalize cron (src/lib/greenvilleImage.ts -> renderCover) consults this library
 * FIRST and only falls back to Google Street View / a map when an address matches
 * nothing here (which, for a Greenville piece, effectively never happens because
 * of the city-level default below).
 *
 * When a subject has more than one photo, we pick one deterministically from a
 * per-post seed (its slug), so a given post always shows the same cover but
 * different posts on the same subject rotate through the set instead of all
 * sharing one hero.
 *
 * Licensing: images are Creative Commons or CC0 from Wikimedia Commons. CC-BY /
 * CC-BY-SA images carry a short `credit` line that ArticleView renders under the
 * hero; CC0 images have `credit: null` and need none. Full attribution with
 * source + license links lives in /public/greenville/library/CREDITS.md.
 */
import { SITE_URL } from "@/lib/site";
import coversData from "@/lib/greenvilleCovers.json";

/** A curated cover: the committed file, its alt text, the on-page credit line
 *  (null for CC0), and the Commons source page it came from. */
export interface CoverEntry {
  file: string;
  alt: string;
  credit: string | null;
  source?: string;
}

/** Subject key -> the photos available for it. Loaded from greenvilleCovers.json.
 *  `downtown-falls` is the city-level default any unmatched Greenville piece
 *  falls back to. */
export const GREENVILLE_COVERS: Record<string, CoverEntry[]> = coversData.subjects;

/** The subject any Greenville piece falls back to when nothing more specific
 *  matches. A wide, sunny downtown-along-the-river shot fits cost-of-living, tax,
 *  first-time-buyer, buy-timing, and generic relocation pieces alike. */
export const DEFAULT_SUBJECT: string = coversData.default;

/**
 * Keyword phrases -> subject, scanned in order (most specific first). Lets the
 * resolver map both a bare subject key ("liberty-bridge") AND a human location
 * string ("Falls Park on the Reedy, Greenville, SC") to the right cover, so older
 * posts whose image_address is a place string still get a curated photo.
 */
const KEYWORDS: [string, string][] = [
  ["liberty bridge", "liberty-bridge"],
  ["falls park", "liberty-bridge"],
  ["reedy", "reedy-river"],
  ["north main", "north-main"],
  ["main street", "north-main"],
  ["west end", "west-end"],
  ["swamp rabbit", "swamp-rabbit-trail"],
  ["greenway", "swamp-rabbit-trail"],
  ["trail", "swamp-rabbit-trail"],
  ["travelers rest", "travelers-rest"],
  ["traveler's rest", "travelers-rest"],
  ["downtown", "downtown-falls"],
];

/** Upstate place names that mark a string as "a Greenville-area piece" and so
 *  earn the city-level default even when no specific landmark is named. */
const GREENVILLE_HINTS = [
  "greenville",
  "upstate",
  "travelers rest",
  "greer",
  "simpsonville",
  "mauldin",
  "fountain inn",
  "five forks",
  "taylors",
  "easley",
];

/** The public, absolute URL for a library file. Absolute so it works as an Open
 *  Graph / Twitter card image, not only as an on-page <img>. */
function coverUrl(file: string): string {
  return `${SITE_URL}/greenville/library/${file}`;
}

/** Small stable hash of a seed string, for choosing one photo from a subject's
 *  set. Same seed always yields the same index; different seeds spread out. */
function seedIndex(seed: string, len: number): number {
  if (len <= 1) return 0;
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % len;
}

export interface ResolvedCover {
  url: string;
  alt: string;
  credit: string | null;
  subject: string;
}

/**
 * Resolve an `image_address` (a subject key OR a location string) to a curated
 * cover, or null when it is not a Greenville-area address (so the caller can fall
 * back to Google). Match order: exact subject key -> keyword scan -> Greenville
 * default. Because any string naming Greenville or an Upstate town hits the
 * default, the Google fallback effectively only fires for a genuinely off-map pin.
 *
 * `seed` (typically the post slug) picks which photo when a subject has several,
 * so a post's cover is stable but different posts rotate through the set.
 */
export function resolveLibraryCover(
  address: string | null | undefined,
  seed?: string,
): ResolvedCover | null {
  if (!address) return null;
  const norm = address.trim().toLowerCase();

  const pick = (subject: string): ResolvedCover => {
    const entries = GREENVILLE_COVERS[subject] ?? GREENVILLE_COVERS[DEFAULT_SUBJECT];
    const entry = entries[seedIndex(seed ?? subject, entries.length)];
    return { url: coverUrl(entry.file), alt: entry.alt, credit: entry.credit, subject };
  };

  // 1. Exact subject key (the writer's preferred output), tolerant of spaces.
  const asKey = norm.replace(/\s+/g, "-");
  if (GREENVILLE_COVERS[asKey]) return pick(asKey);

  // 2. Keyword scan of a location string.
  for (const [phrase, subject] of KEYWORDS) {
    if (norm.includes(phrase)) return pick(subject);
  }

  // 3. Any Greenville-area string gets the city-level default.
  if (GREENVILLE_HINTS.some((h) => norm.includes(h))) return pick(DEFAULT_SUBJECT);

  // Not a Greenville-area address: let the caller try Google.
  return null;
}
