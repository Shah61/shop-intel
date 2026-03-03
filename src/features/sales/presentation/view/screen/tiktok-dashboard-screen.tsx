"use client";

import { useState, useEffect } from "react";
import {
    Package,
    ShoppingCart,
    Percent,
    Calendar as CalendarIcon,
} from "lucide-react";
import { useSession } from "@/src/core/lib/dummy-session-provider";
import DataCard from "@/src/core/shared/view/components/data-card";
import { PageHeader, PageSection } from "@/src/core/shared/view/components/page-section";
import { TiktokConversionCharts } from "../components/tiktok/tiktok-conversion-charts";
import TiktokConversionTable from "../components/tiktok/tiktok-conversion-table";
import { tiktokConversionRateQuery, tiktokDashboardQuery, tiktokSkuListQuery, tiktokSkusQuery } from "../../tanstack/mock-tiktok-tanstack";
import { formatCurrency, getDataDescription } from "@/src/core/constant/helper";
import TiktokSkusTable from "../components/tiktok/tiktok-skus-table";
import { AnalysisTimeFrame } from "../../../data/model/shopify-entity";
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





    const timeframePills = [
        { value: AnalysisTimeFrame.DAILY, label: "Daily" },
        { value: AnalysisTimeFrame.WEEKLY, label: "Weekly" },
        { value: AnalysisTimeFrame.MONTHLY, label: "Monthly" },
        { value: AnalysisTimeFrame.YEARLY, label: "Yearly" },
    ];
    const mainTabs = [
        { id: "overview", label: "Overview" },
        { id: "conversion", label: "Conversion" },
        { id: "skus", label: "SKUs" },
    ];

    return (
        <div className="space-y-8 w-full">
            <PageHeader
                title="TikTok Shop"
                description={tiktokMetadataLoading ? "Loading…" : `${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} metrics and performance.`}
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
                                onClick={() => setTimeframe(tf.value)}
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
                        {tiktokMetadataLoading ? (
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
                                    variant="rose"
                                />
                            ))
                        )}
                    </div>
                    </PageSection>

                    <PageSection title="Conversion & charts" description="Conversion trends and recent conversion data.">
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
                    </PageSection>

                    <PageSection title="SKUs" description="Product SKU performance and inventory.">
                    <TiktokSkusTable skus={tiktokSkus || []} onSelectTap={() => setActiveTab("skus")} selectedTab={activeTab} />
                    </PageSection>
                </div>
            )}

            {activeTab === "conversion" && (
                <PageSection title="Conversion data" description="Full conversion table.">
                <div className="space-y-4 w-full">
                    <TiktokConversionTable
                        conversionData={tiktokConversionRate || []}
                        isLimited={false}
                        onViewAll={() => setActiveTab("conversion")}
                    />
                </div>
                </PageSection>
            )}

            {activeTab === "skus" && (
                <PageSection title="SKUs" description="Product SKU list and performance.">
                <div className="space-y-4 w-full">
                    <TiktokSkusTable skus={tiktokSkus || []} onSelectTap={() => setActiveTab("skus")} selectedTab={activeTab} />
                </div>
                </PageSection>
            )}
        </div>
    );
};

export default TikTokDashboardScreen;