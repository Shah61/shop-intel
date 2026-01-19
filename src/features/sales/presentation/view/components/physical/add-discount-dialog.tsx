import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { AlertCircle, Percent, CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useCollectionsQuery } from "../../../tanstack/physical/collection-tanstack"
import { useGetCustomers } from "../../../tanstack/physical/customer-tanstack"
import { CollectionEntity } from "../../../../data/model/physical/collection-entity"
import { CustomerEntity } from "../../../../data/model/physical/customer-entity"
import toast from "react-hot-toast"

interface AddDiscountDialogProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: DiscountFormData) => void
    isLoading?: boolean
}

interface DiscountFormData {
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
    customer_ids?: string[]
    collection_ids?: string[]
}

const AddDiscountDialog = ({ isOpen, onClose, onSubmit, isLoading = false }: AddDiscountDialogProps) => {
    const [formData, setFormData] = useState<DiscountFormData>({
        title: "",
        code: "",
        discount_type: "PERCENTAGE",
        description: "",
        discount_value: 0,
        starts_at: format(new Date(), "yyyy-MM-dd"),
        ends_at: undefined,
        is_active: true,
        mininum_quantity: undefined,
        miniumum_purchase_amount: undefined,
        customer_ids: [],
        collection_ids: []
    })
    
    const [formError, setFormError] = useState("")
    const [startsAtDate, setStartsAtDate] = useState<Date>(new Date())
    const [endsAtDate, setEndsAtDate] = useState<Date | undefined>(undefined)
    const [hasEndDate, setHasEndDate] = useState(false)
    const [hasMinimumQuantity, setHasMinimumQuantity] = useState(false)
    const [hasMinimumPurchase, setHasMinimumPurchase] = useState(false)
    const [isStartsAtPopoverOpen, setIsStartsAtPopoverOpen] = useState(false)
    const [isEndsAtPopoverOpen, setIsEndsAtPopoverOpen] = useState(false)

    // Fetch collections and customers
    const { data: collections = [], isLoading: isLoadingCollections } = useCollectionsQuery()
    const { data: customers = [], isLoading: isLoadingCustomers } = useGetCustomers()

    const discountTypeOptions = [
        { value: "PERCENTAGE", label: "Percentage", description: "Percentage discount (e.g., 10%)" },
        { value: "FIXED", label: "Fixed Amount", description: "Fixed amount discount (e.g., RM25)" },
        { value: "FREE_SHIPPING", label: "Free Shipping", description: "Free shipping for orders" },
        { value: "FREE_PRODUCT", label: "Free Product", description: "Free product with purchase" }
    ]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError("")

        // Validation
        if (!formData.title.trim()) {
            toast.error("Please enter a discount title")
            setFormError("Please enter a discount title")
            return
        }

        if (!formData.code.trim()) {
            toast.error("Please enter a discount code")
            setFormError("Please enter a discount code")
            return
        }

        // Only validate discount value for PERCENTAGE and FIXED types
        if ((formData.discount_type === "PERCENTAGE" || formData.discount_type === "FIXED") && formData.discount_value <= 0) {
            toast.error("Please enter a valid discount value")
            setFormError("Please enter a valid discount value")
            return
        }

        if (formData.discount_type === "PERCENTAGE" && formData.discount_value > 100) {
            toast.error("Percentage discount cannot exceed 100%")
            setFormError("Percentage discount cannot exceed 100%")
            return
        }

        try {
            onSubmit(formData)
            resetForm()
        } catch (error: any) {
            toast.error("Failed to add discount")
            setFormError(error.message || "Failed to add discount")
        }
    }

    const resetForm = () => {
        setFormData({
            title: "",
            code: "",
            discount_type: "PERCENTAGE",
            description: "",
            discount_value: 0,
            starts_at: format(new Date(), "yyyy-MM-dd"),
            ends_at: undefined,
            is_active: true,
            mininum_quantity: undefined,
            miniumum_purchase_amount: undefined,
            customer_ids: [],
            collection_ids: []
        })
        setStartsAtDate(new Date())
        setEndsAtDate(undefined)
        setHasEndDate(false)
        setHasMinimumQuantity(false)
        setHasMinimumPurchase(false)
        setFormError("")
        setIsStartsAtPopoverOpen(false)
        setIsEndsAtPopoverOpen(false)
    }

    const handleClose = () => {
        resetForm()
        onClose()
    }

    const handleStartsAtChange = (date: Date | undefined) => {
        if (date) {
            setStartsAtDate(date)
            setFormData(prev => ({ ...prev, starts_at: format(date, "yyyy-MM-dd") }))
            setIsStartsAtPopoverOpen(false) // Close the popover after selection
        }
    }

    const handleEndsAtChange = (date: Date | undefined) => {
        setEndsAtDate(date)
        setFormData(prev => ({ 
            ...prev, 
            ends_at: date ? format(date, "yyyy-MM-dd") : undefined 
        }))
        setIsEndsAtPopoverOpen(false) // Close the popover after selection
    }

    // Prevent popover from closing when clicking inside calendar
    const handleCalendarClick = (e: React.MouseEvent) => {
        e.stopPropagation()
    }

    const addCollection = (collectionId: string) => {
        setFormData(prev => ({
            ...prev,
            collection_ids: [...(prev.collection_ids || []), collectionId]
        }))
    }

    const removeCollection = (collectionId: string) => {
        setFormData(prev => ({
            ...prev,
            collection_ids: prev.collection_ids?.filter(id => id !== collectionId) || []
        }))
    }

    const addCustomer = (customerId: string) => {
        setFormData(prev => ({
            ...prev,
            customer_ids: [...(prev.customer_ids || []), customerId]
        }))
    }

    const removeCustomer = (customerId: string) => {
        setFormData(prev => ({
            ...prev,
            customer_ids: prev.customer_ids?.filter(id => id !== customerId) || []
        }))
    }

    const formatCurrency = (value: number) => {
        return `RM${value.toFixed(2)}`
    }

    const getCustomerDisplayName = (customer: CustomerEntity) => {
        const fullName = `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
        return fullName || customer.email || 'Unnamed Customer'
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-3xl max-w-[95vw] max-h-[90vh] overflow-y-auto z-[9998]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <Percent className="h-5 w-5" />
                        Add New Discount
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        Create a new discount code with specific rules and conditions
                    </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-6 px-1">
                    {formError && (
                        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-start">
                            <AlertCircle className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
                            <p className="text-sm">{formError}</p>
                        </div>
                    )}

                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium">Basic Information</h4>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="e.g. SHOPINTEL 19"
                                    required
                                    disabled={isLoading}
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="discountCode">Discount Code *</Label>
                                <Input
                                    id="discountCode"
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                                    placeholder="e.g. SHOPINTEL19"
                                    required
                                    disabled={isLoading}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="discountType">Discount Type *</Label>
                                <Select
                                    value={formData.discount_type}
                                    onValueChange={(value: "PERCENTAGE" | "FIXED" | "FREE_SHIPPING" | "FREE_PRODUCT") => setFormData(prev => ({ ...prev, discount_type: value }))}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className="h-auto py-3">
                                        <SelectValue placeholder="Select discount type">
                                            {formData.discount_type && (
                                                <div className="text-left">
                                                    <div className="font-medium">
                                                        {discountTypeOptions.find(opt => opt.value === formData.discount_type)?.label}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {discountTypeOptions.find(opt => opt.value === formData.discount_type)?.description}
                                                    </div>
                                                </div>
                                            )}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent 
                                        side="bottom" 
                                        position="popper" 
                                        sideOffset={5}
                                        className="z-[10000] max-h-[200px] overflow-auto"
                                        avoidCollisions={true}
                                    >
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

                            {(formData.discount_type === "PERCENTAGE" || formData.discount_type === "FIXED") && (
                                <div className="space-y-2">
                                    <Label htmlFor="discountValue">
                                        {formData.discount_type === "PERCENTAGE" ? "Percentage (%)" : "Amount (RM)"} *
                                    </Label>
                                    <Input
                                        id="discountValue"
                                        type="number"
                                        min="0"
                                        max={formData.discount_type === "PERCENTAGE" ? "100" : undefined}
                                        step={formData.discount_type === "PERCENTAGE" ? "0.1" : "0.01"}
                                        value={formData.discount_value || ""}
                                        onChange={(e) => setFormData(prev => ({ ...prev, discount_value: parseFloat(e.target.value) || 0 }))}
                                        placeholder={formData.discount_type === "PERCENTAGE" ? "10" : "25.00"}
                                        required
                                        disabled={isLoading}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {formData.discount_type === "PERCENTAGE" 
                                            ? `${formData.discount_value}% discount`
                                            : `${formatCurrency(formData.discount_value)} discount`}
                                    </p>
                                </div>
                            )}

                            {formData.discount_type === "FREE_SHIPPING" && (
                                <div className="space-y-2">
                                    <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-md">
                                        <p className="text-sm font-medium text-blue-800">Free Shipping Discount</p>
                                        <p className="text-xs text-blue-600 mt-1">Customers will receive free shipping when using this discount code.</p>
                                    </div>
                                </div>
                            )}

                            {formData.discount_type === "FREE_PRODUCT" && (
                                <div className="space-y-2">
                                    <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-md">
                                        <p className="text-sm font-medium text-green-800">Free Product Discount</p>
                                        <p className="text-xs text-green-600 mt-1">Customers will receive a free product when using this discount code.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Optional description for internal use"
                                rows={2}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Validity Period */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium">Validity Period</h4>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Starts At *</Label>
                                <Popover open={isStartsAtPopoverOpen} onOpenChange={setIsStartsAtPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !startsAtDate && "text-muted-foreground"
                                            )}
                                            disabled={isLoading}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                                            <span className="truncate">
                                                {startsAtDate ? format(startsAtDate, "PPP") : "Select date"}
                                            </span>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent 
                                        className="w-auto p-0 z-[9999]" 
                                        align="start" 
                                        side="bottom" 
                                        avoidCollisions
                                        onClick={handleCalendarClick}
                                        style={{ pointerEvents: 'auto' }}
                                    >
                                        <div onMouseDown={(e) => e.stopPropagation()}>
                                            <Calendar
                                                mode="single"
                                                selected={startsAtDate}
                                                onSelect={handleStartsAtChange}
                                                disabled={(date) => date < new Date()}
                                                initialFocus
                                            />
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center space-x-2 mb-2">
                                    <Checkbox
                                        id="hasEndDate"
                                        checked={hasEndDate}
                                        onCheckedChange={(checked) => {
                                            setHasEndDate(!!checked)
                                            if (!checked) {
                                                setIsEndsAtPopoverOpen(false)
                                                setEndsAtDate(undefined)
                                                setFormData(prev => ({ ...prev, ends_at: undefined }))
                                            }
                                        }}
                                        disabled={isLoading}
                                    />
                                    <Label htmlFor="hasEndDate" className="text-sm">Set end date</Label>
                                </div>
                                {hasEndDate && (
                                    <Popover open={isEndsAtPopoverOpen} onOpenChange={setIsEndsAtPopoverOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !endsAtDate && "text-muted-foreground"
                                                )}
                                                disabled={isLoading}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                                                <span className="truncate">
                                                    {endsAtDate ? format(endsAtDate, "PPP") : "Select date"}
                                                </span>
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent 
                                            className="w-auto p-0 z-[9999]" 
                                            align="start" 
                                            side="bottom" 
                                            avoidCollisions
                                            onClick={handleCalendarClick}
                                            style={{ pointerEvents: 'auto' }}
                                        >
                                            <div onMouseDown={(e) => e.stopPropagation()}>
                                                <Calendar
                                                    mode="single"
                                                    selected={endsAtDate}
                                                    onSelect={handleEndsAtChange}
                                                    disabled={(date) => date <= startsAtDate}
                                                    initialFocus
                                                />
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Conditions */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium">Conditions</h4>
                        
                        {/* Minimum Purchase Amount */}
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="hasMinimumPurchase"
                                    checked={hasMinimumPurchase}
                                    onCheckedChange={(checked) => setHasMinimumPurchase(!!checked)}
                                    disabled={isLoading}
                                />
                                <Label htmlFor="hasMinimumPurchase" className="text-sm">Set minimum purchase amount</Label>
                            </div>
                            {hasMinimumPurchase && (
                                <div className="space-y-2 pl-6">
                                    <Label htmlFor="minimumPurchaseAmount" className="text-sm">Minimum Purchase Amount (RM)</Label>
                                    <Input
                                        id="minimumPurchaseAmount"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.miniumum_purchase_amount || ""}
                                        onChange={(e) => setFormData(prev => ({ ...prev, miniumum_purchase_amount: parseFloat(e.target.value) || undefined }))}
                                        placeholder="50.00"
                                        disabled={isLoading}
                                        className="w-full max-w-xs"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Minimum Quantity */}
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="hasMinimumQuantity"
                                    checked={hasMinimumQuantity}
                                    onCheckedChange={(checked) => setHasMinimumQuantity(!!checked)}
                                    disabled={isLoading}
                                />
                                <Label htmlFor="hasMinimumQuantity" className="text-sm">Set minimum quantity</Label>
                            </div>
                            {hasMinimumQuantity && (
                                <div className="space-y-2 pl-6">
                                    <Label htmlFor="minimumQuantity" className="text-sm">Minimum Quantity</Label>
                                    <Input
                                        id="minimumQuantity"
                                        type="number"
                                        min="1"
                                        value={formData.mininum_quantity || ""}
                                        onChange={(e) => setFormData(prev => ({ ...prev, mininum_quantity: parseInt(e.target.value) || undefined }))}
                                        placeholder="2"
                                        disabled={isLoading}
                                        className="w-full max-w-xs"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Collections */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium">Eligible Collections</h4>
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label className="text-sm">Collections (optional)</Label>
                                <Select 
                                    onValueChange={addCollection} 
                                    disabled={isLoading || isLoadingCollections}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select collections" />
                                    </SelectTrigger>
                                    <SelectContent 
                                        side="bottom" 
                                        position="popper" 
                                        sideOffset={5}
                                        className="z-[10000] max-h-[200px] overflow-auto"
                                        avoidCollisions={true}
                                    >
                                        {collections
                                            .filter((collection: CollectionEntity) => !formData.collection_ids?.includes(collection.id!))
                                            .map((collection: CollectionEntity) => (
                                                <SelectItem key={collection.id} value={collection.id!}>
                                                    {collection.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {formData.collection_ids && formData.collection_ids.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Selected Collections:</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.collection_ids.map((collectionId) => {
                                            const collection = collections.find((c: CollectionEntity) => c.id === collectionId)
                                            return (
                                                <Badge key={collectionId} variant="outline" className="flex items-center gap-1 text-xs">
                                                    <span className="max-w-[120px] truncate">
                                                        {collection?.name || `Collection ${collectionId}`}
                                                    </span>
                                                    <X 
                                                        className="h-3 w-3 cursor-pointer hover:text-destructive" 
                                                        onClick={() => removeCollection(collectionId)}
                                                    />
                                                </Badge>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Customers */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium">Eligible Customers</h4>
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label className="text-sm">Customers (optional)</Label>
                                <Select 
                                    onValueChange={addCustomer} 
                                    disabled={isLoading || isLoadingCustomers}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select customers" />
                                    </SelectTrigger>
                                    <SelectContent 
                                        side="bottom" 
                                        position="popper" 
                                        sideOffset={5}
                                        className="z-[10000] max-h-[200px] overflow-auto"
                                        avoidCollisions={true}
                                    >
                                        {customers
                                            .filter((customer: CustomerEntity) => !formData.customer_ids?.includes(customer.customer_id!))
                                            .map((customer: CustomerEntity) => (
                                                <SelectItem key={customer.customer_id} value={customer.customer_id!}>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{getCustomerDisplayName(customer)}</span>
                                                        <span className="text-xs text-muted-foreground">{customer.email}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {formData.customer_ids && formData.customer_ids.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Selected Customers:</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.customer_ids.map((customerId) => {
                                            const customer = customers.find((c: CustomerEntity) => c.customer_id === customerId)
                                            return (
                                                <Badge key={customerId} variant="secondary" className="flex items-center gap-1 text-xs">
                                                    <span className="max-w-[120px] truncate">
                                                        {getCustomerDisplayName(customer!) || `Customer ${customerId}`}
                                                    </span>
                                                    <X 
                                                        className="h-3 w-3 cursor-pointer hover:text-destructive" 
                                                        onClick={() => removeCustomer(customerId)}
                                                    />
                                                </Badge>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium">Status</h4>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isActive"
                                checked={formData.is_active}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: !!checked }))}
                                disabled={isLoading}
                            />
                            <Label htmlFor="isActive" className="text-sm">
                                Active (discount can be used immediately)
                            </Label>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 pt-6 flex-col sm:flex-row">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 w-full sm:w-auto"
                        >
                            {isLoading ? "Creating..." : "Create Discount"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default AddDiscountDialog 