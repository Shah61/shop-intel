"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Activity,
    Package,
    TrendingDown,
    Plus,
    Minus,
    Filter,
    Search,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInventoryLogs } from "../../tanstack/record-tanstack";
import { INVENTORY_LOG_TYPES } from "../../../data/model/record-entity";
import { InventoryRecordCard } from "../components/inventory-record-card";

// Helper function to reset filters
const resetFilters = (setSearchTerm: (term: string) => void, setOperationFilter: (filter: "all" | INVENTORY_LOG_TYPES) => void) => {
    setSearchTerm("");
    setOperationFilter("all");
};

export const RecordScreen = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [operationFilter, setOperationFilter] = useState<"all" | INVENTORY_LOG_TYPES>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    // API call with parameters
    const { 
        inventoryLogs, 
        metadata, 
        isLoading, 
        error 
    } = useInventoryLogs({
        log_type: operationFilter === "all" ? undefined : operationFilter,
        order_by: "desc", // Most recent first
        page: currentPage,
        limit: pageSize
    });

    // Filter records based on search (client-side filtering for search term)
    const filteredRecords = inventoryLogs.filter(record => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            record.id.toLowerCase().includes(searchLower) ||
            record.notes?.toLowerCase().includes(searchLower) ||
            record.log_type.toLowerCase().includes(searchLower) ||
            record.user?.email?.toLowerCase().includes(searchLower) ||
            record.inventory?.sku?.sku_no?.toLowerCase().includes(searchLower) ||
            record.inventory?.warehouse?.name?.toLowerCase().includes(searchLower) ||
            record.metadata?.title?.toLowerCase().includes(searchLower) ||
            record.metadata?.description?.toLowerCase().includes(searchLower)
        );
    });

    const OperationFilterButtons = () => (
        <div className="flex flex-wrap gap-2">
            <Button
                variant={operationFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setOperationFilter("all")}
                className="text-xs"
            >
                All Operations
            </Button>
            <Button
                variant={operationFilter === INVENTORY_LOG_TYPES.ADDED ? "default" : "outline"}
                size="sm"
                onClick={() => setOperationFilter(INVENTORY_LOG_TYPES.ADDED)}
                className="text-xs"
            >
                <Plus className="h-3 w-3 mr-1" />
                Added
            </Button>
            <Button
                variant={operationFilter === INVENTORY_LOG_TYPES.REMOVED ? "default" : "outline"}
                size="sm"
                onClick={() => setOperationFilter(INVENTORY_LOG_TYPES.REMOVED)}
                className="text-xs"
            >
                <Minus className="h-3 w-3 mr-1" />
                Removed
            </Button>
            <Button
                variant={operationFilter === INVENTORY_LOG_TYPES.RESTOCKED ? "default" : "outline"}
                size="sm"
                onClick={() => setOperationFilter(INVENTORY_LOG_TYPES.RESTOCKED)}
                className="text-xs"
            >
                <Package className="h-3 w-3 mr-1" />
                Restocked
            </Button>
            <Button
                variant={operationFilter === INVENTORY_LOG_TYPES.SOLD ? "default" : "outline"}
                size="sm"
                onClick={() => setOperationFilter(INVENTORY_LOG_TYPES.SOLD)}
                className="text-xs"
            >
                <TrendingDown className="h-3 w-3 mr-1" />
                Sold
            </Button>
        </div>
    );

    // Error state
    if (error) {
        return (
            <Card>
                <CardContent className="text-center py-20">
                    <Activity className="h-16 w-16 text-red-500/30 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2 text-red-600">Error Loading Records</h3>
                    <p className="text-muted-foreground mb-4">
                        Failed to load inventory logs. Please try again.
                    </p>
                    <Button 
                        variant="outline" 
                        onClick={() => window.location.reload()}
                    >
                        Refresh Page
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                {/* Search and Filters Skeleton */}
                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center space-x-2">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-10 flex-1" />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-4" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Skeleton className="h-8 w-24" />
                                <Skeleton className="h-8 w-20" />
                                <Skeleton className="h-8 w-24" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Records Skeleton */}
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <Card key={index}>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2">
                                        <Skeleton className="h-5 w-24" />
                                        <Skeleton className="h-4 w-48" />
                                        <Skeleton className="h-3 w-32" />
                                    </div>
                                    <Skeleton className="h-6 w-16" />
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
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="text-xl font-semibold">Inventory Records</h3>
                    <p className="text-muted-foreground">
                        Track all inventory movements and changes
                    </p>
                </div>
                <Badge variant="secondary" className="text-sm">
                    {metadata?.total || 0} Records
                </Badge>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="pt-6 space-y-4">
                    {/* Search */}
                    <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by SKU, user email, warehouse, record ID, notes, or operation type..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1"
                        />
                    </div>
                    
                    {/* Operation Filters */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <Label className="text-sm font-medium">Filter by Operation:</Label>
                        </div>
                        <OperationFilterButtons />
                    </div>
                    
                    {/* Results Count */}
                    <div className="text-sm text-muted-foreground">
                        Showing {filteredRecords.length} of {metadata?.total || 0} records
                        {operationFilter !== "all" && ` (${operationFilter} operations)`}
                    </div>
                </CardContent>
            </Card>

            {/* Records List */}
            <div className="space-y-4">
                {filteredRecords.map((record) => (
                    <InventoryRecordCard key={record.id} record={record} />
                ))}
            </div>

            {/* Pagination */}
            {metadata && metadata.total_pages > 1 && (
                <Card>
                    <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                Page {metadata.page} of {metadata.total_pages} 
                                {" • "}
                                {metadata.total} total records
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={!metadata.has_previous}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={!metadata.has_next}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Empty State */}
            {filteredRecords.length === 0 && (
                <Card>
                    <CardContent className="text-center py-20">
                        <Activity className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Records Found</h3>
                        <p className="text-muted-foreground">
                            {searchTerm || operationFilter !== "all" 
                                ? 'No records match your search and filter criteria' 
                                : 'No inventory records available'}
                        </p>
                        {(searchTerm || operationFilter !== "all") && (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="mt-4"
                                onClick={() => resetFilters(setSearchTerm, setOperationFilter)}
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