"use client"

import {
    Video,
    ShoppingBag,
    Store,
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingCart,
    BarChart3,
    Sparkles,
} from "lucide-react";
import { PlatformMetrics } from "@/app/(routes)/(protected)/sales/page";
import { useState } from "react";
import {
    useAnalysticsSales,
    useAnalyticsMetadata,
    useAnalyticsSalesHistoricalData,
} from "../../tanstack/mock-analytics-tanstack";
import {
    AnalysisTimeFrame,
    AnalyticsType,
} from "../../../data/model/analytics-entity";
import AnalyticsSalesTable from "../components/analytics/analytics-sales-table";
import {
    formatCurrency,
    getDataDescription,
} from "@/src/core/constant/helper";
import { SalesOverviewChart } from "../components/sales/sales-overview-chart";
import DataCard, { type CardVariant } from "@/src/core/shared/view/components/data-card";
import { PageSection, PageHeader } from "@/src/core/shared/view/components/page-section";

const timeframes = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
];

const platformColors: Record<string, string> = {
    tiktok: "#FF0066",
    shopee: "#EE4D2D",
    shopify: "#22C55E",
    physical: "#2D9CDB",
};

export const OverviewDashboardScreen = () => {
    const [timeframe, setTimeframe] = useState("daily");
    const [selectedYear, setSelectedYear] = useState("2025");
    const [selectedQuarter, setSelectedQuarter] = useState("Q1");

    const { data, isLoading } = useAnalyticsMetadata(
        timeframe as AnalysisTimeFrame
    );

    const { data: salesData, isLoading: salesLoading } =
        useAnalyticsSalesHistoricalData({
            year: selectedYear,
            quarter: selectedQuarter,
        });

    const { data: salesByPlatform } = useAnalysticsSales();

    const totalData = data?.find((item) => item.type === AnalyticsType.TOTAL);
    const totalSales = totalData?.total_sales ?? 0;
    const totalOrders = totalData?.total_orders ?? 0;
    const avgOrderValue = Number(totalData?.total_average_order_value ?? 0);

    const statCards: {
        title: string;
        value: string;
        icon: React.ComponentType<{ className?: string }>;
        trend: string;
        trendUp: boolean;
        description: string;
        variant: CardVariant;
    }[] = [
        {
            title: "Total Revenue",
            value: formatCurrency(totalSales),
            icon: DollarSign,
            trend: "+12.5%",
            trendUp: true,
            description: "vs last period",
            variant: "blue",
        },
        {
            title: "Total Orders",
            value: totalOrders.toLocaleString(),
            icon: ShoppingCart,
            trend: "+8.2%",
            trendUp: true,
            description: "vs last period",
            variant: "emerald",
        },
        {
            title: "Avg. Order Value",
            value: formatCurrency(avgOrderValue),
            icon: BarChart3,
            trend: "-2.4%",
            trendUp: false,
            description: "vs last period",
            variant: "violet",
        },
        {
            title: "Platforms Active",
            value: "4",
            icon: Store,
            trend: "Stable",
            trendUp: true,
            description: "All connected",
            variant: "amber",
        },
    ];

    const platformMetrics: PlatformMetrics[] = [
        {
            platform: "tiktok",
            dailySales: data?.find((i) => i.type === AnalyticsType.TIKTOK)?.total_sales || 0,
            orderCount: data?.find((i) => i.type === AnalyticsType.TIKTOK)?.total_orders || 0,
            averageOrderValue: Number(data?.find((i) => i.type === AnalyticsType.TIKTOK)?.average_order_value) || 0,
            conversionRate: 4.2,
            icon: <Video className="w-5 h-5 text-pink-500" />,
            trend: { percentage: 15.8, direction: "up" },
        },
        {
            platform: "shopee",
            dailySales: data?.find((i) => i.type === AnalyticsType.SHOPEE)?.total_sales || 0,
            orderCount: data?.find((i) => i.type === AnalyticsType.SHOPEE)?.total_orders || 0,
            averageOrderValue: Number(data?.find((i) => i.type === AnalyticsType.SHOPEE)?.average_order_value) || 0,
            conversionRate: Number(data?.find((i) => i.type === AnalyticsType.SHOPEE)?.conversion_rate) || 0,
            icon: <ShoppingBag className="w-5 h-5 text-orange-500" />,
            trend: { percentage: 8.3, direction: "up" },
        },
        {
            platform: "shopify",
            dailySales: data?.find((i) => i.type === AnalyticsType.SHOPIFY)?.total_sales || 0,
            orderCount: data?.find((i) => i.type === AnalyticsType.SHOPIFY)?.total_orders || 0,
            averageOrderValue: Number(data?.find((i) => i.type === AnalyticsType.SHOPIFY)?.average_order_value) || 0,
            conversionRate: 2.9,
            icon: <Store className="w-5 h-5 text-green-500" />,
            trend: { percentage: 2.1, direction: "down" },
        },
        {
            platform: "physical",
            dailySales: data?.find((i) => i.type === AnalyticsType.PHYSICAL)?.total_sales || 0,
            orderCount: data?.find((i) => i.type === AnalyticsType.PHYSICAL)?.total_orders || 0,
            averageOrderValue: Number(data?.find((i) => i.type === AnalyticsType.PHYSICAL)?.average_order_value) || 0,
            conversionRate: 2.9,
            icon: <Store className="w-5 h-5 text-blue-500" />,
            trend: { percentage: 2.1, direction: "down" },
        },
    ];

    return (
        <div className="space-y-10">
            <PageHeader
                title="Overview"
                description={getDataDescription(timeframe)}
                actions={
                    <div className="flex items-center gap-2 bg-white dark:bg-card rounded-xl border border-border p-1 shadow-sm">
                        {timeframes.map((tf) => (
                            <button
                                key={tf.value}
                                onClick={() => setTimeframe(tf.value)}
                                className={`
                                    px-4 py-2 text-[13px] font-medium rounded-lg transition-all duration-200
                                    ${timeframe === tf.value
                                        ? "bg-foreground text-background shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                    }
                                `}
                            >
                                {tf.label}
                            </button>
                        ))}
                    </div>
                }
            />

            {/* Hero: Total cumulative */}
            <PageSection
                title="Total performance"
                description="Combined revenue and orders across all connected platforms for the selected period."
            >
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-foreground via-foreground to-foreground/95 dark:from-[hsl(222,47%,12%)] dark:via-[hsl(222,47%,10%)] dark:to-[hsl(222,47%,8%)] p-6 sm:p-8 text-background dark:text-foreground ring-1 ring-white/10">
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "24px 24px" }} />
                    <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                        <div>
                            <p className="text-sm font-medium opacity-80 mb-1">All platforms combined</p>
                            {isLoading ? (
                                <div className="h-12 w-64 bg-white/10 rounded-xl animate-pulse" />
                            ) : (
                                <p className="text-4xl sm:text-5xl font-bold tracking-tight">
                                    {formatCurrency(totalSales)}
                                </p>
                            )}
                            <p className="text-xs opacity-60 mt-2">Cumulative sales this period</p>
                        </div>
                        <div className="flex flex-wrap gap-8 lg:gap-12">
                            <div>
                                <p className="text-xs opacity-60 uppercase tracking-wider mb-1">Total orders</p>
                                {isLoading ? <div className="h-8 w-20 bg-white/10 rounded animate-pulse" /> : <p className="text-2xl font-bold">{totalOrders.toLocaleString()}</p>}
                            </div>
                            <div className="w-px bg-white/20 hidden sm:block" />
                            <div>
                                <p className="text-xs opacity-60 uppercase tracking-wider mb-1">Avg. order value</p>
                                {isLoading ? <div className="h-8 w-24 bg-white/10 rounded animate-pulse" /> : <p className="text-2xl font-bold">RM {avgOrderValue.toFixed(2)}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </PageSection>

            {/* Insight line */}
            {!isLoading && totalSales > 0 && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <p className="text-sm text-emerald-800 dark:text-emerald-200">
                        Revenue is up <span className="font-semibold">12%</span> vs last period across all platforms. TikTok and Shopee are driving the most growth.
                    </p>
                </div>
            )}

            {/* Key metrics */}
            <PageSection
                title="Key metrics"
                description="Snapshot of revenue, orders, and average order value with period-over-period comparison."
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((card) => (
                        <DataCard
                            key={card.title}
                            icon={<card.icon className="w-5 h-5" />}
                            title={card.title}
                            value={isLoading ? "" : card.value}
                            trending={card.trendUp ? "up" : "down"}
                            change={card.trend}
                            description={card.description}
                            variant={card.variant}
                            isLoading={isLoading}
                        />
                    ))}
                </div>
            </PageSection>

            {/* Sales over time + Recent activity */}
            <PageSection
                title="Sales over time"
                description="Revenue by platform across months. Use the chart controls to switch view or change quarter."
            >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <SalesOverviewChart
                            data={salesData || []}
                            selectedYear={selectedYear}
                            selectedQuarter={selectedQuarter}
                            onYearChange={setSelectedYear}
                            onQuarterChange={setSelectedQuarter}
                            isLoading={salesLoading}
                            isAdmin={true}
                        />
                    </div>
                    <div className="lg:col-span-1">
                        <AnalyticsSalesTable
                            data={salesByPlatform || []}
                            isLimit={true}
                        />
                    </div>
                </div>
            </PageSection>

            {/* By platform */}
            <PageSection
                title="By platform"
                description="Revenue and order breakdown per sales channel. Compare performance at a glance."
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {isLoading
                        ? Array(4).fill(0).map((_, i) => <PlatformCardSkeleton key={i} />)
                        : platformMetrics.map((p) => (
                            <PlatformCard key={p.platform} platform={p} />
                        ))}
                </div>
            </PageSection>
        </div>
    );
}

function PlatformCard({ platform }: { platform: PlatformMetrics }) {
    const color = platformColors[platform.platform] || "#6B7280";

    return (
        <div className="group bg-white dark:bg-card rounded-2xl overflow-hidden ring-1 ring-border/60 hover:ring-2 hover:ring-border hover:shadow-xl hover:shadow-black/[0.04] transition-all duration-300">
            <div className="h-1.5" style={{ backgroundColor: color }} />
            <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
                            {platform.icon}
                        </div>
                        <span className="text-sm font-semibold capitalize">{platform.platform}</span>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${platform.trend.direction === "up" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400" : "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400"}`}>
                        {platform.trend.direction === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {platform.trend.percentage}%
                    </span>
                </div>
                <p className="text-2xl font-bold tracking-tight mb-4">{formatCurrency(platform.dailySales)}</p>
                <div className="flex items-center gap-4 text-[13px]">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color, opacity: 0.6 }} />
                        <span className="text-muted-foreground"><span className="font-semibold text-foreground">{platform.orderCount.toLocaleString()}</span> orders</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color, opacity: 0.35 }} />
                        <span className="text-muted-foreground"><span className="font-semibold text-foreground">{formatCurrency(platform.averageOrderValue)}</span> AOV</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PlatformCardSkeleton() {
    return (
        <div className="bg-white dark:bg-card rounded-2xl overflow-hidden ring-1 ring-border/60">
            <div className="h-1.5 bg-muted animate-pulse" />
            <div className="p-5">
                <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
                    <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-8 w-32 bg-muted rounded animate-pulse mb-4" />
                <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            </div>
        </div>
    );
}

export default OverviewDashboardScreen;
