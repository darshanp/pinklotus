'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your email...');
    const effectRan = useRef(false);

    useEffect(() => {
        if (effectRan.current) return;

        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link. Token is missing.');
            return;
        }

        const verify = async () => {
            effectRan.current = true;
            try {
                await api.post(`/auth/verify-email?token=${token}`);
                setStatus('success');
                setMessage('Your email has been successfully verified!');
            } catch (error: any) {
                setStatus('error');
                setMessage(error.response?.data?.detail || 'Verification failed. The link may be expired.');
            }
        };

        verify();
    }, [token]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm text-center">
                {status === 'loading' && (
                    <div className="flex flex-col items-center space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <h2 className="text-xl font-semibold text-gray-900">Verifying Email</h2>
                        <p className="text-gray-500">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center space-y-4">
                        <CheckCircle className="h-12 w-12 text-green-500" />
                        <h2 className="text-xl font-semibold text-gray-900">Verified!</h2>
                        <p className="text-gray-500">{message}</p>
                        <Button asChild className="mt-4 w-full">
                            <Link href="/login">Continue to Login</Link>
                        </Button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center space-y-4">
                        <XCircle className="h-12 w-12 text-red-500" />
                        <h2 className="text-xl font-semibold text-gray-900">Verification Failed</h2>
                        <p className="text-gray-500">{message}</p>
                        <Button asChild variant="outline" className="mt-4 w-full">
                            <Link href="/login">Back to Login</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
