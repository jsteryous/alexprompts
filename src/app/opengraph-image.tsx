import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "REBB Advisors — Lead Generation & Marketing for Greenville SC Trades";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0d1f16",
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
            color: "#22c55e",
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
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#22c55e",
            }}
          />
          REBB ADVISORS · GREENVILLE SC · LEAD GENERATION FOR TRADES
        </div>

        {/* Main headline */}
        <div
          style={{
            color: "#ffffff",
            fontSize: 68,
            fontWeight: 800,
            lineHeight: 1.04,
            letterSpacing: "-0.025em",
            marginBottom: 28,
            flex: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          Your next big contract
          <br />
          just changed hands.
        </div>

        {/* Sub */}
        <div
          style={{
            color: "#6b7280",
            fontSize: 22,
            lineHeight: 1.55,
            maxWidth: 760,
            marginBottom: 52,
          }}
        >
          We programmatically sync Greenville County property transfers and new
          business filings to surface high-value contracts before your
          competitors know they exist.
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
          <div style={{ color: "#4b5563", fontSize: 15, letterSpacing: "0.02em" }}>
            rebbadvisors.com
          </div>

          {/* Terminal signal badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.2)",
              borderRadius: 8,
              padding: "8px 16px",
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#22c55e",
              }}
            />
            <span
              style={{
                color: "#22c55e",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              SIGNAL ACTIVE
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
