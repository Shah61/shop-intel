"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Package, X, Upload, Plus } from "lucide-react"
import { ProductEntity } from "@/src/features/sales/data/model/physical/products-entity"

// Import UI components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Import mutation hooks
import { 
  useCreateProductMutation, 
  useUpdateProductMutation 
} from "@/src/features/sales/presentation/tanstack/physical/products-tanstack"

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  product?: ProductEntity | null;
}

const ProductForm: React.FC<ProductFormProps> = ({ isOpen, onClose, product = null }) => {
  const router = useRouter()
  const [formData, setFormData] = useState<ProductEntity>({
    name: "",
    images: []
  })
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const [error, setError] = useState("")
  const [isProcessingImage, setIsProcessingImage] = useState(false)

  // Use mutation hooks
  const createProductMutation = useCreateProductMutation()
  const updateProductMutation = useUpdateProductMutation()

  // Determine if we're in a submitting state based on mutation status
  const isSubmitting = createProductMutation.isPending || updateProductMutation.isPending

  // If editing, populate form with product data
  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id,
        name: product.name || "",
        images: product.images || []
      })
      setPreviewImages(product.images || [])
    } else {
      // Reset form when creating new product
      setFormData({
        name: "",
        images: []
      })
      setPreviewImages([])
    }
  }, [product, isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  // Function to resize and compress image
  const resizeAndCompressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      setIsProcessingImage(true)
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (!event.target || typeof event.target.result !== 'string') {
          setIsProcessingImage(false)
          reject(new Error("Failed to read file"));
          return;
        }

        const img = new Image();
        img.src = event.target.result;
        
        img.onload = () => {
          // Calculate new dimensions (max width/height of 800px)
          const MAX_SIZE = 800;
          let width = img.width;
          let height = img.height;
          
          if (width > height && width > MAX_SIZE) {
            height = Math.round(height * (MAX_SIZE / width));
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width = Math.round(width * (MAX_SIZE / height));
            height = MAX_SIZE;
          }
          
          // Create canvas and draw resized image
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            setIsProcessingImage(false)
            reject(new Error("Could not get canvas context"));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with compression (quality 0.7 = 70%)
          const base64String = canvas.toDataURL('image/jpeg', 0.7);
          
          setIsProcessingImage(false)
          resolve(base64String);
        };
        
        img.onerror = () => {
          setIsProcessingImage(false)
          reject(new Error("Failed to load image"));
        };
      };
      
      reader.onerror = () => {
        setIsProcessingImage(false)
        reject(new Error("Failed to read file"));
      };
      
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    
    const files = Array.from(e.target.files)
    const currentImageCount = (formData.images || []).length
    
    // Check if adding these files would exceed the 5 image limit
    if (currentImageCount + files.length > 5) {
      setError("Maximum 5 images allowed")
      return
    }
    
    setError("") // Clear previous errors
    setIsProcessingImage(true)
    
    try {
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit for initial file
          setError("Image size should be less than 10MB")
          continue
        }
        
        // Resize and compress the image
        const optimizedBase64 = await resizeAndCompressImage(file)
        
        // Calculate size of base64 string in MB
        const sizeInBytes = Math.ceil((optimizedBase64.length * 3) / 4) - 
                          (optimizedBase64.endsWith('==') ? 2 : optimizedBase64.endsWith('=') ? 1 : 0)
        const sizeInMB = sizeInBytes / (1024 * 1024)
        
        if (sizeInMB > 1) {
          setError(`Compressed image is still too large (${sizeInMB.toFixed(2)}MB). Try a smaller image.`)
          continue
        }
        
        // Create a blob URL for preview
        const blob = dataURItoBlob(optimizedBase64)
        const previewUrl = URL.createObjectURL(blob)
        
        setPreviewImages(prev => [...prev, previewUrl])
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), optimizedBase64]
        }))
      }
    } catch (err) {
      console.error("Error processing images:", err)
      setError("Failed to process images")
    } finally {
      setIsProcessingImage(false)
      // Clear the input so the same file can be selected again
      e.target.value = ""
    }
  }
  
  // Helper function to convert Data URI to Blob
  const dataURItoBlob = (dataURI: string) => {
    const byteString = atob(dataURI.split(',')[1])
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i)
    }
    
    return new Blob([ab], { type: mimeString })
  }

  const removeImage = (index: number) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index))
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Check image sizes before submitting
    if (formData.images && formData.images.length > 0) {
      let totalSize = 0
      
      for (const image of formData.images) {
        if (typeof image === 'string') {
          // Calculate size of base64 string
          const sizeInBytes = Math.ceil((image.length * 3) / 4) - 
                            (image.endsWith('==') ? 2 : image.endsWith('=') ? 1 : 0)
          totalSize += sizeInBytes
        }
      }
      
      // If total size exceeds 2MB (arbitrary limit, adjust as needed)
      const totalSizeMB = totalSize / (1024 * 1024)
      if (totalSizeMB > 2) {
        setError(`Total image size (${totalSizeMB.toFixed(2)}MB) is too large. Try removing some images or using smaller ones.`)
        return
      }
    }

    try {
      if (product && product.id) {
        const productToUpdate: ProductEntity = {
          ...formData,
          id: product.id
        }
        
        // Use the update mutation
        await updateProductMutation.mutateAsync(productToUpdate)
      } else {
        // Use the create mutation
        await createProductMutation.mutateAsync(formData)
      }

      // Close the form and reset
      onClose()
      setFormData({ name: "", images: [] })
      setPreviewImages([])
    } catch (error: any) {
      // Errors are handled by the mutation hooks, but we can still set local error state
      setError(error.message || "An error occurred")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription>
            {product ? "Update product details and images" : "Fill in the details to create a new product"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>
                Product Images 
                <span className="text-sm text-muted-foreground ml-1">({previewImages.length}/5)</span>
                <span className="text-xs text-muted-foreground block">Images will be automatically resized and compressed.</span>
              </Label>
              
              <div className="grid grid-cols-4 gap-2">
                {previewImages.map((image, index) => (
                  <div key={index} className="relative h-24 w-24 rounded-md overflow-hidden border">
                    <img
                      src={image}
                      alt={`Product image ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ))}
                
                {previewImages.length < 5 && (
                  <div className="h-24 w-24 border border-dashed rounded-md flex items-center justify-center">
                    <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                      {isProcessingImage ? (
                        <div className="animate-pulse">Processing...</div>
                      ) : (
                        <>
                          <Plus className="h-6 w-6 text-gray-400" />
                          <span className="text-xs text-gray-400">Add Image</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isProcessingImage}
                        multiple
                      />
                    </label>
                  </div>
                )}
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isProcessingImage}>
              {isSubmitting ? "Saving..." : product ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ProductForm