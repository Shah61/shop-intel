"use client";

import { useState } from "react";
import {
    Package,
    ShoppingCart,
    Percent,
} from "lucide-react";
import DataCard from "@/src/core/shared/view/components/data-card";
import { PageHeader, PageSection } from "@/src/core/shared/view/components/page-section";
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
                title="Shopify"
                description="Track your store performance, conversion, and SKUs."
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
                {(activeTab === "overview") && (
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
                        {isLoading ? (
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
                                    variant="emerald"
                                />
                            ))
                        )}
                    </div>
                    </PageSection>

                    <PageSection title="Conversion & charts" description="Conversion trends and recent data.">
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
                    </PageSection>
                    <PageSection title="SKUs" description="Product SKU and stock.">
                    <ShopifySkusTable
                        stock={stock || []}
                        isLoading={skusLoading}
                        skus={skus || []}
                        onSelectTap={() => setActiveTab("skus")}
                        selectedTab={activeTab}
                    />
                    </PageSection>
                </div>
            )}

            {activeTab === "campaigns" && (
                <PageSection title="Conversion data" description="Full conversion table.">
                <ShopifyConversionTable
                    conversionRate={conversionRate || []}
                    selectedTab={activeTab}
                    onSelectTap={() => setActiveTab("overview")}
                />
                </PageSection>
            )}

            {activeTab === "skus" && (
                <PageSection title="SKUs" description="Product SKU list.">
                <ShopifySkusTable
                    stock={stock || []}
                    isLoading={skusLoading}
                    skus={skus || []}
                    onSelectTap={() => setActiveTab("skus")}
                    selectedTab={activeTab}
                />
                </PageSection>
            )}
        </div>
    );
};

export default ShopifyDashboardScreen;