"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    TrendingUp,
    DollarSign,
    Package,
    ShoppingCart,
    ArrowUp,
    ArrowDown,
    Filter,
    MoreHorizontal,
    Download,
    ShoppingBag,
    LineChart,
    BarChart3,
    Star,
    RefreshCcw,
    Users,
    Percent,
    TrendingDown,
    Clock,
    Truck,
    ChevronRight
} from "lucide-react";
import {
    LineChart as RechartsLineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    Legend,
    BarChart,
    Bar,
    Area,
    AreaChart,
    ComposedChart
} from "recharts";
import DataCard from "@/src/core/shared/view/components/data-card";
import { PageHeader, PageSection } from "@/src/core/shared/view/components/page-section";
import ShopeeConversionTable from "../components/shopee/shopee-conversion-table";
import { ShopeeConversionCharts } from "../components/shopee/shopee-conversion-charts";
import { ShopeeTrafficCharts } from "../components/shopee/shopee-traffic-charts";
import ShopeeTrafficPieChart from "../components/shopee/shopee-traffic-pie-chart";
import { AnalysisTimeFrame } from "../../../data/model/analytics-entity";
import ShopeeSkusTable from "../components/shopee/shopee-skus-table";
import { ShopeeConversionRate, ShopeeSku } from "../../../data/model/shopee-entity";
import { useShopeeConversionRate, useShopeeMetadata } from "../../tanstack/mock-shopee-tanstack";
import { useShopeeSkus } from "../../tanstack/mock-shopee-tanstack";
import { formatCurrency, getDataDescription, getDateRangeShopee, isAdmin } from "@/src/core/constant/helper";
import { useSession } from "@/src/core/lib/dummy-session-provider";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

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
                    className="w-[200px] justify-start text-left font-normal"
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

const ShopeeDashboardScreen = () => {
    const [activeTab, setActiveTab] = useState("overview");
    const [timeframe, setTimeframe] = useState<AnalysisTimeFrame>(AnalysisTimeFrame.DAILY);
    const [currentDateRange, setCurrentDateRange] = useState(() => getDateRangeShopee());
    const [allConversionRates, setAllConversionRates] = useState<ShopeeConversionRate[]>([]);
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();

    const decrementDateRange = () => {
        setCurrentDateRange(prev => {
            const newStartTime = new Date(prev.startTime);
            const newEndTime = new Date(prev.endTime);

            // Decrease both dates by one month
            newStartTime.setMonth(newStartTime.getMonth() - 1);
            newEndTime.setMonth(newEndTime.getMonth() - 1);

            return {
                startTime: newStartTime.toISOString(),
                endTime: newEndTime.toISOString()
            };
        });
    };

    const { data: session } = useSession();

    const {
        data: skus,
        isLoading: isLoadingSkus,
        error: errorSkus } = useShopeeSkus({
            startTime: currentDateRange.startTime,
            endTime: currentDateRange.endTime,
            period: "month",
            limit: 10
        });

    const {
        data: metadata,
        isLoading: isLoadingMetadata,
        error: errorMetadata
    } = useShopeeMetadata({
        type: timeframe
    });


    const {
        data: conversionRate,
        isLoading: isLoadingConversionRate,
        error: errorConversionRate } = useShopeeConversionRate({
            startTime: currentDateRange.startTime,
            endTime: currentDateRange.endTime
        });

    useEffect(() => {
        if (conversionRate) {
            setAllConversionRates(prev => {
                const combined = [...prev, ...conversionRate];

                const unique = Array.from(
                    new Map(combined.map(item => [item.date, item])).values()
                );

                return unique.sort((a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                );
            });
        }
    }, [conversionRate]);

    const financialMetrics = [
        {
            title: "Products",
            value: 10,
            change: "+8.3%",
            trending: "up",
            icon: <DollarSign className="h-5 w-5 text-orange-500" />,
            isLoading: isLoadingMetadata,
            description: getDataDescription(timeframe)
        },
        {
            title: "Total Sales",
            value: formatCurrency(Number(metadata?.sales || 0)),
            change: "+12.5%",
            trending: "up",
            icon: <ShoppingBag className="h-5 w-5 text-orange-500" />,
            isLoading: isLoadingMetadata,
            description: getDataDescription(timeframe)
        },
        {
            title: "Orders",
            value: metadata?.orders || 0,
            change: "-2.8%",
            trending: "down",
            icon: <ShoppingCart className="h-5 w-5 text-orange-500" />,
            isLoading: isLoadingMetadata,
            description: getDataDescription(timeframe)
        },
        {
            title: "Conversion Rate",
            value: (metadata?.conversionRate ?? 0).toFixed(2),
            change: "+0.5%",
            trending: "up",
            icon: <Percent className="h-5 w-5 text-orange-500" />,
            isLoading: isLoadingMetadata,
            description: getDataDescription(timeframe)
        }
    ];


    const mainTabs = [
        { id: "overview", label: "Overview" },
        { id: "campaigns", label: "Conversion" },
        { id: "skus", label: "SKUs" },
    ];
    const timeframePills = [
        { value: AnalysisTimeFrame.DAILY, label: "Daily" },
        { value: AnalysisTimeFrame.WEEKLY, label: "Weekly" },
        { value: AnalysisTimeFrame.MONTHLY, label: "Monthly" },
        { value: AnalysisTimeFrame.YEARLY, label: "Yearly" },
    ];

    return (
        <div className="space-y-8 w-full">
            <PageHeader
                title="Shopee"
                description="Track your Shopee store performance, conversion, and SKUs."
                actions={
                    <div className="flex items-center gap-2">
                        <DatePicker date={startDate} onSelect={setStartDate} placeholder="Start date" />
                        <DatePicker date={endDate} onSelect={setEndDate} placeholder="End date" />
                    </div>
                }
            />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="rounded-2xl border border-border bg-white dark:bg-card p-1.5 shadow-sm w-fit">
                    <div className="flex gap-1">
                        {mainTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-all ${activeTab === tab.id ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-accent/60"}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                {activeTab === "overview" && (
                    <div className="flex items-center gap-2 bg-white dark:bg-card rounded-xl border border-border p-1 shadow-sm">
                        {timeframePills.map((tf) => (
                            <button
                                key={tf.value}
                                onClick={() => setTimeframe(tf.value as AnalysisTimeFrame)}
                                className={`px-4 py-2 text-[13px] font-medium rounded-lg transition-all ${timeframe === tf.value ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent/50"}`}
                            >
                                {tf.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {activeTab === "overview" && (
                <div className="space-y-8 w-full">
                    <PageSection title="Key metrics" description={getDataDescription(timeframe)}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {isLoadingMetadata ? (
                            Array(4).fill(0).map((_, index) => (
                                <div key={index} className="rounded-2xl border border-border p-5 flex flex-col space-y-3 bg-white dark:bg-card">
                                    <div className="h-5 w-1/3 bg-muted animate-pulse rounded" />
                                    <div className="h-8 w-1/2 bg-muted animate-pulse rounded" />
                                    <div className="h-4 w-1/4 bg-muted animate-pulse rounded" />
                                </div>
                            ))
                        ) : (
                            financialMetrics.map((metric, index) => (
                                <DataCard
                                    key={index}
                                    icon={metric.icon}
                                    title={metric.title}
                                    value={metric.value as string | number}
                                    trending={metric.trending as "up" | "down"}
                                    change={metric.change}
                                    description={metric.description}
                                    variant="orange"
                                />
                            ))
                        )}
                    </div>
                    </PageSection>

                    <PageSection title="Conversion & charts" description="Conversion trends and recent data.">
                    <div className="grid grid-cols-1 lg:grid-cols-8 gap-4 w-full h-full">
                        <div className="md:col-span-5 col-span-6 h-full w-full">
                            <ShopeeConversionCharts />
                        </div>
                        <div className="md:col-span-3 col-span-6 h-full w-full">
                            <ShopeeConversionTable
                                onLoadMore={decrementDateRange}
                                conversionRate={conversionRate || []}
                                onSelectTap={() => {
                                    setActiveTab("campaigns")
                                }}
                                selectedTab={activeTab}
                            />
                        </div>
                    </div>
                    </PageSection>
                    <PageSection title="SKUs" description="Product SKU performance.">
                    <ShopeeSkusTable skus={skus || []} onSelectTap={() => setActiveTab("skus")} selectedTab={activeTab} />
                    </PageSection>
                </div>
            )}

            {activeTab === "campaigns" && (
                <PageSection title="Conversion data" description="Full conversion table.">
                <ShopeeConversionTable
                    conversionRate={allConversionRates}
                    onSelectTap={() => setActiveTab("campaigns")}
                    selectedTab={activeTab}
                    onLoadMore={decrementDateRange}
                />
                </PageSection>
            )}

            {activeTab === "skus" && (
                <PageSection title="SKUs" description="Product SKU list.">
                <ShopeeSkusTable skus={skus || []} onSelectTap={() => setActiveTab("skus")} selectedTab={activeTab} />
                </PageSection>
            )}
        </div>
    );
};

export default ShopeeDashboardScreen;