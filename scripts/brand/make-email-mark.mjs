/**
 * Renders the Rebrew mark to a PNG for EMAIL.
 *
 * Why a PNG exists at all: `src/components/Mark.tsx` draws the mark as inline
 * SVG in `currentColor`, which is right on the site and useless in an inbox.
 * Gmail strips inline SVG entirely and Outlook renders it as nothing, so the
 * one format that lands everywhere is a raster image at an absolute URL.
 *
 * Why OXBLOOD: because that is what the mark IS. `.wordmark-mark` in globals.css
 * sets it to `var(--accent)`, so the site header draws it in oxblood beside an
 * ink wordmark, and the favicon plate is the same colour. This is parity with
 * the header, not a variation on it.
 *
 * The one thing this cannot inherit is the token's dark-mode lift (`--accent`
 * becomes #d97066 on near-black, because oxblood dies there). Email has no
 * reliable theme signal, so it is hardcoded to the light value the way
 * `src/app/icon.svg` is, for the same reason: neither surface has a theme to
 * read.
 *
 * The masthead must still read with images OFF, which is the default in
 * Outlook and for any sender a reader has not whitelisted. That is why the
 * email template pairs this with a real type wordmark rather than shipping a
 * logo lockup as one image. If this PNG never loads, the masthead still says
 * Rebrew.
 *
 * Rendered at 3x (120px for a 40px slot) for retina, transparent background so
 * it sits on the card without a plate of its own.
 *
 * Run: node scripts/brand/make-email-mark.mjs
 * The path geometry is copied from src/components/Mark.tsx. If the mark
 * changes there, re-run this.
 */
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const ACCENT = "#9a2323";
const SIZE = 120;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${SIZE}" height="${SIZE}">
  <polygon points="6,14 15.5,5.5 25,14" fill="${ACCENT}"/>
  <path fill="${ACCENT}" fill-rule="evenodd" d="M8 14h15v10H8z M13.5 18h4v6h-4z"/>
  <rect x="5" y="25" width="21" height="2" fill="${ACCENT}"/>
  <path d="M23 16.5C27.5 16.5 27.5 22 23 22" fill="none" stroke="${ACCENT}" stroke-width="2.8"/>
</svg>`;

const out = "public/email/mark.png";
const buf = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
writeFileSync(out, buf);
console.log(`wrote ${out} (${SIZE}x${SIZE}, ${buf.length} bytes)`);
