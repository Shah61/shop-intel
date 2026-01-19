"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Package,
    ShoppingCart,
    Percent,
} from "lucide-react";
import DataCard from "@/src/core/shared/view/components/data-card";
import { TiktokConversionCharts } from "../components/tiktok/tiktok-conversion-charts";
import TiktokConversionTable from "../components/tiktok/tiktok-conversion-table";
import { tiktokConversionRateQuery, tiktokDashboardQuery, tiktokSkuListQuery, tiktokSkusQuery } from "../../tanstack/mock-tiktok-tanstack";
import { formatCurrency, formatDateToYYYYMMDD, getDataDescription, isAdmin, isDevelopmentMode } from "@/src/core/constant/helper";
import TiktokSkusTable from "../components/tiktok/tiktok-skus-table";
import { useSession } from "@/src/core/lib/dummy-session-provider";
import { AnalysisTimeFrame } from "../../../data/model/shopify-entity";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

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

const TikTokDashboardScreen = () => {
    const [activeTab, setActiveTab] = useState("overview");
    const [timeframe, setTimeframe] = useState('daily');
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();

    const { data: session } = useSession();
    const { data: tiktokMetadata, refetch: refetchTiktokMetadata, isLoading: tiktokMetadataLoading } = tiktokDashboardQuery(timeframe);
    const {
        data: tiktokConversionRate,
        isLoading: tiktokConversionRateLoading,
        isError: tiktokConversionRateError
    } = tiktokConversionRateQuery();

    const {
        data: tiktokSkus,
        isLoading: tiktokSkusLoading,
        isError: tiktokSkusError
    } = tiktokSkuListQuery();

    useEffect(() => {
        refetchTiktokMetadata();
    }, [timeframe, refetchTiktokMetadata]);

    console.log('Tiktok Conversion Rate', tiktokConversionRate);



    // Financial Overview Data
    const financialMetrics = [
        {
            title: "Products",
            value: tiktokMetadata?.products || 0,
            change: "-2.1%",
            trending: "down",
            icon: <Package className="h-5 w-5 text-pink-500" />,
            description: getDataDescription(timeframe)
        },
        {
            title: "Total Sales",
            value: formatCurrency(Number(tiktokMetadata?.revenue || 0)),
            change: "+12.5%",
            trending: "up",
            icon: <ShoppingCart className="h-5 w-5 text-pink-500" />,
            description: getDataDescription(timeframe)
        },
        {
            title: "Orders",
            value: tiktokMetadata?.orders || 0,
            change: "-2.8%",
            trending: "down",
            icon: <Percent className="h-5 w-5 text-pink-500" />,
            description: getDataDescription(timeframe)
        },
        {
            title: "Conversion Rate",
            value: `${tiktokMetadata?.conversion_rate || 0}%`,
            change: "+0.5%",
            trending: "up",
            icon: <Percent className="h-5 w-5 text-pink-500" />,
            description: getDataDescription(timeframe)
        }
    ];





    return (
        <div className="flex flex-col items-start gap-4 w-full">
            <div className="flex flex-col sm:flex-row w-full justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                <div>
                    <h2 className="text-2xl font-bold">TikTok Shop Financial Dashboard</h2>
                    <p className="text-muted-foreground">
                        {tiktokMetadataLoading ? 'Loading...' : `${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} metrics & performance analysis`}
                    </p>
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

            <div className="flex w-full justify-between items-center">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="conversion">Conversion</TabsTrigger>
                        <TabsTrigger value="skus">SKUs</TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* <Tabs value={timeframe} onValueChange={setTimeframe} className="w-fit">
                    <TabsList>
                        <TabsTrigger value="daily">Daily</TabsTrigger>
                        <TabsTrigger value="weekly">Weekly</TabsTrigger>
                        <TabsTrigger value="monthly">Monthly</TabsTrigger>
                        <TabsTrigger value="yearly">Yearly</TabsTrigger>
                    </TabsList>
                </Tabs> */}
                {
                    activeTab == 'overview' && (
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

            {activeTab === "overview" && (
                <div className="space-y-4 w-full">
                    {/* Financial Overview Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {tiktokMetadataLoading ? (
                            // Loading skeletons for the cards
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
                            <TiktokConversionCharts />
                        </div>
                        <div className="md:col-span-3 col-span-6 h-full w-full">
                            <TiktokConversionTable
                                conversionData={tiktokConversionRate || []}
                                isLimited
                                onViewAll={() => {
                                    setActiveTab('conversion');
                                }}
                            />
                        </div>
                    </div>

                    <TiktokSkusTable skus={tiktokSkus || []} onSelectTap={() => {
                        setActiveTab("skus")
                    }} selectedTab={activeTab} />
                </div>
            )}

            {activeTab === "conversion" && (
                <div className="space-y-4 w-full">
                    <TiktokConversionTable
                        conversionData={tiktokConversionRate || []}
                        isLimited={false}
                        onViewAll={() => {
                            setActiveTab('conversion');
                        }}
                    />
                </div>
            )}

            {activeTab === "skus" && (
                <div className="space-y-4 w-full">
                    <TiktokSkusTable skus={tiktokSkus || []} onSelectTap={() => {
                        setActiveTab("skus")
                    }} selectedTab={activeTab} />
                </div>
            )}
        </div>
    );
};

export default TikTokDashboardScreen;