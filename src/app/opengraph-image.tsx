import { ImageResponse } from "next/og";

export const alt = "MYBF — Why not Malappuram.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#005bff",
          padding: "64px 72px",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 6, color: "#f4f0e6" }}>
          MALAPPURAM YOUTH BUSINESS FORUM
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 92,
            fontWeight: 800,
            lineHeight: 0.92,
            letterSpacing: -3,
            color: "#f4f0e6",
          }}
        >
          Why not Malappuram.
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ background: "#fcc000", color: "#14161c", padding: "8px 16px", fontSize: 26, fontWeight: 700 }}>
            Building ideas
          </div>
          <div style={{ background: "#e11d74", color: "#f4f0e6", padding: "8px 16px", fontSize: 26, fontWeight: 700 }}>
            Creating connections
          </div>
          <div style={{ background: "#3aadf2", color: "#14161c", padding: "8px 16px", fontSize: 26, fontWeight: 700 }}>
            Designing the future
          </div>
        </div>
      </div>
    ),
    size,
  );
}
