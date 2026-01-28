"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SetupAdminPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                alert('Admin created! Redirecting to login...');
                router.push('/admin/login');
            } else {
                alert(data.error || 'Failed to create admin');
            }
        } catch (err) {
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <div className="bg-zinc-900 p-8 rounded-2xl w-full max-w-md border border-zinc-800">
                <h1 className="text-2xl font-bold mb-6 text-yellow-500">Setup Admin</h1>
                <p className="text-zinc-400 mb-6 text-sm">Use this to create the first admin user in your production database.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-zinc-400 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-700 p-3 rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-zinc-400 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-700 p-3 rounded-lg"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-yellow-500 text-black font-bold py-3 rounded-xl hover:bg-yellow-400 disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Admin'}
                    </button>
                </form>
            </div>
        </div>
    );
}
