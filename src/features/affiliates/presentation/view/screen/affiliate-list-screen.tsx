"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, UserCheck, DollarSign, Wallet } from "lucide-react";
import { useGetAffiliatesMetadata, useGetAffiliaters } from "../../../presentation/tanstack/affiliates-tanstack";
import { AffiliatersDataTable } from "../components/affiliaters-data-table";
import { formatCurrency } from "@/src/core/constant/helper";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

const AffiliateListScreen = () => {
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);

    const { data: affiliatesMetadata, isLoading: isLoadingMetadata } = useGetAffiliatesMetadata();
    const { data: affiliatesData, isLoading: isLoadingAffiliaters } = useGetAffiliaters({
        status: statusFilter === "all" ? undefined : statusFilter,
        page: page,
        limit: pageSize
    });

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        setPage(1); // Reset to first page when changing page size
    };

    const StatCardSkeleton = () => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-[80px] mb-1" />
                <Skeleton className="h-4 w-[100px]" />
            </CardContent>
        </Card>
    );

    const TableSkeleton = () => (
        <div className="space-y-4 w-full">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-[200px]" />
                <Skeleton className="h-10 w-[100px]" />
            </div>
            <div className="border rounded-lg w-full">
                <div className="space-y-2 p-4">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            </div>
        </div>
    );

    if (isLoadingMetadata || isLoadingAffiliaters) {
        return (
            <div className="flex flex-col items-start justify-start w-full gap-4 px-8 h-screen">
                {/* Header Skeleton */}
                <div className="flex w-full justify-between items-center pt-8">
                    <div>
                        <Skeleton className="h-8 w-[150px] mb-2" />
                        <Skeleton className="h-4 w-[250px]" />
                    </div>
                    <Skeleton className="h-10 w-[120px]" />
                </div>

                {/* Stats Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                    {[...Array(4)].map((_, i) => (
                        <StatCardSkeleton key={i} />
                    ))}
                </div>

                {/* Table Skeleton */}
                <TableSkeleton />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-start justify-start w-full gap-3 sm:gap-4 px-3 sm:px-4 md:px-6 lg:px-8 h-screen overflow-x-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row w-full justify-between items-start sm:items-center gap-2 sm:gap-0 pt-4 sm:pt-6 md:pt-8">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold">Affiliates</h1>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        Manage your affiliates and their performance
                    </p>
                </div>
                {/* <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Affiliate
                </Button> */}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Affiliates</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="h-4 w-4 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{affiliatesMetadata?.total_users || 0}</div>
                        <p className="text-xs text-muted-foreground">Registered affiliates</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Affiliates</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <UserCheck className="h-4 w-4 text-green-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {affiliatesMetadata?.total_users || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Currently active</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <Wallet className="h-4 w-4 text-purple-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            RM {affiliatesMetadata?.total_commission.toFixed(2) || "0.00"}
                        </div>
                        <p className="text-xs text-muted-foreground">Total commissions paid</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Unpaid Commissions</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-yellow-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            RM {affiliatesMetadata?.total_unpaid_commission.toFixed(2) || "0.00"}
                        </div>
                        <p className="text-xs text-muted-foreground">Total unpaid commissions</p>
                    </CardContent>
                </Card>
            </div>

            {/* Data Table */}
            <AffiliatersDataTable
                data={affiliatesData?.users || []}
                selectedStatus={statusFilter}
                onStatusChange={setStatusFilter}
                currentPage={page}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                totalPages={affiliatesData?.metadata.total_pages || 1}
            />
        </div>
    );
};

export default AffiliateListScreen; 