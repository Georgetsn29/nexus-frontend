'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function VerifyPage() {
    const { token } = useParams();
    const router = useRouter();
    const [status, setStatus] = useState('Verifying your account...');

    useEffect(() => {
        const verify = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/v1/users/verify/${token}`);
                const data = await res.json();
                
                if (res.ok) {
                    setStatus('Success! Your email is verified. Redirecting...');
                    setTimeout(() => router.push('/auth'), 3000);
                } else {
                    setStatus(data.error || 'Verification failed.');
                }
            } catch (err) {
                setStatus('Something went wrong. Please try again later.');
            }
        };
        if (token) verify();
    }, [token, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
            <div className="bg-zinc-900 p-8 rounded-2xl border border-white/10">
                <h1 className="text-2xl font-bold mb-4">{status}</h1>
            </div>
        </div>
    );
}