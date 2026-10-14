import { ImageResponse } from "next/og";
import { getEdition, editionDateLine } from "@/lib/editions";
import { findClip, parseExcerpt, tornEdge, type Clip, type Excerpt } from "@/lib/clips";
import { paperFonts } from "@/lib/ogFonts";

/**
 * THE CLIPPING, AS A PICTURE (October 14, 2026). A 1200 x 630 image of one item
 * cut out of the paper: yellowed newsprint with a torn top and bottom, lying on
 * a dark desk, with the nameplate strip and a credit line. It is the link
 * preview for /clip/<date>/<item> and the file behind "Download image".
 *
 * The text always comes from the printed number (see src/lib/clips.ts), never
 * from the request, so the image cannot be made to say anything the paper did
 * not print. A bad address answers 404.
 */

const W = 1200;
const H = 630;
const PAPER = { x: 64, y: 30, w: 1072, h: 570 };
const NEWSPRINT = "#efe5c8";
const INK = "#1d1912";
const DESK = "#2a241c";

/** Cut text to roughly `chars`, at a word, with an ellipsis if anything was dropped. */
function fit(text: string, chars: number): string {
  if (text.length <= chars) return text;
  const cut = text.slice(0, chars);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), chars * 0.8)).replace(/[\s,;:.]+$/, "")}…`;
}

/** Characters that fit in a box of the given size at a font size, for a serif at ~0.5em per glyph. */
function budget(width: number, height: number, size: number, leading: number): number {
  const perLine = Math.floor(width / (size * 0.5));
  const lines = Math.floor(height / (size * leading));
  return perLine * lines;
}

function Body({ clip, excerpt }: { clip: Clip; excerpt: Excerpt | null }) {
  const innerW = PAPER.w - 150;
  if (excerpt) {
    const size = excerpt.text.length < 90 ? 46 : excerpt.text.length < 180 ? 38 : excerpt.text.length < 280 ? 32 : 27;
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexGrow: 1, justifyContent: "center", width: innerW }}>
        <div style={{ display: "flex", fontFamily: "Head", fontStyle: "italic", fontSize: size, lineHeight: 1.28, textAlign: "center" }}>
          {`“${excerpt.text}”`}
        </div>
        {clip.headline && (
          <div style={{ display: "flex", fontFamily: "Head", fontWeight: 700, fontSize: 18, letterSpacing: 2, marginTop: 22, textTransform: "uppercase", opacity: 0.75 }}>
            {fit(`From “${clip.headline.replace(/\.$/, "")}”`, 70)}
          </div>
        )}
      </div>
    );
  }

  const text = clip.paragraphs.join("  ");
  const bodyH = clip.headline ? 300 : 360;
  const sizes = [27, 24, 22, 20];
  const size = sizes.find((s) => text.length <= budget(innerW, bodyH, s, 1.38)) ?? 20;
  const shown = fit(text, budget(innerW, bodyH, size, 1.38));
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexGrow: 1, width: innerW }}>
      {clip.headline && (
        <div style={{ display: "flex", fontFamily: "Banner", fontWeight: 700, fontSize: clip.headline.length > 48 ? 38 : 48, lineHeight: 1.02, textTransform: "uppercase", textAlign: "center", marginBottom: 14 }}>
          {fit(clip.headline.replace(/\.$/, ""), 90)}
        </div>
      )}
      <div
        style={{
          display: "flex",
          fontFamily: clip.kind === "ad" ? "Head" : "News",
          fontStyle: clip.kind === "ad" ? "italic" : "normal",
          fontSize: clip.kind === "ad" ? size + 4 : size,
          lineHeight: 1.38,
          textAlign: clip.kind === "ad" ? "center" : "left",
        }}
      >
        {shown}
      </div>
      {clip.signed && shown === text && (
        <div style={{ display: "flex", alignSelf: "flex-end", fontFamily: "Head", fontStyle: "italic", fontSize: 22, marginTop: 10 }}>{clip.signed}</div>
      )}
    </div>
  );
}

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const slug = q.get("slug") ?? "";
  const item = q.get("item") ?? "";
  const edition = await getEdition(slug);
  const clip = edition ? findClip(edition, item) : null;
  if (!edition || !clip) return new Response("Not found", { status: 404 });
  const excerpt = parseExcerpt(clip, q.get("l"));

  const edge = tornEdge(`${slug}/${item}/${q.get("l") ?? ""}`, PAPER.w, PAPER.h);
  const path = `M${edge.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L")} Z`;
  const fonts = await paperFonts();

  const image = new ImageResponse(
    (
      <div style={{ display: "flex", width: W, height: H, background: DESK, position: "relative" }}>
        <svg width={PAPER.w} height={PAPER.h} viewBox={`0 0 ${PAPER.w} ${PAPER.h}`} style={{ position: "absolute", left: PAPER.x + 7, top: PAPER.y + 9 }}>
          <path d={path} fill="rgba(0,0,0,0.45)" />
        </svg>
        <svg width={PAPER.w} height={PAPER.h} viewBox={`0 0 ${PAPER.w} ${PAPER.h}`} style={{ position: "absolute", left: PAPER.x, top: PAPER.y }}>
          <path d={path} fill={NEWSPRINT} />
        </svg>
        <div
          style={{
            position: "absolute",
            left: PAPER.x,
            top: PAPER.y,
            width: PAPER.w,
            height: PAPER.h,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "34px 75px 30px",
            color: INK,
          }}
        >
          <div style={{ display: "flex", fontFamily: "Black", fontSize: 40, lineHeight: 1 }}>The Rebrew Intelligencer</div>
          <div style={{ display: "flex", width: "100%", height: 3, background: INK, marginTop: 10 }} />
          <div style={{ display: "flex", width: "100%", justifyContent: "space-between", fontFamily: "Head", fontWeight: 700, fontSize: 16, letterSpacing: 2, padding: "5px 0", textTransform: "uppercase" }}>
            <span>{clip.department}</span>
            <span>{`No. ${edition.number}  ·  ${editionDateLine(edition.slug)}`}</span>
          </div>
          <div style={{ display: "flex", width: "100%", height: 1, background: INK, marginBottom: 20 }} />
          <Body clip={clip} excerpt={excerpt} />
          <div style={{ display: "flex", fontFamily: "Head", fontStyle: "italic", fontSize: 18, marginTop: 12, opacity: 0.8 }}>
            Clipped from The Rebrew Intelligencer  ·  rebrew.org
          </div>
        </div>
      </div>
    ),
    { width: W, height: H, fonts },
  );
  image.headers.set("Cache-Control", "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800");
  return image;
}
