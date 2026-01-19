"use client";

import DiscountScreen from "@/src/features/sales/presentation/view/components/sales/discount-screen";
import PhysicalSidebar from "@/src/components/ui/physical-sidebar";

const DiscountPage = () => {
    return (
        <PhysicalSidebar>
            <div className="pt-8">
                <DiscountScreen />
            </div>
        </PhysicalSidebar>
    );
};

export default DiscountPage;
