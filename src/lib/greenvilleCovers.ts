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
 * Each image is committed under /public/greenville/library and served by Vercel,
 * so there is no runtime API, no key, no cost, and no external dependency. The
 * finalize cron (src/lib/greenvilleImage.ts -> renderCover) consults this library
 * FIRST and only falls back to Google Street View / a map when an address matches
 * nothing here (which, for a Greenville piece, effectively never happens because
 * of the city-level default below).
 *
 * Licensing: images are Creative Commons or CC0 from Wikimedia Commons. CC-BY /
 * CC-BY-SA images carry a short `credit` line that ArticleView renders under the
 * hero; CC0 images need none. Full attribution with source + license links lives
 * in /public/greenville/library/CREDITS.md. When adding an image, add its full
 * record there too.
 */
import { SITE_URL } from "@/lib/site";

/** A curated cover: the committed file, its alt text, and the on-page credit line
 *  (null for CC0, which needs no visible attribution). */
export interface CoverEntry {
  file: string;
  alt: string;
  credit: string | null;
}

/** Subject key -> curated cover. Keys are the vocabulary the evergreen writer
 *  picks from (see scripts/greenville/routine/pass_evergreen.md). `downtown-falls`
 *  is the city-level default any unmatched Greenville piece falls back to. */
export const GREENVILLE_COVERS: Record<string, CoverEntry> = {
  "downtown-falls": {
    file: "downtown-falls.jpg",
    alt: "Downtown Greenville, South Carolina, along the Reedy River walkway at RiverPlace.",
    credit: "Photo: Tim (Atlanta), CC BY 2.0, via Wikimedia Commons",
  },
  "liberty-bridge": {
    file: "liberty-bridge.jpg",
    alt: "The Liberty Bridge over the Reedy River at Falls Park in downtown Greenville, South Carolina.",
    credit: "Photo: Antony-22, CC BY-SA 4.0, via Wikimedia Commons",
  },
  "reedy-river": {
    file: "reedy-river.jpg",
    alt: "The Reedy River falls and the Liberty Bridge at Falls Park, Greenville, South Carolina.",
    credit: "Photo: Nicolas Henderson, CC BY 2.0, via Wikimedia Commons",
  },
  "north-main": {
    file: "north-main.jpg",
    alt: "A tree-lined Main Street storefront block in downtown Greenville, South Carolina.",
    credit: "Photo: P. Hughes, CC BY 4.0, via Wikimedia Commons",
  },
  "west-end": {
    file: "west-end.jpg",
    alt: "The West End of downtown Greenville, South Carolina, with office towers above the Reedy River.",
    credit: "Photo: Spatms, CC BY-SA 4.0, via Wikimedia Commons",
  },
  "swamp-rabbit-trail": {
    file: "swamp-rabbit-trail.jpg",
    alt: "The Prisma Health Swamp Rabbit Trail greenway through the trees in Greenville, South Carolina.",
    credit: null, // CC0
  },
  "travelers-rest": {
    file: "travelers-rest.jpg",
    alt: "The Main Street of Travelers Rest, South Carolina, a Swamp Rabbit Trail town north of Greenville.",
    credit: null, // CC0
  },
};

/** The subject any Greenville piece falls back to when nothing more specific
 *  matches. A wide, sunny downtown-along-the-river shot fits cost-of-living, tax,
 *  first-time-buyer, buy-timing, and generic relocation pieces alike. */
export const DEFAULT_SUBJECT = "downtown-falls";

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
 */
export function resolveLibraryCover(address: string | null | undefined): ResolvedCover | null {
  if (!address) return null;
  const norm = address.trim().toLowerCase();

  const pick = (subject: string): ResolvedCover => {
    const entry = GREENVILLE_COVERS[subject] ?? GREENVILLE_COVERS[DEFAULT_SUBJECT];
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
