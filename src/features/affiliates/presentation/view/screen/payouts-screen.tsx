"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Plus, Calendar, DollarSign, Clock, TrendingUp, ArrowDownUp } from "lucide-react";
import { formatCurrency } from "@/src/core/constant/helper";
import { useGetPayoutsMetadata, useGetPayoutsHistory } from "../../../presentation/tanstack/affiliates-tanstack";
import { PayoutsHistoryDataTable } from "../components/payouts-history-data-table";
import { Skeleton } from "@/components/ui/skeleton";
import * as XLSX from 'xlsx';


// Helper function to format date
const formatDateToYYYYMMDD = (dateString: string | Date): string => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toISOString().split('T')[0];
};


const PayoutsScreen = () => {
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [minAmount, setMinAmount] = useState<number | undefined>();
    const [maxAmount, setMaxAmount] = useState<number | undefined>();

    const { data: payoutsMetadata, isLoading: isLoadingMetadata } = useGetPayoutsMetadata();
    const { data: payoutsHistory, isLoading: isLoadingHistory } = useGetPayoutsHistory({
        status: statusFilter === "all" ? undefined : statusFilter,
        page: currentPage,
        limit: pageSize,
        min_amount: minAmount,
        max_amount: maxAmount
    });

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1); // Reset to first page when changing page size
    };

    const handleAmountFilterChange = (min: number | undefined, max: number | undefined) => {
        setMinAmount(min);
        setMaxAmount(max);
        setCurrentPage(1); // Reset to first page when changing filters
    };

    const handleExport = () => {
        if (!payoutsHistory?.data?.payout_histories || payoutsHistory.data.payout_histories.length === 0) return;

        const formattedData = payoutsHistory.data.payout_histories.map(payout => ({
            'Affiliate Name': `${payout.user_affiliate?.first_name || ''} ${payout.user_affiliate?.last_name || ''}`.trim() || 'N/A',
            'Affiliate Email': payout.user_affiliate?.email || 'N/A',
            'Total Payout Amount': payout.payout_amount || 0,
            'Bank Name': payout.user_affiliate?.bank_detail?.bank_name || 'N/A',
            'Account Number': payout.user_affiliate?.bank_detail?.account_number || 'N/A',
            'Account Holder': payout.user_affiliate?.bank_detail?.account_holder || 'N/A',
            'Created At': payout.created_at ? formatDateToYYYYMMDD(payout.created_at) : 'N/A',
            'Updated At': payout.updated_at ? formatDateToYYYYMMDD(payout.updated_at) : 'N/A',
            'Staff Email': payout.user?.email || 'N/A'
        }));

        const worksheet = XLSX.utils.json_to_sheet(formattedData);

        // Set column widths
        const wscols = [
            { wch: 25 }, // Affiliate Name
            { wch: 30 }, // Affiliate Email
            { wch: 20 }, // Total Payout Amount
            { wch: 20 }, // Total Commission Amount
            { wch: 20 }, // Unpaid Commission Amount
            { wch: 15 }, // Payment Method
            { wch: 15 }, // Status
            { wch: 15 }, // Payout Date
            { wch: 30 }, // Approved By
        ];
        worksheet['!cols'] = wscols;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Payouts_History");

        // Generate filename with current date
        const now = new Date();
        const filename = `payouts_history_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.xlsx`;

        XLSX.writeFile(workbook, filename);
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
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-[100px]" />
                    <Skeleton className="h-10 w-[100px]" />
                </div>
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

    if (isLoadingMetadata || isLoadingHistory) {
        return (
            <div className="flex flex-col items-start justify-start w-full gap-4 px-8 h-screen">
                {/* Header Skeleton */}
                <div className="flex w-full justify-between items-center pt-8">
                    <div>
                        <Skeleton className="h-8 w-[150px] mb-2" />
                        <Skeleton className="h-4 w-[250px]" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-[120px]" />
                        <Skeleton className="h-10 w-[120px]" />
                    </div>
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
        <div className="flex flex-col items-start justify-start w-full gap-4 px-8 h-screen">
            {/* Header */}
            <div className="flex w-full justify-between items-center pt-8">
                <div>
                    <h1 className="text-2xl font-bold">Payouts</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage affiliate payouts and transactions
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Schedule Payout
                    </Button>
                    <Button className="flex items-center gap-2" onClick={handleExport}>
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">RM {payoutsMetadata?.total_payout.toFixed(2) || "0.00"}</div>
                        <p className="text-xs text-muted-foreground">All time payouts</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                            <Clock className="h-4 w-4 text-yellow-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">RM {payoutsMetadata?.pending_payout.toFixed(2) || "0.00"}</div>
                        <p className="text-xs text-muted-foreground">Awaiting processing</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Paid This Month</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">RM {payoutsMetadata?.paid_this_month.toFixed(2) || "0.00"}</div>
                        <p className="text-xs text-muted-foreground">Current month payouts</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <ArrowDownUp className="h-4 w-4 text-purple-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{payoutsMetadata?.total_transactions || 0}</div>
                        <p className="text-xs text-muted-foreground">Processed transactions</p>
                    </CardContent>
                </Card>
            </div>

            {/* Data Table */}
            <div className="w-full">
                <PayoutsHistoryDataTable
                    data={payoutsHistory?.data?.payout_histories || []}
                    selectedStatus={statusFilter}
                    onStatusChange={setStatusFilter}
                    pageCount={payoutsHistory?.data?.metadata?.total_pages || 1}
                    pageSize={pageSize}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    onAmountFilterChange={handleAmountFilterChange}
                />
            </div>
        </div>
    );
};

export default PayoutsScreen; 