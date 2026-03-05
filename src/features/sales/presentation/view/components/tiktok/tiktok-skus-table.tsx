"use client"

import { useMemo } from "react"
import { useTheme } from "next-themes"
import { ArrowRightIcon } from "lucide-react"
import { formatCurrency, isAdmin } from "@/src/core/constant/helper"
import { useSession } from "@/src/core/lib/dummy-session-provider"
import { TiktokSku } from "@/src/features/sales/data/model/tiktok-entity"

const TiktokSkusTable = ({
    skus,
    onSelectTap,
    selectedTab
}: {
    skus: TiktokSku[]
    onSelectTap: () => void
    selectedTab: string
}) => {
    const { resolvedTheme } = useTheme()
    const isDark = resolvedTheme === "dark"
    const { data: session } = useSession()

    const t = useMemo(() => {
        if (isDark) {
            return {
                cardBg: "linear-gradient(135deg, rgba(26, 34, 44, 0.9), rgba(35, 45, 56, 0.85))",
                cardBorder: "1px solid rgba(var(--preset-primary-rgb), 0.12)",
                glowColor: "rgba(var(--preset-primary-rgb), 0.08)",
                title: "#fff",
                subtitle: "#7a6a9a",
                headerText: "#7a6a9a",
                cellText: "#c8bfe0",
                cellBold: "#e8dff8",
                rowHover: "rgba(var(--preset-primary-rgb), 0.06)",
                divider: "rgba(var(--preset-primary-rgb), 0.08)",
                inStockBg: "rgba(16, 185, 129, 0.15)",
                inStockText: "#34d399",
                outStockBg: "rgba(239, 68, 68, 0.15)",
                outStockText: "#f87171",
                btnText: "var(--preset-lighter)",
                btnBg: "rgba(var(--preset-primary-rgb), 0.1)",
            }
        }
        return {
            cardBg: "linear-gradient(135deg, rgba(250, 247, 255, 0.95), rgba(243, 237, 255, 0.85))",
            cardBorder: "1px solid rgba(var(--preset-primary-rgb), 0.1)",
            glowColor: "rgba(var(--preset-primary-rgb), 0.05)",
            title: "#1a1025",
            subtitle: "#8b7aa0",
            headerText: "#8b7aa0",
            cellText: "#4a3a60",
            cellBold: "#1a1025",
            rowHover: "rgba(var(--preset-primary-rgb), 0.04)",
            divider: "rgba(var(--preset-primary-rgb), 0.08)",
            inStockBg: "rgba(16, 185, 129, 0.1)",
            inStockText: "#059669",
            outStockBg: "rgba(239, 68, 68, 0.1)",
            outStockText: "#dc2626",
            btnText: "var(--preset-primary)",
            btnBg: "rgba(var(--preset-primary-rgb), 0.06)",
        }
    }, [isDark])

    const isFullView = selectedTab === "skus"
    const displaySkus = isFullView ? skus : skus.slice(0, 5)
    const headers = isFullView
        ? ["Image", "SKU", "Stock", "Status", "Quantity", "Revenue"]
        : ["SKU", "Stock", "Status", "Quantity", "Revenue"]

    const StatusBadge = ({ stock }: { stock: number }) => {
        const inStock = stock > 0
        const gradient = inStock
            ? "linear-gradient(135deg, #10b981, #34d399)"
            : "linear-gradient(135deg, #ef4444, #f87171)"
        const shadow = inStock
            ? "0 2px 8px rgba(16, 185, 129, 0.35)"
            : "0 2px 8px rgba(239, 68, 68, 0.35)"

        return (
            <span
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    position: "relative",
                    overflow: "hidden",
                    background: gradient,
                    boxShadow: shadow,
                    borderRadius: 6,
                    padding: "2px 8px",
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: "#fff",
                    lineHeight: 1.6,
                }}
            >
                <span style={{ position: "relative", zIndex: 1 }}>
                    {inStock ? "In Stock" : "Out of Stock"}
                </span>
                <span
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
                        backgroundSize: "200% 100%",
                        animation: "shimmer-slide 2s infinite linear",
                    }}
                />
                <style>{`
                    @keyframes shimmer-slide {
                        0% { background-position: -200% 0; }
                        100% { background-position: 200% 0; }
                    }
                `}</style>
            </span>
        )
    }

    return (
        <div
            style={{
                background: t.cardBg,
                borderRadius: 20,
                border: t.cardBorder,
                padding: "22px 26px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                fontFamily: "'Outfit', sans-serif",
                position: "relative",
                overflow: "hidden",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    top: -60,
                    right: -60,
                    width: 180,
                    height: 180,
                    background: `radial-gradient(circle, ${t.glowColor} 0%, transparent 70%)`,
                    pointerEvents: "none",
                }}
            />

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: t.title, margin: 0, letterSpacing: "-0.3px", lineHeight: 1.2 }}>
                        Top Performing SKUs
                    </h2>
                    <p style={{ fontSize: 12, color: t.subtitle, margin: "4px 0 0 0" }}>
                        Best sellers by revenue
                    </p>
                </div>
                {!isFullView && (
                    <button
                        type="button"
                        onClick={onSelectTap}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 12,
                            fontWeight: 600,
                            padding: "5px 10px",
                            borderRadius: 8,
                            border: "none",
                            cursor: "pointer",
                            color: t.btnText,
                            background: t.btnBg,
                        }}
                    >
                        View All
                        <ArrowRightIcon size={14} />
                    </button>
                )}
            </div>

            <div style={{ overflow: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                        <tr>
                            {headers.map((h) => (
                                <th
                                    key={h}
                                    style={{
                                        textAlign: "left",
                                        fontSize: 11,
                                        fontWeight: 600,
                                        color: t.headerText,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px",
                                        padding: "6px 8px 10px",
                                        borderBottom: `1px solid ${t.divider}`,
                                    }}
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {displaySkus.map((sku: TiktokSku) => (
                            <tr
                                key={sku.sku}
                                style={{ transition: "background 0.15s ease" }}
                                onMouseOver={(e) => (e.currentTarget.style.background = t.rowHover)}
                                onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                                {isFullView && (
                                    <td style={{ padding: "8px 8px" }}>
                                        {sku.image && (
                                            <img
                                                src={sku.image}
                                                alt={sku.sku}
                                                style={{
                                                    width: 48,
                                                    height: 48,
                                                    objectFit: "cover",
                                                    borderRadius: 8,
                                                }}
                                            />
                                        )}
                                    </td>
                                )}
                                <td style={{ padding: "8px 8px", color: t.cellBold, fontWeight: 600, fontSize: 12 }}>
                                    {sku.sku}
                                </td>
                                <td style={{ padding: "8px 8px", color: t.cellText, fontSize: 12 }}>
                                    {sku.stock}
                                </td>
                                <td style={{ padding: "8px 8px" }}>
                                    <StatusBadge stock={sku.stock} />
                                </td>
                                <td style={{ padding: "8px 8px", color: t.cellText, fontSize: 12, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {sku.quantity}
                                </td>
                                <td style={{ padding: "8px 8px", color: t.cellText, fontSize: 12 }}>
                                    {isAdmin(session?.user_entity || {})
                                        ? formatCurrency(Number(sku.revenue))
                                        : "********"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default TiktokSkusTable
