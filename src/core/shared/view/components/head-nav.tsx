"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import AuthButton from "./auth-button";
import { ThemeToggle } from "@/src/core/theme/theme-toggle";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const NavBar = () => {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const tabs = [
        { name: "Sales", path: "/sales" },
        { name: "Intelligence", path: "/intelligence" },
        { name: "Marketing", path: "/marketing" },
        { name: "Inventory", path: "/inventory" },
        { name: "Physical", path: "/physical" },
        { name: "Affiliates", path: "/affiliates" },
        { name: "User Activity", path: "/user-activity" },
    ];

    const isActiveTab = (tabPath: string) => {
        if (tabPath === "/physical") {
            return pathname.startsWith("/physical");
        }
        if (tabPath === "/affiliates") {
            return pathname.startsWith("/affiliates");
        }
        if (tabPath === "/user-activity") {
            return pathname.startsWith("/user-activity");
        }
        return pathname === tabPath;
    };

    return (
        <nav className="w-full">
            <div className="flex h-14 md:h-16 items-center px-2 sm:px-4 border-b relative">
                {/* Mobile Menu Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden mr-2"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? (
                        <X className="h-5 w-5" />
                    ) : (
                        <Menu className="h-5 w-5" />
                    )}
                </Button>

                {/* Desktop Navigation */}
                <div className="hidden md:flex flex-1 items-center space-x-2 lg:space-x-4 overflow-x-auto">
                    {tabs.map((tab) => (
                        <Link   
                            key={tab.path}
                            href={tab.path}
                            className={`relative px-2 lg:px-3 py-2 text-xs lg:text-sm font-medium transition-colors hover:text-primary whitespace-nowrap
                            ${isActiveTab(tab.path)
                                ? "text-primary"
                                : "text-gray-600"
                            }`}
                        >
                            {tab.name}
                            {isActiveTab(tab.path) && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary transform translate-y-1" />
                            )}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-1 sm:gap-2 ml-auto">
                    <ThemeToggle />
                    <AuthButton />
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-b bg-background">
                    <div className="flex flex-col space-y-1 p-2">
                        {tabs.map((tab) => (
                            <Link   
                                key={tab.path}
                                href={tab.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`relative px-3 py-2 text-sm font-medium transition-colors rounded-md
                                ${isActiveTab(tab.path)
                                    ? "text-primary bg-primary/10"
                                    : "text-gray-600 hover:bg-accent"
                                }`}
                            >
                                {tab.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default NavBar;