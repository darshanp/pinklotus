'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';
import { User } from '@/types/auth';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const logout = () => {
        localStorage.removeItem('access_token');
        setUser(null);
        router.push('/login');
    };

    const refreshUser = async () => {
        try {
            const response = await api.get('/auth/me');
            setUser(response.data);
        } catch (error) {
            console.error('Failed to fetch user', error);
            logout();
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const response = await api.get('/auth/me');
                    setUser(response.data);
                } catch {
                    localStorage.removeItem('access_token');
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    useEffect(() => {
        if (isLoading || !user) {
            return;
        }

        if (!user.is_verified && pathname === '/dashboard') {
            router.replace('/verify-email-pending');
        }
    }, [isLoading, pathname, router, user]);

    const login = (token: string) => {
        localStorage.setItem('access_token', token);
        refreshUser().then(() => {
            router.push('/dashboard');
        });
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
