"use client";

import { useState, useEffect } from 'react';
import { User, Shield, Trash2, Plus } from 'lucide-react';

interface AdminUser {
    _id: string;
    email: string;
    role: string;
    createdAt: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) {
                const data = await res.json();
                if (data.success) setUsers(data.users);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: newEmail, password: newPassword }),
            });
            const data = await res.json();
            if (data.success) {
                setNewEmail('');
                setNewPassword('');
                fetchUsers();
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) fetchUsers();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="p-6 bg-black min-h-screen text-white">
            <h1 className="text-3xl font-bold text-yellow-500 mb-8">Manage Admins</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Create User Form */}
                <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 h-fit">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-yellow-500" />
                        Add New Admin
                    </h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Email</label>
                            <input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-3 text-white focus:ring-yellow-500 focus:border-yellow-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-3 text-white focus:ring-yellow-500 focus:border-yellow-500"
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-lg transition">
                            Create Admin
                        </button>
                    </form>
                </div>

                {/* User List */}
                <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-yellow-500" />
                        Existing Admins
                    </h2>
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-zinc-500">Loading...</div>
                        ) : users.length === 0 ? (
                            <div className="text-zinc-500">No admins found.</div>
                        ) : (
                            users.map(user => (
                                <div key={user._id} className="flex items-center justify-between p-4 bg-zinc-800 rounded-xl">
                                    <div>
                                        <div className="font-bold text-white">{user.email}</div>
                                        <div className="text-xs text-zinc-500 uppercase">{user.role}</div>
                                    </div>
                                    {user.role !== 'super_admin' && (
                                        <button
                                            onClick={() => handleDelete(user._id)}
                                            className="text-red-500 hover:text-red-400 transition"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
