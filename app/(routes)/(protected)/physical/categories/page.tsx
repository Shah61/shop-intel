"use client";

import CategoriesScreen from "@/src/features/sales/presentation/view/components/sales/categories-screen";
import PhysicalSidebar from "@/src/components/ui/physical-sidebar";

const CategoriesPage = () => {
    return (
        <PhysicalSidebar>
            <div className="pt-8">
                <CategoriesScreen />
            </div>
        </PhysicalSidebar>
    );
};

export default CategoriesPage;
