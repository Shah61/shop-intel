"use client";

import OrderManagementSystemScreen from "@/src/features/sales/presentation/view/components/sales/order-management-system-screen";
import PhysicalSidebar from "@/src/components/ui/physical-sidebar";

const OrdersPage = () => {
    return (
        <PhysicalSidebar>
            <div className="pt-8">
                <OrderManagementSystemScreen />
            </div>
        </PhysicalSidebar>
    );
};

export default OrdersPage;