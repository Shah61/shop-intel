import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useState, useEffect } from "react"
import { Package, Loader2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useCollectionsQuery } from "../../../tanstack/physical/collection-tanstack"
import { CollectionEntity } from "../../../../data/model/physical/collection-entity"
import toast from "react-hot-toast"

interface AddCollectionsToDiscountDialogProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (collectionIds: string[]) => void
    isLoading?: boolean
    existingCollectionIds: string[]
    discountTitle: string
}

const AddCollectionsToDiscountDialog = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    isLoading = false, 
    existingCollectionIds,
    discountTitle 
}: AddCollectionsToDiscountDialogProps) => {
    const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([])
    const [searchQuery, setSearchQuery] = useState("")

    const { data: collections = [], isLoading: isLoadingCollections, error } = useCollectionsQuery()

    useEffect(() => {
        if (isOpen) {
            setSelectedCollectionIds([])
            setSearchQuery("")
        }
    }, [isOpen])

    const handleSubmit = () => {
        if (selectedCollectionIds.length === 0) {
            toast.error("Please select at least one collection")
            return
        }
        onSubmit(selectedCollectionIds)
    }

    const handleClose = () => {
        setSelectedCollectionIds([])
        setSearchQuery("")
        onClose()
    }

    const handleCollectionToggle = (collectionId: string) => {
        setSelectedCollectionIds(prev => 
            prev.includes(collectionId)
                ? prev.filter(id => id !== collectionId)
                : [...prev, collectionId]
        )
    }

    // Filter collections based on search and exclude already existing ones
    const availableCollections = collections.filter((collection: CollectionEntity) => {
        const matchesSearch = collection.name.toLowerCase().includes(searchQuery.toLowerCase())
        const notAlreadyAdded = !existingCollectionIds.includes(collection.id!)
        return matchesSearch && notAlreadyAdded && collection.id
    })

    if (error) {
        return (
            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Collections to Discount</DialogTitle>
                        <DialogDescription>
                            Error loading collections. Please try again.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 text-center text-destructive">
                        Failed to load collections
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleClose}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Add Collections to Discount
                    </DialogTitle>
                    <DialogDescription>
                        Add collections to &quot;{discountTitle}&quot; discount. Selected collections will be eligible for this discount.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search collections..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                            disabled={isLoadingCollections || isLoading}
                        />
                    </div>

                    {/* Selected Collections Summary */}
                    {selectedCollectionIds.length > 0 && (
                        <div className="border rounded-lg p-3 bg-muted/50">
                            <p className="text-sm font-medium mb-2">
                                Selected Collections ({selectedCollectionIds.length})
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {selectedCollectionIds.map(id => {
                                    const collection = collections.find((c: CollectionEntity) => c.id === id)
                                    return (
                                        <Badge key={id} variant="secondary" className="text-xs">
                                            {collection?.name || `Collection ${id}`}
                                        </Badge>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Collections List */}
                    <div className="flex-1 overflow-y-auto border rounded-lg">
                        {isLoadingCollections ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin" />
                                <span className="ml-2">Loading collections...</span>
                            </div>
                        ) : availableCollections.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                <Package className="h-12 w-12 mb-4 text-muted-foreground/50" />
                                <p className="font-medium">No collections available</p>
                                <p className="text-sm text-center">
                                    {searchQuery 
                                        ? "No collections match your search criteria" 
                                        : "All collections are already added to this discount"}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {availableCollections.map((collection: CollectionEntity) => (
                                    <div
                                        key={collection.id}
                                        className="flex items-center space-x-3 p-4 hover:bg-muted/50 cursor-pointer"
                                        onClick={() => handleCollectionToggle(collection.id!)}
                                    >
                                        <Checkbox
                                            checked={selectedCollectionIds.includes(collection.id!)}
                                            onCheckedChange={() => handleCollectionToggle(collection.id!)}
                                            disabled={isLoading}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{collection.name}</p>
                                            {collection.description && collection.description !== "-" && (
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {collection.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="text-xs">
                                                    ID: {collection.id}
                                                </Badge>
                                                {collection.is_active && (
                                                    <Badge variant="default" className="text-xs">
                                                        Active
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={isLoading || selectedCollectionIds.length === 0}
                        className="flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Adding...
                            </>
                        ) : (
                            <>
                                <Package className="h-4 w-4" />
                                Add {selectedCollectionIds.length} Collection{selectedCollectionIds.length !== 1 ? 's' : ''}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default AddCollectionsToDiscountDialog 