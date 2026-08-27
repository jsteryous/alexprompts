/**
 * RAW BRAND TOKENS, for the surfaces Tailwind cannot reach.
 *
 * Three of them exist, and all three are places a reader meets the brand:
 *
 *   - email (`emailTemplates.ts`, `emailMarkdown.ts`), where clients strip
 *     <style>, classes, and external CSS, so every value has to be inlined
 *   - the share card (`app/opengraph-image.tsx`), rendered by satori at the
 *     edge with no stylesheet
 *   - the standalone result pages (`htmlPage.ts`, `/api/publish`), which are
 *     served without the app shell
 *
 * WHY THIS FILE EXISTS. Each of those surfaces used to hardcode its own hexes,
 * and they drifted apart exactly the way you would predict. The August 2026
 * newspaper pass moved the site to oxblood, serif, and square corners, and
 * called the old indigo `#4f46e5` "the single most 'tech startup' element in
 * the palette" on its way out. Email never got the memo: as of August 26, 2026
 * every broadcast, every confirmation, and every unsubscribe page was still
 * shipping indigo links, 16px rounded cards, and a sans-serif reading surface,
 * so the newsletter looked like a different company from the site it linked to.
 * That is not a styling nit. The inbox is where most subscribers meet this
 * publication most often.
 *
 * THESE VALUES MIRROR `globals.css` AND MUST BE CHANGED WITH IT. If the palette
 * moves there, move it here in the same commit.
 *
 * The light set is the default and covers email and the result pages, because
 * neither has a reliable theme signal to read: an email client's dark mode is
 * not something the message is told about, print has one ink, and a masthead
 * does not change colour by context. The `*_DARK` set at the bottom exists for
 * the ONE deliberately dark surface, the share card, which is the same
 * relationship `.theme-section-contrast` has on the site. Do not reach for the
 * dark set to "support dark mode" in email; that is not what it is for.
 */

/** Ink. `--foreground`. */
export const INK = "#16161a";
/** Softer ink for standfirsts and secondary lines. `--foreground-soft`. */
export const INK_SOFT = "#3d3d44";
/** Muted ink for furniture: captions, footers, timestamps. `--foreground-muted`. */
export const INK_MUTED = "#6b6b73";
/** Editorial oxblood, the brand's one colour. `--accent`. */
export const ACCENT = "#9a2323";
/** Oxblood, pressed. `--accent-strong`. */
export const ACCENT_STRONG = "#7f1d1d";
/** Paper. `--background`. Not grey: a page should read as stock. */
export const PAPER = "#fafaf9";
/** The card itself. `--surface`. */
export const SURFACE = "#ffffff";
/** Hairline rules, which are what separates content here. Opaque equivalent of
 *  `--border` (rgba(0,0,0,0.14) over paper), because email clients and satori
 *  both handle a flat hex more predictably than an alpha channel. */
export const RULE = "#dcdcda";
/** The heavier rule under a masthead. Opaque equivalent of `--border-strong`. */
export const RULE_STRONG = "#b0b0ad";
/** Faint fill, for code and pre blocks. Opaque equivalent of `--surface-muted`. */
export const WASH = "#f1f1ef";
/** Ink block, for the inverted panels. `--surface-inverse`. */
export const INK_SURFACE = "#16161a";

/* ── The dark set, for the share card only ─────────────────────────────────
   These are the `html.dark` values from globals.css. The share card is a dark
   surface by design, so it runs this palette rather than the light one, exactly
   the way `.theme-section-contrast` does on the site.

   ACCENT_DARK is not a tint of ACCENT and cannot be derived from it. Oxblood
   #9a2323 is nearly invisible against near-black, so the dark theme lifts it to
   a muted brick. That is why the two are listed rather than computed.          */

/** `--foreground` on dark. Near-white, no blue cast. */
export const PAPER_DARK = "#f5f5f7";
/** `--foreground-muted` on dark, for the standfirst and the footer rule. */
export const MUTED_DARK = "#86868b";
/** `--accent` on dark: oxblood lifted to a legible brick. */
export const ACCENT_DARK = "#d97066";

/**
 * THE EDITORIAL SPLIT, carried into email and the share card.
 *
 * Serif is the reading surface: headlines and article body. Sans is CHROME
 * only: eyebrows, labels, buttons, footers, table headers. This is the single
 * biggest reason the site reads as a publication rather than an app, and it is
 * the thing email was missing most, because a broadcast IS the article.
 *
 * Both are system stacks, which matters more here than on the site. There is no
 * webfont story in email at all (Gmail drops @font-face), and satori will only
 * use fonts handed to it as buffers. A stack costs nothing and degrades in the
 * right order: Charter and Iowan on Apple, Sitka and Cambria on Windows,
 * Georgia everywhere else. Every reader gets a real book serif.
 *
 * THE QUOTES INSIDE THESE ARE SINGLE, AND THAT IS LOAD-BEARING. Both constants
 * are interpolated into `style="..."` attributes, which are delimited by double
 * quotes. A double-quoted family name inside one closes the attribute early, so
 * `font-family:-apple-system, BlinkMacSystemFont, "Segoe UI"` silently truncates
 * to `-apple-system, BlinkMacSystemFont, ` and the browser throws away the whole
 * declaration. The symptom is not a missing font, it is EVERY font in the
 * message falling back to the client default, which for most mail clients is
 * Times. This was caught in a real render, not by reading the code, and it is
 * invisible in a diff. CSS treats both quote styles identically, so single
 * quotes cost nothing. Do not "tidy" these to double quotes.
 */
export const SERIF =
  `Charter, 'Bitstream Charter', 'Iowan Old Style', 'Sitka Text', Cambria, Georgia, 'Times New Roman', serif`;
export const SANS =
  `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`;

/**
 * The wordmark eyebrow: uppercase, tracked out, oxblood. Same treatment as
 * `.theme-label` + `.type-eyebrow` on the site, written out longhand.
 */
export const EYEBROW_STYLE =
  `font-family:${SANS};font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${ACCENT};`;

/**
 * SQUARE CORNERS. The site retunes Tailwind's entire radius scale to 0 (see the
 * `--radius-*` block in globals.css) because print has no rounded corners. These
 * surfaces have no scale to retune, so the rule is written down instead: do not
 * add a `border-radius` to an email card, button, image, or share card. The one
 * sanctioned exception on the site is `rounded-full` on genuinely round controls,
 * and none of those exist here.
 */
export const RADIUS = "0";
