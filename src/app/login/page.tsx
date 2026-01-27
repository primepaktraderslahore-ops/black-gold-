"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (data.success) {
                window.location.href = '/admin/dashboard'; // Force refresh to update middleware state
            } else {
                setError('Invalid credentials');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred');
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 w-full max-w-md">
                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center text-yellow-500">
                        <Lock className="w-8 h-8" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-center text-white mb-8">Admin Access</h1>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <input
                            type="email"
                            placeholder="Admin Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-lg transition-colors"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
