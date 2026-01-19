import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, Clock, Filter, ChevronDown, ChevronUp } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState, useEffect } from "react"
import { Plus, ShoppingCart, Tag, X, Package, Minus } from "lucide-react"
import { useProductsQuery } from "../../../tanstack/physical/products-tanstack"
import { useVariantsQuery } from "../../../tanstack/physical/variants-tanstack"
import { useUsersQuery } from "../../../../../auth/presentation/tanstack/users-tanstack"
import toast from "react-hot-toast"
import { useSession } from "@/src/core/lib/dummy-session-provider"
import { useGetCustomers } from "../../../tanstack/physical/customer-tanstack"
import { Combobox } from "../../../../../../../components/ui/combobox"
import { CustomerEntity } from "@/src/features/sales/data/model/physical/customer-entity"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import AddCustomerDialog from "./add-customer-dialog"
import { useDiscountsQuery } from "../../../tanstack/physical/discount-tanstack"
import { useGetCategoriesQuery } from "../../../tanstack/physical/categories-tanstack"
import { useCollectionsQuery } from "../../../tanstack/physical/collection-tanstack"
import { Category } from "@/src/features/sales/data/model/physical/categories-entity"
import { DiscountEntity } from "@/src/features/sales/data/model/physical/discount-entity"
import { CollectionEntity } from "@/src/features/sales/data/model/physical/collection-entity"
import { Badge } from "@/components/ui/badge"
import { ProductEntity } from "@/src/features/sales/data/model/physical/products-entity"
import { VariantEntity } from "@/src/features/sales/data/model/physical/variants-entity"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface OrderItem {
    product_id: string
    variant_id: string
    quantity: number
    productName?: string
    variantName?: string
    variantPrice?: number
    productImage?: string
    currency?: string
}

interface AddOrderDialogProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: any) => void
    isLoading: boolean
    onAddCustomer: () => void
}

const AddOrderDialog = ({ isOpen, onClose, onSubmit, isLoading, onAddCustomer }: AddOrderDialogProps) => {
    const [orderItems, setOrderItems] = useState<OrderItem[]>([])
    const [selectedStaff, setSelectedStaff] = useState("")
    const [selectedCustomer, setSelectedCustomer] = useState("")
    const [selectedDiscount, setSelectedDiscount] = useState<DiscountEntity | null>(null)
    const [selectedCategory, setSelectedCategory] = useState("all")
    const [selectedCurrency, setSelectedCurrency] = useState("all")
    const [selectedCollection, setSelectedCollection] = useState("all")
    const [showAddCustomerDialog, setShowAddCustomerDialog] = useState(false)
    const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set())
    const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
    const [time, setTime] = useState<string>("")
    const [open, setOpen] = useState(false)

    // Initialize date and time with current values
    useEffect(() => {
        const now = new Date()
        setDate(format(now, 'yyyy-MM-dd'))
        setTime(format(now, 'HH:mm:ss'))
    }, [])

    // Format date for API
    const getFormattedDate = () => {
        return date
    }

    const formatCurrency = (value?: number | null, currency?: string | null) => {
        if (value === undefined || value === null) return "N/A";
        const curr = currency || 'MYR';
        if (curr === 'SGD') {
            return `SGD ${value.toFixed(2)}`;
        }
        const symbol = curr === 'USD' ? '$' : 'RM';
        return `${symbol}${value.toFixed(2)}`;
    }

    const { data: session } = useSession()
    const { data: products } = useProductsQuery()
    const { data: users } = useUsersQuery()
    const { data: customers, refetch: refetchCustomers } = useGetCustomers()
    const { data: discounts } = useDiscountsQuery()
    const { data: categoriesResponse } = useGetCategoriesQuery({ name: "", description: "" })
    const { data: collections } = useCollectionsQuery()

    // Fetch variants with filtering
    const variantQueryParams = {
        ...(selectedCategory && selectedCategory !== "all" && { category_id: selectedCategory }),
        ...(selectedCurrency && selectedCurrency !== "all" && { currency: selectedCurrency }),
        ...(selectedCollection && selectedCollection !== "all" && { collection_id: selectedCollection })
    }
    const { data: variants } = useVariantsQuery(Object.keys(variantQueryParams).length > 0 ? variantQueryParams : undefined)

    // Prepare categories for dropdown with "All Categories" option
    const availableCategories = [
        { id: "all", name: "All Categories" },
        ...(categoriesResponse?.data?.categories?.map((category: Category) => ({
            id: category.id || "",
            name: category.name || ""
        })) || [])
    ]

    // Prepare collections for dropdown with "All Collections" option
    const availableCollections = [
        { id: "all", name: "All Collections" },
        ...(collections?.map((collection: CollectionEntity) => ({
            id: collection.id || "",
            name: collection.name || ""
        })) || [])
    ]

    // Prepare currencies for dropdown with "All Currencies" option
    const availableCurrencies = [
        { value: "all", label: "All Currencies" },
        { value: "MYR", label: "MYR - Malaysia" },
        { value: "SGD", label: "SGD - Singapore" },
        { value: "USD", label: "USD - United States" }
    ]

    // Handle both API response types: DiscountResponse and { discounts: DiscountEntity[], metadata: any }
    const getDiscountsList = (): DiscountEntity[] => {
        if (!discounts) return []
        // Check if it's a DiscountResponse type (has data property)
        if ('data' in discounts && discounts.data?.discounts && Array.isArray(discounts.data.discounts)) {
            return discounts.data.discounts
        }
        // Check if it's the direct format (has discounts property)
        if ('discounts' in discounts && discounts.discounts && Array.isArray(discounts.discounts)) {
            return discounts.discounts
        }
        return []
    }
    
    const activeDiscounts = getDiscountsList().filter((discount: DiscountEntity) => discount.is_active)

    // Create a map of product data for easy lookup
    const productMap = new Map(products?.map(product => [product.id, product]) || [])

    // Filter variants and group by product
    const filteredVariants = variants || []

    // Group variants by product for display
    const groupedVariants = filteredVariants.reduce((groups, variant) => {
        const productId = variant.product_id || ""
        if (!groups[productId]) {
            const product = variant.product || productMap.get(productId)
            groups[productId] = {
                product: product || { id: productId, name: "Unknown Product" },
                variants: []
            }
        }
        groups[productId].variants.push(variant)
        return groups
    }, {} as Record<string, { product: ProductEntity, variants: VariantEntity[] }>)

    const availableProducts = Object.values(groupedVariants)

    // Set default staff to current logged-in user
    useEffect(() => {
        // Set default staff - no auth needed
        if (users && !selectedStaff && users.length > 0) {
            setSelectedStaff(users[0].email || 'demo@example.com')
        }
    }, [session, users, selectedStaff])

    // Get the current cart currency (from the first item)
    const getCartCurrency = () => {
        return orderItems.length > 0 ? orderItems[0].currency || 'MYR' : 'MYR'
    }

    // Check if all items in cart have the same currency
    const hasMixedCurrencies = () => {
        if (orderItems.length <= 1) return false
        const firstCurrency = orderItems[0].currency || 'MYR'
        return orderItems.some(item => (item.currency || 'MYR') !== firstCurrency)
    }

    const addToCart = (product: ProductEntity, variant: VariantEntity) => {
        const variantCurrency = variant.country?.currency || variant.currency || 'MYR'

        // Check for currency mixing
        if (orderItems.length > 0) {
            const cartCurrency = getCartCurrency()
            if (variantCurrency !== cartCurrency) {
                toast.error(`Cannot mix currencies. Cart uses ${cartCurrency}, but this product uses ${variantCurrency}`)
                return
            }
        }

        const existingItemIndex = orderItems.findIndex(
            item => item.product_id === product.id && item.variant_id === variant.id
        )

        if (existingItemIndex !== -1) {
            const updatedItems = [...orderItems]
            updatedItems[existingItemIndex].quantity += 1
            setOrderItems(updatedItems)
        } else {
            const newItem: OrderItem = {
                product_id: product.id!,
                variant_id: variant.id!,
                quantity: 1,
                productName: product.name || undefined,
                variantName: variant.sku_name || undefined,
                variantPrice: variant.price || undefined,
                productImage: product.images?.[0] || undefined,
                currency: variantCurrency
            }
            setOrderItems([...orderItems, newItem])
        }
        toast.success(`Added ${product.name} to cart`)
    }

    // Helper function to get variant categories display
    const getVariantCategoriesDisplay = (variant: VariantEntity) => {
        if (variant.categories && variant.categories.length > 0) {
            return variant.categories.map(cat => cat.name).join(", ")
        }
        return "Uncategorized"
    }

    const updateQuantity = (index: number, quantity: number) => {
        if (quantity <= 0) {
            removeItem(index)
            return
        }

        const updatedItems = [...orderItems]
        updatedItems[index].quantity = quantity
        setOrderItems(updatedItems)
    }

    const removeItem = (index: number) => {
        const updatedItems = orderItems.filter((_, i) => i !== index)
        setOrderItems(updatedItems)
    }

    const addDiscount = (discount: DiscountEntity) => {
        setSelectedDiscount(discount)
        toast.success(`Applied discount: ${discount.code}`)
    }

    const removeDiscount = () => {
        const discountCode = selectedDiscount?.code
        setSelectedDiscount(null)
        toast.success(`Removed discount: ${discountCode}`)
    }

    const getSubtotal = () => {
        return orderItems.reduce((total, item) => {
            return total + (item.variantPrice || 0) * item.quantity
        }, 0)
    }

    const getDiscountAmount = () => {
        if (!selectedDiscount) return 0
        const subtotal = getSubtotal()

        if (selectedDiscount.discount_type === "PERCENTAGE") {
            return (subtotal * selectedDiscount.discount_value) / 100
        } else {
            return Math.min(selectedDiscount.discount_value, subtotal)
        }
    }

    const getTotalAmount = () => {
        return getSubtotal() - getDiscountAmount()
    }

    const toggleProductExpansion = (productId: string) => {
        const newExpanded = new Set(expandedProducts)
        if (newExpanded.has(productId)) {
            newExpanded.delete(productId)
        } else {
            newExpanded.add(productId)
        }
        setExpandedProducts(newExpanded)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (orderItems.length === 0) {
            toast.error("Please add at least one product to the order")
            return
        }

        if (!selectedStaff) {
            toast.error("Please select a staff member")
            return
        }

        if (!selectedCustomer) {
            toast.error("Please select a customer")
            return
        }

        if (!date) {
            toast.error("Please select a date")
            return
        }

        const selectedUser = users?.find(user => user.email === selectedStaff)
        if (!selectedUser?.id) {
            toast.error("Invalid staff selection")
            return
        }

        // Get currency and determine country code
        const cartCurrency = getCartCurrency()
        const getCountryCode = (currency: string) => {
            switch (currency) {
                case 'MYR':
                    return 'MY'
                case 'SGD':
                    return 'SG'
                case 'USD':
                    return 'US'
                default:
                    return 'MY' // Default to Malaysia
            }
        }

        const countryCode = getCountryCode(cartCurrency)

        const orderData = {
            user_id: selectedUser.id,
            customer_medusa_id: selectedCustomer,
            country_code: countryCode,
            shipping_country: countryCode,
            currency: cartCurrency,
            date: getFormattedDate(),
            time: time,
            order_items: orderItems.map(item => ({
                product_id: item.product_id,
                variant_id: item.variant_id,
                quantity: item.quantity
            })),
            ...(selectedDiscount && { discount_id: selectedDiscount.id })
        }

        onSubmit(orderData)
        resetForm()
    }

    const resetForm = () => {
        setOrderItems([])
        setSelectedStaff(session?.user_entity?.email || "")
        setSelectedCustomer("")
        setSelectedDiscount(null)
        setSelectedCategory("all")
        setSelectedCollection("all")
        setSelectedCurrency("all")
        setExpandedProducts(new Set())
        const now = new Date()
        setDate(format(now, 'yyyy-MM-dd'))
        setTime(format(now, 'HH:mm:ss'))
    }

    const handleAddCustomerSuccess = async (customerId: string) => {
        await refetchCustomers()
        setShowAddCustomerDialog(false)
        setSelectedCustomer(customerId)
    }

    // Mobile optimized product grid component
    const ProductGrid = () => (
        <div className="flex flex-col h-full">
            <ScrollArea className="flex-1 min-h-0 p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 pb-6">
                    {availableProducts.map((productGroup) => {
                        const isExpanded = expandedProducts.has(productGroup.product.id || '')
                        const variantCount = productGroup.variants?.length || 0
                        
                        return (
                            <Card key={productGroup.product.id} className="overflow-hidden">
                                <CardContent className="p-3">
                                                                    <div 
                                    className="aspect-square rounded-md overflow-hidden mb-2 bg-muted/30 h-20 sm:h-24 cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => toggleProductExpansion(productGroup.product.id || '')}
                                >
                                    {productGroup.product.images?.[0] ? (
                                        <img
                                            src={productGroup.product.images[0]}
                                            alt={productGroup.product.name || 'Product'}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                                <h3 
                                    className="font-medium text-xs sm:text-sm mb-2 line-clamp-2 leading-tight cursor-pointer hover:text-primary transition-colors" 
                                    title={productGroup.product.name || undefined}
                                    onClick={() => toggleProductExpansion(productGroup.product.id || '')}
                                >
                                    {productGroup.product.name}
                                </h3>

                                    {/* Variants Dropdown Toggle */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-between h-8 mb-2 text-xs"
                                        onClick={() => toggleProductExpansion(productGroup.product.id || '')}
                                    >
                                        <span className="flex items-center gap-2">
                                            <Package className="h-3 w-3" />
                                            {variantCount} variant{variantCount !== 1 ? 's' : ''}
                                        </span>
                                        {isExpanded ? (
                                            <ChevronUp className="h-3 w-3" />
                                        ) : (
                                            <ChevronDown className="h-3 w-3" />
                                        )}
                                    </Button>

                                    {/* Variants List - Conditionally Rendered */}
                                    {isExpanded && (
                                        <div className="space-y-1">
                                            {productGroup.variants?.map((variant) => (
                                                <div
                                                    key={variant.id}
                                                    className="p-2 bg-muted/50 rounded-sm"
                                                >
                                                    <div className="flex items-start justify-between mb-1">
                                                        <div className="flex-1 min-w-0 mr-2">
                                                            <p className="text-xs font-medium leading-tight break-words">
                                                                {variant.sku_name}
                                                            </p>
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {variant.categories && variant.categories.length > 0 ? (
                                                                    variant.categories.map((category, idx) => (
                                                                        <Badge key={idx} variant="secondary" className="text-xs px-1 py-0 h-4">
                                                                            {category.name}
                                                                        </Badge>
                                                                    ))
                                                                ) : (
                                                                    <Badge variant="outline" className="text-xs px-1 py-0 h-4 text-muted-foreground">
                                                                        Uncategorized
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            className="h-6 w-6 p-0 flex-shrink-0"
                                                            onClick={() => addToCart(productGroup.product, variant)}
                                                            disabled={!variant.quantity || variant.quantity <= 0}
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-muted-foreground">Stock: {variant.quantity || 0}</span>
                                                        <span className="font-semibold">{formatCurrency(variant.price, variant.country?.currency || variant.currency || 'MYR')}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {availableProducts.length === 0 && (
                    <div className="text-center py-12">
                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                            No products available
                        </p>
                    </div>
                )}
            </ScrollArea>
        </div>
    )

    // Order details component with better mobile layout
    const OrderDetails = () => (
        <div className="flex flex-col h-full min-h-0">
            <div className="flex-1 min-h-0 overflow-auto p-3 md:p-4">
                <div className="space-y-3 md:space-y-4">
                    {/* Staff & Customer Selection */}
                    <div className="space-y-2 md:space-y-3">
                        <div>
                            <Label className="text-sm">Staff Member</Label>
                            <Select value={selectedStaff} onValueChange={setSelectedStaff} required>
                                <SelectTrigger className="h-9 mt-1">
                                    <SelectValue placeholder="Select staff" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users?.map((user) => (
                                        <SelectItem key={user.id} value={user.email || ''}>
                                            {user.email}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <Label className="text-sm">Customer</Label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-xs"
                                    onClick={() => setShowAddCustomerDialog(true)}
                                >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add
                                </Button>
                            </div>
                            <Combobox
                                options={customers?.map((customer: CustomerEntity) => ({
                                    label: `${customer.email || ''} ${customer.first_name ? `(${customer.first_name} ${customer.last_name || ''})` : ''}`.trim(),
                                    value: customer.customer_id || ''
                                })) || []}
                                value={selectedCustomer}
                                onValueChange={setSelectedCustomer}
                                placeholder="Search customer..."
                                emptyText="No customer found"
                            />
                        </div>

                        {/* Date and Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-2">
                            <div className="flex flex-col gap-2">
                                <Label className="text-sm">Date</Label>
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => {
                                        setDate(e.target.value)
                                    }}
                                    className="flex-1"
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <Label className="text-sm">Time</Label>
                                    <Clock
                                        onClick={() => {
                                            const now = new Date()
                                            setTime(format(now, 'HH:mm:ss'))
                                        }}
                                        className="h-4 w-4 cursor-pointer hover:text-muted-foreground"
                                    />
                                </div>
                                <div className="flex mt-1">
                                    <Input
                                        type="time"
                                        step="1"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Cart Items */}
                    <div>
                        <h3 className="font-medium mb-3 flex items-center gap-2 text-sm">
                            <ShoppingCart className="h-4 w-4" />
                            Cart ({orderItems.length})
                        </h3>

                        {/* Currency mixing warning */}
                        {hasMixedCurrencies() && (
                            <div className="mb-3 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
                                <p className="text-xs text-destructive">
                                    ⚠️ Mixed currencies detected. Please remove items to use a single currency.
                                </p>
                            </div>
                        )}

                        {orderItems.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground">
                                <ShoppingCart className="h-6 w-6 mx-auto mb-2" />
                                <p className="text-xs">Your cart is empty</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {orderItems.map((item, index) => (
                                    <div key={index} className="p-3 bg-muted/30 rounded-md">
                                        <div className="flex items-start gap-3 mb-2">
                                            <div className="w-10 h-10 rounded overflow-hidden bg-muted shrink-0">
                                                {item.productImage ? (
                                                    <img
                                                        src={item.productImage}
                                                        alt={item.productName || 'Product'}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium leading-tight break-words mb-1">
                                                    {item.productName}
                                                </p>
                                                <p className="text-xs text-muted-foreground leading-tight break-words mb-1">
                                                    {item.variantName}
                                                </p>
                                                <p className="text-xs font-medium">{formatCurrency(item.variantPrice, item.currency)}</p>
                                            </div>

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0 text-destructive hover:text-destructive shrink-0"
                                                onClick={() => removeItem(index)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 w-7 p-0"
                                                    onClick={() => updateQuantity(index, item.quantity - 1)}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 w-7 p-0"
                                                    onClick={() => updateQuantity(index, item.quantity + 1)}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>

                                            <span className="text-sm font-semibold">
                                                {formatCurrency((item.variantPrice || 0) * item.quantity, item.currency)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Discount */}
                    {orderItems.length > 0 && (
                        <>
                            <Separator />
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-medium flex items-center gap-2 text-sm">
                                        <Tag className="h-4 w-4" />
                                        Discount
                                    </h3>
                                    {selectedDiscount && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 text-xs text-muted-foreground hover:text-foreground"
                                            onClick={removeDiscount}
                                        >
                                            Clear
                                        </Button>
                                    )}
                                </div>

                                {selectedDiscount ? (
                                    <div className="p-3 bg-muted border border-border rounded-md">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge variant="outline" className="text-xs">
                                                        {selectedDiscount.code}
                                                    </Badge>
                                                    <Tag className="h-3 w-3 text-muted-foreground" />
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {selectedDiscount.discount_type === "PERCENTAGE"
                                                        ? `${selectedDiscount.discount_value}% discount`
                                                        : `${formatCurrency(selectedDiscount.discount_value, getCartCurrency())} discount`}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold">
                                                    -{formatCurrency(getDiscountAmount(), getCartCurrency())}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        {activeDiscounts.length > 0 ? (
                                            <div className="space-y-2">
                                                <p className="text-xs text-muted-foreground mb-2">Available discounts:</p>
                                                {activeDiscounts.map((discount: DiscountEntity) => (
                                                    <Button
                                                        key={discount.id}
                                                        type="button"
                                                        variant="outline"
                                                        className="w-full justify-between h-auto p-3 text-left hover:bg-muted"
                                                        onClick={() => addDiscount(discount)}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Tag className="h-4 w-4 text-muted-foreground" />
                                                            <div>
                                                                <div className="font-medium text-sm">{discount.code}</div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {discount.discount_type === "PERCENTAGE"
                                                                        ? `${discount.discount_value}% off`
                                                                        : `${formatCurrency(discount.discount_value, getCartCurrency())} off`}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Plus className="h-4 w-4 text-muted-foreground" />
                                                    </Button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4">
                                                <Tag className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                                                <p className="text-xs text-muted-foreground">No discounts available</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Order Summary & Actions - Always visible at bottom */}
            {orderItems.length > 0 && (
                <div className="border-t p-3 md:p-4 bg-background">
                    <div className="space-y-2 md:space-y-3">
                        <div className="space-y-1 md:space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Subtotal:</span>
                                <span>{formatCurrency(getSubtotal(), getCartCurrency())}</span>
                            </div>
                            {selectedDiscount && (
                                <div className="flex justify-between text-sm">
                                    <span>Discount ({selectedDiscount.code}):</span>
                                    <span>-{formatCurrency(getDiscountAmount(), getCartCurrency())}</span>
                                </div>
                            )}
                            <Separator />
                            <div className="flex justify-between font-semibold text-base">
                                <span>Total:</span>
                                <span>{formatCurrency(getTotalAmount(), getCartCurrency())}</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading || orderItems.length === 0 || hasMixedCurrencies()}
                                className="flex-1"
                            >
                                {isLoading ? "Creating..." : "Create Order"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="w-[95vw] max-w-6xl h-[95vh] p-0 flex flex-col md:w-[90vw] md:h-[90vh]">
                    <DialogHeader className="p-4 border-b flex-shrink-0">
                        <DialogTitle>Create New Order</DialogTitle>
                        <DialogDescription>
                            Select products and configure order details
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 min-h-0">
                        {/* Mobile: Use tabs for better UX */}
                        <div className="md:hidden h-full overflow-hidden flex flex-col">
                            <Tabs defaultValue="products" className="h-full flex flex-col">
                                <TabsList className="grid  grid-cols-2 mx-4 mt-2 flex-shrink-0">
                                    <TabsTrigger value="products">Products</TabsTrigger>
                                    <TabsTrigger value="order" className="relative">
                                        Order
                                        {orderItems.length > 0 && (
                                            <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                                                {orderItems.length}
                                            </Badge>
                                        )}
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="products" className="flex-1 min-h-0 mt-0 mx-0 overflow-hidden flex flex-col data-[state=inactive]:hidden">
                                    {/* Compact Filter Dropdowns */}
                                    <div className="p-4 border-b flex-shrink-0">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Filter className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">Filters</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                                <SelectTrigger className="h-9">
                                                    <SelectValue placeholder="All Categories" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableCategories.map((category) => (
                                                        <SelectItem key={category.id} value={category.id}>
                                                            {category.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                                                <SelectTrigger className="h-9">
                                                    <SelectValue placeholder="All Collections" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableCollections.map((collection) => (
                                                        <SelectItem key={collection.id} value={collection.id}>
                                                            {collection.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                                                <SelectTrigger className="h-9">
                                                    <SelectValue placeholder="All Currencies" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableCurrencies.map((currency) => (
                                                        <SelectItem key={currency.value} value={currency.value}>
                                                            {currency.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <ProductGrid />
                                </TabsContent>
                                <TabsContent value="order" className="flex-1 min-h-0 mt-0 mx-0 overflow-hidden data-[state=inactive]:hidden">
                                    <form onSubmit={handleSubmit} className="h-full flex flex-col">
                                        <OrderDetails />
                                    </form>
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Desktop: Side-by-side layout */}
                        <div className="hidden md:flex h-full">
                            {/* Left Side - Product Selection */}
                            <div className="flex-1 border-r flex flex-col">
                                <div className="p-4 pt-0 border-b">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Filter className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Filters</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="All Categories" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableCategories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="All Collections" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableCollections.map((collection) => (
                                                    <SelectItem key={collection.id} value={collection.id}>
                                                        {collection.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="All Currencies" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableCurrencies.map((currency) => (
                                                    <SelectItem key={currency.value} value={currency.value}>
                                                        {currency.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-hidden">
                                    <ScrollArea className="h-full p-4">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                                            {availableProducts.map((productGroup) => {
                                                const isExpanded = expandedProducts.has(productGroup.product.id || '')
                                                const variantCount = productGroup.variants?.length || 0
                                                
                                                return (
                                                    <Card key={productGroup.product.id} className="overflow-hidden">
                                                        <CardContent className="p-3">
                                                            <div 
                                                                className="aspect-square rounded-md overflow-hidden mb-2 bg-muted/30 h-24 cursor-pointer hover:bg-muted/50 transition-colors"
                                                                onClick={() => toggleProductExpansion(productGroup.product.id || '')}
                                                            >
                                                                {productGroup.product.images?.[0] ? (
                                                                    <img
                                                                        src={productGroup.product.images[0]}
                                                                        alt={productGroup.product.name || 'Product'}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center">
                                                                        <Package className="h-8 w-8 text-muted-foreground" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <h3 
                                                                className="font-medium text-xs mb-2 line-clamp-2 leading-tight cursor-pointer hover:text-primary transition-colors" 
                                                                title={productGroup.product.name || undefined}
                                                                onClick={() => toggleProductExpansion(productGroup.product.id || '')}
                                                            >
                                                                {productGroup.product.name}
                                                            </h3>

                                                            {/* Variants Dropdown Toggle */}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="w-full justify-between h-8 mb-2 text-xs"
                                                                onClick={() => toggleProductExpansion(productGroup.product.id || '')}
                                                            >
                                                                <span className="flex items-center gap-2">
                                                                    <Package className="h-3 w-3" />
                                                                    {variantCount} variant{variantCount !== 1 ? 's' : ''}
                                                                </span>
                                                                {isExpanded ? (
                                                                    <ChevronUp className="h-3 w-3" />
                                                                ) : (
                                                                    <ChevronDown className="h-3 w-3" />
                                                                )}
                                                            </Button>

                                                            {/* Variants List - Conditionally Rendered */}
                                                            {isExpanded && (
                                                                <div className="space-y-1">
                                                                    {productGroup.variants?.map((variant) => (
                                                                        <div
                                                                            key={variant.id}
                                                                            className="p-2 bg-muted/50 rounded-sm"
                                                                        >
                                                                            <div className="flex items-start justify-between mb-1">
                                                                                <div className="flex-1 min-w-0 mr-2">
                                                                                    <p className="text-xs font-medium leading-tight break-words">
                                                                                        {variant.sku_name}
                                                                                    </p>
                                                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                                                        {variant.categories && variant.categories.length > 0 ? (
                                                                                            variant.categories.map((category, idx) => (
                                                                                                <Badge key={idx} variant="secondary" className="text-xs px-1 py-0 h-4">
                                                                                                    {category.name}
                                                                                                </Badge>
                                                                                            ))
                                                                                        ) : (
                                                                                            <Badge variant="outline" className="text-xs px-1 py-0 h-4 text-muted-foreground">
                                                                                                Uncategorized
                                                                                            </Badge>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                                <Button
                                                                                    size="sm"
                                                                                    className="h-6 w-6 p-0 flex-shrink-0"
                                                                                    onClick={() => addToCart(productGroup.product, variant)}
                                                                                    disabled={!variant.quantity || variant.quantity <= 0}
                                                                                >
                                                                                    <Plus className="h-3 w-3" />
                                                                                </Button>
                                                                            </div>
                                                                            <div className="flex items-center justify-between text-xs">
                                                                                <span className="text-muted-foreground">Stock: {variant.quantity || 0}</span>
                                                                                <span className="font-semibold">{formatCurrency(variant.price, variant.country?.currency || variant.currency || 'MYR')}</span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                )
                                            })}
                                        </div>

                                        {availableProducts.length === 0 && (
                                            <div className="text-center py-12">
                                                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                                                                            <p className="text-muted-foreground">
                                                No products available
                                            </p>
                                            </div>
                                        )}
                                    </ScrollArea>
                                </div>
                            </div>

                            {/* Right Side - Order Details */}
                            <div className="w-96 flex flex-col overflow-hidden">
                                <div className="p-4 border-b flex-shrink-0">
                                    <h3 className="font-semibold">Order Details</h3>
                                </div>
                                <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
                                    <OrderDetails />
                                </form>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <AddCustomerDialog
                isOpen={showAddCustomerDialog}
                onClose={() => setShowAddCustomerDialog(false)}
                onSuccess={handleAddCustomerSuccess}
            />
        </>
    )
}

export default AddOrderDialog