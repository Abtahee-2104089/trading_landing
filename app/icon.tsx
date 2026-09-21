import { ImageResponse } from "next/og";

// Icon metadata — 32x32 PNG, navy/gold gateway branding.
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

// App icon — gold "U" on deep navy. `favicon.ico` remains as fallback.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#081226",
          borderRadius: 7,
          color: "#D9B545",
          fontFamily: "Arial, sans-serif",
          fontSize: 21,
          fontWeight: 900,
        }}
      >
        U
      </div>
    ),
    {
      ...size,
    },
  );
}
