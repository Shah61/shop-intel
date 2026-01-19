"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
    ChevronLeft, 
    ChevronRight, 
    ChevronsLeft, 
    ChevronsRight 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EventMetadata, EventFilterParams } from "../../../data/model/user-activity-entity";

interface EventsPaginationProps {
    metadata: EventMetadata;
    filters: EventFilterParams;
    onFiltersChange: (filters: EventFilterParams) => void;
    className?: string;
}

const UserActivityPagination: React.FC<EventsPaginationProps> = ({
    metadata,
    filters,
    onFiltersChange,
    className
}) => {
    const { total, page, limit, total_pages, has_next, has_previous } = metadata;

    const handlePageChange = (newPage: number) => {
        onFiltersChange({
            ...filters,
            page: newPage
        });
    };

    const handleLimitChange = (newLimit: string) => {
        onFiltersChange({
            ...filters,
            limit: parseInt(newLimit),
            page: 1 // Reset to first page when changing limit
        });
    };

    const getVisiblePages = () => {
        const pages: (number | string)[] = [];
        const maxVisiblePages = 7;
        
        if (total_pages <= maxVisiblePages) {
            // Show all pages if total is small
            for (let i = 1; i <= total_pages; i++) {
                pages.push(i);
            }
        } else {
            // Show ellipsis for large page counts
            if (page <= 4) {
                // Near the beginning
                for (let i = 1; i <= 5; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(total_pages);
            } else if (page >= total_pages - 3) {
                // Near the end
                pages.push(1);
                pages.push('...');
                for (let i = total_pages - 4; i <= total_pages; i++) {
                    pages.push(i);
                }
            } else {
                // In the middle
                pages.push(1);
                pages.push('...');
                for (let i = page - 1; i <= page + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(total_pages);
            }
        }
        
        return pages;
    };

    const startItem = (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, total);

    return (
        <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 py-4", className)}>
            {/* Results info and page size selector */}
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground">
                <div>
                    Showing {total === 0 ? 0 : startItem} to {endItem} of {total} results
                </div>
                
                <div className="flex items-center gap-2">
                    <span>Show</span>
                    <Select value={limit.toString()} onValueChange={handleLimitChange}>
                        <SelectTrigger className="w-[70px] h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                    <span>per page</span>
                </div>
            </div>

            {/* Pagination controls */}
            {total_pages > 1 && (
                <div className="flex items-center gap-1">
                    {/* First page button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(1)}
                        disabled={!has_previous}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronsLeft className="h-4 w-4" />
                        <span className="sr-only">First page</span>
                    </Button>

                    {/* Previous page button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={!has_previous}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Previous page</span>
                    </Button>

                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                        {getVisiblePages().map((pageNum, index) => (
                            <React.Fragment key={index}>
                                {pageNum === '...' ? (
                                    <span className="px-2 py-1 text-muted-foreground">
                                        {pageNum}
                                    </span>
                                ) : (
                                    <Button
                                        variant={pageNum === page ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handlePageChange(pageNum as number)}
                                        className="h-8 w-8 p-0"
                                    >
                                        {pageNum}
                                    </Button>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Next page button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={!has_next}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Next page</span>
                    </Button>

                    {/* Last page button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(total_pages)}
                        disabled={!has_next}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronsRight className="h-4 w-4" />
                        <span className="sr-only">Last page</span>
                    </Button>
                </div>
            )}
        </div>
    );
};

export default UserActivityPagination; 