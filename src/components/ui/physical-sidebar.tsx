"use client"

import { LayoutDashboard, Package, ShoppingBag, Users, Store, Wallet, ArchiveRestore, Layers, Percent, Tag } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

interface PhysicalSidebarProps {
    children: React.ReactNode;
}

const PhysicalSidebar = ({ children }: PhysicalSidebarProps) => {
    const router = useRouter();
    const pathname = usePathname();

    const sidebarItems = [
        {
            id: "analytics",
            label: "Analytics",
            icon: <LayoutDashboard className="h-5 w-5" />,
            path: "/physical"
        },
        {
            id: "product",
            label: "Product",
            icon: <Package className="h-5 w-5" />,
            path: "/physical/product"
        },
        {
            id: "categories",
            label: "Categories",
            icon: <Tag className="h-5 w-5" />,
            path: "/physical/categories"
        },
        {
            id: "orders",
            label: "Orders",
            icon: <ShoppingBag className="h-5 w-5" />,
            path: "/physical/orders"
        },
        {
            id: "collection",
            label: "Collection",
            icon: <Layers className="h-5 w-5" />,
            path: "/physical/collection"
        },
        {
            id: "discount",
            label: "Discount",
            icon: <Percent className="h-5 w-5" />,
            path: "/physical/discount"
        },
        {
            id: "staff",
            label: "Staff",
            icon: <Users className="h-5 w-5" />,
            path: "/physical/staff"
        },
        {
            id: "sku",
            label: "SKU",
            icon: <Store className="h-5 w-5" />,
            path: "/physical/sku"
        }
    ];

    const getActiveTab = () => {
        if (pathname === "/physical") return "analytics";
        if (pathname === "/physical/product" || pathname.startsWith("/sales/products/")) return "product";
        if (pathname === "/physical/categories") return "categories";
        if (pathname === "/physical/orders") return "orders";
        if (pathname === "/physical/collection") return "collection";
        if (pathname === "/physical/discount") return "discount";
        if (pathname === "/physical/staff") return "staff";
        if (pathname === "/physical/sku") return "sku";
        return "analytics";
    };

    const activeTab = getActiveTab();

    return (
        <div className="flex flex-col md:flex-row w-full">
            {/* Mobile Tab Bar */}
            <div className="md:hidden w-full border-b bg-background overflow-x-auto">
                <div className="flex space-x-1 p-2">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => router.push(item.path)}
                            className={`flex items-center gap-1 px-2 sm:px-3 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                                activeTab === item.id
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-accent hover:text-accent-foreground"
                            }`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden md:block w-20 lg:w-24 bg-background border-r min-h-full pt-8 p-0 -ml-4 md:-ml-10 mr-2 sidebar-fixed-width">
                <nav className="space-y-6 lg:space-y-8 flex flex-col items-center px-0 m-0 w-full">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => router.push(item.path)}
                            className={`flex flex-col items-center justify-center rounded-lg transition-colors m-0 p-2 w-14 h-14 lg:w-16 lg:h-16 ${
                                activeTab === item.id
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-accent hover:text-accent-foreground"
                            }`}
                            style={{paddingLeft: 8, marginLeft: 0}}
                            title={item.label}
                        >
                            {item.icon}
                            <span className="text-[10px] lg:text-xs mt-1 font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
            {/* Main Content */}
            <div className="flex-1">
                {children}
            </div>
        </div>
    );
};

export default PhysicalSidebar; 