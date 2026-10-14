import { ImageResponse } from "next/og";
import { getEdition, editionDateLine } from "@/lib/editions";

export const alt = "The Rebrew Intelligencer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The share card for one number of the Intelligencer: the nameplate in
 * blackletter, the date between rules, and the lead headline. A link dropped
 * in a group chat should look like a newspaper, because that is the joke.
 *
 * Satori needs font files as buffers, so the two period faces are fetched from
 * Google Fonts at render time (the card is cached after the first request). If
 * that fetch fails, the card still renders in the default face.
 */
async function googleFont(family: string): Promise<ArrayBuffer | null> {
  try {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family}`)).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

const PAPER = "#f4efe3";
const INK = "#1b1813";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const edition = await getEdition(slug);
  const [black, fell] = await Promise.all([googleFont("UnifrakturMaguntia"), googleFont("IM+Fell+English")]);
  const fonts = [
    ...(black ? [{ name: "Black", data: black, style: "normal" as const, weight: 400 as const }] : []),
    ...(fell ? [{ name: "Fell", data: fell, style: "normal" as const, weight: 400 as const }] : []),
  ];
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
          fontFamily: "Fell",
        }}
      >
        <div style={{ display: "flex", fontFamily: "Black", fontSize: 92, lineHeight: 1 }}>The Rebrew Intelligencer</div>
        <div style={{ display: "flex", width: "100%", height: 4, background: INK, marginTop: 22 }} />
        <div style={{ display: "flex", fontSize: 24, letterSpacing: 3, padding: "8px 0" }}>
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
            fontSize: headline.length > 60 ? 52 : 64,
            lineHeight: 1.1,
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
