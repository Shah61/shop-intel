import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { AlertCircle, Package } from "lucide-react"
import toast from "react-hot-toast"

interface AddCollectionDialogProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: CollectionFormData) => void
    isLoading?: boolean
}

interface CollectionFormData {
    name: string
    description?: string
}

const AddCollectionDialog = ({ isOpen, onClose, onSubmit, isLoading = false }: AddCollectionDialogProps) => {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [formError, setFormError] = useState("")
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError("")

        if (!name.trim()) {
            toast.error("Please enter a collection name")
            setFormError("Please enter a collection name")
            return
        }

        const formData: CollectionFormData = {
            name: name.trim(),
            description: description.trim() || undefined
        }

        try {
            onSubmit(formData)
            resetForm()
        } catch (error: any) {
            toast.error("Failed to add collection")
            setFormError(error.message || "Failed to add collection")
        }
    }

    const resetForm = () => {
        setName("")
        setDescription("")
        setFormError("")
    }

    const handleClose = () => {
        resetForm()
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md flex flex-col justify-center">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Add New Collection
                    </DialogTitle>
                    <DialogDescription>
                        Create a new collection to group related products together
                    </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {formError && (
                        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-start">
                            <AlertCircle className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
                            <p>{formError}</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="collectionName">Collection Name *</Label>
                        <Input
                            id="collectionName"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter collection name"
                            required
                            className="w-full"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="collectionDescription">Description</Label>
                        <Input
                            id="collectionDescription"
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter collection description (optional)"
                            className="w-full"
                            disabled={isLoading}
                        />
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
                            disabled={isLoading}
                            className="flex items-center gap-2"
                        >
                            {isLoading ? "Creating..." : "Create Collection"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default AddCollectionDialog 