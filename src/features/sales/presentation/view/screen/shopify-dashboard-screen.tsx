"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Package,
    ShoppingCart,
    Percent,
} from "lucide-react";

import DataCard from "@/src/core/shared/view/components/data-card";
import { ShopifyConversionCharts } from "../components/shopify/shopify-conversion-charts";
import ShopifyConversionTable from "../components/shopify/shopify-conversion-table";
import { shopifyConversionRateQuery, shopifyDashboardQuery, shopifySkusQuery, shopifyStockQuery } from "../../tanstack/mock-shopify-tanstack";
import ShopifySkusTable from "../components/shopify/shopify-skus-table";
import { useQueryClient } from "@tanstack/react-query";
import { formatCurrency, getDataDescription, isAdmin } from "@/src/core/constant/helper";
import { useSession } from "@/src/core/lib/dummy-session-provider";
import { AnalysisTimeFrame } from "../../../data/model/shopify-entity";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
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

const ShopifyDashboardScreen = () => {
    const [timeRange, setTimeRange] = useState("7d");
    const [activeTab, setActiveTab] = useState("overview");
    const [timeframe, setTimeframe] = useState<AnalysisTimeFrame>(AnalysisTimeFrame.DAILY);
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();
    const queryClient = useQueryClient();

    const {
        data: conversionRate,
        isLoading: conversionRateLoading,
        error: conversionRateError
    } = shopifyConversionRateQuery({ limit_order: 250, limit: 0 })


    const {
        data,
        isLoading,
        error
    } = shopifyDashboardQuery(timeframe)

    const {
        data: skus,
        isLoading: skusLoading,
        error: skusError
    } = shopifySkusQuery({
        limit_order: 250,
        limit: 0,
        type: AnalysisTimeFrame.YEARLY
    })


    const {
        data: stock,
        isLoading: stockLoading,
        error: stockError
    } = shopifyStockQuery()

    const { data: session } = useSession();

    // Format the timeframe label for display
    const timeframeLabel = timeframe.charAt(0).toUpperCase() + timeframe.slice(1).toLowerCase();

    // Financial Overview Data
    const financialMetrics = [
        {
            title: "Products",
            value: data?.products || 0,
            change: "-2.1%",
            trending: "down",
            icon: <Package className="h-5 w-5 text-green-600" />,
            isLoading: isLoading,
            description: getDataDescription(timeframe)

        },
        {
            title: `${timeframeLabel} Sales`,
            value: formatCurrency(Number(data?.sales || 0)),
            change: "+12.5%",
            trending: "up",
            icon: <ShoppingCart className="h-5 w-5 text-green-600" />,
            isLoading: isLoading,
            description: getDataDescription(timeframe)
        },
        {
            title: `${timeframeLabel} Orders`,
            value: data?.orders || 0,
            change: "-2.8%",
            trending: "down",
            icon: <ShoppingCart className="h-5 w-5 text-green-600" />,
            isLoading: isLoading,
            description: getDataDescription(timeframe)
        },
        {
            title: "Conversion Rate",
            value: `${(data?.conversionRate || 0).toFixed(2)}%`,
            change: "+0.5%",
            trending: "up",
            icon: <Percent className="h-5 w-5 text-green-600" />,
            isLoading: isLoading,
            description: getDataDescription(timeframe)
        }
    ];

    return (
        <div className="flex flex-col items-start gap-4 w-full">
            <div className="flex flex-col sm:flex-row w-full justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                <div>
                    <h2 className="text-2xl font-bold">Shopify Financial Dashboard</h2>
                    <p className="text-muted-foreground">Track your store's performance and revenue</p>
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

            <div className="flex md:flex-row flex-col w-full justify-between md:items-center items-start gap-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="campaigns">Conversion</TabsTrigger>
                        <TabsTrigger value="skus">SKUs</TabsTrigger>
                    </TabsList>
                </Tabs>

                {
                    activeTab != 'campaigns' && activeTab != 'skus' && (
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
                        {isLoading ? (
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
                            <ShopifyConversionCharts />
                        </div>
                        <div className="md:col-span-3 col-span-6 h-full w-full">
                            <ShopifyConversionTable
                                selectedTab={activeTab}
                                onSelectTap={() => {
                                    setActiveTab("campaigns")
                                }}
                                conversionRate={conversionRate || []} />
                        </div>
                    </div>

                    <ShopifySkusTable
                        stock={stock || []}
                        isLoading={skusLoading}
                        skus={skus || []} onSelectTap={() => {
                            setActiveTab("skus")
                        }} selectedTab={activeTab} />
                </div>
            )}

            {activeTab === "campaigns" && (
                <div className="space-y-4 w-full">
                    <ShopifyConversionTable
                        conversionRate={conversionRate || []}
                        selectedTab={activeTab}
                        onSelectTap={() => {
                            setActiveTab("overview")
                        }}
                    />
                </div>
            )}

            {activeTab === "skus" && (
                <div className="space-y-4 w-full">
                    <ShopifySkusTable
                        stock={stock || []}
                        isLoading={skusLoading}
                        skus={skus || []} onSelectTap={() => {
                            setActiveTab("skus")
                        }} selectedTab={activeTab} />
                </div>
            )}
        </div>
    );
};

export default ShopifyDashboardScreen;