"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
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
import { TiktokConversionCharts } from "../components/tiktok/tiktok-conversion-charts";
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
            value: metadata?.conversionRate.toFixed(2) || 0,
            change: "+0.5%",
            trending: "up",
            icon: <Percent className="h-5 w-5 text-orange-500" />,
            isLoading: isLoadingMetadata,
            description: getDataDescription(timeframe)
        }
    ];


    return (
        <div className="flex flex-col items-start gap-4 w-full">
            <div className="flex flex-col sm:flex-row w-full justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                <div>
                    <h2 className="text-2xl font-bold">Shopee Financial Dashboard</h2>
                    <p className="text-muted-foreground">Track your Shopee store's performance and revenue</p>
                </div>

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

            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex md:flex-row flex-col w-full justify-between md:items-center items-start gap-4 mb-4">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                        <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="campaigns">Conversion</TabsTrigger>
                            <TabsTrigger value="skus">SKUs</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {
                        activeTab === "overview" && (
                            <Tabs value={timeframe} onValueChange={(value: string) => setTimeframe(value as AnalysisTimeFrame)} className="w-fit">
                                <TabsList>
                                    <TabsTrigger value={AnalysisTimeFrame.DAILY}>Daily</TabsTrigger>
                                    <TabsTrigger value={AnalysisTimeFrame.WEEKLY}>Weekly</TabsTrigger>
                                    <TabsTrigger value={AnalysisTimeFrame.MONTHLY}>Monthly</TabsTrigger>
                                    <TabsTrigger value={AnalysisTimeFrame.YEARLY}>Yearly</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        )
                    }
                </div>

                <TabsContent value="overview" className="space-y-4 w-full">
                    {/* Financial Overview Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {isLoadingMetadata ? (
                            Array(4).fill(0).map((_, index) => (
                                <div key={index} className="rounded-lg border p-4 flex flex-col space-y-3">
                                    <div className="h-5 w-1/3 bg-gray-200 animate-pulse rounded"></div>
                                    <div className="h-8 w-1/2 bg-gray-200 animate-pulse rounded"></div>
                                    <div className="h-4 w-1/4 bg-gray-200 animate-pulse rounded"></div>
                                </div>
                            ))
                        ) : (
                            financialMetrics.map((metric, index) => (
                                <DataCard key={index}
                                    icon={metric.icon}
                                    title={metric.title}
                                    value={metric.value as any}
                                    trending={metric.trending as any}
                                    change={metric.change}
                                    description={metric.description}
                                />
                            ))
                        )}

                    </div>

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
                    <div className="space-y-4 w-full">
                        <ShopeeSkusTable skus={skus || []} onSelectTap={() => {
                            setActiveTab("skus")
                        }} selectedTab={activeTab} />
                    </div>
                </TabsContent>

                <TabsContent value="campaigns" className="space-y-4 w-full">
                    <ShopeeConversionTable
                        conversionRate={allConversionRates}
                        onSelectTap={() => {
                            setActiveTab("campaigns")
                        }}
                        selectedTab={activeTab}
                        onLoadMore={decrementDateRange}
                    />
                </TabsContent>

                <TabsContent value="skus" className="space-y-4 w-full">
                    <ShopeeSkusTable
                        skus={skus || []}
                        onSelectTap={() => {
                            setActiveTab("skus")
                        }}
                        selectedTab={activeTab}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ShopeeDashboardScreen;