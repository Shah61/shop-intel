"use client";

import AffiliateSidebar from "@/src/components/ui/affiliate-sidebar";
import CommissionsScreen from "@/src/features/affiliates/presentation/view/screen/commissions-screen";

const CommissionsPage = () => {
    return (
        <AffiliateSidebar>
            <CommissionsScreen />
        </AffiliateSidebar>
    );
};

export default CommissionsPage; 