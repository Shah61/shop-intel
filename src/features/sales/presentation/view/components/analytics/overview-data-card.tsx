"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency } from "@/src/core/constant/helper";
import { SmallLoader, TinyLoader } from "@/components/ui/shop-intel-loader";

interface OverviewDataCardProps {
    platform?: string;
    dailySales?: number;
    orderCount?: number;
    averageOrderValue?: number;
    isLoading: boolean;
    expanded?: boolean;
    onExpandToggle?: () => void;
    /** When set with customIcon, renders like platform cards but with your own title, primary line, and expand stats (Sales overview pattern). */
    customTitle?: string;
    customIcon?: ReactNode;
    metricSubtitle?: string;
    primaryValueDisplay?: string;
    expandLabel1?: string;
    expandValue1Display?: string;
    expandLabel2?: string;
    expandValue2Display?: string;
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
              iconWell: config.lightIconWell,
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
                padding: "18px 20px 14px 20px",
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
        flexWrap: "wrap",
    }}
            >
                <div
                    className="platform-icon relative overflow-hidden"
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 11,
                        background: t.iconWell,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: `0 2px 12px ${t.glow}`,
                        border: `1px solid rgba(var(--preset-primary-rgb), ${isDark ? 0.12 : 0.08})`,
                    }}
                >
                    {isCustom ? (
                        <span className="flex h-[34px] w-[34px] items-center justify-center text-[var(--preset-primary)]">
                            {customIcon}
                        </span>
                    ) : (
                        <Image
                            src={config.iconSrc}
                            alt={`${config.label} logo`}
                            width={40}
                            height={40}
                            className="h-[34px] w-[34px] object-contain"
                            sizes="40px"
                        />
                    )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: t.title, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {displayTitle}
    </span>
    <span style={{ fontSize: 11, color: t.subtitle, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
    {displayMetricSubtitle}
    </span>
</div>

{/* Inline stats beside title */}
{!isLoading && (
    <div style={{ display: "flex", gap: 16, alignItems: "center", flexShrink: 0, marginLeft: "auto" }}>
        <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: t.statLabel, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                {ex1L}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: t.statValue }}>
                {ex1V}
            </div>
        </div>
        <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: t.statLabel, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                {ex2L}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: t.statValue }}>
                {ex2V}
            </div>
        </div>
    </div>
)}

            </div>

            {/* Sales amount */}
            <div>
                {isLoading ? (
                    <div
                        className="flex w-full items-center justify-center"
                        style={{ minHeight: 108, paddingTop: 4, paddingBottom: 4 }}
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
                            fontSize: 24,
                            fontWeight: 700,
                            color: t.salesAmount,
                            margin: "6px 0 0 0",
                            letterSpacing: "-0.5px",
                            lineHeight: 1,
                            fontFamily: "'Outfit', sans-serif",
                        }}
                    >
                        {displayPrimary}
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