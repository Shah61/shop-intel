'use client';

import AppSidebar from "@/src/core/shared/view/components/app-sidebar";
import { useSession } from "@/src/core/lib/dummy-session-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/sign-in');
        }
    }, [status, router]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return null;
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <AppSidebar />
            <main className="main-content flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
                {children}
            </main>
        </div>
    );
};

export default ProtectedLayout;
