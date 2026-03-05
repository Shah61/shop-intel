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
                    gap: 6,
                    padding: "4px 12px",
                    borderRadius: 8,
                    background: gradient,
                    boxShadow: shadow,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    color: "#fff",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                <span
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
                        animation: "shimmer 2s infinite",
                    }}
                />
                {label}
            </span>
        )
    }

    const displaySkus = selectedTab === "skus" ? skus : skus.slice(0, 5)

    return (
        <>
            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
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
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: t.title }}>Top Performing SKUs</h3>
                        <p style={{ fontSize: 14, color: t.subtitle }}>Best sellers by revenue</p>
                    </div>
                    {selectedTab !== "skus" && (
                        <button
                            type="button"
                            onClick={onSelectTap}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "8px 14px",
                                borderRadius: 10,
                                border: "none",
                                background: t.btnBg,
                                color: t.btnText,
                                fontSize: 14,
                                cursor: "pointer",
                            }}
                        >
                            <span className="hidden md:inline-block">View All</span>
                            <ArrowRightIcon style={{ width: 16, height: 16 }} />
                        </button>
                    )}
                </div>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                {selectedTab === "skus" && (
                                    <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: t.headerText }}>Image</th>
                                )}
                                <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: t.headerText }}>SKU</th>
                                <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: t.headerText }}>Quantity</th>
                                <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: t.headerText }}>Revenue</th>
                                <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: t.headerText }}>Views</th>
                                <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: t.headerText }}>Stock</th>
                                <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: t.headerText }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displaySkus.map((sku: ShopeeSku) => {
                                const stockQuantity = sku.stocks < 0 ? 0 : sku.stocks
                                return (
                                    <tr
                                        key={sku.sku}
                                        style={{
                                            borderBottom: `1px solid ${t.divider}`,
                                            transition: "background 0.15s ease",
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = t.rowHover }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent" }}
                                    >
                                        {selectedTab === "skus" && (
                                            <td style={{ padding: "14px 16px" }}>
                                                {sku.image && (
                                                    <img
                                                        src={sku.image}
                                                        alt={sku.sku}
                                                        style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8 }}
                                                    />
                                                )}
                                            </td>
                                        )}
                                        <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 500, color: t.cellBold }}>{sku.sku}</td>
                                        <td style={{ padding: "14px 16px", fontSize: 14, color: t.cellText, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis" }}>{sku.quantity}</td>
                                        <td style={{ padding: "14px 16px", fontSize: 14, color: t.cellText }}>
                                            {isAdmin(session?.user_entity || {}) ? formatCurrency(Number(sku.revenue)) : "********"}
                                        </td>
                                        <td style={{ padding: "14px 16px", fontSize: 14, color: t.cellText }}>{sku.views}</td>
                                        <td style={{ padding: "14px 16px", fontSize: 14, color: t.cellText }}>{stockQuantity}</td>
                                        <td style={{ padding: "14px 16px" }}>{getStockStatus(stockQuantity)}</td>
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
