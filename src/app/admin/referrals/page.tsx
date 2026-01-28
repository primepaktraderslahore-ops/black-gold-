"use client";

import { useState, useEffect } from 'react';
import { Ticket, Plus, Trash2 } from 'lucide-react';

interface ReferralCode {
    _id: string;
    code: string;
    discountPercentage: number;
    usedCount: number;
    isActive: boolean;
}

export default function ReferralsPage() {
    const [codes, setCodes] = useState<ReferralCode[]>([]);
    const [loading, setLoading] = useState(true);

    const [newCode, setNewCode] = useState('');
    const [discount, setDiscount] = useState(10);

    const fetchCodes = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/referrals');
            const data = await res.json();
            if (data.success) setCodes(data.codes);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCodes();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/referrals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: newCode.toUpperCase(),
                    discountPercentage: discount
                }),
            });
            const data = await res.json();
            if (data.success) {
                setNewCode('');
                setDiscount(10);
                fetchCodes();
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this code?')) return;
        try {
            const res = await fetch(`/api/admin/referrals/${id}`, { method: 'DELETE' });
            if (res.ok) fetchCodes();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="p-6 bg-black min-h-screen text-white">
            <h1 className="text-3xl font-bold text-yellow-500 mb-8">Manage Referral Codes</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Create Form */}
                <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 h-fit">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-yellow-500" />
                        Create New Code
                    </h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Code Name</label>
                            <input
                                type="text"
                                value={newCode}
                                onChange={(e) => setNewCode(e.target.value)}
                                className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-3 uppercase focus:ring-yellow-500"
                                placeholder="SUMMER2026"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Discount Percentage (%)</label>
                            <input
                                type="number"
                                value={discount}
                                onChange={(e) => setDiscount(Number(e.target.value))}
                                className="w-full bg-zinc-800 border-zinc-700 rounded-lg p-3 focus:ring-yellow-500"
                                min="1"
                                max="100"
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-lg transition">
                            Create Code
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Ticket className="w-5 h-5 text-yellow-500" />
                        Active Codes
                    </h2>
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-zinc-500">Loading...</div>
                        ) : codes.length === 0 ? (
                            <div className="text-zinc-500">No codes found.</div>
                        ) : (
                            codes.map(code => (
                                <div key={code._id} className="flex items-center justify-between p-4 bg-zinc-800 rounded-xl border border-zinc-700/50">
                                    <div>
                                        <div className="font-bold text-white text-lg tracking-wider">{code.code}</div>
                                        <div className="text-sm text-zinc-400">{code.discountPercentage}% Off • Used: {code.usedCount}</div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(code._id)}
                                        className="p-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
