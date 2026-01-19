'use client';

import { DummySessionProvider } from "@/src/core/lib/dummy-session-provider";

export function NextAuthProvider({ children }: { children: React.ReactNode }) {
    return <DummySessionProvider>{children}</DummySessionProvider>;
} 