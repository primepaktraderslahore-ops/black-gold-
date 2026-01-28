"use client";

import { useEffect, useState } from 'react';
import { MapPin, Phone } from 'lucide-react';

export default function Footer() {
    const [content, setContent] = useState({
        footerBrief: 'Authentic Himalayan Shilajit. Experience the power of nature with our premium quality resin.',
        whatsappNumber: '0326-4361473'
    });

    useEffect(() => {
        fetch('/api/admin/content')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    setContent(prev => ({
                        footerBrief: data.data.footerBrief || prev.footerBrief,
                        whatsappNumber: data.data.whatsappNumber || prev.whatsappNumber
                    }));
                }
            })
            .catch(err => console.error('Footer fetch error', err));
    }, []);

    return (
        <footer className="bg-black text-white pt-12 pb-6 border-t border-zinc-800">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-yellow-500 to-yellow-200 bg-clip-text text-transparent">
                            Black Gold
                        </h3>
                        <p className="text-zinc-400 max-w-sm whitespace-pre-line">
                            {content.footerBrief}
                        </p>
                    </div>
                    <div className="md:text-right">
                        <h4 className="text-xl font-semibold mb-4 text-yellow-500">Contact Us</h4>
                        <div className="space-y-3 md:items-end flex flex-col">
                            <div className="flex items-start md:justify-end gap-3 text-zinc-300">
                                <MapPin className="w-5 h-5 text-yellow-500 mt-1 shrink-0" />
                                <p className="text-left md:text-right">
                                    Galib Market, Gulberg,<br />
                                    Lahore
                                </p>
                            </div>
                            <div className="flex items-center md:justify-end gap-3 text-zinc-300">
                                <Phone className="w-5 h-5 text-yellow-500 shrink-0" />
                                <p>{content.whatsappNumber}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="border-t border-zinc-800 pt-6 text-center text-zinc-500 text-sm">
                    &copy; {new Date().getFullYear()} Black Gold. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
