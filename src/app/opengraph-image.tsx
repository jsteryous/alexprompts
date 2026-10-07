import { ImageResponse } from "next/og";
import { site } from "@/lib/site";
import { ACCENT, INK, INK_MUTED, PAPER } from "@/lib/brand";

export const runtime = "edge";
export const alt = `${site.name}. ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The default share card, reframed October 7, 2026 to match the minimalist
 * site: paper, the name, a short accent rule, the slogan, and the domain. Every
 * string comes from site.ts so the card cannot drift from the masthead.
 *
 * Type is sans because satori only renders fonts handed to it as buffers and the
 * site's serif is a system stack with no file to hand over. Committing a serif
 * TTF and loading it here would close that gap.
 */
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: PAPER,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ color: INK, fontSize: 104, fontWeight: 600, letterSpacing: "-0.02em", display: "flex" }}>
          {site.name}
        </div>
        <div style={{ width: 72, height: 2, background: ACCENT, marginTop: 34, marginBottom: 34, display: "flex" }} />
        <div style={{ color: INK_MUTED, fontSize: 40, fontStyle: "italic", display: "flex" }}>
          {site.tagline}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 48,
            color: INK_MUTED,
            fontSize: 20,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            display: "flex",
          }}
        >
          {new URL(site.url).host.replace(/^www\./, "")}
        </div>
      </div>
    ),
    { ...size },
  );
}
