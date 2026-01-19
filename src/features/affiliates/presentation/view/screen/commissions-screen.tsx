"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Users, Target, TrendingUp, Download } from "lucide-react";
import { formatCurrency } from "@/src/core/constant/helper";
import { useGetCommissionMetadata, useGetCommissionHistory } from "../../tanstack/affiliates-tanstack";
import { Skeleton } from "@/components/ui/skeleton";
import CommissionsDataTable from "../components/commissions-data-table";
import * as XLSX from 'xlsx';

// Helper function to format date
const formatDateToYYYYMMDD = (dateString: string | Date): string => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toISOString().split('T')[0];
};

const CommissionsScreen = () => {
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);

    const { data: metadata, isLoading: isLoadingMetadata } = useGetCommissionMetadata();
    const { data: commissionHistory, isLoading: isLoadingHistory } = useGetCommissionHistory({
        page: currentPage,
        limit: pageSize,
        is_paid: statusFilter === "PAID" ? true : statusFilter === "PENDING" ? false : undefined
    });

    const handleStatusChange = (status: string) => {
        setStatusFilter(status);
        setCurrentPage(1); // Reset to first page when changing filters
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1); // Reset to first page when changing page size
    };

    const handleExport = () => {
        if (!commissionHistory?.data?.commissions || commissionHistory.data.commissions.length === 0) return;

        const formattedData = commissionHistory.data.commissions.map(commission => ({
            'Affiliate Name': `${commission.user_affiliate?.first_name || ''} ${commission.user_affiliate?.last_name || ''}`.trim() || 'N/A',
            'Affiliate Email': commission.user_affiliate?.email || 'N/A',
            'Order ID': commission.order_id || 'N/A',
            'Total Sales': commission.total_sales || 0,
            'Commission': commission.commission || 0,
            'Quantity': commission.quantity || 0,
            'Source': commission.source || 'N/A',
            'Status': commission.is_paid ? 'Paid' : 'Pending',
            'Created At': commission.created_at ? formatDateToYYYYMMDD(commission.created_at) : 'N/A',
            'Updated At': commission.updated_at ? formatDateToYYYYMMDD(commission.updated_at) : 'N/A'
        }));

        const worksheet = XLSX.utils.json_to_sheet(formattedData);

        // Set column widths
        const wscols = [
            { wch: 25 }, // Affiliate Name
            { wch: 30 }, // Affiliate Email
            { wch: 20 }, // Order ID
            { wch: 15 }, // Total Sales
            { wch: 15 }, // Commission
            { wch: 10 }, // Quantity
            { wch: 15 }, // Source
            { wch: 10 }, // Status
            { wch: 20 }, // Created At
            { wch: 20 }, // Updated At
        ];
        worksheet['!cols'] = wscols;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Commissions_History");

        // Generate filename with current date
        const now = new Date();
        const filename = `commissions_history_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.xlsx`;

        XLSX.writeFile(workbook, filename);
    };

    return (
        <div className="flex flex-col items-start justify-center w-full gap-4 px-4">
            {/* Header */}
            <div className="flex w-full justify-between items-center pt-8">
                <div className="flex flex-col items-start justify-center">
                    <h1 className="text-2xl font-bold">Commissions</h1>
                    <p className="text-sm text-muted-foreground">
                        View and manage your affiliate commissions
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="flex items-center gap-2" onClick={handleExport}>
                        <Download className="h-4 w-4" />
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoadingMetadata ? (
                            <Skeleton className="h-8 w-[100px]" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">RM {metadata?.total_commissions.toFixed(2) || "0.00"}</div>
                                <p className="text-xs text-muted-foreground">
                                    All time commissions
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Approved Commissions</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoadingMetadata ? (
                            <Skeleton className="h-8 w-[100px]" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">RM {metadata?.approved_commissions.toFixed(2) || "0.00"}</div>
                                <p className="text-xs text-muted-foreground">
                                    Ready for payout
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Commissions</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                            <Target className="h-4 w-4 text-yellow-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoadingMetadata ? (
                            <Skeleton className="h-8 w-[100px]" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">RM {metadata?.pending_commissions.toFixed(2) || "0.00"}</div>
                                <p className="text-xs text-muted-foreground">
                                    Awaiting approval
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <Users className="h-4 w-4 text-purple-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoadingMetadata ? (
                            <Skeleton className="h-8 w-[100px]" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">RM {metadata?.total_sales.toFixed(2) || "0.00"}</div>
                                <p className="text-xs text-muted-foreground">
                                    From affiliate sales
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Commission Details */}
            <div className="w-full">
                {isLoadingHistory ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full" />
                        ))}
                    </div>
                ) : (
                    <CommissionsDataTable
                        data={commissionHistory?.data?.commissions || []}
                        selectedStatus={statusFilter}
                        onStatusChange={handleStatusChange}
                        pageCount={commissionHistory?.data?.metadata?.total_pages || 1}
                        pageSize={pageSize}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                    />
                )}
            </div>
        </div>
    );
};

export default CommissionsScreen; 