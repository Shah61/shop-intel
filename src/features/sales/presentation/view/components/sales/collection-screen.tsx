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
  Eye, 
  Search,
  Download,
  Loader2,
  Trash2,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import * as XLSX from 'xlsx'
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import DefaultDeleteDialog from "@/src/core/shared/view/components/default-delete-dialog"
import AddCollectionDialog from "../physical/add-collection-dialog"
import CollectionDetailScreen from "./collection-detail-screen"
import toast from "react-hot-toast"
import { 
  useCollectionsQuery, 
  useCreateCollectionMutation, 
  useDeleteCollectionMutation 
} from "../../../tanstack/physical/collection-tanstack"
import { CollectionEntity } from "../../../../data/model/physical/collection-entity"

const CollectionScreen = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isAddCollectionOpen, setIsAddCollectionOpen] = useState(false)
  const [viewingCollectionId, setViewingCollectionId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageLimit] = useState(20)

  // API calls
  const { data: collections = [], isLoading: isLoadingCollections, error: collectionsError } = useCollectionsQuery()
  const createCollectionMutation = useCreateCollectionMutation()
  const deleteCollectionMutation = useDeleteCollectionMutation()

  // Mock metadata for pagination (will be replaced with real API data)
  const metadata = {
    total: collections.length,
    page: currentPage,
    limit: pageLimit,
    total_pages: Math.ceil(collections.length / pageLimit),
    has_next: currentPage < Math.ceil(collections.length / pageLimit),
    has_previous: currentPage > 1
  }

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Collection handlers
  const handleAddCollection = () => {
    setIsAddCollectionOpen(true)
  }

  const handleCreateCollection = async (data: { name: string; description?: string }) => {
    createCollectionMutation.mutate(data, {
      onSuccess: () => {
        setIsAddCollectionOpen(false)
        setCurrentPage(1) // Reset to first page to see the new collection
      }
    })
  }

  const handleViewCollection = (id: string) => {
    setViewingCollectionId(id)
  }

  const handleBackToCollections = () => {
    setViewingCollectionId(null)
  }

  const handleDeleteCollection = (id: string) => {
    setItemToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteCollectionMutation.mutate(itemToDelete, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false)
          setItemToDelete(null)
          // If we're on the last page and it becomes empty, go to previous page
          if (paginatedCollections.length === 1 && currentPage > 1) {
            setCurrentPage(prev => prev - 1)
          }
        }
      })
    }
  }

  // If viewing a specific collection, show the detail screen
  if (viewingCollectionId) {
    return (
      <CollectionDetailScreen 
        collectionId={viewingCollectionId}
        onBack={handleBackToCollections}
      />
    )
  }

  // Filter collections based on search and status
  const filteredCollections = collections.filter((collection: CollectionEntity) => {
    const matchesSearch = collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (collection.description && collection.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && collection.is_active) ||
                         (statusFilter === "inactive" && !collection.is_active)
    return matchesSearch && matchesStatus
  })

  // Apply pagination to filtered results
  const startIndex = (currentPage - 1) * pageLimit
  const endIndex = startIndex + pageLimit
  const paginatedCollections = filteredCollections.slice(startIndex, endIndex)

  // Update metadata based on filtered results
  const updatedMetadata = {
    ...metadata,
    total: filteredCollections.length,
    total_pages: Math.ceil(filteredCollections.length / pageLimit),
    has_next: currentPage < Math.ceil(filteredCollections.length / pageLimit),
    has_previous: currentPage > 1
  }

  const getStatusBadgeVariant = (isActive: boolean) => {
    return isActive ? "default" : "secondary"
  }

  const exportToExcel = () => {
    // Format data for Excel export
    const formattedData = paginatedCollections.map(collection => ({
      'Collection ID': collection.id || 'N/A',
      'Name': collection.name || 'N/A',
      'Description': collection.description || 'No description',
      'Handle': collection.handle || 'No handle',
      'Status': collection.is_active ? 'Active' : 'Inactive',
      'Created Date': collection.created_at ? formatDate(collection.created_at) : 'N/A',
      'Updated Date': collection.updated_at ? formatDate(collection.updated_at) : 'N/A'
    }))

    const worksheet = XLSX.utils.json_to_sheet(formattedData)
    
    // Set column widths
    const wscols = [
      { wch: 25 }, // Collection ID
      { wch: 30 }, // Name
      { wch: 40 }, // Description
      { wch: 25 }, // Handle
      { wch: 10 }, // Status
      { wch: 15 }, // Created Date
      { wch: 15 }  // Updated Date
    ]
    worksheet['!cols'] = wscols

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Collections")
    
    // Generate filename with current date
    const now = new Date()
    const filename = `collections_export_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.xlsx`
    
    XLSX.writeFile(workbook, filename)
    toast.success(`Exported ${formattedData.length} collections to Excel`)
  }

  // Pagination handlers
  const handleNextPage = () => {
    if (updatedMetadata.has_next) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const handlePreviousPage = () => {
    if (updatedMetadata.has_previous) {
      setCurrentPage(prev => prev - 1)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (collectionsError) {
    return (
      <div className="flex flex-col gap-6 items-center justify-center w-full h-64">
        <p className="text-destructive">Error loading collections: {collectionsError.message}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 items-start justify-center w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center w-full">
        <div>
          <h2 className="text-2xl font-bold">Collection Management</h2>
          <p className="text-muted-foreground">Manage your product collections and categories</p>
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
            placeholder="Search collections..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1) // Reset to first page when searching
            }}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => {
          setStatusFilter(value)
          setCurrentPage(1) // Reset to first page when filtering
        }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleAddCollection}>
          <Plus className="h-4 w-4 mr-2" />
          Add Collection
        </Button>
      </div>

      {/* Collections Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Collections ({updatedMetadata.total || 0})</CardTitle>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardDescription>
              Manage your product collections and categories
            </CardDescription>
            <div className="flex items-center gap-2">
              {/* Always show pagination info */}
              <span className="text-sm text-muted-foreground px-2">
                Page {currentPage} of {updatedMetadata.total_pages || 1} 
                {updatedMetadata.total && ` (${updatedMetadata.total} total)`}
              </span>
              {/* Show buttons when there are multiple pages */}
              {(updatedMetadata.total_pages > 1) && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={!updatedMetadata.has_previous}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={!updatedMetadata.has_next}
                    className="flex items-center gap-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingCollections ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading collections...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Handle</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCollections.map((collection: CollectionEntity) => (
                  <TableRow key={collection.id}>
                    <TableCell className="font-medium">{collection.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{collection.description || "No description"}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(collection.is_active || false)}>
                        {collection.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{collection.handle || "No handle"}</TableCell>
                    <TableCell>{collection.created_at ? formatDate(collection.created_at) : "N/A"}</TableCell>
                    <TableCell>{collection.updated_at ? formatDate(collection.updated_at) : "N/A"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewCollection(collection.id!)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteCollection(collection.id!)}
                          disabled={deleteCollectionMutation.isPending}
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
          {!isLoadingCollections && paginatedCollections.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No collections found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <DefaultDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => !deleteCollectionMutation.isPending && setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Collection"
        description="Are you sure you want to delete this collection? This action cannot be undone."
        itemName="Collection"
      />

      {/* Add Collection Dialog */}
      <AddCollectionDialog
        isOpen={isAddCollectionOpen}
        onClose={() => setIsAddCollectionOpen(false)}
        onSubmit={handleCreateCollection}
        isLoading={createCollectionMutation.isPending}
      />
    </div>
  )
}

export default CollectionScreen
