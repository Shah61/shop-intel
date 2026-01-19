"use client";

import CollectionScreen from "@/src/features/sales/presentation/view/components/sales/collection-screen";
import PhysicalSidebar from "@/src/components/ui/physical-sidebar";

const CollectionPage = () => {
    return (
        <PhysicalSidebar>
            <div className="pt-8">
                <CollectionScreen />
            </div>
        </PhysicalSidebar>
    );
};

export default CollectionPage;