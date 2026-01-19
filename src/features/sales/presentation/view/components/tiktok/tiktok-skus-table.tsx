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
import { formatCurrency, formatDateToMMDDYYYY, isAdmin } from "@/src/core/constant/helper";
import { ArrowRightIcon } from "lucide-react";
import { skuData } from "@/src/features/sales/data/services/sku-api.service";
import { useRouter } from "next/navigation";
import { ShopifySku } from "@/src/features/sales/data/model/shopify-entity";
import { useSession } from "@/src/core/lib/dummy-session-provider";
import { TiktokSku } from "@/src/features/sales/data/model/tiktok-entity";




const TiktokSkusTable = ({
    skus,
    onSelectTap,
    selectedTab
}: {
    skus: TiktokSku[],
    onSelectTap: () => void,
    selectedTab: string
}) => {

    const router = useRouter();


    const getColorPercentage = (percentage: number) => {
        if (percentage <= 20) {
            return "#10b981"; // green
        }
        return "#8b5cf6"; // purple
    }

    const calculateTotalSales = (sku: SkuEntity) => {
        return sku.sales * sku.quantity;
    }

    const { data: session } = useSession();

    const getStockStatus = (stockQuantity: number) => {
        return stockQuantity > 0 ? (
            <Badge variant="default" className="bg-green-500">In Stock</Badge>
        ) : (
            <Badge variant="destructive">Out of Stock</Badge>
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

                    {
                        selectedTab !== "skus" && (
                            <Button variant="ghost" size="sm" onClick={onSelectTap}>
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
                            {selectedTab === "skus" && (
                                <>
                                    <TableHead>Image</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Revenue</TableHead>
                                    {/* <TableHead>Quantity Percentage</TableHead>
                                    <TableHead>Revenue Percentage</TableHead> */}
                                </>
                            )}
                            {
                                selectedTab !== "skus" && (
                                    <>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Stock</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Revenue</TableHead>
                                        {/* <TableHead>Quantity Percentage</TableHead>
                                        <TableHead>Revenue Percentage</TableHead> */}
                                    </>
                                )
                            }
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            selectedTab === "skus" ? (
                                skus.map((sku: TiktokSku) => (
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
                                        <TableCell>{sku.stock}</TableCell>
                                        <TableCell>{getStockStatus(sku.stock)}</TableCell>
                                        <TableCell className="max-w-[120px] truncate">{sku.quantity}</TableCell>
                                        <TableCell>
                                            {isAdmin(session?.user_entity || {}) ? (
                                                <p>{formatCurrency(Number(sku.revenue))}</p>
                                            ) : (
                                                <p>********</p>
                                            )}
                                        </TableCell>
                                        {/* <TableCell>
                                            <Badge className="ml-2 font-medium px-2.5 py-1 text-xs rounded-md">
                                                {sku.quantity_percentage}%
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className="ml-2 font-medium px-2.5 py-1 text-xs rounded-md"
                                                style={{
                                                    backgroundColor: `${getColorPercentage(Number(sku.revenue_percentage))}20`,
                                                    color: getColorPercentage(Number(sku.revenue_percentage))
                                                }}
                                            >
                                                {sku.revenue_percentage}%
                                            </Badge>
                                        </TableCell> */}
                                    </TableRow>
                                ))
                            ) : (
                                skus.slice(0, 5).map((sku: TiktokSku) => (
                                    <TableRow key={sku.sku}>
                                        <TableCell className="font-medium">{sku.sku}</TableCell>
                                        <TableCell>{sku.stock}</TableCell>
                                        <TableCell>{getStockStatus(sku.stock)}</TableCell>
                                        <TableCell className="max-w-[120px] truncate">{sku.quantity}</TableCell>
                                        <TableCell>
                                            {isAdmin(session?.user_entity || {}) ? (
                                                <p>{formatCurrency(sku.revenue)}</p>
                                            ) : (
                                                <p>********</p>
                                            )}
                                        </TableCell>
                                        {/* <TableCell>
                                            <Badge className="ml-2 font-medium px-2.5 py-1 text-xs rounded-md">
                                                {sku.quantity_percentage}%
                                            </Badge>
                                        </TableCell> */}
                                        {/* <TableCell>
                                            <Badge
                                                className="ml-2 font-medium px-2.5 py-1 text-xs rounded-md"
                                                style={{
                                                    backgroundColor: `${getColorPercentage(Number(sku.revenue_percentage))}20`,
                                                    color: getColorPercentage(Number(sku.revenue_percentage))
                                                }}
                                            >
                                                {sku.revenue_percentage}%
                                            </Badge>
                                        </TableCell> */}
                                    </TableRow>
                                ))
                            )
                        }
                    </TableBody>

                </Table>
            </CardContent>
        </Card>
    )
}

export default TiktokSkusTable;