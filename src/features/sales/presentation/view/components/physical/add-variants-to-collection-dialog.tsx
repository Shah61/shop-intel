import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState, useMemo } from "react"
import { AlertCircle, Search, Loader2, Package, Image as ImageIcon } from "lucide-react"
import toast from "react-hot-toast"
import { useVariantsQuery } from "../../../tanstack/physical/variants-tanstack"
import { VariantEntity } from "../../../../data/model/physical/variants-entity"

interface AddVariantsToCollectionDialogProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (variantIds: string[]) => void
    isLoading?: boolean
    existingVariantIds?: string[]
    collectionName?: string
}

const AddVariantsToCollectionDialog = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    isLoading = false,
    existingVariantIds = [],
    collectionName = "Collection"
}: AddVariantsToCollectionDialogProps) => {
    const [selectedVariantIds, setSelectedVariantIds] = useState<string[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    
    // Fetch all variants
    const { data: variants = [], isLoading: isLoadingVariants, error: variantsError } = useVariantsQuery()
    
    // Format currency helper
    const formatCurrency = (value: number) => {
        return `RM${value.toFixed(2)}`
    }

    // Filter variants based on search and exclude already existing ones
    const filteredVariants = useMemo(() => {
        return variants.filter((variant: VariantEntity) => {
            // Exclude variants already in the collection
            if (existingVariantIds.includes(variant.id!)) {
                return false
            }
            
            // Filter by search query
            if (searchQuery) {
                const searchLower = searchQuery.toLowerCase()
                return (
                    variant.sku_name?.toLowerCase().includes(searchLower) ||
                    variant.sku_no?.toLowerCase().includes(searchLower) ||
                    variant.product?.name?.toLowerCase().includes(searchLower)
                )
            }
            
            return true
        })
    }, [variants, existingVariantIds, searchQuery])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (selectedVariantIds.length === 0) {
            toast.error("Please select at least one variant")
            return
        }

        try {
            onSubmit(selectedVariantIds)
            resetForm()
        } catch (error: any) {
            toast.error("Failed to add variants")
        }
    }

    const resetForm = () => {
        setSelectedVariantIds([])
        setSearchQuery("")
    }

    const handleClose = () => {
        resetForm()
        onClose()
    }

    const handleVariantToggle = (variantId: string, checked: boolean) => {
        if (checked) {
            setSelectedVariantIds(prev => [...prev, variantId])
        } else {
            setSelectedVariantIds(prev => prev.filter(id => id !== variantId))
        }
    }

    const handleSelectAll = () => {
        if (selectedVariantIds.length === filteredVariants.length) {
            // Deselect all
            setSelectedVariantIds([])
        } else {
            // Select all visible variants
            const allVariantIds = filteredVariants.map(variant => variant.id!).filter(Boolean)
            setSelectedVariantIds(allVariantIds)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Add Variants to {collectionName}
                    </DialogTitle>
                    <DialogDescription>
                        Select variants to add to this collection
                    </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    {/* Search */}
                    <div className="space-y-4 pb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search variants by SKU name, SKU number, or product name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                                disabled={isLoading}
                            />
                        </div>
                        
                        {/* Selection Summary */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                    {selectedVariantIds.length} variant(s) selected
                                </span>
                                {selectedVariantIds.length > 0 && (
                                    <Badge variant="secondary">
                                        {selectedVariantIds.length}
                                    </Badge>
                                )}
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleSelectAll}
                                disabled={isLoading || filteredVariants.length === 0}
                            >
                                {selectedVariantIds.length === filteredVariants.length ? "Deselect All" : "Select All"}
                            </Button>
                        </div>
                    </div>

                    {/* Variants Table */}
                    <div className="flex-1 overflow-auto border rounded-md">
                        {isLoadingVariants ? (
                            <div className="flex justify-center items-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin" />
                                <span className="ml-2">Loading variants...</span>
                            </div>
                        ) : variantsError ? (
                            <div className="flex flex-col gap-4 items-center justify-center py-8">
                                <AlertCircle className="h-8 w-8 text-destructive" />
                                <p className="text-destructive">Error loading variants</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">Select</TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead>SKU Name</TableHead>
                                        <TableHead>SKU Number</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Image</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredVariants.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                                {searchQuery ? "No variants found matching your search" : "No available variants to add"}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredVariants.map((variant: VariantEntity) => (
                                            <TableRow key={variant.id}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedVariantIds.includes(variant.id!)}
                                                        onCheckedChange={(checked) => 
                                                            handleVariantToggle(variant.id!, !!checked)
                                                        }
                                                        disabled={isLoading}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium text-sm">
                                                            {variant.product?.name || "Unknown Product"}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            ID: {variant.product?.id || variant.product_id}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-medium text-sm">
                                                    {variant.sku_name || "N/A"}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="font-mono text-xs">
                                                        {variant.sku_no || "N/A"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-semibold text-sm">
                                                    {variant.price ? formatCurrency(variant.price) : "N/A"}
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`text-sm ${(variant.quantity || 0) > 0 ? "text-green-600" : "text-red-600"}`}>
                                                        {variant.quantity || 0}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge 
                                                        variant={variant.is_active ? "default" : "secondary"}
                                                        className="text-xs"
                                                    >
                                                        {variant.is_active ? "Active" : "Inactive"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {variant.product?.images && variant.product.images.length > 0 ? (
                                                        <div className="flex items-center gap-2">
                                                            <img 
                                                                src={variant.product.images[0]} 
                                                                alt={variant.product.name || "Product"}
                                                                className="w-8 h-8 object-cover rounded border"
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.style.display = 'none';
                                                                    target.nextElementSibling?.classList.remove('hidden');
                                                                }}
                                                            />
                                                            <div className="hidden w-8 h-8 bg-gray-100 rounded border flex items-center justify-center">
                                                                <ImageIcon className="h-3 w-3 text-gray-400" />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="w-8 h-8 bg-gray-100 rounded border flex items-center justify-center">
                                                            <ImageIcon className="h-3 w-3 text-gray-400" />
                                                        </div>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </div>

                    <DialogFooter className="gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || selectedVariantIds.length === 0}
                            className="flex items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                `Add ${selectedVariantIds.length} Variant${selectedVariantIds.length !== 1 ? 's' : ''}`
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default AddVariantsToCollectionDialog 