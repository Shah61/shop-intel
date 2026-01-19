"use client";

import ProductManagementSystem from "@/src/features/sales/presentation/view/components/sales/product-management-system-screen";
import PhysicalSidebar from "@/src/components/ui/physical-sidebar";

const ProductPage = () => {
    return (
        <PhysicalSidebar>
            <div className="pt-8">
                <ProductManagementSystem />
            </div>
        </PhysicalSidebar>
    );
};

export default ProductPage;