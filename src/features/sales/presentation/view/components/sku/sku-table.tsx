"use client"
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableCell,
    TableHead,
    TableFooter
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SkuEntity } from "@/src/features/sales/data/model/sku-entity";
import { ArrowRightIcon, Loader2 } from "lucide-react";
import { skuData } from "@/src/features/sales/data/services/sku-api.service";
import { useRouter } from "next/navigation";
import { AnalysisSKUEntity } from "@/src/features/sales/data/model/analytics-entity";
import { BADFAMILY } from "dns";
import { capitalizeFirstLetter, getPlatformName, isAdmin } from "@/src/core/constant/helper";
import { useSession } from "@/src/core/lib/dummy-session-provider";




//format currency to RM
const formatCurrency = (value: number) => {
    return `RM${value.toFixed(2)}`;
}

const SkuTable = ({ data, isLimit, isLoading }: { data: AnalysisSKUEntity[], isLimit: boolean, isLoading: boolean }) => {

    const router = useRouter();

    const { data: session } = useSession();



    const getPercentageColor = (percentage: number) => {
        if (percentage >= 80) return '#ef4444'; // red-500 (high)
        if (percentage >= 50) return '#f59e0b'; // amber-500 (medium-high)
        if (percentage >= 30) return '#22c55e'; // green-500 (medium)
        if (percentage >= 10) return '#3b82f6'; // blue-500 (medium-low)
        return '#6b7280'; // gray-500 (low)
    };

    const calculateTotalSales = (sku: SkuEntity) => {
        return sku.sales * sku.quantity;
    }

    return (
        <Card className="hover:shadow-lg transition-shadow h-full w-full">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex flex-col items-start">
                        <p className="text-lg font-bold">Top Performing SKUs</p>
                        <p className="text-sm text-muted-foreground font-normal">Here is the top performing SKUs</p>
                    </div>

                    {isLimit && (
                        <Button variant="ghost" size="sm" onClick={() => router.push("/sales/sku")}>
                            <span className="hidden md:inline-block">View All</span>
                            <ArrowRightIcon className="h-4 w-4" />
                        </Button>
                    )}
                </CardTitle>

            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>SKU</TableHead>
                            <TableHead className="text-right">Quantity</TableHead>
                            <TableHead className="text-right">Sales</TableHead>
                            <TableHead>Percentage</TableHead>
                            <TableHead>Platform</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">
                                    <p className="text-muted-foreground text-sm">Loading...</p>

                                </TableCell>
                            </TableRow>
                        ) : isLimit ? data.slice(0, 5).map((sku, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{sku.sku}</TableCell>
                                <TableCell className="text-right">{sku.quantity}</TableCell>
                                <TableCell className="text-right">
                                    {isAdmin(session?.user_entity || {}) ? (
                                        <p>{formatCurrency(sku.revenue || 0)}</p>
                                    ) : (
                                        <p>********</p>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        className="ml-2 font-medium px-2.5 py-1 text-xs rounded-md"
                                        style={{
                                            backgroundColor: `${getPercentageColor(Number(sku.revenue_percentage))}20`,
                                            color: getPercentageColor(Number(sku.revenue_percentage))
                                        }}
                                    >
                                        {sku.revenue_percentage}%
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className="text-xs"
                                        style={{
                                            backgroundColor: getPlatformName(sku.type || '').color,
                                            color: 'white'
                                        }}
                                    >
                                        {capitalizeFirstLetter(sku.type || '')}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        )) : data.map((sku, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{sku.sku}</TableCell>
                                <TableCell className="text-right">{sku.quantity}</TableCell>
                                <TableCell className="text-right">
                                    {isAdmin(session?.user_entity || {}) ? (
                                        <p>{formatCurrency(sku.revenue || 0)}</p>
                                    ) : (
                                        <p>********</p>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        className="ml-2 font-medium px-2.5 py-1 text-xs rounded-md"
                                        style={{
                                            backgroundColor: `${getPercentageColor(Number(sku.revenue_percentage))}20`,
                                            color: getPercentageColor(Number(sku.revenue_percentage))
                                        }}
                                    >
                                        {sku.revenue_percentage}%
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className="text-xs"
                                        style={{
                                            backgroundColor: getPlatformName(sku.type || '').color,
                                            color: 'white'
                                        }}
                                    >
                                        {capitalizeFirstLetter(sku.type || '')}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export default SkuTable;