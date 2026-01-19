"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesOverviewChart } from "../components/sales/sales-overview-chart";

import { Video } from "lucide-react";
import { ShoppingBag } from "lucide-react";
import { Store } from "lucide-react";
import { PlatformMetrics } from "@/app/(routes)/(protected)/sales/page";
import { SalesSummaryCards } from "../components/sales/sales-summary-list";
import { TopPerformingSkusList } from "../components/sku/top-performing-sku-list";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import { TopPerformingSkusTable } from "../components/sku/top-performing-sku-table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import PlatformSalesTable from "../components/platform/platform-table";
import SkuTable from "../components/sku/sku-table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAnalysticsSales, useAnalyticsMetadata, useAnalyticsSalesHistoricalData, useAnalyticsSKU } from "../../tanstack/mock-analytics-tanstack";
import { AnalysisTimeFrame, AnalyticsType } from "../../../data/model/analytics-entity";
import AnalyticsSalesTable from "../components/analytics/analytics-sales-table";
import { formatCurrency, getDataDescription, isAdmin } from "@/src/core/constant/helper";
import { useSession } from "@/src/core/lib/dummy-session-provider";
import { Session } from "next-auth";
import TotalCumulativeCard from "../components/analytics/total-cumulative-card";

interface DatePickerProps {
    date: Date | undefined;
    onSelect: (date: Date | undefined) => void;
    placeholder: string;
}

const DatePicker = ({ date, onSelect, placeholder }: DatePickerProps) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="w-[240px] justify-start text-left font-normal"
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={onSelect}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
};

export const OverviewDashboardScreen = () => {


    const [activeTab, setActiveTab] = useState('overview');
    const router = useRouter();
    const [timeframe, setTimeframe] = useState('daily');
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();

    const [selectedYear, setSelectedYear] = useState("2025")
    const [selectedQuarter, setSelectedQuarter] = useState("Q1")

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
    const platformMetrics: PlatformMetrics[] = [
        {
            platform: 'tiktok',
            dailySales: data?.find(item => item.type === AnalyticsType.TIKTOK)?.total_sales || 0,
            orderCount: data?.find(item => item.type === AnalyticsType.TIKTOK)?.total_orders || 0,
            averageOrderValue: Number(data?.find(item => item.type === AnalyticsType.TIKTOK)?.average_order_value) || 0,
            conversionRate: 4.2,
            icon: <Video className="h-5 w-5 text-pink-500" />,
            trend: {
                percentage: 15.8,
                direction: 'up'
            }
        },
        {
            platform: 'shopee',
            dailySales: data?.find(item => item.type === AnalyticsType.SHOPEE)?.total_sales || 0,
            orderCount: data?.find(item => item.type === AnalyticsType.SHOPEE)?.total_orders || 0,
            averageOrderValue: Number(data?.find(item => item.type === AnalyticsType.SHOPEE)?.average_order_value) || 0,
            conversionRate: Number(data?.find(item => item.type === AnalyticsType.SHOPEE)?.conversion_rate) || 0,
            icon: <ShoppingBag className="h-5 w-5 text-orange-500" />,
            trend: {
                percentage: 8.3,
                direction: 'up'
            }
        },
        {
            platform: 'shopify',
            dailySales: data?.find(item => item.type === AnalyticsType.SHOPIFY)?.total_sales || 0,
            orderCount: data?.find(item => item.type === AnalyticsType.SHOPIFY)?.total_orders || 0,
            averageOrderValue: Number(data?.find(item => item.type === AnalyticsType.SHOPIFY)?.average_order_value) || 0,
            conversionRate: 2.9,
            icon: <Store className="h-5 w-5 text-green-500" />,
            trend: {
                percentage: 2.1,
                direction: 'down'
            }
        },
        {
            platform: 'physical',
            dailySales: data?.find(item => item.type === AnalyticsType.PHYSICAL)?.total_sales || 0,
            orderCount: data?.find(item => item.type === AnalyticsType.PHYSICAL)?.total_orders || 0,
            averageOrderValue: Number(data?.find(item => item.type === AnalyticsType.PHYSICAL)?.average_order_value) || 0,
            conversionRate: 2.9,
            icon: <Store className="h-5 w-5 text-blue-500" />,
            trend: {
                percentage: 2.1,
                direction: 'down'
            }
        }
    ];

    return (
        <div className="flex flex-col gap-4 w-full">



            <div className="flex items-center justify-between w-full">
                <div>
                    <h2 className="text-2xl font-bold">Overview Dashboard</h2>
                    <p className="text-muted-foreground">Track your overall sales performance and revenue</p>
                </div>

                <div className="flex items-center gap-4">
                    <Tabs value={timeframe} onValueChange={setTimeframe} className="w-fit">
                        <TabsList>
                            <TabsTrigger value="daily">Daily</TabsTrigger>
                            <TabsTrigger value="weekly">Weekly</TabsTrigger>
                            <TabsTrigger value="monthly">Monthly</TabsTrigger>
                            <TabsTrigger value="yearly">Yearly</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="flex items-center gap-2">
                        <DatePicker
                            date={startDate}
                            onSelect={setStartDate}
                            placeholder="Start date"
                        />
                        <DatePicker
                            date={endDate}
                            onSelect={setEndDate}
                            placeholder="End date"
                        />
                    </div>
                </div>

            </div>

            <TotalCumulativeCard
                totalSales={data?.find(item => item.type === AnalyticsType.TOTAL)?.total_sales || 0}
                totalOrders={data?.find(item => item.type === AnalyticsType.TOTAL)?.total_orders || 0}
                avgOrderValue={Number(data?.find(item => item.type === AnalyticsType.TOTAL)?.total_average_order_value) || 0}
                isLoading={isLoading}
            />


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                {isLoading ? (
                    Array(4).fill(0).map((_, index) => (
                        <div key={index} className="rounded-lg border p-4 flex flex-col space-y-3">
                            <div className="h-5 w-1/3 bg-gray-200 animate-pulse rounded"></div>
                            <div className="h-8 w-1/2 bg-gray-200 animate-pulse rounded"></div>
                            <div className="h-4 w-1/4 bg-gray-200 animate-pulse rounded"></div>
                            <div className="h-8 w-2/3 bg-gray-200 animate-pulse rounded"></div>

                        </div>
                    ))
                ) : (
                    platformMetrics.map((platform) => (
                        <OverviewDataCard
                            key={platform.platform}
                            platform={platform}
                            session={session as Session}
                            timeframe={timeframe as AnalysisTimeFrame}
                        />
                    ))
                )}
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
                    {/* <SalesSummaryCards /> */}
                    {/* <PlatformSalesTable /> */}
                    <AnalyticsSalesTable data={salesByPlatform || []} isLimit={true} />
                </div>

            </div>
            {/* <SkuTable data={skuData || []} isLimit={true} isLoading={skuLoading} /> */}

            {/* <div className="grid grid-cols-1 lg:grid-cols-8 gap-4 w-full">

                <div className="md:col-span-5">
                    <SkuTable data={skuData || []} isLimit={true} />
                </div>

                <div className="md:col-span-3">
                    <TopPerformingSkusList />
                </div>

            </div> */}

        </div>
    );
};

const OverviewDataCard = ({ platform, session, timeframe }: { platform: PlatformMetrics, session: Session, timeframe: AnalysisTimeFrame }) => {
    return (
        <Card key={platform.platform} className="hover:shadow-lg transition-shadow w-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center space-x-2">
                    {platform.icon}
                    <CardTitle className="text-lg capitalize">
                        {platform.platform}
                    </CardTitle>
                </div>
                {/* <Badge variant={platform.trend.direction === 'up' ? 'default' : 'secondary'}>
                    {platform.trend.direction === 'up' ? '+' : '-'}{platform.trend.percentage}%
                </Badge> */}
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <div className="flex flex-col  items-start mb-1">
                        <p className="text-sm font-medium">Daily Sales</p>
                        <p className="text-xs font-light text-muted-foreground mt-1">{getDataDescription(timeframe)}</p>
                    </div>

                    <p className="text-2xl font-bold">{formatCurrency(platform.dailySales)}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">Orders</p>
                        <p className="font-medium">{platform.orderCount.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Avg. Order Value</p>
                        <p className="font-medium">{formatCurrency(platform.averageOrderValue)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default OverviewDashboardScreen;