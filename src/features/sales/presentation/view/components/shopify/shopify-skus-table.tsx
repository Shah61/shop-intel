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
import { getSkuData } from "@/src/features/sales/data/services/sku-api.service";
import { useRouter } from "next/navigation";
import { ShopifySku, ShopifyStock } from "@/src/features/sales/data/model/shopify-entity";
import { useSession } from "@/src/core/lib/dummy-session-provider";




const ShopifySkusTable = ({
    skus,
    stock,
    onSelectTap,
    selectedTab,
    isLoading
}: {
    skus: ShopifySku[],
    stock: ShopifyStock[],
    onSelectTap: () => void,
    selectedTab: string,
    isLoading: boolean
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

    const getStockQuantity = (skuName: string) => {
        const result = stock
            .filter(item => item.sku === skuName)
            .reduce((total, item) => total + item.inventory_quantity, 0);
        return result < 0 ? 0 : result;
    };

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
                                    </>
                                )
                            }
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={selectedTab === "skus" ? 8 : 7} className="text-center py-8">
                                    <div className="flex justify-center">
                                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            selectedTab === "skus" ? (
                                skus.map((sku: ShopifySku) => {
                                    const stockQuantity = getStockQuantity(sku.sku);
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
                                            <TableCell>{stockQuantity}</TableCell>
                                            <TableCell>{getStockStatus(stockQuantity)}</TableCell>
                                            <TableCell className="max-w-[120px] truncate">{sku.quantity}</TableCell>
                                            <TableCell>
                                                {isAdmin(session?.user_entity || {}) ? (
                                                    <p>{formatCurrency(Number(sku.revenue))}</p>
                                                ) : (
                                                    <p>********</p>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                skus.slice(0, 5).map((sku: ShopifySku) => {
                                    const stockQuantity = getStockQuantity(sku.sku);
                                    return (
                                        <TableRow key={sku.sku}>
                                            <TableCell className="font-medium">{sku.sku}</TableCell>
                                            <TableCell>{stockQuantity}</TableCell>
                                            <TableCell>{getStockStatus(stockQuantity)}</TableCell>
                                            <TableCell className="max-w-[120px] truncate">{sku.quantity}</TableCell>
                                            <TableCell>
                                                {isAdmin(session?.user_entity || {}) ? (
                                                    <p>{formatCurrency(sku.revenue)}</p>
                                                ) : (
                                                    <p>********</p>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )
                        )}
                    </TableBody>

                </Table>
            </CardContent>
        </Card>
    )
}

export default ShopifySkusTable;