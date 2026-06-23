import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Alex Prompts: Do more with AI than you think you can.";
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
            color: "#818cf8",
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
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#818cf8" }} />
          ALEX PROMPTS · LEARN AI BY DOING
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
          Do more with AI than
          <br />
          you think you can.
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
          Powerful AI tools, explained for normal people. Real projects, step by
          step, with no code, no jargon, and no hype.
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
          <div style={{ color: "#6b7280", fontSize: 15, letterSpacing: "0.02em" }}>
            alexprompts.com
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(129,140,248,0.1)",
              border: "1px solid rgba(129,140,248,0.25)",
              borderRadius: 8,
              padding: "8px 16px",
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#818cf8" }} />
            <span
              style={{
                color: "#a5b4fc",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              NEW GUIDE WEEKLY
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
