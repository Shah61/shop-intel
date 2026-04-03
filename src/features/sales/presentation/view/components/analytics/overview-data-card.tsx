"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { formatCurrency } from "@/src/core/constant/helper";
import { SmallLoader } from "@/components/ui/shop-intel-loader";

interface OverviewDataCardProps {
    platform?: string;
    dailySales?: number;
    orderCount?: number;
    averageOrderValue?: number;
    isLoading: boolean;
    expanded?: boolean;
    onExpandToggle?: () => void;
    customTitle?: string;
    customIcon?: ReactNode;
    metricSubtitle?: string;
    primaryValueDisplay?: string;
    expandLabel1?: string;
    expandValue1Display?: string;
    expandLabel2?: string;
    expandValue2Display?: string;
    /**
     * "platform" — compact card: icon + title + inline stats in one row, revenue below (Sales page)
     * "stat"    — hero number card: big number center-stage, pill stats at bottom (User Activity)
     * Default: "platform"
     */
    variant?: "platform" | "stat";
}

const PLATFORM_CONFIG: Record<
    string,
    {
        label: string;
        shortLabel: string;
        iconSrc: string;
        darkGlow: string;
        lightGlow: string;
        darkIconWell: string;
        lightIconWell: string;
        accentDark: string;
        accentLight: string;
    }
> = {
    tiktok: {
        label: "TikTok",
        shortLabel: "TikTok",
        iconSrc: "/images/tiktok.png",
        darkGlow: "rgba(var(--preset-primary-rgb), 0.14)",
        lightGlow: "rgba(var(--preset-primary-rgb), 0.08)",
        darkIconWell: "#ffffff",
        lightIconWell: "rgba(255,255,255,0.98)",
        accentDark: "var(--preset-lighter)",
        accentLight: "var(--preset-primary)",
    },
    shopee: {
        label: "Shopee",
        shortLabel: "Shopee",
        iconSrc: "/images/shopee.png",
        darkGlow: "rgba(var(--preset-primary-rgb), 0.14)",
        lightGlow: "rgba(var(--preset-primary-rgb), 0.08)",
        darkIconWell: "#ffffff",
        lightIconWell: "rgba(255,255,255,0.98)",
        accentDark: "var(--preset-lighter)",
        accentLight: "var(--preset-primary)",
    },
    shopify: {
        label: "Shopify",
        shortLabel: "Shopify",
        iconSrc: "/images/shopify.png",
        darkGlow: "rgba(var(--preset-primary-rgb), 0.14)",
        lightGlow: "rgba(var(--preset-primary-rgb), 0.08)",
        darkIconWell: "#ffffff",
        lightIconWell: "rgba(255,255,255,0.98)",
        accentDark: "var(--preset-lighter)",
        accentLight: "var(--preset-primary)",
    },
    physical: {
        label: "Physical Store",
        shortLabel: "Physical",
        iconSrc: "/images/physical_store.png",
        darkGlow: "rgba(var(--preset-primary-rgb), 0.14)",
        lightGlow: "rgba(var(--preset-primary-rgb), 0.08)",
        darkIconWell: "#ffffff",
        lightIconWell: "rgba(255,255,255,0.98)",
        accentDark: "var(--preset-primary)",
        accentLight: "var(--preset-primary)",
    },
};

const OverviewDataCard = ({
    platform = "tiktok",
    dailySales = 0,
    orderCount = 0,
    averageOrderValue = 0,
    isLoading,
    expanded = false,
    onExpandToggle,
    customTitle,
    customIcon,
    metricSubtitle,
    primaryValueDisplay,
    expandLabel1,
    expandValue1Display,
    expandLabel2,
    expandValue2Display,
    variant = "platform",
}: OverviewDataCardProps) => {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    const isCustom = Boolean(customTitle != null && customIcon != null);
    const config = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG.tiktok;

    const displayTitle = isCustom ? customTitle! : config.label;
    const displayMetricSubtitle = isCustom ? (metricSubtitle ?? "Revenue") : "Revenue";
    const displayPrimary = isCustom
        ? (primaryValueDisplay ?? "—")
        : formatCurrency(dailySales);
    const ex1L = isCustom ? (expandLabel1 ?? "—") : "Orders";
    const ex1V = isCustom ? (expandValue1Display ?? "—") : orderCount.toLocaleString();
    const ex2L = isCustom ? (expandLabel2 ?? "—") : "Avg. Order";
    const ex2V = isCustom ? (expandValue2Display ?? "—") : formatCurrency(averageOrderValue);

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
              iconWell: config.darkIconWell,
              accent: config.accentDark,
              pillBg: "rgba(var(--preset-primary-rgb), 0.1)",
              pillBorder: "rgba(var(--preset-primary-rgb), 0.15)",
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
              iconWell: config.lightIconWell,
              accent: config.accentLight,
              pillBg: "rgba(var(--preset-primary-rgb), 0.06)",
              pillBorder: "rgba(var(--preset-primary-rgb), 0.1)",
          };

    /* ═══════════════════════════════════════════════════════════
       VARIANT: "stat" — User Activity style
       Icon + title → Big hero number → Divider → Pill stats
       ═══════════════════════════════════════════════════════════ */
    if (variant === "stat") {
        return (
            <div
                className="overview-data-card"
                style={{
                    background: t.cardBg,
                    borderRadius: 16,
                    border: `1px solid ${t.cardBorder}`,
                    padding: "16px 18px",
                    display: "flex",
                    flexDirection: "column",
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
                {/* Row 1: Icon + Title + Subtitle */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <div
                        className="platform-icon relative overflow-hidden"
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: t.iconWell,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            boxShadow: `0 2px 10px ${t.glow}`,
                            border: `1px solid rgba(var(--preset-primary-rgb), ${isDark ? 0.12 : 0.08})`,
                        }}
                    >
                        {isCustom ? (
                            <span className="flex h-[28px] w-[28px] items-center justify-center text-[var(--preset-primary)]">
                                {customIcon}
                            </span>
                        ) : (
                            <Image
                                src={config.iconSrc}
                                alt={`${config.label} logo`}
                                width={36}
                                height={36}
                                className="h-[28px] w-[28px] object-contain"
                                sizes="36px"
                            />
                        )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: t.title, lineHeight: 1.2, display: "block" }}>
                            {displayTitle}
                        </span>
                        <span style={{ fontSize: 10, color: t.subtitle, lineHeight: 1.3 }}>
                            {displayMetricSubtitle}
                        </span>
                    </div>
                </div>

                {/* Row 2: Hero number */}
                {isLoading ? (
                    <div
                        className="flex w-full items-center justify-center"
                        style={{ minHeight: 56, paddingBottom: 8 }}
                    >
                        <SmallLoader
                            label="Fetching"
                            size="large"
                            labelColor={t.subtitle}
                            centerPulseColor="rgba(var(--preset-primary-rgb), 0.38)"
                            className="!py-0"
                        />
                    </div>
                ) : (
                    <p
                        className="platform-sales-amount"
                        style={{
                            fontSize: 32,
                            fontWeight: 700,
                            color: t.salesAmount,
                            margin: "0 0 14px 0",
                            letterSpacing: "-0.5px",
                            lineHeight: 1,
                            fontFamily: "'Outfit', sans-serif",
                        }}
                    >
                        {displayPrimary}
                    </p>
                )}

                {/* Row 3: Divider */}
                <div style={{ width: "100%", height: 1, background: t.divider, marginBottom: 12 }} />

                {/* Row 4: Pill stats side by side */}
                {!isLoading && (
                    <div style={{ display: "flex", gap: 8 }}>
                        <div
                            style={{
                                flex: 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6,
                                padding: "7px 10px",
                                borderRadius: 10,
                                background: t.pillBg,
                                border: `1px solid ${t.pillBorder}`,
                            }}
                        >
                            <span style={{ fontSize: 9, color: t.statLabel, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.3px" }}>
                                {ex1L}
                            </span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: t.statValue }}>
                                {ex1V}
                            </span>
                        </div>
                        <div
                            style={{
                                flex: 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6,
                                padding: "7px 10px",
                                borderRadius: 10,
                                background: t.pillBg,
                                border: `1px solid ${t.pillBorder}`,
                            }}
                        >
                            <span style={{ fontSize: 9, color: t.statLabel, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.3px" }}>
                                {ex2L}
                            </span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: t.statValue }}>
                                {ex2V}
                            </span>
                        </div>
                    </div>
                )}

                {/* Bottom glow */}
                <div
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 50,
                        pointerEvents: "none",
                        borderRadius: "0 0 16px 16px",
                        background: `linear-gradient(to top, ${t.glow} 0%, transparent 100%)`,
                    }}
                />
            </div>
        );
    }

    /* ═══════════════════════════════════════════════════════════
       VARIANT: "platform" (default) — Sales page style
       Compact: icon + title + inline stats in one row, revenue below
       ═══════════════════════════════════════════════════════════ */
    return (
        <div
            className="overview-data-card"
            style={{
                background: t.cardBg,
                borderRadius: 14,
                border: `1px solid ${t.cardBorder}`,
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
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
            {/* Top section: Icon + Title row */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                    className="platform-icon relative overflow-hidden"
                    style={{
                        width: 34,
                        height: 34,
                        borderRadius: 9,
                        background: t.iconWell,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: `0 2px 10px ${t.glow}`,
                        border: `1px solid rgba(var(--preset-primary-rgb), ${isDark ? 0.12 : 0.08})`,
                    }}
                >
                    {isCustom ? (
                        <span className="flex h-[26px] w-[26px] items-center justify-center text-[var(--preset-primary)]">
                            {customIcon}
                        </span>
                    ) : (
                        <Image
                            src={config.iconSrc}
                            alt={`${config.label} logo`}
                            width={34}
                            height={34}
                            className="h-[26px] w-[26px] object-contain"
                            sizes="34px"
                        />
                    )}
                </div>

                {/* Title + subtitle */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <span
                        style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: t.title,
                            lineHeight: 1.2,
                            whiteSpace: "normal",
wordBreak: "break-word",
display: "-webkit-box",
WebkitLineClamp: 2,
WebkitBoxOrient: "vertical" as const,
overflow: "hidden",
                        }}
                    >
                        {displayTitle}
                    </span>
                    <span style={{ fontSize: 10, color: t.subtitle, lineHeight: 1.3 }}>
                        {displayMetricSubtitle}
                    </span>
                </div>

                {/* Inline stats — right side, uses container query-like approach via flex wrap */}
                {!isLoading && (
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 8, color: t.statLabel, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.3px", lineHeight: 1.2 }}>
                                {ex1L}
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: t.statValue, lineHeight: 1.3 }}>
                                {ex1V}
                            </div>
                        </div>
                        <div style={{ width: 1, height: 20, background: t.divider, flexShrink: 0 }} />
                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 8, color: t.statLabel, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.3px", lineHeight: 1.2 }}>
                                {ex2L}
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: t.statValue, lineHeight: 1.3 }}>
                                {ex2V}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Revenue amount */}
            <div>
                {isLoading ? (
                    <div
                        className="flex w-full items-center justify-center"
                        style={{ minHeight: 40, paddingTop: 2, paddingBottom: 2 }}
                    >
                        <SmallLoader
                            label="Fetching"
                            size="large"
                            labelColor={t.subtitle}
                            centerPulseColor="rgba(var(--preset-primary-rgb), 0.38)"
                            className="!py-0"
                        />
                    </div>
                ) : (
                    <p
                        className="platform-sales-amount"
                        style={{
                            fontSize: 20,
                            fontWeight: 700,
                            color: t.salesAmount,
                            margin: "2px 0 0 0",
                            letterSpacing: "-0.5px",
                            lineHeight: 1,
                            fontFamily: "'Outfit', sans-serif",
                        }}
                    >
                        {displayPrimary}
                    </p>
                )}
            </div>

            {/* Bottom glow */}
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 50,
                    pointerEvents: "none",
                    borderRadius: "0 0 14px 14px",
                    background: `linear-gradient(to top, ${t.glow} 0%, transparent 100%)`,
                }}
            />
        </div>
    );
};

export default OverviewDataCard;