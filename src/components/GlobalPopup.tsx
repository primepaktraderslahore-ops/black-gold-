"use client";
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface Popup {
    _id: string;
    image: string;
    text: string;
    location: 'home' | 'cart';
}

export default function GlobalPopup() {
    const pathname = usePathname();
    const [popups, setPopups] = useState<Popup[]>([]);
    const [currentPopup, setCurrentPopup] = useState<Popup | null>(null);

    useEffect(() => {
        // Fetch active popups
        fetch('/api/popups').then(res => res.json()).then(data => {
            if (data.success) {
                setPopups(data.data);
            }
        });
    }, []);

    useEffect(() => {
        // Filter based on location
        const target = pathname === '/' ? 'home' : (pathname === '/cart' ? 'cart' : null);
        if (target) {
            const matches = popups.filter(p => p.location === target);
            if (matches.length > 0) {
                // Show the first match or random? First most recent match.
                setCurrentPopup(matches[0]);
            } else {
                setCurrentPopup(null);
            }
        } else {
            setCurrentPopup(null);
        }
    }, [pathname, popups]);

    if (!currentPopup) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative bg-zinc-900 rounded-2xl overflow-hidden max-w-md w-full shadow-2xl border border-zinc-700"
                >
                    <button
                        onClick={() => setCurrentPopup(null)}
                        className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 z-10"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={currentPopup.image} alt="Popup" className="w-full h-auto object-cover max-h-[60vh]" />

                    {currentPopup.text && (
                        <div className="p-6 text-center">
                            <h3 className="text-xl font-bold text-white mb-2">{currentPopup.text}</h3>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
