import { ImageResponse } from "next/og";
import { site } from "@/lib/site";
import { ACCENT_DARK, INK_SURFACE, MUTED_DARK, PAPER_DARK } from "@/lib/brand";

export const runtime = "edge";
export const alt = `${site.name}: ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The default share card: what every link to this publication looks like in
 * iMessage, Slack, X, and LinkedIn. Off the site itself, this is the brand asset
 * the most people see, and until August 26, 2026 it was the only one that did
 * not carry the mark.
 *
 * PUT ON THE BRAND, August 26, 2026, in the same pass that fixed email. Three
 * things changed and each was a real inconsistency rather than a preference:
 *
 *   1. THE MARK IS ON IT. The coffee-cup-and-house has been the publication's
 *      mark since August 25 and appears in the header, the tab, and now the
 *      inbox. A share card without it was the one place the brand introduced
 *      itself anonymously.
 *   2. NOTHING IS ROUND. Two 6px dots and a pill sat on a card belonging to a
 *      design system that retunes its entire radius scale to zero because print
 *      has no rounded corners.
 *   3. THE COPY IS DERIVED. The subhead was a hand-typed paraphrase of
 *      `site.description` and had already drifted from it. Every string here now
 *      comes from `site.ts`, so a beat change moves the card with it. That file
 *      has changed the beat four times since August 12.
 *
 * The layout mirrors the site's nameplate on a `.theme-section-contrast` panel:
 * the mark in the accent, the wordmark in paper, a rule, then the beat as an
 * eyebrow. Colours come from the `*_DARK` set in `lib/brand.ts` on purpose,
 * because this is a dark surface and light-mode oxblood dies on near-black
 * (globals.css lifts it to a muted brick for exactly this reason).
 *
 * TYPE IS SANS HERE AND THE REST OF THE BRAND IS SERIF. That is a real gap, not
 * a choice: satori only renders fonts handed to it as buffers, the site's serif
 * is a system stack with no file to hand over, and `next/font/google` breaks the
 * Turbopack build from this file (see src/CLAUDE.md). Closing it means committing
 * a serif TTF and loading it here. Worth doing, not worth blocking on.
 */

// The mark, as a data URI. Satori renders SVG most reliably through <img>, and
// this keeps the geometry in one readable place. Copied from
// src/components/Mark.tsx; if the drawing changes there, change it here and in
// scripts/brand/make-email-mark.mjs.
//
// Drawn in the ACCENT, not in paper. `.wordmark-mark` sets the mark to
// `var(--accent)` on the site, so it is oxblood beside an ink wordmark in light
// mode and the lifted brick beside a near-white one in dark. This card is a dark
// surface, so it takes the dark value and lands on the same relationship the
// header has: coloured mark, neutral wordmark.
const markSrc = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="60" height="60">` +
    `<polygon points="6,14 15.5,5.5 25,14" fill="${ACCENT_DARK}"/>` +
    `<path fill="${ACCENT_DARK}" fill-rule="evenodd" d="M8 14h15v10H8z M13.5 18h4v6h-4z"/>` +
    `<rect x="5" y="25" width="21" height="2" fill="${ACCENT_DARK}"/>` +
    `<path d="M23 16.5C27.5 16.5 27.5 22 23 22" fill="none" stroke="${ACCENT_DARK}" stroke-width="2.8"/>` +
    `</svg>`,
)}`;

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: INK_SURFACE,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "64px 76px",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
        }}
      >
        {/* ── The nameplate: mark, wordmark, rule, beat ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={markSrc} width={52} height={52} alt="" />
          <div
            style={{
              color: PAPER_DARK,
              fontSize: 44,
              fontWeight: 700,
              letterSpacing: "-0.015em",
            }}
          >
            {site.name}
          </div>
        </div>
        <div
          style={{
            height: 3,
            background: ACCENT_DARK,
            marginTop: 20,
            marginBottom: 14,
            display: "flex",
          }}
        />
        <div
          style={{
            color: ACCENT_DARK,
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            display: "flex",
          }}
        >
          {site.tagline}
        </div>

        {/* ── The masthead statement, the display line ── */}
        <div
          style={{
            color: PAPER_DARK,
            fontSize: 68,
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: "-0.028em",
            flex: 1,
            display: "flex",
            alignItems: "center",
            maxWidth: 980,
          }}
        >
          {site.headline}
        </div>

        {/* ── The promise, straight from site.ts ── */}
        <div
          style={{
            color: MUTED_DARK,
            fontSize: 24,
            lineHeight: 1.5,
            maxWidth: 900,
            marginBottom: 44,
            display: "flex",
          }}
        >
          {site.oneLiner}
        </div>

        {/* ── Footer rule: the host, and where this is written from ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.16)",
            paddingTop: 26,
          }}
        >
          {/* Derived from site.url so a domain move cannot leave the card
              advertising the old one, with the www stripped because a bare
              domain reads better on a share card. */}
          <div style={{ color: MUTED_DARK, fontSize: 18, letterSpacing: "0.02em" }}>
            {new URL(site.url).host.replace(/^www\./, "")}
          </div>

          <div
            style={{
              display: "flex",
              border: `1px solid ${ACCENT_DARK}`,
              padding: "8px 16px",
            }}
          >
            <span
              style={{
                color: ACCENT_DARK,
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: "0.13em",
                textTransform: "uppercase",
              }}
            >
              Greenville, SC
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
