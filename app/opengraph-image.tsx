import { ImageResponse } from "next/og"
import { siteConfig } from "@/lib/seo/site"

export const runtime = "edge"
export const alt = siteConfig.ogImage.alt
export const size = {
  width: siteConfig.ogImage.width,
  height: siteConfig.ogImage.height,
}
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            "radial-gradient(circle at 75% 15%, rgba(168, 85, 247, 0.35), transparent 45%), radial-gradient(circle at 20% 85%, rgba(59, 130, 246, 0.25), transparent 50%), linear-gradient(135deg, #050508 0%, #0b0a14 40%, #0a0f2c 100%)",
          color: "#ffffff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "linear-gradient(135deg, #a855f7, #6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            P
          </div>
          <span style={{ fontSize: 36, fontWeight: 600, letterSpacing: "-0.02em" }}>
            {siteConfig.name}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 900 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
            }}
          >
            {siteConfig.tagline}
          </div>
          <div
            style={{
              fontSize: 28,
              lineHeight: 1.45,
              color: "rgba(255, 255, 255, 0.72)",
              maxWidth: 820,
            }}
          >
            {siteConfig.shortDescription}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          {["Sales", "Marketing", "Inventory", "AI Intelligence"].map((label) => (
            <div
              key={label}
              style={{
                padding: "10px 20px",
                borderRadius: 999,
                border: "1px solid rgba(168, 85, 247, 0.35)",
                background: "rgba(168, 85, 247, 0.12)",
                fontSize: 20,
                color: "rgba(255, 255, 255, 0.9)",
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  )
}
