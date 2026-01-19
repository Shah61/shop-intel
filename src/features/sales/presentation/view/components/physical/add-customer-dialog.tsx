import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { AlertCircle } from "lucide-react"
import toast from "react-hot-toast"
import { useCreateCustomer } from "../../../tanstack/physical/customer-tanstack"

interface AddCustomerDialogProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: (customerId: string) => void
}

const AddCustomerDialog = ({ isOpen, onClose, onSuccess }: AddCustomerDialogProps) => {
    const [email, setEmail] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [phone, setPhone] = useState("")
    const [addressLine1, setAddressLine1] = useState("")
    const [addressLine2, setAddressLine2] = useState("")
    const [city, setCity] = useState("")
    const [state, setState] = useState("")
    const [postalCode, setPostalCode] = useState("")
    const [country, setCountry] = useState("")
    const [formError, setFormError] = useState("")

    const { mutate: createCustomer, isPending: isCreatingCustomer } = useCreateCustomer()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!email.includes('@')) {
            toast.error("Please enter a valid email address")
            setFormError("Please enter a valid email address")
            return
        }

        createCustomer({
            email,
            first_name: firstName,
            last_name: lastName,
            phone,
            customer_address: {
                address_line1: addressLine1,
                address_line2: addressLine2,
                city,
                state,
                postal_code: postalCode,
                country
            }
        }, {
            onSuccess: (response) => {
                toast.success("Customer added successfully")
                resetForm()
                if (response?.customer_id) {
                    onSuccess?.(response.customer_id)
                }
                onClose()
            },
            onError: (error) => {
                toast.error("Failed to add customer")
                setFormError(error.message || "Failed to add customer")
            }
        })
    }

    const resetForm = () => {
        setEmail("")
        setFirstName("")
        setLastName("")
        setPhone("")
        setAddressLine1("")
        setAddressLine2("")
        setCity("")
        setState("")
        setPostalCode("")
        setCountry("")
        setFormError("")
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md flex flex-col justify-center max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Customer</DialogTitle>
                    <DialogDescription>
                        Fill in the details to create a new customer
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-3">
                    {formError && (
                        <div className="bg-destructive/15 text-destructive text-sm p-2 rounded-md flex items-start">
                            <AlertCircle className="h-4 w-4 mr-2 mt-0.5 shrink-0" />
                            <p>{formError}</p>
                        </div>
                    )}

                    <div className="space-y-1">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex flex-row gap-2">
                        <div className="space-y-1 w-full">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-1 w-full">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-3 border-t pt-3">
                        <h4 className="text-sm font-medium">Address Information</h4>
                        
                        <div className="space-y-1">
                            <Label htmlFor="addressLine1">Address Line 1</Label>
                            <Input
                                id="addressLine1"
                                type="text"
                                value={addressLine1}
                                onChange={(e) => setAddressLine1(e.target.value)}
                                placeholder="Street address"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="addressLine2">Address Line 2</Label>
                            <Input
                                id="addressLine2"
                                type="text"
                                value={addressLine2}
                                onChange={(e) => setAddressLine2(e.target.value)}
                                placeholder="Unit, floor, etc. (optional)"
                            />
                        </div>

                        <div className="flex flex-row gap-2">
                            <div className="space-y-1 w-full">
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1 w-full">
                                <Label htmlFor="state">State</Label>
                                <Input
                                    id="state"
                                    type="text"
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex flex-row gap-2">
                            <div className="space-y-1 w-full">
                                <Label htmlFor="postalCode">Postal Code</Label>
                                <Input
                                    id="postalCode"
                                    type="text"
                                    value={postalCode}
                                    onChange={(e) => setPostalCode(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1 w-full">
                                <Label htmlFor="country">Country</Label>
                                <Input
                                    id="country"
                                    type="text"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                                resetForm()
                                onClose()
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isCreatingCustomer}>
                            {isCreatingCustomer ? "Loading..." : "Create Customer"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default AddCustomerDialog