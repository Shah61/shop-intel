"use client"

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Package,
    Search,
    Filter,
    Building2
} from "lucide-react";
import { useGetSkuDetailsPhysicalStore } from "../../tanstack/inventory-tanstack";
import { WarehouseSkuOverview } from "../components/warehouse-sku-overview";

export const PhysicalStoreScreen = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [stockFilter, setStockFilter] = useState("all");
    const { skuDetailsPhysicalStore, isLoading, error } = useGetSkuDetailsPhysicalStore();

    // Filter SKUs based on search term and stock status
    const filteredSkus = useMemo(() => {
        if (!skuDetailsPhysicalStore?.data?.skus) return [];
        
        let filtered = skuDetailsPhysicalStore.data.skus;
        
        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(sku => 
                sku.sku.sku_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sku.sku.sku_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sku.id.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Apply stock status filter
        if (stockFilter !== "all") {
            filtered = filtered.filter(sku => {
                switch (stockFilter) {
                    case "in-stock":
                        return sku.quantity > sku.threshold_quantity;
                    case "low-stock":
                        return sku.threshold_quantity > 0 && sku.quantity <= sku.threshold_quantity && sku.quantity > 0;
                    case "out-of-stock":
                        return sku.quantity === 0;
                    default:
                        return true;
                }
            });
        }
        
        return filtered;
    }, [skuDetailsPhysicalStore, searchTerm, stockFilter]);

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
                        <Card key={index} className="border-l-4 border-l-emerald-200">
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
                                
                                {/* Info Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                                        <Skeleton className="h-6 w-8 mx-auto mb-1" />
                                        <Skeleton className="h-3 w-16 mx-auto" />
                                    </div>
                                    <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                                        <Skeleton className="h-6 w-8 mx-auto mb-1" />
                                        <Skeleton className="h-3 w-16 mx-auto" />
                                    </div>
                                </div>
                                
                                {/* Additional Info */}
                                <div className="pt-2 border-t space-y-2">
                                    <div className="flex justify-between">
                                        <Skeleton className="h-3 w-16" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                    <div className="flex justify-between">
                                        <Skeleton className="h-3 w-12" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                    <div className="flex justify-between">
                                        <Skeleton className="h-3 w-20" />
                                        <Skeleton className="h-3 w-14" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-20 w-full">
                <div className="text-center">
                    <Building2 className="h-16 w-16 text-red-500/30 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2 text-red-600">Error Loading Physical Store Data</h3>
                    <p className="text-muted-foreground">Failed to load physical store inventory. Please try again.</p>
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
                            placeholder="Search SKUs by number, name, or ID..."
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
                        Showing {filteredSkus.length} of {skuDetailsPhysicalStore?.data?.skus.length || 0} items
                        {stockFilter !== "all" && ` (${stockFilter.replace("-", " ")})`}
                    </div>
                </CardContent>
            </Card>

            {/* SKU Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-4 pb-4">
                {filteredSkus.map((sku) => (
                    <WarehouseSkuOverview
                        key={sku.id}
                        sku={sku}
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
