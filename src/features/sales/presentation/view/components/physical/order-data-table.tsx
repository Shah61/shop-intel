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
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Eye, Download } from "lucide-react"
import * as XLSX from 'xlsx'

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { OrderEntity, OrderFilterParams } from "@/src/features/sales/data/model/physical/orders-entity"
import { formatDateToYYYYMMDD, isAdmin } from "@/src/core/constant/helper"
import { useSession } from "@/src/core/lib/dummy-session-provider"
import { useGetCustomers } from "../../../tanstack/physical/customer-tanstack"
import { useUsersQuery } from "@/src/features/auth/presentation/tanstack/users-tanstack"
import { useProductsQuery } from "../../../tanstack/physical/products-tanstack"

const formatCurrency = (value?: number | null, currency?: string | null) => {
    if (value === undefined || value === null) return "N/A";
    const curr = currency || 'MYR';
    if (curr === 'SGD') {
        return `SGD ${value.toFixed(2)}`;
    }
    const symbol = curr === 'USD' ? '$' : 'RM';
    return `${symbol}${value.toFixed(2)}`;
}

export const columns = ({ onView, onDelete, isUserAdmin }: {
    onView: (id: string) => void,
    onDelete: (id: string) => void,
    isUserAdmin: boolean
}): ColumnDef<OrderEntity>[] => {
    const baseColumns: ColumnDef<OrderEntity>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "order_number",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Order Number
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => (
                <div className="font-mono text-sm font-medium">
                    {row.getValue("order_number")}
                </div>
            ),
        },
        {
            accessorKey: "order_items",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Items
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const orderItems = row.original.order_items || [];
                return (
                    <div className="space-y-2 max-w-xs">
                        {orderItems.length > 0 ? (
                            orderItems.map((item, index) => (
                                <div key={index} className="text-sm border rounded-md p-2 bg-muted/50 dark:bg-muted/20">
                                    <div className="flex items-start gap-2">
                                        <img 
                                            src={item.product?.images?.[0] || '/placeholder-product.png'} 
                                            alt={item.product?.name || 'Product'}
                                            className="w-8 h-8 rounded object-cover flex-shrink-0"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/placeholder-product.png';
                                            }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate" title={item.product?.name || undefined}>
                                                {item.product?.name || 'Product'}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                SKU: {item.variant?.sku_name || 'N/A'}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                                                <span>Qty: {item.quantity}</span>
                                                <span className="font-medium">{formatCurrency(item.total_price, row.original.currency)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <span className="text-muted-foreground">No items</span>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: "total_amount",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Total Amount
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const amount = row.getValue("total_amount") as number;
                return (
                    <div className="text-left pl-6">
                        <div className="font-bold text-green-600 dark:text-green-400">{formatCurrency(amount, row.original.currency)}</div>
                        <div className="text-xs text-muted-foreground">
                            {row.original.order_items?.length || 0} item(s)
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "customer_email",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Customer
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const customer = row.original.customer_medusa;
                return (
                    <div className="max-w-xs">
                        <div className="font-medium text-sm truncate" title={customer?.email || undefined}>
                            {customer?.email || 'N/A'}
                        </div>
                        {customer?.first_name && (
                            <div className="text-xs text-muted-foreground truncate">
                                {customer.first_name} {customer.last_name || ''}
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: "staff_email",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Staff
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const staff = row.original.user || row.original.users;
                return (
                    <div className="font-medium text-sm">
                        {staff?.email || 'N/A'}
                    </div>
                );
            },
        },
        {
            accessorKey: "created_at",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Created At
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => <div>{formatDateToYYYYMMDD(row.getValue("created_at"))}</div>,
        },
    ]

    // Remove first (select) column for non-admin users
    return baseColumns;
}

export function OrderDataTable({
    data,
    onDeleteAll,
    onDelete,
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    onPageChange,
    onPageSizeChange,
    onApplyFilters,
    appliedFilters
}: {
    data: OrderEntity[],
    onDeleteAll: (selectedOrders: OrderEntity[]) => void,
    onDelete: (id: string) => void,
    currentPage: number,
    pageSize: number,
    totalPages: number,
    totalItems: number,
    onPageChange: (page: number) => void,
    onPageSizeChange: (size: number) => void,
    onApplyFilters: (filters: OrderFilterParams) => void,
    appliedFilters: OrderFilterParams
}) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    
    // Filter states
    const [showFilters, setShowFilters] = React.useState(false)
    const [filterForm, setFilterForm] = React.useState<OrderFilterParams>({
        is_desc: true, // Default to descending order
        date: '',
        customer_email: '',
        staff_email: '',
        country_code: '',
        product_name: '',
        variant_sku_number: '',
        order_number: ''
    })
    
    const { data: session } = useSession()
    const isUserAdmin = isAdmin(session?.user_entity || {})
    
    // Data for dropdowns
    const { data: customers } = useGetCustomers()
    const { data: users } = useUsersQuery()
    const { data: products } = useProductsQuery()
    
    // Get unique emails from customers and users
    const customerEmails = React.useMemo(() => {
        if (!customers) return []
        return [...new Set(customers.map(c => c.email).filter(Boolean))].sort()
    }, [customers])
    
    const staffEmails = React.useMemo(() => {
        if (!users) return []
        return [...new Set(users.map(u => u.email).filter(Boolean))].sort()
    }, [users])
    
    const productNames = React.useMemo(() => {
        if (!products) return []
        return [...new Set(products.map(p => p.name).filter(Boolean))].sort()
    }, [products])

    const table = useReactTable({
        data,
        columns: columns({ onDelete, onView: () => { }, isUserAdmin }),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
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
        const selectedOrders = table.getFilteredSelectedRowModel().rows.map(row => row.original);
        onDeleteAll(selectedOrders);
    }

    const handleApplyFilters = () => {
        // Clean up empty values before applying
        const cleanedFilters: OrderFilterParams = {};
        
        if (filterForm.is_desc !== undefined) cleanedFilters.is_desc = filterForm.is_desc;
        if (filterForm.date) cleanedFilters.date = filterForm.date;
        if (filterForm.customer_email) cleanedFilters.customer_email = filterForm.customer_email;
        if (filterForm.staff_email) cleanedFilters.staff_email = filterForm.staff_email;
        if (filterForm.country_code) cleanedFilters.country_code = filterForm.country_code;
        if (filterForm.product_name) cleanedFilters.product_name = filterForm.product_name;
        if (filterForm.variant_sku_number) cleanedFilters.variant_sku_number = filterForm.variant_sku_number;
        if (filterForm.order_number) cleanedFilters.order_number = filterForm.order_number;
        
        onApplyFilters(cleanedFilters);
    }

    const handleClearFilters = () => {
        setFilterForm({
            is_desc: true, // Default to descending order when clearing
            date: '',
            customer_email: '',
            staff_email: '',
            country_code: '',
            product_name: '',
            variant_sku_number: '',
            order_number: ''
        });
        onApplyFilters({ is_desc: true }); // Apply descending as default
    }

    const exportToExcel = () => {
        // Format data for Excel export - one row per order item (product)
        const formattedData: any[] = [];
        
        data.forEach(order => {
            const orderItems = order.order_items || [];
            
            if (orderItems.length === 0) {
                // If no items, still create one row for the order
                formattedData.push({
                    'Order Number': order.order_number || 'N/A',
                    'Customer Email': order.customer_medusa?.email || 'N/A',
                    'Customer Name': `${order.customer_medusa?.first_name || ''} ${order.customer_medusa?.last_name || ''}`.trim() || 'N/A',
                    'Staff Name': order.user?.name || order.users?.name || 'N/A',
                    'Staff Email': order.user?.email || order.users?.email || 'N/A',
                    'Staff Role': order.user?.role || order.users?.role || 'N/A',
                    'Order Total Amount': order.total_amount || 0,
                    'Currency': order.currency || 'MYR',
                    'Product Name': 'No products',
                    'Product SKU': 'N/A',
                    'Quantity': 0,
                    'Unit Price': 0,
                    'Item Total Price': 0,
                    'Total Items in Order': 0,
                    'Order Date': order.created_at ? formatDateToYYYYMMDD(order.created_at) : 'N/A',
                    'Updated Date': order.updated_at ? formatDateToYYYYMMDD(order.updated_at) : 'N/A'
                });
            } else {
                // Create one row for each product in the order
                orderItems.forEach(item => {
                    const unitPrice = item.total_price && item.quantity ? item.total_price / item.quantity : 0;
                    
                    formattedData.push({
                        'Order Number': order.order_number || 'N/A',
                        'Customer Email': order.customer_medusa?.email || 'N/A',
                        'Customer Name': `${order.customer_medusa?.first_name || ''} ${order.customer_medusa?.last_name || ''}`.trim() || 'N/A',
                        'Staff Name': order.user?.name || order.users?.name || 'N/A',
                        'Staff Email': order.user?.email || order.users?.email || 'N/A',
                        'Staff Role': order.user?.role || order.users?.role || 'N/A',
                        'Order Total Amount': order.total_amount || 0,
                        'Currency': order.currency || 'MYR',
                        'Product Name': item.product?.name || 'N/A',
                        'Product SKU': item.variant?.sku_name || 'N/A',
                        'Quantity': item.quantity || 0,
                        'Unit Price': unitPrice,
                        'Item Total Price': item.total_price || 0,
                        'Total Items in Order': orderItems.length,
                        'Order Date': order.created_at ? formatDateToYYYYMMDD(order.created_at) : 'N/A',
                        'Updated Date': order.updated_at ? formatDateToYYYYMMDD(order.updated_at) : 'N/A'
                    });
                });
            }
        });

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        
        // Set column widths
        const wscols = [
            { wch: 15 }, // Order Number
            { wch: 25 }, // Customer Email
            { wch: 20 }, // Customer Name
            { wch: 20 }, // Staff Name
            { wch: 25 }, // Staff Email
            { wch: 12 }, // Staff Role
            { wch: 15 }, // Order Total Amount
            { wch: 8 },  // Currency
            { wch: 30 }, // Product Name
            { wch: 20 }, // Product SKU
            { wch: 10 }, // Quantity
            { wch: 12 }, // Unit Price
            { wch: 15 }, // Item Total Price
            { wch: 12 }, // Total Items in Order
            { wch: 12 }, // Order Date
            { wch: 12 }  // Updated Date
        ];
        worksheet['!cols'] = wscols;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Orders_Detailed");
        
        // Generate filename with current date
        const now = new Date();
        const filename = `orders_detailed_export_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.xlsx`;
        
        XLSX.writeFile(workbook, filename);
    }

    return (
        <div className="w-full">
            <div className="flex items-center py-4">
                <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="mr-2"
                >
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                    {Object.keys(appliedFilters).length > 0 && (
                        <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            {Object.keys(appliedFilters).length}
                        </span>
                    )}
                </Button>
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
                                        onCheckedChange={(value: boolean) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                )
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-2">
                            Export <Download className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                                         <DropdownMenuContent align="end">
                         <DropdownMenuItem onClick={exportToExcel}>
                             Export Detailed Data
                         </DropdownMenuItem>
                     </DropdownMenuContent>
                </DropdownMenu>
            </div>
            
            {showFilters && (
                <div className="bg-muted/30 p-4 rounded-lg mb-4 border">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Sort Order</label>
                            <Select
                                value={filterForm.is_desc === undefined ? 'any' : filterForm.is_desc ? 'desc' : 'asc'}
                                onValueChange={(value) => 
                                    setFilterForm(prev => ({ 
                                        ...prev, 
                                        is_desc: value === 'any' ? undefined : value === 'desc' 
                                    }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select order" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="any">Any</SelectItem>
                                    <SelectItem value="asc">Ascending</SelectItem>
                                    <SelectItem value="desc">Descending</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Date</label>
                            <Input
                                type="date"
                                value={filterForm.date || ''}
                                onChange={(e) => setFilterForm(prev => ({ ...prev, date: e.target.value }))}
                                placeholder="YYYY-MM-DD"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Customer Email</label>
                            <Select
                                value={filterForm.customer_email ? filterForm.customer_email : 'all'}
                                onValueChange={(value) => 
                                    setFilterForm(prev => ({ ...prev, customer_email: value === 'all' ? '' : value }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select customer email" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Customers</SelectItem>
                                    {customerEmails.map((email) => (
                                        <SelectItem key={email} value={email || ''}>
                                            {email}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Staff Email</label>
                            <Select
                                value={filterForm.staff_email ? filterForm.staff_email : 'all'}
                                onValueChange={(value) => 
                                    setFilterForm(prev => ({ ...prev, staff_email: value === 'all' ? '' : value }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select staff email" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Staff</SelectItem>
                                    {staffEmails.map((email) => (
                                        <SelectItem key={email} value={email || ''}>
                                            {email}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Country Code</label>
                            <Input
                                value={filterForm.country_code || ''}
                                onChange={(e) => setFilterForm(prev => ({ ...prev, country_code: e.target.value }))}
                                placeholder="MY, SG, etc."
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Product Name</label>
                            <Select
                                value={filterForm.product_name ? filterForm.product_name : 'all'}
                                onValueChange={(value) => 
                                    setFilterForm(prev => ({ ...prev, product_name: value === 'all' ? '' : value }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select product name" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Products</SelectItem>
                                    {productNames.map((name) => (
                                        <SelectItem key={name} value={name || ''}>
                                            {name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Variant SKU Number</label>
                            <Input
                                value={filterForm.variant_sku_number || ''}
                                onChange={(e) => setFilterForm(prev => ({ ...prev, variant_sku_number: e.target.value }))}
                                placeholder="SKU123"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Order Number</label>
                            <Input
                                value={filterForm.order_number || ''}
                                onChange={(e) => setFilterForm(prev => ({ ...prev, order_number: e.target.value }))}
                                placeholder="ORD-250610-0003"
                            />
                        </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                        <Button onClick={handleApplyFilters} variant="default">
                            Apply Filters
                        </Button>
                        <Button onClick={handleClearFilters} variant="outline">
                            Clear Filters
                        </Button>
                    </div>
                </div>
            )}
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
                                    colSpan={columns({ onView: () => { }, onDelete, isUserAdmin }).length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between py-4">
                <div className="text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected on this page.
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Rows per page:</span>
                        <Select
                            value={pageSize.toString()}
                            onValueChange={(value) => {
                                onPageSizeChange(Number(value))
                                onPageChange(1) // Reset to first page when changing page size
                            }}
                        >
                            <SelectTrigger className="w-[70px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage <= 1}
                        >
                            Previous
                        </Button>
                        <span className="text-sm">
                            Page {currentPage} of {totalPages}
                        </span>
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
            </div>
        </div>
    )
}
