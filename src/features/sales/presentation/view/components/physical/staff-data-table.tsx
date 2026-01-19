"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { UsersEntity } from "@/src/features/auth/data/model/users-entity"
import { formatCurrency, formatCurrencyToSGD, formatDateToYYYYMMDD, isAdmin } from "@/src/core/constant/helper"
import { useSession } from "@/src/core/lib/dummy-session-provider"
import toast from "react-hot-toast"




export const columns = ({ onDelete, isUserAdmin }: {
    onDelete: (id: string) => void,
    isUserAdmin: boolean
}): ColumnDef<UsersEntity>[] => {
    const baseColumns: ColumnDef<UsersEntity>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Name
                        <ArrowUpDown />
                    </Button>
                )
            },
            cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
        },
        {
            accessorKey: "email",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Email
                        <ArrowUpDown />
                    </Button>
                )
            },
            cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
        },
        {
            accessorKey: "role",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Role
                        <ArrowUpDown />
                    </Button>
                )
            },
            cell: ({ row }) => <div className="capitalize">{row.getValue("role")}</div>,
        },
        {
            accessorKey: "created_at",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Joined At
                        <ArrowUpDown />
                    </Button>
                )
            },
            cell: ({ row }) => <div>{formatDateToYYYYMMDD(row.getValue("created_at"))}</div>,
        },
        {
            accessorKey: "total_orders",
            header: ({ column }) => {
                return <div>Total Orders</div>
            },
            cell: ({ row }) => <div>{row.getValue("total_orders") || 0}</div>,
        },

        {
            accessorKey: "total_revenues_sgd",
            header: ({ column }) => {
                return <div>Total Revenues SGD</div>
            },
            cell: ({ row }) => <div>{formatCurrencyToSGD(row.getValue("total_revenues_sgd") || 0)} SGD</div>,
        },
        {
            accessorKey: "total_revenues_myr",
            header: ({ column }) => {
                return <div>Total Revenues MYR</div>
            },
            cell: ({ row }) => <div>{formatCurrency(row.getValue("total_revenues_myr") || 0)}</div>,
        },
        {
            id: "actions",
            header: "Action",
            enableHiding: false,
            cell: ({ row }) => {
                const user = row.original

                return (
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onDelete(user.id ?? "")}
                        className="flex items-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </Button>
                )
            },
        },
    ]

    return baseColumns;
}

export function StaffDataTable({
    data,
    onDeleteAll,
    onDelete
}: {
    data: UsersEntity[],
    onDeleteAll: (selectedUsers: UsersEntity[]) => void,
    onDelete: (id: string) => void
}) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})

    const { data: session } = useSession()
    const isUserAdmin = isAdmin(session?.user_entity || {})

    const table = useReactTable({
        data,
        columns: columns({ onDelete, isUserAdmin }),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    const handleDeleteSelected = () => {
        // Admin check removed - all users can delete
        const selectedUsers = table.getFilteredSelectedRowModel().rows.map(row => row.original);
        onDeleteAll(selectedUsers);
    }

    return (
        <div className="w-full">
            <div className="flex items-center py-4">
                <Input
                    placeholder="Filter emails..."
                    value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("email")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm mr-2"
                />
                {table.getFilteredSelectedRowModel().rows.length > 0 && (
                    <Button
                        variant="destructive"
                        onClick={handleDeleteSelected}
                        className="ml-4"
                    >
                        Delete Selected ({table.getFilteredSelectedRowModel().rows.length})
                    </Button>
                )}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Columns <ChevronDown />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                )
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns({ onDelete, isUserAdmin }).length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}