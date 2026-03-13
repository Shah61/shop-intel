"use client"

import { useMemo } from "react"
import { useTheme } from "next-themes"
import { formatCurrency, isAdmin } from "@/src/core/constant/helper"
import { ArrowRightIcon } from "lucide-react"
import { ShopeeSku } from "@/src/features/sales/data/model/shopee-entity"
import { useSession } from "@/src/core/lib/dummy-session-provider"

const ShopeeSkusTable = ({
    skus,
    onSelectTap,
    selectedTab
}: {
    skus: ShopeeSku[],
    onSelectTap: () => void,
    selectedTab: string
}) => {
    const { resolvedTheme } = useTheme()
    const { data: session } = useSession()

    const t = useMemo(() => {
        const isDark = resolvedTheme === "dark"
        return isDark
            ? {
                cardBg: "linear-gradient(135deg, rgba(26, 34, 44, 0.9), rgba(35, 45, 56, 0.85))",
                cardBorder: "1px solid rgba(var(--preset-primary-rgb), 0.12)",
                glowColor: "rgba(var(--preset-primary-rgb), 0.08)",
                title: "#fff",
                subtitle: "#7a6a9a",
                headerText: "#7a6a9a",
                cellText: "#b8a9d4",
                cellBold: "#fff",
                rowHover: "rgba(var(--preset-primary-rgb), 0.08)",
                divider: "rgba(var(--preset-primary-rgb), 0.12)",
                btnText: "#fff",
                btnBg: "rgba(var(--preset-primary-rgb), 0.15)",
            }
            : {
                cardBg: "linear-gradient(135deg, rgba(250, 247, 255, 0.95), rgba(243, 237, 255, 0.85))",
                cardBorder: "1px solid rgba(var(--preset-primary-rgb), 0.1)",
                glowColor: "rgba(var(--preset-primary-rgb), 0.05)",
                title: "#1a1025",
                subtitle: "#8b7aa0",
                headerText: "#8b7aa0",
                cellText: "#5a4a70",
                cellBold: "#1a1025",
                rowHover: "rgba(var(--preset-primary-rgb), 0.06)",
                divider: "rgba(var(--preset-primary-rgb), 0.12)",
                btnText: "#1a1025",
                btnBg: "rgba(var(--preset-primary-rgb), 0.1)",
            }
    }, [resolvedTheme])

    const getStockStatus = (stockQuantity: number) => {
        const isInStock = stockQuantity > 0
        const gradient = isInStock
            ? "linear-gradient(135deg, #10b981, #34d399)"
            : "linear-gradient(135deg, #ef4444, #f87171)"
        const shadow = isInStock
            ? "0 2px 8px rgba(16, 185, 129, 0.35)"
            : "0 2px 8px rgba(239, 68, 68, 0.35)"
        const label = isInStock ? "In Stock" : "Out of Stock"
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
                <span style={{ position: "relative", zIndex: 1 }}>{label}</span>
                <span
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
                        backgroundSize: "200% 100%",
                        animation: "shimmer-slide 2s infinite linear",
                    }}
                />
            </span>
        )
    }

    const displaySkus = selectedTab === "skus" ? skus : skus.slice(0, 5)

    return (
        <>
            <style>{`
                @keyframes shimmer-slide {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>
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
                <div style={{ position: "absolute", top: -60, right: -60, width: 180, height: 180, background: `radial-gradient(circle, ${t.glowColor} 0%, transparent 70%)`, pointerEvents: "none" }} />
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: t.title, margin: 0, letterSpacing: "-0.3px", lineHeight: 1.2 }}>
                            Top Performing SKUs
                        </h2>
                        <p style={{ fontSize: 12, color: t.subtitle, margin: "4px 0 0 0" }}>
                            Best sellers by revenue
                        </p>
                    </div>
                    {selectedTab !== "skus" && (
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
                                background: t.btnBg,
                                color: t.btnText,
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
                                {selectedTab === "skus" && (
                                    <th style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: t.headerText, textTransform: "uppercase", letterSpacing: "0.5px", padding: "6px 8px 10px", borderBottom: `1px solid ${t.divider}` }}>Image</th>
                                )}
                                <th style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: t.headerText, textTransform: "uppercase", letterSpacing: "0.5px", padding: "6px 8px 10px", borderBottom: `1px solid ${t.divider}` }}>SKU</th>
                                <th style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: t.headerText, textTransform: "uppercase", letterSpacing: "0.5px", padding: "6px 8px 10px", borderBottom: `1px solid ${t.divider}` }}>Quantity</th>
                                <th style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: t.headerText, textTransform: "uppercase", letterSpacing: "0.5px", padding: "6px 8px 10px", borderBottom: `1px solid ${t.divider}` }}>Revenue</th>
                                <th style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: t.headerText, textTransform: "uppercase", letterSpacing: "0.5px", padding: "6px 8px 10px", borderBottom: `1px solid ${t.divider}` }}>Views</th>
                                <th style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: t.headerText, textTransform: "uppercase", letterSpacing: "0.5px", padding: "6px 8px 10px", borderBottom: `1px solid ${t.divider}` }}>Stock</th>
                                <th style={{ textAlign: "left", fontSize: 11, fontWeight: 600, color: t.headerText, textTransform: "uppercase", letterSpacing: "0.5px", padding: "6px 8px 10px", borderBottom: `1px solid ${t.divider}` }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displaySkus.map((sku: ShopeeSku) => {
                                const stockQuantity = sku.stocks < 0 ? 0 : sku.stocks
                                return (
                                    <tr
                                        key={sku.sku}
                                        style={{ transition: "background 0.15s ease" }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = t.rowHover }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent" }}
                                    >
                                        {selectedTab === "skus" && (
                                            <td style={{ padding: "8px 8px" }}>
                                                {sku.image && (
                                                    <img
                                                        src={sku.image}
                                                        alt={sku.sku}
                                                        style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8 }}
                                                    />
                                                )}
                                            </td>
                                        )}
                                        <td style={{ padding: "8px 8px", color: t.cellBold, fontWeight: 600, fontSize: 12 }}>{sku.sku}</td>
                                        <td style={{ padding: "8px 8px", color: t.cellText, fontSize: 12, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sku.quantity}</td>
                                        <td style={{ padding: "8px 8px", color: t.cellText, fontSize: 12 }}>
                                            {isAdmin(session?.user_entity || {}) ? formatCurrency(Number(sku.revenue)) : "********"}
                                        </td>
                                        <td style={{ padding: "8px 8px", color: t.cellText, fontSize: 12 }}>{sku.views}</td>
                                        <td style={{ padding: "8px 8px", color: t.cellText, fontSize: 12 }}>{stockQuantity}</td>
                                        <td style={{ padding: "8px 8px" }}>{getStockStatus(stockQuantity)}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}

export default ShopeeSkusTable
