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
  Search,
  Download,
  Loader2,
  Trash2,
  Tag,
  Edit,
  Check,
  Users,
  Package
} from "lucide-react"
import * as XLSX from 'xlsx'
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import DefaultDeleteDialog from "@/src/core/shared/view/components/default-delete-dialog"
import AddCategoryDialog from "../physical/add-category-dialog"
import toast from "react-hot-toast"
import { 
  useGetCategoriesQuery, 
  useCreateCategoryMutation, 
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
  useGetVariantsForCategoryQuery,
  useGetUsersForCategoryQuery
} from "../../../tanstack/physical/categories-tanstack"
import { Category, CategoryParams, CategoryFilterParams } from "../../../../data/model/physical/categories-entity"

const CategoriesScreen = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false)
  const [isEditUsersDialogOpen, setIsEditUsersDialogOpen] = useState(false)
  const [isEditVariantsDialogOpen, setIsEditVariantsDialogOpen] = useState(false)
  const [isViewAllUsersDialogOpen, setIsViewAllUsersDialogOpen] = useState(false)
  const [isViewAllVariantsDialogOpen, setIsViewAllVariantsDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [selectedVariantIds, setSelectedVariantIds] = useState<string[]>([])
  const [editFormData, setEditFormData] = useState<{name: string, description: string}>({
    name: "",
    description: ""
  })

  // API calls
  const { data: categoriesData, isLoading: isLoadingCategories, error: categoriesError } = useGetCategoriesQuery()
  const createCategoryMutation = useCreateCategoryMutation()
  const deleteCategoryMutation = useDeleteCategoryMutation()
  const updateCategoryMutation = useUpdateCategoryMutation()
  
  // For edit dialogs
  const { data: variants = [], isLoading: isLoadingVariants } = useGetVariantsForCategoryQuery()
  const { data: users = [], isLoading: isLoadingUsers } = useGetUsersForCategoryQuery()

  const categories = categoriesData?.data?.categories || []

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Category handlers
  const handleAddCategory = () => {
    setIsAddCategoryOpen(true)
  }

  const handleCreateCategory = async (data: CategoryParams) => {
    createCategoryMutation.mutate(data, {
      onSuccess: () => {
        setIsAddCategoryOpen(false)
      }
    })
  }

  const handleDeleteCategory = (id: string) => {
    setItemToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteCategoryMutation.mutate(itemToDelete, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false)
          setItemToDelete(null)
        }
      })
    }
  }

  // Edit category handlers
  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category)
    setEditFormData({
      name: category.name,
      description: category.description || ""
    })
    setIsEditCategoryOpen(true)
  }

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCategory) return

    const updateData = {
      name: editFormData.name,
      description: editFormData.description
    }

    updateCategoryMutation.mutate({
      id: selectedCategory.id,
      params: updateData
    }, {
      onSuccess: () => {
        setIsEditCategoryOpen(false)
        setSelectedCategory(null)
        setEditFormData({ name: "", description: "" })
      }
    })
  }

  // Edit users handlers
  const handleEditUsers = (category: Category) => {
    setSelectedCategory(category)
    setSelectedUserIds(category.users.map(user => user.id))
    setIsEditUsersDialogOpen(true)
  }

  const handleUpdateUsers = () => {
    if (!selectedCategory) return

    const updateData = {
      name: selectedCategory.name,
      description: selectedCategory.description || "",
      user_ids: selectedUserIds
    }

    updateCategoryMutation.mutate({
      id: selectedCategory.id,
      params: updateData
    }, {
      onSuccess: () => {
        setIsEditUsersDialogOpen(false)
        setSelectedCategory(null)
        setSelectedUserIds([])
      }
    })
  }

  // Edit variants handlers
  const handleEditVariants = (category: Category) => {
    setSelectedCategory(category)
    setSelectedVariantIds(category.variants.map(variant => variant.id))
    setIsEditVariantsDialogOpen(true)
  }

  const handleUpdateVariants = () => {
    if (!selectedCategory) return

    const updateData = {
      name: selectedCategory.name,
      description: selectedCategory.description || "",
      variant_ids: selectedVariantIds
    }

    updateCategoryMutation.mutate({
      id: selectedCategory.id,
      params: updateData
    }, {
      onSuccess: () => {
        setIsEditVariantsDialogOpen(false)
        setSelectedCategory(null)
        setSelectedVariantIds([])
      }
    })
  }

  // User selection handlers
  const handleUserChange = (userId: string, checked: boolean) => {
    setSelectedUserIds(prev => 
      checked 
        ? [...prev, userId]
        : prev.filter(id => id !== userId)
    )
  }

  // Variant selection handlers
  const handleVariantChange = (variantId: string, checked: boolean) => {
    setSelectedVariantIds(prev => 
      checked 
        ? [...prev, variantId]
        : prev.filter(id => id !== variantId)
    )
  }

  // View all handlers
  const handleViewAllUsers = (category: Category) => {
    setSelectedCategory(category)
    setIsViewAllUsersDialogOpen(true)
  }

  const handleViewAllVariants = (category: Category) => {
    setSelectedCategory(category)
    setIsViewAllVariantsDialogOpen(true)
  }

  // Filter categories based on search and status
  const filteredCategories = categories.filter((category: Category) => {
    const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && category.is_active) ||
                         (statusFilter === "inactive" && !category.is_active)
    return matchesSearch && matchesStatus
  })

  const getStatusBadgeVariant = (isActive: boolean) => {
    return isActive ? "default" : "secondary"
  }

  const exportToExcel = () => {
    // Format data for Excel export
    const formattedData = filteredCategories.map((category: Category) => {
      // Get user emails and roles
      const usersList = category.users?.map((user: any) => `${user.email} (${user.role})`).join(', ') || 'No users assigned'
      
      // Get variant details
      const variantsList = category.variants?.map((variant: any) => `${variant.sku_name} - $${variant.price} (${variant.product?.name || 'Unknown Product'})`).join(', ') || 'No variants assigned'
      
      return {
        'Category ID': category.id || 'N/A',
        'Name': category.name || 'N/A',
        'Description': category.description || 'No description',
        'Status': category.is_active ? 'Active' : 'Inactive',
        'Launch Date': category.launch_date ? formatDate(category.launch_date) : 'N/A',
        'End Date': category.end_date ? formatDate(category.end_date) : 'No end date',
        'Total Users': category.users?.length || 0,
        'Assigned Users': usersList,
        'Total Variants': category.variants?.length || 0,
        'Assigned Variants': variantsList,
        'Country ID': category.country_id || 'N/A',
        'Created Date': category.created_at ? formatDate(category.created_at) : 'N/A',
        'Updated Date': category.updated_at ? formatDate(category.updated_at) : 'N/A'
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(formattedData)
    
    // Set column widths
    const wscols = [
      { wch: 25 }, // Category ID
      { wch: 20 }, // Name
      { wch: 40 }, // Description
      { wch: 10 }, // Status
      { wch: 15 }, // Launch Date
      { wch: 15 }, // End Date
      { wch: 12 }, // Total Users
      { wch: 60 }, // Assigned Users
      { wch: 15 }, // Total Variants
      { wch: 80 }, // Assigned Variants
      { wch: 15 }, // Country ID
      { wch: 15 }, // Created Date
      { wch: 15 }  // Updated Date
    ]
    worksheet['!cols'] = wscols

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Categories")
    
    // Generate filename with current date
    const now = new Date()
    const filename = `categories_export_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.xlsx`
    
    XLSX.writeFile(workbook, filename)
    toast.success(`Exported ${formattedData.length} categories to Excel`)
  }

  if (categoriesError) {
    return (
      <div className="flex flex-col gap-6 items-center justify-center w-full h-64">
        <p className="text-destructive">Error loading categories: {categoriesError.message}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 items-start justify-center w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center w-full">
        <div>
          <h2 className="text-2xl font-bold">Category Management</h2>
          <p className="text-muted-foreground">Manage your product categories</p>
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
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleAddCategory}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Categories Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Categories ({filteredCategories.length})
          </CardTitle>
          <CardDescription>
            Manage your product categories with associated variants and users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingCategories ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading categories...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Variants</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Launch Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category: Category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{category.description || "No description"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col gap-1">
                          {category.users && category.users.length > 0 ? (
                            category.users.slice(0, 2).map((user) => (
                              <div key={user.id} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded border">
                                {user.email} ({user.role})
                              </div>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-xs">No users</span>
                          )}
                          {category.users && category.users.length > 2 && (
                            <button 
                              onClick={() => handleViewAllUsers(category)}
                              className="text-xs text-primary hover:text-primary/80 underline cursor-pointer text-left"
                            >
                              +{category.users.length - 2} more
                            </button>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUsers(category)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col gap-1">
                          {category.variants && category.variants.length > 0 ? (
                            category.variants.slice(0, 2).map((variant) => (
                              <div key={variant.id} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded border">
                                {variant.sku_name}
                              </div>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-xs">No variants</span>
                          )}
                          {category.variants && category.variants.length > 2 && (
                            <button 
                              onClick={() => handleViewAllVariants(category)}
                              className="text-xs text-primary hover:text-primary/80 underline cursor-pointer text-left"
                            >
                              +{category.variants.length - 2} more
                            </button>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditVariants(category)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(category.is_active)}>
                        {category.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(category.launch_date)}</TableCell>
                    <TableCell>{category.end_date ? formatDate(category.end_date) : "No end date"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                          disabled={updateCategoryMutation.isPending}
                          className="flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
                          disabled={deleteCategoryMutation.isPending}
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
          {!isLoadingCategories && filteredCategories.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No categories found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Users Dialog */}
      <Dialog open={isEditUsersDialogOpen} onOpenChange={setIsEditUsersDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Edit Users for "{selectedCategory?.name}"</DialogTitle>
            <DialogDescription>
              Select which users should be assigned to this category.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-4">
              {/* Current Users Display */}
              <div className="p-3 border rounded-md bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="w-full">
                    <p className="text-sm font-medium">Current Users:</p>
                    {selectedUserIds.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedUserIds.map(userId => {
                          const user = users.find((u: any) => u.id === userId);
                          return user ? (
                            <div key={userId} className="flex items-center gap-1">
                              <Badge variant="secondary" className="capitalize">
                                {user.email} ({user.role})
                              </Badge>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setSelectedUserIds(prev => prev.filter(id => id !== userId))}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : null;
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">No users assigned</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Available Users List */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Available Users:</p>
                <div className="border rounded-md p-3">
                  {isLoadingUsers ? (
                    <p className="text-sm text-muted-foreground">Loading users...</p>
                  ) : users.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {users.map((user: any) => {
                        const isSelected = selectedUserIds.includes(user.id);
                        return (
                          <div 
                            key={user.id} 
                            className={`flex items-center justify-between p-2 rounded-md border transition-colors cursor-pointer ${
                              isSelected 
                                ? 'bg-primary/10 border-primary/30 shadow-sm' 
                                : 'bg-background hover:bg-muted/50 border-border'
                            }`}
                            onClick={() => handleUserChange(user.id, !isSelected)}
                          >
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{user.email}</span>
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

              {/* Quick Actions */}
              <div className="flex gap-2">
                {selectedUserIds.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setSelectedUserIds([])}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Remove All Users
                  </Button>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6 flex-shrink-0">
            <Button type="button" variant="outline" onClick={() => setIsEditUsersDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateUsers}
              disabled={updateCategoryMutation.isPending}
            >
              {updateCategoryMutation.isPending ? "Updating..." : "Update Users"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Variants Dialog */}
      <Dialog open={isEditVariantsDialogOpen} onOpenChange={setIsEditVariantsDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Edit Variants for "{selectedCategory?.name}"</DialogTitle>
            <DialogDescription>
              Select which variants should be assigned to this category.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-4">
              {/* Current Variants Display */}
              <div className="p-3 border rounded-md bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="w-full">
                    <p className="text-sm font-medium">Current Variants:</p>
                    {selectedVariantIds.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedVariantIds.map(variantId => {
                          const variant = variants.find((v: any) => v.id === variantId);
                          return variant ? (
                            <div key={variantId} className="flex items-center gap-1">
                              <Badge variant="secondary" className="capitalize">
                                {variant.sku_name} - ${variant.price}
                              </Badge>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setSelectedVariantIds(prev => prev.filter(id => id !== variantId))}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : null;
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">No variants assigned</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Available Variants List */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Available Variants:</p>
                <div className="border rounded-md p-3">
                  {isLoadingVariants ? (
                    <p className="text-sm text-muted-foreground">Loading variants...</p>
                  ) : variants.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {variants.map((variant: any) => {
                        const isSelected = selectedVariantIds.includes(variant.id);
                        return (
                          <div 
                            key={variant.id} 
                            className={`flex flex-col p-2 rounded-md border transition-colors cursor-pointer ${
                              isSelected 
                                ? 'bg-primary/10 border-primary/30 shadow-sm' 
                                : 'bg-background hover:bg-muted/50 border-border'
                            }`}
                            onClick={() => handleVariantChange(variant.id, !isSelected)}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium truncate">{variant.sku_name}</span>
                              {isSelected ? (
                                <Check className="h-3 w-3 text-primary flex-shrink-0" />
                              ) : (
                                <Plus className="h-3 w-3 text-muted-foreground flex-shrink-0" />
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

              {/* Quick Actions */}
              <div className="flex gap-2">
                {selectedVariantIds.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setSelectedVariantIds([])}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Remove All Variants
                  </Button>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6 flex-shrink-0">
            <Button type="button" variant="outline" onClick={() => setIsEditVariantsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateVariants}
              disabled={updateCategoryMutation.isPending}
            >
              {updateCategoryMutation.isPending ? "Updating..." : "Update Variants"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View All Users Dialog */}
      <Dialog open={isViewAllUsersDialogOpen} onOpenChange={setIsViewAllUsersDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              All Users for "{selectedCategory?.name}"
            </DialogTitle>
            <DialogDescription>
              Complete list of users assigned to this category ({selectedCategory?.users?.length || 0} total)
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-3">
              {selectedCategory?.users && selectedCategory.users.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {selectedCategory.users.map((user, index) => (
                    <div 
                      key={user.id} 
                      className="flex items-center justify-between p-3 border rounded-md bg-background hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{user.email}</span>
                          <span className="text-xs text-muted-foreground">{user.name}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {user.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">No users assigned to this category</p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="mt-6 flex-shrink-0">
            <Button type="button" onClick={() => setIsViewAllUsersDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View All Variants Dialog */}
      <Dialog open={isViewAllVariantsDialogOpen} onOpenChange={setIsViewAllVariantsDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              All Variants for "{selectedCategory?.name}"
            </DialogTitle>
            <DialogDescription>
              Complete list of variants assigned to this category ({selectedCategory?.variants?.length || 0} total)
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-3">
              {selectedCategory?.variants && selectedCategory.variants.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedCategory.variants.map((variant, index) => (
                    <div 
                      key={variant.id} 
                      className="flex items-center justify-between p-4 border rounded-md bg-background hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-full text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium truncate">{variant.sku_name}</span>
                          <span className="text-xs text-muted-foreground">{variant.product?.name}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <Badge variant="outline" className="mb-1">
                          ${variant.price}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(variant.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">No variants assigned to this category</p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="mt-6 flex-shrink-0">
            <Button type="button" onClick={() => setIsViewAllVariantsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Edit Category
            </DialogTitle>
            <DialogDescription>
              Update the category name and description.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateCategory} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Category Name *</Label>
              <Input
                id="edit-name"
                type="text"
                value={editFormData.name}
                onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Clothing"
                required
                disabled={updateCategoryMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={editFormData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe this category..."
                rows={3}
                required
                disabled={updateCategoryMutation.isPending}
              />
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditCategoryOpen(false)}
                disabled={updateCategoryMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateCategoryMutation.isPending}
              >
                {updateCategoryMutation.isPending ? "Updating..." : "Update Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <DefaultDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => !deleteCategoryMutation.isPending && setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
        itemName="Category"
      />

      {/* Add Category Dialog */}
      <AddCategoryDialog
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        onSubmit={handleCreateCategory}
        isLoading={createCategoryMutation.isPending}
      />
    </div>
  )
}

export default CategoriesScreen 