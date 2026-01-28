"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HeaderBanner() {
    const [banner, setBanner] = useState({ text: '', isActive: false });

    useEffect(() => {
        fetch('/api/admin/content')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data && data.data.headerBanner) {
                    setBanner(data.data.headerBanner);
                }
            });
    }, []);

    if (!banner.isActive || !banner.text) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="bg-yellow-500 text-black text-xs md:text-sm font-bold text-center py-2 px-4 z-50 relative"
            >
                {banner.text}
            </motion.div>
        </AnimatePresence>
    );
}
