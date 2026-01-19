"use client";

import AffiliateSidebar from "@/src/components/ui/affiliate-sidebar";
import AffiliateListScreen from "@/src/features/affiliates/presentation/view/screen/affiliate-list-screen";

const AffiliatesPage = () => {
    return (
        <AffiliateSidebar>
            <AffiliateListScreen />
        </AffiliateSidebar>
    );
};

export default AffiliatesPage; 