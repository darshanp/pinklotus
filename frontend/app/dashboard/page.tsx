'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-primary">Blossom Retreat</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-700">
                                Welcome, {user.first_name || user.email}
                            </span>
                            <Button variant="outline" size="sm" onClick={logout}>
                                Sign out
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="rounded-lg border-4 border-dashed border-gray-200 p-10 text-center">
                        <h2 className="text-2xl font-bold text-gray-700">Dashboard Placeholder</h2>
                        <p className="mt-2 text-gray-500">
                            {user.is_verified
                                ? "Your account is verified! You can sort of access things now."
                                : "Your email is NOT verified yet. Please check your inbox."}
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
