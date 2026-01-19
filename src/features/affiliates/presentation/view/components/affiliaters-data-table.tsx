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
import { ArrowUpDown, ArrowUpRight, ChevronDown, DollarSign, MoreHorizontal } from "lucide-react"
import toast from 'react-hot-toast'

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
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
import { Badge } from "@/components/ui/badge"
import { Affiliaters, CreatePayoutHistoryDTO } from "../../../data/model/affiliates-model"
import Link from "next/link"
import { formatCurrency } from "@/src/core/constant/helper"
import CreatePayoutDialog from "./create-payout-dialog"
import { useCreatePayoutHistory, useDeleteUserAffiliate } from "../../tanstack/affiliates-tanstack"
import DeleteUserAffiliateAlertDialog from "./delete-user-affiliate-alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AffiliatersDataTableProps {
    data: Affiliaters[];
    onStatusChange?: (status: string) => void;
    selectedStatus?: string;
    currentPage: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    totalPages: number;
}

export function AffiliatersDataTable({
    data,
    onStatusChange,
    selectedStatus = "all",
    currentPage,
    pageSize,
    onPageChange,
    onPageSizeChange,
    totalPages
}: AffiliatersDataTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [selectedAffiliate, setSelectedAffiliate] = React.useState<Affiliaters | null>(null)
    const [showPayoutDialog, setShowPayoutDialog] = React.useState(false)

    const {
        mutate: createPayoutHistory,
        isPending: isCreatingPayout,
        isSuccess: isPayoutCreated,
        isError: isPayoutError,
    } = useCreatePayoutHistory();

    const {
        mutate: deleteUserAffiliate,
        isPending: isDeletingUserAffiliate,
        isSuccess: isUserAffiliateDeleted,
        isError: isUserAffiliateDeleteError,
    } = useDeleteUserAffiliate();

    const handleCreatePayout = async (values: any) => {
        let data: CreatePayoutHistoryDTO = {
            user_affiliate_id: values.user_affiliate_id,
            commission_ids: values.commission_ids,
            payout_amount: values.payout_amount
        }
        createPayoutHistory(data);
    };

    const handleDeleteAffiliate = (affiliate: Affiliaters) => {
        if (affiliate.user_affiliate.id) {
            deleteUserAffiliate(affiliate.user_affiliate.id);
        }
        toast.error("Failed to delete affiliate");
    };

    const handlePayoutDialogChange = (open: boolean) => {
        setShowPayoutDialog(open);
        if (!open) {
            setSelectedAffiliate(null);
        }
    };

    const columns: ColumnDef<Affiliaters>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
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
            accessorKey: "user_affiliate",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const user = row.getValue("user_affiliate") as { first_name?: string; last_name?: string; email?: string }
                return (
                    <div>
                        <div className="font-medium">{`${user?.first_name || ''} ${user?.last_name || ''}`}</div>
                        <div className="text-sm text-muted-foreground">{user?.email}</div>
                    </div>
                )
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                return (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                )
            },
        },
        {
            accessorKey: "joined_at",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Join Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const date = new Date(row.getValue("joined_at"))
                return <div>{date.toLocaleDateString()}</div>
            },
        },
        {
            accessorKey: "total_sales_amount",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Total Sales
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const amount = row.getValue("total_sales_amount") as number
                const formatted = formatCurrency(amount)
                return <div>{formatted}</div>
            },
        },
        {
            accessorKey: "total_commission_amount",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Paid Commission
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const amount = row.getValue("total_commission_amount") as number
                const formatted = formatCurrency(amount)
                return <div>{formatted}</div>
            },
        },
        {
            accessorKey: "total_unpaid_commission_amount",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Unpaid Commission
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const amount = row.getValue("total_unpaid_commission_amount") as number
                const formatted = formatCurrency(amount)
                return <div>{formatted}</div>
            },
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const affiliate = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>

                            <DropdownMenuItem
                                onClick={() => {
                                    if (affiliate.unpaid_commissions_id.length > 0) {
                                        setSelectedAffiliate(affiliate);
                                        setShowPayoutDialog(true);
                                    } else {
                                        toast.error("This user has no unpaid commissions yet.");
                                    }
                                }}
                            >
                                Mark as Paid
                                <DollarSign className="ml-2 h-4 w-4" />
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <DeleteUserAffiliateAlertDialog
                                    affiliate={affiliate}
                                    onDelete={handleDeleteAffiliate}
                                />
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    const table = useReactTable({
        data,
        columns,
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

    return (
        <div className="w-full">
            <div className="flex items-center py-4">
                <Input
                    placeholder="Filter affiliates..."
                    value={(table.getColumn("user_affiliate")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("user_affiliate")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm mr-2"
                />
                <div className="flex items-center gap-2 ml-auto">
                    <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(Number(value))}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Page Size" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                    </Select>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                Columns <ChevronDown className="ml-2 h-4 w-4" />
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
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
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
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No affiliates found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                    >
                        Next
                    </Button>
                </div>
            </div>

            {selectedAffiliate && (
                <CreatePayoutDialog
                    open={showPayoutDialog}
                    onOpenChange={handlePayoutDialogChange}
                    affiliate={selectedAffiliate}
                    onSubmit={handleCreatePayout}
                />
            )}
        </div>
    )
}

export default AffiliatersDataTable;