/**
 * The period faces of The Rebrew Intelligencer (October 14, 2026), loaded by a
 * plain stylesheet link wherever the paper appears (never next/font/google,
 * which breaks the Turbopack build; see src/CLAUDE.md).
 *
 * The paper is set as a big-city daily of 1945:
 * - UnifrakturMaguntia: the blackletter nameplate, as the great dailies kept.
 * - Oswald: banner and story headlines, the heavy condensed gothic of the wire room.
 * - Libre Bodoni: decks, department heads, letters, captions and advertisements.
 * Body copy stays on the system serif (--font-serif), close to the news faces of
 * the day and free of a font round trip. The CSS reads them as --font-banner
 * and --font-head (globals.css).
 */
export const PAPER_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Libre+Bodoni:ital,wght@0,400;0,700;1,400;1,700&family=Oswald:wght@500;700&family=UnifrakturMaguntia&display=swap";
