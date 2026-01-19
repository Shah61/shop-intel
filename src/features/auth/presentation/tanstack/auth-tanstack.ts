import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { LoginDto } from "../../data/model/login-dto";

// Dummy login mutation - accepts any credentials
export const loginMutation = () => {
    const router = useRouter();
    return useMutation({
        mutationFn: async (loginDto: LoginDto) => {
            // Set session immediately in mutation function
            if (typeof window !== 'undefined' && (window as any).__dummySetSession) {
                const dummySession = {
                    user: {
                        name: 'Shop Intel',
                        email: 'ShopIntel@gmail.com',
                    },
                    user_entity: {
                        id: `user-${Date.now()}`,
                        email: 'ShopIntel@gmail.com',
                        role: loginDto.role || 'ADMIN',
                        name: 'Shop Intel',
                    },
                    backend_tokens: {
                        access_token: 'dummy-access-token',
                        refresh_token: 'dummy-refresh-token',
                        expires_in: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                    },
                    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                };
                (window as any).__dummySetSession(dummySession);
            }
            // Dummy login - always succeeds
            return { success: true };
        },
        onSuccess: () => {
            router.push('/sales');
            toast.success('Login successful');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Login failed');
        },
    });
}

// Dummy register mutation
export const registerMutation = (onSuccessCallback?: () => void) => {
    return useMutation({
        mutationFn: async ({
            email,
            password,
            role
        }: {
            email: string;
            password?: string;
            role?: string;
        }) => {
            // Dummy registration - always succeeds
            return { success: true, data: { email, role } };
        },
        onSuccess: (data, variables) => {
            toast.success(`Staff account created successfully for ${variables.email}`);
            onSuccessCallback?.();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Registration failed');
        },
    });
}

// Dummy logout mutation
export const logoutMutation = () => {
    const router = useRouter();
    return useMutation({
        mutationFn: async () => {
            // Clear session
            if (typeof window !== 'undefined' && (window as any).__dummySetSession) {
                (window as any).__dummySetSession(null);
            }
            localStorage.removeItem('dummy-logged-in');
            return { success: true };
        },
        onSuccess: () => {
            toast.success('Logout successful');
            router.push('/sign-in');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Logout failed');
        },
    });
}