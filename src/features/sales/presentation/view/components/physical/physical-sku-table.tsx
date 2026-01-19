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
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, isAdmin } from "@/src/core/constant/helper";
import { ArrowRightIcon } from "lucide-react";
import { AnalysisSKUEntity } from "@/src/features/sales/data/model/analytics-entity";
import { useSession } from "@/src/core/lib/dummy-session-provider";
import { PhysicalStockEntity } from "@/src/features/sales/data/model/physical/products-entity";
const PhysicalSkusTable = ({
    skus,
    onSelectTap,
    selectedTab,
    stock
}: {
    skus: AnalysisSKUEntity[],
    onSelectTap: () => void,
    selectedTab: string,
    stock: PhysicalStockEntity[]
}) => {
    const getColorPercentage = (percentage: number) => {
        if (percentage <= 20) {
            return "#10b981"; // green
        }
        return "#8b5cf6"; // purple
    }

    const getStockQuantity = (skuName: string) => {
        return stock
            .filter(item => item.sku === skuName)
            .reduce((total, item) => total + item.inventory_quantity, 0);
    };

    const getStockStatus = (stockQuantity: number) => {
        return stockQuantity > 0 ? (
            <Badge variant="default" className="bg-green-500 text-white">In Stock</Badge>
        ) : (
            <Badge variant="destructive" className="text-white">Out of Stock</Badge>
        );
    };

    const { data: session } = useSession();

    return (
        <Card className="hover:shadow-lg transition-shadow h-full w-full">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex flex-col items-start">
                        <p className="text-lg font-bold">Top Performing Physical SKUs</p>
                        <p className="text-sm text-muted-foreground font-normal">Here is the top performing physical SKUs</p>
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
                                    <TableHead>Name</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Revenue</TableHead>
                                    <TableHead>Quantity Percentage</TableHead>
                                    <TableHead>Revenue Percentage</TableHead>
                                </>
                            ) : (
                                <>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Revenue</TableHead>
                                    <TableHead>Quantity Percentage</TableHead>
                                </>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {selectedTab === "skus" ? (
                            skus.map((sku: AnalysisSKUEntity, index: number) => {
                                const stockQuantity = getStockQuantity(sku.sku || '');
                                return (
                                    <TableRow key={sku.sku ? sku.sku + index : index}>
                                        <TableCell>
                                            {sku.image && (
                                                <img
                                                    src={sku.image}
                                                    alt={sku.sku || ''}
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">{sku.sku}</TableCell>
                                        <TableCell>{sku.name}</TableCell>
                                        <TableCell>{stockQuantity}</TableCell>
                                        <TableCell>{getStockStatus(stockQuantity)}</TableCell>
                                        <TableCell>{sku.quantity}</TableCell>
                                        <TableCell>
                                            {isAdmin(session?.user_entity || {}) ? (
                                                <p>{formatCurrency(sku.revenue || 0)}</p>
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
                                );
                            })
                        ) : (
                            skus.slice(0, 5).map((sku: AnalysisSKUEntity, index: number) => {
                                const stockQuantity = getStockQuantity(sku.sku || '');
                                return (
                                    <TableRow key={sku.sku ? sku.sku + index : index}>
                                        <TableCell className="font-medium">{sku.sku || ''}</TableCell>
                                        <TableCell>{sku.name || ''}</TableCell>
                                        <TableCell>{stockQuantity}</TableCell>
                                        <TableCell>{getStockStatus(stockQuantity)}</TableCell>
                                        <TableCell>{sku.quantity || 0}</TableCell>
                                        {/* <TableCell>
                                            {isAdmin(session?.user_entity || {}) ? (
                                                <p>{formatCurrency(sku.revenue || 0)}</p>
                                            ) : (
                                                <p>********</p>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className="ml-2 font-medium px-2.5 py-1 text-xs rounded-md">
                                                {sku.quantity_percentage}%
                                            </Badge>
                                        </TableCell> */}
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

export default PhysicalSkusTable;
