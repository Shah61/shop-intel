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
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

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
import { CommissionHistory } from "../../../data/model/affiliates-model"
import { formatCurrency } from "@/src/core/constant/helper"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const columns: ColumnDef<CommissionHistory>[] = [
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
                Affiliate
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
        accessorKey: "order_id",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Order ID
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            return <div className="font-medium">{row.getValue("order_id")}</div>
        },
    },
    {
        accessorKey: "total_sales",
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
            const amount = row.getValue("total_sales") as number
            return <div>{formatCurrency(amount)}</div>
        },
    },
    {
        accessorKey: "commission",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Commission
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const amount = row.getValue("commission") as number
            return <div className="font-medium">{formatCurrency(amount)}</div>
        },
    },
    {
        accessorKey: "quantity",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Quantity
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            return <div className="font-medium">{row.getValue("quantity")}</div>
        },
    },
    {
        accessorKey: "source",
        header: "Source",
        cell: ({ row }) => {
            return <div>{row.getValue("source")}</div>
        },
    },
    {
        accessorKey: "created_at",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Created At
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => {
            const date = row.getValue("created_at") as Date
            return <div>{date ? new Date(date).toLocaleDateString() : 'N/A'}</div>
        },
    },
    {
        accessorKey: "is_paid",
        header: "Status",
        cell: ({ row }) => {
            const isPaid = row.getValue("is_paid") as boolean
            return (
                <Badge variant={isPaid ? 'default' : 'secondary'}
                    className={isPaid ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                        'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'}>
                    {isPaid ? 'Paid' : 'Pending'}
                </Badge>
            )
        },
    },
    // {
    //     id: "actions",
    //     enableHiding: false,
    //     cell: ({ row }) => {
    //         const commission = row.original

    //         return (
    //             <DropdownMenu>
    //                 <DropdownMenuTrigger asChild>
    //                     <Button variant="ghost" className="h-8 w-8 p-0">
    //                         <span className="sr-only">Open menu</span>
    //                         <MoreHorizontal className="h-4 w-4" />
    //                     </Button>
    //                 </DropdownMenuTrigger>
    //                 <DropdownMenuContent align="end">
    //                     <DropdownMenuLabel>Actions</DropdownMenuLabel>
    //                     <DropdownMenuItem>View Details</DropdownMenuItem>
    //                     {!commission.is_paid && (
    //                         <>
    //                             <DropdownMenuItem>Mark as Paid</DropdownMenuItem>
    //                         </>
    //                     )}
    //                 </DropdownMenuContent>
    //             </DropdownMenu>
    //         )
    //     },
    // },
];

interface CommissionsDataTableProps {
    data: CommissionHistory[];
    onStatusChange?: (status: string) => void;
    selectedStatus?: string;
    pageCount: number;
    pageSize: number;
    currentPage: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
}

const CommissionsDataTable = ({
    data,
    onStatusChange,
    selectedStatus = "all",
    pageCount,
    pageSize,
    currentPage,
    onPageChange,
    onPageSizeChange,
}: CommissionsDataTableProps) => {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})

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
        manualPagination: true,
        pageCount: pageCount,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination: {
                pageIndex: currentPage - 1,
                pageSize: pageSize,
            },
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
                    <Select value={selectedStatus} onValueChange={onStatusChange}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Payment Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="PAID">Paid</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={pageSize.toString()}
                        onValueChange={(value) => onPageSizeChange(Number(value))}
                    >
                        <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Page size" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="30">30</SelectItem>
                            <SelectItem value="40">40</SelectItem>
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
                                    No commissions found.
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
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    <span className="mx-2">
                        Page {currentPage} of {pageCount}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === pageCount}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
};

export default CommissionsDataTable;
