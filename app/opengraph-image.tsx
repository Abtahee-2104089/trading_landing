import { ImageResponse } from "next/og";

/** Dynamic OG image — navy/gold gateway branding, no binary asset needed. */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        background: "#081226",
        color: "#FDFBF7",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ fontSize: 28, color: "#D9B545", letterSpacing: 6 }}>
        UAE TRADE GATEWAY
      </div>
      <div
        style={{
          fontSize: 72,
          fontWeight: 800,
          lineHeight: 1.05,
          marginTop: 16,
        }}
      >
        Global Trade. Seamless Supply.
      </div>
      <div style={{ fontSize: 40, color: "#D9B545", marginTop: 8 }}>
        Trusted from the UAE.
      </div>
      <div style={{ fontSize: 24, color: "#CBD5E1", marginTop: 24 }}>
        Sourcing · Commodity trading · Cross-border logistics via Jebel Ali
      </div>
    </div>,
    { ...size },
  );
}
