"use client"

import { Button } from "@/components/ui/button"
import { useCreateUserMutation, useDeleteUserMutation, useUsersQuery } from "../../../../../auth/presentation/tanstack/users-tanstack"
import { StaffDataTable } from "../../components/physical/staff-data-table"
import toast from "react-hot-toast"
import { UsersEntity } from "@/src/features/auth/data/model/users-entity"
import AddStaffDialog from "../../components/physical/add-staff-dialog"
import { useState } from "react"
import DefaultDeleteDialog from "@/src/core/shared/view/components/default-delete-dialog"
import { useSession } from "@/src/core/lib/dummy-session-provider"
import { isAdmin } from "@/src/core/constant/helper"

const StaffScreen = () => {

    const [isAddStaffOpen, setIsAddStaffOpen] = useState(false)

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    const [userToDelete, setUserToDelete] = useState<string | null>(null)
    const [usersToDelete, setUsersToDelete] = useState<string[]>([])

    const { mutate: createUser } = useCreateUserMutation()
    const { mutate: deleteUser } = useDeleteUserMutation()

    const { data: session } = useSession()
    const isUserAdmin = isAdmin(session?.user_entity || {})

    const {
        data: users,
        isLoading,
        isError,
        error,
    } = useUsersQuery({ include_orders: true })

    const handleAddStaff = (staffData: UsersEntity) => {
        createUser(staffData)
        setIsAddStaffOpen(false)
    }

    const handleDeleteUser = (id: string) => {
        setUserToDelete(id)
        setIsDeleteDialogOpen(true)
    }

    const handleConfirmDelete = () => {
        if (userToDelete) {
            deleteUser(userToDelete)
            setIsDeleteDialogOpen(false)
            setUserToDelete(null)
        }
    }

    const handleDeleteAllUsers = (selectedUsers: UsersEntity[]) => {
        setUsersToDelete(selectedUsers.map(user => user.id ?? ""))
        setIsDeleteDialogOpen(true)
    }

    const handleConfirmDeleteAllUsers = () => {
        for (const id of usersToDelete) {
            if (id) {
                deleteUser(id)
            }
        }
        setIsDeleteDialogOpen(false)
        setUsersToDelete([])
    }

    return (
        <div className="flex flex-col items-start justify-center w-full gap-4">
            <div className="flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center w-full">
                <div>
                    <h2 className="text-2xl font-bold">Staff Management System</h2>
                    <p className="text-muted-foreground">Manage your staff and monitor staff performance</p>
                </div>

                <Button variant="default" onClick={() => setIsAddStaffOpen(true)}>Add New Staff</Button>
                <AddStaffDialog
                    isOpen={isAddStaffOpen}
                    onClose={() => setIsAddStaffOpen(false)}
                    onSubmit={handleAddStaff}
                />

            </div>

            <StaffDataTable
                data={users || []}
                onDeleteAll={handleDeleteAllUsers}
                onDelete={handleDeleteUser}
            />

            <DefaultDeleteDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Staff Member"
                description="Are you sure you want to delete this staff member? This action cannot be undone."
                itemName="Staff Member"
            />

            <DefaultDeleteDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleConfirmDeleteAllUsers}
                title="Delete Staff Members"
                description="Are you sure you want to delete these staff members? This action cannot be undone."
                itemName="Staff Members"
            />
        </div>
    )
}

export default StaffScreen