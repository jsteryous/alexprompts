import { ImageResponse } from "next/og";
import { getEdition, editionDateLine } from "@/lib/editions";
import { paperFonts } from "@/lib/ogFonts";

export const alt = "The Rebrew Intelligencer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The share card for one number of the Intelligencer: the nameplate in
 * blackletter, the date between rules, and the lead headline as a 1945 banner.
 * A link dropped in a group chat should look like a newspaper, because that is
 * the joke. Fonts come from src/lib/ogFonts.ts, the same faces as the page; if
 * the fetch fails the card still renders in the default face.
 */

const PAPER = "#f4efe3";
const INK = "#1b1813";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const edition = await getEdition(slug);
  const fonts = await paperFonts();
  const headline = edition?.headline ?? "The Rebrew Intelligencer";

  return new ImageResponse(
    (
      <div
        style={{
          background: PAPER,
          color: INK,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "44px 64px",
          fontFamily: "Head",
        }}
      >
        <div style={{ display: "flex", fontFamily: "Black", fontSize: 92, lineHeight: 1 }}>The Rebrew Intelligencer</div>
        <div style={{ display: "flex", width: "100%", height: 4, background: INK, marginTop: 22 }} />
        <div style={{ display: "flex", fontWeight: 700, fontSize: 22, letterSpacing: 3, padding: "8px 0" }}>
          {edition ? `${editionDateLine(edition.slug)}   ·   No. ${edition.number}` : "PUBLISHED TRI-WEEKLY"}
        </div>
        <div style={{ display: "flex", width: "100%", height: 1, background: INK }} />
        <div style={{ display: "flex", width: "100%", height: 1, background: INK, marginTop: 3 }} />
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            textAlign: "center",
            fontFamily: "Banner",
            fontWeight: 700,
            fontSize: headline.length > 60 ? 64 : 80,
            lineHeight: 1,
            textTransform: "uppercase",
          }}
        >
          {headline}
        </div>
        <div style={{ display: "flex", fontSize: 22, fontStyle: "italic" }}>
          Every item of news herein is true. rebrew.org
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined },
  );
}
