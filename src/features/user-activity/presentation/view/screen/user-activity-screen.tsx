"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
    Calendar, 
    Clock, 
    MapPin, 
    TrendingUp,
    Users,
    Star,
    AlertCircle,
    RefreshCw,
    Filter,
    UserCheck,
    UsersIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEventsQuery, useEventAnalyticsSummaryQuery } from "../../../data/user-activity-tanstack";
import { EventFilterParams, EventEntity } from "../../../data/model/user-activity-entity";
import UserActivityFilters from "../components/user-activity-filters";
import UserActivityDataTable from "../components/user-activity-data-table";
import UserActivityPagination from "../components/user-activity-pagination";
import { StaffDataTable } from "../../../../sales/presentation/view/components/physical/staff-data-table";
import { useUsersQuery, useDeleteUserMutation } from "../../../../auth/presentation/tanstack/users-tanstack";
import { UsersEntity } from "../../../../auth/data/model/users-entity";
import toast from "react-hot-toast";

const UserActivityScreen: React.FC = () => {
    const [filters, setFilters] = useState<EventFilterParams>({
        page: 1,
        limit: 10,
        sort_by: 'created_at',
        sort_order: 'desc'
    });
    
    const [selectedEvent, setSelectedEvent] = useState<EventEntity | null>(null);
    const [showStaffTable, setShowStaffTable] = useState(false);

    // Prepare analytics filters from current filters
    const analyticsFilters = useMemo(() => ({
        start_date: filters.start_date,
        end_date: filters.end_date,
        limit: 10,
        page: 1
    }), [filters.start_date, filters.end_date]);

    // Queries
    const { 
        data: eventsData, 
        isLoading: isLoadingEvents, 
        error: eventsError,
        refetch: refetchEvents 
    } = useEventsQuery(filters);
    
    const { 
        data: analyticsData, 
        isLoading: isLoadingAnalytics,
        refetch: refetchAnalytics
    } = useEventAnalyticsSummaryQuery(analyticsFilters);

    // Users data for staff table
    const { 
        data: usersData, 
        isLoading: isLoadingUsers,
        refetch: refetchUsers 
    } = useUsersQuery({ include_orders: true });

    const deleteUserMutation = useDeleteUserMutation();

    const handleFiltersChange = (newFilters: EventFilterParams) => {
        setFilters(newFilters);
    };

    const handleEventView = (event: EventEntity) => {
        setSelectedEvent(event);
        // Here you could open a modal or navigate to a detail page
        console.log('Viewing event:', event);
    };

    const handleRefresh = () => {
        refetchEvents();
        refetchAnalytics();
        if (showStaffTable) {
            refetchUsers();
        }
    };

    const handleDeleteUser = async (id: string) => {
        try {
            await deleteUserMutation.mutateAsync(id);
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleDeleteAllUsers = async (selectedUsers: UsersEntity[]) => {
        try {
            const deletePromises = selectedUsers.map(user => 
                user.id ? deleteUserMutation.mutateAsync(user.id) : Promise.resolve()
            );
            await Promise.all(deletePromises);
            toast.success(`${selectedUsers.length} users deleted successfully`);
        } catch (error) {
            toast.error('Error deleting users');
            console.error('Error deleting users:', error);
        }
    };

    const hasActiveFilters = useMemo(() => {
        return !!(filters.search || filters.type || filters.status || 
                 filters.location || filters.user_id || 
                 filters.start_date || filters.end_date);
    }, [filters]);

    // Loading skeleton for stats
    const StatsLoadingSkeleton = () => (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-3 w-32 mt-2" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    return (
        <div className="flex flex-col gap-4 sm:gap-6 p-3 sm:p-4 md:p-6 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                <div className="space-y-1">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">User Activity</h1>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        Manage and track your events, workshops, and promotional activities
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isLoadingEvents || isLoadingAnalytics || isLoadingUsers}
                        className="gap-2"
                    >
                        <RefreshCw className={cn("h-4 w-4", (isLoadingEvents || isLoadingAnalytics || isLoadingUsers) && "animate-spin")} />
                        Refresh
                    </Button>

                </div>
            </div>

            {/* Stats Section */}
            {isLoadingAnalytics ? (
                <StatsLoadingSkeleton />
            ) : (
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Total Events */}
                    <Card className="relative overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Events
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {analyticsData?.total_events || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                All tracked events
                            </p>
                            <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-blue-500 to-blue-600" />
                        </CardContent>
                    </Card>

                    {/* Total Users */}
                    <Card className="relative overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Users
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {analyticsData?.total_users || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Registered users
                            </p>
                            <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-green-500 to-green-600" />
                        </CardContent>
                    </Card>

                    {/* Active Users */}
                    <Card className="relative overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Active Users
                            </CardTitle>
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">
                                {analyticsData?.active_users?.count || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {analyticsData?.active_users?.timeframe || "Recent activity"} 
                            </p>
                            <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-purple-500 to-purple-600" />
                        </CardContent>
                    </Card>


                </div>
            )}

            {/* Filters Section */}
            <UserActivityFilters 
                filters={filters}
                onFiltersChange={handleFiltersChange}
            />

            {/* Main Content */}
            <div className="space-y-4">
                {/* Results Summary */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold">
                            {showStaffTable ? "Staff Management" : `Activities ${hasActiveFilters ? "(Filtered)" : ""}`}
                        </h2>
                        {!showStaffTable && eventsData?.metadata && (
                            <Badge variant="secondary">
                                {eventsData.metadata.total} total
                            </Badge>
                        )}
                        {showStaffTable && usersData && (
                            <Badge variant="secondary">
                                {usersData.length} users
                            </Badge>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {!showStaffTable && hasActiveFilters && (
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleFiltersChange({ page: 1, limit: 10 })}
                                className="gap-2"
                            >
                                <Filter className="h-3 w-3" />
                                Clear Filters
                            </Button>
                        )}
                        
                        <Button 
                            variant={showStaffTable ? "default" : "outline"}
                            size="sm"
                            onClick={() => setShowStaffTable(!showStaffTable)}
                            className="gap-2"
                        >
                            <UsersIcon className="h-3 w-3" />
                            {showStaffTable ? "Back to Activities" : "View List of Users"}
                        </Button>
                    </div>
                </div>

                {/* Error State */}
                {eventsError && !showStaffTable && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="flex items-center gap-2 p-4">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <span className="text-sm text-red-600">
                                Failed to load user activity. Please try again.
                            </span>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleRefresh}
                                className="ml-auto"
                            >
                                Retry
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Content Tables */}
                {showStaffTable ? (
                    // Staff Data Table
                    <div className="space-y-4">
                        {isLoadingUsers ? (
                            <div className="space-y-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-64 w-full" />
                            </div>
                        ) : (
                            <StaffDataTable
                                data={usersData || []}
                                onDeleteAll={handleDeleteAllUsers}
                                onDelete={handleDeleteUser}
                            />
                        )}
                    </div>
                ) : (
                    // Events Table
                    <>
                        <UserActivityDataTable
                            events={eventsData?.events || []}
                            isLoading={isLoadingEvents}
                            filters={filters}
                            onFiltersChange={handleFiltersChange}
                            onEventView={handleEventView}
                        />

                        {/* Pagination */}
                        {eventsData?.metadata && (
                            <UserActivityPagination
                                metadata={eventsData.metadata}
                                filters={filters}
                                onFiltersChange={handleFiltersChange}
                            />
                        )}
                    </>
                )}
            </div>

            {/* Quick Actions Footer */}

        </div>
    );
};

export default UserActivityScreen; 