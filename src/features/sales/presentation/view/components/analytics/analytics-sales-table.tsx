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
    TableHead
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ConversionEntity } from "@/src/features/sales/data/model/conversion-entity";
import { capitalizeFirstLetter, formatCurrency, formatDateToMMDDYYYY, getPlatformName, isAdmin } from "@/src/core/constant/helper";
import { ArrowRightIcon } from "lucide-react";
import { TiktokConversionRate } from "@/src/features/sales/data/model/tiktok-entity";
import { AnalyticsSalesEntity } from "@/src/features/sales/data/model/analytics-entity";
import DialogAnalyticsSalesTable from "./dialog-analytics-sales-table";
import { useSession } from "@/src/core/lib/dummy-session-provider";



// const conversionData: ConversionEntity[] = [
//     { visitors: 234, orders: 45, conversionRate: 19.2, date: "03/14/2024" },
//     { visitors: 567, orders: 89, conversionRate: 15.7, date: "03/15/2024" },
//     { visitors: 432, orders: 67, conversionRate: 15.5, date: "03/16/2024" },
//     { visitors: 789, orders: 156, conversionRate: 19.8, date: "03/17/2024" },
//     { visitors: 345, orders: 78, conversionRate: 22.6, date: "03/18/2024" },
//     { visitors: 678, orders: 134, conversionRate: 19.8, date: "03/19/2024" },
//     { visitors: 456, orders: 98, conversionRate: 21.5, date: "03/20/2024" },
// ];

const AnalyticsSalesTable = ({
    data,
    isLimit
}: {
    data: AnalyticsSalesEntity[]
    isLimit: boolean
}) => {
    // Combine data by date
    const combinedData = data.reduce((acc, curr) => {
        const existingEntry = acc.find(item => formatDateToMMDDYYYY(item.date || '') === formatDateToMMDDYYYY(curr.date || ''));

        if (existingEntry) {
            existingEntry.total_visitors = (existingEntry.total_visitors || 0) + (curr.total_visitors || 0);
            existingEntry.total_orders = (existingEntry.total_orders || 0) + (curr.total_orders || 0);
            existingEntry.total_revenues = (existingEntry.total_revenues || 0) + (curr.total_revenues || 0);
            existingEntry.platforms = [...(existingEntry.platforms || []), curr.type || ''];
        } else {
            acc.push({
                ...curr,
                platforms: [curr.type || '']
            });
        }
        return acc;
    }, [] as (AnalyticsSalesEntity & { platforms?: string[] })[]).sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime());


    const limitData = isLimit ? combinedData.slice(0, 5) : combinedData;


    const { data: session } = useSession();

    return (
        <Card className="hover:shadow-lg transition-shadow h-full w-full">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex flex-col items-start">
                        <p className="text-lg font-bold">List Conversion</p>
                        <p className="text-sm text-muted-foreground font-normal">Conversion rate for each date</p>
                    </div>

                    {isLimit && <DialogAnalyticsSalesTable />}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Platform</TableHead>
                            {/* <TableHead>Visitors</TableHead> */}
                            <TableHead>Orders</TableHead>
                            <TableHead>Revenues</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>

                        {limitData.map((conversion, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">
                                    <p className="text-xs font-bold">{conversion.date}</p>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 flex-wrap">
                                        {conversion.platforms?.map((platform, i) => (
                                            <Badge
                                                key={i}
                                                variant="secondary"
                                                style={{ backgroundColor: getPlatformName(platform).color }}
                                            >
                                                <p className="text-xs font-bold text-white">{capitalizeFirstLetter(platform)}</p>
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                {/* <TableCell className="max-w-[120px] truncate">
                                    {conversion.total_visitors}
                                </TableCell> */}
                                <TableCell>{conversion.total_orders}</TableCell>
                                <TableCell>
                                    {isAdmin(session?.user_entity || {}) ? (
                                        <p>
                                            {conversion.total_revenues ? formatCurrency(conversion.total_revenues) : '0'}
                                        </p>
                                    ) : (
                                        <p>********</p>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export default AnalyticsSalesTable;