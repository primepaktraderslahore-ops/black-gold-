"use client";
import { useState } from 'react';
import { User, Lock, Mail } from 'lucide-react';

export default function ProfilePage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (formData.password && formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/admin/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email || undefined,
                    password: formData.password || undefined
                })
            });
            const data = await res.json();
            if (data.success) {
                setMessage('Profile updated successfully');
                setFormData({ ...formData, password: '', confirmPassword: '' });
            } else {
                setError(data.error || 'Update failed');
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <h1 className="text-3xl font-bold text-yellow-500 mb-8 flex items-center gap-3">
                <User /> Profile Settings
            </h1>

            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl max-w-xl">
                {message && <div className="bg-green-500/10 text-green-500 p-4 rounded-lg mb-6 border border-green-500/20">{message}</div>}
                {error && <div className="bg-red-500/10 text-red-500 p-4 rounded-lg mb-6 border border-red-500/20">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm text-zinc-400 mb-2 flex items-center gap-2">
                            <Mail className="w-4 h-4" /> Update Email (Optional)
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="New Email"
                            className="w-full bg-zinc-950 border border-zinc-700 p-3 rounded-lg focus:border-yellow-500 outline-none"
                        />
                    </div>

                    <div className="border-t border-zinc-800 my-6 pt-6">
                        <label className="block text-sm text-zinc-400 mb-2 flex items-center gap-2">
                            <Lock className="w-4 h-4" /> Change Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="New Password"
                            className="w-full bg-zinc-950 border border-zinc-700 p-3 rounded-lg mb-4 focus:border-yellow-500 outline-none"
                        />
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm New Password"
                            className="w-full bg-zinc-950 border border-zinc-700 p-3 rounded-lg focus:border-yellow-500 outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-yellow-500 text-black font-bold py-3 rounded-xl hover:bg-yellow-400 disabled:opacity-50"
                    >
                        {loading ? 'Updating...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
}
