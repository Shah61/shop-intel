import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useState, useEffect } from "react"
import { Users, Loader2, Search, Mail, Phone, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useGetCustomers } from "../../../tanstack/physical/customer-tanstack"
import { CustomerEntity } from "../../../../data/model/physical/customer-entity"
import toast from "react-hot-toast"

interface AddCustomersToDiscountDialogProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (customerIds: string[]) => void
    isLoading?: boolean
    existingCustomerIds: string[]
    discountTitle: string
}

const AddCustomersToDiscountDialog = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    isLoading = false, 
    existingCustomerIds,
    discountTitle 
}: AddCustomersToDiscountDialogProps) => {
    const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([])
    const [searchQuery, setSearchQuery] = useState("")

    const { data: customers = [], isLoading: isLoadingCustomers, error } = useGetCustomers()

    useEffect(() => {
        if (isOpen) {
            setSelectedCustomerIds([])
            setSearchQuery("")
        }
    }, [isOpen])

    const handleSubmit = () => {
        if (selectedCustomerIds.length === 0) {
            toast.error("Please select at least one customer")
            return
        }
        onSubmit(selectedCustomerIds)
    }

    const handleClose = () => {
        setSelectedCustomerIds([])
        setSearchQuery("")
        onClose()
    }

    const handleCustomerToggle = (customerId: string) => {
        setSelectedCustomerIds(prev => 
            prev.includes(customerId)
                ? prev.filter(id => id !== customerId)
                : [...prev, customerId]
        )
    }

    // Filter customers based on search and exclude already existing ones
    const availableCustomers = customers.filter((customer: CustomerEntity) => {
        const fullName = `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
        const matchesSearch = 
            fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (customer.phone && customer.phone.includes(searchQuery))
        
        const notAlreadyAdded = !existingCustomerIds.includes(customer.customer_id!)
        return matchesSearch && notAlreadyAdded && customer.customer_id
    })

    const getCustomerDisplayName = (customer: CustomerEntity) => {
        const fullName = `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
        return fullName || customer.email || 'Unnamed Customer'
    }

    if (error) {
        return (
            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Customers to Discount</DialogTitle>
                        <DialogDescription>
                            Error loading customers. Please try again.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 text-center text-destructive">
                        Failed to load customers
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
                        <Users className="h-5 w-5" />
                        Add Customers to Discount
                    </DialogTitle>
                    <DialogDescription>
                        Add customers to &quot;{discountTitle}&quot; discount. Selected customers will be eligible to use this discount.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search customers by name, email, or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                            disabled={isLoadingCustomers || isLoading}
                        />
                    </div>

                    {/* Selected Customers Summary */}
                    {selectedCustomerIds.length > 0 && (
                        <div className="border rounded-lg p-3 bg-muted/50">
                            <p className="text-sm font-medium mb-2">
                                Selected Customers ({selectedCustomerIds.length})
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {selectedCustomerIds.map(id => {
                                    const customer = customers.find((c: CustomerEntity) => c.customer_id === id)
                                    return (
                                        <Badge key={id} variant="secondary" className="text-xs">
                                            {getCustomerDisplayName(customer!)}
                                        </Badge>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Customers List */}
                    <div className="flex-1 overflow-y-auto border rounded-lg">
                        {isLoadingCustomers ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin" />
                                <span className="ml-2">Loading customers...</span>
                            </div>
                        ) : availableCustomers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                <Users className="h-12 w-12 mb-4 text-muted-foreground/50" />
                                <p className="font-medium">No customers available</p>
                                <p className="text-sm text-center">
                                    {searchQuery 
                                        ? "No customers match your search criteria" 
                                        : "All customers are already added to this discount"}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {availableCustomers.map((customer: CustomerEntity) => (
                                    <div
                                        key={customer.customer_id}
                                        className="flex items-center space-x-3 p-4 hover:bg-muted/50 cursor-pointer"
                                        onClick={() => handleCustomerToggle(customer.customer_id!)}
                                    >
                                        <Checkbox
                                            checked={selectedCustomerIds.includes(customer.customer_id!)}
                                            onCheckedChange={() => handleCustomerToggle(customer.customer_id!)}
                                            disabled={isLoading}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                <p className="font-medium truncate">
                                                    {getCustomerDisplayName(customer)}
                                                </p>
                                            </div>
                                            
                                            <div className="space-y-1">
                                                {customer.email && customer.email !== "-" && (
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-3 w-3 text-muted-foreground" />
                                                        <p className="text-sm text-muted-foreground truncate">
                                                            {customer.email}
                                                        </p>
                                                    </div>
                                                )}
                                                
                                                {customer.phone && customer.phone !== "-" && (
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-3 w-3 text-muted-foreground" />
                                                        <p className="text-sm text-muted-foreground">
                                                            {customer.phone}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex items-center gap-2 mt-2">
                                                <Badge variant="outline" className="text-xs">
                                                    ID: {customer.customer_id}
                                                </Badge>
                                                {customer.total_points && customer.total_points > 0 && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        {customer.total_points} points
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
                        disabled={isLoading || selectedCustomerIds.length === 0}
                        className="flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Adding...
                            </>
                        ) : (
                            <>
                                <Users className="h-4 w-4" />
                                Add {selectedCustomerIds.length} Customer{selectedCustomerIds.length !== 1 ? 's' : ''}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default AddCustomersToDiscountDialog 