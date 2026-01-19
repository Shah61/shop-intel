"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  ArrowLeft,
  Percent,
  Loader2,
  Users,
  Package,
  Plus,
  Trash2,
  Edit,
  Calendar,
  ShoppingCart,
  Save,
  X as XIcon,
  CalendarIcon,
  AlertCircle
} from "lucide-react"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useDiscountByIdQuery, useUpdateDiscountMutation } from "../../../tanstack/physical/discount-tanstack"
import { DiscountEntity } from "../../../../data/model/physical/discount-entity"
import AddCollectionsToDiscountDialog from "../physical/add-collections-to-discount-dialog"
import AddCustomersToDiscountDialog from "../physical/add-customers-to-discount-dialog"
import toast from "react-hot-toast"

interface DiscountDetailScreenProps {
  discountId: string;
  onBack: () => void;
}

interface DiscountWithDetails {
  id: string;
  title: string;
  code: string;
  discount_type: "PERCENTAGE" | "FIXED" | "FREE_SHIPPING" | "FREE_PRODUCT";
  discount_value: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  miniumum_purchase_amount: number | null;
  mininum_quantity: number | null;
  is_exclusive: boolean;
  created_at: string;
  updated_at: string;
  collection_discounts: Array<{
    collection: {
      id: string;
      name: string;
    };
  }>;
  customer_medusa_discounts: Array<{
    customer: {
      customer_id: string;
      first_name: string;
      last_name: string;
      phone: string;
      email: string;
    };
  }>;
}

interface EditFormData {
  title: string
  code: string
  discount_type: "PERCENTAGE" | "FIXED" | "FREE_SHIPPING" | "FREE_PRODUCT"
  description?: string
  discount_value: number
  starts_at: string
  ends_at?: string
  is_active: boolean
  mininum_quantity?: number
  miniumum_purchase_amount?: number
}

const DiscountDetailScreen = ({ discountId, onBack }: DiscountDetailScreenProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string; type: 'collection' | 'customer' } | null>(null)
  const [isAddCollectionsOpen, setIsAddCollectionsOpen] = useState(false)
  const [isAddCustomersOpen, setIsAddCustomersOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editFormData, setEditFormData] = useState<EditFormData | null>(null)
  const [editError, setEditError] = useState("")
  const [startsAtDate, setStartsAtDate] = useState<Date | undefined>(undefined)
  const [endsAtDate, setEndsAtDate] = useState<Date | undefined>(undefined)
  const [hasEndDate, setHasEndDate] = useState(false)
  
  const { data: discountResponse, isLoading, error } = useDiscountByIdQuery(discountId)
  const updateDiscountMutation = useUpdateDiscountMutation()

  // Extract the actual discount data from the API response
  const discount: DiscountWithDetails | null = discountResponse ? (discountResponse as any).discount || discountResponse : null

  // Handle mutation errors and reset states
  useEffect(() => {
    if (updateDiscountMutation.isError) {
      // Reset dialog states on error
      setIsDeleteDialogOpen(false)
      setItemToDelete(null)
      setIsAddCollectionsOpen(false)
      setIsAddCustomersOpen(false)
    }
  }, [updateDiscountMutation.isError])

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Format currency helper
  const formatCurrency = (value: number) => {
    return `RM${value.toFixed(2)}`
  }

  const getStatusBadgeVariant = (isActive: boolean) => {
    return isActive ? "default" : "secondary"
  }

  const getTypeBadgeVariant = (type: string) => {
    return type === "PERCENTAGE" ? "outline" : "secondary"
  }

  const formatDiscountValue = (value: number, type: string) => {
    return type === "PERCENTAGE" ? `${value}%` : formatCurrency(value)
  }

  const isDiscountActive = (discount: DiscountWithDetails) => {
    const now = new Date()
    const startDate = new Date(discount.starts_at)
    const endDate = new Date(discount.ends_at)
    return discount.is_active && now >= startDate && now <= endDate
  }

  const discountTypeOptions = [
    { value: "PERCENTAGE", label: "Percentage", description: "Percentage discount (e.g., 10%)" },
    { value: "FIXED", label: "Fixed Amount", description: "Fixed amount discount (e.g., RM25)" },
    { value: "FREE_SHIPPING", label: "Free Shipping", description: "Free shipping for orders" },
    { value: "FREE_PRODUCT", label: "Free Product", description: "Free product with purchase" }
  ]

  const initializeEditData = (discount: DiscountWithDetails) => {
    const formData: EditFormData = {
      title: discount.title,
      code: discount.code,
      discount_type: discount.discount_type as "PERCENTAGE" | "FIXED" | "FREE_SHIPPING" | "FREE_PRODUCT",
      description: "", // API doesn't seem to have description field in response
      discount_value: discount.discount_value,
      starts_at: format(new Date(discount.starts_at), "yyyy-MM-dd"),
      ends_at: format(new Date(discount.ends_at), "yyyy-MM-dd"),
      is_active: discount.is_active,
      mininum_quantity: discount.mininum_quantity || undefined,
      miniumum_purchase_amount: discount.miniumum_purchase_amount || undefined
    }
    
    setEditFormData(formData)
    setStartsAtDate(new Date(discount.starts_at))
    setEndsAtDate(new Date(discount.ends_at))
    setHasEndDate(true)
    setEditError("")
  }

  const handleEditStart = () => {
    if (discount) {
      initializeEditData(discount)
      setIsEditing(true)
    }
  }

  const handleEditCancel = () => {
    setIsEditing(false)
    setEditFormData(null)
    setEditError("")
    setStartsAtDate(undefined)
    setEndsAtDate(undefined)
    setHasEndDate(false)
  }

  const handleEditSave = () => {
    if (!editFormData || !discount) return

    setEditError("")

    // Validation
    if (!editFormData.title.trim()) {
      setEditError("Please enter a discount title")
      return
    }

    if (!editFormData.code.trim()) {
      setEditError("Please enter a discount code")
      return
    }

    // Only validate discount value for PERCENTAGE and FIXED types
    if ((editFormData.discount_type === "PERCENTAGE" || editFormData.discount_type === "FIXED") && editFormData.discount_value <= 0) {
      setEditError("Please enter a valid discount value")
      return
    }

    if (editFormData.discount_type === "PERCENTAGE" && editFormData.discount_value > 100) {
      setEditError("Percentage discount cannot exceed 100%")
      return
    }

    // Prepare update params
    const updateParams: any = {
      title: editFormData.title,
      code: editFormData.code,
      discount_type: editFormData.discount_type,
      discount_value: editFormData.discount_value,
      starts_at: editFormData.starts_at,
      ends_at: editFormData.ends_at,
      is_active: editFormData.is_active
    }

    if (editFormData.mininum_quantity) {
      updateParams.mininum_quantity = editFormData.mininum_quantity
    }
    if (editFormData.miniumum_purchase_amount) {
      updateParams.miniumum_purchase_amount = editFormData.miniumum_purchase_amount
    }

    updateDiscountMutation.mutate({
      id: discountId,
      params: updateParams
    }, {
      onSuccess: () => {
        toast.success("Discount updated successfully")
        setIsEditing(false)
        setEditFormData(null)
      },
      onError: (error: any) => {
        setEditError(error.message || "Failed to update discount")
      }
    })
  }

  const handleStartsAtChange = (date: Date | undefined) => {
    if (date && editFormData) {
      setStartsAtDate(date)
      setEditFormData(prev => ({ 
        ...prev!, 
        starts_at: format(date, "yyyy-MM-dd") 
      }))
    }
  }

  const handleEndsAtChange = (date: Date | undefined) => {
    if (editFormData) {
      setEndsAtDate(date)
      setEditFormData(prev => ({ 
        ...prev!, 
        ends_at: date ? format(date, "yyyy-MM-dd") : undefined 
      }))
    }
  }

  const handleRemoveCollection = (collectionId: string, collectionName?: string) => {
    setItemToDelete({
      id: collectionId,
      name: collectionName || 'Unnamed Collection',
      type: 'collection'
    })
    setIsDeleteDialogOpen(true)
  }

  const handleRemoveCustomer = (customerId: string, customerName?: string) => {
    setItemToDelete({
      id: customerId,
      name: customerName || 'Unnamed Customer',
      type: 'customer'
    })
    setIsDeleteDialogOpen(true)
  }

  const confirmRemoveItem = () => {
    if (!itemToDelete || !discount) return

    if (itemToDelete.type === 'collection') {
      // Filter out the collection to be removed
      const remainingCollectionIds = discount.collection_discounts
        .map(cd => cd.collection.id)
        .filter(id => id !== itemToDelete.id)
      
      updateDiscountMutation.mutate({
        id: discountId,
        params: {
          collection_ids: remainingCollectionIds
        }
      }, {
        onSuccess: () => {
          toast.success(`Successfully removed ${itemToDelete.name} from discount`)
          setIsDeleteDialogOpen(false)
          setItemToDelete(null)
        }
      })
    } else if (itemToDelete.type === 'customer') {
      // Filter out the customer to be removed
      const remainingCustomerIds = discount.customer_medusa_discounts
        .map(cmd => cmd.customer.customer_id)
        .filter(id => id !== itemToDelete.id)
      
      updateDiscountMutation.mutate({
        id: discountId,
        params: {
          customer_ids: remainingCustomerIds
        }
      }, {
        onSuccess: () => {
          toast.success(`Successfully removed ${itemToDelete.name} from discount`)
          setIsDeleteDialogOpen(false)
          setItemToDelete(null)
        }
      })
    }
  }

  const cancelRemoveItem = () => {
    setIsDeleteDialogOpen(false)
    setItemToDelete(null)
  }

  const handleAddCollections = () => {
    setIsAddCollectionsOpen(true)
  }

  const handleAddCustomers = () => {
    setIsAddCustomersOpen(true)
  }

  const handleAddCollectionsSubmit = (newCollectionIds: string[]) => {
    if (!discount) return

    // Combine existing collection IDs with new ones
    const existingCollectionIds = discount.collection_discounts.map(cd => cd.collection.id)
    const allCollectionIds = [...existingCollectionIds, ...newCollectionIds]
    
    updateDiscountMutation.mutate({
      id: discountId,
      params: {
        collection_ids: allCollectionIds
      }
    }, {
      onSuccess: () => {
        setIsAddCollectionsOpen(false)
        toast.success(`Successfully added ${newCollectionIds.length} collection${newCollectionIds.length !== 1 ? 's' : ''} to discount`)
      }
    })
  }

  const handleAddCustomersSubmit = (newCustomerIds: string[]) => {
    if (!discount) return

    // Combine existing customer IDs with new ones
    const existingCustomerIds = discount.customer_medusa_discounts.map(cmd => cmd.customer.customer_id)
    const allCustomerIds = [...existingCustomerIds, ...newCustomerIds]
    
    updateDiscountMutation.mutate({
      id: discountId,
      params: {
        customer_ids: allCustomerIds
      }
    }, {
      onSuccess: () => {
        setIsAddCustomersOpen(false)
        toast.success(`Successfully added ${newCustomerIds.length} customer${newCustomerIds.length !== 1 ? 's' : ''} to discount`)
      }
    })
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6 items-center justify-center w-full h-64">
        <p className="text-destructive">Error loading discount: {error.message}</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Discounts
          </Button>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 items-start justify-center w-full">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Discounts
        </Button>
        <div className="flex justify-center items-center py-8 w-full">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading discount details...</span>
        </div>
      </div>
    )
  }

  if (!discount) {
    return (
      <div className="flex flex-col gap-6 items-center justify-center w-full h-64">
        <p className="text-muted-foreground">Discount not found</p>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Discounts
        </Button>
      </div>
    )
  }

  const collections = discount.collection_discounts || []
  const customers = discount.customer_medusa_discounts || []

  return (
    <div className="flex flex-col gap-6 items-start justify-center w-full">
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center w-full">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Discounts
          </Button>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleEditCancel} disabled={updateDiscountMutation.isPending}>
                <XIcon className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleEditSave} disabled={updateDiscountMutation.isPending}>
                {updateDiscountMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={handleEditStart}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Discount
            </Button>
          )}
        </div>
      </div>

      {/* Discount Information */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            {isEditing ? "Edit Discount" : "Discount Details"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {editError && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-start mb-6">
              <AlertCircle className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
              <p className="text-sm">{editError}</p>
            </div>
          )}
          
          {isEditing && editFormData ? (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Basic Information</h4>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      type="text"
                      value={editFormData.title}
                      onChange={(e) => setEditFormData(prev => ({ ...prev!, title: e.target.value }))}
                      placeholder="e.g. SHOPINTEL 19"
                      disabled={updateDiscountMutation.isPending}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discountCode">Discount Code *</Label>
                    <Input
                      id="discountCode"
                      type="text"
                      value={editFormData.code}
                      onChange={(e) => setEditFormData(prev => ({ ...prev!, code: e.target.value.toUpperCase() }))}
                      placeholder="e.g. SHOPINTEL19"
                      disabled={updateDiscountMutation.isPending}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="discountType">Discount Type *</Label>
                    <Select
                      value={editFormData.discount_type}
                      onValueChange={(value: "PERCENTAGE" | "FIXED" | "FREE_SHIPPING" | "FREE_PRODUCT") => 
                        setEditFormData(prev => ({ ...prev!, discount_type: value }))}
                      disabled={updateDiscountMutation.isPending}
                    >
                      <SelectTrigger className="h-auto py-3">
                        <SelectValue placeholder="Select discount type">
                          {editFormData.discount_type && (
                            <div className="text-left">
                              <div className="font-medium">
                                {discountTypeOptions.find(opt => opt.value === editFormData.discount_type)?.label}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {discountTypeOptions.find(opt => opt.value === editFormData.discount_type)?.description}
                              </div>
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent side="bottom" position="popper" sideOffset={5}>
                        {discountTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="py-3">
                            <div className="w-full">
                              <div className="font-medium text-sm">{option.label}</div>
                              <div className="text-xs text-muted-foreground mt-1">{option.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {(editFormData.discount_type === "PERCENTAGE" || editFormData.discount_type === "FIXED") && (
                    <div className="space-y-2">
                      <Label htmlFor="discountValue">
                        {editFormData.discount_type === "PERCENTAGE" ? "Percentage (%)" : "Amount (RM)"} *
                      </Label>
                      <Input
                        id="discountValue"
                        type="number"
                        min="0"
                        max={editFormData.discount_type === "PERCENTAGE" ? "100" : undefined}
                        step={editFormData.discount_type === "PERCENTAGE" ? "0.1" : "0.01"}
                        value={editFormData.discount_value || ""}
                        onChange={(e) => setEditFormData(prev => ({ ...prev!, discount_value: parseFloat(e.target.value) || 0 }))}
                        placeholder={editFormData.discount_type === "PERCENTAGE" ? "10" : "25.00"}
                        disabled={updateDiscountMutation.isPending}
                      />
                      <p className="text-xs text-muted-foreground">
                        {editFormData.discount_type === "PERCENTAGE" 
                          ? `${editFormData.discount_value}% discount`
                          : `${formatCurrency(editFormData.discount_value)} discount`}
                      </p>
                    </div>
                  )}

                  {editFormData.discount_type === "FREE_SHIPPING" && (
                    <div className="space-y-2">
                      <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm font-medium text-blue-800">Free Shipping Discount</p>
                        <p className="text-xs text-blue-600 mt-1">Customers will receive free shipping when using this discount code.</p>
                      </div>
                    </div>
                  )}

                  {editFormData.discount_type === "FREE_PRODUCT" && (
                    <div className="space-y-2">
                      <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-sm font-medium text-green-800">Free Product Discount</p>
                        <p className="text-xs text-green-600 mt-1">Customers will receive a free product when using this discount code.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Validity Period */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Validity Period</h4>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Starts At *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startsAtDate && "text-muted-foreground"
                          )}
                          disabled={updateDiscountMutation.isPending}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span className="truncate">
                            {startsAtDate ? format(startsAtDate, "PPP") : "Select date"}
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start" side="bottom" avoidCollisions>
                        <CalendarComponent
                          mode="single"
                          selected={startsAtDate}
                          onSelect={handleStartsAtChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <Checkbox
                        id="hasEndDate"
                        checked={hasEndDate}
                        onCheckedChange={(checked) => setHasEndDate(!!checked)}
                        disabled={updateDiscountMutation.isPending}
                      />
                      <Label htmlFor="hasEndDate" className="text-sm">Set end date</Label>
                    </div>
                    {hasEndDate && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !endsAtDate && "text-muted-foreground"
                            )}
                            disabled={updateDiscountMutation.isPending}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                            <span className="truncate">
                              {endsAtDate ? format(endsAtDate, "PPP") : "Select date"}
                            </span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start" side="bottom" avoidCollisions>
                          <CalendarComponent
                            mode="single"
                            selected={endsAtDate}
                            onSelect={handleEndsAtChange}
                            disabled={(date) => date <= (startsAtDate || new Date())}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </div>
              </div>

              {/* Conditions */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Conditions</h4>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minimumPurchaseAmount">Minimum Purchase Amount (RM)</Label>
                    <Input
                      id="minimumPurchaseAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={editFormData.miniumum_purchase_amount || ""}
                      onChange={(e) => setEditFormData(prev => ({ 
                        ...prev!, 
                        miniumum_purchase_amount: parseFloat(e.target.value) || undefined 
                      }))}
                      placeholder="50.00 (optional)"
                      disabled={updateDiscountMutation.isPending}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minimumQuantity">Minimum Quantity</Label>
                    <Input
                      id="minimumQuantity"
                      type="number"
                      min="1"
                      value={editFormData.mininum_quantity || ""}
                      onChange={(e) => setEditFormData(prev => ({ 
                        ...prev!, 
                        mininum_quantity: parseInt(e.target.value) || undefined 
                      }))}
                      placeholder="2 (optional)"
                      disabled={updateDiscountMutation.isPending}
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Status</h4>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={editFormData.is_active}
                    onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev!, is_active: !!checked }))}
                    disabled={updateDiscountMutation.isPending}
                  />
                  <Label htmlFor="isActive" className="text-sm">
                    Active (discount can be used immediately)
                  </Label>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Title</label>
                <p className="text-sm font-semibold">{discount.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Code</label>
                <div className="pt-1">
                  <Badge variant="outline" className="font-mono">
                    {discount.code}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Type & Value</label>
                <div className="flex items-center gap-2 pt-1">
                  <Badge variant={getTypeBadgeVariant(discount.discount_type)}>
                    {discount.discount_type}
                  </Badge>
                  <span className="font-semibold text-lg">
                    {formatDiscountValue(discount.discount_value, discount.discount_type)}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="pt-1">
                  <Badge variant={getStatusBadgeVariant(isDiscountActive(discount))}>
                    {isDiscountActive(discount) ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Valid From</label>
                <div className="flex items-center gap-2 pt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{formatDate(discount.starts_at)}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Valid Until</label>
                <div className="flex items-center gap-2 pt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{formatDate(discount.ends_at)}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Minimum Purchase</label>
                <div className="flex items-center gap-2 pt-1">
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-semibold">
                    {discount.miniumum_purchase_amount ? formatCurrency(discount.miniumum_purchase_amount) : "No minimum"}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Minimum Quantity</label>
                <p className="text-sm">{discount.mininum_quantity || "No minimum"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Exclusive</label>
                <div className="pt-1">
                  <Badge variant={discount.is_exclusive ? "default" : "secondary"}>
                    {discount.is_exclusive ? "Exclusive" : "Non-exclusive"}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="text-sm">{formatDate(discount.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Updated</label>
                <p className="text-sm">{formatDate(discount.updated_at)}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Associated Collections */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center w-full">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Associated Collections ({collections.length})
              </CardTitle>
              <CardDescription>
                Collections that this discount applies to
              </CardDescription>
            </div>
            <Button size="sm" onClick={handleAddCollections}>
              <Plus className="h-4 w-4 mr-2" />
              Add Collections
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {collections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="flex flex-col items-center gap-3">
                <Package className="h-12 w-12 text-muted-foreground/50" />
                <div>
                  <p className="font-medium">No collections associated</p>
                  <p className="text-sm">This discount applies to all products</p>
                </div>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Collection Name</TableHead>
                  <TableHead>Collection ID</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collections.map((collectionDiscount) => (
                  <TableRow key={collectionDiscount.collection.id}>
                    <TableCell className="font-medium">{collectionDiscount.collection.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {collectionDiscount.collection.id}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveCollection(collectionDiscount.collection.id, collectionDiscount.collection.name)}
                        disabled={updateDiscountMutation.isPending}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Associated Customers */}
      <Card className="w-full mb-8">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center w-full">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Eligible Customers ({customers.length})
              </CardTitle>
              <CardDescription>
                Customers who can use this discount
              </CardDescription>
            </div>
            <Button size="sm" onClick={handleAddCustomers}>
              <Plus className="h-4 w-4 mr-2" />
              Add Customers
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="flex flex-col items-center gap-3">
                <Users className="h-12 w-12 text-muted-foreground/50" />
                <div>
                  <p className="font-medium">No specific customers assigned</p>
                  <p className="text-sm">This discount is available to all customers</p>
                </div>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customerDiscount) => (
                  <TableRow key={customerDiscount.customer.customer_id}>
                    <TableCell className="font-medium">
                      {`${customerDiscount.customer.first_name} ${customerDiscount.customer.last_name}`.trim() || "N/A"}
                    </TableCell>
                    <TableCell>{customerDiscount.customer.email}</TableCell>
                    <TableCell>{customerDiscount.customer.phone || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {customerDiscount.customer.customer_id}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveCustomer(
                          customerDiscount.customer.customer_id, 
                          `${customerDiscount.customer.first_name} ${customerDiscount.customer.last_name}`.trim() || customerDiscount.customer.email
                        )}
                        disabled={updateDiscountMutation.isPending}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Collections Dialog */}
      <AddCollectionsToDiscountDialog
        isOpen={isAddCollectionsOpen}
        onClose={() => setIsAddCollectionsOpen(false)}
        onSubmit={handleAddCollectionsSubmit}
        isLoading={updateDiscountMutation.isPending}
        existingCollectionIds={discount?.collection_discounts.map(cd => cd.collection.id) || []}
        discountTitle={discount?.title || ""}
      />

      {/* Add Customers Dialog */}
      <AddCustomersToDiscountDialog
        isOpen={isAddCustomersOpen}
        onClose={() => setIsAddCustomersOpen(false)}
        onSubmit={handleAddCustomersSubmit}
        isLoading={updateDiscountMutation.isPending}
        existingCustomerIds={discount?.customer_medusa_discounts.map(cmd => cmd.customer.customer_id) || []}
        discountTitle={discount?.title || ""}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Remove {itemToDelete?.type === 'collection' ? 'Collection' : 'Customer'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>&quot;{itemToDelete?.name}&quot;</strong> from this discount?
              <br /><br />
              This action cannot be undone. The {itemToDelete?.type === 'collection' ? 'collection' : 'customer'} will no longer be associated with this discount.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelRemoveItem} disabled={updateDiscountMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmRemoveItem}
              disabled={updateDiscountMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {updateDiscountMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove {itemToDelete?.type === 'collection' ? 'Collection' : 'Customer'}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default DiscountDetailScreen 