/**
 * LETTERS TO THE EDITOR FROM REAL READERS (October 14, 2026).
 *
 * A reader writes at /letters; /api/letters stores the letter in
 * `intelligencer_letters` (service key only) and tells Alex. The press sees
 * unprinted letters through its door and may print one by its id, and the
 * server, not the press, copies the reader's words into the number. So the
 * press can answer a letter but never alter one, and it cannot pass off its own
 * invention as a reader's: only a stored letter can carry `reader: true`.
 *
 * Letters are untrusted text from strangers that a routine reads, so they are
 * kept plain: no links, a hard length cap, control characters stripped.
 */

export const LETTER_MIN = 40;
export const LETTER_MAX = 1500;
export const SIGNED_MAX = 80;
/** How far back the press is shown unprinted letters. */
export const LETTER_WINDOW_DAYS = 21;
/** Reader letters per number, at most. */
export const READER_LETTERS_PER_NUMBER = 2;

const LINK = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|org|net|io|co|ai|xyz|ly|me)\b)/i;
// Keeps newlines and tabs; drops every other control and zero-width character.
const CONTROL_RANGES = [[0x0, 0x8], [0xb, 0xc], [0xe, 0x1f], [0x7f, 0x7f], [0x200b, 0x200f], [0x2028, 0x202e], [0x2060, 0x2064], [0xfeff, 0xfeff]];
const CONTROL = new RegExp(`[${CONTROL_RANGES.map(([a, b]) => `${String.fromCharCode(a)}-${String.fromCharCode(b)}`).join("")}]`, "g");

export function cleanLetterText(raw: unknown, max: number): string | null {
  if (typeof raw !== "string") return null;
  const s = raw.replace(CONTROL, "").replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  return s.length > max ? null : s;
}

export function hasLink(s: string): boolean {
  return LINK.test(s);
}

/**
 * A stored letter as the page prints it: paragraphs split on blank lines, and
 * the paper's no-dash rule applied (a reader may type dashes; the page may not
 * print them, so they become commas).
 */
export function letterParagraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*[–—]\s*/g, ", ").replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
}

export function undash(s: string): string {
  return s.replace(/\s*[–—]\s*/g, ", ").trim();
}
