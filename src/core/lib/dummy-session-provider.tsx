'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

// Extended Session type with custom fields
interface ExtendedSession {
    user: {
        name?: string | null;
        email?: string | null;
    };
    user_entity?: {
        id: string;
        email: string;
        role: string;
        name: string;
    };
    backend_tokens?: {
        access_token: string;
        refresh_token: string;
        expires_in: string;
    };
    expires?: string;
}

// Dummy session data
const dummySession: ExtendedSession = {
    user: {
        name: 'Shop Intel',
        email: 'ShopIntel@gmail.com',
    },
    user_entity: {
        id: 'demo-user-id',
        email: 'ShopIntel@gmail.com',
        role: 'ADMIN',
        name: 'Shop Intel',
    },
    backend_tokens: {
        access_token: 'dummy-access-token',
        refresh_token: 'dummy-refresh-token',
        expires_in: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

interface SessionContextType {
    data: ExtendedSession | null;
    status: 'loading' | 'authenticated' | 'unauthenticated';
}

const SessionContext = createContext<SessionContextType>({
    data: null,
    status: 'unauthenticated',
});

export function DummySessionProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<ExtendedSession | null>(null);
    const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

    useEffect(() => {
        // Check if user is "logged in" (stored in localStorage)
        if (typeof window !== 'undefined') {
            const isLoggedIn = localStorage.getItem('dummy-logged-in') === 'true';
            if (isLoggedIn) {
                setSession(dummySession);
                setStatus('authenticated');
            } else {
                setSession(null);
                setStatus('unauthenticated');
            }
        } else {
            setSession(null);
            setStatus('unauthenticated');
        }
    }, []);

    // Expose a method to set session (for login)
    const setSessionData = (sessionData: ExtendedSession | null) => {
        setSession(sessionData);
        setStatus(sessionData ? 'authenticated' : 'unauthenticated');
        if (typeof window !== 'undefined') {
            if (sessionData) {
                localStorage.setItem('dummy-logged-in', 'true');
            } else {
                localStorage.removeItem('dummy-logged-in');
            }
        }
    };

    // Make setSession available globally (only on client side)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            (window as any).__dummySetSession = setSessionData;
        }
    }, []);

    return (
        <SessionContext.Provider value={{ data: session, status }}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    return useContext(SessionContext);
}

