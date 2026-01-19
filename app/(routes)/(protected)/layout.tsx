'use client';

import HeadNav from "@/src/core/shared/view/components/head-nav";
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
        <>
            <HeadNav />
            <div className="mx-2 sm:mx-4 md:mx-6 lg:mx-10">
                {children}
            </div>
        </>
    );
};

export default ProtectedLayout;