"use client";

import { useTheme } from "next-themes";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/src/core/constant/helper";

interface OverviewDataCardProps {
    platform: string;
    icon: React.ReactNode;
    dailySales: number;
    orderCount: number;
    averageOrderValue: number;
    isLoading: boolean;
    expanded?: boolean;
    onExpandToggle?: () => void;
    glowColor?: string;
    iconBg?: string;
}

const PLATFORM_CONFIG: Record<
    string,
    {
        label: string;
        shortLabel: string;
        darkGlow: string;
        lightGlow: string;
        darkIconBg: string;
        lightIconBg: string;
        accentDark: string;
        accentLight: string;
    }
> = {
    tiktok: {
        label: "TikTok",
        shortLabel: "TikTok",
        darkGlow: "rgba(var(--preset-primary-rgb), 0.14)",
        lightGlow: "rgba(var(--preset-primary-rgb), 0.08)",
        darkIconBg: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))",
        lightIconBg: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))",
        accentDark: "var(--preset-lighter)",
        accentLight: "var(--preset-primary)",
    },
    shopee: {
        label: "Shopee",
        shortLabel: "Shopee",
        darkGlow: "rgba(var(--preset-primary-rgb), 0.14)",
        lightGlow: "rgba(var(--preset-primary-rgb), 0.08)",
        darkIconBg: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))",
        lightIconBg: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))",
        accentDark: "var(--preset-lighter)",
        accentLight: "var(--preset-primary)",
    },
    shopify: {
        label: "Shopify",
        shortLabel: "Shopify",
        darkGlow: "rgba(var(--preset-primary-rgb), 0.14)",
        lightGlow: "rgba(var(--preset-primary-rgb), 0.08)",
        darkIconBg: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))",
        lightIconBg: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))",
        accentDark: "var(--preset-lighter)",
        accentLight: "var(--preset-primary)",
    },
    physical: {
        label: "Physical Store",
        shortLabel: "Physical",
        darkGlow: "rgba(var(--preset-primary-rgb), 0.14)",
        lightGlow: "rgba(var(--preset-primary-rgb), 0.08)",
        darkIconBg: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))",
        lightIconBg: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))",
        accentDark: "var(--preset-primary)",
        accentLight: "var(--preset-primary)",
    },
};

const OverviewDataCard = ({
    platform,
    icon,
    dailySales,
    orderCount,
    averageOrderValue,
    isLoading,
    expanded = false,
    onExpandToggle,
}: OverviewDataCardProps) => {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    const config = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG.tiktok;

    const t = isDark
        ? {
              cardBg: "linear-gradient(135deg, rgba(26, 34, 44, 0.9), rgba(35, 45, 56, 0.85))",
              cardBorder: "rgba(var(--preset-primary-rgb), 0.1)",
              cardHoverBorder: "rgba(var(--preset-primary-rgb), 0.2)",
              title: "hsl(var(--foreground))",
              subtitle: "hsl(var(--muted-foreground))",
              salesAmount: "hsl(var(--foreground))",
              statLabel: "hsl(var(--muted-foreground))",
              statValue: "hsl(var(--foreground))",
              divider: "rgba(var(--preset-primary-rgb), 0.1)",
              glow: config.darkGlow,
              iconBg: config.darkIconBg,
              badgeBg: "rgba(var(--preset-primary-rgb), 0.08)",
              badgeBorder: "rgba(var(--preset-primary-rgb), 0.15)",
              expandBtnBg: "rgba(var(--preset-primary-rgb), 0.06)",
              expandBtnBorder: "rgba(var(--preset-primary-rgb), 0.12)",
              expandBtnColor: "hsl(var(--muted-foreground))",
              trendUp: "var(--preset-lighter)",
              trendDown: "#ef5350",
              accent: config.accentDark,
          }
        : {
              cardBg: "rgba(250, 247, 255, 0.9)",
              cardBorder: "rgba(var(--preset-primary-rgb), 0.08)",
              cardHoverBorder: "rgba(var(--preset-primary-rgb), 0.18)",
              title: "hsl(var(--foreground))",
              subtitle: "hsl(var(--muted-foreground))",
              salesAmount: "hsl(var(--foreground))",
              statLabel: "hsl(var(--muted-foreground))",
              statValue: "hsl(var(--foreground))",
              divider: "rgba(var(--preset-primary-rgb), 0.08)",
              glow: config.lightGlow,
              iconBg: config.lightIconBg,
              badgeBg: "rgba(var(--preset-primary-rgb), 0.04)",
              badgeBorder: "rgba(var(--preset-primary-rgb), 0.1)",
              expandBtnBg: "rgba(var(--preset-primary-rgb), 0.04)",
              expandBtnBorder: "rgba(var(--preset-primary-rgb), 0.1)",
              expandBtnColor: "hsl(var(--muted-foreground))",
              trendUp: "var(--preset-primary)",
              trendDown: "#dc2626",
              accent: config.accentLight,
          };

    return (
        <div
            className="overview-data-card"
            style={{
                background: t.cardBg,
                borderRadius: 16,
                border: `1px solid ${t.cardBorder}`,
                padding: "18px 20px 0 20px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                position: "relative",
                overflow: "hidden",
                fontFamily: "'Outfit', sans-serif",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                cursor: "default",
                minWidth: 0,
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = t.cardHoverBorder;
                e.currentTarget.style.boxShadow = `0 4px 24px ${t.glow}`;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = t.cardBorder;
                e.currentTarget.style.boxShadow = "none";
            }}
        >
            {/* Top row — icon + platform title (same line as Revenue label) */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                }}
            >
                <div
                    className="platform-icon"
                    style={{
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        background: t.iconBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: `0 2px 12px ${t.glow}`,
                    }}
                >
                    <div style={{ color: "#fff", display: "flex" }}>{icon}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span
                        style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: t.title,
                        }}
                    >
                        {config.label}
                    </span>
                    <span
                        style={{
                            fontSize: 11,
                            color: t.subtitle,
                        }}
                    >
                        Revenue
                    </span>
                </div>
            </div>

            {/* Sales amount */}
            <div>
                {isLoading ? (
                    <Skeleton
                        style={{ height: 28, width: 120, marginTop: 6 }}
                    />
                ) : (
                    <p
                        className="platform-sales-amount"
                        style={{
                            fontSize: 24,
                            fontWeight: 700,
                            color: t.salesAmount,
                            margin: "6px 0 0 0",
                            letterSpacing: "-0.5px",
                            lineHeight: 1,
                            fontFamily: "'Outfit', sans-serif",
                        }}
                    >
                        {formatCurrency(dailySales)}
                    </p>
                )}
            </div>

            {/* Divider */}
            <div
                style={{
                    width: "100%",
                    height: 1,
                    background: t.divider,
                }}
            />

            {/* Expandable stats */}
            <div
                style={{
                    overflow: "hidden",
                    maxHeight: expanded ? 80 : 0,
                    opacity: expanded ? 1 : 0,
                    transition: "max-height 0.3s ease, opacity 0.25s ease, padding 0.3s ease",
                    paddingBottom: expanded ? 4 : 0,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        gap: 28,
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontSize: 10,
                                color: t.statLabel,
                                marginBottom: 4,
                                fontWeight: 500,
                                textTransform: "uppercase",
                                letterSpacing: "0.4px",
                            }}
                        >
                            Orders
                        </div>
                        {isLoading ? (
                            <Skeleton style={{ height: 18, width: 50 }} />
                        ) : (
                            <div
                                style={{
                                    fontSize: 15,
                                    fontWeight: 600,
                                    color: t.statValue,
                                }}
                            >
                                {orderCount.toLocaleString()}
                            </div>
                        )}
                    </div>
                    <div>
                        <div
                            style={{
                                fontSize: 10,
                                color: t.statLabel,
                                marginBottom: 4,
                                fontWeight: 500,
                                textTransform: "uppercase",
                                letterSpacing: "0.4px",
                            }}
                        >
                            Avg. Order
                        </div>
                        {isLoading ? (
                            <Skeleton style={{ height: 18, width: 70 }} />
                        ) : (
                            <div
                                style={{
                                    fontSize: 15,
                                    fontWeight: 600,
                                    color: t.statValue,
                                }}
                            >
                                {formatCurrency(averageOrderValue)}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Expand/collapse toggle */}
            <button
                className="platform-expand-btn"
                onClick={() => onExpandToggle?.()}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                    width: "100%",
                    padding: "8px 0",
                    fontSize: 11,
                    fontWeight: 500,
                    color: t.expandBtnColor,
                    background: "transparent",
                    borderTop: "none",
                    borderRight: "none",
                    borderBottom: "none",
                    borderLeft: "none",
                    cursor: "pointer",
                    transition: "color 0.2s ease",
                    letterSpacing: "0.3px",
                    textTransform: "uppercase",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.color = t.accent;
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.color = t.expandBtnColor;
                }}
            >
                {expanded ? "Less" : "Details"}
                {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>

            {/* Bottom glow */}
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 70,
                    pointerEvents: "none",
                    borderRadius: "0 0 16px 16px",
                    background: `linear-gradient(to top, ${t.glow} 0%, transparent 100%)`,
                }}
            />
        </div>
    );
};

export default OverviewDataCard;