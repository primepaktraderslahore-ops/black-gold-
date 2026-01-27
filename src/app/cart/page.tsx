"use client";

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Trash2, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
    const { items, removeItem, total, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [orderId, setOrderId] = useState('');
    // Remove local isWholesale state, we derive it from items or treat it as an order property if needed.
    // However, if the user requested "wholesale option must be in main page", we use the item's flag.
    // We check if ANY item is wholesale to flag the order as wholesale.

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        address2: '',
        cnic: '',
        postalCode: '',
        province: '',
        city: '',
    });

    // ...

    const isOrderWholesale = items.some(i => i.isWholesale);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (items.length === 0) return;

        // Validation
        const phoneRegex = /^\d+$/;
        const cnicRegex = /^\d+$/;

        if (!phoneRegex.test(formData.phone)) {
            alert("Phone number must contain only digits.");
            return;
        }

        if (!cnicRegex.test(formData.cnic)) {
            alert("CNIC must contain only digits.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer: formData,
                    items: items,
                    totalAmount: total,
                    status: 'Accepted',
                    isWholesale: isOrderWholesale
                }),
            });

            const data = await res.json();
            if (data.success) {
                setSuccess(true);
                setOrderId(data.data?._id || 'ID-MISSING');
                clearCart();
            } else {
                alert('Order failed: ' + data.error);
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
                <div className="bg-zinc-900 border border-zinc-700 p-8 rounded-2xl max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Order Confirmed!</h2>
                    <p className="text-zinc-400 mb-6">Thank you for your purchase. We will contact you shortly.</p>
                    <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 mb-8">
                        <p className="text-sm text-zinc-500 mb-1">Order ID</p>
                        <p className="text-lg font-mono text-yellow-500">{orderId}</p>
                    </div>
                    <Link
                        href="/"
                        className="block w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-zinc-200 transition-colors"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white pb-24">
            <div className="container mx-auto px-4 pt-12">
                <h1 className="text-3xl md:text-5xl font-bold mb-12">Shopping Cart</h1>

                {items.length === 0 ? (
                    <div className="text-center py-20 bg-zinc-900/50 rounded-3xl border border-zinc-800">
                        <h2 className="text-2xl text-zinc-400 mb-4">Your cart is empty</h2>
                        <Link href="/" className="text-yellow-500 hover:text-yellow-400 font-semibold text-lg">
                            Browse Products &rarr;
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Order Summary */}
                        <div>
                            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                                <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                                <div className="space-y-4">
                                    {items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center py-4 border-b border-zinc-800 last:border-0">
                                            <div className="flex gap-4 items-center">
                                                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 font-mono text-sm">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                                        {item.variant} Variant
                                                        {item.isWholesale && <span className="text-xs bg-yellow-500 text-black px-1.5 py-0.5 rounded font-bold">WHOLESALE</span>}
                                                    </h3>
                                                    <p className="text-zinc-500">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-lg">Rs. {item.price * item.quantity}</span>
                                                <button
                                                    onClick={() => removeItem(item.variant)}
                                                    className="text-zinc-500 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 pt-6 border-t border-zinc-800 flex justify-between items-center">
                                    <span className="text-xl font-bold text-zinc-400">Total</span>
                                    <span className="text-3xl font-bold text-yellow-500">Rs. {total}</span>
                                </div>
                            </div>
                        </div>

                        {/* Checkout Form */}
                        <div>
                            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                                <h2 className="text-xl font-bold mb-6">Shipping Details</h2>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm text-zinc-400">Full Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                required
                                                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 focus:outline-none focus:border-yellow-500"
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm text-zinc-400">Email</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    required
                                                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 focus:outline-none focus:border-yellow-500"
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm text-zinc-400">Phone No</label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    required
                                                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 focus:outline-none focus:border-yellow-500"
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm text-zinc-400">Address 1</label>
                                            <input
                                                type="text"
                                                name="address"
                                                required
                                                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 focus:outline-none focus:border-yellow-500"
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm text-zinc-400">Address 2 (Optional)</label>
                                            <input
                                                type="text"
                                                name="address2"
                                                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 focus:outline-none focus:border-yellow-500"
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm text-zinc-400">CNIC</label>
                                                <input
                                                    type="text"
                                                    name="cnic"
                                                    required
                                                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 focus:outline-none focus:border-yellow-500"
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm text-zinc-400">Postal Code</label>
                                                <input
                                                    type="text"
                                                    name="postalCode"
                                                    required
                                                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 focus:outline-none focus:border-yellow-500"
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm text-zinc-400">Province</label>
                                                <input
                                                    type="text"
                                                    name="province"
                                                    required
                                                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 focus:outline-none focus:border-yellow-500"
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm text-zinc-400">City</label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    required
                                                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 focus:outline-none focus:border-yellow-500"
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 rounded-xl mt-6 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                                            {loading ? 'Processing...' : 'Place Order'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
