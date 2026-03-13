"use client";

import { useState, useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, ShoppingBag, ShoppingCart, Percent } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ShopeeConversionTable from "../components/shopee/shopee-conversion-table";
import { ShopeeConversionCharts } from "../components/shopee/shopee-conversion-charts";
import ShopeeSkusTable from "../components/shopee/shopee-skus-table";
import { ShopeeConversionRate } from "../../../data/model/shopee-entity";
import { useShopeeConversionRate, useShopeeMetadata, useShopeeSkus } from "../../tanstack/mock-shopee-tanstack";
import { formatCurrency, getDateRangeShopee } from "@/src/core/constant/helper";
import { useSession } from "@/src/core/lib/dummy-session-provider";
import DateRangePickerPro, { type DateRange, type Timeframe } from "@/components/ui/date-range-picker-pro";
import { startOfMonth, endOfMonth } from "date-fns";

interface ShopeeMetricCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    subtitle: string;
    isLoading: boolean;
}

function ShopeeMetricCard({ icon, label, value, subtitle, isLoading }: ShopeeMetricCardProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    const t = useMemo(() => {
        if (isDark) {
            return {
                cardBg: "linear-gradient(135deg, rgba(26, 34, 44, 0.9), rgba(35, 45, 56, 0.85))",
                cardBorder: "1px solid rgba(var(--preset-primary-rgb), 0.12)",
                glow: "rgba(var(--preset-primary-rgb), 0.08)",
                iconBg: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))",
                title: "#fafafa",
                subtitle: "#a1a1aa",
                amount: "#fff",
            };
        }
        return {
            cardBg: "linear-gradient(135deg, rgba(250, 247, 255, 0.95), rgba(243, 237, 255, 0.85))",
            cardBorder: "1px solid rgba(var(--preset-primary-rgb), 0.1)",
            glow: "rgba(var(--preset-primary-rgb), 0.05)",
            iconBg: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))",
            title: "#18181b",
            subtitle: "#71717a",
            amount: "#18181b",
        };
    }, [isDark]);

    return (
        <div
            style={{
                background: t.cardBg,
                borderRadius: 20,
                border: t.cardBorder,
                padding: "20px 22px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
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
                    top: -40,
                    right: -40,
                    width: 120,
                    height: 120,
                    background: `radial-gradient(circle, ${t.glow} 0%, transparent 70%)`,
                    pointerEvents: "none",
                }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
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
                    <span style={{ fontSize: 14, fontWeight: 600, color: t.title }}>{label}</span>
                    <span style={{ fontSize: 11, color: t.subtitle }}>{subtitle}</span>
                </div>
            </div>
            {isLoading ? (
                <Skeleton style={{ height: 32, width: 120 }} />
            ) : (
                <p style={{ fontSize: 28, fontWeight: 700, color: t.amount, margin: 0, letterSpacing: "-0.5px", lineHeight: 1 }}>
                    {value}
                </p>
            )}
        </div>
    );
}

const ShopeeDashboardScreen = () => {
    const [activeTab, setActiveTab] = useState("overview");
    const [timeframe, setTimeframe] = useState<Timeframe>("daily");
    const [dateRange, setDateRange] = useState<DateRange>(() => {
        const now = new Date();
        return { from: startOfMonth(now), to: endOfMonth(now) };
    });
    const [currentDateRange, setCurrentDateRange] = useState(() => getDateRangeShopee());
    const [allConversionRates, setAllConversionRates] = useState<ShopeeConversionRate[]>([]);

    const decrementDateRange = () => {
        setCurrentDateRange(prev => {
            const newStartTime = new Date(prev.startTime);
            const newEndTime = new Date(prev.endTime);
            newStartTime.setMonth(newStartTime.getMonth() - 1);
            newEndTime.setMonth(newEndTime.getMonth() - 1);
            return { startTime: newStartTime.toISOString(), endTime: newEndTime.toISOString() };
        });
    };

    const { data: session } = useSession();

    const { data: skus } = useShopeeSkus({
        startTime: currentDateRange.startTime,
        endTime: currentDateRange.endTime,
        period: "month",
        limit: 10,
    });

    const { data: metadata, isLoading: isLoadingMetadata } = useShopeeMetadata({
        type: timeframe as any,
    });

    const { data: conversionRate } = useShopeeConversionRate({
        startTime: currentDateRange.startTime,
        endTime: currentDateRange.endTime,
    });

    useEffect(() => {
        if (conversionRate) {
            setAllConversionRates(prev => {
                const combined = [...prev, ...conversionRate];
                const unique = Array.from(new Map(combined.map(item => [item.date, item])).values());
                return unique.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            });
        }
    }, [conversionRate]);

    const financialMetrics = [
        { label: "Products", value: 10, subtitle: "Total listed", icon: <DollarSign className="h-4 w-4" /> },
        { label: "Total Sales", value: formatCurrency(Number(metadata?.sales || 0)), subtitle: "Revenue", icon: <ShoppingBag className="h-4 w-4" /> },
        { label: "Orders", value: metadata?.orders || 0, subtitle: "Total orders", icon: <ShoppingCart className="h-4 w-4" /> },
        { label: "Conversion Rate", value: `${metadata?.conversionRate?.toFixed(2) || 0}%`, subtitle: "Visitor to buyer", icon: <Percent className="h-4 w-4" /> },
    ];

    return (
        <div className="platform-dashboard-screen flex flex-col items-start gap-4 w-full">
            <div className="platform-dashboard-header flex flex-col lg:flex-row w-full justify-between items-start lg:items-center gap-3">
                <div>
                    <h2 className="text-2xl font-bold">Shopee Financial Dashboard</h2>
                    <p className="text-muted-foreground">Shopee metrics & performance analysis</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <DateRangePickerPro
                        value={dateRange}
                        onChange={setDateRange}
                        placeholder="Pick a date range"
                        label=""
                        timeframe={timeframe}
                        onTimeframeChange={setTimeframe}
                        className="min-w-[200px]"
                    />
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="platform-dashboard-tabs w-auto">
                        <TabsList className="platform-dashboard-tabs-list h-8 rounded-lg bg-muted/80 p-0.5">
                            <TabsTrigger value="overview" className="platform-dashboard-tabs-trigger rounded-md px-3 py-1.5 text-sm data-[state=active]:bg-[var(--preset-primary)] data-[state=active]:text-white data-[state=active]:shadow-sm">Overview</TabsTrigger>
                            <TabsTrigger value="campaigns" className="platform-dashboard-tabs-trigger rounded-md px-3 py-1.5 text-sm data-[state=active]:bg-[var(--preset-primary)] data-[state=active]:text-white data-[state=active]:shadow-sm">Conversion</TabsTrigger>
                            <TabsTrigger value="skus" className="platform-dashboard-tabs-trigger rounded-md px-3 py-1.5 text-sm data-[state=active]:bg-[var(--preset-primary)] data-[state=active]:text-white data-[state=active]:shadow-sm">SKUs</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            {activeTab === "overview" && (
                <div className="platform-dashboard-overview flex flex-col gap-4 w-full">
                    <div
                        className="platform-dashboard-metrics grid w-full gap-4 !grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-4"
                        style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
                    >
                        {financialMetrics.map((m, i) => (
                            <ShopeeMetricCard
                                key={i}
                                icon={m.icon}
                                label={m.label}
                                value={m.value}
                                subtitle={m.subtitle}
                                isLoading={isLoadingMetadata}
                            />
                        ))}
                    </div>
                    <div className="platform-dashboard-charts grid grid-cols-1 lg:grid-cols-8 gap-4 w-full h-full">
                        <div className="lg:col-span-5 h-full w-full">
                            <ShopeeConversionCharts />
                        </div>
                        <div className="lg:col-span-3 h-full w-full">
                            <ShopeeConversionTable
                                onLoadMore={decrementDateRange}
                                conversionRate={conversionRate || []}
                                onSelectTap={() => setActiveTab("campaigns")}
                                selectedTab={activeTab}
                            />
                        </div>
                    </div>
                    <div className="platform-dashboard-skus">
                        <div className="platform-dashboard-sku-table">
                            <ShopeeSkusTable
                                skus={skus || []}
                                onSelectTap={() => setActiveTab("skus")}
                                selectedTab={activeTab}
                            />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "campaigns" && (
                <div className="space-y-4 w-full">
                    <ShopeeConversionTable
                        conversionRate={allConversionRates}
                        onSelectTap={() => setActiveTab("campaigns")}
                        selectedTab={activeTab}
                        onLoadMore={decrementDateRange}
                    />
                </div>
            )}

            {activeTab === "skus" && (
                <div className="space-y-4 w-full">
                    <ShopeeSkusTable
                        skus={skus || []}
                        onSelectTap={() => setActiveTab("skus")}
                        selectedTab={activeTab}
                    />
                </div>
            )}
        </div>
    );
};

export default ShopeeDashboardScreen;
