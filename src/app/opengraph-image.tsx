import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const runtime = "edge";
export const alt = `${site.name}: ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0c10",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "72px 80px",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Top label */}
        <div
          style={{
            color: "#d97066",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: 40,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#d97066" }} />
          {site.name}
        </div>

        {/* Main headline */}
        <div
          style={{
            color: "#ffffff",
            fontSize: 64,
            fontWeight: 800,
            lineHeight: 1.06,
            letterSpacing: "-0.025em",
            marginBottom: 28,
            flex: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          Greenville Real Estate
        </div>

        {/* Sub */}
        <div
          style={{
            color: "#8b8f9c",
            fontSize: 22,
            lineHeight: 1.55,
            maxWidth: 820,
            marginBottom: 52,
          }}
        >
          How the Greenville market is actually moving, where prices have been
          heading over years rather than quarters, and why.
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: 28,
          }}
        >
          {/* The host, printed on every share card. Derived from site.url so a
              domain move cannot leave the card advertising the old one, with the
              www stripped because a bare domain reads better on a share card. */}
          <div style={{ color: "#6b7280", fontSize: 15, letterSpacing: "0.02em" }}>
            {new URL(site.url).host.replace(/^www\./, "")}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(217,112,102,0.12)",
              border: "1px solid rgba(217,112,102,0.3)",
              borderRadius: 0,
              padding: "8px 16px",
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#d97066" }} />
            <span
              style={{
                color: "#e8a49c",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              SOUTH CAROLINA
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
