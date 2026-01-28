"use client";

import { useState, useEffect } from 'react';
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

    const [shipping, setShipping] = useState(0);
    const [shippingRates, setShippingRates] = useState<Record<string, number>>({
        Punjab: 199,
        Sindh: 299,
        KPK: 299,
        Balochistan: 299,
        'Gilgit Baltistan': 299,
        AJK: 299,
        Islamabad: 199
    });

    useEffect(() => {
        // Fetch dynamic rates
        fetch('/api/admin/content')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data && data.data.shippingRates) {
                    setShippingRates(prev => ({ ...prev, ...data.data.shippingRates }));
                }
            });
    }, []);

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

    const [referralCode, setReferralCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [referralError, setReferralError] = useState('');
    const [verifying, setVerifying] = useState(false);

    const verifyCode = async () => {
        setVerifying(true);
        setReferralError('');
        try {
            const res = await fetch('/api/referral-verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: referralCode })
            });
            const data = await res.json();
            if (data.success) {
                setDiscount(data.discountPercentage);
            } else {
                setDiscount(0);
                setReferralError(data.error);
            }
        } catch (err) {
            setReferralError('Verification failed');
        } finally {
            setVerifying(false);
        }
    };

    // ...

    const isOrderWholesale = items.some(i => i.isWholesale);

    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const province = e.target.value;
        setFormData({ ...formData, province });

        // Dynamic Shipping Logic
        if (province && shippingRates[province] !== undefined) {
            setShipping(shippingRates[province]);
        } else {
            setShipping(0);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const [showReview, setShowReview] = useState(false);

    const handlePlaceOrderClick = (e: React.FormEvent) => {
        e.preventDefault();
        if (items.length === 0) return;

        // Validation
        const phoneRegex = /^\d+$/;
        const cnicRegex = /^\d+$/;

        if (!formData.address.trim()) {
            alert("Address is required.");
            return;
        }

        if (!formData.city.trim()) {
            alert("City is required.");
            return;
        }

        if (!phoneRegex.test(formData.phone) || formData.phone.length !== 11) {
            alert("Phone number must be exactly 11 digits.");
            return;
        }

        if (!cnicRegex.test(formData.cnic) || formData.cnic.length !== 13) {
            alert("CNIC must be exactly 13 digits.");
            return;
        }

        setShowReview(true);
    };

    const confirmOrder = async () => {
        const discountAmount = Math.round((total * discount) / 100);
        const finalTotal = (total - discountAmount) + shipping;

        setLoading(true);
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer: formData,
                    items: items,
                    totalAmount: finalTotal,
                    status: 'Accepted',
                    isWholesale: isOrderWholesale,
                    referralCode: discount > 0 ? referralCode : undefined
                }),
            });

            const data = await res.json();
            if (data.success) {
                setSuccess(true);
                setOrderId(data.data?.orderId || data.data?._id || 'ID-MISSING');
                clearCart();
            } else {
                alert('Order failed: ' + data.error);
                setShowReview(false);
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
            setShowReview(false);
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
                                {/* Discount Code */}
                                <div className="mb-6 pb-6 border-b border-zinc-800">
                                    <h3 className="font-bold mb-3">Discount Code</h3>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={referralCode}
                                            onChange={(e) => setReferralCode(e.target.value)}
                                            placeholder="Enter Code"
                                            className="bg-zinc-950 border border-zinc-700 rounded-lg p-3 flex-1 focus:outline-none focus:border-yellow-500 uppercase"
                                        />
                                        <button
                                            type="button"
                                            onClick={verifyCode}
                                            disabled={verifying || !referralCode}
                                            className="bg-zinc-800 text-white px-4 py-2 rounded-lg hover:bg-zinc-700 transition disabled:opacity-50"
                                        >
                                            {verifying ? '...' : 'Apply'}
                                        </button>
                                    </div>
                                    {referralError && <p className="text-red-500 text-sm mt-2">{referralError}</p>}
                                    {discount > 0 && <p className="text-green-500 text-sm mt-2">Code applied! {discount}% Off</p>}
                                </div>

                                <div className="mt-2 mb-6 space-y-2">
                                    <div className="flex justify-between text-zinc-400">
                                        <span>Subtotal</span>
                                        <span>Rs. {total}</span>
                                    </div>
                                    <div className="flex justify-between text-zinc-400">
                                        <span>Shipping</span>
                                        <span>Rs. {shipping}</span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between text-green-500">
                                            <span>Discount ({discount}%)</span>
                                            <span>- Rs. {Math.round((total * discount) / 100)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-xl font-bold text-yellow-500 pt-4 border-t border-zinc-800">
                                        <span>Grand Total</span>
                                        <span>Rs. {(total - Math.round((total * discount) / 100)) + shipping}</span>
                                    </div>
                                </div>

                                <h2 className="text-xl font-bold mb-6">Shipping Details</h2>
                                <form onSubmit={handlePlaceOrderClick} className="space-y-4">
                                    {/* ... existing inputs ... */}
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
                                                <select
                                                    name="province"
                                                    required
                                                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 focus:outline-none focus:border-yellow-500 appearance-none"
                                                    onChange={handleProvinceChange}
                                                    value={formData.province}
                                                >
                                                    <option value="">Select Province</option>
                                                    <option value="Punjab">Punjab</option>
                                                    <option value="Sindh">Sindh</option>
                                                    <option value="KPK">KPK</option>
                                                    <option value="Balochistan">Balochistan</option>
                                                    <option value="Gilgit Baltistan">Gilgit Baltistan</option>
                                                    <option value="AJK">AJK</option>
                                                </select>
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
                {/* Review Modal */}
                {showReview && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                        <div className="bg-zinc-900 border border-zinc-700 p-8 rounded-2xl w-full max-w-md">
                            <h2 className="text-2xl font-bold mb-6 text-yellow-500">Review Order</h2>

                            <div className="space-y-3 mb-6 text-zinc-300">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>Rs. {total}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span>Rs. {shipping}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-500">
                                        <span>Discount</span>
                                        <span>- Rs. {Math.round((total * discount) / 100)}</span>
                                    </div>
                                )}
                                <div className="border-t border-zinc-700 pt-3 flex justify-between font-bold text-white text-lg">
                                    <span>Total</span>
                                    <span>Rs. {(total - Math.round((total * discount) / 100)) + shipping}</span>
                                </div>
                            </div>

                            <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 mb-8">
                                <p className="text-sm text-zinc-500 mb-1">Payment Method</p>
                                <p className="bg-green-500/20 text-green-500 inline-block px-3 py-1 rounded text-sm font-bold border border-green-500/30">
                                    Cash on Delivery
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowReview(false)}
                                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl transition"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={confirmOrder}
                                    disabled={loading}
                                    className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                                >
                                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {loading ? 'Processing...' : 'Confirm Order'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
