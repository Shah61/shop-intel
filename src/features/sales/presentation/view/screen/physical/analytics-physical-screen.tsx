"use client"

import { Package, DollarSign, ShoppingCart, MoreHorizontal, PlusIcon, ArrowRightIcon } from "lucide-react"
import DataCard from "@/src/core/shared/view/components/data-card"
import { useEffect, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import Image from "next/image"
import { useRouter } from "next/navigation"

// Import UI components
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

// Import API service functions
import { ProductEntity } from "@/src/features/sales/data/model/physical/products-entity"
import { useDeleteProductMutation, useProductsQuery } from "@/src/features/sales/presentation/tanstack/physical/products-tanstack"

import { findListOfSkusInAProduct, findTotalQuantityOfAllVariantsInAProduct, formatCurrency, getDataDescription, isAdmin } from "@/src/core/constant/helper"
import { Badge } from "@/components/ui/badge"
import { PhysicalConversionCharts } from "../../components/physical/physical-conversion-charts"
import { PhysicalConversionTable } from "../../components/physical/physical-conversion-table"
import ProductForm from "../../components/products/add-product"
import { usePhysicalOverviewMetadata } from "../../../tanstack/physical/overview-tanstack"
import { useSession } from "@/src/core/lib/dummy-session-provider"
import AIAssistantDialog from "@/src/core/shared/view/components/ai-assistant-dialog"
import DialogPhysicalConversionTable from "../../components/physical/dialog-physical-conversion-table"
import { AnalysisTimeFrame } from "@/src/features/sales/data/model/analytics-entity"

const AnalyticsPhysicalScreen = ({ setActiveTab, setTimeframe, timeframe }: { setActiveTab: (tab: string) => void, setTimeframe: (timeframe: AnalysisTimeFrame) => void, timeframe: AnalysisTimeFrame }) => {


    const router = useRouter()
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<ProductEntity | null>(null)
    const deleteProductMutation = useDeleteProductMutation();

    // Fetch products data
    const { data: products, isLoading, error } = useProductsQuery()

    const {
        data: metadata,
        isLoading: isMetadataLoading,
        error: metadataError
    } = usePhysicalOverviewMetadata({ query: timeframe })

    const { data: session } = useSession();

    // Get metadata values for data cards or use fallback
    const totalProducts = metadata?.total_products || products?.length || 0
    const topSellingVariant = metadata?.top_selling_products || 'No data'
    const recentProducts = metadata?.recent_products?.length || 0
    const totalOrders = metadata?.total_orders || 0
    const totalSales = metadata?.total_sales || 0

    const dataCards = [
        {
            title: "Products",
            value: totalProducts,
            change: "0",
            trending: "up",
            icon: <Package className="h-4 w-4 text-blue-500" />,
            description: getDataDescription(timeframe)
        },
        {
            title: "Top Selling",
            value: topSellingVariant,
            change: "0",
            trending: "up",
            icon: <ShoppingCart className="h-4 w-4 text-green-500" />,
            description: getDataDescription(timeframe)
        },
        {
            title: "Orders",
            value: totalOrders,
            change: "0",
            trending: "up",
            icon: <Package className="h-4 w-4 text-orange-500" />,
            description: getDataDescription(timeframe)
        },


        {
            title: "Sales",
            value: formatCurrency(totalSales),
            change: "0",
            trending: "up",
            icon: <DollarSign className="h-4 w-4 text-purple-500" />,
            description: getDataDescription(timeframe)
        },
    ]

    // Navigate to product details page
    const handleViewDetails = (productId: string) => {
        router.push(`/sales/products/${productId}`)
    }

    // Open product form for adding a new product
    const handleAddProduct = () => {
        setSelectedProduct(null)
        setIsFormOpen(true)
    }

    // Open product form for editing a product
    const handleEditProduct = (product: ProductEntity) => {
        setSelectedProduct(product)
        setIsFormOpen(true)
    }

    // Simplify the handleDeleteProduct function
    const handleDeleteProduct = (productId: string) => {
        deleteProductMutation.mutate(productId);
    }

    // Close the product form
    const handleCloseForm = () => {
        setIsFormOpen(false)
        setSelectedProduct(null)
    }



    return (
        <div className="flex flex-col items-start justify-center w-full gap-4">
            <div className="flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center w-full">
                <div>
                    <p className="text-muted-foreground">Analyze your products and sales performance</p>
                </div>

                {/* <AIAssistantDialog /> */}

            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                {dataCards.map((card, index) => (
                    <DataCard
                        key={index}
                        title={card.title}
                        value={card.value.toString()}
                        change={card.change.toString()}
                        trending={card.trending as "up" | "down"}
                        icon={card.icon}
                        description={card.description}
                    />
                ))}
            </div>

            {/* Conversion metrics section - side by side layout */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 w-full">
                <div className="col-span-4">
                    <PhysicalConversionCharts isAdmin={true} />
                </div>
                <div className="col-span-2">
                    <PhysicalConversionTable isLimit={true} />

                </div>
            </div>

            <Card className="w-full">
                <CardHeader className="flex flex-row justify-between gap-3 items-start sm:items-center w-full">
                    <CardTitle className="flex flex-col items-start">
                        <p className="text-lg font-bold">Products</p>
                        <p className="text-sm text-muted-foreground font-normal">
                            List of all products with order counts and details
                        </p>
                    </CardTitle>

                    <Button variant="ghost" size="sm" className="flex items-center gap-2"
                        onClick={() => setActiveTab("product")}>
                        <p className="hidden md:inline-block">View All</p>
                        <ArrowRightIcon className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-40">
                            <p>Loading products...</p>
                        </div>
                    ) : error ? (
                        <div className="text-red-500">
                            Error loading products: {error instanceof Error ? error.message : String(error)}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Image</TableHead>
                                    <TableHead>Product Name</TableHead>
                                    <TableHead>Skus</TableHead>
                                    <TableHead>Inventory</TableHead>

                                    <TableHead className="text-right">Orders</TableHead>
                                    <TableHead className="text-right w-[70px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products?.map((product) => (
                                    <TableRow key={product.id} className="cursor-pointer" onClick={() => product.id && handleViewDetails(product.id)}>
                                        <TableCell className="pointer-events-none">
                                            {product.images && product.images[0] ? (
                                                <div className="h-14 w-14 rounded-md overflow-hidden">
                                                    <img
                                                        src={product.images[0] || ''}
                                                        alt={product.name || 'Product image'}
                                                        className="object-cover w-full h-full"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-14 w-14 bg-gray-200 flex items-center justify-center rounded-md">
                                                    <Package className="h-6 w-6 text-gray-400" />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium pointer-events-none">{product.name}</TableCell>
                                        <TableCell className="text-left pointer-events-none">
                                            <div className="flex flex-wrap gap-2">
                                                {findListOfSkusInAProduct(product).map((sku, index) => (
                                                    <Badge variant="outline" className="text-xs " key={index}>
                                                        {sku}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-left pointer-events-none">{findTotalQuantityOfAllVariantsInAProduct(product)}</TableCell>
                                        <TableCell className="text-right pointer-events-none">{product.orders?.length || 0}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation();
                                                        product.id && handleViewDetails(product.id);
                                                    }}>
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditProduct(product);
                                                    }}>
                                                        Edit Product
                                                    </DropdownMenuItem>
                                                    {/* <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            product.id && handleDeleteProduct(product.id);
                                                        }}
                                                    >
                                                        Delete Product
                                                    </DropdownMenuItem> */}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Product Form Dialog */}
            <ProductForm
                isOpen={isFormOpen}
                onClose={handleCloseForm}
                product={selectedProduct}
            />
        </div>
    )
}

export default AnalyticsPhysicalScreen