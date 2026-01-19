"use client"

import { DummySessionProvider } from "@/src/core/lib/dummy-session-provider";
import { ReactNode } from "react";

interface ProviderProps {
    children: ReactNode;
}

export default function AuthProvider({ children }: ProviderProps) {
    return (
        <DummySessionProvider>
            {children}
        </DummySessionProvider>
    )
}