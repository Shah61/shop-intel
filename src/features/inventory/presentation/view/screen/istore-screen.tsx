"use client"

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Package,
    Search,
    Filter
} from "lucide-react";
import { SkuIndividualChart } from "../components/istore-sku-overview";
import { InventoryStock } from "../../../data/model/inventory-entity";

interface IStoreScreenProps {
    inventoryData: InventoryStock[];
    isLoading: boolean;
}

export const IStoreScreen = ({ inventoryData, isLoading }: IStoreScreenProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [stockFilter, setStockFilter] = useState("all");

    // Filter SKUs based on search term and stock status
    const filteredSkus = useMemo(() => {
        if (!inventoryData) return [];
        
        let filtered = inventoryData;
        
        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(sku => 
                sku.skuNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sku.skuDesc.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sku.storageClientSkuNo.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Apply stock status filter
        if (stockFilter !== "all") {
            filtered = filtered.filter(sku => {
                switch (stockFilter) {
                    case "in-stock":
                        return sku.availableQty > sku.thresholdQty;
                    case "low-stock":
                        return sku.availableQty <= sku.thresholdQty && sku.availableQty > 0;
                    case "out-of-stock":
                        return sku.availableQty === 0;
                    default:
                        return true;
                }
            });
        }
        
        return filtered;
    }, [inventoryData, searchTerm, stockFilter]);

    const StockFilterButtons = () => (
        <div className="flex flex-wrap gap-2">
            <Button
                variant={stockFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStockFilter("all")}
                className="text-xs"
            >
                All Items
            </Button>
            <Button
                variant={stockFilter === "in-stock" ? "default" : "outline"}
                size="sm"
                onClick={() => setStockFilter("in-stock")}
                className="text-xs"
            >
                In Stock
            </Button>
            <Button
                variant={stockFilter === "low-stock" ? "default" : "outline"}
                size="sm"
                onClick={() => setStockFilter("low-stock")}
                className="text-xs"
            >
                Low Stock
            </Button>
            <Button
                variant={stockFilter === "out-of-stock" ? "default" : "outline"}
                size="sm"
                onClick={() => setStockFilter("out-of-stock")}
                className="text-xs"
            >
                Out of Stock
            </Button>
        </div>
    );

    if (isLoading) {
        return (
            <div className="space-y-6">
                {/* Search and Filters Skeleton */}
                <Card>
                    <CardContent className="pt-6 space-y-4">
                        {/* Search Skeleton */}
                        <div className="flex items-center space-x-2">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-10 flex-1" />
                        </div>
                        
                        {/* Filter Buttons Skeleton */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-4" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Skeleton className="h-8 w-20" />
                                <Skeleton className="h-8 w-16" />
                                <Skeleton className="h-8 w-20" />
                                <Skeleton className="h-8 w-24" />
                            </div>
                        </div>
                        
                        {/* Results Count Skeleton */}
                        <Skeleton className="h-4 w-48" />
                    </CardContent>
                </Card>

                {/* SKU Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-4 pb-4">
                    {Array.from({ length: 12 }).map((_, index) => (
                        <Card key={index} className="border-l-4 border-l-blue-200">
                            <CardContent className="p-6 space-y-4">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-6 w-24" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-3/4" />
                                    </div>
                                    <Skeleton className="h-6 w-16" />
                                </div>
                                
                                {/* Chart Area */}
                                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg p-4">
                                    <Skeleton className="h-4 w-24 mx-auto mb-4" />
                                    <div className="flex justify-center">
                                        <Skeleton className="h-48 w-48 rounded-full" />
                                    </div>
                                </div>
                                
                                {/* Stock Breakdown Grid */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="text-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                                        <Skeleton className="h-5 w-8 mx-auto mb-1" />
                                        <Skeleton className="h-3 w-12 mx-auto" />
                                    </div>
                                    <div className="text-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                        <Skeleton className="h-5 w-8 mx-auto mb-1" />
                                        <Skeleton className="h-3 w-16 mx-auto" />
                                    </div>
                                    <div className="text-center p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                                        <Skeleton className="h-5 w-8 mx-auto mb-1" />
                                        <Skeleton className="h-3 w-16 mx-auto" />
                                    </div>
                                    <div className="text-center p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                                        <Skeleton className="h-5 w-8 mx-auto mb-1" />
                                        <Skeleton className="h-3 w-12 mx-auto" />
                                    </div>
                                </div>
                                
                                {/* Additional Info */}
                                <div className="pt-2 border-t space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <Skeleton className="h-3 w-16" />
                                            <Skeleton className="h-3 w-20" />
                                        </div>
                                        <div className="space-y-1">
                                            <Skeleton className="h-3 w-12" />
                                            <Skeleton className="h-3 w-16" />
                                        </div>
                                    </div>
                                    <div className="flex justify-between">
                                        <Skeleton className="h-3 w-16" />
                                        <Skeleton className="h-3 w-12" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Search and Filters */}
            <Card>
                <CardContent className="pt-6 space-y-4">
                    {/* Search */}
                    <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search SKUs by number, description, or client SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1"
                        />
                    </div>
                    
                    {/* Stock Status Filters */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <Label className="text-sm font-medium">Filter by Stock Status:</Label>
                        </div>
                        <StockFilterButtons />
                    </div>
                    
                    {/* Results Count */}
                    <div className="text-sm text-muted-foreground">
                        Showing {filteredSkus.length} of {inventoryData?.length || 0} items
                        {stockFilter !== "all" && ` (${stockFilter.replace("-", " ")})`}
                    </div>
                </CardContent>
            </Card>

            {/* SKU Cards for iStore */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-4 pb-4">
                {filteredSkus.map((sku) => (
                    <SkuIndividualChart
                        key={sku.skuNo}
                        skuNo={sku.skuNo}
                        skuDesc={sku.skuDesc}
                        goodQty={sku.goodQty}
                        availableQty={sku.availableQty}
                        processingQty={sku.processingQty}
                        damagedQty={sku.damagedQty}
                        allocatingQty={sku.allocatingQty}
                        reservedQty={sku.reservedQty}
                        thresholdQty={sku.thresholdQty}
                        skuStatus={sku.skuStatus}
                        country={sku.country}
                        storageClientSkuNo={sku.storageClientSkuNo}
                    />
                ))}
            </div>

            {filteredSkus.length === 0 && (
                <Card>
                    <CardContent className="text-center py-20">
                        <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No SKUs found</h3>
                        <p className="text-muted-foreground">
                            {searchTerm || stockFilter !== "all" 
                                ? 'No SKUs match your search and filter criteria' 
                                : 'No inventory data available'}
                        </p>
                        {(searchTerm || stockFilter !== "all") && (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="mt-4"
                                onClick={() => {
                                    setSearchTerm("");
                                    setStockFilter("all");
                                }}
                            >
                                Clear Filters
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
