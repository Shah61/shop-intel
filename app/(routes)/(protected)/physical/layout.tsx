"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Package, Tag, ShoppingBag, Layers, Percent, Users, Store } from "lucide-react";
import { PageHeader } from "@/src/core/shared/view/components/page-section";

const tabs = [
    { id: "analytics", label: "Analytics", path: "/physical", icon: LayoutDashboard },
    { id: "product", label: "Product", path: "/physical/product", icon: Package },
    { id: "categories", label: "Categories", path: "/physical/categories", icon: Tag },
    { id: "orders", label: "Orders", path: "/physical/orders", icon: ShoppingBag },
    { id: "collection", label: "Collection", path: "/physical/collection", icon: Layers },
    { id: "discount", label: "Discount", path: "/physical/discount", icon: Percent },
    { id: "staff", label: "Staff", path: "/physical/staff", icon: Users },
    { id: "sku", label: "SKU", path: "/physical/sku", icon: Store },
];

export default function PhysicalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const getActiveId = () => {
        if (pathname === "/physical") return "analytics";
        if (pathname === "/physical/product" || pathname?.startsWith("/sales/products/")) return "product";
        if (pathname === "/physical/categories") return "categories";
        if (pathname === "/physical/orders") return "orders";
        if (pathname === "/physical/collection") return "collection";
        if (pathname === "/physical/discount") return "discount";
        if (pathname === "/physical/staff") return "staff";
        if (pathname === "/physical/sku") return "sku";
        return "analytics";
    };

    const activeId = getActiveId();

    return (
        <div className="space-y-6">
            <PageHeader
                title="Physical Store"
                description="Manage products, orders, staff, and in-store analytics."
            />
            <div className="rounded-2xl border border-border bg-white dark:bg-card p-1.5 shadow-sm">
                <div className="flex items-center gap-1 overflow-x-auto">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const active = activeId === tab.id;
                        return (
                            <Link
                                key={tab.id}
                                href={tab.path}
                                className={`
                                    flex items-center gap-2 px-5 py-2.5 text-sm font-medium whitespace-nowrap rounded-xl
                                    transition-all duration-200
                                    ${active
                                        ? "bg-foreground text-background shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                                    }
                                `}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
            <div>{children}</div>
        </div>
    );
}
