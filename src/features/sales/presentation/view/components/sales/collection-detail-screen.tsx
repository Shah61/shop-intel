"use client"

import { Button } from "@/components/ui/button"
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
  Package,
  Loader2,
  Image as ImageIcon,
  Plus,
  Trash2
} from "lucide-react"
import { useState, useEffect } from "react"
import { useCollectionByIdQuery, useUpdateCollectionMutation } from "../../../tanstack/physical/collection-tanstack"
import { VariantEntity } from "../../../../data/model/physical/variants-entity"
import AddVariantsToCollectionDialog from "../physical/add-variants-to-collection-dialog"
import toast from "react-hot-toast"

interface CollectionDetailScreenProps {
  collectionId: string;
  onBack: () => void;
}

interface CollectionWithVariants {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  handle: string;
  created_at: string;
  updated_at: string;
  variants: VariantEntity[];
}

const CollectionDetailScreen = ({ collectionId, onBack }: CollectionDetailScreenProps) => {
  const [isAddVariantsOpen, setIsAddVariantsOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [variantToDelete, setVariantToDelete] = useState<{ id: string; name: string } | null>(null)
  
  const { data: collectionResponse, isLoading, error } = useCollectionByIdQuery(collectionId)
  const updateCollectionMutation = useUpdateCollectionMutation()

  // Extract the actual collection data from the API response
  const collection: CollectionWithVariants | null = collectionResponse ? (collectionResponse as any).collection || collectionResponse : null

  // Handle mutation errors and reset states
  useEffect(() => {
    if (updateCollectionMutation.isError) {
      // Reset dialog states on error
      setIsDeleteDialogOpen(false)
      setVariantToDelete(null)
    }
  }, [updateCollectionMutation.isError])

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

  // Handle adding variants to collection
  const handleAddVariants = () => {
    setIsAddVariantsOpen(true)
  }

  const handleAddVariantsSubmit = (newVariantIds: string[]) => {
    // Combine existing variant IDs with new ones to append rather than replace
    const allVariantIds = [...existingVariantIds, ...newVariantIds]
    
    updateCollectionMutation.mutate({
      id: collectionId,
      params: {
        variant_ids: allVariantIds
      }
    }, {
      onSuccess: () => {
        setIsAddVariantsOpen(false)
        toast.success(`Successfully added ${newVariantIds.length} variant${newVariantIds.length !== 1 ? 's' : ''} to collection`)
        // Query invalidation is handled automatically by the tanstack hook
      }
    })
  }

  const handleRemoveVariant = (variantId: string, variantName?: string) => {
    setVariantToDelete({
      id: variantId,
      name: variantName || 'Unnamed Variant'
    })
    setIsDeleteDialogOpen(true)
  }

  const confirmRemoveVariant = () => {
    if (!variantToDelete) return

    // Filter out the variant to be removed
    const remainingVariantIds = existingVariantIds.filter(id => id !== variantToDelete.id)
    
    updateCollectionMutation.mutate({
      id: collectionId,
      params: {
        variant_ids: remainingVariantIds
      }
    }, {
      onSuccess: () => {
        toast.success(`Successfully removed ${variantToDelete.name} from collection`)
        setIsDeleteDialogOpen(false)
        setVariantToDelete(null)
        // Query invalidation is handled automatically by the tanstack hook
      }
    })
  }

  const cancelRemoveVariant = () => {
    setIsDeleteDialogOpen(false)
    setVariantToDelete(null)
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6 items-center justify-center w-full h-64">
        <p className="text-destructive">Error loading collection: {error.message}</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Collections
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
          Back to Collections
        </Button>
        <div className="flex justify-center items-center py-8 w-full">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading collection details...</span>
        </div>
      </div>
    )
  }

  if (!collection) {
    return (
      <div className="flex flex-col gap-6 items-center justify-center w-full h-64">
        <p className="text-muted-foreground">Collection not found</p>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Collections
        </Button>
      </div>
    )
  }

  const variants = collection.variants || []
  const existingVariantIds = variants.map(variant => variant.id!).filter(Boolean)

  return (
    <div className="flex flex-col gap-6 items-start justify-center w-full">
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center w-full">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Collections
          </Button>
        </div>
      </div>

      {/* Collection Information */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Collection Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="text-sm font-semibold">{collection.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <p className="text-sm">{collection.description && collection.description !== "-" ? collection.description : "No description"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="pt-1">
                <Badge variant={getStatusBadgeVariant(collection.is_active)}>
                  {collection.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Handle</label>
              <p className="text-sm font-mono">{collection.handle || "No handle"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created</label>
              <p className="text-sm">{collection.created_at ? formatDate(collection.created_at) : "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Updated</label>
              <p className="text-sm">{collection.updated_at ? formatDate(collection.updated_at) : "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Variants in Collection */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center w-full">
            <div>
              <CardTitle>Variants in Collection ({variants.length})</CardTitle>
              <CardDescription>
                Variants included in this collection
              </CardDescription>
            </div>
            <Button onClick={handleAddVariants} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Variants
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {variants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="flex flex-col items-center gap-3">
                <Package className="h-12 w-12 text-muted-foreground/50" />
                <div>
                  <p className="font-medium">No variants found in this collection</p>
                  <p className="text-sm">Add some variants to get started</p>
                </div>
                <Button onClick={handleAddVariants} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Variant
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU Name</TableHead>
                  <TableHead>SKU Number</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((variant: VariantEntity) => (
                  <TableRow key={variant.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{variant.product?.name || "Unknown Product"}</p>
                        <p className="text-sm text-muted-foreground">ID: {variant.product?.id || variant.product_id}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{variant.sku_name || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {variant.sku_no || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">{variant.price ? formatCurrency(variant.price) : "N/A"}</TableCell>
                    <TableCell>
                      <span className={(variant.quantity || 0) > 0 ? "text-green-600" : "text-red-600"}>
                        {variant.quantity || 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(variant.is_active || false)}>
                        {variant.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {variant.product?.images && variant.product.images.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <img 
                            src={variant.product.images[0]} 
                            alt={variant.product.name || "Product"}
                            className="w-10 h-10 object-cover rounded border"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <div className="hidden w-10 h-10 bg-gray-100 rounded border flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded border flex items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveVariant(variant.id || '', variant.sku_name || undefined)}
                        disabled={updateCollectionMutation.isPending || !variant.id}
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

      {/* Add Variants Dialog */}
      <AddVariantsToCollectionDialog
        isOpen={isAddVariantsOpen}
        onClose={() => setIsAddVariantsOpen(false)}
        onSubmit={handleAddVariantsSubmit}
        isLoading={updateCollectionMutation.isPending}
        existingVariantIds={existingVariantIds}
        collectionName={collection.name}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Remove Variant from Collection
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>&quot;{variantToDelete?.name}&quot;</strong> from this collection?
              <br /><br />
              This action cannot be undone. The variant will no longer be associated with this collection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelRemoveVariant} disabled={updateCollectionMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmRemoveVariant}
              disabled={updateCollectionMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {updateCollectionMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Variant
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default CollectionDetailScreen 