"use client"

import { SalesOverviewChart } from "../components/sales/sales-overview-chart";
import { Video } from "lucide-react";
import { ShoppingBag } from "lucide-react";
import { Store } from "lucide-react";
export interface PlatformMetrics {
    platform: string;
    dailySales: number;
    orderCount: number;
    averageOrderValue: number;
    conversionRate: number;
    icon: React.ReactNode;
    trend: { percentage: number; direction: "up" | "down" };
}

import { useState } from "react";
import DateRangePickerPro, { type DateRange, type Timeframe } from "@/components/ui/date-range-picker-pro";
import { startOfMonth, endOfMonth } from "date-fns";
import { useRouter } from "next/navigation";
import { useAnalysticsSales, useAnalyticsMetadata, useAnalyticsSalesHistoricalData, useAnalyticsSKU } from "../../tanstack/mock-analytics-tanstack";
import { AnalysisTimeFrame, AnalyticsType } from "../../../data/model/analytics-entity";
import AnalyticsSalesTable from "../components/analytics/analytics-sales-table";
import { useSession } from "@/src/core/lib/dummy-session-provider";
import TotalCumulativeCard from "../components/analytics/total-cumulative-card";
import OverviewDataCard from "../components/analytics/overview-data-card";

export const OverviewDashboardScreen = () => {

    const [activeTab, setActiveTab] = useState('overview');
    const router = useRouter();
    const [timeframe, setTimeframe] = useState<Timeframe>('daily');
    const [dateRange, setDateRange] = useState<DateRange>(() => {
        const now = new Date();
        return { from: startOfMonth(now), to: endOfMonth(now) };
    });

    const [selectedYear, setSelectedYear] = useState("2025")
    const [selectedQuarter, setSelectedQuarter] = useState("Q1")
    const [cardsExpanded, setCardsExpanded] = useState(false)

    const { data: session } = useSession();

    const {
        data,
        isLoading,
        error
    } = useAnalyticsMetadata(timeframe as AnalysisTimeFrame);

    const {
        data: salesData,
        isLoading: salesLoading,
        error: salesError
    } = useAnalyticsSalesHistoricalData({
        year: selectedYear,
        quarter: selectedQuarter
    });

    const {
        data: skuData,
        isLoading: skuLoading,
        error: skuError
    } = useAnalyticsSKU();

    const {
        data: salesByPlatform,
        isLoading: salesByPlatformLoading,
        error: salesByPlatformError
    } = useAnalysticsSales();

    // Platform-specific metrics
    const platformMetrics: (PlatformMetrics & { platformKey: string })[] = [
        {
            platformKey: 'tiktok',
            platform: 'tiktok',
            dailySales: data?.find(item => item.type === AnalyticsType.TIKTOK)?.total_sales || 0,
            orderCount: data?.find(item => item.type === AnalyticsType.TIKTOK)?.total_orders || 0,
            averageOrderValue: Number(data?.find(item => item.type === AnalyticsType.TIKTOK)?.average_order_value) || 0,
            conversionRate: 4.2,
            icon: <Video className="h-4 w-4" />,
            trend: {
                percentage: 15.8,
                direction: 'up'
            }
        },
        {
            platformKey: 'shopee',
            platform: 'shopee',
            dailySales: data?.find(item => item.type === AnalyticsType.SHOPEE)?.total_sales || 0,
            orderCount: data?.find(item => item.type === AnalyticsType.SHOPEE)?.total_orders || 0,
            averageOrderValue: Number(data?.find(item => item.type === AnalyticsType.SHOPEE)?.average_order_value) || 0,
            conversionRate: Number(data?.find(item => item.type === AnalyticsType.SHOPEE)?.conversion_rate) || 0,
            icon: <ShoppingBag className="h-4 w-4" />,
            trend: {
                percentage: 8.3,
                direction: 'up'
            }
        },
        {
            platformKey: 'shopify',
            platform: 'shopify',
            dailySales: data?.find(item => item.type === AnalyticsType.SHOPIFY)?.total_sales || 0,
            orderCount: data?.find(item => item.type === AnalyticsType.SHOPIFY)?.total_orders || 0,
            averageOrderValue: Number(data?.find(item => item.type === AnalyticsType.SHOPIFY)?.average_order_value) || 0,
            conversionRate: 2.9,
            icon: <Store className="h-4 w-4" />,
            trend: {
                percentage: 2.1,
                direction: 'down'
            }
        },
        {
            platformKey: 'physical',
            platform: 'physical',
            dailySales: data?.find(item => item.type === AnalyticsType.PHYSICAL)?.total_sales || 0,
            orderCount: data?.find(item => item.type === AnalyticsType.PHYSICAL)?.total_orders || 0,
            averageOrderValue: Number(data?.find(item => item.type === AnalyticsType.PHYSICAL)?.average_order_value) || 0,
            conversionRate: 2.9,
            icon: <Store className="h-4 w-4" />,
            trend: {
                percentage: 2.1,
                direction: 'down'
            }
        }
    ];

    const greetingTitle = (() => {
        if (session?.user?.name) {
            const hour = new Date().getHours();
            const greeting =
                hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
            return `${greeting}, ${session.user.name}!`;
        }
        return "Welcome Back";
    })();

    return (
        <div className="flex flex-col gap-4 w-full">

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between w-full gap-4">
                <div>
                    <h2 className="text-2xl font-bold">{greetingTitle}</h2>
                    <p className="text-muted-foreground">Here’s your sales performance at a glance</p>
                </div>

                <DateRangePickerPro
                    value={dateRange}
                    onChange={setDateRange}
                    placeholder="Pick a date range"
                    label=""
                    timeframe={timeframe}
                    onTimeframeChange={setTimeframe}
                    className="min-w-[240px]"
                />
            </div>

            <TotalCumulativeCard
                totalSales={data?.find(item => item.type === AnalyticsType.TOTAL)?.total_sales || 0}
                totalOrders={data?.find(item => item.type === AnalyticsType.TOTAL)?.total_orders || 0}
                avgOrderValue={Number(data?.find(item => item.type === AnalyticsType.TOTAL)?.total_average_order_value) || 0}
                isLoading={isLoading}
            />

            {/* Platform cards — responsive grid */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 16,
                    width: "100%",
                }}
                className="!grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-4"
            >
                {isLoading
                    ? Array(4)
                          .fill(0)
                          .map((_, index) => (
                              <OverviewDataCard
                                  key={index}
                                  platform="tiktok"
                                  icon={<Video className="h-4 w-4" />}
                                  dailySales={0}
                                  orderCount={0}
                                  averageOrderValue={0}
                                  isLoading={true}
                                  expanded={cardsExpanded}
                                  onExpandToggle={() => setCardsExpanded((e) => !e)}
                              />
                          ))
                    : platformMetrics.map((pm) => (
                          <OverviewDataCard
                              key={pm.platformKey}
                              platform={pm.platformKey}
                              icon={pm.icon}
                              dailySales={pm.dailySales}
                              orderCount={pm.orderCount}
                              averageOrderValue={pm.averageOrderValue}
                              isLoading={false}
                              expanded={cardsExpanded}
                              onExpandToggle={() => setCardsExpanded((e) => !e)}
                          />
                      ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-8 gap-4 w-full">
                <div className="md:col-span-5">
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

                <div className="md:col-span-3">
                    <AnalyticsSalesTable data={salesByPlatform || []} isLimit={true} />
                </div>
            </div>

        </div>
    );
};

export default OverviewDashboardScreen;