import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { UsersEntity } from "@/src/features/auth/data/model/users-entity"
import { useCreateUserMutation } from "../../../../../auth/presentation/tanstack/users-tanstack"

interface AddStaffDialogProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: UsersEntity) => void
}

const AddStaffDialog = ({ isOpen, onClose, onSubmit }: AddStaffDialogProps) => {
    const [formData, setFormData] = useState<UsersEntity>({
        email: "",
        name: "",
        role: "STAFF"
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
        setFormData({ email: "", name: "", role: "STAFF" })
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const { mutate: createUser } = useCreateUserMutation()

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Staff</DialogTitle>
                    <DialogDescription>
                        Enter the details for the new staff member
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name || ""}
                            onChange={handleChange}
                            placeholder="Enter staff name"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email || ""}
                            onChange={handleChange}
                            placeholder="Enter staff email"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                            value={formData.role || "STAFF"}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                {/* <SelectItem value="ADMIN">Admin</SelectItem> */}
                                <SelectItem value="STAFF">Staff</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">Add Staff</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default AddStaffDialog