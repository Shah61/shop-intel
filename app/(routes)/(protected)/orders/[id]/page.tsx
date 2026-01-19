"use client"

import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { use } from "react"
import {
  ShoppingCart,
  Package,
  User,
  ArrowLeft,
  Calendar,
  Tag,
  Clock,
  DollarSign,
  CheckCircle,
  BarChart4,
  Clipboard,
  AlertCircle,
  Printer
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// Import mock API service function
import { getMockOrderById } from "@/src/features/sales/data/services/mock-physical-sales-api.service"

// Define the props interface
interface OrderDetailsScreenProps {
  params: Promise<{
    id: string;
  }>;
}

const OrderDetailsScreen = ({ params }: OrderDetailsScreenProps) => {
  const router = useRouter()
  const { id: orderId } = use(params)

  // Fetch order details
  const {
    data: orderDetails,
    isLoading,
    error
  } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const data = await getMockOrderById(orderId);
      console.log('Order Details:', data);
      return data;
    },
    enabled: !!orderId,
  })

  const handleGoBack = () => {
    router.back()
  }

  // Simple print handler
  const handlePrint = () => {
    window.print()
  }

  // Format date function
  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Format currency function
  const formatCurrency = (amount: number | undefined | null): string => {
    if (amount === undefined || amount === null) return "N/A";
    return `RM${amount.toFixed(2)}`;
  }

  // Get a shortened version of the ID for display
  const getShortenedId = (id: string | null | undefined): string => {
    if (!id) return "N/A";
    return id.substring(0, 8) + "...";
  }

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* Header with Breadcrumb */}
      <div className="flex flex-col gap-5 mt-4 print:hidden">
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
          <button onClick={handleGoBack} className="hover:text-primary flex items-center">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Back to Orders
          </button>
          <span>/</span>
          <span>Order Details</span>
          <span>/</span>
          <span className="font-medium text-foreground truncate max-w-[200px]">
            {orderDetails?.id ? getShortenedId(orderDetails.id) : 'Loading...'}
          </span>
        </nav>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Order Details</h1>
            <p className="text-muted-foreground">View complete information about this order</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Order
            </Button>
          </div>
        </div>
      </div>

      {/* Add print-specific styles to the content container */}
      <div className="print:!mt-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64 bg-muted/20 rounded-md animate-pulse">
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2 text-destructive mb-2">
              <AlertCircle className="h-5 w-5" />
              <h3 className="font-semibold">Error loading order details</h3>
            </div>
            <p className="text-destructive/80">{(error as Error).message}</p>
          </div>
        ) : orderDetails ? (
          <>
            {/* Order Summary Card - add print margin adjustment */}
            <Card className="shadow-sm print:shadow-none print:mt-0">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Clipboard className="h-5 w-5" />
                    Order Summary
                  </CardTitle>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" /> Confirmed
                  </Badge>
                </div>
                <CardDescription>
                  Order #{getShortenedId(orderDetails.id)} • Created {formatDate(orderDetails.created_at)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-2">
                  {/* Order ID */}
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Tag className="h-3.5 w-3.5" /> Order ID
                    </p>
                    <p className="font-mono text-sm break-all" title={orderDetails.id || ''}>
                      {orderDetails.id}
                    </p>
                  </div>

                  {/* Created Date */}
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> Created
                    </p>
                    <p>{formatDate(orderDetails.created_at)}</p>
                  </div>

                  {/* Updated Date */}
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> Updated
                    </p>
                    <p>{formatDate(orderDetails.updated_at)}</p>
                  </div>

                  {/* Price from Variant */}
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5" /> Price
                    </p>
                    <p className="text-lg font-medium">{formatCurrency(orderDetails.variants?.price)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
              {/* Left Column - Product Information */}
              <Card className="lg:col-span-2 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Product Information
                  </CardTitle>
                  <CardDescription>Details about the ordered product and variant</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Product Image and Name */}
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="h-52 w-full md:w-52 rounded-md overflow-hidden bg-muted/30 border flex-shrink-0">
                      {orderDetails.products?.images && orderDetails.products.images.length > 0 ? (
                        <img
                          src={orderDetails.products.images[0]}
                          alt={orderDetails.products?.name || ''}
                          className="w-full h-full object-contain p-2"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-14 w-14 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-medium text-lg mb-2">Product Details</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Product Name</span>
                          <span className="font-medium text-right max-w-xs break-words">{orderDetails.products?.name || 'N/A'}</span>
                        </div>
                        <Separator />

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Product ID</span>
                          <span className="font-mono text-sm text-right">{getShortenedId(orderDetails.products?.id)}</span>
                        </div>
                        <Separator />

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Added On</span>
                          <span className="text-right">{formatDate(orderDetails.products?.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Variant Information */}
                  <div className="p-4 border rounded-lg bg-muted/10">
                    <h3 className="font-medium text-base mb-3 flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Variant Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="p-3 bg-background rounded-md border">
                        <p className="text-xs text-muted-foreground mb-1">SKU Name</p>
                        <p className="font-medium">{orderDetails.variants?.sku_name || 'N/A'}</p>
                      </div>

                      <div className="p-3 bg-background rounded-md border">
                        <p className="text-xs text-muted-foreground mb-1">Unit Price</p>
                        <p className="font-medium">{formatCurrency(orderDetails.variants?.price)}</p>
                      </div>

                      <div className="p-3 bg-background rounded-md border">
                        <p className="text-xs text-muted-foreground mb-1">Order Quantity</p>
                        <p className="font-medium">{orderDetails.quantity_orders || 0} units</p>
                      </div>

                      <div className="p-3 bg-background rounded-md border">
                        <p className="text-xs text-muted-foreground mb-1">Available Stock</p>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{orderDetails.variants?.quantity || 0}</p>
                          <Badge variant={orderDetails.variants?.quantity ? (orderDetails.variants.quantity > 10 ? "outline" : "secondary") : "destructive"} className="text-xs">
                            {orderDetails.variants?.quantity && orderDetails.variants.quantity > 10
                              ? "In Stock"
                              : orderDetails.variants?.quantity && orderDetails.variants.quantity > 0
                                ? "Low Stock"
                                : "Out of Stock"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total Amount Section - New Addition */}
                  <div className="p-4 border rounded-lg bg-primary/5">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-base">Total Amount</h3>
                        <p className="text-sm text-muted-foreground">
                          {orderDetails.quantity_orders || 0} units × {formatCurrency(orderDetails.variants?.price)}
                        </p>
                      </div>
                      <div className="text-xl font-semibold">
                        {formatCurrency((orderDetails.quantity_orders || 0) * (orderDetails.variants?.price || 0))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Right Column - User Information */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    User Information
                  </CardTitle>
                  <CardDescription>Details about the user who placed this order</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* User Header with Avatar */}
                  <div className="flex items-center gap-4 mb-2">
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg font-medium">
                      {orderDetails.users?.name ? orderDetails.users.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h4 className="font-medium text-lg">{orderDetails.users?.name || 'Unknown User'}</h4>
                      <p className="text-muted-foreground">{orderDetails.users?.email || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Role</span>
                      <Badge variant="outline" className="capitalize">
                        {orderDetails.users?.role?.toLowerCase() || 'N/A'}
                      </Badge>
                    </div>
                    <Separator />

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">User ID</span>
                      <span className="text-sm font-mono">{getShortenedId(orderDetails.users?.id)}</span>
                    </div>
                    <Separator />

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Member Since</span>
                      <span className="text-sm">{formatDate(orderDetails.users?.created_at)}</span>
                    </div>
                  </div>


                </CardContent>
                <CardFooter className="border-t pt-4 text-sm text-muted-foreground">
                  Order #{getShortenedId(orderDetails.id)}
                </CardFooter>
              </Card>
            </div>
          </>
        ) : (
          <Card className="shadow-sm">
            <CardContent className="py-10 flex flex-col items-center justify-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-1">No Order Details Available</h3>
              <p className="text-muted-foreground">The requested order information could not be found.</p>
              <Button variant="outline" className="mt-4" onClick={handleGoBack}>
                Back to Orders
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default OrderDetailsScreen