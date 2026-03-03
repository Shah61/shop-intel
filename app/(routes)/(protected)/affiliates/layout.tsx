"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Users, CreditCard, TrendingUp } from "lucide-react";
import { PageHeader } from "@/src/core/shared/view/components/page-section";

const tabs = [
    { id: "affiliates", label: "Affiliates", path: "/affiliates", icon: Users },
    { id: "payouts", label: "Payouts", path: "/affiliates/payouts", icon: CreditCard },
    { id: "commissions", label: "Commissions", path: "/affiliates/commissions", icon: TrendingUp },
];

export default function AffiliatesLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const getActiveId = () => {
        if (pathname === "/affiliates") return "affiliates";
        if (pathname === "/affiliates/payouts") return "payouts";
        if (pathname === "/affiliates/commissions") return "commissions";
        return "affiliates";
    };

    const activeId = getActiveId();

    return (
        <div className="space-y-6">
            <PageHeader
                title="Affiliates"
                description="Manage affiliates, payouts, and commissions."
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
