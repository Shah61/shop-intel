"use client"
import { Package, ArrowLeft, Plus, Pencil, Trash, ShoppingCart, Info, Eye, ChevronRight, ChevronLeft, Check, AlertCircle } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useCreateVariantMutation, useUpdateVariantMutation, useDeleteVariantMutation } from "@/src/features/sales/presentation/tanstack/physical/variants-tanstack"
import { useCreateOrderMutation } from "@/src/features/sales/presentation/tanstack/physical/orders-tanstack"
import { useUpdateProductMutation } from "@/src/features/sales/presentation/tanstack/physical/products-tanstack"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Import UI components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import ProductForm from "../products/add-product"

// Import API service functions
import { VariantEntity, Country } from "@/src/features/sales/data/model/physical/variants-entity"
import { OrderEntity } from "@/src/features/sales/data/model/physical/orders-entity"
import { UsersEntity } from "@/src/features/auth/data/model/users-entity"

// Import Tanstack hooks
import { useProductByIdQuery } from "@/src/features/sales/presentation/tanstack/physical/products-tanstack"
import { useUsersQuery } from "@/src/features/auth/presentation/tanstack/users-tanstack"
import { useListCountriesQuery } from "@/src/features/sales/presentation/tanstack/physical/variants-tanstack"
import { useGetCategoriesQuery } from "@/src/features/sales/presentation/tanstack/physical/categories-tanstack"
import { Category } from "@/src/features/sales/data/model/physical/categories-entity"


import { useSession } from "@/src/core/lib/dummy-session-provider"

// Define the props interface
interface ProductDetailsScreenProps {
  productID: string;
}

// Use VariantEntity directly instead of local Variant interface

const ProductDetailsScreen = ({ productID }: ProductDetailsScreenProps) => {
  const router = useRouter()
  const [selectedVariant, setSelectedVariant] = useState<VariantEntity | null>(null)
  const [isVariantDialogOpen, setIsVariantDialogOpen] = useState(false)
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
  const [selectedVariantId, setSelectedVariantId] = useState<string>("")
  const [orderQuantity, setOrderQuantity] = useState<number>(1)
  const [orderError, setOrderError] = useState<string>("")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isProductFormOpen, setIsProductFormOpen] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<string>('MYR')
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])

  const { mutate: createVariant, isPending: isCreatingVariant } = useCreateVariantMutation()
  const { mutate: updateVariant, isPending: isUpdatingVariant } = useUpdateVariantMutation()
  const { mutate: deleteVariant, isPending: isDeletingVariant } = useDeleteVariantMutation()
  const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrderMutation()
  const { mutate: updateProduct, isPending: isUpdatingProduct } = useUpdateProductMutation()

  // Replace direct query with Tanstack hooks
  const { data: productDetails, isLoading, error } = useProductByIdQuery(productID)

  // Replace users query with Tanstack hook
  const { data: users } = useUsersQuery()

  // Get countries for currency selection
  const { data: countries } = useListCountriesQuery()

  // Get categories for category selection
  const { data: categoriesResponse } = useGetCategoriesQuery({ name: "", description: "" })

  const { data: session } = useSession()

  // useEffect(() => {
  //   if (session?.user_entity?.role !== 'ADMIN') {
  //     router.push('/sales')
  //   }
  // }, [session])

  // Set currency and categories when editing a variant
  useEffect(() => {
    if (selectedVariant && isVariantDialogOpen) {
      setSelectedCurrency(selectedVariant.country?.currency || selectedVariant.currency || 'MYR')
      
      // Set the category IDs from the variant - handle multiple categories
      let categoryIds: string[] = [];
      
      console.log('🔍 DEBUGGING selectedVariant:', {
        variant: selectedVariant,
        category_id: selectedVariant.category_id,
        categories: selectedVariant.categories,
        category: selectedVariant.category
      });
      
      console.log('🔍 DEBUGGING categoriesResponse:', {
        response: categoriesResponse,
        categories: categoriesResponse?.data?.categories
      });
      
      // First try to get from category_id field (single category)
      if (selectedVariant.category_id) {
        categoryIds = [selectedVariant.category_id];
        console.log('✅ Found category_id:', selectedVariant.category_id);
      } 
      // Then try to get from categories array by matching names with API categories
      else if (selectedVariant.categories && selectedVariant.categories.length > 0 && categoriesResponse?.data?.categories) {
        categoryIds = selectedVariant.categories
          .map(variantCategory => {
            const matchedCategory = categoriesResponse.data.categories.find(
              (cat: Category) => cat.name.toLowerCase() === variantCategory.name?.toLowerCase()
            );
            return matchedCategory ? matchedCategory.id : null;
          })
          .filter((id): id is string => id !== null);
        
        console.log('✅ Found categories by matching variant category names:', categoryIds);
        console.log('   - Matched from variant categories:', selectedVariant.categories.map(c => c.name));
      }
      // Check if we have a category name string that we can match
      else if (selectedVariant.category && categoriesResponse?.data?.categories) {
        const matchedCategory = categoriesResponse.data.categories.find(
          (cat: Category) => cat.name.toLowerCase() === selectedVariant.category?.toLowerCase()
        );
        if (matchedCategory) {
          categoryIds = [matchedCategory.id];
          console.log('✅ Found category by matching category string:', matchedCategory.id, matchedCategory.name);
        }
      }
      
      setSelectedCategoryIds(categoryIds);
      console.log('🎯 Final selectedCategoryIds set to:', categoryIds);
    } else if (!selectedVariant && isVariantDialogOpen) {
      // Reset for new variant
      setSelectedCurrency('MYR')
      setSelectedCategoryIds([])
    }
  }, [selectedVariant, isVariantDialogOpen, categoriesResponse])

  const handleGoBack = () => {
    router.back()
  }

  const handleAddVariant = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const newVariant = {
      sku_name: formData.get('sku_name') as string,
      sku_no: formData.get('sku_no') as string,
      price: Number(formData.get('price')),
      currency: selectedCurrency,
      category_ids: selectedCategoryIds, // Always send array, even if empty
      product_id: productID,
      is_active: formData.get('is_active') === 'true',
    }

    console.log('Creating variant with data:', newVariant)
    createVariant(newVariant, {
      onSuccess: () => {
        setIsVariantDialogOpen(false)
      }
    })
  }

  const handleEditVariant = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedVariant?.id) return;

    const formData = new FormData(e.currentTarget)

    const updatedVariant: VariantEntity = {
      id: selectedVariant.id,
      sku_name: formData.get('sku_name') as string,
      sku_no: formData.get('sku_no') as string,
      price: Number(formData.get('price')),
      quantity: Number(formData.get('quantity')) || 0,
      currency: selectedCurrency,
      category_ids: selectedCategoryIds, // Always send array, even if empty
      product_id: productID,
      is_active: formData.get('is_active') === 'true',
    }

    console.log('Updating variant with data:', updatedVariant)
    updateVariant({ variant: updatedVariant as VariantEntity, accessToken: session?.backend_tokens?.access_token }, {
      onSuccess: () => {
        setIsVariantDialogOpen(false)
        setSelectedVariant(null)
      }
    })
  }

  const handleDeleteVariant = async (variantId: string | null | undefined) => {
    if (!variantId) return;
    if (confirm('Are you sure you want to delete this variant?')) {
      deleteVariant(variantId)
    }
  }

  const getSelectedVariantQuantity = () => {
    if (!selectedVariantId || !productDetails?.variants) return 0;
    const variant = productDetails.variants.find((v: VariantEntity) => v.id === selectedVariantId);
    return variant?.quantity || 0;
  }

  const handleCreateOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setOrderError("")

    if (!selectedVariantId) {
      alert('Please select a variant')
      return
    }

    const availableQuantity = getSelectedVariantQuantity();
    if (orderQuantity > availableQuantity) {
      setOrderError(`Not enough quantity available. Maximum available: ${availableQuantity}`);
      return;
    }

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string

    if (!email) {
      alert('Please select a user')
      return
    }

    // Get user ID from selected email
    const selectedUser = users?.find(user => user.email === email)
    if (!selectedUser?.id) {
      alert('Invalid user selection')
      return
    }

    const newOrder = {
      user_id: selectedUser.id,
      customer_medusa_id: "temp_customer", // You may need to add customer selection
      order_items: [{
        product_id: productID,
        variant_id: selectedVariantId,
        quantity: orderQuantity
      }]
    }

    createOrder(newOrder, {
      onSuccess: () => {
        setIsOrderDialogOpen(false)
        setSelectedVariantId("")
        setOrderQuantity(1)
        setOrderError("")
      }
    })
  }

  const nextImage = () => {
    if (productDetails?.images && productDetails.images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === productDetails.images!.length - 1 ? 0 : prevIndex + 1
      )
    }
  }

  const prevImage = () => {
    if (productDetails?.images && productDetails.images.length > 0) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? productDetails.images!.length - 1 : prevIndex - 1
      )
    }
  }

  const getStockStatus = (quantity?: number | null) => {
    if (quantity === undefined || quantity === null) return "unknown";
    if (quantity <= 0) return "outOfStock";
    if (quantity < 10) return "lowStock";
    return "inStock";
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

  const getTotalInventoryValue = () => {
    if (!productDetails?.variants) return 0;
    return productDetails.variants.reduce((sum, variant) => {
      return sum + ((variant.price || 0) * (variant.quantity || 0));
    }, 0);
  }

  const getInventoryValueDisplay = () => {
    if (!productDetails?.variants || productDetails.variants.length === 0) {
      return formatCurrency(0);
    }
    
    // Group by currency
    const currencyGroups = productDetails.variants.reduce((groups, variant) => {
      const currency = variant.country?.currency || variant.currency || 'MYR';
      const value = (variant.price || 0) * (variant.quantity || 0);
      groups[currency] = (groups[currency] || 0) + value;
      return groups;
    }, {} as Record<string, number>);
    
    // If only one currency, show single value
    const currencies = Object.keys(currencyGroups);
    if (currencies.length === 1) {
      return formatCurrency(currencyGroups[currencies[0]], currencies[0]);
    }
    
    // If multiple currencies, show all
    return currencies.map(currency => 
      formatCurrency(currencyGroups[currency], currency)
    ).join(' + ');
  }

  return (
    <div className="flex flex-col items-start justify-center w-full gap-6 pb-16">
      {/* Back Button */}
      <div className="flex items-center gap-4 w-full mt-4">
        <Button 
          variant="outline" 
          onClick={handleGoBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to Products</span>
          <span className="sm:hidden">Back</span>
        </Button>
      </div>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center w-full">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{productDetails?.name || 'Product Details'}</h1>
          <p className="text-muted-foreground mt-1">
            Manage product information, variants, and orders
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsOrderDialogOpen(true)}>
            <ShoppingCart className="h-4 w-4 mr-2" /> Create Order
          </Button>
          {session?.user_entity?.role === 'ADMIN' && (
            <Button onClick={() => setIsProductFormOpen(true)}>
              <Pencil className="h-4 w-4 mr-2" /> Edit Product
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64 w-full bg-muted/30 rounded-lg animate-pulse">
          <p className="text-muted-foreground">Loading product details...</p>
        </div>
      ) : error ? (
        <div className="w-full p-6 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-semibold">Error loading product details</h3>
          </div>
          <p className="text-destructive/80">{error.message}</p>
        </div>
      ) : productDetails ? (
        <>
          {/* Product Overview Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
            {/* Product Image Gallery Card */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Product Images</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="relative w-full h-80 rounded-md overflow-hidden bg-muted/30 mb-3 border">
                  {productDetails?.images && productDetails.images.length > 0 ? (
                    <>
                      <img
                        src={productDetails.images[currentImageIndex] || ''}
                        alt={productDetails.name || 'Product image'}
                        className="object-contain w-full h-full p-2"
                      />
                      {productDetails.images.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 p-1 rounded-full shadow-md hover:bg-background"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 p-1 rounded-full shadow-md hover:bg-background"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                            {productDetails.images.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <Package className="h-16 w-16 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
                {productDetails?.images && productDetails.images.length > 1 && (
                  <div className="flex overflow-x-auto gap-2 pb-2 mt-2 w-full">
                    {productDetails.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`shrink-0 w-16 h-16 rounded border overflow-hidden ${index === currentImageIndex ? 'ring-2 ring-primary ring-offset-1' : 'opacity-70'
                          }`}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Product Information Card */}
            <Card className="lg:col-span-2">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Product ID</h3>
                      <p className="font-mono text-sm bg-muted px-2 py-1 rounded inline-block">{productID}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Product Name</h3>
                      <p className="text-lg font-medium">{productDetails.name || 'Unnamed Product'}</p>
                    </div>


                  </div>

                  <div>
                    <div className="bg-muted/40 rounded-lg p-4 mb-4">
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">Product Summary</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-background rounded-md p-3 border">
                          <p className="text-xs text-muted-foreground">Total Variants</p>
                          <p className="text-xl font-bold">{productDetails.variants?.length || 0}</p>
                        </div>
                        <div className="bg-background rounded-md p-3 border">
                          <p className="text-xs text-muted-foreground">Total Orders</p>
                          <p className="text-xl font-bold">{productDetails.orders?.length || 0}</p>
                        </div>
                        <div className="bg-background rounded-md p-3 border">
                          <p className="text-xs text-muted-foreground">Total Inventory</p>
                          <p className="text-xl font-bold">
                            {productDetails.variants?.reduce((sum, v) => sum + (v.quantity || 0), 0) || 0}
                          </p>
                        </div>
                        <div className="bg-background rounded-md p-3 border">
                          <p className="text-xs text-muted-foreground">Inventory Value</p>
                          <p className="text-xl font-bold">{getInventoryValueDisplay()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium text-muted-foreground">Date Created</h3>
                        <p>{productDetails.created_at ? new Date(productDetails.created_at).toLocaleDateString() : "N/A"}</p>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                        <p>{productDetails.updated_at ? new Date(productDetails.updated_at).toLocaleDateString() : "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Variants Section */}
          <div className="w-full mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Product Variants</CardTitle>
                  <CardDescription>Manage all variants for this product</CardDescription>
                </div>
                <Button onClick={() => {
                  setSelectedVariant(null);
                  setIsVariantDialogOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" /> Add Variant
                </Button>
              </CardHeader>
              <CardContent>
                {productDetails?.variants && productDetails.variants.length > 0 ? (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>SKU Name</TableHead>
                          <TableHead>SKU Number</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Currency</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Stock Status</TableHead>
                          <TableHead>Active Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {productDetails.variants.map((variant: VariantEntity) => {
                          const stockStatus = getStockStatus(variant.quantity);
                          return (
                            <TableRow key={variant.id} className="hover:bg-muted/30">
                              <TableCell className="font-medium">{variant.sku_name || 'N/A'}</TableCell>
                              <TableCell className="font-mono text-sm">{variant.sku_no || 'N/A'}</TableCell>
                              <TableCell>{formatCurrency(variant.price, variant.country?.currency || variant.currency)}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="font-mono">
                                  {variant.country?.currency || variant.currency || 'MYR'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {variant.categories && variant.categories.length > 0 ? (
                                    variant.categories.map((category, index) => (
                                      <Badge key={index} variant="secondary" className="capitalize">
                                        {category.name}
                                      </Badge>
                                    ))
                                  ) : (
                                    <Badge variant="secondary" className="capitalize">
                                      {variant.category || 'Uncategorized'}
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{variant.quantity ?? 'N/A'}</TableCell>
                              <TableCell>
                                {stockStatus === "inStock" && (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    <Check className="h-3 w-3 mr-1" /> In Stock
                                  </Badge>
                                )}
                                {stockStatus === "lowStock" && (
                                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                    <AlertCircle className="h-3 w-3 mr-1" /> Low Stock
                                  </Badge>
                                )}
                                {stockStatus === "outOfStock" && (
                                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                    Out of Stock
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {variant.is_active !== undefined && variant.is_active !== null ? (
                                  variant.is_active ? (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                      <Check className="h-3 w-3 mr-1" /> Active
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                      Inactive
                                    </Badge>
                                  )
                                ) : (
                                  <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                    Unknown
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {variant.created_at
                                  ? new Date(variant.created_at).toLocaleDateString()
                                  : 'N/A'}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                                                                  onClick={() => {
                                          setSelectedVariant(variant as VariantEntity);
                                          setIsVariantDialogOpen(true);
                                        }}
                                        >
                                          <Pencil className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Edit Variant</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>

                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                          onClick={() => variant.id && handleDeleteVariant(variant.id)}
                                        >
                                          <Trash className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Delete Variant</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/20">
                    <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium mb-1">No Variants Available</h3>
                    <p className="text-muted-foreground mb-4 max-w-md">
                      This product doesn't have any variants yet. Add variants to track different options like sizes or colors.
                    </p>
                    <Button onClick={() => {
                      setSelectedVariant(null);
                      setIsVariantDialogOpen(true);
                    }}>
                      <Plus className="h-4 w-4 mr-2" /> Add Variant
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Add/Edit Variant Dialog */}
          <Dialog open={isVariantDialogOpen} onOpenChange={setIsVariantDialogOpen}>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle>{selectedVariant ? 'Edit Variant' : 'Add New Variant'}</DialogTitle>
                <DialogDescription>
                  {selectedVariant
                    ? 'Update the details for this variant.'
                    : 'Enter the details for the new variant.'}
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto pr-2">
                <form onSubmit={selectedVariant ? handleEditVariant : handleAddVariant} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sku_name">SKU Name</Label>
                  <Input
                    id="sku_name"
                    name="sku_name"
                    placeholder="e.g. Black-Large"
                    defaultValue={selectedVariant?.sku_name || ''}
                    className="w-full"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku_no">SKU Number</Label>
                  <Input
                    id="sku_no"
                    name="sku_no"
                    placeholder="e.g. BL001"
                    defaultValue={selectedVariant?.sku_no || ''}
                    className="w-full"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    defaultValue={selectedVariant?.price || ''}
                    className="w-full"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">How many quantity in stock you want to add or minus?</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    placeholder="0"
                    defaultValue={selectedVariant?.quantity || ''}
                    className="w-full"
                  />
                </div>
                <div className="space-y-3">
                  <Label>Category Management</Label>
                  
                  {/* Current Categories Display */}
                  <div className="p-3 border rounded-md bg-muted/20">
                    <div className="flex items-center justify-between">
                      <div className="w-full">
                        <p className="text-sm font-medium">Current Categories:</p>
                        {selectedCategoryIds.length > 0 ? (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedCategoryIds.map(categoryId => {
                              const category = categoriesResponse?.data?.categories?.find((cat: Category) => cat.id === categoryId);
                              return category ? (
                                <div key={categoryId} className="flex items-center gap-1">
                                  <Badge variant="secondary" className="capitalize">
                                    {category.name}
                                  </Badge>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 w-5 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => setSelectedCategoryIds(prev => prev.filter(id => id !== categoryId))}
                                  >
                                    <Trash className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : null;
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-1">No categories assigned</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Available Categories List */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Available Categories:</p>
                    <div className="border rounded-md p-3">
                      {categoriesResponse?.data?.categories && categoriesResponse.data.categories.length > 0 ? (
                        <div className="grid grid-cols-5 gap-2">
                          {categoriesResponse.data.categories.map((category: Category) => {
                            const isSelected = selectedCategoryIds.includes(category.id);
                            return (
                              <div 
                                key={category.id} 
                                className={`flex flex-col p-2 rounded-md border transition-colors cursor-pointer ${
                                  isSelected 
                                    ? 'bg-primary/10 border-primary/30 shadow-sm' 
                                    : 'bg-background hover:bg-muted/50 border-border'
                                }`}
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedCategoryIds(prev => prev.filter(id => id !== category.id));
                                  } else {
                                    setSelectedCategoryIds(prev => [...prev, category.id]);
                                  }
                                }}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium truncate">{category.name}</span>
                                  {isSelected ? (
                                    <Check className="h-3 w-3 text-primary flex-shrink-0" />
                                  ) : (
                                    <Plus className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                  )}
                                </div>
                                {category.description && (
                                  <span className="text-[10px] text-muted-foreground line-clamp-2">{category.description}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground">No categories available</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    {selectedCategoryIds.length > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setSelectedCategoryIds([])}
                      >
                        <Trash className="h-3 w-3 mr-1" />
                        Remove All Categories
                      </Button>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={selectedCurrency} onValueChange={setSelectedCurrency} required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries?.countries?.map((country) => (
                        <SelectItem key={country.id} value={country.currency || ''}>
                          {country.currency} - {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="is_active">Status</Label>
                  <Select name="is_active" defaultValue={selectedVariant?.is_active !== undefined && selectedVariant.is_active !== null ? selectedVariant.is_active.toString() : "true"}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                  <DialogFooter className="mt-6 flex-shrink-0">
                    <Button type="button" variant="outline" onClick={() => setIsVariantDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {selectedVariant ? 'Update Variant' : 'Create Variant'}
                    </Button>
                  </DialogFooter>
                </form>
              </div>
            </DialogContent>
          </Dialog>

          {/* Create Order Dialog */}
          <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Order</DialogTitle>
                <DialogDescription>
                  Select a variant and user to create a new order.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateOrder} className="space-y-4">
                {orderError && (
                  <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-start">
                    <AlertCircle className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
                    <p>{orderError}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="variant_id">Select Variant</Label>
                  <Select
                    value={selectedVariantId}
                    onValueChange={setSelectedVariantId}
                    required
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a variant" />
                    </SelectTrigger>
                    <SelectContent>
                      {productDetails?.variants && productDetails.variants.map((variant: VariantEntity) => (
                        <SelectItem key={variant.id} value={variant.id || ''}>
                          {variant.sku_name} ({formatCurrency(variant.price, variant.country?.currency || variant.currency)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Select User</Label>
                  <Select name="email" required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users?.map((user: UsersEntity) => (
                        <SelectItem key={user.id} value={user.email || ''}>
                          {user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(Number(e.target.value))}
                    required
                  />
                  {selectedVariantId && (
                    <p className="text-xs text-muted-foreground">
                      Available: {getSelectedVariantQuantity()} units
                    </p>
                  )}
                </div>

                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsOrderDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreatingOrder}>
                    {isCreatingOrder ? "Loading..." : "Create Order"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Add Product Form Dialog */}
          <ProductForm
            isOpen={isProductFormOpen}
            onClose={() => setIsProductFormOpen(false)}
            product={productDetails}
          />
        </>
      ) : (
        <Card className="w-full">
          <CardContent className="py-10 flex flex-col items-center justify-center">
            <Info className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-1">No Product Found</h3>
            <p className="text-muted-foreground">The product you're looking for doesn't exist or has been removed.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ProductDetailsScreen