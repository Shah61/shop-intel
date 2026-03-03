"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BarChart3,
    Brain,
    Megaphone,
    Package,
    Store,
    Users,
    Activity,
    Search,
    PanelLeftClose,
    PanelLeft,
    Moon,
    Sun,
    LogOut,
    ChevronDown,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useSession } from "@/src/core/lib/dummy-session-provider";
import { logoutMutation } from "@/src/features/auth/presentation/tanstack/auth-tanstack";
import { useState } from "react";

interface NavItem {
    label: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

const navSections: NavSection[] = [
    {
        title: "MAIN MENU",
        items: [
            { label: "Dashboard", path: "/sales", icon: BarChart3 },
            { label: "Intelligence", path: "/intelligence", icon: Brain },
            { label: "Marketing", path: "/marketing", icon: Megaphone },
            { label: "Inventory", path: "/inventory", icon: Package },
        ],
    },
    {
        title: "STORES",
        items: [
            { label: "Physical", path: "/physical", icon: Store },
            { label: "Affiliates", path: "/affiliates", icon: Users },
            { label: "User Activity", path: "/user-activity", icon: Activity },
        ],
    },
];

interface AppSidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const { data: session } = useSession();
    const { mutate: logout } = logoutMutation();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const isActive = (path: string) => {
        if (path === "/sales")
            return pathname === "/sales" || pathname.startsWith("/sales/");
        return pathname.startsWith(path);
    };

    const cycleTheme = () => {
        if (theme === "light") setTheme("dark");
        else if (theme === "dark") setTheme("system");
        else setTheme("light");
    };

    return (
        <aside
            className={`
                fixed left-0 top-0 bottom-0 z-40
                bg-white dark:bg-[hsl(222,47%,8%)]
                border-r border-[hsl(var(--border))]
                flex flex-col
                transition-all duration-300 ease-in-out
                ${collapsed ? "w-[72px]" : "w-[260px]"}
            `}
        >
            {/* Brand */}
            <div
                className={`flex items-center h-16 border-b border-[hsl(var(--border))] shrink-0 ${collapsed ? "justify-center px-2" : "justify-between px-5"}`}
            >
                {!collapsed && (
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[hsl(var(--foreground))] dark:bg-[hsl(var(--foreground))] flex items-center justify-center shrink-0">
                            <span className="text-white dark:text-[hsl(222,47%,8%)] font-bold text-xs">
                                SI
                            </span>
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">
                                Shop Intel
                            </p>
                            <p className="text-[11px] text-[hsl(var(--muted-foreground))] truncate">
                                Business Hub
                            </p>
                        </div>
                    </div>
                )}
                <button
                    onClick={onToggle}
                    className="p-2 rounded-lg hover:bg-[hsl(var(--accent))] transition-colors shrink-0"
                >
                    {collapsed ? (
                        <PanelLeft className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                    ) : (
                        <PanelLeftClose className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                    )}
                </button>
            </div>

            {/* Search */}
            {!collapsed && (
                <div className="px-4 py-3 shrink-0">
                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))] cursor-pointer hover:bg-[hsl(var(--border))] transition-colors">
                        <Search className="w-4 h-4 shrink-0" />
                        <span className="text-[13px]">Search...</span>
                        <kbd className="ml-auto text-[10px] font-mono border border-[hsl(var(--border))] rounded px-1.5 py-0.5 bg-white dark:bg-[hsl(222,47%,6%)]">
                            ⌘K
                        </kbd>
                    </div>
                </div>
            )}

            {/* Nav Sections */}
            <nav className="flex-1 overflow-y-auto px-3 py-2">
                {navSections.map((section, sIdx) => (
                    <div key={section.title} className={sIdx > 0 ? "mt-6" : ""}>
                        {!collapsed && (
                            <p className="px-3 mb-2 text-[10px] font-semibold tracking-widest text-[hsl(var(--muted-foreground))] uppercase">
                                {section.title}
                            </p>
                        )}
                        {collapsed && sIdx > 0 && (
                            <div className="mx-3 mb-3 border-t border-[hsl(var(--border))]" />
                        )}
                        <div className="space-y-0.5">
                            {section.items.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.path);
                                return (
                                    <Link
                                        key={item.path}
                                        href={item.path}
                                        className={`
                                            flex items-center gap-3 rounded-xl text-[13px] font-medium
                                            transition-all duration-150
                                            ${collapsed ? "justify-center p-3" : "px-3 py-2.5"}
                                            ${
                                                active
                                                    ? "bg-[hsl(var(--foreground))] text-white dark:bg-[hsl(var(--accent))] dark:text-[hsl(var(--foreground))]"
                                                    : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
                                            }
                                        `}
                                        title={collapsed ? item.label : undefined}
                                    >
                                        <Icon className="w-[18px] h-[18px] shrink-0" />
                                        {!collapsed && <span>{item.label}</span>}
                                        {!collapsed && item.badge !== undefined && (
                                            <span className="ml-auto text-[11px] bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))] rounded-full px-2 py-0.5 font-semibold">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Bottom */}
            <div className="border-t border-[hsl(var(--border))] p-3 shrink-0 space-y-0.5">
                {/* Theme toggle */}
                <button
                    onClick={cycleTheme}
                    className={`
                        flex items-center gap-3 w-full rounded-xl text-[13px] font-medium
                        text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]
                        transition-all duration-150
                        ${collapsed ? "justify-center p-3" : "px-3 py-2.5"}
                    `}
                    title={collapsed ? "Toggle theme" : undefined}
                >
                    <Sun className="w-[18px] h-[18px] shrink-0 dark:hidden" />
                    <Moon className="w-[18px] h-[18px] shrink-0 hidden dark:block" />
                    {!collapsed && (
                        <span>
                            {theme === "light"
                                ? "Light"
                                : theme === "dark"
                                  ? "Dark"
                                  : "System"}
                        </span>
                    )}
                </button>

                {/* User */}
                <div className="relative">
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className={`
                            flex items-center gap-3 w-full rounded-xl text-[13px] font-medium
                            hover:bg-[hsl(var(--accent))] transition-all duration-150
                            ${collapsed ? "justify-center p-2" : "px-3 py-2.5"}
                        `}
                    >
                        <img
                            src="/Icon.png"
                            alt="avatar"
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                        {!collapsed && (
                            <>
                                <div className="min-w-0 text-left">
                                    <p className="text-[13px] font-medium truncate">
                                        Shop Intel
                                    </p>
                                    <p className="text-[11px] text-[hsl(var(--muted-foreground))] truncate">
                                        {session?.user_entity?.email ||
                                            "user@shopintel.com"}
                                    </p>
                                </div>
                                <ChevronDown className="w-4 h-4 ml-auto shrink-0 text-[hsl(var(--muted-foreground))]" />
                            </>
                        )}
                    </button>

                    {/* User dropdown */}
                    {showUserMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-50"
                                onClick={() => setShowUserMenu(false)}
                            />
                            <div className="absolute bottom-full left-0 right-0 mb-1 z-50 bg-white dark:bg-[hsl(222,47%,10%)] rounded-xl border border-[hsl(var(--border))] shadow-lg overflow-hidden">
                                <button
                                    onClick={() => {
                                        logout();
                                        setShowUserMenu(false);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </aside>
    );
}
