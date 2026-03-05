"use client"

import { useMemo } from "react"
import { useTheme } from "next-themes"
import { ArrowRightIcon } from "lucide-react"
import { formatCurrency, formatDateToMMDDYYYY } from "@/src/core/constant/helper"
import { ShopifyConversionRate } from "@/src/features/sales/data/model/shopify-entity"

const ShopifyConversionTable = ({
    conversionRate,
    onSelectTap,
    selectedTab
}: {
    conversionRate: ShopifyConversionRate[],
    onSelectTap: () => void,
    selectedTab: string
}) => {
    const { resolvedTheme } = useTheme()
    const isDark = resolvedTheme === "dark"

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
            btnText: "var(--preset-primary)",
            btnBg: "rgba(var(--preset-primary-rgb), 0.06)",
        }
    }, [isDark])

    const displayData = selectedTab === "campaigns" ? conversionRate : conversionRate.slice(0, 7)

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
                height: "100%",
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
                        List Conversion
                    </h2>
                    <p style={{ fontSize: 12, color: t.subtitle, margin: "4px 0 0 0" }}>
                        Conversion rate for each date
                    </p>
                </div>
                {selectedTab !== "campaigns" && (
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
                        <span className="hidden md:inline-block">View All</span>
                        <ArrowRightIcon size={14} />
                    </button>
                )}
            </div>

            <div style={{ overflow: "auto", flex: 1 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                        <tr>
                            <th
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
                                Date
                            </th>
                            <th
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
                                Revenue
                            </th>
                            <th
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
                                Orders
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayData.map((conversion) => (
                            <tr
                                key={conversion.date}
                                style={{ transition: "background 0.15s ease" }}
                                onMouseOver={(e) =>
                                    (e.currentTarget.style.background = t.rowHover)
                                }
                                onMouseOut={(e) =>
                                    (e.currentTarget.style.background = "transparent")
                                }
                            >
                                <td
                                    style={{
                                        padding: "8px 8px",
                                        color: t.cellBold,
                                        fontWeight: 600,
                                        fontSize: 12,
                                    }}
                                >
                                    {formatDateToMMDDYYYY(conversion.date)}
                                </td>
                                <td
                                    style={{
                                        padding: "8px 8px",
                                        color: t.cellText,
                                        fontSize: 12,
                                    }}
                                >
                                    {formatCurrency(conversion.total_revenues)}
                                </td>
                                <td style={{ padding: "8px 8px", color: t.cellText, fontSize: 12 }}>
                                    {conversion.total_orders}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default ShopifyConversionTable
