"use client";

import AffiliateSidebar from "@/src/components/ui/affiliate-sidebar";
import PayoutsScreen from "@/src/features/affiliates/presentation/view/screen/payouts-screen";

const PayoutsPage = () => {
    return (
        <AffiliateSidebar>
            <PayoutsScreen />
        </AffiliateSidebar>
    );
};

export default PayoutsPage; 