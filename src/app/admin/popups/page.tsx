"use client";
import { useState, useEffect } from 'react';
import { Trash2, Plus, Eye, EyeOff } from 'lucide-react';

interface Popup {
    _id: string;
    image: string;
    text: string;
    location: 'home' | 'cart';
    isActive: boolean;
}

export default function PopupsPage() {
    const [popups, setPopups] = useState<Popup[]>([]);
    const [loading, setLoading] = useState(true);
    const [formVisible, setFormVisible] = useState(false);
    const [formData, setFormData] = useState({ image: '', text: '', location: 'home' });

    const fetchPopups = async () => {
        const res = await fetch('/api/popups?all=true');
        const data = await res.json();
        if (data.success) setPopups(data.data);
        setLoading(false);
    };

    useEffect(() => { fetchPopups(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/popups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        setFormVisible(false);
        setFormData({ image: '', text: '', location: 'home' });
        fetchPopups();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this popup?')) return;
        await fetch(`/api/popups/${id}`, { method: 'DELETE' });
        fetchPopups();
    };

    const toggleActive = async (popup: Popup) => {
        await fetch(`/api/popups/${popup._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: !popup.isActive })
        });
        fetchPopups();
    };

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-yellow-500">Manage Popups</h1>
                <button onClick={() => setFormVisible(true)} className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Create Popup
                </button>
            </div>

            {formVisible && (
                <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 mb-8 max-w-xl">
                    <h3 className="text-xl font-bold mb-4">New Popup</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            placeholder="Image URL"
                            className="w-full bg-zinc-950 p-3 rounded"
                            value={formData.image}
                            onChange={e => setFormData({ ...formData, image: e.target.value })}
                            required
                        />
                        <input
                            placeholder="Text (Optional)"
                            className="w-full bg-zinc-950 p-3 rounded"
                            value={formData.text}
                            onChange={e => setFormData({ ...formData, text: e.target.value })}
                        />
                        <select
                            className="w-full bg-zinc-950 p-3 rounded"
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value as 'home' | 'cart' })}
                        >
                            <option value="home">Home Page</option>
                            <option value="cart">Cart Page</option>
                        </select>
                        <div className="flex gap-4">
                            <button type="button" onClick={() => setFormVisible(false)} className="px-4 py-2 text-zinc-400">Cancel</button>
                            <button type="submit" className="px-6 py-2 bg-yellow-500 text-black font-bold rounded">Create</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {popups.map(popup => (
                    <div key={popup._id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden relative">
                        <div className="h-40 bg-zinc-800 relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={popup.image} alt="Popup" className="w-full h-full object-cover" />
                            <div className="absolute top-2 right-2 flex gap-2">
                                <button onClick={() => toggleActive(popup)} className="p-1 bg-black/50 rounded-full text-white hover:bg-white/20">
                                    {popup.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-zinc-500" />}
                                </button>
                                <button onClick={() => handleDelete(popup._id)} className="p-1 bg-red-500/50 rounded-full text-white hover:bg-red-600">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="uppercase text-xs font-bold text-zinc-500 tracking-wider">{popup.location}</span>
                                <span className={`text-xs px-2 py-1 rounded ${popup.isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                    {popup.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <p className="text-sm truncate">{popup.text || 'No text'}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
