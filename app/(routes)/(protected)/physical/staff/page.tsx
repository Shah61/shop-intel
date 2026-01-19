"use client";

import StaffScreen from "@/src/features/sales/presentation/view/screen/physical/staff-screen";
import PhysicalSidebar from "@/src/components/ui/physical-sidebar";

const StaffPage = () => {
    return (
        <PhysicalSidebar>
            <div className="pt-8">
                <StaffScreen />
            </div>
        </PhysicalSidebar>
    );
};

export default StaffPage;