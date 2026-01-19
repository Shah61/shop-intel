import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { AlertCircle, Tag, Users, Package, Check, Plus, Trash2 } from "lucide-react"
import { CategoryParams } from "../../../../data/model/physical/categories-entity"
import { useGetVariantsForCategoryQuery, useGetUsersForCategoryQuery } from "../../../tanstack/physical/categories-tanstack"
import toast from "react-hot-toast"

interface AddCategoryDialogProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: CategoryParams) => void
    isLoading?: boolean
}

const AddCategoryDialog = ({ isOpen, onClose, onSubmit, isLoading = false }: AddCategoryDialogProps) => {
    const [formData, setFormData] = useState<CategoryParams>({
        name: "",
        description: "",
        variant_ids: [],
        user_ids: []
    })
    
    const [formError, setFormError] = useState("")

    // Fetch variants and users
    const { data: variants = [], isLoading: isLoadingVariants } = useGetVariantsForCategoryQuery()
    const { data: users = [], isLoading: isLoadingUsers } = useGetUsersForCategoryQuery()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError("")

        // Validation
        if (!formData.name.trim()) {
            toast.error("Please enter a category name")
            setFormError("Please enter a category name")
            return
        }

        if (!formData.description.trim()) {
            toast.error("Please enter a category description")
            setFormError("Please enter a category description")
            return
        }

        try {
            onSubmit(formData)
            resetForm()
        } catch (error: any) {
            toast.error("Failed to add category")
            setFormError(error.message || "Failed to add category")
        }
    }

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            variant_ids: [],
            user_ids: []
        })
        setFormError("")
    }

    const handleClose = () => {
        resetForm()
        onClose()
    }

    const handleVariantChange = (variantId: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            variant_ids: checked 
                ? [...(prev.variant_ids || []), variantId]
                : (prev.variant_ids || []).filter(id => id !== variantId)
        }))
    }

    const handleUserChange = (userId: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            user_ids: checked 
                ? [...(prev.user_ids || []), userId]
                : (prev.user_ids || []).filter(id => id !== userId)
        }))
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-6xl max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <Tag className="h-5 w-5" />
                        Add New Category
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        Create a new product category with associated variants and users
                    </DialogDescription>
                </DialogHeader>
                
                <div className="flex-1 overflow-y-auto pr-2">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {formError && (
                            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-start">
                                <AlertCircle className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
                                <p className="text-sm">{formError}</p>
                            </div>
                        )}

                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Category Name *</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="e.g. Clothing"
                                            required
                                            disabled={isLoading}
                                            className="w-full"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description *</Label>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="Describe this category..."
                                            rows={3}
                                            required
                                            disabled={isLoading}
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* User Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Users className="h-4 w-4" />
                                    Select Users ({formData.user_ids?.length || 0} selected)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Current Selected Users */}
                                {formData.user_ids && formData.user_ids.length > 0 && (
                                    <div className="p-3 border rounded-md bg-muted/20">
                                        <p className="text-sm font-medium mb-2">Selected Users:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.user_ids.map(userId => {
                                                const user = users.find((u: any) => u.id === userId);
                                                return user ? (
                                                    <div key={userId} className="flex items-center gap-1">
                                                        <Badge variant="secondary">
                                                            {user.email} ({user.role})
                                                        </Badge>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-5 w-5 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => handleUserChange(userId, false)}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Available Users */}
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Available Users:</p>
                                    <div className="border rounded-md p-3">
                                        {isLoadingUsers ? (
                                            <p className="text-sm text-muted-foreground text-center py-4">Loading users...</p>
                                        ) : users.length > 0 ? (
                                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                                                {users.map((user: any) => {
                                                    const isSelected = formData.user_ids?.includes(user.id) || false;
                                                    return (
                                                        <div 
                                                            key={user.id} 
                                                            className={`flex items-center justify-between p-3 rounded-md border transition-colors cursor-pointer ${
                                                                isSelected 
                                                                    ? 'bg-primary/10 border-primary/30 shadow-sm' 
                                                                    : 'bg-background hover:bg-muted/50 border-border'
                                                            }`}
                                                            onClick={() => handleUserChange(user.id, !isSelected)}
                                                        >
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="text-sm font-medium truncate">{user.email}</span>
                                                                <span className="text-xs text-muted-foreground">{user.role}</span>
                                                            </div>
                                                            {isSelected ? (
                                                                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                                                            ) : (
                                                                <Plus className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4">
                                                <p className="text-sm text-muted-foreground">No users available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Actions for Users */}
                                {formData.user_ids && formData.user_ids.length > 0 && (
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => setFormData(prev => ({ ...prev, user_ids: [] }))}
                                        >
                                            <Trash2 className="h-3 w-3 mr-1" />
                                            Remove All Users
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Variant Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Package className="h-4 w-4" />
                                    Select Variants ({formData.variant_ids?.length || 0} selected)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Current Selected Variants */}
                                {formData.variant_ids && formData.variant_ids.length > 0 && (
                                    <div className="p-3 border rounded-md bg-muted/20">
                                        <p className="text-sm font-medium mb-2">Selected Variants:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.variant_ids.map(variantId => {
                                                const variant = variants.find((v: any) => v.id === variantId);
                                                return variant ? (
                                                    <div key={variantId} className="flex items-center gap-1">
                                                        <Badge variant="secondary">
                                                            {variant.sku_name} - ${variant.price}
                                                        </Badge>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-5 w-5 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => handleVariantChange(variantId, false)}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Available Variants */}
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Available Variants:</p>
                                    <div className="border rounded-md p-3">
                                        {isLoadingVariants ? (
                                            <p className="text-sm text-muted-foreground text-center py-4">Loading variants...</p>
                                        ) : variants.length > 0 ? (
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                                {variants.map((variant: any) => {
                                                    const isSelected = formData.variant_ids?.includes(variant.id) || false;
                                                    return (
                                                        <div 
                                                            key={variant.id} 
                                                            className={`flex flex-col p-3 rounded-md border transition-colors cursor-pointer ${
                                                                isSelected 
                                                                    ? 'bg-primary/10 border-primary/30 shadow-sm' 
                                                                    : 'bg-background hover:bg-muted/50 border-border'
                                                            }`}
                                                            onClick={() => handleVariantChange(variant.id, !isSelected)}
                                                        >
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-xs font-medium truncate flex-1">{variant.sku_name}</span>
                                                                {isSelected ? (
                                                                    <Check className="h-3 w-3 text-primary flex-shrink-0 ml-1" />
                                                                ) : (
                                                                    <Plus className="h-3 w-3 text-muted-foreground flex-shrink-0 ml-1" />
                                                                )}
                                                            </div>
                                                            <span className="text-[10px] text-muted-foreground">${variant.price}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4">
                                                <p className="text-sm text-muted-foreground">No variants available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Actions for Variants */}
                                {formData.variant_ids && formData.variant_ids.length > 0 && (
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => setFormData(prev => ({ ...prev, variant_ids: [] }))}
                                        >
                                            <Trash2 className="h-3 w-3 mr-1" />
                                            Remove All Variants
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

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
                                {isLoading ? "Creating..." : "Create Category"}
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default AddCategoryDialog
