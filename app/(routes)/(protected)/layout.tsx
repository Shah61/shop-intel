'use client';

import { AppSidebar } from "@/src/core/shared/view/components/app-sidebar";
import { useSession } from "@/src/core/lib/dummy-session-provider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
    const { status } = useSession();
    const router = useRouter();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/sign-in');
        }
    }, [status, router]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-foreground/30 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2.5 h-2.5 rounded-full bg-foreground/30 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2.5 h-2.5 rounded-full bg-foreground/30 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return null;
    }

    return (
        <div className="min-h-screen">
            {/* Desktop sidebar */}
            <div className="hidden lg:block">
                <AppSidebar
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                />
            </div>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-30 transition-opacity"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile sidebar */}
            <div
                className={`lg:hidden fixed left-0 top-0 bottom-0 z-40 transition-transform duration-300 ease-in-out ${
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <AppSidebar
                    collapsed={false}
                    onToggle={() => setMobileOpen(false)}
                />
            </div>

            {/* Main content wrapper */}
            <div
                className={`transition-[margin] duration-300 ease-in-out ${
                    sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'
                }`}
            >
                {/* Top bar */}
                <header className="sticky top-0 z-20 h-14 bg-white/80 dark:bg-[hsl(222,47%,8%)]/80 backdrop-blur-xl border-b border-[hsl(var(--border))] flex items-center gap-4 px-4 lg:px-8">
                    <button
                        className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-[hsl(var(--accent))] transition-colors"
                        onClick={() => setMobileOpen(true)}
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="flex-1" />
                </header>

                {/* Page content */}
                <main className="p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default ProtectedLayout;
