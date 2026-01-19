"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
    Search, 
    Filter, 
    CalendarIcon, 
    X, 
    RotateCcw,
    Tag,
    Users
} from "lucide-react";
// Removed date-fns import to avoid build errors
import { EventFilterParams, EventType } from "../../../data/model/user-activity-entity";
import { useUsersQuery } from "../../../../auth/presentation/tanstack/users-tanstack";

interface EventFiltersProps {
    filters: EventFilterParams;
    onFiltersChange: (filters: EventFilterParams) => void;
    className?: string;
}

const UserActivityFilters: React.FC<EventFiltersProps> = ({
    filters,
    onFiltersChange,
    className
}) => {
    // Get default date range (3 days ago to today)
    const getDefaultDateRange = () => {
        const today = new Date();
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(today.getDate() - 3);
        return {
            from: threeDaysAgo,
            to: today
        };
    };

    // Initialize with default date range if no dates are provided
    const initializeFilters = () => {
        if (!filters.start_date && !filters.end_date) {
            const defaultRange = getDefaultDateRange();
            return {
                ...filters,
                start_date: defaultRange.from.toISOString().split('T')[0],
                end_date: defaultRange.to.toISOString().split('T')[0]
            };
        }
        return filters;
    };

    const [localFilters, setLocalFilters] = useState<EventFilterParams>(initializeFilters());
    const [dateRange, setDateRange] = useState<{
        from?: Date;
        to?: Date;
    }>(() => {
        if (filters.start_date && filters.end_date) {
            return {
                from: new Date(filters.start_date),
                to: new Date(filters.end_date)
            };
        } else {
            return getDefaultDateRange();
        }
    });

    // Fetch users for the dropdown
    const { data: users = [], isLoading: isLoadingUsers } = useUsersQuery();

    // Initialize default filters on component mount
    useEffect(() => {
        const initialFilters = initializeFilters();
        if (!filters.start_date && !filters.end_date) {
            // Apply default date range to parent component
            onFiltersChange(initialFilters);
        }
    }, [onFiltersChange]); // Run when onFiltersChange changes

    // Update local state when external filters change
    useEffect(() => {
        const updatedFilters = initializeFilters();
        setLocalFilters(updatedFilters);
        
        if (filters.start_date && filters.end_date) {
            setDateRange({
                from: new Date(filters.start_date),
                to: new Date(filters.end_date)
            });
        } else {
            setDateRange(getDefaultDateRange());
        }
    }, [filters]);

    const handleFilterChange = (key: keyof EventFilterParams, value: any) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
        setDateRange(range);
        const newFilters = {
            ...localFilters,
            start_date: range.from ? range.from.toISOString().split('T')[0] : undefined,
            end_date: range.to ? range.to.toISOString().split('T')[0] : undefined,
        };
        setLocalFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const handleReset = () => {
        const defaultRange = getDefaultDateRange();
        const resetFilters: EventFilterParams = {
            page: 1,
            limit: 10,
            sort_by: 'created_at',
            sort_order: 'desc',
            start_date: defaultRange.from.toISOString().split('T')[0],
            end_date: defaultRange.to.toISOString().split('T')[0]
        };
        setLocalFilters(resetFilters);
        setDateRange(defaultRange);
        onFiltersChange(resetFilters);
    };

    const activeFilterCount = Object.keys(localFilters).filter(key => {
        const value = localFilters[key as keyof EventFilterParams];
        // Exclude pagination, sorting, and default date range from active count
        if (key === 'page' || key === 'limit' || key === 'sort_by' || key === 'sort_order') {
            return false;
        }
        
        // Check if this is the default date range
        if (key === 'start_date' || key === 'end_date') {
            const defaultRange = getDefaultDateRange();
            const defaultStartDate = defaultRange.from.toISOString().split('T')[0];
            const defaultEndDate = defaultRange.to.toISOString().split('T')[0];
            
            if (key === 'start_date' && value === defaultStartDate) return false;
            if (key === 'end_date' && value === defaultEndDate) return false;
        }
        
        return value !== undefined && value !== '' && value !== null;
    }).length;

    const formatFilterValue = (key: string, value: any): string => {
        if (key === 'start_date' || key === 'end_date') {
            return new Date(value).toLocaleDateString();
        }
        if (key === 'user_id' && users.length > 0) {
            const user = users.find(u => u.id === value);
            return user ? user.email || user.name || 'Unknown User' : value;
        }
        return String(value);
    };

    // Get event type display name
    const getEventTypeDisplayName = (type: string): string => {
        switch (type.toUpperCase()) {
            case EventType.ORDER:
                return 'Order';
            case EventType.PRODUCT:
                return 'Product';
            case EventType.COLLECTION:
                return 'Collection';
            case EventType.DISCOUNT:
                return 'Discount';
            case EventType.CATEGORY:
                return 'Category';
            case EventType.USER:
                return 'User';
            case EventType.AUTHENTICATION:
                return 'Authentication';
            case EventType.SYSTEM:
                return 'System';
            default:
                return type;
        }
    };

    return (
        <Card className={cn("w-full", className)}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        User Activity Filters
                        {activeFilterCount > 0 && (
                            <Badge variant="secondary" className="ml-2">
                                {activeFilterCount}
                            </Badge>
                        )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {activeFilterCount > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleReset}
                                className="h-8 gap-1"
                            >
                                <RotateCcw className="h-3 w-3" />
                                Reset
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
                {/* Primary Filters Row - Search, Type, Date Range, User */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1">
                            <Search className="h-3 w-3" />
                            Search
                        </Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search user activity..."
                                value={localFilters.search || ""}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="pl-10 pr-10"
                            />
                            {localFilters.search && (                       
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleFilterChange('search', '')}
                                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Type Filter */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            Type
                        </Label>
                        <Select
                            value={localFilters.type || "all"}
                            onValueChange={(value) => handleFilterChange('type', value === 'all' ? undefined : value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All types</SelectItem>
                                <SelectItem value={EventType.ORDER}>Order</SelectItem>
                                <SelectItem value={EventType.PRODUCT}>Product</SelectItem>
                                <SelectItem value={EventType.COLLECTION}>Collection</SelectItem>
                                <SelectItem value={EventType.DISCOUNT}>Discount</SelectItem>
                                <SelectItem value={EventType.CATEGORY}>Category</SelectItem>
                                <SelectItem value={EventType.USER}>User</SelectItem>
                                <SelectItem value={EventType.AUTHENTICATION}>Authentication</SelectItem>
                                <SelectItem value={EventType.SYSTEM}>System</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date Range Filter */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            Date Range
                        </Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !dateRange.from && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange.from ? (
                                        dateRange.to ? (
                                            <>
                                                {dateRange.from.toLocaleDateString()} - {" "}
                                                {dateRange.to.toLocaleDateString()}
                                            </>
                                        ) : (
                                            dateRange.from.toLocaleDateString()
                                        )
                                    ) : (
                                        <span>Pick a date range</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="range"
                                    selected={{
                                        from: dateRange.from,
                                        to: dateRange.to
                                    }}
                                    onSelect={(range) => handleDateRangeChange({ from: range?.from, to: range?.to })}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* User Filter */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            User
                        </Label>
                        <Select
                            value={localFilters.user_id || "all"}
                            onValueChange={(value) => handleFilterChange('user_id', value === 'all' ? undefined : value)}
                            disabled={isLoadingUsers}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={isLoadingUsers ? "Loading users..." : "All users"} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All users</SelectItem>
                                {users.map((user) => (
                                    <SelectItem key={user.id} value={user.id!}>
                                        {user.email || user.name || 'Unknown User'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Active Filters Display */}
                {activeFilterCount > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                        {localFilters.search && (
                            <Badge variant="secondary" className="gap-1">
                                Search: {localFilters.search}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleFilterChange('search', '')}
                                    className="h-3 w-3 p-0 ml-1"
                                >
                                    <X className="h-2 w-2" />
                                </Button>
                            </Badge>
                        )}
                        {localFilters.type && (
                            <Badge variant="secondary" className="gap-1">
                                Type: {getEventTypeDisplayName(localFilters.type)}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleFilterChange('type', undefined)}
                                    className="h-3 w-3 p-0 ml-1"
                                >
                                    <X className="h-2 w-2" />
                                </Button>
                            </Badge>
                        )}
                        {localFilters.user_id && (
                            <Badge variant="secondary" className="gap-1">
                                User: {formatFilterValue('user_id', localFilters.user_id)}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleFilterChange('user_id', undefined)}
                                    className="h-3 w-3 p-0 ml-1"
                                >
                                    <X className="h-2 w-2" />
                                </Button>
                            </Badge>
                        )}
                        {(() => {
                            // Check if current date range is different from default
                            const defaultRange = getDefaultDateRange();
                            const defaultStartDate = defaultRange.from.toISOString().split('T')[0];
                            const defaultEndDate = defaultRange.to.toISOString().split('T')[0];
                            const isDefaultRange = localFilters.start_date === defaultStartDate && localFilters.end_date === defaultEndDate;
                            
                            return (localFilters.start_date || localFilters.end_date) && !isDefaultRange && (
                                <Badge variant="secondary" className="gap-1">
                                    Date: {localFilters.start_date ? formatFilterValue('start_date', localFilters.start_date) : 'Start'} - {localFilters.end_date ? formatFilterValue('end_date', localFilters.end_date) : 'End'}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            const defaultRange = getDefaultDateRange();
                                            handleFilterChange('start_date', defaultRange.from.toISOString().split('T')[0]);
                                            handleFilterChange('end_date', defaultRange.to.toISOString().split('T')[0]);
                                            setDateRange(defaultRange);
                                        }}
                                        className="h-3 w-3 p-0 ml-1"
                                    >
                                        <X className="h-2 w-2" />
                                    </Button>
                                </Badge>
                            );
                        })()}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default UserActivityFilters; 