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
import { ArrowUpDown, ChevronDown, Package, Eye } from "lucide-react"

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
import { ProductEntity } from "@/src/features/sales/data/model/physical/products-entity"
import { formatDateToYYYYMMDD, isAdmin } from "@/src/core/constant/helper"
import { useSession } from "@/src/core/lib/dummy-session-provider"
import toast from "react-hot-toast"

const SKUCell = ({ skus }: { skus: string[] }) => {
    const [showAll, setShowAll] = React.useState(false)
    const displaySkus = showAll ? skus : skus.slice(0, 3)
    const hasMore = skus.length > 3

    return (
        <div className="flex flex-wrap gap-1 items-center">
            {displaySkus.map((sku, index) => (
                <Badge variant="outline" className="text-xs" key={index}>
                    {sku}
                </Badge>
            ))}
            {hasMore && !showAll && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-auto p-1 text-blue-600 hover:text-blue-800"
                    onClick={() => setShowAll(true)}
                >
                    +{skus.length - 3} more
                </Button>
            )}
            {showAll && hasMore && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-auto p-1 text-blue-600 hover:text-blue-800"
                    onClick={() => setShowAll(false)}
                >
                    show less
                </Button>
            )}
        </div>
    )
}

const columns = ({
    onView,
    onEdit,
    onDelete,
    findListOfSkusInAProduct,
    findTotalQuantityOfAllVariantsInAProduct,
    isUserAdmin
}: {
    onView: (id: string) => void,
    onEdit: (product: ProductEntity) => void,
    onDelete: (id: string) => void,
    findListOfSkusInAProduct: (product: ProductEntity) => string[],
    findTotalQuantityOfAllVariantsInAProduct: (product: ProductEntity) => number,
    isUserAdmin: boolean
}): ColumnDef<ProductEntity>[] => {
    const baseColumns: ColumnDef<ProductEntity>[] = [
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
            accessorKey: "images",
            header: "Image",
            enableSorting: false,
            cell: ({ row }) => (
                <div className="h-14 w-14 rounded-md overflow-hidden">
                    {row.original.images && row.original.images[0] ? (
                        <img
                            src={row.original.images[0]}
                            alt={row.original.name || 'Product image'}
                            className="object-cover w-full h-full"
                        />
                    ) : (
                        <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                        </div>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "name",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="justify-start p-0"
                >
                    Product Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div className="font-medium text-left">{row.getValue("name")}</div>,
        },
        {
            id: "skus",
            header: "SKUs",
            cell: ({ row }) => (
                <SKUCell skus={findListOfSkusInAProduct(row.original)} />
            ),
        },
        {
            id: "inventory",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="justify-start p-0"
                >
                    Inventory
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div className="text-left">{findTotalQuantityOfAllVariantsInAProduct(row.original)} In Stock</div>,
        },
        {
            id: "actions",
            header: "Actions",
            enableHiding: false,
            cell: ({ row }) => {
                const product = row.original

                return (
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => product.id && onView(product.id)}
                        >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                        </Button>
                        <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => product.id && onEdit(product)}
                            >
                                Edit
                            </Button>
                    </div>
                )
            },
        },
    ]

    return baseColumns;
}

export function ProductDataTable({
    data,
    onView,
    onEdit,
    onDelete,
    onDeleteAll,
    findListOfSkusInAProduct,
    findTotalQuantityOfAllVariantsInAProduct
}: {
    data: ProductEntity[],
    onView: (id: string) => void,
    onEdit: (product: ProductEntity) => void,
    onDelete: (id: string) => void,
    onDeleteAll: (selectedProducts: ProductEntity[]) => void,
    findListOfSkusInAProduct: (product: ProductEntity) => string[],
    findTotalQuantityOfAllVariantsInAProduct: (product: ProductEntity) => number
}) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})

    const { data: session } = useSession()
    const isUserAdmin = isAdmin(session?.user_entity || {})

    const table = useReactTable({
        data,
        columns: columns({
            onView,
            onEdit,
            onDelete,
            findListOfSkusInAProduct,
            findTotalQuantityOfAllVariantsInAProduct,
            isUserAdmin
        }),
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
        const selectedProducts = table.getFilteredSelectedRowModel().rows.map(row => row.original);
        onDeleteAll(selectedProducts);
    }

    return (
        <div className="w-full">
            <div className="flex items-center py-4">
                <Input
                    placeholder="Filter products..."
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("name")?.setFilterValue(event.target.value)
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
                                    colSpan={columns({
                                        onView,
                                        onEdit,
                                        onDelete,
                                        findListOfSkusInAProduct,
                                        findTotalQuantityOfAllVariantsInAProduct,
                                        isUserAdmin
                                    }).length}
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

export default ProductDataTable 