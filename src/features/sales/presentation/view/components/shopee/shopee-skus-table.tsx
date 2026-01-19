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
import { formatCurrency, isAdmin } from "@/src/core/constant/helper";
import { ArrowRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { ShopeeSku } from "@/src/features/sales/data/model/shopee-entity";
import { useSession } from "@/src/core/lib/dummy-session-provider";

const ShopeeSkusTable = ({
    skus,
    onSelectTap,
    selectedTab
}: {
    skus: ShopeeSku[],
    onSelectTap: () => void,
    selectedTab: string
}) => {
    const router = useRouter();
    const { data: session } = useSession();

    const getColorPercentage = (percentage: number) => {
        if (percentage <= 20) {
            return "#10b981"; // green
        }
        return "#8b5cf6"; // purple
    }

    const getStockStatus = (stockQuantity: number) => {
        return stockQuantity > 0 ? (
            <Badge variant="default" className="bg-green-500 text-white">In Stock</Badge>
        ) : (
            <Badge variant="destructive" className="text-white">Out of Stock</Badge>
        );
    };

    return (
        <Card className="hover:shadow-lg transition-shadow h-full w-full">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex flex-col items-start">
                        <p className="text-lg font-bold">Top Performing SKUs</p>
                        <p className="text-sm text-muted-foreground font-normal">Here is the top performing SKUs</p>
                    </div>

                    {selectedTab !== "skus" && (
                        <Button variant="ghost" size="sm" onClick={onSelectTap}>
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
                            {selectedTab === "skus" ? (
                                <>
                                    <TableHead>Image</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Revenue</TableHead>
                                    <TableHead>Views</TableHead>
                                    {/* <TableHead>Conversion Rate</TableHead> */}
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Status</TableHead>
                                </>
                            ) : (
                                <>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Revenue</TableHead>
                                    <TableHead>Views</TableHead>
                                    {/* <TableHead>Conversion Rate</TableHead> */}
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Status</TableHead>
                                </>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {selectedTab === "skus" ? (
                            skus.map((sku: ShopeeSku) => {
                                const stockQuantity = sku.stocks < 0 ? 0 : sku.stocks;
                                return (
                                    <TableRow key={sku.sku}>
                                        <TableCell>
                                            {sku.image && (
                                                <img
                                                    src={sku.image}
                                                    alt={sku.sku}
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">{sku.sku}</TableCell>
                                        <TableCell className="max-w-[120px] truncate">{sku.quantity}</TableCell>
                                        <TableCell>
                                            {isAdmin(session?.user_entity || {}) ? (
                                                <p>{formatCurrency(Number(sku.revenue))}</p>
                                            ) : (
                                                <p>********</p>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className="ml-2 font-medium px-2.5 py-1 text-xs rounded-md">
                                                {sku.views}
                                            </Badge>
                                        </TableCell>
                                        {/* <TableCell>
                                            <Badge
                                                className="ml-2 font-medium px-2.5 py-1 text-xs rounded-md"
                                                style={{
                                                    backgroundColor: `${getColorPercentage(Number(sku.conversion_rate))}20`,
                                                    color: getColorPercentage(Number(sku.conversion_rate))
                                                }}
                                            >
                                                {sku.conversion_rate}%
                                            </Badge>
                                        </TableCell> */}
                                        <TableCell>{stockQuantity}</TableCell>
                                        <TableCell>{getStockStatus(stockQuantity)}</TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            skus.slice(0, 5).map((sku: ShopeeSku) => {
                                const stockQuantity = sku.stocks < 0 ? 0 : sku.stocks;
                                return (
                                    <TableRow key={sku.sku}>
                                        <TableCell className="font-medium">{sku.sku}</TableCell>
                                        <TableCell className="max-w-[120px] truncate">{sku.quantity}</TableCell>
                                        <TableCell>
                                            {isAdmin(session?.user_entity || {}) ? (
                                                <p>{formatCurrency(sku.revenue)}</p>
                                            ) : (
                                                <p>********</p>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className="ml-2 font-medium px-2.5 py-1 text-xs rounded-md">
                                                {sku.views}
                                            </Badge>
                                        </TableCell>
                                        {/* <TableCell>
                                            <Badge
                                                className="ml-2 font-medium px-2.5 py-1 text-xs rounded-md"
                                                style={{
                                                    backgroundColor: `${getColorPercentage(Number(sku.conversion_rate))}20`,
                                                    color: getColorPercentage(Number(sku.conversion_rate))
                                                }}
                                            >
                                                {sku.conversion_rate}%
                                            </Badge>
                                        </TableCell> */}
                                        <TableCell>{stockQuantity}</TableCell>
                                        <TableCell>{getStockStatus(stockQuantity)}</TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export default ShopeeSkusTable;