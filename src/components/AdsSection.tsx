"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdsSection() {
    const [images, setImages] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        fetch('/api/admin/content')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data && data.data.adImages) {
                    // Filter out empty strings
                    const validImages = data.data.adImages.filter((img: string) => img && img.trim() !== '');
                    setImages(validImages);
                }
            });
    }, []);

    useEffect(() => {
        if (images.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 2000); // 2 seconds
        return () => clearInterval(interval);
    }, [images]);

    if (images.length === 0) return null;

    return (
        <section className="bg-black py-8 border-b border-zinc-900 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="relative h-[250px] md:h-[500px] rounded-2xl overflow-hidden bg-zinc-900">
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={currentIndex}
                            src={images[currentIndex]}
                            alt="Ad"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 w-full h-full object-contain"
                        />
                    </AnimatePresence>

                    {/* Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                        {images.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-yellow-500 w-4' : 'bg-zinc-600'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
