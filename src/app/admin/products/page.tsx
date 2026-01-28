"use client";

import { useState, useEffect } from 'react';
import { Trash2, Plus, Edit2, Image as ImageIcon, X } from 'lucide-react';

interface Product {
    _id: string;
    title: string;
    name?: string; // Fallback for legacy data
    variants: Variant[];
    banner?: string;
    createdAt: string;
}

interface Variant {
    variant: string;
    price: number;
    prevPrice?: number;
    image: string;
    isWholesale?: boolean;
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [formVisible, setFormVisible] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form State
    // Form State
    const [title, setTitle] = useState('');
    const [banner, setBanner] = useState('');
    const [description, setDescription] = useState('');
    const [benefits, setBenefits] = useState('');
    const [variants, setVariants] = useState<Variant[]>([
        { variant: '250gm', price: 0, image: '', isWholesale: false }
    ]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            if (data.success) {
                setProducts(data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleImageUpload = async (file: File, index: number) => {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                setVariants(prev => {
                    const newVariants = [...prev];
                    newVariants[index] = { ...newVariants[index], image: data.url };
                    return newVariants;
                });
            } else {
                alert('Upload failed');
            }
        } catch (e) {
            console.error(e);
            alert('Upload error');
        } finally {
            setUploading(false);
        }
    };

    const handleVariantChange = (index: number, field: keyof Variant, value: any) => {
        setVariants(prev => {
            const newVariants = [...prev];
            newVariants[index] = { ...newVariants[index], [field]: value };
            return newVariants;
        });
    };

    const addVariant = () => {
        setVariants([...variants, { variant: '', price: 0, image: '' }]);
    };

    const removeVariant = (index: number) => {
        const newVariants = [...variants];
        newVariants.splice(index, 1);
        setVariants(newVariants);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Split benefits by comma and trim
            const benefitsArray = benefits.split(',').map(b => b.trim()).filter(b => b !== '');

            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, banner, description, benefits: benefitsArray, variants }),
            });
            const data = await res.json();
            if (data.success) {
                setFormVisible(false);
                setTitle('');
                setBanner('');
                setDescription('');
                setBenefits('');
                setVariants([{ variant: '250gm', price: 0, image: '', isWholesale: false }]);
                fetchProducts();
            } else {
                alert(`Failed to save product: ${data.error}`);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this product?')) return;
        try {
            const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
            // Note: Current api/products might need query param or route change for DELETE
            // Let's assume standard REST, but if route is single file, check implementation.
            // Usually DELETE /api/products/[id] is better. 
            // Temporarily using /api/products?id=... logic if supported, or will fix API.
            fetchProducts();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-yellow-500">Manage Products</h1>
                    <button
                        onClick={() => setFormVisible(true)}
                        className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-yellow-400"
                    >
                        <Plus className="w-5 h-5" /> Add Product
                    </button>
                </div>

                {/* Form Modal */}
                {formVisible && (
                    <div className="fixed inset-0 bg-black/80 z-50 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <div className="bg-zinc-900 p-8 rounded-2xl w-full max-w-3xl border border-zinc-800 my-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold">Add New Product</h2>
                                    <button onClick={() => setFormVisible(false)}><X className="text-zinc-500 hover:text-white" /></button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-1">Product Title</label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full bg-zinc-950 border border-zinc-700 p-3 rounded-lg"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-1">Banner Label (Optional)</label>
                                        <select
                                            value={banner}
                                            onChange={(e) => setBanner(e.target.value)}
                                            className="w-full bg-zinc-950 border border-zinc-700 p-3 rounded-lg"
                                        >
                                            <option value="">None</option>
                                            <option value="SALE">SALE</option>
                                            <option value="NEW">NEW</option>
                                            <option value="BESTSELLER">BESTSELLER</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-1">Product Description</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full bg-zinc-950 border border-zinc-700 p-3 rounded-lg"
                                            placeholder="Our Black Gold Shilajit is..."
                                            rows={3}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-1">Benefits (Comma separated)</label>
                                        <textarea
                                            value={benefits}
                                            onChange={(e) => setBenefits(e.target.value)}
                                            className="w-full bg-zinc-950 border border-zinc-700 p-3 rounded-lg"
                                            placeholder="Boosts Energy, Supports Immunity, ..."
                                            rows={2}
                                        />
                                        <p className="text-xs text-zinc-500 mt-1">Separate benefits with commas.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="block text-sm text-zinc-400">Variants</label>
                                        {variants.map((v, idx) => (
                                            <div key={idx} className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 space-y-4">
                                                <div className="flex justify-between">
                                                    <h4 className="font-bold text-zinc-500">Variant #{idx + 1}</h4>
                                                    <button type="button" onClick={() => removeVariant(idx)} className="text-red-500"><X className="w-4 h-4" /></button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <input
                                                        type="text"
                                                        placeholder="Name (e.g. 250gm)"
                                                        value={v.variant}
                                                        onChange={(e) => handleVariantChange(idx, 'variant', e.target.value)}
                                                        className="bg-zinc-900 border border-zinc-700 p-2 rounded"
                                                        required
                                                    />
                                                    <input
                                                        type="number"
                                                        placeholder="Price"
                                                        value={v.price}
                                                        onChange={(e) => handleVariantChange(idx, 'price', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                                                        className="bg-zinc-900 border border-zinc-700 p-2 rounded"
                                                        required
                                                    />
                                                    <input
                                                        type="number"
                                                        placeholder="Prev Price (Optional)"
                                                        value={v.prevPrice || ''}
                                                        onChange={(e) => handleVariantChange(idx, 'prevPrice', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                                                        className="bg-zinc-900 border border-zinc-700 p-2 rounded"
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={v.isWholesale}
                                                            onChange={(e) => handleVariantChange(idx, 'isWholesale', e.target.checked)}
                                                            id={`wholesale-${idx}`}
                                                        />
                                                        <label htmlFor={`wholesale-${idx}`} className="text-sm">Wholesale?</label>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-zinc-500 mb-1">Image URL</label>
                                                    <div className="flex gap-4 items-center">
                                                        {v.image && <img src={v.image} alt="Preview" className="w-16 h-16 object-cover rounded bg-zinc-800" />}
                                                        <input
                                                            type="text"
                                                            placeholder="https://..."
                                                            value={v.image || ''}
                                                            onChange={(e) => handleVariantChange(idx, 'image', e.target.value)}
                                                            className="flex-1 bg-zinc-900 border border-zinc-700 p-2 rounded text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={addVariant}
                                            className="text-sm text-yellow-500 hover:text-white"
                                        >
                                            + Add Another Variant
                                        </button>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-yellow-500 text-black font-bold py-3 rounded-xl hover:bg-yellow-400"
                                    >
                                        Save Product
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <div key={product._id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative group">
                            <button
                                onClick={() => handleDelete(product._id)}
                                className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                            <h3 className="text-xl font-bold mb-2">{product.title || product.name}</h3>
                            {product.banner && (
                                <span className="inline-block bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded mb-4">
                                    {product.banner}
                                </span>
                            )}
                            <div className="space-y-2">
                                {product.variants.map((v, i) => (
                                    <div key={i} className="flex items-center gap-3 bg-zinc-950 p-2 rounded">
                                        <img src={v.image} className="w-10 h-10 rounded object-cover" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{v.variant}</p>
                                            <p className="text-xs text-zinc-400">Rs. {v.price} {v.isWholesale && '(Wholesale)'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
