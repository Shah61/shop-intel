import { useMemo } from "react";
import { useTheme } from "next-themes";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableCell,
    TableHead
} from "@/components/ui/table";
import { formatCurrency, isAdmin } from "@/src/core/constant/helper";
import { AnalyticsSalesEntity } from "@/src/features/sales/data/model/analytics-entity";
import DialogAnalyticsSalesTable from "./dialog-analytics-sales-table";
import { useSession } from "@/src/core/lib/dummy-session-provider";

const PLATFORM_BADGE_CONFIG: Record<string, { label: string; gradient: string; shadow: string }> = {
    tiktok: {
        label: "TikTok",
        gradient: "linear-gradient(135deg, #ff0050, #ff2d78)",
        shadow: "0 2px 8px rgba(255, 0, 80, 0.35)",
    },
    shopee: {
        label: "Shopee",
        gradient: "linear-gradient(135deg, #ee4d2d, #f06030)",
        shadow: "0 2px 8px rgba(238, 77, 45, 0.35)",
    },
    shopify: {
        label: "Shopify",
        gradient: "linear-gradient(135deg, #5c9e31, #7ab648)",
        shadow: "0 2px 8px rgba(92, 158, 49, 0.35)",
    },
    physical: {
        label: "Physical",
        gradient: "linear-gradient(135deg, #3b82f6, #60a5fa)",
        shadow: "0 2px 8px rgba(59, 130, 246, 0.35)",
    },
};

function PlatformBadge({ platform }: { platform: string }) {
    const config = PLATFORM_BADGE_CONFIG[platform] || {
        label: platform,
        gradient: "linear-gradient(135deg, #9e9e9e, #bdbdbd)",
        shadow: "0 2px 8px rgba(158, 158, 158, 0.3)",
    };

    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                position: "relative",
                overflow: "hidden",
                background: config.gradient,
                boxShadow: config.shadow,
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
            <span style={{ position: "relative", zIndex: 1 }}>{config.label}</span>
            <span
                style={{
                    position: "absolute",
                    inset: 0,
                    background:
                        "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
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
    );
}



// const conversionData: ConversionEntity[] = [
//     { visitors: 234, orders: 45, conversionRate: 19.2, date: "03/14/2024" },
//     { visitors: 567, orders: 89, conversionRate: 15.7, date: "03/15/2024" },
//     { visitors: 432, orders: 67, conversionRate: 15.5, date: "03/16/2024" },
//     { visitors: 789, orders: 156, conversionRate: 19.8, date: "03/17/2024" },
//     { visitors: 345, orders: 78, conversionRate: 22.6, date: "03/18/2024" },
//     { visitors: 678, orders: 134, conversionRate: 19.8, date: "03/19/2024" },
//     { visitors: 456, orders: 98, conversionRate: 21.5, date: "03/20/2024" },
// ];

const PLATFORMS_CYCLE = ["physical", "shopee", "tiktok", "shopify"] as const;

function generateDummyRows(count: number) {
    const today = new Date();
    return Array.from({ length: count }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        const platform = PLATFORMS_CYCLE[i % PLATFORMS_CYCLE.length];
        return {
            date: dateStr,
            platform,
            orders: Math.floor(Math.random() * 40) + 3,
            revenue: Math.floor(Math.random() * 4000) + 200,
        };
    });
}

const DUMMY_ROWS = generateDummyRows(30);

const AnalyticsSalesTable = ({
    isLimit
}: {
    data?: AnalyticsSalesEntity[]
    isLimit: boolean
}) => {
    const limitData = isLimit ? DUMMY_ROWS.slice(0, 8) : DUMMY_ROWS;
    const { data: session } = useSession();
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

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
            };
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
        };
    }, [isDark]);

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
            {/* Ambient glow */}
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

            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                    <h2
                        style={{
                            fontSize: 18,
                            fontWeight: 700,
                            color: t.title,
                            margin: 0,
                            letterSpacing: "-0.3px",
                            lineHeight: 1.2,
                        }}
                    >
                        List Conversion
                    </h2>
                    <p style={{ fontSize: 12, color: t.subtitle, margin: "4px 0 0 0" }}>
                        Conversion rate for each date
                    </p>
                </div>
                {isLimit && <DialogAnalyticsSalesTable />}
            </div>

            {/* Table */}
            <div style={{ overflow: "auto", flex: 1 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                        <tr>
                            {["Date", "Platform", "Orders", "Revenues"].map((h) => (
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
                        {limitData.map((row, index) => (
                            <tr
                                key={index}
                                style={{ transition: "background 0.15s ease" }}
                                onMouseOver={(e) => (e.currentTarget.style.background = t.rowHover)}
                                onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                                <td style={{ padding: "8px 8px", color: t.cellBold, fontWeight: 600, fontSize: 12 }}>
                                    {row.date}
                                </td>
                                <td style={{ padding: "8px 8px" }}>
                                    <PlatformBadge platform={row.platform} />
                                </td>
                                <td style={{ padding: "8px 8px", color: t.cellText, fontSize: 12 }}>
                                    {row.orders}
                                </td>
                                <td style={{ padding: "8px 8px", color: t.cellText, fontSize: 12 }}>
                                    {isAdmin(session?.user_entity || {}) ? (
                                        formatCurrency(row.revenue)
                                    ) : (
                                        "********"
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AnalyticsSalesTable;