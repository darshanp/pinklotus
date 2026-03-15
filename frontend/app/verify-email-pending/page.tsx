'use client';

import { useState } from 'react';
import { AxiosError } from 'axios';
import Link from 'next/link';
import { Mail, Loader2 } from 'lucide-react';

import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

export default function VerifyEmailPendingPage() {
    const { user, logout } = useAuth();
    const [isSending, setIsSending] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleResend = async () => {
        setIsSending(true);
        setMessage(null);
        setError(null);

        try {
            const response = await api.post('/auth/resend-verification');
            setMessage(response.data.message);
        } catch (err) {
            const message =
                err instanceof AxiosError
                    ? err.response?.data?.detail
                    : null;
            setError(message || 'Failed to send verification email.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-lg rounded-xl bg-white p-8 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="rounded-full bg-amber-100 p-3 text-amber-600">
                        <Mail className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Verify your email</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Your account is active, but protected areas stay locked until you confirm your inbox.
                        </p>
                    </div>
                </div>

                <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    Signed in as <span className="font-semibold">{user?.email ?? 'your account'}</span>.
                    Open the verification link we emailed you to continue.
                </div>

                {message && (
                    <div className="mt-4 rounded-md bg-green-50 p-4 text-sm text-green-700">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Button onClick={handleResend} disabled={isSending} className="flex-1">
                        {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Resend verification email
                    </Button>
                    <Button asChild variant="outline" className="flex-1">
                        <Link href="/dashboard">Check again</Link>
                    </Button>
                </div>

                <div className="mt-6 text-sm text-gray-600">
                    Used the wrong account?{' '}
                    <button
                        type="button"
                        onClick={logout}
                        className="font-medium text-primary hover:text-primary/90"
                    >
                        Sign out
                    </button>
                </div>
            </div>
        </div>
    );
}
