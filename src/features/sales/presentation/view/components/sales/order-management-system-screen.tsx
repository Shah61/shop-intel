"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useOrdersQuery, useCreateOrderMutation, useDeleteOrderMutation } from "../../../tanstack/physical/orders-tanstack"
import { OrderDataTable } from "../physical/order-data-table"
import AddOrderDialog from "../physical/add-order-dialog"
import { OrderEntity, OrderFilterParams } from "@/src/features/sales/data/model/physical/orders-entity"
import DefaultDeleteDialog from "@/src/core/shared/view/components/default-delete-dialog"
import toast from "react-hot-toast"
import ConfirmOrderDialog from "../physical/confirm-order-dialog"
import AddCustomerDialog from "../physical/add-customer-dialog"
import { CustomerEntity } from "@/src/features/sales/data/model/physical/customer-entity"
import { useCreateCustomer } from "../../../tanstack/physical/customer-tanstack"
const OrderManagementSystemScreen = () => {
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null)
  const [ordersToDelete, setOrdersToDelete] = useState<string[]>([])
  const [isConfirmOrderOpen, setIsConfirmOrderOpen] = useState(false)
  const [pendingOrderData, setPendingOrderData] = useState<OrderEntity | null>(null)
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [appliedFilters, setAppliedFilters] = useState<OrderFilterParams>({ is_desc: true }) // Default to descending order

  const { data: ordersResponse, isLoading, isError } = useOrdersQuery({
    ...appliedFilters,
    page: currentPage,
    limit: pageSize
  })
  const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrderMutation()
  const { mutate: deleteOrder, isPending: isDeletingOrder } = useDeleteOrderMutation()

  const orders = ordersResponse?.orders || []
  const metadata = ordersResponse?.metadata

  const handleApplyFilters = (filters: OrderFilterParams) => {
    setAppliedFilters(filters)
    setCurrentPage(1) // Reset to first page when applying filters
  }

  const handleAddOrder = (orderData: any) => {
    setPendingOrderData(orderData)
    setIsAddOrderOpen(false)
    // setIsConfirmOrderOpen(true)
    if (orderData) {
      createOrder(orderData, {
        onSuccess: () => {
          setIsConfirmOrderOpen(false)
          setPendingOrderData(null)
        }
      })
    }

  }

  const handleDeleteOrder = (id: string) => {
    setOrderToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (orderToDelete) {
      deleteOrder(orderToDelete)
      setIsDeleteDialogOpen(false)
      setOrderToDelete(null)
    }
  }

  const handleDeleteAllOrders = (selectedOrders: OrderEntity[]) => {
    setOrdersToDelete(selectedOrders.map(order => order.id ?? ""))
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDeleteAllOrders = () => {
    for (const id of ordersToDelete) {
      if (id) {
        deleteOrder(id)
      }
    }
    setIsDeleteDialogOpen(false)
    setOrdersToDelete([])
  }

  const handleConfirmDialogClose = () => {
    setIsConfirmOrderOpen(false)
    setPendingOrderData(null)
    setIsAddOrderOpen(true)
  }

  // const handleConfirmOrder = () => {
  //   if (pendingOrderData) {
  //     createOrder(pendingOrderData, {
  //       onSuccess: () => {
  //         setIsConfirmOrderOpen(false)
  //         setPendingOrderData(null)
  //       }
  //     })
  //   }
  // }



  return (
    <div className="flex flex-col gap-4 items-start justify-center w-full">
      <div className="flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center w-full">
        <div>
          <h2 className="text-2xl font-bold">Order Management System</h2>
          <p className="text-muted-foreground">Manage your orders and monitor order performance</p>
        </div>

        <Button variant="default" onClick={() => setIsAddOrderOpen(true)}>Add New Order</Button>
        <AddOrderDialog
          isLoading={isCreatingOrder}
          isOpen={isAddOrderOpen}
          onClose={() => setIsAddOrderOpen(false)}
          onSubmit={handleAddOrder}
          onAddCustomer={() => {
            setIsAddOrderOpen(false)
            setIsAddCustomerOpen(true)
          }}
        />
        <AddCustomerDialog
          isOpen={isAddCustomerOpen}
          onClose={() => setIsAddCustomerOpen(false)}
        />
      </div>

      <OrderDataTable
        data={orders}
        onDeleteAll={handleDeleteAllOrders}
        onDelete={handleDeleteOrder}
        currentPage={currentPage}
        pageSize={pageSize}
        totalPages={metadata?.total_pages || 0}
        totalItems={metadata?.total || 0}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        onApplyFilters={handleApplyFilters}
        appliedFilters={appliedFilters}
      />

      <DefaultDeleteDialog
        isOpen={isDeleteDialogOpen && orderToDelete !== null}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Order"
        description="Are you sure you want to delete this order? This action cannot be undone."
        itemName="Order"
      />

      <DefaultDeleteDialog
        isOpen={isDeleteDialogOpen && ordersToDelete.length > 0}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDeleteAllOrders}
        title="Delete Orders"
        description="Are you sure you want to delete these orders? This action cannot be undone."
        itemName="Orders"
      />
      {/* 
      <ConfirmOrderDialog
        open={isConfirmOrderOpen}
        onOpenChange={handleConfirmDialogClose}
        onConfirm={handleConfirmOrder}
        title="Confirm Order"
        description="Are you sure you want to checkout and create this order? This action cannot be undone."
      /> */}
    </div>
  )
}

export default OrderManagementSystemScreen