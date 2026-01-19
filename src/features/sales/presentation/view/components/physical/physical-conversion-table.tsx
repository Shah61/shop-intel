"use client"

import { useQuery } from "@tanstack/react-query"
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableCell,
    TableHead
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDateToMMDDYYYY, isAdmin } from "@/src/core/constant/helper"
import { ArrowRightIcon } from "lucide-react"
import { AnalyticsSalesEntity } from "@/src/features/sales/data/model/analytics-entity"
import { useSession } from "@/src/core/lib/dummy-session-provider"
import { usePhysicalOverviewConversionRateList } from "../../../tanstack/physical/overview-tanstack"
import DialogPhysicalConversionTable from "./dialog-physical-conversion-table"

export function PhysicalConversionTable({ isLimit = true }: { isLimit: boolean }) {
    const { data: session } = useSession();

    const {
        data:
        conversionData,
        isLoading,
        error } = usePhysicalOverviewConversionRateList();


    if (isLoading) {
        return (
            <Card className="hover:shadow-lg transition-shadow h-full w-full">
                <CardContent className="flex items-center justify-center min-h-[350px]">
                    <p>Loading conversion data...</p>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card className="hover:shadow-lg transition-shadow h-full w-full">
                <CardContent className="flex items-center justify-center min-h-[350px]">
                    <p className="text-red-500">Failed to fetch conversion data</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="hover:shadow-lg transition-shadow h-full w-full">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex flex-col items-start">
                        <p className="text-lg font-bold">Physical Store Conversion List</p>
                        <p className="text-sm text-muted-foreground font-normal">Conversion rate for each date</p>
                    </div>

                    {/* <Button variant="ghost" size="sm">
                        <span className="hidden md:inline-block">View All</span>
                        <ArrowRightIcon className="h-4 w-4" />
                    </Button> */}
                    {isLimit ? <DialogPhysicalConversionTable /> : null}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Revenue</TableHead>
                            <TableHead>Orders</TableHead>
                            {/* <TableHead>Conversion Rate</TableHead> */}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {conversionData?.slice(0, isLimit ? 7 : conversionData.length).map((conversion: any) => (
                            <TableRow key={conversion.date}>
                                <TableCell className="font-medium">
                                    {conversion.date ? formatDateToMMDDYYYY(conversion.date) : 'N/A'}
                                </TableCell>
                                <TableCell className="max-w-[120px] truncate">
                                    {isAdmin(session?.user_entity || {}) ? (
                                        <p>{formatCurrency(conversion.total_revenues || 0)}</p>
                                    ) : (
                                        <p>********</p>
                                    )}
                                </TableCell>
                                <TableCell>{conversion.total_orders}</TableCell>
                                {/* <TableCell>
                                    <Badge variant={conversion.total_conversions ? (conversion.total_conversions / conversion.total_orders! * 100) <= 20 ? "default" : "secondary" : "default"}>
                                        {conversion.total_conversions ? (conversion.total_conversions / conversion.total_orders! * 100).toFixed(1) : '0'}%
                                    </Badge>
                                </TableCell> */}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}