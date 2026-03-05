"use client"

import { useMemo } from "react"
import { useTheme } from "next-themes"
import { ArrowRightIcon } from "lucide-react"
import { formatDateToMMDDYYYY } from "@/src/core/constant/helper"
import { TiktokConversionRate } from "@/src/features/sales/data/model/tiktok-entity"

const TiktokConversionTable = ({
    conversionData,
    isLimited,
    onViewAll
}: {
    conversionData: TiktokConversionRate[]
    isLimited?: boolean
    onViewAll?: () => void
}) => {
    const { resolvedTheme } = useTheme()
    const isDark = resolvedTheme === "dark"

    const sortedData = [...conversionData].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

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
                badgeBg: "rgba(var(--preset-primary-rgb), 0.15)",
                badgeText: "var(--preset-lighter)",
                badgeHighBg: "rgba(239, 68, 68, 0.15)",
                badgeHighText: "#f87171",
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
            badgeBg: "rgba(var(--preset-primary-rgb), 0.1)",
            badgeText: "var(--preset-primary)",
            badgeHighBg: "rgba(239, 68, 68, 0.1)",
            badgeHighText: "#dc2626",
            btnText: "var(--preset-primary)",
            btnBg: "rgba(var(--preset-primary-rgb), 0.06)",
        }
    }, [isDark])

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
                {isLimited && onViewAll && (
                    <button
                        type="button"
                        onClick={onViewAll}
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

            <div style={{ overflow: "auto", flex: 1 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                        <tr>
                            {["Date", "Visitors", "Orders", "Conversion"].map((h) => (
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
                        {sortedData &&
                            Array.isArray(sortedData) &&
                            sortedData
                                .slice(0, isLimited ? 7 : sortedData.length)
                                .map((conversion) => (
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
                                                maxWidth: 120,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {conversion.total_visitors}
                                        </td>
                                        <td style={{ padding: "8px 8px", color: t.cellText, fontSize: 12 }}>
                                            {conversion.total_orders}
                                        </td>
                                        <td style={{ padding: "8px 8px" }}>
                                            <span
                                                style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                    padding: "2px 8px",
                                                    borderRadius: 6,
                                                    background:
                                                        conversion.conversion_rate <= 20
                                                            ? t.badgeBg
                                                            : t.badgeHighBg,
                                                    color:
                                                        conversion.conversion_rate <= 20
                                                            ? t.badgeText
                                                            : t.badgeHighText,
                                                }}
                                            >
                                                {conversion.conversion_rate}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default TiktokConversionTable
