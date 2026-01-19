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
import { formatCurrency, formatDateToMMDDYYYY, isAdmin } from "@/src/core/constant/helper";
import { ArrowRightIcon } from "lucide-react";
import { ShopifyConversionRate } from "@/src/features/sales/data/model/shopify-entity";
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

const ShopifyConversionTable = (
    { conversionRate,
        onSelectTap,
        selectedTab
    }:
        {
            conversionRate: ShopifyConversionRate[],
            onSelectTap: () => void,
            selectedTab: string
        }) => {


    const { data: session } = useSession()
    const isUserAdmin = isAdmin(session?.user_entity || {})

    return (
        <Card className="hover:shadow-lg transition-shadow h-full w-full">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex flex-col items-start">
                        <p className="text-lg font-bold">List Conversion</p>
                        <p className="text-sm text-muted-foreground font-normal">Conversion rate for each date</p>
                    </div>

                    {
                        selectedTab !== "campaigns" && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onSelectTap}
                            >
                                <span className="hidden md:inline-block">View All</span>
                                <ArrowRightIcon className="h-4 w-4" />
                            </Button>
                        )
                    }
                </CardTitle>

            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Revenus</TableHead>
                            <TableHead>Orders</TableHead>
                            {/* <TableHead>Conversion</TableHead> */}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {selectedTab === "campaigns" ? (
                            conversionRate.map((conversion) => (
                                <TableRow key={conversion.date}>
                                    <TableCell className="font-medium">{formatDateToMMDDYYYY(conversion.date)}</TableCell>
                                    <TableCell>{formatCurrency(conversion.total_revenues)}</TableCell>
                                    <TableCell>{conversion.total_orders}</TableCell>

                                    {/* <TableCell>
                                        <Badge variant={conversion.conversion_rate <= 20 ? "default" : "secondary"}>
                                            {conversion.conversion_rate}
                                        </Badge>
                                    </TableCell> */}
                                </TableRow>
                            ))
                        ) : (
                            conversionRate.slice(0, 7).map((conversion) => (
                                <TableRow key={conversion.date}>
                                    <TableCell className="font-medium">{formatDateToMMDDYYYY(conversion.date)}</TableCell>
                                    <TableCell>{formatCurrency(conversion.total_revenues)}</TableCell>
                                    <TableCell>{conversion.total_orders}</TableCell>

                                    {/* <TableCell>
                                        <Badge variant={conversion.conversion_rate <= 20 ? "default" : "secondary"}>
                                            {conversion.conversion_rate}
                                        </Badge>
                                    </TableCell> */}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export default ShopifyConversionTable;
