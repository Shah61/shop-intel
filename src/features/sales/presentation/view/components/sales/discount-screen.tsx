"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Eye, 
  Search,
  Download,
  Loader2,
  Percent,
  Trash2,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import * as XLSX from 'xlsx'
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import DefaultDeleteDialog from "@/src/core/shared/view/components/default-delete-dialog"
import AddDiscountDialog from "../physical/add-discount-dialog"
import DiscountDetailScreen from "./discount-detail-screen"
import toast from "react-hot-toast"
import { 
  useDiscountsQuery, 
  useCreateDiscountMutation, 
  useUpdateDiscountMutation,
  useDeleteDiscountMutation 
} from "../../../tanstack/physical/discount-tanstack"
import { DiscountEntity } from "../../../../data/model/physical/discount-entity"

const DiscountScreen = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [isAddDiscountOpen, setIsAddDiscountOpen] = useState(false)
  const [viewingDiscountId, setViewingDiscountId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageLimit] = useState(20)

  // API calls
  const { data: discountsData, isLoading: isLoadingDiscounts, error: discountsError } = useDiscountsQuery({
    page: currentPage,
    limit: pageLimit,
    code: searchQuery,
    discount_type: typeFilter !== "all" ? (typeFilter as "PERCENTAGE" | "FIXED") : undefined,
    is_active: statusFilter !== "all" ? statusFilter === "active" : undefined
  })
  const createDiscountMutation = useCreateDiscountMutation()
  const updateDiscountMutation = useUpdateDiscountMutation()
  const deleteDiscountMutation = useDeleteDiscountMutation()

  // Handle different response structures between mock and real API
  const discounts: DiscountEntity[] = discountsData 
    ? 'discounts' in discountsData 
      ? (Array.isArray(discountsData.discounts) ? discountsData.discounts : [])
      : (Array.isArray(discountsData.data?.discounts) ? discountsData.data.discounts : [])
    : []
  const metadata: {
    total?: number;
    page?: number;
    limit?: number;
    total_pages?: number | null;
    has_next?: boolean;
    has_previous?: boolean;
  } = discountsData 
    ? 'metadata' in discountsData 
      ? (discountsData.metadata as typeof metadata)
      : ((discountsData.data?.metadata || {}) as typeof metadata)
    : {}

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Format currency helper
  const formatCurrency = (value: number) => {
    return `RM${value.toFixed(2)}`
  }

  // Discount handlers
  const handleAddDiscount = () => {
    setIsAddDiscountOpen(true)
  }

  const handleCreateDiscount = async (data: any) => {
    createDiscountMutation.mutate(data, {
      onSuccess: () => {
        setIsAddDiscountOpen(false)
        setCurrentPage(1) // Reset to first page to see the new discount
      }
    })
  }

  const handleViewDiscount = (id: string) => {
    setViewingDiscountId(id)
  }

  const handleBackToDiscounts = () => {
    setViewingDiscountId(null)
  }

  const handleDeleteDiscount = (id: string) => {
    setItemToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteDiscountMutation.mutate(itemToDelete, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false)
          setItemToDelete(null)
          // If we're on the last page and it becomes empty, go to previous page
          if (filteredDiscounts.length === 1 && currentPage > 1) {
            setCurrentPage(prev => prev - 1)
          }
        }
      })
    }
  }

  // Since we're using server-side filtering and pagination, use discounts directly
  const filteredDiscounts: DiscountEntity[] = discounts

  const getStatusBadgeVariant = (isActive: boolean) => {
    return isActive ? "default" : "secondary"
  }

  const getTypeBadgeVariant = (type: string) => {
    return type === "PERCENTAGE" ? "outline" : "secondary"
  }

  const formatDiscountValue = (value: number, type: string) => {
    return type === "PERCENTAGE" ? `${value}%` : formatCurrency(value)
  }

  const exportToExcel = () => {
    // Format data for Excel export
    const formattedData = filteredDiscounts.map(discount => {
      // Get collection names
      const collectionNames = discount.collection_discounts?.map(cd => cd.collection?.name).filter(Boolean).join(', ') || 'No collections'
      
      // Get customer emails
      const customerEmails = discount.customer_medusa_discounts?.map(cmd => cmd.customer?.email).filter(Boolean).join(', ') || 'No customers'
      
      return {
        'Discount ID': discount.id || 'N/A',
        'Title': discount.title || 'N/A',
        'Code': discount.code || 'N/A',
        'Type': discount.discount_type || 'N/A',
        'Value': discount.discount_value || 0,
        'Formatted Value': formatDiscountValue(discount.discount_value, discount.discount_type),
        'Status': isDiscountActive(discount) ? 'Active' : 'Inactive',
        'Is Active Setting': discount.is_active ? 'Yes' : 'No',
        'Starts At': discount.starts_at ? formatDate(discount.starts_at) : 'N/A',
        'Ends At': discount.ends_at ? formatDate(discount.ends_at) : 'N/A',
        'Minimum Purchase Amount': discount.miniumum_purchase_amount ? formatCurrency(discount.miniumum_purchase_amount) : 'No minimum',
        'Minimum Quantity': discount.mininum_quantity || 'No minimum',
        'Is Exclusive': discount.is_exclusive ? 'Yes' : 'No',
        'Collections': collectionNames,
        'Customers': customerEmails,
        'Created Date': discount.created_at ? formatDate(discount.created_at) : 'N/A',
        'Updated Date': discount.updated_at ? formatDate(discount.updated_at) : 'N/A'
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(formattedData)
    
    // Set column widths
    const wscols = [
      { wch: 25 }, // Discount ID
      { wch: 20 }, // Title
      { wch: 15 }, // Code
      { wch: 12 }, // Type
      { wch: 10 }, // Value
      { wch: 15 }, // Formatted Value
      { wch: 10 }, // Status
      { wch: 12 }, // Is Active Setting
      { wch: 12 }, // Starts At
      { wch: 12 }, // Ends At
      { wch: 20 }, // Minimum Purchase Amount
      { wch: 15 }, // Minimum Quantity
      { wch: 12 }, // Is Exclusive
      { wch: 30 }, // Collections
      { wch: 30 }, // Customers
      { wch: 15 }, // Created Date
      { wch: 15 }  // Updated Date
    ]
    worksheet['!cols'] = wscols

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Discounts")
    
    // Generate filename with current date
    const now = new Date()
    const filename = `discounts_export_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.xlsx`
    
    XLSX.writeFile(workbook, filename)
    toast.success(`Exported ${formattedData.length} discounts to Excel`)
  }

  // Pagination handlers
  const handleNextPage = () => {
    if (metadata.has_next) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const handlePreviousPage = () => {
    if (metadata.has_previous) {
      setCurrentPage(prev => prev - 1)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const isDiscountActive = (discount: DiscountEntity) => {
    const now = new Date()
    const startDate = new Date(discount.starts_at)
    const endDate = new Date(discount.ends_at)
    return discount.is_active && now >= startDate && now <= endDate
  }

  // If viewing a specific discount, show the detail screen
  if (viewingDiscountId) {
    return (
      <DiscountDetailScreen 
        discountId={viewingDiscountId}
        onBack={handleBackToDiscounts}
      />
    )
  }

  if (discountsError) {
    return (
      <div className="flex flex-col gap-6 items-center justify-center w-full h-64">
        <p className="text-destructive">Error loading discounts: {discountsError.message}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 items-start justify-center w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center w-full">
        <div>
          <h2 className="text-2xl font-bold">Discount Management</h2>
          <p className="text-muted-foreground">Manage your discount codes and promotional offers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search discounts..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1) // Reset to first page when searching
            }}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => {
          setStatusFilter(value)
          setCurrentPage(1) // Reset to first page when filtering
        }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(value) => {
          setTypeFilter(value)
          setCurrentPage(1) // Reset to first page when filtering
        }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="PERCENTAGE">Percentage</SelectItem>
            <SelectItem value="FIXED">Fixed Amount</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleAddDiscount}>
          <Plus className="h-4 w-4 mr-2" />
          Add Discount
        </Button>
      </div>

      {/* Discounts Table */}
      <Card className="w-full mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Discounts ({metadata.total || 0})
          </CardTitle>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardDescription>
              Manage your discount codes and promotional offers
            </CardDescription>
            <div className="flex items-center gap-2">
              {/* Always show pagination info */}
              <span className="text-sm text-muted-foreground px-2">
                Page {currentPage} of {metadata.total_pages || 1} 
                {metadata.total && ` (${metadata.total} total)`}
              </span>
              {/* Show buttons when there are multiple pages */}
              {(metadata.total_pages && metadata.total_pages > 1) && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={!metadata.has_previous}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={!metadata.has_next}
                    className="flex items-center gap-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingDiscounts ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading discounts...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valid From</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Min. Purchase</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDiscounts.map((discount: DiscountEntity) => (
                  <TableRow key={discount.id}>
                    <TableCell className="font-medium">{discount.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {discount.code}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTypeBadgeVariant(discount.discount_type)}>
                        {discount.discount_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatDiscountValue(discount.discount_value, discount.discount_type)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(isDiscountActive(discount))}>
                        {isDiscountActive(discount) ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(discount.starts_at)}</TableCell>
                    <TableCell>{formatDate(discount.ends_at)}</TableCell>
                    <TableCell>
                      {discount.miniumum_purchase_amount 
                        ? formatCurrency(discount.miniumum_purchase_amount) 
                        : "No minimum"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDiscount(discount.id)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteDiscount(discount.id)}
                          disabled={deleteDiscountMutation.isPending}
                          className="flex items-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!isLoadingDiscounts && filteredDiscounts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No discounts found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <DefaultDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => !deleteDiscountMutation.isPending && setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Discount"
        description="Are you sure you want to delete this discount? This action cannot be undone."
        itemName="Discount"
      />

      {/* Add Discount Dialog */}
      <AddDiscountDialog
        isOpen={isAddDiscountOpen}
        onClose={() => setIsAddDiscountOpen(false)}
        onSubmit={handleCreateDiscount}
        isLoading={createDiscountMutation.isPending}
      />
    </div>
  )
}

export default DiscountScreen 