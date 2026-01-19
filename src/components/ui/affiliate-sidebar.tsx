"use client"

import { Users, CreditCard, TrendingUp } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

interface AffiliateSidebarProps {
    children: React.ReactNode;
}

const AffiliateSidebar = ({ children }: AffiliateSidebarProps) => {
    const router = useRouter();
    const pathname = usePathname();

    const sidebarItems = [
        {
            id: "affiliates",
            label: "Affiliates",
            icon: <Users className="h-5 w-5" />,
            path: "/affiliates"
        },
        {
            id: "payouts",
            label: "Payouts",
            icon: <CreditCard className="h-5 w-5" />,
            path: "/affiliates/payouts"
        },
        {
            id: "commissions",
            label: "Commissions",
            icon: <TrendingUp className="h-5 w-5" />,
            path: "/affiliates/commissions"
        }
    ];

    const getActiveTab = () => {
        if (pathname === "/affiliates") return "affiliates";
        if (pathname === "/affiliates/payouts") return "payouts";
        if (pathname === "/affiliates/commissions") return "commissions";
        return "affiliates";
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
                            className={`flex items-center gap-1 px-3 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
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

export default AffiliateSidebar; 