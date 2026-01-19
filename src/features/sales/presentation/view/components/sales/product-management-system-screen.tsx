"use client"

import { PlusIcon } from "lucide-react"
import { useState } from "react"
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
import ProductForm from "../products/add-product"
import { useDeleteAllProductsMutation, useDeleteProductMutation, useProductsQuery } from "@/src/features/sales/presentation/tanstack/physical/products-tanstack"
import { PhysicalConversionCharts } from "../physical/physical-conversion-charts"
import { PhysicalConversionTable } from "../physical/physical-conversion-table"
import { findListOfSkusInAProduct, findTotalQuantityOfAllVariantsInAProduct, formatCurrency } from "@/src/core/constant/helper"
import { Badge } from "@/components/ui/badge"
import ProductDataTable from "../physical/product-data-table"
import toast from "react-hot-toast"
import DefaultDeleteDialog from "@/src/core/shared/view/components/default-delete-dialog"
import { useSession } from "@/src/core/lib/dummy-session-provider"

const ProductManagementSystem = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductEntity | null>(null)
  const deleteProductMutation = useDeleteProductMutation();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const deleteAllProductsMutation = useDeleteAllProductsMutation();
  const [productsToDelete, setProductsToDelete] = useState<ProductEntity[]>([]);

  const { data: session } = useSession()

  // Fetch products data
  const { data: products, isLoading, error } = useProductsQuery()


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

  const handleFindListOfSkusInAProduct = (product: ProductEntity) => {
    return findListOfSkusInAProduct(product)
  }

  const handleDeleteAllProducts = (selectedProducts: ProductEntity[]) => {
    setProductsToDelete(selectedProducts);
    setIsDeleteDialogOpen(true);
  }

  const handleConfirmDeleteAllProducts = () => {
    const productIds = productsToDelete.map(product => product.id).filter(Boolean) as string[];
    deleteAllProductsMutation.mutate(productIds, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        setProductsToDelete([]);
      },

    });
  }

  return (
    <div className="flex flex-col items-start justify-center w-full gap-4">

      <div className="flex flex-row justify-between gap-3 items-start sm:items-center w-full">
        <div>
          <h2 className="text-2xl font-bold">Product Management System</h2>
          <p className="text-muted-foreground">Manage your products and monitor sales performance</p>
        </div>

        {session?.user_entity?.role === 'ADMIN' && (
          <div className="flex gap-2">
            <Button onClick={handleAddProduct}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        )}

      </div>

      <ProductDataTable
        data={products || []}
        onView={handleViewDetails}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        onDeleteAll={handleDeleteAllProducts}
        findListOfSkusInAProduct={handleFindListOfSkusInAProduct}
        findTotalQuantityOfAllVariantsInAProduct={(product: ProductEntity) =>
          findTotalQuantityOfAllVariantsInAProduct(product) ?? 0
        }
      />
      <ProductForm
        product={selectedProduct}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
      />

      <DefaultDeleteDialog
        isOpen={isDeleteDialogOpen && productsToDelete.length > 0}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDeleteAllProducts}
        title="Delete Products"
        description="Are you sure you want to delete these products? This action cannot be undone."
        itemName="Products"
      />
    </div>
    
  )
}

export default ProductManagementSystem