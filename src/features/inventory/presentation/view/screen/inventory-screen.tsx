"use client"

import { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Package,
    Warehouse,
    AlertTriangle,
    TrendingUp,
    Search,
    BarChart3,
    Activity,
    ShoppingCart,
    Store,
    MapPin,
    Plus,
    Filter,
    Building2,
    Clock
} from "lucide-react";
import { useInventoryIstoreListSku, useStocksMetadata, useGetTotalSkus, useGetStockDistribution } from "../../tanstack/inventory-tanstack";
import { ChartRadialLabel } from "../components/inventory-distribution-chart";
import { ChartBarStacked } from "../components/inventory-location-chart";
import DataCard from "@/src/core/shared/view/components/data-card";
import { DashboardPanel } from "@/src/core/shared/view/components/dashboard-panel";
import { IStoreScreen } from "./istore-screen";
import { SepangScreen } from "./sepang-screen";
import { PhysicalStoreScreen } from "./physical-store-screen";
import { RecordScreen } from "./record-screen";

export const InventoryScreen = () => {
    const [activeTab, setActiveTab] = useState("summary");
    const { inventoryIstoreListSku, isLoading: isLoadingInventory, error } = useInventoryIstoreListSku();
    const { stocksMetadata, isLoading: isLoadingStockMetadata } = useStocksMetadata();
    const { totalSkus, isLoading: isLoadingTotalSkus } = useGetTotalSkus();
    const { stockDistribution, isLoading: isLoadingStockDistribution } = useGetStockDistribution();

    // Check if any data is still loading
    const isLoading = isLoadingInventory || isLoadingStockMetadata || isLoadingTotalSkus || isLoadingStockDistribution;

    // Calculate summary metrics
    const summaryMetrics = useMemo(() => {
        if (!inventoryIstoreListSku || inventoryIstoreListSku.length === 0) {
            return {
                totalSkus: totalSkus?.data?.totalSkus?.length || 0,
                totalGoodQty: stockDistribution?.data?.stockDistribution?.goodQty || 0,
                totalDamagedQty: stockDistribution?.data?.stockDistribution?.damagedQty || 0,
                totalAvailableQty: stockDistribution?.data?.stockDistribution?.availableQty || 0,
                lowStockItems: stocksMetadata?.data?.stocks?.lowStock || 0,
                outOfStockItems: 0,
                processingQty: stocksMetadata?.data?.stocks?.processingStock || stockDistribution?.data?.stockDistribution?.processingQty || 0,
                allocatingQty: stocksMetadata?.data?.stocks?.allocatingStock || stockDistribution?.data?.stockDistribution?.allocatingQty || 0
            };
        }

        const totalSkusCount = totalSkus?.data?.totalSkus?.length || inventoryIstoreListSku.length;
        const totalGoodQty = stockDistribution?.data?.stockDistribution?.goodQty || inventoryIstoreListSku.reduce((sum, item) => sum + item.goodQty, 0);
        const totalDamagedQty = stockDistribution?.data?.stockDistribution?.damagedQty || inventoryIstoreListSku.reduce((sum, item) => sum + item.damagedQty, 0);
        const totalAvailableQty = stockDistribution?.data?.stockDistribution?.availableQty || inventoryIstoreListSku.reduce((sum, item) => sum + item.availableQty, 0);
        const lowStockItems = stocksMetadata?.data?.stocks?.lowStock || inventoryIstoreListSku.filter(item => item.availableQty <= item.thresholdQty && item.availableQty > 0).length;
        const outOfStockItems = inventoryIstoreListSku.filter(item => item.availableQty === 0).length;
        const processingQty = stocksMetadata?.data?.stocks?.processingStock || stockDistribution?.data?.stockDistribution?.processingQty || inventoryIstoreListSku.reduce((sum, item) => sum + item.processingQty, 0);
        const allocatingQty = stocksMetadata?.data?.stocks?.allocatingStock || stockDistribution?.data?.stockDistribution?.allocatingQty || inventoryIstoreListSku.reduce((sum, item) => sum + item.allocatingQty, 0);

        return {
            totalSkus: totalSkusCount,
            totalGoodQty,
            totalDamagedQty,
            totalAvailableQty,
            lowStockItems,
            outOfStockItems,
            processingQty,
            allocatingQty
        };
    }, [inventoryIstoreListSku, stocksMetadata, totalSkus, stockDistribution]);

    // Reset filters when changing tabs
    const handleTabChange = (value: string) => {
        setActiveTab(value);
    };

    // Financial Overview Data for Summary
    const inventoryOverviewMetrics = [
        {
            title: "Total SKUs",
            value: summaryMetrics.totalSkus,
            change: "+12.5%",
            trending: "up",
            icon: <Package className="h-5 w-5 text-blue-500" />,
            description: "Active inventory items"
        },
        {
            title: "Available Stock",
            value: summaryMetrics.totalAvailableQty.toLocaleString(),
            change: "+8.2%",
            trending: "up",
            icon: <ShoppingCart className="h-5 w-5 text-green-500" />,
            description: "Ready for sale"
        },
        {
            title: "Low Stock Alert",
            value: summaryMetrics.lowStockItems,
            change: "-5.1%",
            trending: "down",
            icon: <AlertTriangle className="h-5 w-5 text-orange-500" />,
            description: "Below threshold"
        },
        {
            title: "Processing",
            value: summaryMetrics.processingQty.toLocaleString(),
            change: "+15.3%",
            trending: "up",
            icon: <Activity className="h-5 w-5 text-purple-500" />,
            description: "Items being processed"
        },
        {
            title: "Allocating Stocks",
            value: summaryMetrics.allocatingQty.toLocaleString(),
            change: "+2.1%",
            trending: "up",
            icon: <Clock className="h-5 w-5 text-indigo-500" />,
            description: "Items being allocated"
        }
    ];

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Error Loading Inventory Data</h3>
                <p className="text-muted-foreground">Failed to load inventory information. Please try again.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-start gap-6 w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row w-full justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold pt-4 sm:pt-6 md:pt-8">Inventory Management Analytics</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {isLoading ? 'Loading...' : `Comprehensive inventory tracking across ${summaryMetrics.totalSkus} SKUs`}
                    </p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex w-full justify-between items-center overflow-x-auto">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full min-w-0">
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto gap-1">
                        <TabsTrigger value="summary" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2">
                            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="truncate">Summary</span>
                        </TabsTrigger>
                        <TabsTrigger value="istore" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2">
                            <Store className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="truncate">iStore</span>
                        </TabsTrigger>
                        <TabsTrigger value="physical-store" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2">
                            <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="truncate">Physical Store</span>
                        </TabsTrigger>
                        <TabsTrigger value="warehouse" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2">
                            <Warehouse className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="truncate">Warehouse</span>
                        </TabsTrigger>
                        <TabsTrigger value="record" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-2">
                            <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="truncate">Record</span>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="w-full space-y-6">
                    {/* Overview Metrics Skeleton */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <Card key={index}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-4" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-8 w-16 mb-2" />
                                    <div className="flex items-center space-x-2">
                                        <Skeleton className="h-3 w-12" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Charts Section Skeleton - Updated for responsive layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 min-h-[400px] md:min-h-[450px] lg:min-h-[500px]">
                        {/* Radial Chart Skeleton */}
                        <div className="col-span-1 h-full">
                            <Card className="h-full flex flex-col">
                                <CardHeader className="pb-2">
                                    <Skeleton className="h-6 w-32 mb-2" />
                                    <Skeleton className="h-4 w-48" />
                                </CardHeader>
                                <CardContent className="flex-1 min-h-[280px] md:min-h-[320px] lg:min-h-[300px] flex items-center justify-center">
                                    <Skeleton className="h-64 w-64 rounded-full" />
                                </CardContent>
                                <CardFooter className="flex-col gap-2 pt-2">
                                    <Skeleton className="h-4 w-40" />
                                    <Skeleton className="h-3 w-32" />
                                </CardFooter>
                            </Card>
                        </div>

                        {/* Bar Chart Skeleton */}
                        <div className="col-span-1 h-full">
                            <Card className="h-full flex flex-col">
                                <CardHeader className="pb-2">
                                    <Skeleton className="h-6 w-36 mb-2" />
                                    <Skeleton className="h-4 w-44" />
                                </CardHeader>
                                <CardContent className="flex-1 min-h-[280px] md:min-h-[320px] lg:min-h-[300px]">
                                    <div className="h-full w-full flex items-center justify-center">
                                        <Skeleton className="h-full w-full rounded-lg" />
                                    </div>
                                </CardContent>
                                <CardFooter className="flex-col gap-2 pt-2">
                                    <Skeleton className="h-4 w-40" />
                                    <Skeleton className="h-3 w-32" />
                                </CardFooter>
                            </Card>
                        </div>

                        {/* Stock Distribution Skeleton */}
                        <div className="col-span-1 md:col-span-2 lg:col-span-1 h-full">
                            <Card className="h-full flex flex-col">
                                <CardHeader className="pb-2">
                                    <Skeleton className="h-6 w-32 mb-2" />
                                    <Skeleton className="h-4 w-40" />
                                </CardHeader>
                                <CardContent className="flex-1 min-h-[280px] md:min-h-[320px] lg:min-h-[300px]">
                                    <div className="flex flex-col justify-center h-full space-y-4 md:space-y-6">
                                        {Array.from({ length: 5 }).map((_, index) => (
                                            <div key={index} className="flex justify-between items-center">
                                                <Skeleton className="h-4 w-20" />
                                                <Skeleton className="h-5 w-16" />
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                                <CardFooter className="flex-col gap-2 pt-2">
                                    <Skeleton className="h-4 w-40" />
                                    <Skeleton className="h-3 w-32" />
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </div>
            )}

            {!isLoading && (
                <Tabs value={activeTab} className="w-full">
                    {/* Summary Tab */}
                    <TabsContent value="summary" className="space-y-6">
                        {/* Overview Metrics */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            {inventoryOverviewMetrics.map((metric, index) => (
                                <DataCard 
                                    key={index}
                                    icon={metric.icon}
                                    title={metric.title}
                                    value={metric.value as any}
                                    trending={metric.trending as any}
                                    change={metric.change}
                                    description={metric.description}
                                />
                            ))}
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 min-h-[400px] md:min-h-[450px] lg:min-h-[500px]">
                            <div className="col-span-1 h-full">
                                <ChartRadialLabel />
                            </div>
                            <div className="col-span-1 h-full">
                                <ChartBarStacked />
                            </div>
                            <div className="col-span-1 md:col-span-2 lg:col-span-1 h-full">
                                <DashboardPanel
                                    title="Stock distribution"
                                    description="Current inventory breakdown"
                                    footer="Summary across all locations"
                                    className="h-full"
                                >
                                    <div className="flex flex-col justify-center h-full min-h-[260px] px-5 py-4 space-y-3">
                                        {[
                                            { label: "Good stock", value: summaryMetrics.totalGoodQty, color: "" },
                                            { label: "Available", value: summaryMetrics.totalAvailableQty, color: "text-emerald-600 dark:text-emerald-400" },
                                            { label: "Processing", value: summaryMetrics.processingQty, color: "text-blue-600 dark:text-blue-400" },
                                            { label: "Allocating", value: summaryMetrics.allocatingQty, color: "text-orange-600 dark:text-orange-400" },
                                            { label: "Damaged", value: summaryMetrics.totalDamagedQty, color: "text-red-600 dark:text-red-400" },
                                        ].map(({ label, value, color }) => (
                                            <div key={label} className="flex justify-between items-center py-1">
                                                <span className="text-xs text-muted-foreground capitalize">{label}</span>
                                                <span className={`text-sm font-semibold tabular-nums ${color}`}>{value.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </DashboardPanel>
                            </div>
                        </div>
                    </TabsContent>

                    {/* iStore Tab */}
                    <TabsContent value="istore" className="space-y-6">
                        <IStoreScreen 
                            inventoryData={inventoryIstoreListSku || []}
                            isLoading={isLoading}
                        />
                    </TabsContent>

                    {/* Physical Store Tab */}
                    <TabsContent value="physical-store" className="space-y-6">
                        <PhysicalStoreScreen />
                    </TabsContent>

                    {/* Warehouse Tab */}
                    <TabsContent value="warehouse" className="space-y-6">
                        <SepangScreen />
                    </TabsContent>

                    {/* Record Tab */}
                    <TabsContent value="record" className="space-y-6">
                        <RecordScreen />
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
};