"use client";
import { useState, useEffect } from 'react';

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        webhookUrl: '',
        adImages: ['', '', '', ''],
        headerBanner: { text: '', isActive: false },
        whatsappNumber: '',
        footerBrief: '',
        shippingRates: {
            Punjab: 199,
            Sindh: 299,
            KPK: 299,
            Balochistan: 299,
            'Gilgit Baltistan': 299,
            AJK: 299,
            Islamabad: 199
        }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/content')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    setSettings({
                        webhookUrl: data.data.webhookUrl || '',
                        adImages: data.data.adImages || ['', '', '', ''],
                        headerBanner: data.data.headerBanner || { text: '', isActive: false },
                        whatsappNumber: data.data.whatsappNumber || '',
                        footerBrief: data.data.footerBrief || '',
                        shippingRates: {
                            Punjab: 199,
                            Sindh: 299,
                            KPK: 299,
                            Balochistan: 299,
                            'Gilgit Baltistan': 299,
                            AJK: 299,
                            Islamabad: 199,
                            ...data.data.shippingRates // Override with saved
                        }
                    });
                }
                setLoading(false);
            });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index?: number) => {
        if (index !== undefined && e.target instanceof HTMLInputElement) {
            const newAds = [...settings.adImages];
            newAds[index] = e.target.value;
            setSettings({ ...settings, adImages: newAds });
        } else if (e.target.name === 'bannerText') {
            setSettings({ ...settings, headerBanner: { ...settings.headerBanner, text: e.target.value } });
        } else if (e.target.name === 'bannerActive') {
            setSettings({ ...settings, headerBanner: { ...settings.headerBanner, isActive: (e.target as HTMLInputElement).checked } });
        } else if (e.target.name.startsWith('shipping_')) {
            const province = e.target.name.replace('shipping_', '');
            setSettings({
                ...settings,
                shippingRates: {
                    ...settings.shippingRates,
                    [province]: Number(e.target.value)
                }
            });
        } else {
            setSettings({ ...settings, [e.target.name]: e.target.value });
        }
    };

    const handleSave = async () => {
        try {
            // Save all
            await Promise.all([
                fetch('/api/admin/content', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: 'webhookUrl', value: settings.webhookUrl })
                }),
                fetch('/api/admin/content', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: 'adImages', value: settings.adImages })
                }),
                fetch('/api/admin/content', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: 'headerBanner', value: settings.headerBanner })
                }),
                fetch('/api/admin/content', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: 'whatsappNumber', value: settings.whatsappNumber })
                }),
                fetch('/api/admin/content', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: 'footerBrief', value: settings.footerBrief })
                }),
                fetch('/api/admin/content', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: 'shippingRates', value: settings.shippingRates })
                })
            ]);

            alert('Settings saved successfully!');
        } catch (e) {
            console.error(e);
            alert('Failed to save.');
        }
    };

    if (loading) return <div className="p-8 text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <h1 className="text-3xl font-bold text-yellow-500 mb-8">Global Settings</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Google Sheet Webhook */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                    <h2 className="text-xl font-bold mb-4">Google Sheets Integration</h2>
                    <p className="text-sm text-zinc-400 mb-4">
                        Enter your Webhook URL (e.g., from Make.com or Apps Script). Orders will be sent here when marked as "Delivered".
                    </p>
                    <label className="block text-sm text-zinc-400 mb-1">Webhook URL</label>
                    <input
                        name="webhookUrl"
                        value={settings.webhookUrl}
                        onChange={handleChange}
                        className="w-full bg-zinc-950 border border-zinc-700 p-3 rounded-lg mb-4"
                        placeholder="https://hook.eu1.make.com/..."
                    />
                </div>

                {/* Ads Section */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                    <h2 className="text-xl font-bold mb-4">Home Page Ads</h2>
                    <p className="text-sm text-zinc-400 mb-4">
                        Enter 4 Image URLs to display in the auto-rotating ads section on the Home Page.
                    </p>
                    <div className="space-y-3">
                        {settings.adImages.map((url, idx) => (
                            <div key={idx}>
                                <label className="block text-xs text-zinc-500 mb-1">Ad Image {idx + 1}</label>
                                <input
                                    value={url}
                                    onChange={(e) => handleChange(e, idx)}
                                    className="w-full bg-zinc-950 border border-zinc-700 p-2 rounded text-sm"
                                    placeholder="https://..."
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Shipping Rates */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl md:col-span-2">
                    <h2 className="text-xl font-bold mb-4">Shipping Rates Per Province</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Object.entries(settings.shippingRates).map(([province, rate]) => (
                            <div key={province}>
                                <label className="block text-xs text-zinc-500 mb-1">{province}</label>
                                <input
                                    type="number"
                                    name={`shipping_${province}`}
                                    value={rate}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-950 border border-zinc-700 p-2 rounded text-sm"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Header Banner */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl md:col-span-2">
                    <h2 className="text-xl font-bold mb-4">Top Header Banner</h2>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="bannerActive"
                                checked={settings.headerBanner.isActive}
                                onChange={handleChange}
                                id="bannerActive"
                                className="w-5 h-5 rounded border-zinc-600 bg-zinc-950 text-yellow-500 focus:ring-yellow-500"
                            />
                            <label htmlFor="bannerActive" className="text-sm font-bold">Enable Banner</label>
                        </div>
                    </div>
                    <label className="block text-sm text-zinc-400 mb-1">Banner Text</label>
                    <input
                        name="bannerText"
                        value={settings.headerBanner.text}
                        onChange={handleChange}
                        className="w-full bg-zinc-950 border border-zinc-700 p-3 rounded-lg"
                        placeholder="e.g., Free Shipping on all orders over Rs. 5000!"
                    />
                </div>

                {/* Contact & Footer Info */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl md:col-span-2">
                    <h2 className="text-xl font-bold mb-4">Contact & Footer Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">WhatsApp Number</label>
                            <input
                                name="whatsappNumber"
                                value={settings.whatsappNumber}
                                onChange={handleChange}
                                className="w-full bg-zinc-950 border border-zinc-700 p-3 rounded-lg"
                                placeholder="923264361473"
                            />
                            <p className="text-xs text-zinc-500 mt-1">Format: 923xxxxxxxxx (No + or -)</p>
                        </div>
                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Footer About Text</label>
                            <textarea
                                name="footerBrief"
                                value={settings.footerBrief}
                                onChange={(e) => handleChange(e as any)}
                                className="w-full bg-zinc-950 border border-zinc-700 p-3 rounded-lg"
                                rows={3}
                                placeholder="Authentic Himalayan Shilajit..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <button onClick={handleSave} className="bg-yellow-500 text-black font-bold px-8 py-3 rounded-lg hover:bg-yellow-400 transition">
                    Save All Settings
                </button>
            </div>
        </div>
    );
}
