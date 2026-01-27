"use client";

import { useState, useEffect } from 'react';
import {
    ShoppingBag,
    Truck,
    CheckCircle,
    Package,
    DollarSign,
    RefreshCw,
    Trash2,
    LogOut
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
// Removed server-side import

// Duplicate enum for client usage to avoid import issues if models are server-only (though simple enums usually fine)
enum Status {
    ACCEPTED = 'Accepted',
    READY_FOR_DELIVERY = 'Ready for Delivery',
    IN_DELIVERY = 'In Delivery',
    DELIVERED = 'Delivered',
    CANCELLED = 'Cancelled',
}

interface Order {
    _id: string;
    customer: {
        email: string;
        phone: string;
        city: string;
        address: string;
    };
    items: { variant: string; quantity: number }[];
    totalAmount: number;
    status: string;
    createdAt: string;
}

interface Analytics {
    daily: number;
    weekly: number;
    monthly: number;
}

export default function DashboardPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [analytics, setAnalytics] = useState<Analytics>({ daily: 0, weekly: 0, monthly: 0 });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>(Status.ACCEPTED);
    const router = useRouter();

    const fetchData = async () => {
        setLoading(true);
        try {
            const [ordersRes, analyticsRes] = await Promise.all([
                fetch('/api/orders'),
                fetch('/api/analytics')
            ]);

            const ordersData = await ordersRes.json();
            const analyticsData = await analyticsRes.json();

            if (ordersData.success) setOrders(ordersData.data);
            if (analyticsData.success) setAnalytics(analyticsData.data);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                fetchData(); // Refresh data
            }
        } catch (error) {
            console.error(error);
        }
    };

    const deleteOrder = async (id: string) => {
        if (!confirm('Are you sure you want to delete this order?')) return;
        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                fetchData(); // Refresh data
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleLogout = () => {
        document.cookie = 'admin_auth=; Max-Age=0; path=/;';
        router.push('/login');
    };

    const filteredOrders = orders.filter(o => o.status === activeTab);

    const StatusTabs = [Status.ACCEPTED, Status.READY_FOR_DELIVERY, Status.IN_DELIVERY, Status.DELIVERED, Status.CANCELLED];

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-10 border-b border-zinc-800 pb-6">
                    <h1 className="text-3xl font-bold text-yellow-500">Admin Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={fetchData}
                            className="p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 transition"
                            title="Refresh"
                        >
                            <RefreshCw className={clsx("w-5 h-5", loading && "animate-spin")} />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 bg-red-500/10 text-red-500 px-4 py-2 rounded-lg hover:bg-red-500/20 transition"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </header>

                {/* Analytics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <h3 className="text-zinc-400">Daily Sales</h3>
                        </div>
                        <p className="text-3xl font-bold">Rs. {analytics.daily.toLocaleString()}</p>
                    </div>
                    <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-full flex items-center justify-center">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <h3 className="text-zinc-400">Weekly Sales</h3>
                        </div>
                        <p className="text-3xl font-bold">Rs. {analytics.weekly.toLocaleString()}</p>
                    </div>
                    <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <h3 className="text-zinc-400">Monthly Sales</h3>
                        </div>
                        <p className="text-3xl font-bold">Rs. {analytics.monthly.toLocaleString()}</p>
                    </div>
                </div>

                {/* Order Management */}
                <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-zinc-800 overflow-x-auto">
                        {StatusTabs.map((status) => (
                            <button
                                key={status}
                                onClick={() => setActiveTab(status)}
                                className={clsx(
                                    "px-6 py-4 font-medium transition whitespace-nowrap",
                                    activeTab === status
                                        ? "text-yellow-500 border-b-2 border-yellow-500 bg-yellow-500/5"
                                        : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                                )}
                            >
                                {status} ({orders.filter(o => o.status === status).length})
                            </button>
                        ))}
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-zinc-950 text-zinc-400">
                                <tr>
                                    <th className="p-4">Order Details</th>
                                    <th className="p-4">Customer</th>
                                    <th className="p-4">Total</th>
                                    <th className="p-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-zinc-500">
                                            No orders found in this status.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order) => (
                                        <tr key={order._id} className="hover:bg-zinc-800/50 transition">
                                            <td className="p-4">
                                                <div className="space-y-1">
                                                    <span className="text-xs font-mono text-zinc-500 flex items-center gap-2">
                                                        {order._id.slice(-6)}
                                                        {(order as any).isWholesale && <span className="text-xs bg-yellow-500/20 text-yellow-500 px-1 rounded">WHOLESALE</span>}
                                                    </span>
                                                    <div className="text-sm">
                                                        {order.items.map((i, idx) => (
                                                            <div key={idx}>{i.quantity}x {i.variant}</div>
                                                        ))}
                                                    </div>
                                                    <div className="text-xs text-zinc-500">
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm text-zinc-300">
                                                    <p className="font-bold text-white text-lg">{(order.customer as any).name}</p>
                                                    <p className="font-semibold text-zinc-400">{order.customer.email}</p>
                                                    <p>{order.customer.phone}</p>
                                                    <p className="text-xs text-zinc-500 max-w-[200px] truncate">{order.customer.address}, {order.customer.city}</p>
                                                </div>
                                            </td>
                                            <td className="p-4 font-bold text-yellow-500">
                                                Rs. {order.totalAmount}
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex justify-center flex-wrap gap-2">
                                                    {order.status === Status.ACCEPTED && (
                                                        <>
                                                            <button
                                                                onClick={() => updateStatus(order._id, Status.READY_FOR_DELIVERY)}
                                                                className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-xs hover:bg-blue-500/30"
                                                            >
                                                                Mark Ready
                                                            </button>
                                                            <button
                                                                onClick={() => updateStatus(order._id, Status.CANCELLED)}
                                                                className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </>
                                                    )}
                                                    {order.status === Status.READY_FOR_DELIVERY && (
                                                        <>
                                                            <button
                                                                onClick={() => updateStatus(order._id, Status.IN_DELIVERY)}
                                                                className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded text-xs hover:bg-purple-500/30"
                                                            >
                                                                Start Delivery
                                                            </button>
                                                            <button
                                                                onClick={() => updateStatus(order._id, Status.CANCELLED)}
                                                                className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </>
                                                    )}
                                                    {order.status === Status.IN_DELIVERY && (
                                                        <>
                                                            <button
                                                                onClick={() => updateStatus(order._id, Status.DELIVERED)}
                                                                className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-xs hover:bg-green-500/30"
                                                            >
                                                                Mark Delivered
                                                            </button>
                                                            <button
                                                                onClick={() => updateStatus(order._id, Status.CANCELLED)}
                                                                className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </>
                                                    )}
                                                    {(order.status === Status.DELIVERED || order.status === Status.CANCELLED) && (
                                                        <button
                                                            onClick={() => deleteOrder(order._id)}
                                                            className="px-3 py-1 bg-zinc-700/50 text-zinc-400 rounded text-xs hover:bg-red-500/20 hover:text-red-500"
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
